import React from "react";
import "../../styles/Standings.scss";
import { Trophy, ArrowRight } from "lucide-react";
// Import the RTK Query hook
import { useGetPLStandingsQuery } from "../../services/footballApi";

const Standings = () => {
  // Call the auto-generated hook
  const { data, error, isLoading } = useGetPLStandingsQuery();

  if (isLoading) {
    return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
  }
  if (error) {
    return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;
  }

  // If successful, "data" has the entire JSON from /competitions/PL/standings
  const rawTable = data?.standings?.[0]?.table || [];
  const competition = data?.competition;
  const area = data?.area;

  // Transform each team object
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
  }));

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
            <div className="league-section">
              {leagueInfo.flag && (
                  <img
                      src={leagueInfo.flag}
                      alt="Country Flag"
                      className="league-flag"
                  />
              )}
              {leagueInfo.emblem && (
                  <img
                      src={leagueInfo.emblem}
                      alt="League Emblem"
                      className="league-emblem"
                  />
              )}
            </div>
          </div>
          <button className="view-all-btn">
            View All <ArrowRight size={18} />
          </button>
        </div>

        <div className="standings-table-wrapper">
          <table className="standings-table">
            <thead>
            <tr>
              <th>#</th>
              <th className="club-col">Club</th>
              <th>Played</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
              <th className="cl-bar-col"></th>
            </tr>
            </thead>
            <tbody>
            {standingsData.map((team) => {
              const isChampionsLeague = team.idx <= 4;
              const isEuropaLeague = team.idx >= 5 && team.idx <= 6;

              return (
                  <tr key={team.id}>
                    <td>{team.idx}</td>
                    <td className="club-cell">
                      <div className="club-info">
                        <img src={team.logo} alt={`${team.name} logo`} />
                        <span>{team.name}</span>
                      </div>
                    </td>
                    <td>{team.playedGames}</td>
                    <td>{team.wins}</td>
                    <td>{team.draws}</td>
                    <td>{team.losses}</td>
                    <td>{team.goalsFor}</td>
                    <td>{team.goalsAgainst}</td>
                    <td>{team.goalDifference}</td>
                    <td>{team.pts}</td>
                    <td className="cl-bar-cell">
                      {isChampionsLeague && <div className="cl-bar champions" />}
                      {isEuropaLeague && <div className="cl-bar europa" />}
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot champions"></span>
            Champions League
          </div>
          <div className="legend-item">
            <span className="legend-dot europa"></span>
            Europa League
          </div>
        </div>
      </div>
  );
};

export default Standings;
