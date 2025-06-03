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

        // GET /api/teams/:teamId/fixtures
        getTeamFixtures: builder.query({
            query: (teamId) => `teams/${teamId}/fixtures`,
        }),

        // GET /api/teams/:teamid/squad
        getTeamSquad: builder.query({
            query: (teamId) => `teams/${teamId}/squad`,
        }),

        // GET /api/teams/:teamid/last-match
        getLastMatch: builder.query({
            query: (teamId) => `teams/${teamId}/last-match`,
        }),

        // GET /api/teams/:teamid/stats/:leagueid
        getTeamStats: builder.query({
            query: ({ teamId, leagueId }) => `teams/${teamId}/stats/${leagueId}`,
        }),
        // Get player image
        getPlayerImage: builder.query({
            query: (playerId) => `teams/player/${playerId}/image`,
        }),

        getPlayerStats: builder.query({
            query: (playerId) => `players/${playerId}`,
        }),

        getHeadToHead: builder.query({
            query: ({ team1Id, team2Id }) => ({
                url: `teams/${team1Id}/matches?otherTeam=${team2Id}&limit=5&status=FINISHED`,
                method: 'GET',
            }),
        }),
        getMatchLineups: builder.query({
            query: (matchId) => ({
                url: `match/${matchId}/lineups`,
                method: 'GET',
            }),
        }),

        // GET /api/matches/:matchId/formation
        getMatchFormation: builder.query({
            query: (matchId) => ({
                url: `match/${matchId}/formation`,
                method: 'GET',
            }),
        }),
        getMatchStats: builder.query({
            query: (matchId) => ({
                url: `match/${matchId}/statistics`,
                method: 'GET',
            }),
        }),
        getMatchDetails: builder.query({
            query: (matchId) => `match/${matchId}`,
        }),
        getMatchTimeline: builder.query({
            query: (matchId) => `match/${matchId}/timeline`,
        }),
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
    useGetLastMatchQuery,
    useGetTeamStatsQuery,
    useGetTeamFixturesQuery,
    useGetTeamSquadQuery,
    useGetPlayerImageQuery,
    useGetPlayerStatsQuery,
    useGetHeadToHeadQuery,
    useGetMatchLineupsQuery,
    useGetMatchFormationQuery,
    useGetMatchStatsQuery,
    useGetMatchDetailsQuery,
    useGetMatchTimelineQuery,
} = footballApi;