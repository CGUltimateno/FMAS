import React from "react";
import { FaSearch, FaBell, FaSun } from "react-icons/fa";
import "../styles/header.scss";

const Header = () => {
    return (
        <header className="header">
            {/* Search Bar */}
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Type to search..." />
            </div>
            <div className="header-right">
                <FaBell className="notification-icon" />
                <FaSun className="mode-icon" />
                <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Profile"
                    className="profile-pic"
                />
            </div>
        </header>
    );
};

export default Header;