import "../styles/LeagueDetails/LeaguesPage.scss";
import LeagueTable from "../components/LeaguePage/LeagueTable.jsx";
import { useGetLeagueStandingsQuery } from "../services/footballApi";
import { useState, useEffect } from "react";

const LeaguesPage = () => {
    const popularLeagues = [
        { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png" },
        { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png" },
        { id: 135, name: "Serie A", country: "Italy", logo: "https://media.api-sports.io/football/leagues/135.png" },
        { id: 78, name: "Bundesliga", country: "Germany", logo: "https://media.api-sports.io/football/leagues/78.png" },
        { id: 61, name: "Ligue 1", country: "France", logo: "https://media.api-sports.io/football/leagues/61.png" }
    ];

    const [selectedLeague, setSelectedLeague] = useState(popularLeagues[0]?.id);
    const currentSeason = new Date().getFullYear();

    const { data, error, isLoading } = useGetLeagueStandingsQuery(
        selectedLeague ? { leagueId: selectedLeague, season: currentSeason } : skip
    );

    useEffect(() => {
        if (popularLeagues.length && selectedLeague === null) {
            setSelectedLeague(popularLeagues[0].id);
        }
    }, []);

    if (isLoading) return <div className="leagues-wrapper"><h2>Loading leagues...</h2></div>;
    if (error) return <div className="leagues-wrapper"><h2>Error loading leagues: {error.message}</h2></div>;

    const currentLeagueInfo = popularLeagues.find(league => league.id === selectedLeague);

    return (
        <div className="leagues-wrapper">
            <h2>Popular Leagues</h2>

            <div className="leagues-nav">
                {popularLeagues.map((league) => (
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
                {currentLeagueInfo && (
                    <LeagueTable
                        key={currentLeagueInfo.id}
                        leagueId={currentLeagueInfo.id}
                        leagueName={currentLeagueInfo.name}
                        standings={data?.standings}
                    />
                )}
            </div>
        </div>
    );
}

export default LeaguesPage;