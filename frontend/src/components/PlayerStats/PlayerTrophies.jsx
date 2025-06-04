import React from "react";
import { FaTrophy, FaMedal, FaGlobeAmericas, FaFutbol } from "react-icons/fa";
import { GiEuropeanFlag, GiWorld } from "react-icons/gi";
import "../../styles/PlayerStats/PlayerTrophies.scss";

const PlayerTrophies = ({ trophies }) => {
    if (!trophies || trophies.length === 0) {
        return (
            <div className="player-trophies empty-state">
                <h3>Trophies & Achievements</h3>
                <p className="empty-message">No trophies or achievements available.</p>
            </div>
        );
    }

    // Group trophies by type (Winners vs Runner-up)
    const winners = trophies.filter(trophy => trophy.place === "Winner");
    const runnersUp = trophies.filter(trophy => trophy.place === "2nd Place" || trophy.place.includes("Runner"));

    // Helper to get icon based on competition type
    const getTrophyIcon = (trophy) => {
        const league = trophy.league?.toLowerCase() || "";
        const country = trophy.country?.toLowerCase() || "";

        if (league.includes("champions league") || league.includes("super cup")) {
            return <GiEuropeanFlag className="trophy-icon european" />;
        } else if (country === "world" || league.includes("world") || league.includes("fifa")) {
            return <GiWorld className="trophy-icon global" />;
        } else if (country === "europe") {
            return <GiEuropeanFlag className="trophy-icon european" />;
        } else if (league.includes("cup")) {
            return <FaFutbol className="trophy-icon cup" />;
        } else {
            return trophy.place === "Winner"
                ? <FaTrophy className="trophy-icon" />
                : <FaMedal className="trophy-icon runner-up" />;
        }
    };

    // Get country flag emoji
    const getCountryFlag = (country) => {
        const countryFlags = {
            "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
            "italy": "🇮🇹",
            "europe": "🇪🇺",
            "world": "🌍",
            "africa": "🌍",
            "switzerland": "🇨🇭"
        };
        return countryFlags[country?.toLowerCase()] || "🏆";
    };

    // Group trophies by decade
    const groupByDecade = (trophyList) => {
        return trophyList.reduce((acc, trophy) => {
            // Extract year from season
            let year;
            if (trophy.season?.includes("/")) {
                year = trophy.season.split("/")[0];
            } else if (/\d{4}/.test(trophy.season)) {
                year = trophy.season.match(/\d{4}/)[0];
            } else {
                year = "Unknown";
            }

            const decade = year !== "Unknown" ? `${Math.floor(parseInt(year) / 10) * 10}s` : "Unknown";

            if (!acc[decade]) acc[decade] = [];
            acc[decade].push({...trophy, year});
            return acc;
        }, {});
    };

    const winnersByDecade = groupByDecade(winners);
    const runnersUpByDecade = groupByDecade(runnersUp);

    return (
        <div className="player-trophies">
            <h3>Trophies & Achievements</h3>

            <div className="trophies-content">
                {winners.length > 0 && (
                    <div className="trophies-section winners">
                        <h4 className="section-title">
                            <FaTrophy className="section-icon" />
                            Winner
                        </h4>

                        {Object.entries(winnersByDecade)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([decade, trophies]) => (
                                <div className="decade-group" key={decade}>
                                    <div className="decade-header">{decade}</div>
                                    <div className="trophy-list">
                                        {trophies
                                            .sort((a, b) => b.year - a.year)
                                            .map((trophy, idx) => (
                                                <div className="trophy-card winner" key={idx}>
                                                    <div className="trophy-header">
                                                        <div className="trophy-icon-container">
                                                            {getTrophyIcon(trophy)}
                                                        </div>
                                                        <div className="trophy-name-container">
                                                            <h5 className="trophy-name">{trophy.league}</h5>
                                                            <div className="trophy-meta">
                                <span className="country">
                                  {getCountryFlag(trophy.country)} {trophy.country}
                                </span>
                                                                <span className="season">{trophy.season}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {runnersUp.length > 0 && (
                    <div className="trophies-section runners-up">
                        <h4 className="section-title">
                            <FaMedal className="section-icon" />
                            Runner-up
                        </h4>

                        {Object.entries(runnersUpByDecade)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([decade, trophies]) => (
                                <div className="decade-group" key={decade}>
                                    <div className="decade-header">{decade}</div>
                                    <div className="trophy-list">
                                        {trophies
                                            .sort((a, b) => b.year - a.year)
                                            .map((trophy, idx) => (
                                                <div className="trophy-card runner-up" key={idx}>
                                                    <div className="trophy-header">
                                                        <div className="trophy-icon-container">
                                                            {getTrophyIcon(trophy)}
                                                        </div>
                                                        <div className="trophy-name-container">
                                                            <h5 className="trophy-name">{trophy.league}</h5>
                                                            <div className="trophy-meta">
                                <span className="country">
                                  {getCountryFlag(trophy.country)} {trophy.country}
                                </span>
                                                                <span className="season">{trophy.season}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerTrophies;