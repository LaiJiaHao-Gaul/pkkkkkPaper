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
            email VARCHAR(255),
            finished_survey BOOLEAN DEFAULT FALSE
        );
    
        CREATE TABLE IF NOT EXISTS UserInteractions (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED REFERENCES Users(id),
            interaction TEXT,
            visual_score FLOAT DEFAULT 0,  
            aural_score FLOAT DEFAULT 0,   
            kinaesthetic_score FLOAT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        );
        
        CREATE TABLE IF NOT EXISTS UserInteractionWeights (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED REFERENCES Users(id),
            visual_weight FLOAT,
            auditory_weight FLOAT,
            kinesthetic_weight FLOAT,
            interaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(id)
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