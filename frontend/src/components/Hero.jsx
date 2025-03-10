import React from "react";
import "../styles/Hero.scss";

// Example match data
const featuredMatchData = {
  teamA: {
    name: "Mexico",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/220px-Liverpool_FC.svg.png",
    score: 2,
  },
  teamB: {
    name: "Sweden",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/220px-Manchester_United_FC_crest.svg.png",
    score: 2,
  },
  liveTime: "62:24",
  stats: {
    shotsOnTargetA: 7,
    shotsOnTargetB: 3,
    shotsA: 12,
    shotsB: 7,
    foulsA: 7,
    foulsB: 3,
  },
};

const getBarWidths = (a, b) => {
  const total = a + b;
  if (total === 0) return [50, 50];
  const percentA = (a / total) * 100;
  const percentB = (b / total) * 100;
  return [percentA, percentB];
};

const StatBar = ({ label, teamAValue, teamBValue }) => {
  const [widthA, widthB] = getBarWidths(teamAValue, teamBValue);

  return (
      <div className="stat-item">
        <div className="stat-label">{label}</div>

        <div className="stat-bars">
          <div className="bar bar-teamA" style={{ width: `${widthA}%` }} />
          <div className="bar bar-teamB" style={{ width: `${widthB}%` }} />
        </div>

        <div className="stat-value">
          {teamAValue} : {teamBValue}
        </div>
      </div>
  );
};

const Hero = () => {
  return (
      <div className="featured-match-container">
        <div className="featured-match-card">
          <div className="featured-match-header">
            <div className="header-content">
              <div className="header-title">
                <h2>Live Match</h2>
                <span className="live-time">{featuredMatchData.liveTime}</span>
              </div>
              <span className="live-badge">LIVE</span>
            </div>
          </div>
          <div className="match-content">
            <div className="teams-container">
              {/* Team A */}
              <div className="team">
                <div className="team-logo-container">
                  <img
                      src={featuredMatchData.teamA.logo}
                      alt={featuredMatchData.teamA.name}
                      className="team-logo"
                  />
                </div>
              </div>
              {/* VS Section */}
              <div className="vs-section">
                <div className="score-container">
                  <span className="score">{featuredMatchData.teamA.score}</span>
                  <span className="divider">-</span>
                  <span className="score">{featuredMatchData.teamB.score}</span>
                </div>
              </div>
              {/* Team B */}
              <div className="team">
                <div className="team-logo-container">
                  <img
                      src={featuredMatchData.teamB.logo}
                      alt={featuredMatchData.teamB.name}
                      className="team-logo"
                  />
                </div>
              </div>
            </div>
            {/* Stats with bars */}
            <div className="stats-grid">
              <StatBar
                  label="Shots on Target"
                  teamAValue={featuredMatchData.stats.shotsOnTargetA}
                  teamBValue={featuredMatchData.stats.shotsOnTargetB}
              />
              <StatBar
                  label="Shots"
                  teamAValue={featuredMatchData.stats.shotsA}
                  teamBValue={featuredMatchData.stats.shotsB}
              />
              <StatBar
                  label="Fouls"
                  teamAValue={featuredMatchData.stats.foulsA}
                  teamBValue={featuredMatchData.stats.foulsB}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default Hero;
