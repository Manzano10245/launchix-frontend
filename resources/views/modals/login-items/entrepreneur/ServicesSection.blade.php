<!-- Mis Servicios -->
<div id="servicios" class="section-content">
    <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Mis Servicios (<span id="servicios-count">0</span>)</h1>
            <button class="btn-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onclick="showSection('publicar-servicio')">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Agregar Servicio
            </button>
        </div>

        <!-- Loading state -->
        <div id="servicios-loading" class="text-center py-12 hidden">
            <svg class="animate-spin w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Cargando servicios...</p>
        </div>

        <!-- Contenedor de servicios -->
        <div id="mis-servicios-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Las cards se cargan dinámicamente por JS -->
        </div>
    </div>
</div>

<!-- Modal Ver Más -->
<div id="modal-ver" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center hidden p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto relative">
        <button class="modal-close-btn absolute top-4 right-4 text-gray-600 hover:text-red-600 text-xl z-10" onclick="closeModal('modal-ver')" type="button">
            <i class="fas fa-times"></i>
        </button>

        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Imagen principal -->
                <div>
                    <img id="ver-img" src="" alt="" class="w-full h-80 object-cover rounded-lg shadow-lg mb-4">
                    <div id="ver-galeria" class="grid grid-cols-3 gap-2"></div>
                </div>

                <!-- Información del servicio -->
                <div>
                    <h3 class="text-3xl font-bold text-gray-800 mb-4" id="ver-nombre"></h3>

                    <div class="mb-4">
                        <span class="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold" id="ver-categoria-badge"></span>
                    </div>

                    <div class="text-gray-700 mb-6 leading-relaxed" id="ver-descripcion"></div>

                    <div class="space-y-4 mb-6">
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span class="text-gray-600 font-medium">Precio:</span>
                            <span class="text-2xl font-bold text-red-600" id="ver-precio"></span>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-map-marker-alt text-red-500 w-5"></i>
                            <span class="text-gray-700" id="ver-direccion"></span>
                        </div>

                        <div class="flex items-center space-x-3">
                            <i class="fas fa-phone text-blue-500 w-5"></i>
                            <span class="text-gray-700" id="ver-telefono"></span>
                        </div>

                        <div class="flex items-center space-x-3">
                            <i class="fas fa-clock text-green-500 w-5"></i>
                            <span class="text-gray-700" id="ver-horario"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal Editar -->
<div id="modal-editar" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center hidden">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto p-6 relative">
        <button class="modal-close-btn absolute top-4 right-4 text-gray-600 hover:text-red-600 text-xl z-10" onclick="closeModal('modal-editar')" type="button">
            <i class="fas fa-times"></i>
        </button>
        <h3 class="text-2xl font-bold text-gray-800 mb-6">Editar Servicio</h3>
        <form id="form-editar-servicio" class="space-y-6" enctype="multipart/form-data">
            <input type="hidden" id="edit-id">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio *</label>
                    <input type="text" id="edit-nombre" name="nombre_servicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                    <select id="edit-categoria" name="categoria" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                        <option value="">Seleccionar categoría</option>
                        <option value="limpieza">Servicios de Limpieza</option>
                        <option value="reparaciones">Reparaciones del Hogar</option>
                        <option value="jardineria">Jardinería y Paisajismo</option>
                        <option value="transporte">Servicios de Transporte</option>
                        <option value="tecnologia">Soporte Técnico</option>
                        <option value="educacion">Educación y Tutorías</option>
                        <option value="salud">Salud y Bienestar</option>
                        <option value="eventos">Organización de Eventos</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción del Servicio *</label>
                <textarea id="edit-descripcion" name="descripcion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" required></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio Base</label>
                    <input type="number" id="edit-precio" name="precio_base" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00" min="0" step="0.01">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input type="tel" id="edit-telefono" name="telefono" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+1234567890">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <input type="text" id="edit-direccion" name="direccion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Dirección del servicio">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Horario de Atención</label>
                    <input type="text" id="edit-horario" name="horario_atencion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Lunes a Viernes 9-17h">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Imagen Principal del Servicio</label>
                <div class="drag-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer" id="edit-main-dropzone">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="text-gray-600 mb-2">Arrastra la imagen principal aquí o haz clic para seleccionar</p>
                    <input type="file" id="edit-imagen" name="imagen_principal" class="hidden" accept="image/*">
                    <button type="button" class="text-blue-600 hover:text-blue-800" onclick="document.getElementById('edit-imagen').click()">
                        Seleccionar Imagen
                    </button>
                </div>
                <div id="edit-main-preview" class="mt-4"></div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Galería de Imágenes (Opcional)</label>
                <div class="drag-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer" id="edit-gallery-dropzone">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="text-gray-600 mb-2">Arrastra más imágenes aquí o haz clic para seleccionar</p>
                    <input type="file" id="edit-galeria" name="galeria_imagenes[]" class="hidden" multiple accept="image/*">
                    <button type="button" class="text-blue-600 hover:text-blue-800" onclick="document.getElementById('edit-galeria').click()">
                        Seleccionar Imágenes
                    </button>
                </div>
                <div id="edit-gallery-preview" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"></div>
            </div>

            <div id="edit-errors" class="text-red-500 text-sm"></div>

            <div class="flex justify-end space-x-4 pt-4">
                <button type="button" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onclick="closeModal('modal-editar')">
                    Cancelar
                </button>
                <button type="submit" class="btn-primary px-6 py-2 text-white rounded-lg transition-colors">
                    Guardar Cambios
                </button>
            </div>
        </form>
    </div>
</div>

@vite('resources/js/MisServicios.js')
