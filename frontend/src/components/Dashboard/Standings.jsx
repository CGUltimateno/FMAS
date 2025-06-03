import React from "react";
import "../../styles/Dashboard/Standings.scss";
import { Trophy, ArrowRight } from "lucide-react";
import { useGetLeagueStandingsQuery } from "../../services/footballApi";
import { useNavigate } from "react-router-dom";
import LeagueTable from "../LeaguePage/LeagueTable";

const Standings = () => {
  const { data, error, isLoading } = useGetLeagueStandingsQuery(39);
  const navigate = useNavigate();

  if (isLoading) {
    return <p style={{ padding: "1rem" }}>Loading Standings...</p>;
  }
  if (error) {
    return <p style={{ padding: "1rem", color: "red" }}>Error loading standings.</p>;
  }

  console.log("Standings data:", data);

  // Extract league data from the API response
  const league = data?.response?.[0]?.league;

  // Get the raw standings data directly from the API response
  // This maintains the structure expected by LeagueTable
  const rawStandings = league?.standings?.[0] || [];

  return (
      <div className="standings-wrapper">
        <div className="standings-header">
          <div className="title-league-section">
            <div className="title-section">
              <Trophy size={20} />
              <h2>Standings</h2>
            </div>
          </div>
          <button onClick={() => navigate("/leagues")} className="view-all-btn">
            View All <ArrowRight size={18} />
          </button>
        </div>

        <div className="standings-table-wrapper">
          {data?.response?.length > 0 ? (
              <LeagueTable
                  leagueId={league?.id}
                  leagueName={league?.name}
                  showTitle={true}
                  standings={rawStandings}
              />
          ) : (
              <p>No standings data available</p>
          )}
        </div>
      </div>
  );
};

export default Standings;