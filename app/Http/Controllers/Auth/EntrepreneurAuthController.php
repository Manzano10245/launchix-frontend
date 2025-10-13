<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class EntrepreneurAuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.entrepreneurs.login');
    }

    public function showRegister()
    {
        return view('auth.entrepreneurs.register');
    }

    public function register(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/register';

        $response = Http::post($apiUrl, [
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => $request->password,
            'password_confirmation' => $request->password_confirmation,
        ]);

        $responseData = $response->json();

        if ($response->successful() && isset($responseData['token'])) {
            session(['entrepreneur_token' => $responseData['token']]);
            return redirect()->route('entrepreneur');
        } else {
            return back()->withErrors($responseData['errors'] ?? ['email' => 'Error al registrar. Inténtalo de nuevo.'])
                        ->withInput($request->except('password'));
        }
    }

    public function login(Request $request)
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/login';

        $response = Http::post($apiUrl, [
            'email' => $request->email,
            'password' => $request->password,
        ]);

        $responseData = $response->json();

        if ($response->successful() && isset($responseData['token'])) {
            session(['entrepreneur_token' => $responseData['token']]);
            return redirect()->route('entrepreneur');
        } else {
            return back()->withErrors($responseData['errors'] ?? ['email' => 'Credenciales incorrectas'])
                        ->withInput($request->except('password'));
        }
    }

    public function logout()
    {
        $apiUrl = env('API_URL') . '/api/entrepreneur/logout';

        Http::withHeaders([
            'Authorization' => 'Bearer ' . session('entrepreneur_token'),
        ])->post($apiUrl);

        session()->forget('entrepreneur_token');
        return redirect()->route('home');
    }
}
