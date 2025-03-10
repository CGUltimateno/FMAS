import React from 'react';
import Standings from "../components/Standings";
import Hero from "../components/Hero.jsx";
import UpcomingMatches   from "../components/UpcomingMatches.jsx";
import News from "../components/News.jsx";
import FollowClub from "../components/FollowClub.jsx";
import "../styles/Dashboard.scss";
import Footer from "../components/Footer.jsx";
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
