/* ========================================
   JAVASCRIPT MEJORADO
   Sistema Cablebús - Gobierno de Chiapas
   ======================================== */

(function() {
    'use strict';

    /* ========================================
       INICIALIZACIÓN
       ======================================== */
    document.addEventListener('DOMContentLoaded', function() {
        initAnimatedCounters();
        initIntersectionObserver();
        initSmoothScroll();
        initLazyLoading();
        initAccessibility();
        initNavigationEnhancements();
        initFormValidation();
    });

    /* ========================================
       CONTADOR ANIMADO PARA ESTADÍSTICAS
       ======================================== */
    function initAnimatedCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        if (counters.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-count'));
                    animateCounter(counter, target);
                    counterObserver.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(function(counter) {
            counterObserver.observe(counter);
        });
    }

    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 60; // 60 frames para la animación
        const duration = 1500; // 1.5 segundos
        const stepTime = duration / 60;

        const timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    /* ========================================
       INTERSECTION OBSERVER PARA ANIMACIONES
       ======================================== */
    function initIntersectionObserver() {
        const animatedElements = document.querySelectorAll(
            '.feature-card, .benefit-item, .contact-item, .cta-section'
        );

        if (animatedElements.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const elementObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // Agregar delay escalonado a elementos hermanos
                    const siblings = Array.from(entry.target.parentElement.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = (index * 0.1) + 's';
                }
            });
        }, observerOptions);

        animatedElements.forEach(function(element) {
            elementObserver.observe(element);
        });
    }

    /* ========================================
       SMOOTH SCROLL PARA ENLACES INTERNOS
       ======================================== */
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Ignorar enlaces a modales o con href="#"
                if (href === '#' || href.startsWith('#modal')) {
                    return;
                }

                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerOffset = 80; // Altura del header sticky
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Actualizar focus para accesibilidad
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    }

    /* ========================================
       LAZY LOADING PARA IMÁGENES
       ======================================== */
    function initLazyLoading() {
        // Usar la API nativa de lazy loading si está disponible
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(function(img) {
                img.src = img.dataset.src || img.src;
            });
        } else {
            // Fallback para navegadores antiguos
            const images = document.querySelectorAll('img[data-src]');
            
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    /* ========================================
       MEJORAS DE ACCESIBILIDAD
       ======================================== */
    function initAccessibility() {
        // Agregar indicadores de foco visibles
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });

        // Mejorar anuncios para lectores de pantalla
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);

        // Anunciar cambios importantes
        window.announceToScreenReader = function(message) {
            liveRegion.textContent = message;
            setTimeout(function() {
                liveRegion.textContent = '';
            }, 1000);
        };
    }

    /* ========================================
       MEJORAS DE NAVEGACIÓN
       ======================================== */
    function initNavigationEnhancements() {
        // Resaltar enlace activo en la navegación
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.secondary-nav a');

        navLinks.forEach(function(link) {
            const linkPath = new URL(link.href).pathname;
            if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        // Sticky header con sombra al hacer scroll
        const secondaryNav = document.querySelector('.secondary-nav');
        if (secondaryNav) {
            let lastScroll = 0;
            
            window.addEventListener('scroll', function() {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 100) {
                    secondaryNav.classList.add('scrolled');
                } else {
                    secondaryNav.classList.remove('scrolled');
                }

                lastScroll = currentScroll;
            }, { passive: true });
        }
    }

    /* ========================================
       VALIDACIÓN DE FORMULARIOS
       ======================================== */
    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');

        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                if (!validateForm(form)) {
                    e.preventDefault();
                    
                    // Enfocar el primer campo con error
                    const firstError = form.querySelector('.has-error');
                    if (firstError) {
                        firstError.querySelector('input, textarea, select').focus();
                    }
                }
            });

            // Validación en tiempo real
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                input.addEventListener('blur', function() {
                    validateField(input);
                });
            });
        });
    }

    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

        inputs.forEach(function(input) {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldContainer = field.closest('.form-group') || field.parentElement;
        let isValid = true;
        let errorMessage = '';

        // Limpiar errores previos
        fieldContainer.classList.remove('has-error');
        const existingError = fieldContainer.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Validación de campo requerido
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        }

        // Validación de email
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor, introduce un email válido';
            }
        }

        // Validación de teléfono
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
                isValid = false;
                errorMessage = 'Por favor, introduce un teléfono válido (10 dígitos)';
            }
        }

        // Mostrar error si es inválido
        if (!isValid) {
            fieldContainer.classList.add('has-error');
            const errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            errorElement.setAttribute('role', 'alert');
            fieldContainer.appendChild(errorElement);
            
            // Anunciar error al lector de pantalla
            if (window.announceToScreenReader) {
                window.announceToScreenReader(errorMessage);
            }
        }

        return isValid;
    }

    /* ========================================
       UTILIDADES
       ======================================== */
    
    // Throttle function para optimizar eventos de scroll/resize
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // Debounce function para optimizar búsquedas/input
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    /* ========================================
       DETECCIÓN DE SCROLL PARA ANIMACIONES
       ======================================== */
    const throttledScroll = throttle(function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(function(element) {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = 'translateY(' + yPos + 'px)';
        });
    }, 16); // ~60fps

    window.addEventListener('scroll', throttledScroll, { passive: true });

    /* ========================================
       MANEJO DE ERRORES GLOBALES
       ======================================== */
    window.addEventListener('error', function(e) {
        console.error('Error detectado:', e.message);
        // Aquí se podría enviar el error a un servicio de monitoreo
    });

  
    /* ========================================
       EXPORTAR FUNCIONES ÚTILES GLOBALMENTE
       ======================================== */
    window.CablebusUtils = {
        throttle: throttle,
        debounce: debounce,
        validateForm: validateForm,
        announceToScreenReader: window.announceToScreenReader
    };

    console.log('✅ Sistema Cablebús - JavaScript inicializado correctamente');

})();