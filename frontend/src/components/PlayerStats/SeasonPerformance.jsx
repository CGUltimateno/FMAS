import React from 'react';
import {
  FaFutbol,
  FaRegHandshake,
  FaCalendarCheck,
  FaPlayCircle,
  FaRegClock,
  FaStar,
  FaSquare,
} from 'react-icons/fa';
import "../../styles/PlayerStats/SeasonPerformance.scss";

const SeasonPerformance = ({ stats }) => {
  const seasonStats = stats?.[0];

  const getValue = (path, fallback = 'N/A') => {
    if (path === 0) return '0'; // Display '0' if it's a valid number
    return path !== undefined && path !== null ? String(path) : fallback;
  };

  // Helper component for individual stat items
  const StatItem = ({ icon, value, label, valueClassName = '', iconClassName = '' }) => (
      <div className="stat-item">
        {React.createElement(icon, { className: `stat-icon ${iconClassName}` })}
        <span className={`stat-value ${valueClassName}`}>{value}</span>
        <span className="stat-label">{label}</span>
      </div>
  );

  return (
      <div className="season-performance">
        <h3>Season Performance</h3>
        {seasonStats ? (
            <div className="stats-grid">
              <StatItem
                  icon={FaFutbol}
                  value={getValue(seasonStats?.goals?.total)}
                  label="Goals"
                  iconClassName="goal-icon"
              />
              <StatItem
                  icon={FaRegHandshake}
                  value={getValue(seasonStats?.goals?.assists)}
                  label="Assists"
                  iconClassName="assist-icon"
              />
              <StatItem
                  icon={FaCalendarCheck}
                  value={getValue(seasonStats?.games?.appearences)}
                  label="Matches"
              />
              <StatItem
                  icon={FaPlayCircle}
                  value={getValue(seasonStats?.games?.lineups)}
                  label="Started"
              />
              <StatItem
                  icon={FaRegClock}
                  value={getValue(seasonStats?.games?.minutes)}
                  label="Minutes Played"
              />
              <StatItem
                  icon={FaStar}
                  value={getValue(seasonStats?.games?.rating)}
                  label="Rating"
                  valueClassName={seasonStats?.games?.rating ? 'rating' : ''}
                  iconClassName="rating-icon"
              />
              <StatItem
                  icon={FaSquare}
                  value={getValue(seasonStats?.cards?.yellow)}
                  label="Yellow Cards"
                  valueClassName={seasonStats?.cards?.yellow > 0 ? 'yellow-card' : ''}
                  iconClassName="yellow-card-icon"
              />
              <StatItem
                  icon={FaSquare}
                  value={getValue(seasonStats?.cards?.red)}
                  label="Red Cards"
                  valueClassName={seasonStats?.cards?.red > 0 ? 'red-card' : ''}
                  iconClassName="red-card-icon"
              />
            </div>
        ) : (
            <p className="no-stats-message">No season performance data available.</p>
        )}
      </div>
  );
};

export default SeasonPerformance;