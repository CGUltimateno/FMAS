import React from 'react';
const MatchesTable = () => {
    const matches = [
        { team1: "Argentina 🇦🇷", score: "1 - 2", team2: "Italy 🇮🇹", date: "18 Dec 2022" },
        { team1: "Portugal 🇵🇹", score: "2 - 3", team2: "Belgium 🇩🇪", date: "18 Dec 2022" },
        { team1: "Ghana 🇬🇭", score: "1 - 3", team2: "Brazil 🇧🇷", date: "17 Dec 2022" },
    ];

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-lg font-bold mb-3">Recent Matches</h2>
            <ul className="space-y-3">
                {matches.map((match, index) => (
                    <li key={index} className="flex justify-between">
                        <span>{match.team1}</span>
                        <span className="font-bold">{match.score}</span>
                        <span>{match.team2}</span>
                        <span className="text-gray-500">{match.date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MatchesTable;
