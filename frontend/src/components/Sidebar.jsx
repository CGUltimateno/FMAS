import React, { useState } from "react";
import { FaHome, FaTable, FaStar, FaChevronDown, FaChevronUp, FaFutbol, FaTrophy, FaShieldAlt, FaFlag, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "../styles/sidebar.scss";
import logo from "../assets/logo.png"; // Adjust the path to your logo file

const Sidebar = () => {
    const [isLeaguesOpen, setIsLeaguesOpen] = useState(false);
    const [isClubsOpen, setIsClubsOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const toggleLeagues = () => setIsLeaguesOpen(!isLeaguesOpen);
    const toggleClubs = () => setIsClubsOpen(!isClubsOpen);
    const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

    return (
        <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isSidebarExpanded ? <FaArrowLeft /> : <FaArrowRight />}
            </button>
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo-image" />
                {isSidebarExpanded && <h2 className="logo-text">Onesport</h2>}
            </div>
            <h3 className="menuTitle">MENU</h3>
            <ul className="menu">
                <li><FaHome /> {isSidebarExpanded && 'Dashboard'}</li>
                <li><FaFutbol /> {isSidebarExpanded && 'Live Football'}</li>
                <li><FaTable /> {isSidebarExpanded && 'Standings'}</li>
                <li><FaStar /> {isSidebarExpanded && 'Highlights'}</li>
            </ul>
            <h3 className="menuTitle2" onClick={toggleLeagues}>
                <span>LEAGUES</span> {isLeaguesOpen ? <FaChevronUp /> : <FaChevronDown />}
            </h3>
            {isLeaguesOpen && (
                <ul className="menu2">
                    <li><FaTrophy /> {isSidebarExpanded && 'La Liga'}</li>
                    <li><FaShieldAlt /> {isSidebarExpanded && 'Premier League'}</li>
                    <li><FaFlag /> {isSidebarExpanded && 'Serie A'}</li>
                    <li><FaFutbol /> {isSidebarExpanded && 'Bundesliga'}</li>
                    <li><FaTrophy /> {isSidebarExpanded && 'Ligue 1'}</li>
                </ul>
            )}
            <h3 className="menuTitle2" onClick={toggleClubs}>
                <span>FAVORITE CLUB</span>
            </h3>
                <ul className="menu2">
                    <li><FaFutbol /> {isSidebarExpanded && 'Real Madrid'}</li>
                    <li><FaFutbol /> {isSidebarExpanded && 'Barcelona'}</li>
                    <li><FaFutbol /> {isSidebarExpanded && 'Manchester United'}</li>
                    <li><FaFutbol /> {isSidebarExpanded && 'Chelsea'}</li>
                    <li><FaFutbol /> {isSidebarExpanded && 'Bayern Munich'}</li>
                </ul>
        </aside>
    );
};

export default Sidebar;