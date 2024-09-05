import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from '@ant-design/charts';
import './styles.css';

import Markdown from 'react-markdown'
function Chatbot() {
  const [questionInput, setQuestionInput] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [userWeightList, setUserWeight] = useState([]);
  const props = {
    data: userWeightList,
    xField: 'time',
    yField: 'value',
    sizeField: 'value',
    shapeField: 'trail',
    legend: { size: false },
    colorField: 'category',
  };
  const handleQuestionChange = (e) => {
    setQuestionInput(e.target.value);
    setQuestion(e.target.value);
  };
  useEffect(() => {
    getUserWeightList();
  }, []);
  const getUserWeightList = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:8000/api/questions/weight', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      setUserWeight(response.data.weightList);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleAskQuestion = async () => {
    try {
      setAsking(true);
      setQuestionInput('');
      setIsDisabled(true)
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/questions/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content: question }]
        })
      });
      await getUserWeightList();

      setChatHistory(prev => [...prev, {
        "role": "user",
        "content": question,
        id: Date.now()
      }]);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message.content) {
                result += parsed.message.content;
                setResponse(result);
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        });
      }
      setChatHistory(prev => [...prev, { role: 'assistant', content: result, id: Date.now() }]);
      setResponse('');
      setAsking(false);
      setIsDisabled(false);

    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, { question: question, content: 'Failed to fetch response', id: Date.now() }]);

    }
  };

  async function handleFeedback(feedback, question, answer) {
    setAsking(true);
    setQuestionInput('');
    setIsDisabled(true)
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:8000/api/questions/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        feedback,
        chatHistory,
        question,
        answer,
      })
    });
    setChatHistory(prev => [...prev, {
      "role": "user",
      "content": question, id: Date.now()
    }]);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });


      const lines = chunk.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message.content) {
              result += parsed.message.content;
              setResponse(result);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      });
    }
    setChatHistory(prev => [...prev, { role: 'assistant', content: result, id: Date.now() }]);
    setResponse('');
    setAsking(false);
    setIsDisabled(false);
  }
  return (
    <div>
      <div className='scroll-box'>
        {chatHistory.map((chat, index) => (
          <div key={chat.id}>
            <strong>{chat.role}:</strong><Markdown>{chat.content}</Markdown>
            <br />
            {chat.role === 'assistant' && (
              <div>
                <button onClick={() => handleFeedback('Please provide me with more lectures content', chatHistory[index - 1].content, chat.content)}>Please provide me with more lectures content</button>
                <button onClick={() => handleFeedback('Please provide me with more relevant articles/videos content', chatHistory[index - 1].content, chat.content)}>Please provide me with more relevant articles/videos content</button>
                <button onClick={() => handleFeedback('Please provide me with more experimental procedures content', chatHistory[index - 1].content, chat.content)}>Please provide me with more experimental procedures content</button>
              </div>
            )}
          </div>
        ))}
        {asking && (
          <>
            <br />
            <strong>A:</strong> {response}
          </>
        )}
      </div>
      <div className='wrapper'>
        <div className='left'>
          <h2>Chat with the Bot</h2>
          <input
            type="text"
            value={questionInput}
            onChange={handleQuestionChange}
            placeholder={asking ? 'asking' : "Ask a question"}
            disabled={isDisabled}
            onKeyDown={e => e.key === 'Enter' && !isDisabled && handleAskQuestion()}
          />
          <button onClick={handleAskQuestion} disabled={isDisabled}>{asking ? 'Answering' : 'Ask'}</button>

        </div>
        <div className='container'>
          <Line {...props} />
        </div>



      </div>
    </div>
  );
}



export default Chatbot;