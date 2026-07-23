import axios from "axios";
import { Platform } from "react-native";

import { getToken } from "../storage/auth";

// Web (browser) can reach the backend via localhost.
// Native (phone/emulator) needs the dev machine's LAN IP instead.
const baseURL = Platform.OS === "web"
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
