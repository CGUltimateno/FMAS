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
  static async getLeagueAdditionalData(flLeagueId) {
    try {
      const cacheKey = `flLeague-${flLeagueId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 24 });

      if (cachedData) {
        return cachedData;
      }

      // Fetch data from RapidAPI
      const statsUrl = `${API_FL_BASE_URL}/v1/leagues/${flLeagueId}/stats`;
      const teamsUrl = `${API_FL_BASE_URL}/v1/leagues/${flLeagueId}/teams`;

      const [statsRes, teamsRes] = await Promise.all([
        axios.get(statsUrl, FL_apiHeaders),
        axios.get(teamsUrl, FL_apiHeaders),
      ]);

      const freshData = {
        stats: statsRes.data,
        teams: teamsRes.data
      };

      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
      throw new Error(`Error fetching additional league data: ${error.message}`);
    }
  }

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
      const cachedData = await cache.read(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const url = `${API_FL_BASE_URL}/football-popular-leagues`;
      const response = await axios.get(url, FL_apiHeaders);
      const popularLeagues = response.data;

      const freshData = {competitions: popularLeagues};
      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
      throw new Error(`Error fetching popular leagues: ${error.message}`);
    }
  }

  static async getCombinedLeagueData(leagueId) {
    try {
      const cacheKey = `combinedLeague-${leagueId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      // Get data from both APIs
      const fdData = await this.getLeagueFullDetails(leagueId);
      const flLeagueId = getFLLeagueId(leagueId);

      let flData = null;
      if (flLeagueId) {
        try {
          flData = await this.getTopStats(leagueId);
        } catch (error) {
          console.error("Error fetching RapidAPI data:", error.message);
        }
      }

      // Combine the data
      const combinedData = {
        ...fdData,
        rapidApiData: flData
      };

      await cache.write(cacheKey, combinedData);
      return combinedData;
    } catch (error) {
      throw new Error(`Error getting combined league data: ${error.message}`);
    }
  }

  static async getMatchesByStatus(status) {
    try {
      const url = `${API_FD_BASE_URL}/matches?status=${status}`;
      const response = await axios.get(url, FD_apiHeaders);
      return response.data;
    } catch (error) {
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
      // Always fetch fresh data from the API
      const detailsUrl = `${API_FD_BASE_URL}/competitions/${leagueId}`;
      const standingsUrl = `${API_FD_BASE_URL}/competitions/${leagueId}/standings`;
      const matchesUrl = `${API_FD_BASE_URL}/competitions/${leagueId}/matches`;
      const scorersUrl = `${API_FD_BASE_URL}/competitions/${leagueId}/scorers`;

      const [detailsRes, standingsRes, matchesRes, scorersRes] = await Promise.all([
        axios.get(detailsUrl, FD_apiHeaders),
        axios.get(standingsUrl, FD_apiHeaders),
        axios.get(matchesUrl, FD_apiHeaders),
        axios.get(scorersUrl, FD_apiHeaders),
      ]);

      const freshData = {
        details: detailsRes.data,
        standings: standingsRes.data,
        matches: matchesRes.data,
        scorers: scorersRes.data,
      };
      try {
        const flLeagueId = getFLLeagueId(leagueId);
        if (flLeagueId) {
          freshData.additionalStats = await this.getLeagueAdditionalData(flLeagueId);
        }
      } catch (error) {
        console.error("Error fetching additional data from RapidAPI:", error.message);
    }

      const cacheKey = `leagueFullDetails-${leagueId}`;
      const storedData = await cache.read(cacheKey);

      if (storedData && cache.deepEqual(freshData, storedData)) {
        return storedData;
      } else {
        await cache.write(cacheKey, freshData);
        return freshData;
      }
    } catch (error) {
      throw new Error(`Error fetching full league details: ${error.message}`);
    }
  }
}

module.exports = FootballDataService;