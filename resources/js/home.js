/**
 * home.js - Funcionalidades de la página principal con soporte para API
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 [HOME] Inicializando funcionalidades de la página principal');

    // ============================================
    // HERO CAROUSEL (con datos dinámicos de API)
    // ============================================

    const slidesContainer = document.getElementById('heroCarousel');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    let currentSlide = 0;
    let autoplayInterval = null;
    let carouselData = [];

    /**
     * Carga los slides del carousel desde la API
     */
    async function loadCarouselSlides() {
        try {
            console.log('🔄 [CAROUSEL] Cargando slides desde API');
            const response = await fetch('/api/home/carousel', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.slides)) {
                carouselData = data.slides;
                console.log('✅ [CAROUSEL] Slides cargados:', carouselData.length);

                // Si hay datos nuevos, actualizar el DOM
                if (carouselData.length > 0) {
                    updateCarouselDOM();
                }
            } else {
                console.warn('⚠️ [CAROUSEL] Formato de datos inesperado, usando slides estáticos');
                // Usar slides estáticos si la API no devuelve datos válidos
                carouselData = Array.from(slides).map((slide, index) => ({
                    id: index + 1,
                    title: slide.querySelector('h2')?.textContent || `Slide ${index + 1}`,
                    description: slide.querySelector('p')?.textContent || '',
                    image: slide.style.backgroundImage?.replace('url("', '').replace('")', '') || '',
                    cta_text: slide.querySelector('.cta-button')?.textContent || 'Ver más',
                    cta_link: slide.querySelector('.cta-button')?.getAttribute('href') || '#'
                }));
            }

            // Inicializar carousel
            initCarousel();

        } catch (error) {
            console.error('❌ [CAROUSEL] Error al cargar slides:', error);
            // Continuar con slides estáticos en caso de error
            carouselData = Array.from(slides).map((slide, index) => ({
                id: index + 1,
                title: slide.querySelector('h2')?.textContent || `Slide ${index + 1}`,
                description: slide.querySelector('p')?.textContent || '',
                image: slide.style.backgroundImage?.replace('url("', '').replace('")', '') || '',
                cta_text: slide.querySelector('.cta-button')?.textContent || 'Ver más',
                cta_link: slide.querySelector('.cta-button')?.getAttribute('href') || '#'
            }));
            initCarousel();
        }
    }

    /**
     * Actualiza el DOM del carousel con los datos de la API
     */
    function updateCarouselDOM() {
        const carouselInner = document.querySelector('#heroCarousel .carousel-inner');
        const dotsContainer = document.querySelector('#heroCarousel .carousel-dots');

        if (!carouselInner || !dotsContainer) {
            console.error('❌ [CAROUSEL] Elementos del carousel no encontrados');
            return;
        }

        // Limpiar contenido previo
        carouselInner.innerHTML = '';
        dotsContainer.innerHTML = '';

        // Crear nuevos slides
        carouselData.forEach((slide, index) => {
            // Crear slide
            const slideElement = document.createElement('div');
            slideElement.className = `hero-slide absolute inset-0 transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`;
            slideElement.style.backgroundImage = `url('${slide.image}')`;
            slideElement.innerHTML = `
                <div class="container mx-auto px-4 h-full flex items-center">
                    <div class="max-w-lg bg-white bg-opacity-90 p-8 rounded-lg shadow-xl">
                        <h2 class="text-3xl font-bold text-gray-800 mb-4">${slide.title}</h2>
                        <p class="text-gray-600 mb-6">${slide.description}</p>
                        <a href="${slide.cta_link}" class="cta-button inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                            ${slide.cta_text}
                        </a>
                    </div>
                </div>
            `;
            carouselInner.appendChild(slideElement);

            // Crear dot
            const dotElement = document.createElement('button');
            dotElement.className = `hero-dot h-2 rounded-full transition-all duration-300 ${index === 0 ? 'w-12 bg-white' : 'w-2 bg-white/50'}`;
            dotElement.setAttribute('aria-label', `Ir al slide ${index + 1}`);
            dotsContainer.appendChild(dotElement);
        });

        // Reasignar event listeners a los nuevos elementos
        assignCarouselEventListeners();
    }

    /**
     * Inicializa el carousel
     */
    function initCarousel() {
        console.log('🎠 [CAROUSEL] Inicializando carousel');

        // Si no hay slides, no hacer nada
        if (slides.length === 0 && carouselData.length === 0) {
            console.warn('⚠️ [CAROUSEL] No se encontraron slides');
            return;
        }

        // Mostrar slide específico
        function showSlide(index) {
            // Normalizar el índice
            if (index >= carouselData.length) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = carouselData.length - 1;
            } else {
                currentSlide = index;
            }

            // Actualizar slides
            document.querySelectorAll('.hero-slide').forEach((slide, i) => {
                if (i === currentSlide) {
                    slide.classList.remove('opacity-0');
                    slide.classList.add('opacity-100');
                } else {
                    slide.classList.remove('opacity-100');
                    slide.classList.add('opacity-0');
                }
            });

            // Actualizar dots
            document.querySelectorAll('.hero-dot').forEach((dot, i) => {
                if (i === currentSlide) {
                    dot.classList.remove('w-2', 'bg-white/50');
                    dot.classList.add('w-12', 'bg-white');
                } else {
                    dot.classList.remove('w-12', 'bg-white');
                    dot.classList.add('w-2', 'bg-white/50');
                }
            });
        }

        // Siguiente slide
        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        // Slide anterior
        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        // Iniciar autoplay
        function startAutoplay() {
            stopAutoplay(); // Limpiar cualquier intervalo previo
            autoplayInterval = setInterval(nextSlide, 5000); // Cambiar cada 5 segundos
        }

        // Detener autoplay
        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        // Asignar event listeners
        function assignCarouselEventListeners() {
            // Event listeners para botones
            if (prevBtn) {
                prevBtn.onclick = function() {
                    stopAutoplay();
                    prevSlide();
                    startAutoplay();
                };
            }

            if (nextBtn) {
                nextBtn.onclick = function() {
                    stopAutoplay();
                    nextSlide();
                    startAutoplay();
                };
            }

            // Event listeners para dots
            document.querySelectorAll('.hero-dot').forEach((dot, index) => {
                dot.onclick = function() {
                    stopAutoplay();
                    showSlide(index);
                    startAutoplay();
                };
            });

            // Pausar autoplay al hover
            if (slidesContainer) {
                slidesContainer.onmouseenter = stopAutoplay;
                slidesContainer.onmouseleave = startAutoplay;
            }
        }

        // Inicializar
        showSlide(0);
        assignCarouselEventListeners();
        startAutoplay();
    }

    // Cargar slides del carousel
    if (slidesContainer) {
        loadCarouselSlides();
    } else {
        console.warn('⚠️ [CAROUSEL] Contenedor del carousel no encontrado');
    }

    // ============================================
    // COUNTDOWN TIMER (Oferta del día - con datos de API)
    // ============================================

    /**
     * Carga la información de la oferta del día desde la API
     */
    async function loadDealOfTheDay() {
        try {
            console.log('🔄 [DEAL] Cargando oferta del día desde API');
            const response = await fetch('/api/home/deal-of-the-day', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.deal) {
                console.log('✅ [DEAL] Oferta del día cargada:', data.deal);
                updateDealDOM(data.deal);

                // Iniciar countdown con la fecha de finalización de la oferta
                if (data.deal.ends_at) {
                    startCountdown(new Date(data.deal.ends_at));
                } else {
                    // Si no hay fecha de finalización, usar el final del día
                    const endOfDay = new Date();
                    endOfDay.setHours(23, 59, 59, 999);
                    startCountdown(endOfDay);
                }
            } else {
                console.warn('⚠️ [DEAL] No se encontró oferta del día, usando datos por defecto');
                // Usar final del día actual
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);
                startCountdown(endOfDay);
            }

        } catch (error) {
            console.error('❌ [DEAL] Error al cargar oferta del día:', error);
            // Usar final del día actual en caso de error
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            startCountdown(endOfDay);
        }
    }

    /**
     * Actualiza el DOM con la información de la oferta
     */
    function updateDealDOM(deal) {
        const dealTitle = document.getElementById('deal-title');
        const dealDescription = document.getElementById('deal-description');
        const dealImage = document.getElementById('deal-image');
        const dealPrice = document.getElementById('deal-price');
        const dealOldPrice = document.getElementById('deal-old-price');
        const dealDiscount = document.getElementById('deal-discount');
        const dealCTA = document.getElementById('deal-cta');

        if (dealTitle) dealTitle.textContent = deal.title || 'Oferta Especial del Día';
        if (dealDescription) dealDescription.textContent = deal.description || 'No te pierdas esta increíble oferta por tiempo limitado';
        if (dealImage) dealImage.src = deal.image || '/images/placeholder-deal.jpg';
        if (dealPrice) dealPrice.textContent = deal.price ? `$${parseFloat(deal.price).toFixed(2)}` : '$0.00';
        if (dealOldPrice) {
            dealOldPrice.textContent = deal.original_price ? `$${parseFloat(deal.original_price).toFixed(2)}` : '';
            dealOldPrice.style.display = deal.original_price ? 'inline' : 'none';
        }
        if (dealDiscount) {
            if (deal.original_price && deal.price) {
                const discount = Math.round(((deal.original_price - deal.price) / deal.original_price) * 100);
                dealDiscount.textContent = `-${discount}%`;
                dealDiscount.style.display = 'block';
            } else {
                dealDiscount.style.display = 'none';
            }
        }
        if (dealCTA) {
            dealCTA.href = deal.link || '#';
            dealCTA.textContent = deal.cta_text || 'Comprar ahora';
        }
    }

    /**
     * Inicia el countdown con una fecha específica
     */
    function startCountdown(endDate) {
        console.log('⏳ [DEAL] Iniciando countdown hasta:', endDate);

        function updateTimer() {
            const now = new Date();
            const diff = endDate - now;

            if (diff <= 0) {
                // El countdown terminó
                document.getElementById('countdown-container').innerHTML = `
                    <div class="text-red-500 font-bold">¡Oferta terminada!</div>
                `;
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');

            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        // Actualizar inmediatamente
        updateTimer();

        // Actualizar cada segundo
        const timerInterval = setInterval(updateTimer, 1000);

        // Limpiar intervalo cuando la página se oculta (para ahorrar recursos)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(timerInterval);
            } else {
                updateTimer();
            }
        });
    }

    // Iniciar countdown si existen los elementos
    if (document.getElementById('hours')) {
        loadDealOfTheDay();
    } else {
        console.warn('⚠️ [DEAL] Elementos del countdown no encontrados');
    }

    // ============================================
    // NEWSLETTER FORM (con API)
    // ============================================

    /**
     * Configura el formulario de newsletter
     */
    function setupNewsletterForm() {
        const newsletterForm = document.querySelector('#newsletter-form');
        if (!newsletterForm) {
            console.warn('⚠️ [NEWSLETTER] Formulario de newsletter no encontrado');
            return;
        }

        console.log('📧 [NEWSLETTER] Configurando formulario');

        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const errorElement = this.querySelector('.newsletter-error');
            const successElement = this.querySelector('.newsletter-success');

            // Limpiar mensajes previos
            if (errorElement) errorElement.textContent = '';
            if (successElement) successElement.textContent = '';

            // Validar email
            const email = emailInput.value.trim();
            if (!email) {
                showNewsletterError('Por favor ingresa tu correo electrónico', errorElement);
                return;
            }

            if (!validateEmail(email)) {
                showNewsletterError('Por favor ingresa un correo electrónico válido', errorElement);
                return;
            }

            // Deshabilitar botón y mostrar loading
            toggleSubmitButton(submitBtn, true);

            try {
                console.log('📤 [NEWSLETTER] Enviando suscripción a API');
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al suscribirse');
                }

                if (data.success) {
                    console.log('✅ [NEWSLETTER] Suscripción exitosa');
                    showNewsletterSuccess('¡Gracias por suscribirte! Revisa tu correo para confirmar.', successElement);
                    emailInput.value = '';
                    if (errorElement) errorElement.textContent = '';
                } else {
                    throw new Error(data.message || 'Error al procesar la suscripción');
                }

            } catch (error) {
                console.error('❌ [NEWSLETTER] Error:', error);
                showNewsletterError(error.message, errorElement);
            } finally {
                toggleSubmitButton(submitBtn, false);
            }
        });
    }

    /**
     * Muestra un error en el formulario de newsletter
     */
    function showNewsletterError(message, element) {
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        console.error('⚠️ [NEWSLETTER] Error:', message);
    }

    /**
     * Muestra un mensaje de éxito en el formulario de newsletter
     */
    function showNewsletterSuccess(message, element) {
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        console.log('✅ [NEWSLETTER] Éxito:', message);
    }

    /**
     * Alterna el estado del botón de submit
     */
    function toggleSubmitButton(button, loading) {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = `
                <span class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                </span>
            `;
        } else {
            button.disabled = false;
            button.textContent = 'Suscríbete';
        }
    }

    // Inicializar formulario de newsletter
    setupNewsletterForm();

    // ============================================
    // PRODUCTOS DESTACADOS (con datos de API)
    // ============================================

    /**
     * Carga productos destacados desde la API
     */
    async function loadFeaturedProducts() {
        try {
            console.log('🔄 [PRODUCTS] Cargando productos destacados desde API');
            const response = await fetch('/api/home/featured-products', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.products)) {
                console.log('✅ [PRODUCTS] Productos destacados cargados:', data.products.length);
                renderFeaturedProducts(data.products);
            } else {
                console.warn('⚠️ [PRODUCTS] Formato de datos inesperado, mostrando mensaje de error');
                showProductsError('No se pudieron cargar los productos destacados');
            }

        } catch (error) {
            console.error('❌ [PRODUCTS] Error al cargar productos:', error);
            showProductsError('Error al cargar productos. Intenta más tarde.');
        }
    }

    /**
     * Renderiza los productos destacados en el DOM
     */
    function renderFeaturedProducts(products) {
        const container = document.getElementById('featured-products-container');
        if (!container) {
            console.error('❌ [PRODUCTS] Contenedor de productos no encontrado');
            return;
        }

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay productos destacados</h3>
                    <p class="text-gray-500">Vuelve pronto para ver nuestras mejores ofertas</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                ${product.discount > 0 ? `<div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">-${product.discount}%</div>` : ''}
                ${product.is_new ? `<div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Nuevo</div>` : ''}

                <div class="relative h-48 bg-gray-100">
                    <img src="${product.image || '/images/product-placeholder.jpg'}"
                         alt="${product.name}"
                         class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                         loading="lazy">
                </div>

                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 mb-1 line-clamp-1">${product.name}</h3>

                    <div class="flex items-center mb-2">
                        <div class="flex text-yellow-400 mr-2">
                            ${generateStarRating(product.rating)}
                        </div>
                        <span class="text-sm text-gray-500">(${product.reviews || 0})</span>
                    </div>

                    <div class="flex items-center mb-3">
                        <span class="text-lg font-bold text-primary">$${parseFloat(product.price).toFixed(2)}</span>
                        ${product.original_price ?
                            `<span class="text-sm text-gray-400 line-through ml-2">$${parseFloat(product.original_price).toFixed(2)}</span>` : ''}
                    </div>

                    <div class="flex justify-between items-center">
                        <button class="add-to-cart-btn bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                                data-product-id="${product.id}">
                            <i class="fas fa-cart-plus mr-1"></i> Agregar
                        </button>

                        <button class="text-gray-400 hover:text-red-500"
                                data-product-id="${product.id}"
                                onclick="toggleWishlist(${product.id}, this)">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Asignar event listeners a los botones
        assignProductEventListeners();
    }

    /**
     * Genera HTML para la calificación por estrellas
     */
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    /**
     * Asigna event listeners a los botones de productos
     */
    function assignProductEventListeners() {
        // Botones de "Agregar al carrito"
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const productId = this.dataset.productId;
                await addToCart(productId);
            });
        });
    }

    /**
     * Agrega un producto al carrito
     */
    async function addToCart(productId) {
        try {
            console.log(`🛒 [CART] Agregando producto ${productId} al carrito`);

            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al agregar al carrito');
            }

            if (data.success) {
                showNotification('Producto agregado al carrito', 'success');

                // Actualizar contador del carrito en el header
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    cartCount.textContent = data.cart_count || '0';
                }
            } else {
                throw new Error(data.message || 'Error al agregar al carrito');
            }

        } catch (error) {
            console.error('❌ [CART] Error:', error);
            showNotification(error.message, 'error');
        }
    }

    /**
     * Alternar producto en wishlist
     */
    async function toggleWishlist(productId, buttonElement) {
        try {
            console.log(`❤️ [WISHLIST] Alternando producto ${productId} en wishlist`);

            const response = await fetch('/api/wishlist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    product_id: productId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar wishlist');
            }

            if (data.success) {
                const icon = buttonElement.querySelector('i');
                if (icon) {
                    if (data.action === 'added') {
                        icon.classList.remove('far');
                        icon.classList.add('fas', 'text-red-500');
                        showNotification('Producto agregado a favoritos', 'success');
                    } else {
                        icon.classList.remove('fas', 'text-red-500');
                        icon.classList.add('far');
                        showNotification('Producto eliminado de favoritos', 'success');
                    }
                }
            } else {
                throw new Error(data.message || 'Error al actualizar wishlist');
            }

        } catch (error) {
            console.error('❌ [WISHLIST] Error:', error);
            showNotification(error.message, 'error');
        }
    }

    /**
     * Muestra un mensaje de error para productos
     */
    function showProductsError(message) {
        const container = document.getElementById('featured-products-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">${message}</h3>
                    <button onclick="loadFeaturedProducts()"
                            class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    // Cargar productos destacados si existe el contenedor
    const featuredProductsContainer = document.getElementById('featured-products-container');
    if (featuredProductsContainer) {
        loadFeaturedProducts();
    } else {
        console.warn('⚠️ [PRODUCTS] Contenedor de productos destacados no encontrado');
    }

    // ============================================
    // CATEGORÍAS DESTACADAS (con datos de API)
    // ============================================

    /**
     * Carga categorías destacadas desde la API
     */
    async function loadFeaturedCategories() {
        try {
            console.log('🔄 [CATEGORIES] Cargando categorías destacadas desde API');
            const response = await fetch('/api/home/featured-categories', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.categories)) {
                console.log('✅ [CATEGORIES] Categorías cargadas:', data.categories.length);
                renderFeaturedCategories(data.categories);
            } else {
                console.warn('⚠️ [CATEGORIES] Formato de datos inesperado, usando categorías por defecto');
                // Usar categorías estáticas si la API no devuelve datos válidos
                const defaultCategories = [
                    { id: 1, name: 'Electrónicos', slug: 'electronics', image: '/images/categories/electronics.jpg' },
                    { id: 2, name: 'Moda', slug: 'fashion', image: '/images/categories/fashion.jpg' },
                    { id: 3, name: 'Hogar', slug: 'home', image: '/images/categories/home.jpg' },
                    { id: 4, name: 'Deportes', slug: 'sports', image: '/images/categories/sports.jpg' },
                    { id: 5, name: 'Belleza', slug: 'beauty', image: '/images/categories/beauty.jpg' }
                ];
                renderFeaturedCategories(defaultCategories);
            }

        } catch (error) {
            console.error('❌ [CATEGORIES] Error al cargar categorías:', error);
            // Usar categorías por defecto en caso de error
            const defaultCategories = [
                { id: 1, name: 'Electrónicos', slug: 'electronics', image: '/images/categories/electronics.jpg' },
                { id: 2, name: 'Moda', slug: 'fashion', image: '/images/categories/fashion.jpg' },
                { id: 3, name: 'Hogar', slug: 'home', image: '/images/categories/home.jpg' },
                { id: 4, name: 'Deportes', slug: 'sports', image: '/images/categories/sports.jpg' },
                { id: 5, name: 'Belleza', slug: 'beauty', image: '/images/categories/beauty.jpg' }
            ];
            renderFeaturedCategories(defaultCategories);
        }
    }

    /**
     * Renderiza las categorías destacadas en el DOM
     */
    function renderFeaturedCategories(categories) {
        const container = document.getElementById('featured-categories-container');
        if (!container) {
            console.error('❌ [CATEGORIES] Contenedor de categorías no encontrado');
            return;
        }

        container.innerHTML = categories.map(category => `
            <a href="/categoria/${category.slug}" class="group block">
                <div class="relative rounded-lg overflow-hidden h-48 bg-gray-100">
                    <img src="${category.image || '/images/category-placeholder.jpg'}"
                         alt="${category.name}"
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                         loading="lazy">

                    <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        <span class="text-white font-semibold text-lg">${category.name}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    // Cargar categorías destacadas si existe el contenedor
    const featuredCategoriesContainer = document.getElementById('featured-categories-container');
    if (featuredCategoriesContainer) {
        loadFeaturedCategories();
    } else {
        console.warn('⚠️ [CATEGORIES] Contenedor de categorías destacadas no encontrado');
    }

    // ============================================
    // SCROLL SUAVE PARA CATEGORÍAS
    // ============================================

    /**
     * Configura el scroll horizontal para categorías
     */
    function setupCategoryScroll() {
        const categoryScroll = document.querySelector('.categories-scroll');
        if (!categoryScroll) {
            console.warn('⚠️ [SCROLL] Contenedor de scroll de categorías no encontrado');
            return;
        }

        console.log('🖱️ [SCROLL] Configurando scroll horizontal para categorías');

        let isDown = false;
        let startX;
        let scrollLeft;

        categoryScroll.addEventListener('mousedown', (e) => {
            isDown = true;
            categoryScroll.style.cursor = 'grabbing';
            startX = e.pageX - categoryScroll.offsetLeft;
            scrollLeft = categoryScroll.scrollLeft;
        });

        categoryScroll.addEventListener('mouseleave', () => {
            isDown = false;
            categoryScroll.style.cursor = 'grab';
        });

        categoryScroll.addEventListener('mouseup', () => {
            isDown = false;
            categoryScroll.style.cursor = 'grab';
        });

        categoryScroll.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - categoryScroll.offsetLeft;
            const walk = (x - startX) * 2;
            categoryScroll.scrollLeft = scrollLeft - walk;
        });
    }

    // Configurar scroll si existe el elemento
    setupCategoryScroll();

    // ============================================
    // LAZY LOADING PARA IMÁGENES
    // ============================================

    /**
     * Configura lazy loading para imágenes
     */
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            if (images.length === 0) {
                console.log('🖼️ [LAZY] No se encontraron imágenes con lazy loading');
                return;
            }

            console.log(`🖼️ [LAZY] Configurando lazy loading para ${images.length} imágenes`);

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        // Si la imagen tiene un data-src, usarlo
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        // Forzar recarga si es necesario
                        img.src = img.src;
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px'
            });

            images.forEach(img => {
                // Si tiene data-src, significa que es una imagen lazy real
                if (img.dataset.src) {
                    // Poner una imagen placeholder muy pequeña
                    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221%22%20height%3D%221%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201%201%22%3E%3C%2Fsvg%3E';
                }
                imageObserver.observe(img);
            });
        } else {
            console.warn('⚠️ [LAZY] IntersectionObserver no soportado, cargando imágenes normalmente');
        }
    }

    // Configurar lazy loading
    setupLazyLoading();

    // ============================================
    // TESTIMONIOS (con datos de API)
    // ============================================

    /**
     * Carga testimonios desde la API
     */
    async function loadTestimonials() {
        try {
            console.log('🔄 [TESTIMONIALS] Cargando testimonios desde API');
            const response = await fetch('/api/home/testimonials', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.testimonials)) {
                console.log('✅ [TESTIMONIALS] Testimonios cargados:', data.testimonials.length);
                renderTestimonials(data.testimonials);
            } else {
                console.warn('⚠️ [TESTIMONIALS] Formato de datos inesperado, usando testimonios por defecto');
                // Usar testimonios estáticos si la API no devuelve datos válidos
                const defaultTestimonials = [
                    {
                        id: 1,
                        name: 'María Gómez',
                        role: 'Cliente Satisfecho',
                        content: 'Excelente servicio y productos de calidad. ¡Muy recomendado!',
                        rating: 5,
                        avatar: '/images/avatars/avatar1.jpg'
                    },
                    {
                        id: 2,
                        name: 'Carlos Rodríguez',
                        role: 'Emprendedor',
                        content: 'La plataforma me ha ayudado a crecer mi negocio significativamente.',
                        rating: 5,
                        avatar: '/images/avatars/avatar2.jpg'
                    },
                    {
                        id: 3,
                        name: 'Ana López',
                        role: 'Compradora Frecuente',
                        content: 'Siempre encuentro lo que necesito a buenos precios.',
                        rating: 4,
                        avatar: '/images/avatars/avatar3.jpg'
                    }
                ];
                renderTestimonials(defaultTestimonials);
            }

        } catch (error) {
            console.error('❌ [TESTIMONIALS] Error al cargar testimonios:', error);
            // Usar testimonios por defecto en caso de error
            const defaultTestimonials = [
                {
                    id: 1,
                    name: 'María Gómez',
                    role: 'Cliente Satisfecho',
                    content: 'Excelente servicio y productos de calidad. ¡Muy recomendado!',
                    rating: 5,
                    avatar: '/images/avatars/avatar1.jpg'
                },
                {
                    id: 2,
                    name: 'Carlos Rodríguez',
                    role: 'Emprendedor',
                    content: 'La plataforma me ha ayudado a crecer mi negocio significativamente.',
                    rating: 5,
                    avatar: '/images/avatars/avatar2.jpg'
                },
                {
                    id: 3,
                    name: 'Ana López',
                    role: 'Compradora Frecuente',
                    content: 'Siempre encuentro lo que necesito a buenos precios.',
                    rating: 4,
                    avatar: '/images/avatars/avatar3.jpg'
                }
            ];
            renderTestimonials(defaultTestimonials);
        }
    }

    /**
     * Renderiza los testimonios en el DOM
     */
    function renderTestimonials(testimonials) {
        const container = document.getElementById('testimonials-container');
        if (!container) {
            console.error('❌ [TESTIMONIALS] Contenedor de testimonios no encontrado');
            return;
        }

        container.innerHTML = testimonials.map(testimonial => `
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center mb-4">
                    <img src="${testimonial.avatar || '/images/avatar-placeholder.jpg'}"
                         alt="${testimonial.name}"
                         class="w-12 h-12 rounded-full object-cover mr-4"
                         loading="lazy">

                    <div>
                        <h4 class="font-semibold text-gray-800">${testimonial.name}</h4>
                        <p class="text-sm text-gray-500">${testimonial.role}</p>
                    </div>
                </div>

                <div class="flex mb-4">
                    ${generateStarRating(testimonial.rating)}
                </div>

                <p class="text-gray-600 italic">"${testimonial.content}"</p>
            </div>
        `).join('');
    }

    // Cargar testimonios si existe el contenedor
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (testimonialsContainer) {
        loadTestimonials();
    } else {
        console.warn('⚠️ [TESTIMONIALS] Contenedor de testimonios no encontrado');
    }

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================

    /**
     * Valida un correo electrónico
     */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Muestra una notificación
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300
            ${type === 'success' ? 'bg-green-500 text-white' :
              type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'}`;

        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${type === 'success' ?
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
                        type === 'error' ?
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' :
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
                </svg>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * Obtiene el token CSRF
     */
    function getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.content : '';
    }

    // Exponer funciones globales si es necesario
    window.toggleWishlist = toggleWishlist;
});
