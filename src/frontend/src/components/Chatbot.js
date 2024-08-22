import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const handleAskQuestion = async () => {
        const learningStyle = JSON.parse(localStorage.getItem('learningStyle'));
        const token = localStorage.getItem('token');

        const result = await axios.post('http://localhost:8000/api/questions/ask', {
            question: question,
            // learning_style: learningStyle
        },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        console.log('result', result);
        setResponse(result.data.answers);
    };

    return (
        <div>
            <h2>Chat with the Bot</h2>
            <input
                type="text"
                value={question}
                onChange={handleQuestionChange}
                placeholder="Ask a question"
            />
            <button onClick={handleAskQuestion}>Ask</button>
            <div>
                <h3>Response:</h3>
                <p>{response}</p>
            </div>
        </div>
    );
}

export default Chatbot;
