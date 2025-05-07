const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const LIVE_API_KEY = process.env.LIVE_API_KEY;
const LIVE_API_HOST = process.env.LIVE_API_HOST;

const headers = {
    footballData: {
        headers: {
            "X-Auth-Token": FOOTBALL_DATA_API_KEY,
        },
    },
    liveFootball: {
        headers: {
            "x-rapidapi-key": LIVE_API_KEY,
            "x-rapidapi-host": LIVE_API_HOST,
        }
    }
};

module.exports = {
    headers,
    API_FD_BASE_URL: process.env.API_FD_BASE_URL,
    API_FL_BASE_URL: process.env.API_FL_BASE_URL
};