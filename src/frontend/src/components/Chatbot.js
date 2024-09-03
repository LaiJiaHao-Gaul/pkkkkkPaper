import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Chatbot() {
  const [questionInput, setQuestionInput] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);  // 用于存储聊天历史记录的状态
  const [asking, setAsking] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleQuestionChange = (e) => {
    setQuestionInput(e.target.value);
    setQuestion(e.target.value);
  };

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
          'Authorization': `Bearer ${token}`  // 在请求头中携带 token
        },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content: question }]
          // question: [...chatHistory, { question: question}].toString(),

        })
      });
      setChatHistory(prev => [...prev, {
        "role": "user",
        "content": question
      }]);  // 提问时更新聊天历史

      // 检查响应是否是 ok
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';

      // 逐块读取数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk); // 输出每次接收到的流数据块

        // 将chunk中的每一行数据解析为JSON，提取response字段
        const lines = chunk.split('\n');
        lines.forEach(line => {
          if (line.trim()) { // 只处理非空行
            try {
              const parsed = JSON.parse(line);
              console.log('Parsed JSON:', parsed);
              if (parsed.message.content) {
                result += parsed.message.content; // 拼接response字段的值
                setResponse(result);  // 更新 React 状态
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        });
      }
      setChatHistory(prev => [...prev, { role: 'assistant', content: result }]);
      setResponse('');
      setAsking(false);
      setIsDisabled(false);
      console.log('Complete response:', result);

    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, { question: question, content: 'Failed to fetch response' }]);  // 出错时更新聊天历史

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
        'Authorization': `Bearer ${token}`  // 在请求头中携带 token
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
      "content": question + ' ' + feedback
    }]);  // 提问时更新聊天历史

    // 检查响应是否是 ok
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';

    // 逐块读取数据
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk:', chunk); // 输出每次接收到的流数据块

      // 将chunk中的每一行数据解析为JSON，提取response字段
      const lines = chunk.split('\n');
      lines.forEach(line => {
        if (line.trim()) { // 只处理非空行
          try {
            const parsed = JSON.parse(line);
            console.log('Parsed JSON:', parsed);
            if (parsed.response) {
              result += parsed.response; // 拼接response字段的值
              setResponse(result);  // 更新 React 状态
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      });
    }
    setChatHistory(prev => [...prev, { role: 'assistant', content: result }]);
    setResponse('');
    setAsking(false);
    setIsDisabled(false);
    console.log('Complete response:', result);
  }

  return (
    <div>

      <div>
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <strong>{chat.role}:</strong> {chat.content}
            <br />
            {chat.role === 'assistant' && (
              <div>
                <button onClick={() => handleFeedback('i need more picture', chatHistory[index - 1].content, chat.content)}>more picture</button>
                <button onClick={() => handleFeedback('i need more sound', chatHistory[index - 1].content, chat.content)}>more sound</button>
                <button onClick={() => handleFeedback('i need more experiment', chatHistory[index - 1].content, chat.content)}>more experiment</button>
              </div>
            )}
          </div>
        ))}
        {asking && (
          <>
            <strong>Q:</strong> {question}
            <br />
            <strong>A:</strong> {response}
          </>
        )}
      </div>
      <h2>Chat with the Bot</h2>
      <input
        type="text"
        value={questionInput}
        onChange={handleQuestionChange}
        placeholder={asking ? 'asking' : "Ask a question"}
        disabled={isDisabled}
        onKeyDown={e => e.key === 'Enter' && !isDisabled && handleAskQuestion()}  // 允许按Enter键提交问题
      />
      <button onClick={handleAskQuestion} disabled={isDisabled}>{asking ? 'Answering' : 'Ask'}</button>
    </div>
  );
}



export default Chatbot;