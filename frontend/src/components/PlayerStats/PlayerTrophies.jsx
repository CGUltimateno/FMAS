import React from "react";
import "../../styles/PlayerStats/PlayerTrophies.scss";

const PlayerTrophies = () => {
  const trophiesByTeam = {
    "FC Basel": [
      { name: "Swiss Super League", year: 2013 },
    ],
    "Chelsea": [
      { name: "Football League Cup", year: 2015 },
      { name: "Premier League", year: 2015 },
    ],
    "Liverpool": [
      { name: "Premier League", year: 2020 },
      { name: "UEFA Champions League", year: 2019 },
      { name: "FIFA Club World Cup", year: 2019 },
      { name: "UEFA Super Cup", year: 2019 },
      { name: "FA Cup", year: 2022 },
      { name: "EFL Cup", year: 2022 },
      { name: "Premier League Golden Boot", year: 2018 },
      { name: "Premier League Golden Boot", year: 2019 },
      { name: "Premier League Golden Boot", year: 2022 },
    ],
    "Egypt": [
      { name: "African Player of the Year", year: 2017 },
      { name: "African Player of the Year", year: 2018 },
      { name: "CAF Most Promising Talent", year: 2012 },
    ]
  };

  if (!trophiesByTeam || Object.keys(trophiesByTeam).length === 0) {
    return <p className="player-trophies__empty">No trophies available.</p>;
  }

  return (
    <div className="player-trophies">
      <h3 className="player-trophies__title">Trophies & Achievements</h3>
      <div className="trophies-grid">
        {Object.keys(trophiesByTeam).map((team, index) => (
          <div className="team-section" key={index}>
            <h4 className="team-name">{team}</h4>
            <div className="trophies-list">
              {trophiesByTeam[team].map((trophy, trophyIndex) => (
                <div className="trophy-item" key={trophyIndex}>
                  <div className="trophy-icon">🏆</div>
                  <div className="trophy-details">
                    <h4>{trophy.name || "Unknown Trophy"}</h4>
                    <p>{trophy.year || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerTrophies;
