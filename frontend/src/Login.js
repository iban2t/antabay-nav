import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.css";
import Button from 'react-bootstrap/Button';
import { jwtDecode } from 'jwt-decode'

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/auth/login', { 
                username: username,
                password: password,
            });

            const token = response.data.token;
            localStorage.setItem('token', token);

            const decodedToken = jwtDecode(token);
            localStorage.setItem('username', decodedToken.username);

            navigate("/dashboard");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErrorMessage("Wrong Username or Password");
            } else {
                console.error('Login failed', error);
                setErrorMessage("An unexpected error occurred");
            }
        }
    };

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center" style={{
            background: 'linear-gradient(90deg, rgba(42,0,58,1) 0%, rgba(128,0,128,1) 100%)'
        }}>
            <div className="bg-white p-4 w-25" style={{ border: '2px solid black', borderRadius: '8px' }}>
                <div className="text-center">
                    <h2>Antabay Login</h2>
                    <p>Please enter your username and password</p>
                </div>
        
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
        
                    <div className="mb-3">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="text-center">
                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                        <br />
                        <Button 
                            type="submit" 
                            className="loginButton" 
                            style={{ backgroundColor: '#800080', color: 'white', border: 'none' }}
                        >
                            Login
                        </Button>
                        <br />
                        <p className="mt-3">Don't have an account yet? <Link to="/signup">Sign Up</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
