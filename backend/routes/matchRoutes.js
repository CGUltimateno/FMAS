const express = require('express');
const router = express.Router();
const matchController = require('../controllers/MatchController');


router.get('/predict-match/:fixtureId', matchController.predictMatchFromFixture);
// Match details routes
router.get('/:matchId', matchController.getMatchDetails);
router.get('/:matchId/stats', matchController.getMatchStats);
router.get('/:matchId/lineups', matchController.getMatchLineups);
router.get('/:matchId/events', matchController.getMatchEvents);
// Add this new route before `/:matchId` to avoid conflict


// Team related match routes
router.get('/head-to-head/:team1Id/:team2Id', matchController.getMatchHeadToHead);


module.exports = router;