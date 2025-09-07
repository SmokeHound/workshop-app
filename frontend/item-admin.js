// item-admin.js

import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';
import { API_BASE_URL } from '../shared/config.js';

// Handle item admin form submission
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeToggle');
  const form = document.getElementById('itemForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showSpinner('spinnerContainer');
    const name = document.getElementById('itemName').value.trim();
    const quantity = parseInt(document.getElementById('itemQuantity').value, 10);
    if (
      !name ||
      !Number.isFinite(quantity) ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      showToast('Invalid item name or quantity.', 'error');
      hideSpinner('spinnerContainer');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/items`, {
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
    } catch {
      hideSpinner('spinnerContainer');
      showToast('Network error.', 'error');
    }
  });
});