  function updateCart() {
    cartList.innerHTML = '';
    cart.forEach(function(entry, index) {
      var li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = '<span>' + entry.code + ' — ' + entry.description + ' × ' + entry.quantity + '</span>' +
        '<button class="btn btn-sm btn-outline-danger" data-index="' + index + '">Remove</button>';
      cartList.appendChild(li);
    });
  }