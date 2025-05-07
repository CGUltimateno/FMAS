const axios = require("axios");
const logger = require("../logger");
const cache = require("../config/CacheService");
const mapJson = require("../cache/apiMappings.json");
const apiConfig = require("../config/apiConfig");

// Use centralized configuration
const { headers, API_FD_BASE_URL, API_FL_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;
const FL_apiHeaders = headers.liveFootball;
class MatchService {
  async getMatchDetails(matchId) {
    try {
      const cacheKey = `matchDetails-${matchId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) return cachedData;

      const response = await axios.get(`${API_FD_BASE_URL}/matches/${matchId}`, FD_apiHeaders);
      await cache.write(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        logger.warn(`Match details not found for match ID ${matchId}`);
        return null;
      }
      logger.error(`Error fetching match details for match ID ${matchId}: ${error.message}`);
      throw error;
    }
  }

  async getMatchStats(matchId) {
    try {
      const cacheKey = `matchStats-${matchId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) return cachedData;

      const response = await axios.get(`${API_FD_BASE_URL}/matches/${matchId}/statistics`, FD_apiHeaders);
      const stats = {
        home: response.data?.statistics?.home || {},
        away: response.data?.statistics?.away || {}
      };

      await cache.write(cacheKey, stats);
      return stats;
    } catch (error) {
      logger.error(`Error fetching match stats for match ID ${matchId}: ${error.message}`);
      throw error;
    }
  }

  async getMatchLineups(matchId) {
    logger.info(`Getting match lineups for match ID: ${matchId}`);
    try {
      const cacheKey = `matchLineups-${matchId}`;
      logger.debug(`Checking cache for key: ${cacheKey}`);
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 12 });

      if (cachedData) {
        logger.info(`Retrieved match lineups from cache for match ID: ${matchId}`);
        return cachedData;
      }

      logger.info(`No cached data found for match ID: ${matchId}`);

      // Try to get the mapping from the static file
      let matchMapping = mapJson.matches[matchId];

      if (matchMapping) {
        logger.info(`Found static mapping for match ID: ${matchId}`, {
          mapping: matchMapping,
          flId: matchMapping.flId
        });
      } else {
        logger.warn(`No static mapping found for match ID: ${matchId}, attempting to create dynamic mapping`);
        matchMapping = await this.createDynamicMatchMapping(matchId);

        if (matchMapping) {
          logger.info(`Successfully created dynamic mapping for match ID: ${matchId}`, {
            newMapping: matchMapping
          });
        }
      }

      if (!matchMapping || !matchMapping.flId) {
        logger.error(`No mapping could be created for match ID: ${matchId}`);
        throw new Error(`No mapping found for match ID ${matchId}`);
      }

      const flMatchId = matchMapping.flId;
      logger.info(`Using FL match ID: ${flMatchId} for FD match ID: ${matchId}`);

      // Fetch home team lineup
      logger.debug(`Fetching home team lineup for FL match ID: ${flMatchId}`);
      const homeEndpoint = `${API_FL_BASE_URL}/football-get-hometeam-lineup?eventid=${flMatchId}`;
      logger.debug(`Home team lineup endpoint: ${homeEndpoint}`);

      const homeResponse = await axios.get(homeEndpoint, FL_apiHeaders);
      logger.debug(`Received home team lineup response`, {
        status: homeResponse.status,
        hasData: !!homeResponse.data,
        hasLineup: !!(homeResponse.data?.response?.lineup)
      });

      // Fetch away team lineup
      logger.debug(`Fetching away team lineup for FL match ID: ${flMatchId}`);
      const awayEndpoint = `${API_FL_BASE_URL}/football-get-awayteam-lineup?eventid=${flMatchId}`;
      logger.debug(`Away team lineup endpoint: ${awayEndpoint}`);

      const awayResponse = await axios.get(awayEndpoint, FL_apiHeaders);
      logger.debug(`Received away team lineup response`, {
        status: awayResponse.status,
        hasData: !!awayResponse.data,
        hasLineup: !!(awayResponse.data?.response?.lineup)
      });

      // Process lineups
      logger.debug(`Processing lineup data`);
      const mapLineup = (data) => {
        if (!data || !data.response || !data.response.lineup) {
          logger.warn(`Missing or invalid lineup data`);
          return null;
        }

        const lineup = data.response.lineup;
        logger.debug(`Processing lineup for team: ${lineup.name || 'Unknown'}`);

        return {
          team: {
            id: lineup.id || 0,
            name: lineup.name || "",
            shortName: lineup.name || "",
            crest: data.team_logo || "",
            rating: lineup.rating || 0
          },
          formation: lineup.formation || 'Unknown',
          starting: (lineup.starters || []).map(player => ({
            id: player.id || 0,
            name: player.name || "",
            firstName: player.firstName || "",
            lastName: player.lastName || "",
            position: player.positionId?.toString() || "",
            shirtNumber: player.shirtNumber || "0",
            isCaptain: player.isCaptain || false,
            age: player.age || 0,
            countryName: player.countryName || "",
            countryCode: player.countryCode || "",
            rating: player.performance?.rating || 0,
            events: player.performance?.events || [],
            substitutionEvents: player.substitutionEvents || [],
            isPlayerOfTheMatch: player.performance?.playerOfTheMatch || false
          })),
          substitutes: (lineup.subs || []).map(player => ({
            id: player.id || 0,
            name: player.name || "",
            firstName: player.firstName || "",
            lastName: player.lastName || "",
            position: player.usualPlayingPositionId?.toString() || "",
            shirtNumber: player.shirtNumber || "0",
            age: player.age || 0,
            countryName: player.countryName || "",
            countryCode: player.countryCode || "",
            events: player.performance?.events || [],
            substitutionEvents: player.substitutionEvents || []
          })),
          coach: lineup.coach ? {
            id: lineup.coach.id || 0,
            name: lineup.coach.name || "",
            firstName: lineup.coach.firstName || "",
            lastName: lineup.coach.lastName || "",
            countryName: lineup.coach.countryName || "",
            countryCode: lineup.coach.countryCode || "",
            age: lineup.coach.age || 0
          } : null,
          unavailable: (lineup.unavailable || []).map(player => ({
            id: player.id || 0,
            name: player.name || "",
            firstName: player.firstName || "",
            lastName: player.lastName || "",
            countryName: player.countryName || "",
            countryCode: player.countryCode || "",
            unavailability: player.unavailability || {}
          })),
          averageStarterAge: lineup.averageStarterAge || 0
        };
      };

      const lineups = {
        home: mapLineup(homeResponse.data),
        away: mapLineup(awayResponse.data)
      };

      logger.debug(`Processed lineups: home team ${lineups.home?.team?.name || 'Unknown'}, away team ${lineups.away?.team?.name || 'Unknown'}`);
      logger.info(`Successfully fetched and processed lineups for match ID: ${matchId}`);

      await cache.write(cacheKey, lineups);
      logger.debug(`Cached lineups for match ID: ${matchId}`);

      return lineups;

    } catch (error) {
      logger.error(`Error fetching match lineups for match ID ${matchId}:`, {
        error: error.message,
        stack: error.stack,
        responseData: error.response?.data,
        responseStatus: error.response?.status
      });
      throw error;
    }
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  async createDynamicMatchMapping(fdMatchId) {
    logger.info(`Creating dynamic mapping for match ID: ${fdMatchId}`);
    try {
      // Get match details from Football-Data API
      const fdMatchUrl = `${API_FD_BASE_URL}/matches/${fdMatchId}`;
      logger.debug(`Fetching FD match details from: ${fdMatchUrl}`);

      const fdMatchResponse = await axios.get(fdMatchUrl, FD_apiHeaders);
      const fdMatch = fdMatchResponse.data;

      if (!fdMatch) {
        logger.error(`Match with ID ${fdMatchId} not found in Football-Data API`);
        throw new Error(`Match with ID ${fdMatchId} not found in Football-Data API`);
      }

      // Extract necessary information
      const homeTeamId = fdMatch.homeTeam.id;
      const awayTeamId = fdMatch.awayTeam.id;
      const leagueCode = fdMatch.competition.code;
      const matchDate = fdMatch.utcDate;
      const matchDateObj = new Date(matchDate);

      logger.info(`Match details retrieved`, {
        homeTeamId,
        homeTeamName: fdMatch.homeTeam.name,
        awayTeamId,
        awayTeamName: fdMatch.awayTeam.name,
        leagueCode,
        matchDate
      });

      // Get the FL league ID from our mapping
      const leagueMapping = mapJson.leagues[leagueCode];
      if (!leagueMapping) {
        logger.error(`No league mapping found for league code ${leagueCode}`);
        throw new Error(`No league mapping found for league code ${leagueCode}`);
      }

      const flLeagueId = leagueMapping.flId;
      logger.info(`Found FL league ID: ${flLeagueId} for league code: ${leagueCode}`);

      // Fetch all matches for this league from FL API
      const flFixturesUrl = `${API_FL_BASE_URL}/football-get-all-matches-by-league?leagueid=${flLeagueId}`;
      logger.debug(`Fetching FL fixtures from: ${flFixturesUrl}`);
      logger.info(flFixturesUrl)
      // Log raw response for debugging
      const flFixturesResponse = await axios.get(flFixturesUrl, FL_apiHeaders);
      logger.debug(`FL API response status: ${flFixturesResponse.status}, response structure:`, {
        hasResponseField: !!flFixturesResponse.data?.response,
        hasMatchesField: !!flFixturesResponse.data?.response?.matches,
        responseKeys: Object.keys(flFixturesResponse.data || {})
      });

      const flMatches = flFixturesResponse.data?.response?.matches || [];
      logger.info(`Found ${flMatches.length} FL matches in league ${flLeagueId}`);

      // If we didn't find any matches, try a direct matches endpoint as fallback
      if (flMatches.length === 0) {
        logger.warn(`No matches found for league ID ${flLeagueId}, trying alternative endpoint`);

        // Try to get some recent/upcoming matches as fallback
        const matchDateFormatted = this.formatDate(matchDateObj);
        const altUrl = `${API_FL_BASE_URL}/football-get-matches-by-date?date=${matchDateFormatted}`;
        logger.debug(`Trying alternative endpoint: ${altUrl}`);

        const altResponse = await axios.get(altUrl, FL_apiHeaders);
        const altMatches = altResponse.data?.response?.matches || [];

        if (altMatches.length > 0) {
          logger.info(`Found ${altMatches.length} matches using date endpoint instead`);
          // Continue with these matches instead
          flMatches.push(...altMatches);
        }
      }

      const fdHomeTeamName = fdMatch.homeTeam.name;
      const fdAwayTeamName = fdMatch.awayTeam.name;
      logger.debug(`Looking for match with home team: "${fdHomeTeamName}" and away team: "${fdAwayTeamName}"`);

      // Find match with similar team names based on the actual response structure
      const matchingFixture = flMatches.find(fixture => {
        // Extract team names from the fixture
        const flHomeTeam = fixture.home?.name || '';
        const flAwayTeam = fixture.away?.name || '';

        logger.debug(`Comparing with FL match: "${flHomeTeam}" vs "${flAwayTeam}"`);

        // Simple string matching (case insensitive)
        const homeMatch = flHomeTeam.toLowerCase().includes(fdHomeTeamName.toLowerCase()) ||
            fdHomeTeamName.toLowerCase().includes(flHomeTeam.toLowerCase());
        const awayMatch = flAwayTeam.toLowerCase().includes(fdAwayTeamName.toLowerCase()) ||
            fdAwayTeamName.toLowerCase().includes(flAwayTeam.toLowerCase());

        return homeMatch && awayMatch;
      });

      if (!matchingFixture) {
        logger.error(`No matching fixture found for teams ${fdHomeTeamName} vs ${fdAwayTeamName}`);
        throw new Error(`No matching fixture found for teams ${fdHomeTeamName} vs ${fdAwayTeamName}`);
      }

      logger.info(`Found matching FL fixture`, {
        fixtureId: matchingFixture.id,
        homeTeam: matchingFixture.home.name,
        awayTeam: matchingFixture.away.name,
        utcTime: matchingFixture.status?.utcTime
      });

      // Create mapping with correct fields based on the actual structure
      const newMapping = {
        flId: matchingFixture.id.toString(),
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        flHomeTeamId: matchingFixture.home.id,
        flAwayTeamId: matchingFixture.away.id,
        date: matchDate,
        flDate: matchingFixture.status?.utcTime || matchDate,
        leagueCode: leagueCode
      };

      logger.info(`Created new mapping object`, { newMapping });

      // Cache this mapping for future use
      const dynamicMappingsKey = `dynamicMatchMappings`;
      const existingMappings = await cache.read(dynamicMappingsKey) || {};
      existingMappings[fdMatchId] = newMapping;
      await cache.write(dynamicMappingsKey, existingMappings);

      logger.info(`Successfully created mapping for match ${fdMatchId}`);

      return newMapping;
    } catch (error) {
      logger.error(`Error creating dynamic match mapping for match ID ${fdMatchId}:`, {
        error: error.message,
        stack: error.stack,
        responseData: error.response?.data,
        responseStatus: error.response?.status
      });
      return null;
    }
  }  async getMatchHeadToHead(team1Id, team2Id) {
    try {
      const response = await axios.get(`${API_FL_BASE_URL}/h2h/${team1Id}/${team2Id}`, FL_apiHeaders);
      const h2hData = {
        matches: response.data?.matches || [],
        statistics: {
          team1Wins: response.data?.team1_wins || 0,
          team2Wins: response.data?.team2_wins || 0,
          draws: response.data?.draws || 0
        }
      };
      return h2hData;
    } catch (error) {
      logger.error(`Error fetching head-to-head data for teams ${team1Id} and ${team2Id}: ${error.message}`);
      throw error;
    }
  }

}

module.exports = new MatchService();
