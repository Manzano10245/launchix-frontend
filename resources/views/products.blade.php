@extends('layouts.app')

@section('title', 'Productos')

@vite('resources/css/products.css')


@section('content')




    <!-- Overlay para móvil -->
    <div id="sidebarOverlay" class="sidebar-overlay"></div>

    <!-- Layout principal con Tailwind -->
    <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Sidebar de filtros con Tailwind -->
            <aside class="w-80 bg-white rounded-lg shadow-lg sticky-aside filter-sidebar p-6" id="filterSidebar">
                <!-- Header del sidebar -->
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-filter text-red-600"></i> Filtros
                    </h3>
                    <button id="closeSidebar" class="lg:hidden text-gray-500 hover:text-red-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- Categorías -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Categorías</h4>
                    <div class="space-y-2">
                        <button class="filter-btn active w-full text-left px-3 py-2 rounded-lg" data-category="all">
                            Todas las categorías
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="electronica">
                            <i class="fas fa-laptop"></i> Electrónicos
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="ropa">
                            <i class="fas fa-tshirt"></i> Ropa
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="hogar">
                            <i class="fas fa-home"></i> Hogar
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="deportes">
                            <i class="fas fa-football-ball"></i> Deportes
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="libros">
                            <i class="fas fa-book"></i> Libros
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="juguetes">
                            <i class="fas fa-gamepad"></i> Juguetes
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="belleza">
                            <i class="fas fa-palette"></i> Belleza
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="automotriz">
                            <i class="fas fa-car"></i> Automotriz
                        </button>
                    </div>
                </div>

                <!-- Rango de precios -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Precio</h4>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-4">
                            <input type="number" id="minPrice" placeholder="Min" class="w-20 px-2 py-1 border rounded text-sm" min="0">
                            <span class="text-gray-500">-</span>
                            <input type="number" id="maxPrice" placeholder="Max" class="w-20 px-2 py-1 border rounded text-sm" min="0">
                        </div>
                    </div>
                </div>

                <!-- Calificación -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Calificación</h4>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rating-filter" data-rating="5">
                            <div class="star-rating">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">(5 estrellas)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rating-filter" data-rating="4">
                            <div class="star-rating">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">(4+ estrellas)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rating-filter" data-rating="3">
                            <div class="star-rating">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">(3+ estrellas)</span>
                        </label>
                    </div>
                </div>

                <!-- Botón limpiar filtros -->
                <button id="clearFilters" class="btn-secondary w-full py-2 rounded-lg">
                    <i class="fas fa-undo"></i> Limpiar Filtros
                </button>
            </aside>

            <!-- Contenido principal -->
            <div class="flex-1 min-w-0">
                <!-- Header de productos -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800 mb-2">
                                <i class="fas fa-box text-red-600"></i> Nuestros Productos
                            </h1>
                            <p class="text-gray-600">Descubre nuestra amplia selección de productos premium</p>
                        </div>
                        <div class="mt-4 md:mt-0 flex items-center space-x-4">
                            <button id="toggleFilters" class="lg:hidden btn-secondary px-4 py-2 rounded-lg">
                                <i class="fas fa-filter"></i> Filtros
                            </button>
                            
                           
                            
                            <select id="sortBy" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                                <option value="featured">Destacados</option>
                                <option value="price-low">Precio: Menor a Mayor</option>
                                <option value="price-high">Precio: Mayor a Menor</option>
                                <option value="rating">Mejor Calificados</option>
                                <option value="newest">Más Recientes</option>
                                <option value="name-asc">Nombre: A-Z</option>
                                <option value="name-desc">Nombre: Z-A</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Contador de productos -->
                    <div class="mt-4 flex items-center justify-between">
                        <span id="productCount" class="text-sm text-gray-600">Cargando productos...</span>
                    </div>
                </div>

                <!-- Loading spinner -->
                <div id="loadingSpinner" class="flex justify-center items-center py-12">
                    <div class="loading-spinner">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                </div>

                <!-- Grid de productos con Tailwind -->
                <div id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 hidden">
                    <!-- Los productos se cargarán dinámicamente aquí -->
                </div>

                <!-- Mensaje sin productos -->
                <div id="noProducts" class="text-center py-12 hidden">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
                    <p class="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
                </div>

                <!-- Paginación -->
                {{-- <div id="pagination" class="flex justify-center items-center mt-8 space-x-2 hidden">
                    <button id="prevPage" class="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div id="pageNumbers" class="flex space-x-2">
                        <!-- Números de página se generarán dinámicamente -->
                    </div>
                    <button id="nextPage" class="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div> --}}
            </div>
        </div>
    </div>

    <!-- modalShoppingCart -->
@include('modals.shopingcart-items.ModalShopingCart')
    <!-- Button modalShoppingCart -->
@include('modals.shopingcart-items.ButtonShopingCart')

@endsection



<script>
    // Configurar CSRF token para peticiones AJAX
    window.csrfToken = '{{ csrf_token() }}';
    
    // Configurar meta tag si no existe
    document.addEventListener('DOMContentLoaded', function() {
        if (!document.querySelector('meta[name="csrf-token"]')) {
            const meta = document.createElement('meta');
            meta.name = 'csrf-token';
            meta.content = '{{ csrf_token() }}';
            document.head.appendChild(meta);
        }
    });
</script>

@vite('resources/js/products.js')