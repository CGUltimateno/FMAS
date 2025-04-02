const express = require("express");
const TeamController = require("../controllers/TeamController");
const router = express.Router();

router.get("/:teamId", TeamController.getTeamDetails);

module.exports = router;