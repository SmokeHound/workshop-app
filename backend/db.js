const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./orders.db');


// Create tables for admin features if not exist
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
	db.run(`CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY,
		passwordHash TEXT NOT NULL,
		role TEXT DEFAULT 'user',
		active INTEGER DEFAULT 1,
		created_at INTEGER DEFAULT (strftime('%s','now'))
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS roles (
		role TEXT PRIMARY KEY,
		permissions TEXT
	)`);
db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
)`);

db.run(`CREATE TABLE IF NOT EXISTS apikeys (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created INTEGER NOT NULL DEFAULT (strftime('%s','now'))
)`);
	db.run(`CREATE TABLE IF NOT EXISTS announcements (
		ts INTEGER PRIMARY KEY,
		text TEXT
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS logs (
		ts INTEGER PRIMARY KEY,
		message TEXT
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS user_settings (
		username TEXT PRIMARY KEY,
		theme TEXT DEFAULT 'light',
		notifications TEXT DEFAULT 'on',
		default_page TEXT DEFAULT 'index.html',
		font_size TEXT DEFAULT 'medium',
		accessibility TEXT DEFAULT 'normal',
		api_base TEXT DEFAULT '',
		updated_at INTEGER DEFAULT (strftime('%s','now')),
		FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
	)`);
});

module.exports = db;
