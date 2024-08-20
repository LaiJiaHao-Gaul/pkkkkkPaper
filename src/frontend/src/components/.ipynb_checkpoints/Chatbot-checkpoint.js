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
        const result = await axios.post('http://localhost:5000/generate_response', {
            question: question,
            learning_style: learningStyle
        });
        setResponse(result.data.response);
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
