import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import "./styles/global.scss";

const App = () => {
    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <Header />
                <div className="content">
                </div>
            </main>
        </div>
    );
};

export default App;
