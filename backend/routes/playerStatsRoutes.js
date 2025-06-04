const express = require("express");
const PlayerStatsController = require("../controllers/PlayerStatsController");
const router = express.Router();

router.get("/:playerId", PlayerStatsController.getPlayerStats);
router.get("/:playerId/trophies", PlayerStatsController.getPlayerTrophies);
router.get("/:playerId/career", PlayerStatsController.getPlayerCareer);

module.exports = router;
