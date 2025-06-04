const FootballDataService = require("../services/MatchService");


class MatchController {
    async getMatchDetails(req, res) {
        const matchId = req.params.matchId;
        try {
            const matchDetails = await FootballDataService.getMatchDetails(matchId);
            res.status(200).json(matchDetails);
        } catch (error) {
            console.error("Error fetching match details:", error);
            res.status(500).json({ message: "Error fetching match details" });
        }
    }

    async getMatchStats(req, res) {
        const matchId = req.params.matchId;
        try {
            const matchStats = await FootballDataService.getMatchStats(matchId);
            res.status(200).json(matchStats);
        } catch (error) {
            console.error("Error fetching match stats:", error);
            res.status(500).json({ message: "Error fetching match stats" });
        }
    }
    
    async getMatchLineups(req, res) {
        const matchId = req.params.matchId;
        try {
            const lineups = await FootballDataService.getMatchLineups(matchId);
            res.status(200).json(lineups);
        } catch (error) {
            console.error("Error fetching match lineups:", error);
            res.status(500).json({ message: "Error fetching match lineups" });
        }
    }
    
    async getMatchHeadToHead(req, res) {
        const { team1Id, team2Id } = req.params;
        try {
            const headToHead = await FootballDataService.getMatchHeadToHead(team1Id, team2Id);
            res.status(200).json(headToHead);
        } catch (error) {
            console.error("Error fetching match head-to-head:", error);
            res.status(500).json({ message: "Error fetching match head-to-head" });
        }
    }

    async getMatchEvents(req, res) {
        const matchId = req.params.matchId;
        try {
            const events = await FootballDataService.getMatchEvents(matchId);
            res.status(200).json(events);
        } catch (error) {
            console.error("Error fetching match events:", error);
            res.status(500).json({ message: "Error fetching match events" });
        }
    }

    
    
   

};

module.exports = new MatchController();