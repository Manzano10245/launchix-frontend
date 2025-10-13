@vite('resources/css/navbar.css')
<!-- Navbar compacto -->
<nav class="navbar text-white p-3 sticky top-0 z-50">
    <div class="container mx-auto">
        <div class="navbar-container">
                <!-- Logo -->
            <div class="text-xl font-bold">
                <a href="{{ route('home') }}" class="logo flex items-center space-x-2">
                    <i class="fas fa-shopping-cart text-2xl bounce-icon"></i>
                    <span>Launchix</span>
                </a>
            </div>

            <!-- Enlaces principales (ocultos en móvil) -->
            <div class="nav-main-links">
                <a href="{{ route('masvendidos') }}" class="nav-link hover:text-lighter transition-colors duration-300">
                    <i class="fas fa-star"></i> Más Vendidos
                </a>
                <a href="{{ route('productos') }}" class="nav-link hover:text-lighter transition-colors duration-300">
                    <i class="fas fa-box"></i> Productos
                </a>
                <a href="{{ route('servicios') }}" class="nav-link hover:text-lighter transition-colors duration-300">
                    <i class="fas fa-concierge-bell"></i> Servicios
                </a>
                <div class="relative" id="categoriesContainer">
                    <button id="categoriesButton" class="nav-link hover:text-lighter transition-colors duration-300">
                        <i class="fas fa-list"></i> Categorías
                    </button>
                    <div id="categoriesModal" class="modal absolute bg-white p-4 rounded-lg shadow-lg w-48 mt-2 hidden z-50">
                        <ul>
                            <li class="mb-2"><a href="#" class="text-primary hover:text-secondary transition-colors block p-2 rounded hover:bg-gray-100">Electrónicos</a></li>
                            <li class="mb-2"><a href="#" class="text-primary hover:text-secondary transition-colors block p-2 rounded hover:bg-gray-100">Ropa</a></li>
                            <li class="mb-2"><a href="#" class="text-primary hover:text-secondary transition-colors block p-2 rounded hover:bg-gray-100">Hogar</a></li>
                            <li class="mb-2"><a href="#" class="text-primary hover:text-secondary transition-colors block p-2 rounded hover:bg-gray-100">Deportes</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Barra de búsqueda compacta (oculta en móvil) -->
            <div class="search-compact">
                <form class="flex items-center search-container">
                    <input type="text" id="searchInput" placeholder="Buscar productos..."
                        class="search-input px-3 py-2 text-gray-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary w-full text-sm">
                    <button type="submit" class="search-btn bg-primary hover:bg-secondary text-white font-bold py-2 px-3 rounded-r-lg transition-colors duration-300">
                        <i class="fas fa-search"></i>
                    </button>
                </form>
            </div>

            <!-- Enlaces de usuario (ocultos en móvil) -->
            <div class="nav-user-links">
                <!-- Botón Iniciar Sesión / Registro (mostrar solo si no hay sesión en ningún guard) -->
                @guest('web')
                @guest('entrepreneur')
                <div id="authSection" class="relative">
                    <button onclick="document.getElementById('userTypeModal').classList.remove('hidden')" class="auth-btn bg-lighter hover:bg-light text-primary font-semibold py-2 px-3 rounded-lg transition-all duration-300 text-sm">
                        <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                    </button>
                </div>
                @endguest
                @endguest

                <!-- Sección de perfil (mostrar solo si hay sesión - CORREGIDO) -->
                @auth('web')
                <div class="relative" id="profileContainer">
                    <button onclick="document.getElementById('profileModal').classList.toggle('hidden')" class="nav-link hover:text-lighter transition-colors duration-300">
                        <i class="fas fa-user"></i> Perfil
                    </button>
                    <div id="profileModal" class="profile-modal absolute right-0 bg-white p-4 rounded-lg shadow-lg w-48 mt-2 hidden z-50">
                        <ul>
                            <li class="mb-2">
                                <a href="{{ route('user') }}" class="profile-modal-item text-primary hover:text-secondary transition-colors block p-2 rounded">
                                    <i class="fas fa-user-circle mr-2"></i>Mi Perfil
                                </a>
                            </li>
                            <li class="mb-2">
                                <a href="#" class="profile-modal-item text-primary hover:text-secondary transition-colors block p-2 rounded">
                                    <i class="fas fa-cog mr-2"></i>Configuraciones
                                </a>
                            </li>
                            <li class="mb-2">
                                <form method="POST" action="{{ route('logout.user') }}">
                                    @csrf
                                    <button type="submit" class="profile-modal-item text-primary hover:text-secondary transition-colors block p-2 rounded w-full text-left">
                                        <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </div>
                </div>
                @endauth

                @auth('entrepreneur')
                <div class="relative" id="profileContainer">
                    <button onclick="document.getElementById('profileModalEntrepreneur').classList.toggle('hidden')" class="nav-link hover:text-lighter transition-colors duration-300">
                        <i class="fas fa-user"></i> Perfil
                    </button>
                    <div id="profileModalEntrepreneur" class="profile-modal absolute right-0 bg-white p-4 rounded-lg shadow-lg w-48 mt-2 hidden z-50">
                        <ul>
                            <li class="mb-2">
                                <a href="{{ route('entrepreneur') }}" class="profile-modal-item text-primary hover:text-secondary transition-colors block p-2 rounded">
                                    <i class="fas fa-user-circle mr-2"></i>Mi Perfil
                                </a>
                            </li>
                            <li class="mb-2">
                                <a href="#" class="profile-modal-item text-primary hover:text-secondary transition-colors block p-2 rounded">
                                    <i class="fas fa-cog mr-2"></i>Configuraciones
                                </a>
                            </li>
                            <li class="mb-2">
                                <form method="POST" action="{{ route('logout.entrepreneur') }}">
                                    @csrf
                                    <button type="submit" class="profile-modal-item text-primary hover:text-secondary transition-colors block p-2 rounded w-full text-left">
                                        <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </div>
                </div>
                @endauth

                <a href="{{ route('shoppingCart') }}" class="nav-link hover:text-lighter transition-colors duration-300">
                    <i class="fas fa-shopping-cart"></i> Carrito
                </a>

                <a href="#" class="nav-link hover:text-lighter transition-colors duration-300">
                    <i class="fas fa-question-circle"></i> Ayuda
                </a>
            </div>

            <!-- Botón de menú móvil -->
            <button id="mobileMenuBtn" class="lg:hidden nav-link">
                <i class="fas fa-bars text-xl"></i>
            </button>
        </div>
    </div>

    <!-- Menú móvil -->
    <div id="mobileMenu" class="mobile-menu hidden lg:hidden mt-4 p-4 rounded-lg">
        <div class="flex flex-col space-y-2">
            <!-- Barra de búsqueda móvil -->
            <div class="border-b border-white/20 pb-3 mb-3">
                <form class="flex items-center">
                    <input type="text" placeholder="Buscar productos..." class="flex-1 px-3 py-2 text-gray-800 rounded-l-lg focus:outline-none">
                    <button type="submit" class="bg-primary hover:bg-secondary text-white py-2 px-3 rounded-r-lg transition-colors duration-300">
                        <i class="fas fa-search"></i>
                    </button>
                </form>
            </div>

            <!-- Enlaces principales móvil -->
            <a href="{{ route('masvendidos') }}" class="mobile-menu-link text-white">
                <i class="fas fa-star mr-2"></i> Más Vendidos
            </a>
            <a href="{{ route('productos') }}" class="mobile-menu-link text-white">
                <i class="fas fa-box mr-2"></i> Productos
            </a>
            <a href="{{ route('servicios') }}" class="mobile-menu-link text-white">
                <i class="fas fa-concierge-bell mr-2"></i> Servicios
            </a>

            <!-- Categorías móvil con submenu -->
            <div class="mobile-category-container">
                <button id="mobileCategoriesBtn" class="mobile-menu-link text-white w-full text-left flex items-center justify-between">
                    <span><i class="fas fa-list mr-2"></i> Categorías</span>
                    <i class="fas fa-chevron-down transition-transform duration-300" id="mobileCategoriesIcon"></i>
                </button>
                <div id="mobileCategoriesMenu" class="hidden ml-4 mt-2 space-y-2">
                    <a href="#" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                        <i class="fas fa-laptop mr-2"></i> Electrónicos
                    </a>
                    <a href="#" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                        <i class="fas fa-tshirt mr-2"></i> Ropa
                    </a>
                    <a href="#" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                        <i class="fas fa-home mr-2"></i> Hogar
                    </a>
                    <a href="#" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                        <i class="fas fa-running mr-2"></i> Deportes
                    </a>
                </div>
            </div>

            <!-- Separador -->
            <div class="border-t border-white/20 pt-3 mt-3">
                <!-- Botón auth móvil (mostrar solo si no hay sesión en ningún guard) -->
                @guest('web')
                @guest('entrepreneur')
                <div id="mobileAuthSection">
                    <button onclick="document.getElementById('userTypeModal').classList.remove('hidden')" class="mobile-menu-link text-white w-full text-left">
                        <i class="fas fa-sign-in-alt mr-2"></i> Iniciar Sesión
                    </button>
                </div>
                @endguest
                @endguest

                <!-- Perfil móvil para USUARIOS (mostrar solo si hay sesión de usuario) -->
                @auth('web')
                <div class="mobile-profile-container" id="mobileProfileContainer">
                    <button onclick="document.getElementById('mobileProfileMenu').classList.toggle('hidden'); document.getElementById('mobileProfileIcon').classList.toggle('rotate-180')" class="mobile-menu-link text-white w-full text-left flex items-center justify-between">
                        <span><i class="fas fa-user mr-2"></i> Perfil</span>
                        <i class="fas fa-chevron-down transition-transform duration-300" id="mobileProfileIcon"></i>
                    </button>
                    <div id="mobileProfileMenu" class="hidden ml-4 mt-2 space-y-2">
                        <a href="{{ route('user') }}" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                            <i class="fas fa-user-circle mr-2"></i> Mi Perfil
                        </a>
                        <a href="#" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                            <i class="fas fa-cog mr-2"></i> Configuraciones
                        </a>
                        <form method="POST" action="{{ route('logout.user') }}">
                            @csrf
                            <button type="submit" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors w-full text-left">
                                <i class="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
                            </button>
                        </form>
                    </div>
                </div>
                @endauth

                <!-- Perfil móvil para EMPRENDEDORES (mostrar solo si hay sesión de emprendedor) -->
                @auth('entrepreneur')
                <div class="mobile-profile-container" id="mobileProfileContainerEntrepreneur">
                    <button onclick="document.getElementById('mobileProfileMenuEntrepreneur').classList.toggle('hidden'); document.getElementById('mobileProfileIconEntrepreneur').classList.toggle('rotate-180')" class="mobile-menu-link text-white w-full text-left flex items-center justify-between">
                        <span><i class="fas fa-user mr-2"></i> Perfil</span>
                        <i class="fas fa-chevron-down transition-transform duration-300" id="mobileProfileIconEntrepreneur"></i>
                    </button>
                    <div id="mobileProfileMenuEntrepreneur" class="hidden ml-4 mt-2 space-y-2">
                        <a href="{{ route('entrepreneur') }}" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                            <i class="fas fa-user-circle mr-2"></i> Mi Perfil
                        </a>
                        <a href="#" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors">
                            <i class="fas fa-cog mr-2"></i> Configuraciones
                        </a>
                        <form method="POST" action="{{ route('logout.entrepreneur') }}">
                            @csrf
                            <button type="submit" class="block text-white/80 hover:text-white py-2 px-4 rounded transition-colors w-full text-left">
                                <i class="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
                            </button>
                        </form>
                    </div>
                </div>
                @endauth

                <a href="#" class="mobile-menu-link text-white">
                    <i class="fas fa-shopping-cart mr-2"></i> Carrito
                </a>
                <a href="#" class="mobile-menu-link text-white">
                    <i class="fas fa-question-circle mr-2"></i> Ayuda
                </a>
            </div>
        </div>
    </div>
</nav>

<!-- Modal de selección de tipo de usuario -->
<div id="userTypeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">¡Únete a Launchix!</h2>
            <p class="text-gray-600 mb-6">Selecciona cómo quieres comenzar</p>

            <div class="space-y-4">
                <!-- Opción Usuario -->
                <a href="{{ route('register.user') }}" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 block text-decoration-none">
                    <i class="fas fa-user text-xl"></i>
                    <div class="text-left">
                        <div class="text-lg font-bold">Soy Usuario</div>
                        <div class="text-sm opacity-90">Quiero comprar productos y servicios</div>
                    </div>
                </a>

                <!-- Opción Emprendedor -->
                <a href="{{ route('register.entrepreneur') }}" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 block text-decoration-none">
                    <i class="fas fa-store text-xl"></i>
                    <div class="text-left">
                        <div class="text-lg font-bold">Soy Emprendedor</div>
                        <div class="text-sm opacity-90">Quiero vender mis productos y servicios</div>
                    </div>
                </a>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-500 mb-3">¿Ya tienes cuenta?</p>
                <div class="space-y-2">
                    <a href="{{ route('login.user') }}" class="block text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-300">
                        Iniciar Sesión - Usuario
                    </a>
                    <a href="{{ route('login.entrepreneur') }}" class="block text-green-500 hover:text-green-600 font-semibold transition-colors duration-300">
                        Iniciar Sesión - Emprendedor
                    </a>
                </div>
            </div>

            <!-- Botón cerrar -->
            <button onclick="document.getElementById('userTypeModal').classList.add('hidden')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-300">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
    </div>
</div>
@vite('resources/js/navbar.js')
