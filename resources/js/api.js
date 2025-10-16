
const API_URL = import.meta.env.VITE_API_URL || process.env.API_URL || 'http://localhost:8000';

export async function apiGet(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        return { error: 'Error de conexión' };
    }
}

export async function apiPost(endpoint, data, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(options.headers || {})
            },
            body: JSON.stringify(data),
            ...options
        });
        return await response.json();
    } catch (error) {
        return { error: 'Error de conexión' };
    }
}

export async function apiPut(endpoint, data, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(options.headers || {})
            },
            body: JSON.stringify(data),
            ...options
        });
        return await response.json();
    } catch (error) {
        return { error: 'Error de conexión' };
    }
}

export async function apiDelete(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        return { error: 'Error de conexión' };
    }
}