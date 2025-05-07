import React from 'react';
import "../../styles/PlayerStats/SeasonPerformance.scss";

const SeasonPerformance = ({ stats }) => {
  const getStatValue = (value) => value !== undefined && value !== null ? value : "N/A";

  return (
    <div className="season-performance">
      <h3>Season Performance</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">40</span>
          <span className="stat-label">Goals</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">20</span>
          <span className="stat-label">Assists</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">70</span>
          <span className="stat-label">Matches</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">60</span>
          <span className="stat-label">Started</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">4500</span>
          <span className="stat-label">Minutes Played</span>
        </div>
        <div className="stat-item">
          <span className="stat-value rating">8.5</span>
          <span className="stat-label">Rating</span>
        </div>
        <div className="stat-item">
          <span className="stat-value yellow-card">2</span>
          <span className="stat-label">Yellow Cards</span>
        </div>
        <div className="stat-item">
            <span className="stat-value red-card">1</span>
            <span className="stat-label">Red Cards</span>
        </div> 
      </div>
    </div>
  );
};

export default SeasonPerformance;
