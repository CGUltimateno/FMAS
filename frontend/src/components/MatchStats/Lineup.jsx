import React from 'react';
import { useGetMatchLineupsQuery } from '../../services/footballApi';
import '../../styles/MatchStats/Lineup.scss';

function Lineup({ matchId }) {
    const { data: lineups, isLoading, error } = useGetMatchLineupsQuery(matchId);

    if (isLoading) return <div className="lineup loading">Loading lineups...</div>;

    // Handle errors
    if (error) {
        console.error('Error loading lineups:', error); // Log detailed error for debugging
        return (
            <div className="lineup error">
                <p>Error loading lineups. Please try again later.</p>
                <pre>{JSON.stringify(error, null, 2)}</pre> {/* Show detailed error for debugging */}
            </div>
        );
    }

    // Check if lineups data is available
    if (!lineups || lineups.length < 2) {
        return <div className="lineup empty">No lineup data available</div>;
    }

    const [homeTeam, awayTeam] = lineups;

    return (
        <div className="lineup">
            <h2 className="lineup__title">Starting XI</h2>
            <div className="lineup__container">
                {/* Home Team */}
                <div className="lineup__team">
                    <h3 className="lineup__team-name">{homeTeam.team.name}</h3>
                    {homeTeam.starting.map((player) => (
                        <div className="lineup__player" key={`home-${player.number}`}>
                            <div className="lineup__player-number">{player.number}</div>
                            <div className="lineup__player-info">
                                <span className="lineup__player-name">{player.name}</span>
                                <span className={`lineup__player-position ${player.position.toLowerCase()}`}>
                                    {player.position}
                                </span>
                            </div>
                        </div>
                    ))}

                    <h4 className="lineup__substitutes-title">Substitutes</h4>
                    {homeTeam.substitutes.map((player) => (
                        <div className="lineup__player lineup__player--substitute" key={`home-sub-${player.number}`}>
                            <div className="lineup__player-number">{player.number}</div>
                            <div className="lineup__player-info">
                                <span className="lineup__player-name">{player.name}</span>
                                <span className={`lineup__player-position ${player.position.toLowerCase()}`}>
                                    {player.position}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lineup__divider"></div>

                {/* Away Team */}
                <div className="lineup__team">
                    <h3 className="lineup__team-name">{awayTeam.team.name}</h3>
                    {awayTeam.starting.map((player) => (
                        <div className="lineup__player" key={`away-${player.number}`}>
                            <div className="lineup__player-number">{player.number}</div>
                            <div className="lineup__player-info">
                                <span className="lineup__player-name">{player.name}</span>
                                <span className={`lineup__player-position ${player.position.toLowerCase()}`}>
                                    {player.position}
                                </span>
                            </div>
                        </div>
                    ))}

                    <h4 className="lineup__substitutes-title">Substitutes</h4>
                    {awayTeam.substitutes.map((player) => (
                        <div className="lineup__player lineup__player--substitute" key={`away-sub-${player.number}`}>
                            <div className="lineup__player-number">{player.number}</div>
                            <div className="lineup__player-info">
                                <span className="lineup__player-name">{player.name}</span>
                                <span className={`lineup__player-position ${player.position.toLowerCase()}`}>
                                    {player.position}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Lineup;
