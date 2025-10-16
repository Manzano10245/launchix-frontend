/**
 * Product.js - Gestión completa de productos con integración API
 * Versión mejorada con manejo de errores robusto, logging detallado y funcionalidad avanzada
 */

// Estado de la aplicación
const ProductApp = (function() {
    // Configuración privada
    const config = {
        apiBaseUrl: (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1'),
        maxImageSize: 2 * 1024 * 1024, // 2MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'],
        maxGalleryImages: 5,
        debounceTime: 300,
        localStorageKeys: {
            cart: 'shopping_cart',
            wishlist: 'wishlist'
        }
    };

    // Estado privado
    let products = [];
    let filteredProducts = [];
    let cart = [];
    let wishlist = [];
    let isLoading = false;
    let currentProduct = null;

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
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        errorDiv.style.transform = 'translateX(400px)';
        errorDiv.style.opacity = '0';

        if (Array.isArray(message)) {
            errorDiv.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        ${message.map(msg => `<div>${msg}</div>`).join('')}
                    </div>
                </div>
            `;
        } else {
            errorDiv.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${message}</span>
                </div>
            `;
        }

        document.body.appendChild(errorDiv);

        // Animación de entrada
        setTimeout(() => {
            errorDiv.style.transform = 'translateX(0)';
            errorDiv.style.opacity = '1';
        }, 10);

        // Animación de salida
        setTimeout(() => {
            errorDiv.style.transform = 'translateX(400px)';
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje de éxito
     */
    function _showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        successDiv.style.transform = 'translateX(400px)';
        successDiv.style.opacity = '0';

        successDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(successDiv);

        // Animación de entrada
        setTimeout(() => {
            successDiv.style.transform = 'translateX(0)';
            successDiv.style.opacity = '1';
        }, 10);

        // Animación de salida
        setTimeout(() => {
            successDiv.style.transform = 'translateX(400px)';
            successDiv.style.opacity = '0';
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
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
        if (window.API_AUTH_STRATEGY === 'token' && window.API_TOKEN) {
            headers['Authorization'] = `Bearer ${window.API_TOKEN}`;
        }

        const base = (config.apiBaseUrl || '/api').replace(/\/$/, '');
        const fullUrl = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

        const mergedOptions = {
            method,
            headers,
            credentials: window.API_WITH_CREDENTIALS ? 'include' : (options.credentials || 'same-origin'),
            ...options
        };

        try {
            console.log(`📡 [API] ${mergedOptions.method} ${fullUrl}`);
            if (window.API_WITH_CREDENTIALS && window.API_AUTH_STRATEGY === 'sanctum' && method !== 'GET') {
                try { await fetch(`${(window.API_BASE_URL || '').replace(/\/$/, '')}/sanctum/csrf-cookie`, { credentials: 'include' }); } catch {}
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
     * Obtiene el nombre de una categoría
     * @param {string|object} category - Categoría
     * @returns {string} Nombre de la categoría
     */
    function _getCategoryName(category) {
        const categoryMap = {
            'electronica': 'Electrónicos',
            'ropa': 'Ropa',
            'hogar': 'Hogar',
            'deportes': 'Deportes',
            'libros': 'Libros',
            'juguetes': 'Juguetes',
            'belleza': 'Belleza',
            'automotriz': 'Automotriz',
            'general': 'General',
            'alimentos': 'Alimentos y Bebidas',
            'muebles': 'Muebles',
            'tecnologia': 'Tecnología',
            'decoracion': 'Decoración'
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
     * Calcula el descuento entre dos precios
     * @param {number} currentPrice - Precio actual
     * @param {number} originalPrice - Precio original
     * @returns {number} Porcentaje de descuento
     */
    function _calculateDiscount(currentPrice, originalPrice) {
        if (!originalPrice || originalPrice <= currentPrice) return 0;
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    /**
     * Verifica si un producto es nuevo (menos de 30 días)
     * @param {string} createdAt - Fecha de creación
     * @returns {boolean} True si el producto es nuevo
     */
    function _isProductNew(createdAt) {
        if (!createdAt) return false;
        try {
            const productDate = new Date(createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - productDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
        } catch (e) {
            return false;
        }
    }

    /**
     * Transforma datos de producto de la API
     * @param {Object} apiProduct - Producto de la API
     * @returns {Object} Producto transformado
     */
    function _transformProductData(apiProduct) {
        const resolved = _normalizeRawProduct(apiProduct);
        return resolved;
    }

    /**
     * Resuelve una imagen cualquiera (absoluta, relativa, storage, nula)
     */
    function _resolveImage(raw, { placeholder = 'https://via.placeholder.com/300x300/F77786/FFFFFF?text=Producto' } = {}) {
        if (!raw) return placeholder;
        if (/^data:/.test(raw)) return raw; // base64
        if (/^https?:\/\//i.test(raw)) return raw; // absoluta
        // Construir base API
        const base = (window.API_BASE_URL || '').replace(/\/$/, '');
        // Quitar barras iniciales repetidas
        let path = raw.replace(/^\/+/, '');
        // Si ya incluye storage/
        if (/^storage\//.test(path)) return `${base}/${path}`;
        // Quitar prefijo public/
        path = path.replace(/^public\//, '');
        // Añadir storage por defecto
        return `${base}/storage/${path}`;
    }

    /**
     * Normaliza diferentes nombres de campos provenientes del backend
     */
    function _normalizeRawProduct(p) {
        if (!p || typeof p !== 'object') return null;

        // Nombres alternativos
        const id = p.id || p.product_id || null;
        const name = p.name || p.nombre || p.title || 'Producto';
        const description = p.description || p.descripcion || p.details || '';
        const price = parseFloat(p.price || p.precio || p.current_price || 0) || 0;
        const originalPrice = parseFloat(p.original_price || p.precio_original || p.old_price || price) || price;
        const stock = parseInt(p.stock || p.in_stock || p.existencias || 0) || 0;
        const rating = parseFloat(p.rating || p.calificacion || p.stars || 4) || 4;
        const reviews = parseInt(p.reviews_count || p.reviews || p.opiniones || 0) || 0;
        const brand = p.brand || p.marca || '';
        const sku = p.sku || p.codigo || '';
        const createdAt = p.created_at || p.fecha_creacion || new Date().toISOString();

        // Imágenes posibles
        const mainImage = p.main_image || p.image || p.imagen || '';
        const galleryRaw = p.gallery_images || p.gallery || p.galeria || [];
        const gallery = Array.isArray(galleryRaw) ? galleryRaw.map(img => _resolveImage(img)) : [];

        // Categoría
        let categoryObj = { name: 'General', slug: 'general' };
        if (p.category && typeof p.category === 'object') {
            categoryObj = {
                name: p.category.name || p.category.nombre || 'General',
                slug: p.category.slug || p.category.code || 'general'
            };
        } else if (typeof p.category === 'string') {
            categoryObj = { name: p.category, slug: (p.category || 'general').toLowerCase() };
        }

        // Descuento
        const discount = _calculateDiscount(price, originalPrice);

        // Emprendedor
        const ent = p.entrepreneur || p.emprendedor || p.seller || null;
        let entrepreneur = null;
        if (ent && typeof ent === 'object') {
            const entName = ent.name || `${ent.first_name || ''} ${ent.last_name || ''}`.trim() || ent.business_name || '';
            const entBusiness = ent.business_name || entName;
            entrepreneur = {
                id: ent.id,
                name: entName,
                business_name: entBusiness,
                avatar: _resolveImage(ent.avatar || ent.logo || '')
            };
        }

        return {
            id,
            name,
            category: categoryObj,
            price,
            originalPrice,
            rating,
            reviews,
            image: _resolveImage(mainImage),
            gallery,
            description,
            inStock: stock > 0,
            stock,
            isNew: _isProductNew(createdAt),
            discount,
            brand,
            sku,
            created_at: createdAt,
            entrepreneur
        };
    }

    /**
     * Muestra/oculta el loading
     * @param {boolean} show - Mostrar u ocultar
     */
    function _toggleLoading(show) {
        const loading = document.getElementById('loadingSpinner');
        if (loading) {
            loading.classList.toggle('hidden', !show);
        }
    }

    /**
     * Muestra el mensaje de "no hay productos"
     */
    function _showNoProducts() {
        const grid = document.getElementById('productsGrid');
        const noProducts = document.getElementById('noProducts');

        if (grid) grid.classList.add('hidden');
        if (noProducts) noProducts.classList.remove('hidden');
    }

    /**
     * Oculta el mensaje de "no hay productos"
     */
    function _hideNoProducts() {
        const noProducts = document.getElementById('noProducts');
        if (noProducts) noProducts.classList.add('hidden');
    }

    /**
     * Actualiza el contador de productos
     * @param {number} count - Número de productos
     */
    function _updateProductCount(count) {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            countElement.textContent = `Mostrando ${count} productos`;
        }
    }

    /**
     * Cierra el sidebar de filtros
     */
    function _closeSidebar() {
        const filterSidebar = document.getElementById('filterSidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (filterSidebar) filterSidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    /**
     * Función debounce para optimizar eventos frecuentes
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función con debounce
     */
    function _debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================

    return {
        /**
         * Inicializa la aplicación
         */
        init: async function() {
            console.log('🛒 [PRODUCTS] Inicializando aplicación de productos');

            try {
                // Cargar datos iniciales
                await this.loadProducts();
                this.loadCartFromLocalStorage();
                this.loadWishlistFromLocalStorage();

                // Configurar event listeners
                this.setupEventListeners();

                // Inicializar UI
                this.updateCartBadge();
                this.updateMiniCart();
                this.initializeWishlistIcons();

                console.log('✅ [PRODUCTS] Aplicación inicializada correctamente');

            } catch (error) {
                console.error('❌ [PRODUCTS] Error durante la inicialización:', error);
                _showError('Error al inicializar la aplicación');
            }
        },

        /**
         * Carga productos desde la API
         */
        loadProducts: async function() {
            try {
                _toggleLoading(true);

                console.log('🔄 [PRODUCTS] Cargando productos desde API');

                // Obtener productos estáticos (para desarrollo)
                const staticProducts = this.getStaticProducts();

                // Obtener productos de la API
                const response = await _apiRequest('/products');
                console.log('[PRODUCTS][RAW]', response);

                // Posibles formatos: { success:true, data:[...] } | { data:{ data:[...] }} (paginación) | [arrayPlano]
                let list = [];
                if (Array.isArray(response)) {
                    list = response;
                } else if (response && Array.isArray(response.data)) {
                    // Caso éxito simple: { data: [...] } o { success:true,data:[...] }
                    list = response.data;
                } else if (response && response.data && Array.isArray(response.data.data)) {
                    // Paginación Laravel: { data: { data: [...] , current_page: ... } }
                    list = response.data.data;
                } else if (response && response.success && response.results && Array.isArray(response.results)) {
                    list = response.results;
                }

                if (!list.length) {
                    console.warn('[PRODUCTS] Lista vacía o formato no reconocido. Usando productos estáticos.');
                    throw new Error('Formato de respuesta no reconocido');
                }

                // Transformar y combinar productos
                const apiProducts = list.map(product => _transformProductData(product)).filter(Boolean);
                products = [...staticProducts, ...apiProducts];
                filteredProducts = [...products];

                console.log(`✅ [PRODUCTS] ${products.length} productos cargados`);

                // Mostrar productos
                this.displayProducts();

            } catch (error) {
                console.error('❌ [PRODUCTS] Error al cargar productos:', error);

                // Usar solo productos estáticos en caso de error
                products = this.getStaticProducts();
                filteredProducts = [...products];
                this.displayProducts();

                _showError(error.message || 'Error al cargar productos. Usando datos locales.');

            } finally {
                _toggleLoading(false);
            }
        },

        /**
         * Obtiene productos estáticos (para desarrollo)
         * @returns {Array} Lista de productos estáticos
         */
        getStaticProducts: function() {
            return [
                {
                    id: 99001,
                    name: "Smartphone Samsung Galaxy A54",
                    category: { name: "Electrónicos", slug: "electronica" },
                    price: 299999,
                    originalPrice: 349999,
                    rating: 4.5,
                    reviews: 128,
                    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
                    gallery: [],
                    description: "Smartphone con pantalla AMOLED de 6.4 pulgadas, cámara triple de 50MP y batería de 5000mAh.",
                    inStock: true,
                    stock: 25,
                    isNew: true,
                    discount: 14,
                    brand: "Samsung",
                    sku: "SAM-A54-001",
                    created_at: new Date().toISOString()
                },
                {
                    id: 99002,
                    name: "Auriculares Bluetooth Sony WH-1000XM4",
                    category: { name: "Electrónicos", slug: "electronica" },
                    price: 199999,
                    originalPrice: 199999,
                    rating: 4.8,
                    reviews: 89,
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
                    gallery: [],
                    description: "Auriculares inalámbricos con cancelación de ruido líder en la industria.",
                    inStock: true,
                    stock: 15,
                    isNew: false,
                    discount: 0,
                    brand: "Sony",
                    sku: "SONY-WH1000-001",
                    created_at: "2024-01-15T10:00:00Z"
                }
                // ... otros productos estáticos
            ];
        },

        /**
         * Muestra productos en la vista
         */
        displayProducts: function() {
            const grid = document.getElementById('productsGrid');

            if (!grid) {
                console.warn('⚠️ [PRODUCTS] Contenedor de productos no encontrado');
                return;
            }

            if (filteredProducts.length === 0) {
                _showNoProducts();
                return;
            }

            _hideNoProducts();
            grid.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');

            _updateProductCount(filteredProducts.length);

            // Configurar eventos para los nuevos elementos
            this.setupProductCardEvents();

            grid.classList.remove('hidden');
            grid.classList.add('fade-in');
        },

        /**
         * Crea una tarjeta de producto
         * @param {Object} product - Datos del producto
         * @returns {string} HTML de la tarjeta
         */
        createProductCard: function(product) {
            const discountBadge = product.discount > 0 ?
                `<div class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -${product.discount}%
                </div>` : '';

            const newBadge = product.isNew ?
                `<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    NUEVO
                </div>` : '';

            const stockStatus = product.inStock ?
                `<button class="add-to-cart btn-primary w-full py-2 rounded-lg font-semibold transition-all duration-300" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>` :
                `<button class="bg-gray-400 text-white w-full py-2 rounded-lg font-semibold cursor-not-allowed" disabled>
                    <i class="fas fa-times"></i> Sin Stock
                </button>`;

            const stars = _generateStarRating(product.rating);
            const reviewsCount = product.reviews !== undefined ? product.reviews : 0;

            return `
                <div class="product-card bg-white rounded-lg shadow-lg overflow-hidden fade-in">
                    <div class="relative overflow-hidden">
                        <div class="product-image-container">
                            <img src="${product.image}" alt="${product.name}"
                                class="product-image w-full h-64 object-cover"
                                onerror="this.src='https://via.placeholder.com/300x300/F77786/FFFFFF?text=Producto'">
                        </div>
                        ${discountBadge}
                        ${newBadge}
                        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                            <button class="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 view-details-btn"
                                    data-product-id="${product.id}">
                                <i class="fas fa-eye"></i> Ver Detalles
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        ${product.brand ? `<div class="text-xs text-gray-500 mb-1">${product.brand}</div>` : ''}
                        <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-1">${product.name}</h3>
                        <p class="text-gray-600 text-sm mb-3 line-clamp-2 truncate">${product.description}</p>
                        <div class="flex items-center mb-3">
                            <div class="star-rating mr-2">${stars}</div>
                            <span class="text-sm text-gray-600">(${reviewsCount} reseñas)</span>
                        </div>
                        <div class="flex items-center mb-2">
                            <span class="text-2xl font-bold text-red-600 truncate">${_formatPrice(product.price)}</span>
                            ${product.originalPrice > product.price ?
                                `<span class="text-lg text-gray-400 line-through ml-2">${_formatPrice(product.originalPrice)}</span>` : ''}
                        </div>
                        <div class="flex justify-between items-center mb-4">
                            ${product.discount > 0 ?
                                `<span class="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                    -${product.discount}% OFF
                                </span>` : '<div></div>'}
                            <div class="flex space-x-2">
                                <button class="text-gray-400 hover:text-red-600 p-2 wishlist-btn"
                                        data-product-id="${product.id}"
                                        title="Agregar a favoritos">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <button class="text-gray-400 hover:text-blue-600 p-2"
                                        onclick="ProductApp.shareProduct(${product.id})"
                                        title="Compartir">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-2">
                            ${product.stock <= 0 ?
                                `<span class="text-sm font-semibold text-red-600">Sin stock</span>` :
                                product.stock <= 5 ?
                                    `<span class="text-sm font-semibold text-red-600">¡Solo quedan ${product.stock}!</span>` :
                                    `<span class="text-xs text-gray-500">Stock: ${product.stock} disponibles</span>`}
                        </div>
                        ${stockStatus}
                    </div>
                </div>
            `;
        },

        /**
         * Configura eventos para las tarjetas de producto
         */
        setupProductCardEvents: function() {
            // Botones de "Agregar al carrito"
            document.querySelectorAll('.add-to-cart').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.productId);
                    ProductApp.addToCart(productId);
                });
            });

            // Botones de "Ver detalles"
            document.querySelectorAll('.view-details-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.productId);
                    ProductApp.viewProductDetails(productId);
                });
            });

            // Botones de wishlist
            document.querySelectorAll('.wishlist-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.productId);
                    ProductApp.toggleWishlist(productId, this.querySelector('i'));
                });
            });
        },

        /**
         * Configura todos los event listeners
         */
        setupEventListeners: function() {
            console.log('🎧 [PRODUCTS] Configurando event listeners');

            // Filtros de categoría
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    ProductApp.filterProducts();
                });
            });

            // Ordenamiento
            document.getElementById('sortBy')?.addEventListener('change', function() {
                ProductApp.sortProducts(this.value);
            });

            // Filtros de precio
            document.getElementById('minPrice')?.addEventListener('input', _debounce(ProductApp.filterProducts, config.debounceTime));
            document.getElementById('maxPrice')?.addEventListener('input', _debounce(ProductApp.filterProducts, config.debounceTime));

            // Filtros de calificación
            document.querySelectorAll('.rating-filter').forEach(filter => {
                filter.addEventListener('change', ProductApp.filterProducts);
            });

            // Limpiar filtros
            document.getElementById('clearFilters')?.addEventListener('click', ProductApp.clearAllFilters);

            // Toggle sidebar de filtros
            document.getElementById('toggleFilters')?.addEventListener('click', function() {
                document.getElementById('filterSidebar')?.classList.add('active');
                document.getElementById('sidebarOverlay')?.classList.add('active');
            });

            // Cerrar sidebar
            document.getElementById('closeSidebar')?.addEventListener('click', _closeSidebar);
            document.getElementById('sidebarOverlay')?.addEventListener('click', _closeSidebar);

            // Toggle mini carrito
            document.getElementById('cartToggle')?.addEventListener('click', function(e) {
                e.preventDefault();
                ProductApp.toggleMiniCart();
            });

            // Cerrar mini carrito
            document.getElementById('closeMiniCart')?.addEventListener('click', function() {
                document.getElementById('miniCart')?.classList.add('hidden');
            });

            // Búsqueda
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', _debounce(function(e) {
                    const searchTerm = e.target.value.toLowerCase().trim();

                    if (searchTerm === '') {
                        filteredProducts = [...products];
                    } else {
                        filteredProducts = products.filter(product =>
                            product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm) ||
                            (product.brand && product.brand.toLowerCase().includes(searchTerm))
                        );
                    }

                    ProductApp.displayProducts();
                }, config.debounceTime));
            }

            // Cerrar modales al hacer clic fuera
            document.addEventListener('click', function(e) {
                // Cerrar modal de categorías
                const categoriesModal = document.getElementById('categoriesModal');
                const categoriesButton = document.getElementById('categoriesButton');
                if (categoriesModal && categoriesButton &&
                    !categoriesButton.contains(e.target) && !categoriesModal.contains(e.target)) {
                    categoriesModal.classList.add('hidden');
                }

                // Cerrar mini carrito
                const miniCart = document.getElementById('miniCart');
                const cartToggle = document.getElementById('cartToggle');
                if (miniCart && cartToggle &&
                    !cartToggle.contains(e.target) && !miniCart.contains(e.target)) {
                    miniCart.classList.add('hidden');
                }

                // Cerrar sidebar de filtros en mobile
                const filterSidebar = document.getElementById('filterSidebar');
                const toggleFilters = document.getElementById('toggleFilters');
                const sidebarOverlay = document.getElementById('sidebarOverlay');
                if (filterSidebar && toggleFilters && window.innerWidth < 1024 &&
                    !toggleFilters.contains(e.target) && !filterSidebar.contains(e.target)) {
                    filterSidebar.classList.remove('active');
                    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
                }
            });
        },

        /**
         * Filtra productos según criterios
         */
        filterProducts: function() {
            const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
            const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
            const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
            const selectedRatings = Array.from(document.querySelectorAll('.rating-filter:checked'))
                .map(cb => parseFloat(cb.dataset.rating));

            filteredProducts = products.filter(product => {
                const matchesCategory = activeCategory === 'all' || product.category.slug === activeCategory;
                const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
                const matchesRating = selectedRatings.length === 0 ||
                    selectedRatings.some(rating => product.rating >= rating);

                return matchesCategory && matchesPrice && matchesRating;
            });

            this.displayProducts();
        },

        /**
         * Ordena productos según criterio
         * @param {string} sortBy - Criterio de ordenamiento
         */
        sortProducts: function(sortBy) {
            switch (sortBy) {
                case 'price-low':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'name-asc':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                default:
                    this.filterProducts();
                    return;
            }

            this.displayProducts();
        },

        /**
         * Limpia todos los filtros
         */
        clearAllFilters: function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-category="all"]')?.classList.add('active');

            if (document.getElementById('minPrice')) document.getElementById('minPrice').value = '';
            if (document.getElementById('maxPrice')) document.getElementById('maxPrice').value = '';

            document.querySelectorAll('.rating-filter').forEach(cb => cb.checked = false);

            if (document.getElementById('sortBy')) document.getElementById('sortBy').value = 'featured';
            if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';

            filteredProducts = [...products];
            this.displayProducts();
        },

        /**
         * Carga el carrito desde localStorage
         */
        loadCartFromLocalStorage: function() {
            try {
                const savedCart = localStorage.getItem(config.localStorageKeys.cart);
                if (savedCart) {
                    cart = JSON.parse(savedCart);
                    console.log('✅ [CART] Carrito cargado desde localStorage:', cart.length, 'productos');
                } else {
                    cart = [];
                }
            } catch (error) {
                console.error('❌ [CART] Error cargando carrito:', error);
                cart = [];
            }
        },

        /**
         * Guarda el carrito en localStorage
         */
        saveCartToLocalStorage: function() {
            try {
                localStorage.setItem(config.localStorageKeys.cart, JSON.stringify(cart));
                console.log('💾 [CART] Carrito guardado en localStorage');
            } catch (error) {
                console.error('❌ [CART] Error guardando carrito:', error);
            }
        },

        /**
         * Carga la wishlist desde localStorage
         */
        loadWishlistFromLocalStorage: function() {
            try {
                const savedWishlist = localStorage.getItem(config.localStorageKeys.wishlist);
                if (savedWishlist) {
                    wishlist = JSON.parse(savedWishlist);
                    console.log('✅ [WISHLIST] Wishlist cargada desde localStorage:', wishlist.length, 'productos');
                } else {
                    wishlist = [];
                }
            } catch (error) {
                console.error('❌ [WISHLIST] Error cargando wishlist:', error);
                wishlist = [];
            }
        },

        /**
         * Guarda la wishlist en localStorage
         */
        saveWishlistToLocalStorage: function() {
            try {
                localStorage.setItem(config.localStorageKeys.wishlist, JSON.stringify(wishlist));
                console.log('💾 [WISHLIST] Wishlist guardada en localStorage');
            } catch (error) {
                console.error('❌ [WISHLIST] Error guardando wishlist:', error);
            }
        },

        /**
         * Actualiza el badge del carrito
         */
        updateCartBadge: function() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const badge = document.getElementById('cartBadge');

            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'inline' : 'none';
            }
        },

        /**
         * Actualiza el mini carrito
         */
        updateMiniCart: function() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');

            if (!cartItems || !cartTotal) return;

            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="text-gray-500 text-center py-4">Tu carrito está vacío</p>';
                cartTotal.textContent = '$0.00';
                return;
            }

            cartItems.innerHTML = cart.map(item => `
                <div class="flex items-center space-x-3 p-2 border-b">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded"
                         onerror="this.src='https://via.placeholder.com/48x48/F77786/FFFFFF?text=P'">
                    <div class="flex-1">
                        <h4 class="text-sm font-semibold line-clamp-1">${item.name}</h4>
                        <p class="text-xs text-gray-600">Cantidad: ${item.quantity}</p>
                        <p class="text-sm font-bold text-red-600">${_formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <button class="text-red-500 hover:text-red-700 remove-item" data-product-id="${item.id}">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = _formatPrice(total);

            // Configurar eventos para eliminar items
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.productId);
                    ProductApp.removeFromCart(productId);
                });
            });
        },

        /**
         * Agrega un producto al carrito
         * @param {number} productId - ID del producto
         */
        addToCart: function(productId) {
            const product = products.find(p => p.id === productId);

            if (!product || !product.inStock || product.stock <= 0) {
                _showError('Producto no disponible');
                return;
            }

            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            this.saveCartToLocalStorage();
            this.updateCartBadge();
            this.updateMiniCart();
            _showSuccess(`¡${product.name} agregado al carrito!`);
        },

        /**
         * Elimina un producto del carrito
         * @param {number} productId - ID del producto
         */
        removeFromCart: function(productId) {
            cart = cart.filter(item => item.id !== productId);
            this.saveCartToLocalStorage();
            this.updateCartBadge();
            this.updateMiniCart();
            _showSuccess('Producto eliminado del carrito');
        },

        /**
         * Alternar visibilidad del mini carrito
         */
        toggleMiniCart: function() {
            const miniCart = document.getElementById('miniCart');
            if (miniCart) {
                miniCart.classList.toggle('hidden');
                this.updateMiniCart();
            }
        },

        /**
         * Muestra los detalles de un producto en un modal
         * @param {number} productId - ID del producto
         */
        viewProductDetails: function(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const isInWishlist = wishlist.includes(productId);
            const heartColorClass = isInWishlist ? 'text-red-600' : 'text-gray-400';

            const modalHTML = `
                <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-8">
                            ${product.entrepreneur ? `
                            <div class="mb-6 pb-6 border-b">
                                <div class="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-300"
                                     onclick="ProductApp.goToEntrepreneurProfile(${product.entrepreneur.id})">
                                    <img src="${product.entrepreneur.avatar}"
                                         alt="${product.entrepreneur.name}"
                                         class="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(product.entrepreneur.name)}&background=F77786&color=fff'">
                                    <div class="flex-1">
                                        <p class="text-sm text-gray-500">Vendido por</p>
                                        <h3 class="font-bold text-lg text-gray-800">${product.entrepreneur.business_name}</h3>
                                        <p class="text-sm text-gray-600">${product.entrepreneur.name}</p>
                                    </div>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </div>
                            </div>
                            ` : ''}

                            <div class="flex justify-between items-start mb-6">
                                <h2 class="text-2xl font-bold text-gray-800">${product.name}</h2>
                                <button onclick="ProductApp.closeProductModal()" class="text-gray-500 hover:text-gray-700 text-2xl">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <img id="mainProductImage" src="${product.image}" alt="${product.name}" class="w-full h-80 object-cover rounded-lg mb-4">
                                    <div class="flex space-x-2 overflow-x-auto">
                                        <img src="${product.image}" alt="${product.name}"
                                             class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-red-500 gallery-thumb"
                                             onclick="ProductApp.changeMainImage(this.src)">

                                        ${product.gallery.length > 0 ?
                                            product.gallery.map(img => `
                                                <img src="${img}" alt="${product.name}"
                                                     class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-gray-200 hover:border-red-500 gallery-thumb"
                                                     onclick="ProductApp.changeMainImage(this.src)"
                                                     onerror="this.src='https://via.placeholder.com/150/F77786/FFFFFF?text=Imagen+no+disponible'">
                                            `).join('') : ''}
                                    </div>
                                </div>

                                <div>
                                    <div class="category-tag inline-block mb-3">${_getCategoryName(product.category.slug)}</div>
                                    ${product.brand ? `<div class="text-sm text-gray-600 mb-3">${product.brand}</div>` : ''}

                                    <div class="flex items-center mb-4">
                                        <div class="star-rating">${_generateStarRating(product.rating)}</div>
                                        <span class="ml-2 text-sm text-gray-600">(${product.reviews} reseñas)</span>
                                    </div>

                                    <div class="flex items-center space-x-3 mb-6">
                                        <span class="text-3xl font-bold text-red-600">${_formatPrice(product.price)}</span>
                                        ${product.originalPrice > product.price ?
                                            `<span class="text-lg text-gray-400 line-through">${_formatPrice(product.originalPrice)}</span>` : ''}
                                    </div>

                                    <div class="mb-6 max-h-48 overflow-y-auto">
                                        <p class="text-gray-700 whitespace-normal break-words text-base">${product.description}</p>
                                    </div>

                                    <div class="text-sm text-gray-600 mb-6">Stock: ${product.stock} disponibles</div>

                                    <div class="flex justify-between items-center">
                                        <button onclick="ProductApp.addToCartFromModal(${product.id});"
                                                class="btn-primary w-[48%] py-3 rounded-lg font-semibold ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}"
                                                ${!product.inStock ? 'disabled' : ''}>
                                            <i class="fas fa-cart-plus"></i> ${product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
                                        </button>

                                        <div class="flex space-x-2">
                                            <button id="wishlistButton_${product.id}"
                                                    class="p-2"
                                                    onclick="ProductApp.toggleWishlist(${product.id}, this.querySelector('i'))"
                                                    title="Agregar a favoritos">
                                                <i class="fas fa-heart ${heartColorClass}"></i>
                                            </button>

                                            <button class="text-gray-400 hover:text-blue-600 p-2"
                                                    onclick="ProductApp.shareProduct(${product.id})"
                                                    title="Compartir">
                                                <i class="fas fa-share-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            document.getElementById('productModal').addEventListener('click', function(e) {
                if (e.target === this) ProductApp.closeProductModal();
            });
        },

        /**
         * Cierra el modal de detalles del producto
         */
        closeProductModal: function() {
            const modal = document.getElementById('productModal');
            if (modal) modal.remove();
        },

        /**
         * Agrega un producto al carrito desde el modal
         * @param {number} productId - ID del producto
         */
        addToCartFromModal: function(productId) {
            this.addToCart(productId);
            this.closeProductModal();
        },

        /**
         * Cambia la imagen principal en el modal
         * @param {string} newImageUrl - URL de la nueva imagen
         */
        changeMainImage: function(newImageUrl) {
            const mainImage = document.getElementById('mainProductImage');
            if (mainImage) mainImage.src = newImageUrl;

            document.querySelectorAll('.gallery-thumb').forEach(img => {
                img.classList.remove('border-red-500');
                img.classList.add('border-gray-200');
            });

            event.target.classList.remove('border-gray-200');
            event.target.classList.add('border-red-500');
        },

        /**
         * Alternar producto en wishlist
         * @param {number} productId - ID del producto
         * @param {HTMLElement} iconElement - Elemento del icono
         */
        toggleWishlist: function(productId, iconElement) {
            const index = wishlist.indexOf(productId);

            if (index === -1) {
                wishlist.push(productId);
                _showSuccess('Producto agregado a favoritos');
            } else {
                wishlist.splice(index, 1);
                _showSuccess('Producto eliminado de favoritos');
            }

            this.saveWishlistToLocalStorage();

            // Actualizar icono
            if (iconElement) {
                iconElement.classList.toggle('text-red-600', index === -1);
                iconElement.classList.toggle('text-gray-400', index !== -1);
            }

            // Actualizar todos los iconos de wishlist para este producto
            document.querySelectorAll(`.wishlist-btn[data-product-id="${productId}"] i`).forEach(icon => {
                icon.classList.toggle('text-red-600', index === -1);
                icon.classList.toggle('text-gray-400', index !== -1);
            });
        },

        /**
         * Inicializa los iconos de wishlist
         */
        initializeWishlistIcons: function() {
            document.querySelectorAll('.wishlist-btn').forEach(button => {
                const productId = parseInt(button.dataset.productId);
                const icon = button.querySelector('i');

                if (wishlist.includes(productId)) {
                    icon.classList.remove('text-gray-400');
                    icon.classList.add('text-red-600');
                } else {
                    icon.classList.remove('text-red-600');
                    icon.classList.add('text-gray-400');
                }
            });
        },

        /**
         * Comparte un producto
         * @param {number} productId - ID del producto
         */
        shareProduct: function(productId) {
            const product = products.find(p => p.id === productId);

            if (product && navigator.share) {
                navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href
                }).catch(() => {
                    // Fallback si share no está disponible
                    navigator.clipboard.writeText(window.location.href);
                    _showSuccess('Enlace copiado al portapapeles');
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                _showSuccess('Enlace copiado al portapapeles');
            }
        },

        /**
         * Redirige al perfil del emprendedor
         * @param {number} entrepreneurId - ID del emprendedor
         */
        goToEntrepreneurProfile: function(entrepreneurId) {
            window.location.href = `/entrepreneur/${entrepreneurId}/profile`;
        },

        /**
         * Refresca la lista de productos
         */
        refreshProducts: function() {
            this.loadProducts();
        }
    };
})();

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    ProductApp.init();

    // Exportar funciones globales para compatibilidad
    window.ProductApp = ProductApp;
    window.viewProductDetails = ProductApp.viewProductDetails;
    window.closeProductModal = ProductApp.closeProductModal;
    window.addToCart = ProductApp.addToCart;
    window.toggleWishlist = ProductApp.toggleWishlist;
    window.shareProduct = ProductApp.shareProduct;
    window.addToCartFromModal = ProductApp.addToCartFromModal;
    window.changeMainImage = ProductApp.changeMainImage;
    window.goToEntrepreneurProfile = ProductApp.goToEntrepreneurProfile;

    console.log('🛒 Sistema de productos cargado correctamente');
});
