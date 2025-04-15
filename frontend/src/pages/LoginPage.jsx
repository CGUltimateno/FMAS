
import React, { useState } from "react";
import { useLoginUserMutation } from "../services/userApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../services/authSlice";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.scss";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loginUser, { isLoading, error }] = useLoginUserMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await loginUser({ email, password }).unwrap();
            dispatch(setCredentials({ token: result.token, user: result.user }));
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("user", JSON.stringify(result.user));
            if (keepLoggedIn) {
                localStorage.setItem("token", result.token);
                localStorage.setItem("user", JSON.stringify(result.user));
            }

            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-left">
                <div className="brand-logo">
                    <img src="/src/assets/logo.png" alt="Onesport Logo" />
                </div>
                <div className="brand-name">
                    <h1>Onesport</h1>
                </div>
            </div>

            <div className="login-right">
                <div className="login-box">
                    <h2 className="login-title">Sign In</h2>
                    <p className="login-subtitle">Please login to continue to your account.</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="keep-logged-in">
                            <input
                                id="keepLoggedIn"
                                type="checkbox"
                                checked={keepLoggedIn}
                                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                            />
                            <label htmlFor="keepLoggedIn">Keep me logged in</label>
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>

                        {error && <p className="error-msg">Login failed</p>}
                    </form>

                    <p className="register-redirect">
                        Need an account? <Link to="/register">Create one</Link>
                    </p>

                    <button onClick={() => navigate(-1)} className="go-back-button">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;