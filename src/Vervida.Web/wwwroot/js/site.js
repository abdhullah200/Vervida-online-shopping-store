// Main site functionality
(function() {
    'use strict';

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeNavigation();
        initializeScrollEffects();
        initializeThemeSystem();
        initializeAnimations();
    });

    function initializeNavigation() {
        // Mobile menu toggle
        const navToggler = document.querySelector('.navbar-toggler');
        const navCollapse = document.querySelector('.navbar-collapse');
        
        if (navToggler && navCollapse) {
            navToggler.addEventListener('click', function() {
                navCollapse.classList.toggle('show');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navCollapse && navCollapse.classList.contains('show') && 
                !navCollapse.contains(e.target) && !navToggler.contains(e.target)) {
                navCollapse.classList.remove('show');
            }
        });

        // Smooth scroll for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    function initializeScrollEffects() {
        let ticking = false;

        function updateOnScroll() {
            const scrollY = window.pageYOffset;
            const navbar = document.querySelector('.navbar');
            const backToTop = document.getElementById('backToTop');

            // Navbar background effect
            if (navbar) {
                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            // Back to top button
            if (backToTop) {
                if (scrollY > 300) {
                    backToTop.style.display = 'block';
                    backToTop.style.opacity = '1';
                } else {
                    backToTop.style.opacity = '0';
                    setTimeout(() => {
                        if (window.pageYOffset <= 300) {
                            backToTop.style.display = 'none';
                        }
                    }, 300);
                }
            }

            // Parallax effects
            const parallaxElements = document.querySelectorAll('.parallax');
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    function initializeThemeSystem() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const themes = [
            { 
                name: 'Cyan Dream', 
                primary: '#00f5ff', 
                secondary: '#7b2cbf',
                accent: '#4cc9f0'
            },
            { 
                name: 'Sunset Blaze', 
                primary: '#ff6b35', 
                secondary: '#f72585',
                accent: '#ffd60a'
            },
            { 
                name: 'Ocean Blue', 
                primary: '#4cc9f0', 
                secondary: '#7209b7',
                accent: '#2ec4b6'
            },
            { 
                name: 'Forest Green', 
                primary: '#2ec4b6', 
                secondary: '#e71d36',
                accent: '#06ffa5'
            },
            { 
                name: 'Golden Hour', 
                primary: '#ffbe0b', 
                secondary: '#fb8500',
                accent: '#ff006e'
            }
        ];

        let currentThemeIndex = 0;

        themeToggle.addEventListener('click', function() {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const theme = themes[currentThemeIndex];
            
            applyTheme(theme);
            showThemeNotification(theme.name);
        });

        function applyTheme(theme) {
            const root = document.documentElement;
            
            // Apply CSS custom properties
            root.style.setProperty('--clr-primary', theme.primary);
            root.style.setProperty('--clr-secondary', theme.secondary);
            root.style.setProperty('--clr-accent', theme.accent);
            root.style.setProperty('--gradient-primary', 
                `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`);
            
            // Add theme transition effect
            document.body.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 500);

            // Store theme preference
            localStorage.setItem('vervida_theme', JSON.stringify({
                index: currentThemeIndex,
                theme: theme
            }));
        }

        function showThemeNotification(themeName) {
            const notification = document.createElement('div');
            notification.className = 'theme-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2000;
                background: var(--gradient-primary);
                color: #000;
                padding: 15px 30px;
                border-radius: 30px;
                font-weight: 600;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: themeNotificationSlide 3s ease forwards;
                backdrop-filter: blur(20px);
            `;
            
            notification.innerHTML = `
                <i class="bi bi-palette me-2"></i>
                Theme: ${themeName}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Load saved theme on page load
        const savedTheme = localStorage.getItem('vervida_theme');
        if (savedTheme) {
            try {
                const { index, theme } = JSON.parse(savedTheme);
                currentThemeIndex = index;
                applyTheme(theme);
            } catch (e) {
                console.warn('Failed to load saved theme');
            }
        }
    }

    function initializeAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Stagger animations for multiple elements
                    const siblings = Array.from(entry.target.parentElement?.children || []);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            });
        }, observerOptions);

        // Observe elements for animations
        const animatableElements = document.querySelectorAll(
            '.card, .feature-card, .stat-card, h1, h2, h3, .lead, .display-1, .display-2, .display-3, .display-4, .display-5, .display-6'
        );
        
        animatableElements.forEach(el => {
            el.classList.add('animate-target');
            observer.observe(el);
        });

        // Mouse following effect for hero sections
        const heroSections = document.querySelectorAll('.hero-section');
        heroSections.forEach(hero => {
            hero.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                this.style.background = `
                    radial-gradient(circle at ${x}% ${y}%, 
                    rgba(0, 245, 255, 0.1) 0%, 
                    rgba(123, 44, 191, 0.05) 50%, 
                    transparent 100%),
                    linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)
                `;
            });
        });
    }

    // Global utility functions
    window.ViervidaUtils = {
        showToast: function(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast-message toast-${type}`;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 2000;
                background: ${type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0dcaf0'};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                animation: slideInRight 0.3s ease;
                max-width: 350px;
            `;
            
            toast.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'} me-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },

        formatPrice: function(price) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(price);
        },

        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Add required CSS for animations
    if (!document.querySelector('#vervida-animations')) {
        const style = document.createElement('style');
        style.id = 'vervida-animations';
        style.textContent = `
            @keyframes themeNotificationSlide {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                15% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                85% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }

            .animate-target {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }

            .animate-target.animate-in {
                opacity: 1;
                transform: translateY(0);
            }

            .navbar {
                transition: all 0.3s ease;
            }

            .navbar.scrolled {
                background: rgba(0, 0, 0, 0.98) !important;
                backdrop-filter: blur(20px);
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
            }

            #backToTop {
                transition: all 0.3s ease;
                opacity: 0;
            }

            #backToTop:hover {
                transform: translateY(-3px) scale(1.05);
            }

            .card-3d .card,
            .card.card-3d {
                will-change: transform;
            }

            @media (prefers-reduced-motion: reduce) {
                .animate-target,
                .card-3d .card,
                .card.card-3d,
                #backToTop {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Handle page visibility changes for better performance
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pause animations when tab is not visible
            document.body.classList.add('paused');
        } else {
            // Resume animations when tab becomes visible
            document.body.classList.remove('paused');
        }
    });

})();