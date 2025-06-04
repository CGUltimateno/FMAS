// frontend/src/components/PlayerStats/PlayerStats.jsx
import React, { useState, useMemo } from 'react';
import {
    RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { BiRadar } from 'react-icons/bi'; // Fixed icon import
import { motion } from 'framer-motion';
import '../../styles/PlayerStats/PlayerStats.scss';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="ps-custom-tooltip">
                <p className="ps-stat-name">{payload[0].payload.stat}</p>
                <p className="ps-stat-value">{payload[0].value}</p>
                <p className="ps-stat-desc">{payload[0].payload.description}</p>
            </div>
        );
    }
    return null;
};

const PlayerStats = ({ stats }) => {
    const [selectedCompetition, setSelectedCompetition] = useState(0);
    console.log("PlayerStats component rendered with stats:", stats);
    if (!stats || stats.length === 0) {
        return <div className="ps-no-data">No statistics available for this player.</div>;
    }

    const competitions = useMemo(() =>
            stats.map((stat, index) => ({
                id: index,
                name: stat.league?.name,
                logo: stat.league?.logo
            })),
        [stats]);

    const currentStats = stats[selectedCompetition];

    // Calculate shooting accuracy percentage
    const shotAccuracy = currentStats.shots?.on && currentStats.shots?.total
        ? Math.round((currentStats.shots.on / currentStats.shots.total) * 100)
        : 0;

    // Calculate dribble success percentage
    const dribbleSuccess = currentStats.dribbles?.success && currentStats.dribbles?.attempts
        ? Math.round((currentStats.dribbles.success / currentStats.dribbles.attempts) * 100)
        : 0;

    // Calculate duels won percentage
    const duelsWon = currentStats.duels?.won && currentStats.duels?.total
        ? Math.round((currentStats.duels.won / currentStats.duels.total) * 100)
        : 0;

    const radarData = [
        {
            stat: 'Goals',
            value: currentStats.goals?.total || 0,
            fullMark: 30,
            description: `${currentStats.goals?.total || 0} goals in ${currentStats.games?.appearences || 0} appearances`
        },
        {
            stat: 'Shot Accuracy',
            value: shotAccuracy,
            fullMark: 100,
            description: `${currentStats.shots?.on || 0} shots on target from ${currentStats.shots?.total || 0} attempts`
        },
        {
            stat: 'Assists',
            value: currentStats.goals?.assists || 0,
            fullMark: 20,
            description: `${currentStats.goals?.assists || 0} assists provided`
        },
        {
            stat: 'Key Passes',
            value: currentStats.passes?.key || 0,
            fullMark: 50,
            description: `${currentStats.passes?.key || 0} key passes made`
        },
        {
            stat: 'Dribble Success',
            value: dribbleSuccess,
            fullMark: 100,
            description: `${currentStats.dribbles?.success || 0} successful dribbles from ${currentStats.dribbles?.attempts || 0} attempts`
        },
        {
            stat: 'Duels Won',
            value: duelsWon,
            fullMark: 100,
            description: `${currentStats.duels?.won || 0} duels won from ${currentStats.duels?.total || 0} total duels`
        }
    ];

    return (
        <motion.div
            className="ps-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="ps-title">
                <BiRadar className="ps-title-icon" /> {/* Fixed icon usage */}
                Player Performance
            </h3>

            <div className="ps-competition-selector">
                {competitions.map(comp => (
                    <div
                        key={comp.id}
                        className={`ps-competition-item ${selectedCompetition === comp.id ? 'active' : ''}`}
                        onClick={() => setSelectedCompetition(comp.id)}
                    >
                        <img src={comp.logo} alt={comp.name} className="ps-competition-logo" />
                        <span>{comp.name}</span>
                    </div>
                ))}
            </div>

            <div className="ps-chart-container">
                <ResponsiveContainer width="100%" height={350}>
                    <RadarChart
                        data={radarData}
                        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                    >
                        <defs>
                            {/* Enhanced gradient with multiple color stops */}
                            <linearGradient id="statsGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.9} />
                                <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#A855F7" stopOpacity={0.7} />
                            </linearGradient>
                            {/* Add a glow effect */}
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <PolarGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey="stat"
                            tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                            stroke="#d0d0d0"
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 'auto']}
                            tick={{ fill: '#999' }}
                            axisLine={false}
                            tickCount={5}
                            stroke="#d0d0d0"
                        />
                        <Radar
                            name="Performance"
                            dataKey="value"
                            stroke="#4F46E5"
                            fill="url(#statsGradient)"
                            fillOpacity={0.7}
                            strokeWidth={2}
                            filter="url(#glow)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="ps-insights">
                <h4>Performance Insights</h4>
                <ul className="ps-insights-list">
                    {currentStats.goals?.total > 0 && (
                        <li>Scored {currentStats.goals.total} goals in {currentStats.games?.minutes || 0} minutes (1 goal every {Math.round(currentStats.games?.minutes / currentStats.goals.total)} minutes)</li>
                    )}
                    {shotAccuracy > 0 && (
                        <li>Shot accuracy of {shotAccuracy}% with {currentStats.shots?.on || 0} shots on target</li>
                    )}
                    {currentStats.goals?.assists > 0 && (
                        <li>Provided {currentStats.goals.assists} assists for teammates</li>
                    )}
                    {dribbleSuccess > 0 && (
                        <li>Completed {dribbleSuccess}% of attempted dribbles</li>
                    )}
                    {currentStats.fouls?.drawn > 0 && (
                        <li>Drew {currentStats.fouls.drawn} fouls from opponents</li>
                    )}
                    {currentStats.penalty?.scored > 0 && (
                        <li>Converted {currentStats.penalty.scored} penalties ({currentStats.penalty.scored + (currentStats.penalty.missed || 0)} attempted)</li>
                    )}
                </ul>
            </div>
        </motion.div>
    );
};

export default PlayerStats;