import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import "../../styles/LeagueDetails/MiniLeagueTable.scss";

const MiniLeagueTable = ({ leagueId, selectedTeamId }) => {
    const { data, error, isLoading } = useGetLeagueStandingsQuery(leagueId);
    const [teamForms, setTeamForms] = useState({});

    useEffect(() => {
        if (data?.standings?.[0]?.table) {
            const fetchForms = async () => {
                const forms = {};
                for (const team of data.standings[0].table) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/teams/${team.team.id}/form/${leagueId}`);
                        const matchData = await response.json();

                        const formResults = matchData.map(match => {
                            // Flip the flag since it appears to be inverted
                            const isHome = match.isRequestedTeamHome;
                            const isAway = !isHome;

                            const homeScore = Number(match.home.score);
                            const awayScore = Number(match.away.score);

                            const teamScore = isHome ? homeScore : awayScore;
                            const opponentScore = isHome ? awayScore : homeScore;

                            if (teamScore > opponentScore) {
                                return "W";
                            } else if (teamScore < opponentScore) {
                                return "L";
                            } else {
                                return "D";
                            }
                        });
                        forms[team.team.id] = formResults.slice(0, 5);
                    } catch (error) {
                        console.error(`Error fetching form for team ${team.team.id}:`, error);
                        forms[team.team.id] = [];
                    }
                }
                setTeamForms(forms);
            };
            fetchForms();
        }
    }, [data, leagueId]);

    if (isLoading) return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
    if (error) return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;

    const rawTable = data?.standings?.[0]?.table || [];
    const standingsData = rawTable.map((team) => ({
        position: team.position,
        name: team.team.name,
        logo: team.team.crest,
        playedGames: team.playedGames,
        goalDifference: team.goalDifference,
        points: team.points,
        id: team.team.id,
    }));


    return (
        <div className="mini-league-table">
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
                {standingsData.map((team) => {
                    const form = teamForms[team.id] || [];
                    return (
                        <tr
                            key={team.position}
                            className={String(team.id) === String(selectedTeamId) ? "highlighted-row" : ""}
                        >
                            <td>{team.position}</td>
                            <td className="club-cell">
                                <div className="club-info">
                                    <img src={team.logo} alt={`${team.name} logo`} />
                                    <Link
                                        to={`/teams/${team.id}`}
                                        state={{ leagueId }}
                                        className="team-name-link"
                                    >
                                        {team.name}
                                    </Link>
                                </div>
                            </td>
                            <td>{team.playedGames}</td>
                            <td>{team.goalDifference}</td>
                            <td>{team.points}</td>
                            <td>
                                <div className="form-indicators">
                                    {form.map((result, index) => (
                                        <span
                                            key={index}
                                            className={`form-indicator ${
                                                result === "W" ? "win" : result === "D" ? "draw" : "loss"
                                            }`}
                                        >
                                        {result}
                                    </span>
                                    ))}
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