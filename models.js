const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: 'orders.db' });

// User model (for auth)
const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Item catalog (loaded from JSON)
const Item = sequelize.define('Item', {
  name: DataTypes.STRING,
  price: DataTypes.FLOAT
});

// Order and OrderItem
const Order = sequelize.define('Order', {
  total: DataTypes.FLOAT
});
const OrderItem = sequelize.define('OrderItem', {
  name: DataTypes.STRING,
  qty: DataTypes.INTEGER,
  price: DataTypes.FLOAT
});

User.hasMany(Order);
Order.belongsTo(User);
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

async function init() {
  await sequelize.sync();
  // seed default user & items if missing
  if (!await User.count()) {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('secret', 10);
    await User.create({ username: 'admin', password: hash, isAdmin: true });
  }
  const items = require('./items.json');
  if (!await Item.count()) {
    await Item.bulkCreate(items);
  }
}
module.exports = { init, User, Item, Order, OrderItem };