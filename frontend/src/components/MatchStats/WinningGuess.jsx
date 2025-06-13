import React, { useEffect } from 'react';
import { useGetMatchDetailsQuery, usePredictMatchFromFixtureMutation } from '../../services/footballApi';
import '../../styles/MatchStats/WinningGuess.scss';
import { FaChartBar } from 'react-icons/fa';

const WinningGuess = ({ matchId }) => {
  const { data: matchDetailsData, isLoading: isLoadingMatchDetails, error: errorMatchDetails } = useGetMatchDetailsQuery(matchId);
  const [predictMatch, { data: predictionData, isLoading: isLoadingPrediction, error: errorPrediction, isUninitialized }] = usePredictMatchFromFixtureMutation();
  console.log("Prediction Data:", predictionData);
  useEffect(() => {
    if (matchId) {
      predictMatch(matchId);
    }
  }, [matchId, predictMatch]);

  if (isLoadingMatchDetails || (isLoadingPrediction && !isUninitialized)) {
    return (
        <div className="winning-guess loading">
          <div className="loading-spinner"></div>
          <p>Loading prediction...</p>
        </div>
    );
  }

  if (errorMatchDetails || errorPrediction) {
    return (
        <div className="winning-guess error">
          <FaChartBar size={24} />
          <p>Unable to load prediction data</p>
        </div>
    );
  }

  if (!matchDetailsData?.response?.[0]) {
    return (
        <div className="winning-guess error">
          <p>No match data available</p>
        </div>
    );
  }

  const match = matchDetailsData.response[0];
  const homeTeam = match.teams?.home;
  const awayTeam = match.teams?.away;

  const probabilities = predictionData?.probabilities;
  const homeWinProb = probabilities?.H ? (probabilities.H * 100) : 0;
  const drawProb = probabilities?.D ? (probabilities.D * 100) : 0;
  const awayWinProb = probabilities?.A ? (probabilities.A * 100) : 0;

  if (isUninitialized || (isLoadingPrediction && !predictionData)) {
     return (
        <div className="winning-guess loading">
          <div className="loading-spinner"></div>
          <p>Fetching prediction...</p>
        </div>
     );
  }

  if (!probabilities && !isLoadingPrediction) {
    return (
        <div className="winning-guess error">
          <FaChartBar size={24} />
          <p>Prediction data not available for this match.</p>
        </div>
    );
  }


  return (
      <div className="winning-guess">
        <h3 className="guess-title">Match Prediction</h3>

        <div className="probabilities">
          <div className="probability home">
            {homeTeam?.logo && (
                <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo" />
            )}
            <div className="prob-value">{homeWinProb.toFixed(0)}%</div>
            <div className="prob-bar" style={{ height: `${homeWinProb.toFixed(0)}%` }}></div>
            <div className="prob-label">{homeTeam?.name || "Home"}</div>
          </div>

          <div className="probability draw">
            <div className="draw-icon">X</div>
            <div className="prob-value">{drawProb.toFixed(0)}%</div>
            <div className="prob-bar" style={{ height: `${drawProb.toFixed(0)}%` }}></div>
            <div className="prob-label">Draw</div>
          </div>

          <div className="probability away">
            {awayTeam?.logo && (
                <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo" />
            )}
            <div className="prob-value">{awayWinProb.toFixed(0)}%</div>
            <div className="prob-bar" style={{ height: `${awayWinProb.toFixed(0)}%` }}></div>
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