import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/auth",
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.token;
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
