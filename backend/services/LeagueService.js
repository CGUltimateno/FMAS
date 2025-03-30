const axios = require("axios");

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

const API_BASE_URL = "https://api.football-data.org/v4";

const apiHeaders = {
  headers: {
    "X-Auth-Token": FOOTBALL_DATA_API_KEY,
  },
};

class FootballDataService {

  static async getMatchesByStatus(status) {
    try {
      const url = `${API_BASE_URL}/matches?status=${status}`;
      const response = await axios.get(url, apiHeaders);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching matches by status: ${error.message}`);
    }
  }

  static async getLatestFinishedMatches() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateRanges = [
      { dateFrom: formatDate(today), dateTo: formatDate(tomorrow) },
      { dateFrom: formatDate(yesterday), dateTo: formatDate(today) },
    ];

    for (const { dateFrom, dateTo } of dateRanges) {
      const url = `${API_BASE_URL}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`;
      const response = await axios.get(url, apiHeaders);
      const matches = response.data.matches || [];
      if (matches.length > 0) {
        return matches;
      }
    }

    return [];
  }

    static async getLeagueStandings(leagueId) {
        try {
        const url = `${API_BASE_URL}/competitions/${leagueId}/standings`;
        const response = await axios.get(url, apiHeaders);
        return response.data;
        } catch (error) {
        throw new Error(`Error fetching league standings: ${error.message}`);
        }
    }

  static async getPopularLeagues() {
    try {
      const url = `${API_BASE_URL}/competitions?plan=TIER_ONE`;
      const response = await axios.get(url, apiHeaders);
      const popularLeagues = response.data.competitions.filter(league =>
          ["PL", "BL1", "SA", "CL", "FL1"].includes(league.code)
      );
      return { competitions: popularLeagues };
    } catch (error) {
      throw new Error(`Error fetching popular leagues: ${error.message}`);
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
