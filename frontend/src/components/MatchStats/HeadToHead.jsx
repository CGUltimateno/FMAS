import React, { useState, useEffect } from "react";
import "../../styles/MatchStats/HeadToHead.scss";
import { useGetHeadToHeadQuery } from "../../services/footballApi";
import { format } from "date-fns";
import { FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

const HeadToHead = ({ team1Id, team2Id }) => {
    const [showAllMatches, setShowAllMatches] = useState(false);
    const [displayCount, setDisplayCount] = useState(5);

    const { data, error, isLoading } = useGetHeadToHeadQuery({
        team1Id,
        team2Id
    }, {
        skip: !team1Id || !team2Id
    });

    // Debug logging to check data structure
    useEffect(() => {
        console.log("HeadToHead data:", data);
    }, [data]);

    if (isLoading) {
        return (
            <div className="head-to-head loading">
                <div className="loading-spinner"></div>
                <p>Loading head to head statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="head-to-head error">
                <h3>Unable to load head to head data</h3>
                <p>{error.message || "Please try again later"}</p>
            </div>
        );
    }

    // Access matches from the correct path in the data
    const h2hMatches = data?.matches || [];

    if (h2hMatches.length === 0) {
        return (
            <div className="head-to-head empty">
                <FaInfoCircle size={24} style={{ marginBottom: "10px" }} />
                <h3>No Head to Head Records</h3>
                <p>There are no previous matches between these teams.</p>
            </div>
        );
    }

    // Extract team info from the first match
    const firstMatch = h2hMatches[0];
    const team1 = firstMatch.teams.home.id === parseInt(team1Id) ? firstMatch.teams.home : firstMatch.teams.away;
    const team2 = firstMatch.teams.away.id === parseInt(team2Id) ? firstMatch.teams.away : firstMatch.teams.home;

    // Calculate stats for the head-to-head summary
    const stats = h2hMatches.reduce(
        (acc, match) => {
            const homeId = match.teams.home.id;
            const awayId = match.teams.away.id;
            const homeGoals = match.goals.home;
            const awayGoals = match.goals.away;

            // Skip matches with null scores (not played yet)
            if (homeGoals === null || awayGoals === null) return acc;

            // Determine which team won
            if (homeId === parseInt(team1Id)) {
                // Team 1 is home
                if (homeGoals > awayGoals) acc.team1Wins++;
                else if (homeGoals < awayGoals) acc.team2Wins++;
                else acc.draws++;
            } else {
                // Team 1 is away
                if (awayGoals > homeGoals) acc.team1Wins++;
                else if (awayGoals < homeGoals) acc.team2Wins++;
                else acc.draws++;
            }

            return acc;
        },
        { team1Wins: 0, team2Wins: 0, draws: 0 }
    );

    // Format date for display
    const formatMatchDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, "d MMM yyyy");
        } catch (e) {
            return dateString;
        }
    };

    // Filter out future matches
    const playedMatches = h2hMatches.filter(
        match => match.goals.home !== null && match.goals.away !== null
    );

    // Sort matches by date (newest first)
    const sortedMatches = [...playedMatches].sort(
        (a, b) => new Date(b.fixture.date) - new Date(a.fixture.date)
    );

    // Limit matches to display
    const matchesToShow = showAllMatches ? sortedMatches : sortedMatches.slice(0, displayCount);
    const hasMoreMatches = sortedMatches.length > displayCount;

    return (
        <div className="head-to-head">
            <h2>Head to Head</h2>

            <div className="h2h-summary">
                <div className="teams-comparison">
                    <div className="team team1">
                        <img src={team1.logo} alt={`${team1.name} logo`} className="team-crest" />
                        <span className="team-name">{team1.name}</span>
                        <div className="wins-container">
                            <span className="wins">{stats.team1Wins}</span>
                            <span className="wins-label">Wins</span>
                        </div>
                    </div>

                    <div className="draws">
                        <div className="draws-circle">{stats.draws}</div>
                        <span>Draws</span>
                    </div>

                    <div className="team team2">
                        <img src={team2.logo} alt={`${team2.name} logo`} className="team-crest" />
                        <span className="team-name">{team2.name}</span>
                        <div className="wins-container">
                            <span className="wins">{stats.team2Wins}</span>
                            <span className="wins-label">Wins</span>
                        </div>
                    </div>
                </div>

                <div className="h2h-summary-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Matches</span>
                        <span className="stat-value">{playedMatches.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Last Match</span>
                        <span className="stat-value">
                            {playedMatches.length > 0 ? formatMatchDate(sortedMatches[0].fixture.date) : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="previous-matches">
                <div className="matches-header">
                    <h3>Previous Matches</h3>
                    <span className="matches-count">{playedMatches.length} matches</span>
                </div>

                <div className="matches-list">
                    {matchesToShow.map((match, index) => {
                        const matchDate = formatMatchDate(match.fixture.date);
                        const homeTeam = match.teams.home;
                        const awayTeam = match.teams.away;
                        const homeScore = match.goals.home;
                        const awayScore = match.goals.away;
                        const homeWinner = homeScore > awayScore;
                        const awayWinner = awayScore > homeScore;

                        return (
                            <div key={index} className="match-card">
                                <div className="match-header">
                                    <div className="match-date">
                                        <FaCalendarAlt className="icon" />
                                        {matchDate}
                                    </div>
                                    <div className="match-competition">
                                        {match.league?.logo && (
                                            <img src={match.league.logo} alt={match.league.name} className="league-logo" />
                                        )}
                                        <span>{match.league?.name || "Unknown League"}</span>
                                    </div>
                                </div>

                                <div className="match-result">
                                    <div className={`team-display ${homeWinner ? 'winner' : ''}`}>
                                        <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo" />
                                        <span className="team-name">{homeTeam.name}</span>
                                        {homeWinner && <FaTrophy className="winner-icon" />}
                                    </div>

                                    <div className="score-display">
                                        <span className={`score ${homeWinner ? 'winner' : ''}`}>{homeScore}</span>
                                        <span className="score-separator">-</span>
                                        <span className={`score ${awayWinner ? 'winner' : ''}`}>{awayScore}</span>
                                    </div>

                                    <div className={`team-display ${awayWinner ? 'winner' : ''}`}>
                                        <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo" />
                                        <span className="team-name">{awayTeam.name}</span>
                                        {awayWinner && <FaTrophy className="winner-icon" />}
                                    </div>
                                </div>

                                {match.fixture.venue?.name && (
                                    <div className="match-venue">
                                        <FaMapMarkerAlt className="icon" />
                                        <span>{match.fixture.venue.name}</span>
                                        {match.fixture.venue.city && <span>, {match.fixture.venue.city}</span>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {hasMoreMatches && (
                    <button
                        className="show-more-button"
                        onClick={() => setShowAllMatches(!showAllMatches)}
                    >
                        {showAllMatches ? (
                            <>Show Less <FaChevronUp /></>
                        ) : (
                            <>Show All Matches <FaChevronDown /></>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default HeadToHead;