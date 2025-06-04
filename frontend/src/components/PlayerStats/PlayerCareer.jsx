import React from "react";
import { FaFutbol, FaFlag, FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import "../../styles/PlayerStats/PlayerCareer.scss";

const PlayerCareer = ({ career, playerNationality }) => {
    if (!career || career.length === 0) {
        return (
            <div className="player-career">
                <h3 className="player-career__title">Career History</h3>
                <p className="player-career__empty">No career data available.</p>
            </div>
        );
    }
    console.log(career)
    console.log(playerNationality)
    // Sort career by most recent seasons first
    const sortedCareer = [...career].sort((a, b) => {
        const aLatest = a.seasons && a.seasons.length > 0 ? Math.max(...a.seasons) : 0;
        const bLatest = b.seasons && b.seasons.length > 0 ? Math.max(...b.seasons) : 0;
        return bLatest - aLatest;
    });

    // More flexible approach to identify international teams
    const isInternationalTeam = (team, nationality) => {
        if (!team || !team.name) return false;

        const teamName = team.name.toLowerCase();
        const playerCountry = nationality ? nationality.toLowerCase() : '';

        // Check if team name contains country name
        if (playerCountry && teamName.includes(playerCountry)) {
            // Check if it's a national team (main team or youth)
            // This will match patterns like "Egypt", "Egypt U23", etc.
            return true;
        }

        // Check for teams with explicit "national team" keywords
        const internationalKeywords = ['national team', 'olympics'];
        if (internationalKeywords.some(keyword => teamName.includes(keyword))) {
            return true;
        }

        // Don't categorize club youth teams as international teams
        return false;
    };

    // Separate clubs from international teams
    const clubs = sortedCareer.filter(item => !isInternationalTeam(item.team, playerNationality));
    const international = sortedCareer.filter(item => isInternationalTeam(item.team, playerNationality));


    // Helper function to format the time period
    const formatPeriod = (seasons) => {
        if (!seasons || seasons.length === 0) return "N/A";

        const sortedSeasons = [...seasons].sort((a, b) => a - b);
        const firstYear = sortedSeasons[0];
        const lastYear = sortedSeasons[sortedSeasons.length - 1];

        if (firstYear === lastYear) return firstYear;
        return `${firstYear} - ${lastYear}`;
    };

    // Helper function to calculate career span in years
    const calculateSpan = (seasons) => {
        if (!seasons || seasons.length === 0) return 0;
        const sortedSeasons = [...seasons].sort((a, b) => a - b);
        return (sortedSeasons[sortedSeasons.length - 1] - sortedSeasons[0]) + 1;
    };

    return (
        <div className="player-career">
            <h3 className="player-career__title">Career Timeline</h3>

            <div className="player-career__section">
                <div className="section-header">
                    <FaFutbol className="section-icon club-icon" />
                    <h4>Club Career</h4>
                </div>

                <div className="career-timeline">
                    {clubs.map((item, index) => (
                        <div className="timeline-item" key={index}>
                            <div className="timeline-connector">
                                <div className="timeline-dot"></div>
                                {index < clubs.length - 1 && <div className="timeline-line"></div>}
                            </div>

                            <div className="timeline-content">
                                <div className="team-logo-container">
                                    {item.team.logo ? (
                                        <img src={item.team.logo} alt={item.team.name} className="team-logo" />
                                    ) : (
                                        <div className="team-logo-placeholder"></div>
                                    )}
                                </div>

                                <div className="team-details">
                                    <h5 className="team-name">{item.team.name || "Unknown Team"}</h5>

                                    <div className="team-period">
                                        <FaCalendarAlt className="period-icon" />
                                        <span>{formatPeriod(item.seasons)}</span>
                                        {calculateSpan(item.seasons) > 1 && (
                                            <span className="duration-badge">
                        {calculateSpan(item.seasons)} years
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {international.length > 0 && (
                <div className="player-career__section">
                    <div className="section-header">
                        <FaFlag className="section-icon national-icon" />
                        <h4>International Career</h4>
                    </div>

                    <div className="career-timeline">
                        {international.map((item, index) => (
                            <div className="timeline-item" key={index}>
                                <div className="timeline-connector">
                                    <div className="timeline-dot national"></div>
                                    {index < international.length - 1 && <div className="timeline-line national"></div>}
                                </div>

                                <div className="timeline-content">
                                    <div className="team-logo-container">
                                        {item.team.logo ? (
                                            <img src={item.team.logo} alt={item.team.name} className="team-logo" />
                                        ) : (
                                            <div className="team-logo-placeholder"></div>
                                        )}
                                    </div>

                                    <div className="team-details">
                                        <h5 className="team-name">{item.team.name || "Unknown Team"}</h5>

                                        <div className="team-period">
                                            <FaCalendarAlt className="period-icon" />
                                            <span>{formatPeriod(item.seasons)}</span>
                                            {calculateSpan(item.seasons) > 1 && (
                                                <span className="duration-badge">
                          {calculateSpan(item.seasons)} years
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerCareer;