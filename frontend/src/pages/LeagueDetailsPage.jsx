import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
    const tabs = ["Overview", "Matches", "Standings"];

    return (
        <div className="league-details-page">
            <header className="league-header">
                <div className="league-header-inner">
                    <img src={details.emblem} alt={`${details.name} Emblem`} className="league-emblem"/>
                    <div className="league-info">
                        <h1 className="league-name">{details.name}</h1>
                        <div className="league-meta">
                            <div className="meta-item">
                                <img src={details.area.flag} alt={`${details.area.name} Flag`} className="league-flag"/>
                                <span className="area-name">{details.area.name}</span>
                            </div>
                            <div className="meta-item">
                                <span className="season-dates">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    {details.currentSeason?.startDate} - {details.currentSeason?.endDate}
                                </span>
                            </div>
                            <div className="league-status active">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                     fill="currentColor">
                                    <circle cx="12" cy="12" r="10"/>
                                </svg>
                                In Season
                            </div>
                        </div>
                    </div>
                </div>
                <div className="team-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab.toLowerCase() ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* Move tabs outside header and use team-tabs class */}


            <div className="league-content">
                {activeTab === "overview" && (
                    <>
                        <LeaguesMatches matches={matches}/>
                        <main className="league-content">
                            <section className="standings-section">
                                <LeagueTable leagueId={leagueId} leagueName={details.name} showTitle={false}/>
                            </section>
                            <LeagueStats state={leagueId}/>
                        </main>
                    </>
                )}

                {activeTab === "standings" && <StandingsPage leagueId={leagueId}/>}
                {activeTab === "matches" && <LeagueMatchesExpanded matches={matches}/>}
            </div>
        </div>
    );
};

export default LeagueDetailsPage;