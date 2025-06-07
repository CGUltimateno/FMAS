const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const logger = require('../logger');

const newsFilePath = path.join(__dirname, '..', 'cache', 'newsArticles.json');
const cacheDir = path.join(__dirname, '..', 'cache');

class NewsService {
    async getAllNews() {
        try {
            // Ensure cache directory exists
            await fs.mkdir(cacheDir, { recursive: true });

            try {
                const data = await fs.readFile(newsFilePath, 'utf8');
                // Handle empty file case
                if (!data.trim()) {
                    logger.info('newsArticles.json is empty, initializing with empty array.');
                    await fs.writeFile(newsFilePath, JSON.stringify([], null, 2), 'utf8');
                    return [];
                }
                return JSON.parse(data);
            } catch (readError) {
                if (readError.code === 'ENOENT') {
                    // File doesn't exist, create it with empty array
                    logger.info('newsArticles.json not found, creating file with empty array.');
                    await fs.writeFile(newsFilePath, JSON.stringify([], null, 2), 'utf8');
                    return [];
                } else if (readError instanceof SyntaxError) {
                    // Invalid JSON, overwrite with empty array
                    logger.warn('Invalid JSON in newsArticles.json, resetting to empty array.', readError);
                    await fs.writeFile(newsFilePath, JSON.stringify([], null, 2), 'utf8');
                    return [];
                }
                throw readError;
            }
        } catch (error) {
            logger.error('Error reading news articles:', error);
            throw new Error('Failed to retrieve news articles.');
        }
    }

    async createNewsArticle(articleData) {
        try {
            const articles = await this.getAllNews();
            const newArticle = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                ...articleData,
            };
            articles.unshift(newArticle);
            await fs.writeFile(newsFilePath, JSON.stringify(articles, null, 2), 'utf8');
            logger.info(`News article created with ID: ${newArticle.id} and title: ${newArticle.title}`);
            return newArticle;
        } catch (error) {
            logger.error('Error creating news article:', error);
            throw new Error('Failed to create news article.');
        }
    }

    async updateNewsArticle(id, articleData) {
        try {
            const articles = await this.getAllNews();
            const articleIndex = articles.findIndex(article => article.id === id);

            if (articleIndex === -1) {
                logger.warn(`News article with ID: ${id} not found for update.`);
                throw new Error('News article not found.');
            }

            const updatedArticle = { ...articles[articleIndex], ...articleData, updatedAt: new Date().toISOString() };
            articles[articleIndex] = updatedArticle;

            await fs.writeFile(newsFilePath, JSON.stringify(articles, null, 2), 'utf8');
            logger.info(`News article with ID: ${id} updated. Title: ${updatedArticle.title}`);
            return updatedArticle;
        } catch (error) {
            logger.error(`Error updating news article with ID: ${id}:`, error);
            if (error.message === 'News article not found.') {
                throw error;
            }
            throw new Error('Failed to update news article.');
        }
    }

    async deleteNewsArticle(id) {
        try {
            let articles = await this.getAllNews();
            const articleIndex = articles.findIndex(article => article.id === id);

            if (articleIndex === -1) {
                logger.warn(`News article with ID: ${id} not found for deletion.`);
                throw new Error('News article not found.');
            }

            const deletedArticle = articles.splice(articleIndex, 1)[0];
            await fs.writeFile(newsFilePath, JSON.stringify(articles, null, 2), 'utf8');
            logger.info(`News article with ID: ${id} and title: ${deletedArticle.title} deleted.`);
            return { message: 'News article deleted successfully.' };
        } catch (error) {
            logger.error(`Error deleting news article with ID: ${id}:`, error);
            if (error.message === 'News article not found.') {
                throw error;
            }
            throw new Error('Failed to delete news article.');
        }
    }
}

module.exports = new NewsService();