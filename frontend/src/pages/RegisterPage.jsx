// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useRegisterUserMutation } from "../services/userApi";
import { useNavigate } from "react-router-dom";
import "../styles/Register.scss";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [registerUser, { isLoading, error }] = useRegisterUserMutation();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        favoriteTeams: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert favoriteTeams to JSON if needed
            const favoriteTeamsValue = formData.favoriteTeams
                ? JSON.parse(formData.favoriteTeams)
                : null;

            await registerUser({
                ...formData,
                favoriteTeams: favoriteTeamsValue,
            }).unwrap();

            alert("Registration successful! You can now log in.");

            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                username: "",
                email: "",
                password: "",
                favoriteTeams: "",
            });

            // Navigate to the login page or dashboard
            navigate("/login");
        } catch (err) {
            console.error("Registration error:", err);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-left">
                <div className="brand-logo">
                    <img src="/src/assets/logo.png" alt="Onesport Logo" />
                </div>
                <div className="brand-name">
                    <h1>Onesport</h1>
                </div>
            </div>

            {/* Right form section */}
            <div className="register-right">
                <div className="register-box">
                    <h2 className="register-title">Create Account</h2>
                    <p className="register-subtitle">Please fill in the details below.</p>

                    <form className="register-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            name="favoriteTeams"
                            placeholder='Favorite Teams (optional) e.g. ["Manchester United","Chelsea"]'
                            value={formData.favoriteTeams}
                            onChange={handleChange}
                        />

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register"}
                        </button>

                        {error && (
                            <p className="error-message">
                                Registration failed: {error.error || "Please try again"}
                            </p>
                        )}
                    </form>

                    <button onClick={() => navigate(-1)} className="go-back-button">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
