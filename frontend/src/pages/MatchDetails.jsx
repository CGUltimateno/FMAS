import React, {useState} from "react";
import { useParams } from "react-router-dom";
import { useGetMatchDetailsQuery } from "../services/footballApi";
import "../styles/LeagueDetails/MatchDetails.scss";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import Formation from "../components/MatchStats/Lineup";
import HeadToHead from "../components/MatchStats/HeadToHead";
import PerformanceGraphs from "../components/MatchStats/PerformanceGraphs";
import Stats from "../components/MatchStats/Stats";
import TeamForm from "../components/MatchStats/TeamForm";
import WinningGuess from "../components/MatchStats/WinningGuess";
import MatchEvents from "../components/MatchStats/MatchEvents";

const MatchDetails = () => {
  const { matchId } = useParams();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { data: matchData, isLoading, error } = useGetMatchDetailsQuery(matchId);
    const [activeTab, setActiveTab] = useState("overview");
  const useStaticData = true
  const match = useStaticData
    ? {
        homeTeam: {
          name: "Paris Saint-Germain FC",
          id: 524,
          logo:
            "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png",
        },
        awayTeam: {
          name: "Arsenal FC",
          id: 57,
          logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
        },
        score: {
          fullTime: { home: 2, away: 1 },
        },
        utcDate: "2025-05-07T20:00:00Z",
        venue: "Parc des Princes",
        status: "FINISHED",
        competition: {
          id: 2001,
          name: "UEFA Champions League",
          emblem:
             "https://upload.wikimedia.org/wikipedia/commons/7/77/UEFA_Champions_League_Logo_2021.svg",
        },
      }
    : matchData;

  if (isLoading) return <div className="loading-container">Loading match details...</div>;

  const homeTeamId = match.homeTeam?.id;
  const awayTeamId = match.awayTeam?.id;
  const leagueId = match.competition?.id || null;
  const matchDate = new Date(match.utcDate);

  return (
      <div className="match-details-container">
          <div className="match-details-page">
              <div className="match-header">
                  <div className={`competition-section ${isDarkMode ? 'dark' : ''}`}>
                      <div className="competition-info">
                          <img
                              src={match.competition?.emblem}
                              alt={`${match.competition?.name} Logo`}
                              className="competition-emblem"
                          />
                          <div className="competition-meta">
                              <h1 className="competition-name">{match.competition?.name}</h1>
                              <div className="match-status">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                       fill="currentColor">
                                      <circle cx="12" cy="12" r="10"/>
                                  </svg>
                                  {match.status === "FINISHED" ? "Finished" : "In Progress"}
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className={`match-card-section ${isDarkMode ? 'dark' : ''}`}>
                      <div className="match-card">
                          <div className="teams-aligned-row">
                              <div className="team-col left">
                                  <img
                                      src={match.homeTeam?.logo}
                                      alt={match.homeTeam?.name}
                                      className="team-logo"
                                  />
                                  <span className="team-name">{match.homeTeam?.name}</span>
                              </div>
                              <div className="score-col center">
          <span className="score">
            {match.score?.fullTime?.home ?? "-"}:{match.score?.fullTime?.away ?? "-"}
          </span>
                              </div>
                              <div className="team-col right">
                                  <img
                                      src={match.awayTeam?.logo}
                                      alt={match.awayTeam?.name}
                                      className="team-logo"
                                  />
                                  <span className="team-name">{match.awayTeam?.name}</span>
                              </div>
                          </div>

                          <div className="match-meta">
                              <div className="meta-item">
                                  <FaCalendarAlt className="meta-icon"/>
                                  <span>{matchDate.toLocaleDateString('en-GB')}, {matchDate.toLocaleTimeString("en-GB", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                  })}</span>
                              </div>
                              <div className="meta-item">
                                  <FaMapMarkerAlt className="meta-icon"/>
                                  <span>{match.venue}</span>
                              </div>
                              <div className="meta-item">
                                  <span>Referee: Michael Oliver</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className={`team-tabs-section ${isDarkMode ? 'dark' : ''}`}>
                      <div className={`team-tabs ${isDarkMode ? 'dark' : ''}`}>
                          {["Overview", "H2H"].map((tab) => (
                              <button
                                  key={tab}
                                  className={`tab-btn ${activeTab === tab.toLowerCase() ? "active" : ""} ${isDarkMode ? 'dark' : ''}`}
                                  onClick={() => setActiveTab(tab.toLowerCase())}
                              >
                                  {tab}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="match-content">
                  {activeTab === "overview" && (
                      <div className="overview-content">
                          <div className="left-section">
                              <Stats matchId={matchId}/>
                              <TeamForm teamAId={homeTeamId} teamBId={awayTeamId} leagueId={leagueId}/>
                          </div>
                          <div className="right-section">
                              <WinningGuess matchId={matchId}/>
                          </div>
                      </div>
                  )}
                  {activeTab === "lineups" && <Formation matchId={matchId}/>}
                  {activeTab === "stats" && <Stats matchId={matchId}/>}
                  {activeTab === "h2h" && <HeadToHead team1Id={homeTeamId} team2Id={awayTeamId}/>}
              </div>
          </div>

          <div className="left-section">
              <MatchEvents/>
              <HeadToHead team1Id={homeTeamId} team2Id={awayTeamId}/>
              <Formation matchId={matchId}/>
              {/* <PerformanceGraphs matchId={matchId} /> */}
              <Stats matchId={matchId}/>
              <TeamForm teamAId={homeTeamId} teamBId={awayTeamId} leagueId={leagueId}/>
          </div>
          <div className="right-section">
              <WinningGuess matchId={matchId}/>
          </div>
      </div>
  );
};

export default MatchDetails;
