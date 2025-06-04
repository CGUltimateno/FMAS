import React from 'react';
import '../../styles/MatchStats/Stats.scss';

const Stats = ({ matchId, statistics, detailed = false }) => {
    // Handle loading state
    if (!statistics) {
        return <div className="stats-container loading">Loading match statistics...</div>;
    }

    // Check if there are at least two teams with statistics
    if (!Array.isArray(statistics) || statistics.length < 2) {
        return <div className="stats-container empty">No statistics available</div>;
    }

    const homeTeam = statistics[0];
    const awayTeam = statistics[1];

    // Function to extract numeric value from stat
    const getNumericValue = (value) => {
        if (value === null) return 0;
        if (typeof value === 'string' && value.includes('%')) {
            return parseInt(value, 10);
        }
        return parseFloat(value) || 0;
    };

    // Function to find a specific stat
    const findStat = (stats, type) => {
        const stat = stats.find(s => s.type === type);
        return stat ? stat.value : null;
    };

    // Calculate percentage for visualization bars
    const calculatePercentage = (homeVal, awayVal) => {
        homeVal = getNumericValue(homeVal);
        awayVal = getNumericValue(awayVal);
        const total = homeVal + awayVal;
        return total === 0 ? 50 : (homeVal / total) * 100;
    };

    // Render a single stat row
    const renderStatRow = (label, homeValue, awayValue, isPercentage = false) => {
        const homeDisplay = homeValue === null ? '-' : homeValue;
        const awayDisplay = awayValue === null ? '-' : awayValue;

        const homePercent = calculatePercentage(homeValue, awayValue);
        const awayPercent = 100 - homePercent;

        return (
            <div className="stat-row" key={label}>
                <span className="home-value">
                    {homeDisplay}{isPercentage && typeof homeDisplay === 'string' && !homeDisplay.includes('%') ? '%' : ''}
                </span>
                <div className="stat-label">
                    <div className="stat-bars">
                        <div className="home-bar" style={{ width: `${homePercent}%` }} />
                        <div className="away-bar" style={{ width: `${awayPercent}%` }} />
                    </div>
                    <span>{label}</span>
                </div>
                <span className="away-value">
                    {awayDisplay}{isPercentage && typeof awayDisplay === 'string' && !awayDisplay.includes('%') ? '%' : ''}
                </span>
            </div>
        );
    };

    // Define which stats to show in simplified view
    const coreStats = [
        { label: 'Ball Possession', type: 'Ball Possession', isPercentage: true },
        { label: 'Total Shots', type: 'Total Shots' },
        { label: 'Shots on Goal', type: 'Shots on Goal' },
        { label: 'Corner Kicks', type: 'Corner Kicks' },
        { label: 'Yellow Cards', type: 'Yellow Cards' }
    ];

    // Additional stats for detailed view
    const detailedStats = [
        { label: 'Shots off Goal', type: 'Shots off Goal' },
        { label: 'Blocked Shots', type: 'Blocked Shots' },
        { label: 'Shots Inside Box', type: 'Shots insidebox' },
        { label: 'Shots Outside Box', type: 'Shots outsidebox' },
        { label: 'Fouls', type: 'Fouls' },
        { label: 'Offsides', type: 'Offsides' },
        { label: 'Red Cards', type: 'Red Cards' },
        { label: 'Goalkeeper Saves', type: 'Goalkeeper Saves' },
        { label: 'Total Passes', type: 'Total passes' },
        { label: 'Accurate Passes', type: 'Passes accurate' },
        { label: 'Passing Accuracy', type: 'Passes %', isPercentage: true },
        { label: 'Expected Goals (xG)', type: 'expected_goals' },
        { label: 'Goals Prevented', type: 'goals_prevented' }
    ];

    // Choose which stats to display based on detailed prop
    const statsToDisplay = detailed ? [...coreStats, ...detailedStats] : coreStats;

    return (
        <div className={`stats-container ${detailed ? 'detailed' : 'summary'}`}>
            <h2 className="stats-title">Match Statistics</h2>
            <div className="stats-teams">
                <div className="stats-team home">
                    <img src={homeTeam.team.logo} alt={homeTeam.team.name} className="stats-team-logo" />
                    <h4>{homeTeam.team.name}</h4>
                </div>
                <div className="stats-vs">vs</div>
                <div className="stats-team away">
                    <img src={awayTeam.team.logo} alt={awayTeam.team.name} className="stats-team-logo" />
                    <h4>{awayTeam.team.name}</h4>
                </div>
            </div>

            <div className="stats-content">
                {statsToDisplay.map(stat => {
                    const homeValue = findStat(homeTeam.statistics, stat.type);
                    const awayValue = findStat(awayTeam.statistics, stat.type);
                    return renderStatRow(stat.label, homeValue, awayValue, stat.isPercentage);
                })}
            </div>
        </div>
    );
};

export default Stats;