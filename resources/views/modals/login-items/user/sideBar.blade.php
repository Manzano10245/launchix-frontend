        <!-- Sidebar -->
        <aside class="w-80 bg-white rounded-lg shadow-lg sticky-aside filter-sidebar p-6">
            <div class="text-center mb-8">
                <div class="profile-avatar rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                    <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                @auth
                    {{-- Nombre del usuario autenticado --}}
                    <h2 class="text-xl font-bold text-gray-800">
                        {{ Auth::user()->name }}
                    </h2>

                    {{-- Correo del usuario autenticado --}}
                    <p class="text-gray-600">
                        {{ Auth::user()->email }}
                    </p>
                @endauth
            </div>
            <nav class="space-y-2">
                <a href="{{ route('profile') }}" class="menu-item {{ request()->routeIs('profile') ? 'active-menu' : '' }} flex items-center p-3 rounded-lg font-medium">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                    </svg>
                    Mi Perfil
                </a>
                <a href="{{ route('orders') }}" class="menu-item {{ request()->routeIs('orders') ? 'active-menu' : '' }} flex items-center p-3 rounded-lg font-medium">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z" clip-rule="evenodd"></path>
                    </svg>
                    Tus Pedidos
                </a>
                <a href="{{ route('reviews') }}" class="menu-item {{ request()->routeIs('reviews') ? 'active-menu' : '' }} flex items-center p-3 rounded-lg font-medium">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                    </svg>
                    Tus Reseñas
                </a>
                <a href="{{ route('followed') }}" class="menu-item {{ request()->routeIs('followed') ? 'active-menu' : '' }} flex items-center p-3 rounded-lg font-medium">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                    </svg>
                    Tiendas Seguidas
                </a>
                <a href="{{ route('history') }}" class="menu-item {{ request()->routeIs('history') ? 'active-menu' : '' }} flex items-center p-3 rounded-lg font-medium">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                    Historial de Navegación
                </a>
                <a href="{{ route('settings') }}" class="menu-item {{ request()->routeIs('settings') ? 'active-menu' : '' }} flex items-center p-3 rounded-lg font-medium">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
                    </svg>
                    Configuraciones
                </a>
            </nav>
        </aside>

        @vite('resources/js/profile.js')