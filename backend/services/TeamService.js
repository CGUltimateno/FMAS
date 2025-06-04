const axios = require("axios");
const path = require("path");
const logger = require("../logger");
const cache = require("../config/CacheService");
const apiConfig = require("../config/apiConfig");
const { headers, API_FD_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;

class TeamService {

    static async getTeamFullDetails(teamId) {
        try {
            const cacheKey = `teamFullDetails-${teamId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 24 });

            if (storedData) {
                return storedData;
            }

            const teamUrl = `${API_FD_BASE_URL}/teams?id=${teamId}`;
            const matches2024Url = `${API_FD_BASE_URL}/fixtures?team=${teamId}&season=2024`;
            const matches2025Url = `${API_FD_BASE_URL}/fixtures?team=${teamId}&season=2025`;

            logger.info(`Fetching team details for ID: ${teamId}`);

            const [teamRes, matches2024Res, matches2025Res] = await Promise.all([
                axios.get(teamUrl, FD_apiHeaders),
                axios.get(matches2024Url, FD_apiHeaders),
                axios.get(matches2025Url, FD_apiHeaders),
            ]);

            // Combine fixtures from both seasons
            const combinedMatches = {
                ...matches2025Res.data,
                response: [
                    ...(matches2024Res.data.response || []),
                    ...(matches2025Res.data.response || [])
                ]
            };

            const freshData = {
                details: teamRes.data,
                matches: combinedMatches
            };

            logger.info(`Successfully fetched team data for ID: ${teamId}`);
            await cache.write(cacheKey, freshData);
            return freshData;
        } catch (error) {
            logger.error(`Error fetching team details: ${error.message}`);
            throw new Error(`Error fetching team details: ${error.message}`);
        }
    }
    static async getLastMatchInfo(teamId) {
        try {
            const cacheKey = `lastMatchInfo-${teamId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 6 });

            if (storedData) {
                return storedData;
            }

            // First, get the last match ID
            const lastMatchUrl = `${API_FD_BASE_URL}/fixtures?team=${teamId}&last=1`;
            logger.info(`Fetching last match ID for team ID: ${teamId}`);

            const lastMatchResponse = await axios.get(lastMatchUrl, FD_apiHeaders);

            if (!lastMatchResponse.data || !lastMatchResponse.data.response || lastMatchResponse.data.response.length === 0) {
                throw new Error("No match data found for the specified team.");
            }

            // Extract the match ID
            const lastMatchId = lastMatchResponse.data.response[0].fixture.id;

            // Fetch detailed information using the match ID
            const matchDetailsUrl = `${API_FD_BASE_URL}/fixtures?id=${lastMatchId}`;
            logger.info(`Fetching detailed match info for match ID: ${lastMatchId}`);

            const matchDetailsResponse = await axios.get(matchDetailsUrl, FD_apiHeaders);

            if (!matchDetailsResponse.data || !matchDetailsResponse.data.response || matchDetailsResponse.data.response.length === 0) {
                throw new Error("Could not retrieve detailed match information.");
            }

            logger.info(`Successfully fetched detailed match info for team ${teamId}`);
            await cache.write(cacheKey, matchDetailsResponse.data);

            // Return the detailed match data
            return matchDetailsResponse.data;
        }
        catch (error) {
            logger.error("Error fetching last match info:", {
                error: error.response ? error.response.data : error.message,
                teamId
            });
            throw new Error(`Error fetching last match info: ${error.message}`);
        }
    }
    static async getTeamStats(teamId, leagueId) {
        try {
            const cacheKey = `teamStats-${teamId}-${leagueId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 12 });

            if (storedData) {
                return storedData;
            }

            // Use the new API to get team statistics
            const url = `${API_FD_BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=2024`;

            logger.info(`Fetching team statistics for team ID: ${teamId} in league: ${leagueId}`);

            const response = await axios.get(url, FD_apiHeaders);

            logger.info(`Successfully fetched statistics for team ${teamId} in league ${leagueId}`);
            await cache.write(cacheKey, response.data);

            // Return the complete API response
            return response.data;
        } catch (error) {
            logger.error("Error fetching team statistics:", {
                error: error.response ? error.response.data : error.message,
                teamId,
                leagueId
            });
            throw new Error(`Error fetching team statistics: ${error.message}`);
        }
    }
    static async getTeamFixtures(teamId, options = {}) {
        try {
            const { dateFrom, dateTo, status, last = 100 } = options;

            // Create cache keys for both seasons
            let cacheKey = `teamFixtures-${teamId}-seasons2024-2025`;
            if (dateFrom) cacheKey += `-dateFrom${dateFrom}`;
            if (dateTo) cacheKey += `-dateTo${dateTo}`;
            if (status) cacheKey += `-status${status}`;
            if (last) cacheKey += `-last${last}`;

            const storedData = await cache.read(cacheKey, { maxAgeHours: 6 });

            if (storedData) {
                return storedData;
            }

            // Create base URLs for both seasons
            let url2024 = `${API_FD_BASE_URL}/fixtures?team=${teamId}&season=2024`;
            let url2025 = `${API_FD_BASE_URL}/fixtures?team=${teamId}&season=2025`;

            // Add filters to both URLs
            if (dateFrom) {
                url2024 += `&from=${dateFrom}`;
                url2025 += `&from=${dateFrom}`;
            }
            if (dateTo) {
                url2024 += `&to=${dateTo}`;
                url2025 += `&to=${dateTo}`;
            }

            if (status) {
                const statusMap = {
                    "SCHEDULED": "NS",
                    "LIVE": "1H,HT,2H,ET,BT,P",
                    "FINISHED": "FT,AET,PEN"
                };
                const mappedStatus = statusMap[status] || status;
                url2024 += `&status=${mappedStatus}`;
                url2025 += `&status=${mappedStatus}`;
            }

            logger.info(`Fetching team fixtures for ID: ${teamId} from seasons 2024 and 2025`);

            // Make parallel requests for both seasons
            const [response2024, response2025] = await Promise.all([
                axios.get(url2024, FD_apiHeaders),
                axios.get(url2025, FD_apiHeaders),
            ]);

            // Combine the responses
            const combinedResponse = {
                ...response2025.data,
                response: [
                    ...(response2024.data.response || []),
                    ...(response2025.data.response || [])
                ]
            };

            await cache.write(cacheKey, combinedResponse);
            logger.info(`Successfully fetched fixtures for team ${teamId} from both seasons`);
            return combinedResponse;
        } catch (error) {
            logger.error("Error fetching team fixtures:", {
                error: error.response ? error.response.data : error.message,
                teamId
            });
            throw new Error(`Error fetching team fixtures: ${error.message}`);
        }
    }
    static async getTeamSquad(teamId) {
        try {
            const cacheKey = `teamSquad-${teamId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 24 });

            if (storedData) {
                logger.info(`Returning cached squad data for team ${teamId}`);
                return storedData;
            }

            logger.info(`Fetching squad data for team ID: ${teamId}`);

            const url = `${API_FD_BASE_URL}/players/squads?team=${teamId}`;

            const response = await axios.get(url, FD_apiHeaders);

            logger.info(`Successfully fetched squad data for team ${teamId}`);
            await cache.write(cacheKey, response.data);

            // Return the complete API response
            return response.data;
        } catch (error) {
            logger.error(`Error fetching team squad:`, {
                message: error.message,
                stack: error.stack,
                responseStatus: error.response?.status,
                responseData: error.response?.data
            });
            throw new Error(`Error fetching team squad: ${error.message}`);
        }
    }

}

module.exports = TeamService;