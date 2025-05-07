import React from 'react';
import "../../styles/PlayerStats/SeasonPerformanceDetailed.scss";

const SeasonPerformanceDetailed = ({ matches }) => {
  const renderStat = (value) =>
    value !== undefined && value !== null ? value : '10';

  const StatItem = ({ label, value }) => {
    const statValue = Number(renderStat(value));
    const percentage = Math.min((statValue / 100) * 100, 100); // scale for bar

    return (
      <li className="stat-item">
        <span className="stat-label">{label}:</span>
        <span className="stat-bar-container">
          <span className="stat-bar" style={{ width: `${percentage}%` }}></span>
        </span>
        <span className="stat-value">{statValue}</span>
      </li>
    );
  };

  return (
    <div className="season-detailed">
      <h3>Match Performance</h3>
      <div className="match-block">
        <div className="match-header">
          <span>Rating: {matches.rating || 8.8 }</span>
        </div>

        <div className="category shooting">
          <h4>Shooting</h4>
          <ul>
            <StatItem label="Goals" value={matches.goals || 40} />
            <StatItem label="Expected Goals (xG)" value={matches.xG || 0.8} />
            <StatItem label="xG on Target (xGOT)" value={matches.xGOT || 0.6} />
            <StatItem label="Penalty Goals" value={matches.penaltyGoals || 0} />
            <StatItem label="Non-Penalty xG" value={matches.nonPenaltyXG || 0.7} />
            <StatItem label="Shots" value={matches.shots || 4} />
            <StatItem label="Shots on Target" value={matches.shotsOnTarget || 2} />
          </ul>
        </div>

        <div className="category passing">
          <h4>Passing</h4>
          <ul>
            <StatItem label="Assists" value={matches.assists || 20} />
            <StatItem label="Expected Assists (xA)" value={matches.xA || 0.5} />
            <StatItem label="Successful Passes" value={matches.successfulPasses || 28} />
            <StatItem label="Pass Accuracy" value={matches.passAccuracy || 85} />
            <StatItem label="Accurate Long Balls" value={matches.accurateLongBalls || 5} />
            <StatItem label="Long Balls Accuracy" value={matches.longBallsAccuracy || 75} />
            <StatItem label="Chances Created" value={matches.chancesCreated || 3} />
            <StatItem label="Successful Crosses" value={matches.successfulCrosses || 2} />
            <StatItem label="Cross Accuracy" value={matches.crossAccuracy || 60} />
          </ul>
        </div>

        <div className="category possession">
          <h4>Possession</h4>
          <ul>
            <StatItem label="Successful Dribbles" value={matches.successfulDribbles || 3} />
            <StatItem label="Dribble Success" value={matches.dribbleSuccess || 60} />
            <StatItem label="Touches" value={matches.touches || 75} />
            <StatItem label="Touches in Opposition Box" value={matches.touchesInBox || 6} />
            <StatItem label="Dispossessed" value={matches.dispossessed || 1} />
            <StatItem label="Fouls Won" value={matches.foulsWon || 2} />
          </ul>
        </div>

        <div className="category defending">
          <h4>Defending</h4>
          <ul>
            <StatItem label="Tackles Won" value={matches.tacklesWon || 1} />
            <StatItem label="Tackle Won %" value={matches.tackleSuccess || 80} />
            <StatItem label="Duels Won" value={matches.duelsWon || 4} />
            <StatItem label="Duels Won %" value={matches.duelsWonPercentage || 60} />
            <StatItem label="Aerial Duels Won" value={matches.aerialDuelsWon || 1} />
            <StatItem label="Aerial Duels Won %" value={matches.aerialDuelsWonPercentage || 50} />
            <StatItem label="Interceptions" value={matches.interceptions || 1} />
            <StatItem label="Blocked Shots" value={matches.blockedShots || 0} />
            <StatItem label="Fouls Committed" value={matches.foulsCommitted || 2} />
            <StatItem label="Recoveries" value={matches.recoveries || 5} />
            <StatItem label="Possession Won Final 3rd" value={matches.possessionWonFinalThird || 1} />
            <StatItem label="Dribbled Past" value={matches.dribbledPast || 2} />
          </ul>
        </div>

        <div className="category discipline">
          <h4>Discipline</h4>
          <ul>
            <StatItem label="Yellow Cards" value={matches.yellowCards || 1} />
            <StatItem label="Red Cards" value={matches.redCards || 0} />
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeasonPerformanceDetailed;
