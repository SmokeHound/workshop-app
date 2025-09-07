
import {
  showSpinner,
  hideSpinner,
  showToast,
  initThemeToggle
} from './utils.js';
import { getApiBase } from './utils.js';

// Load order history and display in list
document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle('themeToggle');
  const list = document.getElementById('historyList');
  showSpinner('spinnerContainer');
  try {
  const res = await fetch(`${getApiBase()}/orders/history`);
    hideSpinner('spinnerContainer');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      showToast('No order history found.', 'info');
      return;
    }
    data.forEach(order => {
      const item = document.createElement('li');
      item.className = 'list-group-item d-flex justify-content-between';
      const span = document.createElement('span');
      span.textContent = `${order.item} x ${order.quantity}`;
      const small = document.createElement('small');
      small.className = 'text-muted';
      small.textContent = new Date(order.timestamp).toLocaleString();
      item.appendChild(span);
      item.appendChild(small);
      list.appendChild(item);
    });
  } catch {
    hideSpinner('spinnerContainer');
    showToast('Failed to fetch history.', 'error');
  }
});