import React from 'react';
import "../../styles/PlayerStats/PlayerInfo.scss";
import { FaFlag } from 'react-icons/fa'; // Corrected import

const PlayerInfo = ({ playerData }) => {
  if (!playerData) return <div className="player-info-loading">Loading player details...</div>;

  const player = playerData.player || {};
  const stats = playerData.statistics?.[0] || {};

  const {
    name,
    nationality,
    photo,
    birth,
    height,
    weight,
    age
  } = player;

  const teamName = stats.team?.name || 'N/A';
  const teamLogo = stats.team?.logo || '';
  const position = stats.games?.position || 'N/A';
  const number = stats.games?.number;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPositionMarkerClass = (pos) => {
    if (!pos) return 'cm';
    const p = pos.toLowerCase();
    if (p.includes('goalkeeper')) return 'gk';
    if (p.includes('defender')) return 'cb';
    if (p.includes('midfielder')) return 'cm';
    if (p.includes('attacker') || p.includes('forward')) return 'st';
    if (['lw', 'rw', 'st', 'cf'].some(key => p.includes(key))) return 'st';
    if (['cam', 'cm', 'cdm', 'lm', 'rm'].some(key => p.includes(key))) return 'cm';
    if (['cb', 'lb', 'rb', 'lwb', 'rwb'].some(key => p.includes(key))) return 'cb';
    return 'cm';
  };

  const getPositionAbbreviation = (pos) => {
    if (!pos) return 'N/A';
    const p = pos.toLowerCase();
    if (p.includes('goalkeeper')) return 'GK';
    if (p.includes('defender')) return 'DEF';
    if (p.includes('midfielder')) return 'MID';
    if (p.includes('attacker') || p.includes('forward')) return 'ATT';
    return pos.substring(0, 3).toUpperCase();
  };

  return (
      <div className="player-card">
        <header className="player-header">
          <div className="player-header-content">
            <div className="player-identity">
              <div className="player-image-container">
                <img src={photo || 'default-player-image.png'} alt={name || 'Player'} className="player-image" />
              </div>
              <div className="player-details">
                <h1 className="player-name">{name || 'Unknown Player'}</h1>
                <div className="player-subtitle">
                  {teamLogo && <img className="team-logo" src={teamLogo} alt={teamName} />}
                  <span>{teamName}{number ? ` • #${number}` : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="player-stats">
          <div className="stats-grid">
            <div className="stat">
              <span className="label">Height</span>
              <span className="value">{height || 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="label">Weight</span>
              <span className="value">{weight || 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="label">Age</span>
              <span className="value">{age || 'N/A'} years</span>
            </div>
            <div className="stat">
              <span className="label">Birthdate</span>
              <span className="value">{formatDate(birth?.date)}</span>
            </div>
            <div className="stat">
              <span className="label">Country</span>
              <span className="value country-value">
              {nationality ? <FaFlag className="flag-icon" title={nationality}/> : null}
                {nationality || 'N/A'}
            </span>
            </div>
            <div className="stat">
              <span className="label">Position</span>
              <span className="value">{position}</span>
            </div>
            {number && (
                <div className="stat">
                  <span className="label">Jersey</span>
                  <span className="value">#{number}</span>
                </div>
            )}
          </div>

          <div className="position-block">
            <h4 className="position-title">Primary Position</h4>
            <span className="position-text-detail">{position}</span>
            <div className="position-diagram">
              <div className="pitch">
                <div className={`marker ${getPositionMarkerClass(position)}`}>
                  {getPositionAbbreviation(position)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PlayerInfo;