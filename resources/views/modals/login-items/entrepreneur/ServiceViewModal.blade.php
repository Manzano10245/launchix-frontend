<!-- Modal Ver Más Servicio -->
<div id="modal-ver" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center hidden">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button class="absolute top-2 right-2 text-gray-600 hover:text-primary" onclick="closeModal('modal-ver')">&times;</button>
        <h3 class="text-xl font-bold mb-2" id="ver-nombre"></h3>
        <img id="ver-img" src="" alt="" class="w-full h-48 object-cover rounded mb-3">
        <div class="mb-2 text-gray-700" id="ver-descripcion"></div>
        <div class="mb-2"><span class="font-semibold">Categoría:</span> <span id="ver-categoria"></span></div>
        <div class="mb-2"><span class="font-semibold">Precio:</span> <span id="ver-precio"></span></div>
        <div class="mb-2"><span class="font-semibold">Dirección:</span> <span id="ver-direccion"></span></div>
        <div class="mb-2"><span class="font-semibold">Teléfono:</span> <span id="ver-telefono"></span></div>
        <div class="mb-2"><span class="font-semibold">Horario:</span> <span id="ver-horario"></span></div>
        <div id="ver-galeria" class="flex gap-2 mt-2"></div>
    </div>
</div>
