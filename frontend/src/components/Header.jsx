import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaSun, FaUser } from "react-icons/fa";
import "../styles/header.scss";
import { useLoginUserMutation } from "../services/userApi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../services/authSlice";
import { useNavigate } from "react-router-dom";

const DEFAULT_PROFILE_PIC = "https://via.placeholder.com/40?text=USER";
const BACKEND_URL =  'http://localhost:5000';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user } = useSelector((state) => state.auth,
        // Force re-render when any part of the user object changes
        (prev, next) => JSON.stringify(prev.user) === JSON.stringify(next.user)
    );

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const [loginUser, { isLoading, error }] = useLoginUserMutation();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        return sessionStorage.getItem("darkMode") === "true";
    });

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newDarkMode = !prev;
            sessionStorage.setItem("darkMode", newDarkMode);
            document.body.classList.toggle("dark", newDarkMode);
            return newDarkMode;
        });
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleRegisterClick = () => {
        setIsDropdownOpen(false);
        navigate("/register");
    };

    const handleLogin = () => {
        setIsDropdownOpen(false);
        navigate("/login");
    };

    const handleLogout = () => {
        dispatch(logout());
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [darkMode]);

    const renderDropdown = () => {
        if (!user) {
            return (
                <div className="login-dropdown" ref={dropdownRef}>
                    <button onClick={handleLogin} disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                    <button onClick={handleRegisterClick}>Register</button>
                    {error && <p style={{ color: "red" }}>Login failed</p>}
                </div>
            );
        } else {
            return (
                <div className="profile-dropdown" ref={dropdownRef}>
                    <p>Welcome, {user.firstName}!</p>
                    <button onClick={() => navigate("/profile")}>Profile</button>
                    <button onClick={() => navigate("/profile/edit")}>Edit Profile</button>
                    {user.isAdmin && (
                        <button onClick={() => navigate("/admin/dashboard")}>Admin Dashboard</button>
                    )}
                    <button onClick={handleLogout}>Logout</button>
                </div>
            );
        }
    };

    return (
        <header className="header">
            <div className="header-right">
                <FaBell className="notification-icon" />
                <FaSun onClick={toggleDarkMode} className="mode-icon" />

                {user ? (
                    <img
                        src={user.profilePictureUrl ? `${BACKEND_URL}${user.profilePictureUrl}` : DEFAULT_PROFILE_PIC}
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

