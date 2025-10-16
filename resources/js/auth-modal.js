// auth-modal.js - Modal embebido con pestañas Login / Registro y selector de rol
// Abre con window.openAuthModal();
(function() {
  const STATE = { tab: 'login', role: 'user', loading: false };

  function ensureModal() {
    let modal = document.getElementById('authChoiceModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'authChoiceModal';
    modal.className = 'fixed inset-0 z-50 hidden';
    modal.innerHTML = getModalHTML();
    document.body.appendChild(modal);
    attachStaticEvents(modal);
    renderActiveTab();
    return modal;
  }

  function getModalHTML() {
    return `
    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-500 to-pink-500">
          <h2 class="text-lg font-bold text-white flex items-center"><i class="fas fa-user-circle mr-2"></i> Autenticación</h2>
          <button id="authModalClose" class="text-white hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>
        <div class="px-6 pt-4">
          <div class="flex border-b border-gray-200 mb-4" role="tablist">
            <button data-tab="login" class="auth-tab px-4 py-2 text-sm font-semibold -mb-px border-b-2 border-transparent hover:text-rose-600">Iniciar sesión</button>
            <button data-tab="register" class="auth-tab px-4 py-2 text-sm font-semibold -mb-px border-b-2 border-transparent hover:text-rose-600">Registrarse</button>
            <div class="ml-auto flex items-center space-x-2">
              <span class="text-xs font-medium text-gray-600">Rol:</span>
              <div class="inline-flex bg-gray-100 rounded-lg p-1 text-xs">
                <button data-role="user" class="role-btn px-2 py-1 rounded-md font-semibold text-gray-600 hover:bg-white hover:shadow">Usuario</button>
                <button data-role="entrepreneur" class="role-btn px-2 py-1 rounded-md font-semibold text-gray-600 hover:bg-white hover:shadow">Emprendedor</button>
              </div>
            </div>
          </div>
        </div>
        <div id="authTabContent" class="px-6 pb-1"></div>
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
          <button id="authModalCancel" class="inline-flex items-center px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium transition"><i class="fas fa-times mr-2"></i> Cerrar</button>
        </div>
      </div>
    </div>`;
  }

  function attachStaticEvents(modal) {
    const close = () => { if (!STATE.loading) modal.classList.add('hidden'); };
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('#authModalClose').addEventListener('click', close);
    modal.querySelector('#authModalCancel').addEventListener('click', close);

    // Tabs
    modal.querySelectorAll('.auth-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        if (STATE.loading) return;
        STATE.tab = btn.getAttribute('data-tab');
        renderActiveTab();
      });
    });

    // Role buttons
    modal.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (STATE.loading) return;
        STATE.role = btn.getAttribute('data-role');
        highlightRole();
      });
    });
  }

  function highlightRole() {
    const modal = document.getElementById('authChoiceModal');
    if (!modal) return;
    modal.querySelectorAll('.role-btn').forEach(b => {
      const active = b.getAttribute('data-role') === STATE.role;
      b.classList.toggle('bg-white', active);
      b.classList.toggle('shadow', active);
      b.classList.toggle('text-rose-600', active);
    });
  }

  function highlightTab() {
    const modal = document.getElementById('authChoiceModal');
    if (!modal) return;
    modal.querySelectorAll('.auth-tab').forEach(b => {
      const active = b.getAttribute('data-tab') === STATE.tab;
      b.classList.toggle('border-rose-500', active);
      b.classList.toggle('text-rose-600', active);
      b.classList.toggle('border-transparent', !active);
    });
  }

  function renderActiveTab() {
    const container = document.getElementById('authTabContent');
    if (!container) return;
    highlightTab();
    highlightRole();

    container.innerHTML = STATE.tab === 'login' ? getLoginFormHTML() : getRegisterFormHTML();
    wireFormLogic();
  }

  function getLoginFormHTML() {
    return `
      <form id="embeddedLoginForm" class="space-y-4" autocomplete="on">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input name="email" type="email" required class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" placeholder="tu@correo.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input name="password" type="password" required minlength="6" class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" placeholder="••••••" />
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">Rol: <strong class="uppercase">${STATE.role}</strong></span>
          <a href="#" class="text-rose-600 hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
        <div id="loginStatus" class="text-xs h-5"></div>
        <button type="submit" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition">
          <span class="btn-text">Iniciar sesión</span>
          <span class="hidden spinner"><i class="fas fa-circle-notch animate-spin"></i></span>
        </button>
        <p class="text-xs text-center text-gray-500">¿No tienes cuenta? <button type="button" data-switch-tab="register" class="text-rose-600 hover:underline font-semibold">Regístrate</button></p>
      </form>`;
  }

  function getRegisterFormHTML() {
    const isEnt = STATE.role === 'entrepreneur';
    return `
      <form id="embeddedRegisterForm" class="space-y-4" autocomplete="on">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${isEnt ? 'Nombre(s)' : 'Nombre'}</label>
            <input name="${isEnt ? 'first_name' : 'name'}" required class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${isEnt ? 'Apellidos' : 'Usuario'}</label>
            <input name="${isEnt ? 'last_name' : 'username'}" required class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input name="email" type="email" required class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input name="password" type="password" required minlength="6" class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" />
          </div>
            <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
            <input name="password_confirmation" type="password" required minlength="6" class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" />
          </div>
        </div>
        <div class="text-xs text-gray-500">Rol: <strong class="uppercase">${STATE.role}</strong></div>
        <div id="registerStatus" class="text-xs h-5"></div>
        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition">
          <span class="btn-text">Crear cuenta</span>
          <span class="hidden spinner"><i class="fas fa-circle-notch animate-spin"></i></span>
        </button>
        <p class="text-xs text-center text-gray-500">¿Ya tienes cuenta? <button type="button" data-switch-tab="login" class="text-rose-600 hover:underline font-semibold">Inicia sesión</button></p>
      </form>`;
  }

  function wireFormLogic() {
    const container = document.getElementById('authTabContent');
    if (!container) return;
    container.querySelectorAll('[data-switch-tab]').forEach(btn => {
      btn.addEventListener('click', () => { STATE.tab = btn.getAttribute('data-switch-tab'); renderActiveTab(); });
    });

    const loginForm = document.getElementById('embeddedLoginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    const registerForm = document.getElementById('embeddedRegisterForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  function getApiBase() {
    const base = (window.API_BASE_URL || '').replace(/\/$/, '');
    const prefix = (window.API_PREFIX || '/api/v1');
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

  async function apiRequestFullUrl(url, body) {
    const fullUrl = buildApiUrl(url);
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin',
      body: JSON.stringify(body)
    });
    let data = null; try { data = await res.json(); } catch {}
    if (!res.ok) {
      const msg = extractMessage(data) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  function extractMessage(data) {
    if (!data) return null;
    if (data.errors) {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first)) return first[0];
    }
    return data.message || null;
  }

  function setStatus(id, msg, type='info') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg || '';
    el.className = `${type==='error'?'text-red-600':'text-green-600'} text-xs h-5`;
  }

  function toggleBtn(form, loading) {
    STATE.loading = loading;
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = loading;
    const text = btn.querySelector('.btn-text');
    const spin = btn.querySelector('.spinner');
    if (text && spin) {
      text.classList.toggle('hidden', loading);
      spin.classList.toggle('hidden', !loading);
    }
  }

  function getLoginEndpoint(role) {
    const isEnt = role === 'entrepreneur';
    return isEnt ? (window.API_LOGIN_ENTREPRENEUR || `${window.API_PREFIX}/entrepreneur/login`) : (window.API_LOGIN_USER || `${window.API_PREFIX}/login`);
  }

  function getRegisterEndpoint(role) {
    const isEnt = role === 'entrepreneur';
    return isEnt ? (window.API_REGISTER_ENTREPRENEUR || `${window.API_PREFIX}/entrepreneur/register`) : (window.API_REGISTER_USER || `${window.API_PREFIX}/register`);
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('loginStatus','');
    toggleBtn(form,true);
    try {
      const email = form.email.value.trim();
      const password = form.password.value;
      if (!email || !password) throw new Error('Completa los campos');
      const endpoint = getLoginEndpoint(STATE.role);
      const data = await apiRequestFullUrl(endpoint, { email, password });
      const token = data.token || data.access_token || (data.data && data.data.token);
      if (!token) throw new Error('Token no recibido');
      localStorage.setItem('API_TOKEN', token);
      window.API_TOKEN = token;
      localStorage.setItem('AUTH_ROLE', STATE.role);
      setStatus('loginStatus','Acceso correcto');
      setTimeout(()=>{ window.location.reload(); },600);
    } catch(err) {
      setStatus('loginStatus', err.message || 'Error al iniciar sesión','error');
    } finally { toggleBtn(form,false); }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('registerStatus','');
    toggleBtn(form,true);
    try {
      const isEnt = STATE.role === 'entrepreneur';
      const name = form.name ? form.name.value.trim() : '';
      const username = form.username ? form.username.value.trim() : '';
      const first_name = form.first_name ? form.first_name.value.trim() : '';
      const last_name = form.last_name ? form.last_name.value.trim() : '';
      const email = form.email.value.trim();
      const password = form.password.value;
      const password_confirmation = form.password_confirmation.value;
      if (isEnt) {
        if (!first_name || !last_name || !email || !password || !password_confirmation) throw new Error('Completa todos los campos');
      } else {
        if (!name || !username || !email || !password || !password_confirmation) throw new Error('Completa todos los campos');
      }
      const endpoint = getRegisterEndpoint(STATE.role);
      const payload = isEnt
        ? { first_name, last_name, email, password, password_confirmation }
        : { name, username, email, password, password_confirmation };
      const data = await apiRequestFullUrl(endpoint, payload);
      if (!data) throw new Error('Respuesta inválida');
      setStatus('registerStatus','Registro exitoso');
      // Cambiar a login automáticamente
      setTimeout(()=>{ STATE.tab='login'; renderActiveTab(); },700);
    } catch(err) {
      setStatus('registerStatus', err.message || 'Error al registrarse','error');
    } finally { toggleBtn(form,false); }
  }

  function openAuthModal() {
    const modal = ensureModal();
    modal.classList.remove('hidden');
  }

  window.openAuthModal = openAuthModal;
})();
