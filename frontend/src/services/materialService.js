import { apiFetch } from './api';

export const getMaterials = (page = 1, limit = 10, semester = '', type = '', exclude = '') => {
    let url = `/materials?page=${page}&limit=${limit}`;
    if (semester) url += `&semester=${semester}`;
    if (type) url += `&type=${type}`;
    if (exclude) url += `&exclude=${exclude}`;
    return apiFetch(url);
};

export const deleteMaterial = (id) => apiFetch(`/materials/${id}`, { method: 'DELETE' });
export const updateMaterial = (id, data) => apiFetch(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
