const NewsService = require('../services/NewsService');
const logger = require('../logger');

class NewsController {
    static async getAllNews(req, res) {
        try {
            const articles = await NewsService.getAllNews();
            // Ensure the response is structured consistently with what the frontend expects
            // If AdminNewsList expects an object with a 'data' property or similar, adjust here.
            // Based on AdminNewsList, it seems to expect an array directly.
            res.json(articles);
        } catch (error) {
            logger.error(`NewsController: Error getting all news: ${error.message}`);
            res.status(500).json({ message: 'Failed to retrieve news articles', error: error.message });
        }
    }

    static async createNewsArticle(req, res) {
        try {
            const articleData = req.body;
            if (!articleData.title || !articleData.content) {
                return res.status(400).json({ message: 'Title and content are required.' });
            }
            const dataToCreate = {
                ...articleData,
                sourceStr: articleData.sourceStr || 'Admin',
                page: articleData.page || { url: '#' } // Ensure page object exists
            };
            const newArticle = await NewsService.createNewsArticle(dataToCreate);
            res.status(201).json(newArticle);
        } catch (error) {
            logger.error(`NewsController: Error creating news article: ${error.message}`);
            res.status(500).json({ message: 'Failed to create news article', error: error.message });
        }
    }

    static async updateNewsArticle(req, res) {
        try {
            const { id } = req.params;
            const articleData = req.body;
            const updatedArticle = await NewsService.updateNewsArticle(id, articleData);
            if (!updatedArticle) {
                return res.status(404).json({ message: 'News article not found' });
            }
            res.json(updatedArticle);
        } catch (error) {
            logger.error(`NewsController: Error updating news article: ${error.message}`);
            if (error.message === 'News article not found.') {
                return res.status(404).json({ message: 'News article not found' });
            }
            res.status(500).json({ message: 'Failed to update news article', error: error.message });
        }
    }

    static async deleteNewsArticle(req, res) {
        try {
            const { id } = req.params;
            const result = await NewsService.deleteNewsArticle(id);
            if (!result) { // Should be handled by service throwing an error if not found
                return res.status(404).json({ message: 'News article not found' });
            }
            res.json({ message: 'News article deleted successfully' });
        } catch (error) {
            logger.error(`NewsController: Error deleting news article: ${error.message}`);
            if (error.message === 'News article not found.') {
                return res.status(404).json({ message: 'News article not found' });
            }
            res.status(500).json({ message: 'Failed to delete news article', error: error.message });
        }
    }
}

module.exports = NewsController;
