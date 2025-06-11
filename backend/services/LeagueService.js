const axios = require("axios");
const path = require("path");
const fs = require('fs').promises; // Added for file system operations
const logger = require("../logger");
const cache = require("../config/CacheService");
const apiConfig = require("../config/apiConfig");
const { headers, API_FD_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;

// Path for the selected popular leagues configuration file
const SELECTED_POPULAR_LEAGUES_CONFIG_PATH = path.join(__dirname, '..', 'cache', 'selectedPopularLeagueIds.json');

class FootballDataService {

  static async getTopStats(leagueId) {
    try {
      const cacheKey = `topStats-${leagueId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      const topScorersUrl = `${API_FD_BASE_URL}/players/topscorers?season=2024&league=${leagueId}`;
      const topAssistsUrl = `${API_FD_BASE_URL}/players/topassists?season=2024&league=${leagueId}`;
      const topRedCardsUrl = `${API_FD_BASE_URL}/players/topredcards?season=2024&league=${leagueId}`;

      const [scorersRes, assistsRes, cardsRes] = await Promise.all([
        axios.get(topScorersUrl, FD_apiHeaders),
        axios.get(topAssistsUrl, FD_apiHeaders),
        axios.get(topRedCardsUrl, FD_apiHeaders),
      ]);

      const freshData = {
        topScorers: scorersRes.data,
        topAssists: assistsRes.data,
        topCards: cardsRes.data
      };

      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
      logger.error(`Error fetching top stats for league ${leagueId}: ${error.message}`);
      throw new Error(`Error fetching top stats for league ${leagueId}: ${error.message}`);
    }
  }

  static async getPopularLeagueIds() {
    try {
        const data = await fs.readFile(SELECTED_POPULAR_LEAGUES_CONFIG_PATH, 'utf-8');
        const ids = JSON.parse(data);
        if (Array.isArray(ids) && ids.every(id => typeof id === 'number')) {
            return ids;
        }
        logger.warn(`selectedPopularLeagueIds.json contained invalid data. Returning empty array.`);
        return [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.info(`selectedPopularLeagueIds.json not found. Returning empty array.`);
        } else {
            logger.error(`Error reading selectedPopularLeagueIds.json: ${error.message}. Returning empty array.`);
        }
        return [];
    }
  }

  static async getPopularLeagues() {
    try {
      const cacheKey = `popularLeagues`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 72 });

      if (cachedData) {
        return cachedData;
      }

      const popularLeagueIds = await this.getPopularLeagueIds();

      if (!popularLeagueIds || popularLeagueIds.length === 0) {
        logger.info("No popular league IDs configured. Returning empty list for popular leagues.");
        const emptyResponse = { competitions: [] };
        await cache.write(cacheKey, emptyResponse);
        return emptyResponse;
      }

      logger.info(`Fetching information for popular leagues using IDs: ${popularLeagueIds.join(', ')}`);

      const url = `${API_FD_BASE_URL}/leagues`;
      const leaguePromises = popularLeagueIds.map(id =>
          axios.get(url, {
            ...FD_apiHeaders,
            params: { id: id }
          }).catch(err => {
            logger.error(`Failed to fetch league details for popular league ID ${id}: ${err.message}`);
            return null;
          })
      );

      const responses = await Promise.all(leaguePromises);

      const competitions = responses
        .filter(res => res && res.data && res.data.response && res.data.response.length > 0)
        .map(res => res.data.response[0]);

      if (competitions.length === 0 && popularLeagueIds.length > 0) {
         logger.warn(`Could not fetch details for any of the configured popular league IDs: ${popularLeagueIds.join(', ')}.`);
      }

      const freshData = { competitions };
      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
      logger.error(`Error fetching popular leagues: ${error.message}`);
      throw new Error(`Error fetching popular leagues: ${error.message}`);
    }
  }

  static async updatePopularLeagueIds(leagueIds) {
    try {
        if (!Array.isArray(leagueIds) || !leagueIds.every(id => typeof id === 'number')) {
            throw new Error('Invalid leagueIds format. Expected an array of numbers.');
        }
        // Ensure the cache directory exists
        await fs.mkdir(path.dirname(SELECTED_POPULAR_LEAGUES_CONFIG_PATH), { recursive: true });
        await fs.writeFile(SELECTED_POPULAR_LEAGUES_CONFIG_PATH, JSON.stringify(leagueIds, null, 2));
        logger.info(`Popular league IDs updated in ${SELECTED_POPULAR_LEAGUES_CONFIG_PATH}`);

        if (cache.delete) {
            await cache.delete('popularLeagues');
            logger.info('Cleared popularLeagues data cache after updating IDs.');
        } else {
            logger.warn('CacheService does not have a delete method. popularLeagues cache will expire based on TTL.');
        }
        return { success: true, message: "Popular league IDs updated successfully." };
    } catch (error) {
        logger.error(`Error updating popular league IDs file: ${error.message}`);
        throw new Error(`Error updating popular league IDs: ${error.message}`);
    }
  }

  static async searchLeaguesByName(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
        logger.warn("Search term is empty or invalid.");
        return [];
    }
    try {
        const url = `${API_FD_BASE_URL}/leagues`;
        logger.info(`Searching leagues from external API with term: "${searchTerm}"`);
        const response = await axios.get(url, {
            ...FD_apiHeaders,
            params: { search: searchTerm.trim() }
        });

        if (!response.data || !response.data.response || !Array.isArray(response.data.response)) {
            logger.error('Invalid response structure when searching leagues.');
            throw new Error('Invalid response structure from external API for league search.');
        }

        const searchResults = response.data.response.map(item => ({
            id: item.league.id,
            name: item.league.name,
            logo: item.league.logo,
            type: item.league.type,
            country_name: item.country.name,
            country_code: item.country.code,
            country_flag: item.country.flag
        }));
        return searchResults;

    } catch (error) {
        logger.error(`Error searching leagues with term "${searchTerm}": ${error.message}`);
        if (error.response) {
            logger.error(`API Error Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        }
        throw new Error(`Error searching leagues: ${error.message}`);
    }
  }

    static async getMatchesByStatus(status) {
        try {
            const cacheKey = `matches-${status}`;
            const cachedData = await cache.read(cacheKey, { maxAgeHours: 1 });

            if (cachedData) {
                return cachedData;
            }

            let url;
            switch (status.toUpperCase()) {
                case 'LIVE':
                    url = `${API_FD_BASE_URL}/fixtures?live=all`;
                    break;
                case 'SCHEDULED':
                    url = `${API_FD_BASE_URL}/fixtures?next=15`;
                    break;
                default:
                    url = `${API_FD_BASE_URL}/fixtures?last=15`;
            }

            logger.info(`Fetching matches with status: ${status}`);
            const response = await axios.get(url, FD_apiHeaders);
            const freshData = response.data;

            await cache.write(cacheKey, freshData);
            return freshData;
        } catch (error) {
            logger.error(`Error fetching matches by status: ${error.message}`);
            throw new Error(`Error fetching matches by status: ${error.message}`);
        }
    }

    static async getLatestFinishedMatches() {
        try {
            const cacheKey = `latestFinishedMatches`;
            const cachedData = await cache.read(cacheKey, { maxAgeHours: 1 });

            if (cachedData) {
                return cachedData;
            }

            const url = `${API_FD_BASE_URL}/fixtures?last=5`;
            const response = await axios.get(url, FD_apiHeaders);

            logger.info(`Fetched ${response.data.results} latest matches`);

            // Return the complete response data
            const matches = response.data;

            await cache.write(cacheKey, matches);
            return matches;
        } catch (error) {
            logger.error(`Error fetching latest matches: ${error.message}`);
            throw new Error(`Error fetching latest matches: ${error.message}`);
        }
    }

    static async getLeagueStandings(leagueId, season) {
    logger.info(`LeagueService.getLeagueStandings called with leagueId: ${leagueId} (type: ${typeof leagueId}), season: ${season} (type: ${typeof season})`);
    try {
      // Use the provided season, or default to current year if not provided.
      const effectiveSeason = season || new Date().getFullYear();

      if (leagueId === undefined || leagueId === null || String(leagueId).toLowerCase() === 'undefined' || String(leagueId).trim() === '') {
        logger.error(`LeagueService.getLeagueStandings: leagueId is invalid. Received: '${leagueId}'`);
        throw new Error(`Invalid leagueId provided: ${leagueId}`);
      }

      const cacheKey = `leagueStandings-${leagueId}-${effectiveSeason}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 24 });

      if (cachedData) {
        if (cachedData.errors && cachedData.parameters && cachedData.parameters.league === 'undefined') {
            logger.warn(`Returning cached data for ${leagueId}-${effectiveSeason} which previously had 'league: undefined' error. Consider clearing this cache if issue persists.`);
        }
        return cachedData;
      }

      const url = `${API_FD_BASE_URL}/standings?league=${leagueId}&season=${effectiveSeason}`;
      logger.info(`Fetching league standings from external API: ${url}`);

      const response = await axios.get(url, FD_apiHeaders);
      const freshData = response.data;

      if (freshData && freshData.errors && freshData.parameters && freshData.parameters.league !== String(leagueId)) {
          logger.error(`External API for ${leagueId}-${effectiveSeason} reported issues or mismatched league parameter. External API params: ${JSON.stringify(freshData.parameters)}, Errors: ${JSON.stringify(freshData.errors)}`);
      }

      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
      logger.error(`Error in LeagueService.getLeagueStandings for league ${leagueId} season ${effectiveSeason}: ${error.message}`);
      if (error.response) {
        logger.error(`Axios Error Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  static async getLeagueFullDetails(leagueId) {
    try {
      const standingsUrl = `${API_FD_BASE_URL}/standings`;
      const matchesUrl = `${API_FD_BASE_URL}/fixtures`;
      const currentYear = new Date().getFullYear();
      let seasonToFetch = currentYear;
      let matchesData;
      let standingsData;
      let attemptPreviousSeason = false;

      logger.info(`Fetching full details for league ID: ${leagueId}, attempting season: ${seasonToFetch}`);

      // First attempt: Current season
      let matchesRes = await axios.get(matchesUrl, {
        ...FD_apiHeaders,
        params: { league: leagueId, season: seasonToFetch },
      });

      matchesData = matchesRes.data;

      // Check if fixtures are empty for the current season
      if (!matchesData.response || matchesData.response.length === 0) {
        logger.info(`No fixtures found for league ID: ${leagueId} for current season: ${seasonToFetch}. Attempting previous season.`);
        seasonToFetch = currentYear - 1; // Fallback to previous season
        attemptPreviousSeason = true;

        matchesRes = await axios.get(matchesUrl, {
          ...FD_apiHeaders,
          params: { league: leagueId, season: seasonToFetch },
        });
        matchesData = matchesRes.data;

        if (!matchesData.response || matchesData.response.length === 0) {
          logger.warn(`No fixtures found for league ID: ${leagueId} for previous season: ${seasonToFetch} either.`);
        } else {
          logger.info(`Fetched fixtures for league ID: ${leagueId} from previous season: ${seasonToFetch}`);
        }
      } else {
        logger.info(`Fetched fixtures for league ID: ${leagueId} from current season: ${seasonToFetch}`);
      }

      // Fetch standings for the season that had matches (or current if both attempts failed to find matches but we proceed)
      const standingsRes = await axios.get(standingsUrl, {
        ...FD_apiHeaders,
        params: { league: leagueId, season: seasonToFetch }, // Use the season for which matches were found (or attempted)
      });
      standingsData = standingsRes.data;

      const freshData = {
        standings: standingsData,
        matches: matchesData,
        retrievedSeason: seasonToFetch, // Add the season info to the response
        attemptedPreviousSeason: attemptPreviousSeason
      };

      // Include season in cache key to avoid conflicts if data for different seasons is fetched.
      const cacheKey = `leagueFullDetails-${leagueId}-season-${seasonToFetch}`;
      // No deepEqual check here as we want to ensure fresh data if season logic changes behavior.
      // Consider if deepEqual is needed based on how often underlying data for a *specific season* changes.
      // For now, always write to cache if we fetched.
      await cache.write(cacheKey, freshData);
      logger.info(`Cached data for league ID: ${leagueId}, season: ${seasonToFetch} under key: ${cacheKey}`);

      return freshData;
    } catch (error) {
      logger.error(`Error fetching full league details for league ID ${leagueId}: ${error.message}`);
      if (error.response && error.response.status === 404 && error.config && error.config.params) {
        logger.warn(`Received 404 for league ${leagueId}, season ${error.config.params.season}. This might indicate no data for this season.`);
      }
      // Rethrow to be handled by the controller
      throw new Error(`Error fetching full league details for league ID ${leagueId}: ${error.message}`);
    }
  }

}

module.exports = FootballDataService;
