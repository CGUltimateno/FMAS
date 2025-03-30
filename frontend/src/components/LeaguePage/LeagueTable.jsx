import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import "../../styles/LeagueTable.scss";
const LeagueTable = ({ leagueId, leagueName }) => {
    const { data, error, isLoading } = useGetLeagueStandingsQuery(leagueId);

    if (isLoading) {
        return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
    }
    if (error) {
        return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;
    }

    const rawTable = data?.standings?.[0]?.table || [];
    const competition = data?.competition;

    console.log(rawTable)
    const area = data?.area;
    const standingsData = rawTable.map((team) => ({
        position: team.position,
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
            <div className="league-table-header">
                <div className="title-league-section">
                    <div className="title-section">
                        <h2>{leagueName}</h2>
                    </div>
                    <div className="league-section">
                        {area?.flag && (
                            <img src={area.flag} alt={area.name} className="league-flag"/>
                        )}
                        {competition && competition.emblem && (
                            <img src={competition.emblem} alt={competition.name} className="league-emblem"/>
                        )}
                    </div>
                </div>
            </div>
            <div className="league-table-content">
                <table className="standings-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th className="club-col">Club</th>
                        <th>Name</th>
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
                        const isChampionsLeague = team.position <= 4;
                        const isEuropaLeague = team.position >= 5 && team.position <= 6;

                        return (
                            <tr key={team.position}>
                                <td>{team.position}</td>
                                <td className="club-cell">
                                    <div className="club-info">
                                        <img src={team.logo} alt={`${team.name} logo`}/>
                                        <span>{team.name}</span>
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
                                <td className="cl-bar-cell">
                                    {isChampionsLeague && <div className="cl-bar champions"/>}
                                    {isEuropaLeague && <div className="cl-bar europa"/>}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LeagueTable;