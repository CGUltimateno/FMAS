import React from 'react';
import { useGetTeamSquadQuery } from '../../services/footballApi';
import '../../styles/TeamStats/TeamSquad.scss';
import { FaShirt } from 'react-icons/fa6';
import { FaFlag } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TeamSquad = ({ teamId }) => {
    const { data, isLoading, error } = useGetTeamSquadQuery(teamId);

    if (isLoading) return <div className="loading-squad">Loading squad...</div>;
    if (error) return <div className="error-squad">Error loading squad data.</div>;
    if (!data?.response?.[0]?.players || data.response[0].players.length === 0) {
        return <div className="no-squad">No squad information available.</div>;
    }

    // Extract players from the new API structure
    const players = data.response[0].players;

    // Group players by position
    const groupedPlayers = players.reduce((groups, player) => {
        if (!groups[player.position]) {
            groups[player.position] = [];
        }
        groups[player.position].push(player);
        return groups;
    }, {});

    const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

    const sortedPositions = Object.keys(groupedPlayers).sort(
        (a, b) => positionOrder.indexOf(a) - positionOrder.indexOf(b)
    );

    return (
        <div className="squad-container">
            {sortedPositions.map((position) => (
                <div key={position} className="team-squad">
                    <h3 className="category-title">{position}s</h3>
                    <div className="players-grid">
                        {groupedPlayers[position].map((player) => (
                            <div key={player.id} className="player-card">
                                <Link to={`/player/${player.id}`}>
                                    <div className="player-image">
                                        <img src={player.photo} alt={player.name} />
                                    </div>
                                </Link>
                                <div className="player-squad-header">
                                    <Link to={`/player/${player.id}`} className="player-name-link">
                                        <h4 className="player-name">{player.name}</h4>
                                    </Link>
                                    <div className="player-country">
                                        <span>Age: {player.age}</span>
                                    </div>
                                </div>
                                {player.number && (
                                    <div className="player-number">
                                        <FaShirt />
                                        <span>{player.number}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TeamSquad;