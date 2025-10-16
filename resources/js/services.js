/**
 * services.js - Gestión completa de servicios con integración API
 * Versión mejorada con manejo de errores robusto, validación avanzada y funcionalidad optimizada
 */

// Módulo de gestión de servicios
const ServicesApp = (function() {
    // Configuración privada
    const config = {
        apiBaseUrl: (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1'),
        servicesPerPage: 12,
        maxImageSize: 2 * 1024 * 1024, // 2MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'],
        minDescriptionLength: 10,
        maxPriceLimit: 999999999,
        phoneDigits: 10,
        debounceTime: 300,
        ratingOptions: [1, 2, 3, 4, 5]
    };

    // Estado privado
    let services = [];
    let filteredServices = [];
    let currentPage = 1;
    let isLoading = false;
    let currentUser = null;

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * Obtiene o crea el contenedor de la grilla de servicios.
     * Prioriza #services-grid; hace fallback a #services-list; crea uno si no existe.
     * @returns {HTMLElement} elemento contenedor
     */
    function _getServicesGridContainer() {
        let grid = document.getElementById('services-grid') || document.getElementById('services-list');
        if (!grid) {
            // Crear contenedor si no existe
            grid = document.createElement('div');
            grid.id = 'services-grid';
            grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

            // Insertar dentro de un contenedor conocido si existe
            const mainContainer = document.querySelector('.container.mx-auto') || document.querySelector('main') || document.body;
            mainContainer.appendChild(grid);
            console.log('🧩 [SERVICES] Contenedor de servicios creado dinámicamente (#services-grid)');
        }
        return grid;
    }

    /**
     * Obtiene el token CSRF
     * @returns {string} Token CSRF
     */
    function _getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        if (!token) {
            // En frontend desacoplado, preferimos Sanctum cookie si está habilitado
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
            toast.style.transition = 'opacity 0.3s, transform 0.3s';
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.display = 'none';
            document.body.appendChild(toast);
        }

        // Configurar según el tipo
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
        toast.style.color = '#fff';
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
        toast.style.display = 'block';

        // Animación de salida
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
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

            const form = document.getElementById('servicio-form');
            if (form) {
                form.insertBefore(errorContainer, form.firstChild);
                form.scrollIntoView({ behavior: 'smooth' });
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
     * Realiza una petición a la API
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de la petición
     * @returns {Promise} Promesa con la respuesta
     */
    async function _apiRequest(endpoint, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {})
        };

        const csrfToken = _getCsrfToken();
        if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

        // Token Bearer opcional
        if (window.API_AUTH_STRATEGY === 'token' && window.API_TOKEN) {
            headers['Authorization'] = `Bearer ${window.API_TOKEN}`;
        }

        const base = (config.apiBaseUrl || '/api').replace(/\/$/, '');
        let fullUrl = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

        // Cache-busting para GET y evitar datos obsoletos
        if (method === 'GET') {
            const sep = fullUrl.includes('?') ? '&' : '?';
            fullUrl = `${fullUrl}${sep}_=${Date.now()}`;
        }

        const mergedOptions = {
            method,
            headers,
            credentials: window.API_WITH_CREDENTIALS ? 'include' : (options.credentials || 'same-origin'),
            ...options
        };

        try {
            console.log(`📡 [API] ${mergedOptions.method} ${fullUrl}`);

            // Si usamos Sanctum y método no-GET, asegurar cookie CSRF
            if (window.API_WITH_CREDENTIALS && window.API_AUTH_STRATEGY === 'sanctum' && method !== 'GET') {
                try {
                    await fetch(`${(window.API_BASE_URL || '').replace(/\/$/, '')}/sanctum/csrf-cookie`, {
                        credentials: 'include'
                    });
                } catch (e) {
                    console.warn('⚠️ No se pudo obtener CSRF cookie de Sanctum:', e);
                }
            }

            const response = await fetch(fullUrl, mergedOptions);

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
            _showToast('Tipo de archivo no válido. Solo se permiten JPG/PNG.', 'error');
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
        if (price === undefined || price === null) return 'Consultar precio';
        return `$${parseInt(price).toLocaleString()}`;
    }

    /**
     * Obtiene el nombre de una categoría
     * @param {string|object} category - Categoría
     * @returns {string} Nombre de la categoría
     */
    function _getCategoryName(category) {
        const categoryMap = {
            'comida': 'Comida',
            'autolavado': 'Autolavado',
            'carpinteria': 'Carpintería',
            'belleza': 'Belleza y Spa',
            'tecnologia': 'Tecnología',
            'hogar': 'Hogar y Jardinería',
            'educacion': 'Educación',
            'salud': 'Salud y Bienestar',
            'limpieza': 'Servicios de Limpieza',
            'reparaciones': 'Reparaciones del Hogar',
            'jardineria': 'Jardinería y Paisajismo',
            'transporte': 'Servicios de Transporte',
            'eventos': 'Organización de Eventos',
            'otros': 'Otros'
        };

        if (typeof category === 'object' && category !== null) {
            return category.name || categoryMap[category.slug] || category.slug || 'Sin categoría';
        }
        return categoryMap[category] || category || 'Sin categoría';
    }

    /**
     * Genera HTML para la calificación por estrellas
     * @param {number} rating - Calificación (1-5)
     * @returns {string} HTML de las estrellas
     */
    function _generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-yellow-400"></i>';
        }

        return stars;
    }

    /**
     * Crea un elemento de tarjeta de servicio
     * @param {Object} service - Datos del servicio
     * @returns {HTMLElement} Elemento de la tarjeta
     */
    function _createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-lg shadow-lg overflow-hidden fade-in';

        const newBadge = service.isNew ?
            `<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NUEVO
            </div>` : '';

        const disponibilidadStatus = service.disponible ?
            `<button class="view-service-btn btn-primary w-full py-2 rounded-lg font-semibold transition-all duration-300" data-service-id="${service.id}">
                <i class="fas fa-eye"></i> Ver más
            </button>` :
            `<button class="bg-gray-400 text-white w-full py-2 rounded-lg font-semibold cursor-not-allowed" disabled>
                <i class="fas fa-times"></i> No Disponible
            </button>`;

        const stars = _generateStarRating(service.rating || 4.5);

        let imgSrc = '/images/ejemplo-servicios/hogar.jpg';
        if (service.imagen_principal) {
            if (service.imagen_principal.startsWith('images/')) {
                imgSrc = '/' + service.imagen_principal;
            } else if (service.imagen_principal.startsWith('http')) {
                imgSrc = service.imagen_principal;
            } else {
                imgSrc = '/storage/' + service.imagen_principal;
            }
        }

        const category = _getCategoryName(service.categoria);

        card.innerHTML = `
            <div class="relative">
             <img src="${imgSrc}" alt="${service.nombre_servicio}" class="w-full h-64 object-cover"
                 onerror="this.onerror=null;this.src='/images/ejemplo-servicios/hogar.jpg'">
                ${newBadge}
                <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <button class="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 view-service-details-btn"
                            data-service-id="${service.id}">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div class="category-tag inline-block mb-2">${category}</div>
                <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${service.nombre_servicio}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${service.descripcion}</p>
                <div class="flex items-center mb-3">
                    <div class="star-rating mr-2">${stars}</div>
                    <span class="text-sm text-gray-600">(${service.reviews || 0} reseñas)</span>
                </div>
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl font-bold text-red-600">${service.precio_base ? _formatPrice(service.precio_base) : 'Consultar'}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="text-gray-400 hover:text-red-600 transition-colors p-2"
                                onclick="ServicesApp.toggleServiceWishlist(${service.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="text-gray-400 hover:text-blue-600 transition-colors p-2"
                                onclick="ServicesApp.shareService(${service.id})">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <span class="text-xs text-gray-500">${service.direccion || 'Ubicación por confirmar'}</span>
                </div>
                <div class="mb-2">
                    <span class="text-xs text-gray-500">${service.horario_atencion || 'Horarios flexibles'}</span>
                </div>
                ${disponibilidadStatus}
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
        const service = services.find(s => s.id === serviceId);
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
     * Muestra loading mientras carga servicios
     */
    function _showServicesLoading() {
        const grid = _getServicesGridContainer();
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="loading-spinner mx-auto mb-4"></div>
                        <p class="text-gray-600">Cargando servicios...</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Muestra un error en la carga de servicios
     * @param {string} message - Mensaje de error
     */
    function _showServicesError(message) {
        const grid = _getServicesGridContainer();
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
                    <h3 class="text-xl font-medium text-red-600 mb-2">Error</h3>
                    <p class="text-gray-600">${message}</p>
                    <button onclick="ServicesApp.loadServices()" class="mt-4 btn-primary px-6 py-2 rounded-lg">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    /**
     * Actualiza el contador de servicios
     */
    function _updateServicesCount() {
        const count = document.getElementById('results-count');
        if (count) {
            count.textContent = filteredServices.length;
        }
    }

    /**
     * Actualiza la paginación de servicios
     */
    function _updateServicesPagination() {
        const totalPages = Math.ceil(filteredServices.length / config.servicesPerPage);
        const paginationContainer = document.getElementById('services-pagination');

        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Botón anterior
        if (currentPage > 1) {
            paginationHTML += `
                <button onclick="ServicesApp.changeServicesPage(${currentPage - 1})" class="pagination-btn">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="pagination-btn active">${i}</button>`;
            } else {
                paginationHTML += `<button onclick="ServicesApp.changeServicesPage(${i})" class="pagination-btn">${i}</button>`;
            }
        }

        // Botón siguiente
        if (currentPage < totalPages) {
            paginationHTML += `
                <button onclick="ServicesApp.changeServicesPage(${currentPage + 1})" class="pagination-btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    /**
     * Genera la sección del emprendedor para el modal
     * @param {Object} service - Datos del servicio
     * @returns {string} HTML de la sección
     */
    function _generateEntrepreneurSection(service) {
        if (!service.entrepreneur) {
            return '';
        }

        const entrepreneur = service.entrepreneur;
        const profileUrl = `/entrepreneur/${entrepreneur.id}/profile`;

        return `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <img src="${entrepreneur.profile_photo_url}"
                             alt="${entrepreneur.full_name}"
                             class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer"
                             onclick="window.open('${profileUrl}', '_blank')"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(entrepreneur.full_name)}&size=64&background=3B82F6&color=fff&bold=true'">
                        <div class="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <h4 class="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-300"
                                onclick="window.open('${profileUrl}', '_blank')">
                                ${entrepreneur.full_name}
                            </h4>
                            <i class="fas fa-external-link-alt text-gray-400 text-sm"></i>
                        </div>
                        <p class="text-sm text-gray-600 mb-1">
                            <i class="fas fa-store mr-1"></i>Emprendedor verificado
                        </p>
                        ${entrepreneur.city ? `
                            <p class="text-xs text-gray-500">
                                <i class="fas fa-map-marker-alt mr-1"></i>${entrepreneur.city}
                            </p>
                        ` : ''}
                        ${entrepreneur.profile_description ? `
                            <p class="text-xs text-gray-600 mt-2 line-clamp-2">
                                ${entrepreneur.profile_description}
                            </p>
                        ` : ''}
                    </div>
                    <div class="text-right">
                        <button onclick="window.open('${profileUrl}', '_blank')"
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md">
                            <i class="fas fa-user mr-2"></i>Ver Perfil
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Genera los botones de contacto para el modal
     * @param {Object} service - Datos del servicio
     * @returns {string} HTML de los botones
     */
    function _generateContactButtons(service) {
        if (!service.telefono) {
            return `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-info-circle mr-2"></i>
                    No hay información de contacto disponible
                </div>
            `;
        }

        const phoneDigits = service.telefono.replace(/\D/g, '');

        return `
            <div class="flex space-x-3 w-full">
                <a href="tel:${phoneDigits}" class="btn-primary flex-1 py-3 rounded-lg font-semibold text-center transition-all duration-300" target="_blank">
                    <i class="fas fa-phone mr-2"></i> Llamar
                </a>
                <a href="https://wa.me/${phoneDigits}?text=Hola,%20estoy%20interesado%20en%20el%20servicio%20${encodeURIComponent(service.nombre_servicio)}"
                   class="bg-green-500 hover:bg-green-600 text-white flex-1 py-3 rounded-lg font-semibold text-center transition-all duration-300" target="_blank">
                    <i class="fab fa-whatsapp mr-2"></i> WhatsApp
                </a>
            </div>
        `;
    }

    /**
     * Configura los eventos de cierre del modal
     */
    function _setupModalCloseEvents(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Click fuera del modal para cerrar
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                ServicesApp.closeServiceModal();
            }
        });

        // Escape key para cerrar
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById(modalId);
                if (modal && !modal.classList.contains('hidden')) {
                    ServicesApp.closeServiceModal();
                }
            }
        });

        // Configurar botón de cerrar
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                ServicesApp.closeServiceModal();
            };
        }
    }

    /**
     * Configura la subida de imágenes en el modal
     */
    function _setupImageUploadForModal() {
        const dropzone = document.getElementById('imageDropzone');
        const input = document.getElementById('imagen_principal');
        const preview = document.getElementById('imagePreview');

        if (!dropzone || !input || !preview) return;

        // Eventos de drag & drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-blue-500', 'bg-blue-50');
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-blue-500', 'bg-blue-50');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-blue-500', 'bg-blue-50');
            const files = e.dataTransfer.files;
            _handleImageUpload(files[0], preview, input);
        });

        // Evento de cambio de archivo
        input.addEventListener('change', (e) => {
            _handleImageUpload(e.target.files[0], preview, input);
        });
    }

    /**
     * Maneja la subida de imágenes
     * @param {File} file - Archivo de imagen
     * @param {HTMLElement} preview - Contenedor de previsualización
     * @param {HTMLElement} input - Input de archivo
     */
    function _handleImageUpload(file, preview, input) {
        if (!file) return;

        // Validaciones
        if (!_validateImageFile(file)) {
            input.value = '';
            return;
        }

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <div class="relative inline-block">
                    <img src="${e.target.result}" alt="Preview" class="w-32 h-32 object-cover rounded-lg border">
                    <button type="button" onclick="ServicesApp.removeImagePreview()"
                            class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Obtiene servicios estáticos de ejemplo
     * @returns {Array} Lista de servicios estáticos
     */
    function _getStaticServices() {
        return [
            {
                id: 99001,
                nombre_servicio: "Pizza Express",
                categoria: { name: "Comida", slug: "comida" },
                precio_base: 25000,
                descripcion: "Deliciosas pizzas artesanales con ingredientes frescos. Servicio a domicilio disponible las 24 horas.",
                imagen_principal: "images/ejemplo-servicios/pizza.jpg",
                direccion: "Calle 123, Ciudad Centro",
                telefono: "1234567890",
                horario_atencion: "Lun-Dom 10:00-22:00",
                rating: 4.5,
                reviews: 87,
                isNew: true,
                disponible: true,
                created_at: new Date().toISOString()
            },
            {
                id: 99002,
                nombre_servicio: "AutoLavado Premium",
                categoria: { name: "Autolavado", slug: "autolavado" },
                precio_base: 15000,
                descripcion: "Servicio completo de lavado y encerado. Cuidamos tu vehículo como si fuera nuestro con productos premium.",
                imagen_principal: "images/ejemplo-servicios/autolavado.jpg",
                direccion: "Av. Principal 456, Ciudad",
                telefono: "0987654321",
                horario_atencion: "Lun-Sab 8:00-18:00",
                rating: 4.8,
                reviews: 134,
                isNew: false,
                disponible: true,
                created_at: "2024-01-15T10:00:00Z"
            }
            // ... otros servicios estáticos
        ];
    }

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================

    return {
        /**
         * Inicializa la aplicación de servicios
         */
        init: function() {
            console.log('🛠️ [SERVICES] Inicializando ServicesApp');

            // Cargar servicios al inicio
            this.loadServices();

            // Configurar eventos globales
            this.setupEventListeners();

            // Configurar sidebar móvil
            this.setupMobileSidebar();

            console.log('✅ [SERVICES] ServicesApp inicializada correctamente');
        },

        /**
         * Carga servicios desde el servidor
         */
        async loadServices() {
            try {
                console.log('🔄 [SERVICES] Cargando servicios');

                // Mostrar loading
                _showServicesLoading();

                // Obtener servicios estáticos
                const staticServices = _getStaticServices();

                // Intentar obtener servicios del backend
                let backendServices = [];

                try {
                    const response = await _apiRequest('/servicios');

                    if (response.success && Array.isArray(response.data)) {
                        backendServices = response.data.map(service => ({
                            ...service,
                            categoria: service.categoria ? { name: service.categoria, slug: service.categoria } : { name: 'Otros', slug: 'otros' },
                            rating: service.rating || 4.0 + Math.random(),
                            reviews: service.reviews || Math.floor(Math.random() * 100) + 10,
                            isNew: service.created_at ? new Date(service.created_at) > new Date(Date.now() - 30*24*60*60*1000) : false,
                            disponible: service.disponible !== false
                        }));
                    }
                } catch (error) {
                    console.log('⚠️ [SERVICES] No se pudieron cargar servicios del backend, usando solo estáticos');
                }

                // Combinar servicios
                services = [...staticServices, ...backendServices];
                filteredServices = [...services];

                // Mostrar servicios
                this.displayServices();

            } catch (error) {
                console.error('❌ [SERVICES] Error al cargar servicios:', error);
                _showServicesError(error.message || 'Error al cargar los servicios');
            }
        },

        /**
         * Muestra servicios en la vista
         */
        displayServices: function() {
            const grid = _getServicesGridContainer();

            if (!grid) {
                console.warn('⚠️ [SERVICES] Contenedor de servicios no encontrado');
                return;
            }

            // Calcular paginación
            const startIndex = (currentPage - 1) * config.servicesPerPage;
            const endIndex = startIndex + config.servicesPerPage;
            const servicesToShow = filteredServices.slice(startIndex, endIndex);

            // Mostrar mensaje si no hay servicios
            if (filteredServices.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-medium text-gray-600 mb-2">No se encontraron servicios</h3>
                        <p class="text-gray-400">Intenta ajustar los filtros o busca con otros términos</p>
                    </div>
                `;
                return;
            }

            // Mostrar servicios (limpiar y anexar elementos)
            grid.innerHTML = '';
            servicesToShow.forEach(service => {
                const el = _createServiceCard(service);
                grid.appendChild(el);
            });

            // Actualizar paginación
            _updateServicesPagination();

            // Agregar clase de animación
            grid.classList.remove('fade-in');
            setTimeout(() => {
                grid.classList.add('fade-in');
                // Mostrar controles de administración después de renderizar
                this.showAdminControls();
            }, 100);

            // Actualizar contador
            _updateServicesCount();
        },

        /**
         * Cambia la página de servicios
         * @param {number} page - Número de página
         */
        changeServicesPage: function(page) {
            currentPage = page;
            this.displayServices();

            // Scroll hacia arriba
            const grid = _getServicesGridContainer();
            if (grid) {
                grid.scrollIntoView({ behavior: 'smooth' });
            }
        },

        /**
         * Filtra servicios por categoría
         * @param {string} category - Categoría a filtrar
         */
        filterServicesByCategory: function(category) {
            if (category === 'all' || category === 'todos') {
                filteredServices = [...services];
            } else {
                filteredServices = services.filter(service => {
                    const serviceCategory = service.categoria?.slug || service.categoria;
                    return serviceCategory === category;
                });
            }

            currentPage = 1;
            this.displayServices();
            _updateServicesCount();
        },

        /**
         * Busca servicios por término
         * @param {string} query - Término de búsqueda
         */
        searchServices: function(query) {
            const searchTerm = query.toLowerCase().trim();

            if (!searchTerm) {
                filteredServices = [...services];
            } else {
                filteredServices = services.filter(service => {
                    return (
                        service.nombre_servicio.toLowerCase().includes(searchTerm) ||
                        service.descripcion.toLowerCase().includes(searchTerm) ||
                        (service.categoria?.name || service.categoria || '').toLowerCase().includes(searchTerm) ||
                        (service.direccion || '').toLowerCase().includes(searchTerm)
                    );
                });
            }

            currentPage = 1;
            this.displayServices();
            _updateServicesCount();
        },

        /**
         * Filtra servicios por rango de precio
         */
        filterByPriceRange: function() {
            const minPrice = parseInt(document.getElementById('minPrice')?.value) || 0;
            const maxPrice = parseInt(document.getElementById('maxPrice')?.value) || Infinity;

            filteredServices = services.filter(service => {
                const price = service.precio_base || 0;
                return price >= minPrice && price <= maxPrice;
            });

            currentPage = 1;
            this.displayServices();
            _updateServicesCount();
        },

        /**
         * Filtra servicios por calificación mínima
         * @param {number} minRating - Calificación mínima
         */
        filterByRating: function(minRating) {
            filteredServices = services.filter(service => {
                const rating = service.rating || 0;
                return rating >= minRating;
            });

            currentPage = 1;
            this.displayServices();
            _updateServicesCount();
        },

        /**
         * Ordena servicios según criterio
         * @param {string} criteria - Criterio de ordenamiento
         */
        sortServices: function(criteria) {
            switch (criteria) {
                case 'newest':
                    filteredServices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'rating':
                    filteredServices.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
                case 'price-low':
                    filteredServices.sort((a, b) => (a.precio_base || 0) - (b.precio_base || 0));
                    break;
                case 'price-high':
                    filteredServices.sort((a, b) => (b.precio_base || 0) - (a.precio_base || 0));
                    break;
                case 'name':
                    filteredServices.sort((a, b) => a.nombre_servicio.localeCompare(b.nombre_servicio));
                    break;
            }

            currentPage = 1;
            this.displayServices();
        },

        /**
         * Limpia todos los filtros
         */
        clearAllFilters: function() {
            // Limpiar filtros de categoria
            document.querySelectorAll('.service-filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-category="all"]')?.classList.add('active');

            // Limpiar precio
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';

            // Limpiar calificación
            document.querySelectorAll('input[name="rating"]').forEach(input => input.checked = false);

            // Limpiar búsqueda
            const searchInput = document.getElementById('services-search');
            if (searchInput) searchInput.value = '';

            // Restablecer ordenamiento
            document.getElementById('sortServices').value = 'newest';

            // Restablecer servicios
            filteredServices = [...services];
            currentPage = 1;
            this.displayServices();
            _updateServicesCount();
        },

        /**
         * Muestra los detalles de un servicio en un modal
         * @param {number} serviceId - ID del servicio
         */
        async viewServiceDetails(serviceId) {
            // Primero intentar obtener el servicio actualizado de la API
            let service = services.find(s => s.id === serviceId);

            // Para servicios reales (no estáticos), obtener datos actualizados del servidor
            if (service && serviceId < 99000) {
                try {
                    // Intentar detalle directo en /servicios/{id}
                    const response = await _apiRequest(`/servicios/${serviceId}`);

                    if (response && (response.success || response.id)) {
                        // Algunos backends devuelven {success,data} y otros el objeto directo
                        service = response.data || response;
                    } else {
                        throw new Error('Respuesta detalle no válida');
                    }
                } catch (error) {
                    console.log('⚠️ [SERVICES] No se pudo obtener detalle directo, intentando lista y seleccionando por ID:', error?.message || error);
                    try {
                        const listResp = await _apiRequest('/servicios');
                        const items = Array.isArray(listResp?.data) ? listResp.data : (Array.isArray(listResp) ? listResp : []);
                        const found = items.find(it => Number(it.id) === Number(serviceId));
                        if (found) service = found;
                    } catch (e2) {
                        console.log('⚠️ [SERVICES] Fallback por lista también falló:', e2?.message || e2);
                    }
                }
            }

            if (!service) return;

            let imgSrc = '/images/ejemplo-servicios/hogar.jpg';
            if (service.imagen_principal) {
                if (service.imagen_principal.startsWith('images/')) {
                    imgSrc = '/' + service.imagen_principal;
                } else if (service.imagen_principal.startsWith('http')) {
                    imgSrc = service.imagen_principal;
                } else {
                    imgSrc = '/storage/' + service.imagen_principal;
                }
            }

            // Remover modal existente si existe
            const existingModal = document.getElementById('serviceModal');
            if (existingModal) {
                existingModal.remove();
            }

            const modalHTML = `
                <div id="serviceModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden">
                    <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-4">
                                <h2 class="text-2xl font-bold text-gray-800">${service.nombre_servicio}</h2>
                                <button class="modal-close-btn text-gray-600 hover:text-red-600 text-xl" onclick="ServicesApp.closeServiceModal()" type="button">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            ${_generateEntrepreneurSection(service)}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <img src="${imgSrc}" alt="${service.nombre_servicio}" class="w-full h-64 object-cover rounded-lg mb-4">
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-semibold text-gray-700 mb-2">Información de Contacto</h4>
                                        <div class="space-y-2 text-sm text-gray-600">
                                            <div class="flex items-center">
                                                <i class="fas fa-map-marker-alt w-4 mr-2 text-red-500"></i>
                                                <span>${service.direccion || 'Ubicación por confirmar'}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <i class="fas fa-phone w-4 mr-2 text-blue-500"></i>
                                                <span>${service.telefono || 'No disponible'}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <i class="fas fa-clock w-4 mr-2 text-green-500"></i>
                                                <span>${service.horario_atencion || 'Horarios flexibles'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div class="category-tag inline-block mb-2">${_getCategoryName(service.categoria?.slug || service.categoria)}</div>
                                    <div class="flex items-center mb-3">
                                        ${_generateStarRating(service.rating || 4.5)}
                                        <span class="ml-2 text-sm text-gray-600">(${service.reviews || 0} reseñas)</span>
                                    </div>
                                    <div class="flex items-center space-x-3 mb-4">
                                        <span class="text-3xl font-bold text-red-600">${service.precio_base ? _formatPrice(service.precio_base) : 'Consultar precio'}</span>
                                    </div>
                                    <p class="text-gray-700 mb-6">${service.descripcion}</p>
                                    <div class="bg-blue-50 p-4 rounded-lg mb-6">
                                        <h4 class="font-semibold text-blue-700 mb-2">
                                            <i class="fas fa-info-circle mr-2"></i>
                                            ¿Cómo contactar?
                                        </h4>
                                        <p class="text-sm text-blue-600">
                                            Puedes llamar directamente o escribir por WhatsApp para obtener más información sobre este servicio.
                                        </p>
                                    </div>
                                    ${_generateContactButtons(service)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Abrir modal
            this.openServiceModal();

            // Configurar eventos de cierre
            _setupModalCloseEvents('serviceModal');
        },

        /**
         * Cierra el modal de detalles del servicio
         */
        closeServiceModal: function() {
            const modal = document.getElementById('serviceModal');
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.style.opacity = '';
                    modal.style.transform = '';
                }, 200);
            }
        },

        /**
         * Abre el modal de detalles del servicio
         */
        openServiceModal: function() {
            const modal = document.getElementById('serviceModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modal.style.transform = 'scale(1)';
                }, 10);
            }
        },

        /**
         * Muestra el modal para crear un nuevo servicio
         */
        showCreateServiceModal: function() {
            const modalHTML = `
                <div id="createServiceModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-all duration-200" style="opacity: 0;">
                    <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto transform transition-all duration-200" style="transform: scale(0.95);">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-2xl font-bold text-gray-800">Agregar Nuevo Servicio</h2>
                                <button onclick="ServicesApp.closeCreateServiceModal()" class="text-gray-500 hover:text-gray-700 text-2xl">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <form id="createServiceForm" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio *</label>
                                        <input type="text" name="nombre_servicio" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                                        <select name="categoria" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value="">Seleccionar categoría...</option>
                                            <option value="limpieza">Servicios de Limpieza</option>
                                            <option value="reparaciones">Reparaciones del Hogar</option>
                                            <option value="jardineria">Jardinería y Paisajismo</option>
                                            <option value="transporte">Servicios de Transporte</option>
                                            <option value="tecnologia">Soporte Técnico</option>
                                            <option value="educacion">Educación y Tutorías</option>
                                            <option value="salud">Salud y Bienestar</option>
                                            <option value="eventos">Organización de Eventos</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                                    <textarea name="descripcion" required rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe tu servicio..."></textarea>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Precio Base</label>
                                        <input type="number" name="precio_base" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                        <input type="tel" name="telefono" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+1234567890">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Horario de Atención</label>
                                        <input type="text" name="horario_atencion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Lunes a Viernes 9-17h">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                    <input type="text" name="direccion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Dirección del servicio...">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
                                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                         id="imageDropzone" onclick="document.getElementById('imagen_principal').click()">
                                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                                        <p class="text-gray-600 mb-1">Arrastra una imagen o haz clic para seleccionar</p>
                                        <p class="text-xs text-gray-500">Máximo 2MB - JPG, PNG</p>
                                        <input type="file" name="imagen_principal" id="imagen_principal" accept="image/jpeg,image/png" class="hidden">
                                    </div>
                                    <div id="imagePreview" class="mt-3"></div>
                                </div>
                                <div class="flex justify-end space-x-3 pt-4">
                                    <button type="button" onclick="ServicesApp.closeCreateServiceModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn-primary px-6 py-2 rounded-lg font-semibold transition-all duration-300">
                                        <i class="fas fa-save mr-2"></i> Guardar Servicio
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Animaciones
            const modal = document.getElementById('createServiceModal');
            const modalContent = modal.querySelector('.bg-white');

            setTimeout(() => {
                modal.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);

            // Event listeners
            modal.addEventListener('click', function(e) {
                if (e.target === this) ServicesApp.closeCreateServiceModal();
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') ServicesApp.closeCreateServiceModal();
            });

            // Form submission
            document.getElementById('createServiceForm').addEventListener('submit', this.handleCreateServiceSubmit);

            // Setup image upload functionality
            _setupImageUploadForModal();
        },

        /**
         * Cierra el modal de creación de servicio
         */
        closeCreateServiceModal: function() {
            const modal = document.getElementById('createServiceModal');
            if (modal) {
                modal.style.opacity = '0';
                modal.querySelector('.bg-white').style.transform = 'scale(0.95)';
                setTimeout(() => {
                    modal.remove();
                }, 200);
            }
        },

        /**
         * Maneja el envío del formulario de creación de servicio
         * @param {Event} e - Evento de envío
         */
        handleCreateServiceSubmit: async function(e) {
            e.preventDefault();
            const form = e.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;

            // Loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Guardando...';

            try {
                const formData = new FormData(form);

                // Agregar CSRF token
                const csrfToken = document.querySelector('meta[name="csrf-token"]');
                if (csrfToken) {
                    formData.append('_token', csrfToken.getAttribute('content'));
                }

                const response = await _apiRequest('/servicios', {
                    method: 'POST',
                    body: formData
                });

                if (response.success) {
                    // Cerrar modal
                    this.closeCreateServiceModal();

                    // Mostrar mensaje de éxito
                    _showToast('Servicio creado exitosamente', 'success');

                    // Recargar servicios
                    this.loadServices();
                } else {
                    _showToast(response.message || 'Error al crear el servicio', 'error');
                }

            } catch (error) {
                console.error('❌ [SERVICES] Error al crear servicio:', error);
                _showToast(error.message || 'Error de conexión al crear el servicio', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        },

        /**
         * Elimina la previsualización de la imagen
         */
        removeImagePreview: function() {
            const preview = document.getElementById('imagePreview');
            const input = document.getElementById('imagen_principal');

            if (preview) preview.innerHTML = '';
            if (input) input.value = '';
        },

        /**
         * Alternar servicio en wishlist
         * @param {number} serviceId - ID del servicio
         */
        toggleServiceWishlist: function(serviceId) {
            console.log('💖 [SERVICES] Agregado a favoritos:', serviceId);
            // Implementar lógica de favoritos
        },

        /**
         * Comparte un servicio
         * @param {number} serviceId - ID del servicio
         */
        shareService: function(serviceId) {
            const service = services.find(s => s.id === serviceId);

            if (service && navigator.share) {
                navigator.share({
                    title: service.nombre_servicio,
                    text: service.descripcion,
                    url: window.location.href
                });
            } else {
                // Fallback para navegadores que no soportan Web Share API
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                    _showToast('Enlace copiado al portapapeles', 'success');
                });
            }
        },

        /**
         * Muestra los controles de administración si el usuario es emprendedor
         */
        showAdminControls: function() {
            if (window.isEntrepreneurLoggedIn) {
                const adminControls = document.querySelectorAll('.admin-controls');
                adminControls.forEach(control => {
                    control.style.display = 'flex';
                });
            }
        },

        /**
         * Configura los eventos globales
         */
        setupEventListeners: function() {
            // Event delegation para botones de ver detalles
            document.addEventListener('click', (e) => {
                if (e.target.closest('.view-service-details-btn') || e.target.closest('.view-service-btn')) {
                    const button = e.target.closest('.view-service-details-btn') || e.target.closest('.view-service-btn');
                    const serviceId = parseInt(button.dataset.serviceId);
                    this.viewServiceDetails(serviceId);
                }
            });

            // Configurar búsqueda si existe el input
            const searchInput = document.getElementById('services-search');
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        this.searchServices(e.target.value);
                    }, config.debounceTime);
                });
            }

            // Configurar filtros si existen
            const filterButtons = document.querySelectorAll('.service-filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const category = button.dataset.category;
                    this.filterServicesByCategory(category);

                    // Actualizar estado activo
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });
        },

        /**
         * Configura el sidebar móvil
         */
        setupMobileSidebar: function() {
            const mobileToggle = document.getElementById('mobileFilterToggle');
            const sidebar = document.getElementById('filterSidebar');
            const overlay = document.getElementById('sidebarOverlay');
            const closeSidebar = document.getElementById('closeSidebar');

            if (mobileToggle && sidebar) {
                mobileToggle.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                    if (overlay) overlay.classList.toggle('active');
                });
            }

            if (closeSidebar && sidebar) {
                closeSidebar.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                });
            }

            if (overlay) {
                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                });
            }
        },

        /**
         * Configura eventos adicionales
         */
        setupAdditionalEvents: function() {
            // Filtro de precio
            const applyPriceBtn = document.getElementById('applyPriceFilter');
            if (applyPriceBtn) {
                applyPriceBtn.addEventListener('click', () => this.filterByPriceRange());
            }

            // Filtros de calificación
            document.querySelectorAll('input[name="rating"]').forEach(input => {
                input.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.filterByRating(parseInt(e.target.value));
                    }
                });
            });

            // Ordenamiento
            const sortSelect = document.getElementById('sortServices');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    this.sortServices(e.target.value);
                });
            }

            // Limpiar filtros
            const clearBtn = document.getElementById('clearServiceFilters');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearAllFilters());
            }
        }
    };
})();

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ServicesApp.init();

    // Exportar funciones globales para compatibilidad
    window.ServicesApp = ServicesApp;
    window.loadServices = ServicesApp.loadServices;
    window.viewServiceDetails = ServicesApp.viewServiceDetails;
    window.closeServiceModal = ServicesApp.closeServiceModal;
    window.openServiceModal = ServicesApp.openServiceModal;
    window.toggleServiceWishlist = ServicesApp.toggleServiceWishlist;
    window.shareService = ServicesApp.shareService;
    window.showCreateServiceModal = ServicesApp.showCreateServiceModal;
    window.closeCreateServiceModal = ServicesApp.closeCreateServiceModal;
    window.removeImagePreview = ServicesApp.removeImagePreview;
    window.addNewService = ServicesApp.showCreateServiceModal;
});
