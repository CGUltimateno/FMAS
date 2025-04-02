import React from "react";
import { useGetMatchesByStatusQuery } from "../../services/footballApi";
import "../../styles/Dashboard/Hero.scss";

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
  const { data, isLoading, error } = useGetMatchesByStatusQuery("LIVE");
  if (isLoading) return null;
  if (error) {
    console.error("Error fetching live match:", error);
    return null;
  }

  const liveMatches = data?.matches || [];
  if (liveMatches.length === 0) {
    return null;
  }

  const topMatch = liveMatches[0];

  // Basic info from the match
  const homeTeamName = topMatch.homeTeam.name;
  const awayTeamName = topMatch.awayTeam.name;
  const homeTeamLogo = topMatch.homeTeam.crest;
  const awayTeamLogo = topMatch.awayTeam.crest;

  const homeScore = topMatch.score?.fullTime?.home ?? 0;
  const awayScore = topMatch.score?.fullTime?.away ?? 0;

  const liveTime = "45:00"; // Example placeholder

  const stats = {
    shotsOnTargetA: 0,
    shotsOnTargetB: 0,
    shotsA: 0,
    shotsB: 0,
    foulsA: 0,
    foulsB: 0,
  };

  return (
      <div className="featured-match-container">
        <div className="featured-match-card">
          {/* Header */}
          <div className="featured-match-header">
            <div className="header-content">
              <div className="header-title">
                <h2>Live Match</h2>
                <span className="live-time">{liveTime}</span>
              </div>
              <span className="live-badge">LIVE</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="match-content">
            <div className="teams-container">
              {/* Team A */}
              <div className="team">
                <div className="team-logo-container">
                  <img
                      src={homeTeamLogo}
                      alt={homeTeamName}
                      className="team-logo"
                  />
                </div>
              </div>

              {/* VS Section */}
              <div className="vs-section">
                <div className="hero-score-container">
                  <span className="score">{homeScore}</span>
                  <span className="divider">-</span>
                  <span className="score">{awayScore}</span>
                </div>
              </div>

              {/* Team B */}
              <div className="team">
                <div className="team-logo-container">
                  <img
                      src={awayTeamLogo}
                      alt={awayTeamName}
                      className="team-logo"
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <StatBar
                  label="Shots on Target"
                  teamAValue={stats.shotsOnTargetA}
                  teamBValue={stats.shotsOnTargetB}
              />
              <StatBar
                  label="Shots"
                  teamAValue={stats.shotsA}
                  teamBValue={stats.shotsB}
              />
              <StatBar
                  label="Fouls"
                  teamAValue={stats.foulsA}
                  teamBValue={stats.foulsB}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default Hero;