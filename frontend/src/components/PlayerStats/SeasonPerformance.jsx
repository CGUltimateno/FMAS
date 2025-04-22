import React from 'react';
import "../../styles/PlayerStats/SeasonPerformance.scss";

const SeasonPerformance = ({ stats }) => {
  const getStatValue = (value) => value !== undefined && value !== null ? value : "N/A";

  return (
    <div className="season-performance">
      <h3>Season Performance</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.goals)}</span>
          <span className="stat-label">Goals</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.assists)}</span>
          <span className="stat-label">Assists</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.appearances)}</span>
          <span className="stat-label">Matches</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.appearances)}</span>
          <span className="stat-label">Started</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.appearances)}</span>
          <span className="stat-label">Minutes Play</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.rating)}</span>
          <span className="stat-label">Rating</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.yellowCards)}</span>
          <span className="stat-label">Yellow Cards</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getStatValue(stats?.appearances)}</span>
          <span className="stat-label">Red Cards</span>
        </div> 
      </div>
    </div>
  );
};

export default SeasonPerformance;
