const axios = require("axios");
const path = require("path");
const logger = require("../logger");
const cache = require("../config/CacheService");
const mapJson = require('../cache/apiMappings.json');
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
            const matchesUrl = `${API_FD_BASE_URL}/fixtures?team=${teamId}&next=10`;

            logger.info(`Fetching team details for ID: ${teamId}`);

            const [teamRes, matchesRes] = await Promise.all([
                axios.get(teamUrl, FD_apiHeaders),
                axios.get(matchesUrl, FD_apiHeaders),
            ]);

            const freshData = {
                details: teamRes.data,
                matches: matchesRes.data
            };

            logger.info(`Successfully fetched team data for ID: ${teamId}`);
            await cache.write(cacheKey, freshData);
            return freshData;
        } catch (error) {
            logger.error(`Error fetching team details: ${error.message}`);
            throw new Error(`Error fetching team details: ${error.message}`);
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
            const url = `${API_FD_BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${new Date().getFullYear()}`;

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
            const season = "2024"

            let cacheKey = `teamFixtures-${teamId}-season${season}`;
            if (dateFrom) cacheKey += `-dateFrom${dateFrom}`;
            if (dateTo) cacheKey += `-dateTo${dateTo}`;
            if (status) cacheKey += `-status${status}`;
            if (last) cacheKey += `-last${last}`;

            const storedData = await cache.read(cacheKey, { maxAgeHours: 6 });

            if (storedData) {
                return storedData;
            }

            let url = `${API_FD_BASE_URL}/fixtures?team=${teamId}&season=${season}`;

            if (dateFrom) url += `&from=${dateFrom}`;
            if (dateTo) url += `&to=${dateTo}`;

            if (status) {
                const statusMap = {
                    "SCHEDULED": "NS",
                    "LIVE": "1H,HT,2H,ET,BT,P",
                    "FINISHED": "FT,AET,PEN"
                };
                url += `&status=${statusMap[status] || status}`;
            }

            logger.info(`Fetching team fixtures for ID: ${teamId} with URL: ${url}`);
            const response = await axios.get(url, FD_apiHeaders);

            await cache.write(cacheKey, response.data);
            logger.info(`Successfully fetched fixtures for team ${teamId}`);
            return response.data;
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