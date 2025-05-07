const axios = require("axios");
const logger = require("../logger");
const cache = require("../config/CacheService");
const mapJson = require("../cache/apiMappings.json");
const apiConfig = require("../config/apiConfig");

// Use centralized configuration
const { headers, API_FD_BASE_URL, API_FL_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;
const FL_apiHeaders = headers.liveFootball;

function findFDIdByFLId(flId) {
  if (!mapJson.players) {
    logger.error("No players mapping found in apiMappings.json");
    return null;
  }

  for (const fdid in mapJson.players) {
    const player = mapJson.players[fdid];
    if (String(player.flId) === String(flId)) {
      logger.debug(`Found fdid ${fdid} for flId ${flId}`);
      return fdid;
    }
  }
  logger.warn(`No fdid found for flId ${flId}`);
  return null;
}

class PlayerStatsService {
  /**
   * Fetches combined FD & FL player data, keyed by FDID, with 6h cache.
   * @param {string|number} flId  Fantasy League player ID
   */
  static async getPlayerStats(flId) {
    try {
      // Find fdid by flid
      const fdid = findFDIdByFLId(flId);
      if (!fdid) {
        throw new Error(`No player found with flId: ${flId}`);
      }

      // Check cache
      const cacheKey = `playerStats-${fdid}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      // Build endpoints
      const fdPlayerUrl = `${API_FD_BASE_URL}/persons/${fdid}`;
      const fdMatchesUrl = `${API_FD_BASE_URL}/persons/${fdid}/matches?limit=5`;
      const flPlayerUrl = `${API_FL_BASE_URL}/football-get-player-detail?playerid=${flId}`;
      logger.info(`Fl Player URL: ${flPlayerUrl}`);

      // Fetch in parallel
      const [fdInfoRes, fdMatchesRes, flInfoRes] = await Promise.all([
        axios.get(fdPlayerUrl, FD_apiHeaders),
        axios.get(fdMatchesUrl, FD_apiHeaders),
        axios.get(flPlayerUrl, FL_apiHeaders),
      ]);

      // Extract data
      const fdPlayerData = fdInfoRes.data;
      const fdMatchesData = fdMatchesRes.data;
      const flData = flInfoRes.data;

      // Create minimal top-level structure for frontend compatibility
      const freshData = {
        fdInfo: fdPlayerData,
        fdMatches: fdMatchesData,
        flInfo: flData
      };

      // Cache and return
      await cache.write(cacheKey, freshData);
      return freshData;

    } catch (error) {
      logger.error(`Error fetching player stats for flId ${flId}: ${error.message}`);
      throw new Error(`Error fetching player stats: ${error.message}`);
    }
  }
}

module.exports = PlayerStatsService;