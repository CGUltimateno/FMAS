// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterPage from "./pages/RegisterPage";
import "./styles/global.scss";
import Dashboard from "./pages/Dashboard.jsx";
import LeaguesPage from "./pages/LeaguesPage";
const App = () => {
    return (
        <BrowserRouter>
            <div className="overlay">
                <div className="app">
                    <Sidebar />
                    <main className="main-content">
                        <Header />
                        <div className="content">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/leagues" element={<LeaguesPage />} />
                            </Routes>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        </BrowserRouter>
    );
};

export default App;
