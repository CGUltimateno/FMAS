import React, { useEffect, useState } from "react";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import { Link } from "react-router-dom";
import "../../styles/LeagueDetails/LeagueTable.scss";

const LeagueTable = ({ leagueId, leagueName, showTitle = true }) => {
    const { data, error, isLoading } = useGetLeagueStandingsQuery(leagueId);
    const [teamForms, setTeamForms] = useState({});

    useEffect(() => {
        if (data?.standings?.[0]?.table) {
            const fetchForms = async () => {
                const forms = {};
                for (const team of data.standings[0].table) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/teams/${team.team.id}/form/${leagueId}`);

                        if (!response.ok) {
                            console.error(`Server error for team ${team.team.id}: ${response.status}`);
                            forms[team.team.id] = [];
                            continue;
                        }

                        const matchData = await response.json();

                        // Check if matchData is an array before mapping
                        if (!Array.isArray(matchData)) {
                            console.error(`Expected array but got:`, matchData);
                            forms[team.team.id] = [];
                            continue;
                        }

                        const formResults = matchData.map(match => {
                            const isHome = match.isRequestedTeamHome;
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

    if (isLoading) {
        return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
    }
    if (error) {
        return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;
    }

    const rawTable = data?.standings?.[0]?.table || [];
    const competition = data?.competition;
    const area = data?.area;
    const standingsData = rawTable.map((team) => ({
        position: team.position,
        id: team.team.id,
        team: team.team,
        name: team.team.name,
        logo: team.team.crest,
        playedGames: team.playedGames,
        won: team.won,
        draw: team.draw,
        lost: team.lost,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
        points: team.points,
    }));

    return (
        <div className="league-table">
            {showTitle && (
                <div className="league-table-header">
                    <div className="title-league-section">
                        <div className="title-section">
                            <h2>
                                <Link to={`/leagues/${competition.id}`}>{leagueName}</Link>
                            </h2>
                        </div>
                        <div className="league-section">
                            {area?.flag && (
                                <img src={area.flag} alt={area.name} className="league-flag" />
                            )}
                            {competition && competition.emblem && (
                                <img src={competition.emblem} alt={competition.name} className="league-emblem" />
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="league-table-content">
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
                        <th>Form</th>
                    </tr>
                    </thead>
                    <tbody>
                    {standingsData.map((team) => {
                        const form = teamForms[team.id] || [];
                        return (
                            <tr key={team.position}>
                                <td>{team.position}</td>
                                <td className="club-cell">
                                    <div className="club-info">
                                        <img src={team.logo} alt={`${team.name} logo`} />
                                        <Link
                                            to={`/teams/${team.id}`}
                                            state={{ leagueId }}
                                            className="team-name-link"
                                        >
                                            <span>{team.name}</span>
                                        </Link>
                                    </div>
                                </td>
                                <td>{team.playedGames}</td>
                                <td>{team.won}</td>
                                <td>{team.draw}</td>
                                <td>{team.lost}</td>
                                <td>{team.goalsFor}</td>
                                <td>{team.goalsAgainst}</td>
                                <td>{team.goalDifference}</td>
                                <td>{team.points}</td>
                                <td>
                                    <div className="form-indicators">
                                        {form.map((result, index) => (
                                            <span
                                                key={index}
                                                className={`form-indicator ${
                                                    result === "W"
                                                        ? "win"
                                                        : result === "D"
                                                            ? "draw"
                                                            : "loss"
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
        </div>
    );
};

export default LeagueTable;