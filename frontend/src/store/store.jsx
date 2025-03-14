// store.js
import { configureStore } from "@reduxjs/toolkit";
import { footballApi } from "../services/footballApi.jsx";
import { userApi } from "../services/userApi.jsx";
import authReducer from "../services/authSlice.jsx";

export const store = configureStore({
    reducer: {
        [footballApi.reducerPath]: footballApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        auth: authReducer,
        // ... other slices
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(footballApi.middleware, userApi.middleware),
});