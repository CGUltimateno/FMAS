const express = require('express');
const router = express.Router();
const matchController = require('../controllers/MatchController');

// Match details routes
router.get('/:matchId', matchController.getMatchDetails);
router.get('/:matchId/stats', matchController.getMatchStats);
router.get('/:matchId/lineups', matchController.getMatchLineups);
router.get('/:matchId/formation', matchController.getMatchFormation);
router.get('/:matchId/performance', matchController.getMatchPerformance);

// Team related match routes
router.get('/head-to-head/:team1Id/:team2Id', matchController.getMatchHeadToHead);
router.get('/form/:teamId/:leagueId', matchController.getMatchForm);
router.get('/fixtures/:teamId', matchController.getMatchFixtures);

module.exports = router;