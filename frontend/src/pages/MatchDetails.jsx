import React from 'react';
import '../styles/LeagueDetails/MatchDetails.scss';

const MatchDetails = ({ team1, team2 }) => {
  const getTeamStats = (team) => ({
    logo: team === "Manchester United" 
      ? "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
      : "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    score: Math.floor(Math.random() * 5),
    shots: Math.floor(Math.random() * 20),
    saves: Math.floor(Math.random() * 10),
    passes: Math.floor(Math.random() * 500),
    possession: Math.floor(Math.random() * 60),
    playerRatings: Array.from({ length: 11 }, () => (Math.random() * 3 + 6).toFixed(1))
  });

  const team1Stats = getTeamStats(team1);
  const team2Stats = getTeamStats(team2);

  return (
    <div className="match-details">
      <h2>Match Details</h2>
      <div className="match-card">
        <div className="teams-header">
          <div className="team-header">
            <img src={team1Stats.logo} alt={`${team1} Logo`} />
            <h3>{team1}</h3>
            <p className="score">{team1Stats.score}</p>
          </div>
          <div className="vs">VS</div>
          <div className="team-header">
            <img src={team2Stats.logo} alt={`${team2} Logo`} />
            <h3>{team2}</h3>
            <p className="score">{team2Stats.score}</p>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-row">
            <span className={`team1-value ${team1Stats.shots > team2Stats.shots ? 'higher' : ''}`}>
              {team1Stats.shots}
            </span>
            <span className="stat-label">Shots</span>
            <span className={`team2-value ${team2Stats.shots > team1Stats.shots ? 'higher' : ''}`}>
              {team2Stats.shots}
            </span>
          </div>
          <div className="stat-row">
            <span className={`team1-value ${team1Stats.saves > team2Stats.saves ? 'higher' : ''}`}>
              {team1Stats.saves}
            </span>
            <span className="stat-label">Saves</span>
            <span className={`team2-value ${team2Stats.saves > team1Stats.saves ? 'higher' : ''}`}>
              {team2Stats.saves}
            </span>
          </div>
          <div className="stat-row">
            <span className={`team1-value ${team1Stats.passes > team2Stats.passes ? 'higher' : ''}`}>
              {team1Stats.passes}
            </span>
            <span className="stat-label">Passes</span>
            <span className={`team2-value ${team2Stats.passes > team1Stats.passes ? 'higher' : ''}`}>
              {team2Stats.passes}
            </span>
          </div>
          <div className="stat-row">
            <span className={`team1-value ${team1Stats.possession > team2Stats.possession ? 'higher' : ''}`}>
              {team1Stats.possession}%
            </span>
            <span className="stat-label">Possession</span>
            <span className={`team2-value ${team2Stats.possession > team1Stats.possession ? 'higher' : ''}`}>
              {team2Stats.possession}%
            </span>
          </div>
        </div>

        <div className="ratings-section">
          <div className="team-ratings">
            <h4>Player Ratings</h4>
            {team1Stats.playerRatings.map((rating, index) => (
              <p key={index}>Player {index + 1}: {rating}</p>
            ))}
          </div>
          <div className="team-ratings">
            <h4>Player Ratings</h4>
            {team2Stats.playerRatings.map((rating, index) => (
              <p key={index}>Player {index + 1}: {rating}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
