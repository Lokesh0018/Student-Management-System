import axios from 'axios';

const backendHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
const api = axios.create({
    baseURL: `http://${backendHost}:5000/api`,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('sms_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
