import React from 'react';
import { useGetMatchStatsQuery } from '../../services/footballApi';
import '../../styles/MatchStats/Stats.scss';

const Stats = ({ matchId }) => {
    const {
        data: stats,
        isLoading,
        error
    } = useGetMatchStatsQuery(matchId);

    // Loading state
    if (isLoading) return <div className="stats-container loading">Loading match statistics...</div>;

    // Error state
    if (error) {
        console.error('Error loading match statistics:', error); // Log detailed error for debugging
        return (
            <div className="stats-container error">
                <p>Error loading match statistics. Please try again later.</p>
                <pre>{JSON.stringify(error, null, 2)}</pre> {/* Show detailed error for debugging */}
            </div>
        );
    }

    // Handle missing or incomplete data
    if (!stats) return <div className="stats-container empty">No statistics available</div>;

    const { home, away } = stats;

    const calculatePercentage = (homeVal, awayVal) => {
        const total = homeVal + awayVal;
        return total === 0 ? 50 : (homeVal / total) * 100;
    };

    const renderStatRow = (label, homeValue, awayValue, isPercentage = false) => {
        const homePercent = calculatePercentage(homeValue, awayValue);
        const awayPercent = 100 - homePercent;

        return (
            <div className="stat-row" key={label}>
                <span className="home-value">
                    {homeValue}{isPercentage ? '%' : ''}
                </span>
                <div className="stat-label">
                    <div className="stat-bars">
                        <div 
                            className="home-bar" 
                            style={{ width: `${homePercent}%` }}
                        />
                        <div 
                            className="away-bar" 
                            style={{ width: `${awayPercent}%` }}
                        />
                    </div>
                    <span>{label}</span>
                </div>
                <span className="away-value">
                    {awayValue}{isPercentage ? '%' : ''}
                </span>
            </div>
        );
    };

    return (
        <div className="stats-container">
            <h2 className="stats-title">Match Statistics</h2>
            
            {renderStatRow('Ball Possession', home.possession, away.possession, true)}
            {renderStatRow('Total Shots', home.shots, away.shots)}
            {renderStatRow('Shots on Target', home.shotsOnTarget, away.shotsOnTarget)}
            {renderStatRow('Passes', home.passes, away.passes)}
            {renderStatRow('Pass Accuracy', home.passAccuracy, away.passAccuracy, true)}
            {renderStatRow('Fouls', home.fouls, away.fouls)}
            {renderStatRow('Yellow Cards', home.yellowCards, away.yellowCards)}
            {renderStatRow('Red Cards', home.redCards, away.redCards)}
            {renderStatRow('Offsides', home.offsides, away.offsides)}
            {renderStatRow('Corners', home.corners, away.corners)}
        </div>
    );
};

export default Stats;
