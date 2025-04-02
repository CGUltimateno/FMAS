import React from "react";
import "../../styles/LeagueDetails/LeagueStats.scss";
import { Link } from "react-router-dom";

const LeagueStats = ({ scorers, assists, rated }) => {
    return (
        <div className="league-stats-box">
            <div className="stats-section">
                <h2>Top Scorers</h2>
                <ul className="stats-list">
                    {scorers?.scorers?.slice(0, 4).map((player) => (
                        <li key={player.player.id} className="stats-card">
                            <div className="stats-info">
                                <div className="player-details">
                                    <span className="player-name">{player.player.name}</span>
                                    <div className="club-info">
                                        <img src={player.team.crest} alt={player.team.name} className="club-emblem" />
                                        <Link to={`/team/${player.team.id}`} className="team-name-link">
                                            <span className="club-name">{player.team.name}</span>
                                        </Link>
                                    </div>
                                </div>
                                <span className="player-stats">{player.goals} goals</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <a href="/all-scorers" className="view-all-link">View All</a>
            </div>
            <div className="stats-section">
                <h2>Top Assists</h2>
                <ul className="stats-list">
                    {assists?.assists?.slice(0, 4).map((player) => (
                        <li key={player.player.id} className="stats-card">
                            <div className="stats-info">
                                <div className="player-details">
                                    <span className="player-name">{player.player.name}</span>
                                    <div className="club-info">
                                        <img src={player.team.crest} alt={player.team.name} className="club-emblem" />
                                        <Link to={`/team/${player.team.id}`} className="team-name-link">
                                            <span className="club-name">{player.team.name}</span>
                                        </Link>
                                    </div>
                                </div>
                                <span className="player-stats">{player.assists} assists</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <a href="/all-assists" className="view-all-link">View All</a>
            </div>
            <div className="stats-section">
                <h2>Top Rated</h2>
                <ul className="stats-list">
                    {rated?.rated?.slice(0, 5).map((player) => (
                        <li key={player.player.id} className="stats-card">
                            <div className="stats-info">
                                <div className="player-details">
                                    <span className="player-name">{player.player.name}</span>
                                    <div className="club-info">
                                        <img src={player.team.crest} alt={player.team.name} className="club-emblem" />
                                        <Link to={`/team/${player.team.id}`} className="team-name-link">
                                            <span className="club-name">{player.team.name}</span>
                                        </Link>
                                    </div>
                                </div>
                                <span className="player-stats">{player.rating} rating</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <a href="/all-rated" className="view-all-link">View All</a>
            </div>
        </div>
    );
};

export default LeagueStats;