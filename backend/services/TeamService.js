const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const mapJson = require("../cache/apiMappings.json"); // Adjust path if needed
const winston = require("winston");
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const LIVE_API_KEY = process.env.LIVE_API_KEY;
const API_FD_BASE_URL = "https://api.football-data.org/v4";
const API_FL_BASE_URL = "https://free-api-live-football-data.p.rapidapi.com";

const FL_apiHeaders = {
    headers: {
        "x-rapidapi-key": LIVE_API_KEY,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
    }
};

const FD_apiHeaders = {
    headers: {
        "X-Auth-Token": FOOTBALL_DATA_API_KEY,
    },
};

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "combined.log" })
    ]
});


const CACHE_FOLDER = path.join(__dirname, "..", "cache");

async function ensureCacheFolderExists() {
    try {
        await fs.mkdir(CACHE_FOLDER, { recursive: true });
    } catch (err) {
        console.error("Error creating cache folder:", err);
    }
}

async function readCacheFile(cacheKey) {
    const filePath = path.join(CACHE_FOLDER, `${cacheKey}.json`);
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        return null;
    }
}

async function writeCacheFile(cacheKey, data) {
    const filePath = path.join(CACHE_FOLDER, `${cacheKey}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        console.error("Error writing cache file:", err);
    }
}
class TeamService {
    static async getTeamFullDetails(teamId) {
        try {
            const cacheKey = `teamFullDetails-${teamId}`;
            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            const teamUrl = `${API_FD_BASE_URL}/teams/${teamId}`;
            const matchesUrl = `${API_FD_BASE_URL}/teams/${teamId}/matches?status=SCHEDULED`;

            const [teamRes, matchesRes] = await Promise.all([
                axios.get(teamUrl, FD_apiHeaders),
                axios.get(matchesUrl, FD_apiHeaders),
            ]);

            const fdData = {
                details: {
                    name: teamRes.data.name,
                    shortName: teamRes.data.shortName,
                    crest: teamRes.data.crest,
                    founded: teamRes.data.founded,
                    venue: teamRes.data.venue,
                    squad: teamRes.data.squad || []
                },
                matches: matchesRes.data.matches || [],
                stats: {}
            };

            let additionalData = null;
            if (mapJson.teams && mapJson.teams[teamId] && mapJson.teams[teamId].flId) {
                const flTeamId = mapJson.teams[teamId].flId;
                try {
                    const flTeamUrl = `${API_FL_BASE_URL}/football-league-team?teamid=${flTeamId}`;
                    const flRes = await axios.get(flTeamUrl, FL_apiHeaders);
                    additionalData = flRes.data;
                } catch (error) {
                    console.error("Error fetching RapidAPI team details:", error.message);
                }
            }

            // Merge FD data with additional data
            const freshData = {...fdData};
            if (additionalData) {
                freshData.additionalDetails = additionalData;
            }

            await writeCacheFile(cacheKey, freshData);
            return freshData;
        } catch (error) {
            throw new Error(`Error fetching team details: ${error.message}`);
        }
    }

    static async getTrendingNews() {
        try {
            const cacheKey = `trendingNews`;
            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            const url = `${API_FL_BASE_URL}/football-get-trendingnews`;

            const response = await axios.get(url, FL_apiHeaders);
            const freshData = response.data;

            await writeCacheFile(cacheKey, freshData);
            return freshData;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching trending news: ${error.message}`);
        }
    }

    static async getTeamForm(teamId, leagueId) {
        try {
            const cacheKey = `teamForm-${teamId}`;
            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            // Map the teamId and leagueId to their corresponding flId
            let mappedTeamId = teamId;
            let mappedLeagueId = null;

            if (mapJson.teams && mapJson.teams[teamId] && mapJson.teams[teamId].flId) {
                mappedTeamId = mapJson.teams[teamId].flId;
            } else {
                throw new Error(`No mapping found for team ID: ${teamId}`);
            }

            const numericLeagueId = parseInt(leagueId, 10);

            for (const leagueKey in mapJson.leagues) {
                if (mapJson.leagues[leagueKey].fdId === numericLeagueId) {
                    mappedLeagueId = mapJson.leagues[leagueKey].flId;
                    break;
                }
            }

            if (!mappedLeagueId) {
                throw new Error(`No mapping found for league ID: ${leagueId}`);
            }

            // Fetch all matches for the league
            const url = `${API_FL_BASE_URL}/football-get-all-matches-by-league?leagueid=${mappedLeagueId}`;
            logger.info("Request URL:", {url});

            const response = await axios.get(url, FL_apiHeaders);
            const allMatches = response.data.response.matches || [];

            // Filter for team's finished matches only
            const teamFinishedMatches = allMatches.filter(
                match => (
                    // Match involves the team
                    (String(match.home.id) === String(mappedTeamId) ||
                        String(match.away.id) === String(mappedTeamId)) &&
                    // Match is finished
                    match.status && match.status.finished === true
                )
            );

            // Sort by date (newest first)
            teamFinishedMatches.sort((a, b) => new Date(b.status.utcTime) - new Date(a.status.utcTime));

            // Get the last 5 finished matches
            const lastFiveFinishedMatches = teamFinishedMatches.slice(0, 5);

            // Add a flag to each match indicating which team was requested
            const matchesWithTeamFlag = lastFiveFinishedMatches.map(match => {
                return {
                    ...match,
                    requestedTeamId: mappedTeamId, // Add the mapped team ID
                    isRequestedTeamHome: String(match.home.id) === String(mappedTeamId)
                };
            });

            await writeCacheFile(cacheKey, matchesWithTeamFlag);
            return matchesWithTeamFlag;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching team form: ${error.message}`);
        }
    }

    static async getTeamCrest(teamId) {
        try {
            const cacheKey = `teamCrest-${teamId}`;
            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            const mappedTeamId = mapJson.teams[teamId]?.flId;
            logger.info("Mapped Team ID:", { mappedTeamId });
            if (!mappedTeamId) {
                throw new Error(`No mapping found for team ID: ${teamId}`);
            }

            const url = `${API_FL_BASE_URL}/football-team-logo?teamid=${mappedTeamId}`;
            logger.info("Request URL:", { url });
            const response = await axios.get(url, FL_apiHeaders);

            // Ensure the response contains the expected structure
            if (!response.data || !response.data.response || !response.data.response.url) {
                throw new Error(`Crest data is missing for team ID: ${mappedTeamId}`);
            }

            const freshData = response.data.response.url;

            await writeCacheFile(cacheKey, freshData);
            return freshData;
        } catch (error) {
            console.error("Error fetching team crest:", error.message);
            throw new Error(`Error fetching team crest: ${error.message}`);
        }
    }

    static async getTeamFixtures(teamId, options = {}) {
        try {
            const { dateFrom, dateTo, status, limit = 100 } = options;

            // Create a unique cache key that includes query parameters
            let cacheKey = `teamFixtures-${teamId}`;
            if (dateFrom) cacheKey += `-dateFrom${dateFrom}`;
            if (dateTo) cacheKey += `-dateTo${dateTo}`;
            if (status) cacheKey += `-status${status}`;
            if (limit) cacheKey += `-limit${limit}`;

            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            // Construct the API URL with query parameters
            let url = `${API_FD_BASE_URL}/teams/${teamId}/matches?`;
            const params = [];

            if (dateFrom) params.push(`dateFrom=${dateFrom}`);
            if (dateTo) params.push(`dateTo=${dateTo}`);
            if (status) params.push(`status=${status}`);
            if (limit) params.push(`limit=${limit}`);

            url += params.join('&');

            const response = await axios.get(url, FD_apiHeaders);
            const matches = response.data.matches || [];

            // Process the matches to add any additional info needed
            const processedMatches = matches.map(match => {
                return {
                    ...match,
                    isHomeTeam: match.homeTeam.id === parseInt(teamId)
                };
            });

            await writeCacheFile(cacheKey, processedMatches);
            return processedMatches;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching team fixtures: ${error.message}`);
        }
    }

    static async getTeamSquad(teamId) {
        try {
            const cacheKey = `teamSquad-${teamId}`;
            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            // Map the teamId to its corresponding flId
            const mappedTeamId = mapJson.teams[teamId]?.flId;
            logger.info("Mapped Team ID:", { mappedTeamId });
            if (!mappedTeamId) {
                throw new Error(`No mapping found for team ID: ${teamId}`);
            }

            const url = `${API_FL_BASE_URL}/football-get-list-player?teamid=${mappedTeamId}`;
            logger.info("Request URL:", { url });

            const response = await axios.get(url, FL_apiHeaders);

            // Updated path to match the actual response structure
            const squad = response.data.response?.list || [];

            await writeCacheFile(cacheKey, squad);
            return squad;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching team squad: ${error.message}`);
        }
    }

    static async getAllTeamMatches(teamId) {
        try {
            const cacheKey = `teamMatches-${teamId}`;
            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            const teamUrl = `${API_FD_BASE_URL}/teams/${teamId}`;
            const teamResponse = await axios.get(teamUrl, FD_apiHeaders);
            const teamLeagues = teamResponse.data.runningCompetitions || [];

            if (teamLeagues.length === 0) {
                throw new Error(`No leagues found for team ID: ${teamId}`);
            }

            const mappedTeamId = mapJson.teams[teamId]?.flId;
            logger.info("Mapped Team ID:", { mappedTeamId });
            if (!mappedTeamId) {
                throw new Error(`No mapping found for team ID: ${teamId}`);
            }

            // Get the most relevant league ID
            let primaryLeagueId = null;
            for (const league of teamLeagues) {
                const numericLeagueId = parseInt(league.id, 10);
                for (const leagueKey in mapJson.leagues) {
                    if (mapJson.leagues[leagueKey].fdId === numericLeagueId) {
                        primaryLeagueId = mapJson.leagues[leagueKey].flId;
                        break;
                    }
                }
                if (primaryLeagueId) break;
            }

            if (!primaryLeagueId) {
                throw new Error(`No mapping found for any of team ${teamId}'s leagues`);
            }

            // Fetch all matches for the league
            const url = `${API_FL_BASE_URL}/football-get-all-matches-by-league?leagueid=${primaryLeagueId}`;
            logger.info("Request URL:", { url });

            const response = await axios.get(url, FL_apiHeaders);
            const allMatches = response.data.response?.matches || [];

            // Filter matches to only include those with the specified team
            const teamMatches = allMatches.filter(match =>
                String(match.home.id) === String(mappedTeamId) ||
                String(match.away.id) === String(mappedTeamId)
            );

            // Add a flag to each match indicating whether the team is home or away
            const processedMatches = teamMatches.map(match => ({
                ...match,
                isHomeTeam: String(match.home.id) === String(mappedTeamId)
            }));

            await writeCacheFile(cacheKey, processedMatches);
            return processedMatches;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching all team matches: ${error.message}`);
        }
    }

    static async getPlayerImage(playerId) {
        try {
            const cacheKey = `playerImage-${playerId}`;
            await ensureCacheFolderExists();
            const storedData = await readCacheFile(cacheKey);

            if (storedData) {
                return storedData;
            }

            // Determine which ID to use - either mapped or direct
            let idToUse = playerId;

            // If we have a mapping, use the mapped FL ID
            if (mapJson.players && mapJson.players[playerId]) {
                idToUse = mapJson.players[playerId].flId;
                logger.info("Using mapped Player ID:", { originalId: playerId, mappedId: idToUse });
            } else {
                // No mapping found, try using the provided ID directly
                logger.info("No mapping found, using provided ID directly:", { id: playerId });
            }

            const url = `${API_FL_BASE_URL}/football-get-player-logo?playerid=${idToUse}`;
            logger.info("Request URL:", { url });

            const response = await axios.get(url, FL_apiHeaders);

            if (!response.data || !response.data.response || !response.data.response.url) {
                logger.warn(`Player image data is missing for player ID: ${idToUse}`);
                return "/images/player-placeholder.png";
            }

            const freshData = response.data.response.url;

            await writeCacheFile(cacheKey, freshData);
            return freshData;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            // Return a placeholder instead of throwing
            return "/images/player-placeholder.png";
        }
    }
}


module.exports = TeamService;
