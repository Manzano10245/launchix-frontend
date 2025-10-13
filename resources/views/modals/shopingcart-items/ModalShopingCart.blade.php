    <!-- Mini carrito -->
    <div id="miniCart" class="fixed right-4 top-20 bg-white shadow-lg p-6 rounded-lg w-80 z-50 hidden">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">
                <i class="fas fa-shopping-cart text-red-600"></i> Carrito
            </h3>
            <button id="closeMiniCart" class="text-gray-500 hover:text-red-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div id="cartItems" class="space-y-3 max-h-60 overflow-y-auto">
            <!-- Items del carrito se mostrarán aquí -->
        </div>
        <div class="border-t pt-4 mt-4">
            <div class="flex justify-between items-center mb-4">
                <span class="font-bold text-gray-700">Total:</span>
                <span id="cartTotal" class="font-bold text-red-600 text-lg">$0</span>
            </div>
            <button class="btn-primary w-full py-3 rounded-lg font-semibold">
                <i class="fas fa-credit-card"></i><a href="{{ route('shoppingCart') }}"> Finalizar Compra</a>
            </button>
        </div>
    </div>
