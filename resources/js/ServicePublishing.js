import './config.js';
/**
 * ServicePublishing.js - Gestión completa de servicios con integración API
 * Adaptado para usar API_BASE_URL + API_PREFIX y Bearer token para emprendedor
 */

// Módulo de gestión de servicios
const ServiceManager = (function() {
    // Configuración privada
    const config = {
        // Base completa: http(s)://host + /api/v1 (o lo configurado)
        apiBaseUrl: ((window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1')).replace(/\/$/, ''),
        maxImageSize: 2 * 1024 * 1024, // 2MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'],
        maxGalleryImages: 5,
        minDescriptionLength: 10,
        maxPriceLimit: 999999999,
        phoneDigits: 10,
        debounceTime: 300
    };

    // Endpoints relativos configurables (el base ya incluye API_PREFIX)
    // Backend confirmado: apiResource('servicios', ServicioController::class)
    const EP_SERVICES = (window.API_REL_EP_SERVICES || '/servicios');
    const EP_SERVICES_FALLBACK = (window.API_REL_EP_SERVICES_FALLBACK || '/servicios');
    const EP_SERVICES_DETAIL_VARIANTS = [EP_SERVICES];

    async function _apiRequestWithFallback(primary, fallback, options = {}, preferFallback = false) {
        // Si ya detectamos que el primario no existe, usar directamente fallback
        if (preferFallback === true || window.__USE_SERVICES_FALLBACK === true) {
            return _apiRequest(fallback, options);
        }
        try {
            return await _apiRequest(primary, options);
        } catch (e1) {
            if (e1 && (/could not be found/i.test(e1.message || '') || e1.message?.includes('404'))) {
                window.__USE_SERVICES_FALLBACK = true;
            }
            console.debug('⚠️ [API] Intentando fallback de endpoint:', primary, '->', fallback, e1?.message);
            try {
                return await _apiRequest(fallback, options);
            } catch (e2) {
                throw e2;
            }
        }
    }

    // Estado privado
    let currentServices = [];
    let currentService = null;
    let isLoading = false;
    let lastLoadedServices = null;

    function _hasFiles(fd) {
        try {
            for (const [, v] of fd.entries()) {
                if (v instanceof File) return true;
            }
        } catch {}
        return false;
    }

    function _formDataToObject(fd, { dropFileFields = true } = {}) {
        const obj = {};
        const arrays = {};
        const isArrayKey = k => /\[\]$/.test(k);
        const baseKey = k => k.replace(/\[\]$/, '');
        for (const [k, v] of fd.entries()) {
            if (dropFileFields && (v instanceof File)) continue;
            if (isArrayKey(k)) {
                const b = baseKey(k);
                if (!arrays[b]) arrays[b] = [];
                arrays[b].push(v);
            } else {
                // primer valor gana si repetido
                if (!(k in obj)) obj[k] = v;
            }
        }
        return { ...obj, ...arrays };
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * Obtiene el token CSRF
     * @returns {string} Token CSRF
     */
    function _getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        if (!token) {
            console.error('❌ [CSRF] Token CSRF no encontrado');
            return '';
        }
        return token.content;
    }

    /**
     * Muestra una notificación tipo toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
    function _showToast(message, type = 'success') {
        let toast = document.getElementById('service-toast');

        // Si no existe, crear uno nuevo
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'service-toast';
            toast.style.position = 'fixed';
            toast.style.top = '32px';
            toast.style.right = '32px';
            toast.style.zIndex = '9999';
            toast.style.minWidth = '220px';
            toast.style.padding = '16px 24px';
            toast.style.borderRadius = '8px';
            toast.style.fontSize = '1rem';
            toast.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            toast.style.display = 'none';
            document.body.appendChild(toast);
        }

        // Configurar según el tipo
        toast.innerText = message;
        toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
        toast.style.color = '#fff';
        toast.style.opacity = '1';
        toast.style.display = 'block';

        // Animación de salida
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 400);
        }, 3000);
    }

    /**
     * Muestra errores de validación
     * @param {Array} errors - Lista de errores
     * @returns {boolean} True si no hay errores
     */
    function _showErrors(errors) {
        // Remover errores anteriores
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        if (errors.length > 0) {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';

            const errorTitle = document.createElement('h4');
            errorTitle.className = 'font-bold mb-2';
            errorTitle.textContent = 'Se encontraron los siguientes errores:';
            errorContainer.appendChild(errorTitle);

            const errorList = document.createElement('ul');
            errorList.className = 'list-disc list-inside space-y-1';

            errors.forEach(error => {
                const li = document.createElement('li');
                li.className = 'text-sm';
                li.textContent = error;
                errorList.appendChild(li);
            });

            errorContainer.appendChild(errorList);

            // Botón para copiar errores al portapapeles
            const copyButton = document.createElement('button');
            copyButton.type = 'button';
            copyButton.className = 'mt-2 text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded';
            copyButton.textContent = 'Copiar errores para soporte';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(errors.join('\n')).then(() => {
                    copyButton.textContent = 'Copiado!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copiar errores para soporte';
                    }, 2000);
                });
            };
            errorContainer.appendChild(copyButton);

            // Preferir el formulario del modal de edición si existe
            const editForm = document.getElementById('edit-service-form');
            const form = editForm || document.getElementById('servicio-form');
            if (form) {
                form.insertBefore(errorContainer, form.firstChild);
                form.scrollIntoView({ behavior: 'smooth' });
            } else {
                // fallback al cuerpo si no hay forms
                document.body.prepend(errorContainer);
            }

            return false;
        }
        return true;
    }

    /**
     * Muestra/oculta loading en un botón
     * @param {HTMLElement} button - Botón
     * @param {boolean} show - Mostrar u ocultar loading
     * @param {string} originalText - Texto original del botón
     */
    function _toggleButtonLoading(button, show, originalText) {
        if (!button) return;

        if (show) {
            button.disabled = true;
            button.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
            `;
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    /**
     * Realiza una petición a la API
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de la petición
     * @returns {Promise} Promesa con la respuesta
     */
    async function _apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin'
        };

        const mergedOptions = { ...defaultOptions, ...options };
        // Bearer token si existe
        try {
            const token = window.API_TOKEN || localStorage.getItem('API_TOKEN');
            if (token) {
                mergedOptions.headers = { ...(mergedOptions.headers || {}), Authorization: `Bearer ${token}` };
            }
        } catch {}

        // Agregar CSRF token para métodos de escritura si existe meta
        try {
            const method = (mergedOptions.method || 'GET').toUpperCase();
            if (method !== 'GET') {
                const meta = document.querySelector('meta[name="csrf-token"]');
                if (meta && meta.content) {
                    mergedOptions.headers = { ...(mergedOptions.headers || {}), 'X-CSRF-TOKEN': meta.content };
                }
            }
        } catch {}

        try {
            console.log(`📡 [API] ${mergedOptions.method} ${endpoint}`);

            let url = endpoint.startsWith('http') ? endpoint : `${config.apiBaseUrl}${endpoint}`;
            // Cache-busting para GET
            if ((mergedOptions.method || 'GET').toUpperCase() === 'GET') {
                const sep = url.includes('?') ? '&' : '?';
                url = `${url}${sep}_=${Date.now()}`;
            }
            const response = await fetch(url, mergedOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('❌ [API] Error en la petición:', error);
            throw error;
        }
    }

    /**
     * Valida un archivo de imagen
     * @param {File} file - Archivo a validar
     * @returns {boolean} True si el archivo es válido
     */
    function _validateImageFile(file) {
        if (!file) return false;
        if (!config.allowedImageTypes.includes(file.type)) {
            _showToast('Tipo de archivo no válido. Solo se permiten JPG/PNG/WebP/GIF.', 'error');
            return false;
        }
        if (file.size > config.maxImageSize) {
            _showToast(`Archivo demasiado grande. Máximo ${config.maxImageSize / (1024 * 1024)}MB.`, 'error');
            return false;
        }
        return true;
    }

    /**
     * Crea un elemento de imagen con previsualización
     * @param {File} file - Archivo de imagen
     * @param {number} index - Índice del archivo
     * @param {boolean} isMain - Si es la imagen principal
     * @returns {HTMLElement} Elemento de previsualización
     */
    function _createImagePreviewElement(file, index, isMain = false) {
        const container = document.createElement('div');
        container.className = 'relative group';
        container.setAttribute('data-file-index', index);

        const img = document.createElement('img');
        img.className = isMain ? 'w-full h-32 object-cover rounded-lg' : 'w-full h-24 object-cover rounded-lg';

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = () => {
            container.remove();
            if (isMain) {
                document.getElementById('service-main-image').value = '';
            }
        };

        container.appendChild(img);
        container.appendChild(deleteBtn);
        return container;
    }

    /**
     * Formatea un precio para mostrar
     * @param {number} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    function _formatPrice(price) {
        if (price === undefined || price === null) return 'Precio por consultar';
        return `Desde $${parseInt(price).toLocaleString()}`;
    }

    /**
     * Obtiene el nombre de una categoría
     * @param {string|object} category - Categoría
     * @returns {string} Nombre de la categoría
     */
    function _getCategoryName(category) {
        const categoryMap = {
            'tecnologia': 'Tecnología',
            'hogar': 'Hogar y Jardinería',
            'automotriz': 'Automotriz',
            'belleza': 'Belleza y Cuidado Personal',
            'educacion': 'Educación y Tutorías',
            'salud': 'Salud y Bienestar',
            'eventos': 'Eventos y Entretenimiento',
            'construccion': 'Construcción y Reformas',
            'transporte': 'Transporte y Logística',
            'profesionales': 'Servicios Profesionales',
            'otros': 'Otros'
        };

        if (typeof category === 'object' && category !== null) {
            return category.name || categoryMap[category.slug] || category.slug || 'Sin categoría';
        }
        return categoryMap[category] || category || 'Sin categoría';
    }

    /**
     * Crea un elemento de tarjeta de servicio
     * @param {Object} service - Datos del servicio
     * @returns {HTMLElement} Elemento de la tarjeta
     */
    function _createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'product-card bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow';

        const precioTexto = service.precio_base ? _formatPrice(service.precio_base) : 'Precio por consultar';
        const imagenSrc = service.imagen_principal || null;
        const categoria = _getCategoryName(service.categoria);

        card.innerHTML = `
            <div class="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                ${imagenSrc ?
                    `<img src="${imagenSrc.startsWith('http') ? imagenSrc : `/storage/${imagenSrc}`}"
                          alt="${service.nombre_servicio}"
                          class="w-full h-full object-cover"
                          onerror="this.src='https://via.placeholder.com/300x300/F77786/FFFFFF?text=Servicio'">` :
                    `<svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>`
                }
            </div>
            <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-gray-800 truncate">${service.nombre_servicio}</h3>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${categoria}</span>
                </div>
                <p class="text-gray-600 text-sm mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    ${service.direccion}
                </p>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${service.descripcion}</p>
                ${service.horario_atencion ?
                    `<p class="text-gray-500 text-xs mb-3">
                        <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${service.horario_atencion}
                    </p>` : ''
                }
                <div class="flex justify-between items-center">
                    <span class="text-primary font-bold">${precioTexto}</span>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium editar-servicio"
                                data-service-id="${service.id}">
                            Editar
                        </button>
                        <button class="text-red-600 hover:text-red-800 text-sm font-medium eliminar-servicio"
                                data-service-id="${service.id}">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Muestra el modal de galería de imágenes
     * @param {number} serviceId - ID del servicio
     * @param {number} startIdx - Índice inicial
     */
    function _showGalleryModal(serviceId, startIdx = 0) {
        // Buscar el servicio en la lista cargada
        const service = lastLoadedServices?.find(s => s.id === serviceId);
        if (!service || !service.galeria_imagenes || !service.galeria_imagenes.length) return;

        let currentIdx = startIdx;

        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
        modal.style.animation = 'fadeIn .2s';

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative">
                <button class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
                        onclick="document.body.removeChild(this.closest('.fixed'))">&times;</button>
                <div class="flex items-center justify-center mb-4">
                    <button id="gallery-prev" class="text-2xl px-2 py-1 text-gray-400 hover:text-primary">&#8592;</button>
                    <img id="gallery-img" src="${service.galeria_imagenes[currentIdx]}"
                         alt="Galería" class="max-h-80 rounded shadow mx-4">
                    <button id="gallery-next" class="text-2xl px-2 py-1 text-gray-400 hover:text-primary">&#8594;</button>
                </div>
                <div class="flex justify-center space-x-2">
                    ${service.galeria_imagenes.map((img, idx) =>
                        `<img src="${img}" alt="Miniatura"
                             class="w-10 h-10 object-cover rounded border ${idx === currentIdx ? 'border-primary' : 'border-gray-200'} cursor-pointer"
                             data-idx="${idx}">`
                    ).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Funcionalidad del slider
        const updateImg = (idx) => {
            currentIdx = idx;
            modal.querySelector('#gallery-img').src = service.galeria_imagenes[currentIdx];
            modal.querySelectorAll('img[data-idx]').forEach((thumb, i) => {
                thumb.classList.toggle('border-primary', i === currentIdx);
                thumb.classList.toggle('border-gray-200', i !== currentIdx);
            });
        };

        modal.querySelector('#gallery-prev').onclick = () => {
            if (currentIdx > 0) updateImg(currentIdx - 1);
        };

        modal.querySelector('#gallery-next').onclick = () => {
            if (currentIdx < service.galeria_imagenes.length - 1) updateImg(currentIdx + 1);
        };

        modal.querySelectorAll('img[data-idx]').forEach(thumb => {
            thumb.onclick = () => updateImg(Number(thumb.dataset.idx));
        });
    }

    /**
     * Muestra errores en la vista de servicios
     * @param {string} message - Mensaje de error
     */
    function _showServicesError(message) {
        const serviciosContainer = document.querySelector('#servicios .grid');
        if (serviciosContainer) {
            serviciosContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <p class="text-gray-500 mb-4">${message}</p>
                    <button class="btn-primary text-white px-4 py-2 rounded-lg" onclick="ServiceManager.loadServicios()">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    /**
     * Muestra loading mientras carga datos para editar
     */
    function _showEditLoading() {
        // Crear un modal simple de loading
        const loadingModal = document.createElement('div');
        loadingModal.id = 'edit-loading-modal';
        loadingModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        loadingModal.innerHTML = `
            <div class="bg-white rounded-lg p-6 text-center">
                <svg class="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600">Cargando datos del servicio...</p>
            </div>
        `;

        document.body.appendChild(loadingModal);
    }

    /**
     * Crea un FormData a partir del formulario
     * @param {HTMLElement} form - Formulario
     * @returns {FormData} FormData con los datos
     */
    function _buildFormData(form) {
        const formData = new FormData(form);

        // Asegurar que el precio sea un número válido
        const priceInput = form.querySelector('input[name="precio_base"]');
        if (priceInput && priceInput.value) {
            formData.set('precio_base', priceInput.value);
        }

        // Asegurar que el horario de atención esté incluido
        const scheduleInput = form.querySelector('input[placeholder*="Lun-Vie"]');
        if (scheduleInput && scheduleInput.value) {
            formData.set('horario_atencion', scheduleInput.value);
        }

        return formData;
    }

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================

    return {
        /**
         * Aplica un mapeo de campos configurable desde localStorage
         * Clave: SERVICE_UPDATE_FIELD_MAP => { fromKey: toKey, ..., _removeOriginal?: boolean }
         * @param {FormData} fd
         */
        _applyFieldMap(fd) {
            if (!fd) return fd;
            try {
                const raw = localStorage.getItem('SERVICE_UPDATE_FIELD_MAP');
                if (!raw) return fd;
                const map = JSON.parse(raw);
                const removeOriginal = !!map._removeOriginal;
                Object.entries(map).forEach(([from, to]) => {
                    if (from === '_removeOriginal') return;
                    if (typeof to !== 'string' || !to) return;
                    if (fd.has(from) && !fd.has(to)) {
                        fd.append(to, fd.get(from));
                    }
                    if (removeOriginal && fd.has(from)) {
                        // No hay API para eliminar entradas específicas de FormData; recreamos
                    }
                });
                if (removeOriginal) {
                    const next = new FormData();
                    for (const [k, v] of fd.entries()) {
                        if (map[k] === undefined) next.append(k, v);
                    }
                    return next;
                }
            } catch (e) {
                console.warn('⚠️ [SERVICES] No se pudo aplicar SERVICE_UPDATE_FIELD_MAP:', e?.message || e);
            }
            return fd;
        },
        /**
         * Agrega alias/espejos de campos para compatibilidad con distintos backends
         * (es/en y variantes). No elimina los originales, solo añade si faltan.
         * @param {FormData} fd
         */
        _augmentServiceFormData(fd) {
            if (!fd) return fd;
            try {
                const pairs = [
                    ['nombre_servicio', 'nombre'],
                    ['nombre_servicio', 'name'],
                    ['categoria', 'category'],
                    ['categoria', 'category_id'],
                    ['descripcion', 'description'],
                    ['direccion', 'address'],
                    ['telefono', 'phone'],
                    ['precio_base', 'price'],
                    ['precio_base', 'precio'],
                    ['horario_atencion', 'schedule'],
                    ['horario_atencion', 'horario']
                ];
                pairs.forEach(([src, dst]) => {
                    if (fd.has(src) && !fd.has(dst)) fd.append(dst, fd.get(src));
                });

                // Imágenes
                const main = fd.get('imagen_principal');
                if (main instanceof File) {
                    if (!fd.has('main_image')) fd.append('main_image', main);
                    if (!fd.has('imagen')) fd.append('imagen', main);
                }
                const galeria = fd.getAll('galeria_imagenes[]');
                if (galeria && galeria.length) {
                    galeria.forEach(f => {
                        if (f instanceof File) fd.append('gallery_images[]', f);
                    });
                }
            } catch (e) {
                console.warn('⚠️ [SERVICES] No se pudieron agregar alias de compatibilidad:', e?.message || e);
            }
            return fd;
        },
        /**
         * Inicializa el manager de servicios
         */
        init: function() {
            console.log('🛠️ [SERVICES] Inicializando ServiceManager');

            // Configurar subida de imágenes
            this.setupImageUpload('service-main-dropzone', 'service-main-image', 'service-main-preview');
            this.setupImageUpload('service-gallery-dropzone', 'service-gallery-images', 'service-gallery-preview');

            // Cargar servicios al inicio
            this.loadServicios();

            // Configurar manejador del formulario
            this.setupFormHandler();

            // Configurar eventos globales
            this.setupGlobalEvents();

            console.log('✅ [SERVICES] ServiceManager inicializado correctamente');
        },

        /**
         * Muestra errores de validación de forma pública
         * @param {Array<string>} errors
         * @returns {boolean} true si no hay errores
         */
        showErrors: function(errors) {
            return _showErrors(errors || []);
        },

        /**
         * Configura la funcionalidad de subida de imágenes
         * @param {string} dropzoneId - ID de la zona de drop
         * @param {string} inputId - ID del input de archivo
         * @param {string} previewId - ID del contenedor de previsualización
         */
        setupImageUpload: function(dropzoneId, inputId, previewId) {
            const dropzone = document.getElementById(dropzoneId);
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);

            if (!dropzone || !input || !preview) {
                console.warn(`⚠️ [UPLOAD] Elementos no encontrados: ${dropzoneId}, ${inputId}, ${previewId}`);
                return;
            }

            console.log(`🖼️ [UPLOAD] Configurando zona de subida ${dropzoneId}`);

            // Click para abrir selector de archivos
            dropzone.addEventListener('click', (e) => {
                // Evitar que el botón dispare dos veces
                if (e.target.tagName === 'BUTTON') return;
                input.click();
            });

            // Drag & Drop
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-over');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('drag-over');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                this.handleFiles(files, preview, inputId);
            });

            // Cambio en el input de archivos
            input.addEventListener('change', (e) => {
                this.handleFiles(e.target.files, preview, inputId);
            });
        },

        /**
         * Expone el modal de galería de imágenes públicamente
         */
        showGalleryModal: function(serviceId, startIdx = 0) {
            return _showGalleryModal(serviceId, startIdx);
        },

        /**
         * Maneja archivos de imagen seleccionados
         * @param {FileList} files - Archivos seleccionados
         * @param {HTMLElement} preview - Contenedor de previsualización
         * @param {string} inputId - ID del input de archivo
         */
        handleFiles: function(files, preview, inputId) {
            const input = document.getElementById(inputId);
            preview.innerHTML = '';

            // Configuración para la galería
            const isGallery = inputId === 'service-gallery-images';
            const maxFiles = isGallery ? config.maxGalleryImages : 1;

            if (files.length > maxFiles) {
                _showToast(`Solo puedes subir hasta ${maxFiles} ${isGallery ? 'imágenes' : 'imagen'}.`, 'error');
                input.value = '';
                return;
            }

            let validFiles = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!_validateImageFile(file)) {
                    continue;
                }
                validFiles.push(file);
            }

            if (validFiles.length === 0) {
                input.value = '';
                return;
            }

            validFiles.forEach((file, idx) => {
                const previewElement = _createImagePreviewElement(file, idx, !isGallery);
                preview.appendChild(previewElement);
            });
        },

        /**
         * Valida el formulario de servicio
         * @param {FormData} formData - Datos del formulario
         * @returns {Array} Lista de errores
         */
        validateServiceForm: function(formData) {
            const errors = [];

            // Validar nombre del servicio
            if (!formData.get('nombre_servicio')) {
                errors.push('El nombre del servicio es obligatorio');
            }

            // Validar categoría
            if (!formData.get('categoria')) {
                errors.push('La categoría es obligatoria');
            }

            // Validar descripción
            const descripcion = formData.get('descripcion');
            if (!descripcion) {
                errors.push('La descripción es obligatoria');
            } else if (descripcion.length < config.minDescriptionLength) {
                errors.push(`La descripción debe tener al menos ${config.minDescriptionLength} caracteres.`);
            }

            // Validar dirección
            if (!formData.get('direccion')) {
                errors.push('La dirección es obligatoria');
            }

            // Validar teléfono
            const telefono = formData.get('telefono');
            if (!telefono) {
                errors.push('El teléfono es obligatorio');
            } else {
                // Solo dígitos
                const phoneDigits = telefono.replace(/\D/g, '');
                if (phoneDigits.length !== config.phoneDigits) {
                    errors.push(`El teléfono debe tener exactamente ${config.phoneDigits} dígitos.`);
                }
            }

            // Validar precio_base
            const precio = formData.get('precio_base');
            if (precio) {
                const precioNum = Number(precio);
                if (isNaN(precioNum) || precioNum <= 0 || precioNum > config.maxPriceLimit) {
                    errors.push(`Por favor ingresa un precio válido y que no sea mayor a ${config.maxPriceLimit}`);
                }
            }

            return errors;
        },

        /**
         * Carga servicios desde el servidor
         */
        async loadServicios() {
            // Definir elementos fuera del try para que existan en finally
            const loadingElement = document.getElementById('servicios-loading');
            const serviciosContainer = document.querySelector('#servicios .grid');
            try {
                console.log('🔄 [SERVICES] Cargando servicios desde API');

                if (loadingElement) loadingElement.classList.remove('hidden');
                if (serviciosContainer) serviciosContainer.innerHTML = '';

                // Usar fallback automático cuando /entrepreneur/services no exista
                const response = await _apiRequestWithFallback(EP_SERVICES, EP_SERVICES_FALLBACK, {
                    method: 'GET'
                }, window.__USE_SERVICES_FALLBACK === true);

                // Normalizar respuesta
                let items = [];
                if (Array.isArray(response)) items = response;
                else if (response && Array.isArray(response.data)) items = response.data;
                else if (response && Array.isArray(response.services)) items = response.services;
                else if (response && response.service) items = [response.service];

                currentServices = items;
                lastLoadedServices = [...currentServices];
                console.log(`✅ [SERVICES] ${currentServices.length} servicios cargados`);

                // Mostrar servicios
                this.displayServicios(currentServices);

                // Si existe la función global para recargar 'Mis Servicios', llamarla
                if (window.loadMisServicios) {
                    window.loadMisServicios();
                }

            } catch (error) {
                console.error('❌ [SERVICES] Error al cargar servicios:', error);
                _showServicesError(error.message || 'Error de conexión al cargar servicios');
            } finally {
                if (loadingElement) loadingElement.classList.add('hidden');
            }
        },

        /**
         * Muestra servicios en la vista
         * @param {Array} servicios - Lista de servicios
         */
        displayServicios: function(servicios) {
            const serviciosContainer = document.getElementById('services-grid') || document.querySelector('#servicios .grid');

            if (!serviciosContainer) {
                // No emitir warning ruidoso en vistas que no tienen esta sección
                console.debug('ℹ️ [SERVICES] No hay contenedor de servicios en esta vista.');
                return;
            }

            // Limpiar contenido anterior
            serviciosContainer.innerHTML = '';

            if (servicios.length === 0) {
                serviciosContainer.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <h3 class="text-xl font-medium text-gray-900 mb-2">No tienes servicios publicados</h3>
                        <p class="text-gray-500 mb-6">Comienza publicando tu primer servicio</p>
                        <button class="btn-primary text-white px-6 py-2 rounded-lg" onclick="showSection('publicar-servicio')">
                            Publicar mi primer servicio
                        </button>
                    </div>
                `;
                return;
            }

            // Crear cards para cada servicio
            servicios.forEach(service => {
                const serviceCard = _createServiceCard(service);
                serviciosContainer.appendChild(serviceCard);
            });
        },

        /**
         * Guarda un servicio en el servidor
         * @param {FormData} formData - Datos del formulario
         * @returns {Promise} Promesa con el resultado
         */
        async saveService(formData) {
            try {
                console.log('📤 [SERVICES] Guardando servicio');

                // Log para debugging
                console.log('Datos que se envían:');
                for (let [key, value] of formData.entries()) {
                    if (value instanceof File) {
                        console.log(`${key}: [Archivo] ${value.name} (${value.size} bytes)`);
                    } else {
                        console.log(`${key}: ${value}`);
                    }
                }

                // Asegurar entrepreneur_id si el backend lo requiere o para trazabilidad
                try {
                    if (!formData.has('entrepreneur_id')) {
                        // Reutilizar endpoint de perfil de emprendedor definido en config
                        const mePath = window.API_EP_ME || `${(window.API_PREFIX || '/api/v1')}/entrepreneur/me`;
                        const base = (window.API_BASE_URL || '').replace(/\/$/, '');
                        const url = `${base}${mePath.startsWith('/') ? mePath : `/${mePath}`}`;
                        const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
                        try {
                            const token = window.API_TOKEN || localStorage.getItem('API_TOKEN');
                            if (token) headers['Authorization'] = `Bearer ${token}`;
                        } catch {}
                        const res = await fetch(url, { method: 'GET', headers, credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                        if (res.ok) {
                            const data = await res.json().catch(() => ({}));
                            const payload = data?.data || data?.user || data?.entrepreneur || data;
                            const eid = payload?.id || payload?.entrepreneur_id || null;
                            if (eid != null) {
                                formData.append('entrepreneur_id', eid);
                                // Alias en español por si el backend lo espera
                                if (!formData.has('emprendedor_id')) formData.append('emprendedor_id', eid);
                                console.log('🔑 [SERVICES] Adjuntado entrepreneur_id:', eid);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ [SERVICES] No se pudo adjuntar entrepreneur_id automáticamente:', e?.message || e);
                }

                // Aumentar compatibilidad de nombres de campos antes de enviar
                this._augmentServiceFormData(formData);

                const response = await _apiRequestWithFallback(EP_SERVICES, EP_SERVICES_FALLBACK, {
                    method: 'POST',
                    body: formData
                });

                if (!response.success) {
                    throw new Error(response.message || 'Error al guardar el servicio');
                }

                // Guardar asociación local: este emprendedor creó este servicio
                try {
                    const eid = formData.get('entrepreneur_id') || localStorage.getItem('ENTREPRENEUR_ID') || null;
                    const srv = response.data?.service || response.data || response.service || null;
                    const sid = (srv && (srv.id ?? srv.service_id)) || null;
                    if (eid && sid) {
                        const key = `MY_SERVICE_IDS:${eid}`;
                        let ids = [];
                        try { ids = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
                        ids = Array.isArray(ids) ? ids : [];
                        if (!ids.includes(sid)) {
                            ids.push(sid);
                            localStorage.setItem(key, JSON.stringify(ids));
                            console.log(`🧩 [SERVICES] Asociado servicio ${sid} a emprendedor ${eid} (local cache)`);
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ [SERVICES] No se pudo guardar asociación local de servicio:', e?.message || e);
                }

                return {
                    success: response?.success !== false,
                    data: response?.data || response?.service || response,
                    message: response?.message || 'Servicio guardado exitosamente'
                };

            } catch (error) {
                console.error('❌ [SERVICES] Error al guardar servicio:', error);
                return {
                    success: false,
                    errors: [error.message],
                    message: 'Error al guardar el servicio'
                };
            }
        },

        /**
         * Elimina un servicio
         * @param {number} id - ID del servicio
         */
        async eliminarServicio(id) {
            try {
                console.log(`🗑️ [SERVICES] Solicitando eliminación del servicio ${id}`);

                // Mostrar diálogo de confirmación
                const confirmed = await this.showConfirmDialog({
                    title: 'Eliminar Servicio',
                    message: '¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer y se eliminarán todas las imágenes asociadas.',
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'danger'
                });

                if (!confirmed) {
                    console.log('⚠️ [SERVICES] Eliminación cancelada por el usuario');
                    return;
                }

                // Mostrar loading en los botones de eliminar
                const deleteButtons = document.querySelectorAll(`button[data-service-id="${id}"]`);
                deleteButtons.forEach(btn => {
                    _toggleButtonLoading(btn, true, 'Eliminando...');
                });

                let delOk = false, lastErr = '';
                try {
                    const response = await _apiRequestWithFallback(`${EP_SERVICES}/${id}`, `${EP_SERVICES_FALLBACK}/${id}`, { method: 'DELETE' });
                    delOk = response?.success !== false;
                } catch (e) {
                    lastErr = e?.message || String(e);
                }
                if (!delOk) {
                    // Try detail variants in case fallback route is different language
                    for (const v of EP_SERVICES_DETAIL_VARIANTS) {
                        try {
                            const resp = await _apiRequest(`${v}/${id}`, { method: 'DELETE' });
                            delOk = true; break;
                        } catch (e) { lastErr = e?.message || String(e); }
                    }
                }

                if (!delOk) {
                    throw new Error(lastErr || 'Error al eliminar el servicio');
                }

                _showToast('Servicio eliminado correctamente', 'success');
                this.loadServicios();

            } catch (error) {
                console.error('❌ [SERVICES] Error al eliminar servicio:', error);
                _showToast(error.message || 'Error al eliminar el servicio', 'error');
            } finally {
                // Restaurar botones
                const deleteButtons = document.querySelectorAll(`button[data-service-id="${id}"]`);
                deleteButtons.forEach(btn => {
                    _toggleButtonLoading(btn, false, 'Eliminar');
                });
            }
        },

        /**
         * Edita un servicio - Abre modal de edición
         * @param {number} id - ID del servicio
         */
        async editarServicio(id) {
            try {
                console.log(`📝 [SERVICES] Cargando servicio ${id} para edición`);

                // Mostrar loading mientras carga los datos
                _showEditLoading();

                const serviceData = await this.getServicioById(id);

                if (serviceData.success) {
                    this.showEditModal(serviceData.data);
                } else {
                    // Fallback: si tenemos lista cargada en el manager, intenta encontrar ahí
                    const alt = Array.isArray(currentServices) ? currentServices.find(s => String(s.id) === String(id)) : null;
                    if (alt) {
                        this.showEditModal(alt);
                    } else {
                        _showToast(serviceData.message || 'Error al cargar los datos del servicio', 'error');
                    }
                }

            } catch (error) {
                console.error('❌ [SERVICES] Error al cargar servicio para editar:', error);
                _showToast(error.message || 'Error de conexión al cargar el servicio', 'error');
            }
        },

        /**
         * Obtiene datos de un servicio específico
         * @param {number} id - ID del servicio
         * @returns {Promise} Promesa con los datos del servicio
         */
        async getServicioById(id) {
            try {
                // Try both main and fallback; then try language variants
                try {
                    const response = await _apiRequestWithFallback(`${EP_SERVICES}/${id}`, `${EP_SERVICES_FALLBACK}/${id}`);
                    return { success: true, data: response.data || response.service || response };
                } catch (e1) {
                    // Si el detalle devuelve 403 (No autorizado), intentar vía listado del usuario y tomar por ID
                    const msg = (e1?.message || '').toLowerCase();
                    if (msg.includes('no autorizado') || msg.includes('403')) {
                        try {
                            const list = await _apiRequest(EP_SERVICES, { method: 'GET' });
                            const items = Array.isArray(list) ? list : (list?.data || list?.services || list?.servicios || []);
                            if (Array.isArray(items)) {
                                const found = items.find(s => String(s.id) === String(id));
                                if (found) return { success: true, data: found };
                            }
                        } catch {}
                    }
                    for (const v of EP_SERVICES_DETAIL_VARIANTS) {
                        try {
                            const r = await _apiRequest(`${v}/${id}`, { method: 'GET' });
                            return { success: true, data: r.data || r.service || r };
                        } catch (e2) {}
                    }
                    throw e1;
                }

            } catch (error) {
                console.error('❌ [SERVICES] Error en getServicioById:', error);
                return {
                    success: false,
                    message: error.message || 'Error de conexión'
                };
            }
        },

        /**
         * Muestra el modal de edición con los datos del servicio
         * @param {Object} service - Datos del servicio
         */
        showEditModal: function(service) {
            // Remover modal de loading si existe
            const loadingModal = document.getElementById('edit-loading-modal');
            if (loadingModal) {
                document.body.removeChild(loadingModal);
            }

            // Crear modal de edición
            const editModal = document.createElement('div');
            editModal.id = 'edit-service-modal';
            editModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

            editModal.innerHTML = `
                <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <h2 class="text-xl font-bold text-gray-800">Editar Servicio</h2>
                        <button id="close-edit-modal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    <form id="edit-service-form" class="p-6">
                        <input type="hidden" id="edit-service-id" value="${service.id}">

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Columna izquierda: Información básica -->
                            <div class="space-y-4">
                                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Información Básica</h3>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio *</label>
                                    <input type="text" id="edit-nombre-servicio" value="${service.nombre_servicio || ''}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="Ej: Reparación de celulares" required>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                                    <select id="edit-categoria" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                                        <option value="">Seleccionar categoría</option>
                                        <option value="tecnologia" ${service.categoria === 'tecnologia' ? 'selected' : ''}>Tecnología</option>
                                        <option value="hogar" ${service.categoria === 'hogar' ? 'selected' : ''}>Hogar y Jardinería</option>
                                        <option value="automotriz" ${service.categoria === 'automotriz' ? 'selected' : ''}>Automotriz</option>
                                        <option value="belleza" ${service.categoria === 'belleza' ? 'selected' : ''}>Belleza y Cuidado Personal</option>
                                        <option value="educacion" ${service.categoria === 'educacion' ? 'selected' : ''}>Educación y Tutorías</option>
                                        <option value="salud" ${service.categoria === 'salud' ? 'selected' : ''}>Salud y Bienestar</option>
                                        <option value="eventos" ${service.categoria === 'eventos' ? 'selected' : ''}>Eventos y Entretenimiento</option>
                                        <option value="construccion" ${service.categoria === 'construccion' ? 'selected' : ''}>Construcción y Reformas</option>
                                        <option value="transporte" ${service.categoria === 'transporte' ? 'selected' : ''}>Transporte y Logística</option>
                                        <option value="profesionales" ${service.categoria === 'profesionales' ? 'selected' : ''}>Servicios Profesionales</option>
                                        <option value="otros" ${service.categoria === 'otros' ? 'selected' : ''}>Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                                    <textarea id="edit-descripcion" rows="4"
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                              placeholder="Describe tu servicio en detalle..." required>${service.descripcion || ''}</textarea>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio Base</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" id="edit-precio-base" value="${service.precio_base || ''}"
                                               class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                               placeholder="0" min="0" step="1000">
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">Precio base o desde. Déjalo vacío si prefieres "Precio por consultar"</p>
                                </div>
                            </div>

                            <!-- Columna derecha: Información de contacto -->
                            <div class="space-y-4">
                                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Información de Contacto</h3>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                                    <input type="text" id="edit-direccion" value="${service.direccion || ''}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="Dirección completa donde ofreces el servicio" required>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                                    <input type="tel" id="edit-telefono" value="${service.telefono || ''}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="Ej: +57 300 123 4567" required>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Horario de Atención</label>
                                    <input type="text" id="edit-horario-atencion" value="${service.horario_atencion || ''}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                           placeholder="Ej: Lun-Vie 8:00-17:00, Sáb 9:00-12:00">
                                </div>

                                <!-- Imágenes actuales -->
                                <div>
                                    <h4 class="text-md font-medium text-gray-700 mb-2">Imágenes Actuales</h4>
                                    <div id="edit-current-images" class="grid grid-cols-2 gap-2">
                                        ${this.renderCurrentImages(service)}
                                    </div>
                                </div>

                                <!-- Nueva imagen principal -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Imagen Principal</label>
                                    <div id="edit-main-dropzone" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                        </svg>
                                        <p class="text-sm text-gray-500">Click o arrastra para cambiar imagen principal</p>
                                    </div>
                                    <input type="file" id="edit-main-image" accept="image/*" class="hidden">
                                    <div id="edit-main-preview" class="mt-2 grid grid-cols-1 gap-2"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de acción -->
                        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                            <button type="button" id="cancel-edit" class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Actualizar Servicio
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(editModal);

            // Configurar eventos del modal
            this.setupEditModalEvents(editModal, service);
        },

        /**
         * Renderiza las imágenes actuales del servicio
         * @param {Object} service - Datos del servicio
         * @returns {string} HTML de las imágenes
         */
        renderCurrentImages: function(service) {
            let imagesHtml = '';
            const apiHost = (window.API_BASE_URL || '').replace(/\/$/, '');
            const resolveImg = (p) => {
                if (!p) return '';
                if (typeof p === 'string' && p.startsWith('http')) return p;
                const rel = String(p).replace(/^\/+/, '');
                const path = rel.startsWith('storage/') ? rel : `storage/${rel.replace(/^storage\//,'')}`;
                return `${apiHost}/${path}`;
            };

            // Imagen principal
            if (service.imagen_principal) {
                imagesHtml += `
                    <div class="relative group">
                        <img src="${resolveImg(service.imagen_principal)}"
                             alt="Imagen principal"
                             class="w-full h-20 object-cover rounded">
                        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <span class="text-white text-xs">Principal</span>
                        </div>
                    </div>
                `;
            }

            // Galería de imágenes
            if (service.galeria_imagenes && service.galeria_imagenes.length > 0) {
                service.galeria_imagenes.forEach((imagen, index) => {
                    imagesHtml += `
                        <div class="relative group">
                            <img src="${resolveImg(imagen)}"
                                 alt="Imagen ${index + 1}"
                                 class="w-full h-20 object-cover rounded">
                            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <span class="text-white text-xs">Galería ${index + 1}</span>
                            </div>
                        </div>
                    `;
                });
            }

            if (!imagesHtml) {
                imagesHtml = '<p class="text-gray-400 text-sm col-span-2 text-center py-4">No hay imágenes</p>';
            }

            return imagesHtml;
        },

        /**
         * Configura eventos del modal de edición
         * @param {HTMLElement} modal - Elemento del modal
         * @param {Object} service - Datos del servicio
         */
        setupEditModalEvents: function(modal, service) {
            // Cerrar modal
            const closeBtn = modal.querySelector('#close-edit-modal');
            const cancelBtn = modal.querySelector('#cancel-edit');

            const closeModal = () => {
                document.body.removeChild(modal);
            };

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

            // Cerrar con ESC
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            document.addEventListener('keydown', handleKeyDown);

            // Configurar drag & drop para imágenes
            this.setupImageUpload('edit-main-dropzone', 'edit-main-image', 'edit-main-preview');

            // Manejar envío del formulario
            const form = modal.querySelector('#edit-service-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.updateServicio(service.id, closeModal);
                });
            }
        },

        /**
         * Actualiza un servicio en el servidor
         * @param {number} id - ID del servicio
         * @param {Function} closeModalCallback - Función para cerrar el modal
         */
        async updateServicio(id, closeModalCallback) {
            const form = document.getElementById('edit-service-form');
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            if (form.dataset.submitting === 'true') {
                console.warn('⚠️ [SERVICES] Envío ignorado: ya hay una solicitud en curso');
                return;
            }
            form.dataset.submitting = 'true';

            // Crear FormData
            const formData = new FormData();

            // Datos básicos
            formData.append('nombre_servicio', document.getElementById('edit-nombre-servicio').value);
            const categoriaVal = document.getElementById('edit-categoria').value;
            formData.append('categoria', categoriaVal);
            formData.append('descripcion', document.getElementById('edit-descripcion').value);
            formData.append('direccion', document.getElementById('edit-direccion').value);
            formData.append('telefono', document.getElementById('edit-telefono').value);

            // Si la categoría parece un ID numérico, enviar también category_id para mayor compatibilidad
            if (categoriaVal && /^\d+$/.test(String(categoriaVal))) {
                formData.append('category_id', String(categoriaVal));
            }

            // Datos opcionales
            const precioBase = document.getElementById('edit-precio-base').value;
            if (precioBase) {
                formData.append('precio_base', precioBase);
            }

            const horarioAtencion = document.getElementById('edit-horario-atencion').value;
            if (horarioAtencion) {
                formData.append('horario_atencion', horarioAtencion);
            }

            // Nueva imagen principal si se seleccionó
            const mainImageInput = document.getElementById('edit-main-image');
            if (mainImageInput.files[0]) {
                formData.append('imagen_principal', mainImageInput.files[0]);
            }

            // Método HTTP para Laravel (PUT/PATCH via POST)
            formData.append('_method', 'PUT');

            // Algunos backends requieren el id en el cuerpo
            if (!formData.has('id')) {
                formData.append('id', String(id));
            }

            // Adjuntar entrepreneur_id y user_id para backend que lo exige
            try {
                if (!formData.has('entrepreneur_id')) {
                    const mePath = window.API_EP_ME || `${(window.API_PREFIX || '/api/v1')}/entrepreneur/me`;
                    const base = (window.API_BASE_URL || '').replace(/\/$/, '');
                    const url = `${base}${mePath.startsWith('/') ? mePath : `/${mePath}`}`;
                    const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
                    try { const token = window.API_TOKEN || localStorage.getItem('API_TOKEN'); if (token) headers['Authorization'] = `Bearer ${token}`; } catch {}
                    const res = await fetch(url, { method: 'GET', headers, credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                    if (res.ok) {
                        const data = await res.json().catch(() => ({}));
                        const payload = data?.data || data?.user || data?.entrepreneur || data;
                        const eid = payload?.id || payload?.entrepreneur_id || null;
                        if (eid != null) {
                            formData.append('entrepreneur_id', eid);
                            if (!formData.has('emprendedor_id')) formData.append('emprendedor_id', eid);
                            if (!formData.has('user_id')) formData.append('user_id', eid);
                        }
                    }
                }
            } catch {}

            // Aumentar compatibilidad de nombres de campos antes de enviar
            this._augmentServiceFormData(formData);
            // Aplicar mapeo manual si el backend usa nombres distintos
            const mapped = this._applyFieldMap(formData);

            // Reducir a claves esperadas por backend (ES) para evitar rechazo por nombres desconocidos
            // Permitir override por localStorage: SERVICE_UPDATE_ALLOWED_KEYS (JSON array)
            let allowedList = [
                // Español
                'nombre_servicio','categoria','descripcion','direccion','telefono','precio_base','horario_atencion',
                'imagen_principal','galeria_imagenes[]','_method','entrepreneur_id','emprendedor_id','user_id','id',
                // Inglés / alias comunes
                'name','category','category_id','description','address','phone','price','schedule','imagen','main_image','gallery_images[]','horario'
            ];
            try {
                const override = localStorage.getItem('SERVICE_UPDATE_ALLOWED_KEYS');
                if (override) {
                    const arr = JSON.parse(override);
                    if (Array.isArray(arr) && arr.length) allowedList = arr.concat(allowedList);
                }
            } catch {}
            const allowedKeys = new Set(allowedList);
            const fdSend = new FormData();
            for (const [k, v] of mapped.entries()) {
                if (allowedKeys.has(k)) {
                    fdSend.append(k, v);
                }
            }
            console.debug('🧾 [SERVICES] Payload update (depurado):', Array.from(fdSend.keys()));

            // Validar datos básicos
            const errors = this.validateServiceForm(formData);
            if (errors.length > 0) {
                this.showErrors(errors);
                return;
            }

            // Mostrar loading
            _toggleButtonLoading(submitButton, true, originalButtonText);

            try {
                console.log(`📤 [SERVICES] Actualizando servicio ${id}`);

                // Capturar valores esperados para verificación
                const expected = {
                    nombre_servicio: formData.get('nombre_servicio') || '',
                    categoria: formData.get('categoria') || '',
                    descripcion: formData.get('descripcion') || '',
                    direccion: formData.get('direccion') || '',
                    telefono: formData.get('telefono') || '',
                    precio_base: formData.get('precio_base') || '',
                    horario_atencion: formData.get('horario_atencion') || ''
                };

                let updated = false, lastErr = '';

                // 0) Configurable override vía localStorage
                try {
                    const raw = localStorage.getItem('SERVICE_UPDATE_OVERRIDE');
                    if (raw) {
                        const cfg = JSON.parse(raw);
                        const method = (cfg.method || 'POST').toUpperCase();
                        const endpointTpl = cfg.endpoint || `${EP_SERVICES_FALLBACK}/${id}`;
                        const endpoint = endpointTpl.replace(':id', String(id));
                        const bodyType = cfg.bodyType || 'form'; // 'form' | 'json'
                        let body, headers = {};
                        if (bodyType === 'json' && !_hasFiles(fdSend)) {
                            body = JSON.stringify(_formDataToObject(fdSend));
                            headers['Content-Type'] = 'application/json';
                        } else {
                            body = fdSend;
                        }
                        const resp = await _apiRequest(endpoint, { method, body, headers });
                        updated = (resp?.success === true) || !!(resp?.data || resp?.service);
                        if (!updated && (resp && (resp.message || resp.error))) {
                            lastErr = resp.message || resp.error;
                        }
                    }
                } catch (e) {
                    lastErr = e?.message || String(e);
                }
                
                try {
                    if (!updated) {
                        const response = await _apiRequestWithFallback(`${EP_SERVICES}/${id}`, `${EP_SERVICES_FALLBACK}/${id}`, { method: 'POST', body: fdSend });
                    console.debug('🧪 [SERVICES] Respuesta update primaria:', response);
                    updated = (response?.success === true) || !!(response?.data || response?.service);
                    }
                } catch (e) { lastErr = e?.message || String(e); }
                if (!updated) {
                    for (const v of EP_SERVICES_DETAIL_VARIANTS) {
                        try {
                            const r = await _apiRequest(`${v}/${id}`, { method: 'POST', body: fdSend });
                            console.debug('🧪 [SERVICES] Respuesta update variante', v, r);
                            updated = (r?.success === true) || !!(r?.data || r?.service);
                            if (updated) break;
                        } catch (e) { lastErr = e?.message || String(e); }
                    }
                }
                // Intentar PUT directo si aún no
                if (!updated) {
                    for (const v of EP_SERVICES_DETAIL_VARIANTS) {
                        try {
                            const r = await _apiRequest(`${v}/${id}`, { method: 'PUT', body: fdSend });
                            console.debug('🧪 [SERVICES] Respuesta update PUT', v, r);
                            updated = (r?.success === true) || !!(r?.data || r?.service);
                            if (updated) break;
                        } catch (e) { lastErr = e?.message || String(e); }
                    }
                }
                // Intentar PATCH directo como última opción
                if (!updated) {
                    for (const v of EP_SERVICES_DETAIL_VARIANTS) {
                        try {
                            const r = await _apiRequest(`${v}/${id}`, { method: 'PATCH', body: fdSend });
                            console.debug('🧪 [SERVICES] Respuesta update PATCH', v, r);
                            updated = (r?.success === true) || !!(r?.data || r?.service);
                            if (updated) break;
                        } catch (e) { lastErr = e?.message || String(e); }
                    }
                }
                if (!updated) throw new Error(lastErr || 'Error al actualizar el servicio');

                // Verificación: volver a obtener el servicio y comparar campos
                const base = (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1');
                const variants = EP_SERVICES_DETAIL_VARIANTS;
                let fetched = null;
                for (const v of variants) {
                    try {
                        const cb = `_=${Date.now()}`;
                        const url = `${base}${v}/${id}?${cb}`;
                        const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(window.API_TOKEN ? { Authorization: `Bearer ${window.API_TOKEN}` } : {}) }, credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
                        if (res.ok) { const j = await res.json().catch(() => ({})); fetched = j?.data || j?.service || j; break; }
                    } catch {}
                }
                if (fetched) {
                    const mismatches = [];
                    // nombre
                    const fName = fetched.nombre_servicio ?? fetched.nombre ?? fetched.name ?? '';
                    if (expected.nombre_servicio && String(fName) !== String(expected.nombre_servicio)) mismatches.push('nombre');
                    // categoria (string, id o objeto)
                    let fCat = '';
                    if (typeof fetched.categoria === 'object' && fetched.categoria) {
                        fCat = fetched.categoria.slug || fetched.categoria.name || fetched.categoria.id || '';
                    } else {
                        fCat = fetched.categoria ?? fetched.category ?? fetched.category_id ?? '';
                    }
                    if (expected.categoria && String(fCat) !== String(expected.categoria)) mismatches.push('categoria');
                    // descripcion
                    const fDesc = fetched.descripcion ?? fetched.description ?? '';
                    if (expected.descripcion && String(fDesc) !== String(expected.descripcion)) mismatches.push('descripcion');
                    // direccion/address
                    const fAddr = fetched.direccion ?? fetched.address ?? '';
                    if (expected.direccion && String(fAddr) !== String(expected.direccion)) mismatches.push('direccion');
                    // telefono/phone
                    const fTel = fetched.telefono ?? fetched.phone ?? '';
                    if (expected.telefono && String(fTel) !== String(expected.telefono)) mismatches.push('telefono');
                    // precio_base/price/precio
                    const fPrice = fetched.precio_base ?? fetched.price ?? fetched.precio ?? '';
                    if (expected.precio_base && String(fPrice) !== String(expected.precio_base)) mismatches.push('precio_base');
                    // horario
                    const fSch = fetched.horario_atencion ?? fetched.horario ?? fetched.schedule ?? '';
                    if (expected.horario_atencion && String(fSch) !== String(expected.horario_atencion)) mismatches.push('horario_atencion');

                    if (mismatches.length > 0) {
                        _showToast(`El servidor respondió ok, pero no reflejó cambios en: ${mismatches.join(', ')}.`, 'error');
                        return; // No cerrar modal
                    }
                }

                _showToast('Servicio actualizado correctamente', 'success');

                // Parchear la tarjeta en UI de forma optimista
                try {
                    const expectedUi = {
                        nombre_servicio: expected.nombre_servicio,
                        descripcion: expected.descripcion,
                        precio_base: expected.precio_base,
                        categoria: expected.categoria,
                        horario_atencion: expected.horario_atencion,
                        direccion: expected.direccion,
                        telefono: expected.telefono
                    };
                    this._optimisticallyPatchServiceCard(id, expectedUi);
                } catch {}

                // Asegurar que este servicio quede asociado al emprendedor en la cache local
                try {
                    const eid = formData.get('entrepreneur_id') || localStorage.getItem('ENTREPRENEUR_ID');
                    if (eid && id != null) {
                        const key = `MY_SERVICE_IDS:${eid}`;
                        let ids = [];
                        try { ids = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
                        ids = Array.isArray(ids) ? ids : [];
                        if (!ids.some(x => String(x) === String(id))) {
                            ids.push(id);
                            localStorage.setItem(key, JSON.stringify(ids));
                        }
                    }
                } catch {}

                // Cerrar modal con mecanismos de respaldo
                try { closeModalCallback && closeModalCallback(); } catch {}
                const modalEl = document.getElementById('edit-service-modal');
                if (modalEl && modalEl.isConnected) {
                    try { document.body.removeChild(modalEl); } catch { modalEl.classList.add('hidden'); }
                }

                // Recargar listas
                this.loadServicios();
                // Refrescar 'Mis Servicios' si existe
                if (window.loadMisServicios) {
                    setTimeout(() => window.loadMisServicios(), 300);
                }

            } catch (error) {
                console.error('❌ [SERVICES] Error al actualizar servicio:', error);
                _showToast(error.message || 'Error al actualizar el servicio', 'error');
            } finally {
                _toggleButtonLoading(submitButton, false, originalButtonText);
                form.dataset.submitting = 'false';
            }
        },

        /**
         * Actualiza en sitio la tarjeta del servicio en "Mis Servicios" sin esperar recarga
         */
        _optimisticallyPatchServiceCard(id, data) {
            try {
                const btn = document.querySelector(`.editar-servicio[data-id="${id}"]`);
                if (!btn) return;
                const card = btn.closest('.product-card');
                if (!card) return;
                // Título
                const title = card.querySelector('h3');
                if (title && data.nombre_servicio) title.textContent = data.nombre_servicio;
                // Descripción
                const desc = card.querySelector('p.text-gray-600');
                if (desc && data.descripcion) desc.textContent = data.descripcion;
                // Precio
                if (data.precio_base) {
                    const priceEl = card.querySelector('span.text-2xl');
                    if (priceEl) {
                        const n = Number(data.precio_base);
                        const txt = isNaN(n) ? String(data.precio_base) : `$${n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
                        priceEl.textContent = txt;
                    }
                }
                // Categoría
                const badge = card.querySelector('.absolute.top-2.right-2');
                if (badge && data.categoria) badge.textContent = String(data.categoria);
                // Datos inferiores
                const blocks = card.querySelectorAll('.flex.items-center span.truncate, .flex.items-center span:not(.truncate)');
                // No siempre fiable, así que no tocamos si no es claro
            } catch {}
        },

        /**
         * Configura el manejador del formulario
         */
        setupFormHandler: function() {
            const servicioForm = document.getElementById('servicio-form');

            if (!servicioForm) {
                console.warn('⚠️ [SERVICES] Formulario de servicio no encontrado');
                return;
            }

            // Evitar múltiples bindings del handler
            if (servicioForm.dataset.serviceHandlerBound === 'true') {
                console.debug('ℹ️ [SERVICES] Handler de submit ya está enlazado (ServicePublishing)');
                return;
            }
            servicioForm.dataset.serviceHandlerBound = 'true';

            servicioForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                servicioForm.dataset.submitting = 'true';

                const submitButton = e.target.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;

                try {
                    // Verificar input file antes de manipular
                    const mainImageInput = document.getElementById('service-main-image');
                    if (mainImageInput) {
                        console.log('Archivo seleccionado en service-main-image:', mainImageInput.files[0]);
                        if (!mainImageInput.files[0] || mainImageInput.files[0].size === 0) {
                            console.warn('No hay archivo seleccionado o el archivo tiene tamaño 0.');
                        }
                    } else {
                        console.warn('No se encontró el input service-main-image');
                    }

                    // Crear FormData con todos los campos del formulario
                    const formData = _buildFormData(servicioForm);

                    // Validar formulario
                    const errors = this.validateServiceForm(formData);
                    if (!this.showErrors(errors)) {
                        servicioForm.dataset.submitting = 'false';
                        return;
                    }

                    // Mostrar loading
                    _toggleButtonLoading(submitButton, true, originalButtonText);

                    // Log detallado antes de enviar
                    console.log('=== INICIO DEBUG SERVICIO ===');
                    for (let [key, value] of formData.entries()) {
                        if (value instanceof File) {
                            console.log(`${key}: [Archivo] ${value.name} (${value.size} bytes)`);
                        } else {
                            console.log(`${key}: ${value}`);
                        }
                    }
                    console.log('URL objetivo:', '/services');

                    // Verificar CSRF token
                    const csrfToken = document.querySelector('meta[name="csrf-token"]');
                    if (!csrfToken) {
                        this.showErrors(['Error: No se encontró el token CSRF. Asegúrate de tener <meta name="csrf-token" content="{{ csrf_token() }}"> en tu HTML']);
                        servicioForm.dataset.submitting = 'false';
                        return;
                    }

                    // Guardar servicio
                    const result = await this.saveService(formData);

                    if (result.success) {
                        _showToast(result.message || 'Servicio guardado exitosamente', 'success');
                        this.clearServiceForm();

                        // Regresar a la vista de servicios
                        if (window.showSection) {
                            window.showSection('servicios');
                        }

                        // Recargar ambas vistas si existen
                        if (window.ServicesManager && typeof window.ServicesManager.loadServicios === 'function') {
                            window.ServicesManager.loadServicios();
                        }
                        if (window.loadMisServicios) {
                            window.loadMisServicios();
                        }
                    } else {
                        this.showErrors(result.errors);
                    }

                } catch (error) {
                    console.error('❌ [SERVICES] Error al procesar formulario:', error);
                    this.showErrors([
                        'Error inesperado al procesar la solicitud',
                        `Tipo: ${error.name}`,
                        `Mensaje: ${error.message}`,
                        'Revisa la consola del navegador para más detalles'
                    ]);
                } finally {
                    _toggleButtonLoading(submitButton, false, originalButtonText);
                    servicioForm.dataset.submitting = 'false';
                }
            });
        },

        /**
         * Limpia el formulario de servicio
         */
        clearServiceForm: function() {
            const form = document.getElementById('servicio-form');
            if (!form) return;

            form.reset();

            // Limpiar previsualizaciones de imágenes
            const mainPreview = document.getElementById('service-main-preview');
            const galleryPreview = document.getElementById('service-gallery-preview');

            if (mainPreview) mainPreview.innerHTML = '';
            if (galleryPreview) galleryPreview.innerHTML = '';

            // Remover mensajes de error
            const existingErrors = document.querySelectorAll('.error-message');
            existingErrors.forEach(error => error.remove());
        },

        /**
         * Muestra un diálogo de confirmación
         * @param {Object} options - Opciones del diálogo
         * @returns {Promise<boolean>} Promesa que resuelve con true/false
         */
        showConfirmDialog: function({ title, message, confirmText, cancelText, type = 'warning' }) {
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
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
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
        },

        /**
         * Configura eventos globales
         */
        setupGlobalEvents: function() {
            // Eventos para botones de edición y eliminación (robustos con closest)
            document.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.editar-servicio');
                if (editBtn) {
                    e.preventDefault();
                    const serviceId = parseInt(editBtn.dataset.serviceId || editBtn.getAttribute('data-id'));
                    if (serviceId) {
                        this.editarServicio(serviceId);
                        return;
                    }
                }

                const delBtn = e.target.closest('.eliminar-servicio');
                if (delBtn) {
                    e.preventDefault();
                    const serviceId = parseInt(delBtn.dataset.serviceId || delBtn.getAttribute('data-id'));
                    if (serviceId) {
                        this.eliminarServicio(serviceId);
                    }
                }
            });
        }
    };
})();

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar solo si hay elementos de servicios presentes en la página
    const hasServicesUI = !!(document.getElementById('servicio-form') || document.getElementById('services-grid') || document.querySelector('#servicios') || document.querySelector('#servicios .grid'));
    if (hasServicesUI) {
        ServiceManager.init();
    } else {
        console.debug('ℹ️ [SERVICES] Inicialización omitida: no hay UI de servicios en esta página.');
    }

    // Funciones globales para mantener compatibilidad
    window.ServicesManager = ServiceManager;
    window.editarServicio = (id) => ServiceManager.editarServicio(id);
    window.eliminarServicio = (id) => ServiceManager.eliminarServicio(id);
    window.showGalleryModal = (serviceId, startIdx) => ServiceManager.showGalleryModal(serviceId, startIdx);
});
