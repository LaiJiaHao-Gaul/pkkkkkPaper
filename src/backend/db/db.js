const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'jkljkljkl',
    database: 'learning_chatbot'
});

module.exports = pool;