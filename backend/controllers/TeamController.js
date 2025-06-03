const TeamService = require("../services/TeamService");
const {error} = require("../logger");

class TeamController {
    static async getTeamDetails(req, res) {
        try {
            const { teamId } = req.params;
            const data = await TeamService.getTeamFullDetails(teamId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTeamStats(req, res) {
        try {
            const { teamId, leagueId } = req.params;
            const data = await TeamService.getTeamStats(teamId, leagueId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTeamFixtures(req, res) {
        try {
            const { teamId } = req.params;
            const { dateFrom, dateTo, status, limit } = req.query;

            const fixtures = await TeamService.getTeamFixtures(teamId, { dateFrom, dateTo, status, limit });
            res.json(fixtures);
        } catch (error) {
            error("Error in getTeamFixtures controller:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async getTeamSquad(req, res) {
        try {
            const { teamId } = req.params;
            const data = await TeamService.getTeamSquad(teamId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getLastMatchInfo(req, res) {
        try {
            const { teamId } = req.params;
            const data = await TeamService.getLastMatchInfo(teamId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = TeamController;
