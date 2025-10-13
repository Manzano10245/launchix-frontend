/**
 * Profile.js - Gestión del perfil de usuario con integración API
 * Versión mejorada con validación robusta, manejo de errores y notificaciones avanzadas
 */

// Módulo de perfil de usuario
const UserProfile = (function() {
    // Configuración privada
    const config = {
        apiBaseUrl: '/api',
        minPasswordLength: 8,
        maxUsernameLength: 30,
        maxNameLength: 100,
        maxBioLength: 500,
        phoneRegex: /^[+\d\s]{8,20}$/,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        usernameRegex: /^[a-zA-Z0-9_]{4,30}$/
    };

    // Estado privado
    let currentUser = null;
    let isLoading = false;

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * Obtiene el token CSRF
     * @returns {string} Token CSRF
     */
    function _getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        if (!token) {
            console.error('❌ [CSRF] Token CSRF no encontrado');
            return '';
        }
        return token.content;
    }

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
    function _showNotification(message, type = 'success') {
        // Verificar si ya existe una notificación
        let notification = document.getElementById('notification');
        let notificationText = document.getElementById('notification-text');

        // Si no existe, crear los elementos
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg hidden transition-all duration-300';

            notificationText = document.createElement('div');
            notificationText.id = 'notification-text';
            notificationText.className = 'flex items-center';

            notification.appendChild(notificationText);
            document.body.appendChild(notification);
        }

        // Configurar estilo según el tipo
        notification.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500');
        notification.classList.remove('error-notification');

        if (type === 'success') {
            notification.classList.add('bg-green-500');
            notificationText.innerHTML = `
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            `;
        } else if (type === 'error') {
            notification.classList.add('bg-red-500', 'error-notification');
            notificationText.innerHTML = `
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span>${message}</span>
            `;
        } else {
            notification.classList.add('bg-blue-500');
            notificationText.innerHTML = `
                <i class="fas fa-info-circle mr-2"></i>
                <span>${message}</span>
            `;
        }

        // Mostrar notificación
        notification.classList.remove('hidden');
        notification.classList.add('show');

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    /**
     * Realiza una petición a la API
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de la petición
     * @returns {Promise} Promesa con la respuesta
     */
    async function _apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': _getCsrfToken()
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            console.log(`📡 [API] ${mergedOptions.method} ${endpoint}`);

            const response = await fetch(`${config.apiBaseUrl}${endpoint}`, mergedOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('❌ [API] Error en la petición:', error);
            throw error;
        }
    }

    /**
     * Valida un campo de formulario
     * @param {HTMLElement} input - Elemento de entrada
     * @param {RegExp} regex - Expresión regular para validación
     * @param {string} errorMessage - Mensaje de error
     * @returns {boolean} True si es válido
     */
    function _validateInput(input, regex, errorMessage) {
        if (!input) return true;

        const value = input.value.trim();
        const errorElement = input.nextElementSibling;

        // Remover errores previos
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }

        // Validar solo si el campo no está vacío
        if (value === '') return true;

        if (!regex.test(value)) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message text-red-500 text-xs mt-1 block';
            errorSpan.textContent = errorMessage;

            input.classList.add('border-red-500');
            input.parentNode.insertBefore(errorSpan, input.nextSibling);

            return false;
        }

        input.classList.remove('border-red-500');
        return true;
    }

    /**
     * Valida la contraseña
     * @param {string} password - Contraseña a validar
     * @returns {string|null} Mensaje de error o null si es válida
     */
    function _validatePassword(password) {
        if (!password) return null;

        if (password.length < config.minPasswordLength) {
            return `La contraseña debe tener al menos ${config.minPasswordLength} caracteres`;
        }

        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }

        if (!/[a-z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra minúscula';
        }

        if (!/[0-9]/.test(password)) {
            return 'La contraseña debe contener al menos un número';
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            return 'La contraseña debe contener al menos un carácter especial';
        }

        return null;
    }

    /**
     * Valida que las contraseñas coincidan
     * @param {string} password1 - Primera contraseña
     * @param {string} password2 - Segunda contraseña
     * @returns {string|null} Mensaje de error o null si coinciden
     */
    function _validatePasswordMatch(password1, password2) {
        if (!password1 && !password2) return null;
        if (password1 !== password2) {
            return 'Las contraseñas no coinciden';
        }
        return null;
    }

    /**
     * Muestra/oculta loading en un botón
     * @param {HTMLElement} button - Botón
     * @param {boolean} show - Mostrar u ocultar loading
     * @param {string} originalText - Texto original del botón
     */
    function _toggleButtonLoading(button, show, originalText) {
        if (!button) return;

        if (show) {
            button.disabled = true;
            button.innerHTML = `
                <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                </span>
            `;
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    /**
     * Carga los datos del usuario desde la API
     */
    async function _loadUserData() {
        try {
            console.log('🔄 [PROFILE] Cargando datos del usuario');

            const response = await _apiRequest('/user/profile');

            if (!response.success) {
                throw new Error(response.message || 'Error al cargar los datos del perfil');
            }

            currentUser = response.user;
            console.log('✅ [PROFILE] Datos del usuario cargados');

            // Rellenar formulario con los datos del usuario
            _populateForm(currentUser);

        } catch (error) {
            console.error('❌ [PROFILE] Error al cargar datos del usuario:', error);
            _showNotification(error.message || 'Error al cargar los datos del perfil', 'error');
        }
    }

    /**
     * Rellena el formulario con los datos del usuario
     * @param {Object} user - Datos del usuario
     */
    function _populateForm(user) {
        if (!user) return;

        const form = document.getElementById('profileForm');
        if (!form) return;

        // Datos personales
        document.getElementById('firstName')?.(value = user.first_name || '');
        document.getElementById('lastName')?.(value = user.last_name || '');
        document.getElementById('email')?.(value = user.email || '');
        document.getElementById('phone')?.(value = user.phone || '');
        document.getElementById('username')?.(value = user.username || '');
        document.getElementById('bio')?.(value = user.bio || '');

        // Datos de negocio (si es emprendedor)
        if (user.entrepreneur) {
            document.getElementById('businessName')?.(value = user.entrepreneur.business_name || '');
            document.getElementById('businessDescription')?.(value = user.entrepreneur.description || '');
            document.getElementById('businessCategory')?.(value = user.entrepreneur.category || '');
            document.getElementById('businessAddress')?.(value = user.entrepreneur.address || '');
            document.getElementById('businessPhone')?.(value = user.entrepreneur.phone || '');
        }

        // Avatar
        if (user.avatar) {
            const avatarPreview = document.getElementById('avatarPreview');
            if (avatarPreview) {
                avatarPreview.src = user.avatar.startsWith('http') ?
                    user.avatar :
                    `/storage/${user.avatar}`;
            }
        }
    }

    /**
     * Configura la previsualización del avatar
     */
    function _setupAvatarPreview() {
        const avatarInput = document.getElementById('avatar');
        const avatarPreview = document.getElementById('avatarPreview');

        if (!avatarInput || !avatarPreview) return;

        avatarInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                };

                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    /**
     * Configura la validación en tiempo real
     */
    function _setupRealTimeValidation() {
        // Validación de email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                _validateInput(this, config.emailRegex, 'Por favor ingresa un correo electrónico válido');
            });
        }

        // Validación de teléfono
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                // Remover caracteres no válidos
                this.value = this.value.replace(/[^+\d\s]/g, '');
            });

            phoneInput.addEventListener('blur', function() {
                _validateInput(this, config.phoneRegex, 'Por favor ingresa un número de teléfono válido');
            });
        }

        // Validación de username
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', function() {
                // Remover caracteres no válidos
                this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
            });

            usernameInput.addEventListener('blur', function() {
                _validateInput(this, config.usernameRegex, 'El nombre de usuario solo puede contener letras, números y guiones bajos (4-30 caracteres)');
            });
        }

        // Validación de contraseñas
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (newPasswordInput && confirmPasswordInput) {
            // Validar contraseña al perder el foco
            newPasswordInput.addEventListener('blur', function() {
                const error = _validatePassword(this.value);
                const errorElement = this.nextElementSibling;

                if (errorElement && errorElement.classList.contains('error-message')) {
                    errorElement.remove();
                }

                if (error) {
                    const errorSpan = document.createElement('span');
                    errorSpan.className = 'error-message text-red-500 text-xs mt-1 block';
                    errorSpan.textContent = error;

                    this.classList.add('border-red-500');
                    this.parentNode.insertBefore(errorSpan, this.nextSibling);
                } else {
                    this.classList.remove('border-red-500');
                }
            });

            // Validar coincidencia de contraseñas
            confirmPasswordInput.addEventListener('blur', function() {
                const password1 = newPasswordInput.value;
                const password2 = this.value;
                const error = _validatePasswordMatch(password1, password2);
                const errorElement = this.nextElementSibling;

                if (errorElement && errorElement.classList.contains('error-message')) {
                    errorElement.remove();
                }

                if (error) {
                    const errorSpan = document.createElement('span');
                    errorSpan.className = 'error-message text-red-500 text-xs mt-1 block';
                    errorSpan.textContent = error;

                    this.classList.add('border-red-500');
                    this.parentNode.insertBefore(errorSpan, this.nextSibling);
                } else {
                    this.classList.remove('border-red-500');
                }
            });
        }

        // Validación de longitud para campos de texto
        const textInputs = [
            { id: 'firstName', maxLength: config.maxNameLength, name: 'nombre' },
            { id: 'lastName', maxLength: config.maxNameLength, name: 'apellido' },
            { id: 'bio', maxLength: config.maxBioLength, name: 'biografía' },
            { id: 'businessName', maxLength: config.maxNameLength, name: 'nombre del negocio' },
            { id: 'businessDescription', maxLength: 500, name: 'descripción del negocio' },
            { id: 'businessAddress', maxLength: 200, name: 'dirección' }
        ];

        textInputs.forEach(input => {
            const element = document.getElementById(input.id);
            if (element) {
                element.addEventListener('input', function() {
                    if (this.value.length > input.maxLength) {
                        this.value = this.value.substring(0, input.maxLength);
                    }
                });

                element.addEventListener('blur', function() {
                    if (this.value.length > input.maxLength) {
                        this.value = this.value.substring(0, input.maxLength);
                    }
                });
            }
        });
    }

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================

    return {
        /**
         * Inicializa el módulo de perfil
         */
        init: function() {
            console.log('👤 [PROFILE] Inicializando módulo de perfil');

            try {
                // Cargar datos del usuario
                _loadUserData();

                // Configurar previsualización del avatar
                _setupAvatarPreview();

                // Configurar validación en tiempo real
                _setupRealTimeValidation();

                // Configurar manejador del formulario
                this.setupFormHandler();

                console.log('✅ [PROFILE] Módulo de perfil inicializado correctamente');

            } catch (error) {
                console.error('❌ [PROFILE] Error durante la inicialización:', error);
                _showNotification('Error al inicializar el perfil', 'error');
            }
        },

        /**
         * Configura el manejador del formulario
         */
        setupFormHandler: function() {
            const profileForm = document.getElementById('profileForm');
            if (!profileForm) {
                console.warn('⚠️ [PROFILE] Formulario de perfil no encontrado');
                return;
            }

            profileForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const submitButton = this.querySelector('button[type="submit"]');
                if (!submitButton) return;

                const originalButtonText = submitButton.innerHTML;

                // Validar formulario antes de enviar
                if (!UserProfile.validateForm()) {
                    return;
                }

                // Mostrar loading
                _toggleButtonLoading(submitButton, true, originalButtonText);

                try {
                    console.log('📤 [PROFILE] Enviando datos del perfil');

                    // Crear FormData con los datos del formulario
                    const formData = new FormData(this);

                    // Agregar _method para PUT si es necesario
                    formData.append('_method', 'PUT');

                    // Enviar datos a la API
                    const response = await _apiRequest('/user/profile', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.success) {
                        throw new Error(response.message || 'Error al actualizar el perfil');
                    }

                    _showNotification('Perfil actualizado exitosamente', 'success');

                    // Limpiar campos de contraseña
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';

                    // Recargar datos del usuario para reflejar cambios
                    await _loadUserData();

                } catch (error) {
                    console.error('❌ [PROFILE] Error al actualizar perfil:', error);
                    _showNotification(error.message || 'Error al actualizar el perfil', 'error');
                } finally {
                    // Ocultar loading
                    _toggleButtonLoading(submitButton, false, originalButtonText);
                }
            });
        },

        /**
         * Valida todo el formulario
         * @returns {boolean} True si el formulario es válido
         */
        validateForm: function() {
            let isValid = true;

            // Validar email
            const emailInput = document.getElementById('email');
            if (emailInput) {
                isValid = _validateInput(emailInput, config.emailRegex, 'Por favor ingresa un correo electrónico válido') && isValid;
            }

            // Validar teléfono
            const phoneInput = document.getElementById('phone');
            if (phoneInput && phoneInput.value.trim() !== '') {
                isValid = _validateInput(phoneInput, config.phoneRegex, 'Por favor ingresa un número de teléfono válido') && isValid;
            }

            // Validar username
            const usernameInput = document.getElementById('username');
            if (usernameInput && usernameInput.value.trim() !== '') {
                isValid = _validateInput(usernameInput, config.usernameRegex, 'El nombre de usuario solo puede contener letras, números y guiones bajos (4-30 caracteres)') && isValid;
            }

            // Validar contraseñas
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (newPassword) {
                const passwordError = _validatePassword(newPassword);
                if (passwordError) {
                    _showNotification(passwordError, 'error');
                    isValid = false;
                }
            }

            if (newPassword && confirmPassword) {
                const matchError = _validatePasswordMatch(newPassword, confirmPassword);
                if (matchError) {
                    _showNotification(matchError, 'error');
                    isValid = false;
                }
            }

            return isValid;
        },

        /**
         * Valida la contraseña actual
         * @param {string} currentPassword - Contraseña actual
         * @returns {Promise<boolean>} True si la contraseña es correcta
         */
        validateCurrentPassword: async function(currentPassword) {
            try {
                if (!currentPassword) return true;

                const response = await _apiRequest('/user/validate-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ current_password: currentPassword })
                });

                if (!response.success) {
                    throw new Error(response.message || 'Contraseña actual incorrecta');
                }

                return true;

            } catch (error) {
                console.error('❌ [PROFILE] Error al validar contraseña:', error);
                _showNotification(error.message || 'Contraseña actual incorrecta', 'error');
                return false;
            }
        },

        /**
         * Muestra una notificación
         * @param {string} message - Mensaje a mostrar
         * @param {string} type - Tipo de notificación (success, error, info)
         */
        showNotification: function(message, type = 'success') {
            _showNotification(message, type);
        }
    };
})();

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    UserProfile.init();

    // Exportar funciones globales para compatibilidad
    window.UserProfile = UserProfile;
    window.showNotification = UserProfile.showNotification;
});
