import React, { useState } from "react";
import "../../styles/TeamStats/UpcomingFixtures.scss";

const UpcomingFixtures = ({ matches }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const matchesPerPage = 5;

    const upcomingMatches = matches.filter((match) =>
        new Date(match.fixture?.date || match.date) > new Date()
    ).sort((a, b) =>
        new Date(a.fixture?.date || a.date) - new Date(b.fixture?.date || b.date)
    );

    const totalPages = Math.ceil(upcomingMatches.length / matchesPerPage);
    const currentMatches = upcomingMatches.slice(
        currentPage * matchesPerPage,
        (currentPage + 1) * matchesPerPage
    );

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            if (direction === "next") {
                return (prevPage + 1) % totalPages;
            } else {
                return (prevPage - 1 + totalPages) % totalPages;
            }
        });
    };

    const FixtureCard = ({ match }) => {
        // Adapt to new API structure
        const matchDate = new Date(match.fixture?.date || match.date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        let dayLabel;
        if (
            matchDate.getFullYear() === today.getFullYear() &&
            matchDate.getMonth() === today.getMonth() &&
            matchDate.getDate() === today.getDate()
        ) {
            dayLabel = "Today";
        } else if (
            matchDate.getFullYear() === tomorrow.getFullYear() &&
            matchDate.getMonth() === tomorrow.getMonth() &&
            matchDate.getDate() === tomorrow.getDate()
        ) {
            dayLabel = "Tomorrow";
        } else {
            dayLabel = matchDate.toLocaleDateString([], {
                weekday: "long",
                month: "short",
                day: "numeric",
            });
        }

        const formattedTime = matchDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        // Extract team data adapting to new API structure
        const homeName = match.teams?.home?.name || match.homeTeam?.shortName || "Home";
        const awayName = match.teams?.away?.name || match.awayTeam?.shortName || "Away";
        const homeCrest = match.teams?.home?.logo || match.homeTeam?.crest;
        const awayCrest = match.teams?.away?.logo || match.awayTeam?.crest;
        const competition = match.league?.name || match.competition?.name || "League";

        return (
            <div className="fixture-card">
                <div className="fixture-row top-row">
                    <span className="fixture-day">{dayLabel}</span>

                    <img className="team-crest" src={homeCrest} alt={homeName} />

                    <div className="line-container">
                        <div className="line" />
                        <span className="fixture-time">{formattedTime}</span>
                    </div>

                    <img className="team-crest" src={awayCrest} alt={awayName} />

                    <span className="fixture-competition">{competition}</span>
                </div>

                <div className="fixture-row bottom-row">
                    <span className="team-name">{homeName}</span>
                    <span className="team-name">{awayName}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixtures">
            <div className="fixtures-header">
                <button
                    className="arrow-button"
                    onClick={() => handlePageChange("prev")}
                    disabled={upcomingMatches.length === 0 || currentPage === 0}
                >
                    &#10094;
                </button>
                <h2>Fixtures</h2>
                <button
                    className="arrow-button"
                    onClick={() => handlePageChange("next")}
                    disabled={upcomingMatches.length === 0 || currentPage === totalPages - 1}
                >
                    &#10095;
                </button>
            </div>

            <div className="fixtures-list">
                {upcomingMatches.length > 0 ? (
                    currentMatches.map((match) => (
                        <FixtureCard key={match.id || match.fixture?.id} match={match} />
                    ))
                ) : (
                    <div className="no-fixtures-message">
                        <p>No upcoming fixtures scheduled</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingFixtures;