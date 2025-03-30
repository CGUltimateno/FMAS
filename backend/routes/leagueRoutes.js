const express = require("express");
const FootballDataController = require("../controllers/LeagueController");

const router = express.Router();

// GET Premier League standings
router.get("/standings/pl", FootballDataController.getPLStandings);

// GET matches by status
router.get("/matches", FootballDataController.getMatches);

router.get("/matches-latest", FootballDataController.getLatestFinishedMatches);

// GET league standings by league ID
router.get("/:leagueId/standings/", FootballDataController.getLeagueStandings);

// GET popular leagues
router.get("/popular", FootballDataController.getPopularLeagues);

module.exports = router;
