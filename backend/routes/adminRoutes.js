const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/NewsController');
const AdminLeagueController = require('../controllers/AdminLeagueController');
const logger = require('../logger');

// Inline admin middleware - no need for separate import
const isAdmin = (req, res, next) => {
    // Placeholder admin check - implement proper authentication later
    logger.info('Admin middleware check running');
    next(); // Bypassing for development, implement proper checks in production
};

// NEWS ROUTES
// GET /api/admin/news - Get all news articles
router.get('/news', NewsController.getAllNews);

// POST /api/admin/news - Create a new news article
router.post('/news', isAdmin, NewsController.createNewsArticle);

// PUT /api/admin/news/:id - Update a news article
router.put('/news/:id', isAdmin, NewsController.updateNewsArticle);

// DELETE /api/admin/news/:id - Delete a news article
router.delete('/news/:id', isAdmin, NewsController.deleteNewsArticle);

// LEAGUE ROUTES
// GET /api/admin/leagues/search - Search leagues by name
router.get('/leagues/search', isAdmin, AdminLeagueController.searchLeagues);

// PUT /api/admin/leagues/popular - Update popular leagues
router.put('/leagues/popular', isAdmin, AdminLeagueController.updatePopularLeagues);

// GET /api/admin/clubs/follower-analysis - Get club follower analysis
router.get('/clubs/follower-analysis', isAdmin, AdminLeagueController.getClubFollowerAnalysis);

module.exports = router;