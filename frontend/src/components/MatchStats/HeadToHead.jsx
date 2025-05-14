import React from "react";
import "../../styles/MatchStats/HeadToHead.scss";

// Static data for teams (PSG vs Arsenal)
const staticData = {
    team1: {
        id: 1,
        name: "PSG",
        crest: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Paris_Saint-Germain_F.C..svg/120px-Paris_Saint-Germain_F.C..svg.png", // Static crest URL for PSG
        wins: 5,
    },
    team2: {
        id: 2,
        name: "Arsenal",
        crest: "https://upload.wikimedia.org/wikipedia/commons/5/53/Arsenal_FC.svg", // Static crest URL for Arsenal
        wins: 3,
    },
    matches: [
        {
            date: "2023-11-15",
            home: {
                id: 1,
                score: 2,
            },
            away: {
                id: 2,
                score: 1,
            },
        },
        {
            date: "2023-05-20",
            home: {
                id: 2,
                score: 1,
            },
            away: {
                id: 1,
                score: 1,
            },
        },
        {
            date: "2022-12-10",
            home: {
                id: 1,
                score: 3,
            },
            away: {
                id: 2,
                score: 0,
            },
        },
    ],
};

const HeadToHead = ({ team1Id, team2Id }) => {
    const team1 = staticData.team1;
    const team2 = staticData.team2;
    const h2hMatches = staticData.matches;

    const stats = h2hMatches.reduce(
        (acc, match) => {
            const team1IsHome = String(match.home.id) === String(team1.id);
            const team1Score = team1IsHome ? match.home.score : match.away.score;
            const team2Score = team1IsHome ? match.away.score : match.home.score;

            if (team1Score > team2Score) acc.team1Wins++;
            else if (team2Score > team1Score) acc.team2Wins++;
            else acc.draws++;

            return acc;
        },
        { team1Wins: 0, team2Wins: 0, draws: 0 }
    );

    return (
        <div className="head-to-head">
            <h2>Head to Head</h2>

            <div className="teams-comparison">
                <div className="team team1">
                    {team1.crest ? (
                        <img src={team1.crest} alt="Team 1 crest" className="team-crest" />
                    ) : (
                        <div className="team-crest-placeholder">No Crest</div>
                    )}
                    <span className="wins">{stats.team1Wins}</span>
                </div>

                <div className="draws">
                    <span>{stats.draws}</span>
                    <span>Draws</span>
                </div>

                <div className="team team2">
                    {team2.crest ? (
                        <img src={team2.crest} alt="Team 2 crest" className="team-crest" />
                    ) : (
                        <div className="team-crest-placeholder">No Crest</div>
                    )}
                    <span className="wins">{stats.team2Wins}</span>
                </div>
            </div>

            <div className="previous-matches">
                <h3>Previous Matches</h3>
                {h2hMatches.map((match, index) => {
                    const team1IsHome = String(match.home.id) === String(team1.id);
                    const team1Score = team1IsHome ? match.home.score : match.away.score;
                    const team2Score = team1IsHome ? match.away.score : match.home.score;

                    return (
                        <div key={index} className="match">
                            <span className="date">
                                {new Date(match.date).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </span>
                            <div className="score">
                                <span className="team1-score">{team1Score}</span>
                                <span className="separator">-</span>
                                <span className="team2-score">{team2Score}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HeadToHead;
