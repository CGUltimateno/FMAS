import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/admin/", // Adjust if your admin routes have a different base
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token; // Assuming you store your token in auth.token
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        searchLeaguesByName: builder.query({
            query: (searchTerm) => `leagues/search?name=${encodeURIComponent(searchTerm)}`,
        }),
    }),
});

export const {
    useSearchLeaguesByNameQuery, // Export the new query
} = adminApi;

