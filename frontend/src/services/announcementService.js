import { apiFetch } from './api';
export const getAnnouncements = (page = 1, limit = 10) => apiFetch(`/announcements?page=${page}&limit=${limit}`);
export const createAnnouncement = (data) => apiFetch('/announcements', { method: 'POST', body: JSON.stringify(data) });
export const deleteAnnouncement = (id) => apiFetch(`/announcements/${id}`, { method: 'DELETE' });
export const updateAnnouncement = (id, data) => apiFetch(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) });
