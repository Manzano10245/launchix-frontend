import './config.js';

function getApiBase(prefixOverride) {
  const base = (window.API_BASE_URL || '').replace(/\/$/, '');
  const prefix = (prefixOverride || window.API_PREFIX || '/api/v1');
  return base + prefix;
}

function buildApiUrl(endpoint) {
  const base = (window.API_BASE_URL || '').replace(/\/$/, '');
  const prefix = (window.API_PREFIX || '/api/v1');
  if (!endpoint) return `${base}${prefix}`;
  if (endpoint.startsWith('http')) return endpoint;
  if (endpoint.startsWith(prefix)) return `${base}${endpoint}`;
  if (endpoint.startsWith('/')) return `${base}${prefix}${endpoint}`;
  return `${base}${prefix}/${endpoint}`;
}

async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const url = buildApiUrl(endpoint);
  const res = await fetch(url, { ...options, method, headers, credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    if (data) {
      if (data.errors && typeof data.errors === 'object') {
        const parts = [];
        for (const k in data.errors) {
          const arr = data.errors[k];
          if (Array.isArray(arr)) parts.push(`${k}: ${arr[0]}`);
        }
        if (parts.length) message = parts.join(' | ');
      } else if (data.message) {
        message = data.message;
      }
    }
    throw new Error(message);
  }
  return data;
}

function setStatus(el, msg, type = 'info') {
  if (!el) return;
  el.textContent = msg;
  el.className = type === 'error' ? 'mt-4 text-red-600' : 'mt-4 text-green-600';
}

function getRoleFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  if (role && ['user','entrepreneur'].includes(role)) return role;
  return 'user';
}

function getRegisterEndpoint(role) {
  const isEnt = role === 'entrepreneur';
  const endpoint = isEnt ? (window.API_REGISTER_ENTREPRENEUR || `${window.API_PREFIX}/entrepreneur/register`) : (window.API_REGISTER_USER || `${window.API_PREFIX}/register`);
  if (endpoint.startsWith('http')) return endpoint;
  return endpoint;
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const nameInput = form.querySelector('input[name="name"]');
  const usernameInput = form.querySelector('input[name="username"]');
  const firstNameInput = form.querySelector('input[name="first_name"]');
  const lastNameInput = form.querySelector('input[name="last_name"]');
  const name = nameInput ? nameInput.value.trim() : '';
  const username = usernameInput ? usernameInput.value.trim() : '';
  const first_name = firstNameInput ? firstNameInput.value.trim() : '';
  const last_name = lastNameInput ? lastNameInput.value.trim() : '';
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const password_confirmation = form.querySelector('input[name="password_confirmation"]').value;
  const role = getRoleFromQuery();
  const errEl = document.getElementById('register-errors');
  const okEl = document.getElementById('register-success');
  setStatus(errEl, '');
  setStatus(okEl, '');

  const isEnt = role === 'entrepreneur';
  if (isEnt) {
    if (!first_name || !last_name || !email || !password || !password_confirmation) {
      setStatus(errEl, 'Completa todos los campos', 'error');
      return;
    }
  } else {
    if (!name || !username || !email || !password || !password_confirmation) {
      setStatus(errEl, 'Completa todos los campos', 'error');
      return;
    }
  }

  try {
    const endpoint = getRegisterEndpoint(role);
    const payload = isEnt
      ? { first_name, last_name, email, password, password_confirmation }
      : { name, username, email, password, password_confirmation };
    const data = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setStatus(okEl, 'Registro exitoso, ya puedes iniciar sesión');
    localStorage.setItem('AUTH_ROLE', role);
    setTimeout(() => { window.location.href = '/resources/views/static/login.html?role=' + encodeURIComponent(role); }, 1000);
  } catch (err) {
    // Mostrar errores de validación de Laravel si vienen en { errors: { field: [msg] } }
    try {
      const res = err.responseJSON || err;
    } catch {}
    setStatus(errEl, err.message || 'Error al registrarse', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (form) form.addEventListener('submit', handleRegisterSubmit);
});
