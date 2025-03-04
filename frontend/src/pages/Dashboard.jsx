import React from 'react';
import Hero from "../components/Hero";
import LiveMatch from "../components/LiveMatch";
import MatchesTable from "../components/MatchesTable";
import Standings from "../components/Standings";

const Dashboard = () => {
    return (
        <div className="p-6 space-y-6">
            <Hero />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LiveMatch />
                <MatchesTable />
            </div>
            <Standings />
        </div>
    );
};

export default Dashboard;
