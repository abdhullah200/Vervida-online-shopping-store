(() => {
    const apiBase = '/Products';
    let cart = JSON.parse(localStorage.getItem('vervida-cart') || '[]');

    const refreshCartCount = () => {
        document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
    };
    refreshCartCount();

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

    // Product click → modal
    document.querySelectorAll('.card[data-id]').forEach(card => {
        card.addEventListener('click', async () => {
            const id = card.dataset.id;
            const res = await fetch(`${apiBase}/Details/${id}`);
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

    window.addToCart = id => {
        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty++; else cart.push({ id, qty: 1 });
        localStorage.setItem('vervida-cart', JSON.stringify(cart));
        refreshCartCount();
        renderCart();
    };

    function renderCart() {
        const body = document.getElementById('cartBody');
        if (!cart.length) { body.innerHTML = '<p class="text-center">Empty.</p>'; return; }
        let total = 0;
        body.innerHTML = cart.map(item => {
            total += item.qty * 10; // price placeholder
            return `<div class="d-flex justify-content-between mb-2">
                      <span>Product ${item.id} × ${item.qty}</span>
                      <span>$${(item.qty * 10).toFixed(2)}</span>
                    </div>`;
        }).join('') + `<hr><strong>Total: $${total.toFixed(2)}</strong>`;
    }

    document.getElementById('cartSidebar').addEventListener('show.bs.offcanvas', renderCart);

    function debounce(fn, d) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), d); };
    }
})();