const LeagueService = require('../services/LeagueService');
const AdminService = require('../services/AdminService'); // Import AdminService
const logger = require('../logger');

class AdminLeagueController {
    static async searchLeagues(req, res) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: 'Search term (name) is required.' });
        }
        try {
            const results = await LeagueService.searchLeaguesByName(name);
            res.json(results);
        } catch (error) {
            logger.error(`AdminController: Error searching leagues by name '${name}': ${error.message}`);
            res.status(500).json({ message: 'Failed to search leagues', error: error.message });
        }
    }

    static async updatePopularLeagues(req, res) {
        const { leagueIds } = req.body;
        if (!leagueIds || !Array.isArray(leagueIds)) {
            return res.status(400).json({ message: 'Invalid request: leagueIds array is required.' });
        }
        try {
            const result = await LeagueService.updatePopularLeagueIds(leagueIds);
            res.json(result);
        } catch (error) {
            logger.error(`AdminController: Error updating popular leagues: ${error.message}`);
            res.status(500).json({ message: 'Failed to update popular leagues', error: error.message });
        }
    }

    // New method for club follower analysis
    static async getClubFollowerAnalysis(req, res) {
        try {
            const analysisData = await AdminService.getClubFollowerAnalysis();
            res.json(analysisData);
        } catch (error) {
            logger.error(`AdminController: Error fetching club follower analysis: ${error.message}`);
            res.status(500).json({ message: 'Failed to fetch club follower analysis', error: error.message });
        }
    }
}

module.exports = AdminLeagueController;
