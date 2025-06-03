import React, { useState } from "react";
import { useGetTeamFixturesQuery } from "../../services/footballApi";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/TeamStats/TeamFixtures.scss";

const TeamFixtures = ({ teamId }) => {
    const { data, error, isLoading } = useGetTeamFixturesQuery(teamId);
    const [showFutureMatches, setShowFutureMatches] = useState(true);
    const [pastPage, setPastPage] = useState(1);
    const [futurePage, setFuturePage] = useState(1);
    const matchesPerPage = 10;

    if (isLoading) return <p>Loading fixtures...</p>;
    if (error) return <p>Error loading team fixtures</p>;
    if (!data?.response || data.response.length === 0) {
        return <p>No fixtures available</p>;
    }

    const fixtures = data.response || [];
    const currentDate = new Date();

    // Split fixtures into future and past matches
    const futureMatches = fixtures
        .filter(match => new Date(match.fixture.date) > currentDate)
        .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

    const pastMatches = fixtures
        .filter(match => new Date(match.fixture.date) <= currentDate)
        .sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));

    // Get current page for the active category
    const currentPage = showFutureMatches ? futurePage : pastPage;
    const totalMatches = showFutureMatches ? futureMatches.length : pastMatches.length;
    const totalPages = Math.ceil(totalMatches / matchesPerPage);

    // Navigate to the next page or switch categories
    const handleNext = () => {
        if (!showFutureMatches) {
            // If viewing past matches, go to previous page (more recent past matches)
            if (pastPage > 1) {
                setPastPage(pastPage - 1);
            } else if (futureMatches.length > 0) {
                // If at most recent past matches, switch to future matches
                setShowFutureMatches(true);
                setFuturePage(1);
            }
        } else {
            // If viewing future matches, go to next page (more distant future matches)
            if (futurePage < Math.ceil(futureMatches.length / matchesPerPage)) {
                setFuturePage(futurePage + 1);
            }
        }
    };

// Navigate to older matches (backward in time)
    const handlePrevious = () => {
        if (showFutureMatches) {
            // If viewing future matches, go to previous page (closer future matches)
            if (futurePage > 1) {
                setFuturePage(futurePage - 1);
            } else if (pastMatches.length > 0) {
                // If at closest future matches, switch to past matches
                setShowFutureMatches(false);
                setPastPage(1);
            }
        } else {
            // If viewing past matches, go to next page (older past matches)
            if (pastPage < Math.ceil(pastMatches.length / matchesPerPage)) {
                setPastPage(pastPage + 1);
            }
        }
    };

    // Calculate the current page's fixtures
    const indexOfLastMatch = currentPage * matchesPerPage;
    const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
    const allMatches = showFutureMatches ? futureMatches : pastMatches;
    const currentFixtures = allMatches.slice(indexOfFirstMatch, indexOfLastMatch);

    // Group current fixtures by date
    const fixturesByDate = currentFixtures.reduce((groups, match) => {
        const date = new Date(match.fixture.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(match);
        return groups;
    }, {});

    // Sort dates based on which type we're showing
    const sortedDates = Object.keys(fixturesByDate).sort((a, b) => {
        if (showFutureMatches) {
            return new Date(a) - new Date(b); // Chronological for future matches
        } else {
            return new Date(b) - new Date(a); // Reverse chronological for past matches
        }
    });

    const formatMatchTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="team-fixtures paginated-style">
            <div className="fixtures-header">
                <button
                    className="pagination-arrow previous"
                    onClick={handlePrevious}
                    disabled={(showFutureMatches && futurePage === 1 && pastMatches.length === 0) ||
                        (!showFutureMatches && pastPage >= Math.ceil(pastMatches.length / matchesPerPage))}
                    title="Show older matches"
                >
                    <ChevronLeft size={20}/>
                </button>

                <div className="title-section">
                    <Calendar size={20}/>
                    <h2>
                        {showFutureMatches ? "Upcoming Fixtures" : "Previous Results"}
                        {totalPages > 1 && ` (${currentPage}/${totalPages})`}
                    </h2>
                </div>

                <button
                    className="pagination-arrow next"
                    onClick={handleNext}
                    disabled={(showFutureMatches && futurePage >= Math.ceil(futureMatches.length / matchesPerPage)) ||
                        (!showFutureMatches && pastPage === 1 && futureMatches.length === 0)}
                    title="Show newer matches"
                >
                    <ChevronRight size={20}/>
                </button>
            </div>

            <div className="fixtures-timeline">
                {sortedDates.length === 0 ? (
                    <p className="no-fixtures">No {showFutureMatches ? "upcoming" : "previous"} fixtures available</p>
                ) : (
                    sortedDates.map(date => (
                        <div className="fixture-date-group" key={date}>
                            <div className="date-header">
                                <span className="date-label">{date}</span>
                            </div>

                            <div className="date-fixtures">
                                {fixturesByDate[date].map((match) => (
                                    <div className="fixture-item" key={match.fixture.id}>
                                        <div className="match-time">
                                            <span className="time">{formatMatchTime(match.fixture.date)}</span>
                                        </div>

                                        <div className="match-teams">
                                            <div className="team home">
                                                <img
                                                    src={match.teams.home.logo}
                                                    alt={`${match.teams.home.name} logo`}
                                                    className="team-logo"
                                                />
                                                <span className="team-name">{match.teams.home.name}</span>
                                            </div>

                                            <div className="match-score">
                                                {match.fixture.status.short === "FT" ? (
                                                    <span className="score">
                                                        {match.goals.home} - {match.goals.away}
                                                    </span>
                                                ) : (
                                                    <span className="vs">vs</span>
                                                )}
                                            </div>

                                            <div className="team away">
                                                <img
                                                    src={match.teams.away.logo}
                                                    alt={`${match.teams.away.name} logo`}
                                                    className="team-logo"
                                                />
                                                <span className="team-name">{match.teams.away.name}</span>
                                            </div>
                                        </div>

                                        <div className="match-competition">
                                            <img
                                                src={match.league.logo}
                                                alt={`${match.league.name} logo`}
                                                className="competition-logo"
                                            />
                                            <span className="competition-name">{match.league.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamFixtures;