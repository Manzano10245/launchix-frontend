<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Emprendedor</title>
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

        .password-strength {
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .password-strength-fill {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }

        .strength-weak { background-color: #ef4444; width: 25%; }
        .strength-fair { background-color: #f59e0b; width: 50%; }
        .strength-good { background-color: #10b981; width: 75%; }
        .strength-strong { background-color: #059669; width: 100%; }

        .progress-step {
            transition: all 0.3s ease;
        }

        .progress-step.active {
            background-color: var(--primary);
            color: white;
        }

        .progress-step.completed {
            background-color: #10b981;
            color: white;
        }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
        <!-- Logo/Icon Section -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-800">Crear Cuenta</h1>
            <p class="text-accent mt-2">Únete como emprendedor</p>
        </div>

        <!-- Progress Steps -->
        <div class="flex justify-center mb-8">
            <div class="flex items-center space-x-4">
                <div class="progress-step active w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 border-primary">
                    1
                </div>
                <div class="w-12 h-1 bg-gray-200 rounded"></div>
                <div class="progress-step w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 border-gray-200 bg-white text-gray-400">
                    2
                </div>
            </div>
        </div>

        <!-- Register Form -->
        <form method="POST" action="{{ route('register.entrepreneur') }}" class="glass-effect p-8 rounded-2xl shadow-2xl">
            @csrf
            
            <!-- Form Fields Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- First Name Field -->
                <div>
                    <input 
                        type="text" 
                        name="first_name" 
                        placeholder="Ingresa tus nombres" 
                        required 
                        class="input-field w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none input-focus transition-all duration-300"
                    >
                </div>

                <!-- Last Name Field -->
                <div>
                    <input 
                        type="text" 
                        name="last_name" 
                        placeholder="Ingresa tus apellidos" 
                        required 
                        class="input-field w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none input-focus transition-all duration-300"
                    >
                </div>
            </div>

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
            <div class="mb-3">
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Crea una contraseña segura" 
                    required 
                    id="password"
                    class="input-field w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none input-focus transition-all duration-300"
                    onkeyup="checkPasswordStrength(this.value)"
                >
            </div>

            <!-- Password Strength Indicator -->
            <div class="mb-6">
                <div class="password-strength mb-2">
                    <div id="password-strength-fill" class="password-strength-fill"></div>
                </div>
                <p id="password-strength-text" class="text-sm text-gray-500">
                    Ingresa tu contraseña para ver la seguridad
                </p>
            </div>

            <!-- Confirm Password Field -->
            <div class="mb-6">
                <input 
                    type="password" 
                    name="password_confirmation" 
                    placeholder="Confirma tu contraseña" 
                    required 
                    id="confirm-password"
                    class="input-field w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none input-focus transition-all duration-300"
                    onkeyup="checkPasswordMatch()"
                >
                <div id="password-match" class="mt-2 text-sm hidden"></div>
            </div>

            <!-- Terms and Conditions -->
            <div class="mb-6">
                <label class="flex items-start text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" required class="mr-3 mt-1 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 flex-shrink-0">
                    <span>
                        Acepto los 
                        <a href="#" class="text-primary hover:text-secondary underline">términos y condiciones</a> 
                        y la 
                        <a href="#" class="text-primary hover:text-secondary underline">política de privacidad</a>
                    </span>
                </label>
            </div>

            <!-- Submit Button -->
            <button 
                type="submit" 
                class="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold btn-hover mb-6"
            >
                Crear Cuenta
            </button>

            <!-- Divider -->
            <div class="relative mb-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">O regístrate con</span>
                </div>
            </div>

            <!-- Social Register Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
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

            <!-- Login link -->
            <div class="text-center">
                <p class="text-gray-600">
                    ¿Ya tienes cuenta? 
                    <a href="{{ route('login.entrepreneur') }}" class="text-primary hover:text-secondary font-semibold transition-colors">
                        Inicia sesión aquí
                    </a>
                </p>
            </div>
        </form>

        <!-- Footer -->
        <div class="text-center mt-6 text-sm text-gray-500">
            <p>© 2025 Tu Empresa. Todos los derechos reservados.</p>
        </div>
    </div>

    <script>
        function checkPasswordStrength(password) {
            const strengthFill = document.getElementById('password-strength-fill');
            const strengthText = document.getElementById('password-strength-text');
            
            let strength = 0;
            let message = '';
            
            if (password.length >= 8) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            strengthFill.className = 'password-strength-fill';
            
            switch(strength) {
                case 0:
                case 1:
                    strengthFill.classList.add('strength-weak');
                    message = 'Contraseña muy débil';
                    strengthText.className = 'text-sm text-red-500';
                    break;
                case 2:
                    strengthFill.classList.add('strength-fair');
                    message = 'Contraseña débil';
                    strengthText.className = 'text-sm text-yellow-500';
                    break;
                case 3:
                case 4:
                    strengthFill.classList.add('strength-good');
                    message = 'Contraseña buena';
                    strengthText.className = 'text-sm text-green-500';
                    break;
                case 5:
                    strengthFill.classList.add('strength-strong');
                    message = 'Contraseña muy segura';
                    strengthText.className = 'text-sm text-green-600';
                    break;
            }
            
            strengthText.textContent = message;
        }
        
        function checkPasswordMatch() {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const matchDiv = document.getElementById('password-match');
            
            if (confirmPassword.length > 0) {
                matchDiv.classList.remove('hidden');
                
                if (password === confirmPassword) {
                    matchDiv.textContent = '✓ Las contraseñas coinciden';
                    matchDiv.className = 'mt-2 text-sm text-green-600';
                } else {
                    matchDiv.textContent = '✗ Las contraseñas no coinciden';
                    matchDiv.className = 'mt-2 text-sm text-red-500';
                }
            } else {
                matchDiv.classList.add('hidden');
            }
        }
    </script>
</body>
</html>