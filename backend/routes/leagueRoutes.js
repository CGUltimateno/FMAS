const express = require("express");
const LeagueController = require("../controllers/LeagueController");

const router = express.Router();

router.get("/all", LeagueController.getAllLeagues);
router.get("/popular", LeagueController.getPopularLeagues);
router.get("/:leagueId", LeagueController.getLeagueDetails);
router.get("/:leagueId/logo", LeagueController.getLeagueLogo);

module.exports = router;
