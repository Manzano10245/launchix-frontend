// Modular Navbar for Launchix
export function renderNavbar(containerId) {
  const isLogged = (() => { try { return !!(window.API_TOKEN || localStorage.getItem('API_TOKEN')); } catch { return false; } })();
  const authLinks = isLogged
    ? `<button id="logoutBtn" class="bg-white hover:bg-gray-100 text-red-600 font-semibold py-2 px-3 rounded-lg transition-all duration-300 text-sm flex items-center"><i class="fas fa-sign-out-alt mr-1"></i> Cerrar sesión</button>`
    : `<button id="openAuthModalBtn" class="bg-white hover:bg-gray-100 text-blue-700 font-semibold py-2 px-3 rounded-lg transition-all duration-300 text-sm flex items-center"><i class="fas fa-sign-in-alt mr-1"></i> Iniciar sesión</button>`;

  const navbarHTML = `
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
  ${authLinks}
  <a href="/resources/views/static/profile.html" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-user mr-1"></i> Perfil</a>
  <a href="/resources/views/static/cart.html" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-shopping-cart mr-1"></i> Carrito</a>
        <a href="#" class="hover:text-blue-700 font-medium flex items-center"><i class="fas fa-question-circle mr-1"></i> Ayuda</a>
      </div>
      <button id="mobileMenuBtn" class="lg:hidden ml-2 p-2 rounded hover:bg-yellow-300">
        <i class="fas fa-bars text-xl"></i>
      </button>
    </div>
  </nav>
  `;
  document.getElementById(containerId).innerHTML = navbarHTML;

  // Attach logout handler if present
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    import('../auth.js').then(m => {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        m.logout();
      });
    }).catch(() => {});
  }

  // Attach auth modal opener
  const openBtn = document.getElementById('openAuthModalBtn');
  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openAuthModal === 'function') {
        window.openAuthModal();
      } else {
        // Lazy load script if not yet loaded
        import('../auth-modal.js').then(() => {
          if (typeof window.openAuthModal === 'function') window.openAuthModal();
        }).catch(() => {
          window.location.href = '/resources/views/static/login.html';
        });
      }
    });
  }
}
