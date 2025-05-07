import React, {useEffect} from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterPage from "./pages/RegisterPage";
import "./styles/global.scss";
import Dashboard from "./pages/Dashboard.jsx";
import LeaguesPage from "./pages/LeaguesPage";
import LoginPage from "./pages/LoginPage";
import MatchDetails from "./pages/MatchDetails.jsx";
import LeagueDetailsPage from "./pages/LeagueDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import PlayerStatsPage from "./pages/PlayerStatsPage";
import { loadUserFromStorage } from "./services/sessionPersistence";

const App = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";
    const isRegisterPage = location.pathname === "/register";
    useEffect(() => {
        loadUserFromStorage();
    }, []);
    return (
        <div className="overlay">
            <div className="app">
                {!isLoginPage && !isRegisterPage && <Sidebar />}
                <main className="main-content">
                    {!isLoginPage && !isRegisterPage && <Header />}
                    <div className="content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/leagues" element={<LeaguesPage />} />
                            <Route path="/leagues/:leagueId" element={<LeagueDetailsPage />} />
                            <Route path="/teams/:teamId" element={<TeamDetailsPage />} />
                            <Route path="/matches/:matchId" element={<MatchDetails />} />
                            <Route path="/player/:playerId" element={<PlayerStatsPage />} />
                            <Route path="/leagues/:*" element={<NotFoundPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </div>
                </main>
            </div>
            {/*<Footer />*/}
        </div>
    );
};

export default App;