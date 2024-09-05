import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [showQuiz, setShowQuiz] = useState(false);

    console.log('user:', user);
    const handleLogout = () => {
        localStorage.removeItem('token');
        onLogout();
        navigate('/');
    };

    useEffect(() => {
        setShowQuiz(user && !user.finished_survey)
    }, [user]);
    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#eee' }}>
            <div>
                <li><Link to="/">Home page</Link></li>
                {showQuiz && <li><Link to="/quiz">Know your learning style</Link></li>}
            </div>
            <div>
                {user ? (
                    <>
                        <span>Welcome, {user.username}</span>
                        <button onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Log in</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;