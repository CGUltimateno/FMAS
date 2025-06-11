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
        return {home: {}, away: {}};
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
      const cachedData = await cache.read(cacheKey, {maxAgeHours: 12});

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
      const lineups = {home: null, away: null};

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
      return {matches};
    } catch (error) {
      logger.error(`Error fetching H2H for ${team1Id} vs ${team2Id}: ${error.message}`);
      throw error;
    }
  }

  async getUpcomingFixtures(limit = 20) {
    try {
      const response = await axios.get(
          `${API_FD_BASE_URL}/fixtures`,
          {
            ...FD_apiHeaders,
            params: {
              status: "NS",  // Not Started
              next: limit
            }
          }
      );
      return response.data?.response || [];
    } catch (error) {
      logger.error(`Error fetching upcoming fixtures: ${error.message}`);
      throw error;
    }
  }

  async predictMatchFromFixture(fixtureId) {
    const matchDetails = await this.getMatchDetails(fixtureId);
    const match = matchDetails?.response?.[0];

    if (!match) {
      throw new Error("Match not found.");
    }

    const payload = {
      home_team_id: match.teams.home.id,
      away_team_id: match.teams.away.id,
      fixture_id: match.fixture.id,
      fixture_date: match.fixture.date.split("T")[0],
      division: this.mapLeagueIdToDivisionCode(match.league.id)
    };

    const predictionRes = await axios.post("http://localhost:8000/PredictFromFixture", payload);
    return predictionRes.data;
  }

  async predictAllUpcomingFixtures(limit = 20) {
    const fixtures = await this.getUpcomingFixtures(limit);
    const predictions = [];

    for (const match of fixtures) {
      const payload = {
        home_team_id: match.teams.home.id,
        away_team_id: match.teams.away.id,
        fixture_id: match.fixture.id,
        fixture_date: match.fixture.date.split("T")[0],
        division: this.mapLeagueIdToDivisionCode(match.league.id)
      };

      try {
        const predictionRes = await axios.post("http://localhost:8000/PredictFromFixture", payload);
        predictions.push({
          fixture_id: payload.fixture_id,
          home_team: match.teams.home.name,
          away_team: match.teams.away.name,
          date: payload.fixture_date,
          prediction: predictionRes.data
        });
      } catch (err) {
        logger.error(`Prediction failed for fixture ${payload.fixture_id}: ${err.message}`);
        predictions.push({
          fixture_id: payload.fixture_id,
          error: "Prediction failed",
          reason: err.message
        });
      }
    }

    return predictions;
  }

  mapLeagueIdToDivisionCode(leagueId) {
    const map = {
      39: "E0", 61: "F1", 78: "D1", 135: "I1", 140: "SP1",
      40: "E1", 62: "F2", 79: "D2", 136: "I2", 141: "SP2",
      94: "N1", 88: "P1", 144: "SC0", 145: "SC1", 147: "SC3",
      203: "G1", 235: "RUS", 82: "B1", 188: "AUT", 196: "ROM",
      215: "POL", 208: "DEN", 214: "FIN"
    };

    return map[leagueId] || "STD";
  }

}

module.exports = new MatchService();