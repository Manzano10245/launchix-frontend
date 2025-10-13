@extends('layouts.app')

@section('title', 'Mi Perfil')

@vite(['resources/css/profile.css', 'resources/js/profileSection.js'])

@section('content')

@vite('resources/css/profileSection.css')

<!-- Main Content -->
<div class="container mx-auto px-4 py-8">
    
    <div class="flex gap-8">
        <!-- Sidebar -->
        @include('modals.login-items.user.sideBar')

        <!-- Main Content Area -->
        <main class="flex-1">
            
            <!-- Header con tabs -->
            <div class="bg-white rounded-t-lg shadow-soft border-b border-gray-200">
                <div class="px-8 pt-8 pb-0">
                    <h1 class="text-3xl font-bold text-dark mb-6">Mi Perfil</h1>
                    
                    <!-- Tabs -->
                    <div class="flex gap-1">
                        <button id="tabViewProfile" class="tab-button active px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2">
                            <svg class="inline-block w-5 h-5 mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Ver Información
                        </button>
                        <button id="tabEditProfile" class="tab-button px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2">
                            <svg class="inline-block w-5 h-5 mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Editar Perfil
                        </button>
                    </div>
                </div>
            </div>

            <!-- Notification Area -->
            <div id="profileNotification" class="hidden mx-0 mt-4">
                <div class="rounded-lg p-4 flex items-start gap-3">
                    <svg id="notificationIcon" class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <p id="profileNotificationText" class="font-medium flex-1"></p>
                    <button onclick="document.getElementById('profileNotification').classList.add('hidden')" class="text-current opacity-70 hover:opacity-100">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Sección 1: Vista de Información del Perfil -->
            <div id="viewProfileSection" class="bg-white rounded-b-lg shadow-soft">
                <div class="p-8">
                    
                    <!-- Header con avatar y acciones -->
                    <div class="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
                        <div class="flex items-center gap-6">
                            <!-- Avatar -->
                            <div class="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-primary">
                                <span id="viewUserInitials">U</span>
                            </div>
                            
                            <!-- Info básica -->
                            <div>
                                <h2 id="viewUserName" class="text-2xl font-bold text-dark mb-1">Cargando...</h2>
                                <p id="viewUserEmail" class="text-medium mb-2">email@ejemplo.com</p>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green rounded-full"></div>
                                    <span class="text-sm text-light">Cuenta Activa</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Botón de edición rápida -->
                        <button onclick="showEditSection()" class="btn-outline-primary px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-primary">
                            <svg class="inline-block w-5 h-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Editar Perfil
                        </button>
                    </div>

                    <!-- Grid de información -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <!-- Columna 1: Información Personal -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                                    <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </div>
                                <h3 class="text-lg font-semibold text-dark">Información Personal</h3>
                            </div>

                            <div class="space-y-4">
                                <div class="info-item">
                                    <label class="text-sm text-light font-medium">Nombre Completo</label>
                                    <p id="viewName" class="text-dark font-medium mt-1">-</p>
                                </div>

                                <div class="info-item">
                                    <label class="text-sm text-light font-medium">Nombre de Usuario</label>
                                    <p id="viewUsername" class="text-dark font-medium mt-1">-</p>
                                </div>

                                <div class="info-item">
                                    <label class="text-sm text-light font-medium">Correo Electrónico</label>
                                    <p id="viewEmail" class="text-dark font-medium mt-1">-</p>
                                </div>

                                <div class="info-item">
                                    <label class="text-sm text-light font-medium">Teléfono</label>
                                    <p id="viewPhone" class="text-dark font-medium mt-1">-</p>
                                </div>

                                <div class="info-item">
                                    <label class="text-sm text-light font-medium">Fecha de Nacimiento</label>
                                    <p id="viewBirthdate" class="text-dark font-medium mt-1">-</p>
                                </div>
                            </div>
                        </div>

                        <!-- Columna 2: Dirección -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-lg bg-orange-light flex items-center justify-center">
                                    <svg class="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                </div>
                                <h3 class="text-lg font-semibold text-dark">Dirección de Envío</h3>
                            </div>

                            <div class="space-y-4">
                                <div class="info-item">
                                    <label class="text-sm text-light font-medium">Dirección Principal</label>
                                    <p id="viewAddress" class="text-dark font-medium mt-1">-</p>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div class="info-item">
                                        <label class="text-sm text-light font-medium">Ciudad</label>
                                        <p id="viewCity" class="text-dark font-medium mt-1">-</p>
                                    </div>
                                    <div class="info-item">
                                        <label class="text-sm text-light font-medium">Código Postal</label>
                                        <p id="viewPostalCode" class="text-dark font-medium mt-1">-</p>
                                    </div>
                                </div>

                                <div class="info-item">
                                    <label class="text-sm text-light font-medium">Departamento</label>
                                    <p id="viewDepartment" class="text-dark font-medium mt-1">-</p>
                                </div>
                            </div>

                            <!-- Información adicional -->
                            <div class="mt-8 p-4 bg-light rounded-lg border border-accent">
                                <div class="flex items-start gap-3">
                                    <svg class="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                    </svg>
                                    <div>
                                        <p class="text-sm text-medium font-medium mb-1">Última Actualización</p>
                                        <p id="viewLastUpdate" class="text-sm text-light">-</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección 2: Editar Perfil -->
            <div id="editProfileSection" class="hidden bg-white rounded-b-lg shadow-soft">
                <div class="p-8">
                    
                    <!-- Form Header -->
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-dark mb-2">Actualizar Información</h2>
                        <p class="text-medium">Modifica tus datos personales y preferencias de cuenta</p>
                    </div>

                    <!-- Profile Form -->
                    <form id="profileForm" class="space-y-8">
                        @csrf
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            <!-- Personal Information -->
                            <div class="space-y-6">
                                <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
                                    <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                                        <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </div>
                                    <h3 class="font-semibold text-dark">Información Personal</h3>
                                </div>
                                
                                <div class="form-group">
                                    <label for="profileName" class="form-label">
                                        Nombre Completo <span class="text-error">*</span>
                                    </label>
                                    <input type="text" 
                                           id="profileName" 
                                           name="name" 
                                           class="form-input" 
                                           placeholder="Ingresa tu nombre completo"
                                           required>
                                </div>

                                <div class="form-group">
                                    <label for="profileUsername" class="form-label">
                                        Nombre de Usuario <span class="text-error">*</span>
                                    </label>
                                    <input type="text" 
                                           id="profileUsername" 
                                           name="username" 
                                           class="form-input" 
                                           placeholder="Ingresa tu nombre de usuario"
                                           required>
                                </div>

                                <div class="form-group">
                                    <label for="profileEmail" class="form-label">
                                        Correo Electrónico <span class="text-error">*</span>
                                    </label>
                                    <input type="email" 
                                           id="profileEmail" 
                                           name="email" 
                                           class="form-input" 
                                           placeholder="tu@email.com"
                                           required>
                                </div>

                                <div class="form-group">
                                    <label for="profilePhone" class="form-label">Teléfono</label>
                                    <input type="tel" 
                                           id="profilePhone" 
                                           name="phone" 
                                           class="form-input" 
                                           placeholder="+57 300 123 4567">
                                </div>

                                <div class="form-group">
                                    <label for="profileBirthdate" class="form-label">Fecha de Nacimiento</label>
                                    <input type="date" 
                                           id="profileBirthdate" 
                                           name="birthdate" 
                                           class="form-input">
                                </div>
                            </div>

                            <!-- Address Information -->
                            <div class="space-y-6">
                                <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
                                    <div class="w-8 h-8 rounded-lg bg-orange-light flex items-center justify-center">
                                        <svg class="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                    </div>
                                    <h3 class="font-semibold text-dark">Dirección de Envío</h3>
                                </div>
                                
                                <div class="form-group">
                                    <label for="profileAddress" class="form-label">Dirección Principal</label>
                                    <input type="text" 
                                           id="profileAddress" 
                                           name="main_address" 
                                           class="form-input" 
                                           placeholder="Calle, Carrera, Número">
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-group">
                                        <label for="profileCity" class="form-label">Ciudad</label>
                                        <input type="text" 
                                               id="profileCity" 
                                               name="city" 
                                               class="form-input" 
                                               placeholder="Ciudad">
                                    </div>
                                    <div class="form-group">
                                        <label for="profilePostalCode" class="form-label">Código Postal</label>
                                        <input type="text" 
                                               id="profilePostalCode" 
                                               name="postal_code" 
                                               class="form-input" 
                                               placeholder="000000">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="profileDepartment" class="form-label">Departamento</label>
                                    <select id="profileDepartment" name="department" class="form-input">
                                        <option value="">Selecciona un departamento</option>
                                        <option value="Amazonas">Amazonas</option>
                                        <option value="Antioquia">Antioquia</option>
                                        <option value="Arauca">Arauca</option>
                                        <option value="Atlántico">Atlántico</option>
                                        <option value="Bolívar">Bolívar</option>
                                        <option value="Boyacá">Boyacá</option>
                                        <option value="Caldas">Caldas</option>
                                        <option value="Caquetá">Caquetá</option>
                                        <option value="Casanare">Casanare</option>
                                        <option value="Cauca">Cauca</option>
                                        <option value="Cesar">Cesar</option>
                                        <option value="Chocó">Chocó</option>
                                        <option value="Córdoba">Córdoba</option>
                                        <option value="Cundinamarca">Cundinamarca</option>
                                        <option value="Guainía">Guainía</option>
                                        <option value="Guaviare">Guaviare</option>
                                        <option value="Huila">Huila</option>
                                        <option value="La Guajira">La Guajira</option>
                                        <option value="Magdalena">Magdalena</option>
                                        <option value="Meta">Meta</option>
                                        <option value="Nariño">Nariño</option>
                                        <option value="Norte de Santander">Norte de Santander</option>
                                        <option value="Putumayo">Putumayo</option>
                                        <option value="Quindío">Quindío</option>
                                        <option value="Risaralda">Risaralda</option>
                                        <option value="San Andrés y Providencia">San Andrés y Providencia</option>
                                        <option value="Santander">Santander</option>
                                        <option value="Sucre">Sucre</option>
                                        <option value="Tolima">Tolima</option>
                                        <option value="Valle del Cauca">Valle del Cauca</option>
                                        <option value="Vaupés">Vaupés</option>
                                        <option value="Vichada">Vichada</option>
                                        <option value="Bogotá D.C.">Bogotá D.C.</option>
                                    </select>
                                </div>

                                <!-- Change Password Section -->
                                <div class="mt-6 p-5 bg-lighter rounded-lg border border-accent">
                                    <div class="flex items-center gap-2 mb-4">
                                        <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                        </svg>
                                        <h4 class="font-semibold text-dark">Cambiar Contraseña</h4>
                                    </div>
                                    <p class="text-sm text-medium mb-4">Deja en blanco si no deseas cambiar tu contraseña</p>
                                    
                                    <div class="space-y-4">
                                        <div class="form-group">
                                            <label for="profileCurrentPassword" class="form-label">Contraseña Actual</label>
                                            <input type="password" 
                                                   id="profileCurrentPassword" 
                                                   class="form-input" 
                                                   placeholder="••••••••">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="profileNewPassword" class="form-label">Nueva Contraseña</label>
                                            <input type="password" 
                                                   id="profileNewPassword" 
                                                   class="form-input" 
                                                   placeholder="Mínimo 6 caracteres">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="profileConfirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
                                            <input type="password" 
                                                   id="profileConfirmPassword" 
                                                   class="form-input" 
                                                   placeholder="Repite la contraseña">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button type="button" 
                                    id="profileCancelBtn"
                                    class="px-6 py-3 bg-bg-gray-100 text-medium rounded-lg font-medium hover:bg-gray-200 transition-all duration-200">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    id="profileSaveBtn" 
                                    class="btn-primary px-8 py-3 rounded-lg font-medium shadow-soft hover:shadow-primary transition-all duration-200">
                                <svg class="inline-block w-5 h-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </main>
    </div>
</div>

@endsection

@vite('resources/js/profileSection.js')