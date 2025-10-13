<!-- Publicar Servicio -->
<div id="publicar-servicio" class="section-content">
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Publicar Servicio</h1>

    <form id="servicio-form" class="space-y-6" enctype="multipart/form-data" method="POST" action="{{ route('servicios.store') }}">
        @csrf
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio *</label>
                    <input type="text" name="nombre_servicio" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                    <select name="categoria" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" required>
                        <option value="">Seleccionar categoría</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Hogar y Jardinería">Hogar y Jardinería</option>
                        <option value="Automotriz">Automotriz</option>
                        <option value="Belleza y Cuidado Personal">Belleza y Cuidado Personal</option>
                        <option value="Educación y Tutorías">Educación y Tutorías</option>
                        <option value="Salud y Bienestar">Salud y Bienestar</option>
                        <option value="Eventos y Entretenimiento">Eventos y Entretenimiento</option>
                        <option value="Construcción y Reformas">Construcción y Reformas</option>
                        <option value="Transporte y Logística">Transporte y Logística</option>
                        <option value="Servicios Profesionales">Servicios Profesionales</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción del Servicio *</label>
                <textarea name="descripcion" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" rows="4" required></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                    <input type="text" name="direccion" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono de Contacto *</label>
                    <input type="tel" name="telefono" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" required>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio Base</label>
                    <input type="number" name="precio_base" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" placeholder="Precio desde" min="0" step="1000">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Horario de Atención</label>
                    <input type="text" name="horario_atencion" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" placeholder="Lun-Vie 8:00-18:00">
                </div>
            </div>


            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Imagen Principal del Negocio</label>
                <div class="drag-area" id="service-main-dropzone">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="text-gray-600 mb-2">Arrastra la imagen principal aquí o haz clic para seleccionar</p>
                    <input type="file" name="imagen_principal" id="service-main-image" class="hidden" accept="image/*">
                    <button type="button" class="text-primary hover:text-secondary">
                        Seleccionar Imagen
                    </button>
                    <p class="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB.</p>
                </div>
                <div id="service-main-preview" class="mt-4"></div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Galería de Imágenes (Opcional)</label>
                <div class="drag-area" id="service-gallery-dropzone">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="text-gray-600 mb-2">Arrastra más imágenes aquí o haz clic para seleccionar</p>
                    <input type="file" name="galeria_imagenes[]" id="service-gallery-images" class="hidden" multiple accept="image/*">
                    <button type="button" class="text-primary hover:text-secondary">
                        Seleccionar Imágenes
                    </button>
                    <p class="text-xs text-gray-500 mt-1">Máximo 5 imágenes. Formatos: JPG, PNG. Tamaño máximo por imagen: 2MB.</p>
                </div>
                <div id="service-gallery-preview" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"></div>
            </div>

            <div class="flex justify-end space-x-4">
                <button type="button" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="showSection('servicios')">
                    Cancelar
                </button>
                <button type="submit" class="btn-primary px-6 py-2 text-white rounded-lg">
                    Publicar Servicio
                </button>
            </div>
        </form>
    </div>
</div>
@vite('resources/js/ServicePublishing.js')
