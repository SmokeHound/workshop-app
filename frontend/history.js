
import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';
import { API_BASE_URL } from '../shared/config.js';

// Load order history and display in list
document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle('themeToggle');
  const list = document.getElementById('historyList');
  showSpinner('spinnerContainer');
  try {
    const res = await fetch(`${API_BASE_URL}/orders/history`);
    hideSpinner('spinnerContainer');
    const data = await res.json();
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
  } catch {
    hideSpinner('spinnerContainer');
    showToast('Failed to fetch history.', 'error');
  }
});