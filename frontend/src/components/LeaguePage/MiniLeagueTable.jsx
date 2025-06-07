import React from "react";
import { Link } from "react-router-dom";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import "../../styles/LeagueDetails/MiniLeagueTable.scss";

const MiniLeagueTable = ({ leagueId, selectedTeamId }) => {
    const currentSeason = new Date().getFullYear().toString(); // Use current year dynamically
    const { data, error, isLoading } = useGetLeagueStandingsQuery({ leagueId, season: currentSeason });
    console.log("MiniLeagueTable leagueId:", leagueId, "season:", currentSeason, "data:", data);
    if (isLoading) return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
    if (error) return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;
    if (!data || !data.response || data.response.length === 0) {
        return <p style={{ padding: "1rem" }}>No standings available.</p>;
    }
    const standings = data.response[0]?.league?.standings?.[0] || [];
    const leagueName = data.response[0]?.league?.name || "League Table";

    return (
        <div className="mini-league-table">
            <div className="league-header">
                <div className="league-header-left">
                    <img
                        src={data.response[0]?.league?.logo}
                        alt="League Logo"
                        className="league-logo"
                    />
                    <h2>{leagueName}</h2>
                </div>
            </div>

            <table className="standings-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Club</th>
                    <th>PL</th>
                    <th>GD</th>
                    <th>PTS</th>
                    <th>Form</th>
                </tr>
                </thead>
                <tbody>
                {standings.map((team) => {
                    const isHighlighted = String(team.team.id) === String(selectedTeamId);

                    return (
                        <tr
                            key={team.rank}
                            className={isHighlighted ? "highlighted-row" : ""}
                        >
                            <td>{team.rank}</td>
                            <td className="club-cell">
                                <div className="club-info">
                                    <img src={team.team.logo} alt={`${team.team.name} logo`} />
                                    <Link
                                        to={`/teams/${team.team.id}`}
                                        state={{ leagueId }}
                                        className="team-name-link"
                                    >
                                        {team.team.name}
                                    </Link>
                                </div>
                            </td>
                            <td>{team.all.played}</td>
                            <td>{team.goalsDiff}</td>
                            <td>{team.points}</td>
                            <td>
                                <div className="form-indicators">
                                    {team.form && team.form.split('').map((result, index) => {
                                        let formClass = '';
                                        if (result === 'W') formClass = 'win';
                                        else if (result === 'D') formClass = 'draw';
                                        else if (result === 'L') formClass = 'loss';

                                        return (
                                            <span
                                                key={index}
                                                className={`form-indicator ${formClass}`}
                                            >
                                                {result}
                                            </span>
                                        );
                                    })}
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default MiniLeagueTable;