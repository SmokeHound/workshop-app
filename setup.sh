#!/bin/bash

mkdir -p workshop-order/views workshop-order/public
cd workshop-order

echo 'Initializing Node.js project...'
npm init -y

echo 'Installing dependencies...'
npm install express express-session passport passport-local bcrypt sequelize sqlite3 ejs body-parser

echo 'Creating files...'

cat <<EOF > index.js
// index.js
// (Paste the full Express server code here)
EOF

cat <<EOF > models.js
// models.js
// (Paste Sequelize model code here)
EOF

cat <<EOF > items.json
[
  { "name": "Safety Gloves", "price": 12.50 },
  { "name": "Goggles", "price": 8.75 },
  { "name": "Face Mask", "price": 3.00 }
]
EOF

cat <<EOF > views/login.ejs
<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <form method="post" action="/login">
    <input name="username" placeholder="Username" required />
    <input name="password" type="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
</body>
</html>
EOF

cat <<EOF > views/order.ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order Form</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.4.0/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="/styles.css" rel="stylesheet" />
</head>
<body class="p-4">
  <div class="container">
    <h1 class="mb-4">Workshop Consumables Order</h1>
    <form id="order-form">
      <table class="table table-bordered" id="order-table">
        <thead class="table-light">
          <tr>
            <th style="width:40%">Item</th>
            <th style="width:15%">Quantity</th>
            <th style="width:20%">Unit Price (AUD)</th>
            <th style="width:20%">Line Total</th>
            <th style="width:5%"></th>
          </tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <tr>
            <th colspan="3" class="text-end">Grand Total AUD</th>
            <th id="grand-total">0.00</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
      <div class="mb-3">
        <button type="button" class="btn btn-sm btn-secondary" id="add-item">+ Add Item</button>
      </div>
      <button type="button" class="btn btn-primary" id="generate-pdf">Generate PDF</button>
      <button type="button" class="btn btn-success" id="save-order">Save Order</button>
    </form>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script src="/order.js"></script>
</body>
</html>
EOF

cat <<EOF > views/history.ejs
<!DOCTYPE html>
<html>
<head>
  <title>Order History</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.4.0/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body class="p-4">
  <div class="container">
    <h1>Past Orders</h1>
    <table class="table table-striped">
      <thead><tr><th>ID</th><th>Date</th><th>Total AUD</th></tr></thead>
      <tbody>
        <% orders.forEach(o => { %>
          <tr>
            <td><%= o.id %></td>
            <td><%= o.createdAt.toISOString().slice(0,10) %></td>
            <td><%= o.total.toFixed(2) %></td>
          </tr>
        <% }) %>
      </tbody>
    </table>
  </div>
</body>
</html>
EOF

cat <<EOF > public/styles.css
#order-table tbody tr td { vertical-align: middle; }
.btn-remove { color: #c00; cursor: pointer; }

@page {
  margin: 1in;
  @bottom-center {
    content: "Page " counter(page) " of " counter(pages);
    font-size: 0.8em;
  }
}
EOF

cat <<EOF > public/order.js
// JS for dynamic form & PDF
// (Paste JavaScript logic from earlier)
EOF

echo 'Setup complete! 🎉'
echo 'Run: node index.js'