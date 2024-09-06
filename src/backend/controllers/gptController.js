const db = require('../db/db');
const axios = require('axios');
const { decodeJWT } = require('../utils/jwt');
require('dotenv').config();


// 处理用户提问
exports.postQuestion = async (req, res) => {
    const messages = req.body.messages;
    const Questions = messages.filter(message => message.role === 'user');
    const lastQuestions = Questions[Questions.length - 1].content;
    try {
        const styleResponse = await axios.post('http://localhost:5001/predict_style', { question: lastQuestions });
        console.log('styleResponse', styleResponse.data.emotion_scores)
        const currentStyleScores = styleResponse.data.style_scores;
        const emotion = styleResponse.data.emotion_scores;
        const token = req.headers.authorization.split(' ')[1];
        const user = decodeJWT(token);
        let id = user.user_id;
        await insertUserInteraction(id, lastQuestions, currentStyleScores.Visual, currentStyleScores.Auditory, currentStyleScores.Kinesthetic)
        let { visual_weight, auditory_weight, kinesthetic_weight } = await changeUserInteractionWeight(id);
        Questions.unshift({
            role: 'user',
            content: `i am a ${visual_weight * 100}% visual learner, ${auditory_weight * 100}% auditory learner, ${kinesthetic_weight * 100}% kinesthetic learner,Please adjust the proportion of your responses according to my learning style, and i feel ${emotion} now.`
        })
        const data = {
            model: "llama3.1",
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
                    res.write(chunk);
                });
                response.data.on('end', () => {
                    res.end();
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
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//Get records of user weights for chart display
exports.getWeight = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const user = decodeJWT(token);
        let id = user.user_id;
        const [rows] = await db.query(
            `SELECT visual_weight, auditory_weight, kinesthetic_weight, interaction_time
             FROM UserInteractionWeights
             WHERE user_id = ?
             ORDER BY interaction_time DESC`, [id]
        );
        let transformed = [];
        let index = 1;

        // Iterate over the raw data array
        rows.forEach(item => {
            // Format the time, keeping only the date part
            index++;
            transformed.push({
                time: index,
                value: item.visual_weight,
                category: 'visual_weight'
            });
            transformed.push({
                time: index,
                value: item.auditory_weight,
                category: 'auditory_weight'
            });
            transformed.push({
                time: index,
                value: item.kinesthetic_weight,
                category: 'kinesthetic_weight'
            });
        });
        res.json({ weightList: transformed.reverse() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }

}
//The smoothed window algorithm is used to calculate the new user learning style
async function changeUserInteractionWeight(id) {
    let windowsInteractions = await get10Interactions(id);
    let { visual_weight, auditory_weight, kinesthetic_weight } = await getHistoryWeight(id);
    visual_weight = visual_weight * 0.7 + windowsInteractions[0][0].avg_visual_score * 0.3;
    auditory_weight = auditory_weight * 0.7 + windowsInteractions[0][0].avg_aural_score * 0.3;
    kinesthetic_weight = kinesthetic_weight * 0.7 + windowsInteractions[0][0].avg_kinaesthetic_score * 0.3;
    await addUserInteractionWeight({ id, visual_weight, auditory_weight, kinesthetic_weight })
    return { visual_weight, auditory_weight, kinesthetic_weight }
}

//Insert an interaction record
async function insertUserInteraction(userId, interaction, Visual, Auditory, Kinesthetic) {
    var values = calculatePercentages([Visual, Auditory, Kinesthetic]);
    await db.query('INSERT INTO UserInteractions (user_id, interaction, visual_score, aural_score, kinaesthetic_score) VALUES (?, ?, ?, ?, ?)', [userId, interaction, ...values],
        (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
        }
    );
}

async function addUserInteractionWeight({ id, visual_weight, auditory_weight, kinesthetic_weight }) {
    await db.query(
        `INSERT INTO UserInteractionWeights (user_id, visual_weight, auditory_weight, kinesthetic_weight)
         VALUES (?, ?, ?, ?)`,
        [id, visual_weight, auditory_weight, kinesthetic_weight]
    );
};


async function getHistoryWeight(id) {
    const [rows] = await db.query(
        `SELECT visual_weight, auditory_weight, kinesthetic_weight, interaction_time
         FROM UserInteractionWeights
         WHERE user_id = ?
         ORDER BY interaction_time DESC
         LIMIT 1`, [id]
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
