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
            navigate('/login');
        } catch (error) {
            console.error('Error registering user:', error);
            if (error.response && error.response.data) {
                alert(`Registration failure: ${error.response.data.message}`);
            } else {
                alert('Registration failure');
            }
        }
    };

    return (
        <div>
            <h2>Sign in</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>User Name:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit">Sign in</button>
            </form>
        </div>
    );
}

export default Register;