import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles/UpcomingMatches.scss";
import { ArrowRight } from "lucide-react";

const TABS = ["Latest Match", "Coming Match", "Live Games"];

function transformMatches(apiMatches) {
  return apiMatches.map((m) => {
    // Basic data
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

    const dateStr = new Date(m.utcDate).toLocaleDateString();

    return {
      id: m.id,
      homeTeam,
      homeTeamLogo: "",
      awayTeam,
      awayTeamLogo: "",
      score,
      status,
      date: dateStr,
    };
  });
}

const UpcomingMatches = () => {
  const [activeTab, setActiveTab] = useState("Latest Match");
  const barRef = useRef(null);

  const [matchesData, setMatchesData] = useState({
    "Latest Match": [],
    "Coming Match": [],
    "Live Games": [],
  });

  useEffect(() => {
    const activeTabElement = document.querySelector(".tab-btn.active");
    if (activeTabElement && barRef.current) {
      barRef.current.style.width = `${activeTabElement.offsetWidth}px`;
      barRef.current.style.left = `${activeTabElement.offsetLeft}px`;
    }
  }, [activeTab]);

  useEffect(() => {
    const API_KEY = "YOUR_API_KEY"; // Replace with your real token

    // Fetch matches by status
    async function fetchMatchesByStatus(status) {
      const res = await axios.get("/api/v4/matches", {
        headers: { "X-Auth-Token": API_KEY },
        params: {
          status,
        },
      });
      return res.data.matches || [];
    }

    const loadAllMatches = async () => {
      try {
        const [finishedMatches, scheduledMatches, liveMatches] = await Promise.all([
          fetchMatchesByStatus("FINISHED"),
          fetchMatchesByStatus("SCHEDULED"),
          fetchMatchesByStatus("LIVE"),
        ]);

        setMatchesData({
          "Latest Match": transformMatches(finishedMatches),
          "Coming Match": transformMatches(scheduledMatches),
          "Live Games": transformMatches(liveMatches),
        });
      } catch (err) {
        console.error("Error fetching matches:", err);
      }
    };

    loadAllMatches();
  }, []);

  return (
      <div className="matches-container">
        <h2 className="matches-title">Football Matches</h2>

        {/* Tabs */}
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

        {/* Match Rows */}
        <div className="matches-list">
          {matchesData[activeTab].map((match) => (
              <div className="match-row" key={match.id}>
                {/* Home Team */}
                <div className="team-col home-team">
                  {match.homeTeamLogo ? (
                      <img src={match.homeTeamLogo} alt={match.homeTeam} />
                  ) : (
                      // Fallback if no logo
                      <div className="no-logo" />
                  )}
                  <span>{match.homeTeam}</span>
                </div>

                {/* Score */}
                <div className="score-container">
                  <div className="score-col">{match.score}</div>
                </div>

                {/* Away Team */}
                <div className="team-col away-team">
                  <span>{match.awayTeam}</span>
                  {match.awayTeamLogo ? (
                      <img src={match.awayTeamLogo} alt={match.awayTeam} />
                  ) : (
                      <div className="no-logo" />
                  )}
                </div>

                {/* Status */}
                <div className="status-col">
                  <span className="match-status">{match.status}</span>
                </div>

                {/* Date */}
                <div className="date-col">{match.date}</div>

                {/* Icon/CTA */}
                <div className="action-col">
                  <ArrowRight size={18} />
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default UpcomingMatches;
