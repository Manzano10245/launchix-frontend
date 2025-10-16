// Modular Footer for Launchix
export function renderFooter(containerId) {
  const year = new Date().getFullYear();
  const footerHTML = `
    <footer class="bg-gray-900 text-white py-6 mt-10">
    <div class="footer-top">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div class="footer-column">
            <div class="footer-brand">
              <i class="fas fa-shopping-bag"></i>
              <span>MiTienda</span>
            </div>
            <p class="footer-description">
              Tu tienda de confianza con los mejores productos y el mejor servicio al cliente. Calidad garantizada en cada compra.
            </p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-link" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          <div class="footer-column">
            <h4 class="footer-title">Enlaces Rápidos</h4>
            <ul class="footer-links">
              <li><a href="home.html" class="footer-link">Inicio</a></li>
              <li><a href="products.html" class="footer-link">Productos</a></li>
              <li><a href="services.html" class="footer-link">Servicios</a></li>
              <li><a href="#" class="footer-link">Sobre Nosotros</a></li>
              <li><a href="#" class="footer-link">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4 class="footer-title">Categorías</h4>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">Electrónicos</a></li>
              <li><a href="#" class="footer-link">Ropa y Moda</a></li>
              <li><a href="#" class="footer-link">Hogar y Decoración</a></li>
              <li><a href="#" class="footer-link">Deportes</a></li>
              <li><a href="#" class="footer-link">Accesorios</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4 class="footer-title">Contacto</h4>
            <div class="footer-contact">
              <div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>123 Calle Principal, Ciudad</span></div>
              <div class="contact-item"><i class="fas fa-phone"></i><span>+57 300 123 4567</span></div>
              <div class="contact-item"><i class="fas fa-envelope"></i><span>info@mitienda.com</span></div>
              <div class="contact-item"><i class="fas fa-clock"></i><span>Lun - Sáb: 9:00 - 20:00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div class="footer-bottom">
        <div class="container mx-auto px-4">
          <div class="footer-bottom-content">
            <p class="copyright">&copy; ${year} MiTienda. Todos los derechos reservados.</p>
            <div class="footer-legal">
              <a href="#" class="legal-link">Términos y Condiciones</a>
              <span class="separator">|</span>
              <a href="#" class="legal-link">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </div>
  </footer>
  `;
  document.getElementById(containerId).innerHTML = footerHTML;
}
