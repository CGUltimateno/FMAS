import React, { useState } from "react";
import "../../styles/TeamStats/UpcomingFixtures.scss";

const UpcomingFixtures = ({ matches }) => {
    const [currentPage, setCurrentPage] = useState(0);

    // Decide how many matches per page
    const matchesPerPage = 5;

    // Filter only future matches
    const upcomingMatches = matches.filter((match) => new Date(match.utcDate) > new Date());
    if (!upcomingMatches || upcomingMatches.length === 0) {
        return <p>No upcoming fixtures.</p>;
    }

    // Calculate total pages
    const totalPages = Math.ceil(upcomingMatches.length / matchesPerPage);

    // Slice out the matches for the current page
    const currentMatches = upcomingMatches.slice(
        currentPage * matchesPerPage,
        (currentPage + 1) * matchesPerPage
    );

    // Page nav
    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            if (direction === "next") {
                return (prevPage + 1) % totalPages;
            } else {
                return (prevPage - 1 + totalPages) % totalPages;
            }
        });
    };

    // A small helper for each fixture’s layout
    const FixtureCard = ({ match }) => {
        const matchDate = new Date(match.utcDate);
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
                weekday: "long", // e.g., "Monday"
                month: "short",  // e.g., "Jan"
                day: "numeric",  // e.g., "1"
            });
        }

        const formattedTime = matchDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const homeName = match.homeTeam.shortName || "Home";
        const awayName = match.awayTeam.shortName || "Away";
        const homeCrest = match.homeTeam.crest;
        const awayCrest = match.awayTeam.crest;
        const competition = match.competition?.name || "League";

        return (
            <div className="fixture-card">
                {/* Top Row */}
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

                {/* Bottom Row */}
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
                    disabled={currentPage === 0}
                >
                    &#10094;
                </button>
                <h2>Fixtures</h2>
                <button
                    className="arrow-button"
                    onClick={() => handlePageChange("next")}
                    disabled={currentPage === totalPages - 1}
                >
                    &#10095;
                </button>
            </div>

            {/* List of fixture cards */}
            <div className="fixtures-list">
                {currentMatches.map((match) => (
                    <FixtureCard key={match.id} match={match} />
                ))}
            </div>
        </div>
    );
};

export default UpcomingFixtures;
