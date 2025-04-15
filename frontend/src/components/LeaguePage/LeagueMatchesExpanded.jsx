import React, { useState } from "react";
import "../../styles/LeagueDetails/LeagueMatchesExpanded.scss";
import { Link } from "react-router-dom";

const LeagueMatchesExpanded = ({ matches }) => {
    if (!matches || !Array.isArray(matches.matches)) {
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

    const groupedMatches = matches.matches.reduce((acc, match) => {
        const matchDate = new Date(match.utcDate);
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

    const [currentWeekIndex, setCurrentWeekIndex] = useState(getCurrentWeekIndex());

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

    const currentWeekStart = new Date(sortedWeeks[currentWeekIndex]);
    const currentWeekEnd = getWeekEnd(currentWeekStart);
    const currentWeekMatches = groupedMatches[sortedWeeks[currentWeekIndex]];

    const groupedByDay = currentWeekMatches.reduce((acc, match) => {
        const matchDate = new Date(match.utcDate);
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
                <button className="expanded-scroll-btn left" onClick={handlePrev} disabled={currentWeekIndex === 0}>&lt;</button>
                <div className="expanded-week-header">
                    {currentWeekStart.toLocaleDateString('en-GB', {
                        month: 'long',
                        day: 'numeric',
                    })} - {currentWeekEnd.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                })}
                </div>
                <button className="expanded-scroll-btn right" onClick={handleNext} disabled={currentWeekIndex === sortedWeeks.length - 1}>&gt;</button>
            </div>
            {Object.keys(groupedByDay).map((day) => (
                <div key={day} className="expanded-day-group">
                    <div className="expanded-day-header">{day}</div>
                    {groupedByDay[day].map((match) => {
                        const matchDate = new Date(match.utcDate);
                        const isFutureMatch = matchDate > new Date();
                        const matchTime = matchDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });
                        const isFinished = !isFutureMatch;
                        const matchDateStr = matchDate.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        });

                        return (
                            <div key={match.id} className="expanded-match-row">
                                {isFinished && <div className="expanded-ft-bubble">FT</div>}
                                <div className="match-left">
                                    <Link
                                        to={`/teams/${match.homeTeam.id}`}
                                        state={{ leagueId: matches?.competition?.id }}
                                        className="expanded-team-link"
                                    >
                                        <span className="expanded-home-team">{match.homeTeam.shortName}</span>
                                    </Link>
                                    <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} />
                                </div>
                                <div className="match-center">
                                    <span className="expanded-score">
                                        {isFutureMatch ? matchTime : `${match.score.fullTime.home} - ${match.score.fullTime.away}`}
                                    </span>
                                </div>
                                <div className="match-right">
                                    <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} />
                                    <Link
                                        to={`/teams/${match.awayTeam.id}`}
                                        state={{ leagueId: matches?.competition?.id }}
                                        className="expanded-team-link"
                                    >
                                        <span className="expanded-away-team">{match.awayTeam.shortName}</span>
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