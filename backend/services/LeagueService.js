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

    if (leagueId === undefined || leagueId === null || String(leagueId).toLowerCase() === 'undefined' || String(leagueId).trim() === '') {
        logger.error(`LeagueService.getLeagueStandings: leagueId is invalid. Received: '${leagueId}'`);
        throw new Error(`Invalid leagueId provided: ${leagueId}`);
    }

    const currentYear = new Date().getFullYear();
    const effectiveSeason = season || currentYear;
    const isDataProblematic = (data) => {
        if (!data) return true;

        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors) && Object.keys(data.errors).length > 0) {
            return true;
        }
        if ((!data.response || (Array.isArray(data.response) && data.response.length === 0)) &&
            (data.results === 0)) {
            return true;
        }
        return false;
    };

    async function getStandingsForSingleSeason(lgId, ssnToFetch) {
        const cacheKey = `leagueStandings-${lgId}-${ssnToFetch}`;
        const cachedData = await cache.read(cacheKey, { maxAgeHours: 24 });

        if (cachedData) {
            logger.info(`Using cached league standings for league ${lgId}, season ${ssnToFetch}`);
            return cachedData;
        }

        const url = `${API_FD_BASE_URL}/standings?league=${lgId}&season=${ssnToFetch}`;
        logger.info(`Fetching league standings from external API: ${url}`);
        try {
            const response = await axios.get(url, FD_apiHeaders);
            const standingsData = response.data;
            if (standingsData && typeof standingsData.errors === 'undefined') {
                standingsData.errors = {};
            }
            await cache.write(cacheKey, standingsData);
            return standingsData;
        } catch (apiError) {
            logger.error(`API error fetching league standings for league ${lgId}, season ${ssnToFetch}: ${apiError.message}`);
            let errorDataToCache;
            if (apiError.response && apiError.response.data) {
                logger.error(`API Error Status: ${apiError.response.status}, Data: ${JSON.stringify(apiError.response.data)}`);
                errorDataToCache = apiError.response.data;
                if (typeof errorDataToCache.errors === 'undefined') errorDataToCache.errors = { api: `Failed request for season ${ssnToFetch}` };
                if (typeof errorDataToCache.response === 'undefined') errorDataToCache.response = [];
                if (typeof errorDataToCache.results === 'undefined') errorDataToCache.results = 0;
            } else {
                errorDataToCache = {
                    errors: { network: `Network error or no response data for season ${ssnToFetch}: ${apiError.message}` },
                    response: [],
                    results: 0
                };
            }
            await cache.write(cacheKey, errorDataToCache);
            return errorDataToCache;
        }
    }

    try {
        let standingsDataCurrentSeason = await getStandingsForSingleSeason(leagueId, effectiveSeason);

        if (isDataProblematic(standingsDataCurrentSeason)) {
            const currentSeasonErrors = standingsDataCurrentSeason ? JSON.stringify(standingsDataCurrentSeason.errors) : 'N/A';
            const currentSeasonResults = standingsDataCurrentSeason ? standingsDataCurrentSeason.results : 'N/A';
            logger.warn(`Data for league ${leagueId}, season ${effectiveSeason} is problematic (Errors: ${currentSeasonErrors}, Results: ${currentSeasonResults}). Attempting to fetch for previous season.`);

            const previousSeason = effectiveSeason - 1;
            if (previousSeason < 1900) {
                 logger.warn(`Previous season ${previousSeason} is too old. Returning data for ${effectiveSeason}.`);
                 return standingsDataCurrentSeason;
            }

            let standingsDataPreviousSeason = await getStandingsForSingleSeason(leagueId, previousSeason);

            if (!isDataProblematic(standingsDataPreviousSeason)) {
                logger.info(`Successfully fetched and using standings for previous season ${previousSeason} for league ${leagueId}.`);
                return standingsDataPreviousSeason;
            } else {
                const prevSeasonErrors = standingsDataPreviousSeason ? JSON.stringify(standingsDataPreviousSeason.errors) : 'N/A';
                const prevSeasonResults = standingsDataPreviousSeason ? standingsDataPreviousSeason.results : 'N/A';
                logger.warn(`Previous season ${previousSeason} also yielded problematic data (Errors: ${prevSeasonErrors}, Results: ${prevSeasonResults}). Returning data for the originally requested/effective season ${effectiveSeason}.`);
                return standingsDataCurrentSeason;
            }
        }

        logger.info(`Successfully fetched standings for league ${leagueId}, season ${effectiveSeason}.`);
        return standingsDataCurrentSeason;

    } catch (error) {
        logger.error(`Unhandled error in getLeagueStandings for league ${leagueId}, season ${effectiveSeason}: ${error.message}`);
        throw new Error(`Error fetching league standings for ${leagueId} season ${effectiveSeason}: ${error.message}`);
    }
  }

  static async getLeagueFullDetails(leagueId, season) {
    try {
      const standingsUrl = `${API_FD_BASE_URL}/standings`;
      const matchesUrl = `${API_FD_BASE_URL}/fixtures`;
      const currentYear = new Date().getFullYear();
      let seasonToFetch = currentYear;
      let matchesData;
      let standingsData;
      let attemptPreviousSeason = false;

      logger.info(`Fetching full details for league ID: ${leagueId}, attempting season: ${seasonToFetch}`);

      let matchesRes = await axios.get(matchesUrl, {
        ...FD_apiHeaders,
        params: { league: leagueId, season: seasonToFetch },
      });

      matchesData = matchesRes.data;

      if (!matchesData.response || matchesData.response.length === 0) {
        logger.info(`No fixtures found for league ID: ${leagueId} for current season: ${seasonToFetch}. Attempting previous season.`);
        seasonToFetch = currentYear - 1;
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

      const standingsRes = await axios.get(standingsUrl, {
        ...FD_apiHeaders,
        params: { league: leagueId, season: seasonToFetch },
      });
      standingsData = standingsRes.data;

      const freshData = {
        standings: standingsData,
        matches: matchesData,
        retrievedSeason: seasonToFetch,
        attemptedPreviousSeason: attemptPreviousSeason
      };

      const cacheKey = `leagueFullDetails-${leagueId}-season-${seasonToFetch}`;
      await cache.write(cacheKey, freshData);
      logger.info(`Cached data for league ID: ${leagueId}, season: ${seasonToFetch} under key: ${cacheKey}`);

      return freshData;
    } catch (error) {
      logger.error(`Error fetching full league details for league ID ${leagueId}: ${error.message}`);
      if (error.response && error.response.status === 404 && error.config && error.config.params) {
        logger.warn(`Received 404 for league ${leagueId}, season ${error.config.params.season}. This might indicate no data for this season.`);
      }
      throw new Error(`Error fetching full league details for league ID ${leagueId}: ${error.message}`);
    }
  }

}

module.exports = FootballDataService;
