const axios = require("axios");

const API_BASE_URL = "https://free-api-live-football-data.p.rapidapi.com";
const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = "free-api-live-football-data.p.rapidapi.com";

const apiHeaders = {
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": API_HOST,
  },
};

class LeagueService {

  static async getAllLeagues() {
    try {
      const response = await axios.get(`${API_BASE_URL}/football-get-all-leagues`, apiHeaders);
      return response.data;
    } catch (error) {
      throw new Error("Error fetching all leagues");
    }
  }

 
  static async getPopularLeagues() {
    try {
      const response = await axios.get(`${API_BASE_URL}/football-popular-leagues`, apiHeaders);
      return response.data;
    } catch (error) {
      throw new Error("Error fetching popular leagues");
    }
  }

  static async getLeagueDetails(leagueId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/football-get-league-detail?leagueid=${leagueId}`, apiHeaders);
      return response.data;
    } catch (error) {
      throw new Error("Error fetching league details");
    }
  }

  
  static async getLeagueLogo(leagueId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/football-get-league-logo?leagueid=${leagueId}`, apiHeaders);
      return response.data;
    } catch (error) {
      throw new Error("Error fetching league logo");
    }
  }
}

module.exports = LeagueService;
