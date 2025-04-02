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
}

module.exports = TeamController;
