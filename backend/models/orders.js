
const db = require('../db');
const bcrypt = require('bcrypt');

exports.createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, total REAL)`);
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, passwordHash TEXT)`);
};

exports.saveOrder = (total, callback) => {
  const date = new Date().toISOString().split('T')[0];
  db.run(`INSERT INTO orders (date, total) VALUES (?, ?)`, [date, total], function (err) {
    callback(err, this.lastID);
  });
};

exports.getHistory = callback => {
  db.all(`SELECT * FROM orders ORDER BY id DESC`, callback);
};

exports.getStats = callback => {
  db.get(`SELECT COUNT(*) as totalOrders FROM orders`, (_, countRow) => {
    db.get(`SELECT * FROM orders ORDER BY id DESC LIMIT 1`, (_, lastOrder) => {
      callback(null, {
        totalOrders: countRow.totalOrders || 0,
        latestTotal: lastOrder?.total || 0,
        latestDate: lastOrder?.date || 'N/A'
      });
    });
  });
};

exports.validateUser = (username, password, callback) => {
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return callback(err || null, null);
    bcrypt.compare(password, user.passwordHash, (err, match) => {
      if (err || !match) return callback(err || null, null);
      callback(null, user);
    });
  });
};
