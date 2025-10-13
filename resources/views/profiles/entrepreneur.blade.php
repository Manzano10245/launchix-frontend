@vite('resources/js/MisServicios.js')
@extends('layouts.app')

@section('title', 'profile')

@vite('resources/css/entrepreneur.css')

@section('content')

    <meta name="csrf-token" content="{{ csrf_token() }}">
    <div class="container mx-auto px-4 py-8 mt-16">
        <div class="flex gap-6">
            <!-- Sidebar -->
            <aside class="w-80 bg-white rounded-lg shadow-lg sticky-aside filter-sidebar p-6">
                <div class="text-center mb-6">
                    <div class="w-20 h-20 bg-light rounded-full mx-auto mb-3 flex items-center justify-center">
                        <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                        </svg>
                    </div>
                    @php
                        $entrepreneur = $entrepreneur ?? (Auth::guard('entrepreneur')->user() ?? null);
                    @endphp
                    <h2 class="text-lg font-semibold text-gray-800">
                        {{ $entrepreneur ? ($entrepreneur->first_name . ' ' . $entrepreneur->last_name) : 'Emprendedor' }}
                    </h2>
                    <p class="text-sm text-gray-600">{{ $entrepreneur ? $entrepreneur->email : '' }}</p>
                </div>

                <nav class="space-y-2">
                    <button class="menu-item active w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-lighter flex items-center space-x-3" onclick="showSection('dashboard')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                        <span>Dashboard</span>
                    </button>

                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-lighter flex items-center space-x-3" onclick="showSection('productos')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                        <span>Mis Productos</span>
                    </button>

                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-lighter flex items-center space-x-3" onclick="showSection('publicar-producto')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z"/>
                        </svg>
                        <span>Publicar Producto</span>
                    </button>

                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-lighter flex items-center space-x-3" onclick="showSection('servicios')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Mis Servicios</span>
                    </button>

                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-lighter flex items-center space-x-3" onclick="showSection('publicar-servicio')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                        <span>Publicar Servicio</span>
                    </button>

                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-lighter flex items-center space-x-3" onclick="showSection('perfil')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 8a2 2 0 00-2 2v6a2 2 0 002 2h.01a2 2 0 002-2v-6a2 2 0 00-2-2H10z"/>
                        </svg>
                        <span>Mi Perfil</span>
                    </button>

                    <button class="menu-item w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-lighter flex items-center space-x-3" onclick="showSection('configuracion')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 8a2 2 0 00-2 2v6a2 2 0 002 2h.01a2 2 0 002-2v-6a2 2 0 00-2-2H10z"/>
                        </svg>
                        <span>Configuración</span>
                    </button>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1">
                @include('modals.login-items.entrepreneur.DashboardSection')

                @include('modals.login-items.entrepreneur.ProductsSection')

                @include('modals.login-items.entrepreneur.ProductPublishingSection')

                @include('modals.login-items.entrepreneur.ServicesSection')

                @include('modals.login-items.entrepreneur.ServicePublishingSection')

                @include('modals.login-items.entrepreneur.ProfileSection')

                @include('modals.login-items.entrepreneur.SettingsSection')
            </main>
        </div>
    </div>


@endsection

@vite('resources/js/entrepreneur.js')

@vite('resources/js/ProductPublishing.js')

@vite('resources/js/ServicePublishing.js')