import "../styles/LeagueDetails/LeaguesPage.scss";
import LeagueTable from "../components/LeaguePage/LeagueTable.jsx";

const LeaguesPage = () => {
    const leagueObj = [
        { leagueCode: "PL", leagueName: "Premier League" },
        { leagueCode: "BL1", leagueName: "Bundesliga" },
        { leagueCode: "PD", leagueName: "La Liga" },
        { leagueCode: "SA", leagueName: "Serie A" },
        { leagueCode: "FL1", leagueName: "Ligue 1" },
        { leagueCode: "DED", leagueName: "Eredivisie" },
    ]
        return (
            <div className="leagues-wrapper">
                <h2>Leagues</h2>
                <div className="leagues-container">
                    {leagueObj.map((leagueObj) => (
                    <LeagueTable
                        key={leagueObj.leagueCode}
                        leagueId={leagueObj.leagueCode}
                        leagueName={leagueObj.leagueName}
                        />
                    ))}
                </div>
            </div>
        );
}

export default LeaguesPage;