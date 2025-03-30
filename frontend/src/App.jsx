import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterPage from "./pages/RegisterPage";
import "./styles/global.scss";
import Dashboard from "./pages/Dashboard.jsx";
import LeaguesPage from "./pages/LeaguesPage";
import LoginPage from "./pages/LoginPage";

const App = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";
    const isRegisterPage = location.pathname === "/register";
    return (
        <div className="overlay">
            <div className="app">
                {!isLoginPage &&  !isRegisterPage && <Sidebar />}
                <main className="main-content">
                    {!isLoginPage && !isRegisterPage && <Header />}
                    <div className="content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/leagues" element={<LeaguesPage />} />
                        </Routes>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default App;