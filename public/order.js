const tbody = document.querySelector('#order-table tbody');
const grandTotalEl = document.getElementById('grand-total');

// fetch catalog once
let catalog = [];
fetch('/api/items')
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
  document.querySelectorAll('.line-total')
    .forEach(td => sum += +td.textContent || 0);
  grandTotalEl.textContent = formatMoney(sum);
}
function addRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>
      <select class="form-select item-select">
        <option value="">Select...</option>
        ${catalog.map(i=>`<option data-price="${i.price}">${i.name}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" min="0" class="form-control qty" value="0" /></td>
    <td><input type="number" min="0" step="0.01" class="form-control price" value="0" /></td>
    <td class="line-total">0.00</td>
    <td class="text-center"><span class="btn-remove">&times;</span></td>`;
  tbody.appendChild(tr);

  const select = tr.querySelector('.item-select');
  select.addEventListener('change', () => {
    tr.querySelector('.price').value = select.selectedOptions[0]?.dataset.price || 0;
    recalcRow(tr);
  });

  tr.querySelectorAll('input').forEach(i => i.addEventListener('input', () => recalcRow(tr)));
  tr.querySelector('.btn-remove').addEventListener('click', () => { tr.remove(); recalcTotal(); });
  recalcRow(tr);
}

document.getElementById('add-item').onclick = () => addRow();
addRow();

document.getElementById('generate-pdf').onclick = () => {
  html2pdf().from(document.getElementById('order-form')).set({
    margin: 0.5,
    filename: `Order-${new Date().toISOString().slice(0,10)}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait',
      callback: doc => doc.text("Workshop Consumables Order", 1, 0.5)
    }
  }).save();
};

document.getElementById('save-order').onclick = () => {
  const items = [];
  tbody.querySelectorAll('tr').forEach(tr => {
    const name = tr.querySelector('.item-select').value;
    const qty  = +tr.querySelector('.qty').value;
    const price= +tr.querySelector('.price').value;
    if (name && qty > 0) items.push({ name, qty, price });
  });
  const total = +grandTotalEl.textContent;
  fetch('/api/save-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, total })
  })
  .then(r => r.json())
  .then(o => alert(`Saved as Order #${o.orderId}`))
  .catch(() => alert('Save failed.'));
};