import "../styles/LeagueDetails/LeaguesPage.scss";
import LeagueTable from "../components/LeaguePage/LeagueTable.jsx";
import { useGetLeagueStandingsQuery, useGetPopularLeaguesQuery } from "../services/footballApi";
import { useState, useEffect } from "react";
import { skipToken } from '@reduxjs/toolkit/query/react';

const LeaguesPage = () => {
    const { data: popularLeaguesData, error: popularLeaguesError, isLoading: isLoadingPopularLeagues } = useGetPopularLeaguesQuery();

    const popularLeagues = popularLeaguesData?.competitions?.map(comp => ({
        id: comp.league.id,
        name: comp.league.name,
        country: comp.country.name,
        logo: comp.league.logo
    })) || [];

    const [selectedLeague, setSelectedLeague] = useState(null);
    const currentSeason = "2024"

    useEffect(() => {
        if (popularLeagues && popularLeagues.length > 0) {
            if (selectedLeague === null || !popularLeagues.some(league => league.id === selectedLeague)) {
                setSelectedLeague(popularLeagues[0].id);
            }
        } else if (popularLeagues && popularLeagues.length === 0) {
            setSelectedLeague(null);
        }
    }, [popularLeagues, selectedLeague]);

    const { data: standingsData, error: standingsError, isLoading: isLoadingStandings } = useGetLeagueStandingsQuery(
        selectedLeague ? { leagueId: selectedLeague, season: currentSeason } : skipToken
    );

    if (isLoadingPopularLeagues) return <div className="leagues-wrapper"><h2>Loading popular leagues...</h2></div>;
    if (popularLeaguesError) return <div className="leagues-wrapper"><h2>Error loading popular leagues: {popularLeaguesError.message || 'Unknown error'}</h2></div>;
    if (!popularLeagues || popularLeagues.length === 0) return <div className="leagues-wrapper"><h2>No popular leagues available.</h2></div>;

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
                {isLoadingStandings && <div className="leagues-wrapper"><h3>Loading standings...</h3></div>}
                {standingsError && <div className="leagues-wrapper"><h3>Error loading standings: {standingsError.message || 'Unknown error'}</h3></div>}
                {currentLeagueInfo && standingsData && !isLoadingStandings && !standingsError && (
                    <LeagueTable
                        key={currentLeagueInfo.id}
                        leagueId={currentLeagueInfo.id}
                        leagueName={currentLeagueInfo.name}
                        standings={standingsData?.standings}
                    />
                )}
                {currentLeagueInfo && !standingsData && !isLoadingStandings && !standingsError && (
                    <div className="leagues-wrapper"><h3>No standings available for {currentLeagueInfo.name}.</h3></div>
                )}
            </div>
        </div>
    );
}

export default LeaguesPage;

