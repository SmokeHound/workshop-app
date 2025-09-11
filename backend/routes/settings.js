const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authenticateToken, auditLog } = require('../middleware/auth');

// Apply authentication to all settings routes
router.use(authenticateToken);

// Settings validation
const settingsValidation = [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'contrast'])
    .withMessage('Theme must be light, dark, or contrast'),
  body('notifications')
    .optional()
    .isIn(['on', 'off'])
    .withMessage('Notifications must be on or off'),
  body('default_page')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Default page must be less than 100 characters'),
  body('font_size')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('Font size must be small, medium, or large'),
  body('accessibility')
    .optional()
    .isIn(['normal', 'high-contrast'])
    .withMessage('Accessibility must be normal or high-contrast'),
  body('api_base')
    .optional()
    .isURL({ require_tld: false })
    .withMessage('API base must be a valid URL')
];

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM user_settings WHERE username = ?', 
        [req.user.username], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
    });

    if (!settings) {
      // Return default settings if none exist
      return res.json({
        theme: 'light',
        notifications: 'on',
        default_page: 'index.html',
        font_size: 'medium',
        accessibility: 'normal',
        api_base: ''
      });
    }

    // Remove username and updated_at from response
    const { username, updated_at, ...userSettings } = settings;
    res.json(userSettings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', settingsValidation, auditLog('Settings update'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const {
    theme = 'light',
    notifications = 'on',
    default_page = 'index.html',
    font_size = 'medium',
    accessibility = 'normal',
    api_base = ''
  } = req.body;

  try {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO user_settings 
         (username, theme, notifications, default_page, font_size, accessibility, api_base, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))`,
        [req.user.username, theme, notifications, default_page, font_size, accessibility, api_base],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    res.json({ 
      message: 'Settings updated successfully',
      settings: { theme, notifications, default_page, font_size, accessibility, api_base }
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// DELETE /api/settings (reset to defaults)
router.delete('/', auditLog('Settings reset'), async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM user_settings WHERE username = ?', 
        [req.user.username], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
    });

    res.json({ message: 'Settings reset to defaults' });
  } catch (err) {
    console.error('Reset settings error:', err);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router;