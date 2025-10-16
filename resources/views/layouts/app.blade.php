<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Launchix')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/png" href="{{ asset('images/logo-launchix.png') }}" sizes="32x32">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    {{-- Tailwind via CDN; no Vite CSS build --}}

    
    
</head>
<body class="bg-gray-100 text-gray-900 min-h-screen flex flex-col">
    
    @include('includes.navbar')

    @yield('content')

    @include('includes.footer')

    @stack('scripts')
</body>
</html>
</html>
