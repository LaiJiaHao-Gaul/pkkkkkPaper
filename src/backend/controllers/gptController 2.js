const db = require('../db/db'); // 假设你已经配置好数据库连接
const axios = require('axios');
const {decodeJWT} = require('../utils/jwt');
require('dotenv').config();


// 处理用户提问
exports.postQuestion = async (req, res) => {
    // console.log('进入接口ask123')
    // const { question, user_id } = req.body;

    // try {
    //     const userStyle = await getUserStyleFromDb(user_id);
    //     const allInteractions = await getAllInteractions(user_id);
    //     const avgInteractionScores = calculateAverageInteractionScores(allInteractions);

    //     // 请求学习风格分类结果
    //     const styleResponse = await axios.post('http://localhost:5001/predict_style', { question });
    //     console.log('风格变化===>',styleResponse.data)
    //     const currentStyleScores = styleResponse.data;

    //     const finalStyleScores = calculateFinalStyleScores(userStyle, avgInteractionScores, currentStyleScores);

    //     // 请求问答模型的答案
    //     const qaResponse = await axios.post('http://localhost:5001/answer_question', { question });
    //     const answer = qaResponse.data.answer;

    //     const adjustedAnswer = adjustAnswerBasedOnStyle(answer, finalStyleScores);
    //     console.log('adjustedAnswer===>',adjustedAnswer)
    //     res.json({ answer: adjustedAnswer });
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: 'Something went wrong.' });
    // }
    // res.json({ok:true})

    const question = req.body.question;

    try {
        // 模拟请求学习风格分类模型
        const styleResponse = await axios.post('http://localhost:5001/predict_style', { question });
        const questionStyle = styleResponse.data;//问题本身的风格分数
        //从req中取得token并使用decodeJWT解析
        const token = req.headers.authorization.split(' ')[1];
        const user = decodeJWT(token);
        console.log('user',user)
        // let users = await db.query('SELECT id FROM Users WHERE username = ?', [username]);
        let id = user.user_id;
        let LearningStyles = await db.query('SELECT visual_score, aural_score, read_write_score, kinaesthetic_score FROM LearningStyles WHERE user_id = ?', [id]);
        console.log('LearningStyles===>', LearningStyles[0][LearningStyles[0].length-1])
        console.log('questionStyle===>', questionStyle)
        res.json({
            user_id: id,
            questionStyle: questionStyle,
            LearningStyles: LearningStyles[0][LearningStyles[0].length-1],
            answers:'答案',
        }); // 返回分类模型的分数
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get style prediction from model.' });
    }
};


function adjustAnswerBasedOnStyle(answer, finalStyleScores) {
    // 调整答案逻辑
    return answer; // 这是一个简化的例子
}


function calculateAverageInteractionScores(interactions) {
    const scores = { V: 0, A: 0, K: 0 };
    interactions.forEach(interaction => {
        scores.V += interaction.visual_score;
        scores.A += interaction.aural_score;
        scores.K += interaction.kinaesthetic_score;
    });
    const count = interactions.length;
    scores.V /= count;
    scores.A /= count;
    scores.K /= count;
    return scores;
}

function calculateFinalStyleScores(userStyle, avgInteractionScores, currentStyleScores, chosenArm) {
    // 引入不同的分数增量策略
    const increments = [0.05, 0.1, 0.15];
    const increment = increments[chosenArm]; // 根据选择的臂应用增量

    return {
        V: (userStyle.visual_score + avgInteractionScores.V + currentStyleScores.V + increment) / 3,
        A: (userStyle.aural_score + avgInteractionScores.A + currentStyleScores.A + increment) / 3,
        K: (userStyle.kinaesthetic_score + avgInteractionScores.K + currentStyleScores.K + increment) / 3,
    };
}


function getAllInteractions(user_id) {
    return new Promise((resolve, reject) => {
        db.query('SELECT interaction FROM UserInteractions WHERE user_id = ?', [user_id], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
}

function getUserStyleFromDb(user_id) {
    return new Promise((resolve, reject) => {
        
        db.query('SELECT * FROM LearningStyles WHERE user_id = ?', [user_id], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        });
    });
}