// app.js (Node.js)
const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const db = require('./db/db');

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());

app.use('/api', require('./routes/learningStyleRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/questions', require('./routes/gptRoutes'));

app.post('/api/ask', async (req, res) => {
    const { question, user_id } = req.body;

    try {
        const userStyle = await getUserStyleFromDb(user_id);
        const allInteractions = await getAllInteractions(user_id);
        const avgInteractionScores = calculateAverageInteractionScores(allInteractions);

        // 请求学习风格分类结果
        const styleResponse = await axios.post('http://localhost:5001/predict_style', { question });
        const currentStyleScores = styleResponse.data;

        const finalStyleScores = calculateFinalStyleScores(userStyle, avgInteractionScores, currentStyleScores);

        // 请求问答模型的答案
        const qaResponse = await axios.post('http://localhost:5001/answer_question', { question });
        const answer = qaResponse.data.answer;

        const adjustedAnswer = adjustAnswerBasedOnStyle(answer, finalStyleScores);

        res.json({ answer: adjustedAnswer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

app.post('/api/test/predict_style', async (req, res) => {
    const question = req.body.question;

    try {
        // 模拟请求学习风格分类模型
        const styleResponse = await axios.post('http://localhost:5001/predict_style', { question });
        const currentStyleScores = styleResponse.data;
        console.log('currentStyleScores===>',currentStyleScores)
        res.json(currentStyleScores); // 返回分类模型的分数
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get style prediction from model.' });
    }
});

function getUserStyleFromDb(user_id) {
    return new Promise((resolve, reject) => {
        
        db.query('SELECT * FROM UserInteractionWeights WHERE user_id = ?', [user_id], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        });
    });
}

function getAllInteractions(user_id) {
    return new Promise((resolve, reject) => {
        db.query('SELECT interaction FROM UserInteractions WHERE user_id = ?', [user_id], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
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

function calculateFinalStyleScores(userStyle, avgInteractionScores, currentStyleScores) {
    return {
        V: (userStyle.visual_score + avgInteractionScores.V + currentStyleScores.V) / 3,
        A: (userStyle.aural_score + avgInteractionScores.A + currentStyleScores.A) / 3,
        K: (userStyle.kinaesthetic_score + avgInteractionScores.K + currentStyleScores.K) / 3,
    };
}

function adjustAnswerBasedOnStyle(answer, finalStyleScores) {
    // 调整答案逻辑
    return answer; // 这是一个简化的例子
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));