<!-- Modal Editar Servicio -->
<div id="modal-editar" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center hidden">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button class="absolute top-2 right-2 text-gray-600 hover:text-primary" onclick="closeModal('modal-editar')">&times;</button>
        <h3 class="text-xl font-bold mb-4">Editar servicio</h3>
        <form id="form-editar-servicio" enctype="multipart/form-data">
            <input type="hidden" id="edit-id">
            <div class="mb-2">
                <label class="block font-semibold mb-1">Nombre</label>
                <input type="text" id="edit-nombre" name="nombre_servicio" class="form-input w-full rounded" required>
            </div>
            <div class="mb-2">
                <label class="block font-semibold mb-1">Categoría</label>
                <input type="text" id="edit-categoria" name="categoria" class="form-input w-full rounded" required>
            </div>
            <div class="mb-2">
                <label class="block font-semibold mb-1">Descripción</label>
                <textarea id="edit-descripcion" name="descripcion" class="form-textarea w-full rounded" rows="2" required></textarea>
            </div>
            <div class="mb-2">
                <label class="block font-semibold mb-1">Dirección</label>
                <input type="text" id="edit-direccion" name="direccion" class="form-input w-full rounded">
            </div>
            <div class="mb-2">
                <label class="block font-semibold mb-1">Teléfono</label>
                <input type="text" id="edit-telefono" name="telefono" class="form-input w-full rounded">
            </div>
            <div class="mb-2">
                <label class="block font-semibold mb-1">Precio base</label>
                <input type="number" id="edit-precio" name="precio_base" class="form-input w-full rounded">
            </div>
            <div class="mb-2">
                <label class="block font-semibold mb-1">Horario</label>
                <input type="text" id="edit-horario" name="horario_atencion" class="form-input w-full rounded">
            </div>
            <div class="flex justify-end mt-4">
                <button type="submit" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">Guardar cambios</button>
            </div>
        </form>
    </div>
</div>
