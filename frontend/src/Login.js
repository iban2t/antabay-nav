import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.css";
import Button from 'react-bootstrap/Button';
import { jwtDecode } from 'jwt-decode'
import config from './config';

const Login = () => {
    const navigate = useNavigate();
    const baseURL = config.REACT_APP_API_BASE_URL;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            console.log('Attempting login with:', { username });

            // First get the token
            const loginResponse = await axios.post(`${baseURL}/auth/login`, {
                username,
                password
            });

            console.log('Login response:', loginResponse.data);

            const token = loginResponse.data.token;
            const userId = loginResponse.data.id;
            
            // Then fetch user details including role
            const userResponse = await axios.get(
                `${baseURL}/users/users/${userId}`,
                { headers: { Authorization: token } }
            );

            console.log('User details:', userResponse.data);
            const roleId = Number(userResponse.data.role_id);

            if (isNaN(roleId)) {
                console.error('Invalid role value:', userResponse.data);
                setErrorMessage("Error: Invalid role value. Please contact administrator.");
                return;
            }

            // Only allow admin (1), authority (2), and PSO (4) roles
            const allowedRoles = [1, 2, 4];
            console.log('Checking if role', roleId, 'is in', allowedRoles);
            console.log('includes check result:', allowedRoles.includes(roleId));

            if (!allowedRoles.includes(roleId)) {
                console.log('Access denied for role:', roleId);
                setErrorMessage("Access denied. This platform is only accessible to administrators, authorities, and Public Safety Officers.");
                return;
            }

            console.log('Access granted for role:', roleId);

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            localStorage.setItem('roleId', roleId);

            await setUserOnline(token);

            navigate("/dashboard");

        } catch (error) {
            console.error('Login error:', error);
            console.error('Full error object:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response) {
                setErrorMessage(error.response.data?.message || "Invalid username or password");
            } else if (error.request) {
                setErrorMessage('No response from server. Please try again.');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const setUserOnline = async (token) => {
        try {
            await axios.post(
                `${baseURL}/users/status`,
                { status: 'online' },
                { headers: { Authorization: token } }
            );
        } catch (error) {
            console.error('Failed to update online status:', error);
        }
    };

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center" style={{
            background: 'linear-gradient(90deg, rgba(42,0,58,1) 0%, rgba(128,0,128,1) 100%)'
        }}>
            <div className="bg-white p-4 w-25" style={{ border: '2px solid black', borderRadius: '8px' }}>
                <div className="text-center">
                    <h2>Antabay Admin Login</h2>
                    <p>Administrator, Authority, and Public Safety Office Access Only</p>
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>
                    <div className="text-center">
                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                        <br />
                        <Button 
                            type="submit" 
                            className="loginButton" 
                            style={{ 
                                backgroundColor: '#800080', 
                                color: 'white', 
                                border: 'none',
                                minWidth: '80px'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : 'Login'}
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
