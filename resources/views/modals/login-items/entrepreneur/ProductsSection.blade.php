<!-- Mis Productos -->
<div id="productos" class="section-content">
    <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Mis Productos</h1>
            <button class="btn-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    onclick="showSection('publicar-producto')">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Agregar Producto
            </button>
        </div>

        <!-- Loading state -->
        <div id="productos-loading" class="text-center py-12 hidden">
            <svg class="animate-spin w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600">Cargando productos...</p>
        </div>

        <!-- Contenedor de productos (se llenará dinámicamente con JS) -->
        <div id="contenedor-productos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Los productos se cargarán aquí dinámicamente -->
        </div>
    </div>
</div>

<script>
// Cargar productos automáticamente cuando la sección sea visible
document.addEventListener('DOMContentLoaded', function() {
    const section = document.getElementById('productos');
    if (!section) return;

    const tryLoad = () => {
        if (section.offsetParent !== null && window.ProductManager && typeof window.ProductManager.loadProducts === 'function') {
            console.log('🔵 [AUTO] Sección Mis Productos visible — cargando...');
            window.ProductManager.loadProducts();
            return true;
        }
        return false;
    };

    // Intento inmediato y fallback por observer
    if (!tryLoad()) {
        const observer = new MutationObserver(() => { if (tryLoad()) observer.disconnect(); });
        observer.observe(section, { attributes: true, attributeFilter: ['class', 'style'] });
        // intento tardío por si el script carga después
        setTimeout(tryLoad, 700);
    }
});
</script>

@vite('resources/js/ProductPublishing.js')
