import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const footballApi = createApi({
    reducerPath: "footballApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/",
    }),
    endpoints: (builder) => ({
        // GET /api/football-data/standings/pl
        getPLStandings: builder.query({
            query: () => "leagues/standings/pl",
        }),

        // GET /api/football-data/matches?status=FINISHED|SCHEDULED|LIVE
        getMatchesByStatus: builder.query({
            query: (status) => `leagues/matches?status=${status}`,
        }),

        getLatestMatch: builder.query({
            query: () => "leagues/matches-latest",
        }),

        // Add more endpoints if you add more routes
    }),
});

export const {
    useGetPLStandingsQuery,
    useGetMatchesByStatusQuery,
    useGetLatestMatchQuery,
} = footballApi;
