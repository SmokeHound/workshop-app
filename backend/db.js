const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./orders.db');


// Create tables for admin features if not exist
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
	db.run(`CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY,
		role TEXT,
		active INTEGER DEFAULT 1
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS roles (
		role TEXT PRIMARY KEY,
		permissions TEXT
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		username TEXT,
		created INTEGER
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS apikeys (
		key TEXT PRIMARY KEY,
		name TEXT,
		created INTEGER
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS announcements (
		ts INTEGER PRIMARY KEY,
		text TEXT
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS logs (
		ts INTEGER PRIMARY KEY,
		message TEXT
	)`);
});

module.exports = db;
