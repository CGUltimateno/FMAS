import { setCredentials } from "./authSlice";
import { store } from "../store/store";

export const loadUserFromStorage = () => {
    try {
        // First try sessionStorage (current session)
        let token = sessionStorage.getItem("token");
        let userJson = sessionStorage.getItem("user");

        // If not found, try localStorage (remembered login)
        if (!token || !userJson) {
            token = localStorage.getItem("token");
            userJson = localStorage.getItem("user");

            // If found in localStorage, also set in sessionStorage for this session
            if (token && userJson) {
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("user", userJson);
            }
        }

        if (token && userJson) {
            const user = JSON.parse(userJson);
            store.dispatch(setCredentials({ token, user }));
            return true;
        }
        return false;
    } catch (error) {
        console.error("Failed to load user from storage", error);
        return false;
    }
};