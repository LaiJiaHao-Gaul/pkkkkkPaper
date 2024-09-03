const db = require('../db/db'); // 假设你已经配置好数据库连接
const axios = require('axios');
const { decodeJWT } = require('../utils/jwt');
require('dotenv').config();


// 处理用户提问
exports.postQuestion = async (req, res) => {
    // res.json({ok:true})

    const messages = req.body.messages;
    const Questions = messages.filter(message => message.role === 'user');
    const lastQuestions = Questions[Questions.length - 1].content;
    console.log('lastQuestions', lastQuestions);


    try {
        // 模拟请求学习风格分类模型
        const styleResponse = await axios.post('http://localhost:5001/predict_style', { question: lastQuestions });
        const currentStyleScores = styleResponse.data;//问题本身的风格分数
        //从req中取得token并使用decodeJWT解析
        const token = req.headers.authorization.split(' ')[1];
        const user = decodeJWT(token);
        let id = user.user_id;
        //问卷权重
        let history_weight = await db.query('SELECT visual_weight, auditory_weight, kinesthetic_weight FROM UserInteractionWeights WHERE user_id = ?', [id]);



        console.log('history_weight===>', history_weight[0][history_weight[0].length - 1])
        console.log('currentStyleScores===>', currentStyleScores)
        //插入交互记录
        await insertUserInteraction(id, lastQuestions, currentStyleScores.Visual, currentStyleScores.Auditory, currentStyleScores.Kinesthetic)
        let {visual_weight,auditory_weight,kinesthetic_weight} = await changeUserInteractionWeight(id);
        Questions.unshift({
            role: 'user',
            content: `i am a ${visual_weight * 100}% visual learner, ${auditory_weight * 100}% auditory learner, ${kinesthetic_weight * 100}% kinesthetic learner,Please adjust the proportion of your responses according to my learning style`
        })
        const data = {
            model: "llama3.1",
            // prompt: question
            messages,
        };

        axios({
            method: 'post',
            url: 'http://localhost:11434/api/chat',
            data: data,
            responseType: 'stream'
        })
            .then(response => {
                res.setHeader('Content-Type', 'application/json');
                response.data.on('data', (chunk) => {
                    console.log('Received chunk:', chunk.toString());
                    res.write(chunk);
                });
                response.data.on('end', () => {
                    res.end();
                    console.log('No more data in response.');
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get style prediction from model.' });
    }
};

exports.postFeedback = async (req, res) => {
    const { feedback, question, answer, chatHistory } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const user = decodeJWT(token);
    console.log('feedback=>>>', feedback)
    console.log('question=>>>', question)
    console.log('answer=>>>', answer)
    const data = {
        model: "llama3.1",
        messages: [
            ...chatHistory,
            {
                role: 'user',
                content: question
            },
            {
                role: 'assistant',
                content: answer
            },
            {
                role: 'user',
                content: feedback
            }
        ]
    };
    switch (feedback) {
        case 'Please provide me with more lectures content':
            insertUserInteraction(user.user_id, feedback, 1, 0, 0);
            break;
        case 'Please provide me with more relevant articles/videos content':
            insertUserInteraction(user.user_id, feedback, 0, 1, 0);
            break;
        case 'Please provide me with more experimental procedures content':
            insertUserInteraction(user.user_id, feedback, 0, 0, 1);
            break;
        default:
            feedback = 0;
    }
    await changeUserInteractionWeight(user.user_id);
    axios({
        method: 'post',
        url: 'http://localhost:11434/api/chat',
        data: data,
        responseType: 'stream'
    })
        .then(response => {
            res.setHeader('Content-Type', 'application/json');
            response.data.on('data', (chunk) => {
                res.write(chunk);
            });
            response.data.on('end', () => {
                res.end();
                console.log('No more data in response.');
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function changeUserInteractionWeight(id) {
    let windowsInteractions = await get10Interactions(id);
    let { visual_weight, auditory_weight, kinesthetic_weight } = await getHistoryWeight(id);
    visual_weight = visual_weight * 0.7 + windowsInteractions[0][0].avg_visual_score * 0.3;
    auditory_weight = auditory_weight * 0.7 + windowsInteractions[0][0].avg_aural_score * 0.3;
    kinesthetic_weight = kinesthetic_weight * 0.7 + windowsInteractions[0][0].avg_kinaesthetic_score * 0.3;
    await updateUserInteractionWeight({ id, visual_score: visual_weight, aural_score: auditory_weight, kinaesthetic_score: kinesthetic_weight })
    return { visual_weight, auditory_weight, kinesthetic_weight }
}

//插入一条交互记录
async function insertUserInteraction(userId, interaction, Visual, Auditory, Kinesthetic) {
    var values = calculatePercentages([Visual, Auditory, Kinesthetic]);
    console.log('values===>', values)
    await db.query('INSERT INTO UserInteractions (user_id, interaction, visual_score, aural_score, kinaesthetic_score) VALUES (?, ?, ?, ?, ?)', [userId, interaction, ...values],
        (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log('Inserted Row Id:', results.insertId);
        }
    );
}


async function updateUserInteractionWeight({ id, visual_score, aural_score, kinaesthetic_score }) {
    await db.query('UPDATE UserInteractionWeights SET visual_weight = ?, auditory_weight = ?, kinesthetic_weight = ? WHERE user_id = ?',
        [visual_score, aural_score, kinaesthetic_score, id]);
};

async function getHistoryWeight(id) {
    const [rows] = await db.query(
        `SELECT visual_weight, auditory_weight, kinesthetic_weight, interaction_time
         FROM UserInteractionWeights
         WHERE user_id = ?`, [id]
    );
    return rows[0];
}


function calculatePercentages(values) {
    const total = values.reduce((sum, value) => sum + value, 0);
    const percentages = values.map(value => value / total);
    return percentages;
}

async function get10Interactions(id) {
    const query = `
    SELECT 
        AVG(visual_score) AS avg_visual_score, 
        AVG(aural_score) AS avg_aural_score, 
        AVG(kinaesthetic_score) AS avg_kinaesthetic_score
    FROM (
        SELECT visual_score, aural_score, kinaesthetic_score
        FROM UserInteractions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ) AS latest_interactions;
`;
    const result = await db.query(query, [id]);
    return result;
}
