import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/TeamStats/TeamForm.scss"; // Ensure this path is correct
import { FaHistory } from "react-icons/fa";

const TeamForm = ({ teamId, matches = [] }) => {
    const location = useLocation();
    const leagueId = location.state?.leagueId;

    const recentMatches = [...matches]
        .sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date))
        .slice(0, 5);

    if (!recentMatches.length) {
        return (
            <div className="ts-bubbleform-xyz-row">
                <div className="ts-bubbleform-xyz-header">
                    <h2><FaHistory className="ts-bubbleform-xyz-icon" /> Recent Form</h2>
                </div>
                <div className="ts-bubbleform-xyz-no-matches">No recent matches available</div>
            </div>
        );
    }

    const getMatchResult = (match) => {
        const { home, away } = match.teams;
        const { home: homeGoals, away: awayGoals } = match.goals;

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

    const formSummary = recentMatches.reduce((acc, match) => {
        const { result } = getMatchResult(match);
        if (result === 'W') acc.wins++;
        else if (result === 'D') acc.draws++;
        else if (result === 'L') acc.losses++;
        return acc;
    }, { wins: 0, draws: 0, losses: 0 });

    return (
        <div className="ts-bubbleform-xyz-row">
            <div className="ts-bubbleform-xyz-header">
                <h2><FaHistory className="ts-bubbleform-xyz-icon" /> Recent Form</h2>
                <div className="ts-bubbleform-xyz-form-record">
                    <span className="ts-bubbleform-xyz-wins">{formSummary.wins}W</span>
                    <span className="ts-bubbleform-xyz-draws">{formSummary.draws}D</span>
                    <span className="ts-bubbleform-xyz-losses">{formSummary.losses}L</span>
                </div>
            </div>

            <div className="ts-bubbleform-xyz-bubbles-container">
                {recentMatches.map((match, index) => {
                    const isTeamHome = match.teams.home.id === parseInt(teamId);
                    const opponent = isTeamHome ? match.teams.away : match.teams.home;
                    const { result } = getMatchResult(match);
                    const { home: homeGoals, away: awayGoals } = match.goals;
                    const teamGoals = isTeamHome ? homeGoals : awayGoals;
                    const opponentGoals = isTeamHome ? awayGoals : homeGoals;
                    const matchLeagueId = match.league?.id;

                    return (
                        <div key={index} className="ts-bubbleform-xyz-bubble-wrapper">
                            <Link to={`/matches/${match.fixture.id}`} state={{ leagueId: matchLeagueId }} className="ts-bubbleform-xyz-match-score ts-bubbleform-xyz-clickable">
                                {teamGoals !== null ? teamGoals : '-'} : {opponentGoals !== null ? opponentGoals : '-'}
                            </Link>
                            <div className={`ts-bubbleform-xyz-form-bubble ts-bubbleform-xyz-${result.toLowerCase()}`}
                                 title={`${isTeamHome ? 'vs' : '@'} ${opponent.name}, ${new Date(match.fixture.date).toLocaleDateString()}`}>
                                <Link
                                    to={`/teams/${opponent.id}`}
                                    state={{leagueId: matchLeagueId}}
                                    className="ts-bubbleform-xyz-opponent-logo-link" // Changed class for clarity
                                >
                                    <img src={opponent.logo} alt={opponent.name} className="ts-bubbleform-xyz-opponent-logo-image"/>
                                </Link>
                                <div className={`ts-bubbleform-xyz-result-indicator ts-bubbleform-xyz-${result.toLowerCase()}`}>{result}</div>
                            </div>
                            <div className="ts-bubbleform-xyz-match-date">
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