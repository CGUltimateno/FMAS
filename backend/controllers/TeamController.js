const TeamService = require("../services/TeamService");

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
    static async getTrendingNews(req, res) {
        try {
            const data = await TeamService.getTrendingNews();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTeamForm(req, res) {
        try {
            const { teamId, leagueId } = req.params;
            const data = await TeamService.getTeamForm(teamId, leagueId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTeamCrest(req, res) {
        try {
            const { teamId } = req.params;
            const data = await TeamService.getTeamCrest(teamId);
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
            logger.error("Error in getTeamFixtures controller:", error.message);
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

    static async getAllTeamMatches(req, res) {
        try {
            const { teamId } = req.params;
            const data = await TeamService.getAllTeamMatches(teamId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getPlayerImage(req, res) {
        try {
            const { playerId } = req.params;
            const data = await TeamService.getPlayerImage(playerId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = TeamController;
