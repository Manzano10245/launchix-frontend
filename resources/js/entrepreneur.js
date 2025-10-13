/**
 * Entrepreneur.js
 * Maneja la navegación y funcionalidades específicas para emprendedores
 */

// Función para mostrar secciones - accesible globalmente
window.showSection = function(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Actualizar estado activo del menú
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    // Encontrar y activar el elemento del menú clickeado
    const clickedItem = event?.target?.closest('.menu-item');
    if (clickedItem) {
        clickedItem.classList.add('active');
    }

    // Si estamos mostrando la sección de servicios, cargar los datos desde la API
    if (sectionId === 'servicios') {
        setTimeout(async () => {
            if (window.ServicesManager && window.ServicesManager.loadServicios) {
                await window.ServicesManager.loadServicios();
            }
        }, 100);
    }
};

// Función para mostrar toast notifications
window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' :
                    type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;

    toast.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${type === 'success' ?
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
                    type === 'error' ?
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' :
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                }
            </svg>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remover después de 4 segundos
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
};

// Función para mostrar mensajes de éxito
window.showSuccessMessage = function(message) {
    showToast(message, 'success');
};

// Función para mostrar mensajes de error
window.showErrorMessage = function(message) {
    showToast(message, 'error');
};

// Función para mostrar diálogo de confirmación personalizado
window.showConfirmDialog = function({ title, message, confirmText, cancelText, type = 'warning' }) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        const iconColor = type === 'danger' ? 'text-red-600' : 'text-yellow-600';
        const confirmButtonColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';

        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <div class="flex items-center mb-4">
                    <svg class="w-8 h-8 ${iconColor} mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                </div>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancel-btn" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        ${cancelText}
                    </button>
                    <button id="confirm-btn" class="px-4 py-2 text-white ${confirmButtonColor} rounded-lg">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('#cancel-btn');
        const confirmBtn = modal.querySelector('#confirm-btn');

        cancelBtn.onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };

        confirmBtn.onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };

        // Cerrar con ESC
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleKeyDown);
                resolve(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
    });
};

// Función para cargar servicios desde la API
window.loadEntrepreneurServices = async function() {
    try {
        const entrepreneurId = document.getElementById('entrepreneurProfile')?.dataset.entrepreneurId ||
                              new URLSearchParams(window.location.search).get('entrepreneur_id');

        if (!entrepreneurId) {
            showErrorMessage('No se pudo identificar al emprendedor');
            return;
        }

        const response = await fetch(`/api/entrepreneur/${entrepreneurId}/services`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error al cargar servicios');
        }

        return data.services || [];
    } catch (error) {
        console.error("Error al cargar servicios:", error);
        showErrorMessage(error.message || 'Error al cargar servicios');
        return [];
    }
};

// Función para cargar un servicio específico desde la API
window.loadServiceDetails = async function(serviceId) {
    try {
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error al cargar detalles del servicio');
        }

        return data.service;
    } catch (error) {
        console.error("Error al cargar detalles del servicio:", error);
        showErrorMessage(error.message || 'Error al cargar detalles del servicio');
        return null;
    }
};

// Función para guardar un servicio en la API
window.saveService = async function(formData) {
    try {
        const entrepreneurId = document.getElementById('entrepreneurProfile')?.dataset.entrepreneurId ||
                              new URLSearchParams(window.location.search).get('entrepreneur_id');

        if (!entrepreneurId) {
            showErrorMessage('No se pudo identificar al emprendedor');
            return { success: false, message: 'Emprendedor no identificado' };
        }

        const response = await fetch(`/api/entrepreneur/${entrepreneurId}/services`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al guardar servicio:", error);
        return {
            success: false,
            message: error.message || 'Error al guardar el servicio',
            errors: error.errors || []
        };
    }
};

// Función para actualizar un servicio en la API
window.updateService = async function(serviceId, formData) {
    try {
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        return {
            success: false,
            message: error.message || 'Error al actualizar el servicio',
            errors: error.errors || []
        };
    }
};

// Función para eliminar un servicio de la API
window.deleteService = async function(serviceId) {
    try {
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al eliminar servicio:", error);
        return {
            success: false,
            message: error.message || 'Error al eliminar el servicio'
        };
    }
};

// Función para validar el formulario de servicios
window.validateServiceForm = function(formData) {
    const errors = [];

    if (!formData.get('nombre_servicio') || formData.get('nombre_servicio').trim() === '') {
        errors.push('El nombre del servicio es obligatorio');
    }

    if (!formData.get('categoria') || formData.get('categoria').trim() === '') {
        errors.push('La categoría es obligatoria');
    }

    if (!formData.get('descripcion') || formData.get('descripcion').trim() === '') {
        errors.push('La descripción es obligatoria');
    }

    if (!formData.get('precio_base') || isNaN(parseFloat(formData.get('precio_base')))) {
        errors.push('El precio debe ser un número válido');
    }

    return errors;
};

// Función para mostrar errores de validación
window.showErrors = function(errors) {
    const errorContainer = document.getElementById('form-errors');
    if (!errorContainer) return;

    errorContainer.innerHTML = '';

    if (errors.length > 0) {
        const errorList = document.createElement('div');
        errorList.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';

        const title = document.createElement('h4');
        title.className = 'font-bold mb-2';
        title.textContent = 'Se encontraron los siguientes errores:';
        errorList.appendChild(title);

        const list = document.createElement('ul');
        list.className = 'list-disc list-inside space-y-1';

        errors.forEach(error => {
            const item = document.createElement('li');
            item.className = 'text-sm';
            item.textContent = error;
            list.appendChild(item);
        });

        errorList.appendChild(list);
        errorContainer.appendChild(errorList);

        // Scroll al primer error
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// Inicialización de navegación y servicios
document.addEventListener('DOMContentLoaded', () => {
    console.log('Entrepreneur script loaded successfully');

    // Inicializar subida de imágenes para el formulario de servicios
    if (window.ServicesManager && ServicesManager.setupImageUpload) {
        ServicesManager.setupImageUpload('service-main-dropzone', 'service-main-image', 'service-main-preview');
        ServicesManager.setupImageUpload('service-gallery-dropzone', 'service-gallery-images', 'service-gallery-preview');
    }

    // Handler para el submit del formulario de servicios
    const servicioForm = document.getElementById('servicio-form');
    if (servicioForm) {
        servicioForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(servicioForm);

            // Validar antes de enviar
            const errors = validateServiceForm(formData);
            if (errors.length > 0) {
                showErrors(errors);
                return;
            }

            // Mostrar loading en el botón
            const submitBtn = servicioForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Publicando...';
            }

            // Guardar servicio en la API
            const result = await saveService(formData);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publicar Servicio';
            }

            if (result.success) {
                showSuccessMessage(result.message || 'Servicio publicado correctamente');
                servicioForm.reset();
                document.getElementById('service-main-preview').innerHTML = '';
                document.getElementById('service-gallery-preview').innerHTML = '';

                // Recargar la lista de servicios
                if (window.ServicesManager && ServicesManager.loadServicios) {
                    await ServicesManager.loadServicios();
                }

                // Mostrar la nueva tarjeta instantáneamente si existe la función
                if (window.ServicesManager && ServicesManager.createServicioCard && result.data) {
                    const serviciosContainer = document.querySelector('#servicios .grid');
                    if (serviciosContainer) {
                        const newCard = ServicesManager.createServicioCard(result.data);
                        serviciosContainer.prepend(newCard);
                    }
                }
            } else {
                showErrors(result.errors || ['Error al publicar el servicio']);
            }
        });
    }

    // Configurar eventos de teclado para navegación
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S para guardar
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const servicioForm = document.getElementById('servicio-form');
            if (servicioForm) {
                servicioForm.dispatchEvent(new Event('submit'));
            }
        }
    });
});

// Gestor de Servicios
window.ServicesManager = {
    // Cargar servicios desde la API
    loadServicios: async function() {
        try {
            const grid = document.getElementById('mis-servicios-grid');
            const loading = document.getElementById('servicios-loading');
            const countEl = document.getElementById('servicios-count');

            if (loading) loading.classList.remove('hidden');
            if (grid) grid.innerHTML = '';

            const services = await loadEntrepreneurServices();

            if (countEl) {
                countEl.textContent = services.length;
            }

            if (services.length === 0) {
                if (grid) grid.innerHTML = '<div class="col-span-full text-center text-gray-400">No tienes servicios publicados.</div>';
            } else {
                if (grid) {
                    grid.innerHTML = services.map(servicio => this.createServicioCard(servicio)).join('');
                }
            }

            this.bindServiceActions();
        } catch (error) {
            console.error("Error al cargar servicios:", error);
            showErrorMessage(error.message || 'Error al cargar servicios');
        } finally {
            if (loading) loading.classList.add('hidden');
        }
    },

    // Crear tarjeta de servicio
    createServicioCard: function(servicio) {
        const imgSrc = servicio.imagen_principal ?
            (servicio.imagen_principal.startsWith('images/') ? '/' + servicio.imagen_principal : '/storage/' + servicio.imagen_principal) :
            'https://via.placeholder.com/300x300/F77786/FFFFFF?text=Servicio';

        const precio = servicio.precio_base ? '$' + Number(servicio.precio_base).toLocaleString() : 'Consultar';
        const categoria = this.getServiceCategoryName(servicio.categoria);

        return `
            <div class="product-card bg-white rounded-lg shadow-lg overflow-hidden fade-in hover:shadow-xl transition-shadow duration-300">
                <div class="relative">
                    <img src="${imgSrc}" alt="${servicio.nombre_servicio}" class="w-full h-64 object-cover"
                         onerror="this.src='https://via.placeholder.com/300x300/F77786/FFFFFF?text=Servicio'">
                    <div class="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        ${categoria}
                    </div>
                    <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                        <button class="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ver-mas"
                                data-id="${servicio.id}">
                            <i class="fas fa-eye"></i> Ver Detalle
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${servicio.nombre_servicio}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${servicio.descripcion}</p>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-2xl font-bold text-red-600">${precio}</span>
                    </div>
                    ${servicio.direccion || servicio.telefono || servicio.horario_atencion ? `
                        <div class="space-y-2 text-sm text-gray-600 mb-4">
                            ${servicio.direccion ? `
                                <div class="flex items-center">
                                    <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                                    <span class="truncate">${servicio.direccion}</span>
                                </div>
                            ` : ''}
                            ${servicio.telefono ? `
                                <div class="flex items-center">
                                    <i class="fas fa-phone text-gray-400 mr-2"></i>
                                    <span>${servicio.telefono}</span>
                                </div>
                            ` : ''}
                            ${servicio.horario_atencion ? `
                                <div class="flex items-center">
                                    <i class="fas fa-clock text-gray-400 mr-2"></i>
                                    <span class="truncate">${servicio.horario_atencion}</span>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    <!-- Botones de administración -->
                    <div class="flex space-x-2 border-t border-gray-200 pt-4">
                        <button class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg editar-servicio" data-id="${servicio.id}">
                            <i class="fas fa-edit mr-2"></i>Editar
                        </button>
                        <button class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg eliminar-servicio" data-id="${servicio.id}">
                            <i class="fas fa-trash mr-2"></i>Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Obtener nombre de categoría de servicio
    getServiceCategoryName: function(categoria) {
        const categoryMap = {
            'limpieza': 'Servicios de Limpieza',
            'reparaciones': 'Reparaciones del Hogar',
            'jardineria': 'Jardinería y Paisajismo',
            'transporte': 'Servicios de Transporte',
            'tecnologia': 'Soporte Técnico',
            'educacion': 'Educación y Tutorías',
            'salud': 'Salud y Bienestar',
            'eventos': 'Organización de Eventos',
            'comida': 'Comida',
            'autolavado': 'Autolavado',
            'carpinteria': 'Carpintería',
            'belleza': 'Belleza y Spa',
            'hogar': 'Hogar y Jardinería'
        };

        if (typeof categoria === 'object' && categoria !== null) {
            return categoria.name || categoryMap[categoria.slug] || categoria.slug || 'Sin categoría';
        }

        return categoryMap[categoria] || categoria || 'Sin categoría';
    },

    // Configurar eventos para los botones de los servicios
    bindServiceActions: function() {
        // Ver detalles
        document.querySelectorAll('.ver-mas').forEach(btn => {
            btn.addEventListener('click', async function() {
                const serviceId = this.dataset.id;
                try {
                    const service = await loadServiceDetails(serviceId);
                    if (service) {
                        fillVerModal(service);
                        openModal('modal-ver');
                    }
                } catch (error) {
                    showErrorMessage(error.message || 'Error al cargar detalles del servicio');
                }
            });
        });

        // Editar servicio
        document.querySelectorAll('.editar-servicio').forEach(btn => {
            btn.addEventListener('click', async function() {
                const serviceId = this.dataset.id;
                try {
                    const service = await loadServiceDetails(serviceId);
                    if (service) {
                        fillEditModal(service);
                        openModal('modal-editar');
                    }
                } catch (error) {
                    showErrorMessage(error.message || 'Error al cargar servicio para editar');
                }
            });
        });

        // Eliminar servicio
        document.querySelectorAll('.eliminar-servicio').forEach(btn => {
            btn.addEventListener('click', async function() {
                const serviceId = this.dataset.id;

                const confirmed = await showConfirmDialog({
                    title: 'Eliminar Servicio',
                    message: '¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.',
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'danger'
                });

                if (!confirmed) return;

                try {
                    const result = await deleteService(serviceId);
                    if (result.success) {
                        showSuccessMessage('Servicio eliminado correctamente');
                        await this.loadServicios();
                    } else {
                        showErrorMessage(result.message || 'Error al eliminar el servicio');
                    }
                } catch (error) {
                    showErrorMessage(error.message || 'Error al eliminar el servicio');
                }
            }.bind(this));
        });
    },

    // Configurar subida de imágenes
    setupImageUpload: function(dropzoneId, inputId, previewId) {
        const dropzone = document.getElementById(dropzoneId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (!dropzone || !input || !preview) {
            console.warn(`Elementos no encontrados: ${dropzoneId}, ${inputId}, ${previewId}`);
            return;
        }

        // Click para abrir selector de archivos
        dropzone.addEventListener('click', () => input.click());

        // Drag & Drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleImageFiles(files, preview, input);
        });

        // Cambio en el input de archivos
        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleImageFiles(e.target.files, preview, input);
            }
        });
    },

    // Manejar archivos de imagen
    handleImageFiles: function(files, preview, input) {
        if (!files || files.length === 0) return;

        preview.innerHTML = '';
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        Array.from(files).forEach((file, index) => {
            if (!allowedTypes.includes(file.type)) {
                showErrorMessage('Solo se permiten imágenes JPG o PNG');
                return;
            }

            if (file.size > maxSize) {
                showErrorMessage('La imagen debe pesar máximo 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'image-preview w-full h-32 object-cover rounded';

                const container = document.createElement('div');
                container.className = 'relative';
                container.setAttribute('data-file-index', index);

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '×';
                deleteBtn.className = 'absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600';
                deleteBtn.type = 'button';
                deleteBtn.onclick = () => {
                    container.remove();
                    // Actualizar el input de archivos
                    const dataTransfer = new DataTransfer();
                    Array.from(input.files).forEach((f, i) => {
                        if (i !== index) {
                            dataTransfer.items.add(f);
                        }
                    });
                    input.files = dataTransfer.files;
                };

                container.appendChild(img);
                container.appendChild(deleteBtn);
                preview.appendChild(container);
            };
            reader.readAsDataURL(file);
        });
    }
};

// Funciones para manejo de modales
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.style.opacity = '';
            modal.style.transform = '';
        }, 200);
    }
};

// Función para llenar el modal de ver servicio
window.fillVerModal = function(service) {
    document.getElementById('ver-nombre').textContent = service.nombre_servicio || 'Sin nombre';

    // Imagen principal
    const imgElement = document.getElementById('ver-img');
    imgElement.src = service.imagen_principal ?
        (service.imagen_principal.startsWith('images/') ? '/' + service.imagen_principal : '/storage/' + service.imagen_principal) :
        'https://via.placeholder.com/400x300/F77786/FFFFFF?text=Servicio';
    imgElement.alt = service.nombre_servicio || 'Servicio';

    // Descripción
    document.getElementById('ver-descripcion').textContent = service.descripcion || 'Sin descripción disponible';

    // Categoría con estilo
    const categoriaName = ServicesManager.getServiceCategoryName(service.categoria);
    document.getElementById('ver-categoria-badge').textContent = categoriaName;

    // Precio con formato
    const precioElement = document.getElementById('ver-precio');
    precioElement.textContent = service.precio_base ? '$' + Number(service.precio_base).toLocaleString() : 'Consultar precio';

    // Información de contacto
    document.getElementById('ver-direccion').textContent = service.direccion || 'Ubicación por definir';
    document.getElementById('ver-telefono').textContent = service.telefono || 'No especificado';
    document.getElementById('ver-horario').textContent = service.horario_atencion || 'Horarios flexibles';

    // Galería de imágenes
    const galeria = document.getElementById('ver-galeria');
    galeria.innerHTML = '';

    if (service.galeria_imagenes && service.galeria_imagenes.length > 0) {
        service.galeria_imagenes.forEach((img, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'relative cursor-pointer group';

            const imgEl = document.createElement('img');
            imgEl.src = '/storage/' + img;
            imgEl.className = 'w-full h-20 object-cover rounded-lg shadow group-hover:opacity-75 transition-opacity';
            imgEl.alt = `Galería ${index + 1}`;

            // Click para ampliar imagen
            imgEl.addEventListener('click', () => {
                showImageModal(imgEl.src, `${service.nombre_servicio} - Imagen ${index + 1}`);
            });

            imgContainer.appendChild(imgEl);
            galeria.appendChild(imgContainer);
        });
    } else {
        galeria.innerHTML = '<div class="text-gray-500 text-sm col-span-3 text-center">No hay más imágenes disponibles</div>';
    }
};

// Función para llenar el modal de edición de servicio
window.fillEditModal = function(service) {
    document.getElementById('edit-id').value = service.id;
    document.getElementById('edit-nombre').value = service.nombre_servicio || '';

    // Manejar categoría (puede ser string u objeto)
    let categoriaValue = '';
    if (typeof service.categoria === 'object' && service.categoria !== null) {
        categoriaValue = service.categoria.slug || service.categoria.name || '';
    } else {
        categoriaValue = service.categoria || '';
    }
    document.getElementById('edit-categoria').value = categoriaValue;

    document.getElementById('edit-descripcion').value = service.descripcion || '';
    document.getElementById('edit-direccion').value = service.direccion || '';
    document.getElementById('edit-telefono').value = service.telefono || '';
    document.getElementById('edit-precio').value = service.precio_base || '';
    document.getElementById('edit-horario').value = service.horario_atencion || '';

    document.getElementById('edit-imagen').value = '';
    document.getElementById('edit-galeria').value = '';
    document.getElementById('edit-errors').innerHTML = '';

    // Limpiar previews
    document.getElementById('edit-main-preview').innerHTML = '';
    document.getElementById('edit-gallery-preview').innerHTML = '';

    // Configurar eventos para el modal de edición
    setupEditModalEvents(service);
};

// Función para mostrar imagen ampliada
window.showImageModal = function(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-full">
            <img src="${src}" alt="${alt}" class="max-w-full max-h-full object-contain rounded-lg">
            <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Click fuera para cerrar
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
};

// Función para configurar eventos del modal de edición
function setupEditModalEvents(service) {
    // Configurar drag & drop para imagen principal
    ServicesManager.setupImageUpload('edit-main-dropzone', 'edit-main-image', 'edit-main-preview');

    // Configurar drag & drop para galería
    ServicesManager.setupImageUpload('edit-gallery-dropzone', 'edit-gallery-images', 'edit-gallery-preview');

    // Manejar envío del formulario de edición
    const form = document.getElementById('form-editar-servicio');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateServiceForm(service.id);
        });
    }
}

// Función para actualizar el formulario de servicio
async function updateServiceForm(serviceId) {
    const form = document.getElementById('form-editar-servicio');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Crear FormData
    const formData = new FormData(form);

    // Validar datos básicos
    const errors = validateServiceForm(formData);
    if (errors.length > 0) {
        showErrors(errors);
        return;
    }

    // Mostrar loading
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Guardando...';

    try {
        const result = await updateService(serviceId, formData);

        if (result.success) {
            showSuccessMessage('Servicio actualizado exitosamente');
            closeModal('modal-editar');
            await ServicesManager.loadServicios();
        } else {
            showErrors(result.errors || [result.message || 'Error al actualizar el servicio']);
        }
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        showErrorMessage('Error de conexión al actualizar el servicio');
    } finally {
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Función para configurar eventos de cierre de modales
function setupModalCloseOnOutsideClick() {
    document.addEventListener('click', function(e) {
        // Para modal ver
        const modalVer = document.getElementById('modal-ver');
        if (modalVer && !modalVer.classList.contains('hidden')) {
            const modalContent = modalVer.querySelector('.bg-white');
            if (e.target === modalVer && !modalContent.contains(e.target)) {
                closeModal('modal-ver');
            }
        }

        // Para modal editar
        const modalEditar = document.getElementById('modal-editar');
        if (modalEditar && !modalEditar.classList.contains('hidden')) {
            const modalContent = modalEditar.querySelector('.bg-white');
            if (e.target === modalEditar && !modalContent.contains(e.target)) {
                closeModal('modal-editar');
            }
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modalVer = document.getElementById('modal-ver');
            const modalEditar = document.getElementById('modal-editar');

            if (modalVer && !modalVer.classList.contains('hidden')) {
                closeModal('modal-ver');
            }

            if (modalEditar && !modalEditar.classList.contains('hidden')) {
                closeModal('modal-editar');
            }
        }
    });
}

// Configurar eventos de cierre de modales al inicio
setupModalCloseOnOutsideClick();
