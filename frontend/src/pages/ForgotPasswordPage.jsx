import React, { useState } from "react";
import { useForgotPasswordMutation } from "../services/userApi";
import { useNavigate, Link } from "react-router-dom";
import "../styles/ForgotPassword.scss";
import { FaArrowLeft } from "react-icons/fa";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" or "error"

    const navigate = useNavigate();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword({ email }).unwrap();
        } catch (err) {
            console.error("Password reset request error:", err);
        } finally {
            setMessage("If an account exists with this email, a password reset link has been sent.");
            setMessageType("success");
            setEmail("");
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-left">
                <div className="brand-logo">
                    <img src="/src/assets/logo.png" alt="Onesport Logo" />
                </div>
                <div className="brand-name">
                    <h1>Onesport</h1>
                </div>
            </div>

            <div className="forgot-password-right">
                <div className="forgot-password-box">
                    <h2 className="forgot-password-title">Forgot Password</h2>
                    <p className="forgot-password-subtitle">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {messageType === "success" ? (
                        <div className="success-message">
                            <p>{message}</p>
                            <Link to="/login" className="back-to-login">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            {messageType === "error" && (
                                <p className="error-message">{message}</p>
                            )}

                            <button type="submit" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}

                    <Link to="/login" className="back-link">
                        <FaArrowLeft /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;