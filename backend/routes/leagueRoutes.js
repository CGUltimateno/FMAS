const express = require("express");
const FootballDataController = require("../controllers/LeagueController");

const router = express.Router();

// GET matches by status
router.get("/matches", FootballDataController.getMatches);

router.get("/matches-latest", FootballDataController.getLatestFinishedMatches);

// GET league standings by league ID
router.get("/:leagueId/standings/", FootballDataController.getLeagueStandings);

// GET popular leagues
router.get("/popular", FootballDataController.getPopularLeagues);

// GET league details by league ID
router.get("/:leagueId", FootballDataController.getLeagueFullDetails);

module.exports = router;
