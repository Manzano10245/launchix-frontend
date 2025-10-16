(function(){const o={tab:"login",role:"user",loading:!1};function p(){let e=document.getElementById("authChoiceModal");return e||(e=document.createElement("div"),e.id="authChoiceModal",e.className="fixed inset-0 z-50 hidden",e.innerHTML=x(),document.body.appendChild(e),h(e),c(),e)}function x(){return`
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
    </div>`}function h(e){const t=()=>{o.loading||e.classList.add("hidden")};e.addEventListener("click",r=>{r.target===e&&t()}),e.querySelector("#authModalClose").addEventListener("click",t),e.querySelector("#authModalCancel").addEventListener("click",t),e.querySelectorAll(".auth-tab").forEach(r=>{r.addEventListener("click",()=>{o.loading||(o.tab=r.getAttribute("data-tab"),c())})}),e.querySelectorAll(".role-btn").forEach(r=>{r.addEventListener("click",()=>{o.loading||(o.role=r.getAttribute("data-role"),b())})})}function b(){const e=document.getElementById("authChoiceModal");e&&e.querySelectorAll(".role-btn").forEach(t=>{const r=t.getAttribute("data-role")===o.role;t.classList.toggle("bg-white",r),t.classList.toggle("shadow",r),t.classList.toggle("text-rose-600",r)})}function y(){const e=document.getElementById("authChoiceModal");e&&e.querySelectorAll(".auth-tab").forEach(t=>{const r=t.getAttribute("data-tab")===o.tab;t.classList.toggle("border-rose-500",r),t.classList.toggle("text-rose-600",r),t.classList.toggle("border-transparent",!r)})}function c(){const e=document.getElementById("authTabContent");e&&(y(),b(),e.innerHTML=o.tab==="login"?v():w(),E())}function v(){return`
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
          <span class="text-gray-500">Rol: <strong class="uppercase">${o.role}</strong></span>
          <a href="#" class="text-rose-600 hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
        <div id="loginStatus" class="text-xs h-5"></div>
        <button type="submit" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition">
          <span class="btn-text">Iniciar sesión</span>
          <span class="hidden spinner"><i class="fas fa-circle-notch animate-spin"></i></span>
        </button>
        <p class="text-xs text-center text-gray-500">¿No tienes cuenta? <button type="button" data-switch-tab="register" class="text-rose-600 hover:underline font-semibold">Regístrate</button></p>
      </form>`}function w(){const e=o.role==="entrepreneur";return`
      <form id="embeddedRegisterForm" class="space-y-4" autocomplete="on">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${e?"Nombre(s)":"Nombre"}</label>
            <input name="${e?"first_name":"name"}" required class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${e?"Apellidos":"Usuario"}</label>
            <input name="${e?"last_name":"username"}" required class="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm" />
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
        <div class="text-xs text-gray-500">Rol: <strong class="uppercase">${o.role}</strong></div>
        <div id="registerStatus" class="text-xs h-5"></div>
        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition">
          <span class="btn-text">Crear cuenta</span>
          <span class="hidden spinner"><i class="fas fa-circle-notch animate-spin"></i></span>
        </button>
        <p class="text-xs text-center text-gray-500">¿Ya tienes cuenta? <button type="button" data-switch-tab="login" class="text-rose-600 hover:underline font-semibold">Inicia sesión</button></p>
      </form>`}function E(){const e=document.getElementById("authTabContent");if(!e)return;e.querySelectorAll("[data-switch-tab]").forEach(s=>{s.addEventListener("click",()=>{o.tab=s.getAttribute("data-switch-tab"),c()})});const t=document.getElementById("embeddedLoginForm");t&&t.addEventListener("submit",S);const r=document.getElementById("embeddedRegisterForm");r&&r.addEventListener("submit",_)}function A(e){const t=(window.API_BASE_URL||"").replace(/\/$/,""),r=window.API_PREFIX||"/api/v1";return e?e.startsWith("http")?e:e.startsWith(r)?`${t}${e}`:e.startsWith("/")?`${t}${r}${e}`:`${t}${r}/${e}`:`${t}${r}`}async function f(e,t){const r=A(e),s=await fetch(r,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},credentials:window.API_WITH_CREDENTIALS?"include":"same-origin",body:JSON.stringify(t)});let n=null;try{n=await s.json()}catch{}if(!s.ok){const a=I(n)||`HTTP ${s.status}`;throw new Error(a)}return n}function I(e){if(!e)return null;if(e.errors){const t=Object.values(e.errors)[0];if(Array.isArray(t))return t[0]}return e.message||null}function i(e,t,r="info"){const s=document.getElementById(e);s&&(s.textContent=t||"",s.className=`${r==="error"?"text-red-600":"text-green-600"} text-xs h-5`)}function d(e,t){o.loading=t;const r=e.querySelector('button[type="submit"]');if(!r)return;r.disabled=t;const s=r.querySelector(".btn-text"),n=r.querySelector(".spinner");s&&n&&(s.classList.toggle("hidden",t),n.classList.toggle("hidden",!t))}function L(e){return e==="entrepreneur"?window.API_LOGIN_ENTREPRENEUR||`${window.API_PREFIX}/entrepreneur/login`:window.API_LOGIN_USER||`${window.API_PREFIX}/login`}function R(e){return e==="entrepreneur"?window.API_REGISTER_ENTREPRENEUR||`${window.API_PREFIX}/entrepreneur/register`:window.API_REGISTER_USER||`${window.API_PREFIX}/register`}async function S(e){e.preventDefault();const t=e.currentTarget;i("loginStatus",""),d(t,!0);try{const r=t.email.value.trim(),s=t.password.value;if(!r||!s)throw new Error("Completa los campos");const n=L(o.role),a=await f(n,{email:r,password:s}),l=a.token||a.access_token||a.data&&a.data.token;if(!l)throw new Error("Token no recibido");localStorage.setItem("API_TOKEN",l),window.API_TOKEN=l,localStorage.setItem("AUTH_ROLE",o.role),i("loginStatus","Acceso correcto"),setTimeout(()=>{window.location.reload()},600)}catch(r){i("loginStatus",r.message||"Error al iniciar sesión","error")}finally{d(t,!1)}}async function _(e){e.preventDefault();const t=e.currentTarget;i("registerStatus",""),d(t,!0);try{const r=o.role==="entrepreneur",s=t.name?t.name.value.trim():"",n=t.username?t.username.value.trim():"",a=t.first_name?t.first_name.value.trim():"",l=t.last_name?t.last_name.value.trim():"",u=t.email.value.trim(),m=t.password.value,g=t.password_confirmation.value;if(r){if(!a||!l||!u||!m||!g)throw new Error("Completa todos los campos")}else if(!s||!n||!u||!m||!g)throw new Error("Completa todos los campos");const C=R(o.role);if(!await f(C,r?{first_name:a,last_name:l,email:u,password:m,password_confirmation:g}:{name:s,username:n,email:u,password:m,password_confirmation:g}))throw new Error("Respuesta inválida");i("registerStatus","Registro exitoso"),setTimeout(()=>{o.tab="login",c()},700)}catch(r){i("registerStatus",r.message||"Error al registrarse","error")}finally{d(t,!1)}}function T(){p().classList.remove("hidden")}window.openAuthModal=T})();
