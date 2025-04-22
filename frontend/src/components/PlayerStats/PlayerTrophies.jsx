import React from 'react';
import "../../styles/PlayerStats/PlayerTrophies.scss";

const PlayerTrophies = ({ trophies }) => {
  if (!trophies || trophies.length === 0) {
    return <p className="player-trophies__empty">No trophies available.</p>;
  }

  return (
    <div className="player-trophies">
      <h3 className="player-trophies__title">Trophies & Achievements</h3>
      <div className="trophies-grid">
        {trophies.map((trophy, index) => (
          <div className="trophy-item" key={index}>
            <div className="trophy-icon">🏆</div>
            <div className="trophy-details">
              <h4>{trophy.name || "Unknown Trophy"}</h4>
              <p>{trophy.competition || "Unknown Competition"} ({trophy.year || "N/A"})</p>
              {trophy.description && <p className="trophy-desc">{trophy.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerTrophies;
