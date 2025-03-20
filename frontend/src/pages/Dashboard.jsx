import React from 'react';
import Standings from "../components/Dashboard/Standings";
import Hero from "../components/Dashboard/Hero.jsx";
import UpcomingMatches   from "../components/Dashboard/UpcomingMatches.jsx";
import News from "../components/Dashboard/News.jsx";
import FollowClub from "../components/Dashboard/FollowClub.jsx";
import "../styles/Dashboard/Dashboard.scss";

const Dashboard = () => {
    return (
        <div className={"dashboard-container"}>
            <Hero />
            <br></br>
            <div className="dashboard">
                <UpcomingMatches />
                <Standings />
                <FollowClub />
                <br></br>
                <News />
            </div>
        </div>
    );
};

export default Dashboard;
