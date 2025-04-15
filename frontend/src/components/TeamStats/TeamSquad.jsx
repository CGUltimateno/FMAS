import React from 'react';
import { useGetTeamSquadQuery, useGetPlayerImageQuery } from '../../services/footballApi';
import '../../styles/TeamStats/TeamSquad.scss';
import { FaShirt } from 'react-icons/fa6';
import { FaFlag } from 'react-icons/fa';

// Player Image component
const PlayerImage = ({ playerId }) => {
    const { data: imageUrl, isLoading, error } = useGetPlayerImageQuery(playerId);

    if (isLoading) return <div className="player-image placeholder"></div>;
    if (error) return <div className="player-image error"></div>;

    return (
        <div className="player-image">
            <img src={imageUrl} alt="Player" />
        </div>
    );
};

const TeamSquad = ({ teamId }) => {
    const { data, isLoading, error } = useGetTeamSquadQuery(teamId);

    if (isLoading) return <div className="loading-squad">Loading squad...</div>;
    if (error) return <div className="error-squad">Error loading squad data.</div>;
    if (!data || !data.length) return <div className="no-squad">No squad information available.</div>;

    return (
        <div className="squad-container">
            {data.map((category) => (
                <div key={category.title} className="team-squad">
                    <h3 className="category-title">{category.title.charAt(0).toUpperCase() + category.title.slice(1)}</h3>
                    <div className="players-grid">
                        {category.members.map((player) => (
                            <div key={player.id} className={`player-card ${player.injured ? 'injured' : ''}`}>
                                <PlayerImage playerId={player.id} />
                                <div className="player-header">
                                    <h4 className="player-name">{player.name}</h4>
                                    <div className="player-country">
                                        <FaFlag />
                                        <span>{player.cname}</span>
                                    </div>
                                </div>
                                {player.shirtNumber && (
                                    <div className="player-number">
                                        <FaShirt />
                                        <span>{player.shirtNumber}</span>
                                    </div>
                                )}
                                {player.injured && (
                                    <span className="injured-badge">Injured</span>
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