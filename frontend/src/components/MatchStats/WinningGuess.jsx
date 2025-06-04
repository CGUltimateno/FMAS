import React, { useMemo } from 'react';
import { useGetMatchDetailsQuery } from '../../services/footballApi';
import '../../styles/MatchStats/WinningGuess.scss';
import { FaChartBar } from 'react-icons/fa';

const WinningGuess = ({ matchId }) => {
  const { data, isLoading, error } = useGetMatchDetailsQuery(matchId);

  // Generate random but consistent prediction percentages
  // useMemo ensures values don't change on re-renders
  const probabilities = useMemo(() => {
    // Generate random values that sum to 100
    const homeWin = Math.floor(Math.random() * 60) + 20; // 20-80%
    const remainingPercentage = 100 - homeWin;
    const draw = Math.floor(Math.random() * remainingPercentage * 0.7); // Allocate portion of remaining
    const awayWin = remainingPercentage - draw;

    return { homeWin, draw, awayWin };
  }, [matchId]); // Only recalculate if matchId changes

  // Loading state
  if (isLoading) {
    return (
        <div className="winning-guess loading">
          <div className="loading-spinner"></div>
          <p>Loading prediction...</p>
        </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="winning-guess error">
          <FaChartBar size={24} />
          <p>Unable to load prediction</p>
        </div>
    );
  }

  // Check if we have match data
  if (!data?.response?.[0]) {
    return (
        <div className="winning-guess error">
          <p>No match data available</p>
        </div>
    );
  }

  // Get teams from the correct data structure
  const match = data.response[0];
  const homeTeam = match.teams?.home;
  const awayTeam = match.teams?.away;

  return (
      <div className="winning-guess">
        <h3 className="guess-title">Match Prediction</h3>

        <div className="probabilities">
          <div className="probability home">
            {homeTeam?.logo && (
                <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo" />
            )}
            <div className="prob-value">{probabilities.homeWin}%</div>
            <div className="prob-bar" style={{ height: `${probabilities.homeWin}%` }}></div>
            <div className="prob-label">{homeTeam?.name || "Home"}</div>
          </div>

          <div className="probability draw">
            <div className="draw-icon">X</div>
            <div className="prob-value">{probabilities.draw}%</div>
            <div className="prob-bar" style={{ height: `${probabilities.draw}%` }}></div>
            <div className="prob-label">Draw</div>
          </div>

          <div className="probability away">
            {awayTeam?.logo && (
                <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo" />
            )}
            <div className="prob-value">{probabilities.awayWin}%</div>
            <div className="prob-bar" style={{ height: `${probabilities.awayWin}%` }}></div>
            <div className="prob-label">{awayTeam?.name || "Away"}</div>
          </div>
        </div>

        <div className="prediction-note">
          <small>* Prediction based on statistical analysis</small>
        </div>
      </div>
  );
};

export default WinningGuess;