import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetLeagueDetailsQuery } from "../services/footballApi";
import "../styles/LeagueDetails/LeagueDetailsPage.scss";
import LeaguesMatches from "../components/LeaguePage/LeaguesMatches";
import LeagueTable from "../components/LeaguePage/MiniLeagueTable";
import LeagueStats from "../components/LeaguePage/LeagueStats";
import NotFoundPage from "./NotFoundPage";
import StandingsPage from "../components/LeaguePage/LeagueStandings.jsx";
import LeagueMatchesExpanded from "../components/LeaguePage/LeagueMatchesExpanded.jsx";

const LeagueDetailsPage = () => {
    const { leagueId } = useParams();
    const { data, isLoading, error } = useGetLeagueDetailsQuery(leagueId);
    const [activeTab, setActiveTab] = useState("overview");

    if (isLoading) return <p className="league-loading">Loading league details...</p>;
    if (error || !data) return <NotFoundPage />;

    const { details, matches, scorers, assists, rated } = data;

    return (
        <div className="league-details-page">
            <header className="league-header">
                <div className="league-header-inner">
                    <img src={details.emblem} alt={`${details.name} Emblem`} className="league-emblem" />
                    <div className="league-info">
                        <h1 className="league-name">{details.name}</h1>
                        <div className="league-meta">
                            <img src={details.area.flag} alt={`${details.area.name} Flag`} className="league-flag" />
                            <span className="area-name">{details.area.name}</span>
                            <span className="season-dates">
                                {details.currentSeason?.startDate} - {details.currentSeason?.endDate}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="league-tabs">
                <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
                <button className={`tab-btn ${activeTab === "standings" ? "active" : ""}`} onClick={() => setActiveTab("standings")}>Standings</button>
                <button className={`tab-btn ${activeTab === "matches" ? "active" : ""}`} onClick={() => setActiveTab("matches")}>Matches</button>
                {/*<button className={`tab-btn ${activeTab === "top-scorers" ? "active" : ""}`} onClick={() => setActiveTab("top-scorers")}>Top Scorers</button>*/}
            </nav>

            {activeTab === "overview" && (
                <>
                    <LeaguesMatches matches={matches} />
                    <main className="league-content">
                        <section className="standings-section">
                            <LeagueTable leagueId={leagueId} leagueName={details.name} showTitle={false} />
                        </section>
                        <LeagueStats scorers={scorers} assists={assists} rated={rated} />
                    </main>
                </>
            )}

            {activeTab === "standings" && <StandingsPage leagueId={leagueId} />}
            {activeTab === "matches" && <LeagueMatchesExpanded matches={matches} />}
        </div>
    );
};

export default LeagueDetailsPage;