const bcrypt = require('bcrypt');
const db = require('./db');

async function initializeDatabase() {
  try {
    // Check if admin user exists
    const adminExists = await new Promise((resolve, reject) => {
      db.get('SELECT username FROM users WHERE username = ? AND role = ?', 
        ['admin', 'admin'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
    });

    if (!adminExists) {
      // Create default admin user
      const defaultPassword = process.env.DEV_ADMIN_PASSWORD || 'AdminPass123!';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)',
          ['admin', passwordHash, 'admin'],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      console.log('✅ Default admin user created');
      console.log(`   Username: admin`);
      console.log(`   Password: ${defaultPassword}`);
      console.log('   Please change the password after first login!');

      // Log the initialization
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO logs (ts, message) VALUES (?, ?)', 
          [Date.now(), 'Default admin user created during initialization'], 
          err => err ? reject(err) : resolve());
      });
    } else {
      console.log('✅ Admin user already exists');
    }

    // Insert default roles if they don't exist
    const defaultRoles = {
      'admin': ['user_management', 'system_admin', 'orders', 'reports'],
      'user': ['orders'],
      'tech': ['orders', 'tech_support']
    };

    for (const [role, permissions] of Object.entries(defaultRoles)) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO roles (role, permissions) VALUES (?, ?)',
          [role, JSON.stringify(permissions)],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
    }

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };