import React from 'react';
const Standings = () => {
    const teams = [
        { name: "Chelsea F.C", wins: 14, points: 35 },
        { name: "Man City", wins: 13, points: 32 },
        { name: "Liverpool", wins: 13, points: 30 },
    ];

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-lg font-bold mb-3">Premier League Standings</h2>
            <table className="w-full">
                <thead>
                <tr className="text-left">
                    <th>Club</th>
                    <th>Wins</th>
                    <th>Points</th>
                </tr>
                </thead>
                <tbody>
                {teams.map((team, index) => (
                    <tr key={index} className="border-t">
                        <td>{team.name}</td>
                        <td>{team.wins}</td>
                        <td className="font-bold">{team.points}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Standings;
