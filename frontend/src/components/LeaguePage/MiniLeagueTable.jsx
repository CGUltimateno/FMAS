import React from "react";
import { Link } from "react-router-dom";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import "../../styles/LeagueDetails/MiniLeagueTable.scss";

const MiniLeagueTable = ({ leagueId }) => {
    const { data, error, isLoading } = useGetLeagueStandingsQuery(leagueId);

    if (isLoading) {
        return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
    }
    if (error) {
        return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;
    }

    const rawTable = data?.standings?.[0]?.table || [];
    const standingsData = rawTable.map((team) => ({
        position: team.position,
        name: team.team.name,
        logo: team.team.crest,
        playedGames: team.playedGames,
        won: team.won,
        draw: team.draw,
        lost: team.lost,
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
                    <th>Pl</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>Pts</th>
                    <th className="cl-bar-col"></th>
                </tr>
                </thead>
                <tbody>
                {standingsData.map((team) => {
                    const isChampionsLeague = team.position <= 4;
                    const isEuropaLeague = team.position >= 5 && team.position <= 6;

                    return (
                        <tr key={team.position}>
                            <td>{team.position}</td>
                            <td className="club-cell">
                                <div className="club-info">
                                    <img src={team.logo} alt={`${team.name} logo`} />
                                    <Link to={`/team/${team.id}`} className="team-name-link">
                                        <span>{team.name}</span>
                                    </Link>
                                </div>
                            </td>
                            <td>{team.playedGames}</td>
                            <td>{team.won}</td>
                            <td>{team.draw}</td>
                            <td>{team.lost}</td>
                            <td>{team.points}</td>
                            <td className="cl-bar-cell">
                                {isChampionsLeague && <div className="cl-bar champions" />}
                                {isEuropaLeague && <div className="cl-bar europa" />}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
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

export default MiniLeagueTable;