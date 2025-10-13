<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Emprendedor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --primary: #EB0924;
            --secondary: #F77786;
            --accent: #998486;
            --light: #D1A1A7;
            --lighter: #C7AFB2;
        }

        .bg-primary { background-color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .bg-accent { background-color: var(--accent); }
        .bg-light { background-color: var(--light); }
        .bg-lighter { background-color: var(--lighter); }

        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .text-accent { color: var(--accent); }

        .border-primary { border-color: var(--primary); }
        .hover\:bg-primary:hover { background-color: var(--primary); }
        .hover\:bg-secondary:hover { background-color: var(--secondary); }

        .gradient-bg {
            background: linear-gradient(135deg, var(--light) 0%, var(--lighter) 100%);
        }

        .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .input-focus:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(235, 9, 36, 0.1);
        }

        .btn-hover {
            transition: all 0.3s ease;
            transform: translateY(0);
        }

        .btn-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(235, 9, 36, 0.3);
        }

        .input-field {
            transition: all 0.3s ease;
        }

        .input-field::placeholder {
            color: #9CA3AF;
            font-size: 14px;
        }

        .input-field:focus::placeholder {
            color: #D1D5DB;
        }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Logo/Icon Section -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-800">Bienvenido</h1>
            <p class="text-accent mt-2">Inicia sesión como emprendedor</p>
        </div>

        <!-- Login Form -->
        <form method="POST" action="{{ route('login.entrepreneur') }}" class="glass-effect p-8 rounded-2xl shadow-2xl">
            @csrf
            
            <!-- Error Message -->
            @error('email')
                <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <p class="text-red-700 text-sm">{{ $message }}</p>
                </div>
            @enderror

            <!-- Email Field -->
            <div class="mb-6">
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Ingresa tu correo electrónico" 
                    required 
                    class="input-field w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none input-focus transition-all duration-300"
                >
            </div>

            <!-- Password Field -->
            <div class="mb-6">
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Ingresa tu contraseña" 
                    required 
                    class="input-field w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none input-focus transition-all duration-300"
                >
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <label class="flex items-center text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" class="mr-2 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2">
                    Recordarme
                </label>
                <a href="#" class="text-sm text-primary hover:text-secondary transition-colors hover:underline">
                    ¿Olvidaste tu contraseña?
                </a>
            </div>

            <!-- Submit Button -->
            <button 
                type="submit" 
                class="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold btn-hover"
            >
                Iniciar Sesión
            </button>

            <!-- Divider -->
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
            </div>

            <!-- Social Login Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" class="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span class="text-sm font-medium">Google</span>
                </button>
                
                <button type="button" class="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span class="text-sm font-medium">Facebook</span>
                </button>
            </div>

            <!-- Sign up link -->
            <div class="text-center mt-6">
                <p class="text-gray-600">
                    ¿No tienes cuenta? 
                    <a href="{{ route('register.entrepreneur') }}" class="text-primary hover:text-secondary font-semibold transition-colors">
                        Regístrate aquí
                    </a>
                </p>
            </div>
        </form>

        <!-- Footer -->
        <div class="text-center mt-6 text-sm text-gray-500">
            <p>© 2025 Tu Empresa. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>