import React from "react";
import "../../styles/LeagueDetails/LeagueStats.scss";
import { Link, useParams } from "react-router-dom";
import { useGetTopStatsQuery } from "../../services/footballApi";

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
                {/* Top Scorers */}
                <div className="stats-section">
                    <h2>Top Scorers</h2>
                    <ul className="stats-list">
                        {topScorers?.response?.slice(0, 5).map((item, index) => (
                            <li key={`scorer-${index}`} className="stats-card">
                                <div className="stats-info">
                                    <div className="player-image">
                                        <img src={item.player.photo} alt={item.player.name} />
                                    </div>
                                    <div className="player-details">
                                        <Link to={`/player/${item.player.id}`} className="player-name">
                                            {item.player.name}
                                        </Link>
                                        <div className="club-info">
                                            <Link to={`/team/${item.statistics[0].team.id}`} className="team-name-link">
                                                <span className="club-name">{item.statistics[0].team.name}</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <span className="player-stats">{item.statistics[0].goals.total} Goals</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Top Assists */}
                <div className="stats-section">
                    <h2>Top Assists</h2>
                    <ul className="stats-list">
                        {topAssists?.response?.slice(0, 5).map((item, index) => (
                            <li key={`assist-${index}`} className="stats-card">
                                <div className="stats-info">
                                    <div className="player-image">
                                        <img src={item.player.photo} alt={item.player.name} />
                                    </div>
                                    <div className="player-details">
                                        <Link to={`/player/${item.player.id}`} className="player-name">
                                            {item.player.name}
                                        </Link>
                                        <div className="club-info">
                                            <Link to={`/team/${item.statistics[0].team.id}`} className="team-name-link">
                                                <span className="club-name">{item.statistics[0].team.name}</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <span className="player-stats">{item.statistics[0].goals.assists} Assists</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Top Red Cards */}
                <div className="stats-section">
                    <h2>Top Red Cards</h2>
                    <ul className="stats-list">
                        {topCards?.response?.slice(0, 5).map((item, index) => (
                            <li key={`card-${index}`} className="stats-card">
                                <div className="stats-info">
                                    <div className="player-image">
                                        <img src={item.player.photo} alt={item.player.name} />
                                    </div>
                                    <div className="player-details">
                                        <Link to={`/player/${item.player.id}`} className="player-name">
                                            {item.player.name}
                                        </Link>
                                        <div className="club-info">
                                            <Link to={`/team/${item.statistics[0].team.id}`} className="team-name-link">
                                                <span className="club-name">{item.statistics[0].team.name}</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <span className="player-stats">{item.statistics[0].cards.red} Red Cards</span>
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