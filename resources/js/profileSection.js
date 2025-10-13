/**
 * profileSection.js - Gestión completa del perfil de usuario con integración API
 * Versión mejorada con manejo de errores robusto, validación avanzada y notificaciones mejoradas
 */

// Módulo de perfil de usuario
const ProfileManager = (function() {
    // Configuración privada
    const config = {
        apiBaseUrl: '/api',
        minPasswordLength: 8,
        maxNameLength: 100,
        maxBioLength: 500,
        phoneRegex: /^[+\d\s]{8,20}$/,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        usernameRegex: /^[a-zA-Z0-9_]{4,30}$/,
        dateFormatOptions: {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        },
        dateTimeFormatOptions: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    };

    // Estado privado
    let currentUserData = null;
    let isLoading = false;
    let activeSection = 'view'; // 'view' o 'edit'

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * Obtiene el token CSRF
     * @returns {string} Token CSRF
     */
    function _getCsrfToken() {
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        const inputToken = document.querySelector('input[name="_token"]');
        return metaToken?.content || inputToken?.value || '';
    }

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     */
    function _showNotification(message, type = 'success') {
        const notification = document.getElementById('profileNotification');
        const notificationText = document.getElementById('profileNotificationText');
        const notificationIcon = document.getElementById('notificationIcon');

        if (!notification || !notificationText || !notificationIcon) {
            console.warn('Elementos de notificación no encontrados');
            return;
        }

        // Iconos SVG según el tipo
        const icons = {
            success: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>',
            error: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>',
            warning: '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>',
            info: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd/>'
        };

        // Configurar notificación
        notificationIcon.innerHTML = icons[type] || icons.success;
        notificationText.textContent = message;
        notification.className = `mb-4 ${type}`;
        notification.classList.remove('hidden');

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
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
            },
            credentials: 'same-origin'
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
     * Obtiene iniciales del nombre
     * @param {string} name - Nombre completo
     * @returns {string} Iniciales
     */
    function _getInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Formatea una fecha para mostrar
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    function _formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-CO', config.dateFormatOptions);
        } catch (e) {
            return dateString;
        }
    }

    /**
     * Formatea una fecha y hora para mostrar
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha y hora formateadas
     */
    function _formatDateTime(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('es-CO', config.dateTimeFormatOptions);
        } catch (e) {
            return dateString;
        }
    }

    /**
     * Limpia campos de contraseña
     */
    function _clearPasswordFields() {
        const fields = ['profileCurrentPassword', 'profileNewPassword', 'profileConfirmPassword'];
        fields.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });
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
     * Carga los datos del perfil desde la API
     */
    async function _loadProfileData() {
        try {
            console.log('🔄 [PROFILE] Cargando datos del perfil desde API');

            const response = await _apiRequest('/profile/data');

            if (!response.success) {
                throw new Error(response.message || 'Error al cargar los datos del perfil');
            }

            currentUserData = response.data;
            console.log('✅ [PROFILE] Datos del perfil cargados correctamente');

            // Actualizar vistas con los datos cargados
            _updateViewSection(currentUserData);
            _updateEditForm(currentUserData);

        } catch (error) {
            console.error('❌ [PROFILE] Error al cargar datos del perfil:', error);
            _showNotification(error.message || 'Error al cargar los datos del perfil', 'error');
        }
    }

    /**
     * Actualiza la sección de vista con datos del usuario
     * @param {Object} data - Datos del usuario
     */
    function _updateViewSection(data) {
        // Header info - Iniciales y nombre en el avatar
        const userInitials = document.getElementById('viewUserInitials');
        const userName = document.getElementById('viewUserName');
        const userEmail = document.getElementById('viewUserEmail');

        if (userInitials) userInitials.textContent = _getInitials(data.name);
        if (userName) userName.textContent = data.name || 'Usuario';
        if (userEmail) userEmail.textContent = data.email || '-';

        // Información personal y dirección
        const viewFields = {
            'viewName': data.name,
            'viewUsername': data.username,
            'viewEmail': data.email,
            'viewPhone': data.phone || '-',
            'viewBirthdate': _formatDate(data.birthdate),
            'viewAddress': data.main_address || '-',
            'viewCity': data.city || '-',
            'viewPostalCode': data.postal_code || '-',
            'viewDepartment': data.department || '-',
            'viewLastUpdate': _formatDateTime(data.updated_at || data.last_updated)
        };

        Object.keys(viewFields).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const value = viewFields[id];
                element.textContent = value || '-';
            }
        });

        // Datos adicionales si es emprendedor
        if (data.entrepreneur) {
            const entrepreneurFields = {
                'viewBusinessName': data.entrepreneur.business_name || '-',
                'viewBusinessCategory': data.entrepreneur.category || '-',
                'viewBusinessDescription': data.entrepreneur.description || '-',
                'viewBusinessPhone': data.entrepreneur.phone || '-',
                'viewBusinessAddress': data.entrepreneur.address || '-',
                'viewBusinessCity': data.entrepreneur.city || '-',
                'viewBusinessCreated': _formatDate(data.entrepreneur.created_at)
            };

            Object.keys(entrepreneurFields).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = entrepreneurFields[id];
                }
            });
        }

        console.log('👁️ [PROFILE] Vista de perfil actualizada con datos');
    }

    /**
     * Actualiza el formulario de edición con datos del usuario
     * @param {Object} data - Datos del usuario
     */
    function _updateEditForm(data) {
        const editFields = {
            'profileName': data.name,
            'profileUsername': data.username,
            'profileEmail': data.email,
            'profilePhone': data.phone,
            'profileBirthdate': data.birthdate,
            'profileAddress': data.main_address,
            'profileCity': data.city,
            'profilePostalCode': data.postal_code,
            'profileDepartment': data.department
        };

        Object.keys(editFields).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = editFields[id] || '';
            }
        });

        // Datos de emprendedor si existen
        if (data.entrepreneur) {
            const entrepreneurFields = {
                'profileBusinessName': data.entrepreneur.business_name,
                'profileBusinessCategory': data.entrepreneur.category,
                'profileBusinessDescription': data.entrepreneur.description,
                'profileBusinessPhone': data.entrepreneur.phone,
                'profileBusinessAddress': data.entrepreneur.address,
                'profileBusinessCity': data.entrepreneur.city
            };

            Object.keys(entrepreneurFields).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = entrepreneurFields[id] || '';
                }
            });
        }

        // Limpiar campos de contraseña
        _clearPasswordFields();

        console.log('✏️ [PROFILE] Formulario de edición actualizado con datos');
    }

    /**
     * Configura la validación en tiempo real
     */
    function _setupRealTimeValidation() {
        // Validación de email
        const emailInput = document.getElementById('profileEmail');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                _validateInput(this, config.emailRegex, 'Por favor ingresa un correo electrónico válido');
            });
        }

        // Validación de teléfono
        const phoneInput = document.getElementById('profilePhone');
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
        const usernameInput = document.getElementById('profileUsername');
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
        const newPasswordInput = document.getElementById('profileNewPassword');
        const confirmPasswordInput = document.getElementById('profileConfirmPassword');

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
            { id: 'profileName', maxLength: config.maxNameLength, name: 'nombre' },
            { id: 'profileBusinessName', maxLength: config.maxNameLength, name: 'nombre del negocio' },
            { id: 'profileBusinessDescription', maxLength: config.maxBioLength, name: 'descripción del negocio' },
            { id: 'profileAddress', maxLength: 200, name: 'dirección' },
            { id: 'profileBusinessAddress', maxLength: 200, name: 'dirección del negocio' }
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
                // Cargar datos del perfil
                _loadProfileData();

                // Configurar validación en tiempo real
                _setupRealTimeValidation();

                // Configurar manejadores de eventos
                this.setupEventHandlers();

                console.log('✅ [PROFILE] Módulo de perfil inicializado correctamente');

            } catch (error) {
                console.error('❌ [PROFILE] Error durante la inicialización:', error);
                _showNotification('Error al inicializar el perfil', 'error');
            }
        },

        /**
         * Configura los manejadores de eventos
         */
        setupEventHandlers: function() {
            // Elementos del DOM
            const form = document.getElementById('profileForm');
            const cancelBtn = document.getElementById('profileCancelBtn');
            const tabView = document.getElementById('tabViewProfile');
            const tabEdit = document.getElementById('tabEditProfile');

            // Event listener para el formulario
            if (form) {
                form.removeEventListener('submit', this.handleFormSubmit);
                form.addEventListener('submit', this.handleFormSubmit);
            }

            // Event listener para el botón cancelar
            if (cancelBtn) {
                cancelBtn.removeEventListener('click', this.handleCancel);
                cancelBtn.addEventListener('click', this.handleCancel);
            }

            // Event listeners para los tabs
            if (tabView) {
                tabView.removeEventListener('click', this.showViewSection);
                tabView.addEventListener('click', this.showViewSection);
            }

            if (tabEdit) {
                tabEdit.removeEventListener('click', this.showEditSection);
                tabEdit.addEventListener('click', this.showEditSection);
            }
        },

        /**
         * Muestra la sección de vista de perfil
         */
        showViewSection: function() {
            const viewSection = document.getElementById('viewProfileSection');
            const editSection = document.getElementById('editProfileSection');
            const tabView = document.getElementById('tabViewProfile');
            const tabEdit = document.getElementById('tabEditProfile');

            if (viewSection && editSection && tabView && tabEdit) {
                viewSection.classList.remove('hidden');
                editSection.classList.add('hidden');
                tabView.classList.add('active');
                tabEdit.classList.remove('active');
                activeSection = 'view';
            }

            console.log('👁️ [PROFILE] Mostrando sección de vista');
        },

        /**
         * Muestra la sección de edición de perfil
         */
        showEditSection: function() {
            const viewSection = document.getElementById('viewProfileSection');
            const editSection = document.getElementById('editProfileSection');
            const tabView = document.getElementById('tabViewProfile');
            const tabEdit = document.getElementById('tabEditProfile');

            if (viewSection && editSection && tabView && tabEdit) {
                viewSection.classList.add('hidden');
                editSection.classList.remove('hidden');
                tabView.classList.remove('active');
                tabEdit.classList.add('active');
                activeSection = 'edit';
            }

            console.log('✏️ [PROFILE] Mostrando sección de edición');
        },

        /**
         * Maneja el envío del formulario
         * @param {Event} event - Evento de envío
         */
        handleFormSubmit: async function(event) {
            event.preventDefault();

            const form = event.target;
            const submitBtn = document.getElementById('profileSaveBtn');
            const originalText = submitBtn?.textContent || 'Guardar Cambios';

            // Deshabilitar botón y mostrar loading
            if (submitBtn) {
                _toggleButtonLoading(submitBtn, true, originalText);
            }
            form.classList.add('loading');

            try {
                console.log('📤 [PROFILE] Enviando datos del perfil');

                const formData = new FormData(form);

                // Validar formulario antes de enviar
                if (!this.validateForm()) {
                    return;
                }

                // Actualizar perfil
                const profileUpdated = await this.updateProfile(formData);

                // Cambiar contraseña si hay datos
                if (profileUpdated) {
                    await this.changePassword();
                }

                // Si todo salió bien, volver a la vista
                if (profileUpdated) {
                    setTimeout(() => {
                        this.showViewSection();
                    }, 1500);
                }

            } catch (error) {
                console.error('❌ [PROFILE] Error al procesar formulario:', error);
                _showNotification(error.message || 'Error al procesar el formulario', 'error');
            } finally {
                // Rehabilitar botón
                if (submitBtn) {
                    _toggleButtonLoading(submitBtn, false, originalText);
                }
                form.classList.remove('loading');
            }
        },

        /**
         * Maneja el botón cancelar
         */
        handleCancel: function() {
            // Recargar datos originales
            _loadProfileData();

            // Limpiar campos de contraseña
            _clearPasswordFields();

            // Volver a la vista
            this.showViewSection();

            _showNotification('Cambios cancelados', 'info');
        },

        /**
         * Valida todo el formulario
         * @returns {boolean} True si el formulario es válido
         */
        validateForm: function() {
            let isValid = true;

            // Validar email
            const emailInput = document.getElementById('profileEmail');
            if (emailInput) {
                isValid = _validateInput(emailInput, config.emailRegex, 'Por favor ingresa un correo electrónico válido') && isValid;
            }

            // Validar teléfono
            const phoneInput = document.getElementById('profilePhone');
            if (phoneInput && phoneInput.value.trim() !== '') {
                isValid = _validateInput(phoneInput, config.phoneRegex, 'Por favor ingresa un número de teléfono válido') && isValid;
            }

            // Validar username
            const usernameInput = document.getElementById('profileUsername');
            if (usernameInput && usernameInput.value.trim() !== '') {
                isValid = _validateInput(usernameInput, config.usernameRegex, 'El nombre de usuario solo puede contener letras, números y guiones bajos (4-30 caracteres)') && isValid;
            }

            // Validar contraseñas
            const newPassword = document.getElementById('profileNewPassword')?.value;
            const confirmPassword = document.getElementById('profileConfirmPassword')?.value;

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
         * Actualiza el perfil del usuario
         * @param {FormData} formData - Datos del formulario
         * @returns {Promise<boolean>} True si la actualización fue exitosa
         */
        updateProfile: async function(formData) {
            try {
                console.log('📤 [PROFILE] Actualizando perfil del usuario');

                const data = {};
                for (let [key, value] of formData.entries()) {
                    if (key !== '_token') {
                        data[key] = value;
                    }
                }

                const response = await _apiRequest('/profile/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.success) {
                    throw new Error(response.message || 'Error al actualizar el perfil');
                }

                _showNotification(response.message || 'Perfil actualizado exitosamente', 'success');

                // Recargar datos actualizados
                setTimeout(() => {
                    _loadProfileData();
                }, 500);

                return true;

            } catch (error) {
                console.error('❌ [PROFILE] Error al actualizar perfil:', error);

                if (error.message.includes('validation')) {
                    _showNotification('Por favor corrige los errores en el formulario', 'error');
                } else {
                    _showNotification(error.message || 'Error al actualizar el perfil', 'error');
                }

                return false;
            }
        },

        /**
         * Cambia la contraseña del usuario
         * @returns {Promise<boolean>} True si el cambio fue exitoso
         */
        changePassword: async function() {
            const currentPassword = document.getElementById('profileCurrentPassword')?.value;
            const newPassword = document.getElementById('profileNewPassword')?.value;
            const confirmPassword = document.getElementById('profileConfirmPassword')?.value;

            // Si los campos están vacíos, no hacer nada
            if (!currentPassword && !newPassword && !confirmPassword) {
                return true;
            }

            // Validaciones
            if (!currentPassword || !newPassword || !confirmPassword) {
                _showNotification('Debes llenar todos los campos de contraseña', 'error');
                return false;
            }

            if (newPassword !== confirmPassword) {
                _showNotification('Las contraseñas nuevas no coinciden', 'error');
                return false;
            }

            const passwordError = _validatePassword(newPassword);
            if (passwordError) {
                _showNotification(passwordError, 'error');
                return false;
            }

            try {
                console.log('🔒 [PROFILE] Cambiando contraseña');

                const response = await _apiRequest('/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword,
                        new_password_confirmation: confirmPassword
                    })
                });

                if (!response.success) {
                    throw new Error(response.message || 'Error al cambiar la contraseña');
                }

                _showNotification(response.message || 'Contraseña actualizada exitosamente', 'success');
                _clearPasswordFields();

                return true;

            } catch (error) {
                console.error('❌ [PROFILE] Error al cambiar contraseña:', error);
                _showNotification(error.message || 'Error al cambiar la contraseña', 'error');
                return false;
            }
        },

        /**
         * Muestra una notificación
         * @param {string} message - Mensaje a mostrar
         * @param {string} type - Tipo de notificación (success, error, warning, info)
         */
        showNotification: function(message, type = 'success') {
            _showNotification(message, type);
        },

        /**
         * Carga datos del perfil desde el servidor
         */
        loadProfileData: function() {
            _loadProfileData();
        }
    };
})();

// Inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ProfileManager.init);
} else {
    ProfileManager.init();
}

// Exportar funciones globales para compatibilidad
window.ProfileManager = ProfileManager;
window.showViewSection = ProfileManager.showViewSection;
window.showEditSection = ProfileManager.showEditSection;
window.loadProfileData = ProfileManager.loadProfileData;
window.showProfileNotification = ProfileManager.showNotification;
