// .replace(/\s/g, '') removes ALL spaces and newlines
let rawUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\s/g, '');

if (rawUrl.startsWith('http')) {
    rawUrl = rawUrl.replace(/\/$/, '');
    if (!rawUrl.endsWith('/api')) {
        rawUrl += '/api';
    }
}

export const BASE_URL = rawUrl;
export const ROOT_URL = rawUrl.startsWith('http') ? rawUrl.replace(/\/api$/, '') : '';

console.log("CLEAN API URL:", `"${BASE_URL}"`);
console.log("ROOT URL (Socket):", `"${ROOT_URL}"`);

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
