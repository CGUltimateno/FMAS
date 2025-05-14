import React from "react";

const MatchEvents = ({ }) => {

    const events = [
        { time: "18'", team: "home", description: "N.Mendes 🟨 : Foul" },
        { time: "26'", team: "away", description: "D.Rice 🟨 : Foul" },
        { time: "27'", team: "home", description: "F.Ruiz ⚽" },
        { time: "Additional Time 2 min" },
        { time: "HT 1 - 0 " },
        { time: "56'", team: "away", description: "L.Skelly 🟨 : Foul" },
        { time: "66'", team: "home", description: "A.Hakimi : Penalty awarded 📺" },
        { time: "68'", team: "away", description: "🔁 L.Skelly → R.Calafiori " },
        { time: "68'", team: "away", description: "🔴 G.Martinelli → 🟢 L.Trossard" },
        { time: "69'", team: "home", description: "Vitinha ❌⚽ Missed Penalty" },
        { time: "70'", team: "home", description: "🔴 B.Barcola → 🟢 O.Dembele" },
        { time: "72'", team: "home", description: "A.Hakimi ⚽" },
        { time: "74'", team: "home", description: "🔴 D.Doue → 🟢 L.Hernandez" },
        { time: "76'", team: "away", description: "B.Saka ⚽" },
        { time: "83'", team: "away", description: "🔴 J.Timber  → 🟢 B.White " },
        { time: "86'", team: "away", description: "R.Calafiori 🟨 : Argument" },
        { time: "86'", team: "away", description: "B.Saka 🟨 : Argument" },
        { time: "86'", team: "home", description: "K.Kvaratskheila 🟨 : Argument" },
        { time: "88'", team: "home", description: "🔴 N.Mendes → 🟢 G.Ramos" },
        { time: "Additional Time 5 min" },
        { time: "FT 2 - 1 " },
    ];

    return (
        <div className="match-events">
            <h3 className="events-title">Events</h3>
            <div className="events-grid">
                {events.map((event, index) => (
                    <div key={index} className="event-row">
                        <div className="event-col home-event">
                            {event.team === "home" ? event.description : ""}
                        </div>
                        <div className="event-col event-time">{event.time}</div>
                        <div className="event-col away-event">
                            {event.team === "away" ? event.description : ""}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchEvents;