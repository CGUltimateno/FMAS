import React from "react";
import "../../styles/TeamStats/NextMatch.scss";

const NextMatch = ({ matches }) => {
    if (!matches) return null;

    const nextMatch = Array.isArray(matches) ? matches[0] : matches;
    if (!nextMatch) return null;

    const competitionName = nextMatch.competition?.name || "Unknown Competition";
    const matchDate = new Date(nextMatch.utcDate);
    const formattedTime = matchDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    const formattedDate = matchDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
    });

    return (
        <div className="next-match">
            <div className="next-match__header">
                <h2>Next Match</h2>
                <span className="next-match__header-competition">{competitionName}</span>
            </div>

            <div className="next-match__details">
                <div className="next-match__details-team-info">
                    <img
                        src={nextMatch.homeTeam.crest}
                        alt={nextMatch.homeTeam.shortName}
                    />
                    <span className="next-match__details-team-info-name">
                        {nextMatch.homeTeam.shortName}
                    </span>
                </div>

                <div className="next-match__details-center">
                    <span className="next-match__details-center-time">{formattedTime}</span>
                    <span className="next-match__details-center-date">{formattedDate}</span>
                </div>

                <div className="next-match__details-team-info">
                    <img
                        src={nextMatch.awayTeam.crest}
                        alt={nextMatch.awayTeam.shortName}
                    />
                    <span className="next-match__details-team-info-name">
                        {nextMatch.awayTeam.shortName}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NextMatch;