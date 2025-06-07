// src/pages/RegisterPage.jsx
import React, { useState, useRef } from "react"; // Added useRef
import { useRegisterUserMutation } from "../services/userApi";
import { useNavigate } from "react-router-dom";
import "../styles/Register.scss";

const DEFAULT_PROFILE_PIC_PREVIEW = "https://via.placeholder.com/100?text=Avatar"; // Placeholder for preview

const RegisterPage = () => {
    const navigate = useNavigate();
    const [registerUser, { isLoading, error }] = useRegisterUserMutation();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(DEFAULT_PROFILE_PIC_PREVIEW);
    const [registrationMessage, setRegistrationMessage] = useState(""); // Added for success/error messages

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionData = new FormData();
        submissionData.append("firstName", formData.firstName);
        submissionData.append("lastName", formData.lastName);
        submissionData.append("username", formData.username);
        submissionData.append("email", formData.email);
        submissionData.append("password", formData.password);

        if (profilePictureFile) {
            submissionData.append("profilePicture", profilePictureFile);
        }

        try {
            // The backend now returns a message object, e.g., { message: "..." }
            const result = await registerUser(submissionData).unwrap();

            setRegistrationMessage(result.message || "Registration successful! Please check your email to verify your account.");
            // Clear the form
            setFormData({
                firstName: "",
                lastName: "",
                username: "",
                email: "",
                password: "",
            });
            setProfilePictureFile(null);
            setProfilePicturePreview(DEFAULT_PROFILE_PIC_PREVIEW);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Don't navigate immediately, show the message.
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.data?.error || err.message || "Registration failed. Please try again.";
            setRegistrationMessage(errorMessage);
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
                        <div className="profile-picture-section" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
                            <img src={profilePicturePreview} alt="Profile Preview" className="profile-preview-image" />
                            <p>Click to select profile picture (optional)</p>
                        </div>
                        <input
                            type="file"
                            name="profilePicture"
                            accept="image/*"
                            onChange={handlePictureChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }} // Hidden, triggered by clicking the div
                        />

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

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register"}
                        </button>

                        {registrationMessage && (
                            <p className={error ? "error-message" : "success-message"}>
                                {registrationMessage}
                            </p>
                        )}
                    </form>

                    {registrationMessage && !error && (
                        <button onClick={() => navigate("/login")} className="go-to-login-button" style={{ marginTop: "10px" }}>
                            Go to Login
                        </button>
                    )}

                    <button onClick={() => navigate(-1)} className="go-back-button">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
