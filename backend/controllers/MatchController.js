const MatchService = require("../services/MatchService");
const logger = require("../logger");

class MatchController {
    async getMatchDetails(req, res) {
        const matchId = req.params.matchId;
        try {
            const matchDetails = await MatchService.getMatchDetails(matchId);
            res.status(200).json(matchDetails);
        } catch (error) {
            logger.error("Error fetching match details:", error);
            res.status(500).json({ message: "Error fetching match details" });
        }
    }

    async getMatchStats(req, res) {
        const matchId = req.params.matchId;
        try {
            const matchStats = await MatchService.getMatchStats(matchId);
            res.status(200).json(matchStats);
        } catch (error) {
            logger.error("Error fetching match stats:", error);
            res.status(500).json({ message: "Error fetching match stats" });
        }
    }

    async getMatchLineups(req, res) {
        const matchId = req.params.matchId;
        try {
            const lineups = await MatchService.getMatchLineups(matchId);
            res.status(200).json(lineups);
        } catch (error) {
            logger.error("Error fetching match lineups:", error);
            res.status(500).json({ message: "Error fetching match lineups" });
        }
    }

    async getMatchHeadToHead(req, res) {
        const { team1Id, team2Id } = req.params;
        try {
            const headToHead = await MatchService.getMatchHeadToHead(team1Id, team2Id);
            res.status(200).json(headToHead);
        } catch (error) {
            logger.error("Error fetching match head-to-head:", error);
            res.status(500).json({ message: "Error fetching match head-to-head" });
        }
    }

    async getMatchEvents(req, res) {
        const matchId = req.params.matchId;
        try {
            const events = await MatchService.getMatchEvents(matchId);
            res.status(200).json(events);
        } catch (error) {
            logger.error("Error fetching match events:", error);
            res.status(500).json({ message: "Error fetching match events" });
        }
    }

    async predictMatchFromFixture(req, res) {
        const fixtureId = req.params.fixtureId;
        try {
            const prediction = await MatchService.predictMatchFromFixture(fixtureId);
            res.status(200).json(prediction);
        } catch (error) {
            logger.error("Prediction error:", error);
            res.status(500).json({ message: "Error predicting match outcome." });
        }
    }

    async predictAllUpcomingFixtures(req, res) {
        try {
            const predictions = await MatchService.predictAllUpcomingFixtures();
            res.status(200).json(predictions);
        } catch (error) {
            logger.error("Failed to predict upcoming fixtures:", error);
            res.status(500).json({ message: "Error during batch prediction" });
        }
    }
}

module.exports = new MatchController();