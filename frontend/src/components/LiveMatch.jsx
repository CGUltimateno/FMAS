import React from 'react';

const LiveMatch = () => {
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">⚽ Live Match</h2>

            {/* Score Display */}
            <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-2xl">🇲🇽 2 - 2 🇸🇪</span>
                <div className="text-sm text-gray-500">
                    <p>⏳ 62:24</p>
                    <p>Shots on Target: <span className="font-semibold">12 - 7</span></p>
                    <p>Fouls: <span className="font-semibold">7 - 3</span></p>
                </div>
            </div>
        </div>
    );
};

export default LiveMatch;

