import React from 'react';
import { useGetTeamFormQuery } from '../../services/footballApi';
import '../../styles/MatchStats/TeamForm.scss';

const TeamForm = ({ teamAId, teamBId, leagueId }) => {
  const { data: teamAForm, isLoading: loadingA, error: errorA } = useGetTeamFormQuery({ 
    teamId: teamAId, 
    leagueId 
  });
  const { data: teamBForm, isLoading: loadingB, error: errorB } = useGetTeamFormQuery({ 
    teamId: teamBId, 
    leagueId 
  });

  if (loadingA || loadingB) {
    return <div className="team-form-section loading">Loading team forms...</div>;
  }

  // Handle errors for both teams
  if (errorA || errorB) {
    return (
      <div className="team-form-section error">
        <p>Error loading team forms. Please try again later.</p>
        <pre>{JSON.stringify({ errorA, errorB }, null, 2)}</pre>
      </div>
    );
  }

  // Render result indicator with styling based on the result (Win, Draw, Loss)
  const renderResultIndicator = (result) => {
    let className = 'result-indicator ';
    switch(result) {
      case 'W': className += 'win'; break;
      case 'D': className += 'draw'; break;
      case 'L': className += 'loss'; break;
      default: className += 'unknown';
    }
    return <div className={className}>{result}</div>;
  };

  // Render the team form panel with match history and results
  const renderTeamPanel = (teamData) => {
    if (!teamData || !teamData.matches) {
      return <div className="team-form-panel empty">No data available for this team.</div>;
    }

    return (
      <div className="team-form-panel">
        <div className="team-header">
          <img src={teamData.team.crest} alt={teamData.team.name} className="team-logo" />
          <h3>{teamData.team.name}</h3>
          <div className="form-summary">
            {teamData.matches.map((match, index) => (
              <div 
                key={index} 
                className={`form-dot ${match.result.toLowerCase()}`} 
                title={`${match.result === 'W' ? 'Win' : match.result === 'D' ? 'Draw' : 'Loss'} against ${match.opponent}`}
              />
            ))}
          </div>
        </div>
        
        <div className="match-list">
          {teamData.matches.map((match, index) => (
            <div key={index} className="match-item">
              {renderResultIndicator(match.result)}
              <div className="match-details">
                <div className="match-date-comp">
                  <span className="match-date">
                    {new Date(match.date).toLocaleDateString()}
                  </span>
                  <span className="match-competition">{match.competition}</span>
                </div>
                <div className="match-score-opponent">
                  <span className="match-score">{match.score}</span>
                  <span className="match-opponent">{match.opponent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="team-form-section">
      <h2>Team Form</h2>
      <div className="team-form-container">
        {renderTeamPanel(teamAForm)}
        {renderTeamPanel(teamBForm)}
      </div>
    </section>
  );
};

export default TeamForm;
