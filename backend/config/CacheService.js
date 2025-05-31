const fs = require("fs/promises");
const path = require("path");
const logger = require("../logger");

class CacheService {
    constructor() {
        this.cacheFolder = path.join(__dirname, "..", "cache");
    }

    async ensureCacheFolder() {
        try {
            await fs.mkdir(this.cacheFolder, { recursive: true });
        } catch (err) {
            logger.error("Error creating cache folder:", err);
        }
    }

    async read(cacheKey, options = {}) {
        const filePath = path.join(this.cacheFolder, `${cacheKey}.json`);
        try {
            const data = await fs.readFile(filePath, "utf8");
            const parsed = JSON.parse(data);

            // Check if cache has expired
            if (options.maxAgeHours && parsed.timestamp) {
                const cachedTime = new Date(parsed.timestamp);
                const hoursDiff = (new Date() - cachedTime) / (100 * 60 * 60);

                if (hoursDiff > options.maxAgeHours) {
                    return null; // Cache expired
                }
            }

            return options.withTimestamp ? parsed : (parsed.data || parsed);
        } catch (err) {
            return null; // No cache or invalid cache
        }
    }

    async write(cacheKey, data) {
        await this.ensureCacheFolder();
        const filePath = path.join(this.cacheFolder, `${cacheKey}.json`);

        const dataToCache = {
            timestamp: new Date().toISOString(),
            data
        };

        try {
            await fs.writeFile(filePath, JSON.stringify(dataToCache, null, 2), "utf8");
            return true;
        } catch (err) {
            logger.error(`Error writing cache file ${cacheKey}:`, err);
            return false;
        }
    }

    // Helper for determining if cache update is needed
    deepEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }
}

// Export a singleton instance
module.exports = new CacheService();