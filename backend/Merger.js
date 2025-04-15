const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const logger = require("./logger");
require("dotenv").config();
const stringSimilarity = require("string-similarity");
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const LIVE_API_KEY = process.env.LIVE_API_KEY;
const LIVE_API_HOST = process.env.LIVE_API_HOST;
const API_FD_BASE_URL = "https://api.football-data.org/v4";
const API_FL_BASE_URL = "https://free-api-live-football-data.p.rapidapi.com";
const CACHE_FOLDER = path.join(__dirname, 'cache');
const cacheFilePath = path.join(CACHE_FOLDER, 'apiMappings.json');

const FD_apiHeaders = {
    headers: {
        "X-Auth-Token": FOOTBALL_DATA_API_KEY,
    },
};

const FL_apiHeaders = {
    headers: {
        "x-rapidapi-key": LIVE_API_KEY,
        "x-rapidapi-host": LIVE_API_HOST,
    }
};

const leagueIdMapping = {
    "PL": { "fdId": 2021, "flId": 47 },
    "PD": { "fdId": 2014, "flId": 87 },
    "BL1": { "fdId": 2002, "flId": 54 },
    "SA": { "fdId": 2019, "flId": 55 },
    "FL1": { "fdId": 2015, "flId": 53 },
    "CL": { "fdId": 2001, "flId": 42 },
    "DED": { "fdId": 2003, "flId": 56 },   // Eredivisie (Netherlands)
    "ELC": { "fdId": 2016, "flId": 48 },   // Championship (England)
    "BSA": { "fdId": 2013, "flId": 71 }    // Serie A (Brazil)
};

async function ensureCacheFolderExists() {
    try {
        await fs.mkdir(CACHE_FOLDER, { recursive: true });
    } catch (err) {
        logger.error("Error creating cache folder:", err);
    }
}

async function writeCacheFile(cacheKey, data) {
    const filePath = path.join(CACHE_FOLDER, `${cacheKey}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        logger.error("Error writing cache file:", err);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add this function to your code
function getMatchId(matchId, isFootballData = true) {
    try {
        // Load mappings
        const mappings = require(cacheFilePath);

        if (isFootballData) {
            // Converting from FD ID to FL ID
            return mappings.matches[matchId]?.flId || null;
        } else {
            // Converting from FL ID to FD ID
            for (const [fdId, matchData] of Object.entries(mappings.matches)) {
                if (matchData.flId === matchId) {
                    return fdId;
                }
            }
            return null;
        }
    } catch (error) {
        logger.error(`Error getting match ID mapping: ${error.message}`);
        return null;
    }
}
async function generateApiMappings() {
    logger.info("Starting API mapping generation");
    await ensureCacheFolderExists();

    const mappings = {
        leagues: leagueIdMapping,
        teams: {},
        players: {}
    };

    let apiCallCount = 0;

    for (const [leagueCode, ids] of Object.entries(leagueIdMapping)) {
        const fdLeagueId = ids.fdId;
        const flLeagueId = ids.flId;

        logger.info(`Processing league ${leagueCode} (FD: ${fdLeagueId}, FL: ${flLeagueId})`);

        try {
            const fdTeamsUrl = `${API_FD_BASE_URL}/competitions/${fdLeagueId}/teams`;
            const fdTeamsRes = await axios.get(fdTeamsUrl, FD_apiHeaders);
            const fdTeams = fdTeamsRes.data.teams || [];
            console.log(`FD Teams: ${fdTeams.map(team => team.name).join(', ')}`);

            const flTeamsUrl = `${API_FL_BASE_URL}/football-get-list-all-team?leagueid=${flLeagueId}`;
            const flTeamsRes = await axios.get(flTeamsUrl, FL_apiHeaders);
            const flTeams = flTeamsRes.data.response.list || [];
            console.log(`FL Teams: ${flTeams.map(team => team.name).join(', ')}`);

            for (const fdTeam of fdTeams) {
                const flTeam = findBestMatch(fdTeam.name, flTeams);

                if (flTeam) {
                    if (!mappings.teams[fdTeam.id]) {
                        mappings.teams[fdTeam.id] = {
                            name: fdTeam.name,
                            flId: flTeam.id,
                            leagueCode
                        };
                    }

                    await mapPlayersForTeam(fdTeam.id, flTeam.id, mappings.players, leagueCode);
                } else {
                    logger.warn(`No matching team found for ${fdTeam.name} in league ${leagueCode}`);
                }

                apiCallCount++;
                if (apiCallCount % 5 === 0) {
                    await delay(30000); // 1 minute delay after every 5 API calls
                } else {
                    await delay(6000); // 6 seconds delay between each API call
                }
            }
        } catch (error) {
            logger.error(`Error mapping league ${leagueCode}: ${error.message}`, {
                headers: error.config ? error.config.headers : null,
                response: error.response ? error.response.data : null
            });
        }
    }

    await writeCacheFile('apiMappings', mappings);
    logger.info(`API mappings generated successfully`);

    return mappings;
}
async function mapPlayersForTeam(fdTeamId, flTeamId, playersMapping, leagueCode) {
    try {
        const fdPlayersUrl = `${API_FD_BASE_URL}/teams/${fdTeamId}`;
        const fdTeamRes = await axios.get(fdPlayersUrl, FD_apiHeaders);
        const fdPlayers = fdTeamRes.data.squad || [];
        console.log(`FD Players for team ${fdTeamId}: ${fdPlayers.map(player => player.name).join(', ')}`);

        const flPlayersUrl = `${API_FL_BASE_URL}/football-get-list-player?teamid=${flTeamId}`;
        const flTeamRes = await axios.get(flPlayersUrl, FL_apiHeaders);
        const flPlayers = flTeamRes.data.response.list.flatMap(group => group.members) || [];
        console.log(`FL Players for team ${flTeamId}: ${flPlayers.map(player => player.name).join(', ')}`);

        for (const fdPlayer of fdPlayers) {
            const flPlayer = findBestMatch(fdPlayer.name, flPlayers);

            if (flPlayer) {
                playersMapping[fdPlayer.id] = {
                    name: fdPlayer.name,
                    flId: flPlayer.id,
                    teamId: fdTeamId,
                    flTeamId: flTeamId,
                    leagueCode
                };
            } else {
                logger.warn(`No matching player found for ${fdPlayer.name} in team ${fdTeamId}`);
            }
        }
    } catch (error) {
        logger.error(`Error mapping players for team ${fdTeamId}: ${error.message}`, {
            headers: error.config ? error.config.headers : null,
            response: error.response ? error.response.data : null
        });
    }
}

async function mapMatches() {
    logger.info("Starting match mapping generation");

    // Load existing mappings
    let existingMappings;
    try {
        const fileContent = await fs.readFile(cacheFilePath, "utf8");
        existingMappings = JSON.parse(fileContent);
        if (!existingMappings.matches) {
            existingMappings.matches = {};
        }
    } catch (error) {
        logger.error("Error reading cache file:", error.message);
        existingMappings = { teams: {}, players: {}, matches: {} };
    }

    // Process each league
    for (const [leagueCode, ids] of Object.entries(leagueIdMapping)) {
        const fdLeagueId = ids.fdId;
        const flLeagueId = ids.flId;

        logger.info(`Processing matches for league ${leagueCode} (FD: ${fdLeagueId}, FL: ${flLeagueId})`);

        try {
            // Get matches from Football-Data API
            const fdMatchesUrl = `${API_FD_BASE_URL}/competitions/${fdLeagueId}/matches`;
            const fdMatchesRes = await axios.get(fdMatchesUrl, FD_apiHeaders);
            const fdMatches = fdMatchesRes.data.matches || [];

            // Get teams in this league from Football-Data API
            const fdTeamsUrl = `${API_FD_BASE_URL}/competitions/${fdLeagueId}/teams`;
            const fdTeamsRes = await axios.get(fdTeamsUrl, FD_apiHeaders);
            const fdTeams = fdTeamsRes.data.teams || [];

            // Get matches from FL API for each team in the league
            const allFlMatches = [];

            for (const fdTeam of fdTeams) {
                // Check if we have a mapping for this team
                if (existingMappings.teams[fdTeam.id]) {
                    const flTeamId = existingMappings.teams[fdTeam.id].flId;

                    // Get all matches for this team using the FL API
                    const flMatchesUrl = `${API_FL_BASE_URL}/football-get-all-matches-by-league?leagueid=${flLeagueId}`;
                    const flMatchesRes = await axios.get(flMatchesUrl, FL_apiHeaders);
                    const flMatches = flMatchesRes.data.response?.matches || [];

                    // Filter matches to only include those with this team
                    const teamMatches = flMatches.filter(match =>
                        String(match.home.id) === String(flTeamId) ||
                        String(match.away.id) === String(flTeamId)
                    );

                    // Add to our collection of all FL matches
                    allFlMatches.push(...teamMatches);

                    // Respect API rate limits
                    await delay(6000);
                }
            }

            // Remove duplicates (a match could appear twice, once for each team)
            const uniqueFlMatches = Array.from(new Map(
                allFlMatches.map(match => [match.id, match])
            ).values());

            // Map FD matches to FL matches
            for (const fdMatch of fdMatches) {
                const homeTeamId = fdMatch.homeTeam.id;
                const awayTeamId = fdMatch.awayTeam.id;

                // Check if we have mappings for both teams
                if (existingMappings.teams[homeTeamId] && existingMappings.teams[awayTeamId]) {
                    const flHomeTeamId = existingMappings.teams[homeTeamId].flId;
                    const flAwayTeamId = existingMappings.teams[awayTeamId].flId;
                    const matchDate = new Date(fdMatch.utcDate);

                    // Find the corresponding FL match with better date matching
                    const flMatch = uniqueFlMatches.find(m => {
                        // Get date from Football-Live API format
                        const flDate = new Date(m.status.utcTime);

                        // Check if dates are within 24 hours (more flexible matching)
                        const timeDiff = Math.abs(flDate - matchDate);
                        const hoursDiff = timeDiff / (1000 * 60 * 60);
                        const sameOrCloseDay = hoursDiff < 24;

                        // Check team matching - more flexible comparison with string conversion
                        const teamsMatch =
                            (String(m.home.id) === String(flHomeTeamId)) &&
                            (String(m.away.id) === String(flAwayTeamId));

                        return sameOrCloseDay && teamsMatch;
                    });

                    if (flMatch) {
                        // Store the mapping
                        existingMappings.matches[fdMatch.id] = {
                            flId: flMatch.id,
                            homeTeamId: homeTeamId,
                            awayTeamId: awayTeamId,
                            flHomeTeamId: flHomeTeamId,
                            flAwayTeamId: flAwayTeamId,
                            date: fdMatch.utcDate,
                            flDate: flMatch.status.utcTime,
                            leagueCode: leagueCode
                        };
                        logger.info(`Mapped match: ${fdMatch.id} -> ${flMatch.id} (${fdMatch.homeTeam.name} vs ${fdMatch.awayTeam.name})`);
                    } else {
                        logger.warn(`No FL match found for FD match ${fdMatch.id} (${fdMatch.homeTeam.name} vs ${fdMatch.awayTeam.name})`);
                    }
                } else {
                    logger.warn(`Missing team mapping for match ${fdMatch.id} (${fdMatch.homeTeam.name} vs ${fdMatch.awayTeam.name})`);
                }
            }
        } catch (error) {
            logger.error(`Error mapping matches for league ${leagueCode}: ${error.message}`, {
                headers: error.config ? error.config.headers : null,
                response: error.response ? error.response.data : null
            });
        }
    }

    // Write updated mappings to file
    try {
        await fs.writeFile(cacheFilePath, JSON.stringify(existingMappings, null, 2), "utf8");
        logger.info(`Match mappings generated successfully`);
    } catch (error) {
        logger.error("Error writing cache file:", error.message);
    }

    return existingMappings.matches;
}



function normalizeTeamName(name) {
    return name.toLowerCase()
        .replace(/^(racing club de|stade rennais fc|ogc|olympique|as|fc|sc|ac|rc|stade|club|cf|afc)\s+/g, '') // Remove common prefixes
        .replace(/fc$|cf$|afc$/, '') // Remove common suffixes
        .replace(/\s+/g, '')         // Remove spaces
        .replace(/[^a-z0-9]/g, '')   // Remove special characters
        .replace(/\b\d+\b/g, '')     // Remove standalone numbers (e.g., "1901")
        .trim();
}

function findBestMatch(teamName, teamList) {
    const normalizedTeamName = normalizeTeamName(teamName);
    const normalizedTeamList = teamList.map(team => normalizeTeamName(team.name));
    const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(normalizedTeamName, normalizedTeamList);

    // Adjusted threshold for similarity
    if (bestMatch.rating >= 0.5) { // Lowered threshold from 0.6 to 0.5
        return teamList[bestMatchIndex];
    }

    // Fallback: Partial string matching
    const partialMatch = teamList.find(team => normalizedTeamName.includes(normalizeTeamName(team.name)));
    if (partialMatch) {
        return partialMatch;
    }

    return null;
}

mapMatches();
