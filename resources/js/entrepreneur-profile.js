// Variables globales
let entrepreneurProducts = [];
let entrepreneurServices = [];
let filteredProducts = [];
let cart = [];
let currentPage = 1;
const productsPerPage = 12;
let currentTab = 'products';
let entrepreneurId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    // Obtener el ID del emprendedor desde la URL o un atributo data
    entrepreneurId = document.getElementById('entrepreneurProfile')?.dataset.entrepreneurId ||
                      new URLSearchParams(window.location.search).get('entrepreneur_id');

    if (!entrepreneurId) {
        showNotification('No se pudo identificar al emprendedor', 'error');
        return;
    }

    await loadEntrepreneurProducts();
    await loadEntrepreneurServices();
    await loadCartFromAPI();
    initializeApp();
});

// Cargar productos del emprendedor desde la API
async function loadEntrepreneurProducts() {
    try {
        showLoading();

        const response = await fetch(`/api/entrepreneur/${entrepreneurId}/products`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
            entrepreneurProducts = data.products.map(product => ({
                ...product,
                main_image: product.main_image || 'https://via.placeholder.com/300x300/F77786/FFFFFF?text=Producto',
                gallery_images: product.gallery_images || [],
                rating: product.rating || 4.0,
                reviews: product.reviews || 0
            }));
            filteredProducts = [...entrepreneurProducts];
        } else {
            throw new Error('Formato de datos inesperado');
        }
    } catch (error) {
        console.error("Error al cargar productos del emprendedor:", error);
        showNotification("Error al cargar productos del emprendedor", "error");
    } finally {
        hideLoading();
    }
}

// Cargar servicios del emprendedor desde la API
async function loadEntrepreneurServices() {
    try {
        const response = await fetch(`/api/entrepreneur/${entrepreneurId}/services`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.services)) {
            entrepreneurServices = data.services;
        }
    } catch (error) {
        console.error("Error al cargar servicios del emprendedor:", error);
    }
}

// Cargar carrito desde la API
async function loadCartFromAPI() {
    try {
        const response = await fetch('/api/carrito', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.items)) {
            cart = data.items;
        } else {
            cart = [];
        }
    } catch (error) {
        console.error("Error al cargar carrito desde API:", error);
        cart = [];
    }
}

// Inicializar la aplicación
function initializeApp() {
    displayProducts();
    setupEventListeners();
    updateCartBadge();
    updateMiniCart();
    initializeWishlistIcons();
}

// Mostrar productos
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
        showNoProducts();
        return;
    }

    hideNoProducts();
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    grid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    updateProductCount(filteredProducts.length);
    setupPagination(filteredProducts.length);

    // Asignar eventos a los botones
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            addToCart(productId);
        });
    });

    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            viewProductDetails(productId);
        });
    });

    grid.classList.remove('hidden');
    grid.classList.add('fade-in');
}

// Crear tarjeta de producto
function createProductCard(product) {
    const discountBadge = product.discount > 0 ?
        `<div class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            -${product.discount}%
        </div>` : '';

    const newBadge = product.isNew ?
        `<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            NUEVO
        </div>` : '';

    const stockStatus = product.stock > 0 ?
        `<button class="add-to-cart btn-primary w-full py-2 rounded-lg font-semibold transition-all duration-300" data-product-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Agregar al Carrito
        </button>` :
        `<button class="bg-gray-400 text-white w-full py-2 rounded-lg font-semibold cursor-not-allowed" disabled>
            <i class="fas fa-times"></i> Sin Stock
        </button>`;

    const stars = generateStarRating(product.rating);

    // Determinar el color del corazón según el wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.includes(product.id);
    const heartColorClass = isInWishlist ? 'text-red-600' : 'text-gray-400';

    return `
        <div class="product-card bg-white rounded-lg shadow-lg overflow-hidden fade-in">
            <div class="relative overflow-hidden">
                <div class="product-image-container">
                    <img src="${product.main_image}" alt="${product.name}"
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
                    <span class="text-sm text-gray-600">(${product.reviews || 0} reseñas)</span>
                </div>
                <div class="flex items-center mb-2">
                    <span class="text-2xl font-bold text-red-600 truncate">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice > product.price ?
                        `<span class="text-lg text-gray-400 line-through ml-2">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="flex justify-between items-center mb-4">
                    ${product.discount > 0 ?
                        `<span class="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            -${product.discount}% OFF
                        </span>` : '<div></div>'}
                    <div class="flex space-x-2">
                        <button class="text-gray-400 hover:text-red-600 p-2" onclick="toggleWishlist(${product.id})" title="Agregar a favoritos">
                            <i class="fas fa-heart ${heartColorClass}"></i>
                        </button>
                        <button class="text-gray-400 hover:text-blue-600 p-2" onclick="shareProduct(${product.id})" title="Compartir">
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
}

// Generar calificación de estrellas
function generateStarRating(rating) {
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

// Filtrar productos
function filterProducts() {
    const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    const selectedRatings = Array.from(document.querySelectorAll('.rating-filter:checked'))
        .map(cb => parseFloat(cb.dataset.rating));

    filteredProducts = entrepreneurProducts.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        const matchesRating = selectedRatings.length === 0 ||
            selectedRatings.some(rating => product.rating >= rating);
        return matchesCategory && matchesPrice && matchesRating;
    });

    currentPage = 1;
    displayProducts();
}

// Ordenar productos
function sortProducts(sortBy) {
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
            filterProducts();
            return;
    }
    displayProducts();
}

// Limpiar filtros
function clearAllFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-category="all"]')?.classList.add('active');
    if (document.getElementById('minPrice')) document.getElementById('minPrice').value = '';
    if (document.getElementById('maxPrice')) document.getElementById('maxPrice').value = '';
    document.querySelectorAll('.rating-filter').forEach(cb => cb.checked = false);
    if (document.getElementById('sortBy')) document.getElementById('sortBy').value = 'featured';
    filteredProducts = [...entrepreneurProducts];
    currentPage = 1;
    displayProducts();
}

// Añadir al carrito (llamada a API)
async function addToCart(productId) {
    const product = entrepreneurProducts.find(p => p.id === productId);
    if (!product || !product.stock || product.stock <= 0) {
        showNotification('Producto no disponible', 'error');
        return;
    }

    try {
        showLoading();

        const response = await fetch('/api/carrito/agregar', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            await loadCartFromAPI();
            updateCartBadge();
            updateMiniCart();
            showNotification(`¡${product.name} agregado al carrito!`, 'success');
        } else {
            showNotification(data.message || 'Error al agregar al carrito', 'error');
        }
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        showNotification("Error de conexión al agregar al carrito", "error");
    } finally {
        hideLoading();
    }
}

// Inicializar íconos de wishlist
function initializeWishlistIcons() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    document.querySelectorAll('[onclick^="toggleWishlist("]').forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        const productIdMatch = onclickAttr.match(/toggleWishlist\((\d+)\)/);
        if (productIdMatch) {
            const productId = parseInt(productIdMatch[1]);
            const icon = button.querySelector('i');
            if (wishlist.includes(productId)) {
                icon.classList.remove('text-gray-400');
                icon.classList.add('text-red-600');
            } else {
                icon.classList.remove('text-red-600');
                icon.classList.add('text-gray-400');
            }
        }
    });
}

// Ver detalles del producto
function viewProductDetails(productId) {
    const product = entrepreneurProducts.find(p => p.id === productId);
    if (!product) return;

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.includes(productId);
    const heartColorClass = isInWishlist ? 'text-red-600' : 'text-gray-400';

    const mainImage = product.main_image || 'https://via.placeholder.com/300x300/F77786/FFFFFF?text=Producto';
    const galleryImages = product.gallery_images || [];

    const modalHTML = `
        <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-8">
                    <div class="flex justify-between items-start mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">${product.name}</h2>
                        <button onclick="closeProductModal()" class="text-gray-500 hover:text-gray-700 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <!-- Imagen principal -->
                            <img id="mainProductImage" src="${mainImage}" alt="${product.name}" class="w-full h-80 object-cover rounded-lg mb-4">
                            <!-- Galería de miniaturas -->
                            <div class="flex space-x-2 overflow-x-auto">
                                <!-- Miniatura de la imagen principal -->
                                <img src="${mainImage}" alt="${product.name}"
                                     class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-red-500 gallery-thumb"
                                     onclick="changeMainImage(this.src)">
                                <!-- Miniaturas de la galería -->
                                ${galleryImages.map(img => `
                                    <img src="${img}" alt="${product.name}"
                                         class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-gray-200 hover:border-red-500 gallery-thumb"
                                         onclick="changeMainImage(this.src)"
                                         onerror="this.src='https://via.placeholder.com/150/F77786/FFFFFF?text=Imagen+no+disponible'">
                                `).join('')}
                            </div>
                        </div>
                        <!-- Resto del modal -->
                        <div>
                            <div class="category-tag inline-block mb-3">${getCategoryName(product.category)}</div>
                            <div class="flex items-center mb-4">
                                <div class="star-rating">${generateStarRating(product.rating)}</div>
                                <span class="ml-2 text-sm text-gray-600">(${product.reviews} reseñas)</span>
                            </div>
                            <div class="flex items-center space-x-3 mb-6">
                                <span class="text-3xl font-bold text-red-600">$${product.price.toFixed(2)}</span>
                                ${product.originalPrice > product.price ? `<span class="text-lg text-gray-400 line-through">$${product.originalPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <div class="mb-6 max-h-48 overflow-y-auto">
                                <p class="text-gray-700 whitespace-normal break-words text-base">${product.description}</p>
                            </div>
                            <div class="text-sm text-gray-600 mb-6">Stock: ${product.stock} disponibles</div>
                            <div class="flex justify-between items-center">
                                <button onclick="addToCartFromModal(${product.id});" class="btn-primary w-[48%] py-3 rounded-lg font-semibold ${!product.stock ? 'opacity-50 cursor-not-allowed' : ''}" ${!product.stock ? 'disabled' : ''}>
                                    <i class="fas fa-cart-plus"></i> ${product.stock ? 'Agregar al Carrito' : 'Sin Stock'}
                                </button>
                                <div class="flex space-x-2">
                                    <button id="wishlistButton_${product.id}" class="p-2" onclick="toggleWishlist(${product.id}, this)" title="Agregar a favoritos">
                                        <i class="fas fa-heart ${heartColorClass}"></i>
                                    </button>
                                    <button class="text-gray-400 hover:text-blue-600 p-2" onclick="shareProduct(${product.id})" title="Compartir">
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
        if (e.target === this) closeProductModal();
    });
}

// Cerrar modal de detalles
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.remove();
}

// Añadir al carrito desde el modal
function addToCartFromModal(productId) {
    addToCart(productId);
    closeProductModal();
}

// Alternar favoritos (llamada a API)
async function toggleWishlist(productId, buttonElement = null) {
    try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const index = wishlist.indexOf(productId);
        let message = '';

        const response = await fetch('/api/wishlist/toggle', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            if (index === -1) {
                wishlist.push(productId);
                message = 'Producto agregado a favoritos';
            } else {
                wishlist.splice(index, 1);
                message = 'Producto eliminado de favoritos';
            }

            localStorage.setItem('wishlist', JSON.stringify(wishlist));

            // Actualizar ícono en la tarjeta
            const cardIcon = document.querySelector(`[onclick="toggleWishlist(${productId})"] i`);
            if (cardIcon) {
                if (index === -1) {
                    cardIcon.classList.remove('text-gray-400');
                    cardIcon.classList.add('text-red-600');
                } else {
                    cardIcon.classList.remove('text-red-600');
                    cardIcon.classList.add('text-gray-400');
                }
            }

            // Actualizar ícono en el modal (si existe)
            const modalIcon = document.querySelector(`#wishlistButton_${productId} i`);
            if (modalIcon) {
                if (index === -1) {
                    modalIcon.classList.remove('text-gray-400');
                    modalIcon.classList.add('text-red-600');
                } else {
                    modalIcon.classList.remove('text-red-600');
                    modalIcon.classList.add('text-gray-400');
                }
            }

            showNotification(message, 'success');
        } else {
            showNotification(data.message || 'Error al actualizar favoritos', 'error');
        }
    } catch (error) {
        console.error("Error al actualizar favoritos:", error);
        showNotification("Error de conexión al actualizar favoritos", "error");
    }
}

// Compartir producto
function shareProduct(productId) {
    const product = entrepreneurProducts.find(p => p.id === productId);
    if (product && navigator.share) {
        navigator.share({
            title: product.name,
            text: product.description,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showNotification('Enlace copiado al portapapeles', 'success');
    }
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Obtener nombre de categoría
function getCategoryName(category) {
    const categoryNames = {
        'electronica': 'Electrónicos',
        'ropa': 'Ropa',
        'hogar': 'Hogar',
        'deportes': 'Deportes',
        'libros': 'Libros',
        'juguetes': 'Juguetes',
        'belleza': 'Belleza',
        'automotriz': 'Automotriz',
        'general': 'General'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// Configurar listeners de eventos
function setupEventListeners() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts();
        });
    });

    document.getElementById('sortBy')?.addEventListener('change', function() {
        sortProducts(this.value);
    });

    document.getElementById('minPrice')?.addEventListener('input', filterProducts);
    document.getElementById('maxPrice')?.addEventListener('input', filterProducts);
    document.querySelectorAll('.rating-filter').forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });

    document.getElementById('clearFilters')?.addEventListener('click', clearAllFilters);

    document.getElementById('toggleFilters')?.addEventListener('click', function() {
        document.getElementById('filterSidebar').classList.add('active');
        document.getElementById('sidebarOverlay').classList.add('active');
    });

    document.getElementById('closeSidebar')?.addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);
}

// Cerrar sidebar
function closeSidebar() {
    document.getElementById('filterSidebar')?.classList.remove('active');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
}

// Mostrar "sin productos"
function showNoProducts() {
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    const pagination = document.getElementById('pagination');
    if (grid) grid.classList.add('hidden');
    if (noProducts) noProducts.classList.remove('hidden');
    if (pagination) pagination.classList.add('hidden');
}

// Ocultar "sin productos"
function hideNoProducts() {
    const noProducts = document.getElementById('noProducts');
    if (noProducts) noProducts.classList.add('hidden');
}

// Actualizar contador de productos
function updateProductCount(total) {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = `Mostrando ${total} productos`;
    }
}

// Configurar paginación
function setupPagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }

    pagination.classList.remove('hidden');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `px-3 py-2 border rounded-lg ${i === currentPage ? 'bg-red-600 text-white border-red-600' : 'bg-white hover:bg-gray-50'}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => goToPage(i));
            pageNumbers.appendChild(pageBtn);
        }
    }

    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.replaceWith(newPrevBtn);
        newPrevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    }

    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.replaceWith(newNextBtn);
        newNextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    }
}

// Ir a página específica
function goToPage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Actualizar badge del carrito
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

// Actualizar minicarrito
function updateMiniCart() {
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
                <p class="text-sm font-bold text-red-600">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button class="text-red-500 hover:text-red-700 remove-item" data-product-id="${item.id}">
                <i class="fas fa-trash text-sm"></i>
            </button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            removeFromCart(productId);
        });
    });
}

// Eliminar del carrito (llamada a API)
async function removeFromCart(productId) {
    try {
        showLoading();

        const response = await fetch('/api/carrito/eliminar', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            await loadCartFromAPI();
            updateCartBadge();
            updateMiniCart();
        } else {
            showNotification(data.message || 'Error al eliminar del carrito', 'error');
        }
    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        showNotification("Error de conexión al eliminar del carrito", "error");
    } finally {
        hideLoading();
    }
}

// Cambiar imagen principal en el modal
function changeMainImage(newImageUrl) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) mainImage.src = newImageUrl;

    document.querySelectorAll('.gallery-thumb').forEach(img => {
        img.classList.remove('border-red-500');
        img.classList.add('border-gray-200');
    });

    event.target.classList.remove('border-gray-200');
    event.target.classList.add('border-red-500');
}

// Mostrar/Ocultar loading
function showLoading() {
    const loading = document.getElementById('loadingSpinner');
    if (loading) loading.classList.remove('hidden');
}

function hideLoading() {
    const loading = document.getElementById('loadingSpinner');
    if (loading) loading.classList.add('hidden');
}

// ====================================
// FUNCIONALIDAD DE PESTAÑAS
// ====================================
// Función global para cambiar pestañas
window.switchTab = function(tabName) {
    currentTab = tabName;

    // Actualizar botones de pestañas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-red-500', 'text-red-600', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    // Ocultar todo el contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    if (tabName === 'products') {
        // Activar pestaña de productos
        const productsTab = document.getElementById('productsTab');
        productsTab.classList.remove('border-transparent', 'text-gray-500');
        productsTab.classList.add('border-red-500', 'text-red-600', 'active');

        // Mostrar contenido de productos
        document.getElementById('productsHeader').classList.remove('hidden');
        document.getElementById('productsContent').classList.remove('hidden');
    } else if (tabName === 'services') {
        // Activar pestaña de servicios
        const servicesTab = document.getElementById('servicesTab');
        servicesTab.classList.remove('border-transparent', 'text-gray-500');
        servicesTab.classList.add('border-blue-500', 'text-blue-600', 'active');

        // Mostrar contenido de servicios
        document.getElementById('servicesHeader').classList.remove('hidden');
        document.getElementById('servicesContent').classList.remove('hidden');
    }
};

// Exportar funciones globales
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.shareProduct = shareProduct;
window.addToCartFromModal = addToCartFromModal;
window.closeProductModal = closeProductModal;
window.changeMainImage = changeMainImage;
window.switchTab = switchTab;
