const express = require("express");
const TeamController = require("../controllers/TeamController");
const router = express.Router();

// GET team details by team ID
router.get("/:teamId", TeamController.getTeamDetails);

// GET team statistics by team ID and league ID
router.get("/:teamId/stats/:leagueId", TeamController.getTeamStats);

// GET team squad by team ID
router.get("/:teamId/squad", TeamController.getTeamSquad);

// GET team fixtures by team ID
router.get("/:teamId/fixtures", TeamController.getTeamFixtures);

// GET last match information by team ID
router.get("/:teamId/last-match", TeamController.getLastMatchInfo);

module.exports = router;