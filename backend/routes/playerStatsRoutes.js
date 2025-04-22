const express = require("express");
const PlayerStatsController = require("../controllers/PlayerStatsController");
const router = express.Router();

router.get("/:playerId", PlayerStatsController.getPlayerStats);

module.exports = router;