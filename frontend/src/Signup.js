import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css'; // Import CSS file for custom styles

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role_id: 3, // Default role
        num: '', // Added num field for cellphone number
        email: '',
        address: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await axios.post('http://localhost:5000/auth/register', formData);
            // Handle successful registration
            if (response.status === 201) {
                alert('User registered successfully!'); // Display alert
                navigate("/login");
            }
        } catch (error) {
            console.error('Signup failed', error);
            if (error.response && error.response.status === 409) {
                setErrorMessage(error.response.data.message);
            } else {
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
                    <h2>Antabay Sign Up</h2>
                    <p>Please enter your details to sign up</p>
                </div>

                <form onSubmit={handleSignup}>
                    <div className="mb-3">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            placeholder="Enter Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required // Marked as required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Enter Username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required // Marked as required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter Password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required // Marked as required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="num">Cellphone Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id="num"
                            placeholder="Enter Cellphone Number"
                            name="num"
                            value={formData.num}
                            onChange={handleInputChange}
                            required // Marked as required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Enter Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required // Marked as required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="address"
                            placeholder="Enter Address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required // Marked as required
                        />
                    </div>

                    <div className="text-center">
                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                        <br />
                        <Button
                            type="submit"
                            className="signupButton"
                            style={{ backgroundColor: '#800080', color: 'white', border: 'none' }}
                        >
                            Sign Up
                        </Button>
                        <br />
                        <p className="mt-3">Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
