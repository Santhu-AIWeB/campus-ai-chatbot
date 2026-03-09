import { apiFetch, authHeader, BASE_URL } from './api';

export const getQuestionPapers = (page = 1, limit = 10, semester = '') => {
    let url = `/question-papers?page=${page}&limit=${limit}`;
    if (semester) url += `&semester=${semester}`;
    return apiFetch(url);
};

export const deleteQuestionPaper = (id) => apiFetch(`/question-papers/${id}`, { method: 'DELETE' });

export const updateQuestionPaper = (id, data) => apiFetch(`/question-papers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const addQuestionPaper = (formData) => {
    return fetch(`${BASE_URL}/question-papers`, {
        method: 'POST',
        headers: {
            ...authHeader()
        },
        body: formData
    }).then(res => {
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        return res.json();
    });
};
