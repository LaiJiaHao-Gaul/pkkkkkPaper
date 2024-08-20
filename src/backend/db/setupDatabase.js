const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: 'jkljkljkl',
    multipleStatements: true
};

async function setupDatabase() {
    const connection = await mysql.createConnection(config);

    try {
        const sql = `
        CREATE DATABASE IF NOT EXISTS learning_chatbot;
        USE learning_chatbot;
    
        CREATE TABLE IF NOT EXISTS Users (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(255)
        );
    
        CREATE TABLE IF NOT EXISTS LearningStyles (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED REFERENCES Users(id),
            visual_score FLOAT,
            aural_score FLOAT,
            read_write_score FLOAT,
            kinaesthetic_score FLOAT,
            answers JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    
        CREATE TABLE IF NOT EXISTS UserInteractions (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED REFERENCES Users(id),
            interaction TEXT,
            visual_avg_score FLOAT DEFAULT 0,  -- 新增字段
            aural_avg_score FLOAT DEFAULT 0,   -- 新增字段
            kinaesthetic_avg_score FLOAT DEFAULT 0,  -- 新增字段
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
         `;
    
        await connection.query(sql);
        console.log('Database and tables created successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        connection.end();
    }
}

setupDatabase();