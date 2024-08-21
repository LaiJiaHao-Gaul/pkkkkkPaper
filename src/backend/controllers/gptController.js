const db = require('../db/db'); // 假设你已经配置好数据库连接

// 获取学习风格
exports.postQuestion = async (req, res) => {
    // res.json({ok:true})
    res.status(200).send({ message: 'ok' });
};