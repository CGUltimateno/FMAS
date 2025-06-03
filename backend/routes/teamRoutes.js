const express = require("express");
const TeamController = require("../controllers/TeamController");
const router = express.Router();

// GET team details by team ID
router.get("/:teamId", TeamController.getTeamDetails);

// GET team squad by team ID
router.get("/:teamId/squad", TeamController.getTeamSquad);

// GET team fixtures by team ID
router.get("/:teamId/fixtures", TeamController.getTeamFixtures);

module.exports = router;