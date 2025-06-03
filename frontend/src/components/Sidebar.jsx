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
const Sidebar = () => {
    const navigate = useNavigate();
    const [isLeaguesOpen, setIsLeaguesOpen] = useState(false);
    const [isClubsOpen, setIsClubsOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const user = useSelector((state) => state.auth.user);
    const { data: popularLeagues, isLoading, error } = useGetPopularLeaguesQuery();
    const toggleLeagues = () => setIsLeaguesOpen(!isLeaguesOpen);
    const toggleClubs = () => setIsClubsOpen(!isClubsOpen);
    const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

    const competitions = popularLeagues?.competitions || [];

    const leagues = competitions.map(comp => ({
        id: comp.league.id,
        name: comp.league.name,
        logo: comp.league.logo,
        country: comp.country.name,
        flag: comp.country.flag
    }));

    // Handle league click with proper ID mapping
    const handleLeagueClick = (leagueId) => {
        // The new API already uses the correct IDs, so we can use them directly
        navigate(`/leagues/${leagueId}`);
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

                <li onClick={() => navigate("/leagues")}>
                    <FaTable /> {isSidebarExpanded && "Standings"}
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

            {/* Favorite Clubs Section - unchanged */}
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