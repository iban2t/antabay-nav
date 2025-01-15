import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.css";
import Button from 'react-bootstrap/Button';

import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
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
            console.error('Login failed', error);
        }
    };

    return (
        <>
          <div className="d-flex vh-100 justify-content-center align-items-center" style={{
            background: 'rgb(42,0,58)',
            background: 'linear-gradient(90deg, rgba(42,0,58,1) 0%, rgba(128,0,128,1) 100%)'
          }}>
            <div className="bg-white p-4 w-25"style={{ border: '2px solid black', borderRadius: '8px' }}>
              <div className="text-center">
                <h2>Antabay Login</h2>
                <p>Please enter your username and password</p>
              </div>
      
              <form>
                <div className="mb-3">
                  <label htmlFor="username">Username</label>
                  <input
                    type="username"
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
                  <Button 
                    type="button" 
                    className="loginButton white-text" 
                    onClick={handleLogin}
                    style={{ backgroundColor: '#800080', color: 'white', border: 'none' }}
                  >
                    Login
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
    );
};

export default Login;
