import "../styles/LeagueDetails/LeaguesPage.scss";
import LeagueTable from "../components/LeaguePage/LeagueTable.jsx";
import { useGetPopularLeaguesQuery } from "../services/footballApi";

const LeaguesPage = () => {
    const { data, error, isLoading } = useGetPopularLeaguesQuery();
    console.log(data);
    if (isLoading) return <div className="leagues-wrapper"><h2>Loading leagues...</h2></div>;
    if (error) return <div className="leagues-wrapper"><h2>Error loading leagues</h2></div>;

    return (
        <div className="leagues-wrapper">
            <h2>Leagues</h2>
            <div className="leagues-container">
                {data && data.competitions && data.competitions.map((league) => (
                    <LeagueTable
                        key={league.code}
                        leagueId={league.id}
                        leagueName={league.name}
                    />
                ))}
            </div>
        </div>
    );
}

export default LeaguesPage;