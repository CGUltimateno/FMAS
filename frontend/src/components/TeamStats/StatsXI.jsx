import React from "react";
import { useGetLastMatchQuery } from "../../services/footballApi";
import "../../styles/TeamStats/StatsXI.scss";

const StatsXI = ({ teamId }) => {
    const { data: lastMatch, isLoading, error } = useGetLastMatchQuery(teamId);

    if (isLoading) return <div className="season-stats loading">Loading lineup data...</div>;
    if (error) return <div className="season-stats error">Error loading lineup data</div>;
    if (!lastMatch?.response || lastMatch.response.length === 0) {
        return <div className="season-stats">No last match data available</div>;
    }

    const matchData = lastMatch.response[0];
    if (!matchData.lineups || matchData.lineups.length === 0) {
        return <div className="season-stats">No lineup data available for the last match</div>;
    }

    const teamLineup = matchData.lineups.find(lineup => lineup.team.id === Number(teamId));
    if (!teamLineup) {
        return <div className="season-stats">No lineup data available for this team in the last match</div>;
    }

    const { formation, startXI, team, coach } = teamLineup;

    if (!startXI || !Array.isArray(startXI) || startXI.length === 0) {
        return <div className="season-stats">Starting XI data is not available for this team.</div>;
    }

    if (!formation) {
        return <div className="season-stats">Formation data is not available for this team.</div>;
    }

    const getCoordinatesByGrid = (grid, currentFormation) => {
        if (!grid) return { top: '50%', left: '50%' };

        const [row, column] = grid.split(':').map(Number);
        const formationParts = currentFormation.split('-');
        const maxRows = formationParts.length + 1;

        const verticalSpread = 80;
        const topOffset = 10;

        let topPercentage;
        if (maxRows === 1 && row === 1) {
            topPercentage = 90;
        } else if (row === 1) {
            topPercentage = 90;
        } else {
            // For field players (row > 1)
            // Normalizes player's line index (0 for first field line, 1 for last field line)
            const playerLineIndex = row - 2;
            // Total number of segments between field player lines. Min 1 to avoid div by zero.
            const numFieldLineSegments = Math.max(1, maxRows - 2);
            const progressRatio = playerLineIndex / numFieldLineSegments;

            // Invert progress: 1 for first field line (e.g. defenders), 0 for last field line (e.g. attackers)
            const invertedProgressRatio = 1 - progressRatio;

            const fieldPlayerVerticalRange = verticalSpread - 20; // e.g. 60%

            // Attackers (invertedProgressRatio=0) get topOffset.
            // Defenders (invertedProgressRatio=1) get topOffset + fieldPlayerVerticalRange.
            topPercentage = topOffset + (invertedProgressRatio * fieldPlayerVerticalRange);
        }

        const formationArray = ['1', ...formationParts];
        const playersInCurrentActualRow = parseInt(formationArray[row - 1] || 1);

        const leftPercentage = (column / (playersInCurrentActualRow + 1)) * 100;

        return {
            top: `${topPercentage}%`,
            left: `${leftPercentage}%`
        };
    };

    const getPositionColor = (pos) => {
        switch(pos) {
            case 'G': return "#f39c12";
            case 'D': return "#3498db";
            case 'M': return "#2ecc71";
            case 'F': return "#e74c3c";
            default: return "#95a5a6";
        }
    };

    return (
        <div className="season-stats">
            <div className="lineup-header">
                <div className="team-info">
                    <img src={team.logo} alt={team.name} className="team-logo" />
                    <h2>{team.name}</h2>
                </div>
                <div className="formation-info">
                    <div className="formation-badge">{formation}</div>
                    <div className="coach-info">
                        <span>Coach: {coach?.name || "Unknown"}</span>
                    </div>
                </div>
            </div>

            <div className="football-pitch half-field">
                <div className="penalty-area"></div>
                <div className="goal-area"></div>
                <div className="goal"></div>
                <div className="penalty-spot"></div>
                <div className="penalty-arc"></div>
                <div className="corner-arc left"></div>
                <div className="corner-arc right"></div>
                <div className="halfway-line"></div>
                <div className="center-circle half"></div>
                <div className="center-spot"></div>

                {startXI.map(({ player }) => {
                    if (!player || !player.grid) {
                        console.warn("Player data or grid is missing for player:", player);
                        return null;
                    }
                    const coords = getCoordinatesByGrid(player.grid, formation);
                    const playerTopPercent = parseFloat(coords.top);
                    const tooltipPositionClass = playerTopPercent > 50 ? 'tooltip-above' : 'tooltip-below';

                    return (
                        <div
                            key={player.id}
                            className="player-marker"
                            style={{
                                top: coords.top,
                                left: coords.left,
                            }}
                        >
                            <div
                                className="player-badge"
                                style={{
                                    backgroundColor: getPositionColor(player.pos),
                                    borderColor: team.colors?.player?.border || "white"
                                }}
                            >
                                {player.number}
                            </div>
                            <div className={`player-info ${tooltipPositionClass}`}>
                                <div className="player-name">{player.name}</div>
                                <div className="player-position">{player.pos}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatsXI;