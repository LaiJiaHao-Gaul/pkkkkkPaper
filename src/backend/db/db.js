const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'jkljkljkl',
    database: 'learning_chatbot'
});

module.exports = pool;