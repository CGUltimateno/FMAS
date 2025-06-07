import { configureStore } from "@reduxjs/toolkit";
import { footballApi } from "../services/footballApi.jsx";
import { userApi } from "../services/userApi.jsx";
import authReducer from "../services/authSlice.jsx";
import {adminApi} from "../services/adminApi.jsx";

export const store = configureStore({
    reducer: {
        [footballApi.reducerPath]: footballApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        auth: authReducer,
        // ... other slices
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(footballApi.middleware, userApi.middleware, adminApi.middleware),
});