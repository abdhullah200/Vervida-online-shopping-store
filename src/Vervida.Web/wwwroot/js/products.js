// Products JavaScript functionality
(function() {
    'use strict';

    // Cart management
    let cart = JSON.parse(sessionStorage.getItem('vervida_cart') || '[]');
    let products = [];
    let currentModal = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeProducts();
        updateCartDisplay();
        setupModalEventHandlers();
    });

    function setupModalEventHandlers() {
        // Handle modal cleanup when hidden
        document.addEventListener('hidden.bs.modal', function (e) {
            if (e.target.id === 'productModal' || e.target.id === 'demoModal') {
                // Clean up modal from DOM
                setTimeout(() => {
                    if (e.target && e.target.parentNode) {
                        e.target.parentNode.removeChild(e.target);
                    }
                    currentModal = null;
                }, 300);
            }
        });

        // Prevent backdrop clicks from causing issues
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) {
                e.preventDefault();
                e.stopPropagation();
                closeCurrentModal();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && currentModal) {
                closeCurrentModal();
            }
        });
    }

    function closeCurrentModal() {
        if (currentModal) {
            try {
                const modalInstance = bootstrap.Modal.getInstance(currentModal);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    // Fallback: manually hide modal
                    currentModal.classList.remove('show');
                    currentModal.style.display = 'none';
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }
            } catch (error) {
                console.warn('Error closing modal:', error);
                // Force cleanup
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                if (currentModal && currentModal.parentNode) {
                    currentModal.parentNode.removeChild(currentModal);
                }
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                currentModal = null;
            }
        }
    }

    function initializeProducts() {
        // Setup search functionality
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            let searchTimeout;
            searchBox.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    performSearch();
                }, 300);
            });
        }

        // Setup category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                performSearch();
            });
        }

        // Setup product card clicks
        setupProductCards();
        
        // Load products data (fallback if not loaded)
        loadProducts();
    }

    function setupProductCards() {
        const productCards = document.querySelectorAll('.card[data-id]');
        productCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking on button
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }
                
                const productId = parseInt(this.dataset.id);
                showProductDetails(productId);
            });
        });
    }

    function loadProducts() {
        // This would typically load from API, but products are already rendered server-side
        // We'll extract product data from the DOM if needed
        const productCards = document.querySelectorAll('.card[data-id]');
        products = Array.from(productCards).map(card => {
            return {
                id: parseInt(card.dataset.id),
                title: card.querySelector('.card-title')?.textContent || '',
                price: parseFloat(card.querySelector('.card-text strong')?.textContent?.replace('$', '') || '0'),
                image: card.querySelector('.card-img-top')?.src || '',
                description: card.querySelector('.card-text:not(:has(strong))')?.textContent || '',
                category: card.querySelector('.badge')?.textContent || ''
            };
        });
    }

    function performSearch() {
        const searchTerm = document.getElementById('searchBox')?.value || '';
        const category = document.getElementById('categoryFilter')?.value || '';
        
        // Build URL with search parameters
        const url = new URL(window.location);
        
        if (searchTerm) {
            url.searchParams.set('search', searchTerm);
        } else {
            url.searchParams.delete('search');
        }
        
        if (category) {
            url.searchParams.set('category', category);
        } else {
            url.searchParams.delete('category');
        }
        
        // Remove page parameter when searching
        url.searchParams.delete('page');
        
        // Navigate to new URL
        window.location.href = url.toString();
    }

    async function showProductDetails(productId) {
        try {
            showLoadingModal();
            
            // Fetch product details
            const response = await fetch(`/Products/Details/${productId}`);
            if (!response.ok) throw new Error('Failed to load product');
            
            const product = await response.json();
            displayProductModal(product);
            
        } catch (error) {
            console.error('Error loading product details:', error);
            showErrorModal('Failed to load product details. Please try again.');
        }
    }

    function showLoadingModal() {
        cleanupExistingModals();

        const modal = createModal('productModal', 'Loading...', `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p style="color: #ffffff !important;">Loading product details...</p>
            </div>
        `);
        
        document.body.appendChild(modal);
        currentModal = modal;
        
        try {
            const modalInstance = new bootstrap.Modal(modal, {
                backdrop: 'static',
                keyboard: true
            });
            modalInstance.show();
        } catch (error) {
            console.warn('Bootstrap Modal error:', error);
            // Fallback modal display
            modal.classList.add('show');
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }

    function displayProductModal(product) {
        cleanupExistingModals();

        const stars = generateStarRating(product.rating?.rate || 0);
        
        const modalContent = `
            <div class="row g-4">
                <div class="col-md-6">
                    <img src="${product.image}" class="img-fluid rounded-3" alt="${product.title}" 
                         style="max-height: 400px; object-fit: contain; width: 100%; background: rgba(255,255,255,0.05);">
                </div>
                <div class="col-md-6">
                    <h3 class="neon mb-3" style="color: #ffffff !important;">${product.title}</h3>
                    <div class="mb-3">
                        <span class="badge bg-primary me-2">${product.category}</span>
                    </div>
                    <div class="mb-3">
                        <div class="d-flex align-items-center">
                            <div class="stars me-2">${stars}</div>
                            <small style="color: #ffffff !important;">(${product.rating?.count || 0} reviews)</small>
                        </div>
                    </div>
                    <p class="lead mb-4" style="color: #ffffff !important;">${product.description}</p>
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <h4 class="text-primary mb-0 neon">$${product.price.toFixed(2)}</h4>
                        <div class="input-group" style="max-width: 120px;">
                            <button class="btn btn-outline-secondary btn-sm" type="button" onclick="changeQuantity(-1)">-</button>
                            <input type="number" id="quantity" class="form-control form-control-sm text-center" value="1" min="1">
                            <button class="btn btn-outline-secondary btn-sm" type="button" onclick="changeQuantity(1)">+</button>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-lg w-100" onclick="addToCartFromModal(${product.id})">
                        <i class="bi bi-cart-plus me-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        `;

        const modal = createModal('productModal', product.title, modalContent, 'modal-lg');
        document.body.appendChild(modal);
        currentModal = modal;
        
        try {
            const modalInstance = new bootstrap.Modal(modal, {
                backdrop: true,
                keyboard: true
            });
            modalInstance.show();
        } catch (error) {
            console.warn('Bootstrap Modal error:', error);
            // Fallback modal display
            modal.classList.add('show');
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
        
        // Make quantity change function globally available
        window.changeQuantity = function(change) {
            const quantityInput = document.getElementById('quantity');
            const currentValue = parseInt(quantityInput.value) || 1;
            const newValue = Math.max(1, currentValue + change);
            quantityInput.value = newValue;
        };
        
        // Make add to cart function globally available
        window.addToCartFromModal = function(productId) {
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            addToCart(productId, quantity);
            closeCurrentModal();
        };
    }

    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="bi bi-star-fill text-warning"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="bi bi-star-half text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="bi bi-star text-muted"></i>';
        }
        
        return stars;
    }

    function showErrorModal(message) {
        cleanupExistingModals();

        const modal = createModal('productModal', 'Error', `
            <div class="text-center py-4">
                <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
                <p class="lead" style="color: #ffffff !important;">${message}</p>
                <button type="button" class="btn btn-secondary" onclick="closeCurrentModal()">Close</button>
            </div>
        `);
        
        document.body.appendChild(modal);
        currentModal = modal;
        
        try {
            const modalInstance = new bootstrap.Modal(modal, {
                backdrop: true,
                keyboard: true
            });
            modalInstance.show();
        } catch (error) {
            console.warn('Bootstrap Modal error:', error);
            modal.classList.add('show');
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }

    function cleanupExistingModals() {
        // Remove any existing modals
        const existingModals = document.querySelectorAll('.modal');
        existingModals.forEach(modal => {
            try {
                const instance = bootstrap.Modal.getInstance(modal);
                if (instance) {
                    instance.dispose();
                }
            } catch (e) {
                // Ignore errors during cleanup
            }
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });

        // Remove any orphaned backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Reset body styles
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        currentModal = null;
    }

    function createModal(id, title, content, size = '') {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'modal fade';
        modalDiv.id = id;
        modalDiv.tabIndex = -1;
        modalDiv.setAttribute('aria-labelledby', id + 'Label');
        modalDiv.setAttribute('aria-hidden', 'true');
        
        modalDiv.innerHTML = `
            <div class="modal-dialog ${size} modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title neon" id="${id}Label" style="color: #ffffff !important;">
                            <i class="bi bi-box-seam me-2"></i>${title}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" aria-label="Close" onclick="closeCurrentModal()"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        return modalDiv;
    }

    // Make closeCurrentModal globally available
    window.closeCurrentModal = closeCurrentModal;

    // Cart functionality
    window.addToCart = function(productId, quantity = 1) {
        // Find product details
        let product = products.find(p => p.id === productId);
        
        // If not found in products array, try to get from DOM
        if (!product) {
            const productCard = document.querySelector(`[data-id="${productId}"]`);
            if (productCard) {
                product = {
                    id: productId,
                    title: productCard.querySelector('.card-title')?.textContent || `Product ${productId}`,
                    price: parseFloat(productCard.querySelector('.card-text strong')?.textContent?.replace('$', '') || '0'),
                    image: productCard.querySelector('.card-img-top')?.src || '',
                    category: productCard.querySelector('.badge')?.textContent || ''
                };
            }
        }
        
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: productId,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        // Save to session storage
        sessionStorage.setItem('vervida_cart', JSON.stringify(cart));
        
        // Update cart display
        updateCartDisplay();
        
        // Show notification
        showNotification(`Added ${product.title} to cart!`, 'success');
    };

    function updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartBody = document.getElementById('cartBody');
        
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
        
        // Update cart body
        if (cartBody) {
            if (cart.length === 0) {
                cartBody.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-cart display-1 text-muted mb-3"></i>
                        <h5 style="color: #ffffff !important;">Your cart is empty</h5>
                        <p style="color: #ffffff !important;">Add some products to get started!</p>
                    </div>
                `;
            } else {
                const cartItems = cart.map(item => `
                    <div class="cart-item mb-3 p-3" style="background: rgba(255,255,255,0.05); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="row align-items-center">
                            <div class="col-3">
                                <img src="${item.image}" class="img-fluid rounded" alt="${item.title}" style="max-height: 60px; object-fit: contain;">
                            </div>
                            <div class="col-6">
                                <h6 class="mb-1 text-white">${item.title}</h6>
                                <div class="d-flex align-items-center">
                                    <button class="btn btn-sm btn-outline-light me-2" onclick="updateCartQuantity(${item.id}, -1)">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <span class="mx-2 text-white">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-light ms-2" onclick="updateCartQuantity(${item.id}, 1)">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-3 text-end">
                                <div class="text-primary neon fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart(${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                cartBody.innerHTML = `
                    <div class="cart-items mb-4">
                        ${cartItems}
                    </div>
                    <div class="cart-total p-3" style="background: rgba(0,245,255,0.1); border-radius: 10px; border: 1px solid rgba(0,245,255,0.3);">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0 text-white">Total:</h5>
                            <h4 class="mb-0 text-primary neon">${total.toFixed(2)}</h4>
                        </div>
                    </div>
                `;
            }
        }
    }

    window.updateCartQuantity = function(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            sessionStorage.setItem('vervida_cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    };

    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        sessionStorage.setItem('vervida_cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification('Item removed from cart', 'info');
    };

    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.toast-notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `toast-notification alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} position-fixed`;
        notification.style.cssText = `
            top: 100px; 
            right: 20px; 
            z-index: 2000; 
            background: ${type === 'success' ? 'rgba(25, 135, 84, 0.95)' : type === 'error' ? 'rgba(220, 53, 69, 0.95)' : 'rgba(13, 202, 240, 0.95)'};
            backdrop-filter: blur(20px);
            border: 1px solid ${type === 'success' ? 'rgba(25, 135, 84, 0.5)' : type === 'error' ? 'rgba(220, 53, 69, 0.5)' : 'rgba(13, 202, 240, 0.5)'};
            color: #fff;
            font-weight: 600;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.5s ease;
            min-width: 300px;
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close btn-close-white ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease forwards';
                setTimeout(() => notification.remove(), 500);
            }
        }, 3000);
    }

    // Add CSS for notifications if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .toast-notification {
                animation: slideInRight 0.5s ease;
            }
            
            .cart-item {
                transition: all 0.3s ease;
            }
            
            .cart-item:hover {
                background: rgba(255,255,255,0.1) !important;
                transform: translateX(5px);
            }
        `;
        document.head.appendChild(style);
    }

})();