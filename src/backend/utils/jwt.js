const jwt = require('jsonwebtoken');

exports.decodeJWT=(token) =>{
    const secret = process.env.JWT_SECRET; // 从环境变量获取JWT密钥

    try {
        const decoded = jwt.verify(token, secret);
        console.log('解码成功:', decoded);
        return decoded; // 返回解码的数据
    } catch (error) {
        console.log('解码失败:', error.message);
        return null; // 解码失败，返回null
    }
}