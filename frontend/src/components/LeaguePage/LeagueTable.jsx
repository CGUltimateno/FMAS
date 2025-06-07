import React, { useEffect } from "react";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import { Link } from "react-router-dom";
import "../../styles/LeagueDetails/LeagueTable.scss";

const LeagueTable = ({ leagueId, leagueName, season, showTitle = true, standings: initialStandings }) => {
    const effectiveLeagueId = leagueId || '39';
    const effectiveSeason = season || new Date().getFullYear().toString();

    const { data, error, isLoading, isFetching } = !initialStandings && effectiveLeagueId ?
        useGetLeagueStandingsQuery({ leagueId: effectiveLeagueId, season: effectiveSeason }, {
            refetchOnMountOrArgChange: true,
            skip: !effectiveLeagueId
        }) :
        { data: null, error: null, isLoading: false, isFetching: false };


    if (isLoading || isFetching) {
        return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
    }

    let leagueInfo;
    let standingsData = [];

    if (initialStandings) {
        standingsData = Array.isArray(initialStandings) && initialStandings.length > 0 ?
            (Array.isArray(initialStandings[0]) ? initialStandings[0] : initialStandings) :
            [];
        leagueInfo = {
            name: leagueName || "Standings",
            emblem: null,
            flag: null,
            country: null
        };
    } else if (data?.response?.[0]?.league) {
        const responseLeague = data.response[0].league;
        standingsData = responseLeague?.standings?.[0] || [];
        leagueInfo = {
            name: responseLeague?.name || "Standings",
            emblem: responseLeague?.logo,
            flag: responseLeague?.flag,
            country: responseLeague?.country
        };
    } else {
        leagueInfo = {
            name: leagueName || "League Details Unavailable",
            emblem: null,
            flag: null,
            country: null
        };
    }

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
                                <Link to={`/leagues/${effectiveLeagueId}`}>{leagueInfo.name}</Link>
                            </h2>
                        </div>
                        <div className="league-section">
                            {leagueInfo?.flag && (
                                <img src={leagueInfo.flag} alt={leagueInfo.country || 'Country flag'} className="league-flag" />
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
                            const played = team.all?.played ?? '-';
                            const win = team.all?.win ?? '-';
                            const draw = team.all?.draw ?? '-';
                            const lose = team.all?.lose ?? '-';
                            const goalsFor = team.all?.goals?.for ?? '-';
                            const goalsAgainst = team.all?.goals?.against ?? '-';
                            const goalsDiff = team.goalsDiff ?? '-';
                            const points = team.points ?? '-';

                            // Use description field for status text as it's more meaningful than status
                            const statusText = team.description || '-';
                            const statusClass = (team.description || '').toLowerCase().replace(/\s+/g, '-').replace(/[():]/g, '');

                            return (
                                <tr key={team.team.id || team.rank} className={statusClass}>
                                    <td>{team.rank ?? '-'}</td>
                                    <td className="club-cell">
                                        <div className="club-info">
                                            {team.team.logo && <img src={team.team.logo} alt={team.team.name} />}
                                            <Link to={`/teams/${team.team.id}`} className="team-name-link">
                                                <span>{team.team.name ?? 'N/A'}</span>
                                            </Link>
                                        </div>
                                    </td>
                                    <td>{played}</td>
                                    <td>{win}</td>
                                    <td>{draw}</td>
                                    <td>{lose}</td>
                                    <td>{goalsFor}</td>
                                    <td>{goalsAgainst}</td>
                                    <td>{goalsDiff}</td>
                                    <td>{points}</td>
                                    <td>
                                        <div className="form-indicators">
                                            {formArray.length > 0 ? formArray.map((result, index) => {
                                                let formClass = '';
                                                if (result === 'W') formClass = 'win';
                                                else if (result === 'D') formClass = 'draw';
                                                else if (result === 'L') formClass = 'loss';

                                                return (
                                                    <span key={index} className={`form-indicator ${formClass}`}>
                                                        {result}
                                                    </span>
                                                );
                                            }) : <span>-</span>}
                                        </div>
                                    </td>
                                    <td className={`status-col ${statusClass}`}>
                                        {statusText}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                ) : (
                    <p>No standings data available for {leagueInfo.name}.</p>
                )}
            </div>
        </div>
    );
}

export default LeagueTable;