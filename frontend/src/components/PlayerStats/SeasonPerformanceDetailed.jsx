import React from 'react';
import "../../styles/PlayerStats/SeasonPerformanceDetailed.scss";

const SeasonPerformanceDetailed = ({ matches }) => {
  const renderStat = (value) =>
    value !== undefined && value !== null ? value : 'N/A';

  return (
    <div className="season-detailed">
      <h3>Match Performance</h3>
      <div className="match-block">
        <div className="match-header">
          <span>{matches.date || 'N/A'}</span>
          <span>{matches.opponent || 'N/A'}</span>
          <span>Rating: {renderStat(matches.rating)}</span>
        </div>

        <div className="category">
          <h4>Shooting</h4>
          <ul>
            <li>Goals: {renderStat(matches.goals)}</li>
            <li>Expected Goals (xG): {renderStat(matches.xG)}</li>
            <li>xG on Target (xGOT): {renderStat(matches.xGOT)}</li>
            <li>Penalty Goals: {renderStat(matches.penaltyGoals)}</li>
            <li>Non-Penalty xG: {renderStat(matches.nonPenaltyXG)}</li>
            <li>Shots: {renderStat(matches.shots)}</li>
            <li>Shots on Target: {renderStat(matches.shotsOnTarget)}</li>
          </ul>
        </div>

        <div className="category">
          <h4>Passing</h4>
          <ul>
            <li>Assists: {renderStat(matches.assists)}</li>
            <li>Expected Assists (xA): {renderStat(matches.xA)}</li>
            <li>Successful Passes: {renderStat(matches.successfulPasses)}</li>
            <li>Pass Accuracy: {renderStat(matches.passAccuracy)}</li>
            <li>Accurate Long Balls: {renderStat(matches.accurateLongBalls)}</li>
            <li>Long Balls Accuracy: {renderStat(matches.longBallsAccuracy)}</li>
            <li>Chances Created: {renderStat(matches.chancesCreated)}</li>
            <li>Successful Crosses: {renderStat(matches.successfulCrosses)}</li>
            <li>Cross Accuracy: {renderStat(matches.crossAccuracy)}</li>
          </ul>
        </div>

        <div className="category">
          <h4>Possession</h4>
          <ul>
            <li>Successful Dribbles: {renderStat(matches.successfulDribbles)}</li>
            <li>Dribble Success: {renderStat(matches.dribbleSuccess)}</li>
            <li>Touches: {renderStat(matches.touches)}</li>
            <li>Touches in Opposition Box: {renderStat(matches.touchesInBox)}</li>
            <li>Dispossessed: {renderStat(matches.dispossessed)}</li>
            <li>Fouls Won: {renderStat(matches.foulsWon)}</li>
          </ul>
        </div>

        <div className="category">
          <h4>Defending</h4>
          <ul>
            <li>Tackles Won: {renderStat(matches.tacklesWon)}</li>
            <li>Tackle Won %: {renderStat(matches.tackleSuccess)}</li>
            <li>Duels Won: {renderStat(matches.tackleSuccess)}</li>
            <li>Duels Won %: {renderStat(matches.duelsWon)}</li>
            <li>Aerial Duels Won: {renderStat(matches.aerialDuelsWon)}</li>
            <li>Aerial Duels Won %: {renderStat(matches.aerialDuelsWon)}</li>
            <li>Interceptions: {renderStat(matches.interceptions)}</li>
            <li>Blocked: {renderStat(matches.blockedShots)}</li>
            <li>Fouls Committed: {renderStat(matches.clearances)}</li>
            <li>Recoveries: {renderStat(matches.duelsWon)}</li>
            <li>Possession Won Final 3rd: {renderStat(matches.groundDuelsWon)}</li>
            <li>Dribbled Past: {renderStat(matches.blockedShots)}</li>

          </ul>
        </div>
        <div className="category">
          <h4>Discipline</h4>
          <ul>
            <li>Yellow Cards: {renderStat(matches.tacklesWon)}</li>
            <li>Red Cards: {renderStat(matches.tackleSuccess)}</li>

          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeasonPerformanceDetailed;
