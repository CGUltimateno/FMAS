const axios = require("axios");
const path = require("path");
const logger = require("../logger");
const cache = require("../config/CacheService");
const Mapping = require('../cache/apiMappings.json');
const apiConfig = require("../config/apiConfig");
const { headers, API_FD_BASE_URL, API_FL_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;
const FL_apiHeaders = headers.liveFootball;

const leagueIdMapping = {
  // Premier League
  "PL": { "fdId": 2021, "flId": 47 },
  // La Liga
  "PD": { "fdId": 2014, "flId": 87 },
  // Bundesliga
  "BL1": { "fdId": 2002, "flId": 54 },
  // Serie A
  "SA": { "fdId": 2019, "flId": 55 },
  // Ligue 1
  "FL1": { "fdId": 2015, "flId": 53 },
  // Champions League
  "CL": { "fdId": 2001, "flId": 42 }
};

function getFLLeagueId(fdLeagueId) {
  const mapping = Object.values(leagueIdMapping).find(m => m.fdId === parseInt(fdLeagueId));
  return mapping ? mapping.flId : null;
}

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
      const flLeagueId = getFLLeagueId(leagueId);
      if (!flLeagueId) {
        throw new Error("No mapping found for this league ID");
      }

      const cacheKey = `topStats-${leagueId}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      const topScorersUrl = `${API_FL_BASE_URL}/football-get-top-players-by-goals?leagueid=${flLeagueId}`;
      const topAssistsUrl = `${API_FL_BASE_URL}/football-get-top-players-by-assists?leagueid=${flLeagueId}`;
      const topCardsUrl = `${API_FL_BASE_URL}/football-get-top-players-by-rating?leagueid=${flLeagueId}`;

      const [scorersRes, assistsRes, cardsRes] = await Promise.all([
        axios.get(topScorersUrl, FL_apiHeaders),
        axios.get(topAssistsUrl, FL_apiHeaders),
        axios.get(topCardsUrl, FL_apiHeaders),
      ]);

      const freshData = {
        topScorers: scorersRes.data,
        topAssists: assistsRes.data,
        topCards: cardsRes.data
      };

      await cache.write(cacheKey, freshData);
      return freshData;
    } catch (error) {
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
      const cachedData = await cache.read(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const dateRanges = [
        {dateFrom: formatDate(today), dateTo: formatDate(tomorrow)},
        {dateFrom: formatDate(yesterday), dateTo: formatDate(today)},
      ];

      for (const {dateFrom, dateTo} of dateRanges) {
        const url = `${API_FD_BASE_URL}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`;
        const response = await axios.get(url, FD_apiHeaders);
        const matches = response.data.matches || [];
        if (matches.length > 0) {
          await cache.write(cacheKey, matches);
          return matches;
        }
      }

      return [];
    } catch (error) {
      throw new Error(`Error fetching latest finished matches: ${error.message}`);
    }
  }

  static async getLeagueStandings(leagueId) {
    try {
      const cacheKey = `leagueStandings-${leagueId}`;
      const cachedData = await cache.read(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // Determine if leagueId is a code (PL, CL) or a numeric ID
      let fdLeagueId = leagueId;

      // If it's a numeric ID, it might be an flId that needs conversion
      if (!isNaN(leagueId)) {
        // Convert from flId to fdId using the mapping
        const leagueCode = Object.keys(leagueIdMapping).find(
            code => leagueIdMapping[code].flId === parseInt(leagueId)
        );

        if (leagueCode) {
          fdLeagueId = leagueIdMapping[leagueCode].fdId;
        } else {
          // Check if it's already a valid fdId
          const isValidFdId = Object.values(leagueIdMapping).some(
              mapping => mapping.fdId === parseInt(leagueId)
          );

          if (!isValidFdId) {
            throw new Error(`No mapping found for league ID: ${leagueId}`);
          }
        }
      } else if (leagueIdMapping[leagueId]) {
        // If it's a league code (PL, CL, etc.), get the fdId
        fdLeagueId = leagueIdMapping[leagueId].fdId;
      }

      const url = `${API_FD_BASE_URL}/competitions/${fdLeagueId}/standings`;
      logger.info(`Fetching standings with fdId: ${fdLeagueId}`);

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

      // Try to get additional data from RapidAPI
      try {
        const flLeagueId = getFLLeagueId(leagueId);
        if (flLeagueId) {
          // Merge the data
          freshData.additionalStats = await this.getLeagueAdditionalData(flLeagueId);
        }
      } catch (error) {
        console.error("Error fetching additional data from RapidAPI:", error.message);
        // Continue without the additional data
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