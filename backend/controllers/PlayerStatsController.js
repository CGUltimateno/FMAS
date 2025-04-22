const PlayerStatsService = require("../services/PlayerStatsService");

class PlayerStatsController {
    static async getPlayerStats(req, res) {
        try {
            const { playerId } = req.params;
            const data = await PlayerStatsService.getPlayerStats(playerId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = PlayerStatsController;