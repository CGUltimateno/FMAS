const LeagueService = require("../services/LeagueService");

class LeagueController {
  static async getAllLeagues(req, res) {
    try {
      const leagues = await LeagueService.getAllLeagues();
      res.json(leagues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPopularLeagues(req, res) {
    try {
      const leagues = await LeagueService.getPopularLeagues();
      res.json(leagues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLeagueDetails(req, res) {
    try {
      const { leagueId } = req.params;
      const league = await LeagueService.getLeagueDetails(leagueId);
      res.json(league);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLeagueLogo(req, res) {
    try {
      const { leagueId } = req.params;
      const logo = await LeagueService.getLeagueLogo(leagueId);
      res.json(logo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LeagueController;
