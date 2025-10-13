const API_URL = import.meta.env.VITE_API_URL || process.env.API_URL || 'http://localhost:8000';

export async function apiGet(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
    });
    return response.json();
}