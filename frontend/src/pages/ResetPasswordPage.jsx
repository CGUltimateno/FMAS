import React, { useState, useEffect } from "react";
import { useResetPasswordMutation } from "../services/userApi";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../styles/ResetPassword.scss";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);
    const [tokenError, setTokenError] = useState(false);

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    useEffect(() => {
        // Clear any password errors when either password field changes
        if (passwordError) {
            setPasswordError("");
        }
    }, [newPassword, confirmPassword]);

    // Validate token format as a basic sanity check
    useEffect(() => {
        if (!token || token.length < 16) {
            setTokenError(true);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }

        try {
            const result = await resetPassword({ token, newPassword }).unwrap();
            setResetSuccess(true);

            // Clear form
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Password reset error:", err);
            if (err.status === 400 || err.status === 404) {
                setTokenError(true);
            } else {
                setPasswordError(err.data?.error || "Failed to reset password. Please try again.");
            }
        }
    };

    if (tokenError) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-box error-state">
                    <div className="token-error">
                        <FaExclamationTriangle className="error-icon" />
                        <h2>Invalid or Expired Link</h2>
                        <p>The password reset link is invalid or has expired. Please request a new one.</p>
                        <Link to="/forgot-password" className="request-new-link">
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <div className="reset-password-left">
                <div className="brand-logo">
                    <img src="/src/assets/logo.png" alt="Onesport Logo" />
                </div>
                <div className="brand-name">
                    <h1>Onesport</h1>
                </div>
            </div>

            <div className="reset-password-right">
                <div className="reset-password-box">
                    {resetSuccess ? (
                        <div className="success-message">
                            <FaCheckCircle className="success-icon" />
                            <h2>Password Reset Successful!</h2>
                            <p>Your password has been updated successfully.</p>
                            <Link to="/login" className="login-link">
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="reset-password-title">Reset Your Password</h2>
                            <p className="reset-password-subtitle">
                                Please enter your new password below.
                            </p>

                            <form onSubmit={handleSubmit} className="reset-password-form">
                                <div className="password-field">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>

                                <div className="password-field">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                {passwordError && (
                                    <p className="password-error">{passwordError}</p>
                                )}

                                <button type="submit" disabled={isLoading}>
                                    {isLoading ? "Resetting Password..." : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}

                    <Link to="/login" className="back-link">
                        <FaArrowLeft /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;