import React, { useState } from "react";
import "../../styles/LeagueDetails/LeagueMatchesExpanded.scss";
import { Link } from "react-router-dom";

const LeagueMatchesExpanded = ({ matches }) => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
        return <p>No Games Available.</p>;
    }

    const getWeekStart = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        return start;
    };

    const getWeekEnd = (date) => {
        const end = new Date(date);
        end.setDate(end.getDate() + (6 - end.getDay()));
        end.setHours(23, 59, 59, 999);
        return end;
    };

    // Group matches by week
    const groupedMatches = matches.reduce((acc, match) => {
        const matchDate = new Date(match.fixture.date);
        const weekStart = getWeekStart(matchDate).toISOString();
        if (!acc[weekStart]) {
            acc[weekStart] = [];
        }
        acc[weekStart].push(match);
        return acc;
    }, {});

    const sortedWeeks = Object.keys(groupedMatches).sort((a, b) => new Date(a) - new Date(b));

    const getCurrentWeekIndex = () => {
        const now = new Date();
        return sortedWeeks.findIndex(weekStart => {
            const weekEnd = getWeekEnd(new Date(weekStart));
            return now >= new Date(weekStart) && now <= weekEnd;
        });
    };

    // Initialize with current week or first week if no match in current week
    const initialWeekIndex = Math.max(0, getCurrentWeekIndex());
    const [currentWeekIndex, setCurrentWeekIndex] = useState(initialWeekIndex);

    const handleNext = () => {
        if (currentWeekIndex < sortedWeeks.length - 1) {
            setCurrentWeekIndex(currentWeekIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentWeekIndex > 0) {
            setCurrentWeekIndex(currentWeekIndex - 1);
        }
    };

    // If no weeks found (possible if matches array is empty)
    if (sortedWeeks.length === 0) {
        return <p>No matches scheduled for this league.</p>;
    }

    const currentWeekStart = new Date(sortedWeeks[currentWeekIndex]);
    const currentWeekEnd = getWeekEnd(currentWeekStart);
    const currentWeekMatches = groupedMatches[sortedWeeks[currentWeekIndex]];

    // Group matches by day
    const groupedByDay = currentWeekMatches.reduce((acc, match) => {
        const matchDate = new Date(match.fixture.date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        let matchDay = matchDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        if (matchDate.toDateString() === today.toDateString()) {
            matchDay = "Today";
        } else if (matchDate.toDateString() === tomorrow.toDateString()) {
            matchDay = "Tomorrow";
        }

        if (!acc[matchDay]) {
            acc[matchDay] = [];
        }
        acc[matchDay].push(match);
        return acc;
    }, {});

    return (
        <div className="expanded-matches">
            <div className="expanded-week-navigation">
                <button
                    className="expanded-scroll-btn left"
                    onClick={handlePrev}
                    disabled={currentWeekIndex === 0}
                >
                    &lt;
                </button>
                <div className="expanded-week-header">
                    {currentWeekStart.toLocaleDateString('en-GB', {
                        month: 'long',
                        day: 'numeric',
                    })} - {currentWeekEnd.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                })}
                </div>
                <button
                    className="expanded-scroll-btn right"
                    onClick={handleNext}
                    disabled={currentWeekIndex === sortedWeeks.length - 1}
                >
                    &gt;
                </button>
            </div>

            {Object.keys(groupedByDay).map((day) => (
                <div key={day} className="expanded-day-group">
                    <div className="expanded-day-header">{day}</div>
                    {groupedByDay[day].map((match) => {
                        const matchDate = new Date(match.fixture.date);
                        const isFutureMatch = match.fixture.status.short === "NS" ||
                            matchDate > new Date();
                        const matchTime = matchDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });

                        return (
                            <div key={match.fixture.id} className="expanded-match-row">
                                {match.fixture.status.short === "FT" && (
                                    <div className="expanded-ft-bubble">FT</div>
                                )}
                                <div className="match-left">
                                    <Link
                                        to={`/teams/${match.teams.home.id}`}
                                        state={{ leagueId: match.league.id }}
                                        className="expanded-team-link"
                                    >
                                        <span className="expanded-home-team">{match.teams.home.name}</span>
                                    </Link>
                                    <img src={match.teams.home.logo} alt={match.teams.home.name} />
                                </div>
                                <div className="match-center">
                                    <Link
                                        to={`/matches/${match.fixture.id}`}
                                        state={{ leagueId: match.league.id }}
                                        className="match-score-link"
                                    >
                                        <span className="expanded-score">
                                            {isFutureMatch
                                                ? matchTime
                                                : `${match.score.fulltime.home ?? '-'} - ${match.score.fulltime.away ?? '-'}`}
                                        </span>
                                    </Link>
                                </div>
                                <div className="match-right">
                                    <img src={match.teams.away.logo} alt={match.teams.away.name} />
                                    <Link
                                        to={`/teams/${match.teams.away.id}`}
                                        state={{ leagueId: match.league.id }}
                                        className="expanded-team-link"
                                    >
                                        <span className="expanded-away-team">{match.teams.away.name}</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
export default LeagueMatchesExpanded;