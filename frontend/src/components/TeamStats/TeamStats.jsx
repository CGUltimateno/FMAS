import React from 'react';
import { useGetTeamSquadQuery } from '../../services/footballApi';
import '../../styles/TeamStats/TeamStats.scss';
import { FaFutbol, FaHandsHelping, FaStar, FaTrophy } from 'react-icons/fa';
import { BiSolidCard } from 'react-icons/bi';
import { MdStars } from 'react-icons/md';

const TeamStats = ({ teamId }) => {
    const { data, isLoading, error } = useGetTeamSquadQuery(teamId);

    if (isLoading) return <div className="loading-stats">Loading stats...</div>;
    if (error) return <div className="error-stats">Error loading stats data.</div>;
    if (!data || !data.length) return <div className="no-stats">No stats available.</div>;

    // Process data to get top performers
    const topPerformers = processTopPerformers(data);

    return (
        <div className="stats-grid-container">
            {/* Column 1 */}
            <div className="stats-column">
                <div className="team-stats-card">
                    <h3 className="stats-title">
                        <FaStar className="title-icon" />
                        Top Rated
                    </h3>
                    <div className="stats-table-container">
                        <table className="stats-table clean-table">
                            <tbody>
                            {topPerformers.byRating.slice(0, 3).map((player, index) => (
                                <tr key={player.id || index}>
                                    <td className="player-name">{player.name}</td>
                                    <td className="stat-value rating">{player.rating}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="team-stats-card">
                    <h3 className="stats-title">
                        <BiSolidCard className="title-icon" />
                        Yellow Cards
                    </h3>
                    <div className="stats-table-container">
                        <table className="stats-table clean-table">
                            <tbody>
                            {topPerformers.byCards.slice(0, 3).map((player, index) => (
                                <tr key={player.id || index}>
                                    <td className="player-name">{player.name}</td>
                                    <td className="stat-value yellow-card">{player.ycards || 0}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Column 2 */}
            <div className="stats-column">
                <div className="team-stats-card">
                    <h3 className="stats-title">
                        <FaFutbol className="title-icon" />
                        Top Scorers
                    </h3>
                    <div className="stats-table-container">
                        <table className="stats-table clean-table">
                            <tbody>
                            {topPerformers.byGoals.slice(0, 3).map((player, index) => (
                                <tr key={player.id || index}>
                                    <td className="player-name">{player.name}</td>
                                    <td className="stat-value">{player.goals || 0}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="team-stats-card">
                    <h3 className="stats-title">
                        <BiSolidCard className="title-icon" style={{ color: '#dc3545' }} />
                        Red Cards
                    </h3>
                    <div className="stats-table-container">
                        <table className="stats-table clean-table">
                            <tbody>
                            {topPerformers.byCards.slice(0, 3).map((player, index) => (
                                <tr key={player.id || index}>
                                    <td className="player-name">{player.name}</td>
                                    <td className="stat-value red-card">{player.rcards || 0}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Column 3 */}
            <div className="stats-column">
                <div className="team-stats-card">
                    <h3 className="stats-title">
                        <FaHandsHelping className="title-icon" />
                        Top Assists
                    </h3>
                    <div className="stats-table-container">
                        <table className="stats-table clean-table">
                            <tbody>
                            {topPerformers.byAssists.slice(0, 3).map((player, index) => (
                                <tr key={player.id || index}>
                                    <td className="player-name">{player.name}</td>
                                    <td className="stat-value">{player.assists || 0}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="team-stats-card">
                    <h3 className="stats-title">
                        <MdStars className="title-icon" />
                        Most Minutes
                    </h3>
                    <div className="stats-table-container">
                        <table className="stats-table clean-table">
                            <tbody>
                            {topPerformers.byMinutes?.slice(0, 3).map((player, index) => (
                                <tr key={player.id || index}>
                                    <td className="player-name">{player.name}</td>
                                    <td className="stat-value">{player.minutes || 0}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add this CSS to your TeamStats.scss file
const processTopPerformers = (data) => {
    // Collect all players across categories
    let allPlayers = [];

    data.forEach(category => {
        if (category.title !== 'coach' && category.members) {
            allPlayers = [...allPlayers, ...category.members.filter(p => !p.excludeFromRanking)];
        }
    });

    // Sort players by different stats
    const byRating = [...allPlayers]
        .filter(player => player.rating)
        .sort((a, b) => b.rating - a.rating);

    const byGoals = [...allPlayers]
        .filter(player => player.goals > 0)
        .sort((a, b) => b.goals - a.goals);

    const byAssists = [...allPlayers]
        .filter(player => player.assists > 0)
        .sort((a, b) => b.assists - a.assists);

    const byCards = [...allPlayers]
        .filter(player => player.ycards > 0 || player.rcards > 0)
        .sort((a, b) => (b.ycards + b.rcards * 3) - (a.ycards + a.rcards * 3));

    const byMinutes = [...allPlayers]
        .filter(player => player.minutes > 0)
        .sort((a, b) => b.minutes - a.minutes);

    return {
        byRating,
        byGoals,
        byAssists,
        byCards,
        byMinutes
    };
};

export default TeamStats;