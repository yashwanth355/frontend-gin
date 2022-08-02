import axios from "axios";
import url from "../constants/url";
// import useToken from "../hooks/useToken";

const instance = axios.create({
    baseURL: url.apiUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*',
    },
});



instance?.interceptors.request.use(function (config) {
    if (!!config.data) {
        for (let key of Object.keys(config?.data)) {
            if (config.data[key] === "" || config.data[key] === undefined)
                config.data[key] = null
        }
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Add a response interceptor
instance?.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response.status === 200) {
        return response.data;
    }
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

export default instance;