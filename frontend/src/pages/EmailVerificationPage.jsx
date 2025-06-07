import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useVerifyEmailMutation } from '../services/userApi';
import '../styles/EmailVerificationPage.scss'; // We'll create this SCSS file next

const EmailVerificationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [verifyEmail, { isLoading, error, isSuccess, data }] = useVerifyEmailMutation();
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token) {
            verifyEmail(token)
                .unwrap()
                .then((response) => {
                    setMessage(response.message || 'Email verified successfully! You can now log in.');
                })
                .catch((err) => {
                    setMessage(err.data?.error || err.message || 'Failed to verify email. The link may be invalid or expired.');
                });
        } else {
            setMessage('No verification token found. Please check the link provided in your email.');
        }
    }, [token, verifyEmail]);

    return (
        <div className="email-verification-page">
            <div className="verification-box">
                <h1>Email Verification</h1>
                {isLoading && <p className="status-message">Verifying your email, please wait...</p>}
                {message && (
                    <p className={`status-message ${error ? 'error' : (isSuccess ? 'success' : '')}`}>
                        {message}
                    </p>
                )}
                {(isSuccess || (error && message.includes("already verified"))) && (
                    <Link to="/login" className="login-link-button">
                        Go to Login
                    </Link>
                )}
                {error && !message.includes("already verified") && !message.includes("expired") && (
                     <p className="status-message info">If you continue to have issues, please contact support or try registering again.</p>
                )}
                 {error && message.includes("expired") && (
                    <button onClick={() => navigate('/login?resendEmail=true')} className="resend-link-button">
                        Request New Verification Link
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationPage;

