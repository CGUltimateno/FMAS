import React from "react";
import "../../styles/PlayerStats/PlayerCareer.scss";

const PlayerCareer = ({ career }) => {
  if (!career || career.length === 0) {
    return <p className="player-career__empty">No career data available.</p>;
  }

  return (
    <div className="player-career">
      <h3 className="player-career__title">Career History</h3>
      <div className="player-career__timeline">
        {career.map((club, index) => (
          <div className="career-item" key={index}>
            <div className="career-item__period">{club.years || "N/A"}</div>
            <div className="career-item__details">
              <h4>{club.team || "Unknown Team"}</h4>
              <p>
                {club.appearances || 0} appearances | {club.goals || 0} goals
              </p>
              {club.honors && (
                <p className="career-item__honors">
                  Honors: {club.honors}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerCareer;
