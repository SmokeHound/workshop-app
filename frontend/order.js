import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeToggle');

  const form = document.getElementById('orderForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showSpinner('spinnerContainer');

    const item = document.getElementById('orderItem').value;
    const quantity = document.getElementById('orderQty').value;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, quantity }),
      });

      hideSpinner('spinnerContainer');

      if (res.ok) {
        showToast('Order placed!', 'success');
        form.reset();
      } else {
        showToast('Order failed.', 'error');
      }
    } catch {
      hideSpinner('spinnerContainer');
      showToast('Network error.', 'error');
    }
  });
});