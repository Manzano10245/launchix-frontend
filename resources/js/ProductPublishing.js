/**
 * ProductPublishing.js - Gestión completa de productos con integración API
 * Adaptado para usar API_BASE_URL + API_PREFIX y Bearer token (cuando aplique)
 */

import './config.js';

window.ProductManager = (function() {
    // Configuración privada
    const config = {
        // Base completa: http(s)://host + /api/v1 (o lo que esté configurado)
        apiBaseUrl: ((window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1')).replace(/\/$/, ''),
        maxImageSize: 2 * 1024 * 1024, // 2MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'],
        maxGalleryImages: 5
    };

    // Host base de la API (sin barra final), para construir URLs absolutas de imágenes
    const API_HOST = (window.API_BASE_URL || '').replace(/\/$/, '');

    // Placeholder SVG embebido para errores de carga de imágenes
    const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">\n' +
        '  <rect width="100%" height="100%" fill="#e5e7eb"/>\n' +
        '  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#6b7280">Sin imagen</text>\n' +
        '</svg>'
    );

    // Endpoints relativos configurables (el base ya incluye API_PREFIX)
    const EP_PRODUCTS = (window.API_REL_EP_PRODUCTS || '/entrepreneur/products');
    const EP_PRODUCTS_FALLBACK = (window.API_REL_EP_PRODUCTS_FALLBACK || '/products');

    async function _apiRequestWithFallback(primary, fallback, options = {}, preferFallback = false) {
        // Si ya hemos detectado que el primario no existe, o se fuerza preferir fallback
        if (preferFallback === true || window.__USE_PRODUCTS_FALLBACK === true) {
            return _apiRequest(fallback, options);
        }
        try {
            return await _apiRequest(primary, options);
        } catch (e1) {
            // Si fue un 404, marcar bandera para usar fallback en adelante
            if (e1 && (e1.status === 404 || /could not be found/i.test(e1.message || ''))) {
                window.__USE_PRODUCTS_FALLBACK = true;
            }
            console.warn('⚠️ [API] Endpoint primario falló, probando fallback:', primary, '->', fallback, e1?.message);
            try {
                return await _apiRequest(fallback, options);
            } catch (e2) {
                throw e2; // Propagar el error final
            }
        }
    }

    // Estado privado
    let currentProducts = [];
    let currentProduct = null;
    let isLoading = false;

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * Construye encabezados auth comunes (Bearer si existe)
     */
    function _getAuthHeaders(base = {}) {
        const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(base || {}) };
        try {
            const token = window.API_TOKEN || localStorage.getItem('API_TOKEN');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch {}
        return headers;
    }

    /**
     * Obtiene el ID del emprendedor autenticado desde cache o API y lo cachea.
     * @returns {Promise<string|number|null>} ID del emprendedor o null si no disponible
     */
    async function _getEntrepreneurId() {
        try {
            // 1) Revisar memoria y localStorage
            if (window.ENTREPRENEUR_ID) return window.ENTREPRENEUR_ID;
            const cached = localStorage.getItem('ENTREPRENEUR_ID');
            if (cached) {
                window.ENTREPRENEUR_ID = cached;
                return cached;
            }

            // 2) Intentar obtenerlo desde el endpoint de perfil del emprendedor
            const mePath = window.API_EP_ME || `${(window.API_PREFIX || '/api/v1')}/entrepreneur/me`;
            const url = window.API_FULL(mePath);
            const res = await fetch(url, {
                method: 'GET',
                headers: _getAuthHeaders(),
                credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin'
            });

            if (!res.ok) {
                // 401/404 etc.: no se puede determinar, retornar null
                return null;
            }

            const data = await res.json().catch(() => ({}));

            // Posibles formas: {data:{id}}, {user:{id}}, {id}, {entrepreneur:{id}}
            const payload = data?.data || data?.user || data?.entrepreneur || data;
            const id = payload?.id || payload?.entrepreneur_id || null;

            if (id) {
                window.ENTREPRENEUR_ID = id;
                try { localStorage.setItem('ENTREPRENEUR_ID', String(id)); } catch {}
                return id;
            }

            return null;
        } catch (e) {
            console.warn('⚠️ [AUTH] No se pudo obtener entrepreneur_id:', e?.message || e);
            return null;
        }
    }

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
     * Muestra un mensaje de error
     * @param {string|Array} message - Mensaje de error
     * @param {string} [type='error'] - Tipo de mensaje
     */
    function _showError(message, type = 'error') {
        if (window.showToast) {
            if (Array.isArray(message)) {
                message = message.join('<br>');
            }
            window.showToast(message, type);
        } else {
            console.error('❌ [ERROR]:', message);
            alert(typeof message === 'string' ? message : message.join('\n'));
        }
    }

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje de éxito
     */
    function _showSuccess(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            console.log('✅ [SUCCESS]:', message);
            alert(message);
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
            _showError(`Tipo de archivo no válido: ${file.type}. Solo se permiten JPG/PNG/WebP/GIF.`);
            return false;
        }
        if (file.size > config.maxImageSize) {
            _showError(`Archivo demasiado grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Máximo ${config.maxImageSize / (1024 * 1024)}MB.`);
            return false;
        }
        return true;
    }

    /**
     * Formatea un precio para mostrar
     * @param {number} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    function _formatPrice(price) {
        if (price === undefined || price === null) return 'Precio no disponible';
        return `$${parseFloat(price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    /**
     * Formatea una fecha para mostrar
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    function _formatDate(dateString) {
        if (!dateString) return 'Fecha desconocida';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    /**
     * Intenta resolver el ID del dueño/emprendedor de un producto en distintas formas
     * @param {Object} p - Producto
     * @returns {string|number|null}
     */
    function _getOwnerIdFromProduct(p) {
        if (!p || typeof p !== 'object') return null;
        // snake_case directos
        if (p.entrepreneur_id != null) return p.entrepreneur_id;
        if (p.emprendedor_id != null) return p.emprendedor_id;
        if (p.owner_id != null) return p.owner_id;
        if (p.user_id != null) return p.user_id;
        if (p.usuario_id != null) return p.usuario_id;
        if (p.created_by_id != null) return p.created_by_id;
        if (p.creator_id != null) return p.creator_id;
        if (p.author_id != null) return p.author_id;

        // camelCase
        if (p.entrepreneurId != null) return p.entrepreneurId;
        if (p.emprendedorId != null) return p.emprendedorId;
        if (p.ownerId != null) return p.ownerId;
        if (p.userId != null) return p.userId;
        if (p.usuarioId != null) return p.usuarioId;
        if (p.createdById != null) return p.createdById;
        if (p.creatorId != null) return p.creatorId;
        if (p.authorId != null) return p.authorId;

        // Relaciones anidadas
        if (p.entrepreneur && p.entrepreneur.id != null) return p.entrepreneur.id;
        if (p.emprendedor && p.emprendedor.id != null) return p.emprendedor.id;
        if (p.owner && p.owner.id != null) return p.owner.id;
        if (p.user && p.user.id != null) return p.user.id;
        if (p.usuario && p.usuario.id != null) return p.usuario.id;
        if (p.created_by && p.created_by.id != null) return p.created_by.id;
        if (p.creator && p.creator.id != null) return p.creator.id;
        if (p.author && p.author.id != null) return p.author.id;

        return null;
    }

    /**
     * Obtiene el nombre de una categoría
     * @param {string|object} category - Categoría
     * @returns {string} Nombre de la categoría
     */
    function _getCategoryName(category) {
        const categoryMap = {
            'ropa': 'Ropa',
            'calzado': 'Calzado',
            'accesorios': 'Accesorios',
            'hogar': 'Hogar',
            'electronica': 'Electrónica',
            'deportes': 'Deportes',
            'belleza': 'Belleza y Cuidado Personal',
            'juguetes': 'Juguetes',
            'libros': 'Libros',
            'otros': 'Otros',
            'alimentos': 'Alimentos y Bebidas',
            'muebles': 'Muebles',
            'tecnologia': 'Tecnología',
            'automotriz': 'Automotriz',
            'decoracion': 'Decoración'
        };

        if (typeof category === 'object' && category !== null) {
            return category.name || categoryMap[category.slug] || category.slug || 'Sin categoría';
        }
        return categoryMap[category] || category || 'Sin categoría';
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
        img.className = 'w-full h-32 object-cover rounded-lg border shadow-sm';

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
                document.getElementById('product-main-image').value = '';
            } else {
                // En una implementación completa, aquí deberías actualizar el input de archivos
                // Para este ejemplo, solo eliminamos la previsualización
            }
        };

        container.appendChild(img);
        container.appendChild(deleteBtn);
        return container;
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
                <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                </span>
            `;
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    /**
     * Resuelve una ruta de imagen devolviendo una URL absoluta hacia el host de la API
     * @param {string} path - Ruta devuelta por la API (puede ser relativa o absoluta)
     * @returns {string} URL absoluta a la imagen
     */
    function _resolveImageUrl(path) {
        if (!path || typeof path !== 'string') return '';
        if (path.startsWith('http')) return path;
        // Normalizar: eliminar barras iniciales
        let normalized = path.replace(/^\/+/, '');
        // Si ya es storage/... => usar tal cual
        if (normalized.startsWith('storage/')) {
            return `${API_HOST}/${normalized}`;
        }
        // En otros casos, anteponer storage/
        normalized = normalized.replace(/^storage\//, '');
        return `${API_HOST}/storage/${normalized}`;
    }

    /**
     * Duplica campos del FormData a nombres alternativos (es/en) para compatibilidad con distintos backends
     * @param {FormData} fd
     */
    function _augmentCompatibilityFormData(fd) {
        if (!fd) return fd;
        try {
            // entrepreneur_id -> emprendedor_id (alias ES)
            if (fd.has('entrepreneur_id') && !fd.has('emprendedor_id')) {
                fd.append('emprendedor_id', fd.get('entrepreneur_id'));
            }

            // category -> category_id (si el backend espera id)
            if (fd.has('category') && !fd.has('category_id')) {
                fd.append('category_id', fd.get('category'));
            }

            // category -> categoria (alias ES)
            if (fd.has('category') && !fd.has('categoria')) {
                fd.append('categoria', fd.get('category'));
            }

            // categoria -> category (inverse mapping para robustez)
            if (!fd.has('category') && fd.has('categoria')) {
                fd.append('category', fd.get('categoria'));
            }

            // main_image -> imagen_principal (alias común en ES)
            const mainFromFd = fd.get('main_image');
            const mainFile = (mainFromFd instanceof File) ? mainFromFd : null;
            if (mainFile && !fd.has('imagen_principal')) {
                fd.append('imagen_principal', mainFile);
            }

            // gallery_images[] -> galeria_imagenes[] (alias ES)
            const gallery = fd.getAll('gallery_images[]');
            if (gallery && gallery.length > 0) {
                gallery.forEach(f => {
                    if (f instanceof File) fd.append('galeria_imagenes[]', f);
                });
            }

            // Duplicados de texto: name -> nombre, description -> descripcion, price -> precio, stock -> existencias
            const pairs = [
                ['name', 'nombre'],
                ['description', 'descripcion'],
                ['price', 'precio'],
                ['stock', 'existencias']
            ];
            pairs.forEach(([src, dst]) => {
                if (fd.has(src) && !fd.has(dst)) {
                    fd.append(dst, fd.get(src));
                }
            });
        } catch (e) {
            console.warn('⚠️ [FORM] No se pudieron agregar aliases de compatibilidad:', e);
        }
        return fd;
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

        // Adjuntar Bearer token si está disponible
        try {
            const token = window.API_TOKEN || localStorage.getItem('API_TOKEN');
            if (token) {
                mergedOptions.headers = { ...(mergedOptions.headers || {}), Authorization: `Bearer ${token}` };
            }
        } catch {}

        try {
            console.log(`📡 [API] ${mergedOptions.method} ${endpoint}`, {
                headers: mergedOptions.headers,
                body: mergedOptions.body ? '[Body included]' : undefined
            });

            const fullUrl = endpoint.startsWith('http') ? endpoint : `${config.apiBaseUrl}${endpoint}`;
            const response = await fetch(fullUrl, mergedOptions);

            console.log(`📥 [API] Respuesta ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const err = new Error(errorData?.message || errorData?.error || `Error ${response.status}: ${response.statusText}`);
                err.status = response.status;
                if (response.status === 422 && errorData?.errors) {
                    err.validation = errorData.errors; // { campo: [mensajes] }
                }
                throw err;
            }

            return await response.json();

        } catch (error) {
            console.error('❌ [API] Error en la petición:', error);
            throw error;
        }
    }

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================

    return {
        /**
         * Inicializa el gestor de productos
         */
        init: function() {
            console.log('🛠️ [PRODUCTS] Inicializando ProductManager');

            // Configurar subida de imágenes
            this.setupImageUpload('product-main-dropzone', 'product-main-image', 'product-main-preview');
            this.setupImageUpload('product-gallery-dropzone', 'product-gallery-images', 'product-gallery-preview');

            // Cargar productos al inicio
            this.loadProducts();

            // Configurar manejador del formulario
            this.setupFormHandler();

            // Configurar eventos globales
            this.setupGlobalEvents();

            console.log('✅ [PRODUCTS] ProductManager inicializado correctamente');
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
            dropzone.addEventListener('click', () => input.click());

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

                const files = e.dataTransfer.files;
                this.handleImageFiles(files, preview, inputId, inputId === 'product-main-image');
            });

            // Cambio en el input de archivos
            input.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    this.handleImageFiles(e.target.files, preview, inputId, inputId === 'product-main-image');
                }
            });
        },

        /**
         * Maneja archivos de imagen seleccionados
         * @param {FileList} files - Archivos seleccionados
         * @param {HTMLElement} preview - Contenedor de previsualización
         * @param {string} inputId - ID del input de archivo
         * @param {boolean} isMain - Si es la imagen principal
         */
        handleImageFiles: function(files, preview, inputId, isMain = false) {
            if (!files || files.length === 0) return;

            preview.innerHTML = '';

            const maxFiles = isMain ? 1 : config.maxGalleryImages;
            if (files.length > maxFiles) {
                _showError(`Máximo ${maxFiles} ${isMain ? 'imagen' : 'imágenes'} permitida${isMain ? '' : 's'}`);
                document.getElementById(inputId).value = '';
                return;
            }

            let hasInvalidFiles = false;
            const validFiles = [];

            Array.from(files).forEach((file, index) => {
                if (!_validateImageFile(file)) {
                    hasInvalidFiles = true;
                    return;
                }
                validFiles.push(file);

                const previewElement = _createImagePreviewElement(file, index, isMain);
                preview.appendChild(previewElement);
            });

            if (hasInvalidFiles && validFiles.length === 0) {
                document.getElementById(inputId).value = '';
            }
        },

        /**
         * Valida el formulario de producto
         * @param {FormData} formData - Datos del formulario
         * @returns {Array} Lista de errores
         */
        validateProductForm: function(formData) {
            const errors = [];

            // Validar nombre
            if (!formData.get('name') || formData.get('name').trim() === '') {
                errors.push('El nombre del producto es obligatorio');
            } else if (formData.get('name').trim().length > 100) {
                errors.push('El nombre no puede superar los 100 caracteres');
            }

            // Validar categoría
            if (!formData.get('category') || formData.get('category').trim() === '') {
                errors.push('La categoría es obligatoria');
            }

            // Validar descripción
            if (!formData.get('description') || formData.get('description').trim() === '') {
                errors.push('La descripción es obligatoria');
            } else if (formData.get('description').trim().length > 2000) {
                errors.push('La descripción no puede superar los 2000 caracteres');
            }

            // Validar precio
            if (!formData.get('price')) {
                errors.push('El precio es obligatorio');
            } else {
                const price = parseFloat(formData.get('price'));
                if (isNaN(price) || price < 0) {
                    errors.push('El precio debe ser un número válido mayor o igual a 0');
                } else if (price > 99999999.99) {
                    errors.push('El precio no puede ser mayor a $99,999,999.99');
                }
            }

            // Validar stock
            if (!formData.get('stock')) {
                errors.push('El stock es obligatorio');
            } else {
                const stock = parseInt(formData.get('stock'));
                if (isNaN(stock) || stock < 0) {
                    errors.push('El stock debe ser un número entero mayor o igual a 0');
                } else if (stock > 999999) {
                    errors.push('El stock no puede ser mayor a 999,999 unidades');
                }
            }

            // Validar imagen principal (soporta edición y creación)
            const editMainInput = document.getElementById('edit-main-image');
            const createMainInput = document.getElementById('product-main-image');
            const mainImageInput = editMainInput || createMainInput;
            if (!mainImageInput || mainImageInput.files.length === 0) {
                // En creación, no hay currentProduct; en edición, permitimos si ya existe imagen guardada
                if (!currentProduct || !currentProduct.main_image) {
                    errors.push('La imagen principal es obligatoria');
                }
            } else {
                const file = mainImageInput.files[0];
                if (!_validateImageFile(file)) {
                    errors.push('La imagen principal no es válida');
                }
            }

            return errors;
        },

        /**
         * Muestra errores de validación
         * @param {Array} errors - Lista de errores
         * @returns {boolean} True si no hay errores
         */
        showErrors: function(errors) {
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

                const form = document.getElementById('edit-product-form') || document.getElementById('producto-form');
                if (form) {
                    form.insertBefore(errorContainer, form.firstChild);
                    form.scrollIntoView({ behavior: 'smooth' });
                }

                return false;
            }
            return true;
        },

        /**
         * Carga productos desde la API
         */
        async loadProducts() {
            try {
                console.log('🔄 [PRODUCTS] Cargando productos desde API');

                // Mostrar loading
                const loadingElement = document.getElementById('productos-loading');
                const productosContainer = document.querySelector('#productos .grid') || document.getElementById('contenedor-productos');

                if (loadingElement) loadingElement.classList.remove('hidden');
                if (productosContainer) productosContainer.innerHTML = '';

                // Preferir endpoint del emprendedor autenticado con fallback y memoria de 404
                const response = await _apiRequestWithFallback(
                    EP_PRODUCTS,
                    EP_PRODUCTS_FALLBACK,
                    {},
                    window.__USE_PRODUCTS_FALLBACK === true
                );

                // Tolerar diferentes formas de respuesta
                let items = [];
                if (Array.isArray(response)) items = response;
                else if (response && Array.isArray(response.data)) items = response.data;
                else if (response && Array.isArray(response.products)) items = response.products;
                else if (response && response.product) items = [response.product];

                // Determinar si el endpoint usado es genérico (/products) y debemos filtrar por emprendedor
                const endpointLooksGeneric = (/\/products(\b|\/|$)/.test(EP_PRODUCTS) && !/\/entrepreneur\//.test(EP_PRODUCTS))
                    || (window.__USE_PRODUCTS_FALLBACK === true && /\/products(\b|\/|$)/.test(EP_PRODUCTS_FALLBACK));

                let filteredItems = items;
                if (endpointLooksGeneric) {
                    const eid = await _getEntrepreneurId();
                    if (eid != null) {
                        filteredItems = (items || []).filter(p => {
                            const owner = _getOwnerIdFromProduct(p);
                            return owner != null && String(owner) === String(eid);
                        });
                        console.log(`🧩 [PRODUCTS] Filtrados por emprendedor #${eid}: ${filteredItems.length}/${items.length}`);
                    } else {
                        console.warn('⚠️ [PRODUCTS] No se pudo determinar el entrepreneur_id; mostrando 0 productos en "Mis Productos"');
                        filteredItems = [];
                    }
                }

                currentProducts = filteredItems;
                console.log(`✅ [PRODUCTS] ${currentProducts.length} productos listados en Mis Productos`);

                this.displayProducts(currentProducts);

            } catch (error) {
                console.error('❌ [PRODUCTS] Error al cargar productos:', error);
                this.showProductsError(error.message || 'Error de conexión al cargar productos');
            } finally {
                const loadingElement = document.getElementById('productos-loading');
                if (loadingElement) loadingElement.classList.add('hidden');
            }
        },

        /**
         * Muestra productos en la vista
         * @param {Array} products - Lista de productos
         */
        displayProducts: function(products) {
            const productosContainer = document.querySelector('#productos .grid') || document.getElementById('contenedor-productos');
            if (!productosContainer) {
                console.warn('⚠️ [PRODUCTS] Contenedor de productos no encontrado');
                return;
            }

            // Limpiar contenido anterior
            productosContainer.innerHTML = '';

            if (products.length === 0) {
                productosContainer.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No tienes productos publicados</h3>
                        <p class="text-gray-500 mb-6">Comienza publicando tu primer producto</p>
                        <button class="btn-primary text-white px-6 py-2 rounded-lg"
                                onclick="ProductManager.clearProductForm(); window.showSection('publicar-producto')">
                            Publicar mi primer producto
                        </button>
                    </div>
                `;
                return;
            }

            // Crear cards para cada producto
            products.forEach(product => {
                const productCard = this.createProductCard(product);
                productosContainer.appendChild(productCard);
            });
        },

        /**
         * Crea una tarjeta de producto
         * @param {Object} product - Datos del producto
         * @returns {HTMLElement} Elemento de la tarjeta
         */
        createProductCard: function(product) {
            const card = document.createElement('div');
            card.className = 'product-card bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow';

            const precioTexto = product.price ? _formatPrice(product.price) : 'Precio no disponible';
            const categoria = _getCategoryName(product.category);

            const resolvedImg = _resolveImageUrl(product.main_image || '');
            card.innerHTML = `
                <div class="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    ${resolvedImg ?
                        `<img src="${resolvedImg}"
                              alt="${product.name}"
                              class="w-full h-full object-cover"
                              onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">` :
                        `<svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                        </svg>`
                    }
                </div>
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-semibold text-gray-800 truncate">${product.name}</h3>
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${categoria}</span>
                    </div>
                    <p class="text-gray-600 text-sm mb-2 line-clamp-2">${product.description}</p>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-primary font-bold">${precioTexto}</span>
                        <span class="text-sm text-gray-500">Stock: ${product.stock}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs bg-gray-100 px-2 py-1 rounded">${_formatDate(product.created_at)}</span>
                        <div class="flex space-x-2">
                            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium btn-editar"
                                    data-product-id="${product.id}">
                                <i class="fas fa-edit mr-1"></i> Editar
                            </button>
                            <button class="text-red-600 hover:text-red-800 text-sm font-medium btn-eliminar"
                                    data-product-id="${product.id}"
                                    data-product-name="${product.name}">
                                <i class="fas fa-trash mr-1"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            return card;
        },

        /**
         * Muestra un error en la vista de productos
         * @param {string} message - Mensaje de error
         */
        showProductsError: function(message) {
            const productosContainer = document.querySelector('#productos .grid') || document.getElementById('contenedor-productos');
            if (productosContainer) {
                productosContainer.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">Error al cargar productos</h3>
                        <p class="text-gray-500 mb-4">${message}</p>
                        <button class="btn-primary text-white px-4 py-2 rounded-lg"
                                onclick="ProductManager.loadProducts()">
                            Reintentar
                        </button>
                    </div>
                `;
            }
        },

        /**
         * Guarda un producto en el servidor
         * @param {FormData} formData - Datos del formulario
         * @param {string} method - Método HTTP (POST/PUT)
         * @param {string|null} productId - ID del producto (para actualización)
         * @returns {Promise} Promesa con el resultado
         */
        async saveProduct(formData, method = 'POST', productId = null) {
            const endpoint = productId ? `${EP_PRODUCTS}/${productId}` : EP_PRODUCTS;
            const endpointFallback = productId ? `${EP_PRODUCTS_FALLBACK}/${productId}` : EP_PRODUCTS_FALLBACK;

            try {
                console.log(`📤 [PRODUCTS] ${method} ${endpoint}`);

                // Agregar _method para PUT si es necesario
                if (method === 'PUT') {
                    formData.append('_method', 'PUT');
                }

                // Asegurar entrepreneur_id si el backend lo exige
                if (!formData.has('entrepreneur_id')) {
                    const eid = await _getEntrepreneurId();
                    if (eid) {
                        formData.append('entrepreneur_id', eid);
                        console.log('🔑 [PRODUCTS] Adjuntado entrepreneur_id:', eid);
                    } else {
                        console.warn('⚠️ [PRODUCTS] No se pudo determinar entrepreneur_id; el backend podría rechazar la solicitud (422)');
                    }
                }

                // Aumentar compatibilidad de nombres de campos antes de enviar
                _augmentCompatibilityFormData(formData);

                let response = await _apiRequestWithFallback(endpoint, endpointFallback, {
                    method: 'POST', // Laravel usa POST con _method=PUT
                    body: formData
                });

                // Normalizar respuesta
                const saved = response?.data || response?.product || response;
                const message = response?.message || 'Producto guardado exitosamente';

                if (!saved) {
                    throw new Error('Respuesta inesperada al guardar el producto');
                }

                return { success: true, data: saved, message };

            } catch (error) {
                console.error('❌ [PRODUCTS] Error al guardar producto:', error);
                let errorList = [];
                if (error?.status === 422 && error?.validation) {
                    for (const [field, messages] of Object.entries(error.validation)) {
                        (messages || []).forEach(msg => errorList.push(`${field}: ${msg}`));
                    }
                    if (errorList.length === 0 && error.message) errorList.push(error.message);
                } else if (error?.status === 422) {
                    // Cuando el backend devuelve 422 sin 'validation', intentar extraer 'errors'
                    try {
                        const raw = error?.message || '';
                        if (raw) errorList.push(raw);
                    } catch {}
                } else if (error?.status === 500) {
                    // Mensaje amigable para errores 500 (p. ej., columna category requerida en backend)
                    errorList.push('Ocurrió un error interno al guardar el producto. Intenta de nuevo en unos minutos.');
                    // Pista técnica (no expone SQL crudo al usuario final)
                    errorList.push('Nota técnica: el backend requiere aceptar/persistir el campo "category" (o mapear desde "categoria").');
                } else if (error?.message) {
                    // Evitar mostrar SQLSTATE al usuario final
                    const sanitized = /SQLSTATE|insert into|mysql|Connection:/i.test(error.message)
                        ? 'Ocurrió un error al guardar el producto. Por favor intenta de nuevo.'
                        : error.message;
                    errorList.push(sanitized);
                } else {
                    errorList.push('Error desconocido al guardar el producto');
                }
                return {
                    success: false,
                    errors: errorList,
                    message: 'Error al guardar el producto'
                };
            }
        },

        /**
         * Elimina un producto
         * @param {string} id - ID del producto
         * @param {string} name - Nombre del producto
         */
        async deleteProduct(id, name) {
            try {
                console.log(`🗑️ [PRODUCTS] Solicitando eliminación del producto ${id}`);

                // Mostrar diálogo de confirmación
                const confirmed = await this.showConfirmDialog({
                    title: 'Eliminar Producto',
                    message: `¿Estás seguro de que deseas eliminar el producto "${name}"? Esta acción no se puede deshacer.`,
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'danger'
                });

                if (!confirmed) {
                    console.log('⚠️ [PRODUCTS] Eliminación cancelada por el usuario');
                    return;
                }

                // Mostrar loading en los botones de eliminar
                const deleteButtons = document.querySelectorAll(`button[data-product-id="${id}"]`);
                deleteButtons.forEach(btn => {
                    _toggleButtonLoading(btn, true, 'Eliminando...');
                });

                const response = await _apiRequestWithFallback(`${EP_PRODUCTS}/${id}`, `${EP_PRODUCTS_FALLBACK}/${id}`, {
                    method: 'DELETE'
                });

                // Considerar que un 200/204 ya es suficiente
                const ok = response?.success !== false;
                if (!ok) throw new Error(response?.message || 'Error al eliminar el producto');

                _showSuccess(response?.message || 'Producto eliminado correctamente');
                this.loadProducts();

            } catch (error) {
                console.error('❌ [PRODUCTS] Error al eliminar producto:', error);
                _showError(error.message || 'Error al eliminar el producto');
            } finally {
                // Restaurar botones
                const deleteButtons = document.querySelectorAll(`button[data-product-id="${id}"]`);
                deleteButtons.forEach(btn => {
                    _toggleButtonLoading(btn, false, '<i class="fas fa-trash mr-1"></i> Eliminar');
                });
            }
        },

        /**
         * Carga datos de un producto para edición
         * @param {string} id - ID del producto
         */
        async loadProductData(id) {
            try {
                console.log(`🔍 [PRODUCTS] Cargando datos del producto ${id}`);

                // Mostrar loading
                this.showEditLoading();

                const response = await _apiRequestWithFallback(`${EP_PRODUCTS}/${id}`, `${EP_PRODUCTS_FALLBACK}/${id}`);

                // Normalizar
                currentProduct = response?.data || response?.product || response;
                if (!currentProduct) {
                    throw new Error('No se encontró el producto');
                }
                this.showEditModal(currentProduct);

            } catch (error) {
                console.error('❌ [PRODUCTS] Error al cargar producto:', error);
                _showError(error.message || 'Error al cargar los datos del producto');
            }
        },

        /**
         * Muestra loading mientras se cargan datos para edición
         */
        showEditLoading: function() {
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
                    <p class="text-gray-600">Cargando datos del producto...</p>
                </div>
            `;
            document.body.appendChild(loadingModal);
        },

        /**
         * Muestra el modal de edición con los datos del producto
         * @param {Object} product - Datos del producto
         */
        showEditModal: function(product) {
            // Remover modal de loading si existe
            const loadingModal = document.getElementById('edit-loading-modal');
            if (loadingModal) {
                document.body.removeChild(loadingModal);
            }

            // Crear modal de edición
            const editModal = document.createElement('div');
            editModal.id = 'edit-product-modal';
            editModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            editModal.innerHTML = `
                <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <h2 class="text-xl font-bold text-gray-800">Editar Producto</h2>
                        <button id="close-edit-modal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    <form id="edit-product-form" class="p-6">
                        <input type="hidden" id="edit-product-id" value="${product.id}">

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Columna izquierda: Información básica -->
                            <div class="space-y-4">
                                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Información Básica</h3>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto *</label>
                                    <input type="text" id="edit-name" value="${product.name || ''}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                           placeholder="Ej: Camiseta de algodón" required>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                                    <select id="edit-category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">Seleccionar categoría</option>
                                        <option value="ropa" ${product.category === 'ropa' ? 'selected' : ''}>Ropa</option>
                                        <option value="calzado" ${product.category === 'calzado' ? 'selected' : ''}>Calzado</option>
                                        <option value="accesorios" ${product.category === 'accesorios' ? 'selected' : ''}>Accesorios</option>
                                        <option value="hogar" ${product.category === 'hogar' ? 'selected' : ''}>Hogar</option>
                                        <option value="electronica" ${product.category === 'electronica' ? 'selected' : ''}>Electrónica</option>
                                        <option value="deportes" ${product.category === 'deportes' ? 'selected' : ''}>Deportes</option>
                                        <option value="belleza" ${product.category === 'belleza' ? 'selected' : ''}>Belleza y Cuidado Personal</option>
                                        <option value="juguetes" ${product.category === 'juguetes' ? 'selected' : ''}>Juguetes</option>
                                        <option value="libros" ${product.category === 'libros' ? 'selected' : ''}>Libros</option>
                                        <option value="alimentos" ${product.category === 'alimentos' ? 'selected' : ''}>Alimentos y Bebidas</option>
                                        <option value="muebles" ${product.category === 'muebles' ? 'selected' : ''}>Muebles</option>
                                        <option value="tecnologia" ${product.category === 'tecnologia' ? 'selected' : ''}>Tecnología</option>
                                        <option value="automotriz" ${product.category === 'automotriz' ? 'selected' : ''}>Automotriz</option>
                                        <option value="decoracion" ${product.category === 'decoracion' ? 'selected' : ''}>Decoración</option>
                                        <option value="otros" ${product.category === 'otros' ? 'selected' : ''}>Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                                    <textarea id="edit-description" rows="4"
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                              placeholder="Describe tu producto en detalle..." required>${product.description || ''}</textarea>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" id="edit-price" value="${product.price || ''}"
                                               class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                               placeholder="0.00" min="0" step="0.01" required>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                                    <input type="number" id="edit-stock" value="${product.stock || ''}"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                           placeholder="0" min="0" required>
                                </div>
                            </div>

                            <!-- Columna derecha: Imágenes -->
                            <div class="space-y-4">
                                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Imágenes del Producto</h3>

                                <!-- Imagen actual -->
                                <div>
                                    <h4 class="text-md font-medium text-gray-700 mb-2">Imagen Actual</h4>
                                    <div id="edit-current-images" class="grid grid-cols-1 gap-2">
                                        ${this._renderCurrentImages(product)}
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

                                <!-- Galería de imágenes -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nuevas Imágenes para Galería</label>
                                    <div id="edit-gallery-dropzone" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                        </svg>
                                        <p class="text-sm text-gray-500">Click o arrastra para agregar imágenes a la galería (máx. ${config.maxGalleryImages})</p>
                                    </div>
                                    <input type="file" id="edit-gallery-images" accept="image/*" class="hidden" multiple>
                                    <div id="edit-gallery-preview" class="mt-2 grid grid-cols-2 gap-2"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de acción -->
                        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                            <button type="button" id="cancel-edit" class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Actualizar Producto
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(editModal);

            // Configurar eventos del modal
            this._setupEditModalEvents(editModal, product);
        },

        /**
         * Renderiza las imágenes actuales del producto
         * @param {Object} product - Datos del producto
         * @returns {string} HTML de las imágenes
         */
        _renderCurrentImages: function(product) {
            let imagesHtml = '';

            // Imagen principal
            if (product.main_image) {
                const mainResolved = _resolveImageUrl(product.main_image);
                imagesHtml += `
                    <div class="relative group">
                        <img src="${mainResolved}"
                             alt="Imagen principal"
                             class="w-full h-20 object-cover rounded"
                             onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">
                        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <span class="text-white text-xs">Principal</span>
                        </div>
                    </div>
                `;
            }

            // Galería de imágenes
            if (product.gallery_images && product.gallery_images.length > 0) {
                product.gallery_images.forEach((image, index) => {
                    const imgResolved = _resolveImageUrl(image);
                    imagesHtml += `
                        <div class="relative group">
                            <img src="${imgResolved}"
                                 alt="Imagen ${index + 1}"
                                 class="w-full h-20 object-cover rounded"
                                 onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">
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
         * @param {Object} product - Datos del producto
         */
        _setupEditModalEvents: function(modal, product) {
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
            this.setupImageUpload('edit-gallery-dropzone', 'edit-gallery-images', 'edit-gallery-preview');

            // Manejar envío del formulario
            const form = modal.querySelector('#edit-product-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this._updateProduct(product.id, closeModal);
                });
            }
        },

        /**
         * Actualiza un producto en el servidor
         * @param {string} id - ID del producto
         * @param {Function} closeModalCallback - Función para cerrar el modal
         */
        async _updateProduct(id, closeModalCallback) {
            const form = document.getElementById('edit-product-form');
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            // Crear FormData
            const formData = new FormData();

            // Datos básicos
            formData.append('name', document.getElementById('edit-name').value);
            formData.append('category', document.getElementById('edit-category').value);
            formData.append('description', document.getElementById('edit-description').value);
            formData.append('price', document.getElementById('edit-price').value);
            formData.append('stock', document.getElementById('edit-stock').value);

            // Nueva imagen principal si se seleccionó
            const mainImageInput = document.getElementById('edit-main-image');
            if (mainImageInput.files[0]) {
                formData.append('main_image', mainImageInput.files[0]);
            }

            // Nuevas imágenes de galería si se seleccionaron
            const galleryImagesInput = document.getElementById('edit-gallery-images');
            if (galleryImagesInput.files.length > 0) {
                Array.from(galleryImagesInput.files).forEach(file => {
                    formData.append('gallery_images[]', file);
                });
            }

            // Validar datos básicos
            console.debug('📝 [PRODUCTS] Validando datos antes de actualizar', Array.from(formData.entries()));
            const errors = this.validateProductForm(formData);
            if (errors.length > 0) {
                this.showErrors(errors);
                return;
            }

            // Mostrar loading
            _toggleButtonLoading(submitButton, true, originalButtonText);

            try {
                console.log(`📤 [PRODUCTS] Actualizando producto ${id}`);

                const response = await this.saveProduct(formData, 'PUT', id);

                if (response.success) {
                    _showSuccess('Producto actualizado correctamente');
                    closeModalCallback();
                    this.loadProducts();
                } else {
                    // Mostrar errores del backend si vienen
                    if (response.errors && Array.isArray(response.errors)) {
                        this.showErrors(response.errors);
                    }
                    throw new Error(response.message || 'Error al actualizar el producto');
                }

            } catch (error) {
                console.error('❌ [PRODUCTS] Error al actualizar producto:', error);
                _showError(error.message || 'Error al actualizar el producto');
            } finally {
                _toggleButtonLoading(submitButton, false, originalButtonText);
            }
        },

        /**
         * Configura el manejador del formulario de productos
         */
        setupFormHandler: function() {
            const productForm = document.getElementById('producto-form');
            if (!productForm) {
                console.warn('⚠️ [PRODUCTS] Formulario de producto no encontrado');
                return;
            }

            // Evitar múltiples bindings del mismo submit
            if (productForm.dataset.bound === 'true') return;
            productForm.dataset.bound = 'true';

            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Evitar envíos duplicados mientras hay una solicitud en curso
                if (productForm.dataset.submitting === 'true') {
                    console.warn('⚠️ [PRODUCTS] Envío ignorado: ya hay una solicitud en curso');
                    return;
                }
                productForm.dataset.submitting = 'true';
                const submitButton = e.target.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;

                // Crear FormData con todos los campos del formulario
                const formData = new FormData(productForm);

                // Normalizar/forzar categoría desde cualquiera de los campos posibles
                const categoryFromForm =
                    formData.get('category') ||
                    productForm.querySelector('[name="category"]')?.value ||
                    formData.get('categoria') ||
                    productForm.querySelector('[name="categoria"]')?.value || '';

                if (categoryFromForm) {
                    formData.set('category', categoryFromForm);
                    if (!formData.get('categoria')) formData.append('categoria', categoryFromForm);
                    if (!formData.get('category_id')) formData.append('category_id', categoryFromForm);
                }

                // Validar formulario
                const errors = this.validateProductForm(formData);
                if (!this.showErrors(errors)) {
                    return;
                }

                // Mostrar loading
                _toggleButtonLoading(submitButton, true, originalButtonText);

                try {
                    console.log('=== INICIO DEBUG PRODUCTO ===');
                    console.log('Datos del formulario:', Array.from(formData.entries()));

                    // Determinar si es creación o actualización
                    const methodInput = productForm.querySelector('input[name="_method"]');
                    const method = methodInput ? methodInput.value : 'POST';
                    const productIdInput = document.getElementById('product-id');
                    const productId = productIdInput ? productIdInput.value : null;

                    // Guardar producto
                    const result = await this.saveProduct(formData, method, productId);

                    if (result.success) {
                        _showSuccess(result.message);
                        this.clearProductForm();

                        // Regresar a la vista de productos
                        if (window.showSection) {
                            window.showSection('productos');
                            setTimeout(() => this.loadProducts(), 500);
                        }
                    } else {
                        this.showErrors(result.errors);
                    }

                } catch (error) {
                    console.error('❌ [PRODUCTS] Error al procesar formulario:', error);
                    this.showErrors([
                        'Error inesperado al procesar la solicitud',
                        error.message
                    ]);
                } finally {
                    _toggleButtonLoading(submitButton, false, originalButtonText);
                    productForm.dataset.submitting = 'false';
                }
            });
        },

        /**
         * Limpia el formulario de producto
         */
        clearProductForm: function() {
            const form = document.getElementById('producto-form');
            if (!form) return;

            form.reset();

            // Limpiar previsualizaciones de imágenes
            const mainPreview = document.getElementById('product-main-preview');
            const galleryPreview = document.getElementById('product-gallery-preview');

            if (mainPreview) mainPreview.innerHTML = '';
            if (galleryPreview) galleryPreview.innerHTML = '';

            // Remover mensajes de error
            const existingErrors = document.querySelectorAll('.error-message');
            existingErrors.forEach(error => error.remove());

            // Resetear título y botón
            const formTitle = document.getElementById('form-title');
            const submitButton = document.getElementById('submit-button');

            if (formTitle) formTitle.textContent = 'Publicar Producto';
            if (submitButton) submitButton.textContent = 'Publicar Producto';

            // Remover método PUT si existe
            const methodInput = form.querySelector('input[name="_method"]');
            if (methodInput) {
                methodInput.remove();
            }

            // Resetear acción del formulario
            form.action = '/productos';

            // Limpiar producto actual
            currentProduct = null;
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
            // Eventos para botones de edición y eliminación
            document.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.btn-editar');
                if (editBtn) {
                    e.preventDefault();
                    const productId = editBtn.getAttribute('data-product-id');
                    if (productId) {
                        this.loadProductData(productId);
                    }
                    return;
                }

                const delBtn = e.target.closest('.btn-eliminar');
                if (delBtn) {
                    e.preventDefault();
                    const productId = delBtn.getAttribute('data-product-id');
                    const productName = delBtn.getAttribute('data-product-name');
                    if (productId && productName) {
                        this.deleteProduct(productId, productName);
                    }
                }
            });
        }
    };
})();

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Evitar doble inicialización si el script se carga dos veces
    if (window.__PRODUCT_MANAGER_INITIALIZED) {
        console.debug('ℹ️ [PRODUCTS] Inicialización omitida: ProductManager ya está inicializado.');
        return;
    }
    window.__PRODUCT_MANAGER_INITIALIZED = true;

    ProductManager.init();

    // Funciones globales para mantener compatibilidad
    window.loadProductData = (id) => ProductManager.loadProductData(id);
    window.deleteProduct = (id, name) => ProductManager.deleteProduct(id, name);
    window.resetProductForm = () => {
        ProductManager.clearProductForm();
        if (window.showSection) window.showSection('publicar-producto');
    };
    window.cancelProductForm = () => {
        ProductManager.clearProductForm();
        if (window.showSection) window.showSection('productos');
    };
});
