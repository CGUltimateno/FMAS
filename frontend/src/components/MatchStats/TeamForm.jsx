import React from 'react';
import '../../styles/MatchStats/TeamForm.scss';

const TeamForm = () => {
  const staticTeamAForm = {
    team: {
      name: "Paris Saint-Germain FC",
      crest: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png"
    },
    matches: [
      { result: "W", date: "2025-04-30", competition: "Ligue 1", score: "3-1", opponent: "Marseille" },
      { result: "W", date: "2025-04-24", competition: "Ligue 1", score: "2-0", opponent: "Lyon" },
      { result: "D", date: "2025-04-20", competition: "Ligue 1", score: "1-1", opponent: "Rennes" },
      { result: "W", date: "2025-04-16", competition: "UCL", score: "2-1", opponent: "Real Madrid" },
      { result: "L", date: "2025-04-10", competition: "UCL", score: "0-1", opponent: "Bayern" }
    ]
  };

  const staticTeamBForm = {
    team: {
      name: "Arsenal FC",
      crest: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"
    },
    matches: [
      { result: "L", date: "2025-04-30", competition: "Premier League", score: "0-2", opponent: "Man City" },
      { result: "W", date: "2025-04-25", competition: "Premier League", score: "4-1", opponent: "Chelsea" },
      { result: "D", date: "2025-04-20", competition: "Premier League", score: "2-2", opponent: "Liverpool" },
      { result: "W", date: "2025-04-15", competition: "UCL", score: "3-2", opponent: "Inter" },
      { result: "W", date: "2025-04-09", competition: "UCL", score: "1-0", opponent: "Dortmund" }
    ]
  };

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

  const renderTeamPanel = (teamData) => {
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
                    {new Date(match.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
        {renderTeamPanel(staticTeamAForm)}
        {renderTeamPanel(staticTeamBForm)}
      </div>
    </section>
  );
};

export default TeamForm;
