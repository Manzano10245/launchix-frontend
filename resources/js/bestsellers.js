// Variables globales
let currentCategory = 'all';
let currentSort = 'popularity';
let displayedProducts = 6;
let filteredProducts = [];
let allProducts = [];

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    await initializeFilters();
    await initializeSorting();
    await initializeScrollAnimations();
    await loadProductsFromAPI();
    setupLoadMore();
});

// Cargar productos desde la API
async function loadProductsFromAPI() {
    try {
        showLoading();
        const response = await fetch('/api/productos/bestsellers', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
            allProducts = data.products;
            filteredProducts = [...allProducts];
        } else {
            throw new Error('Formato de datos inesperado');
        }

        renderProducts();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        showNotification("Error al cargar productos. Intenta más tarde.", "error");
    } finally {
        hideLoading();
    }
}

// Renderizar productos
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    // Filtrar productos
    filteredProducts = allProducts.filter(product => {
        if (currentCategory === 'all') return true;
        return product.category === currentCategory;
    });

    // Ordenar productos
    sortProducts();

    // Mostrar productos
    const productsToShow = filteredProducts.slice(0, displayedProducts);

    grid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');

    // Actualizar botón "Cargar más"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = displayedProducts >= filteredProducts.length ? 'none' : 'inline-block';
    }

    // Añadir animaciones
    animateCards();
}

// Crear tarjeta de producto
function createProductCard(product) {
    const stars = '⭐'.repeat(Math.floor(product.rating));

    return `
        <div class="product-card scroll-animate" data-product-id="${product.id}">
            ${product.is_bestseller ? '<div class="badge bestseller">🏆 Bestseller</div>' : '<div class="badge">Popular</div>'}

            <div class="image-container">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="quick-view" onclick="quickView(${product.id})">
                    Vista Rápida
                </div>
            </div>
            <div class="content">
                <div class="rating">
                    <span class="stars">${stars}</span>
                    <span class="sales-count">(${product.sales.toLocaleString()} vendidos)</span>
                </div>
                <h3>${product.name}</h3>
                <div class="price-section">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                    <span class="discount-badge">-${product.discount}%</span>
                </div>
                <div class="actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        Agregar al Carrito
                    </button>
                    <button class="btn btn-outline" onclick="addToWishlist(${product.id})">
                        ❤️
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Inicializar filtros
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase active al botón clickeado
            this.classList.add('active');

            // Actualizar categoría actual
            currentCategory = this.dataset.category;

            // Resetear productos mostrados
            displayedProducts = 6;

            // Renderizar productos
            renderProducts();
        });
    });
}

// Inicializar ordenamiento
function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            renderProducts();
        });
    }
}

// Ordenar productos
function sortProducts() {
    switch(currentSort) {
        case 'popularity':
            filteredProducts.sort((a, b) => b.sales - a.sales);
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
}

// Configurar botón "Cargar más"
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            displayedProducts += 6;
            renderProducts();

            // Scroll suave a los nuevos productos
            setTimeout(() => {
                const cards = document.querySelectorAll('.product-card');
                if (cards.length > displayedProducts - 6) {
                    cards[displayedProducts - 6].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        });
    }
}

// Animaciones de scroll
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observar elementos con animación
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
}

// Animar tarjetas de productos
function animateCards() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });

    // Re-observar los nuevos elementos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach(card => observer.observe(card));
}

// Agregar al carrito (llamada a API)
async function addToCart(productId) {
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
            showNotification(`${data.product.name} agregado al carrito`, 'success');
        } else {
            showNotification(data.message || "Error al agregar al carrito", "error");
        }
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        showNotification("Error de conexión al agregar al carrito", "error");
    } finally {
        hideLoading();
    }
}

// Agregar a favoritos (llamada a API)
async function addToWishlist(productId) {
    try {
        showLoading();

        const response = await fetch('/api/wishlist/agregar', {
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
            showNotification("Producto agregado a favoritos", "success");
        } else {
            showNotification(data.message || "Error al agregar a favoritos", "error");
        }
    } catch (error) {
        console.error("Error al agregar a favoritos:", error);
        showNotification("Error de conexión al agregar a favoritos", "error");
    } finally {
        hideLoading();
    }
}

// Vista rápida del producto (llamada a API)
async function quickView(productId) {
    try {
        showLoading();

        const response = await fetch(`/api/productos/${productId}`, {
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

        if (data.success) {
            const product = data.product;
            alert(`Vista rápida de: ${product.name}\nPrecio: $${product.price}\nCalificación: ${product.rating}⭐`);
        } else {
            showNotification(data.message || "Error al cargar detalles del producto", "error");
        }
    } catch (error) {
        console.error("Error al cargar detalles del producto:", error);
        showNotification("Error de conexión al cargar detalles del producto", "error");
    } finally {
        hideLoading();
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Mostrar/Ocultar loading
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('hidden');
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.add('hidden');
}

// Agregar estilos para las animaciones de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);