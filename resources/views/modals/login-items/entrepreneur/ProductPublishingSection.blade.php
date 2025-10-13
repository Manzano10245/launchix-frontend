<!-- Publicar Producto -->
<div id="publicar-producto" class="section-content">
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Publicar Producto</h1>
        
        <form id="producto-form" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto *</label>
                    <input type="text" name="name" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                    <select name="category" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" required>
                        <option value="">Seleccionar categoría</option>
                        <option value="ropa">Ropa</option>
                        <option value="calzado">Calzado</option>
                        <option value="accesorios">Accesorios</option>
                        <option value="hogar">Hogar</option>
                        <option value="electronica">Electrónica</option>
                        <option value="deportes">Deportes</option>
                        <option value="belleza">Belleza y Cuidado Personal</option>
                        <option value="juguetes">Juguetes</option>
                        <option value="libros">Libros</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción del Producto *</label>
                <textarea name="description" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" rows="4" required></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                    <input type="number" name="price" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" placeholder="0.00" min="0" step="0.01" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad en Stock *</label>
                    <input type="number" name="stock" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" min="0" required>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Imagen Principal del Producto</label>
                <div class="drag-area" id="product-main-dropzone">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="text-gray-600 mb-2">Arrastra la imagen principal aquí o haz clic para seleccionar</p>
                    <input type="file" name="main_image" id="product-main-image" class="hidden" accept="image/*">
                    <button type="button" class="text-primary hover:text-secondary" onclick="document.getElementById('product-main-image').click()">
                        Seleccionar Imagen
                    </button>
                </div>
                <div id="product-main-preview" class="mt-4 grid grid-cols-1 gap-4 max-w-xs"></div>
            </div>
            
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Galería de Imágenes (Opcional)</label>
                <div class="drag-area" id="product-gallery-dropzone">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="text-gray-600 mb-2">Arrastra más imágenes aquí o haz clic para seleccionar</p>
                    <input type="file" name="gallery_images[]" id="product-gallery-images" class="hidden" multiple accept="image/*">
                    <button type="button" class="text-primary hover:text-secondary" onclick="document.getElementById('product-gallery-images').click()">
                        Seleccionar Imágenes
                    </button>
                </div>
                <div id="product-gallery-preview" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"></div>
            </div>
            
            <div class="flex justify-end space-x-4">
                <button type="button" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="showSection('productos')">
                    Cancelar
                </button>
                <button type="submit" class="btn-primary px-6 py-2 text-white rounded-lg">
                    Publicar Producto
                </button>
            </div>
        </form>
    </div>
</div>