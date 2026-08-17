import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Interceptor to add custom auth headers since we skipped JWT
api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('sms_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            config.headers['x-user-id'] = user.id;
            config.headers['x-user-role'] = user.role;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
