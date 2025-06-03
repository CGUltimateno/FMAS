import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/TeamStats/TeamForm.scss";
import { FaHistory } from "react-icons/fa";

const TeamForm = ({ teamId, matches = [] }) => {
    const location = useLocation();
    const leagueId = location.state?.leagueId;

    const recentMatches = [...matches]
        .sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date))
        .slice(0, 5); // Take only the last 5 matches

    if (!recentMatches.length) {
        return (
            <div className="team-form-row">
                <div className="team-form-header">
                    <h2><FaHistory className="icon" /> Recent Form</h2>
                </div>
                <div className="no-matches">No recent matches available</div>
            </div>
        );
    }

    // Determine results for the team
    const getMatchResult = (match) => {
        const { home, away } = match.teams;
        const { home: homeGoals, away: awayGoals } = match.goals;

        // Skip if we don't have scores yet
        if (homeGoals === null || awayGoals === null) {
            return { result: 'U', resultText: 'Upcoming' };
        }

        const isTeamHome = home.id === parseInt(teamId);
        const teamGoals = isTeamHome ? homeGoals : awayGoals;
        const opponentGoals = isTeamHome ? awayGoals : homeGoals;

        if (teamGoals > opponentGoals) {
            return { result: 'W', resultText: 'Win' };
        } else if (teamGoals < opponentGoals) {
            return { result: 'L', resultText: 'Loss' };
        } else {
            return { result: 'D', resultText: 'Draw' };
        }
    };

    // Count W/D/L records
    const formSummary = recentMatches.reduce((acc, match) => {
        const { result } = getMatchResult(match);
        if (result === 'W') acc.wins++;
        else if (result === 'D') acc.draws++;
        else if (result === 'L') acc.losses++;
        return acc;
    }, { wins: 0, draws: 0, losses: 0 });

    return (
        <div className="team-form-row">
            <div className="team-form-header">
                <h2><FaHistory className="icon" /> Recent Form</h2>
                <div className="form-record">
                    <span className="wins">{formSummary.wins}W</span>
                    <span className="draws">{formSummary.draws}D</span>
                    <span className="losses">{formSummary.losses}L</span>
                </div>
            </div>

            <div className="form-bubbles-container">
                {recentMatches.map((match, index) => {
                    const isTeamHome = match.teams.home.id === parseInt(teamId);
                    const opponent = isTeamHome ? match.teams.away : match.teams.home;
                    const { result } = getMatchResult(match); // Removed unused resultText
                    const { home: homeGoals, away: awayGoals } = match.goals;
                    const teamGoals = isTeamHome ? homeGoals : awayGoals;
                    const opponentGoals = isTeamHome ? awayGoals : homeGoals;

                    const matchLeagueId = match.league?.id;

                    return (
                        <div key={index} className="form-bubble-wrapper">
                            <Link to={`/match/${match.fixture.id}`} className="match-score clickable">
                                {teamGoals !== null ? teamGoals : '-'} : {opponentGoals !== null ? opponentGoals : '-'}
                            </Link>
                            <div className={`form-bubble ${result.toLowerCase()}`}
                                 title={`${isTeamHome ? 'vs' : '@'} ${opponent.name}, ${new Date(match.fixture.date).toLocaleDateString()}`}>
                                <Link
                                    to={`/teams/${opponent.id}`}
                                    state={{leagueId: matchLeagueId}}  // Pass the specific match's leagueId
                                    className="opponent-logo"
                                >
                                    <img src={opponent.logo} alt={opponent.name}/>
                                </Link>
                                <div className="result-indicator">{result}</div>
                            </div>
                            <div className="match-date">
                                {new Date(match.fixture.date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short'
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamForm;