import React, { useEffect } from "react";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import { Link } from "react-router-dom";
import "../../styles/LeagueDetails/LeagueTable.scss";

const LeagueTable = ({ leagueId, leagueName, showTitle = true, standings }) => {
    // Use '39' (Premier League) as the default when leagueId is not provided
    const effectiveLeagueId = leagueId || '39';

    const { data, error, isLoading, isFetching } = !standings ?
        useGetLeagueStandingsQuery(effectiveLeagueId, {
            refetchOnMountOrArgChange: true
        }) :
        { data: null, error: null, isLoading: false, isFetching: false };

    useEffect(() => {
        console.log("LeagueTable API request:", {
            effectiveLeagueId,
            data,
            error,
            isLoading,
            isFetching
        });
    }, [effectiveLeagueId, data, error, isLoading, isFetching]);

    if (isLoading || isFetching) {
        return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
    }

    // Use predefined standings data if provided, otherwise try to get it from API response
    let leagueInfo;
    let standingsData = [];

    if (standings) {
        standingsData = Array.isArray(standings) && standings.length > 0 ?
            (Array.isArray(standings[0]) ? standings[0] : standings) :
            [];

        leagueInfo = {
            name: leagueName || "Standings",
            emblem: null,
            flag: null,
            country: null
        };
    } else if (data?.response?.[0]?.league) {
        const responseData = data.response[0].league;
        standingsData = responseData?.standings?.[0] || [];
        leagueInfo = {
            name: responseData?.name || "Standings",
            emblem: responseData?.logo,
            flag: responseData?.flag,
            country: responseData?.country
        };
    } else {
        // Fallback when API doesn't return data
        leagueInfo = {
            name: leagueName || "Premier League",
            emblem: null,
            flag: null,
            country: "England"
        };
    }

    // Ensure standingsData is always an array
    if (!Array.isArray(standingsData)) {
        standingsData = [];
    }

    return (
        <div className="league-table">
            {showTitle && (
                <div className="league-table-header">
                    <div className="title-league-section">
                        <div className="title-section">
                            <h2>
                                <Link to={`/leagues/${effectiveLeagueId}`}>{leagueName || leagueInfo.name}</Link>
                            </h2>
                        </div>
                        <div className="league-section">
                            {leagueInfo?.flag && (
                                <img src={leagueInfo.flag} alt={leagueInfo.country} className="league-flag" />
                            )}
                            {leagueInfo?.emblem && (
                                <img src={leagueInfo.emblem} alt={leagueInfo.name} className="league-emblem" />
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="league-table-content">
                {standingsData.length > 0 ? (
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
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {standingsData.map((team) => {
                            if (!team || !team.team) {
                                return null;
                            }

                            const formArray = team.form ? team.form.split('') : [];

                            return (
                                <tr key={team.rank || Math.random()}>
                                    <td>{team.rank || "-"}</td>
                                    <td className="club-cell">
                                        <div className="club-info">
                                            {team.team.logo && (
                                                <img src={team.team.logo} alt={`${team.team.name || 'Team'} logo`} />
                                            )}
                                            <Link
                                                to={`/teams/${team.team.id}`}
                                                state={{ leagueId: effectiveLeagueId }}
                                                className="team-name-link"
                                            >
                                                <span>{team.team.name || "Unknown Team"}</span>
                                            </Link>
                                        </div>
                                    </td>
                                    <td>{team.all?.played || "-"}</td>
                                    <td>{team.all?.win || "-"}</td>
                                    <td>{team.all?.draw || "-"}</td>
                                    <td>{team.all?.lose || "-"}</td>
                                    <td>{team.all?.goals?.for || "-"}</td>
                                    <td>{team.all?.goals?.against || "-"}</td>
                                    <td>{team.goalsDiff || "-"}</td>
                                    <td>{team.points || "-"}</td>
                                    <td>
                                        <div className="form-indicators">
                                            {formArray.map((result, index) => (
                                                <span
                                                    key={index}
                                                    className={`form-indicator ${
                                                        result === "W" ? "win" :
                                                            result === "D" ? "draw" : "loss"
                                                    }`}
                                                >
                                                    {result}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="team-status">{team.description || "-"}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-standings">
                        <p>No standings data available.</p>
                        {error && <p className="error-message">Error: {error.toString()}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeagueTable;