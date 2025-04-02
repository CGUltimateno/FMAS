// src/components/TeamForm.jsx
import React from "react";
import "../../styles/TeamStats/TeamForm.scss";

const TeamForm = ({ details }) => {
    const { last5Games } = details;

    // Calculate the form as W-L-D
    const form = last5Games.reduce(
        (acc, game) => {
            if (game.result === "W") acc.wins += 1;
            else if (game.result === "L") acc.losses += 1;
            else if (game.result === "D") acc.draws += 1;
            return acc;
        },
        { wins: 0, losses: 0, draws: 0 }
    );

    return (
        <div className="team-form">
            <div className="team-performance">
                <h2>Team Form</h2>
                <p>W: {form.wins} - L: {form.losses} - D: {form.draws}</p>
            </div>
        </div>
    );
};

export default TeamForm;