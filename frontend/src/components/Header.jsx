import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaSun, FaUser } from "react-icons/fa";
import "../styles/header.scss";
import { useLoginUserMutation } from "../services/userApi";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, logout } from "../services/authSlice";
import { store } from "../store/store";
import { useNavigate } from "react-router-dom";

const DEFAULT_PROFILE_PIC = "https://via.placeholder.com/40?text=USER";

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    useSelector((state) => state.auth.token);
    const [loginUser, { isLoading, error }] = useLoginUserMutation();
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleRegisterClick = () => {
        setIsDropdownOpen(false);
        navigate("/register");
    };

    const handleLogin = async () => {
        try {
            const result = await loginUser({ email, password }).unwrap();
            dispatch(setCredentials({ token: result.token, user: result.user }));

            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("user", JSON.stringify(result.user));

            const storedToken = sessionStorage.getItem("token");
            const storedUser = sessionStorage.getItem("user");
            if (storedToken && storedUser) {
                store.dispatch(setCredentials({ token: storedToken, user: JSON.parse(storedUser) }));
            }

            setIsDropdownOpen(false);
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setIsDropdownOpen(false);
    };

    const renderDropdown = () => {
        if (!user) {
            return (
                <div className="login-dropdown" ref={dropdownRef}>
                    <h2>Login</h2>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin} disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                    <button onClick={handleRegisterClick}>Register</button>
                    <a href="#">Forgot Password?</a>
                    {error && <p style={{ color: "red" }}>Login failed</p>}
                </div>
            );
        } else {
            return (
                <div className="profile-dropdown" ref={dropdownRef}>
                    <p>Welcome, {user.username}!</p>
                    <button onClick={() => navigate("/profile")}>Profile</button>
                    <button onClick={() => navigate("/profile/edit")}>Edit Profile</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            );
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <header className="header">
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Type to search..." />
            </div>

            <div className="header-right">
                <FaBell className="notification-icon" />
                <FaSun className="mode-icon" />

                {user ? (
                    <img
                        src={DEFAULT_PROFILE_PIC}
                        alt="Profile"
                        className="profile-pic"
                        onClick={toggleDropdown}
                    />
                ) : (
                    <FaUser className="user-icon" onClick={toggleDropdown} />
                )}
            </div>

            {isDropdownOpen && renderDropdown()}
        </header>
    );
};

export default Header;