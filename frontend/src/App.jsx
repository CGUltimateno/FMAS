import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MatchDetails from "./pages/MatchDetails";
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/match/:id" element={<MatchDetails />} />
            </Routes>
        </Router>
  )
}

export default App
