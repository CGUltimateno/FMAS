import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        axios.get("https://api.football-data.org/v4/teams/86/matches?status=SCHEDULED", {
            headers: {
                'X-Auth-Token': 'YOUR_API_KEY_HERE'
            }
        })
            .then((res) => setMatches(res.data.matches))
            .catch((err) => console.error(err));
    }, []);
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">Live Matches</h1>
            <ul>
                {matches.map((match) => (
                    <li key={match.id} className="border p-2 my-2">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
