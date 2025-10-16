import './config.js';
/**
 * Profile.js - Gestión del perfil de usuario con integración API
 * Versión mejorada con validación robusta, manejo de errores y notificaciones avanzadas
 */

// Módulo de perfil de usuario
const UserProfile = (function() {
    // Configuración privada
    const config = {
        apiBaseUrl: (window.API_BASE_URL || '').replace(/\/$/, '') + (window.API_PREFIX || '/api/v1'),
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
        if (!token) return '';
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
        const method = (options.method || 'GET').toUpperCase();
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {})
        };
        const csrfToken = _getCsrfToken();
        if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
        if (window.API_AUTH_STRATEGY === 'token' && window.API_TOKEN) {
            headers['Authorization'] = `Bearer ${window.API_TOKEN}`;
        }

        const base = (config.apiBaseUrl || '/api/v1').replace(/\/$/, '');
        const fullUrl = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

        const mergedOptions = {
            method,
            headers,
            credentials: window.API_WITH_CREDENTIALS ? 'include' : (options.credentials || 'same-origin'),
            ...options
        };

        try {
            console.log(`📡 [API] ${mergedOptions.method} ${fullUrl}`);
            if (window.API_WITH_CREDENTIALS && window.API_AUTH_STRATEGY === 'sanctum' && method !== 'GET') {
                try { await fetch(`${(window.API_BASE_URL || '').replace(/\/$/, '')}/sanctum/csrf-cookie`, { credentials: 'include' }); } catch {}
            }

            const response = await fetch(fullUrl, mergedOptions);

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

            const role = (localStorage.getItem('AUTH_ROLE') || 'user');
            const endpoint = role === 'entrepreneur' ? '/entrepreneur/me' : '/me';
            const rawResponse = await _apiRequest(endpoint);
            const normalized = _normalizeUserShape(rawResponse);
            currentUser = normalized;

            console.log('✅ [PROFILE] Usuario normalizado:', normalized);

            const simple = document.getElementById('profile-section');
            if (simple && currentUser) {
                simple.innerHTML = `
                    <div class="space-y-2">
                        <div><span class="font-semibold">Nombre:</span> ${currentUser.name || ''}</div>
                        <div><span class="font-semibold">Email:</span> ${currentUser.email || ''}</div>
                        <div class="text-sm text-gray-500">ID: ${currentUser.id || ''}</div>
                    </div>
                `;
            }

            _populateForm(currentUser);

        } catch (error) {
            console.error('❌ [PROFILE] Error al cargar datos del usuario:', error);
            const simple = document.getElementById('profile-section');
            let msg = error.message || 'Error al cargar perfil';
            if (/unauthenticated|401/i.test(msg)) {
                msg = 'No autenticado. Inicia sesión.';
            } else if (/SQLSTATE|500|Base table or view not found/i.test(msg)) {
                msg = 'Error interno del servidor (revisa relaciones/migraciones).';
            }
            if (simple) simple.innerHTML = `<div class="text-red-600">${msg}</div>`;
            _showNotification(msg, 'error');
        }
    }

    /**
     * Normaliza múltiples posibles formas de respuesta de /me
     * @param {any} resp
     * @returns {Object|null}
     */
    function _normalizeUserShape(resp) {
        if (!resp) return null;
        let user = resp;
        // Extraer capas comunes
        if (resp.data) {
            if (Array.isArray(resp.data)) user = resp.data[0];
            else if (resp.data.user) user = resp.data.user;
            else if (resp.data.data) user = resp.data.data; // otra variante
            else user = resp.data;
        }
        if (user && user.user) user = user.user; // anidación redundante
        if (!user || typeof user !== 'object') return null;

        // Resolver nombre completo
        const firstName = user.first_name || user.firstname || '';
        const lastName = user.last_name || user.lastname || '';
        const fullNameCandidates = [user.name, `${firstName} ${lastName}`.trim(), user.username, user.email];
        const name = fullNameCandidates.find(v => v && v.length > 0) || '';

        // Resolver avatar
        const rawAvatar = user.avatar || user.profile_image || user.photo || user.image || '';
        const avatar = _resolveImage(rawAvatar);

        // Emprendedor/negocio
        const ent = user.entrepreneur || user.emprendedor || user.business || null;
        let entrepreneur = null;
        if (ent && typeof ent === 'object') {
            const entAvatar = _resolveImage(ent.avatar || ent.logo || '');
            entrepreneur = {
                id: ent.id,
                business_name: ent.business_name || ent.nombre || ent.name || name,
                category: ent.category || ent.categoria || '',
                address: ent.address || ent.direccion || '',
                phone: ent.phone || ent.telefono || '',
                description: ent.description || ent.descripcion || '',
                avatar: entAvatar
            };
        }

        return {
            id: user.id || user.user_id || null,
            name,
            first_name: firstName || (name.split(' ')[0] || ''),
            last_name: lastName || (name.includes(' ') ? name.split(' ').slice(1).join(' ') : ''),
            email: user.email || user.mail || '',
            username: user.username || user.nick || user.handle || '',
            phone: user.phone || user.telefono || '',
            bio: user.bio || user.about || user.descripcion || '',
            avatar,
            entrepreneur
        };
    }

    /**
     * Resuelve URL de imagen (avatar) tolerando rutas relativas/absolutas
     * @param {string} raw
     * @returns {string}
     */
    function _resolveImage(raw) {
        if (!raw) return 'https://via.placeholder.com/160x160/F77786/FFFFFF?text=Usuario';
        if (/^data:/.test(raw)) return raw;
        if (/^https?:\/\//i.test(raw)) return raw;
        // Limpiar prefijos
        let path = raw.replace(/^storage\//, '').replace(/^\/+/,'');
        const base = (window.API_BASE_URL || '').replace(/\/$/, '');
        // Si ya incluye storage en la raíz
        if (/storage\//.test(raw)) return `${base}/${raw.replace(/^\//,'')}`;
        return `${base}/storage/${path}`;
    }

    /**
     * Rellena el formulario con los datos del usuario
     * @param {Object} user - Datos del usuario
     */
    function _populateForm(user) {
        if (!user) return;
        const form = document.getElementById('profileForm');
        if (!form) return;

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

        setVal('firstName', user.first_name);
        setVal('lastName', user.last_name);
        setVal('email', user.email);
        setVal('phone', user.phone);
        setVal('username', user.username);
        setVal('bio', user.bio);

        if (user.entrepreneur) {
            setVal('businessName', user.entrepreneur.business_name);
            setVal('businessDescription', user.entrepreneur.description);
            setVal('businessCategory', user.entrepreneur.category);
            setVal('businessAddress', user.entrepreneur.address);
            setVal('businessPhone', user.entrepreneur.phone);
        }

        if (user.avatar) {
            const avatarPreview = document.getElementById('avatarPreview');
            if (avatarPreview) avatarPreview.src = user.avatar;
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

                // Configurar manejador del formulario solo si existe el formulario
                if (document.getElementById('profileForm')) {
                    this.setupFormHandler();
                }

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
