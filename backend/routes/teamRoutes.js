const express = require("express");
const TeamController = require("../controllers/TeamController");
const router = express.Router();

//  GET News
router.get("/news", TeamController.getTrendingNews);

// GET team details by team ID
router.get("/:teamId", TeamController.getTeamDetails);

// GET team form by team ID and league ID
router.get("/:teamId/form/:leagueId", TeamController.getTeamForm);

// GET team crest by team ID
router.get("/crest/:teamId", TeamController.getTeamCrest);

// GET team fixtures by team ID
router.get("/:teamId/fixtures", TeamController.getTeamFixtures);

// GET team squad by team ID
router.get("/:teamId/squad", TeamController.getTeamSquad);


module.exports = router;