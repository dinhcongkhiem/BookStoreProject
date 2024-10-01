import axios from 'axios';
import { AUTH_URL } from '../service/config';
let isRefreshing = false;
let refreshSubcribers = [];

const httpRequest = axios.create();

async function refreshToken() {
    try {
        const isRemember = localStorage.getItem('refreshToken') ? 1 : 0;
        const storage = isRemember ? localStorage : sessionStorage;

        const refreshResponse = await axios.post(
            `${AUTH_URL}/refresh_token?isRemember=${isRemember}`,
            { refreshToken: storage.getItem('refreshToken') },
            { withCredentials: true },
        );
        storage.setItem('refreshToken', refreshResponse.data.refreshToken);
    } catch (err) {
        throw err;
    }
}

httpRequest.interceptors.response.use(
    (response) => response,
    (err) => {
        const { config, response } = err;
        const status = response?.status;
        if (status === 401 && !config._retry) {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshToken()
                    .then((newAccessToken) => {
                        config._retry = true;
                        refreshSubcribers.forEach((cb) => cb(newAccessToken));
                    })
                    .catch((err) => {
                        console.error('Error refreshing token: ', err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                        refreshSubcribers = [];
                    });
            }
            const retryOriginalRequest = new Promise((resolve) => {
                refreshSubcribers.push(() => {
                    resolve(httpRequest(config));
                });
            });
            return retryOriginalRequest;
        }
        return Promise.reject(err);
    },
);
export default httpRequest;
