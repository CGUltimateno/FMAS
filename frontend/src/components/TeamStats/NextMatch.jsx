import React from "react";
import "../../styles/TeamStats/NextMatch.scss";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";

const NextMatch = ({ matches }) => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
        return (
            <div className="next-match">
                <div className="next-match__header">
                    <h2>Next Match</h2>
                </div>
                <div className="next-match__empty">No upcoming matches scheduled</div>
            </div>
        );
    }

    // Find the first upcoming match
    const nextMatch = matches.find(match =>
        match.fixture.status.short === "NS" ||
        match.fixture.status.short === "TBD"
    ) || matches[0];

    const matchDate = new Date(nextMatch.fixture.date);
    const formattedTime = matchDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    const formattedDate = matchDate.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="next-match">
            <div className="next-match__header">
                <h2>Next Match</h2>
                <span className="next-match__header-competition">{nextMatch.league.name}</span>
            </div>

            <div className="next-match__details">
                <div className="next-match__details-team-info">
                    <img
                        src={nextMatch.teams.home.logo}
                        alt={nextMatch.teams.home.name}
                        className="team-logo"
                    />
                    <span className="next-match__details-team-info-name">
                        {nextMatch.teams.home.name}
                    </span>
                </div>

                <div className="next-match__details-center">
                    <div className="match-time">
                        <FaClock className="icon" />
                        <span>{formattedTime}</span>
                    </div>
                    <div className="match-date">
                        <FaCalendarAlt className="icon" />
                        <span>{formattedDate}</span>
                    </div>
                    {nextMatch.fixture.venue && nextMatch.fixture.venue.name && (
                        <div className="match-venue">
                            <FaMapMarkerAlt className="icon" />
                            <span>{nextMatch.fixture.venue.name}</span>
                        </div>
                    )}
                </div>

                <div className="next-match__details-team-info">
                    <img
                        src={nextMatch.teams.away.logo}
                        alt={nextMatch.teams.away.name}
                        className="team-logo"
                    />
                    <span className="next-match__details-team-info-name">
                        {nextMatch.teams.away.name}
                    </span>
                </div>
            </div>

            <div className="next-match__status">
                {nextMatch.fixture.status.long}
            </div>
        </div>
    );
};

export default NextMatch;