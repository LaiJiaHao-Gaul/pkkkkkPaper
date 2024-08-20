import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/users/register', {
                username,
                password,
                email
            });
            alert(response.data.message);
            navigate('/login'); // 注册成功后跳转到登录页面
        } catch (error) {
            console.error('Error registering user:', error);
            if (error.response && error.response.data) {
                alert(`注册失败: ${error.response.data.message}`);
            } else {
                alert('注册失败');
            }
        }
    };

    return (
        <div>
            <h2>注册</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>用户名:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>密码:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>邮箱:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit">注册</button>
            </form>
        </div>
    );
}

export default Register;