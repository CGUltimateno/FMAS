import React, { useEffect, useRef, useState } from "react";
import "../../styles/Dashboard/UpcomingMatches.scss";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useGetMatchesByStatusQuery,
  useGetLatestMatchQuery,
} from "../../services/footballApi";

const SUPPORTED_LEAGUES = [
  2000, // World Cup
  2001, // Champions League
  2002, // Bundesliga
  2003, // Eredivisie
  2013, // Serie A Brazil
  2014, // La Liga
  2015, // Ligue 1
  2016, // Championship
  2019, // Serie A
  2021  // Premier League
];

function transformMatches(apiMatches) {
  // First filter by supported leagues
  const filteredMatches = (apiMatches || []).filter(match =>
      SUPPORTED_LEAGUES.includes(match.competition?.id)
  );

  // Then transform the filtered matches
  return filteredMatches.map((m) => {
    const homeTeam = m.homeTeam.name;
    const awayTeam = m.awayTeam.name;

    const homeGoals = m.score?.fullTime?.home;
    const awayGoals = m.score?.fullTime?.away;
    let score = "-";
    if (homeGoals != null && awayGoals != null) {
      score = `${homeGoals} - ${awayGoals}`;
    }

    let status = m.status;
    if (status === "FINISHED") status = "Full - Time";
    else if (status === "SCHEDULED") status = "Scheduled";

    const dateObj = new Date(m.utcDate);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      id: m.id,
      homeTeam,
      homeTeamId: m.homeTeam.id,
      homeTeamLogo: m.homeTeam.crest,
      awayTeam,
      awayTeamId: m.awayTeam.id,
      awayTeamLogo: m.awayTeam.crest,
      score,
      status,
      date: dateStr,
      time: timeStr,
      competitionId: m.competition?.id
    };
  });
}

const TABS = ["Latest Match", "Coming Match", "Live Games"];

const UpcomingMatches = () => {
  const [activeTab, setActiveTab] = useState("Latest Match");
  const barRef = useRef(null);

  const finishedQuery = useGetLatestMatchQuery();
  const scheduledQuery = useGetMatchesByStatusQuery("SCHEDULED");
  const liveQuery = useGetMatchesByStatusQuery("LIVE");

  const [matchesData, setMatchesData] = useState({
    "Latest Match": [],
    "Coming Match": [],
    "Live Games": [],
  });

  useEffect(() => {
    if (
        finishedQuery.isLoading ||
        scheduledQuery.isLoading ||
        liveQuery.isLoading
    ) {
      return;
    }

    if (finishedQuery.error || scheduledQuery.error || liveQuery.error) {
      console.error("Error fetching one of the queries:", {
        finishedError: finishedQuery.error,
        scheduledError: scheduledQuery.error,
        liveError: liveQuery.error,
      });
      return;
    }

    const finishedMatches = transformMatches(finishedQuery.data?.matches);
    const scheduledMatches = transformMatches(scheduledQuery.data?.matches);
    const liveMatches = transformMatches(liveQuery.data?.matches);

    setMatchesData({
      "Latest Match": finishedMatches,
      "Coming Match": scheduledMatches,
      "Live Games": liveMatches,
    });
  }, [
    finishedQuery.isLoading,
    scheduledQuery.isLoading,
    liveQuery.isLoading,
    finishedQuery.error,
    scheduledQuery.error,
    liveQuery.error,
    finishedQuery.data,
    scheduledQuery.data,
    liveQuery.data,
  ]);

  useEffect(() => {
    const activeTabElement = document.querySelector(".tab-btn.active");
    if (activeTabElement && barRef.current) {
      barRef.current.style.width = `${activeTabElement.offsetWidth}px`;
      barRef.current.style.left = `${activeTabElement.offsetLeft}px`;
    }
  }, [activeTab]);

  const isAnyLoading =
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

        {isAnyLoading && <p style={{ padding: "1rem" }}>Loading matches...</p>}

        <div className="matches-list">
          {matchesData[activeTab].length === 0 ? (
              <p style={{padding: "1rem"}}>{noMatchesMessage[activeTab]}</p>
          ) : (
              matchesData[activeTab].map((match) => (
                  <div className="match-row" key={match.id}>
                    <div className="team-col home-team">
                      {match.homeTeamLogo ? (
                          <img src={match.homeTeamLogo} alt={match.homeTeam}/>
                      ) : (
                          <div className="no-logo"/>
                      )}
                      <Link
                          to={`/teams/${match.homeTeamId}`}
                          state={{ leagueId: match.competitionId }}
                          className="team-name-link"
                      >
                        <span>{match.homeTeam}</span>
                      </Link>
                    </div>

                    <div className="score-container">
                      <div className="score-col">{match.score}</div>
                    </div>

                    <div className="team-col away-team">
                      <Link
                          to={`/teams/${match.awayTeamId}`}
                          state={{ leagueId: match.competitionId }}
                          className="team-name-link"
                      >
                        <span>{match.awayTeam}</span>
                      </Link>
                      {match.awayTeamLogo ? (
                          <img src={match.awayTeamLogo} alt={match.awayTeam}/>
                      ) : (
                          <div className="no-logo"/>
                      )}
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