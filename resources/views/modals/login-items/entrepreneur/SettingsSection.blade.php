<!-- Sección de Configuración -->
<div id="configuracion" class="section-content">
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Configuración</h1>
        
        <div class="space-y-8">
            <!-- Cambiar Contraseña -->
            <div class="border-b border-gray-200 pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Cambiar Contraseña</h2>
                
                <!-- Alert para mensajes -->
                <div id="password-alert-container" class="mb-4"></div>
                
                <form id="password-form" class="space-y-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual <span class="text-red-600">*</span></label>
                        <input type="password" 
                               name="current_password" 
                               id="current_password"
                               class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                               required>
                        <span class="error-message text-xs text-red-600 mt-1 hidden"></span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña <span class="text-red-600">*</span></label>
                            <input type="password" 
                                   name="new_password"
                                   id="new_password"
                                   class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                                   required>
                            <span class="error-message text-xs text-red-600 mt-1 hidden"></span>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña <span class="text-red-600">*</span></label>
                            <input type="password" 
                                   name="new_password_confirmation"
                                   id="new_password_confirmation"
                                   class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                                   required>
                            <span class="error-message text-xs text-red-600 mt-1 hidden"></span>
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="submit" 
                                id="password-submit-btn"
                                class="btn-primary px-6 py-2 text-white rounded-lg flex items-center">
                            <svg id="password-icon" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span id="password-text">Cambiar Contraseña</span>
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Notificaciones (sin funcionalidad por ahora) -->
            <div class="border-b border-gray-200 pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Notificaciones</h2>
                <p class="text-sm text-gray-500 italic">Próximamente disponible</p>
            </div>
            
            <!-- Privacidad (sin funcionalidad por ahora) -->
            <div>
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Privacidad y Seguridad</h2>
                <p class="text-sm text-gray-500 italic">Próximamente disponible</p>
            </div>
        </div>
    </div>
</div>

<script>
    // entrepreneurSettings.js - Gestión de configuración del emprendedor
document.addEventListener('DOMContentLoaded', function() {
    const passwordForm = document.getElementById('password-form');
    const passwordSubmitBtn = document.getElementById('password-submit-btn');
    const passwordIcon = document.getElementById('password-icon');
    const passwordText = document.getElementById('password-text');
    
    if (!passwordForm) {
        console.log('Formulario de contraseña no encontrado');
        return;
    }

    // ============================================
    // CAMBIAR CONTRASEÑA
    // ============================================
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Limpiar errores previos
        clearPasswordErrors();
        
        const formData = new FormData(passwordForm);
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        
        if (!csrfToken) {
            showPasswordAlert('Error: Token CSRF no encontrado', 'error');
            return;
        }
        
        // Validación básica del lado del cliente
        const currentPassword = formData.get('current_password');
        const newPassword = formData.get('new_password');
        const confirmPassword = formData.get('new_password_confirmation');
        
        if (newPassword.length < 6) {
            showPasswordAlert('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showPasswordAlert('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Deshabilitar botón
        setPasswordButtonState(true);
        
        fetch('/entrepreneur/password', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken.content,
                'Accept': 'application/json'
            },
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw data;
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showPasswordAlert(data.message, 'success');
                passwordForm.reset();
            } else {
                showPasswordAlert(data.message || 'Error al cambiar la contraseña', 'error');
            }
        })
        .catch(error => {
            if (error.errors) {
                displayPasswordErrors(error.errors);
                showPasswordAlert('Por favor corrige los errores', 'error');
            } else if (error.message) {
                showPasswordAlert(error.message, 'error');
            } else {
                showPasswordAlert('Error al cambiar la contraseña', 'error');
            }
        })
        .finally(() => {
            setPasswordButtonState(false);
        });
    });
    
    // ============================================
    // FUNCIONES DE UTILIDAD
    // ============================================
    
    function showPasswordAlert(message, type = 'info') {
        const alertContainer = document.getElementById('password-alert-container');
        
        if (!alertContainer) return;
        
        const colors = {
            success: 'bg-green-50 text-green-800 border-green-300',
            error: 'bg-red-50 text-red-800 border-red-300',
            warning: 'bg-yellow-50 text-yellow-800 border-yellow-300',
            info: 'bg-blue-50 text-blue-800 border-blue-300'
        };
        
        const icons = {
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        };
        
        const alert = document.createElement('div');
        alert.className = `${colors[type]} border-l-4 p-4 rounded-lg flex items-start animate-fade-in`;
        alert.innerHTML = `
            <svg class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${icons[type]}
            </svg>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.remove()" class="ml-3 flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        
        alertContainer.innerHTML = '';
        alertContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
    
    function setPasswordButtonState(loading) {
        if (!passwordSubmitBtn) return;
        
        if (loading) {
            passwordSubmitBtn.disabled = true;
            passwordSubmitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            if (passwordIcon) {
                passwordIcon.innerHTML = '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>';
                passwordIcon.classList.add('animate-spin');
            }
            if (passwordText) passwordText.textContent = 'Actualizando...';
        } else {
            passwordSubmitBtn.disabled = false;
            passwordSubmitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            if (passwordIcon) {
                passwordIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
                passwordIcon.classList.remove('animate-spin');
            }
            if (passwordText) passwordText.textContent = 'Cambiar Contraseña';
        }
    }
    
    function clearPasswordErrors() {
        passwordForm.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        passwordForm.querySelectorAll('input').forEach(el => {
            el.classList.remove('border-red-500', 'focus:ring-red-500');
        });
    }
    
    function displayPasswordErrors(errors) {
        Object.keys(errors).forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.classList.add('border-red-500', 'focus:ring-red-500');
                const errorSpan = input.parentElement.querySelector('.error-message');
                if (errorSpan) {
                    errorSpan.textContent = errors[field][0];
                    errorSpan.classList.remove('hidden');
                }
            }
        });
        
        const firstError = passwordForm.querySelector('.border-red-500');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
</script>