const express = require("express");
const FootballDataController = require("../controllers/LeagueController");

const router = express.Router();

// GET matches by status
router.get("/matches", FootballDataController.getMatches);

// GET matches by status
router.get("/matches-latest", FootballDataController.getLatestFinishedMatches);

// GET Popular Leagues (moved up)
router.get("/popular", FootballDataController.getPopularLeagues);

// GET league standings by league ID
router.get("/:leagueId/standings/", FootballDataController.getLeagueStandings);

// GET top stats from RapidAPI
router.get("/:leagueId/top-stats", FootballDataController.getTopStats);

// GET combined league data from both APIs
router.get("/:leagueId/combined", FootballDataController.getCombinedLeagueData);

// GET league details by league ID
router.get("/:leagueId", FootballDataController.getLeagueFullDetails);

module.exports = router;
