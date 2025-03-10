import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Standings.scss";
import { Trophy, ArrowRight } from "lucide-react";

const Standings = () => {
  const [standingsData, setStandingsData] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState({});
  const API_KEY = "YOUR_API_KEY"; // Replace with your real token

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const standingsRes = await axios.get("/api/v4/competitions/PL/standings", {
          headers: { "X-Auth-Token": API_KEY },
        });

        const rawTable = standingsRes.data.standings[0].table;
        const competition = standingsRes.data.competition;
        const area = standingsRes.data.area;

        const standings = rawTable.map((teamEntry) => ({
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

        setStandingsData(standings);
        setLeagueInfo({ emblem: competition.emblem, flag: area.flag });
      } catch (error) {
        console.error("Error fetching standings:", error);
      }
    };

    fetchStandings();
  }, []);

  return (
      <div className="standings-wrapper">
        <div className="standings-header">
          <div className="title-league-section">
            <div className="title-section">
              <Trophy size={20} />
              <h2>Standings</h2>
            </div>
            <div className="league-section">
              <img
                  src={leagueInfo.flag}
                  alt="England Flag"
                  className="league-flag"
              />
              <img
                  src={leagueInfo.emblem}
                  alt="Premier League Emblem"
                  className="league-emblem"
              />
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