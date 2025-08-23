(() => {
  // Enhanced API configuration
  const apiBase = '/api/LocalProductsApi';
  let cart = JSON.parse(localStorage.getItem('vervida-cart') || '[]');
  
  // Enhanced cart management
  cart = cart.map(i => ({ ...i, id: Number(i.id) }));

  // DOM Elements
  const elements = {
    cartCount: () => document.getElementById('cart-count'),
    categoryFilter: () => document.getElementById('categoryFilter'),
    searchBox: () => document.getElementById('searchBox'),
    cartBody: () => document.getElementById('cartBody'),
    cartSidebar: () => document.getElementById('cartSidebar')
  };

  // Enhanced cart count with animation
  const refreshCartCount = () => {
    const el = elements.cartCount();
    if (!el) return;
    
    const newCount = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0);
    const currentCount = parseInt(el.textContent) || 0;
    
    if (newCount !== currentCount) {
      // Animate count change
      el.style.transform = 'scale(1.5)';
      el.style.background = 'var(--clr-primary)';
      
      setTimeout(() => {
        el.textContent = String(newCount);
        el.style.transform = 'scale(1)';
        el.style.background = '';
      }, 200);
    }
  };

  // Enhanced cart hydration with loading states
  async function hydrateCart() {
    showNotification('Loading cart...', 'info');
    
    for (const item of cart) {
      if (item.price == null || item.title == null) {
        try {
          const res = await fetch(`${apiBase}/products/${item.id}`);
          if (!res.ok) continue;
          const p = await res.json();
          item.price = Number(p.price ?? p.Price ?? 0);
          item.title = p.title ?? p.Title ?? item.title ?? ('Product ' + item.id);
          item.image = p.image ?? p.Image ?? item.image;
        } catch (e) {
          console.warn('Failed to hydrate cart item:', item.id, e);
        }
      }
    }
    
    localStorage.setItem('vervida-cart', JSON.stringify(cart));
    refreshCartCount();
  }

  // Initialize cart
  hydrateCart();

  // Enhanced navigation with loading states
  const go = () => {
    const categoryEl = elements.categoryFilter();
    const searchEl = elements.searchBox();
    
    if (!categoryEl || !searchEl) return;
    
    // Show loading indicator
    const loader = createLoader();
    document.body.appendChild(loader);
    
    const c = categoryEl.value;
    const s = searchEl.value;
    const url = new URL(location);
    
    if (c) url.searchParams.set('category', c); 
    else url.searchParams.delete('category');
    
    if (s) url.searchParams.set('search', s); 
    else url.searchParams.delete('search');
    
    url.searchParams.delete('page');
    
    // Smooth transition
    setTimeout(() => {
      location = url;
    }, 300);
  };

  // Enhanced event listeners with better UX
  const categoryEl = elements.categoryFilter();
  const searchEl = elements.searchBox();
  
  if (categoryEl) {
    categoryEl.addEventListener('change', () => {
      showNotification('Filtering products...', 'info');
      go();
    });
  }
  
  if (searchEl) {
    searchEl.addEventListener('input', debounce((e) => {
      if (e.target.value.length >= 2 || e.target.value.length === 0) {
        showNotification('Searching...', 'info');
        go();
      }
    }, 600));
    
    // Enhanced search with keyboard shortcuts
    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        go();
      }
      if (e.key === 'Escape') {
        e.target.value = '';
        go();
      }
    });
  }

  // Enhanced product card interactions
  document.querySelectorAll('.card[data-id]').forEach(card => {
    // Add hover sound effect (optional)
    card.addEventListener('mouseenter', () => {
      card.style.transform = card.style.transform + ' scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = card.style.transform.replace(' scale(1.02)', '');
    });

    // Enhanced click handling with animations
    card.addEventListener('click', async (e) => {
      // Ignore clicks on buttons
      if (e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) return;
      
      const id = card.dataset.id;
      
      // Add loading state to card
      const originalContent = card.innerHTML;
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `;
      loadingOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        backdrop-filter: blur(5px);
        z-index: 10;
      `;
      
      card.style.position = 'relative';
      card.appendChild(loadingOverlay);
      
      try {
        const res = await fetch(`${apiBase}/products/${id}`);
        const p = await res.json();
        
        // Remove loading overlay
        loadingOverlay.remove();
        
        // Open enhanced modal
        openEnhancedModal(p);
        
      } catch (error) {
        loadingOverlay.remove();
        showNotification('Failed to load product details', 'error');
      }
    });
  });

  // Enhanced modal with better UX
  function openEnhancedModal(p) {
    const modalId = 'productModal_' + p.id;
    
    // Remove existing modal if any
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header border-0">
            <h5 class="modal-title neon d-flex align-items-center">
              <i class="bi bi-box-seam me-2"></i>${p.title}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 text-center">
                <div class="product-image-container mb-3">
                  <img src="${p.image}" class="img-fluid" style="max-height: 300px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);" alt="${p.title}">
                </div>
              </div>
              <div class="col-md-6">
                <div class="product-details">
                  <div class="mb-3">
                    <span class="badge bg-primary mb-2">${p.category}</span>
                    <p class="text-muted">${p.description}</p>
                  </div>
                  
                  <div class="price-section mb-3">
                    <div class="h3 neon mb-1">$${p.price}</div>
                    <div class="rating-section">
                      <div class="stars mb-1">
                        ${'★'.repeat(Math.round(p.rating.rate))}${'☆'.repeat(5 - Math.round(p.rating.rate))}
                        <span class="text-muted ms-2">${p.rating.rate}/5</span>
                      </div>
                      <small class="text-muted">${p.rating.count} reviews</small>
                    </div>
                  </div>
                  
                  <div class="quantity-section mb-4">
                    <label class="form-label">Quantity:</label>
                    <div class="input-group" style="max-width: 150px;">
                      <button class="btn btn-outline-light" type="button" onclick="changeQuantity(-1)">-</button>
                      <input type="number" class="form-control text-center" id="quantity_${p.id}" value="1" min="1" max="10">
                      <button class="btn btn-outline-light" type="button" onclick="changeQuantity(1)">+</button>
                    </div>
                  </div>
                  
                  <div class="action-buttons">
                    <button class="btn btn-primary btn-lg w-100 mb-2" onclick="addToCartFromModal(${p.id})">
                      <i class="bi bi-cart-plus me-2"></i>Add to Cart
                    </button>
                    <button class="btn btn-outline-light w-100" onclick="addToWishlist(${p.id})">
                      <i class="bi bi-heart me-2"></i>Add to Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Bootstrap modal with enhanced options
    const bsModal = new bootstrap.Modal(modal, {
      backdrop: 'static',
      keyboard: true
    });
    
    // Add entrance animation
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.8)';
    
    bsModal.show();
    
    // Animate entrance
    setTimeout(() => {
      modal.style.transition = 'all 0.3s ease';
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 100);
    
    // Clean up on hide
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
    
    // Add quantity change functionality
    window.changeQuantity = (delta) => {
      const input = document.getElementById(`quantity_${p.id}`);
      if (!input) return;
      
      const current = parseInt(input.value) || 1;
      const newValue = Math.max(1, Math.min(10, current + delta));
      input.value = newValue;
      
      // Add visual feedback
      input.style.transform = 'scale(1.1)';
      setTimeout(() => {
        input.style.transform = 'scale(1)';
      }, 150);
    };
  }

  // Enhanced add to cart with animations and feedback
  window.addToCart = async (id, quantity = 1) => {
    try {
      // Show loading state
      const button = event?.target;
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Adding...';
        button.disabled = true;
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
        }, 1500);
      }
      
      const res = await fetch(`${apiBase}/products/${id}`);
      const p = await res.json();
      
      const existing = cart.find(i => i.id === id);
      if (existing) {
        existing.qty += quantity;
      } else {
        cart.push({ 
          id, 
          qty: quantity, 
          price: p.price, 
          title: p.title,
          image: p.image 
        });
      }
      
      localStorage.setItem('vervida-cart', JSON.stringify(cart));
      refreshCartCount();
      renderCart();
      
      // Enhanced success feedback
      showNotification(`${p.title} added to cart!`, 'success');
      
      // Animate cart icon
      const cartIcon = document.querySelector('[data-bs-target="#cartSidebar"]');
      if (cartIcon) {
        cartIcon.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
          cartIcon.style.animation = '';
        }, 600);
      }
      
    } catch (err) {
      console.error('Failed to add to cart', err);
      showNotification('Failed to add item to cart', 'error');
    }
  };

  // Add to cart from modal with quantity
  window.addToCartFromModal = (id) => {
    const quantityInput = document.getElementById(`quantity_${id}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    addToCart(id, quantity);
  };

  // Wishlist functionality
  window.addToWishlist = (id) => {
    let wishlist = JSON.parse(localStorage.getItem('vervida-wishlist') || '[]');
    if (!wishlist.includes(id)) {
      wishlist.push(id);
      localStorage.setItem('vervida-wishlist', JSON.stringify(wishlist));
      showNotification('Added to wishlist!', 'success');
    } else {
      showNotification('Already in wishlist!', 'info');
    }
  };

  // Enhanced cart rendering with better UX
  function renderCart() {
    const body = elements.cartBody();
    if (!body) return;
    
    if (!cart.length) { 
      body.innerHTML = `
        <div class="empty-cart text-center py-5">
          <i class="bi bi-cart-x display-1 text-muted mb-3"></i>
          <h5>Your cart is empty</h5>
          <p class="text-muted">Add some products to get started!</p>
          <a href="/Products" class="btn btn-primary">
            <i class="bi bi-shop me-2"></i>Browse Products
          </a>
        </div>
      `;
      return; 
    }
    
    let total = 0;
    const cartItems = cart.map((item, index) => {
      const price = Number(item.price ?? 0);
      const subtotal = item.qty * price;
      total += subtotal;
      
      return `
        <div class="cart-item mb-3 p-3" style="background: rgba(255,255,255,0.05); border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
          <div class="row align-items-center">
            <div class="col-3">
              <img src="${item.image || '/images/placeholder.jpg'}" class="img-fluid rounded" style="max-height: 60px; object-fit: cover;">
            </div>
            <div class="col-6">
              <h6 class="mb-1">${item.title ?? ('Product ' + item.id)}</h6>
              <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-light me-2" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <span class="mx-2">${item.qty}</span>
                <button class="btn btn-sm btn-outline-light ms-2" onclick="updateCartQuantity(${item.id}, 1)">+</button>
              </div>
            </div>
            <div class="col-3 text-end">
              <div class="fw-bold">$${subtotal.toFixed(2)}</div>
              <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart(${item.id})" title="Remove">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    body.innerHTML = `
      <div class="cart-items">
        ${cartItems}
      </div>
      <div class="cart-summary mt-3 pt-3" style="border-top: 1px solid rgba(255,255,255,0.2);">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="neon">Total: $${total.toFixed(2)}</h5>
          <button class="btn btn-sm btn-outline-light" onclick="clearCart()">
            <i class="bi bi-trash"></i> Clear All
          </button>
        </div>
      </div>
    `;
  }

  // Cart quantity management
  window.updateCartQuantity = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    item.qty = Math.max(1, item.qty + delta);
    localStorage.setItem('vervida-cart', JSON.stringify(cart));
    refreshCartCount();
    renderCart();
    
    showNotification('Cart updated', 'info');
  };

  // Remove from cart
  window.removeFromCart = (id) => {
    const itemIndex = cart.findIndex(i => i.id === id);
    if (itemIndex > -1) {
      const item = cart[itemIndex];
      cart.splice(itemIndex, 1);
      localStorage.setItem('vervida-cart', JSON.stringify(cart));
      refreshCartCount();
      renderCart();
      
      showNotification(`${item.title} removed from cart`, 'success');
    }
  };

  // Clear entire cart
  window.clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      cart = [];
      localStorage.setItem('vervida-cart', JSON.stringify(cart));
      refreshCartCount();
      renderCart();
      
      showNotification('Cart cleared', 'info');
    }
  };

  // Enhanced cart sidebar event handling
  const cartSidebar = elements.cartSidebar();
  if (cartSidebar) {
    cartSidebar.addEventListener('show.bs.offcanvas', renderCart);
    
    // Add keyboard navigation
    cartSidebar.addEventListener('shown.bs.offcanvas', () => {
      const firstButton = cartSidebar.querySelector('button');
      if (firstButton) firstButton.focus();
    });
  }

  // Utility functions
  function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
    `;
    loader.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
        <div class="h5 text-light">Loading...</div>
      </div>
    `;
    return loader;
  }

  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
    notification.setAttribute('role', 'alert');
    
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 2000;
      min-width: 300px;
      backdrop-filter: blur(20px);
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0, 245, 255, 0.3);
    `;
    
    notification.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Initialize Bootstrap toast
    const toast = new bootstrap.Toast(notification, {
      autohide: true,
      delay: 3000
    });
    
    toast.show();
    
    // Clean up after hide
    notification.addEventListener('hidden.bs.toast', () => {
      notification.remove();
    });
  }

  // Enhanced keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchBox = elements.searchBox();
      if (searchBox) {
        searchBox.focus();
        searchBox.select();
      }
    }
    
    // Ctrl/Cmd + Shift + C for cart
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      const cartButton = document.querySelector('[data-bs-target="#cartSidebar"]');
      if (cartButton) cartButton.click();
    }
  });

  // Performance optimization: Lazy load images
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% { transform: scale(1); }
      40%, 43% { transform: scale(1.2); }
      70% { transform: scale(1.1); }
    }
    
    .cart-item {
      transition: all 0.3s ease;
    }
    
    .cart-item:hover {
      background: rgba(0, 245, 255, 0.1) !important;
      border-color: rgba(0, 245, 255, 0.3) !important;
    }
    
    .toast {
      animation: slideInRight 0.5s ease;
    }
    
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

})();