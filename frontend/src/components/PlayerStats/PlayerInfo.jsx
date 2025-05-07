import React from 'react';
import "../../styles/PlayerStats/PlayerInfo.scss";
import { FaFlag } from 'react-icons/fa';
import { useGetPlayerImageQuery } from '../../services/footballApi';

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

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const ageDiffMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getFlDetailValue = (detailsArray, key) => {
  return detailsArray?.find(d => d.translationKey === key)?.value?.fallback ?? 'N/A';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const mapPositionToClass = (position, section) => {
  // First try to use the more specific section if available
  if (section) {
    // Normalize by removing both hyphens AND spaces
    const sectionNormalized = section.toLowerCase().trim().replace(/[-\s]/g, '');

    const sectionMap = {
      'centreback': 'cb',
      'centerback': 'cb',
      'goalkeeper': 'gk',
      'rightback': 'rb',
      'leftback': 'lb',
      'defensivemidfield': 'cdm',
      'centralmidfield': 'cm',
      'attackingmidfield': 'cam',
      'rightmidfield': 'rm',
      'leftmidfield': 'lm',
      'rightwinger': 'rw',
      'leftwinger': 'lw',
      'striker': 'st',
      'centreforward': 'st',
      'centerforward': 'st',
      'rightforward': 'rf',
      'leftforward': 'lf',
      'rightwingback': 'rwb',
      'leftwingback': 'lwb'
    };

    if (sectionMap[sectionNormalized]) {
      return sectionMap[sectionNormalized];
    }
  }

  // Fall back to position if section mapping failed
  if (!position) return 'cm'; // default position

  // Normalize position the same way - removing spaces and hyphens
  const posNormalized = position.toLowerCase().trim().replace(/[-\s]/g, '');

  // Generic position mapping
  const positionMap = {
    'defence': 'cb',
    'defender': 'cb',
    'midfield': 'cm',
    'midfielder': 'cm',
    'attack': 'st',
    'attacker': 'st',
    'forward': 'st',
    'goalkeeper': 'gk',
    'rightwinger': 'rw',
    'leftwinger': 'lw',
    'rightmidfielder': 'rm',
    'leftmidfielder': 'lm'
  };

  return positionMap[posNormalized] || 'cm';
};

const PlayerInfo = ({ player }) => {
  if (!player) return <p>Loading...</p>;

  const info = player.info || {};
  const flDetails = player.fl?.detail || [];
  const teamName = player.teamName || info.currentTeam?.name || "N/A";
  const nationality = info.nationality || getFlDetailValue(flDetails, "country_sentencecase");
  const height = getFlDetailValue(flDetails, "height_sentencecase");
  const preferredFoot = getFlDetailValue(flDetails, "preferred_foot");
  const marketValue = getFlDetailValue(flDetails, "transfer_value");
  const shirt = info.shirtNumber ? `#${info.shirtNumber}` : getFlDetailValue(flDetails, "shirt");
  const teamLogo = player.teamLogoUrl || info.currentTeam?.crest;
  const countryCode = flDetails.find(d => d.translationKey === "country_sentencecase")?.countryCode;

  // Use both position and section for accurate positioning
  const position = mapPositionToClass(info.position, info.section);

  return (
      <div className="player-card">
        <header className="player-header" style={{ backgroundColor: player.teamColor || info.currentTeam?.clubColors?.split('/')[0] || '#0a66c2' }}>
          <div className="player-header__left">
            <div className="player-image-container">

              <PlayerImage playerId={info.id}/>
            </div>
            <div className="player-info-wrapper">
              <h1 className="player-name">{info.name || 'N/A'}</h1>
              <div className="player-subtitle">
                {teamLogo
                    ? <img className="team-logo" src={teamLogo} alt={teamName}/>
                    : <div className="team-logo--placeholder"/>
                }
                <span>{teamName}</span>
              </div>
            </div>
          </div>
          <button className="follow-button">Follow</button>
        </header>

        <div className="player-stats">
          <div className="stats-grid">
            <div className="stat">
              <span className="label">Height</span>
              <span className="value">{height}</span>
            </div>
            <div className="stat">
              <span className="label">Shirt</span>
              <span className="value">{shirt}</span>
            </div>

            <div className="stat">
              <span className="secondary">{formatDate(info.dateOfBirth)}</span>
              <span className="value">{calculateAge(info.dateOfBirth)} years</span>
            </div>
            <div className="stat">
              <span className="label">Preferred foot</span>
              <span className="value">{preferredFoot}</span>
            </div>

            <div className="stat">
              <span className="label">Country</span>
              <span className="value country-value">
     {nationality}
              </span>
            </div>
            <div className="stat">
              <span className="label">Market value</span>
              <span className="value highlight">{marketValue}</span>
            </div>
          </div>

          <div className="position-block">
            <span className="label">Position</span>
            <span className="role">Primary</span>
            <span className="position-text">{info.section || info.position}</span>

            <div className="position-diagram">
              <div className="pitch">
                <div className={`marker ${position}`}>{position.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PlayerInfo;