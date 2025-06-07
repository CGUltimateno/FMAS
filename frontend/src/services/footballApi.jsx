import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const footballApi = createApi({
    reducerPath: "footballApi",
    tagTypes: ['User', 'PopularLeagues', 'ClubFollowerAnalysis', 'News'], // Added 'User' and other existing tags
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/",
        prepareHeaders: (headers, { getState }) => {
            // Get the token from your auth state
            const token = getState().auth.token;

            // If we have a token, add it to the headers
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
        credentials: 'include', // For cookies if you're using those too
    }),
    endpoints: (builder) => ({

        getUserProfile: builder.query({
            query: () => 'auth/me', // Assuming 'auth/me' is your backend endpoint for current user profile
            providesTags: ['User'],
        }),

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
            query: ({ leagueId, season }) => `leagues/${leagueId}/standings?season=${season}`,
        }),

        // GET /api/football-data/popular
        getPopularLeagues: builder.query({
            query: () => "leagues/popular",
            providesTags: ['PopularLeagues'], // Added tag
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

        getPlayerStats: builder.query({
            query: (playerId) => `players/${playerId}`,
        }),

        getPlayerTrophies: builder.query({
            query: (playerId) => `players/${playerId}/trophies`,
        }),

        getPlayerCareer: builder.query({
            query: (playerId) => `players/${playerId}/career`,
        }),

        getHeadToHead: builder.query({
            query: ({ team1Id, team2Id }) => ({
                url: `match/head-to-head/${team1Id}/${team2Id}`,
                method: 'GET',
            }),
        }),
        getMatchLineups: builder.query({
            query: (matchId) => ({
                url: `match/${matchId}/lineups`,
                method: 'GET',
            }),
        }),

        getSearchResults: builder.query({
            query: (searchTerm) => ({
                url: `search?query=${encodeURIComponent(searchTerm)}`,
                method: 'GET',
            }),
        }),
        // GET /api/matches/:matchId/formation
        getMatchStats: builder.query({
            query: (matchId) => ({
                url: `match/${matchId}/statistics`,
                method: 'GET',
            }),
        }),
        getMatchDetails: builder.query({
            query: (matchId) => `match/${matchId}`,
        }),
        getMatchEvents: builder.query({
            query: (matchId) => `match/${matchId}/events`,
        }),

        // GET /api/admin/clubs/follower-analysis - Fetches follower analysis for all clubs (admin only)
        getClubFollowerAnalysis: builder.query({
            query: () => 'admin/clubs/follower-analysis',
            providesTags: ['ClubFollowerAnalysis'], // Add a tag for caching
        }),

        // GET /api/admin/news - Fetches all news articles (admin only)
        getAllNews: builder.query({
            query: () => 'admin/news', // Updated endpoint
            providesTags: ['News'],
        }),

        // MUTATION to update popular leagues (new)
        updatePopularLeagues: builder.mutation({
            query: (leagueIds) => ({
                url: 'admin/leagues/popular',
                method: 'PUT',
                body: { leagueIds },
            }),
            invalidatesTags: ['PopularLeagues'],
        }),

        // MUTATION to create a news article
        createNewsArticle: builder.mutation({
            query: (newsArticleData) => ({
                url: 'admin/news',
                method: 'POST',
                body: newsArticleData,
            }),
            invalidatesTags: ['News'],
        }),

        // MUTATION to update a news article
        updateNewsArticle: builder.mutation({
            query: ({ id, ...articleData }) => ({
                url: `admin/news/${id}`,
                method: 'PUT',
                body: articleData,
            }),
            invalidatesTags: ['News'],
        }),

        // MUTATION to delete a news article
        deleteNewsArticle: builder.mutation({
            query: (id) => ({
                url: `admin/news/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['News'],
        }),

        followTeam: builder.mutation({
            query: (data) => ({
                url: 'auth/follow-team',
                method: 'POST',
                body: data,
                credentials: 'include',
            }),
            invalidatesTags: ['User'], // Uncommented for cache invalidation
        }),

        unfollowTeam: builder.mutation({
            query: (teamId) => ({
                url: 'auth/unfollow-team',
                method: 'POST',
                body: { teamId },
                credentials: 'include', // Important: include cookies for auth
            }),
            invalidatesTags: ['User'], // Uncommented for cache invalidation
        }),

    }),
});

export const {
    useGetUserProfileQuery, // Export the new hook
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
    useGetPlayerStatsQuery,
    useGetPlayerTrophiesQuery,
    useGetPlayerCareerQuery,
    useGetHeadToHeadQuery,
    useGetMatchLineupsQuery,
    useGetMatchStatsQuery,
    useGetMatchDetailsQuery,
    useGetMatchEventsQuery,
    useGetSearchResultsQuery,
    useGetClubFollowerAnalysisQuery, // Export the new hook
    useGetAllNewsQuery,
    useUpdatePopularLeaguesMutation,
    useCreateNewsArticleMutation,
    useUpdateNewsArticleMutation,
    useDeleteNewsArticleMutation,
    useFollowTeamMutation,
    useUnfollowTeamMutation,
} = footballApi;
