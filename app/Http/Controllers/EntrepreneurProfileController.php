<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class EntrepreneurProfileController extends Controller
{
    public function show()
    {
        return view('profiles.entrepreneur');
    }

    /**
     * Obtener datos del emprendedor autenticado
     */
    public function getEntrepreneurData()
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/data';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->get($apiUrl);

        return $response->json();
    }

    /**
     * Actualizar perfil del emprendedor
     */
    public function updateEntrepreneurProfile(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/profile';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->put($apiUrl, $request->all());

        return $response->json();
    }

    /**
     * Actualizar foto de perfil del emprendedor
     */
    public function updateEntrepreneurAvatar(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/avatar';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
        ])->attach(
            'avatar', file_get_contents($request->file('avatar')->getRealPath()), $request->file('avatar')->getClientOriginalName()
        )->post($apiUrl, ['_method' => 'PUT']);

        return $response->json();
    }

    /**
     * Eliminar foto de perfil del emprendedor
     */
    public function deleteEntrepreneurAvatar()
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/avatar';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->delete($apiUrl);

        return $response->json();
    }

    /**
     * Cambiar contraseña del emprendedor
     */
    public function updatePassword(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/password';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
            'Accept' => 'application/json',
        ])->put($apiUrl, $request->all());

        return $response->json();
    }

    /**
     * Perfil público del emprendedor (sin autenticación)
     */
    public function publicProfile($id)
    {
        $apiUrl = env('API_URL') . "/api/entrepreneur/public-profile/{$id}";
        $response = Http::get($apiUrl);

        return view('entrepreneur.public-profile', $response->json());
    }
}
