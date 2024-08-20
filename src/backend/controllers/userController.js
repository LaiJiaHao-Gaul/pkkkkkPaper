const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // 检查用户名是否已经存在
        const [existingUser] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).send({ message: '用户名已存在' });
        }

        // 哈希用户密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 将新用户插入数据库
        await db.query('INSERT INTO Users (username, password_hash, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);

        res.status(201).send({ message: '用户注册成功' });
    } catch (error) {
        res.status(500).send({ message: '注册失败', error });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const [user] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (user.length === 0) {
            return res.status(400).send({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user[0].password_hash);
        if (!isMatch) {
            return res.status(400).send({ message: '用户名或密码错误' });
        }

        // 创建JWT令牌
        const token = jwt.sign({ user_id: user[0].id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).send({ message: '登录成功', token ,username,});
    } catch (error) {
        res.status(500).send({ message: '登录失败', error });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = req.user;  // 由身份验证中间件提供
        res.status(200).send({ user });
    } catch (error) {
        res.status(500).send({ message: '获取用户信息失败', error });
    }
};