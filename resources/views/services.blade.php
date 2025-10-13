@extends('layouts.app')

@section('title', 'Servicios')

@vite('resources/css/services.css')

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
                        <button class="service-filter-btn active w-full text-left px-3 py-2 rounded-lg" data-category="all">
                            Todas las categorías
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="comida">
                            <i class="fas fa-utensils"></i> Comida
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="autolavado">
                            <i class="fas fa-car"></i> Autolavado
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="carpinteria">
                            <i class="fas fa-hammer"></i> Carpintería
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="belleza">
                            <i class="fas fa-cut"></i> Belleza y Spa
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="tecnologia">
                            <i class="fas fa-laptop"></i> Tecnología
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="hogar">
                            <i class="fas fa-home"></i> Hogar y Jardinería
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="educacion">
                            <i class="fas fa-graduation-cap"></i> Educación
                        </button>
                        <button class="service-filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="salud">
                            <i class="fas fa-heartbeat"></i> Salud y Bienestar
                        </button>
                    </div>
                </div>

                <!-- Rango de precios -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Rango de Precio</h4>
                    <div class="space-y-3">
                        <div class="flex items-center space-x-3">
                            <input type="number" id="minPrice" placeholder="Min"
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                            <span class="text-gray-500">-</span>
                            <input type="number" id="maxPrice" placeholder="Max"
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                        <button id="applyPriceFilter" class="w-full text-sm bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors">
                            Aplicar filtro
                        </button>
                    </div>
                </div>

                <!-- Calificación -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Calificación</h4>
                    <div class="space-y-2">
                        <label class="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                            <input type="radio" name="rating" value="5" class="text-red-600 mr-3">
                            <div class="flex items-center text-yellow-400 mr-2">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">5 estrellas</span>
                        </label>
                        <label class="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                            <input type="radio" name="rating" value="4" class="text-red-600 mr-3">
                            <div class="flex items-center text-yellow-400 mr-2">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">4+ estrellas</span>
                        </label>
                        <label class="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                            <input type="radio" name="rating" value="3" class="text-red-600 mr-3">
                            <div class="flex items-center text-yellow-400 mr-2">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">3+ estrellas</span>
                        </label>
                    </div>
                </div>

                <!-- Botón limpiar filtros -->
                <button class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                        id="clearServiceFilters">
                    <i class="fas fa-times mr-2"></i>
                    Limpiar Filtros
                </button>
            </aside>

            <!-- Contenido principal -->
            <main class="flex-1">
                <!-- Header de la página -->
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">Servicios Locales</h1>
                        <p class="text-gray-600">Descubre los mejores servicios de tu comunidad</p>
                    </div>

                    <!-- Barra de búsqueda, botón agregar y filtros móvil -->
                    <div class="flex items-center space-x-4 mt-4 lg:mt-0">
                        <div class="relative flex-1 lg:w-80">
                            <input type="text"
                                   id="services-search"
                                   placeholder="Buscar servicios..."
                                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        </div>

                        @auth('entrepreneur')
                        <button onclick="addNewService()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center">
                            <i class="fas fa-plus mr-2"></i> Agregar Servicio
                        </button>
                        @endauth

                        <button id="mobileFilterToggle" class="lg:hidden bg-red-600 text-white p-2 rounded-lg">
                            <i class="fas fa-filter"></i>
                        </button>
                    </div>
                </div>

                <!-- Barra de estadísticas -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                    <div class="text-sm text-gray-600 mb-2 sm:mb-0">
                        Mostrando <span id="results-count" class="font-semibold text-gray-900">0</span> servicios disponibles
                    </div>

                    <div class="flex items-center space-x-4">
                        <select id="sortServices" class="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="newest">Más recientes</option>
                            <option value="rating">Mejor calificados</option>
                            <option value="price-low">Precio: menor a mayor</option>
                            <option value="price-high">Precio: mayor a menor</option>
                            <option value="name">Nombre A-Z</option>
                        </select>
                    </div>
                </div>

                <!-- Grid de servicios -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" id="services-grid">
                    <!-- Los servicios se cargan dinámicamente aquí -->
                </div>

                <!-- Paginación -->
                <div class="flex justify-center" id="services-pagination">
                    <!-- La paginación se genera dinámicamente -->
                </div>
            </main>
        </div>
    </div>

    <script>
        // Configuración global para servicios
        window.entrepreneurIdFromBlade = @json(Auth::guard('entrepreneur')->user()?->id);
        window.isEntrepreneurLoggedIn = @json(Auth::guard('entrepreneur')->check());
    </script>

    @vite('resources/js/services.js')

@endsection
