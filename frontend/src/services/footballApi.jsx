import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const footballApi = createApi({
    reducerPath: "footballApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/",
    }),
    endpoints: (builder) => ({

        // GET /api/football-data/matches?status=FINISHED|SCHEDULED|LIVE
        getMatchesByStatus: builder.query({
            query: (status) => `leagues/matches?status=${status}`,
        }),

        // GET /api/football-data/league/matches-latest
        getLatestMatch: builder.query({
            query: () => "leagues/matches-latest",
        }),

        // GET /api/football-data/leagues/standings/:leagueId
        getLeagueStandings: builder.query({
            query: (leagueId) => `leagues/${leagueId}/standings`,
        }),

        // GET /api/football-data/popular
        getPopularLeagues: builder.query({
            query: () => "leagues/popular",
        }),

        // GET /api/football-data/leagues/:leagueId
        getLeagueDetails: builder.query({
            query: (leagueId) => `leagues/${leagueId}`,
        }),

       //  GET /api/teams/:teamId
        getTeamDetails: builder.query({
            query: (teamId) => `teams/${teamId}`,
        }),

        // GET /api/leagues/:leagueid/top-stats
        getTopStats: builder.query({
    query: (leagueId) => `leagues/${leagueId}/top-stats`
        }),

        // GET /api/teams/news
        getTrendingNews: builder.query({
            query: () => `teams/news`,
        }),

        // GET /api/teams/:teamId/form/:leagueId
        getTeamForm: builder.query({
            query: ({ teamId, leagueId }) => `teams/${teamId}/form/${leagueId}`,
        }),

        // GET /api/teams/crest/:teamId
        getTeamCrest: builder.query({
            query: (teamId) => `teams/crest/${teamId}`,
        }),

        // GET /api/teams/:teamId/fixtures
        getTeamFixtures: builder.query({
            query: (teamId) => `teams/${teamId}/fixtures`,
        }),

        // GET /api/teams/:teamid/squad
        getTeamSquad: builder.query({
            query: (teamId) => `teams/${teamId}/squad`,
        }),

        // Get player image
        getPlayerImage: builder.query({
            query: (playerId) => `teams/player/${playerId}/image`,
        }),
            // Add more endpoints if you add more routes
    }),
});

export const {
    useGetMatchesByStatusQuery,
    useGetLatestMatchQuery,
    useGetLeagueStandingsQuery,
    useGetPopularLeaguesQuery,
    useGetLeagueDetailsQuery,
    useGetTeamDetailsQuery,
    useGetTopStatsQuery,
    useGetTrendingNewsQuery,
    useGetTeamFormQuery,
    useGetTeamCrestQuery,
    useGetTeamFixturesQuery,
    useGetTeamSquadQuery,
    useGetPlayerImageQuery,
} = footballApi;