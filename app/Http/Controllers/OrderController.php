<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OrderController extends Controller
{
    public function store(Request $request, $productId)
    {
        $apiUrl = env('API_URL') . "/api/orders";

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('user_token'),
            'Accept' => 'application/json',
        ])->post($apiUrl, [
            'product_id' => $productId,
            'quantity' => $request->input('quantity', 1),
            // Incluir otros campos necesarios para la orden
        ]);

        if ($response->successful()) {
            return redirect()->back()->with('success', 'Compra realizada y ventas actualizadas.');
        } else {
            return redirect()->back()->with('error', 'No se pudo procesar la compra. Inténtalo de nuevo.');
        }
    }
}
