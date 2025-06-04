const express = require('express');
const router = express.Router();
const matchController = require('../controllers/MatchController');

// Match details routes
router.get('/:matchId', matchController.getMatchDetails);
router.get('/:matchId/stats', matchController.getMatchStats);
router.get('/:matchId/lineups', matchController.getMatchLineups);
router.get('/:matchId/events', matchController.getMatchEvents);

// Team related match routes
router.get('/head-to-head/:team1Id/:team2Id', matchController.getMatchHeadToHead);


module.exports = router;