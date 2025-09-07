

import { API_BASE_URL } from '../../shared/config.js';

const tbody = document.querySelector('#order-table tbody');
const grandTotalEl = document.getElementById('grand-total');

// runtime‐safe API base URL for browser environments
const API_BASE_URL =
  (typeof window !== 'undefined' && window.API_BASE_URL)
    ? window.API_BASE_URL
    : '/api';

// Fetch items function
async function fetchItems() {
    const res = await fetch(`${API_BASE_URL}/items`, {
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Items fetch failed: ${res.status}`);
    return res.json();
}

// Export functions
export { fetchItems, saveOrder };
  .then(r => r.json())
  .then(data => catalog = data);

const errorEl = document.getElementById('error-message') || createErrorElement();
let catalog = [];

// Centralized error display
function showError(msg) {
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
  errorEl.setAttribute('aria-live', 'assertive');
  setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
}

function createErrorElement() {
  const el = document.createElement('div');
  el.id = 'error-message';
  el.style.cssText = 'color:red;display:none;margin:1em 0;';
  document.body.prepend(el);
  return el;
}

// Async fetch for catalogue with validation and loading state
async function loadCatalog() {
  try {
    showLoading(true);
    const r = await fetch(`${API_BASE_URL}/items`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error('Invalid catalogue format');
    catalog = data;
    showLoading(false);
  } catch (e) {
    showLoading(false);
    showError('Failed to load item catalogue.');
    catalog = [];
  }
}

function showLoading(isLoading) {
  let loader = document.getElementById('loading-indicator');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loading-indicator';
    loader.textContent = 'Loading...';
    loader.style.cssText = 'color:blue;margin:1em 0;';
    document.body.prepend(loader);
  }
  loader.style.display = isLoading ? 'block' : 'none';
}

// Load catalogue on startup
loadCatalog();


// Format a number as money
function formatMoney(x) {
  return parseFloat(x).toFixed(2);
}


// Recalculate a row's total
function recalcRow(row) {
  const qty = +row.querySelector('.qty').value || 0;
  const price = +row.querySelector('.price').value || 0;
  row.querySelector('.line-total').textContent = formatMoney(qty * price);
  recalcTotal();
}


// Recalculate the grand total
function recalcTotal() {
  let sum = 0;
  document.querySelectorAll('.line-total').forEach(td => {
    sum += +td.textContent || 0;
  });
  grandTotalEl.textContent = formatMoney(sum);
}


// Add a new order row
function addRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="form-control item" aria-label="Item name" /></td>
    <td><input type="number" min="0" class="form-control qty" value="0" aria-label="Quantity" /></td>
    <td><input type="number" step="0.01" class="form-control price" value="0" aria-label="Price" /></td>
    <td class="line-total">0.00</td>
    <td><button class="btn btn-sm btn-danger remove" aria-label="Remove row">X</button></td>
  `;
  tbody.appendChild(tr);
  tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => recalcRow(tr)));
  tr.querySelector('.remove').addEventListener('click', () => {
    tr.remove();
    recalcTotal();
  });
  recalcRow(tr);
}


// Add first row and set up add button
document.getElementById('add-item').onclick = () => addRow();
addRow();


// PDF generation
document.getElementById('generate-pdf').onclick = () => {
  html2pdf().from(document.getElementById('order-form')).set({
    margin: 0.5,
    filename: `Order-${new Date().toISOString().slice(0,10)}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
      callback: doc => doc.text("Workshop Consumables Order", 1, 0.5)
    }
  }).save();
};


// Save order with validation, loading, and error handling
document.getElementById('save-order').onclick = async () => {
  const items = [];
  tbody.querySelectorAll('tr').forEach(tr => {
    const name = tr.querySelector('.item').value.trim();
    const qty = +tr.querySelector('.qty').value;
    const price = +tr.querySelector('.price').value;
    // Validate input
    if (!name) {
      showError('Item name is required.');
      return;
    }
    if (qty <= 0) {
      showError('Quantity must be greater than zero.');
      return;
    }
    if (price < 0) {
      showError('Price cannot be negative.');
      return;
    }
    items.push({ name, qty, price });
  });
  if (items.length === 0) {
    showError('No valid items to save.');
    return;
  }
  const total = +grandTotalEl.textContent;

  // Save order function
async function saveOrder(order) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
    return await response.json();}
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, total })
  })
  .then(r => r.json())
  .then(o => alert(`Saved as Order #${o.orderId}`))
  .catch(() => alert('Save failed.'));
  try {
    showLoading(true);
    const r = await fetch(`${API_BASE_URL}/save-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, total })
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const o = await r.json();
    if (!o.orderId) throw new Error('Invalid response from server');
    alert(`Saved as Order #${o.orderId}`);
    showLoading(false);
  } catch (e) {
    showLoading(false);
    showError('Save failed.');
  }
};

// Public API
export { fetchItems, saveOrder };
