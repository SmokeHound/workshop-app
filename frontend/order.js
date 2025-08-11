import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';

import { Modal } from 'bootstrap';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeToggle');

  const categoryTabs = document.getElementById('categoryTabs');
  const tabContent = document.getElementById('tabContent');
  const cartList = document.getElementById('cartList');
  const submitBtn = document.getElementById('submitOrder');
  const confirmList = document.getElementById('confirmList');
  const confirmSubmit = document.getElementById('confirmSubmit');
  const cart = [];

  showSpinner('spinnerContainer');

  fetch('/api/consumables')
    .then(res => res.json())
    .then(data => {
      hideSpinner('spinnerContainer');

      const categories = Object.keys(data);
      categories.forEach((category, i) => {
        // Tab button
        const tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.innerHTML = `
          <button class="nav-link ${i === 0 ? 'active' : ''}" data-bs-toggle="tab" data-bs-target="#tab-${i}">
            ${category}
          </button>
        `;
        categoryTabs.appendChild(tab);

        // Tab pane
        const pane = document.createElement('div');
        pane.className = `tab-pane fade ${i === 0 ? 'show active' : ''}`;
        pane.id = `tab-${i}`;

        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${data[category].map(item => `
              <tr>
                <td>${item.code}</td>
                <td>${item.description}</td>
                <td>
                  <input type="number" min="1" value="${item.quantity ?? 1}" class="form-control form-control-sm qty-input" data-code="${item.code}" data-desc="${item.description}" />
                </td>
                <td>
                  <button class="btn btn-sm btn-success add-btn" data-code="${item.code}" data-desc="${item.description}">Add</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        `;
        pane.appendChild(table);
        tabContent.appendChild(pane);
      });

      tabContent.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {
          const code = e.target.dataset.code;
          const desc = e.target.dataset.desc;
          const input = tabContent.querySelector(`.qty-input[data-code="${code}"]`);
          const quantity = parseInt(input.value, 10);

          if (!quantity || quantity < 1) {
            showToast('Invalid quantity.', 'error');
            return;
          }

          cart.push({ code, description: desc, quantity });
          updateCart();
          showToast(`Added ${quantity} × ${desc}`, 'success');
          input.value = 1;
        }
      });
    })
    .catch(() => {
      hideSpinner('spinnerContainer');
      showToast('Failed to load items.', 'error');
    });

  function updateCart() {
    cartList.innerHTML = '';
    cart.forEach((entry, index) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <span>${entry.code} — ${entry.description} × ${entry.quantity}</span>
        <button class="btn btn-sm btn-outline-danger" data-index="${index}">Remove</button>
      `;
      cartList.appendChild(li);
    });
  }

  cartList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const index = parseInt(e.target.dataset.index, 10);
      cart.splice(index, 1);
      updateCart();
      showToast('Item removed from cart.', 'info');
    }
  });

  submitBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Cart is empty.', 'info');
      return;
    }

    confirmList.innerHTML = '';
    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${item.code} — ${item.description} × ${item.quantity}`;
      confirmList.appendChild(li);
    });

    const modal = new Modal(document.getElementById('confirmModal'));
    modal.show();

    confirmSubmit.onclick = async () => {
      modal.hide();
      showSpinner('spinnerContainer');

      try {
        const res = await fetch('/api/orders/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orders: cart }),
        });

        hideSpinner('spinnerContainer');

        if (res.ok) {
          showToast('Order submitted!', 'success');
          cart.length = 0;
          updateCart();
        } else {
          showToast('Order failed.', 'error');
        }
      } catch {
        hideSpinner('spinnerContainer');
        showToast('Network error.', 'error');
      }
    };
  });
});