import axios from "axios";
import { Platform } from "react-native";

import { getToken } from "../storage/auth";

// EXPO_PUBLIC_ vars are inlined into the bundle at build time, so a
// production build can point at the real deployed backend instead of a
// developer's machine. Falls back to local dev defaults when unset: web
// reaches the backend via localhost, native needs the dev machine's LAN IP.
const baseURL = process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : Platform.OS === "web"
    ? "http://localhost:5001"
    : "http://192.168.100.152:5001";

const API = axios.create({

    baseURL,

    headers:{
        "Content-Type":"application/json"
    }

});


API.interceptors.request.use(async (config) => {

    const token = await getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});


export default API;
