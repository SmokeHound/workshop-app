const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../db');
const { authenticateToken, requireRole, auditLog, csrfProtection } = require('../middleware/auth');

// Apply authentication and CSRF protection to all admin routes
router.use(authenticateToken);
router.use(requireRole('admin'));
router.use(csrfProtection);

// --- Bulk Import/Export Users (must come before :username routes) ---
router.get('/users/export', auditLog('Users export'), async (req, res) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT username, role, active, created_at FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json(users);
  } catch (err) {
    console.error('Export users error:', err);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

router.post('/users/import', 
  body('users').isArray().withMessage('Users must be an array'),
  auditLog('Users import'), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { users } = req.body;

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
      await new Promise((resolve, reject) => {
        db.run('BEGIN', err => err ? reject(err) : resolve());
      });

      for (const u of users) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO users (username, role, active, passwordHash)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(username) DO UPDATE SET
               role     = excluded.role,
               active   = excluded.active`,
            [
              u.username.trim(),
              u.role,
              (u.active ?? 1) ? 1 : 0,
              '$2b$12$defaultHashForImportedUsers' // Default hash, users need to reset password
            ],
            function(err) {
              if (err) reject(err);
              else resolve(this);
            }
          );
        });
      }

      // Commit if all succeeded
      await new Promise((resolve, reject) => {
        db.run('COMMIT', err => err ? reject(err) : resolve());
      });
      
      res.json({ message: 'Users imported successfully' });

    } catch (err) {
      // Roll back on any failure
      try {
        await new Promise((resolve) => {
          db.run('ROLLBACK', () => resolve());
        });
      } catch (_) { /* ignore rollback errors */ }

      console.error('Import users error:', err);
      res.status(500).json({ error: 'Failed to import users' });
    }
  }
);

// --- Individual User Management ---
// GET /api/admin/users/:username
router.get('/users/:username', async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT username, role, active, created_at FROM users WHERE username = ?', 
        [req.params.username], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/admin/users/:username/role
router.patch('/users/:username/role', 
  body('role').isIn(['admin', 'user', 'tech']).withMessage('Invalid role'),
  auditLog('Role change'), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { role } = req.body;
    const { username } = req.params;

    if (username === req.user.username) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    try {
      const result = await new Promise((resolve, reject) => {
        db.run('UPDATE users SET role = ? WHERE username = ?', [role, username], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Role updated successfully' });
    } catch (err) {
      console.error('Update role error:', err);
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
);

// PATCH /api/admin/users/:username/status
router.patch('/users/:username/status', auditLog('Status toggle'), async (req, res) => {
  const { username } = req.params;

  if (username === req.user.username) {
    return res.status(400).json({ error: 'Cannot change your own status' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      db.run('UPDATE users SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE username = ?', 
        [username], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// POST /api/admin/users/:username/reset-password
router.post('/users/:username/reset-password', auditLog('Password reset'), async (req, res) => {
  const { username } = req.params;

  try {
    // Generate random password
    const newPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const passwordHash = await bcrypt.hash(newPassword, 12);

    const result = await new Promise((resolve, reject) => {
      db.run('UPDATE users SET passwordHash = ? WHERE username = ?', 
        [passwordHash, username], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Password reset successfully',
      newPassword // In production, this should be sent via secure channel
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// DELETE /api/admin/users/:username
router.delete('/users/:username', auditLog('User deletion'), async (req, res) => {
  const { username } = req.params;

  if (username === req.user.username) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE username = ?', [username], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- Role-Based Access Control ---
router.get('/roles', async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT role, permissions FROM roles', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const roles = {};
    for (const r of rows) {
      try {
        roles[r.role] = r.permissions ? JSON.parse(r.permissions) : [];
      } catch {
        roles[r.role] = [];
      }
    }
    res.json(roles);
  } catch (err) {
    console.error('Fetch roles error:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

router.put('/roles', auditLog('Roles update'), async (req, res) => {
  const roles = req.body;
  try {
    for (const [role, perms] of Object.entries(roles || {})) {
      if (typeof role !== 'string' || !role.trim()) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR REPLACE INTO roles (role, permissions) VALUES (?, ?)',
          [role.trim(), JSON.stringify(perms ?? [])],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
    }
    res.json({ message: 'Roles updated', roles });
  } catch (err) {
    console.error('Update roles error:', err);
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
