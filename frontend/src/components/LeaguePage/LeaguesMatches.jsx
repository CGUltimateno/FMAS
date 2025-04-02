import React, { useState, useEffect } from "react";
import "../../styles/LeagueDetails/LeaguesMatches.scss";
import {Link} from "react-router-dom";

const LeaguesMatches = ({ matches }) => {
    const matchesPerPage = 3;
    const totalPages = Math.ceil(matches?.matches?.length / matchesPerPage);

    // Find the latest match index
    const latestMatchIndex = matches?.matches?.findIndex(match => new Date(match.utcDate) > new Date()) - 1;
    const initialPage = Math.max(0, Math.ceil((latestMatchIndex + 1) / matchesPerPage) - 1);

    const [currentPage, setCurrentPage] = useState(initialPage);

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentMatches = matches?.matches?.slice(
        currentPage * matchesPerPage,
        (currentPage + 1) * matchesPerPage
    );

    return (
        <section className="matches-section">
            <h2>Matches</h2>
            <div className="matches-scroller">
                <button className="scroll-btn left" onClick={handlePrev} disabled={currentPage === 0}>&lt;</button>
                <div className="matches-list">
                    {currentMatches?.map((match) => {
                        const matchDate = new Date(match.utcDate);
                        const isFutureMatch = matchDate > new Date();
                        const matchTime = matchDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });

                        const isTomorrow = new Date().getDate() + 1 === matchDate.getDate() &&
                            new Date().getMonth() === matchDate.getMonth() &&
                            new Date().getFullYear() === matchDate.getFullYear();

                        const displayDate = isTomorrow ? "Tomorrow" : matchDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        });

                        return (
                            <div key={match.id} className="league-match-card">
                                <div className="match-teams">
                                    <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} />
                                    <Link to={`/team/${match.homeTeam.id}`} className="team-name-link">
                                    <span className="home-team">{match.homeTeam.shortName}</span>
                                    </Link>
                                    <span className="score">
                                        {isFutureMatch ? matchTime : `${match.score.fullTime.home} - ${match.score.fullTime.away}`}
                                    </span>
                                    <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} />
                                    <Link to={`/team/${match.awayTeam.id}`} className="team-name-link">
                                    <span className="away-team">{match.awayTeam.shortName}</span>
                                    </Link>
                                </div>
                                <div className="match-date">
                                    {displayDate}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button className="scroll-btn right" onClick={handleNext} disabled={currentPage === totalPages - 1}>&gt;</button>
            </div>
        </section>
    );
};

export default LeaguesMatches;