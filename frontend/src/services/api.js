// Use a relative path for local proxy, or an absolute path for production
let rawUrl = import.meta.env.VITE_API_URL || '/api';
if (rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
    rawUrl = rawUrl.replace(/\/$/, '') + '/api';
}
export const BASE_URL = rawUrl;
console.log("Verified API BASE_URL:", BASE_URL);

export const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
};

export const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
};
