import React from 'react';
import { useGetTeamStatsQuery } from '../../services/footballApi';
import '../../styles/TeamStats/TeamStats.scss';
import {
    FaChartBar, FaFutbol, FaChartLine, FaBullseye, FaUsers,
    FaRegCheckCircle, FaExclamationTriangle, FaCalendarAlt
} from 'react-icons/fa';
import { BiSolidCard } from 'react-icons/bi';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    ResponsiveContainer, Tooltip, Legend, LineChart, Line,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

// Helper for animated counts
const AnimatedValue = ({ value, duration = 2 }) => (
    <CountUp end={value} duration={duration} separator="," />
);

// Stat item with animation
const StatItem = ({ label, value, subValue, className = '' }) => (
    <motion.div
        className={`stat-item ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <span className="stat-label">{label}:</span>
        <span className="stat-value">
            {typeof value === 'number' ? <AnimatedValue value={value} /> : value}
            {subValue && <span className="stat-sub-value"> ({subValue})</span>}
        </span>
    </motion.div>
);

// Form display with animated entry
const FormDisplay = ({ formString }) => {
    if (!formString) return null;

    return (
        <div className="form-display">
            <span className="stat-label">Form:</span>
            <div className="form-icons">
                {formString.split('').map((result, index) => (
                    <motion.span
                        key={index}
                        className={`form-icon form-${result.toLowerCase()}`}
                        title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {result}
                    </motion.span>
                ))}
            </div>
        </div>
    );
};

// Performance distribution chart
const PerformanceChart = ({ wins, draws, losses }) => {
    const data = [
        { name: 'Wins', value: wins, color: '#28a745' },
        { name: 'Draws', value: draws, color: '#ffc107' },
        { name: 'Losses', value: losses, color: '#dc3545' }
    ];

    return (
        <div className="chart-container performance-chart">
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Matches']} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

// Goals by minute chart
const GoalsByMinuteChart = ({ goalsFor, goalsAgainst }) => {
    const periods = ["0-15", "16-30", "31-45", "46-60", "61-75", "76-90", "91-105"];

    const data = periods.map(period => ({
        period,
        Scored: goalsFor[period]?.total || 0,
        Conceded: goalsAgainst[period]?.total || 0
    }));

    return (
        <div className="chart-container goals-minute-chart">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Scored" fill="#28a745" />
                    <Bar dataKey="Conceded" fill="#dc3545" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Home vs Away comparison radar
const HomeAwayRadar = ({ stats }) => {
    const data = [
        { stat: 'Wins', home: stats.fixtures.wins.home, away: stats.fixtures.wins.away },
        { stat: 'Goals For', home: stats.goals.for.total.home, away: stats.goals.for.total.away },
        { stat: 'Clean Sheets', home: stats.clean_sheet.home, away: stats.clean_sheet.away },
        { stat: 'Failed to Score', home: stats.failed_to_score.home, away: stats.failed_to_score.away },
    ];

    return (
        <div className="chart-container home-away-radar">
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="stat" />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    <Radar name="Home" dataKey="home" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
                    <Radar name="Away" dataKey="away" stroke="#d97706" fill="#d97706" fillOpacity={0.5} />
                    <Legend />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Formation visualization
const FormationDisplay = ({ lineups }) => {
    if (!lineups || lineups.length === 0) return <p>No formation data available</p>;

    // Sort by frequency
    const sortedLineups = [...lineups].sort((a, b) => b.played - a.played);
    const total = sortedLineups.reduce((sum, lineup) => sum + lineup.played, 0);

    return (
        <div className="formations-container">
            {sortedLineups.map((lineup, index) => {
                const percentage = Math.round((lineup.played / total) * 100);
                return (
                    <div key={index} className="formation-item">
                        <div className="formation-name">{lineup.formation}</div>
                        <div className="formation-bar-container">
                            <motion.div
                                className="formation-bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1 }}
                            />
                            <span className="formation-percentage">{percentage}%</span>
                        </div>
                        <div className="formation-played">{lineup.played} matches</div>
                    </div>
                );
            })}
        </div>
    );
};

const TeamStats = ({ teamId, leagueId }) => {
    const { data, isLoading, error } = useGetTeamStatsQuery(
        { teamId, leagueId },
        { skip: !leagueId }
    );

    if (!leagueId) {
        return (
            <motion.div
                className="team-stats-card message-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h3 className="stats-title">
                    <FaExclamationTriangle className="title-icon" />
                    Statistics Unavailable
                </h3>
                <p>League information is required to display team statistics. Please ensure you have navigated from a league page or that league context is available.</p>
            </motion.div>
        );
    }

    if (isLoading) return <div className="loading-stats">Loading team statistics...</div>;
    if (error) return <div className="error-stats">Error loading team statistics. Please try again later.</div>;
    if (!data || !data.response) return <div className="no-stats">No statistics available for this team in the selected league.</div>;

    const stats = data.response;
    const totalYellowCards = stats.cards?.yellow ? Object.values(stats.cards.yellow).reduce((sum, segment) => sum + (segment?.total || 0), 0) : 0;
    const totalRedCards = stats.cards?.red ? Object.values(stats.cards.red).reduce((sum, segment) => sum + (segment?.total || 0), 0) : 0;

    return (
        <div className="stats-dashboard">
            {stats.league && (
                <div className="stats-header">
                    <div className="league-info">
                        <img src={stats.league.logo} alt={stats.league.name} className="league-logo" />
                        <div>
                            <h2>{stats.team.name}</h2>
                            <p>{stats.league.name} • {stats.league.season}</p>
                        </div>
                    </div>
                    <div className="team-logo">
                        <img src={stats.team.logo} alt={stats.team.name} />
                    </div>
                </div>
            )}

            <div className="stats-grid-container">
                {/* Performance Summary Card */}
                <motion.div
                    className="stats-card performance-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="card-title">
                        <FaChartBar className="title-icon" />
                        Season Performance
                    </h3>
                    <FormDisplay formString={stats.form?.substring(0, 10)} />

                    <div className="performance-flex">
                        <div className="performance-numbers">
                            <div className="stat-highlight">
                                <span className="stat-value"><AnimatedValue value={stats.fixtures.played.total} /></span>
                                <span className="stat-label">Matches</span>
                            </div>
                            <div className="stat-highlight win">
                                <span className="stat-value"><AnimatedValue value={stats.fixtures.wins.total} /></span>
                                <span className="stat-label">Wins</span>
                            </div>
                            <div className="stat-highlight draw">
                                <span className="stat-value"><AnimatedValue value={stats.fixtures.draws.total} /></span>
                                <span className="stat-label">Draws</span>
                            </div>
                            <div className="stat-highlight loss">
                                <span className="stat-value"><AnimatedValue value={stats.fixtures.loses.total} /></span>
                                <span className="stat-label">Losses</span>
                            </div>
                        </div>

                        <PerformanceChart
                            wins={stats.fixtures.wins.total}
                            draws={stats.fixtures.draws.total}
                            losses={stats.fixtures.loses.total}
                        />
                    </div>

                    <div className="insights-box">
                        <h4>Key Insights</h4>
                        <ul className="insights-list">
                            <li>Win rate: {((stats.fixtures.wins.total / stats.fixtures.played.total) * 100).toFixed(1)}%</li>
                            <li>Home form is {stats.fixtures.wins.home > stats.fixtures.wins.away ? 'stronger' : 'weaker'} than away form</li>
                            <li>Longest win streak: {stats.biggest.streak.wins} games</li>
                        </ul>
                    </div>
                </motion.div>

                {/* Goals Analysis Card */}
                <motion.div
                    className="stats-card goals-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <h3 className="card-title">
                        <FaFutbol className="title-icon" />
                        Goals Analysis
                    </h3>

                    <div className="goals-summary">
                        <div className="goals-for">
                            <div className="goals-count">
                                <AnimatedValue value={stats.goals.for.total.total} />
                            </div>
                            <div className="goals-label">Goals Scored</div>
                            <div className="goals-avg">
                                {stats.goals.for.average.total} per match
                            </div>
                        </div>

                        <div className="goals-vs">vs</div>

                        <div className="goals-against">
                            <div className="goals-count">
                                <AnimatedValue value={stats.goals.against.total.total} />
                            </div>
                            <div className="goals-label">Goals Conceded</div>
                            <div className="goals-avg">
                                {stats.goals.against.average.total} per match
                            </div>
                        </div>
                    </div>

                    <div className="clean-sheets-row">
                        <div className="clean-sheet-stat">
                            <FaRegCheckCircle className="cs-icon" />
                            <div className="cs-count">{stats.clean_sheet.total}</div>
                            <div className="cs-label">Clean Sheets</div>
                        </div>
                    </div>

                    <h4>Goal Timings</h4>
                    <GoalsByMinuteChart
                        goalsFor={stats.goals.for.minute}
                        goalsAgainst={stats.goals.against.minute}
                    />

                    <div className="insights-box">
                        <h4>Scoring Insights</h4>
                        <ul className="insights-list">
                            <li>Most goals scored in the {getMostActiveGoalPeriod(stats.goals.for.minute)} minute period</li>
                            <li>Most vulnerable in the {getMostActiveGoalPeriod(stats.goals.against.minute)} minute period</li>
                            <li>Failed to score in {stats.failed_to_score.total} matches ({((stats.failed_to_score.total / stats.fixtures.played.total) * 100).toFixed(0)}%)</li>
                        </ul>
                    </div>
                </motion.div>

                {/* Home vs Away Card */}
                <motion.div
                    className="stats-card home-away-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h3 className="card-title">
                        <FaChartLine className="title-icon" />
                        Home vs Away Performance
                    </h3>

                    <HomeAwayRadar stats={stats} />

                    <div className="home-away-records">
                        <div className="home-record">
                            <h4>Home Record</h4>
                            <div className="record-string">
                                {stats.fixtures.wins.home}W - {stats.fixtures.draws.home}D - {stats.fixtures.loses.home}L
                            </div>
                            <div className="biggest-result">
                                Biggest win: {stats.biggest.wins.home || 'N/A'}
                            </div>
                        </div>

                        <div className="away-record">
                            <h4>Away Record</h4>
                            <div className="record-string">
                                {stats.fixtures.wins.away}W - {stats.fixtures.draws.away}D - {stats.fixtures.loses.away}L
                            </div>
                            <div className="biggest-result">
                                Biggest win: {stats.biggest.wins.away || 'N/A'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tactics Card */}
                <motion.div
                    className="stats-card tactics-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h3 className="card-title">
                        <FaUsers className="title-icon" />
                        Tactical Approach
                    </h3>

                    <FormationDisplay lineups={stats.lineups} />

                    <div className="discipline-section">
                        <h4>Team Discipline</h4>
                        <div className="cards-display">
                            <div className="yellow-card">
                                <div className="card-count">{totalYellowCards}</div>
                                <div className="card-label">Yellow Cards</div>
                            </div>
                            <div className="red-card">
                                <div className="card-count">{totalRedCards}</div>
                                <div className="card-label">Red Cards</div>
                            </div>
                        </div>
                    </div>

                    {stats.penalty && stats.penalty.total > 0 && (
                        <div className="penalties-section">
                            <h4>Penalties</h4>
                            <div className="penalty-stats">
                                <div className="penalty-circle">
                                    <div className="penalty-percent">
                                        {parseInt(stats.penalty.scored.percentage)}%
                                    </div>
                                    <div className="penalty-count">
                                        {stats.penalty.scored.total}/{stats.penalty.total}
                                    </div>
                                </div>
                                <div className="penalty-text">
                                    Conversion Rate
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

// Helper function to find the most active goal-scoring period
function getMostActiveGoalPeriod(minuteData) {
    if (!minuteData) return 'N/A';

    let maxTotal = 0;
    let maxPeriod = '';

    Object.entries(minuteData).forEach(([period, data]) => {
        if (data && data.total && data.total > maxTotal) {
            maxTotal = data.total;
            maxPeriod = period;
        }
    });

    return maxPeriod;
}

export default TeamStats;