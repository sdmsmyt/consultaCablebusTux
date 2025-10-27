/* ========================================
   JAVASCRIPT CORREGIDO PARA PREGUNTAS FRECUENTES
   Sistema Cablebús - Gobierno de Chiapas
   
   ✅ Errores corregidos
   ✅ Código optimizado
   ✅ Mejor manejo de errores
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // ELEMENTOS DEL DOM
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.querySelector('.no-results');
    const categories = document.querySelectorAll('.faq-category');
    const topQuestionsContainer = document.getElementById('topQuestions');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const clearSearchBtn = document.getElementById('clearSearch');

    // ========================================
    // SISTEMA DE MÉTRICAS
    // ========================================
    const metricsSystem = {
        searchQueries: {},
        questionClicks: {},
        
        // Inicializar datos desde localStorage
        init() {
            try {
                this.searchQueries = JSON.parse(localStorage.getItem('cablebus_search_queries') || '{}');
                this.questionClicks = JSON.parse(localStorage.getItem('cablebus_question_clicks') || '{}');
            } catch (error) {
                console.error('Error al cargar métricas:', error);
                this.searchQueries = {};
                this.questionClicks = {};
            }
        },
        
        // Registrar búsqueda
        trackSearch(query) {
            if (!query || query.length < 3) return;
            
            const normalizedQuery = query.toLowerCase().trim();
            this.searchQueries[normalizedQuery] = (this.searchQueries[normalizedQuery] || 0) + 1;
            this.saveData();
            this.updateTopQuestions();
        },
        
        // Registrar click en pregunta
        trackQuestionClick(questionText) {
            if (!questionText) return;
            
            const normalizedQuestion = questionText.toLowerCase().trim();
            this.questionClicks[normalizedQuestion] = (this.questionClicks[normalizedQuestion] || 0) + 1;
            this.saveData();
            this.updateTopQuestions();
        },
        
        // Guardar datos
        saveData() {
            try {
                localStorage.setItem('cablebus_search_queries', JSON.stringify(this.searchQueries));
                localStorage.setItem('cablebus_question_clicks', JSON.stringify(this.questionClicks));
            } catch (error) {
                console.error('Error al guardar métricas:', error);
            }
        },
        
        // Obtener top consultas
        getTopQueries(limit = 4) {
            const allQueries = [];
            
            // Agregar búsquedas
            Object.entries(this.searchQueries).forEach(([query, count]) => {
                allQueries.push({
                    text: query,
                    count: count,
                    type: 'búsqueda'
                });
            });
            
            // Agregar preguntas clickeadas
            Object.entries(this.questionClicks).forEach(([question, count]) => {
                allQueries.push({
                    text: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
                    count: count,
                    type: 'pregunta'
                });
            });
            
            return allQueries
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
        },
        
        // Actualizar display de top consultas
        updateTopQuestions() {
            if (!topQuestionsContainer) return;
            
            const topQueries = this.getTopQueries(4);
            
            if (topQueries.length === 0) {
                topQuestionsContainer.innerHTML = `
                    <div class="metric-card">
                        <div class="metric-info">
                            <h4>Sistema iniciando...</h4>
                            <p>Las métricas aparecerán conforme se use el sistema</p>
                        </div>
                        <div class="metric-count">0</div>
                    </div>
                `;
                return;
            }
            
            topQuestionsContainer.innerHTML = topQueries.map(item => `
                <div class="metric-card">
                    <div class="metric-info">
                        <h4>${escapeHtml(item.text)}</h4>
                        <p>Tipo: ${escapeHtml(item.type)}</p>
                    </div>
                    <div class="metric-count">${item.count}</div>
                </div>
            `).join('');
        }
    };

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    metricsSystem.init();
    initFAQToggle();
    initSearchFunctionality();
    initNavigationSmoothScroll();
    initSearchSuggestions();
    initClearSearchButton();
    metricsSystem.updateTopQuestions();

    // ========================================
    // FUNCIONALIDAD FAQ TOGGLE
    // ========================================
    function initFAQToggle() {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (question && answer) {
                question.addEventListener('click', function() {
                    const questionText = question.textContent.replace(/[+×]/g, '').trim();
                    
                    // Registrar métricas
                    metricsSystem.trackQuestionClick(questionText);
                    
                    toggleFAQItem(item, answer);
                });

                // Accesibilidad: navegación por teclado
                question.setAttribute('tabindex', '0');
                question.setAttribute('role', 'button');
                question.setAttribute('aria-expanded', 'false');
                
                question.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
            }
        });
    }

    function toggleFAQItem(item, answer) {
        const isActive = item.classList.contains('active');
        const question = item.querySelector('.faq-question');
        
        // Cerrar todos los elementos FAQ
        closeAllFAQItems();

        // Abrir el elemento clickeado si no estaba activo
        if (!isActive) {
            item.classList.add('active');
            answer.classList.add('active');
            
            // Actualizar ARIA
            if (question) {
                question.setAttribute('aria-expanded', 'true');
            }
            
            // Cambiar icono
            const toggle = item.querySelector('.faq-toggle');
            if (toggle) toggle.textContent = '×';
            
            // Scroll suave hacia el elemento abierto
            setTimeout(() => {
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }, 100);
        }
    }

    function closeAllFAQItems() {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const toggle = item.querySelector('.faq-toggle');
            
            item.classList.remove('active');
            
            if (answer) answer.classList.remove('active');
            if (question) question.setAttribute('aria-expanded', 'false');
            if (toggle) toggle.textContent = '+';
        });
    }

    // ========================================
    // FUNCIONALIDAD DE BÚSQUEDA
    // ========================================
    function initSearchFunctionality() {
        if (!searchInput) return;
        
        let searchTimeout;
        
        // Búsqueda en tiempo real
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch();
            }, 300);
        });
        
        // Limpiar búsqueda con Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                clearSearch();
            } else if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query.length >= 3) {
                    metricsSystem.trackSearch(query);
                }
            }
        });
    }

    function handleSearch() {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleItems = 0;

        // Resetear si no hay término de búsqueda
        if (searchTerm === '') {
            resetSearchResults();
            hideSearchSuggestions();
            return;
        }

        // Buscar en preguntas y respuestas
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            const questionText = question ? question.textContent.toLowerCase() : '';
            const answerText = answer ? answer.textContent.toLowerCase() : '';
            
            const matchFound = questionText.includes(searchTerm) || answerText.includes(searchTerm);
            
            if (matchFound) {
                showItem(item);
                highlightSearchTerm(question, searchTerm);
                highlightSearchTerm(answer, searchTerm);
                visibleItems++;
            } else {
                hideItem(item);
            }
        });

        // Actualizar visibilidad de categorías
        updateCategoryVisibility();
        
        // Mostrar/ocultar mensaje de no resultados
        toggleNoResultsMessage(visibleItems, searchTerm);
        
        // Actualizar sugerencias
        updateSearchSuggestions(searchTerm);
    }

    function clearSearch() {
        if (searchInput) {
            searchInput.value = '';
            handleSearch();
            searchInput.focus();
        }
    }

    function resetSearchResults() {
        // Mostrar todos los elementos
        faqItems.forEach(item => {
            showItem(item);
            
            // Remover highlights
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            [question, answer].forEach(element => {
                if (element) {
                    element.innerHTML = element.innerHTML.replace(/<mark class="highlight">(.*?)<\/mark>/gi, '$1');
                }
            });
        });

        // Mostrar todas las categorías
        categories.forEach(category => {
            category.style.display = 'block';
        });

        // Ocultar mensaje de no resultados
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    // ========================================
    // SUGERENCIAS DE BÚSQUEDA
    // ========================================
    function initSearchSuggestions() {
        if (!searchInput || !searchSuggestions) return;
        
        const commonSuggestions = [
            'costo del cablebús',
            'horarios de operación',
            'estaciones del cablebús',
            'seguridad',
            'accesibilidad',
            'medio ambiente',
            'construcción',
            'rutas'
        ];

        searchInput.addEventListener('focus', function() {
            if (this.value.trim() === '') {
                showSuggestions(commonSuggestions.slice(0, 4));
            }
        });

        // Delay para permitir clicks en sugerencias
        searchInput.addEventListener('blur', function() {
            setTimeout(() => {
                hideSearchSuggestions();
            }, 200);
        });
    }

    function updateSearchSuggestions(searchTerm) {
        if (!searchSuggestions || searchTerm.length < 2) {
            hideSearchSuggestions();
            return;
        }

        const suggestions = [];
        
        // Buscar en preguntas FAQ
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question && suggestions.length < 5) {
                const questionText = question.textContent.toLowerCase();
                if (questionText.includes(searchTerm)) {
                    const fullText = question.textContent.replace(/[+×]/g, '').trim();
                    const shortText = fullText.length > 60 
                        ? fullText.substring(0, 60) + '...' 
                        : fullText;
                    
                    if (!suggestions.includes(shortText)) {
                        suggestions.push(shortText);
                    }
                }
            }
        });

        if (suggestions.length > 0) {
            showSuggestions(suggestions);
        } else {
            hideSearchSuggestions();
        }
    }

    function showSuggestions(suggestions) {
        if (!searchSuggestions) return;
        
        searchSuggestions.innerHTML = suggestions.map(suggestion => {
            const escapedSuggestion = escapeHtml(suggestion);
            return `<div class="suggestion-item" data-suggestion="${escapedSuggestion}">
                ${escapedSuggestion}
            </div>`;
        }).join('');
        
        // Agregar event listeners a sugerencias
        searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                const suggestion = this.getAttribute('data-suggestion');
                selectSuggestion(suggestion);
            });
        });
        
        searchSuggestions.classList.add('active');
    }

    function hideSearchSuggestions() {
        if (searchSuggestions) {
            searchSuggestions.classList.remove('active');
        }
    }

    function selectSuggestion(suggestion) {
        if (searchInput) {
            searchInput.value = suggestion.replace('...', '');
            handleSearch();
            hideSearchSuggestions();
            searchInput.focus();
        }
    }

    // ========================================
    // BOTÓN LIMPIAR BÚSQUEDA
    // ========================================
    function initClearSearchButton() {
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', clearSearch);
        }
    }

    // ========================================
    // HIGHLIGHT DE TÉRMINOS
    // ========================================
    function highlightSearchTerm(element, searchTerm) {
        if (!element || !searchTerm) return;
        
        try {
            // Guardar contenido original si no existe
            if (!element.hasAttribute('data-original-content')) {
                element.setAttribute('data-original-content', element.innerHTML);
            }
            
            // Restaurar contenido original
            element.innerHTML = element.getAttribute('data-original-content');
            
            // Agregar highlights
            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            element.innerHTML = element.innerHTML.replace(regex, '<mark class="highlight">$1</mark>');
        } catch (error) {
            console.error('Error al resaltar término:', error);
        }
    }

    // ========================================
    // UTILIDADES
    // ========================================
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function showItem(item) {
        if (item) {
            item.style.display = 'block';
            item.style.opacity = '1';
        }
    }

    function hideItem(item) {
        if (item) {
            item.style.display = 'none';
        }
    }

    function updateCategoryVisibility() {
        categories.forEach(category => {
            const categoryItems = category.querySelectorAll('.faq-item');
            const visibleItems = Array.from(categoryItems).filter(item => 
                item.style.display !== 'none'
            );
            
            category.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    }

    function toggleNoResultsMessage(visibleItems, searchTerm) {
        if (noResults) {
            if (visibleItems === 0 && searchTerm !== '') {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    }

    // ========================================
    // NAVEGACIÓN SUAVE
    // ========================================
    function initNavigationSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ========================================
    // FUNCIONES ADMINISTRATIVAS
    // ========================================
    window.cablebusAdmin = {
        resetMetrics() {
            if (confirm('¿Estás seguro de que deseas resetear todas las métricas?')) {
                localStorage.removeItem('cablebus_search_queries');
                localStorage.removeItem('cablebus_question_clicks');
                metricsSystem.searchQueries = {};
                metricsSystem.questionClicks = {};
                metricsSystem.updateTopQuestions();
                console.log('✅ Métricas reseteadas');
            }
        },
        
        exportMetrics() {
            const data = {
                searchQueries: metricsSystem.searchQueries,
                questionClicks: metricsSystem.questionClicks,
                exportDate: new Date().toISOString(),
                totalSearches: Object.values(metricsSystem.searchQueries).reduce((a, b) => a + b, 0),
                totalClicks: Object.values(metricsSystem.questionClicks).reduce((a, b) => a + b, 0)
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cablebus-metrics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('✅ Métricas exportadas');
        },
        
        showStats() {
            console.log('📊 Estadísticas FAQ Cablebús:');
            console.log('🔍 Top búsquedas:', metricsSystem.getTopQueries(10));
            console.log('📋 Total búsquedas:', Object.values(metricsSystem.searchQueries).reduce((a, b) => a + b, 0));
            console.log('👆 Total clicks:', Object.values(metricsSystem.questionClicks).reduce((a, b) => a + b, 0));
        }
    };

    // ========================================
    // MANEJO DE ERRORES
    // ========================================
    window.addEventListener('error', function(e) {
        console.error('❌ Error en FAQ Cablebús:', e.error);
    });

    // ========================================
    // DEBUG (solo en desarrollo)
    // ========================================
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🚠 FAQ Cablebús - Sistema iniciado');
        console.log(`📊 Elementos FAQ: ${faqItems.length}`);
        console.log(`📂 Categorías: ${categories.length}`);
        console.log(`🔍 Búsquedas registradas: ${Object.keys(metricsSystem.searchQueries).length}`);
        console.log(`👆 Clicks registrados: ${Object.keys(metricsSystem.questionClicks).length}`);
    }

    console.log('✅ Sistema FAQ Cablebús inicializado correctamente');
});