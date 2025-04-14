import React, { useState } from "react";
import { useGetTeamFixturesQuery } from "../../services/footballApi";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/TeamStats/TeamFixtures.scss";

const TeamFixtures = ({ teamId }) => {
    const { data, error, isLoading } = useGetTeamFixturesQuery(teamId);
    const [showFutureMatches, setShowFutureMatches] = useState(true);

    if (isLoading) return <p>Loading fixtures...</p>;
    if (error) return <p>Error loading team fixtures</p>;

    const fixtures = data || [];
    const currentDate = new Date();

    // Split fixtures into future and past matches
    const futureMatches = fixtures
        .filter(match => new Date(match.utcDate) > currentDate)
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
        .slice(0, 10);

    const pastMatches = fixtures
        .filter(match => new Date(match.utcDate) <= currentDate)
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .slice(0, 10);

    // Current fixtures to display based on toggle
    const currentFixtures = showFutureMatches ? futureMatches : pastMatches;

    // Group current fixtures by date
    const fixturesByDate = currentFixtures.reduce((groups, match) => {
        const date = new Date(match.utcDate).toLocaleDateString('en-US', {
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
                    onClick={() => setShowFutureMatches(false)}
                    disabled={!showFutureMatches && pastMatches.length === 0}
                    title="Previous results"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="title-section">
                    <Calendar size={20} />
                    <h2>Fixtures</h2>
                </div>

                <button
                    className="pagination-arrow next"
                    onClick={() => setShowFutureMatches(true)}
                    disabled={showFutureMatches && futureMatches.length === 0}
                    title="Upcoming fixtures"
                >

                    <ChevronRight size={20} />
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
                                    <div className="fixture-item" key={match.id}>
                                        <div className="match-time">
                                            <span className="time">{formatMatchTime(match.utcDate)}</span>
                                        </div>

                                        <div className="match-teams">
                                            <div className="team home">
                                                <img
                                                    src={match.homeTeam.crest}
                                                    alt={`${match.homeTeam.name} logo`}
                                                    className="team-logo"
                                                />
                                                <span className="team-name">{match.homeTeam.name}</span>
                                            </div>

                                            <div className="match-score">
                                                {match.status === "FINISHED" ? (
                                                    <span className="score">
                                                        {match.score.fullTime.home} - {match.score.fullTime.away}
                                                    </span>
                                                ) : (
                                                    <span className="vs">VS</span>
                                                )}
                                            </div>

                                            <div className="team away">
                                                <img
                                                    src={match.awayTeam.crest}
                                                    alt={`${match.awayTeam.name} logo`}
                                                    className="team-logo"
                                                />
                                                <span className="team-name">{match.awayTeam.name}</span>
                                            </div>
                                        </div>

                                        <div className="match-competition">
                                            <img
                                                src={match.competition.emblem}
                                                alt={`${match.competition.name} logo`}
                                                className="competition-logo"
                                            />
                                            <span className="competition-name">{match.competition.name}</span>
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