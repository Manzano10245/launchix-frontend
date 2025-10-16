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
  // Si el endpoint ya incluye el prefijo (/api/v1/..), no volver a añadirlo
  if (endpoint.startsWith(prefix)) return `${base}${endpoint}`;
  // Si empieza con '/', concatenar base+prefix + endpoint
  if (endpoint.startsWith('/')) return `${base}${prefix}${endpoint}`;
  // Caso relativo
  return `${base}${prefix}/${endpoint}`;
}

async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (window.API_AUTH_STRATEGY === 'token' && window.API_TOKEN) {
    headers['Authorization'] = `Bearer ${window.API_TOKEN}`;
  }
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

function saveToken(token) {
  try {
    localStorage.setItem('API_TOKEN', token);
    window.API_TOKEN = token;
    localStorage.setItem('API_AUTH_STRATEGY', 'token');
    window.API_AUTH_STRATEGY = 'token';
  } catch {}
}

function getRoleFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  if (role && ['user','entrepreneur'].includes(role)) return role;
  return 'user';
}

function getLoginEndpoint(role) {
  const isEnt = role === 'entrepreneur';
  const endpoint = isEnt ? (window.API_LOGIN_ENTREPRENEUR || `${window.API_PREFIX}/entrepreneur/login`) : (window.API_LOGIN_USER || `${window.API_PREFIX}/login`);
  // endpoint may already include prefix; we want only the path part because apiRequest concatenates base+prefix
  if (endpoint.startsWith('http')) return endpoint;
  return endpoint; // apiRequest will handle base
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const role = getRoleFromQuery();
  const errEl = document.getElementById('login-errors');
  const okEl = document.getElementById('login-success');
  setStatus(errEl, '');
  setStatus(okEl, '');

  if (!email || !password) {
    setStatus(errEl, 'Por favor completa email y contraseña', 'error');
    return;
  }

  try {
    const endpoint = getLoginEndpoint(role);
    const payload = { email, password };
    const data = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    // Soportar varias formas de respuesta del backend
    const token = data.token || data.access_token || (data.data && data.data.token);
    if (!token) throw new Error('El backend no devolvió token');
    saveToken(token);
    setStatus(okEl, 'Inicio de sesión exitoso');
    // Redirigir opcionalmente al perfil
  // Guardar rol elegido
  localStorage.setItem('AUTH_ROLE', role);
  setTimeout(() => { window.location.href = '/resources/views/static/profile.html'; }, 800);
  } catch (err) {
    // Mensaje amigable para 422 o credenciales inválidas
    const msg = (err && err.message) || '';
    if (/unauthenticated|invalid|incorrecta/i.test(msg)) {
      setStatus(errEl, 'Las credenciales son incorrectas.', 'error');
    } else {
      setStatus(errEl, msg || 'Error al iniciar sesión', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (form) form.addEventListener('submit', handleLoginSubmit);
});
