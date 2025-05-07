const axios = require("axios");
const path = require("path");
const logger = require("../logger");
const cache = require("../config/CacheService");
const mapJson = require('../cache/apiMappings.json');
const apiConfig = require("../config/apiConfig");
const { headers, API_FD_BASE_URL, API_FL_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;
const FL_apiHeaders = headers.liveFootball;

class TeamService {
    static async getTeamFullDetails(teamId) {
        try {
            const cacheKey = `teamFullDetails-${teamId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 24 });

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
                    logger.info("FL Team Data:", { additionalData });
                } catch (error) {
                    console.error("Error fetching RapidAPI team details:", error.message);
                }
            }

            // Merge FD data with additional data
            const freshData = {...fdData};
            if (additionalData) {
                freshData.additionalDetails = additionalData;
            }
            logger.info("Fresh Data:", { freshData });
            console.log("Fresh Data:", freshData);
            await cache.write(cacheKey, freshData);
            logger.info(freshData)
            return freshData;
        } catch (error) {
            throw new Error(`Error fetching team details: ${error.message}`);
        }
    }

    static async getTrendingNews() {
        try {
            const cacheKey = `trendingNews`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 6 });

            if (storedData) {
                return storedData;
            }

            const url = `${API_FL_BASE_URL}/football-get-trendingnews`;

            const response = await axios.get(url, FL_apiHeaders);
            const freshData = response.data;

            await cache.write(cacheKey, freshData);
            return freshData;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching trending news: ${error.message}`);
        }
    }

    static async getTeamForm(teamId, leagueId) {
        try {
            const cacheKey = `teamForm-${teamId}-${leagueId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 12 });

            if (storedData) {
                return storedData;
            }

            // Map the teamId to its corresponding flId
            let mappedTeamId = teamId;
            let mappedLeagueId = null;

            if (mapJson.teams && mapJson.teams[teamId] && mapJson.teams[teamId].flId) {
                mappedTeamId = mapJson.teams[teamId].flId;
            } else {
                throw new Error(`No mapping found for team ID: ${teamId}`);
            }

            const numericLeagueId = parseInt(leagueId, 10);

            // First check if leagueId is already an flId
            let foundAsFlId = false;
            for (const leagueKey in mapJson.leagues) {
                if (mapJson.leagues[leagueKey].flId === numericLeagueId) {
                    mappedLeagueId = numericLeagueId; // It's already an flId
                    foundAsFlId = true;
                    logger.info(`League ID ${leagueId} is already an flId`);
                    break;
                }
            }

            // If not found as flId, check if it's an fdId
            if (!foundAsFlId) {
                for (const leagueKey in mapJson.leagues) {
                    if (mapJson.leagues[leagueKey].fdId === numericLeagueId) {
                        mappedLeagueId = mapJson.leagues[leagueKey].flId;
                        logger.info(`Converted fdId ${leagueId} to flId ${mappedLeagueId}`);
                        break;
                    }
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

            await cache.write(cacheKey, matchesWithTeamFlag);
            return matchesWithTeamFlag;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching team form: ${error.message}`);
        }
    }

    static async getTeamCrest(teamId) {
        try {
            const cacheKey = `teamCrest-${teamId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 48 });

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

            await cache.write(cacheKey, freshData);
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

            const storedData = await cache.read(cacheKey, { maxAgeHours: 6 });

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

            await cache.write(cacheKey, processedMatches);
            return processedMatches;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching team fixtures: ${error.message}`);
        }
    }

    static async getTeamSquad(teamId) {
        logger.info(`SQUAD: Function called with teamId: ${teamId}`);
        try {
            const cacheKey = `teamSquad-${teamId}`;
            logger.debug(`SQUAD: Created cache key: ${cacheKey}`);

            let storedData = null;
            try {
                storedData = await cache.read(cacheKey, { maxAgeHours: 24 });
                logger.debug(`SQUAD: Cache check result: ${storedData ? 'HIT' : 'MISS'}`);
            } catch (cacheError) {
                logger.error(`SQUAD: Cache read error:`, { error: cacheError.message });
            }

            if (storedData) {
                logger.info(`SQUAD: Returning cached data for team ${teamId}`);
                return storedData;
            }

            logger.info(`SQUAD: No cached data found, proceeding to API request`);

            // Check if mapJson exists and has required structure
            logger.debug(`SQUAD: mapJson check - exists: ${!!mapJson}, hasTeams: ${mapJson && !!mapJson.teams}`);

            // Map the teamId to its corresponding flId
            const teamMapping = mapJson?.teams?.[teamId];
            logger.debug(`SQUAD: Team mapping object:`, { teamMapping });

            const mappedTeamId = teamMapping?.flId;
            logger.info(`SQUAD: Mapped Team ID lookup:`, {
                originalId: teamId,
                mappedId: mappedTeamId,
                mappingFound: !!mappedTeamId
            });

            if (!mappedTeamId) {
                logger.error(`SQUAD: No mapping found for team ID: ${teamId}`);
                throw new Error(`No mapping found for team ID: ${teamId}`);
            }

            const url = `${API_FL_BASE_URL}/football-get-list-player?teamid=${mappedTeamId}`;
            logger.info(`SQUAD: Preparing API request to: ${url}`);
            logger.debug(`SQUAD: Using headers:`, {
                headerKeys: Object.keys(FL_apiHeaders),
                hasAuth: !!FL_apiHeaders.headers?.['X-RapidAPI-Key']
            });

            logger.info(`SQUAD: Sending API request...`);
            let response;
            try {
                response = await axios.get(url, FL_apiHeaders);
                logger.info(`SQUAD: API request successful, status: ${response.status}`);
                logger.debug(`SQUAD: Response structure:`, {
                    hasData: !!response.data,
                    dataKeys: response.data ? Object.keys(response.data) : [],
                    hasResponse: !!response.data?.response,
                    responseType: response.data?.response ? typeof response.data.response : 'undefined',
                    hasList: !!response.data?.response?.list
                });
            } catch (apiError) {
                logger.error(`SQUAD: API request failed:`, {
                    message: apiError.message,
                    status: apiError.response?.status,
                    statusText: apiError.response?.statusText,
                    responseData: apiError.response?.data
                });
                throw apiError;
            }

            // Updated path to match the actual response structure
            let squad = [];
            try {
                squad = response.data.response?.list || [];
                logger.info(`SQUAD: Extracted ${squad.length} players from response`);
                if (squad.length > 0) {
                    logger.debug(`SQUAD: First player sample:`, squad[0]);
                }
            } catch (parseError) {
                logger.error(`SQUAD: Failed to parse response:`, { error: parseError.message });
                throw parseError;
            }

            try {
                logger.info(`SQUAD: Writing data to cache...`);
                await cache.write(cacheKey, squad);
                logger.info(`SQUAD: Successfully cached team squad data`);
            } catch (cacheError) {
                logger.error(`SQUAD: Failed to write to cache:`, { error: cacheError.message });
                // Continue despite cache write failure
            }

            logger.info(`SQUAD: Successfully completed getTeamSquad for team ${teamId}`);
            return squad;
        } catch (error) {
            logger.error(`SQUAD: Error in getTeamSquad:`, {
                message: error.message,
                stack: error.stack,
                responseStatus: error.response?.status,
                responseData: error.response?.data
            });
            throw new Error(`Error fetching team squad: ${error.message}`);
        }
    }

    static async getAllTeamMatches(teamId) {
        try {
            const cacheKey = `teamMatches-${teamId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 12 });

            if (storedData) {
                return storedData;
            }

            const teamUrl = `${API_FD_BASE_URL}/teams/${teamId}`;
            const teamResponse = await axios.get(teamUrl, FD_apiHeaders);
            const teamLeagues = teamResponse.data.runningCompetitions || [];

            if (teamLeagues.length === 0) {
                throw new Error(`No leagues found for team ID: ${teamId}`);
            }

            const mappedTeamId = Mapping.teams[teamId]?.flId;
            logger.info("Mapped Team ID:", { mappedTeamId });
            if (!mappedTeamId) {
                throw new Error(`No mapping found for team ID: ${teamId}`);
            }

            let primaryLeagueId = null;
            let leagueCode = null;
            for (const league of teamLeagues) {
                const numericLeagueId = parseInt(league.id, 10);
                for (const leagueKey in Mapping.leagues) {
                    if (Mapping.leagues[leagueKey].fdId === numericLeagueId) {
                        primaryLeagueId = Mapping.leagues[leagueKey].flId;
                        leagueCode = Mapping.leagues[leagueKey].code;
                        break;
                    }
                }
                if (primaryLeagueId) break;
            }

            if (!primaryLeagueId) {
                throw new Error(`No mapping found for any of team ${teamId}'s leagues`);
            }

            // Get Football Data API matches for the team
            const fdMatchesUrl = `${API_FD_BASE_URL}/teams/${teamId}/matches?status=SCHEDULED`;
            const fdMatchesResponse = await axios.get(fdMatchesUrl, FD_apiHeaders);
            const fdMatches = fdMatchesResponse.data.matches || [];

            // Get LiveFootball API matches for the league
            const url = `${API_FL_BASE_URL}/football-get-all-matches-by-league?leagueid=${primaryLeagueId}`;
            logger.info("Request URL:", { url });

            const response = await axios.get(url, FL_apiHeaders);
            const allMatches = response.data.response?.matches || [];

            const teamMatches = allMatches.filter(match =>
                String(match.home.id) === String(mappedTeamId) ||
                String(match.away.id) === String(mappedTeamId)
            );

            const processedMatches = teamMatches.map(match => ({
                ...match,
                isHomeTeam: String(match.home.id) === String(mappedTeamId)
            }));

            // Update mappings for new matches
            await this.updateMatchMappings(fdMatches, teamMatches, leagueCode);

            await cache.write(cacheKey, processedMatches);
            return processedMatches;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            throw new Error(`Error fetching all team matches: ${error.message}`);
        }
    }

    static async updateMatchMappings(fdMatches, flMatches, leagueCode) {
        try {
            // Load current mappings
            const mappingsPath = path.resolve(__dirname, '../cache/apiMappings.json');
            const mappingsData = JSON.parse(JSON.stringify(Mapping));

            let updateNeeded = false;

            // Go through FD matches and find corresponding FL matches
            for (const fdMatch of fdMatches) {
                const fdMatchId = fdMatch.id.toString();

                // Skip if already mapped
                if (mappingsData.matches && mappingsData.matches[fdMatchId]) {
                    continue;
                }

                // Find corresponding FL match by comparing date and teams
                const fdDate = new Date(fdMatch.utcDate);
                const fdHomeTeamId = fdMatch.homeTeam.id;
                const fdAwayTeamId = fdMatch.awayTeam.id;

                // Map team IDs
                const flHomeTeamId = Mapping.teams[fdHomeTeamId]?.flId;
                const flAwayTeamId = Mapping.teams[fdAwayTeamId]?.flId;

                if (!flHomeTeamId || !flAwayTeamId) {
                    logger.warn(`Missing team mapping for match ${fdMatchId}`);
                    continue;
                }

                // Find matching FL match
                const matchingFlMatch = flMatches.find(flMatch => {
                    const flDate = new Date(flMatch.status.utcTime);
                    const timeDiff = Math.abs(fdDate - flDate) / (1000 * 60 * 60); // Diff in hours

                    return (
                        timeDiff < 24 && // Within 24 hours
                        String(flMatch.home.id) === String(flHomeTeamId) &&
                        String(flMatch.away.id) === String(flAwayTeamId)
                    );
                });

                if (matchingFlMatch) {
                    // Create new mapping entry
                    if (!mappingsData.matches) {
                        mappingsData.matches = {};
                    }

                    mappingsData.matches[fdMatchId] = {
                        flId: matchingFlMatch.id.toString(),
                        homeTeamId: fdHomeTeamId,
                        awayTeamId: fdAwayTeamId,
                        flHomeTeamId: parseInt(matchingFlMatch.home.id),
                        flAwayTeamId: parseInt(matchingFlMatch.away.id),
                        date: fdMatch.utcDate,
                        flDate: matchingFlMatch.status.utcTime,
                        leagueCode: leagueCode
                    };

                    updateNeeded = true;
                    logger.info(`Added new match mapping: ${fdMatchId} → ${matchingFlMatch.id}`);
                }
            }

            // Save updated mappings if changes were made
            if (updateNeeded) {
                await fs.writeFile(mappingsPath, JSON.stringify(mappingsData, null, 2), 'utf8');
                // Update in-memory mappings
                Object.assign(Mapping, mappingsData);
                logger.info('Updated match mappings in apiMappings.json');
            }
        } catch (error) {
            logger.error(`Error updating match mappings: ${error.message}`);
            // Don't throw error to prevent API call failure
        }
    }
    static async getPlayerImage(playerId) {
        try {
            const cacheKey = `playerImage-${playerId}`;
            const storedData = await cache.read(cacheKey, { maxAgeHours: 72 });

            if (storedData) {
                return storedData;
            }

            let idToUse = playerId;

            if (mapJson.players && mapJson.players[playerId]) {
                idToUse = mapJson.players[playerId].flId;
                logger.info("Using mapped Player ID:", { originalId: playerId, mappedId: idToUse });
            } else {
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

            await cache.write(cacheKey, freshData);
            return freshData;
        } catch (error) {
            logger.error("Error details:", {error: error.response ? error.response.data : error.message});
            return "/images/player-placeholder.png";
        }
    }
}

module.exports = TeamService;