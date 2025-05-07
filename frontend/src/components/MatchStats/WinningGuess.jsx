import React from 'react';
import { useGetMatchDetailsQuery } from '../../services/footballApi';
import '../../styles/MatchStats/WinningGuess.scss';

const WinningGuess = ({ matchId }) => {
  const { data: matchDetails, isLoading, error } = useGetMatchDetailsQuery(matchId);

  // Loading state
  if (isLoading) {
    return <div className="winning-guess loading">Loading prediction...</div>;
  }

  // Error state
  if (error) {
    console.error('Error loading match details:', error);  // Log the error for debugging
    return (
      <div className="winning-guess error">
        <p>Error loading prediction. Please try again later.</p>
        <pre>{JSON.stringify(error, null, 2)}</pre> {/* Show detailed error in the console */}
      </div>
    );
  }

  // Default probabilities (this can be dynamic or calculated based on match data)
  const probabilities = {
    homeWin: 45,
    draw: 25,
    awayWin: 30
  };

  // Handle case where team crest or details might be missing
  const renderTeamLogo = (team) => {
    return team?.crest ? (
      <img src={team.crest} alt={team.name} className="team-logo" />
    ) : (
      <div className="team-logo-placeholder">No Logo</div>
    );
  };

  return (
    <div className="winning-guess">
      <h3 className="guess-title">Match Prediction</h3>
      <div className="probabilities">
        <div className="probability home">
          {renderTeamLogo(matchDetails?.homeTeam)}
          <div className="prob-value">{probabilities.homeWin}%</div>
          <div className="prob-bar" style={{ height: `${probabilities.homeWin}%` }}></div>
          <div className="prob-label">Home Win</div>
        </div>

        <div className="probability draw">
          <div className="prob-value">{probabilities.draw}%</div>
          <div className="prob-bar" style={{ height: `${probabilities.draw}%` }}></div>
          <div className="prob-label">Draw</div>
        </div>

        <div className="probability away">
          {renderTeamLogo(matchDetails?.awayTeam)}
          <div className="prob-value">{probabilities.awayWin}%</div>
          <div className="prob-bar" style={{ height: `${probabilities.awayWin}%` }}></div>
          <div className="prob-label">Away Win</div>
        </div>
      </div>
    </div>
  );
};

export default WinningGuess;
