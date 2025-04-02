import React from "react";
import { useParams } from "react-router-dom";
import { useGetTeamDetailsQuery } from "../services/footballApi";
import "../styles/TeamStats/TeamDetailsPage.scss";

const TeamDetailsPage = () => {
    const { teamId } = useParams();
    const { data, isLoading, error } = useGetTeamDetailsQuery(teamId);
    if (isLoading) return <p>Loading team details...</p>;
    if (error) return <p>Error loading team data.</p>;

    const { details, squad, matches, stats } = data;

    return (
        <div className="team-details-page">
            <header className="team-header">
                <div className="team-header-inner">
                    <img src={details.crest} alt={details.shortName} className="team-crest" />
                    <div className="team-info">
                        <h1 onClick="" className="team-name">{details.name}</h1>
                        <span className="team-venue">{details.venue}</span>
                    </div>
                </div>
            </header>

            <nav className="team-tabs">
                <button className="tab-btn active">Overview</button>
                <button className="tab-btn">Fixtures</button>
                <button className="tab-btn">Squad</button>
                <button className="tab-btn">Stats</button>
            </nav>

            <main className="team-content">
                <section className="overview-section">
                    <h2>Overview</h2>
                    <div className="overview-cards">
                        <div className="card">
                            <h3>Stadium</h3>
                            <p>{details.venue}</p>
                        </div>
                        <div className="card">
                            <h3>Founded</h3>
                            <p>{details.founded}</p>
                        </div>
                    </div>
                </section>

                <section className="fixtures-section">
                    <h2>Fixtures</h2>
                    <div className="fixtures-list">
                        {matches?.map((match) => (
                            <div key={match.id} className="fixture-card">
                                <span className="fixture-date">
                  {new Date(match.utcDate).toLocaleString()}
                </span>
                                <div className="fixture-teams">
                                    {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="squad-section">
                    <h2>Squad</h2>
                    <div className="squad-list">
                        {squad?.map((player) => (
                            <div key={player.id} className="player-card">
                                <span className="player-name">{player.name}</span>
                                <span className="player-position">{player.position}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="stats-section">
                    <h2>Season Stats</h2>
                </section>
            </main>
        </div>
    );
};

export default TeamDetailsPage;
