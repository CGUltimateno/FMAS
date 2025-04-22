const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const logger = require("../logger");
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FL_API_KEY            = process.env.LIVE_API_KEY;
const FD_BASE_URL           = "https://api.football-data.org/v4";
const FL_BASE_URL           = "https://free-api-live-football-data.p.rapidapi.com"; // replace with real
const CACHE_FOLDER = path.join(__dirname, "..", "cache");

const fdHeaders = {
  headers: {
    "X-Auth-Token": FOOTBALL_DATA_API_KEY
  }
};

const flHeaders= {
  headers: {
    "x-rapidapi-key": FL_API_KEY,
    "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
  }
}
async function ensureCacheFolderExists() {
  try {
    await fs.mkdir(CACHE_FOLDER, { recursive: true });
  } catch (err) {
    console.error("Error creating cache folder:", err);
  }
}

async function readCacheFile(cacheKey) {
  const filePath = path.join(CACHE_FOLDER, `${cacheKey}.json`);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

async function writeCacheFile(cacheKey, data) {
  const filePath = path.join(CACHE_FOLDER, `${cacheKey}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing cache file:", err);
  }
}



const mapJson = require("../cache/apiMappings.json");

function findFDIdByFLId(flId) {
  if (!mapJson.players) {
    logger.error("No players mapping found in apiMappings.json");
    return null;
  }
  // Iterate over players where key is fdid and value is player object
  for (const fdid in mapJson.players) {
    const player = mapJson.players[fdid];
    // Check if player.flId matches the given flId (convert both to string for safety)
    if (String(player.flId) === String(flId)) {
      logger.debug(`Found fdid ${fdid} for flId ${flId}`);
      return fdid;
    }
  }
  logger.warn(`No fdid found for flId ${flId}`);
  return null;
}

class PlayerStatsService {
  /**
   * Fetches combined FD & FL player data, keyed by FDID, with 6h cache.
   * @param {string|number} flId  Fantasy League player ID
   */
  static async getPlayerStats(flId) {
    try {
      // Find fdid by flid
      const fdid = findFDIdByFLId(flId);
      if (!fdid) {
        throw new Error(`No player found with flId: ${flId}`);
      }

      // Check cache
      const cacheKey = `playerStats-${fdid}`;
      const stored = await readCacheFile(cacheKey);
      if (stored && stored.timestamp) {
        const ageHrs = (Date.now() - new Date(stored.timestamp)) / 36e5;
        if (ageHrs < 6) {
          return stored.data;
        }
      }

      // Build endpoints
      const fdPlayerUrl  = `${FD_BASE_URL}/persons/${fdid}`;
      const fdMatchesUrl = `${FD_BASE_URL}/persons/${fdid}/matches?limit=5`;
      const flPlayerUrl  = `${FL_BASE_URL}/football-get-player-detail?playerid=${flId}`;
      logger.info(`Fl Player URL: ${flPlayerUrl}`);

      // Fetch in parallel
      const [fdInfoRes, fdMatchesRes, flInfoRes] = await Promise.all([
        axios.get(fdPlayerUrl, fdHeaders),
        axios.get(fdMatchesUrl, fdHeaders),
        axios.get(flPlayerUrl, flHeaders),
      ]);

      // Extract data
      const fdPlayerData = fdInfoRes.data;
      const fdMatchesData = fdMatchesRes.data;
      const flData = flInfoRes.data;

      // Create minimal top-level structure for frontend compatibility
      const freshData = {
        // Basic info needed by frontend
        info: fdPlayerData,
        fl: flData.response || {},
        recentMatches: fdMatchesData.matches || [],
        career: fdPlayerData.career || [],
        trophies: fdPlayerData.trophies || [],

        // Essential derived fields for frontend display
        teamName: flData.response?.detail?.find(d => d.translationKey === "team_name")?.value?.fallback,
        teamColor: fdPlayerData.currentTeam?.clubColors?.split('/')[0] || '#0a66c2',
        teamLogoUrl: fdPlayerData.currentTeam?.crest,
      };

      // Cache and return
      await ensureCacheFolderExists();
      await writeCacheFile(cacheKey, {
        timestamp: new Date().toISOString(),
        data: freshData,
      });

      return freshData;

    } catch (error) {
      logger.error(`Failed to fetch player stats for FLID ${flId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = PlayerStatsService;
