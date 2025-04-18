import React from "react";
import "../../styles/Dashboard/Standings.scss";
import { Trophy, ArrowRight } from "lucide-react";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import { useNavigate } from "react-router-dom";
import LeagueTable from "../LeaguePage/LeagueTable";

const Standings = () => {
  const { data, error, isLoading } = useGetLeagueStandingsQuery("PL");
  const navigate = useNavigate();

  if (isLoading) {
    return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
  }
  if (error) {
    return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;
  }

  const rawTable = data?.standings?.[0]?.table || [];
  const competition = data?.competition;
  const area = data?.area;
  const standingsData = rawTable.map((teamEntry) => ({
    id: teamEntry.team.id,
    name: teamEntry.team.name,
    logo: teamEntry.team.crest,
    wins: teamEntry.won,
    draws: teamEntry.draw,
    losses: teamEntry.lost,
    pts: teamEntry.points,
    idx: teamEntry.position,
    playedGames: teamEntry.playedGames,
    goalsFor: teamEntry.goalsFor,
    goalsAgainst: teamEntry.goalsAgainst,
    goalDifference: teamEntry.goalDifference,
  })).slice(0, 5);

  const leagueInfo = {
    emblem: competition?.emblem,
    flag: area?.flag,
  };

  return (
      <div className="standings-wrapper">
        <div className="standings-header">
          <div className="title-league-section">
            <div className="title-section">
              <Trophy size={20} />
              <h2>Standings</h2>
            </div>
          </div>
          <button onClick={() => navigate("/leagues")} className="view-all-btn">
            View All <ArrowRight size={18} />
          </button>
        </div>

        <div className="standings-table-wrapper">
          <LeagueTable leagueId="2021" leagueName={competition.name} showTitle={true} />
        </div>
      </div>
  );
};

export default Standings;