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

        // 4) Update user profile
        updateProfile: builder.mutation({
            query: (formData) => ({
                url: "/auth/profile",
                method: "PUT",
                body: formData,
            }),
        }),

        // 5) Verify Email
        verifyEmail: builder.mutation({
            query: (token) => ({
                url: `/auth/verify-email/${token}`,
                method: "GET",
            }),
        }),

        forgotPassword: builder.mutation({
            query: (email) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body: { email },
            }),
        }),

        resetPassword: builder.mutation({
            query: ({ token, newPassword }) => ({
                url: `/auth/reset-password/${token}`,
                method: "POST",
                body: { password: newPassword },
            }),
        }),

        // 6) Resend Verification Email
        resendVerificationEmail: builder.mutation({
            query: ({ email }) => ({
                url: "/auth/resend-verification-email",
                method: "POST",
                body: { email },
            }),
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
    useUpdateProfileMutation,
    useVerifyEmailMutation,
    useResendVerificationEmailMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = userApi;
