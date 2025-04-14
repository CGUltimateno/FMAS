import React, { useMemo } from "react";
import { useGetTeamFormQuery, useGetTeamCrestQuery } from "../../services/footballApi";
import "../../styles/TeamStats/TeamForm.scss";
import apiMappings from "../../../../backend/cache/apiMappings.json";

const MatchResult = ({ match, mappedTeamId, opponentId }) => {
    const { data: crest } = useGetTeamCrestQuery(opponentId, { skip: !opponentId });

    const isTeamHome = String(match.home.id) === String(mappedTeamId);
    const homeScore = match.home.score;
    const awayScore = match.away.score;
    const opponent = isTeamHome ? match.away : match.home;

    let result;
    if (isTeamHome) {
        if (homeScore > awayScore) result = "W";
        else if (homeScore < awayScore) result = "L";
        else result = "D";
    } else {
        if (awayScore > homeScore) result = "W";
        else if (awayScore < homeScore) result = "L";
        else result = "D";
    }

    return (
        <div className={`match-result ${result}`}>
            <span className="score">{`${homeScore}-${awayScore}`}</span>
            {crest ? (
                <img src={crest} alt={`${opponent.name} Crest`} className="opponent-crest" />
            ) : (
                <span className="loading-crest">Loading crest...</span>
            )}
        </div>
    );
};

const TeamForm = ({ details }) => {
    const teamId = details?.id;
    const leagueId = details?.runningCompetitions?.[0]?.id;
    const mappedTeamId = apiMappings.teams[teamId]?.flId;

    const { data: matches, isLoading, error } =
        useGetTeamFormQuery({ teamId, leagueId }, { skip: !mappedTeamId || !leagueId });

    // Utility function to map flId to the normalized team ID
    const getNormalIdFromFlId = (flId) => {
        for (const [id, team] of Object.entries(apiMappings.teams)) {
            if (String(team.flId) === String(flId)) {
                return id;
            }
        }
        return null;
    };

    // Precompute opponent IDs using a memoized array for performance
    const opponentIds = useMemo(() => {
        if (!matches) return [];
        return matches.map((match) => {
            const isTeamHome = String(match.home.id) === String(mappedTeamId);
            const opponent = isTeamHome ? match.away : match.home;
            return getNormalIdFromFlId(opponent.id);
        });
    }, [matches, mappedTeamId]);

    if (isLoading) return <div>Loading form data...</div>;
    if (error) return <div>Error loading form data</div>;
    if (!matches || matches.length === 0) return <div>No recent matches</div>;

    return (
        <div className="team-form">
            <div className="team-performance">
                <h2 className="team-form-h2">Team Form</h2>
                <div className="form-results">
                    {matches.map((match, index) => (
                        <MatchResult
                            key={index}
                            match={match}
                            mappedTeamId={mappedTeamId}
                            opponentId={opponentIds[index]}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamForm;
