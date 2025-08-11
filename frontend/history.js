import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeToggle');
  const list = document.getElementById('historyList');
  showSpinner('spinnerContainer');

  fetch('/api/orders/history')
    .then(res => res.json())
    .then(data => {
      hideSpinner('spinnerContainer');
      if (!Array.isArray(data) || data.length === 0) {
        showToast('No order history found.', 'info');
        return;
      }

      data.forEach(order => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between';
        item.innerHTML = `
          <span>${order.item} x ${order.quantity}</span>
          <small class="text-muted">${new Date(order.timestamp).toLocaleString()}</small>
        `;
        list.appendChild(item);
      });
    })
    .catch(() => {
      hideSpinner('spinnerContainer');
      showToast('Failed to fetch history.', 'error');
    });
});