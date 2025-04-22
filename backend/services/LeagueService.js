const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const logger = require("../logger");
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const LIVE_API_KEY = process.env.LIVE_API_KEY;
const API_FD_BASE_URL = "https://api.football-data.org/v4";
const API_FL_BASE_URL = "https://free-api-live-football-data.p.rapidapi.com";

const FD_apiHeaders = {
  headers: {
    "X-Auth-Token": FOOTBALL_DATA_API_KEY,
  },
};

const FL_apiHeaders = {
  headers: {
    "x-rapidapi-key": LIVE_API_KEY,
    "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
  }
}

const CACHE_FOLDER = path.join(__dirname, "..", "cache");
const Mapping = require('../cache/apiMappings.json');

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

async function ensureCacheFolderExists() {
  try {
    await fs.mkdir(CACHE_FOLDER, { recursive: true });
  } catch (err) {
    console.error("Error creating cache folder:", err);
  }
}

async function readCacheFile(cacheKey) {
  const filePath = path.join(CACHE_FOLDER, `${cacheKey}.json`);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

// Helper: Write JSON file to cache
async function writeCacheFile(cacheKey, data) {
  const filePath = path.join(CACHE_FOLDER, `${cacheKey}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing cache file:", err);
  }
}

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

class FootballDataService {
  static async getLeagueAdditionalData(flLeagueId) {
    try {
      const cacheKey = `flLeague-${flLeagueId}`;
      const storedData = await readCacheFile(cacheKey);

      // Return cached data if it exists and is less than 24 hours old
      if (storedData && storedData.timestamp) {
        const cachedTime = new Date(storedData.timestamp);
        const now = new Date();
        const hoursDiff = (now - cachedTime) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          return storedData.data;
        }
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

      await writeCacheFile(cacheKey, {
        timestamp: new Date().toISOString(),
        data: freshData
      });

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
      const storedData = await readCacheFile(cacheKey);

      // Return cached data if it exists and is less than 6 hours old
      if (storedData && storedData.timestamp) {
        const cachedTime = new Date(storedData.timestamp);
        const now = new Date();
        const hoursDiff = (now - cachedTime) / (1000 * 60 * 60);

        if (hoursDiff < 6) {
          return storedData.data;
        }
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

      await ensureCacheFolderExists();
      await writeCacheFile(cacheKey, {
        timestamp: new Date().toISOString(),
        data: freshData
      });
      return freshData;
    } catch (error) {
      throw new Error(`Error fetching top stats: ${error.message}`);
    }
  }

  static async getPopularLeagues() {
    try {
      const cacheKey = `popularLeagues`;
      await ensureCacheFolderExists();
      const storedData = await readCacheFile(cacheKey);

      if (storedData) {
        return storedData;
      }

      const url = `${API_FL_BASE_URL}/football-popular-leagues`;
      const response = await axios.get(url, FL_apiHeaders);
      const popularLeagues = response.data;

      const freshData = {competitions: popularLeagues};
      await writeCacheFile(cacheKey, freshData);
      return freshData;
    } catch (error) {
      throw new Error(`Error fetching popular leagues: ${error.message}`);
    }
  }

  static async getCombinedLeagueData(leagueId) {
    try {
      const cacheKey = `combinedLeague-${leagueId}`;
      const storedData = await readCacheFile(cacheKey);

      // Return cached data if it exists and is less than 6 hours old
      if (storedData && storedData.timestamp) {
        const cachedTime = new Date(storedData.timestamp);
        const now = new Date();
        const hoursDiff = (now - cachedTime) / (1000 * 60 * 60);

        if (hoursDiff < 6) {
          return storedData.data;
        }
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

      await ensureCacheFolderExists();
      await writeCacheFile(cacheKey, {
        timestamp: new Date().toISOString(),
        data: combinedData
      });

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
      await ensureCacheFolderExists();
      const storedData = await readCacheFile(cacheKey);

      if (storedData) {
        return storedData;
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
          await writeCacheFile(cacheKey, matches);
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
      await ensureCacheFolderExists();
      const storedData = await readCacheFile(cacheKey);

      if (storedData) {
        return storedData;
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

      await writeCacheFile(cacheKey, freshData);
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

      await ensureCacheFolderExists();

      const cacheKey = `leagueFullDetails-${leagueId}`;
      const storedData = await readCacheFile(cacheKey);

      if (storedData && deepEqual(freshData, storedData)) {
        return storedData;
      } else {
        await writeCacheFile(cacheKey, freshData);
        return freshData;
      }
    } catch (error) {
      throw new Error(`Error fetching full league details: ${error.message}`);
    }
  }



}


function formatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = FootballDataService;
