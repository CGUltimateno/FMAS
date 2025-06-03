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

    // Destructure with checks for startXI and formation
    const { formation, startXI, team, coach } = teamLineup;

    if (!startXI || !Array.isArray(startXI) || startXI.length === 0) {
        return <div className="season-stats">Starting XI data is not available for this team.</div>;
    }

    if (!formation) {
        return <div className="season-stats">Formation data is not available for this team.</div>;
    }

    const getCoordinatesByGrid = (grid, currentFormation) => {
        if (!grid) return { top: '50%', left: '50%' }; // Default if grid is missing

        const [row, column] = grid.split(':').map(Number);
        const formationParts = currentFormation.split('-'); // currentFormation is guaranteed to be non-null here
        const maxRows = formationParts.length + 1; // Including goalkeeper row

        const verticalSpread = 80; // Percentage of pitch height for player distribution
        const topOffset = 10;      // Top offset for the highest player row

        // Calculate top position: Higher row number means lower on the pitch (closer to own goal)
        // Row 1 is goalkeeper, Row (maxRows) is furthest forward.
        // We want to map row 1 (GK) to near the bottom (e.g., 90%) and last row (strikers) near the top (e.g., 10%)
        // Let's adjust to: topPercentage = topOffset + ((row - 1) / Math.max(1, maxRows -1)) * verticalSpread;
        // This makes row 1 at topOffset, and last row at topOffset + verticalSpread.
        // For a half-pitch view, this is fine.
        let topPercentage = topOffset + (((row - 1) / Math.max(1, maxRows - 1)) * verticalSpread);
        if (maxRows === 1 && row ===1) { // Only GK
            topPercentage = 90; // Place GK at the bottom for a single row
        } else if (row === 1) { // Goalkeeper specifically
            topPercentage = 90; // Place GK at the bottom
        } else {
            // Adjust other rows to be above GK
            // (row - 1) because formationParts doesn't include GK. So row 2 is formationParts[0]
            topPercentage = topOffset + (((row - 2) / Math.max(1, maxRows - 2)) * (verticalSpread - 20)); // use a smaller spread for field players
        }


        const formationArray = ['1', ...formationParts]; // GK + field players
        const playersInCurrentActualRow = parseInt(formationArray[row - 1] || 1); // Number of players in this grid row

        // Calculate left position: Distribute players horizontally within their row
        const leftPercentage = (column / (playersInCurrentActualRow + 1)) * 100;

        return {
            top: `${topPercentage}%`,
            left: `${leftPercentage}%`
        };
    };

    const getPositionColor = (pos) => {
        switch(pos) {
            case 'G': return "#f39c12"; // Orange
            case 'D': return "#3498db"; // Blue
            case 'M': return "#2ecc71"; // Green
            case 'F': return "#e74c3c"; // Red
            default: return "#95a5a6";  // Grey
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
                    // Ensure player and player.grid exist before calling getCoordinatesByGrid
                    if (!player || !player.grid) {
                        console.warn("Player data or grid is missing for player:", player);
                        return null; // Skip rendering this player if essential data is missing
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