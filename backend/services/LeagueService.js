const axios = require("axios");
const path = require("path");
const logger = require("../logger");
const cache = require("../config/CacheService");
const apiConfig = require("../config/apiConfig");
const { headers, API_FD_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;


function formatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

class FootballDataService {

  static async getTopStats(leagueId) {
    try {
      const cacheKey = `topStats-${leagueId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      const topScorersUrl = `${API_FD_BASE_URL}/players/topscorers?season=2024&league=${leagueId}`;
      const topAssistsUrl = `${API_FD_BASE_URL}/players/topassists?season=2020&league=${leagueId}`;
      const topRedCardsUrl = `${API_FD_BASE_URL}/players/topredcards?season=2020&league=${leagueId}`;

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
      logger.error(`Error fetching top stats: ${error.message}`);
      throw new Error(`Error fetching top stats: ${error.message}`);
    }
  }

  static async getPopularLeagues() {
    try {
      const cacheKey = `popularLeagues`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 72 });

      if (cachedData) {
        return cachedData;
      }

      // Hardcoded list of popular league IDs
      const popularLeagueIds = [
        39,  // Premier League
        140, // La Liga
        135, // Serie A
        78,  // Bundesliga
        61,  // Ligue 1
        2,   // Champions League
        3,   // Europa League
        848  // Conference League
      ];

      logger.info("Fetching information for popular leagues");

      const url = `${API_FD_BASE_URL}/leagues`;
      const leaguePromises = popularLeagueIds.map(id =>
          axios.get(url, {
            ...FD_apiHeaders,
            params: { id: id }
          })
      );

      const responses = await Promise.all(leaguePromises);

      // Extract and format the league data
      const competitions = responses.map(res => {
        if (res.data && res.data.response && res.data.response.length > 0) {
          return res.data.response[0];
        }
        return null;
      }).filter(league => league !== null);

      const freshData = { competitions };
      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
      logger.error(`Error fetching popular leagues: ${error.message}`);
      throw new Error(`Error fetching popular leagues: ${error.message}`);
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

  static async getLeagueStandings(leagueId) {
    try {
      const cacheKey = `leagueStandings-${leagueId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 24 });

      if (cachedData) {
        return cachedData;
      }

      // Use the correct API endpoint format
      const url = `${API_FD_BASE_URL}/standings?league=${leagueId}&season=2024`;
      logger.info(`Fetching league standings for id: ${leagueId}`);

      const response = await axios.get(url, FD_apiHeaders);
      const freshData = response.data;

      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
      logger.error(`Error fetching league standings: ${error.message}`);
      throw new Error(`Error fetching league standings: ${error.message}`);
    }
  }
  static async getLeagueFullDetails(leagueId) {
    try {
      const standingsUrl = `${API_FD_BASE_URL}/standings`;
      const matchesUrl = `${API_FD_BASE_URL}/fixtures`;

      const params = {
        league: leagueId,
        season: 2024
      };

      logger.info(`Fetching full details for league ID: ${leagueId}`);

      const [standingsRes, matchesRes] = await Promise.all([
        axios.get(standingsUrl, { ...FD_apiHeaders, params }),
        axios.get(matchesUrl, { ...FD_apiHeaders, params }),
      ]);

      const freshData = {
        standings: standingsRes.data,
        matches: matchesRes.data,
      };

      const cacheKey = `leagueFullDetails-${leagueId}`;
      const storedData = await cache.read(cacheKey);

      if (storedData && cache.deepEqual(freshData, storedData)) {
        return storedData;
      } else {
        await cache.write(cacheKey, freshData);
        return freshData;
      }
    } catch (error) {
      logger.error(`Error fetching full league details: ${error.message}`);
      throw new Error(`Error fetching full league details: ${error.message}`);
    }
  }

}

module.exports = FootballDataService;