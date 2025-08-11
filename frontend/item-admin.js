// item-admin.js
import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeToggle');

  const form = document.getElementById('itemForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    showSpinner('spinnerContainer');

    const name = document.getElementById('itemName').value;
    const quantity = document.getElementById('itemQuantity').value;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity }),
      });

      hideSpinner('spinnerContainer');

      if (res.ok) {
        showToast('Item added successfully!', 'success');
        form.reset();
      } else {
        showToast('Failed to add item.', 'error');
      }
    } catch (err) {
      hideSpinner('spinnerContainer');
      showToast('Network error.', 'error');
    }
  });
});