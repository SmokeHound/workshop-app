  function updateCart() {
    cartList.innerHTML = '';
    cart.forEach(function(entry, index) {
      var li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = '';
    const span = document.createElement('span');
    span.textContent = `${entry.code} — ${entry.description} × ${entry.quantity}`;
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline-danger';
    btn.setAttribute('data-index', index);
    btn.textContent = 'Remove';
    li.appendChild(span);
    li.appendChild(btn);
      cartList.appendChild(li);
    });
  }