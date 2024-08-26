import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  // const handleAskQuestion = async () => {
  //   const learningStyle = JSON.parse(localStorage.getItem('learningStyle'));
  //   const token = localStorage.getItem('token');

  //   const result = await axios.post('http://localhost:8000/api/questions/ask', {
  //     question: question,
  //     // learning_style: learningStyle
  //   },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //   console.log('result', result);
  //   setResponse(result.data.answers);
  // };
  const handleAskQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/questions/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // 在请求头中携带 token
        },
        body: JSON.stringify({
          question: question,
        })
      });
  
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
              if (parsed.response) {
                result += parsed.response; // 拼接response字段的值
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        });
  
        setResponse(result);  // 更新 React 状态
      }
  
      console.log('Complete response:', result);
  
    } catch (error) {
      console.error('Error:', error);
    }
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
