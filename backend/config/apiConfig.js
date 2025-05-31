const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

const headers = {
    footballData: {
        headers: {
            "x-rapidapi-key": FOOTBALL_DATA_API_KEY,
        },
    },
};

module.exports = {
    headers,
    API_FD_BASE_URL: process.env.API_FD_BASE_URL,
};