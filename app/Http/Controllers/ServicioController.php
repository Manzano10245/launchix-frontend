<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ServicioController extends Controller
{
    /**
     * Obtener solo los servicios del usuario autenticado (emprendedor)
     */
    public function misServicios(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/servicios';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->get($apiUrl);

        if ($request->ajax() || $request->wantsJson()) {
            return $response->json();
        } else {
            $servicios = $response->json()['data'] ?? [];
            return view('modals.login-items.entrepreneur.ServicesSection', [
                'servicios' => $servicios,
                'entrepreneur' => auth('entrepreneur')->user()
            ]);
        }
    }

    /**
     * Obtener todos los servicios
     */
    public function index()
    {
        $apiUrl = env('API_URL') . '/api/servicios';
        $response = Http::get($apiUrl);

        if (request()->ajax() || request()->wantsJson()) {
            return $response->json();
        }
        return view('services');
    }

    /**
     * Obtener un servicio específico con información del emprendedor (público)
     */
    public function getServiceDetails($id)
    {
        $apiUrl = env('API_URL') . "/api/servicios/{$id}/detalles";
        $response = Http::get($apiUrl);

        return $response->json();
    }

    /**
     * Obtener un servicio específico (formato compatible para JS)
     */
    public function show($id)
    {
        $apiUrl = env('API_URL') . "/api/servicios/{$id}";
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->get($apiUrl);

        return $response->json();
    }

    /**
     * Crear un nuevo servicio
     */
    public function store(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/servicios';

        $http = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
        ]);

        if ($request->hasFile('imagen_principal')) {
            $http->attach(
                'imagen_principal',
                file_get_contents($request->file('imagen_principal')->getRealPath()),
                $request->file('imagen_principal')->getClientOriginalName()
            );
        }

        if ($request->hasFile('galeria_imagenes')) {
            foreach ($request->file('galeria_imagenes') as $index => $imagen) {
                $http->attach(
                    "galeria_imagenes.{$index}",
                    file_get_contents($imagen->getRealPath()),
                    $imagen->getClientOriginalName()
                );
            }
        }

        $response = $http->post($apiUrl, $request->except(['imagen_principal', 'galeria_imagenes']));

        return $response->json();
    }

    /**
     * Actualizar un servicio existente
     */
    public function update(Request $request, $id)
    {
        $apiUrl = env('API_URL') . "/api/servicios/{$id}";

        $http = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
        ]);

        if ($request->hasFile('imagen_principal')) {
            $http->attach(
                'imagen_principal',
                file_get_contents($request->file('imagen_principal')->getRealPath()),
                $request->file('imagen_principal')->getClientOriginalName()
            );
        }

        if ($request->hasFile('galeria_imagenes')) {
            foreach ($request->file('galeria_imagenes') as $index => $imagen) {
                $http->attach(
                    "galeria_imagenes.{$index}",
                    file_get_contents($imagen->getRealPath()),
                    $imagen->getClientOriginalName()
                );
            }
        }

        $response = $http->post($apiUrl, $request->except(['imagen_principal', 'galeria_imagenes', '_method']));

        return $response->json();
    }

    /**
     * Eliminar un servicio
     */
    public function destroy($id)
    {
        $apiUrl = env('API_URL') . "/api/servicios/{$id}";
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->delete($apiUrl);

        return $response->json();
    }
}
