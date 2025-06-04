// frontend/src/pages/MatchDetails.jsx
import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useGetMatchDetailsQuery } from "../services/footballApi";
import "../styles/MatchStats/MatchDetails.scss";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaHistory } from "react-icons/fa";
import HeadToHead from "../components/MatchStats/HeadToHead";
import Stats from "../components/MatchStats/Stats";
import MatchTeamsForm from "../components/MatchStats/MatchTeamsForm.jsx";
import WinningGuess from "../components/MatchStats/WinningGuess";
import MatchEvents from "../components/MatchStats/MatchEvents";
import Lineup from "../components/MatchStats/Lineup";

const MatchDetails = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const leagueId = location.state?.leagueId;
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error } = useGetMatchDetailsQuery(matchId);
  console.log("Match Details Data:", data); // Debugging log
  if (isLoading) return (
      <div className="md-loading-container">
        <div className="md-loading-spinner"></div>
        <p>Loading match details...</p>
      </div>
  );

  if (error || !data?.response?.[0]) return (
      <div className="md-error">
        <h3>Unable to load match data</h3>
        <p>Please try again later</p>
      </div>
  );

  const match = data.response[0];
  const { fixture, league, teams, goals, score, events, statistics } = match;

  const statusShort = fixture?.status?.short || "NS";
  const matchDate = fixture?.date ? new Date(fixture.date) : null;

  const homeTeam = teams?.home || {};
  const awayTeam = teams?.away || {};

  const isNotStarted = statusShort === "NS";
  const isLive = ["1H", "HT", "2H", "ET", "BT", "P"].includes(statusShort);
  const isFinished = ["FT", "AET", "PEN"].includes(statusShort);

  // Format match time
  const formatMatchTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format match date
  const formatMatchDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
      <div className="md-container">
        <div className="md-page">
          {/* Header Section */}
          <div className="md-header">
            <div className="md-league-section">
              <div className="md-league-info">
                {league?.logo && (
                    <img src={league.logo} alt={league.name} className="md-league-logo" />
                )}
                <div className="md-league-details">
                  <h1 className="md-league-name">{league?.name || "Unknown League"}</h1>
                  <span className="md-match-round">{league?.round || ""}</span>
                </div>
              </div>
            </div>

            {/* Match Score Card */}
            <div className="md-scoreboard">
              <div className="md-match-status">
              <span className={`md-status-badge ${isLive ? "live" : ""}`}>
                {fixture?.status?.long || "Not Started"}
                {isLive && <span className="md-live-indicator"></span>}
              </span>
                {matchDate && <span className="md-match-time">{formatMatchTime(matchDate)}</span>}
              </div>

              <div className="md-teams-display">
                <div className="md-team md-home-team">
                  <img src={homeTeam.logo} alt={homeTeam.name} className="md-team-logo" />
                  <h2 className="md-team-name">{homeTeam.name}</h2>
                  {isFinished && <span className={`md-winner-badge ${homeTeam.winner ? "visible" : ""}`}>Winner</span>}
                </div>

                <div className="md-score-display">
                  {isNotStarted ? (
                      <div className="md-vs">VS</div>
                  ) : (
                      <div className="md-score">
                        <span className="md-score-number">{goals?.home ?? 0}</span>
                        <span className="md-score-divider">:</span>
                        <span className="md-score-number">{goals?.away ?? 0}</span>
                      </div>
                  )}
                  {score?.halftime?.home !== null && score?.halftime?.away !== null && (
                      <div className="md-halftime">
                        HT: {score.halftime.home} - {score.halftime.away}
                      </div>
                  )}
                </div>

                <div className="md-team md-away-team">
                  <img src={awayTeam.logo} alt={awayTeam.name} className="md-team-logo" />
                  <h2 className="md-team-name">{awayTeam.name}</h2>
                  {isFinished && <span className={`md-winner-badge ${awayTeam.winner ? "visible" : ""}`}>Winner</span>}
                </div>
              </div>

              <div className="md-match-meta">
                {matchDate && (
                    <div className="md-meta-item">
                      <FaCalendarAlt className="md-meta-icon" />
                      <span>{formatMatchDate(matchDate)}</span>
                    </div>
                )}
                {fixture?.venue?.name && (
                    <div className="md-meta-item">
                      <FaMapMarkerAlt className="md-meta-icon" />
                      <span>{fixture.venue.name}, {fixture.venue.city || ""}</span>
                    </div>
                )}
                {fixture?.referee && (
                    <div className="md-meta-item">
                      <FaUserAlt className="md-meta-icon" />
                      <span>Referee: {fixture.referee}</span>
                    </div>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="md-tabs-container">
              <div className="md-tabs">
                <button
                    className={`md-tab ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                    className={`md-tab ${activeTab === "stats" ? "active" : ""}`}
                    onClick={() => setActiveTab("stats")}
                >
                  Statistics
                </button>
                <button
                    className={`md-tab ${activeTab === "lineup" ? "active" : ""}`}
                    onClick={() => setActiveTab("lineup")}
                >
                  Lineups
                </button>
                <button
                    className={`md-tab ${activeTab === "h2h" ? "active" : ""}`}
                    onClick={() => setActiveTab("h2h")}
                >
                  H2H
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="md-content">
            {activeTab === "overview" && (
                <div className="md-overview">
                  <div className="md-main-column">
                    {/* Events Timeline */}
                    {(isLive || isFinished) && (
                        <div className="md-section md-events-section">
                          <h3 className="md-section-title">
                            <FaHistory className="md-section-icon" />
                            Match Timeline
                          </h3>
                          <MatchEvents matchId={matchId} teams={teams} />
                        </div>
                    )}

                    {/* Team Form */}
                    <div className="md-section">
                      <MatchTeamsForm
                          teamAId={homeTeam.id}
                          teamBId={awayTeam.id}
                          leagueId={leagueId || league.id}
                      />
                    </div>
                  </div>

                  <div className="md-side-column">
                    <WinningGuess matchId={matchId} />

                    {(isLive || isFinished) && statistics && statistics.length > 0 && (
                        <div className="md-section md-quick-stats">
                          <h3 className="md-section-title">Key Statistics</h3>
                          <Stats matchId={matchId} statistics={statistics} />
                        </div>
                    )}
                  </div>
                </div>
            )}

            {activeTab === "stats" && (
                <div className="md-stats-tab">
                  <Stats matchId={matchId} statistics={statistics} detailed={true} />
                </div>
            )}

            {activeTab === "lineup" && (
                <div className="md-lineup-tab">
                  <Lineup matchId={matchId} />
                </div>
            )}

            {activeTab === "h2h" && (
                <div className="md-h2h-tab">
                  <HeadToHead team1Id={homeTeam.id} team2Id={awayTeam.id} />
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default MatchDetails;