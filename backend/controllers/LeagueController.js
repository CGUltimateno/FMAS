const FootballDataService = require("../services/LeagueService");

class LeagueController {

  static async getLatestFinishedMatches(req, res) {
    try {
      const matches = await FootballDataService.getLatestFinishedMatches();
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMatches(req, res) {
    try {
      const { status } = req.query;
      const data = await FootballDataService.getMatchesByStatus(status || "FINISHED");
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
    
  static async getLeagueStandings(req, res) {
    try {
      const { leagueId } = req.params;
      const data = await FootballDataService.getLeagueStandings(leagueId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
    
  static async getPopularLeagues(req, res) {
    try {
      const data = await FootballDataService.getPopularLeagues();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLeagueFullDetails(req, res) {
    try {
      const { leagueId } = req.params;
      // Call your service
      const data = await FootballDataService.getLeagueFullDetails(leagueId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  static async getTopStats(req, res) {
    try {
      const { leagueId } = req.params;
      const data = await FootballDataService.getTopStats(leagueId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

}

module.exports = LeagueController;
