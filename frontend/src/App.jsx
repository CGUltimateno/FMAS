import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import "./styles/global.scss";
import Dashboard from "./pages/Dashboard.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {
    return (
        <div className={"overlay"}>
            <div className="app">
                <Sidebar/>
                <main className="main-content">
                    <Header/>
                    <div className="content">
                        <Dashboard/>
                    </div>
                </main>
            </div>
            <Footer/>
        </div>
    );
};

export default App;
