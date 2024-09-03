import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/users/login', {
                username,
                password
            });
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            // 假设这是你的登录成功逻辑
            localStorage.setItem('username', response.data.username);
            onLogin();  // 假设用户名从登录请求的响应中返
            navigate('/');
        } catch (error) {
            alert('登录失败');
            console.error('Error logging in:', error);
        }
    };

    return (
        <div>
            <h2>登录</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>用户名:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>密码:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">登录</button>
            </form>
        </div>
    );
}

export default Login;