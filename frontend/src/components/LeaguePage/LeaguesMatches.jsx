    import React, { useState, useEffect } from "react";
import "../../styles/LeagueDetails/LeaguesMatches.scss";
import { Link } from "react-router-dom";

const LeaguesMatches = ({ matches }) => {
    const matchesPerPage = 3;
    const totalMatches = matches?.length || 0;
    const totalPages = Math.ceil(totalMatches / matchesPerPage);

    // Find completed matches (status "FT" or other completed statuses)
    const completedMatches = matches?.filter(match =>
        match.fixture.status.short === "FT" ||
        match.fixture.status.short === "AET" ||
        match.fixture.status.short === "PEN"
    );

    // Calculate the page that contains the latest completed matches
    const completedMatchesCount = completedMatches?.length || 0;
    const lastCompletedMatchPage = Math.floor((completedMatchesCount - 1) / matchesPerPage);

    // Default to last page of completed matches or first page if no completed matches
    const initialPage = Math.max(0, Math.min(lastCompletedMatchPage, totalPages - 1));

    const [currentPage, setCurrentPage] = useState(initialPage);

    useEffect(() => {
        // Reset to initial page when matches change
        setCurrentPage(initialPage);
    }, [matches, initialPage]);

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

    const currentMatches = matches?.slice(
        currentPage * matchesPerPage,
        (currentPage + 1) * matchesPerPage
    );

    if (!currentMatches?.length) {
        return (
            <section className="matches-section">
                <h2>Matches</h2>
                <div className="no-matches">No matches available at this time.</div>
            </section>
        );
    }

    return (
        <section className="matches-section">
            <h2>Matches</h2>
            <div className="matches-scroller">
                <button
                    className="scroll-btn left"
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                >
                    &lt;
                </button>
                <div className="matches-list">
                    {currentMatches.map((match) => {
                        const matchDate = new Date(match.fixture.date);
                        const isFutureMatch = match.fixture.status.short === "NS" || matchDate > new Date();
                        const matchTime = matchDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });

                        const isToday = matchDate.toDateString() === new Date().toDateString();
                        const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === matchDate.toDateString();

                        let displayDate;
                        if (isToday) {
                            displayDate = "Today";
                        } else if (isTomorrow) {
                            displayDate = "Tomorrow";
                        } else {
                            displayDate = matchDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            });
                        }

                        return (
                            <div key={match.fixture.id} className="league-match-card">
                                <div className="match-teams">
                                    <Link
                                        to={`/teams/${match.teams.home.id}`}
                                        state={{ leagueId: match.league.id }}
                                        className="team-name-link"
                                    >
                                        <span className="home-team">{match.teams.home.name}</span>
                                    </Link>
                                    <img src={match.teams.home.logo} alt={match.teams.home.name} />
                                    <Link
                                        to={`/matches/${match.fixture.id}`}
                                        state={{ leagueId: match.league.id }}
                                        className="score-link"
                                    >
                                        <span className="score">
                                            {isFutureMatch
                                                ? matchTime
                                                : `${match.score.fulltime.home ?? '-'} - ${match.score.fulltime.away ?? '-'}`}
                                        </span>
                                    </Link>
                                    <img src={match.teams.away.logo} alt={match.teams.away.name} />
                                    <Link
                                        to={`/teams/${match.teams.away.id}`}
                                        state={{ leagueId: match.league.id }}
                                        className="team-name-link"
                                    >
                                        <span className="away-team">{match.teams.away.name}</span>
                                    </Link>
                                </div>
                                <div className="match-date">
                                    {displayDate}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button
                    className="scroll-btn right"
                    onClick={handleNext}
                    disabled={currentPage === totalPages - 1}
                >
                    &gt;
                </button>
            </div>
        </section>
    );
};

export default LeaguesMatches;