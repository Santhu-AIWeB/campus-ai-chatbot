import { apiFetch } from './api';
export const getEvents = (page = 1, limit = 10) => apiFetch(`/events?page=${page}&limit=${limit}`);
export const createEvent = (data) => apiFetch('/events', { method: 'POST', body: JSON.stringify(data) });
export const deleteEvent = (id) => apiFetch(`/events/${id}`, { method: 'DELETE' });
export const updateEvent = (id, data) => apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
