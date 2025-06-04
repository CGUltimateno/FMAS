import React from 'react';
import {
  FaBullseye, // Shooting
  FaExchangeAlt, // Passing
  FaRunning, // Possession/Dribbles (changed from FaStreetView for more "action")
  FaShieldAlt, // Defending
  FaBalanceScale, // Discipline
  FaStar // Rating
} from 'react-icons/fa';
import "../../styles/PlayerStats/SeasonPerformanceDetailed.scss";

const SeasonPerformanceDetailed = ({ matches }) => {
  const stats = matches?.[0]; // first season/team stats
  const game = stats?.games || {};
  const goals = stats?.goals || {};
  const passes = stats?.passes || {};
  const dribbles = stats?.dribbles || {};
  const tackles = stats?.tackles || {};
  const duels = stats?.duels || {};
  const fouls = stats?.fouls || {};
  const cards = stats?.cards || {};
  const shots = stats?.shots || {};

  const renderStat = (value, fallback = '0') => (value !== undefined && value !== null ? String(value) : fallback);

  const StatItem = ({ label, value, maxValueForBar = 20 }) => {
    const numericValue = parseFloat(renderStat(value));
    let barPercentage = 0;

    if (label.toLowerCase().includes('accuracy') || label.includes('%')) {
      barPercentage = Math.min(Math.max(numericValue, 0), 100);
    } else if (numericValue > 0) {
      barPercentage = Math.min((numericValue / maxValueForBar) * 100, 100);
    }

    return (
        <li className="stat-item">
          <span className="stat-label">{label}</span>
          <div className="stat-progress">
            <div className="stat-bar-container">
              <div className="stat-bar" style={{ width: `${barPercentage}%` }}></div>
            </div>
            <span className="stat-value">{renderStat(value)}</span>
          </div>
        </li>
    );
  };

  const ratingValue = renderStat(game.rating, 'N/A');

  return (
      <div className="season-detailed">
        <h3>Detailed Match Performance</h3>

        {stats ? (
            <>
              <div className="match-rating-header">
                <FaStar className="rating-icon" />
                Overall Rating: <span className="rating-value">{ratingValue}</span>
              </div>

              <div className="category shooting">
                <h4><FaBullseye className="category-icon" />Shooting</h4>
                <ul>
                  <StatItem label="Goals" value={goals.total} maxValueForBar={5} />
                  <StatItem label="Shots" value={shots.total} maxValueForBar={10} />
                  <StatItem label="Shots on Target" value={shots.on} maxValueForBar={8} />
                </ul>
              </div>

              <div className="category passing">
                <h4><FaExchangeAlt className="category-icon" />Passing</h4>
                <ul>
                  <StatItem label="Total Passes" value={passes.total} maxValueForBar={150} />
                  <StatItem label="Key Passes" value={passes.key} maxValueForBar={10} />
                  <StatItem label="Accuracy (%)" value={passes.accuracy} />
                </ul>
              </div>

              <div className="category possession">
                <h4><FaRunning className="category-icon" />Possession</h4>
                <ul>
                  <StatItem label="Dribbles Attempted" value={dribbles.attempts} maxValueForBar={10} />
                  <StatItem label="Successful Dribbles" value={dribbles.success} maxValueForBar={dribbles.attempts || 5} />
                </ul>
              </div>

              <div className="category defending">
                <h4><FaShieldAlt className="category-icon" />Defending</h4>
                <ul>
                  <StatItem label="Tackles" value={tackles.total} maxValueForBar={10} />
                  <StatItem label="Interceptions" value={tackles.interceptions} maxValueForBar={8} />
                  <StatItem label="Duels Won" value={duels.won} maxValueForBar={20} />
                </ul>
              </div>

              <div className="category discipline">
                <h4><FaBalanceScale className="category-icon" />Discipline</h4>
                <ul>
                  <StatItem label="Fouls Committed" value={fouls.committed} maxValueForBar={5} />
                  <StatItem label="Yellow Cards" value={cards.yellow} maxValueForBar={1} />
                  <StatItem label="Red Cards" value={cards.red} maxValueForBar={1} />
                </ul>
              </div>
            </>
        ) : (
            <p className="no-detailed-stats-message">No detailed match performance data available for this period.</p>
        )}
      </div>
  );
};

export default SeasonPerformanceDetailed;