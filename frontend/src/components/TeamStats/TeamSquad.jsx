import React from 'react';
import { useGetTeamSquadQuery, useGetPlayerImageQuery } from '../../services/footballApi';
import '../../styles/TeamStats/TeamSquad.scss';
import { FaShirt } from 'react-icons/fa6';
import { FaFlag } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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
    console.log("Team Squad Data:", data);

    // Use data?.squad instead of data
    const squad = data?.squad;

    if (isLoading) return <div className="loading-squad">Loading squad...</div>;
    if (error) return <div className="error-squad">Error loading squad data.</div>;
    if (!squad || !Array.isArray(squad) || squad.length === 0) return <div className="no-squad">No squad information available.</div>;

    return (
        <div className="squad-container">
            {squad.map((category) => (
                <div key={category.title} className="team-squad">
                    <h3 className="category-title">{category.title.charAt(0).toUpperCase() + category.title.slice(1)}</h3>
                    <div className="players-grid">
                        {category.members.map((player) => (
                            <div key={player.id} className={`player-card ${player.injured ? 'injured' : ''}`}>
                                <Link to={`/player/${player.id}`}>
                                    <PlayerImage playerId={player.id} />
                                </Link>
                                <div className="player-header">
                                    <Link to={`/player/${player.id}`} className="player-name-link">
                                        <h4 className="player-name">{player.name}</h4>
                                    </Link>
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