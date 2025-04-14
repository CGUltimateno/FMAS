import React from "react";
import "../../styles/TeamStats/StatsXI.scss";

const StatsXI = ({ lastMatch }) => {
    // Early return if no match data
    if (!lastMatch || !lastMatch.lineup) {
        return (
            <div className="season-stats">
                <h2>Last Match Lineup</h2>
                <p className="no-data">No lineup data available</p>
            </div>
        );
    }

    // Extract players data
    const { lineup } = lastMatch;

    return (
        <div className="season-stats">
            <h2>Last Match Lineup</h2>
            <div className="football-field">
                {lineup.map((player) => (
                    <div
                        key={player.id}
                        className="player-icon"
                        style={{
                            gridArea: `pos-${player.position}`
                        }}
                    >
                        <div className="player-image">
                            {/* Player image will be handled by the user */}
                            <span className="player-name">{player.name}</span>
                        </div>
                        <div className="player-stats">
                            <span className="rating">{player.averageRating || "N/A"}</span>
                            <span className="assists">{player.assists || 0}</span>
                            <span className="goals">{player.goals || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsXI;