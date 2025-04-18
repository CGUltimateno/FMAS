import "../styles/LeagueDetails/LeaguesPage.scss";
import LeagueTable from "../components/LeaguePage/LeagueTable.jsx";
import { useGetPopularLeaguesQuery } from "../services/footballApi";
import { useState } from "react";

const LeaguesPage = () => {
    const { data, error, isLoading } = useGetPopularLeaguesQuery();
    const [selectedLeague, setSelectedLeague] = useState(null);

    if (isLoading) return <div className="leagues-wrapper"><h2>Loading leagues...</h2></div>;
    if (error) return <div className="leagues-wrapper"><h2>Error loading leagues</h2></div>;

    const leagues = data?.competitions?.response?.popular || [];

    // Set initial selected league if not already set
    if (leagues.length && selectedLeague === null) {
        setSelectedLeague(leagues[0].id);
    }

    const currentLeague = leagues.find(league => league.id === selectedLeague);

    return (
        <div className="leagues-wrapper">
            <h2>Leagues</h2>

            <div className="leagues-nav">
                {leagues.map((league) => (
                    <div
                        key={league.id}
                        className={`league-tab ${selectedLeague === league.id ? 'active' : ''}`}
                        onClick={() => setSelectedLeague(league.id)}
                    >
                        {league.logo && <img src={league.logo} alt={league.name} className="league-emblem" />}
                        <span>{league.name}</span>
                    </div>
                ))}
            </div>

            <div className="league-content">
                {currentLeague && (
                    <LeagueTable
                        key={currentLeague.id}
                        leagueId={currentLeague.id}
                        leagueName={currentLeague.name}
                    />
                )}
            </div>
        </div>
    );
}

export default LeaguesPage;