<!-- Sección de Perfil del Emprendedor -->
<div id="perfil" class="section-content">
    <!-- Alertas -->
    <div id="alert-container" class="mb-6"></div>

    <!-- Header con Avatar y Datos Básicos -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="gradient-primary h-32"></div>
        <div class="px-6 pb-6 -mt-16">
            <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
                <!-- Avatar Section -->
                <div class="relative">
                    <div class="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-light group">
                        <img id="avatar-preview" 
                             src="" 
                             alt="Foto de perfil" 
                             class="w-full h-full object-cover">
                        
                        <!-- Overlay hover -->
                        <label for="avatar-input" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </label>
                    </div>
                    <input type="file" id="avatar-input" class="hidden" accept="image/jpeg,image/png,image/jpg,image/gif">
                    
                    <!-- Botón eliminar foto -->
                    <button id="delete-avatar-btn" 
                            type="button"
                            class="absolute -top-1 -right-1 bg-error text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors hidden"
                            title="Eliminar foto">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Info del usuario -->
                <div class="flex-1 text-center md:text-left">
                    <h1 id="profile-name" class="text-3xl font-bold text-dark mb-1">Cargando...</h1>
                    <p id="profile-email" class="text-medium mb-3">correo@ejemplo.com</p>
                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span id="profile-city" class="inline-flex items-center text-sm text-light">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>-</span>
                        </span>
                        <span id="profile-registered" class="inline-flex items-center text-sm text-light">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>Miembro desde -</span>
                        </span>
                        <span id="email-verified-badge" class="hidden inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-light text-green">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            Verificado
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Contenido Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Sidebar - Información Adicional -->
        <div class="lg:col-span-1 space-y-6">
            
            <!-- Información de Contacto -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-bold text-dark mb-4 flex items-center">
                    <svg class="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Información de Contacto
                </h2>
                <div class="space-y-4">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs text-gray uppercase font-semibold mb-1">Email</p>
                            <p id="sidebar-email" class="text-sm text-dark break-all">-</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs text-gray uppercase font-semibold mb-1">Teléfono</p>
                            <p id="sidebar-phone" class="text-sm text-dark">-</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs text-gray uppercase font-semibold mb-1">Dirección</p>
                            <p id="sidebar-address" class="text-sm text-dark">-</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Descripción Personal -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-bold text-dark mb-3 flex items-center">
                    <svg class="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Sobre mí
                </h2>
                <p id="sidebar-description" class="text-sm text-medium leading-relaxed">-</p>
            </div>
        </div>

        <!-- Formulario de Edición -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-dark flex items-center">
                        <svg class="w-6 h-6 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Editar Perfil
                    </h2>
                    <span class="text-xs text-gray bg-gray-100 px-3 py-1 rounded-full">* Campos obligatorios</span>
                </div>

                <form id="profile-form" class="space-y-6">
                    @csrf
                    
                    <!-- Nombre y Apellido -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre <span class="text-error">*</span>
                            </label>
                            <input type="text" 
                                   name="first_name" 
                                   id="first_name" 
                                   class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                                   required>
                            <span class="error-message text-xs text-error mt-1 hidden block"></span>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Apellido <span class="text-error">*</span>
                            </label>
                            <input type="text" 
                                   name="last_name" 
                                   id="last_name" 
                                   class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                                   required>
                            <span class="error-message text-xs text-error mt-1 hidden block"></span>
                        </div>
                    </div>
                    
                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Correo Electrónico <span class="text-error">*</span>
                        </label>
                        <input type="email" 
                               name="email" 
                               id="email" 
                               class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                               required>
                        <span class="error-message text-xs text-error mt-1 hidden block"></span>
                    </div>
                    
                    <!-- Teléfono y Ciudad -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                            <input type="tel" 
                                   name="phone" 
                                   id="phone" 
                                   placeholder="+57 300 123 4567"
                                   class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                            <span class="error-message text-xs text-error mt-1 hidden block"></span>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                            <input type="text" 
                                   name="city" 
                                   id="city" 
                                   placeholder="Popayán"
                                   class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                            <span class="error-message text-xs text-error mt-1 hidden block"></span>
                        </div>
                    </div>
                    
                    <!-- Dirección -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                        <input type="text" 
                               name="address" 
                               id="address" 
                               placeholder="Calle 5 #12-34, Barrio Centro"
                               class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                        <span class="error-message text-xs text-error mt-1 hidden block"></span>
                    </div>
                    
                    <!-- Descripción Personal -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Descripción Personal
                            <span class="text-xs text-gray-500 font-normal ml-1">(máximo 500 caracteres)</span>
                        </label>
                        <textarea name="description" 
                                  id="description" 
                                  class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none" 
                                  rows="4" 
                                  maxlength="500"
                                  placeholder="Cuéntanos sobre ti y tu negocio..."></textarea>
                        <div class="flex justify-between items-center mt-2">
                            <span class="error-message text-xs text-error hidden block"></span>
                            <span id="char-counter" class="text-xs text-gray-500 font-medium">0 / 500</span>
                        </div>
                    </div>
                    
                    <!-- Botones -->
                    <div class="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                        <button type="button" 
                                id="cancel-btn"
                                class="btn-outline-primary px-6 py-3 rounded-lg font-medium hover:bg-accent transition-all">
                            Cancelar Cambios
                        </button>
                        <button type="submit" 
                                id="submit-btn"
                                class="btn-primary px-6 py-3 text-white rounded-lg font-medium flex items-center justify-center shadow-primary hover:shadow-primary-lg transition-all">
                            <svg id="submit-icon" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span id="submit-text">Actualizar Perfil</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
// Auto-cargar datos cuando se muestra la sección
document.addEventListener('DOMContentLoaded', function() {
    const perfilSection = document.getElementById('perfil');
    
    if (perfilSection) {
        // Observar cambios de visibilidad
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                const isVisible = !perfilSection.classList.contains('hidden') && 
                                perfilSection.style.display !== 'none' &&
                                perfilSection.offsetParent !== null;
                
                if (isVisible && typeof window.loadEntrepreneurProfile === 'function') {
                    console.log('🔵 [AUTO] Sección de perfil visible, cargando datos...');
                    window.loadEntrepreneurProfile();
                    observer.disconnect(); // Solo cargar una vez
                }
            });
        });
        
        observer.observe(perfilSection, { 
            attributes: true, 
            attributeFilter: ['class', 'style'],
            childList: false,
            subtree: false
        });
        
        // Si ya está visible, cargar inmediatamente
        setTimeout(() => {
            if (perfilSection.offsetParent !== null && typeof window.loadEntrepreneurProfile === 'function') {
                console.log('🔵 [AUTO] Sección ya visible, cargando datos inmediatamente...');
                window.loadEntrepreneurProfile();
            }
        }, 500);
    }
});
</script>

@vite(['resources/js/entrepreneurProfile.js'])