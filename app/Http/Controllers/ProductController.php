<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProductController extends Controller
{
    /**
     * Obtener todos los productos del emprendedor autenticado
     */
    public function index()
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/products';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->get($apiUrl);

        return $response->json();
    }

    /**
     * Obtener un producto específico
     */
    public function show($id)
    {
        $apiUrl = env('API_URL') . "/api/products/{$id}";
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->get($apiUrl);

        return $response->json();
    }

    /**
     * Crear un nuevo producto
     */
    public function store(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/products';

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
        ])->attach(
            'main_image', $request->hasFile('main_image') ? file_get_contents($request->file('main_image')->getRealPath()) : null, $request->file('main_image') ? $request->file('main_image')->getClientOriginalName() : null
        )->attach(
            $request->hasFile('gallery_images') ? $this->prepareGalleryImages($request) : []
        )->post($apiUrl, $request->except(['main_image', 'gallery_images']));

        return $response->json();
    }

    /**
     * Preparar las imágenes de la galería para el envío multipart
     */
    private function prepareGalleryImages(Request $request)
    {
        $gallery = [];
        foreach ($request->file('gallery_images') as $index => $image) {
            $gallery["gallery_images.{$index}"] = file_get_contents($image->getRealPath());
        }
        return $gallery;
    }

    /**
     * Actualizar un producto existente
     */
    public function update(Request $request, $id)
    {
        $apiUrl = env('API_URL') . "/api/products/{$id}";

        $http = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
        ]);

        if ($request->hasFile('main_image')) {
            $http->attach(
                'main_image', file_get_contents($request->file('main_image')->getRealPath()), $request->file('main_image')->getClientOriginalName()
            );
        }

        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $index => $image) {
                $http->attach(
                    "gallery_images.{$index}", file_get_contents($image->getRealPath()), $image->getClientOriginalName()
                );
            }
        }

        $response = $http->post($apiUrl, $request->except(['main_image', 'gallery_images', '_method']));

        return $response->json();
    }

    /**
     * Eliminar un producto
     */
    public function destroy($id)
    {
        $apiUrl = env('API_URL') . "/api/products/{$id}";
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->delete($apiUrl);

        return $response->json();
    }

    /**
     * Obtener todos los productos (público)
     */
    public function apiIndex(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/products';
        $response = Http::get($apiUrl, $request->all());

        return $response->json();
    }

    /**
     * Obtener todos los productos (público)
     */
    public function publicIndex(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/products/public';
        $response = Http::get($apiUrl, $request->all());

        if ($request->ajax() || $request->expectsJson()) {
            return $response->json();
        }

        $products = $response->json()['data'] ?? [];
        return view('productos.index', [
            'products' => $products,
            'productsJson' => json_encode($products)
        ]);
    }

    /**
     * Obtener un producto específico para la vista pública
     */
    public function publicShow($id)
    {
        $apiUrl = env('API_URL') . "/api/products/public/{$id}";
        $response = Http::get($apiUrl);

        if (request()->ajax() || request()->expectsJson()) {
            return $response->json();
        }

        $product = $response->json()['data'] ?? null;
        return view('productos.show', compact('product'));
    }

    /**
     * Buscar productos
     */
    public function search(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/products/search';
        $response = Http::get($apiUrl, $request->all());

        return $response->json();
    }
}
