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

        // Add more endpoints if you add more routes
    }),
});

export const {
    useGetPLStandingsQuery,
    useGetMatchesByStatusQuery,
    useGetLatestMatchQuery,
    useGetLeagueStandingsQuery,
    useGetPopularLeaguesQuery,
} = footballApi;