(() => {
  // use local API controller for JSON product data
  const apiBase = '/api/LocalProductsApi';
  let cart = JSON.parse(localStorage.getItem('vervida-cart') || '[]');

  // normalize ids to numbers and hydrate missing price/title from local API
  cart = cart.map(i => ({ ...i, id: Number(i.id) }));

  const refreshCartCount = () => {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = String(cart.reduce((s, i) => s + (Number(i.qty) || 0), 0));
  };

  async function hydrateCart() {
    for (const item of cart) {
      if (item.price == null || item.title == null) {
        try {
          const res = await fetch(`${apiBase}/products/${item.id}`);
          if (!res.ok) continue;
          const p = await res.json();
          item.price = Number(p.price ?? p.Price ?? 0);
          item.title = p.title ?? p.Title ?? item.title ?? ('Product ' + item.id);
        } catch (e) {
          // ignore
        }
      }
    }
    localStorage.setItem('vervida-cart', JSON.stringify(cart));
    refreshCartCount();
  }

  hydrateCart();

    // Category & search navigation
    const go = () => {
        const c = document.getElementById('categoryFilter').value;
        const s = document.getElementById('searchBox').value;
        const url = new URL(location);
        if (c) url.searchParams.set('category', c); else url.searchParams.delete('category');
        if (s) url.searchParams.set('search', s); else url.searchParams.delete('search');
        url.searchParams.delete('page');
        location = url;
    };
    document.getElementById('categoryFilter').addEventListener('change', go);
    document.getElementById('searchBox').addEventListener('input', debounce(go, 400));

  // Product click → modal (fetch JSON from local API)
  document.querySelectorAll('.card[data-id]').forEach(card => {
    card.addEventListener('click', async (e) => {
      // ignore clicks that came from buttons inside the card
      if (e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) return;
      const id = card.dataset.id;
      const res = await fetch(`${apiBase}/products/${id}`);
      const p = await res.json();
      openModal(p);
    });
  });

    function openModal(p) {
        const modal = new bootstrap.Modal(document.createElement('div'));
        modal._element.className = 'modal fade';
        modal._element.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light">
              <div class="modal-header">
                <h5 class="modal-title">${p.title}</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body text-center">
                <img src="${p.image}" class="img-fluid mb-3" style="max-height: 200px;">
                <p>${p.description}</p>
                <p><strong>$${p.price}</strong></p>
                <div>${'★'.repeat(Math.round(p.rating.rate))} ${p.rating.rate} (${p.rating.count})</div>
                <button class="btn btn-outline-primary mt-3" onclick="addToCart(${p.id})">Add to Cart</button>
              </div>
            </div>
          </div>`;
        document.body.append(modal._element);
        modal.show();
        modal._element.addEventListener('hidden.bs.modal', () => modal._element.remove());
    }

  window.addToCart = async id => {
    // fetch product details to get price/title
    try {
      const res = await fetch(`${apiBase}/products/${id}`);
      const p = await res.json();
      const existing = cart.find(i => i.id === id);
      if (existing) existing.qty++; else cart.push({ id, qty: 1, price: p.price, title: p.title });
      localStorage.setItem('vervida-cart', JSON.stringify(cart));
      refreshCartCount();
      renderCart();
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  function renderCart() {
    const body = document.getElementById('cartBody');
    if (!cart.length) { body.innerHTML = '<p class="text-center">Empty.</p>'; return; }
    let total = 0;
    body.innerHTML = cart.map(item => {
      const price = Number(item.price ?? 0);
      total += item.qty * price;
      return `<div class="d-flex justify-content-between mb-2">
            <span>${item.title ?? ('Product ' + item.id)} × ${item.qty}</span>
            <span>$${(item.qty * price).toFixed(2)}</span>
          </div>`;
    }).join('') + `<hr><strong>Total: $${total.toFixed(2)}</strong>`;
  }

    document.getElementById('cartSidebar').addEventListener('show.bs.offcanvas', renderCart);

    function debounce(fn, d) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), d); };
    }
})();