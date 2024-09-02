const db = require('../db/db'); // 假设你已经配置好数据库连接
require('dotenv').config();
const { decodeJWT } = require('../utils/jwt');

// 保存学习风格
exports.saveLearningStyle = async (req, res) => {
    try {
        let { visual_score, aural_score, read_write_score, kinaesthetic_score } = req.body;//从请求中获取学习风格数据
        const token = req.headers.authorization.split(' ')[1];

        const user = decodeJWT(token);

        let id = user.user_id;
        visual_score = read_write_score + visual_score;

        let total = visual_score + aural_score + kinaesthetic_score;
        visual_score = visual_score / total;
        aural_score = aural_score / total;
        kinaesthetic_score = kinaesthetic_score / total;
        await db.query('UPDATE UserInteractionWeights SET visual_weight = ?, auditory_weight = ?, kinesthetic_weight = ? WHERE user_id = ?',
            [visual_score, aural_score, kinaesthetic_score, id]);
            
        await db.query('UPDATE Users SET finished_survey = TRUE WHERE id = ?;',
            [user.user_id]
        );

        res.status(200).send({ message: 'Learning style saved successfully' });
    } catch (error) {
        console.error('Failed to save learning style:', error);
        res.status(500).send({ message: 'Failed to save learning style', error });
    }
};


// 获取调查问卷学习风格
exports.getLearningStyle = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    const user = decodeJWT(token);
    let id = user.user_id;
    let LearningStyles = await db.query('SELECT visual_weight, auditory_weight, kinesthetic_weight FROM UserInteractionWeights WHERE user_id = ?', [id]);
    console.log('res.json(LearningStyles[0][0]):', LearningStyles[0][0]);
    res.json(LearningStyles[0][0]);
};

//获取总体学习风格