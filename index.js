const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const { init, User, Item, Order, OrderItem } = require('./models');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return done(null, false);
    const ok = await bcrypt.compare(password, user.password);
    return done(null, ok ? user : false);
  } catch (e) {
    done(e);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

//--- Routes

app.get('/dashboard', ensureAuth, async (req, res) => {
  const latest = await Order.findOne({
    where: { UserId: req.user.id },
    order: [['createdAt','DESC']]
  });
  const totalOrders = await Order.count({ where: { UserId: req.user.id } });
  res.render('dashboard', {
    user: req.user,
    latest,
    totalOrders
  });
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login',
  passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login' })
);

function ensureAuth(req, res, next) {
  req.isAuthenticated() ? next() : res.redirect('/login');
}

app.get('/order', ensureAuth, (req, res) => res.render('order'));
app.get('/history', ensureAuth, async (req, res) => {
  const orders = await Order.findAll({
    where: { UserId: req.user.id },
    include: [ OrderItem ],
    order: [['createdAt','DESC']]
  });
  res.render('history', { orders });
});

// API: item catalog
app.get('/api/items', ensureAuth, async (req, res) => {
  const items = await Item.findAll();
  res.json(items);
});

// API: save order
app.post('/api/save-order', ensureAuth, async (req, res) => {
  const { total, items } = req.body;
  const order = await Order.create({ total, UserId: req.user.id });
  await Promise.all(items.map(i =>
    OrderItem.create({
      OrderId: order.id, name: i.name, qty: i.qty, price: i.price
    })
  ));
  res.json({ orderId: order.id });
});

// Initialize DB & start
init().then(() => {
  app.listen(3000, () => console.log('Server on http://localhost:3000'));
});