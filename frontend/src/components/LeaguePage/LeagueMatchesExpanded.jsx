import React, { useState, useMemo } from "react";
import "../../styles/LeagueDetails/LeagueMatchesExpanded.scss";
import { Link } from "react-router-dom";

const LeagueMatchesExpanded = ({ matches }) => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
        return <p>No Games Available.</p>;
    }
    console.log("LeagueMatchesExpanded matches:", matches);
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

    // Memoize groupedMatches and sortedWeeks for performance
    const { groupedMatches, sortedWeeks } = useMemo(() => {
        const acc = matches.reduce((acc, match) => {
            const matchDate = new Date(match.fixture.date);
            const weekStart = getWeekStart(matchDate).toISOString();
            if (!acc[weekStart]) {
                acc[weekStart] = [];
            }
            acc[weekStart].push(match);
            return acc;
        }, {});
        const weeks = Object.keys(acc).sort((a, b) => new Date(a) - new Date(b));
        return { groupedMatches: acc, sortedWeeks: weeks };
    }, [matches]);

    const isSeasonFinished = useMemo(() => {
        if (matches.length === 0) return false; // Should be caught by the initial empty check
        return matches.every(match => match.fixture.status.short === "FT");
    }, [matches]);

    const calculateInitialWeekIndex = () => {
        if (sortedWeeks.length === 0) {
            return 0;
        }

        // isSeasonFinished is available from useMemo above
        if (isSeasonFinished) {
            return sortedWeeks.length - 1; // Show the last week of the concluded season
        }

        // Season is not finished or not all matches are FT
        const now = new Date();
        let targetDate = null;

        let latestPlayedMatch = null;
        let earliestUpcomingMatch = null;

        matches.forEach(match => {
            const matchDate = new Date(match.fixture.date);
            if (match.fixture.status.short !== "NS") { // Includes FT, LIVE, PST, CANC, etc.
                if (matchDate <= now) { // Match is on or before today
                    if (!latestPlayedMatch || matchDate > new Date(latestPlayedMatch.fixture.date)) {
                        latestPlayedMatch = match;
                    }
                }
            }
            if (match.fixture.status.short === "NS") { // Upcoming match
                if (!earliestUpcomingMatch || matchDate < new Date(earliestUpcomingMatch.fixture.date)) {
                    earliestUpcomingMatch = match;
                }
            }
        });

        if (latestPlayedMatch) {
            targetDate = new Date(latestPlayedMatch.fixture.date);
        } else if (earliestUpcomingMatch) {
            targetDate = new Date(earliestUpcomingMatch.fixture.date);
        }

        let weekIdx = -1;
        if (targetDate) {
            weekIdx = sortedWeeks.findIndex(weekStart => {
                const weekStartDate = new Date(weekStart);
                const weekEndDate = getWeekEnd(weekStartDate);
                return targetDate >= weekStartDate && targetDate <= weekEndDate;
            });
        }

        if (weekIdx === -1) { // Fallback 1: Try week of current date
            weekIdx = sortedWeeks.findIndex(weekStart => {
                const weekStartDate = new Date(weekStart);
                const weekEndDate = getWeekEnd(weekStartDate);
                return now >= weekStartDate && now <= weekEndDate;
            });
        }

        if (weekIdx === -1) { // Fallback 2: Current date is outside all match weeks
            if (sortedWeeks.length > 0) { // Should always be true if we reached here from top check
                const lastMatchWeekStartDate = new Date(sortedWeeks[sortedWeeks.length - 1]);
                if (now > getWeekEnd(lastMatchWeekStartDate)) {
                    weekIdx = sortedWeeks.length - 1; // Current date is past the last match week
                } else {
                    // Current date is before the first match week, or some other gap
                    weekIdx = 0;
                }
            }
            // If sortedWeeks.length was 0, it's handled at the start of function.
        }
        // Ensure index is valid and within bounds
        let finalIndex = weekIdx >= 0 ? weekIdx : 0; // Default to 0 if somehow still -1
        if (sortedWeeks.length > 0) {
            finalIndex = Math.min(finalIndex, sortedWeeks.length - 1);
        }
        return finalIndex;
    };

    const [currentWeekIndex, setCurrentWeekIndex] = useState(() => calculateInitialWeekIndex());

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

    // If no weeks found (possible if matches array is empty or all filtered out)
    if (sortedWeeks.length === 0) {
        return <p>No matches to display for this league in weekly format.</p>; // Adjusted message
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

            {isSeasonFinished && (
                <div className="season-concluded-message">
                    <p>
                        Displaying matches from the concluded season.
                        Fixtures for the upcoming season may not yet be available.
                    </p>
                </div>
            )}

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

