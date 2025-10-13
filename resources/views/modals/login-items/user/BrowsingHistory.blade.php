@extends('layouts.app')

@section('title', 'profile')

@vite('resources/css/profile.css')

@section('content')

<!-- Main Content -->
<div class="container mx-auto px-4 py-8">
    
    <div class="flex gap-8">
        <!-- Sidebar -->
         @include('modals.login-items.user.sideBar')

        <!-- Main Content Area -->
        <main class="flex-1">
           
        </main>
    </div>
</div>

@endsection

@vite('resources/js/profile.js')