import axios from "axios";
require("dotenv").config();

const accessToken = `bearer ${process.env.LOSTARK_API}` || "";

const instance = axios.create({
    baseURL: "https://developer-lostark.game.onstove.com",
    headers: {
        "Content-Type": "application/json;charset-UTF-8",
        Accept: "application/json"
    }
})

instance.interceptors.request.use(
    (config) => {
        config.headers.Authorization = accessToken;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default instance;