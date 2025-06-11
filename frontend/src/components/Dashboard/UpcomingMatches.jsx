import React, { useEffect, useRef, useState } from "react";
import "../../styles/Dashboard/UpcomingMatches.scss";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useGetMatchesByStatusQuery,
  useGetLatestMatchQuery,
  usePredictAllUpcomingFixturesQuery,
} from "../../services/footballApi";


function transformMatches(data, predictions = []) {
  const apiMatches = data?.response || [];

  return apiMatches.map((m) => {
    const homeTeam = m.teams.home.name;
    const awayTeam = m.teams.away.name;

    const homeGoals = m.goals.home;
    const awayGoals = m.goals.away;
    let score = "-";
    if (homeGoals != null && awayGoals != null) {
      score = `${homeGoals} - ${awayGoals}`;
    }

    let status = m.fixture.status.long;
    if (status === "Match Finished") status = "Full - Time";
    else if (status === "Not Started") status = "Scheduled";

    const dateObj = new Date(m.fixture.date);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const predictionData = predictions.find(p => p.fixture_id === m.fixture.id);

    return {
      id: m.fixture.id,
      homeTeam,
      homeTeamId: m.teams.home.id,
      homeTeamLogo: m.teams.home.logo,
      awayTeam,
      awayTeamId: m.teams.away.id,
      awayTeamLogo: m.teams.away.logo,
      score,
      status,
      date: dateStr,
      time: timeStr,
      competitionId: m.league?.id,
      predictionDetails: predictionData ? predictionData.prediction : null,
    };
  });
}

const TABS = ["Latest Match", "Coming Match", "Live Games"];

const formatPredictionOutcome = (predictionCode) => {
  if (predictionCode === "H") return "Home Win";
  if (predictionCode === "D") return "Draw";
  if (predictionCode === "A") return "Away Win";
  return "";
};

const UpcomingMatches = () => {
  const [activeTab, setActiveTab] = useState("Latest Match");
  const barRef = useRef(null);

  const finishedQuery = useGetLatestMatchQuery();
  const scheduledQuery = useGetMatchesByStatusQuery("SCHEDULED");
  const liveQuery = useGetMatchesByStatusQuery("LIVE");
  const predictionsQuery = usePredictAllUpcomingFixturesQuery(undefined, {
    skip: activeTab !== "Coming Match",
  });


  const [matchesData, setMatchesData] = useState({
    "Latest Match": [],
    "Coming Match": [],
    "Live Games": [],
  });

  useEffect(() => {
    if (
        finishedQuery.isLoading ||
        scheduledQuery.isLoading ||
        liveQuery.isLoading ||
        (activeTab === "Coming Match" && predictionsQuery.isLoading)
    ) {
      return;
    }

    if (finishedQuery.error || scheduledQuery.error || liveQuery.error || (activeTab === "Coming Match" && predictionsQuery.error) ) {
      console.error("Error fetching one of the queries:", {
        finishedError: finishedQuery.error,
        scheduledError: scheduledQuery.error,
        liveError: liveQuery.error,
        predictionsError: predictionsQuery.error,
      });
      return;
    }

    const finishedMatches = transformMatches(finishedQuery.data);
    const scheduledMatches = transformMatches(scheduledQuery.data, activeTab === "Coming Match" ? predictionsQuery.data : []);
    const liveMatches = transformMatches(liveQuery.data);


    setMatchesData({
      "Latest Match": finishedMatches,
      "Coming Match": scheduledMatches,
      "Live Games": liveMatches,
    });
  }, [
    finishedQuery.isLoading,
    scheduledQuery.isLoading,
    liveQuery.isLoading,
    predictionsQuery.isLoading,
    finishedQuery.error,
    scheduledQuery.error,
    liveQuery.error,
    predictionsQuery.error,
    finishedQuery.data,
    scheduledQuery.data,
    liveQuery.data,
    predictionsQuery.data,
    activeTab,
  ]);

  useEffect(() => {
    const activeTabElement = document.querySelector(".tab-btn.active");
    if (activeTabElement && barRef.current) {
      barRef.current.style.width = `${activeTabElement.offsetWidth}px`;
      barRef.current.style.left = `${activeTabElement.offsetLeft}px`;
    }
  }, [activeTab]);

  const isAnyQueryLoading =
      finishedQuery.isLoading || scheduledQuery.isLoading || liveQuery.isLoading;

  const noMatchesMessage = {
    "Latest Match": "No Matches Playing",
    "Coming Match": "No Upcoming Matches",
    "Live Games": "No Live Matches",
  };

  return (
      <div className="matches-container">
        <h2 className="matches-title">Football Matches</h2>

        <div className="matches-tabs">
          {TABS.map((tab) => (
              <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
          ))}
          <div className="tab-bar" ref={barRef}></div>
        </div>

        {isAnyQueryLoading && activeTab !== "Coming Match" && <p style={{ padding: "1rem" }}>Loading matches...</p>}
        {activeTab === "Coming Match" && predictionsQuery.isLoading && <p style={{ padding: "1rem" }}>Loading predictions for upcoming matches...</p>}


        <div className="matches-list">
          {(activeTab === "Coming Match" && predictionsQuery.isLoading) ? null :
           (matchesData[activeTab].length === 0 && !(activeTab === "Coming Match" && predictionsQuery.isLoading)) ? (
              <p style={{padding: "1rem"}}>{noMatchesMessage[activeTab]}</p>
          ) : (
              matchesData[activeTab].map((match) => (
                  <div className="match-row" key={match.id}>
                    <div className="team-col home-team">
                      {match.homeTeamLogo && (
                          <img src={match.homeTeamLogo} alt={match.homeTeam}/>
                      )}
                      {!match.homeTeamLogo && (<div className="no-logo"/>)}
                      <Link
                          to={`/teams/${match.homeTeamId}`}
                          state={{ leagueId: match.competitionId }}
                          className="team-name-link"
                      >
                        <span>{match.homeTeam}</span>
                      </Link>
                      {activeTab === "Coming Match" && match.predictionDetails && match.predictionDetails.probabilities && typeof match.predictionDetails.probabilities.H === 'number' && (
                        <span className="prediction-percentage" style={{ marginLeft: '8px', fontSize: '0.9em', color: '#666' }}>
                          ({(match.predictionDetails.probabilities.H * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>

                    <div className="score-container">
                      <div className="score-col">
                        {activeTab === "Coming Match" && match.predictionDetails ? (
                          <>
                            <div>{formatPredictionOutcome(match.predictionDetails.prediction)}</div>
                            {match.predictionDetails.probabilities && typeof match.predictionDetails.probabilities.D === 'number' && (
                              <div className="prediction-percentage-draw" style={{ fontSize: '0.8em', color: '#555', marginTop: '2px' }}>
                                Draw: {(match.predictionDetails.probabilities.D * 100).toFixed(0)}%
                              </div>
                            )}
                          </>
                        ) : (
                          match.score
                        )}
                      </div>
                    </div>

                    <div className="team-col away-team">
                      {activeTab === "Coming Match" && match.predictionDetails && match.predictionDetails.probabilities && typeof match.predictionDetails.probabilities.A === 'number' && (
                        <span className="prediction-percentage" style={{ marginRight: '8px', fontSize: '0.9em', color: '#666' }}>
                          ({(match.predictionDetails.probabilities.A * 100).toFixed(0)}%)
                        </span>
                      )}
                      <Link
                          to={`/teams/${match.awayTeamId}`}
                          state={{ leagueId: match.competitionId }}
                          className="team-name-link"
                      >
                        <span>{match.awayTeam}</span>
                      </Link>
                      {match.awayTeamLogo && (
                          <img src={match.awayTeamLogo} alt={match.awayTeam}/>
                      )}
                       {!match.awayTeamLogo && (<div className="no-logo"/>)}
                    </div>

                    <div className="status-col">
                      <span className="match-status">{match.status}</span>
                    </div>

                    <div className="date-col">
                      {match.date} {match.time}
                    </div>

                    <div className="action-col">
                      <Link
                          to={`/matches/${match.id}`}
                          state={{ leagueId: match.competitionId }}
                          className="action-link"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
              ))
          )}
        </div>
      </div>
  );
};

export default UpcomingMatches;

