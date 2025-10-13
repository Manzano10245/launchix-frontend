<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProfileController extends Controller
{
    /**
     * Mostrar la vista del perfil
     */
    public function index()
    {
        return view('profile.index');
    }

    /**
     * Obtener datos del usuario autenticado (API)
     */
    public function getUserData()
    {
        $apiUrl = env('API_URL') . '/api/user/profile';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('user_token'),
            'Accept' => 'application/json',
        ])->get($apiUrl);

        return $response->json();
    }

    /**
     * Actualizar perfil del usuario
     */
    public function update(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/user/profile';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('user_token'),
            'Accept' => 'application/json',
        ])->put($apiUrl, $request->all());

        return $response->json();
    }

    /**
     * Cambiar contraseña
     */
    public function changePassword(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/user/change-password';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . session('user_token'),
            'Accept' => 'application/json',
        ])->post($apiUrl, $request->all());

        return $response->json();
    }
}
