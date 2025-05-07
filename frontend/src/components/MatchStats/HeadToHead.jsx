import React from "react";
import { useGetHeadToHeadQuery, useGetTeamCrestQuery } from "../../services/footballApi";
import "../../styles/MatchStats/HeadToHead.scss";
import apiMappings from "../../../../backend/cache/apiMappings.json";

const HeadToHead = ({ team1Id, team2Id }) => {
    // Get mapped IDs for API calls
    const mappedTeam1Id = apiMappings.teams[team1Id]?.flId;
    const mappedTeam2Id = apiMappings.teams[team2Id]?.flId;

    // Fetch team crests
    const { data: team1Crest, error: team1CrestError } = useGetTeamCrestQuery(team1Id);
    const { data: team2Crest, error: team2CrestError } = useGetTeamCrestQuery(team2Id);

    // Fetch head to head matches
    const { data: h2hMatches, isLoading, error: h2hError } = useGetHeadToHeadQuery(
        { team1Id: mappedTeam1Id, team2Id: mappedTeam2Id },
        { skip: !mappedTeam1Id || !mappedTeam2Id }
    );

    if (isLoading) return <div className="head-to-head loading">Loading head to head data...</div>;

    // Handle errors
    if (h2hError) {
        console.error('Error loading head-to-head data:', h2hError); // Log detailed error for debugging
        return (
            <div className="head-to-head error">
                <p>Error loading head-to-head data. Please try again later.</p>
                <pre>{JSON.stringify(h2hError, null, 2)}</pre> {/* Show detailed error for debugging */}
            </div>
        );
    }

    if (team1CrestError || team2CrestError) {
        console.error('Error loading team crests:', team1CrestError || team2CrestError); // Log team crest error
        return (
            <div className="head-to-head error">
                <p>Error loading team crests. Please try again later.</p>
            </div>
        );
    }

    if (!h2hMatches || h2hMatches.length === 0) {
        return <div className="head-to-head empty">No previous matches found</div>;
    }

    // Calculate statistics
    const stats = h2hMatches.reduce(
        (acc, match) => {
            const team1IsHome = String(match.home.id) === String(mappedTeam1Id);
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
                    {team1Crest ? (
                        <img src={team1Crest} alt="Team 1 crest" className="team-crest" />
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
                    {team2Crest ? (
                        <img src={team2Crest} alt="Team 2 crest" className="team-crest" />
                    ) : (
                        <div className="team-crest-placeholder">No Crest</div>
                    )}
                    <span className="wins">{stats.team2Wins}</span>
                </div>
            </div>

            <div className="previous-matches">
                <h3>Previous Matches</h3>
                {h2hMatches.map((match, index) => {
                    const team1IsHome = String(match.home.id) === String(mappedTeam1Id);
                    const team1Score = team1IsHome ? match.home.score : match.away.score;
                    const team2Score = team1IsHome ? match.away.score : match.home.score;

                    return (
                        <div key={index} className="match">
                            <span className="date">
                                {new Date(match.date).toLocaleDateString()}
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
