import axios from 'axios';

// Base URL — in development points to local Express server
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
    withCredentials: true, // Required for httpOnly JWT cookies
});

// ─── Authentication ───────────────────────────────────

export const sendOtp = (email) =>
    api.post('/api/auth/send-otp', { email });

export const verifyOtp = (email, otp) =>
    api.post('/api/auth/verify-otp', { email, otp });

export const logout = () =>
    api.post('/api/auth/logout');

export const getMe = () =>
    api.get('/api/auth/me');

// ─── Project Management ───────────────────────────────

export const createProject = (projectName, jsonData) =>
    api.post('/api/projects', { projectName, jsonData });

export const getProjects = () =>
    api.get('/api/projects');

export const getProject = (id) =>
    api.get(`/api/projects/${id}`);

export const deleteProject = (id) =>
    api.delete(`/api/projects/${id}`);

// ─── Request Logs ─────────────────────────────────────

export const getProjectLogs = (id) =>
    api.get(`/api/projects/${id}/logs`);

// ─── API Key Management ──────────────────────────────

export const resetApiKey = (id) =>
    api.post(`/api/projects/${id}/reset-key`);

// ─── Mock API Testing ─────────────────────────────────

export const testMockEndpoint = (method, url, body = null) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const config = { method, url: fullUrl };
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = body;
    }
    return axios(config);
};

export { API_BASE };
export default api;
