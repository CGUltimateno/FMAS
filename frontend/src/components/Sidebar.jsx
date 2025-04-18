import React, { useState, useEffect } from "react";
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

// League ID mapping
const leagueMapping = {
    "PL": { "fdId": 2021, "flId": 47 },
    "PD": { "fdId": 2014, "flId": 87 },
    "BL1": { "fdId": 2002, "flId": 54 },
    "SA": { "fdId": 2019, "flId": 55 },
    "FL1": { "fdId": 2015, "flId": 53 },
    "CL": { "fdId": 2001, "flId": 42 },
    "DED": { "fdId": 2003, "flId": 57 },
    "ELC": { "fdId": 2016, "flId": 48 },
    "BSA": { "fdId": 2013, "flId": 268 }
};

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

    // Extract leagues array from the nested response
    const leagues = popularLeagues?.competitions?.response?.popular || [];

    // Function to find the football-data ID (fdId) from the FotMob ID (flId)
    const findFdIdFromFlId = (flId) => {
        // Convert to number to ensure consistent comparison
        const numericFlId = parseInt(flId, 10);

        // Find the league code with matching flId
        for (const leagueCode in leagueMapping) {
            if (leagueMapping[leagueCode].flId === numericFlId) {
                return leagueMapping[leagueCode].fdId;
            }
        }

        // If no mapping found, return the original ID
        console.warn(`No fdId mapping found for flId: ${flId}`);
        return flId;
    };

    // Handle league click with proper ID mapping
    const handleLeagueClick = (leagueId) => {
        const fdLeagueId = findFdIdFromFlId(leagueId);
        navigate(`/leagues/${fdLeagueId}`);
    };

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
                ) : leagues.length > 0 ? (
                    <ul className="menu2">
                        {leagues.map((league) => (
                            <li
                                key={league.id}
                                onClick={() => handleLeagueClick(league.id)}
                            >
                                {league.logo && (
                                    <img
                                        src={league.logo}
                                        alt={`${league.name} logo`}
                                        className="league-logo"
                                    />
                                )}
                                {isSidebarExpanded && league.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ padding: "0.5rem" }}>No leagues available</p>
                )
            )}

            {/* Favorite Clubs Section */}
            {user && user.favoriteTeams && user.favoriteTeams.length > 0 && (
                <>
                    <h3 className="menuTitle2" onClick={toggleClubs}>
                        <span>FAVORITE CLUBS</span>{" "}
                        {isClubsOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </h3>
                    {isClubsOpen && (
                        <ul className="menu2">
                            {user.favoriteTeams.map((club, index) => (
                                <li
                                    key={club.id || index}
                                    onClick={() => navigate(`/teams/${typeof club === 'object' ? club.id : club}`)}
                                >
                                    {typeof club === 'object' && club.crest ? (
                                        <img
                                            src={club.crest}
                                            alt={`${club.name} logo`}
                                            className="team-logo"
                                        />
                                    ) : (
                                        <FaFutbol />
                                    )}
                                    {isSidebarExpanded && (typeof club === 'object' ? club.name : club)}
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