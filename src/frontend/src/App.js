import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LearningStyleQuiz from './components/LearningStyleQuiz';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import axios from 'axios';


function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // 使用 token 获取用户信息（此处假设有一个 API 来获取用户信息）
            axios.get('http://localhost:8000/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).then(response => {
                setUser(response.data.user);
            }).catch(() => {
                localStorage.removeItem('token');
            });
        }
    }, []);

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <Router>
            <div>
                <Navbar user={user} onLogout={handleLogout} />
                <main style={{ padding: '20px' }}>
                    <Routes>
                        <Route path="/" element={<Chatbot />} />
                        <Route path="/quiz" element={<LearningStyleQuiz />} />
                        <Route path="/login" element={<Login onLogin={setUser} />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;