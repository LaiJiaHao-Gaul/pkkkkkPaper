const db = require('../db/db'); // 假设你已经配置好数据库连接
const axios = require('axios');
const {decodeJWT} = require('../utils/jwt');
require('dotenv').config();


// 处理用户提问
exports.postQuestion = async (req, res) => {
    // res.json({ok:true})

    const question = req.body.question;

    try {
        // 模拟请求学习风格分类模型
        const styleResponse = await axios.post('http://localhost:5001/predict_style', { question });
        const currentStyleScores = styleResponse.data;//问题本身的风格分数
        //从req中取得token并使用decodeJWT解析
        const token = req.headers.authorization.split(' ')[1];
        const user = decodeJWT(token);
        console.log('user',user)
        // let users = await db.query('SELECT id FROM Users WHERE username = ?', [username]);
        let id = user.user_id;
        let LearningStyles = await db.query('SELECT visual_score, aural_score, read_write_score, kinaesthetic_score FROM LearningStyles WHERE user_id = ?', [id]);
        console.log('LearningStyles===>', LearningStyles[0][LearningStyles[0].length-1])
        console.log('currentStyleScores===>', currentStyleScores)
        res.json({
            user_id: id,
            currentStyleScores: currentStyleScores,
            LearningStyles: LearningStyles[0][LearningStyles[0].length-1],
            answers:'答案',
        }); // 返回分类模型的分数
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get style prediction from model.' });
    }
};