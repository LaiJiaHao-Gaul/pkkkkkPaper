import React, { useState,useEffect }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    console.log('user:', user);
    const handleLogout = () => {
        localStorage.removeItem('token');
        onLogout();
        navigate('/');
    };
    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#eee' }}>
            <div>
                <li><Link to="/">Home page</Link></li>
                {user&&!user?.finished_survey && <li><Link to="/quiz">Know your learning style</Link></li>}
            </div>
            <div>
                {user ? (
                    <>
                        <span>欢迎, {user.username}</span>
                        <button onClick={handleLogout}>登出</button>
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