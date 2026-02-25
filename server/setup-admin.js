// Script to set up the admin user with proper password hash
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5438,
  database: process.env.DB_NAME || 'electrician_db',
  user: process.env.DB_USER || 'electrician',
  password: process.env.DB_PASSWORD || '',
});

async function setupAdmin() {
  const email = process.env.ADMIN_EMAIL || 'kelvincushman@gmail.com';
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_NAME || 'Kelvin Cushman';
  const role = 'super_admin';

  if (!password) {
    console.error('ADMIN_PASSWORD environment variable is required');
    process.exit(1);
  }

  try {
    // Generate bcrypt hash
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('Generated password hash:', passwordHash);

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      // Update existing user
      await pool.query(
        'UPDATE users SET password_hash = $1, display_name = $2, role = $3, updated_at = NOW() WHERE email = $4',
        [passwordHash, displayName, role, email]
      );
      console.log('Updated existing admin user');
    } else {
      // Insert new user
      await pool.query(
        'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4)',
        [email, passwordHash, displayName, role]
      );
      console.log('Created new admin user');
    }

    console.log('\nAdmin setup complete!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nYou can now login at /admin/login');

  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await pool.end();
  }
}

setupAdmin();
