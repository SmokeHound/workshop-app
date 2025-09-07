const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');

// --- Bulk Import/Export Users ---
router.get('/users/export', async (req, res) => {
  try {
    const users = await db.all('SELECT username, role, active FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export users' });
  }
});
router.post('/users/import', async (req, res) => {
  const { users } = req.body || {};
  if (!Array.isArray(users)) {
    return res.status(400).json({ error: 'Invalid users data' });
  }

  // Validate each user payload
  for (const u of users) {
    if (!u || typeof u.username !== 'string' || !u.username.trim()) {
      return res.status(400).json({ error: 'Invalid username' });
    }
    if (!['user', 'admin', 'tech'].includes(u.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (u.active != null && ![0, 1, true, false].includes(u.active)) {
      return res.status(400).json({ error: 'Invalid active flag' });
    }
  }

  try {
    // Start transaction
    await db.run('BEGIN');

    for (const u of users) {
      await db.run(
        `INSERT INTO users (username, role, active)
         VALUES (?, ?, ?)
         ON CONFLICT(username) DO UPDATE SET
           role     = excluded.role,
           active   = excluded.active`,
        [
          u.username.trim(),
          u.role,
          (u.active ?? 1) ? 1 : 0
        ]
      );
    }

    // Commit if all succeeded
    await db.run('COMMIT');
    res.json({ message: 'Users imported' });

  } catch (err) {
    // Roll back on any failure
    try {
      await db.run('ROLLBACK');
    } catch (_) { /* ignore rollback errors */ }

    res.status(500).json({ error: 'Failed to import users' });
  }
});

// --- Role-Based Access Control ---
router.get('/roles', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM roles');
    const roles = {};
    rows.forEach(r => { roles[r.role] = JSON.parse(r.permissions); });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});
router.put('/roles', async (req, res) => {
  const roles = req.body;
  try {
    for (const [role, perms] of Object.entries(roles || {})) {
      if (typeof role !== 'string' || !role.trim()) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      await db.run(
        'INSERT OR REPLACE INTO roles (role, permissions) VALUES (?, ?)',
        [role.trim(), JSON.stringify(perms ?? [])]
      );
    }
    res.json({ message: 'Roles updated', roles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update roles' });
  }
});

// --- System Logs ---
router.get('/logs', async (req, res) => {
  try {
    const logs = await db.all('SELECT * FROM logs ORDER BY ts DESC LIMIT 100');
    res.json(logs.map(l => l.message));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// --- Announcements ---
router.get('/announcements', async (req, res) => {
  try {
    const anns = await db.all('SELECT * FROM announcements ORDER BY ts DESC LIMIT 20');
    res.json(anns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});
router.post('/announcements', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  try {
    await db.run('INSERT INTO announcements (ts, text) VALUES (?, ?)', [Date.now(), text]);
    res.json({ message: 'Announcement posted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});
router.delete('/announcements/:ts', async (req, res) => {
  const ts = parseInt(req.params.ts, 10);
  try {
    await db.run('DELETE FROM announcements WHERE ts = ?', [ts]);
    res.json({ message: 'Announcement removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove announcement' });
  }
});

// --- Session Management ---
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await db.all('SELECT * FROM sessions ORDER BY created DESC LIMIT 50');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});
router.delete('/sessions/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM sessions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

// --- API Key Management ---
router.get('/apikeys', async (req, res) => {
  try {
    const keys = await db.all('SELECT * FROM apikeys ORDER BY created DESC LIMIT 20');
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});
router.post('/apikeys', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const key = Math.random().toString(36).slice(2, 18);
  try {
    await db.run('INSERT INTO apikeys (key, name, created) VALUES (?, ?, ?)', [key, name, Date.now()]);
    res.json({ message: 'API key generated', key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});
router.delete('/apikeys/:key', async (req, res) => {
  try {
    await db.run('DELETE FROM apikeys WHERE key = ?', [req.params.key]);
    res.json({ message: 'API key revoked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// --- Data Backup/Restore ---
router.get('/backup', async (req, res) => {
  try {
    const users = await db.all('SELECT * FROM users');
    const roles = await db.all('SELECT * FROM roles');
    const sessions = await db.all('SELECT * FROM sessions');
    const apikeys = await db.all('SELECT * FROM apikeys');
    const announcements = await db.all('SELECT * FROM announcements');
    const logs = await db.all('SELECT * FROM logs');
    res.json({ users, roles, sessions, apikeys, announcements, logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create backup' });
  }
});
router.post('/restore', async (req, res) => {
  const { users, roles, sessions, apikeys, announcements, logs } = req.body;
  try {
    // Clear tables
    await db.run('DELETE FROM users');
    await db.run('DELETE FROM roles');
    await db.run('DELETE FROM sessions');
    await db.run('DELETE FROM apikeys');
    await db.run('DELETE FROM announcements');
    await db.run('DELETE FROM logs');
    // Restore data
    if (Array.isArray(users)) for (const u of users) await db.run('INSERT INTO users (username, role, active) VALUES (?, ?, ?)', [u.username, u.role, u.active ?? 1]);
    if (Array.isArray(roles)) for (const r of roles) await db.run('INSERT INTO roles (role, permissions) VALUES (?, ?)', [r.role, r.permissions]);
    if (Array.isArray(sessions)) for (const s of sessions) await db.run('INSERT INTO sessions (id, username, created) VALUES (?, ?, ?)', [s.id, s.username, s.created]);
    if (Array.isArray(apikeys)) for (const k of apikeys) await db.run('INSERT INTO apikeys (key, name, created) VALUES (?, ?, ?)', [k.key, k.name, k.created]);
    if (Array.isArray(announcements)) for (const a of announcements) await db.run('INSERT INTO announcements (ts, text) VALUES (?, ?)', [a.ts, a.text]);
    if (Array.isArray(logs)) for (const l of logs) await db.run('INSERT INTO logs (ts, message) VALUES (?, ?)', [l.ts, l.message]);
    res.json({ message: 'Restore complete' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

module.exports = router;
