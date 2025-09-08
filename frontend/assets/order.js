
import { getApiBase } from '../utils.js';

const tbody = document.querySelector('#order-table tbody');
const grandTotalEl = document.getElementById('grand-total');

// Fetch items function
export async function fetchItems() {
  const res = await fetch(`${getApiBase()}/items`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Items fetch failed: ${res.status}`);
  return res.json();
}

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
  el.setAttribute('role', 'alert');
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
    tr.innerHTML = '';
    const tdItem = document.createElement('td');
    const inputItem = document.createElement('input');
    inputItem.className = 'form-control item';
    inputItem.setAttribute('aria-label', 'Item name');
    tdItem.appendChild(inputItem);
  
    const tdQty = document.createElement('td');
    const inputQty = document.createElement('input');
    inputQty.type = 'number';
    inputQty.min = '0';
    inputQty.className = 'form-control qty';
    inputQty.value = '0';
    inputQty.setAttribute('aria-label', 'Quantity');
    tdQty.appendChild(inputQty);
  
    const tdPrice = document.createElement('td');
    const inputPrice = document.createElement('input');
    inputPrice.type = 'number';
    inputPrice.step = '0.01';
    inputPrice.className = 'form-control price';
    inputPrice.value = '0';
    inputPrice.setAttribute('aria-label', 'Price');
    tdPrice.appendChild(inputPrice);
  
    const tdTotal = document.createElement('td');
    tdTotal.className = 'line-total';
    tdTotal.textContent = '0.00';
  
    const tdRemove = document.createElement('td');
    const buttonRemove = document.createElement('button');
    buttonRemove.className = 'btn btn-sm btn-danger remove';
    buttonRemove.setAttribute('aria-label', 'Remove row');
    buttonRemove.textContent = 'X';
    tdRemove.appendChild(buttonRemove);
  
    tr.append(tdItem, tdQty, tdPrice, tdTotal, tdRemove);
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
  // You probably want to call saveOrder here, e.g.:
  // try {
  //   await saveOrder(items, total);
  // } catch (e) {}

}; // <-- Close the onclick handler function

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
