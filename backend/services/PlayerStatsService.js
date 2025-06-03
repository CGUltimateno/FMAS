const axios = require("axios");
const logger = require("../logger");
const cache = require("../config/CacheService");
const apiConfig = require("../config/apiConfig");

const { headers, API_FD_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;

class PlayerStatsService {
  /**
   * Fetches player data from API-Football, with 6h cache.
   * @param {string|number} fdid  Player ID from API-Football
   */
  static async getPlayerStats(fdid) {
    try {
      const cacheKey = `playerStats-${fdid}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      const season = 2024;
      const fdPlayerUrl = `${API_FD_BASE_URL}/players?id=${fdid}&season=${season}`;
      logger.info(`Fetching FD data from: ${fdPlayerUrl}`);

      const [fdInfoRes] = await Promise.all([
        axios.get(fdPlayerUrl, FD_apiHeaders),
      ]);

      const freshData = {
        fdInfo: fdInfoRes.data
      };

      await cache.write(cacheKey, freshData);
      return freshData;

    } catch (error) {
      logger.error(`Error fetching player stats for fdid ${fdid}: ${error.message}`);
      throw new Error(`Error fetching player stats: ${error.message}`);
    }
  }
}

module.exports = PlayerStatsService;
