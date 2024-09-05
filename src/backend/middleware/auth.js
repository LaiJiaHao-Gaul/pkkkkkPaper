const jwt = require('jsonwebtoken');
const db = require('../db/db');
require('dotenv').config();
const {decodeJWT} = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    
    try {
        const info = decodeJWT(token);
        const [user] = await db.query('SELECT * FROM Users WHERE id = ?', [info.user_id]);

        if (user.length === 0) {
            throw new Error();
        }

        req.user = user[0];
        next();
    } catch (error) {
        res.status(401).send({ message: 'Authentication failure' });
    }
};

module.exports = authMiddleware;