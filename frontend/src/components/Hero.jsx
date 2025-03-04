import React from 'react';

const Hero = () => {
    return (
        <div className="relative bg-gradient-to-r from-purple-800 to-indigo-600 text-white p-6 rounded-lg">
            <div className="absolute top-4 right-4 text-sm">Sunday, 21 January 2022</div>
            <h1 className="text-3xl font-bold">England vs Germany</h1>
            <p className="mt-2">Countdown to kick-off</p>
            <div className="mt-4 flex space-x-4 text-2xl font-bold">
                <span>03 <span className="text-sm">Days</span></span>
                <span>12 <span className="text-sm">Hours</span></span>
                <span>43 <span className="text-sm">Minutes</span></span>
                <span>14 <span className="text-sm">Seconds</span></span>
            </div>
        </div>
    );
};

export default Hero;
