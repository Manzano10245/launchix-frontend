(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))d(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&d(a)}).observe(document,{childList:!0,subtree:!0});function o(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function d(t){if(t.ep)return;t.ep=!0;const s=o(t);fetch(t.href,s)}})();(function(){const e=(s,a)=>window.localStorage.getItem(s)||a,i=e("API_BASE_URL","http://127.0.0.1:8001"),o=e("API_PREFIX","/api/v1"),d=e("API_WITH_CREDENTIALS","false")==="true",t=e("API_AUTH_STRATEGY","token");window.API_BASE_URL=i.replace(/\/$/,""),window.API_PREFIX=o.startsWith("/")?o:"/"+o,window.API_WITH_CREDENTIALS=d,window.API_AUTH_STRATEGY=t,window.API_LOGIN_USER=e("API_LOGIN_USER",`${window.API_PREFIX}/login`),window.API_LOGIN_ENTREPRENEUR=e("API_LOGIN_ENTREPRENEUR",`${window.API_PREFIX}/entrepreneur/login`),window.API_REGISTER_USER=e("API_REGISTER_USER",`${window.API_PREFIX}/register`),window.API_REGISTER_ENTREPRENEUR=e("API_REGISTER_ENTREPRENEUR",`${window.API_PREFIX}/entrepreneur/register`),window.API_TOKEN=e("API_TOKEN",""),window.API_EP_ME=e("API_EP_ME",`${window.API_PREFIX}/entrepreneur/me`),window.API_EP_AVATAR=e("API_EP_AVATAR",`${window.API_PREFIX}/entrepreneur/avatar`),window.API_EP_PRODUCTS=e("API_EP_PRODUCTS",`${window.API_PREFIX}/entrepreneur/products`),window.API_EP_SERVICES=e("API_EP_SERVICES",`${window.API_PREFIX}/entrepreneur/services`),window.API_REL_EP_PRODUCTS=e("API_REL_EP_PRODUCTS","/products"),window.API_REL_EP_SERVICES=e("API_REL_EP_SERVICES","/servicios"),window.API_REL_EP_PRODUCTS_FALLBACK=e("API_REL_EP_PRODUCTS_FALLBACK","/products"),window.API_REL_EP_SERVICES_FALLBACK=e("API_REL_EP_SERVICES_FALLBACK","/servicios"),window.API_FULL=s=>{const a=(window.API_BASE_URL||"").replace(/\/$/,""),r=s.startsWith("/")?s:`/${s}`;return`${a}${r}`}})();const g="modulepreload",P=function(e){return"/"+e},p={},h=function(i,o,d){let t=Promise.resolve();if(o&&o.length>0){let m=function(n){return Promise.all(n.map(f=>Promise.resolve(f).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};var a=m;document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),l=r?.nonce||r?.getAttribute("nonce");t=m(o.map(n=>{if(n=P(n),n in p)return;p[n]=!0;const f=n.endsWith(".css"),u=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${n}"]${u}`))return;const c=document.createElement("link");if(c.rel=f?"stylesheet":g,f||(c.as="script"),c.crossOrigin="",c.href=n,l&&c.setAttribute("nonce",l),document.head.appendChild(c),f)return new Promise((v,E)=>{c.addEventListener("load",v),c.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${n}`)))})}))}function s(r){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=r,window.dispatchEvent(l),!l.defaultPrevented)throw r}return t.then(r=>{for(const l of r||[])l.status==="rejected"&&s(l.reason);return i().catch(s)})};function b(e){const d=`
  <nav class="bg-yellow-400 text-gray-900 p-3 sticky top-0 z-50 shadow-lg">
    <div class="container mx-auto flex flex-wrap items-center justify-between">
      <div class="flex items-center space-x-4">
  <a href="/resources/views/static/home.html" class="flex items-center space-x-2 text-xl font-bold">
          <i class="fas fa-shopping-cart text-2xl"></i>
          <span>Launchix</span>
        </a>
      </div>
      <div class="flex space-x-4">
  <a href="/resources/views/static/bestsellers.html" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-star mr-1"></i> Más Vendidos</a>
  <a href="/resources/views/static/products.html" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-box mr-1"></i> Productos</a>
  <a href="/resources/views/static/services.html" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-concierge-bell mr-1"></i> Servicios</a>
        <div class="relative">
          <button id="categoriesButton" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-list mr-1"></i> Categorías</button>
          <div id="categoriesModal" class="absolute bg-white p-4 rounded-lg shadow-lg w-48 mt-2 hidden z-50">
            <ul>
              <li class="mb-2"><a href="#" class="block p-2 rounded hover:bg-gray-100">Electrónicos</a></li>
              <li class="mb-2"><a href="#" class="block p-2 rounded hover:bg-gray-100">Ropa</a></li>
              <li class="mb-2"><a href="#" class="block p-2 rounded hover:bg-gray-100">Hogar</a></li>
              <li class="mb-2"><a href="#" class="block p-2 rounded hover:bg-gray-100">Deportes</a></li>
            </ul>
          </div>
        </div>
      </div>
      <form class="flex items-center space-x-2">
        <input type="text" id="searchInput" placeholder="Buscar productos..." class="px-3 py-2 text-gray-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-r-lg transition-colors duration-300">
          <i class="fas fa-search"></i>
        </button>
      </form>
    <div class="flex space-x-2">
  ${(()=>{try{return!!(window.API_TOKEN||localStorage.getItem("API_TOKEN"))}catch{return!1}})()?'<button id="logoutBtn" class="bg-white hover:bg-gray-100 text-red-600 font-semibold py-2 px-3 rounded-lg transition-all duration-300 text-sm flex items-center"><i class="fas fa-sign-out-alt mr-1"></i> Cerrar sesión</button>':'<button id="openAuthModalBtn" class="bg-white hover:bg-gray-100 text-blue-700 font-semibold py-2 px-3 rounded-lg transition-all duration-300 text-sm flex items-center"><i class="fas fa-sign-in-alt mr-1"></i> Iniciar sesión</button>'}
  <a href="/resources/views/static/profile.html" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-user mr-1"></i> Perfil</a>
  <a href="/resources/views/static/cart.html" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-shopping-cart mr-1"></i> Carrito</a>
        <a href="#" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-question-circle mr-1"></i> Ayuda</a>
      </div>
      <button id="mobileMenuBtn" class="lg:hidden ml-2 p-2 rounded hover:bg-yellow-300">
        <i class="fas fa-bars text-xl"></i>
      </button>
    </div>
  </nav>
  `;document.getElementById(e).innerHTML=d;const t=document.getElementById("logoutBtn");t&&h(()=>import("./auth-CxDX2t_3.js"),[]).then(a=>{t.addEventListener("click",r=>{r.preventDefault(),a.logout()})}).catch(()=>{});const s=document.getElementById("openAuthModalBtn");s&&s.addEventListener("click",a=>{a.preventDefault(),typeof window.openAuthModal=="function"?window.openAuthModal():h(()=>import("./auth-modal-Bk1oJH1G.js"),[]).then(()=>{typeof window.openAuthModal=="function"&&window.openAuthModal()}).catch(()=>{window.location.href="/resources/views/static/login.html"})})}function w(e){const o=`
    <footer class="bg-gray-900 text-white py-6 mt-10">
    <div class="footer-top">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div class="footer-column">
            <div class="footer-brand">
              <i class="fas fa-shopping-bag"></i>
              <span>MiTienda</span>
            </div>
            <p class="footer-description">
              Tu tienda de confianza con los mejores productos y el mejor servicio al cliente. Calidad garantizada en cada compra.
            </p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-link" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          <div class="footer-column">
            <h4 class="footer-title">Enlaces Rápidos</h4>
            <ul class="footer-links">
              <li><a href="home.html" class="footer-link">Inicio</a></li>
              <li><a href="products.html" class="footer-link">Productos</a></li>
              <li><a href="services.html" class="footer-link">Servicios</a></li>
              <li><a href="#" class="footer-link">Sobre Nosotros</a></li>
              <li><a href="#" class="footer-link">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4 class="footer-title">Categorías</h4>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">Electrónicos</a></li>
              <li><a href="#" class="footer-link">Ropa y Moda</a></li>
              <li><a href="#" class="footer-link">Hogar y Decoración</a></li>
              <li><a href="#" class="footer-link">Deportes</a></li>
              <li><a href="#" class="footer-link">Accesorios</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4 class="footer-title">Contacto</h4>
            <div class="footer-contact">
              <div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>123 Calle Principal, Ciudad</span></div>
              <div class="contact-item"><i class="fas fa-phone"></i><span>+57 300 123 4567</span></div>
              <div class="contact-item"><i class="fas fa-envelope"></i><span>info@mitienda.com</span></div>
              <div class="contact-item"><i class="fas fa-clock"></i><span>Lun - Sáb: 9:00 - 20:00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div class="footer-bottom">
        <div class="container mx-auto px-4">
          <div class="footer-bottom-content">
            <p class="copyright">&copy; ${new Date().getFullYear()} MiTienda. Todos los derechos reservados.</p>
            <div class="footer-legal">
              <a href="#" class="legal-link">Términos y Condiciones</a>
              <span class="separator">|</span>
              <a href="#" class="legal-link">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </div>
  </footer>
  `;document.getElementById(e).innerHTML=o}document.addEventListener("DOMContentLoaded",()=>{document.getElementById("navbar")&&b("navbar");const i=document.getElementById("main");i&&(i.innerHTML=`
			<div class="min-h-screen bg-blue-50 flex flex-col items-center justify-center py-16">
				<h1 class="text-4xl font-extrabold text-blue-600 mb-4">¡Launchix Frontend listo!</h1>
				<p class="text-lg text-gray-700 mb-6">Tailwind por CDN y Vite (MPA) sin PostCSS.</p>
				<div class="flex gap-3">
					<a href="/resources/views/static/products.html" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Productos</a>
					<a href="/resources/views/static/services.html" class="bg-white hover:bg-gray-100 text-blue-700 font-bold py-2 px-4 rounded border">Servicios</a>
				</div>
			</div>
		`),document.getElementById("footer")&&w("footer")});
