import React from 'react';
import { useGetTeamFixturesQuery } from '../../services/footballApi';
import { Link } from 'react-router-dom';
import { FaHistory, FaChevronRight } from 'react-icons/fa'; // Removed FaHome, FaPlane as they are not used
import '../../styles/MatchStats/MatchTeamsForm.scss';

const MatchTeamsForm = ({ teamAId, teamBId, leagueId: propLeagueId }) => { // Renamed leagueId prop for clarity
                                                                           // Ensure team IDs are parsed as integers
  const teamAIdInt = parseInt(teamAId, 10);
  const teamBIdInt = parseInt(teamBId, 10);

  // Fetch fixtures for both teams
  const { data: teamAData, isLoading: isLoadingTeamA } = useGetTeamFixturesQuery(
      teamAIdInt,
      { skip: isNaN(teamAIdInt) || teamAIdInt <= 0 }
  );
  const { data: teamBData, isLoading: isLoadingTeamB } = useGetTeamFixturesQuery(
      teamBIdInt,
      { skip: isNaN(teamBIdInt) || teamBIdInt <= 0 }
  );

  if (isLoadingTeamA || isLoadingTeamB) {
    return <div className="matchdetails-teamform-xz9-loading-state">Loading team form...</div>;
  }

  // Check for data availability after loading is complete
  const teamAMatchesData = teamAData?.response;
  const teamBMatchesData = teamBData?.response;

  if ((!isLoadingTeamA && !teamAMatchesData) || (!isLoadingTeamB && !teamBMatchesData)) {
    return <div className="matchdetails-teamform-xz9-error-state">Unable to load team form data for one or both teams.</div>;
  }

  // Process team A matches (ensure data exists before slicing)
  const teamAMatches = teamAMatchesData ? teamAMatchesData.slice(0, 5) : [];
  const teamA = teamAMatches[0]?.teams.home.id === teamAIdInt
      ? teamAMatches[0]?.teams.home
      : teamAMatches[0]?.teams.away;

  // Process team B matches (ensure data exists before slicing)
  const teamBMatches = teamBMatchesData ? teamBMatchesData.slice(0, 5) : [];
  const teamB = teamBMatches[0]?.teams.home.id === teamBIdInt
      ? teamBMatches[0]?.teams.home
      : teamBMatches[0]?.teams.away;

  const getMatchResult = (match, teamId) => {
    const { home, away } = match.teams;
    const { home: homeGoals, away: awayGoals } = match.goals;

    if (homeGoals === null || awayGoals === null) {
      return { result: 'U', resultText: 'Upcoming' };
    }

    const isTeamHome = home.id === teamId;
    const teamGoals = isTeamHome ? homeGoals : awayGoals;
    const opponentGoals = isTeamHome ? awayGoals : homeGoals;

    if (teamGoals > opponentGoals) {
      return { result: 'W', resultText: 'Win' };
    } else if (teamGoals < opponentGoals) {
      return { result: 'L', resultText: 'Loss' };
    } else {
      return { result: 'D', resultText: 'Draw' };
    }
  };

  const getFormSummary = (matches, teamId) => {
    if (!matches || matches.length === 0) return { wins: 0, draws: 0, losses: 0 };
    return matches.reduce((acc, match) => {
      const { result } = getMatchResult(match, teamId);
      if (result === 'W') acc.wins++;
      else if (result === 'D') acc.draws++;
      else if (result === 'L') acc.losses++;
      return acc;
    }, { wins: 0, draws: 0, losses: 0 });
  };

  const teamAFormSummary = getFormSummary(teamAMatches, teamAIdInt);
  const teamBFormSummary = getFormSummary(teamBMatches, teamBIdInt);

  const renderTeamForm = (teamDisplayInfo, matches, teamId, formSummary) => {
    if (!teamDisplayInfo && matches.length === 0) {
      return (
          <div className="matchdetails-teamform-xz9-panel-empty">
            <p>No team data available.</p>
          </div>
      );
    }

    return (
        <div className="matchdetails-teamform-xz9-panel">
          <div className="matchdetails-teamform-xz9-header-wrapper">
            <div className="matchdetails-teamform-xz9-team-identity-container">
              <img
                  src={teamDisplayInfo?.logo}
                  alt={teamDisplayInfo?.name}
                  className="matchdetails-teamform-xz9-team-logo-image"
              />
              <h3 className="matchdetails-teamform-xz9-team-name-text">{teamDisplayInfo?.name}</h3>
            </div>
            <div className="matchdetails-teamform-xz9-record-summary">
              <span className="matchdetails-teamform-xz9-wins-count">{formSummary.wins}W</span>
              <span className="matchdetails-teamform-xz9-draws-count">{formSummary.draws}D</span>
              <span className="matchdetails-teamform-xz9-losses-count">{formSummary.losses}L</span>
            </div>
          </div>

          <div className="matchdetails-teamform-xz9-matches-list">
            {matches.length > 0 ? matches.map((match, index) => {
              const isTeamHome = match.teams.home.id === teamId;
              const opponent = isTeamHome ? match.teams.away : match.teams.home;
              const { result } = getMatchResult(match, teamId);
              const { home: homeGoals, away: awayGoals } = match.goals;
              const teamGoals = isTeamHome ? homeGoals : awayGoals;
              const opponentGoals = isTeamHome ? awayGoals : homeGoals;
              const matchSpecificLeagueId = match.league?.id; // Use match's leagueId if available
              const matchDate = new Date(match.fixture.date);

              return (
                  <Link
                      to={`/matches/${match.fixture.id}`} // Changed to /matches/
                      state={{ leagueId: matchSpecificLeagueId || propLeagueId }} // Pass leagueId in state
                      key={`${match.fixture.id}-${index}`}
                      className="matchdetails-teamform-xz9-match-item"
                  >
                    <div className={`matchdetails-teamform-xz9-result-badge ${result.toLowerCase()}`}>{result}</div>
                    <div className="matchdetails-teamform-xz9-match-info">
                      <div className="matchdetails-teamform-xz9-match-date">
                        {matchDate.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="matchdetails-teamform-xz9-teams-info">
                        <Link
                            to={`/teams/${opponent.id}`}
                            state={{leagueId: matchSpecificLeagueId || propLeagueId}}
                            className="matchdetails-teamform-xz9-opponent-link"
                            onClick={(e) => e.stopPropagation()} // Prevent parent Link navigation
                        >
                          <img src={opponent.logo} alt={opponent.name} className="matchdetails-teamform-xz9-opponent-logo" />
                          <span className="matchdetails-teamform-xz9-opponent-name">{opponent.name}</span>
                        </Link>
                      </div>
                    </div>
                    <div className="matchdetails-teamform-xz9-score-display">
                      <span>{teamGoals !== null ? teamGoals : '-'}</span>
                      <span className="matchdetails-teamform-xz9-score-separator">:</span>
                      <span>{opponentGoals !== null ? opponentGoals : '-'}</span>
                    </div>
                    <FaChevronRight className="matchdetails-teamform-xz9-arrow-icon" />
                  </Link>
              );
            }) : <p className="matchdetails-teamform-xz9-no-data-message">No recent matches to display.</p>}
          </div>
        </div>
    );
  };

  const shouldRenderTeamAForm = !isNaN(teamAIdInt) && teamAIdInt > 0;
  const shouldRenderTeamBForm = !isNaN(teamBIdInt) && teamBIdInt > 0;

  return (
      <section className="matchdetails-teamform-xz9-section-container">
        <h2 className="matchdetails-teamform-xz9-main-title">
          <FaHistory className="matchdetails-teamform-xz9-title-icon" /> Recent Form
        </h2>
        <div className="matchdetails-teamform-xz9-teams-container">
          {shouldRenderTeamAForm ? renderTeamForm(teamA, teamAMatches, teamAIdInt, teamAFormSummary) :
              <div className="matchdetails-teamform-xz9-panel-empty"><p>Team A data unavailable.</p></div>}
          {shouldRenderTeamBForm ? renderTeamForm(teamB, teamBMatches, teamBIdInt, teamBFormSummary) :
              <div className="matchdetails-teamform-xz9-panel-empty"><p>Team B data unavailable.</p></div>}
        </div>
      </section>
  );
};

export default MatchTeamsForm;