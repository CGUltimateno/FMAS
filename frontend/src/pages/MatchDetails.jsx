import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetMatchDetailsQuery } from "../services/footballApi";
import "../styles/MatchStats/MatchDetails.scss";
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Formation from "../components/MatchStats/Lineup";
import HeadToHead from "../components/MatchStats/HeadToHead";
import Lineup from "../components/MatchStats/Lineup";
import PerformanceGraphs from "../components/MatchStats/PerformanceGraphs";
import Stats from "../components/MatchStats/Stats";
import TeamForm from "../components/MatchStats/TeamForm";
import WinningGuess from "../components/MatchStats/WinningGuess";

const MatchDetails = () => {
  const { matchId } = useParams();
  const { data: matchData, isLoading, error } = useGetMatchDetailsQuery(matchId);

  // For testing without API, use static data
  const useStaticData = !matchData || error;
  const match = useStaticData ? {
    homeTeam: { name: "Manchester United", id: 66, logo: "https://resources.premierleague.com/premierleague/badges/t1.svg" },
    awayTeam: { name: "Liverpool", id: 64, logo: "https://resources.premierleague.com/premierleague/badges/t14.svg" },
    score: { fullTime: { home: 2, away: 1 } },
    utcDate: new Date().toISOString(),
    venue: "Old Trafford",
    status: "FINISHED",
    competition: { id: 2021, name: "Premier League", emblem: "https://crests.football-data.org/PL.png" }
  } : matchData;

  if (isLoading) {
    return <div className="loading-container">Loading match details...</div>;
  }

  const homeTeamId = match.homeTeam?.id;
  const awayTeamId = match.awayTeam?.id;
  const leagueId = match.competition?.id || null;
  const matchDate = new Date(match.utcDate);

  return (
      <div className="match-details-container">
        <div className="match-details-header">
          <div className="match-card">
            {/* Top bar */}
            <div className="match-status-bar aligned-bar">
              <div className="bar-col left">
                <FaCalendarAlt className="bar-icon"/>
                <span>2024-06-30</span>
              </div>
              <div className="bar-col center">
                <FaMapMarkerAlt className="bar-icon"/>
                <span>Old Trafford</span>
              </div>
              <div className="bar-col right">
                <span>Referee: Michael Oliver</span>
              </div>
            </div>

            {/* Main display */}
            <div className="teams-aligned-row">
              <div className="team-col left">
                <img src={match.homeTeam?.logo} alt={match.homeTeam?.name} className="team-logo"/>
                <span className="team-name">{match.homeTeam?.name}</span>
              </div>
              <div className="score-col center">
                <span className="score">{match.score?.fullTime?.home ?? "-"}</span>
                <span className="separator">:</span>
                <span className="score">{match.score?.fullTime?.away ?? "-"}</span>
                <div className="match-time">{matchDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
              <div className="team-col right">
                <img src={match.awayTeam?.logo} alt={match.awayTeam?.name} className="team-logo"/>
                <span className="team-name">{match.awayTeam?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add associated components here */}
        <div className="match-details-content">
          {/*<HeadToHead team1Id={homeTeamId} team2Id={awayTeamId} />*/}
          {/*<Formation matchId={matchId} />*/}
          {/* <PerformanceGraphs matchId={matchId} />
        <Stats matchId={matchId} />
        <TeamForm teamAId={homeTeamId} teamBId={awayTeamId} leagueId={leagueId} />
        <WinningGuess matchId={matchId} /> */}
        </div>
      </div>
  );
};

export default MatchDetails;