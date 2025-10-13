        // // Animación de entrada para elementos del footer
        // const observerOptions = {
        //     threshold: 0.1,
        //     rootMargin: '0px 0px -50px 0px'
        // };

        // const observer = new IntersectionObserver((entries) => {
        //     entries.forEach(entry => {
        //         if (entry.isIntersecting) {
        //             entry.target.style.animation = 'slideUp 0.6s ease forwards';
        //         }
        //     });
        // }, observerOptions);

        // document.querySelectorAll('footer > div > div').forEach(el => {
        //     observer.observe(el);
        // });

/**
 * Footer.js - Manejo del footer con animaciones y funcionalidad extendida
 */

// Función principal que se ejecuta al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('👣 [FOOTER] Inicializando componente Footer');

    // ============================================
    // ANIMACIONES DEL FOOTER
    // ============================================

    // Configuración del observer para animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Crear observer para animaciones de entrada
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Aplicar animación solo si el elemento no está ya animado
                if (!entry.target.classList.contains('animated')) {
                    entry.target.style.animation = 'slideUp 0.6s ease forwards';
                    entry.target.classList.add('animated');
                }
            }
        });
    }, observerOptions);

    // Observar todos los elementos del footer que deben animarse
    const footerElements = document.querySelectorAll('footer > div > div, footer .animate-on-scroll');
    footerElements.forEach(el => {
        observer.observe(el);
    });

    console.log(`🎯 [FOOTER] Observando ${footerElements.length} elementos para animación`);

    // ============================================
    // SUSCRIPCIÓN AL NEWSLETTER (API)
    // ============================================

    /**
     * Maneja el envío del formulario de newsletter
     */
    function setupNewsletterForm() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (!newsletterForm) {
            console.log('⚠️ [FOOTER] No se encontró formulario de newsletter');
            return;
        }

        console.log('📧 [FOOTER] Configurando formulario de newsletter');

        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📤 [NEWSLETTER] Enviando suscripción');

            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const errorElement = this.querySelector('.newsletter-error');
            const successElement = this.querySelector('.newsletter-success');

            // Limpiar mensajes previos
            if (errorElement) errorElement.textContent = '';
            if (successElement) successElement.textContent = '';

            // Validar email
            const email = emailInput.value.trim();
            if (!email) {
                showNewsletterError('Por favor ingresa tu correo electrónico', errorElement);
                return;
            }

            if (!validateEmail(email)) {
                showNewsletterError('Por favor ingresa un correo electrónico válido', errorElement);
                return;
            }

            // Deshabilitar botón y mostrar loading
            toggleSubmitButton(submitBtn, true);

            try {
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al suscribirse');
                }

                if (data.success) {
                    console.log('✅ [NEWSLETTER] Suscripción exitosa');
                    showNewsletterSuccess('¡Gracias por suscribirte! Revisa tu correo para confirmar.', successElement);
                    emailInput.value = '';
                    if (errorElement) errorElement.textContent = '';
                } else {
                    throw new Error(data.message || 'Error al procesar la suscripción');
                }

            } catch (error) {
                console.error('❌ [NEWSLETTER] Error:', error);
                showNewsletterError(error.message, errorElement);
            } finally {
                toggleSubmitButton(submitBtn, false);
            }
        });
    }

    /**
     * Muestra un error en el formulario de newsletter
     */
    function showNewsletterError(message, element) {
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        console.error('⚠️ [NEWSLETTER] Error:', message);
    }

    /**
     * Muestra un mensaje de éxito en el formulario de newsletter
     */
    function showNewsletterSuccess(message, element) {
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        console.log('✅ [NEWSLETTER] Éxito:', message);
    }

    /**
     * Alterna el estado del botón de submit
     */
    function toggleSubmitButton(button, loading) {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = `
                <span class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                </span>
            `;
        } else {
            button.disabled = false;
            button.innerHTML = 'Suscríbete';
        }
    }

    /**
     * Valida un correo electrónico
     */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Obtiene el token CSRF
     */
    function getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.content : '';
    }

    // Inicializar formulario de newsletter
    setupNewsletterForm();

    // ============================================
    // ENLACES DE REDES SOCIALES (API TRACKING)
    // ============================================

    /**
     * Registra clics en enlaces de redes sociales
     */
    function setupSocialMediaTracking() {
        const socialLinks = document.querySelectorAll('footer .social-link');
        if (socialLinks.length === 0) {
            console.log('⚠️ [FOOTER] No se encontraron enlaces de redes sociales');
            return;
        }

        console.log('🔗 [FOOTER] Configurando tracking para redes sociales');

        socialLinks.forEach(link => {
            link.addEventListener('click', async function(e) {
                // No prevenir el comportamiento por defecto para que el enlace funcione
                // pero registrar el clic en nuestra API

                const platform = this.getAttribute('data-platform') || 'unknown';
                const url = this.getAttribute('href');

                console.log(`📌 [SOCIAL] Clic en ${platform}: ${url}`);

                try {
                    // Enviar registro del clic a nuestra API (no bloqueante)
                    await fetch('/api/track/social-click', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({
                            platform: platform,
                            url: url,
                            page: window.location.pathname
                        })
                    });
                } catch (error) {
                    console.error('❌ [SOCIAL] Error al registrar clic:', error);
                    // No mostrar error al usuario ya que no es crítico
                }
            });
        });
    }

    // Inicializar tracking de redes sociales
    setupSocialMediaTracking();

    // ============================================
    // INFORMACIÓN DE CONTACTO DINÁMICA (API)
    // ============================================

    /**
     * Carga información de contacto desde la API
     */
    async function loadContactInfo() {
        try {
            const contactSection = document.querySelector('footer .contact-info');
            if (!contactSection) {
                console.log('⚠️ [FOOTER] No se encontró sección de contacto');
                return;
            }

            console.log('📞 [FOOTER] Cargando información de contacto desde API');

            const response = await fetch('/api/contact-info', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.contact) {
                console.log('✅ [FOOTER] Información de contacto cargada:', data.contact);

                // Actualizar dirección
                const addressElement = contactSection.querySelector('.contact-address');
                if (addressElement && data.contact.address) {
                    addressElement.textContent = data.contact.address;
                }

                // Actualizar teléfono
                const phoneElement = contactSection.querySelector('.contact-phone');
                if (phoneElement && data.contact.phone) {
                    phoneElement.textContent = data.contact.phone;
                    phoneElement.href = `tel:${data.contact.phone.replace(/\s+/g, '')}`;
                }

                // Actualizar email
                const emailElement = contactSection.querySelector('.contact-email');
                if (emailElement && data.contact.email) {
                    emailElement.textContent = data.contact.email;
                    emailElement.href = `mailto:${data.contact.email}`;
                }

                // Actualizar horario
                const hoursElement = contactSection.querySelector('.contact-hours');
                if (hoursElement && data.contact.hours) {
                    hoursElement.textContent = data.contact.hours;
                }
            }

        } catch (error) {
            console.error('❌ [FOOTER] Error al cargar información de contacto:', error);
            // No mostrar error al usuario, usar valores por defecto
        }
    }

    // Cargar información de contacto al inicio
    loadContactInfo();

    // ============================================
    // COPYRIGHT DINÁMICO
    // ============================================

    /**
     * Actualiza el año en el copyright automáticamente
     */
    function updateCopyrightYear() {
        const copyrightElement = document.querySelector('footer .copyright-year');
        if (copyrightElement) {
            const currentYear = new Date().getFullYear();
            copyrightElement.textContent = currentYear;
            console.log(`📅 [FOOTER] Año de copyright actualizado a ${currentYear}`);
        }
    }

    // Actualizar año de copyright
    updateCopyrightYear();

    // ============================================
    // ANIMACIONES ADICIONALES
    // ============================================

    /**
     * Configura animación para el botón de "Volver arriba"
     */
    function setupBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) {
            console.log('⚠️ [FOOTER] No se encontró botón "Volver arriba"');
            return;
        }

        console.log('↑ [FOOTER] Configurando botón "Volver arriba"');

        // Mostrar/Ocultar según scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('hidden');
                backToTopButton.classList.add('flex');
            } else {
                backToTopButton.classList.add('hidden');
                backToTopButton.classList.remove('flex');
            }
        });

        // Scroll suave al hacer clic
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Configurar botón "Volver arriba"
    setupBackToTopButton();

    // ============================================
    // INICIALIZACIÓN COMPLETA
    // ============================================

    console.log('✅ [FOOTER] Componente Footer inicializado correctamente');
});


