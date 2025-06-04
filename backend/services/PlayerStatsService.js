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

  /**
   * Fetches player trophies from API-Football v3, with 6h cache.
   * @param {string|number} fdid Player ID from API-Football
   */
  static async getPlayerTrophies(fdid) {
    try {
      const cacheKey = `playerTrophies-${fdid}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      const url = `${API_FD_BASE_URL}/trophies?player=${fdid}`;
      logger.info(`Fetching player trophies from: ${url}`);

      const [trophiesRes] = await Promise.all([
        axios.get(url, FD_apiHeaders),
      ]);

      const freshData = {
        playerTrophies: trophiesRes.data
      };

      await cache.write(cacheKey, freshData);
      return freshData;

    } catch (error) {
      logger.error(`Error fetching player trophies for fdid ${fdid}: ${error.message}`);
      throw new Error(`Error fetching player trophies: ${error.message}`);
    }
  }
    /**
   * Fetches player career teams from API-Football v3, with 6h cache.
   * @param {string|number} fdid Player ID from API-Football
   */
  static async getPlayerCareer(fdid) {
    try {
      const cacheKey = `playerCareer-${fdid}`;
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 6 });

      if (cachedData) {
        return cachedData;
      }

      const url = `${API_FD_BASE_URL}/players/teams?player=${fdid}`;
      logger.info(`Fetching player career from: ${url}`);

      const [careerRes] = await Promise.all([
        axios.get(url, FD_apiHeaders),
      ]);

      const freshData = {
        playerCareer: careerRes.data
      };

      await cache.write(cacheKey, freshData);
      return freshData;

    } catch (error) {
      logger.error(`Error fetching player career for fdid ${fdid}: ${error.message}`);
      throw new Error(`Error fetching player career: ${error.message}`);
    }
  }

}

module.exports = PlayerStatsService;
