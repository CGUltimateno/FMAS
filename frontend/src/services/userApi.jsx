// src/services/userApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// We'll assume your Node backend has these routes:
// POST /api/auth/login => { message, token, user }
// POST /api/auth/register => { message, user }
// GET  /api/auth/profile => protected route, returns user info
//
// Adjust URLs to match your actual server routes.

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/auth",
        // If you need to attach token for protected routes, do:
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.token; // or wherever you store it
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // 1) Login user
        loginUser: builder.mutation({
            query: (loginData) => ({
                url: "/login",
                method: "POST",
                body: loginData,
            }),
        }),
        // 2) Register user
        registerUser: builder.mutation({
            query: (registerData) => ({
                url: "/register",
                method: "POST",
                body: registerData,
            }),
        }),
        // 3) Get user profile (if needed)
        getProfile: builder.query({
            query: () => "/profile",
        }),
    }),
});

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useGetProfileQuery,
} = userApi;
