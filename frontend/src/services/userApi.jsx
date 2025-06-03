import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        // 1) Login user
        loginUser: builder.mutation({
            query: (loginData) => ({
                url: "/auth/login",
                method: "POST",
                body: loginData,
            }),
        }),
        // 2) Register user
        registerUser: builder.mutation({
            query: (registerData) => ({
                url: "/auth/register",
                method: "POST",
                body: registerData,
            }),
        }),
        // 3) Get user profile (if needed)
        getProfile: builder.query({
            query: () => "/auth/profile",
        }),

        // follow a team
        followTeam: builder.mutation({
            query: ({ teamId, teamData }) => ({
                url: '/auth/follow-team',
                method: 'POST',
                body: { teamId, teamData }
            })
        }),

        unfollowTeam: builder.mutation({
            query: (teamId) => ({
                url: '/auth/unfollow-team',
                method: 'POST',
                body: { teamId }
            })
        })
    }),
});

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useFollowTeamMutation,
    useUnfollowTeamMutation,
} = userApi;
