const express = require("express");
const FootballDataController = require("../controllers/LeagueController");

const router = express.Router();

// GET Premier League standings
router.get("/standings/pl", FootballDataController.getPLStandings);

// GET matches by status
router.get("/matches", FootballDataController.getMatches);

router.get("/matches-latest", FootballDataController.getLatestFinishedMatches);


module.exports = router;
