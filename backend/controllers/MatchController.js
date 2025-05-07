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
    async getMatchFormation(req, res) {
        const matchId = req.params.matchId;
        try {
            const formation = await FootballDataService.getMatchFormation(matchId);
            res.status(200).json(formation);
        } catch (error) {
            console.error("Error fetching match formation:", error);
            res.status(500).json({ message: "Error fetching match formation" });
        }
    }
    async getMatchPerformance(req, res) {
        const matchId = req.params.matchId;
        try {
            const performance = await FootballDataService.getMatchPerformance(matchId);
            res.status(200).json(performance);
        } catch (error) {
            console.error("Error fetching match performance:", error);
            res.status(500).json({ message: "Error fetching match performance" });
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
    async getMatchForm(req, res) {
        const { teamId, leagueId } = req.params;
        try {
            const form = await FootballDataService.getMatchForm(teamId, leagueId);
            res.status(200).json(form);
        } catch (error) {
            console.error("Error fetching match form:", error);
            res.status(500).json({ message: "Error fetching match form" });
        }
    }
    async getMatchFixtures(req, res) {
        const teamId = req.params.teamId;
        try {
            const fixtures = await FootballDataService.getMatchFixtures(teamId);
            res.status(200).json(fixtures);
        } catch (error) {
            console.error("Error fetching match fixtures:", error);
            res.status(500).json({ message: "Error fetching match fixtures" });
        }
    }
    
    
   

};

module.exports = new MatchController();