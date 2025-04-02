import React from "react";
import LeagueTable from "./LeagueTable.jsx";
import "../../styles/LeagueDetails/LeagueStandings.scss";

const StandingsPage = ({ leagueId }) => {
    return (
        <div className="standings-page">
            <LeagueTable leagueId={leagueId} showTitle={false} />
        </div>
    );
};

export default StandingsPage;