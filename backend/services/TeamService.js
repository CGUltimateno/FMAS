const axios = require("axios");

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_BASE_URL = "https://api.football-data.org/v4";
const apiHeaders = {
    headers: {
        "X-Auth-Token": FOOTBALL_DATA_API_KEY,
    },
};

class TeamService {
    static async getTeamFullDetails(teamId) {
        try {
            // GET /v4/teams/{teamId} for team details + squad
            const teamUrl = `${API_BASE_URL}/teams/${teamId}`;
            // Possibly get matches for the team if you want
            const matchesUrl = `${API_BASE_URL}/teams/${teamId}/matches?status=SCHEDULED`; // or some date range

            const [teamRes, matchesRes] = await Promise.all([
                axios.get(teamUrl, apiHeaders),
                axios.get(matchesUrl, apiHeaders),
            ]);

            return {
                details: {
                    name: teamRes.data.name,
                    shortName: teamRes.data.shortName,
                    crest: teamRes.data.crest,
                    founded: teamRes.data.founded,
                    venue: teamRes.data.venue,
                },
                squad: teamRes.data.squad || [],
                matches: matchesRes.data.matches || [],
                stats: {},
            };
        } catch (error) {
            throw new Error(`Error fetching team details: ${error.message}`);
        }
    }
}

module.exports = TeamService;
