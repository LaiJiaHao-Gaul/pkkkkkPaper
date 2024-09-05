const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
exports.registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check whether the user name already exists
        const [existingUser] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).send({ message: '用户名已存在' });
        }

        // Hashes the user password

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert a new user into the database
        await db.query('INSERT INTO Users (username, password_hash, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
        let data = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        let id = data[0][0].id;
        await db.query('INSERT INTO UserInteractionWeights (user_id, visual_weight, auditory_weight, kinesthetic_weight) VALUES (?, ?, ?, ?)', [id, 0, 0, 0]);

        res.status(201).send({ message: 'User registration succeeded' });
    } catch (error) {
        res.status(500).send({ message: 'Registration failure', error });
    }
};

exports.loginUser = async (req, res) => {
    console.log('req', req)
    try {
        const { username, password } = req.body;

        // 查找用户
        const [user] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (user.length === 0) {
            return res.status(400).send({ message: 'The user name or password is incorrect' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user[0].password_hash);
        if (!isMatch) {
            return res.status(400).send({ message: 'The user name or password is incorrect' });
        }
        const token = jwt.sign({ user_id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).send({ message: 'Login successful', token, username, });
    } catch (error) {
        res.status(500).send({ message: 'Login failure', error });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).send({ user });
    } catch (error) {
        res.status(500).send({ message: 'Description Failed to obtain user information', error });
    }
};