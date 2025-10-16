



import './config.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

document.addEventListener('DOMContentLoaded', () => {
	// Render shared layout
	const navbar = document.getElementById('navbar');
	if (navbar) renderNavbar('navbar');

	const main = document.getElementById('main');
	if (main) {
		main.innerHTML = `
			<div class="min-h-screen bg-blue-50 flex flex-col items-center justify-center py-16">
				<h1 class="text-4xl font-extrabold text-blue-600 mb-4">¡Launchix Frontend listo!</h1>
				<p class="text-lg text-gray-700 mb-6">Tailwind por CDN y Vite (MPA) sin PostCSS.</p>
				<div class="flex gap-3">
					<a href="/resources/views/static/products.html" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Productos</a>
					<a href="/resources/views/static/services.html" class="bg-white hover:bg-gray-100 text-blue-700 font-bold py-2 px-4 rounded border">Servicios</a>
				</div>
			</div>
		`;
	}

	const footer = document.getElementById('footer');
	if (footer) renderFooter('footer');
});



