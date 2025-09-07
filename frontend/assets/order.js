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

function formatMoney(x) {
  return parseFloat(x).toFixed(2);
}

function recalcRow(row) {
  const qty = +row.querySelector('.qty').value || 0;
  const price = +row.querySelector('.price').value || 0;
  row.querySelector('.line-total').textContent = formatMoney(qty * price);
  recalcTotal();
}

function recalcTotal() {
  let sum = 0;
  document.querySelectorAll('.line-total').forEach(td => {
    sum += +td.textContent || 0;
  });
  grandTotalEl.textContent = formatMoney(sum);
}

function addRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="form-control item" /></td>
    <td><input type="number" min="0" class="form-control qty" value="0" /></td>
    <td><input type="number" step="0.01" class="form-control price" value="0" /></td>
    <td class="line-total">0.00</td>
    <td><button class="btn btn-sm btn-danger remove">X</button></td>
  `;
  tbody.appendChild(tr);
  tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => recalcRow(tr)));
  tr.querySelector('.remove').addEventListener('click', () => {
    tr.remove();
    recalcTotal();
  });
  recalcRow(tr);
}

document.getElementById('add-item').onclick = () => addRow();
addRow();

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

document.getElementById('save-order').onclick = () => {
  const items = [];
  tbody.querySelectorAll('tr').forEach(tr => {
    const name = tr.querySelector('.item').value;
    const qty = +tr.querySelector('.qty').value;
    const price = +tr.querySelector('.price').value;
    if (name && qty > 0) items.push({ name, qty, price });
  });
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
};

// Public API
export { fetchItems, saveOrder };
