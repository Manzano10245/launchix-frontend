/**
 * MisServicios.js - Gestión de servicios del emprendedor con integración API
 * Versión mejorada con manejo de errores robusto y logging detallado
 */

import './config.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛠️ [SERVICIOS] Inicializando módulo de Mis Servicios');

    // ============================================
    // VARIABLES GLOBALES Y ELEMENTOS DEL DOM
    // ============================================

    const grid = document.getElementById('mis-servicios-grid');
    const loading = document.getElementById('servicios-loading');
    const countEl = document.getElementById('servicios-count');
    let currentServices = [];
        const __missingServiceDetailIds = new Set();
    let __isLoadingMyServices = false;
    let __lastLoadTs = 0;

    function dedupById(list) {
        const seen = new Set();
        return (list || []).filter(s => {
            const id = s && s.id;
            if (id == null) return true;
            const key = String(id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // Verificar elementos críticos
    console.log('🔍 [DOM] Elementos encontrados:', {
        grid: !!grid,
        loading: !!loading,
        countEl: !!countEl
    });

    // ============================================
    // FUNCIONES DE MODAL (MEJORADAS)
    // ============================================

    /**
     * Cierra un modal con animación
     * @param {string} id - ID del modal a cerrar
     */
    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (!modal) {
            console.warn(`⚠️ [MODAL] Modal con ID ${id} no encontrado`);
            return;
        }
        console.log(`🚪 [MODAL] Cerrando modal ${id}`);
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.style.opacity = '';
            modal.style.transform = '';
            // Limpiar formularios al cerrar
            if (id === 'modal-editar' || id === 'modal-agregar-servicio') {
                const form = modal.querySelector('form');
                if (form) form.reset();
            }
        }, 200);
    };

    /**
     * Abre un modal con animación
     * @param {string} id - ID del modal a abrir
     */
    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) {
            console.warn(`⚠️ [MODAL] Modal con ID ${id} no encontrado`);
            return;
        }

        console.log(`🚪 [MODAL] Abriendo modal ${id}`);
        modal.classList.remove('hidden');
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';

        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);
    }

    /**
     * Configura el cierre de modales al hacer clic fuera
     */
    function setupModalCloseOnOutsideClick() {
        document.addEventListener('click', function(e) {
            // Cerrar modal "ver" al hacer clic fuera
            const modalVer = document.getElementById('modal-ver');
            if (modalVer && !modalVer.classList.contains('hidden')) {
                const modalContent = modalVer.querySelector('.bg-white');
                if (e.target === modalVer && !modalContent.contains(e.target)) {
                    closeModal('modal-ver');
                }
            }

            // Cerrar modal "editar" al hacer clic fuera
            const modalEditar = document.getElementById('modal-editar');
            if (modalEditar && !modalEditar.classList.contains('hidden')) {
                const modalContent = modalEditar.querySelector('.bg-white');
                if (e.target === modalEditar && !modalContent.contains(e.target)) {
                    closeModal('modal-editar');
                }
            }

            // Cerrar modal "agregar" al hacer clic fuera
            const modalAgregar = document.getElementById('modal-agregar-servicio');
            if (modalAgregar && !modalAgregar.classList.contains('hidden')) {
                const modalContent = modalAgregar.querySelector('.bg-white');
                if (e.target === modalAgregar && !modalContent.contains(e.target)) {
                    closeModal('modal-agregar-servicio');
                }
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                ['modal-ver', 'modal-editar', 'modal-agregar-servicio'].forEach(modalId => {
                    const modal = document.getElementById(modalId);
                    if (modal && !modal.classList.contains('hidden')) {
                        closeModal(modalId);
                    }
                });
            }
        });
    }

    // ============================================
    // CARGA DE SERVICIOS (API)
    // ============================================

    // Helpers de API y autenticación
    function authHeaders(base = {}) {
        const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(base || {}) };
        try {
            const token = window.API_TOKEN || localStorage.getItem('API_TOKEN');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch {}
        return headers;
    }

    async function getEntrepreneurId() {
        try {
            if (window.ENTREPRENEUR_ID) return window.ENTREPRENEUR_ID;
            const cached = localStorage.getItem('ENTREPRENEUR_ID');
            if (cached) { window.ENTREPRENEUR_ID = cached; return cached; }

            const mePath = window.API_EP_ME || `${(window.API_PREFIX || '/api/v1')}/entrepreneur/me`;
            const base = (window.API_BASE_URL || '').replace(/\/$/, '');
            const url = `${base}${mePath.startsWith('/') ? mePath : `/${mePath}`}`;
            const res = await fetch(url, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
            if (!res.ok) return null;
            const data = await res.json().catch(() => ({}));
            const payload = data?.data || data?.user || data?.entrepreneur || data;
            const id = payload?.id || payload?.entrepreneur_id || null;
            if (id != null) {
                window.ENTREPRENEUR_ID = String(id);
                try { localStorage.setItem('ENTREPRENEUR_ID', String(id)); } catch {}
                return String(id);
            }
            return null;
        } catch { return null; }
    }

    function getOwnerIdFromService(s) {
        if (!s || typeof s !== 'object') return null;
        // snake_case
        if (s.entrepreneur_id != null) return s.entrepreneur_id;
        if (s.emprendedor_id != null) return s.emprendedor_id;
        if (s.owner_id != null) return s.owner_id;
        if (s.user_id != null) return s.user_id;
        if (s.usuario_id != null) return s.usuario_id;
        if (s.created_by_id != null) return s.created_by_id;
        if (s.creator_id != null) return s.creator_id;
        if (s.author_id != null) return s.author_id;

        // camelCase
        if (s.entrepreneurId != null) return s.entrepreneurId;
        if (s.emprendedorId != null) return s.emprendedorId;
        if (s.ownerId != null) return s.ownerId;
        if (s.userId != null) return s.userId;
        if (s.usuarioId != null) return s.usuarioId;
        if (s.createdById != null) return s.createdById;
        if (s.creatorId != null) return s.creatorId;
        if (s.authorId != null) return s.authorId;

        // relaciones anidadas
        if (s.entrepreneur && s.entrepreneur.id != null) return s.entrepreneur.id;
        if (s.emprendedor && s.emprendedor.id != null) return s.emprendedor.id;
        if (s.owner && s.owner.id != null) return s.owner.id;
        if (s.user && s.user.id != null) return s.user.id;
        if (s.usuario && s.usuario.id != null) return s.usuario.id;
        if (s.created_by && s.created_by.id != null) return s.created_by.id;
        if (s.creator && s.creator.id != null) return s.creator.id;
        if (s.author && s.author.id != null) return s.author.id;

        return null;
    }

    /**
     * Carga los servicios del emprendedor desde la API
     */
    window.loadMisServicios = async function() {
        // Evitar cargas concurrentes y rebotes seguidos
        if (__isLoadingMyServices) {
            console.debug('⏳ [SERVICIOS] Carga en curso, omitiendo llamada concurrente');
            return;
        }
        const now = Date.now();
        if (now - __lastLoadTs < 600) {
            console.debug('🪫 [SERVICIOS] Debounce: evitando recarga inmediata');
            return;
        }
        __isLoadingMyServices = true;
        __lastLoadTs = now;
        if (!grid) {
            console.error('❌ [SERVICIOS] Grid de servicios no encontrado');
            __isLoadingMyServices = false;
            return;
        }

        if (loading) loading.classList.remove('hidden');
        grid.innerHTML = '';

        try {
            console.log('🔄 [SERVICIOS] Cargando servicios desde API');

            const base = (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1');
            const primary = `${base}${window.API_REL_EP_SERVICES || '/servicios'}`; // confirmado en backend
            const fallback = `${base}${window.API_REL_EP_SERVICES_FALLBACK || '/servicios'}`;
            const headers = {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };
            try {
                const token = window.API_TOKEN || localStorage.getItem('API_TOKEN');
                if (token) headers['Authorization'] = `Bearer ${token}`;
            } catch {}
            let preferFallback = window.__USE_SERVICES_FALLBACK === true;
            let response;
            if (!preferFallback) {
                response = await fetch(primary + (primary.includes('?') ? '&' : '?') + `_=${Date.now()}`, { method: 'GET', headers, credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
            }
            if (preferFallback || !response.ok) {
                // mark fallback usage if primary failed
                if (response && response.status === 404) window.__USE_SERVICES_FALLBACK = true;
                response = await fetch(fallback + (fallback.includes('?') ? '&' : '?') + `_=${Date.now()}`, { method: 'GET', headers, credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(msg);
            }

            const data = await response.json();
            console.log('📦 [SERVICIOS] Datos recibidos:', data);

            let items = [];
            if (Array.isArray(data)) items = data;
            else if (Array.isArray(data.data)) items = data.data;
            else if (Array.isArray(data.servicios)) items = data.servicios; // nombre local
            else if (Array.isArray(data.services)) items = data.services;
            else if (data.service) items = [data.service];
            // Filtrar por emprendedor autenticado: 'Mis Servicios' debe mostrar solo los míos
            const eid = await getEntrepreneurId();
            if (eid != null) {
                items = (items || []).filter(s => {
                    const owner = getOwnerIdFromService(s);
                    return owner != null && String(owner) === String(eid);
                });
                console.log(`🧩 [SERVICIOS] Filtrados por emprendedor #${eid}: ${items.length}`);
                // Si el backend no marca propietario y el filtro queda vacío, intentar endpoint dedicado del emprendedor
                if ((!items || items.length === 0)) {
                    try {
                        const base = (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1');
                        const epMine = `${base}/entrepreneur/services`;
                        // Evitar intentar si ya sabemos que no existe
                        if (!(window.__NO_EP_ENTREPRENEUR_SERVICES || localStorage.getItem('__NO_EP_ENTREPRENEUR_SERVICES') === '1')) {
                            const resMine = await fetch(epMine, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                            if (resMine.status === 404) {
                                window.__NO_EP_ENTREPRENEUR_SERVICES = true;
                                try { localStorage.setItem('__NO_EP_ENTREPRENEUR_SERVICES', '1'); } catch {}
                            }
                            if (resMine.ok) {
                                const d2 = await resMine.json().catch(() => ({}));
                                let mine = [];
                                if (Array.isArray(d2)) mine = d2;
                                else if (Array.isArray(d2.data)) mine = d2.data;
                                else if (Array.isArray(d2.services)) mine = d2.services;
                                else if (Array.isArray(d2.servicios)) mine = d2.servicios;
                                else if (d2.service) mine = [d2.service];
                                if (mine && mine.length > 0) {
                                    items = mine;
                                    console.log(`🛠️ [SERVICIOS] Usado endpoint dedicado /entrepreneur/services: ${items.length}`);
                                }
                            }
                        }
                    } catch {}
                }
                // Si sigue vacío, usar cache local de IDs creados por este emprendedor
                if (!items || items.length === 0) {
                    try {
                        const key = `MY_SERVICE_IDS:${eid}`;
                        const idsRaw = JSON.parse(localStorage.getItem(key) || '[]');
                        const ids = Array.isArray(idsRaw) ? idsRaw : [];
                        if (ids.length > 0) {
                            // obtener todos y filtrar por ids (comparación como string para evitar desajustes tipo/valor)
                            const all = currentServices && currentServices.length ? currentServices : items;
                            let pool = all;
                            if (!pool || pool.length === 0) pool = (Array.isArray(data)) ? data : (data?.data || data?.services || data?.servicios || []);
                            const idSet = new Set(ids.map(x => String(x)));
                            items = (pool || []).filter(s => idSet.has(String(s.id)));

                            // Si faltan algunos, intentar traerlos individualmente por ID del endpoint genérico
                            const missing = ids.filter(x => !items.some(s => String(s.id) === String(x)));
                            if (missing.length > 0) {
                                const base = (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1');
                                const rel = (window.API_REL_EP_SERVICES_FALLBACK || '/services');
                                const variants = [rel, rel === '/services' ? '/servicios' : '/services'];
                                for (const mid of missing) {
                                    if (__missingServiceDetailIds.has(String(mid))) {
                                        continue; // ya sabemos que no existe
                                    }
                                    let fetched = false;
                                    for (const v of variants) {
                                        try {
                                            const res = await fetch(`${base}${v}/${mid}?_=${Date.now()}`, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                                            if (res.ok) {
                                                const d3 = await res.json().catch(() => ({}));
                                                let obj = d3?.data || d3?.service || d3;
                                                if (obj && typeof obj === 'object') {
                                                    items.push(obj);
                                                    fetched = true;
                                                    break;
                                                }
                                            }
                                        } catch {}
                                    }
                                    if (!fetched) {
                                        __missingServiceDetailIds.add(String(mid));
                                        // Remover del cache local para no insistir
                                        try {
                                            const key = `MY_SERVICE_IDS:${eid}`;
                                            const idsRaw = JSON.parse(localStorage.getItem(key) || '[]');
                                            const next = (Array.isArray(idsRaw) ? idsRaw : []).filter(x => String(x) !== String(mid));
                                            localStorage.setItem(key, JSON.stringify(next));
                                        } catch {}
                                    }
                                }
                            }

                            console.log(`💾 [SERVICIOS] Usada cache local de servicios: ${items.length}/${ids.length}`);
                        }
                    } catch {}
                }
            } else {
                console.warn('⚠️ [SERVICIOS] No se pudo determinar entrepreneur_id; mostrando lista sin filtrar para evitar falsos negativos');
            }
            // Deduplicar por id antes de renderizar
            items = dedupById(items);
            currentServices = items;

            if (countEl) countEl.textContent = currentServices.length;

            if (currentServices.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center text-gray-400 py-12">
                        <i class="fas fa-concierge-bell text-4xl mb-4"></i>
                        <h3 class="text-xl font-semibold mb-2">No tienes servicios publicados</h3>
                        <p class="text-gray-500">Comienza a ofrecer tus servicios para llegar a más clientes</p>
                        <button onclick="openModal('modal-agregar-servicio')"
                                class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                            <i class="fas fa-plus mr-2"></i> Publicar Primer Servicio
                        </button>
                    </div>
                `;
            } else {
                grid.innerHTML = currentServices.map(renderServicioCard).join('');
            }

            // Asignar eventos a los botones
            bindActions();

        } catch (error) {
            console.error('❌ [SERVICIOS] Error al cargar servicios:', error);
            grid.innerHTML = `
                <div class="col-span-full text-center text-red-400 py-12">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">Error al cargar servicios</h3>
                    <p class="text-gray-600">${error.message}. Verifica que exista la ruta ${window.API_PREFIX || '/api/v1'}${window.API_REL_EP_SERVICES_FALLBACK || '/servicios'}</p>
                    <button onclick="loadMisServicios()"
                            class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i> Reintentar
                    </button>
                </div>
            `;
        } finally {
            if (loading) loading.classList.add('hidden');
            __isLoadingMyServices = false;
        }
    };

    // ============================================
    // RENDERIZADO DE TARJETAS DE SERVICIO
    // ============================================

    /**
     * Genera el HTML para una tarjeta de servicio
     * @param {Object} servicio - Datos del servicio
     * @returns {string} HTML de la tarjeta
     */
    function renderServicioCard(servicio) {
        const apiHost = (window.API_BASE_URL || '').replace(/\/$/, '');
        let imgSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#fde8e8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#9b1c1c">Sin imagen</text></svg>');
        if (servicio.imagen_principal) {
            if (typeof servicio.imagen_principal === 'string' && servicio.imagen_principal.startsWith('http')) {
                imgSrc = servicio.imagen_principal;
            } else {
                const rel = String(servicio.imagen_principal).replace(/^\/+/, '');
                const path = rel.startsWith('storage/') ? rel : `storage/${rel.replace(/^storage\//,'')}`;
                imgSrc = `${apiHost}/${path}`;
            }
        }

        const precio = servicio.precio_base ?
            `$${Number(servicio.precio_base).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}` :
            'Consultar';

        const categoria = getServiceCategoryName(servicio.categoria);

        return `
            <div class="product-card bg-white rounded-lg shadow-lg overflow-hidden fade-in hover:shadow-xl transition-shadow duration-300">
                <div class="relative">
                <img src="${imgSrc}"
                         alt="${servicio.nombre_servicio || 'Servicio'}"
                         class="w-full h-64 object-cover"
                    onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'><rect width=\'100%\' height=\'100%\' fill=\'#fde8e8\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-size=\'18\' fill=\'#9b1c1c\'>Sin imagen</text></svg>')}'">

                    <div class="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        ${categoria}
                    </div>

                    <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                        <button class="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ver-mas"
                                data-id="${servicio.id}">
                            <i class="fas fa-eye"></i> Ver Detalle
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${servicio.nombre_servicio || 'Servicio sin nombre'}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${servicio.descripcion || 'Sin descripción'}</p>

                    <div class="flex items-center justify-between mb-4">
                        <span class="text-2xl font-bold text-red-600">${precio}</span>
                    </div>

                    ${servicio.direccion || servicio.telefono || servicio.horario_atencion ? `
                        <div class="space-y-2 text-sm text-gray-600 mb-4">
                            ${servicio.direccion ? `
                                <div class="flex items-center">
                                    <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                                    <span class="truncate">${servicio.direccion}</span>
                                </div>
                            ` : ''}
                            ${servicio.telefono ? `
                                <div class="flex items-center">
                                    <i class="fas fa-phone text-gray-400 mr-2"></i>
                                    <span>${servicio.telefono}</span>
                                </div>
                            ` : ''}
                            ${servicio.horario_atencion ? `
                                <div class="flex items-center">
                                    <i class="fas fa-clock text-gray-400 mr-2"></i>
                                    <span class="truncate">${servicio.horario_atencion}</span>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <!-- Botones de administración -->
                    <div class="flex space-x-2 border-t border-gray-200 pt-4">
                        <button class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg editar-servicio"
                                data-id="${servicio.id}">
                            <i class="fas fa-edit mr-2"></i> Editar
                        </button>

                        <button class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg eliminar-servicio"
                                data-id="${servicio.id}">
                            <i class="fas fa-trash mr-2"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene el nombre de categoría formateado
     * @param {string|object} categoria - Categoría del servicio
     * @returns {string} Nombre de la categoría
     */
    function getServiceCategoryName(categoria) {
        const categoryMap = {
            'limpieza': 'Servicios de Limpieza',
            'reparaciones': 'Reparaciones del Hogar',
            'jardineria': 'Jardinería y Paisajismo',
            'transporte': 'Servicios de Transporte',
            'tecnologia': 'Soporte Técnico',
            'educacion': 'Educación y Tutorías',
            'salud': 'Salud y Bienestar',
            'eventos': 'Organización de Eventos',
            'comida': 'Comida y Bebidas',
            'autolavado': 'Autolavado',
            'carpinteria': 'Carpintería',
            'belleza': 'Belleza y Spa',
            'hogar': 'Hogar y Jardinería',
            'otro': 'Otros Servicios'
        };

        // Si es un objeto con name o slug
        if (typeof categoria === 'object' && categoria !== null) {
            return categoria.name || categoryMap[categoria.slug] || categoria.slug || 'Sin categoría';
        }

        // Si es una cadena
        return categoryMap[categoria] || categoria || 'Sin categoría';
    }

    // ============================================
    // ACCIONES Y EVENT LISTENERS
    // ============================================

    /**
     * Asigna eventos a los botones de acción
     */
    function bindActions() {
        if (!grid) return;

        // Ver detalles
        grid.querySelectorAll('.ver-mas').forEach(btn => {
            btn.addEventListener('click', async function() {
                const serviceId = this.dataset.id;
                try {
                    console.log(`🔍 [SERVICIO] Cargando detalles del servicio ${serviceId}`);
                    await loadServiceDetails(serviceId);
                } catch (error) {
                    console.error(`❌ [SERVICIO] Error al cargar detalles del servicio ${serviceId}:`, error);
                    showToast('Error al cargar detalles del servicio', 'error');
                }
            });
        });

        // Editar servicio
        grid.querySelectorAll('.editar-servicio').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                // Evitar que el handler global de ServicePublishing también capture este click
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const serviceId = this.dataset.id;
                try {
                    console.log(`📝 [SERVICIO] Preparando edición del servicio ${serviceId}`);
                    await loadServiceForEditing(serviceId);
                } catch (error) {
                    console.error(`❌ [SERVICIO] Error al preparar edición del servicio ${serviceId}:`, error);
                    showToast('Error al preparar edición del servicio', 'error');
                }
            });
        });

        // Eliminar servicio
        grid.querySelectorAll('.eliminar-servicio').forEach(btn => {
            btn.addEventListener('click', async function() {
                const serviceId = this.dataset.id;
                const serviceName = this.closest('.product-card').querySelector('h3').textContent;

                const confirmed = await showConfirmDialog({
                    title: 'Eliminar Servicio',
                    message: `¿Estás seguro de que deseas eliminar el servicio "${serviceName}"? Esta acción no se puede deshacer.`,
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'danger'
                });

                if (!confirmed) return;

                try {
                    console.log(`🗑️ [SERVICIO] Eliminando servicio ${serviceId}`);
                    await deleteService(serviceId);
                } catch (error) {
                    console.error(`❌ [SERVICIO] Error al eliminar servicio ${serviceId}:`, error);
                    showToast(error.message || 'Error al eliminar el servicio', 'error');
                }
            });
        });
    }

    /**
     * Carga los detalles de un servicio para mostrar en el modal
     * @param {number} serviceId - ID del servicio
     */
    async function loadServiceDetails(serviceId) {
        try {
            const base = (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1');
            const rel = (window.API_REL_EP_SERVICES || '/servicios');
            const variants = [rel, rel === '/servicios' ? '/services' : '/servicios'];
            let raw = null, ok = false, lastErr = '';
            for (const v of variants) {
                try {
                    const url = `${base}${v}/${serviceId}?_=${Date.now()}`;
                    const res = await fetch(url, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                    if (res.ok) { raw = await res.json().catch(() => ({})); ok = true; break; }
                    else { lastErr = `Error ${res.status}`; }
                } catch (e) { lastErr = e?.message || String(e); }
            }
            if (!ok) {
                __missingServiceDetailIds.add(String(serviceId));
                throw new Error(lastErr || 'Error al obtener el servicio');
            }

            // Normalizar payload
            const payload = raw?.data?.service || raw?.data || raw?.service || raw;
            if (!payload) {
                throw new Error('Respuesta inválida del servidor');
            }

            fillVerModal(payload);
            openModal('modal-ver');

        } catch (error) {
            console.error('❌ [SERVICIO] Error al cargar detalles:', error);
            throw error;
        }
    }

    /**
     * Carga un servicio para edición
     * @param {number} serviceId - ID del servicio
     */
    async function loadServiceForEditing(serviceId) {
        try {
            const base = (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1');
            const rel = (window.API_REL_EP_SERVICES || '/servicios');
            const variants = [rel, rel === '/servicios' ? '/services' : '/servicios'];
            let raw = null, ok = false, lastErr = '';
            for (const v of variants) {
                try {
                    const url = `${base}${v}/${serviceId}?_=${Date.now()}`;
                    const res = await fetch(url, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                    if (res.ok) { raw = await res.json().catch(() => ({})); ok = true; break; }
                    else if (res.status === 403) {
                        // Fallback: listar mis servicios y tomar por ID si es mío
                        try {
                            const listUrl = `${base}/servicios?_=${Date.now()}`;
                            const listRes = await fetch(listUrl, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                            if (listRes.ok) {
                                const lj = await listRes.json().catch(() => ({}));
                                const items = Array.isArray(lj) ? lj : (lj?.data || lj?.services || lj?.servicios || []);
                                const found = Array.isArray(items) ? items.find(s => String(s.id) === String(serviceId)) : null;
                                if (found) { raw = { data: found }; ok = true; break; }
                            }
                        } catch {}
                        lastErr = 'Error 403';
                    } else { lastErr = `Error ${res.status}`; }
                } catch (e) { lastErr = e?.message || String(e); }
            }
            if (!ok) {
                __missingServiceDetailIds.add(String(serviceId));
                throw new Error(lastErr || 'Error al obtener el servicio');
            }

            // Normalizar payload
            const payload = raw?.data?.service || raw?.data || raw?.service || raw;
            if (!payload) {
                throw new Error('Respuesta inválida del servidor');
            }

            if (window.ServicesManager && typeof window.ServicesManager.showEditModal === 'function') {
                window.ServicesManager.showEditModal(payload);
            } else {
                fillEditModal(payload);
                openModal('modal-editar');
            }

        } catch (error) {
            console.error('❌ [SERVICIO] Error al cargar servicio para edición:', error);
            throw error;
        }
    }

    /**
     * Elimina un servicio
     * @param {number} serviceId - ID del servicio a eliminar
     */
    async function deleteService(serviceId) {
        try {
            const base = (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1');
            const url = `${base}${(window.API_REL_EP_SERVICES || '/servicios')}/${serviceId}`;
            const headers = {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest'
            };
            try {
                const token = window.API_TOKEN || localStorage.getItem('API_TOKEN');
                if (token) headers['Authorization'] = `Bearer ${token}`;
            } catch {}

            const response = await fetch(url, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al eliminar el servicio');
            }

            showToast('Servicio eliminado correctamente', 'success');
            // Quitar del DOM inmediatamente
            try {
                const card = document.querySelector(`.product-card .eliminar-servicio[data-id="${serviceId}"]`)?.closest('.product-card');
                if (card && card.parentElement) card.parentElement.removeChild(card);
            } catch {}

            // Eliminar de la caché local de IDs para evitar futuras recuperaciones por ID
            try {
                const eid = (window.ENTREPRENEUR_ID || localStorage.getItem('ENTREPRENEUR_ID'));
                if (eid) {
                    const key = `MY_SERVICE_IDS:${eid}`;
                    const idsRaw = JSON.parse(localStorage.getItem(key) || '[]');
                    const ids = Array.isArray(idsRaw) ? idsRaw : [];
                    const next = ids.filter(x => String(x) !== String(serviceId));
                    localStorage.setItem(key, JSON.stringify(next));
                }
            } catch {}

            // Refrescar lista con debounce natural del loader; no insistir en endpoints 404
            setTimeout(() => {
                if (window.ServicesManager && typeof window.ServicesManager.loadServicios === 'function') {
                    window.ServicesManager.loadServicios();
                }
                if (typeof loadMisServicios === 'function') {
                    loadMisServicios();
                }
            }, 300);

            // Recargar la vista pública si existe
            if (window.ServicesManager && typeof window.ServicesManager.loadServicios === 'function') {
                window.ServicesManager.loadServicios();
            }

        } catch (error) {
            console.error('❌ [SERVICIO] Error en la eliminación:', error);
            throw error;
        }
    }

    // ============================================
    // MODAL DE VER DETALLES
    // ============================================

    /**
     * Rellena el modal de ver detalles con los datos del servicio
     * @param {Object} service - Datos del servicio
     */
    function fillVerModal(service) {
        const modal = document.getElementById('modal-ver');
        if (!modal) {
            console.error('❌ [MODAL] Modal de ver detalles no encontrado');
            return;
        }

        // Nombre del servicio
        const nombreEl = modal.querySelector('#ver-nombre');
        if (nombreEl) nombreEl.textContent = service.nombre_servicio || 'Sin nombre';

        // Imagen principal (resolver contra host de API para evitar 404 en vite)
        const apiHost = (window.API_BASE_URL || '').replace(/\/$/, '');
        const resolveImg = (p) => {
            if (!p) return '';
            if (typeof p === 'string' && p.startsWith('http')) return p;
            const rel = String(p).replace(/^\/+/, '');
            const path = rel.startsWith('storage/') ? rel : `storage/${rel.replace(/^storage\//,'')}`;
            return `${apiHost}/${path}`;
        };
        const imgElement = modal.querySelector('#ver-img');
        if (imgElement) {
            const src = service.imagen_principal ? resolveImg(service.imagen_principal) : '';
            imgElement.src = src || 'https://via.placeholder.com/400x300/F77786/FFFFFF?text=Servicio';
            imgElement.alt = service.nombre_servicio || 'Servicio';
        }

        // Descripción
        const descripcionEl = modal.querySelector('#ver-descripcion');
        if (descripcionEl) descripcionEl.textContent = service.descripcion || 'Sin descripción disponible';

        // Categoría
        const categoriaEl = modal.querySelector('#ver-categoria-badge');
        if (categoriaEl) {
            categoriaEl.textContent = getServiceCategoryName(service.categoria);
        }

        // Precio
        const precioEl = modal.querySelector('#ver-precio');
        if (precioEl) {
            precioEl.textContent = service.precio_base ?
                `$${Number(service.precio_base).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}` :
                'Consultar precio';
        }

        // Información de contacto
        const direccionEl = modal.querySelector('#ver-direccion');
        const telefonoEl = modal.querySelector('#ver-telefono');
        const horarioEl = modal.querySelector('#ver-horario');

        if (direccionEl) direccionEl.textContent = service.direccion || 'Ubicación por definir';
        if (telefonoEl) telefonoEl.textContent = service.telefono || 'No especificado';
        if (horarioEl) horarioEl.textContent = service.horario_atencion || 'Horarios flexibles';

        // Galería de imágenes
        const galeriaEl = modal.querySelector('#ver-galeria');
        if (galeriaEl) {
            galeriaEl.innerHTML = '';

            if (service.galeria_imagenes && service.galeria_imagenes.length > 0) {
                service.galeria_imagenes.forEach((img, index) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'relative cursor-pointer group';

                    const imgEl = document.createElement('img');
                    imgEl.src = resolveImg(img);
                    imgEl.className = 'w-full h-20 object-cover rounded-lg shadow group-hover:opacity-75 transition-opacity';
                    imgEl.alt = `Galería ${index + 1}`;

                    // Click para ampliar imagen
                    imgEl.addEventListener('click', () => {
                        showImageModal(imgEl.src, `${service.nombre_servicio} - Imagen ${index + 1}`);
                    });

                    imgContainer.appendChild(imgEl);
                    galeriaEl.appendChild(imgContainer);
                });
            } else {
                galeriaEl.innerHTML = `
                    <div class="text-gray-500 text-sm col-span-3 text-center py-4">
                        No hay más imágenes disponibles
                    </div>
                `;
            }
        }
    }

    // ============================================
    // MODAL DE EDICIÓN
    // ============================================

    /**
     * Rellena el modal de edición con los datos del servicio
     * @param {Object} service - Datos del servicio
     */
    function fillEditModal(service) {
        const modal = document.getElementById('modal-editar');
        if (!modal) {
            console.error('❌ [MODAL] Modal de edición no encontrado');
            return;
        }

        // Limpiar errores previos
        const errorDiv = modal.querySelector('#edit-errors');
        if (errorDiv) errorDiv.innerHTML = '';

        // Rellenar campos
        modal.querySelector('#edit-id').value = service.id || '';
        modal.querySelector('#edit-nombre').value = service.nombre_servicio || '';

        // Manejar categoría (puede ser string u objeto)
        let categoriaValue = '';
        if (typeof service.categoria === 'object' && service.categoria !== null) {
            categoriaValue = service.categoria.slug || service.categoria.name || '';
        } else {
            categoriaValue = service.categoria || '';
        }
        modal.querySelector('#edit-categoria').value = categoriaValue;

        modal.querySelector('#edit-descripcion').value = service.descripcion || '';
        modal.querySelector('#edit-direccion').value = service.direccion || '';
        modal.querySelector('#edit-telefono').value = service.telefono || '';
        modal.querySelector('#edit-precio').value = service.precio_base || '';
        modal.querySelector('#edit-horario').value = service.horario_atencion || '';

        // Limpiar inputs de archivos
        modal.querySelector('#edit-imagen').value = '';
        modal.querySelector('#edit-galeria').value = '';

        // Limpiar previews
        const mainPreview = modal.querySelector('#edit-main-preview');
        const galleryPreview = modal.querySelector('#edit-gallery-preview');

        if (mainPreview) mainPreview.innerHTML = '';
        if (galleryPreview) galleryPreview.innerHTML = '';

        // Configurar eventos para el modal de edición
        setTimeout(() => {
            setupEditImageUpload();
        }, 100);
    }

    // ============================================
    // MANEJO DE FORMULARIOS
    // ============================================

    /**
     * Configura el envío del formulario de edición
     */
    function setupEditForm() {
        const form = document.getElementById('form-editar-servicio');
        if (!form) {
            console.warn('⚠️ [FORM] Formulario de edición no encontrado');
            return;
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const serviceId = document.getElementById('edit-id').value;
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            // Validar formulario
            const errors = validateServiceForm();
            if (errors.length > 0) {
                showEditErrors(errors);
                return;
            }

            // Mostrar loading
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i> Guardando...
                </span>
            `;

            try {
                console.log(`📤 [SERVICIO] Actualizando servicio ${serviceId}`);

                const formData = new FormData(form);

                const response = await fetch(`/api/services/${serviceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Error al actualizar el servicio');
                }

                showToast('Servicio actualizado correctamente', 'success');
                closeModal('modal-editar');
                loadMisServicios();

                // Recargar la vista pública si existe
                if (window.ServicesManager && typeof window.ServicesManager.loadServicios === 'function') {
                    window.ServicesManager.loadServicios();
                }

            } catch (error) {
                console.error('❌ [SERVICIO] Error al actualizar:', error);
                showEditErrors([error.message || 'Error al actualizar el servicio']);
            } finally {
                // Restaurar botón
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    /**
     * Valida el formulario de servicio
     * @returns {Array} Lista de errores
     */
    function validateServiceForm() {
        const errors = [];
        const form = document.getElementById('form-editar-servicio') ||
                    document.getElementById('servicio-form');

        if (!form) return errors;

        const nombre = form.querySelector('[name="nombre_servicio"]');
        const categoria = form.querySelector('[name="categoria"]');
        const descripcion = form.querySelector('[name="descripcion"]');
        const precio = form.querySelector('[name="precio_base"]');

        if (!nombre || !nombre.value.trim()) {
            errors.push('El nombre del servicio es obligatorio');
        }

        if (!categoria || !categoria.value) {
            errors.push('La categoría es obligatoria');
        }

        if (!descripcion || !descripcion.value.trim()) {
            errors.push('La descripción es obligatoria');
        }

        if (precio && precio.value && isNaN(parseFloat(precio.value))) {
            errors.push('El precio debe ser un número válido');
        }

        return errors;
    }

    /**
     * Muestra errores en el formulario de edición
     * @param {Array|string} errors - Errores a mostrar
     */
    function showEditErrors(errors) {
        const errorDiv = document.getElementById('edit-errors');
        if (!errorDiv) return;

        let errorHTML = '';

        if (Array.isArray(errors)) {
            errorHTML = errors.map(error =>
                `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2 rounded">
                    ${error}
                </div>`
            ).join('');
        } else if (typeof errors === 'string') {
            errorHTML = `
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2 rounded">
                    ${errors}
                </div>
            `;
        }

        errorDiv.innerHTML = errorHTML;

        // Scroll al primer error
        if (errorHTML) {
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ============================================
    // MANEJO DE IMÁGENES (SUBIDA Y PREVISUALIZACIÓN)
    // ============================================

    /**
     * Configura la funcionalidad de subida de imágenes para el modal de edición
     */
    function setupEditImageUpload() {
        // Imagen principal
        setupDropzone(
            'edit-main-dropzone',
            'edit-imagen',
            'edit-main-preview',
            false
        );

        // Galería de imágenes
        setupDropzone(
            'edit-gallery-dropzone',
            'edit-galeria',
            'edit-gallery-preview',
            true
        );
    }

    /**
     * Configura una zona de drop para subida de imágenes
     * @param {string} dropzoneId - ID de la zona de drop
     * @param {string} inputId - ID del input de archivo
     * @param {string} previewId - ID del contenedor de previsualización
     * @param {boolean} isMultiple - Si acepta múltiples archivos
     */
    function setupDropzone(dropzoneId, inputId, previewId, isMultiple) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (!dropzone || !input || !preview) {
            console.warn(`⚠️ [DROPZONE] Elementos no encontrados: ${dropzoneId}, ${inputId}, ${previewId}`);
            return;
        }

        // Click para abrir selector de archivos
        dropzone.addEventListener('click', () => {
            input.click();
        });

        // Drag & Drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-blue-500', 'bg-blue-50');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-blue-500', 'bg-blue-50');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-blue-500', 'bg-blue-50');
            handleImageFiles(e.dataTransfer.files, preview, input, isMultiple);
        });

        // Cambio en el input de archivos
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                handleImageFiles(input.files, preview, input, isMultiple);
            }
        });
    }

    /**
     * Maneja los archivos de imagen seleccionados
     * @param {FileList} files - Archivos seleccionados
     * @param {HTMLElement} preview - Contenedor de previsualización
     * @param {HTMLInputElement} input - Input de archivo
     * @param {boolean} isMultiple - Si acepta múltiples archivos
     */
    function handleImageFiles(files, preview, input, isMultiple) {
        if (!files || files.length === 0) return;

        preview.innerHTML = '';
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxFiles = isMultiple ? 5 : 1;

        // Validar cantidad de archivos
        if (files.length > maxFiles) {
            showToast(`Máximo ${maxFiles} ${isMultiple ? 'imágenes' : 'imagen'} permitida${isMultiple ? 's' : ''}`, 'error');
            input.value = '';
            return;
        }

        let hasInvalidFiles = false;

        // Procesar cada archivo
        Array.from(files).forEach((file, index) => {
            // Validar tipo
            if (!allowedTypes.includes(file.type)) {
                console.warn(`⚠️ [IMAGEN] Tipo de archivo no válido: ${file.type}`);
                hasInvalidFiles = true;
                return;
            }

            // Validar tamaño
            if (file.size > maxSize) {
                console.warn(`⚠️ [IMAGEN] Archivo demasiado grande: ${file.size} bytes`);
                hasInvalidFiles = true;
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (!isMultiple) {
                    // Imagen principal - solo una
                    preview.innerHTML = `
                        <div class="relative inline-block">
                            <img src="${e.target.result}"
                                 alt="Preview"
                                 class="w-32 h-32 object-cover rounded-lg border shadow">

                            <button type="button"
                                    onclick="this.parentElement.remove(); document.getElementById('edit-imagen').value = '';"
                                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                } else {
                    // Galería - múltiples imágenes
                    const div = document.createElement('div');
                    div.className = 'relative inline-block mr-2 mb-2';

                    div.innerHTML = `
                        <img src="${e.target.result}"
                             alt="Preview ${index + 1}"
                             class="w-24 h-24 object-cover rounded-lg border shadow">

                        <button type="button"
                                onclick="this.parentElement.remove(); updateGalleryInput();"
                                class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    `;

                    preview.appendChild(div);
                }
            };
            reader.readAsDataURL(file);
        });

        if (hasInvalidFiles) {
            showToast('Algunas imágenes no son válidas. Solo se permiten JPG/PNG con máximo 2MB cada una', 'error');
            input.value = '';
            preview.innerHTML = '';
        }
    }

    /**
     * Actualiza el input de galería cuando se eliminan imágenes
     */
    window.updateGalleryInput = function() {
        const galleryPreview = document.getElementById('edit-gallery-preview');
        const galleryInput = document.getElementById('edit-galeria');

        if (!galleryPreview || !galleryInput) return;

        const images = galleryPreview.querySelectorAll('img');
        if (images.length === 0) {
            galleryInput.value = '';
            return;
        }

        // Crear un nuevo DataTransfer para simular la selección de archivos
        const dataTransfer = new DataTransfer();

        // En un escenario real, aquí necesitarías mantener una referencia a los File objetos originales
        // Para este ejemplo, solo limpiamos el input si no hay imágenes
        // En una implementación completa, deberías mantener los archivos en memoria

        // Como no podemos reconstruir los File objetos, simplemente limpiamos si no hay imágenes
        galleryInput.value = '';
    };

    // ============================================
    // DIALOGOS DE CONFIRMACIÓN
    // ============================================

    /**
     * Muestra un diálogo de confirmación
     * @param {Object} options - Opciones del diálogo
     * @returns {Promise<boolean>} Promesa que resuelve con true/false
     */
    window.showConfirmDialog = function({ title, message, confirmText, cancelText, type = 'warning' }) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

            const iconColor = type === 'danger' ? 'text-red-600' : 'text-yellow-600';
            const confirmButtonColor = type === 'danger' ?
                'bg-red-600 hover:bg-red-700' :
                'bg-yellow-600 hover:bg-yellow-700';

            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                    <div class="flex items-center mb-4">
                        <svg class="w-8 h-8 ${iconColor} mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                    </div>

                    <p class="text-gray-600 mb-6">${message}</p>

                    <div class="flex justify-end space-x-3">
                        <button id="cancel-btn"
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            ${cancelText}
                        </button>

                        <button id="confirm-btn"
                                class="px-4 py-2 text-white ${confirmButtonColor} rounded-lg">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const cancelBtn = modal.querySelector('#cancel-btn');
            const confirmBtn = modal.querySelector('#confirm-btn');

            cancelBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };

            confirmBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };

            // Cerrar con ESC
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleKeyDown);
                    resolve(false);
                }
            };

            document.addEventListener('keydown', handleKeyDown);
        });
    };

    // ============================================
    // VISUALIZACIÓN DE IMÁGENES
    // ============================================

    /**
     * Muestra una imagen ampliada en un modal
     * @param {string} src - URL de la imagen
     * @param {string} alt - Texto alternativo
     */
    window.showImageModal = function(src, alt) {
        // Verificar si ya existe un modal de imagen abierto
        const existingModal = document.querySelector('.image-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'image-modal fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';

        modal.innerHTML = `
            <div class="relative max-w-4xl max-h-full">
                <img src="${src}"
                     alt="${alt}"
                     class="max-w-full max-h-[80vh] object-contain rounded-lg">

                <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all"
                        onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Click fuera para cerrar
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Agregar al body
        document.body.appendChild(modal);

        // Enfocar el botón de cierre para mejor accesibilidad
        setTimeout(() => {
            const closeBtn = modal.querySelector('button');
            if (closeBtn) closeBtn.focus();
        }, 100);
    };

    // ============================================
    // NOTIFICACIONES Y UTILIDADES
    // ============================================

    /**
     * Muestra un toast de notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
    window.showToast = function(message, type = 'success') {
        // Verificar si ya existe un toast
        let toast = document.getElementById('service-toast');
        if (toast) {
            toast.remove();
        }

        // Crear nuevo toast
        toast = document.createElement('div');
        toast.id = 'service-toast';
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
    };

    /**
     * Obtiene el token CSRF
     * @returns {string} Token CSRF
     */
    function getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.content : '';
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    // Detectar si la UI de servicios está presente en esta vista
    const hasServicesUI = !!(grid || document.getElementById('servicio-form') || document.getElementById('services-grid') || document.querySelector('#servicios .grid'));

    if (hasServicesUI) {
        // Configurar eventos de cierre de modales
        setupModalCloseOnOutsideClick();

        // Configurar el formulario de edición solo si existe en el DOM
        if (document.getElementById('form-editar-servicio')) {
            setupEditForm();
        }

        // Cargar servicios al inicio
        loadMisServicios();
    } else {
        console.debug('ℹ️ [SERVICIOS] Módulo omitido: no hay contenedores de servicios en esta página.');
    }

    // Exponer funciones globales
    window.loadMisServicios = loadMisServicios;
    window.closeModal = closeModal;
    window.showImageModal = showImageModal;
    window.showConfirmDialog = showConfirmDialog;
    window.showToast = showToast;

    console.log('✅ [SERVICIOS] Módulo de Mis Servicios listo');
});
