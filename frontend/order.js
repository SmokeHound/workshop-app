import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeToggle');
  const itemList = document.getElementById('itemList');
  showSpinner('spinnerContainer');

  fetch('/api/items')
    .then(res => res.json())
    .then(items => {
      hideSpinner('spinnerContainer');

      if (!Array.isArray(items) || items.length === 0) {
        showToast('No items available.', 'info');
        return;
      }

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-md-4';

        card.innerHTML = `
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">Available: ${item.quantity}</p>
              <input type="number" min="1" max="${item.quantity}" value="1" class="form-control mb-2" id="qty-${item.id}" />
              <button class="btn btn-success w-100" data-id="${item.id}" data-name="${item.name}">Add to Order</button>
            </div>
          </div>
        `;

        itemList.appendChild(card);
      });

      itemList.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
          const id = e.target.dataset.id;
          const name = e.target.dataset.name;
          const qtyInput = document.getElementById(`qty-${id}`);
          const quantity = parseInt(qtyInput.value, 10);

          if (!quantity || quantity < 1) {
            showToast('Invalid quantity.', 'error');
            return;
          }

          showSpinner('spinnerContainer');

          try {
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ item: name, quantity }),
            });

            hideSpinner('spinnerContainer');

            if (res.ok) {
              showToast(`Ordered ${quantity} × ${name}`, 'success');
              qtyInput.value = 1;
            } else {
              showToast('Order failed.', 'error');
            }
          } catch {
            hideSpinner('spinnerContainer');
            showToast('Network error.', 'error');
          }
        }
      });
    })
    .catch(() => {
      hideSpinner('spinnerContainer');
      showToast('Failed to load items.', 'error');
    });
});