const axios = require("axios");
const logger = require("../logger");
const cache = require("../config/CacheService");
const apiConfig = require("../config/apiConfig");
const { headers, API_FD_BASE_URL } = apiConfig;
const FD_apiHeaders = headers.footballData;
class MatchService {
  async getMatchDetails(matchId) {
    try {
      const response = await axios.get(`${API_FD_BASE_URL}/fixtures?id=${matchId}`, FD_apiHeaders);
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

  async getMatchEvents(matchId) {
    try {
      const response = await axios.get(`${API_FD_BASE_URL}/fixtures/events?fixture=${matchId}`, FD_apiHeaders);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        logger.warn(`Match events not found for match ID ${matchId}`);
        return null;
      }
      logger.error(`Error fetching match events for match ID ${matchId}: ${error.message}`);
      throw error;
    }
  }

  async getMatchStats(matchId) {
    try {

      const response = await axios.get(`${API_FD_BASE_URL}/fixtures/statistics?fixture=${matchId}`, FD_apiHeaders);
      const data = response.data?.response;

      if (!data || data.length < 2) {
        logger.warn(`Incomplete statistics for match ID ${matchId}`);
        return { home: {}, away: {} };
      }

      const [homeStats, awayStats] = data;

      const stats = {
        home: homeStats,
        away: awayStats
      };

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
      const cachedData = await cache.read(cacheKey, { maxAgeHours: 12 });

      if (cachedData) return cachedData;

      // First, get fixture info to determine home/away teams
      const fixtureResponse = await axios.get(`${API_FD_BASE_URL}/fixtures?id=${matchId}`, FD_apiHeaders);
      const fixture = fixtureResponse.data?.response?.[0];

      if (!fixture) {
        throw new Error(`Fixture not found for match ID ${matchId}`);
      }

      const homeTeamId = fixture.teams.home?.id;
      const awayTeamId = fixture.teams.away?.id;

      if (!homeTeamId || !awayTeamId) {
        throw new Error(`Missing team IDs for match ID ${matchId}`);
      }

      // Now fetch the lineups
      const response = await axios.get(`${API_FD_BASE_URL}/fixtures/lineups?fixture=${matchId}`, FD_apiHeaders);

      const lineupsData = response.data?.response || [];
      const lineups = { home: null, away: null };

      for (const team of lineupsData) {
        const lineup = {
          team: {
            id: team.team.id,
            name: team.team.name,
            logo: team.team.logo
          },
          formation: team.formation,
          coach: team.coach,
          startXI: team.startXI.map(p => p.player),
          substitutes: team.substitutes.map(p => p.player)
        };

        if (team.team.id === homeTeamId) {
          lineups.home = lineup;
        } else if (team.team.id === awayTeamId) {
          lineups.away = lineup;
        }
      }

      await cache.write(cacheKey, lineups);
      return lineups;
    } catch (error) {
      logger.error(`Error fetching match lineups for match ID ${matchId}: ${error.message}`);
      throw error;
    }
  }

  async getMatchHeadToHead(team1Id, team2Id) {
    try {
      const response = await axios.get(
        `${API_FD_BASE_URL}/fixtures/headtohead?h2h=${team1Id}-${team2Id}`,
        FD_apiHeaders
      );

      const matches = response.data?.response || [];
      return { matches };
    } catch (error) {
      logger.error(`Error fetching H2H for ${team1Id} vs ${team2Id}: ${error.message}`);
      throw error;
    }
  }


}

module.exports = new MatchService();
