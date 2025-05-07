import React from "react";
import "../../styles/PlayerStats/PlayerCareer.scss";

const PlayerCareer = () => {
  const career = [
    { team: "El Mokawloon", years: "2010–2012", Matches: 38, goals: 11 },
    { team: "FC Basel", years: "2012–2014", Matches: 47, goals: 9 },
    { team: "Chelsea", years: "2014–2016", Matches: 13, goals: 2 },
    { team: "Fiorentina (loan)", years: "2015", Matches: 16, goals: 6 },
    { team: "AS Roma", years: "2015–2017", Matches: 65, goals: 29 },
    { team: "Liverpool", years: "2017–present", Matches: 220, goals: 137 },
  ];

  if (!career || career.length === 0) {
    return <p className="player-career__empty">No career data available.</p>;
  }

  return (
    <div className="player-career">
      <h3 className="player-career__title">Career History</h3>
      <div className="player-career__timeline">
        <div className="career-item career-item__header">
          <div>Team</div>
          <div>Appearances</div>
          <div>Goals</div>
        </div>

        {career.map((club, index) => (
          <div className="career-item" key={index}>
            <div className="career-item__team">
              <strong>{club.team || "Unknown Team"}</strong>
              <div className="career-item__period">{club.years || "N/A"}</div>
            </div>
            <div className="career-item__appearances">{club.Matches || 0}</div>
            <div className="career-item__goals">{club.goals || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerCareer;
