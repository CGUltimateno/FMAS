import { useParams } from "react-router-dom";

export default function MatchDetails() {
    const { id } = useParams();

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">Match Details - {id}</h1>
            <p>Coming soon...</p>
        </div>
    );
}
