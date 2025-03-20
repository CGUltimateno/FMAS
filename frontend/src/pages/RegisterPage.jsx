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
            setFormData({
                firstName: "",
                lastName: "",
                username: "",
                email: "",
                password: "",
                favoriteTeams: "",
            });
            navigate("/");
        } catch (err) {
            console.error("Registration error:", err);
        }
    };

    return (
        <div className="register-container">
            <h2>Create an Account</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <label>First Name</label>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />

                <label>Last Name</label>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />

                <label>Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <label>Favorite Teams (optional)</label>
                <textarea
                    name="favoriteTeams"
                    placeholder='e.g. ["Manchester United","Chelsea"]'
                    value={formData.favoriteTeams}
                    onChange={handleChange}
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                </button>
            </form>
            {error && <p className="error-message">Registration failed: {error.error}</p>}
        </div>
    );
};

export default RegisterPage;