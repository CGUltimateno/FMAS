import { createSlice } from "@reduxjs/toolkit";

// Get stored user data and token on initial load
const storedToken = sessionStorage.getItem("token") || null;
const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");

const initialState = {
    token: storedToken,
    user: storedUser,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user } = action.payload;
            state.user = user;
            state.token = token;

            // Persist to sessionStorage
            if (token) sessionStorage.setItem("token", token);
            if (user) sessionStorage.setItem("user", JSON.stringify(user));
        },
        logout: (state) => {
            state.token = null;
            state.user = null;

            // Clear from sessionStorage
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;