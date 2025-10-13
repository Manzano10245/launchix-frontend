/**
 * Navbar.js - Funcionalidad avanzada del navbar con integración API
 * Incluye manejo de menú móvil, modales, búsqueda, notificaciones y efectos de scroll
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 [NAVBAR] Inicializando funcionalidad del navbar');

    // ============================================
    // ELEMENTOS DEL DOM
    // ============================================

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const categoriesButton = document.getElementById('categoriesButton');
    const categoriesModal = document.getElementById('categoriesModal');
    const profileButton = document.getElementById('profileButton');
    const profileModal = document.getElementById('profileModal');
    const navbar = document.querySelector('.navbar');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const notificationsButton = document.getElementById('notificationsButton');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsCount = document.getElementById('notificationsCount');
    const cartButton = document.getElementById('cartButton');
    const cartCount = document.getElementById('cartCount');

    // Verificar elementos críticos
    console.log('🔍 [NAVBAR] Elementos encontrados:', {
        mobileMenuBtn: !!mobileMenuBtn,
        mobileMenu: !!mobileMenu,
        categoriesButton: !!categoriesButton,
        categoriesModal: !!categoriesModal,
        profileButton: !!profileButton,
        profileModal: !!profileModal,
        navbar: !!navbar,
        searchInput: !!searchInput,
        searchForm: !!searchForm,
        notificationsButton: !!notificationsButton,
        notificationsDropdown: !!notificationsDropdown,
        notificationsCount: !!notificationsCount,
        cartButton: !!cartButton,
        cartCount: !!cartCount
    });

    // ============================================
    // MENÚ MÓVIL
    // ============================================

    /**
     * Maneja el menú móvil
     */
    function setupMobileMenu() {
        if (!mobileMenuBtn || !mobileMenu) {
            console.warn('⚠️ [NAVBAR] Elementos del menú móvil no encontrados');
            return;
        }

        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');

            // Cambiar icono del botón según estado
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = isHidden ?
                    'fas fa-bars text-xl' :
                    'fas fa-times text-xl';
            }

            // Bloquear scroll del body cuando el menú está abierto
            document.body.style.overflow = isHidden ? '' : 'hidden';
        });

        // Cerrar menú móvil al hacer clic en un enlace
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                document.body.style.overflow = '';

                const icon = mobileMenuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars text-xl';
            });
        });
    }

    // ============================================
    // MODAL DE CATEGORÍAS
    // ============================================

    /**
     * Maneja el modal de categorías
     */
    function setupCategoriesModal() {
        if (!categoriesButton || !categoriesModal) {
            console.warn('⚠️ [NAVBAR] Elementos del modal de categorías no encontrados');
            return;
        }

        // Alternar visibilidad del modal
        categoriesButton.addEventListener('click', (e) => {
            e.stopPropagation();
            categoriesModal.classList.toggle('hidden');

            // Cargar categorías si el modal se abre y está vacío
            if (!categoriesModal.classList.contains('hidden') &&
                categoriesModal.querySelectorAll('.category-item').length === 0) {
                loadCategories();
            }
        });
    }

    /**
     * Carga categorías desde la API
     */
    async function loadCategories() {
        try {
            if (!categoriesModal) return;

            const loading = document.createElement('div');
            loading.className = 'text-center py-4';
            loading.innerHTML = `
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                <p class="mt-2 text-gray-600">Cargando categorías...</p>
            `;

            categoriesModal.innerHTML = '';
            categoriesModal.appendChild(loading);

            const response = await fetch('/api/categories', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success || !Array.isArray(data.categories)) {
                throw new Error(data.message || 'Formato de datos inválido');
            }

            renderCategories(data.categories);

        } catch (error) {
            console.error('❌ [NAVBAR] Error al cargar categorías:', error);
            categoriesModal.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>Error al cargar categorías</p>
                    <button onclick="loadCategories()"
                            class="mt-2 px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    /**
     * Renderiza las categorías en el modal
     * @param {Array} categories - Lista de categorías
     */
    function renderCategories(categories) {
        if (!categoriesModal) return;

        // Agrupar categorías por tipo si es necesario
        const groupedCategories = groupCategories(categories);

        let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">';

        // Categorías principales
        if (groupedCategories.main.length > 0) {
            groupedCategories.main.forEach(category => {
                html += createCategoryItem(category);
            });
        }

        // Si hay subcategorías, agregarlas en secciones
        if (Object.keys(groupedCategories.subcategories).length > 0) {
            for (const [parentSlug, subcats] of Object.entries(groupedCategories.subcategories)) {
                const parentCat = categories.find(c => c.slug === parentSlug);
                if (parentCat && subcats.length > 0) {
                    html += `
                        <div class="col-span-full mt-4 pt-2 border-t border-gray-200">
                            <h3 class="font-semibold text-gray-700 mb-2 px-2">${parentCat.name}</h3>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    `;

                    subcats.forEach(subcat => {
                        html += createCategoryItem(subcat, true);
                    });

                    html += '</div></div>';
                }
            }
        }

        html += '</div>';
        categoriesModal.innerHTML = html;
    }

    /**
     * Agrupa categorías por tipo (principales y subcategorías)
     * @param {Array} categories - Lista de categorías
     * @returns {Object} Categorías agrupadas
     */
    function groupCategories(categories) {
        const result = {
            main: [],
            subcategories: {}
        };

        categories.forEach(category => {
            if (!category.parent_id) {
                result.main.push(category);
            } else {
                if (!result.subcategories[category.parent_slug]) {
                    result.subcategories[category.parent_slug] = [];
                }
                result.subcategories[category.parent_slug].push(category);
            }
        });

        return result;
    }

    /**
     * Crea el HTML para un ítem de categoría
     * @param {Object} category - Datos de la categoría
     * @param {boolean} isSubcategory - Si es una subcategoría
     * @returns {string} HTML del ítem
     */
    function createCategoryItem(category, isSubcategory = false) {
        const sizeClass = isSubcategory ? 'text-sm' : 'text-base';
        const paddingClass = isSubcategory ? 'px-2 py-1' : 'px-3 py-2';

        return `
            <a href="/categoria/${category.slug}"
               class="category-item flex items-center ${sizeClass} ${paddingClass} rounded-lg hover:bg-gray-100 transition-colors">
                ${category.icon ?
                    `<i class="${category.icon} mr-2 text-gray-500"></i>` :
                    '<i class="fas fa-tag mr-2 text-gray-500"></i>'}
                ${category.name}
                ${category.count ?
                    `<span class="ml-auto bg-gray-200 text-xs px-2 py-0.5 rounded-full">${category.count}</span>` : ''}
            </a>
        `;
    }

    // ============================================
    // MODAL DE PERFIL
    // ============================================

    /**
     * Maneja el modal de perfil
     */
    function setupProfileModal() {
        if (!profileButton || !profileModal) {
            console.warn('⚠️ [NAVBAR] Elementos del modal de perfil no encontrados');
            return;
        }

        profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            profileModal.classList.toggle('hidden');

            // Cargar datos del perfil si el modal se abre
            if (!profileModal.classList.contains('hidden')) {
                loadProfileData();
            }
        });
    }

    /**
     * Carga datos del perfil desde la API
     */
    async function loadProfileData() {
        try {
            if (!profileModal) return;

            const profileContent = profileModal.querySelector('.profile-content');
            if (!profileContent) return;

            // Mostrar loading
            profileContent.innerHTML = `
                <div class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    <p class="mt-2 text-gray-600">Cargando perfil...</p>
                </div>
            `;

            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al cargar perfil');
            }

            renderProfileData(data.user);

        } catch (error) {
            console.error('❌ [NAVBAR] Error al cargar perfil:', error);
            profileContent.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>Error al cargar perfil</p>
                    <button onclick="loadProfileData()"
                            class="mt-2 px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    /**
     * Renderiza los datos del perfil en el modal
     * @param {Object} user - Datos del usuario
     */
    function renderProfileData(user) {
        if (!profileModal) return;

        const profileContent = profileModal.querySelector('.profile-content');
        if (!profileContent) return;

        profileContent.innerHTML = `
            <div class="flex items-center px-4 py-3 border-b border-gray-200">
                <div class="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img src="${user.avatar || getDefaultAvatar(user.email)}"
                         alt="${user.name}"
                         class="w-full h-full object-cover"
                         onerror="this.src='${getDefaultAvatar(user.email)}'">
                </div>
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">${user.name}</h3>
                    <p class="text-sm text-gray-500">${user.email}</p>
                </div>
            </div>

            <div class="py-2">
                <a href="/perfil"
                   class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <i class="fas fa-user-circle mr-2"></i> Mi perfil
                </a>

                <a href="/mis-servicios"
                   class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <i class="fas fa-concierge-bell mr-2"></i> Mis servicios
                </a>

                <a href="/mis-productos"
                   class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <i class="fas fa-box-open mr-2"></i> Mis productos
                </a>

                <a href="/configuracion"
                   class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                    <i class="fas fa-cog mr-2"></i> Configuración
                </a>
            </div>

            <div class="px-4 py-2 border-t border-gray-200">
                <form action="/logout" method="POST" class="logout-form">
                    @csrf
                    <button type="submit"
                            class="w-full text-left px-2 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors rounded">
                        <i class="fas fa-sign-out-alt mr-2"></i> Cerrar sesión
                    </button>
                </form>
            </div>
        `;
    }

    /**
     * Genera un avatar por defecto basado en el email
     * @param {string} email - Correo electrónico del usuario
     * @returns {string} URL del avatar
     */
    function getDefaultAvatar(email) {
        if (!email) return '/images/default-avatar.jpg';

        const hash = email.trim().toLowerCase().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const color = Math.abs(hash % 360);
        const initials = email.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=128`;
    }

    // ============================================
    // CIERRE DE MODALES AL HACER CLIC FUERA
    // ============================================

    /**
     * Configura el cierre de modales al hacer clic fuera
     */
    function setupModalOutsideClick() {
        document.addEventListener('click', (e) => {
            // Cerrar modal de categorías
            if (categoriesModal && !categoriesModal.contains(e.target) &&
                !categoriesButton.contains(e.target) && !categoriesModal.classList.contains('hidden')) {
                categoriesModal.classList.add('hidden');
            }

            // Cerrar modal de perfil
            if (profileModal && !profileModal.contains(e.target) &&
                !profileButton.contains(e.target) && !profileModal.classList.contains('hidden')) {
                profileModal.classList.add('hidden');
            }

            // Cerrar dropdown de notificaciones
            if (notificationsDropdown && !notificationsDropdown.contains(e.target) &&
                !notificationsButton.contains(e.target) && !notificationsDropdown.classList.contains('hidden')) {
                notificationsDropdown.classList.add('hidden');
            }
        });
    }

    // ============================================
    // EFECTO DE SCROLL PARA EL NAVBAR
    // ============================================

    /**
     * Configura el efecto de ocultar/mostrar navbar al hacer scroll
     */
    function setupNavbarScrollEffect() {
        if (!navbar) {
            console.warn('⚠️ [NAVBAR] Elemento navbar no encontrado');
            return;
        }

        let lastScrollTop = 0;
        let isScrolling = false;

        window.addEventListener('scroll', () => {
            if (isScrolling) return;

            isScrolling = true;
            requestAnimationFrame(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // Solo ocultar navbar si no estamos en el top de la página
                if (scrollTop > 100) {
                    if (scrollTop > lastScrollTop && scrollTop > 150) {
                        // Scroll hacia abajo
                        navbar.style.transform = 'translateY(-100%)';
                        navbar.style.transition = 'transform 0.3s ease-out';
                    } else {
                        // Scroll hacia arriba
                        navbar.style.transform = 'translateY(0)';
                        navbar.style.transition = 'transform 0.3s ease-in';
                    }
                } else {
                    // En el top de la página, mostrar navbar
                    navbar.style.transform = 'translateY(0)';
                }

                lastScrollTop = scrollTop;
                isScrolling = false;
            });
        });
    }

    // ============================================
    // BÚSQUEDA GLOBAL
    // ============================================

    /**
     * Configura la funcionalidad de búsqueda
     */
    function setupSearch() {
        if (!searchForm || !searchInput) {
            console.warn('⚠️ [NAVBAR] Elementos de búsqueda no encontrados');
            return;
        }

        // Búsqueda en tiempo real (con debounce)
        let searchTimeout = null;
        const resultsDropdown = document.createElement('div');
        resultsDropdown.id = 'searchResultsDropdown';
        resultsDropdown.className = 'absolute left-0 right-0 bg-white rounded-b-lg shadow-lg z-50 hidden';
        resultsDropdown.style.top = '100%';
        resultsDropdown.style.border = '1px solid #e5e7eb';
        resultsDropdown.style.borderTop = 'none';

        searchForm.parentNode.insertBefore(resultsDropdown, searchForm.nextSibling);

        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                resultsDropdown.classList.add('hidden');
                return;
            }

            // Debounce: esperar 300ms después de que el usuario deje de escribir
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                try {
                    await performSearch(query);
                } catch (error) {
                    console.error('❌ [NAVBAR] Error en búsqueda:', error);
                    resultsDropdown.innerHTML = `
                        <div class="p-4 text-center text-red-500">
                            Error al buscar. Intenta nuevamente.
                        </div>
                    `;
                    resultsDropdown.classList.remove('hidden');
                }
            }, 300);
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target) && !resultsDropdown.classList.contains('hidden')) {
                resultsDropdown.classList.add('hidden');
            }
        });

        // Manejar envío del formulario
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/buscar?q=${encodeURIComponent(query)}`;
            }
        });
    }

    /**
     * Realiza la búsqueda en la API
     * @param {string} query - Término de búsqueda
     */
    async function performSearch(query) {
        const resultsDropdown = document.getElementById('searchResultsDropdown');
        if (!resultsDropdown) return;

        if (query.length < 2) {
            resultsDropdown.classList.add('hidden');
            return;
        }

        // Mostrar loading
        resultsDropdown.innerHTML = `
            <div class="p-4 text-center">
                <div class="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                <p class="mt-2 text-gray-600">Buscando...</p>
            </div>
        `;
        resultsDropdown.classList.remove('hidden');

        try {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error en la búsqueda');
            }

            renderSearchResults(data.results);

        } catch (error) {
            console.error('❌ [NAVBAR] Error en búsqueda:', error);
            resultsDropdown.innerHTML = `
                <div class="p-4 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mb-2"></i>
                    <p>Error al buscar. Intenta nuevamente.</p>
                </div>
            `;
        }
    }

    /**
     * Renderiza los resultados de búsqueda
     * @param {Object} results - Resultados de búsqueda
     */
    function renderSearchResults(results) {
        const resultsDropdown = document.getElementById('searchResultsDropdown');
        if (!resultsDropdown) return;

        if (!results || (results.products.length === 0 && results.services.length === 0)) {
            resultsDropdown.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-search text-2xl mb-2"></i>
                    <p>No se encontraron resultados</p>
                </div>
            `;
            return;
        }

        let html = '<div class="max-h-96 overflow-y-auto">';

        // Productos
        if (results.products && results.products.length > 0) {
            html += `
                <div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h4 class="font-semibold text-gray-700">Productos (${results.products.length})</h4>
                </div>
            `;

            results.products.slice(0, 3).forEach(product => {
                html += `
                    <a href="/productos/${product.slug}" class="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <div class="flex items-center">
                            <div class="w-12 h-12 flex-shrink-0 mr-3">
                                <img src="${product.image || '/images/product-placeholder.jpg'}"
                                     alt="${product.name}"
                                     class="w-full h-full object-cover rounded"
                                     onerror="this.src='/images/product-placeholder.jpg'">
                            </div>
                            <div class="flex-1">
                                <h5 class="font-medium text-gray-800 line-clamp-1">${product.name}</h5>
                                <p class="text-sm text-gray-500 line-clamp-1">${product.category}</p>
                                <div class="flex items-center mt-1">
                                    <span class="text-primary font-semibold">${product.price ? '$' + parseFloat(product.price).toFixed(2) : 'Consultar'}</span>
                                    ${product.rating ? `
                                        <div class="flex text-yellow-400 text-xs ml-2">
                                            ${'★'.repeat(Math.floor(product.rating))}
                                            ${product.rating % 1 >= 0.5 ? '½' : ''}
                                            ${'☆'.repeat(5 - Math.ceil(product.rating))}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </a>
                `;
            });

            if (results.products.length > 3) {
                html += `
                    <a href="/buscar?q=${encodeURIComponent(searchInput.value.trim())}&type=products"
                       class="block px-4 py-2 text-center text-primary hover:bg-gray-50">
                        Ver todos los productos (${results.products.length})
                    </a>
                `;
            }
        }

        // Servicios
        if (results.services && results.services.length > 0) {
            html += `
                <div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h4 class="font-semibold text-gray-700">Servicios (${results.services.length})</h4>
                </div>
            `;

            results.services.slice(0, 3).forEach(service => {
                html += `
                    <a href="/servicios/${service.slug}" class="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <div class="flex items-center">
                            <div class="w-12 h-12 flex-shrink-0 mr-3">
                                <img src="${service.image || '/images/service-placeholder.jpg'}"
                                     alt="${service.name}"
                                     class="w-full h-full object-cover rounded"
                                     onerror="this.src='/images/service-placeholder.jpg'">
                            </div>
                            <div class="flex-1">
                                <h5 class="font-medium text-gray-800 line-clamp-1">${service.name}</h5>
                                <p class="text-sm text-gray-500 line-clamp-1">${service.category}</p>
                                <div class="flex items-center mt-1">
                                    ${service.price ? `
                                        <span class="text-primary font-semibold">$${parseFloat(service.price).toFixed(2)}</span>
                                    ` : `
                                        <span class="text-gray-500 text-sm">Consultar precio</span>
                                    `}
                                    ${service.rating ? `
                                        <div class="flex text-yellow-400 text-xs ml-2">
                                            ${'★'.repeat(Math.floor(service.rating))}
                                            ${service.rating % 1 >= 0.5 ? '½' : ''}
                                            ${'☆'.repeat(5 - Math.ceil(service.rating))}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </a>
                `;
            });

            if (results.services.length > 3) {
                html += `
                    <a href="/buscar?q=${encodeURIComponent(searchInput.value.trim())}&type=services"
                       class="block px-4 py-2 text-center text-primary hover:bg-gray-50">
                        Ver todos los servicios (${results.services.length})
                    </a>
                `;
            }
        }

        html += '</div>';
        resultsDropdown.innerHTML = html;
    }

    // ============================================
    // NOTIFICACIONES
    // ============================================

    /**
     * Configura el dropdown de notificaciones
     */
    function setupNotifications() {
        if (!notificationsButton || !notificationsDropdown) {
            console.warn('⚠️ [NAVBAR] Elementos de notificaciones no encontrados');
            return;
        }

        // Alternar visibilidad del dropdown
        notificationsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('hidden');

            // Cargar notificaciones si el dropdown se abre y está vacío
            if (!notificationsDropdown.classList.contains('hidden') &&
                notificationsDropdown.querySelectorAll('.notification-item').length === 0) {
                loadNotifications();
            }
        });

        // Marcar notificaciones como leídas al abrir el dropdown
        notificationsDropdown.addEventListener('show', () => {
            markNotificationsAsRead();
        });
    }

    /**
     * Carga notificaciones desde la API
     */
    async function loadNotifications() {
        try {
            if (!notificationsDropdown) return;

            notificationsDropdown.innerHTML = `
                <div class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    <p class="mt-2 text-gray-600">Cargando notificaciones...</p>
                </div>
            `;

            const response = await fetch('/api/notifications', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al cargar notificaciones');
            }

            renderNotifications(data.notifications);

            // Actualizar contador
            if (notificationsCount) {
                notificationsCount.textContent = data.unread_count || '0';
                notificationsCount.classList.toggle('hidden', data.unread_count === 0);
            }

        } catch (error) {
            console.error('❌ [NAVBAR] Error al cargar notificaciones:', error);
            notificationsDropdown.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>Error al cargar notificaciones</p>
                    <button onclick="loadNotifications()"
                            class="mt-2 px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    /**
     * Renderiza las notificaciones en el dropdown
     * @param {Array} notifications - Lista de notificaciones
     */
    function renderNotifications(notifications) {
        if (!notificationsDropdown) return;

        if (!notifications || notifications.length === 0) {
            notificationsDropdown.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-2xl mb-2"></i>
                    <p>No tienes notificaciones</p>
                </div>
            `;
            return;
        }

        let html = '<div class="max-h-80 overflow-y-auto">';

        notifications.forEach(notification => {
            const isUnread = !notification.read_at;
            const timeAgo = timeSince(new Date(notification.created_at));

            html += `
                <a href="${notification.url || '#'}"
                   class="notification-item block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${isUnread ? 'bg-blue-50' : ''}"
                   data-notification-id="${notification.id}">

                    <div class="flex items-start">
                        ${notification.icon ?
                            `<i class="${notification.icon} text-xl mr-3 ${isUnread ? 'text-blue-500' : 'text-gray-400'}"></i>` :
                            `<i class="fas fa-bell text-xl mr-3 ${isUnread ? 'text-blue-500' : 'text-gray-400'}"></i>`}

                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <h5 class="font-medium text-gray-800 line-clamp-1">${notification.title}</h5>
                                ${isUnread ? `<span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Nuevo</span>` : ''}
                            </div>
                            <p class="text-sm text-gray-600 line-clamp-2 mt-1">${notification.message}</p>
                            <p class="text-xs text-gray-400 mt-1">${timeAgo}</p>
                        </div>
                    </div>
                </a>
            `;
        });

        html += `
            </div>
            <div class="p-2 border-t border-gray-200 text-center">
                <a href="/notificaciones"
                   class="text-primary text-sm hover:underline">
                    Ver todas las notificaciones
                </a>
            </div>
        `;

        notificationsDropdown.innerHTML = html;

        // Marcar como leídas al hacer clic en una notificación
        notificationsDropdown.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (item.classList.contains('bg-blue-50')) {
                    e.preventDefault();
                    const notificationId = item.dataset.notificationId;

                    try {
                        await markNotificationAsRead(notificationId);
                        item.classList.remove('bg-blue-50');
                        item.querySelector('i').classList.remove('text-blue-500');
                        item.querySelector('i').classList.add('text-gray-400');

                        // Actualizar contador
                        const currentCount = parseInt(notificationsCount.textContent || '0');
                        if (currentCount > 0) {
                            notificationsCount.textContent = currentCount - 1;
                            if (currentCount - 1 === 0) {
                                notificationsCount.classList.add('hidden');
                            }
                        }

                        // Redirigir después de marcar como leída
                        setTimeout(() => {
                            window.location.href = item.getAttribute('href');
                        }, 300);
                    } catch (error) {
                        console.error('❌ [NAVBAR] Error al marcar notificación como leída:', error);
                        window.location.href = item.getAttribute('href');
                    }
                }
            });
        });
    }

    /**
     * Marca una notificación como leída
     * @param {string} notificationId - ID de la notificación
     */
    async function markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al marcar notificación como leída');
            }

        } catch (error) {
            console.error('❌ [NAVBAR] Error al marcar notificación como leída:', error);
            throw error;
        }
    }

    /**
     * Marca todas las notificaciones como leídas
     */
    async function markNotificationsAsRead() {
        try {
            if (!notificationsDropdown || notificationsDropdown.classList.contains('hidden')) {
                return;
            }

            const response = await fetch('/api/notifications/mark-all-as-read', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al marcar notificaciones como leídas');
            }

            // Actualizar UI
            notificationsDropdown.querySelectorAll('.notification-item').forEach(item => {
                item.classList.remove('bg-blue-50');
                const icon = item.querySelector('i');
                if (icon) {
                    icon.classList.remove('text-blue-500');
                    icon.classList.add('text-gray-400');
                }
                const badge = item.querySelector('.bg-blue-100');
                if (badge) badge.remove();
            });

            // Actualizar contador
            if (notificationsCount) {
                notificationsCount.textContent = '0';
                notificationsCount.classList.add('hidden');
            }

        } catch (error) {
            console.error('❌ [NAVBAR] Error al marcar notificaciones como leídas:', error);
        }
    }

    /**
     * Calcula el tiempo transcurrido desde una fecha
     * @param {Date} date - Fecha de referencia
     * @returns {string} Tiempo formateado (ej: "hace 2 horas")
     */
    function timeSince(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return `hace ${interval} año${interval === 1 ? '' : 's'}`;

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `hace ${interval} mes${interval === 1 ? '' : 'es'}`;

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `hace ${interval} día${interval === 1 ? '' : 's'}`;

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `hace ${interval} hora${interval === 1 ? '' : 's'}`;

        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `hace ${interval} minuto${interval === 1 ? '' : 's'}`;

        return `hace ${Math.floor(seconds)} segundo${seconds === 1 ? '' : 's'}`;
    }

    // ============================================
    // CARRITO DE COMPRAS
    // ============================================

    /**
     * Configura el botón del carrito
     */
    function setupCart() {
        if (!cartButton) {
            console.warn('⚠️ [NAVBAR] Botón del carrito no encontrado');
            return;
        }

        // Cargar cantidad inicial del carrito
        loadCartCount();

        // Configurar dropdown del carrito (si existe)
        const cartDropdown = document.getElementById('cartDropdown');
        if (cartDropdown) {
            cartButton.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDropdown.classList.toggle('hidden');

                // Cargar contenido del carrito si está vacío
                if (!cartDropdown.classList.contains('hidden') &&
                    cartDropdown.querySelectorAll('.cart-item').length === 0) {
                    loadCartItems();
                }
            });

            // Cerrar dropdown al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!cartDropdown.contains(e.target) &&
                    !cartButton.contains(e.target) &&
                    !cartDropdown.classList.contains('hidden')) {
                    cartDropdown.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Carga la cantidad de items en el carrito
     */
    async function loadCartCount() {
        try {
            if (!cartCount) return;

            const response = await fetch('/api/cart/count', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al cargar carrito');
            }

            cartCount.textContent = data.count || '0';
            cartCount.classList.toggle('hidden', data.count === 0);

        } catch (error) {
            console.error('❌ [NAVBAR] Error al cargar cantidad del carrito:', error);
            if (cartCount) {
                cartCount.textContent = '0';
                cartCount.classList.add('hidden');
            }
        }
    }

    /**
     * Carga los items del carrito para el dropdown
     */
    async function loadCartItems() {
        try {
            const cartDropdown = document.getElementById('cartDropdown');
            if (!cartDropdown) return;

            const cartContent = cartDropdown.querySelector('.cart-content');
            if (!cartContent) return;

            cartContent.innerHTML = `
                <div class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    <p class="mt-2 text-gray-600">Cargando carrito...</p>
                </div>
            `;

            const response = await fetch('/api/cart/items', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al cargar items del carrito');
            }

            renderCartItems(data.items, data.total);

        } catch (error) {
            console.error('❌ [NAVBAR] Error al cargar items del carrito:', error);
            const cartContent = cartDropdown.querySelector('.cart-content');
            if (cartContent) {
                cartContent.innerHTML = `
                    <div class="text-center py-4 text-red-500">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p>Error al cargar carrito</p>
                        <button onclick="loadCartItems()"
                                class="mt-2 px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100">
                            Reintentar
                        </button>
                    </div>
                `;
            }
        }
    }

    /**
     * Renderiza los items del carrito en el dropdown
     * @param {Array} items - Items del carrito
     * @param {number} total - Total del carrito
     */
    function renderCartItems(items, total) {
        const cartDropdown = document.getElementById('cartDropdown');
        if (!cartDropdown) return;

        const cartContent = cartDropdown.querySelector('.cart-content');
        if (!cartContent) return;

        if (!items || items.length === 0) {
            cartContent.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-shopping-cart text-2xl mb-2"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
            return;
        }

        let html = '<div class="max-h-80 overflow-y-auto">';

        items.forEach(item => {
            html += `
                <div class="p-3 border-b border-gray-100 last:border-b-0">
                    <div class="flex items-center">
                        <div class="w-12 h-12 flex-shrink-0 mr-3">
                            <img src="${item.image || '/images/product-placeholder.jpg'}"
                                 alt="${item.name}"
                                 class="w-full h-full object-cover rounded"
                                 onerror="this.src='/images/product-placeholder.jpg'">
                        </div>

                        <div class="flex-1">
                            <h5 class="font-medium text-gray-800 line-clamp-1">${item.name}</h5>
                            <p class="text-sm text-gray-500">${item.quantity} x $${parseFloat(item.price).toFixed(2)}</p>
                        </div>

                        <button class="text-red-500 hover:text-red-700 remove-from-cart"
                                data-product-id="${item.id}"
                                title="Eliminar">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
            </div>

            <div class="p-3 border-t border-gray-200">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold">Total:</span>
                    <span class="font-semibold text-primary">$${parseFloat(total).toFixed(2)}</span>
                </div>

                <div class="flex space-x-2">
                    <a href="/carrito"
                       class="flex-1 bg-primary text-white text-center py-2 px-3 rounded-lg hover:bg-primary-dark transition-colors">
                        Ver Carrito
                    </a>

                    <a href="/checkout"
                       class="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-lg hover:bg-green-700 transition-colors">
                        Comprar
                    </a>
                </div>
            </div>
        `;

        cartContent.innerHTML = html;

        // Configurar eventos para eliminar items
        cartContent.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const productId = button.dataset.productId;
                try {
                    await removeFromCart(productId);
                } catch (error) {
                    console.error('❌ [NAVBAR] Error al eliminar item del carrito:', error);
                    showToast('Error al eliminar item del carrito', 'error');
                }
            });
        });
    }

    /**
     * Elimina un item del carrito
     * @param {string} productId - ID del producto
     */
    async function removeFromCart(productId) {
        try {
            const response = await fetch(`/api/cart/items/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al eliminar item');
            }

            // Recargar carrito
            loadCartCount();
            loadCartItems();
            showToast('Producto eliminado del carrito', 'success');

        } catch (error) {
            console.error('❌ [NAVBAR] Error al eliminar item del carrito:', error);
            throw error;
        }
    }

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================

    /**
     * Obtiene el token CSRF
     * @returns {string} Token CSRF
     */
    function getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.content : '';
    }

    /**
     * Muestra un toast de notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
    function showToast(message, type = 'success') {
        // Verificar si ya existe un toast
        let toast = document.getElementById('navbar-toast');
        if (toast) {
            toast.remove();
        }

        // Crear nuevo toast
        toast = document.createElement('div');
        toast.id = 'navbar-toast';
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '250px';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.fontSize = '0.95rem';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.transition = 'all 0.3s ease';
        toast.style.transform = 'translateX(400px)';
        toast.style.opacity = '0';

        // Colores según el tipo
        if (type === 'success') {
            toast.style.background = '#10b981'; // green-600
        } else if (type === 'error') {
            toast.style.background = '#ef4444'; // red-500
        } else {
            toast.style.background = '#3b82f6'; // blue-500
        }
        toast.style.color = '#fff';

        // Icono según el tipo
        let iconHtml = '';
        if (type === 'success') {
            iconHtml = '<i class="fas fa-check-circle mr-2"></i>';
        } else if (type === 'error') {
            iconHtml = '<i class="fas fa-exclamation-circle mr-2"></i>';
        } else {
            iconHtml = '<i class="fas fa-info-circle mr-2"></i>';
        }

        toast.innerHTML = `
            <div class="flex items-center">
                ${iconHtml}
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        // Animación de salida
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            toast.style.opacity = '0';

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    toast.remove();
                }
            }, 400);
        }, 3000);
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    // Configurar todas las funcionalidades
    setupMobileMenu();
    setupCategoriesModal();
    setupProfileModal();
    setupModalOutsideClick();
    setupNavbarScrollEffect();
    setupSearch();
    setupNotifications();
    setupCart();

    console.log('✅ [NAVBAR] Funcionalidad del navbar inicializada correctamente');
});
