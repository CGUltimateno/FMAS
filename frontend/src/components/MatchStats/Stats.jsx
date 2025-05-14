import React from 'react';
import { useGetMatchStatsQuery } from '../../services/footballApi';
import '../../styles/MatchStats/Stats.scss';

const Stats = ({ matchId }) => {
    const {
        data: statsFromApi,
        isLoading,
        error
    } = useGetMatchStatsQuery(matchId, {
        skip: !matchId  // Skip if no matchId is provided
    });

    // Static fallback data for PSG vs Arsenal
    const staticStats = {
        homeTeamName: 'Paris Saint-Germain',
        awayTeamName: 'Arsenal',
        home: {
            possession: 46,
            shots: 11,
            shotsOnTarget: 6,
            passes: 320,
            passAccuracy: 76,
            fouls: 11,
            yellowCards: 2,
            redCards: 0,
            offsides: 1,
            corners: 2
        },
        away: {
            possession: 54,
            shots: 19,
            shotsOnTarget: 4,
            passes: 355,
            passAccuracy: 79,
            fouls: 11,
            yellowCards: 4,
            redCards: 0,
            offsides: 1,
            corners: 6
        }
    };

    // Use static data if no matchId is provided or API fails
    const stats = (!matchId || error) ? staticStats : statsFromApi;

    // Loading state
    if (isLoading) return <div className="stats-container loading">Loading match statistics...</div>;

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
                        <div className="home-bar" style={{ width: `${homePercent}%` }} />
                        <div className="away-bar" style={{ width: `${awayPercent}%` }} />
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
            <h4 className="match-title">{stats.homeTeamName} vs {stats.awayTeamName}</h4>

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
