import React, { useState, useEffect } from 'react';
import { useGetMatchLineupsQuery } from '../../services/footballApi';
import '../../styles/MatchStats/Lineup.scss';
import { FaUserTie, FaInfoCircle, FaTshirt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Lineup = ({ matchId }) => {
    const { data: lineups, isLoading, error } = useGetMatchLineupsQuery(matchId, {
        skip: !matchId
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (lineups) {
            setIsInitialLoad(false);
        }
    }, [lineups]);

    if (isLoading) return (
        <div className="lineup loading">
            <div className="lineup__loading-spinner"></div>
            <div className="lineup__loading-text">Loading match lineups...</div>
        </div>
    );

    if (error) {
        return (
            <motion.div
                className="lineup empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <FaInfoCircle size={24} style={{ marginBottom: "10px" }} />
                <div>Error loading lineup data</div>
                <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
                    {error.message || 'Please try again later'}
                </div>
            </motion.div>
        );
    }

    if (!lineups || (!lineups.home && !lineups.away)) {
        return (
            <motion.div
                className="lineup empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <FaInfoCircle size={24} style={{ marginBottom: "10px" }} />
                <div>No lineup data available for this match</div>
                <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>
                    Lineups may not be published yet
                </div>
            </motion.div>
        );
    }

    const homeTeam = lineups.home;
    const awayTeam = lineups.away;
    const homeTeamColor = '#4299e1'; // Blue for home team
    const awayTeamColor = '#ed8936'; // Orange for away team

    return (
        <motion.div
            className="lineup vertical"
            initial={isInitialLoad ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="lineup__header">
                <h2 className="lineup__title">Match Lineups</h2>
            </div>

            <div className="lineup__teams-header">
                <TeamHeader team={awayTeam} color={awayTeamColor} />
                <TeamHeader team={homeTeam} color={homeTeamColor} />
            </div>

            <div className="lineup__coaches">
                <div className="lineup__coach-container">
                    <CoachInfo coach={awayTeam?.coach} />
                </div>
                <div className="lineup__coach-container">
                    <CoachInfo coach={homeTeam?.coach} />
                </div>
            </div>

            <div className="lineup__vertical-pitch">
                <div className="lineup__pitch-background">
                    <div className="lineup__pitch-center-circle"></div>
                    <div className="lineup__pitch-center-line"></div>
                    <div className="lineup__pitch-penalty-area away"></div>
                    <div className="lineup__pitch-goal-area away"></div>
                    <div className="lineup__pitch-penalty-area home"></div>
                    <div className="lineup__pitch-goal-area home"></div>
                </div>

                {/* Away team players (top) */}
                <VerticalTeamFormation
                    team={awayTeam}
                    teamColor={awayTeamColor}
                    side="away"
                />

                {/* Home team players (bottom) */}
                <VerticalTeamFormation
                    team={homeTeam}
                    teamColor={homeTeamColor}
                    side="home"
                />
            </div>

            <div className="lineup__substitutes-section">
                <h3 className="lineup__section-title">Substitutes</h3>
                <div className="lineup__substitutes">
                    <div className="lineup__team-subs">
                        <h4 className="lineup__team-sub-header" style={{color: awayTeamColor}}>
                            {awayTeam?.team?.name}
                        </h4>
                        <SubstitutesList substitutes={awayTeam?.substitutes} teamColor={awayTeamColor} />
                    </div>
                    <div className="lineup__team-subs">
                        <h4 className="lineup__team-sub-header" style={{color: homeTeamColor}}>
                            {homeTeam?.team?.name}
                        </h4>
                        <SubstitutesList substitutes={homeTeam?.substitutes} teamColor={homeTeamColor} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const TeamHeader = ({ team, color }) => {
    if (!team?.team) return null;

    return (
        <motion.div
            className="lineup__team-header"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <img src={team.team.logo} alt={team.team.name} className="lineup__team-logo" />
            <h3 className="lineup__team-name">{team.team.name}</h3>
            <div className="lineup__formation">{team.formation || 'N/A'}</div>
        </motion.div>
    );
};

const CoachInfo = ({ coach }) => {
    if (!coach?.name) {
        return (
            <motion.div
                className="lineup__coach"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <FaUserTie className="lineup__coach-icon" />
                <span className="lineup__coach-name">Unknown Coach</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="lineup__coach"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <FaUserTie className="lineup__coach-icon" />
            <span className="lineup__coach-name">{coach.name}</span>
            {coach.photo && <img src={coach.photo} alt={coach.name} className="lineup__coach-photo" />}
        </motion.div>
    );
};

const VerticalTeamFormation = ({ team, teamColor, side }) => {
    if (!team?.startXI || !team?.formation || team.startXI.length === 0) {
        return (
            <div className="lineup__formation-area">
                <div className="lineup__no-players">No starting lineup available</div>
            </div>
        );
    }

    // Convert formation to player positions
    const positionedPlayers = positionPlayersVertically(team.formation, team.startXI, side);

    return (
        <div className={`lineup__formation-area ${side}`}>
            {positionedPlayers.map((player, index) => (
                <motion.div
                    key={index}
                    className={`lineup__player-bubble ${side}`}
                    style={{
                        left: `${player.x}%`,
                        top: `${player.y}%`,
                        borderColor: teamColor
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{
                        scale: 1.1,
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    <div className="lineup__player-bubble-number" style={{ backgroundColor: teamColor }}>
                        {player.number || '?'}
                    </div>
                    <div className="lineup__player-bubble-name">
                        {player.name || 'Unknown'}
                    </div>
                    <div className="lineup__player-bubble-position">
                        {getPositionName(player.pos)}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const positionPlayersVertically = (formation, startXI, side) => {
    if (!formation || !startXI || startXI.length === 0) return [];

    // Parse formation, handling potential invalid formats
    let rows = [];
    try {
        rows = formation.split('-').map(num => parseInt(num));
    } catch (e) {
        console.error("Invalid formation format:", formation);
        return [];
    }

    const positions = [];

    // Add goalkeeper
    const goalkeeper = startXI[0];
    if (goalkeeper) {
        positions.push({
            ...goalkeeper,
            x: 50, // Center
            y: side === 'home' ? 90 : 10, // Bottom or top
        });
    }

    // Calculate vertical spacing based on number of rows in formation
    const totalRows = rows.length;
    const fieldHeightPercent = 90; // Reduced from 80 to create more space
    const startY = side === 'home' ? 85 : 15; // Starting Y position (adjusted from GK)
    const yDirection = side === 'home' ? -1 : 1; // Direction to move (up or down)

    let playerIndex = 1; // Start after goalkeeper

    // For each row in the formation (e.g., 4-3-3 has 3 rows)
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const playersInRow = rows[rowIndex];

        // Apply line-specific spacing
        let rowPosition;

        if (totalRows === 3) {
            // For 3-line formations (like 4-3-3, 4-4-2, etc.)
            const positions = [0.25, 0.5, 0.8]; // More spaced out positions for each line
            rowPosition = startY + yDirection * fieldHeightPercent * positions[rowIndex];
        } else if (totalRows === 4) {
            // For 4-line formations (like 4-2-3-1, etc.)
            const positions = [0.18, 0.42, 0.65, 0.85];
            rowPosition = startY + yDirection * fieldHeightPercent * positions[rowIndex];
        } else {
            // Default calculation with more spacing between lines
            rowPosition = startY + yDirection * (rowIndex + 1) * (fieldHeightPercent / (totalRows + 0.5));
        }

        // Distribute players horizontally in this row
        for (let i = 0; i < playersInRow; i++) {
            if (playerIndex >= startXI.length) break;

            const player = startXI[playerIndex];
            if (player) {
                // Calculate x position with wider spacing
                const xSpacing = 90 / (playersInRow + 1);
                const xPos = 5 + (i + 1) * xSpacing;

                positions.push({
                    ...player,
                    x: xPos,
                    y: rowPosition
                });
            }

            playerIndex++;
        }
    }

    return positions;
};
const SubstitutesList = ({ substitutes, teamColor }) => {
    if (!substitutes || substitutes.length === 0) {
        return <div className="lineup__no-data">No substitutes available</div>;
    }

    return (
        <div className="lineup__subs-container">
            <div className="lineup__subs-grid">
                {substitutes.map((sub, index) => (
                    <motion.div
                        key={index}
                        className="lineup__sub-player"
                        style={{ borderLeftColor: teamColor }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        whileHover={{ x: 5 }}
                    >
                        <div className="lineup__sub-number" style={{ backgroundColor: teamColor }}>
                            {sub.number || '?'}
                        </div>
                        <div className="lineup__sub-details">
                            <div className="lineup__sub-name">{sub.name || 'Unknown'}</div>
                            <div className="lineup__sub-position">{getPositionName(sub.pos)}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Helper function to convert position codes to readable names
const getPositionName = (pos) => {
    switch (pos) {
        case 'G': return 'Goalkeeper';
        case 'D': return 'Defender';
        case 'M': return 'Midfielder';
        case 'F': return 'Forward';
        default: return 'Unknown';
    }
};

export default Lineup;