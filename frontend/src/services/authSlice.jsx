import { createSlice } from "@reduxjs/toolkit";
import { footballApi } from "./footballApi"; // Import the API slice

// Helper to load from storage to keep initial state logic clean
const loadFromSessionStorage = (key, isJson = false) => {
    const item = sessionStorage.getItem(key);
    if (item === null) return null;
    return isJson ? JSON.parse(item) : item;
};

const initialState = {
    token: loadFromSessionStorage("token"),
    user: loadFromSessionStorage("user", true),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user } = action.payload;
            state.user = user;
            state.token = token;
            if (token) {
                sessionStorage.setItem("token", token);
            } else {
                sessionStorage.removeItem("token");
            }
            if (user) {
                sessionStorage.setItem("user", JSON.stringify(user));
            } else {
                sessionStorage.removeItem("user");
            }
        },
        logout: (state) => {
            state.token = null;
            state.user = null;

            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            // Optionally, dispatch an action to reset API state if needed
            // dispatch(footballApi.util.resetApiState());
        },
        updateUserFavoriteTeams: (state, action) => {
            if (state.user) {
                // Ensure action.payload is always an array
                const favoriteTeams = Array.isArray(action.payload) ? action.payload : [];
                state.user = {
                    ...state.user,
                    favoriteTeams: favoriteTeams,
                };
                sessionStorage.setItem("user", JSON.stringify(state.user));
            }
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            footballApi.endpoints.getUserProfile.matchFulfilled,
            (state, action) => {
                // Assuming the payload of getUserProfile is the user object
                state.user = action.payload;
                if (action.payload) {
                    sessionStorage.setItem("user", JSON.stringify(action.payload));
                } else {
                    sessionStorage.removeItem("user");
                }
            }
        );
    },
});

export const { setCredentials, logout, updateUserFavoriteTeams } = authSlice.actions;
export default authSlice.reducer;
