import './config.js';

export function isAuthenticated() {
  try { return !!(window.API_TOKEN || localStorage.getItem('API_TOKEN')); } catch { return false; }
}

export function clearAuth() {
  try {
    localStorage.removeItem('API_TOKEN');
    window.API_TOKEN = '';
  } catch {}
}

function getApiBase() {
  const base = (window.API_BASE_URL || '').replace(/\/$/, '');
  const prefix = (window.API_PREFIX || '/api/v1');
  return base + prefix;
}

export async function logout() {
  const headers = { 'Accept': 'application/json' };
  if (window.API_TOKEN) headers['Authorization'] = `Bearer ${window.API_TOKEN}`;
  try {
    const role = (localStorage.getItem('AUTH_ROLE') || 'user');
    const path = role === 'entrepreneur' ? '/entrepreneur/logout' : '/logout';
    await fetch(`${getApiBase()}${path}`, { method: 'POST', headers, credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
  } catch {}
  clearAuth();
  window.location.href = '/resources/views/static/login.html';
}
