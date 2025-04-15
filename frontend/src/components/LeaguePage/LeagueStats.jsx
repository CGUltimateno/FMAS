import React from "react";
import "../../styles/LeagueDetails/LeagueStats.scss";
import { Link, useParams } from "react-router-dom";
import { useGetTopStatsQuery } from "../../services/footballApi";
import { useGetPlayerImageQuery } from "../../services/footballApi.jsx";

// PlayerImage component definition here
const PlayerImage = ({ playerId }) => {
    const { data: imageUrl, isLoading, error } = useGetPlayerImageQuery(playerId);

    if (isLoading) return <div className="player-image placeholder"></div>;
    if (error) return <div className="player-image error"></div>;

    return (
        <div className="player-image">
            <img src={imageUrl} alt="Player" />
        </div>
    );
};

const LeagueStats = () => {
    const { leagueId } = useParams();
    const { data, isLoading, error } = useGetTopStatsQuery(leagueId);

    if (isLoading) {
        return <div className="league-stats-section loading">Loading stats...</div>;
    }

    if (error) {
        console.error("Error fetching top stats:", error);
        return <div className="league-stats-section error">Error fetching top stats</div>;
    }

    const { topScorers, topAssists, topCards } = data || {};

    return (
        <section className="league-stats-section">
            <div className="league-stats-box">
                <div className="stats-section">
                    <h2>Top Scorers</h2>
                    <ul className="stats-list">
                        {topScorers?.response?.players?.slice(0, 5).map((scorer, index) => (
                            <li key={`scorer-${index}`} className="stats-card">
                                <div className="stats-info">
                                    <PlayerImage playerId={scorer.id} />
                                    <div className="player-details">
                                        <span className="player-name">{scorer.name}</span>
                                        <div className="club-info">
                                            <Link to={`/team/${scorer.teamId}`} className="team-name-link">
                                                <span className="club-name">{scorer.teamName}</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <span className="player-stats">{scorer.goals} Goals</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="stats-section">
                    <h2>Top Assists</h2>
                    <ul className="stats-list">
                        {topAssists?.response?.players?.slice(0, 5).map((assist, index) => (
                            <li key={`assist-${index}`} className="stats-card">
                                <div className="stats-info">
                                    <PlayerImage playerId={assist.id} />
                                    <div className="player-details">
                                        <span className="player-name">{assist.name}</span>
                                        <div className="club-info">
                                            <Link to={`/team/${assist.teamId}`} className="team-name-link">
                                                <span className="club-name">{assist.teamName}</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <span className="player-stats">{assist.assists} Assists</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="stats-section">
                    <h2>Top Rating</h2>
                    <ul className="stats-list">
                        {topCards?.response?.players?.slice(0, 5).map((card, index) => (
                            <li key={`card-${index}`} className="stats-card">
                                <div className="stats-info">
                                    <PlayerImage playerId={card.id} />
                                    <div className="player-details">
                                        <span className="player-name">{card.name}</span>
                                        <div className="club-info">
                                            <Link to={`/team/${card.teamId}`} className="team-name-link">
                                                <span className="club-name">{card.teamName}</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <span className="player-stats">
                                        {card.rating}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default LeagueStats;