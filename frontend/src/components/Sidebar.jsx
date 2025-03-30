import React, { useState } from "react";
import {
    FaHome,
    FaTable,
    FaStar,
    FaChevronDown,
    FaChevronUp,
    FaFutbol,
    FaArrowLeft,
    FaArrowRight,
} from "react-icons/fa";
import "../styles/sidebar.scss";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetPopularLeaguesQuery } from "../services/footballApi";

const Sidebar = () => {
    const navigate = useNavigate();
    const [isLeaguesOpen, setIsLeaguesOpen] = useState(false);
    const [isClubsOpen, setIsClubsOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const user = useSelector((state) => state.auth.user);

    // Fetch popular leagues from backend
    const { data: popularLeagues, isLoading, error } = useGetPopularLeaguesQuery();

    const toggleLeagues = () => setIsLeaguesOpen(!isLeaguesOpen);
    const toggleClubs = () => setIsClubsOpen(!isClubsOpen);
    const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

    return (
        <aside className={`sidebar ${isSidebarExpanded ? "expanded" : "collapsed"}`}>
            <button className="toggle-button" onClick={toggleSidebar}>
                {isSidebarExpanded ? <FaArrowLeft /> : <FaArrowRight />}
            </button>
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo-image" />
                {isSidebarExpanded && <h2 className="logo-text">Onesport</h2>}
            </div>
            <h3 className="menuTitle">MENU</h3>
            <ul className="menu">
                <li onClick={() => navigate("/")}>
                    <FaHome /> {isSidebarExpanded && "Dashboard"}
                </li>
                <li>
                    <FaFutbol /> {isSidebarExpanded && "Live Football"}
                </li>
                <li onClick={() => navigate("/leagues")}>
                    <FaTable /> {isSidebarExpanded && "Standings"}
                </li>
                <li>
                    <FaStar /> {isSidebarExpanded && "Highlights"}
                </li>
            </ul>

            <h3 className="menuTitle2" onClick={toggleLeagues}>
                <span>LEAGUES</span> {isLeaguesOpen ? <FaChevronUp /> : <FaChevronDown />}
            </h3>
            {isLeaguesOpen && (
                isLoading ? (
                    <p style={{ padding: "0.5rem" }}>Loading...</p>
                ) : error ? (
                    <p style={{ padding: "0.5rem", color: "red" }}>Error loading leagues</p>
                ) : (
                    popularLeagues && popularLeagues.competitions && (
                        <ul className="menu2">
                            {popularLeagues.competitions.map((league) => (
                                <li
                                    key={league.id}
                                    onClick={() => navigate(`/leagues/${league.id}`)}
                                >
                                    {league.emblem && (
                                        <img
                                            src={league.emblem}
                                            alt={`${league.name} logo`}
                                            className="league-logo"
                                        />
                                    )}
                                    {isSidebarExpanded && league.name}
                                </li>
                            ))}
                        </ul>
                    )
                )
            )}

            {/* Favorite Clubs Section */}
            {user && user.favoriteTeams && user.favoriteTeams.length > 0 && (
                <>
                    <h3 className="menuTitle2" onClick={toggleClubs}>
                        <span>FAVORITE CLUB</span>{" "}
                        {isClubsOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </h3>
                    {isClubsOpen && (
                        <ul className="menu2">
                            {user.favoriteTeams.map((club, index) => (
                                <li key={index}>
                                    <FaFutbol /> {isSidebarExpanded && club}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </aside>
    );
};

export default Sidebar;