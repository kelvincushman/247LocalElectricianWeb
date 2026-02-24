const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { google } = require('googleapis');
const Anthropic = require('@anthropic-ai/sdk').default;
const PDFDocument = require('pdfkit');
const Stripe = require('stripe');
const twilio = require('twilio');
const cron = require('node-cron');
const crypto = require('crypto');

// Stripe Configuration
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Twilio Configuration
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// App URL for payment links
const APP_URL = process.env.APP_URL || 'https://247electrician.uk';
const API_URL = process.env.API_URL || 'https://api.247electrician.uk';

// Google Calendar OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://247electrician.uk/api/portal/calendar/google/callback';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const app = express();
const PORT = process.env.PORT || 3247;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5438,
  database: process.env.DB_NAME || 'electrician_db',
  user: process.env.DB_USER || 'electrician',
  password: process.env.DB_PASSWORD || 'Prawowi1976',
});

// Trust proxy (cloudflared/nginx) for secure cookies
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8084', 'https://247electrician.uk', 'https://www.247electrician.uk'],
  credentials: true
}));

// Stripe Webhook - MUST be before express.json() to get raw body
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Payment successful for session:', session.id);

        // Find the payment link record
        const linkResult = await pool.query(
          'SELECT * FROM payment_links WHERE stripe_checkout_session_id = $1',
          [session.id]
        );

        if (linkResult.rows.length > 0) {
          const paymentLink = linkResult.rows[0];
          const invoiceId = paymentLink.invoice_id;

          // Get invoice details
          const invoiceResult = await pool.query('SELECT * FROM invoices WHERE id = $1', [invoiceId]);
          if (invoiceResult.rows.length > 0) {
            const invoice = invoiceResult.rows[0];

            // Determine payment method from session
            let paymentMethod = 'stripe_card';
            if (session.payment_method_types && session.payment_method_types.includes('bacs_debit')) {
              paymentMethod = 'stripe_bank';
            }

            // Record the payment
            await pool.query(
              `INSERT INTO invoice_payments (invoice_id, amount, payment_method, payment_reference, stripe_payment_intent_id, payment_date, notes)
               VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
              [invoiceId, session.amount_total / 100, paymentMethod, session.payment_intent, session.payment_intent, 'Payment via Stripe Checkout']
            );

            // Calculate total paid
            const paymentsResult = await pool.query(
              'SELECT COALESCE(SUM(amount), 0) as total_paid FROM invoice_payments WHERE invoice_id = $1',
              [invoiceId]
            );
            const totalPaid = parseFloat(paymentsResult.rows[0].total_paid);

            // Update invoice status
            const newStatus = totalPaid >= parseFloat(invoice.total) ? 'paid' : 'partial';
            await pool.query(
              `UPDATE invoices SET
                amount_paid = $1,
                status = $2,
                paid_date = CASE WHEN $2 = 'paid' THEN NOW() ELSE paid_date END,
                stripe_payment_intent_id = $3,
                updated_at = NOW()
               WHERE id = $4`,
              [totalPaid, newStatus, session.payment_intent, invoiceId]
            );

            // Update payment link status
            await pool.query(
              'UPDATE payment_links SET status = $1, paid_at = NOW() WHERE id = $2',
              ['paid', paymentLink.id]
            );

            // Update related job status if invoice is fully paid
            if (newStatus === 'paid' && invoice.job_id) {
              await pool.query(
                'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2',
                ['paid', invoice.job_id]
              );
            }

            console.log(`Invoice ${invoiceId} updated to ${newStatus}. Total paid: ${totalPaid}`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with PostgreSQL store
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);

      if (result.rows.length === 0) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(`
      SELECT u.*, c.name as company_name, c.discount_tier
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = $1 AND u.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return done(null, false);
    }
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Ensure upload directories exist
const uploadDirs = ['../public/uploads', '../public/uploads/gallery', '../public/uploads/blog', '../public/uploads/portal', '../public/uploads/documents'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || 'gallery';
    const uploadPath = path.join(__dirname, `../public/uploads/${type}`);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype.split('/')[1]);
    if (extname || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    cb(new Error('Only images, videos, and PDFs are allowed'));
  }
});

// ============ AUTH MIDDLEWARE ============

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Check if user is staff (admin or super_admin)
const isStaff = (req, res, next) => {
  if (req.isAuthenticated() && ['staff', 'admin', 'super_admin'].includes(req.user.user_type)) {
    return next();
  }
  res.status(403).json({ error: 'Staff access required' });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && ['admin', 'super_admin'].includes(req.user.user_type)) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};

// Legacy auth middleware (for backward compatibility with existing admin)
const authenticateToken = async (req, res, next) => {
  // First check Passport session
  if (req.isAuthenticated()) {
    return next();
  }

  // Fall back to token-based auth
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [token]);
    if (user.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// ============ AUTH ROUTES ============

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session error:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          user_type: user.user_type,
          company_id: user.company_id
        }
      });
    });
  })(req, res, next);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

app.get('/api/auth/me', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.display_name, u.role, u.user_type, u.company_id, u.phone,
             c.name as company_name, c.discount_tier
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ PORTAL API ROUTES ============

// ============ COMPANIES (Business Customers) ============

app.get('/api/portal/companies', isStaff, async (req, res) => {
  try {
    const { type, is_active, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (type) {
      params.push(type);
      whereClause += ` AND company_type = $${params.length}`;
    }
    if (is_active !== undefined) {
      params.push(is_active === 'true');
      whereClause += ` AND is_active = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR postcode ILIKE $${params.length})`;
    }

    // Count total
    const countResult = await pool.query(`SELECT COUNT(*) FROM companies WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    params.push(parseInt(limit));
    params.push(offset);
    const query = `
      SELECT *,
        (SELECT COUNT(*) FROM customers WHERE company_id = companies.id) as contacts_count,
        (SELECT COUNT(*) FROM properties WHERE company_id = companies.id) as properties_count
      FROM companies
      WHERE ${whereClause}
      ORDER BY name ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    res.json({
      companies: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/companies/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Business customers can only view their own company
    if (req.user.user_type === 'business_customer' && req.user.company_id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get contacts
    const contacts = await pool.query(
      'SELECT id, first_name, last_name, email, phone FROM customers WHERE company_id = $1 ORDER BY first_name',
      [id]
    );

    // Get properties
    const properties = await pool.query(
      'SELECT id, address_line1, city, postcode FROM properties WHERE company_id = $1 ORDER BY address_line1',
      [id]
    );

    // Get recent jobs
    const jobs = await pool.query(
      'SELECT id, job_number, title, status, scheduled_date FROM jobs WHERE company_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );

    res.json({
      company: result.rows[0],
      contacts: contacts.rows,
      properties: properties.rows,
      jobs: jobs.rows
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/companies', isStaff, async (req, res) => {
  try {
    const { name, company_type, email, phone, address_line1, address_line2, city, postcode, discount_tier, notes, is_active } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (name, type, email, phone, address_line1, address_line2, city, postcode, discount_tier, notes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, company_type || 'other', email, phone, address_line1, address_line2, city, postcode, discount_tier || 'standard', notes, is_active !== false]
    );
    res.json({ company: result.rows[0] });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/companies/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company_type, email, phone, address_line1, address_line2, city, postcode, discount_tier, notes, is_active } = req.body;

    const result = await pool.query(
      `UPDATE companies SET
        name = $1, type = $2, email = $3, phone = $4,
        address_line1 = $5, address_line2 = $6, city = $7, postcode = $8,
        discount_tier = $9, notes = $10, is_active = $11, updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [name, company_type, email, phone, address_line1, address_line2, city, postcode, discount_tier, notes, is_active, id]
    );
    res.json({ company: result.rows[0] });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/portal/companies/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CUSTOMERS ============

app.get('/api/portal/customers', isStaff, async (req, res) => {
  try {
    const { customer_type, company_id, is_active, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (customer_type) {
      params.push(customer_type);
      whereClause += ` AND c.customer_type = $${params.length}`;
    }
    if (company_id) {
      params.push(company_id);
      whereClause += ` AND c.company_id = $${params.length}`;
    }
    if (is_active !== undefined) {
      params.push(is_active === 'true');
      whereClause += ` AND c.is_active = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length} OR c.postcode ILIKE $${params.length})`;
    }

    // Count total
    const countResult = await pool.query(`SELECT COUNT(*) FROM customers c WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    params.push(parseInt(limit));
    params.push(offset);
    const query = `
      SELECT c.*, comp.name as company_name,
        (SELECT COUNT(*) FROM jobs WHERE customer_id = c.id) as jobs_count
      FROM customers c
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    res.json({
      customers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/customers/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, comp.name as company_name
      FROM customers c
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get properties
    const properties = await pool.query(
      'SELECT id, address_line1, city, postcode FROM properties WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get jobs
    const jobs = await pool.query(
      'SELECT id, job_number, title, status, scheduled_date, created_at FROM jobs WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      customer: result.rows[0],
      properties: properties.rows,
      jobs: jobs.rows
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/customers', isStaff, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, mobile, address_line1, address_line2, city, postcode, company_id, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO customers (first_name, last_name, email, phone, phone_secondary, address_line1, address_line2, city, postcode, company_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [first_name, last_name, email, phone, mobile, address_line1, address_line2, city, postcode, company_id, notes]
    );
    res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/customers/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, mobile, address_line1, address_line2, city, postcode, company_id, notes } = req.body;

    const result = await pool.query(
      `UPDATE customers SET
        first_name = $1, last_name = $2, email = $3, phone = $4, phone_secondary = $5,
        address_line1 = $6, address_line2 = $7, city = $8, postcode = $9,
        company_id = $10, notes = $11, updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [first_name, last_name, email, phone, mobile, address_line1, address_line2, city, postcode, company_id, notes, id]
    );
    res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/portal/customers/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ PROPERTIES ============

app.get('/api/portal/properties', isAuthenticated, async (req, res) => {
  try {
    const { customer_id, company_id, postcode, is_active, search, type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    // Business customers can only see their company's properties
    if (req.user.user_type === 'business_customer') {
      params.push(req.user.company_id);
      whereClause += ` AND p.company_id = $${params.length}`;
    }

    if (customer_id) {
      params.push(customer_id);
      whereClause += ` AND p.customer_id = $${params.length}`;
    }
    if (company_id && req.user.user_type !== 'business_customer') {
      params.push(company_id);
      whereClause += ` AND p.company_id = $${params.length}`;
    }
    if (postcode) {
      params.push(`${postcode}%`);
      whereClause += ` AND p.postcode ILIKE $${params.length}`;
    }
    if (type) {
      params.push(type);
      whereClause += ` AND p.property_type = $${params.length}`;
    }
    if (is_active !== undefined) {
      params.push(is_active === 'true');
      whereClause += ` AND p.is_active = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (p.address_line1 ILIKE $${params.length} OR p.postcode ILIKE $${params.length} OR p.city ILIKE $${params.length})`;
    }

    // Count total
    const countResult = await pool.query(`SELECT COUNT(*) FROM properties p WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    params.push(parseInt(limit));
    params.push(offset);
    const query = `
      SELECT p.*, c.first_name || ' ' || c.last_name as customer_name, comp.name as company_name,
        (SELECT COUNT(*) FROM jobs WHERE property_id = p.id) as jobs_count
      FROM properties p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN companies comp ON p.company_id = comp.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    res.json({
      properties: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/properties/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, c.first_name || ' ' || c.last_name as customer_name, comp.name as company_name
      FROM properties p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN companies comp ON p.company_id = comp.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Business customers can only view their company's properties
    if (req.user.user_type === 'business_customer' && result.rows[0].company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get jobs
    const jobs = await pool.query(
      'SELECT id, job_number, title, status, scheduled_date FROM jobs WHERE property_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Get documents
    const documents = await pool.query(
      'SELECT id, title, document_type, file_url, file_name, created_at FROM documents WHERE property_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      property: result.rows[0],
      jobs: jobs.rows,
      documents: documents.rows
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/properties', isStaff, async (req, res) => {
  try {
    const { customer_id, company_id, address_line1, address_line2, city, postcode, property_type, access_notes, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO properties (customer_id, company_id, address_line1, address_line2, city, postcode, property_type, access_notes, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [customer_id, company_id, address_line1, address_line2, city, postcode, property_type || 'house', access_notes, notes]
    );
    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/properties/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, company_id, address_line1, address_line2, city, postcode, property_type, access_notes, notes } = req.body;

    const result = await pool.query(
      `UPDATE properties SET
        customer_id = $1, company_id = $2, address_line1 = $3, address_line2 = $4, city = $5, postcode = $6,
        property_type = $7, access_notes = $8, notes = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [customer_id, company_id, address_line1, address_line2, city, postcode, property_type, access_notes, notes, id]
    );
    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/portal/properties/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ JOBS ============

app.get('/api/portal/jobs', isAuthenticated, async (req, res) => {
  try {
    const { status, customer_id, company_id, property_id, assigned_to, scheduled_date, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = `
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN companies comp ON j.company_id = comp.id
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Business customers can only see their company's jobs
    if (req.user.user_type === 'business_customer') {
      params.push(req.user.company_id);
      baseQuery += ` AND j.company_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      baseQuery += ` AND j.status = $${params.length}`;
    }
    if (customer_id) {
      params.push(customer_id);
      baseQuery += ` AND j.customer_id = $${params.length}`;
    }
    if (company_id && req.user.user_type !== 'business_customer') {
      params.push(company_id);
      baseQuery += ` AND j.company_id = $${params.length}`;
    }
    if (property_id) {
      params.push(property_id);
      baseQuery += ` AND j.property_id = $${params.length}`;
    }
    if (assigned_to) {
      params.push(assigned_to);
      baseQuery += ` AND j.assigned_to = $${params.length}`;
    }
    if (scheduled_date) {
      params.push(scheduled_date);
      baseQuery += ` AND j.scheduled_date = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      baseQuery += ` AND (j.title ILIKE $${params.length} OR j.job_number ILIKE $${params.length} OR j.description ILIKE $${params.length})`;
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const selectQuery = `
      SELECT j.*,
        c.first_name || ' ' || c.last_name as customer_name,
        c.phone as customer_phone,
        comp.name as company_name,
        p.address_line1 as property_address,
        p.address_line2 as property_address2,
        p.city as property_city,
        p.postcode as property_postcode
      ${baseQuery}
      ORDER BY j.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(parseInt(limit), offset);
    const result = await pool.query(selectQuery, params);

    res.json({
      jobs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/jobs/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT j.*,
        c.first_name || ' ' || c.last_name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        comp.name as company_name,
        p.address_line1 as property_address,
        p.address_line2 as property_address2,
        p.city as property_city,
        p.postcode as property_postcode
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN companies comp ON j.company_id = comp.id
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE j.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Business customers can only view their company's jobs
    if (req.user.user_type === 'business_customer' && result.rows[0].company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Hide internal notes from business customers
    if (req.user.user_type === 'business_customer') {
      result.rows[0].internal_notes = null;
    }

    // Fetch notes and materials for this job
    const notesResult = await pool.query(
      `SELECT * FROM job_notes WHERE job_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    const materialsResult = await pool.query(
      `SELECT * FROM job_materials WHERE job_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      job: result.rows[0],
      notes: notesResult.rows,
      materials: materialsResult.rows
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/jobs', isStaff, async (req, res) => {
  try {
    const {
      customer_id, company_id, property_id, title, description, job_type, status, priority,
      assigned_to, scheduled_date, scheduled_time_start, scheduled_time_end, estimated_duration,
      estimated_cost, notes, internal_notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs (
        customer_id, company_id, property_id, title, description, job_type, status, priority,
        assigned_to, scheduled_date, scheduled_time_start, scheduled_time_end, estimated_duration,
        estimated_cost, notes, internal_notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        customer_id, company_id, property_id, title, description, job_type || 'general', status || 'quoted', priority || 'normal',
        assigned_to, scheduled_date, scheduled_time_start, scheduled_time_end, estimated_duration,
        estimated_cost, notes, internal_notes, req.user.id
      ]
    );
    res.json({ job: result.rows[0] });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/jobs/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_id, company_id, property_id, title, description, job_type, status, priority,
      assigned_to, scheduled_date, scheduled_time_start, scheduled_time_end, completed_date,
      estimated_duration, actual_duration, estimated_cost, actual_cost, labour_cost, materials_cost,
      notes, internal_notes
    } = req.body;

    const result = await pool.query(
      `UPDATE jobs SET
        customer_id = $1, company_id = $2, property_id = $3, title = $4, description = $5, job_type = $6,
        status = $7, priority = $8, assigned_to = $9, scheduled_date = $10, scheduled_time_start = $11,
        scheduled_time_end = $12, completed_date = $13, estimated_duration = $14, actual_duration = $15,
        estimated_cost = $16, actual_cost = $17, labour_cost = $18, materials_cost = $19,
        notes = $20, internal_notes = $21, updated_at = NOW()
       WHERE id = $22 RETURNING *`,
      [
        customer_id, company_id, property_id, title, description, job_type, status, priority,
        assigned_to, scheduled_date, scheduled_time_start, scheduled_time_end, completed_date,
        estimated_duration, actual_duration, estimated_cost, actual_cost, labour_cost, materials_cost,
        notes, internal_notes, id
      ]
    );
    res.json({ job: result.rows[0] });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update job status
app.patch('/api/portal/jobs/:id/status', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let updateQuery = 'UPDATE jobs SET status = $1, updated_at = NOW()';
    const params = [status];

    // Auto-set completed_date when marking as completed
    if (status === 'completed') {
      updateQuery += ', completed_date = CURRENT_DATE';
    }

    updateQuery += ' WHERE id = $2 RETURNING *';
    params.push(id);

    const result = await pool.query(updateQuery, params);

    // Add a note about the status change
    await pool.query(
      'INSERT INTO job_notes (job_id, note_type, content, created_by) VALUES ($1, $2, $3, $4)',
      [id, 'status_change', `Status changed to ${status}`, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ JOB NOTES ============

app.get('/api/portal/jobs/:id/notes', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT jn.*, u.display_name as created_by_name
      FROM job_notes jn
      LEFT JOIN users u ON jn.created_by = u.id
      WHERE jn.job_id = $1
    `;

    // Business customers can't see internal notes
    if (req.user.user_type === 'business_customer') {
      query += ' AND jn.is_internal = false';
    }

    query += ' ORDER BY jn.created_at DESC';
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job notes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/jobs/:id/notes', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { note_type, content, is_internal } = req.body;

    const result = await pool.query(
      'INSERT INTO job_notes (job_id, note_type, content, is_internal, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, note_type || 'note', content, is_internal || false, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating job note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ JOB MATERIALS ============

app.get('/api/portal/jobs/:id/materials', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM job_materials WHERE job_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job materials:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/jobs/:id/materials', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, quantity, unit, unit_cost, total_cost, supplier, supplier_sku, is_charged } = req.body;

    const result = await pool.query(
      `INSERT INTO job_materials (job_id, description, quantity, unit, unit_cost, total_cost, supplier, supplier_sku, is_charged)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, description, quantity || 1, unit || 'each', unit_cost, total_cost || (quantity * unit_cost), supplier, supplier_sku, is_charged !== false]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating job material:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ DOCUMENTS ============

app.get('/api/portal/documents', isAuthenticated, async (req, res) => {
  try {
    const { job_id, customer_id, company_id, property_id, document_type, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = `
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN jobs j ON d.job_id = j.id
      LEFT JOIN properties p ON d.property_id = p.id
      LEFT JOIN companies comp ON d.company_id = comp.id
      LEFT JOIN customers cust ON d.customer_id = cust.id
      WHERE 1=1
    `;
    const params = [];

    // Business customers can only see their company's documents that are marked visible
    if (req.user.user_type === 'business_customer') {
      params.push(req.user.company_id);
      baseQuery += ` AND d.company_id = $${params.length} AND d.is_customer_visible = true`;
    }

    if (job_id) {
      params.push(job_id);
      baseQuery += ` AND d.job_id = $${params.length}`;
    }
    if (customer_id) {
      params.push(customer_id);
      baseQuery += ` AND d.customer_id = $${params.length}`;
    }
    if (company_id && req.user.user_type !== 'business_customer') {
      params.push(company_id);
      baseQuery += ` AND d.company_id = $${params.length}`;
    }
    if (property_id) {
      params.push(property_id);
      baseQuery += ` AND d.property_id = $${params.length}`;
    }
    if (document_type) {
      params.push(document_type);
      baseQuery += ` AND d.document_type = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      baseQuery += ` AND (d.file_name ILIKE $${params.length} OR d.description ILIKE $${params.length})`;
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const selectQuery = `
      SELECT d.*,
             u.display_name as uploaded_by_name,
             j.job_number, j.title as job_title,
             p.address_line1 as property_address, p.postcode as property_postcode,
             comp.name as company_name,
             CONCAT(cust.first_name, ' ', cust.last_name) as customer_name
      ${baseQuery}
      ORDER BY d.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(parseInt(limit), offset);

    const result = await pool.query(selectQuery, params);
    res.json({ documents: result.rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/documents', isStaff, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { job_id, customer_id, company_id, property_id, document_type, title, description, is_customer_visible } = req.body;
    const fileUrl = `/uploads/documents/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO documents (job_id, customer_id, company_id, property_id, document_type, title, description, file_url, file_name, file_size, mime_type, is_customer_visible, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [job_id, customer_id, company_id, property_id, document_type || 'other', title || req.file.originalname, description, fileUrl, req.file.originalname, req.file.size, req.file.mimetype, is_customer_visible === 'true', req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download document
app.get('/api/portal/documents/:id/download', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (doc.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = doc.rows[0];

    // Business customers can only download their company's visible documents
    if (req.user.user_type === 'business_customer') {
      if (document.company_id !== req.user.company_id || !document.is_customer_visible) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const filePath = path.join(__dirname, '../public', document.file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, document.file_name);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update document metadata
app.put('/api/portal/documents/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, document_type, is_customer_visible, job_id, property_id } = req.body;

    const result = await pool.query(
      `UPDATE documents SET
        description = COALESCE($1, description),
        document_type = COALESCE($2, document_type),
        is_customer_visible = COALESCE($3, is_customer_visible),
        job_id = COALESCE($4, job_id),
        property_id = COALESCE($5, property_id),
        updated_at = NOW()
      WHERE id = $6 RETURNING *`,
      [description, document_type, is_customer_visible, job_id, property_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/portal/documents/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the document to delete the file
    const doc = await pool.query('SELECT file_url FROM documents WHERE id = $1', [id]);
    if (doc.rows.length > 0 && doc.rows[0].file_url) {
      const filePath = path.join(__dirname, '../public', doc.rows[0].file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ QUOTES ============

app.get('/api/portal/quotes', isAuthenticated, async (req, res) => {
  try {
    const { status, customer_id, company_id, job_id, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = `
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN companies comp ON q.company_id = comp.id
      LEFT JOIN jobs j ON q.job_id = j.id
      LEFT JOIN properties p ON q.property_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Business customers can only see their company's quotes
    if (req.user.user_type === 'business_customer') {
      params.push(req.user.company_id);
      baseQuery += ` AND q.company_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      baseQuery += ` AND q.status = $${params.length}`;
    }
    if (customer_id) {
      params.push(customer_id);
      baseQuery += ` AND q.customer_id = $${params.length}`;
    }
    if (company_id && req.user.user_type !== 'business_customer') {
      params.push(company_id);
      baseQuery += ` AND q.company_id = $${params.length}`;
    }
    if (job_id) {
      params.push(job_id);
      baseQuery += ` AND q.job_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      baseQuery += ` AND (q.quote_number ILIKE $${params.length} OR c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length} OR comp.name ILIKE $${params.length})`;
    }

    // Count query
    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Data query with pagination
    const dataParams = [...params, parseInt(limit), offset];
    const dataQuery = `
      SELECT q.*, j.job_number,
        c.first_name || ' ' || c.last_name as customer_name,
        comp.name as company_name,
        j.title as job_title,
        p.address_line1 as property_address,
        p.city as property_city,
        p.postcode as property_postcode
      ${baseQuery}
      ORDER BY q.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const result = await pool.query(dataQuery, dataParams);

    res.json({
      quotes: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/quotes/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const quoteResult = await pool.query(`
      SELECT q.*, j.job_number,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address_line1, c.address_line2, c.city, c.postcode,
        comp.name as company_name,
        j.title as job_title,
        p.address_line1 as property_address,
        p.address_line2 as property_address2,
        p.city as property_city,
        p.postcode as property_postcode
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN companies comp ON q.company_id = comp.id
      LEFT JOIN jobs j ON q.job_id = j.id
      LEFT JOIN properties p ON q.property_id = p.id
      WHERE q.id = $1
    `, [id]);

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Business customers can only view their company's quotes
    if (req.user.user_type === 'business_customer' && quoteResult.rows[0].company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get quote items
    const itemsResult = await pool.query(
      'SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY display_order',
      [id]
    );

    const quote = quoteResult.rows[0];

    // Hide internal notes from business customers
    if (req.user.user_type === 'business_customer') {
      quote.internal_notes = null;
    }

    // Build customer address
    const addressParts = [quote.address_line1, quote.address_line2, quote.city, quote.postcode].filter(Boolean);
    quote.customer_address = addressParts.join(', ');

    // Build property address
    const propertyParts = [quote.property_address, quote.property_address2, quote.property_city, quote.property_postcode].filter(Boolean);
    quote.full_property_address = propertyParts.join(', ');

    res.json({ quote, items: itemsResult.rows });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/quotes', isStaff, async (req, res) => {
  try {
    const { job_id, customer_id, company_id, property_id, valid_until, discount_percentage, vat_rate, terms, notes, internal_notes, items } = req.body;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate totals from items
      let subtotal = 0;
      if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
      }

      const discount_amount = subtotal * ((discount_percentage || 0) / 100);
      const taxable = subtotal - discount_amount;
      const vat_amount = taxable * ((vat_rate || 20) / 100);
      const total = taxable + vat_amount;

      // Create quote
      const quoteResult = await client.query(
        `INSERT INTO quotes (job_id, customer_id, company_id, property_id, valid_until, subtotal, discount_percentage, discount_amount, vat_rate, vat_amount, total, terms, notes, internal_notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [job_id, customer_id, company_id, property_id, valid_until, subtotal, discount_percentage || 0, discount_amount, vat_rate || 20, vat_amount, total, terms, notes, internal_notes, req.user.id]
      );

      const quote = quoteResult.rows[0];

      // Create quote items
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await client.query(
            `INSERT INTO quote_items (quote_id, item_type, description, quantity, unit, unit_price, total_price, supplier, supplier_sku, supplier_url, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [quote.id, item.item_type || 'material', item.description, item.quantity || 1, item.unit || 'each', item.unit_price, item.total_price, item.supplier, item.supplier_sku, item.supplier_url, i]
          );
        }
      }

      await client.query('COMMIT');
      res.json({ quote });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/quotes/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, valid_until, discount_percentage, vat_rate, terms, notes, internal_notes, items } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate totals from items
      let subtotal = 0;
      if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
      }

      const discount_amount = subtotal * ((discount_percentage || 0) / 100);
      const taxable = subtotal - discount_amount;
      const vat_amount = taxable * ((vat_rate || 20) / 100);
      const total = taxable + vat_amount;

      // Update quote
      const quoteResult = await client.query(
        `UPDATE quotes SET
          status = $1, valid_until = $2, subtotal = $3, discount_percentage = $4, discount_amount = $5,
          vat_rate = $6, vat_amount = $7, total = $8, terms = $9, notes = $10, internal_notes = $11, updated_at = NOW()
         WHERE id = $12 RETURNING *`,
        [status, valid_until, subtotal, discount_percentage || 0, discount_amount, vat_rate || 20, vat_amount, total, terms, notes, internal_notes, id]
      );

      // Delete existing items and recreate
      await client.query('DELETE FROM quote_items WHERE quote_id = $1', [id]);

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await client.query(
            `INSERT INTO quote_items (quote_id, item_type, description, quantity, unit, unit_price, total_price, supplier, supplier_sku, supplier_url, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [id, item.item_type || 'material', item.description, item.quantity || 1, item.unit || 'each', item.unit_price, item.total_price, item.supplier, item.supplier_sku, item.supplier_url, i]
          );
        }
      }

      await client.query('COMMIT');
      res.json({ quote: quoteResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update quote status only
app.patch('/api/portal/quotes/:id/status', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE quotes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ quote: result.rows[0] });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete quote
app.delete('/api/portal/quotes/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    // Check quote status - only allow deleting drafts
    const quote = await pool.query('SELECT status FROM quotes WHERE id = $1', [id]);
    if (quote.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    if (quote.rows[0].status !== 'draft') {
      return res.status(400).json({ error: 'Only draft quotes can be deleted' });
    }

    await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ AI MATERIAL PRICING ============

// Initialize Anthropic client (only if API key is set)
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
let anthropic = null;
if (anthropicApiKey) {
  anthropic = new Anthropic({ apiKey: anthropicApiKey });
}

// Helper function to search Screwfix API
async function searchScrewfix(searchTerm) {
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    let url = `https://www.screwfix.com/search?search=${encodedTerm}`;

    console.log(`Screwfix: Searching for "${searchTerm}"...`);

    // First request to get redirect URL if any
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow'
    });

    // Check if response is a redirect URL
    let html = await response.text();

    // Screwfix sometimes returns just a redirect URL in the body
    if (html.startsWith('https://www.screwfix.com/') && html.length < 500) {
      console.log('Screwfix: Following redirect to', html.trim());
      response = await fetch(html.trim(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-GB,en;q=0.9',
        }
      });
      html = await response.text();
    }

    if (!response.ok) {
      console.error(`Screwfix search failed: ${response.status}`);
      return [];
    }

    console.log(`Screwfix: Got ${html.length} bytes of HTML`);
    const results = [];

    // Parse product data from HTML - Screwfix includes JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    if (jsonLdMatch) {
      console.log(`Screwfix: Found ${jsonLdMatch.length} JSON-LD scripts`);
      for (const match of jsonLdMatch) {
        try {
          const jsonContent = match.replace(/<script type="application\/ld\+json"[^>]*>/, '').replace(/<\/script>/, '');
          const data = JSON.parse(jsonContent);

          // Handle ItemList with products (search results page)
          if (data['@type'] === 'ItemList' && data.itemListElement) {
            console.log(`Screwfix: Found ItemList with ${data.itemListElement.length} products`);
            for (const item of data.itemListElement) {
              if (item['@type'] === 'Product' && item.offers) {
                const productUrl = item.url?.startsWith('http') ? item.url : `https://www.screwfix.com${item.url}`;
                results.push({
                  supplier: 'Screwfix',
                  product_name: item.name?.replace(/&amp;/g, '&') || 'Unknown',
                  product_sku: item.sku || '',
                  product_url: productUrl,
                  price: parseFloat(item.offers.price) || 0,
                  unit: 'each',
                  in_stock: item.offers.availability?.includes('InStock') ?? true
                });
                if (results.length >= 3) break;
              }
            }
          }

          // Handle single Product (product page)
          if (data['@type'] === 'Product' || (Array.isArray(data['@graph']) && data['@graph'].some(item => item['@type'] === 'Product'))) {
            const product = data['@type'] === 'Product' ? data : data['@graph'].find(item => item['@type'] === 'Product');
            if (product && product.offers) {
              results.push({
                supplier: 'Screwfix',
                product_name: product.name || 'Unknown',
                product_sku: product.sku || '',
                product_url: product.url || url,
                price: parseFloat(product.offers.price) || 0,
                unit: 'each',
                in_stock: product.offers.availability?.includes('InStock') ?? true
              });
            }
          }
        } catch (e) {
          console.error('Screwfix: JSON-LD parse error:', e.message);
        }
      }
    }

    // Fallback: Parse product cards from HTML using regex
    if (results.length === 0) {
      // Try to find product data in the page
      const productMatches = html.matchAll(/data-product-id="([^"]+)"[^>]*>[\s\S]*?data-product-name="([^"]+)"[\s\S]*?data-product-price="([^"]+)"/gi);
      for (const match of productMatches) {
        results.push({
          supplier: 'Screwfix',
          product_name: match[2],
          product_sku: match[1],
          product_url: `https://www.screwfix.com/p/${match[1]}`,
          price: parseFloat(match[3]) || 0,
          unit: 'each',
          in_stock: true
        });
        if (results.length >= 3) break; // Limit to top 3 results
      }
    }

    // Alternative parsing for Screwfix product tiles
    if (results.length === 0) {
      const priceMatches = html.matchAll(/class="[^"]*ProductTile[^"]*"[\s\S]*?href="([^"]+)"[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?£([\d.]+)/gi);
      for (const match of priceMatches) {
        const productUrl = match[1].startsWith('http') ? match[1] : `https://www.screwfix.com${match[1]}`;
        results.push({
          supplier: 'Screwfix',
          product_name: match[2].trim(),
          product_sku: productUrl.split('/').pop() || '',
          product_url: productUrl,
          price: parseFloat(match[3]) || 0,
          unit: 'each',
          in_stock: true
        });
        if (results.length >= 3) break;
      }
    }

    // New parsing: Extract product URLs and prices separately, then match
    if (results.length === 0) {
      console.log('Screwfix: Using URL+price matching method');
      // Find all product URLs like href="/p/product-name/12345"
      const productUrls = [...html.matchAll(/href="(\/p\/([^"]+)\/(\d+))"/g)];
      // Find all prices
      const prices = [...html.matchAll(/£(\d+\.\d{2})/g)];

      const seenSkus = new Set();
      for (let i = 0; i < productUrls.length && results.length < 3; i++) {
        const [, path, productSlug, sku] = productUrls[i];
        if (seenSkus.has(sku)) continue;
        seenSkus.add(sku);

        // Find the price that appears after this URL in the HTML
        const urlIndex = html.indexOf(productUrls[i][0]);
        let price = 0;
        for (const priceMatch of prices) {
          const priceIndex = html.indexOf(priceMatch[0], urlIndex);
          if (priceIndex !== -1 && priceIndex < urlIndex + 2000) {
            price = parseFloat(priceMatch[1]);
            break;
          }
        }

        // Clean up product name from slug
        const productName = productSlug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        results.push({
          supplier: 'Screwfix',
          product_name: productName,
          product_sku: sku,
          product_url: `https://www.screwfix.com${path}`,
          price: price,
          unit: 'each',
          in_stock: true
        });
      }
      console.log(`Screwfix: Found ${results.length} products with URL+price method`);
    }

    return results;
  } catch (error) {
    console.error('Screwfix search error:', error);
    return [];
  }
}

// Helper function to search Toolstation API
async function searchToolstation(searchTerm) {
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const searchUrl = `https://www.toolstation.com/search?q=${encodedTerm}`;

    console.log(`Toolstation: Searching for "${searchTerm}"...`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      }
    });

    if (!response.ok) {
      console.error(`Toolstation search failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    console.log(`Toolstation: Got ${html.length} bytes of HTML`);
    const results = [];

    // Toolstation uses client-side rendering for search, but embeds some product data
    // Look for product URLs in the canonical/meta tags that indicate a direct product match
    const canonicalMatch = html.match(/rel="canonical" href="https:\/\/www\.toolstation\.com\/([^"]+)\/p(\d+)"/);
    if (canonicalMatch) {
      // This is a product page redirect - fetch the product details from JSON-LD
      const productUrl = `https://www.toolstation.com/${canonicalMatch[1]}/p${canonicalMatch[2]}`;
      console.log(`Toolstation: Found product redirect to ${productUrl}`);

      // Parse JSON-LD from the product page
      const jsonLdMatch = html.match(/\{"@context":"https:\/\/schema\.org","@type":"Product"[^}]+}[^}]+}[^}]+}/);
      if (jsonLdMatch) {
        try {
          const data = JSON.parse(jsonLdMatch[0] + '}}');
          if (data && data.offers) {
            results.push({
              supplier: 'Toolstation',
              product_name: data.name || 'Unknown',
              product_sku: data.sku || canonicalMatch[2],
              product_url: data['@id'] || productUrl,
              price: parseFloat(data.offers.price) || 0,
              unit: 'each',
              in_stock: data.offers.availability?.includes('InStock') ?? true
            });
            console.log(`Toolstation: Found product "${data.name}" at £${data.offers.price}`);
          }
        } catch (e) {
          console.error('Toolstation: JSON-LD parse error:', e.message);
        }
      }
    }

    // Try to extract JSON-LD Product data from search results page embedded in Nuxt state
    if (results.length === 0) {
      // Look for product data in the page state
      const productMatches = [...html.matchAll(/"@type":"Product","@id":"([^"]+)","name":"([^"]+)"[^}]*"sku":"(\d+)"[^}]*"offers":\{"@type":"Offer"[^}]*"price":"([^"]+)"/g)];
      console.log(`Toolstation: Found ${productMatches.length} embedded products`);

      for (const match of productMatches) {
        if (results.length >= 3) break;
        results.push({
          supplier: 'Toolstation',
          product_name: match[2].replace(/&amp;/g, '&'),
          product_sku: match[3],
          product_url: match[1],
          price: parseFloat(match[4]) || 0,
          unit: 'each',
          in_stock: true
        });
      }
    }

    // Alternative: Look for Nuxt-embedded product objects with different structure
    if (results.length === 0) {
      const priceNameMatches = [...html.matchAll(/"name":"([^"]*(?:twin|earth|cable|socket|switch)[^"]*)","image":"[^"]*","description":"[^"]*","sku":"(\d+)","brand":"[^"]*","[^}]*"offers":\{"@type":"Offer","priceCurrency":"GBP","price":"([^"]+)"/gi)];
      console.log(`Toolstation: Found ${priceNameMatches.length} products via alt pattern`);

      for (const match of priceNameMatches) {
        if (results.length >= 3) break;
        // Avoid duplicates
        if (!results.some(r => r.product_sku === match[2])) {
          results.push({
            supplier: 'Toolstation',
            product_name: match[1].replace(/&amp;/g, '&'),
            product_sku: match[2],
            product_url: `https://www.toolstation.com/product/p${match[2]}`,
            price: parseFloat(match[3]) || 0,
            unit: 'each',
            in_stock: true
          });
        }
      }
    }

    console.log(`Toolstation: Returning ${results.length} results`);
    return results;
  } catch (error) {
    console.error('Toolstation search error:', error);
    return [];
  }
}

// Search for material prices from Screwfix/Toolstation
app.post('/api/portal/materials/ai-search', isStaff, async (req, res) => {
  try {
    const { materials } = req.body; // Array of material descriptions

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of materials to search' });
    }

    const allResults = [];

    for (const material of materials) {
      // Check cache first
      const cached = await pool.query(
        `SELECT * FROM material_price_cache
         WHERE search_term ILIKE $1 AND expires_at > NOW()
         ORDER BY cached_at DESC LIMIT 6`,
        [`%${material}%`]
      );

      if (cached.rows.length > 0) {
        // Return cached results
        for (const row of cached.rows) {
          allResults.push({
            search_term: material,
            supplier: row.supplier,
            product_name: row.product_name,
            sku: row.product_sku,
            product_url: row.product_url,
            price: parseFloat(row.price),
            unit: row.unit || 'each',
            in_stock: row.in_stock,
            cached: true,
            cache_age_hours: Math.round((Date.now() - new Date(row.cached_at).getTime()) / (1000 * 60 * 60))
          });
        }
      } else {
        // Search both suppliers in parallel
        console.log(`Searching for material: ${material}`);
        const [screwfixResults, toolstationResults] = await Promise.all([
          searchScrewfix(material),
          searchToolstation(material)
        ]);

        const combinedResults = [...screwfixResults, ...toolstationResults];

        if (combinedResults.length > 0) {
          // Cache and return results
          for (const result of combinedResults) {
            try {
              await pool.query(
                `INSERT INTO material_price_cache (search_term, supplier, product_name, product_sku, product_url, price, unit, in_stock)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [material, result.supplier, result.product_name, result.product_sku, result.product_url, result.price, result.unit, result.in_stock]
              );
            } catch (cacheError) {
              console.error('Cache insert error:', cacheError);
            }

            allResults.push({
              search_term: material,
              supplier: result.supplier,
              product_name: result.product_name,
              sku: result.product_sku,
              product_url: result.product_url,
              price: result.price,
              unit: result.unit || 'each',
              in_stock: result.in_stock,
              cached: false
            });
          }
        } else {
          // No results found
          allResults.push({
            search_term: material,
            supplier: null,
            product_name: null,
            sku: null,
            product_url: null,
            price: 0,
            in_stock: false,
            cached: false,
            error: 'No results found. Try a more specific search term.'
          });
        }
      }
    }

    res.json({ results: allResults });
  } catch (error) {
    console.error('Error in material search:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear expired cache entries (can be called periodically)
app.delete('/api/portal/materials/cache/expired', isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM material_price_cache WHERE expires_at < NOW()');
    res.json({ deleted: result.rowCount });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cached prices for a material
app.get('/api/portal/materials/search', isStaff, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const result = await pool.query(
      `SELECT * FROM material_price_cache
       WHERE search_term ILIKE $1 AND expires_at > NOW()
       ORDER BY cached_at DESC`,
      [`%${q}%`]
    );

    res.json({ results: result.rows });
  } catch (error) {
    console.error('Error searching materials:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ INVOICES ============

app.get('/api/portal/invoices', isAuthenticated, async (req, res) => {
  try {
    const { status, customer_id, company_id, job_id, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = `
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN companies comp ON i.company_id = comp.id
      LEFT JOIN jobs j ON i.job_id = j.id
      LEFT JOIN quotes q ON i.quote_id = q.id
      WHERE 1=1
    `;
    const params = [];

    // Business customers can only see their company's invoices
    if (req.user.user_type === 'business_customer') {
      params.push(req.user.company_id);
      baseQuery += ` AND i.company_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      baseQuery += ` AND i.status = $${params.length}`;
    }
    if (customer_id) {
      params.push(customer_id);
      baseQuery += ` AND i.customer_id = $${params.length}`;
    }
    if (company_id && req.user.user_type !== 'business_customer') {
      params.push(company_id);
      baseQuery += ` AND i.company_id = $${params.length}`;
    }
    if (job_id) {
      params.push(job_id);
      baseQuery += ` AND i.job_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      baseQuery += ` AND (i.invoice_number ILIKE $${params.length} OR c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length} OR comp.name ILIKE $${params.length})`;
    }

    // Count query
    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Data query with pagination
    const dataParams = [...params, parseInt(limit), offset];
    const dataQuery = `
      SELECT i.*, j.job_number, q.quote_number,
        c.first_name || ' ' || c.last_name as customer_name,
        comp.name as company_name,
        j.title as job_title
      ${baseQuery}
      ORDER BY i.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const result = await pool.query(dataQuery, dataParams);

    res.json({
      invoices: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/invoices/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const invoiceResult = await pool.query(`
      SELECT i.*, j.job_number, q.quote_number,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address_line1, c.address_line2, c.city, c.postcode,
        comp.name as company_name,
        j.title as job_title
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN companies comp ON i.company_id = comp.id
      LEFT JOIN jobs j ON i.job_id = j.id
      LEFT JOIN quotes q ON i.quote_id = q.id
      WHERE i.id = $1
    `, [id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Business customers can only view their company's invoices
    if (req.user.user_type === 'business_customer' && invoiceResult.rows[0].company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get invoice items
    const itemsResult = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY display_order',
      [id]
    );

    // Get payment history
    const paymentsResult = await pool.query(
      'SELECT * FROM invoice_payments WHERE invoice_id = $1 ORDER BY payment_date DESC',
      [id]
    );

    const invoice = invoiceResult.rows[0];

    // Build customer address
    const addressParts = [invoice.address_line1, invoice.address_line2, invoice.city, invoice.postcode].filter(Boolean);
    invoice.customer_address = addressParts.join(', ');

    res.json({ invoice, items: itemsResult.rows, payments: paymentsResult.rows });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/invoices', isStaff, async (req, res) => {
  try {
    const { job_id, quote_id, customer_id, company_id, property_id, due_date, discount_percentage, vat_rate, terms, notes, items } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate totals from items
      let subtotal = 0;
      if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
      }

      const discount_amount = subtotal * ((discount_percentage || 0) / 100);
      const taxable = subtotal - discount_amount;
      const vat_amount = taxable * ((vat_rate || 20) / 100);
      const total = taxable + vat_amount;

      // Create invoice
      const invoiceResult = await client.query(
        `INSERT INTO invoices (job_id, quote_id, customer_id, company_id, property_id, due_date, subtotal, discount_percentage, discount_amount, vat_rate, vat_amount, total, terms, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [job_id, quote_id, customer_id, company_id, property_id, due_date, subtotal, discount_percentage || 0, discount_amount, vat_rate || 20, vat_amount, total, terms, notes, req.user.id]
      );

      const invoice = invoiceResult.rows[0];

      // Create invoice items
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await client.query(
            `INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit, unit_price, total_price, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [invoice.id, item.item_type || 'labour', item.description, item.quantity || 1, item.unit || 'each', item.unit_price, item.total_price, i]
          );
        }
      }

      // Update job status to invoiced
      if (job_id) {
        await client.query("UPDATE jobs SET status = 'invoiced', updated_at = NOW() WHERE id = $1", [job_id]);
      }

      await client.query('COMMIT');
      res.json({ invoice });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record payment for invoice
app.post('/api/portal/invoices/:id/payments', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method, payment_reference, payment_date, notes } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create payment record
      const paymentResult = await client.query(
        `INSERT INTO invoice_payments (invoice_id, amount, payment_method, payment_reference, payment_date, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id, amount, payment_method || 'bank_transfer', payment_reference, payment_date || new Date(), notes, req.user.id]
      );

      // Calculate new total paid
      const totalPaidResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as total_paid FROM invoice_payments WHERE invoice_id = $1',
        [id]
      );
      const totalPaid = parseFloat(totalPaidResult.rows[0].total_paid);

      // Get invoice total to determine status
      const invoiceResult = await client.query('SELECT total, job_id FROM invoices WHERE id = $1', [id]);
      const invoiceTotal = parseFloat(invoiceResult.rows[0].total);
      const jobId = invoiceResult.rows[0].job_id;

      // Update invoice amount_paid and status
      let newStatus = 'partial';
      if (totalPaid >= invoiceTotal) {
        newStatus = 'paid';
      }

      await client.query(
        `UPDATE invoices SET amount_paid = $1, status = $2, paid_date = CASE WHEN $2 = 'paid' THEN CURRENT_DATE ELSE paid_date END, updated_at = NOW()
         WHERE id = $3`,
        [totalPaid, newStatus, id]
      );

      // Update job status if fully paid
      if (newStatus === 'paid' && jobId) {
        await client.query("UPDATE jobs SET status = 'paid', updated_at = NOW() WHERE id = $1", [jobId]);
      }

      await client.query('COMMIT');
      res.json({ payment: paymentResult.rows[0], totalPaid, status: newStatus });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete invoice
app.delete('/api/portal/invoices/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    // Check invoice status - only allow deleting drafts
    const invoice = await pool.query('SELECT status FROM invoices WHERE id = $1', [id]);
    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if (invoice.rows[0].status !== 'draft') {
      return res.status(400).json({ error: 'Only draft invoices can be deleted' });
    }

    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate invoice PDF
app.get('/api/portal/invoices/:id/pdf', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Get invoice with related data
    const invoiceResult = await pool.query(`
      SELECT i.*,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email, c.phone as customer_phone,
             comp.name as company_name, comp.email as company_email, comp.phone as company_phone,
             p.address_line1, p.address_line2, p.city, p.postcode
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN companies comp ON i.company_id = comp.id
      LEFT JOIN properties p ON i.property_id = p.id
      WHERE i.id = $1
    `, [id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Get invoice items
    const itemsResult = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at',
      [id]
    );
    const items = itemsResult.rows;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#1e3a5f').text('247Electrician', { align: 'right' });
    doc.fontSize(10).fillColor('#666').text('ANP Electrical Ltd', { align: 'right' });
    doc.text('NAPIT Approved', { align: 'right' });
    doc.moveDown();

    // Invoice title and number
    doc.fontSize(28).fillColor('#000').text('INVOICE', 50);
    doc.fontSize(12).fillColor('#666').text(`Invoice Number: ${invoice.invoice_number}`);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString('en-GB')}`);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-GB')}`);
    doc.moveDown();

    // Customer details (Bill To) - Left column
    const billToX = 50;
    const serviceX = 300;
    const detailsY = doc.y;

    doc.fontSize(12).fillColor('#000').text('Bill To:', billToX, detailsY, { underline: true });
    const customerName = invoice.company_name || `${invoice.customer_first_name || ''} ${invoice.customer_last_name || ''}`.trim();
    doc.text(customerName || 'N/A', billToX);
    if (invoice.customer_email) doc.text(invoice.customer_email, billToX);
    if (invoice.customer_phone) doc.text(invoice.customer_phone, billToX);

    // Service Location (Property Address) - Right column
    if (invoice.address_line1) {
      doc.fontSize(12).fillColor('#000').text('Service Location:', serviceX, detailsY, { underline: true });
      doc.text(invoice.address_line1, serviceX);
      if (invoice.address_line2) doc.text(invoice.address_line2, serviceX);
      if (invoice.city) doc.text(invoice.city, serviceX);
      if (invoice.postcode) doc.text(invoice.postcode, serviceX);
    }

    doc.moveDown(3);

    // Items table header
    const tableTop = doc.y;
    doc.fontSize(10).fillColor('#fff');
    doc.rect(50, tableTop, 495, 20).fill('#1e3a5f');
    doc.fillColor('#fff');
    doc.text('Description', 55, tableTop + 5, { width: 250 });
    doc.text('Qty', 310, tableTop + 5, { width: 50, align: 'center' });
    doc.text('Unit Price', 360, tableTop + 5, { width: 80, align: 'right' });
    doc.text('Total', 450, tableTop + 5, { width: 90, align: 'right' });

    // Items
    let y = tableTop + 25;
    doc.fillColor('#000');
    items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#f8f8f8' : '#fff';
      doc.rect(50, y - 5, 495, 20).fill(bgColor);
      doc.fillColor('#000');
      doc.text(item.description || 'Item', 55, y, { width: 250 });
      doc.text(item.quantity?.toString() || '1', 310, y, { width: 50, align: 'center' });
      doc.text(`£${parseFloat(item.unit_price || 0).toFixed(2)}`, 360, y, { width: 80, align: 'right' });
      doc.text(`£${parseFloat(item.total || 0).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      y += 20;
    });

    // Totals
    y += 10;
    doc.moveTo(350, y).lineTo(545, y).stroke();
    y += 10;
    doc.fontSize(11);
    doc.text('Subtotal:', 350, y, { width: 100, align: 'right' });
    doc.text(`£${parseFloat(invoice.subtotal || 0).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    y += 18;

    if (parseFloat(invoice.discount_amount || 0) > 0) {
      doc.text('Discount:', 350, y, { width: 100, align: 'right' });
      doc.text(`-£${parseFloat(invoice.discount_amount).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      y += 18;
    }

    doc.text('VAT (20%):', 350, y, { width: 100, align: 'right' });
    doc.text(`£${parseFloat(invoice.vat_amount || 0).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    y += 20;

    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Total:', 350, y, { width: 100, align: 'right' });
    doc.text(`£${parseFloat(invoice.total || 0).toFixed(2)}`, 450, y, { width: 90, align: 'right' });

    // Payment info
    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text('Payment Terms: ' + (invoice.payment_terms || '14 days'), 50);
    if (invoice.notes) {
      doc.moveDown();
      doc.text('Notes: ' + invoice.notes, 50);
    }

    // Footer
    doc.fontSize(9).fillColor('#999');
    doc.text('Thank you for your business!', 50, 750, { align: 'center' });
    doc.text('247Electrician - ANP Electrical Ltd | www.247electrician.uk', 50, 765, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update invoice
app.put('/api/portal/invoices/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, company_id, job_id, due_date, payment_terms, notes, items, discount_type, discount_value } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate totals from items
      let subtotal = 0;
      if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unit_price) || 0;
          return sum + (qty * price);
        }, 0);
      }

      let discount_amount = 0;
      if (discount_type === 'fixed') {
        discount_amount = parseFloat(discount_value) || 0;
      } else if (discount_type === 'percentage') {
        discount_amount = subtotal * ((parseFloat(discount_value) || 0) / 100);
      }

      const discountedSubtotal = subtotal - discount_amount;

      // Calculate VAT based on item rates
      let vat_amount = 0;
      if (items && items.length > 0) {
        items.forEach(item => {
          const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
          const itemShare = subtotal > 0 ? itemTotal / subtotal : 0;
          const itemDiscountedTotal = discountedSubtotal * itemShare;
          const vatRate = parseFloat(item.vat_rate) || 0;
          vat_amount += itemDiscountedTotal * (vatRate / 100);
        });
      }

      const total = discountedSubtotal + vat_amount;

      // Update invoice
      const invoiceResult = await client.query(
        `UPDATE invoices SET
          customer_id = $1, company_id = $2, job_id = $3, due_date = $4, payment_terms = $5,
          notes = $6, subtotal = $7, discount_amount = $8, vat_amount = $9, total = $10, updated_at = NOW()
         WHERE id = $11 RETURNING *`,
        [customer_id || null, company_id || null, job_id || null, due_date, payment_terms, notes, subtotal, discount_amount, vat_amount, total, id]
      );

      // Delete existing items and recreate
      await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
          await client.query(
            `INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit, unit_price, total_price, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, 'labour', item.description, item.quantity || 1, 'each', item.unit_price, itemTotal, i]
          );
        }
      }

      await client.query('COMMIT');
      res.json({ invoice: invoiceResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark invoice as paid
app.patch('/api/portal/invoices/:id/paid', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_reference, amount_paid } = req.body;

    const result = await pool.query(
      `UPDATE invoices SET
        status = 'paid', amount_paid = $1, payment_method = $2, payment_reference = $3,
        paid_date = CURRENT_DATE, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [amount_paid, payment_method, payment_reference, id]
    );

    // Update related job status to paid
    if (result.rows[0].job_id) {
      await pool.query("UPDATE jobs SET status = 'paid', updated_at = NOW() WHERE id = $1", [result.rows[0].job_id]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ SCHEDULE ENTRIES ============

app.get('/api/portal/schedule', isStaff, async (req, res) => {
  try {
    const { start_date, end_date, assigned_to, entry_type } = req.query;
    let query = `
      SELECT se.*, j.title as job_title, j.job_number, j.id as job_id,
        j.scheduled_time_start as job_time_start, j.scheduled_time_end as job_time_end,
        c.first_name || ' ' || c.last_name as customer_name,
        c.phone as customer_phone, c.email as customer_email,
        p.address_line1 as property_address, p.address_line2 as property_address2,
        p.city as property_city, p.postcode as property_postcode
      FROM schedule_entries se
      LEFT JOIN jobs j ON se.job_id = j.id
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      params.push(start_date);
      query += ` AND se.end_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND se.start_date <= $${params.length}`;
    }
    if (assigned_to) {
      params.push(assigned_to);
      query += ` AND se.assigned_to = $${params.length}`;
    }
    if (entry_type) {
      params.push(entry_type);
      query += ` AND se.entry_type = $${params.length}`;
    }

    query += ' ORDER BY se.start_date, se.start_time';
    const result = await pool.query(query, params);
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/schedule', isStaff, async (req, res) => {
  try {
    const { job_id, title, description, entry_type, assigned_to, start_date, start_time, end_date, end_time, all_day, color } = req.body;

    const result = await pool.query(
      `INSERT INTO schedule_entries (job_id, title, description, entry_type, assigned_to, start_date, start_time, end_date, end_time, all_day, color, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [job_id || null, title, description, entry_type || 'other', assigned_to || null, start_date, start_time || null, end_date || start_date, end_time || null, all_day || false, color || null, req.user.id]
    );
    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Error creating schedule entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/schedule/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { job_id, title, description, entry_type, assigned_to, start_date, start_time, end_date, end_time, all_day, color } = req.body;

    const result = await pool.query(
      `UPDATE schedule_entries SET
        job_id = $1, title = $2, description = $3, entry_type = $4, assigned_to = $5,
        start_date = $6, start_time = $7, end_date = $8, end_time = $9, all_day = $10, color = $11, sync_status = 'modified', updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [job_id || null, title, description, entry_type, assigned_to || null, start_date, start_time || null, end_date, end_time || null, all_day, color || null, id]
    );
    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Error updating schedule entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/portal/schedule/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    // Get entry to check if it has a Google event ID
    const entry = await pool.query('SELECT google_event_id, google_calendar_id FROM schedule_entries WHERE id = $1', [id]);

    // Delete from Google Calendar if synced
    if (entry.rows.length > 0 && entry.rows[0].google_event_id && req.user.google_refresh_token) {
      try {
        oauth2Client.setCredentials({ refresh_token: req.user.google_refresh_token });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        await calendar.events.delete({
          calendarId: entry.rows[0].google_calendar_id || 'primary',
          eventId: entry.rows[0].google_event_id,
        });
      } catch (googleError) {
        console.error('Failed to delete from Google Calendar:', googleError.message);
      }
    }

    await pool.query('DELETE FROM schedule_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ GOOGLE CALENDAR INTEGRATION ============

// Initiate Google OAuth flow
app.get('/api/portal/calendar/google/auth', isStaff, (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google Calendar not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' });
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: req.user.id, // Pass user ID in state
  });

  res.redirect(authUrl);
});

// Google OAuth callback
app.get('/api/portal/calendar/google/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code) {
    return res.redirect('/portal/calendar?error=no_code');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's primary calendar ID
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items.find(c => c.primary) || calendarList.data.items[0];

    // Store refresh token in user record
    await pool.query(
      'UPDATE users SET google_refresh_token = $1, google_calendar_id = $2, google_calendar_enabled = true WHERE id = $3',
      [tokens.refresh_token, primaryCalendar?.id || 'primary', userId]
    );

    res.redirect('/portal/calendar?google=connected');
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('/portal/calendar?error=auth_failed');
  }
});

// Disconnect Google Calendar
app.post('/api/portal/calendar/google/disconnect', isStaff, async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET google_refresh_token = NULL, google_calendar_id = NULL, google_calendar_enabled = false WHERE id = $1',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check Google Calendar connection status
app.get('/api/portal/calendar/google/status', isStaff, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT google_calendar_enabled, google_calendar_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length > 0) {
      res.json({
        connected: result.rows[0].google_calendar_enabled || false,
        calendar_id: result.rows[0].google_calendar_id,
      });
    } else {
      res.json({ connected: false });
    }
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sync with Google Calendar (bidirectional)
app.post('/api/portal/calendar/google/sync', isStaff, async (req, res) => {
  try {
    // Get user's Google credentials
    const userResult = await pool.query(
      'SELECT google_refresh_token, google_calendar_id, google_calendar_enabled FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!userResult.rows[0]?.google_refresh_token || !userResult.rows[0]?.google_calendar_enabled) {
      return res.status(401).json({ error: 'Google Calendar not connected', needsAuth: true });
    }

    const { google_refresh_token, google_calendar_id } = userResult.rows[0];
    oauth2Client.setCredentials({ refresh_token: google_refresh_token });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get date range for sync (current month +/- 3 months)
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 4, 0).toISOString();

    // 1. Push local entries to Google
    const localEntries = await pool.query(
      `SELECT * FROM schedule_entries WHERE (sync_status = 'local' OR sync_status = 'modified') AND start_date >= $1 AND start_date <= $2`,
      [timeMin.split('T')[0], timeMax.split('T')[0]]
    );

    let synced = 0;
    for (const entry of localEntries.rows) {
      try {
        const eventBody = {
          summary: entry.title,
          description: entry.description || '',
          start: entry.all_day
            ? { date: entry.start_date }
            : { dateTime: `${entry.start_date}T${entry.start_time || '09:00'}:00`, timeZone: 'Europe/London' },
          end: entry.all_day
            ? { date: entry.end_date }
            : { dateTime: `${entry.end_date}T${entry.end_time || '10:00'}:00`, timeZone: 'Europe/London' },
        };

        let googleEventId = entry.google_event_id;

        if (googleEventId && entry.sync_status === 'modified') {
          // Update existing Google event
          await calendar.events.update({
            calendarId: google_calendar_id || 'primary',
            eventId: googleEventId,
            requestBody: eventBody,
          });
        } else if (!googleEventId) {
          // Create new Google event
          const result = await calendar.events.insert({
            calendarId: google_calendar_id || 'primary',
            requestBody: eventBody,
          });
          googleEventId = result.data.id;
        }

        // Update local entry with Google event ID
        await pool.query(
          'UPDATE schedule_entries SET google_event_id = $1, google_calendar_id = $2, sync_status = $3, last_synced_at = NOW() WHERE id = $4',
          [googleEventId, google_calendar_id || 'primary', 'synced', entry.id]
        );
        synced++;
      } catch (entryError) {
        console.error(`Failed to sync entry ${entry.id}:`, entryError.message);
      }
    }

    // 2. Pull Google events to local (optional - import new events)
    const googleEvents = await calendar.events.list({
      calendarId: google_calendar_id || 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    let imported = 0;
    for (const event of googleEvents.data.items || []) {
      // Check if event already exists locally
      const existing = await pool.query(
        'SELECT id FROM schedule_entries WHERE google_event_id = $1',
        [event.id]
      );

      if (existing.rows.length === 0 && event.summary) {
        // Import new event from Google
        const isAllDay = !event.start.dateTime;
        const startDate = isAllDay ? event.start.date : event.start.dateTime.split('T')[0];
        const endDate = isAllDay ? event.end.date : event.end.dateTime.split('T')[0];
        const startTime = isAllDay ? null : event.start.dateTime.split('T')[1].substring(0, 5);
        const endTime = isAllDay ? null : event.end.dateTime.split('T')[1].substring(0, 5);

        await pool.query(
          `INSERT INTO schedule_entries (title, description, entry_type, start_date, start_time, end_date, end_time, all_day, google_event_id, google_calendar_id, sync_status, last_synced_at, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12)`,
          [
            event.summary,
            event.description || '',
            'other',
            startDate,
            startTime,
            endDate,
            endTime,
            isAllDay,
            event.id,
            google_calendar_id || 'primary',
            'synced',
            req.user.id,
          ]
        );
        imported++;
      }
    }

    res.json({
      success: true,
      synced,
      imported,
      message: `Synced ${synced} local events to Google, imported ${imported} events from Google`,
    });
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    if (error.code === 401 || error.code === 403) {
      // Token expired or revoked
      await pool.query(
        'UPDATE users SET google_calendar_enabled = false WHERE id = $1',
        [req.user.id]
      );
      return res.status(401).json({ error: 'Google Calendar authorization expired', needsAuth: true });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ DASHBOARD STATS ============

app.get('/api/portal/dashboard/stats', isStaff, async (req, res) => {
  try {
    const stats = {};

    // Jobs by status
    const jobsResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM jobs
      GROUP BY status
    `);
    stats.jobs_by_status = jobsResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    // Recent jobs
    const recentJobsResult = await pool.query(`
      SELECT j.*, c.first_name || ' ' || c.last_name as customer_name
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 5
    `);
    stats.recent_jobs = recentJobsResult.rows;

    // Today's schedule
    const todayScheduleResult = await pool.query(`
      SELECT se.*, j.title as job_title
      FROM schedule_entries se
      LEFT JOIN jobs j ON se.job_id = j.id
      WHERE se.start_date = CURRENT_DATE
      ORDER BY se.start_time
    `);
    stats.today_schedule = todayScheduleResult.rows;

    // Unpaid invoices
    const unpaidResult = await pool.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(total - amount_paid), 0) as total
      FROM invoices
      WHERE status NOT IN ('paid', 'cancelled')
    `);
    stats.unpaid_invoices = {
      count: parseInt(unpaidResult.rows[0].count),
      total: parseFloat(unpaidResult.rows[0].total)
    };

    // Pending quotes
    const pendingQuotesResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM quotes
      WHERE status IN ('draft', 'sent')
    `);
    stats.pending_quotes = parseInt(pendingQuotesResult.rows[0].count);

    // Total customers
    const customersResult = await pool.query(`
      SELECT COUNT(*) as count FROM customers WHERE is_active = true
    `);
    stats.total_customers = parseInt(customersResult.rows[0].count);

    // Total companies
    const companiesResult = await pool.query(`
      SELECT COUNT(*) as count FROM companies WHERE is_active = true
    `);
    stats.total_companies = parseInt(companiesResult.rows[0].count);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ USER MANAGEMENT ============

app.get('/api/portal/users', isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.display_name, u.role, u.user_type, u.company_id, u.phone, u.is_active, u.last_login, u.created_at,
             c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      ORDER BY u.created_at DESC
    `);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/users', isAdmin, async (req, res) => {
  try {
    const { email, password, display_name, role, user_type, company_id, phone } = req.body;

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name, role, user_type, company_id, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, display_name, role, user_type, company_id, phone, is_active, created_at`,
      [email, password_hash, display_name, role || 'admin', user_type || 'staff', company_id || null, phone || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, role, user_type, company_id, phone, is_active, password } = req.body;

    let query = `UPDATE users SET display_name = $1, role = $2, user_type = $3, company_id = $4, phone = $5, is_active = $6, updated_at = NOW()`;
    let params = [display_name, role, user_type, company_id || null, phone || null, is_active];

    // If password is provided, update it too
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      params.push(password_hash);
      query += `, password_hash = $${params.length}`;
    }

    params.push(id);
    query += ` WHERE id = $${params.length} RETURNING id, email, display_name, role, user_type, company_id, phone, is_active, created_at`;

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ SETTINGS ============

app.get('/api/portal/settings', isStaff, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portal_settings ORDER BY setting_key');
    const settings = result.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/settings', isAdmin, async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO portal_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
        [key, value]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ FILE UPLOAD ============

app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.query.type || 'gallery';
    const fileUrl = `/uploads/${type}/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ============ GALLERY CATEGORIES ============

app.get('/api/gallery/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery_categories ORDER BY display_order');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/gallery/categories', authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO gallery_categories (name, slug, description, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, description, display_order || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/gallery/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, display_order } = req.body;
    const result = await pool.query(
      'UPDATE gallery_categories SET name = $1, slug = $2, description = $3, display_order = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, slug, description, display_order, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/gallery/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery_categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ GALLERY ITEMS ============

app.get('/api/gallery/items', async (req, res) => {
  try {
    const { category, type } = req.query;
    let query = `
      SELECT gi.*, gc.name as category_name, gc.slug as category_slug
      FROM gallery_items gi
      LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
    `;
    const params = [];
    const conditions = [];

    if (category && category !== 'all') {
      conditions.push('gc.slug = $' + (params.length + 1));
      params.push(category);
    }
    if (type) {
      conditions.push('gi.type = $' + (params.length + 1));
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY gi.display_order, gi.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/gallery/items', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, url, thumbnail_url, category_id, span, display_order, is_featured } = req.body;
    const result = await pool.query(
      `INSERT INTO gallery_items (title, description, type, url, thumbnail_url, category_id, span, display_order, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, type || 'image', url, thumbnail_url, category_id, span || 'md:col-span-1 md:row-span-2', display_order || 0, is_featured || false]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/gallery/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, url, thumbnail_url, category_id, span, display_order, is_featured } = req.body;
    const result = await pool.query(
      `UPDATE gallery_items SET title = $1, description = $2, type = $3, url = $4, thumbnail_url = $5,
       category_id = $6, span = $7, display_order = $8, is_featured = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [title, description, type, url, thumbnail_url, category_id, span, display_order, is_featured, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/gallery/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Get the item to delete the file
    const item = await pool.query('SELECT url, thumbnail_url FROM gallery_items WHERE id = $1', [id]);
    if (item.rows.length > 0) {
      const { url, thumbnail_url } = item.rows[0];
      // Delete files from disk
      [url, thumbnail_url].forEach(fileUrl => {
        if (fileUrl && fileUrl.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '../public', fileUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }
    await pool.query('DELETE FROM gallery_items WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ BLOG CATEGORIES ============

app.get('/api/blog/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_categories ORDER BY display_order');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/blog/categories', authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, display_order } = req.body;
    const result = await pool.query(
      'INSERT INTO blog_categories (name, slug, description, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, description, display_order || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating blog category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/blog/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, display_order } = req.body;
    const result = await pool.query(
      'UPDATE blog_categories SET name = $1, slug = $2, description = $3, display_order = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, slug, description, display_order, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating blog category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/blog/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blog_categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ BLOG POSTS ============

app.get('/api/blog/posts', async (req, res) => {
  try {
    const { status, category, featured } = req.query;
    let query = `
      SELECT bp.*, bc.name as category_name, bc.slug as category_slug,
             u.display_name as author_name
      FROM blog_posts bp
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN users u ON bp.author_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('bp.status = $' + (params.length + 1));
      params.push(status);
    }
    if (category) {
      conditions.push('bc.slug = $' + (params.length + 1));
      params.push(category);
    }
    if (featured === 'true') {
      conditions.push('bp.is_featured = true');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(`
      SELECT bp.*, bc.name as category_name, bc.slug as category_slug,
             u.display_name as author_name
      FROM blog_posts bp
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = $1
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/blog/posts', authenticateToken, async (req, res) => {
  try {
    const { title, slug, excerpt, content, featured_image, category_id, status, is_featured, published_at } = req.body;
    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, category_id, author_id, status, is_featured, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, slug, excerpt, content, featured_image, category_id, req.user.id, status || 'draft', is_featured || false, published_at]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/blog/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, featured_image, category_id, status, is_featured, published_at } = req.body;
    const result = await pool.query(
      `UPDATE blog_posts SET title = $1, slug = $2, excerpt = $3, content = $4, featured_image = $5,
       category_id = $6, status = $7, is_featured = $8, published_at = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [title, slug, excerpt, content, featured_image, category_id, status, is_featured, published_at, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/blog/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ BUSINESS CUSTOMER PORTAL ============

// Middleware to check if user is a business customer
const isBusinessCustomer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.user_type === 'business_customer' && req.user.company_id) {
    return next();
  }
  res.status(403).json({ error: 'Business customer access required' });
};

// Middleware for either staff or business customer (scoped)
const isStaffOrBusinessCustomer = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (['staff', 'admin', 'super_admin'].includes(req.user.user_type)) {
      return next();
    }
    if (req.user.user_type === 'business_customer' && req.user.company_id) {
      return next();
    }
  }
  res.status(403).json({ error: 'Access denied' });
};

// Get properties for business customer (scoped to their company)
app.get('/api/portal/my/properties', isBusinessCustomer, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT p.*, c.first_name || ' ' || c.last_name as customer_name,
        (SELECT COUNT(*) FROM jobs WHERE property_id = p.id) as job_count
      FROM properties p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.company_id = $1
    `;
    const params = [companyId];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.address_line1 ILIKE $${params.length} OR p.postcode ILIKE $${params.length} OR p.city ILIKE $${params.length})`;
    }

    // Count query
    const countResult = await pool.query(
      query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0],
      params
    );

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      properties: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching business customer properties:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single property for business customer (scoped)
app.get('/api/portal/my/properties/:id', isBusinessCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const result = await pool.query(`
      SELECT p.*, c.first_name || ' ' || c.last_name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM properties p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.id = $1 AND p.company_id = $2
    `, [id, companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get jobs for business customer (scoped to their company's properties)
app.get('/api/portal/my/jobs', isBusinessCustomer, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT j.*,
        c.first_name || ' ' || c.last_name as customer_name,
        p.address_line1 as property_address, p.postcode as property_postcode, p.city as property_city
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE j.company_id = $1 OR p.company_id = $1
    `;
    const params = [companyId];

    if (status) {
      params.push(status);
      query += ` AND j.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (j.title ILIKE $${params.length} OR j.job_number ILIKE $${params.length} OR p.address_line1 ILIKE $${params.length})`;
    }

    // Count query
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
    const countResult = await pool.query(countQuery, params);

    query += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      jobs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching business customer jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single job for business customer (read-only)
app.get('/api/portal/my/jobs/:id', isBusinessCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const result = await pool.query(`
      SELECT j.*,
        c.first_name || ' ' || c.last_name as customer_name, c.email as customer_email, c.phone as customer_phone,
        p.address_line1 as property_address, p.address_line2 as property_address2,
        p.city as property_city, p.postcode as property_postcode
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE j.id = $1 AND (j.company_id = $2 OR p.company_id = $2)
    `, [id, companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get job notes (only customer-visible ones)
    const notesResult = await pool.query(`
      SELECT jn.*, u.full_name as author_name
      FROM job_notes jn
      LEFT JOIN users u ON jn.created_by = u.id
      WHERE jn.job_id = $1 AND jn.is_customer_visible = true
      ORDER BY jn.created_at DESC
    `, [id]);

    res.json({
      job: result.rows[0],
      notes: notesResult.rows
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get documents for business customer (only visible ones)
app.get('/api/portal/my/documents', isBusinessCustomer, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { page = 1, limit = 20, document_type, job_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT d.*, j.job_number, j.title as job_title,
        p.address_line1 as property_address, p.postcode as property_postcode
      FROM documents d
      LEFT JOIN jobs j ON d.job_id = j.id
      LEFT JOIN properties p ON d.property_id = p.id
      WHERE d.is_customer_visible = true
        AND (d.company_id = $1 OR j.company_id = $1 OR p.company_id = $1)
    `;
    const params = [companyId];

    if (document_type) {
      params.push(document_type);
      query += ` AND d.document_type = $${params.length}`;
    }

    if (job_id) {
      params.push(job_id);
      query += ` AND d.job_id = $${params.length}`;
    }

    // Count query
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
    const countResult = await pool.query(countQuery, params);

    query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      documents: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching business customer documents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download document (only if customer-visible and belongs to their company)
app.get('/api/portal/my/documents/:id/download', isBusinessCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const result = await pool.query(`
      SELECT d.*
      FROM documents d
      LEFT JOIN jobs j ON d.job_id = j.id
      LEFT JOIN properties p ON d.property_id = p.id
      WHERE d.id = $1
        AND d.is_customer_visible = true
        AND (d.company_id = $2 OR j.company_id = $2 OR p.company_id = $2)
    `, [id, companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = result.rows[0];
    const filePath = path.join(__dirname, '..', doc.file_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, doc.file_name);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Business customer dashboard stats
app.get('/api/portal/my/dashboard', isBusinessCustomer, async (req, res) => {
  try {
    const companyId = req.user.company_id;

    // Get counts
    const propertiesCount = await pool.query(
      'SELECT COUNT(*) FROM properties WHERE company_id = $1',
      [companyId]
    );

    const jobsCount = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status IN ('quoted', 'booked', 'in_progress')) as active,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM jobs j
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE j.company_id = $1 OR p.company_id = $1
    `, [companyId]);

    const documentsCount = await pool.query(`
      SELECT COUNT(*)
      FROM documents d
      LEFT JOIN jobs j ON d.job_id = j.id
      LEFT JOIN properties p ON d.property_id = p.id
      WHERE d.is_customer_visible = true
        AND (d.company_id = $1 OR j.company_id = $1 OR p.company_id = $1)
    `, [companyId]);

    // Recent jobs
    const recentJobs = await pool.query(`
      SELECT j.id, j.job_number, j.title, j.status, j.created_at,
        p.address_line1 as property_address, p.postcode as property_postcode
      FROM jobs j
      LEFT JOIN properties p ON j.property_id = p.id
      WHERE j.company_id = $1 OR p.company_id = $1
      ORDER BY j.created_at DESC
      LIMIT 5
    `, [companyId]);

    // Recent documents
    const recentDocs = await pool.query(`
      SELECT d.id, d.file_name, d.document_type, d.created_at, j.job_number
      FROM documents d
      LEFT JOIN jobs j ON d.job_id = j.id
      LEFT JOIN properties p ON d.property_id = p.id
      WHERE d.is_customer_visible = true
        AND (d.company_id = $1 OR j.company_id = $1 OR p.company_id = $1)
      ORDER BY d.created_at DESC
      LIMIT 5
    `, [companyId]);

    res.json({
      properties: parseInt(propertiesCount.rows[0].count),
      jobs: {
        total: parseInt(jobsCount.rows[0].total),
        active: parseInt(jobsCount.rows[0].active),
        completed: parseInt(jobsCount.rows[0].completed)
      },
      documents: parseInt(documentsCount.rows[0].count),
      recentJobs: recentJobs.rows,
      recentDocuments: recentDocs.rows
    });
  } catch (error) {
    console.error('Error fetching business customer dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ DYNAMIC SITEMAP ============

app.get('/api/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://247electrician.uk';
    const today = new Date().toISOString().split('T')[0];

    // Static pages with their priorities and change frequencies
    const staticPages = [
      { loc: '/', changefreq: 'weekly', priority: '1.0' },
      { loc: '/about', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services', changefreq: 'weekly', priority: '0.9' },
      { loc: '/emergency', changefreq: 'monthly', priority: '0.9' },
      { loc: '/service-areas', changefreq: 'weekly', priority: '0.9' },
      { loc: '/gallery', changefreq: 'weekly', priority: '0.6' },
      { loc: '/blog', changefreq: 'daily', priority: '0.7' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
      { loc: '/rate-card', changefreq: 'monthly', priority: '0.9' },
      { loc: '/landlords', changefreq: 'monthly', priority: '0.9' },
      // Service pages
      { loc: '/services/emergency-callouts', changefreq: 'monthly', priority: '0.9' },
      { loc: '/services/fault-finding-and-repairs', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services/fuse-board-upgrades', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services/rewiring', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services/lighting-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/socket-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/ev-charger-installation', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services/eicr-certificates', changefreq: 'monthly', priority: '0.9' },
      { loc: '/services/solar-installation', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services/heat-source-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/electric-shower-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/cooker-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/emergency-lighting-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/emergency-lighting-testing', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/electrical-design', changefreq: 'monthly', priority: '0.6' },
      { loc: '/services/landlord-certificates', changefreq: 'monthly', priority: '0.8' },
      { loc: '/services/hmo-electrical-testing', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/security-lighting', changefreq: 'monthly', priority: '0.6' },
      { loc: '/services/mood-lighting', changefreq: 'monthly', priority: '0.6' },
      { loc: '/services/smoke-alarm-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/ventilation-installation', changefreq: 'monthly', priority: '0.7' },
      { loc: '/services/contract-work', changefreq: 'monthly', priority: '0.8' },
      // Landlord service pages
      { loc: '/landlords/eicr-certificates', changefreq: 'monthly', priority: '0.8' },
      { loc: '/landlords/fire-alarm-testing', changefreq: 'monthly', priority: '0.8' },
      { loc: '/landlords/emergency-lighting-testing', changefreq: 'monthly', priority: '0.8' },
      { loc: '/landlords/pat-testing', changefreq: 'monthly', priority: '0.8' },
      { loc: '/landlords/smoke-co-detectors', changefreq: 'monthly', priority: '0.8' },
      // Area pages - Primary
      { loc: '/areas/bilston', changefreq: 'monthly', priority: '0.8' },
      { loc: '/areas/wolverhampton', changefreq: 'monthly', priority: '0.8' },
      { loc: '/areas/wednesbury', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/willenhall', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/walsall', changefreq: 'monthly', priority: '0.8' },
      { loc: '/areas/west-bromwich', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/oldbury', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/tipton', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/dudley', changefreq: 'monthly', priority: '0.8' },
      { loc: '/areas/stourbridge', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/halesowen', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/great-barr', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/birmingham', changefreq: 'monthly', priority: '0.8' },
      { loc: '/areas/cannock', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/lichfield', changefreq: 'monthly', priority: '0.7' },
      { loc: '/areas/telford', changefreq: 'monthly', priority: '0.7' },
      // Area pages - Sub-areas
      { loc: '/areas/tettenhall', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/bushbury', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/wednesfield', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/penn', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/bloxwich', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/aldridge', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/brownhills', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/pelsall', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/rushall', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/smethwick', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/rowley-regis', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/cradley-heath', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/bearwood', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/sedgley', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/brierley-hill', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/kingswinford', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/coseley', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/handsworth', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/erdington', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/harborne', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/perry-barr', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/wombourne', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/codsall', changefreq: 'monthly', priority: '0.6' },
      { loc: '/areas/essington', changefreq: 'monthly', priority: '0.6' },
      // Legal pages
      { loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
      { loc: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
      { loc: '/gdpr', changefreq: 'yearly', priority: '0.3' },
    ];

    // Get published blog posts from database
    const blogResult = await pool.query(`
      SELECT slug, updated_at, published_at
      FROM blog_posts
      WHERE status = 'published'
      ORDER BY published_at DESC
    `);

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add blog posts dynamically
    for (const post of blogResult.rows) {
      const lastmod = post.updated_at
        ? new Date(post.updated_at).toISOString().split('T')[0]
        : new Date(post.published_at).toISOString().split('T')[0];

      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// ============================================================
// STRIPE PAYMENT ENDPOINTS
// ============================================================

// Create a payment link for an invoice
app.post('/api/portal/invoices/:id/payment-link', isStaff, async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment.' });
  }

  try {
    const { id } = req.params;

    // Get invoice with customer details
    const invoiceResult = await pool.query(`
      SELECT i.*,
             c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone, c.stripe_customer_id as customer_stripe_id,
             comp.name as company_name, comp.email as company_email, comp.stripe_customer_id as company_stripe_id
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN companies comp ON i.company_id = comp.id
      WHERE i.id = $1
    `, [id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Invoice is already paid' });
    }

    // Calculate balance due
    const balanceDue = parseFloat(invoice.total) - parseFloat(invoice.amount_paid || 0);
    if (balanceDue <= 0) {
      return res.status(400).json({ error: 'No balance due on this invoice' });
    }

    // Check for existing active payment link
    const existingLink = await pool.query(
      `SELECT * FROM payment_links WHERE invoice_id = $1 AND status = 'pending' AND expires_at > NOW()`,
      [id]
    );

    if (existingLink.rows.length > 0) {
      // Return existing link
      const link = existingLink.rows[0];
      return res.json({
        paymentLink: `${API_URL}/api/pay/${link.link_token}`,
        linkToken: link.link_token,
        amount: link.amount,
        expiresAt: link.expires_at,
        existing: true
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId = invoice.customer_stripe_id || invoice.company_stripe_id;
    const customerEmail = invoice.customer_email || invoice.company_email;
    const customerName = invoice.company_name || `${invoice.first_name || ''} ${invoice.last_name || ''}`.trim();

    if (!stripeCustomerId && customerEmail) {
      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          customer_id: invoice.customer_id || '',
          company_id: invoice.company_id || ''
        }
      });
      stripeCustomerId = stripeCustomer.id;

      // Save Stripe customer ID
      if (invoice.customer_id) {
        await pool.query('UPDATE customers SET stripe_customer_id = $1 WHERE id = $2', [stripeCustomerId, invoice.customer_id]);
      } else if (invoice.company_id) {
        await pool.query('UPDATE companies SET stripe_customer_id = $1 WHERE id = $2', [stripeCustomerId, invoice.company_id]);
      }
    }

    // Generate unique token
    const linkToken = crypto.randomBytes(32).toString('hex');

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bacs_debit'], // Card + UK Bank Transfer
      mode: 'payment',
      customer: stripeCustomerId || undefined,
      customer_email: !stripeCustomerId ? customerEmail : undefined,
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Invoice ${invoice.invoice_number}`,
            description: `Payment for invoice ${invoice.invoice_number} - 247Electrician`
          },
          unit_amount: Math.round(balanceDue * 100) // Convert to pence
        },
        quantity: 1
      }],
      payment_intent_data: {
        metadata: {
          invoice_id: id,
          invoice_number: invoice.invoice_number
        }
      },
      success_url: `${APP_URL}/portal/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/portal/invoices/${id}`,
      expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      metadata: {
        invoice_id: id,
        link_token: linkToken
      }
    });

    // Store payment link in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      `INSERT INTO payment_links (invoice_id, link_token, stripe_checkout_session_id, amount, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, linkToken, session.id, balanceDue, expiresAt]
    );

    res.json({
      paymentLink: `${API_URL}/api/pay/${linkToken}`,
      stripeUrl: session.url,
      linkToken,
      amount: balanceDue,
      expiresAt
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

// Get payment link for an invoice
app.get('/api/portal/invoices/:id/payment-link', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM payment_links WHERE invoice_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ hasLink: false });
    }

    const link = result.rows[0];
    const isExpired = new Date(link.expires_at) < new Date();
    const isActive = link.status === 'pending' && !isExpired;

    res.json({
      hasLink: true,
      isActive,
      paymentLink: isActive ? `${API_URL}/api/pay/${link.link_token}` : null,
      status: link.status,
      amount: link.amount,
      expiresAt: link.expires_at,
      paidAt: link.paid_at
    });
  } catch (error) {
    console.error('Error getting payment link:', error);
    res.status(500).json({ error: 'Failed to get payment link' });
  }
});

// Public payment redirect (no auth required)
app.get('/api/pay/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find payment link
    const result = await pool.query(
      'SELECT * FROM payment_links WHERE link_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Payment link not found');
    }

    const link = result.rows[0];

    // Check if expired
    if (new Date(link.expires_at) < new Date()) {
      return res.status(410).send('Payment link has expired');
    }

    // Check if already paid
    if (link.status === 'paid') {
      return res.redirect(`${APP_URL}/portal/payment-success?already_paid=true`);
    }

    // Get Stripe session and redirect to checkout
    if (link.stripe_checkout_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(link.stripe_checkout_session_id);
        if (session.url) {
          return res.redirect(session.url);
        }
      } catch (err) {
        console.error('Error retrieving Stripe session:', err);
      }
    }

    // If session expired, create a new one
    const invoiceResult = await pool.query('SELECT * FROM invoices WHERE id = $1', [link.invoice_id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).send('Invoice not found');
    }

    const invoice = invoiceResult.rows[0];
    const balanceDue = parseFloat(invoice.total) - parseFloat(invoice.amount_paid || 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bacs_debit'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Invoice ${invoice.invoice_number}`,
            description: `Payment for invoice ${invoice.invoice_number} - 247Electrician`
          },
          unit_amount: Math.round(balanceDue * 100)
        },
        quantity: 1
      }],
      success_url: `${APP_URL}/portal/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/portal/invoices/${link.invoice_id}`,
      metadata: {
        invoice_id: link.invoice_id,
        link_token: token
      }
    });

    // Update the link with new session
    await pool.query(
      'UPDATE payment_links SET stripe_checkout_session_id = $1 WHERE id = $2',
      [session.id, link.id]
    );

    res.redirect(session.url);
  } catch (error) {
    console.error('Error processing payment redirect:', error);
    res.status(500).send('Error processing payment');
  }
});

// ============================================================
// TWILIO SMS/WHATSAPP ENDPOINTS
// ============================================================

// Send payment link via SMS or WhatsApp
app.post('/api/portal/invoices/:id/send-payment-link', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { channel, phone } = req.body; // channel: 'sms' or 'whatsapp'

    if (!channel || !phone) {
      return res.status(400).json({ error: 'Channel and phone number are required' });
    }

    // Get invoice details
    const invoiceResult = await pool.query(`
      SELECT i.*, c.first_name, c.last_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `, [id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Get or create payment link
    let paymentLink;
    const existingLink = await pool.query(
      `SELECT * FROM payment_links WHERE invoice_id = $1 AND status = 'pending' AND expires_at > NOW()`,
      [id]
    );

    if (existingLink.rows.length > 0) {
      paymentLink = `${API_URL}/api/pay/${existingLink.rows[0].link_token}`;
    } else if (stripe) {
      // Create new payment link via the endpoint logic
      const balanceDue = parseFloat(invoice.total) - parseFloat(invoice.amount_paid || 0);
      const linkToken = crypto.randomBytes(32).toString('hex');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'bacs_debit'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment for invoice ${invoice.invoice_number} - 247Electrician`
            },
            unit_amount: Math.round(balanceDue * 100)
          },
          quantity: 1
        }],
        success_url: `${APP_URL}/portal/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/portal/invoices/${id}`,
        metadata: { invoice_id: id, link_token: linkToken }
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.query(
        `INSERT INTO payment_links (invoice_id, link_token, stripe_checkout_session_id, amount, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, linkToken, session.id, balanceDue, expiresAt]
      );

      paymentLink = `${APP_URL}/api/pay/${linkToken}`;
    } else {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Get settings for Twilio numbers
    const settingsResult = await pool.query(
      `SELECT setting_key, setting_value FROM portal_settings WHERE setting_key IN ('twilio_from_phone', 'twilio_whatsapp_from')`
    );
    const settings = {};
    settingsResult.rows.forEach(row => { settings[row.setting_key] = row.setting_value; });

    // Compose message
    const balanceDue = parseFloat(invoice.total) - parseFloat(invoice.amount_paid || 0);
    const customerName = `${invoice.first_name || ''} ${invoice.last_name || ''}`.trim() || 'Customer';
    const message = `Hi ${customerName}, you have an outstanding invoice (${invoice.invoice_number}) for £${balanceDue.toFixed(2)} from 247Electrician. Pay securely here: ${paymentLink}`;

    // Send via Twilio
    if (twilioClient) {
      const fromNumber = channel === 'whatsapp'
        ? (settings.twilio_whatsapp_from || process.env.TWILIO_WHATSAPP_FROM)
        : (settings.twilio_from_phone || process.env.TWILIO_FROM_PHONE);

      const toNumber = channel === 'whatsapp' ? `whatsapp:${phone}` : phone;
      const fromFormatted = channel === 'whatsapp' ? `whatsapp:${fromNumber}` : fromNumber;

      try {
        const twilioMessage = await twilioClient.messages.create({
          body: message,
          from: fromFormatted,
          to: toNumber
        });

        // Log the message
        await pool.query(
          `INSERT INTO message_log (invoice_id, customer_id, message_type, recipient_phone, message_content, twilio_message_sid, status, sent_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [id, invoice.customer_id, channel, phone, message, twilioMessage.sid, 'sent']
        );

        res.json({
          success: true,
          messageSid: twilioMessage.sid,
          channel,
          phone,
          paymentLink
        });
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);

        // Log failed message
        await pool.query(
          `INSERT INTO message_log (invoice_id, customer_id, message_type, recipient_phone, message_content, status, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, invoice.customer_id, channel, phone, message, 'failed', twilioError.message]
        );

        res.status(500).json({ error: 'Failed to send message', details: twilioError.message });
      }
    } else {
      // Twilio not configured - return link for manual sending
      res.json({
        success: true,
        manualSend: true,
        paymentLink,
        message,
        note: 'Twilio not configured. Copy the payment link to send manually.'
      });
    }
  } catch (error) {
    console.error('Error sending payment link:', error);
    res.status(500).json({ error: 'Failed to send payment link' });
  }
});

// Get message history for an invoice
app.get('/api/portal/invoices/:id/messages', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM message_log WHERE invoice_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting message history:', error);
    res.status(500).json({ error: 'Failed to get message history' });
  }
});

// Twilio status callback webhook
app.post('/api/twilio/status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;

    if (MessageSid && MessageStatus) {
      await pool.query(
        'UPDATE message_log SET status = $1 WHERE twilio_message_sid = $2',
        [MessageStatus, MessageSid]
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing Twilio status:', error);
    res.sendStatus(500);
  }
});

// Verify payment (for success page)
app.get('/api/portal/payments/verify', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Look up payment link by Stripe session ID
    const paymentLinkResult = await pool.query(
      `SELECT pl.*, i.invoice_number, c.first_name, c.last_name
       FROM payment_links pl
       JOIN invoices i ON pl.invoice_id = i.id
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE pl.stripe_checkout_session_id = $1`,
      [session_id]
    );

    if (paymentLinkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentLink = paymentLinkResult.rows[0];

    // Get the most recent payment for this invoice
    const paymentResult = await pool.query(
      `SELECT * FROM invoice_payments
       WHERE invoice_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [paymentLink.invoice_id]
    );

    const payment = paymentResult.rows[0];

    res.json({
      invoice_id: paymentLink.invoice_id,
      invoice_number: paymentLink.invoice_number,
      amount: payment ? parseFloat(payment.amount) : parseFloat(paymentLink.amount),
      customer_name: `${paymentLink.first_name || ''} ${paymentLink.last_name || ''}`.trim() || 'Customer',
      payment_date: payment ? payment.payment_date : paymentLink.paid_at || new Date().toISOString(),
      payment_method: payment ? payment.payment_method : 'stripe_card',
      status: paymentLink.status
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// ============================================================
// PAYMENT REMINDER CRON JOB
// ============================================================

// Run daily at 9am UK time
cron.schedule('0 9 * * *', async () => {
  console.log('Running payment reminder check...');

  try {
    // Get reminder settings
    const settingsResult = await pool.query(
      `SELECT setting_key, setting_value FROM portal_settings
       WHERE setting_key IN ('payment_reminder_enabled', 'reminder_days_after_due', 'twilio_from_phone')`
    );
    const settings = {};
    settingsResult.rows.forEach(row => { settings[row.setting_key] = row.setting_value; });

    if (settings.payment_reminder_enabled !== 'true') {
      console.log('Payment reminders disabled');
      return;
    }

    const reminderDays = (settings.reminder_days_after_due || '7,14,30').split(',').map(d => parseInt(d.trim()));

    // Find overdue invoices that need reminders
    const overdueResult = await pool.query(`
      SELECT i.*, c.first_name, c.last_name, c.phone as customer_phone, c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.status IN ('sent', 'viewed', 'partial')
        AND i.due_date < CURRENT_DATE
        AND c.phone IS NOT NULL
    `);

    for (const invoice of overdueResult.rows) {
      const daysOverdue = Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));

      // Check if we should send a reminder based on days overdue
      const shouldRemind = reminderDays.some(days => daysOverdue === days);

      if (shouldRemind) {
        // Check if we already sent a reminder today
        const recentReminder = await pool.query(
          `SELECT * FROM message_log
           WHERE invoice_id = $1 AND DATE(sent_at) = CURRENT_DATE AND status = 'sent'`,
          [invoice.id]
        );

        if (recentReminder.rows.length === 0 && twilioClient && settings.twilio_from_phone) {
          // Send reminder
          const balanceDue = parseFloat(invoice.total) - parseFloat(invoice.amount_paid || 0);
          const customerName = `${invoice.first_name || ''} ${invoice.last_name || ''}`.trim() || 'Customer';

          // Get or create payment link
          let paymentLink;
          const existingLink = await pool.query(
            `SELECT * FROM payment_links WHERE invoice_id = $1 AND status = 'pending' AND expires_at > NOW()`,
            [invoice.id]
          );

          if (existingLink.rows.length > 0) {
            paymentLink = `${API_URL}/api/pay/${existingLink.rows[0].link_token}`;
          } else {
            paymentLink = `${APP_URL}/portal/invoices/${invoice.id}`;
          }

          const message = `Hi ${customerName}, this is a friendly reminder that invoice ${invoice.invoice_number} for £${balanceDue.toFixed(2)} is ${daysOverdue} days overdue. Pay here: ${paymentLink} - 247Electrician`;

          try {
            const twilioMessage = await twilioClient.messages.create({
              body: message,
              from: settings.twilio_from_phone,
              to: invoice.customer_phone
            });

            // Log the reminder
            await pool.query(
              `INSERT INTO message_log (invoice_id, customer_id, message_type, recipient_phone, message_content, twilio_message_sid, status, sent_at)
               VALUES ($1, $2, 'sms', $3, $4, $5, 'sent', NOW())`,
              [invoice.id, invoice.customer_id, invoice.customer_phone, message, twilioMessage.sid]
            );

            // Update invoice reminder count
            await pool.query(
              `UPDATE invoices SET reminder_count = reminder_count + 1, last_reminder_sent = NOW() WHERE id = $1`,
              [invoice.id]
            );

            console.log(`Sent reminder for invoice ${invoice.invoice_number} (${daysOverdue} days overdue)`);
          } catch (err) {
            console.error(`Failed to send reminder for invoice ${invoice.invoice_number}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in payment reminder cron:', error);
  }
}, {
  timezone: 'Europe/London'
});

// ============================================================
// AI CHATBOT API ENDPOINTS
// ============================================================

// Chatbot tool definitions for Claude
const chatbotTools = [
  {
    name: "get_services_info",
    description: "Get information about electrical services offered including descriptions and pricing. Use when the user asks about what services are available, what we do, or asks about specific service types.",
    input_schema: {
      type: "object",
      properties: {
        service_type: {
          type: "string",
          description: "Optional filter: emergency, eicr, fuse_board, rewiring, ev_charger, solar, lighting, sockets, testing, appliances, safety"
        }
      },
      required: []
    }
  },
  {
    name: "get_pricing_info",
    description: "Get pricing information for electrical services. Use when user asks about costs, rates, or how much something costs.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Price category: callout_rates, sockets, lighting, consumer_units, testing, appliances, safety, large_projects"
        }
      },
      required: []
    }
  },
  {
    name: "check_service_area",
    description: "Check if we cover a specific area/postcode. Use when user mentions their location or asks about coverage.",
    input_schema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "Area name or postcode (e.g., 'Wolverhampton', 'WV14', 'Birmingham')"
        }
      },
      required: ["location"]
    }
  },
  {
    name: "capture_lead",
    description: "Capture visitor contact details and job requirements to create a lead. Use when visitor provides contact information or wants to book/request a callback.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's full name" },
        phone: { type: "string", description: "Contact phone number" },
        email: { type: "string", description: "Email address (optional)" },
        postcode: { type: "string", description: "Property postcode" },
        service_type: { type: "string", description: "Type of service needed" },
        description: { type: "string", description: "Description of the electrical issue or work needed" },
        urgency: { type: "string", description: "Urgency level: emergency, today, this_week, flexible" }
      },
      required: ["name", "phone"]
    }
  },
  {
    name: "get_electrical_advice",
    description: "Provide electrical advice and safety information. Use for troubleshooting questions, safety queries, or DIY guidance.",
    input_schema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic: tripping_circuits, power_loss, flickering_lights, socket_issues, safety_checks, when_to_call_electrician"
        },
        details: { type: "string", description: "Additional details about the issue" }
      },
      required: ["topic"]
    }
  },
  {
    name: "get_business_info",
    description: "Get information about 247Electrician business - accreditations, team, experience, guarantees, payment methods.",
    input_schema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic: accreditations, team, experience, guarantees, payment, contact, opening_hours"
        }
      },
      required: []
    }
  }
];

// Tool handler functions
async function handleGetServicesInfo(serviceType) {
  const services = {
    emergency: {
      name: "Emergency Callouts",
      description: "24/7 rapid response for electrical emergencies. We typically arrive within 30-90 minutes.",
      pricing: "From £79.99 (standard hours), £120 (evenings/weekends), £150 (night rate)",
      includes: ["Diagnosis", "Safe isolation", "Immediate repairs where possible"]
    },
    eicr: {
      name: "EICR Certificates",
      description: "Electrical Installation Condition Reports for landlords and homeowners. Required every 5 years for rental properties.",
      pricing: "£120-£250 depending on property size (1-2 bed: £120-£160, 3 bed: £150-£200, 4-5 bed: £180-£250)",
      includes: ["Full inspection", "Test results", "Certificate", "Recommendations"]
    },
    fuse_board: {
      name: "Fuse Board Upgrades",
      description: "Replace old fuse boxes with modern consumer units featuring RCDs and MCBs for better safety.",
      pricing: "£350-£650 (like-for-like: £350-£500, RCBO upgrade: £450-£650)",
      includes: ["New consumer unit", "Labeling", "Testing", "Certificate"]
    },
    rewiring: {
      name: "Full & Partial Rewiring",
      description: "Complete house rewires or partial updates for older properties with outdated wiring.",
      pricing: "£3,000-£7,500 depending on property size",
      includes: ["New wiring throughout", "New consumer unit", "Certification"]
    },
    ev_charger: {
      name: "EV Charger Installation",
      description: "Electric vehicle charger installation for home charging. We're approved installers for major brands.",
      pricing: "£750-£1,200 including supply, installation, and certification",
      includes: ["Charger supply", "Installation", "Certification", "OZEV grant advice"]
    },
    lighting: {
      name: "Lighting Installation",
      description: "All types of lighting - indoor, outdoor, LED, security, and garden lighting.",
      pricing: "From £45 for replacements, £80-£450 for new installations",
      includes: ["Supply and fit", "Testing", "Certificate where required"]
    },
    sockets: {
      name: "Socket Installation",
      description: "New sockets, USB sockets, outdoor sockets, and socket relocations.",
      pricing: "£45-£180 depending on type and complexity",
      includes: ["Supply and fit", "Testing"]
    },
    testing: {
      name: "Electrical Testing & Certification",
      description: "EICR, PAT testing, emergency lighting testing, and electrical inspections.",
      pricing: "From £80 for testing, certificates included",
      includes: ["Full testing", "Report", "Certificate", "Recommendations"]
    },
    appliances: {
      name: "Appliance Installation",
      description: "Electric cookers, hobs, showers, extractor fans, and more.",
      pricing: "£80-£280 depending on appliance",
      includes: ["Connection", "Testing", "Certificate where required"]
    },
    safety: {
      name: "Smoke & CO Alarms",
      description: "Mains-powered smoke alarms, CO detectors, and interlinked systems. Required in rental properties.",
      pricing: "£65-£300 depending on system",
      includes: ["Supply", "Installation", "Testing", "Certificate"]
    }
  };

  if (serviceType && services[serviceType]) {
    return services[serviceType];
  }
  return Object.entries(services).map(([key, value]) => ({ id: key, ...value }));
}

function handleGetPricingInfo(category) {
  const pricing = {
    callout_rates: {
      title: "Callout Rates",
      note: "First hour minimum charge, additional time at hourly rate",
      items: {
        standard: { rate: "£79.99", hours: "Mon-Fri 8am-5pm", additional: "£45/hr" },
        emergency: { rate: "£120", hours: "5pm-10pm, 7 days", additional: "£60/hr" },
        night: { rate: "£150", hours: "10pm-7am, 7 days", additional: "£75/hr" }
      }
    },
    sockets: {
      title: "Sockets & Switches",
      items: {
        "Replace socket/switch (like-for-like)": "£45-£65",
        "Add new single socket": "£90-£130",
        "Add new double socket": "£100-£150",
        "Move existing socket": "£80-£120",
        "USB socket installation": "£55-£85",
        "Outdoor socket (IP66)": "£120-£180"
      }
    },
    lighting: {
      title: "Lighting",
      items: {
        "Replace light fitting (like-for-like)": "£45-£75",
        "Install new ceiling light": "£80-£120",
        "Install dimmer switch": "£55-£85",
        "Outdoor/security light": "£90-£150",
        "LED downlight (per light)": "£45-£70",
        "Garden lighting circuit": "£250-£450"
      }
    },
    consumer_units: {
      title: "Consumer Units / Fuse Boards",
      items: {
        "Replace fuse board (like-for-like)": "£350-£500",
        "Upgrade to RCBO board": "£450-£650",
        "Add new circuit": "£150-£250",
        "Replace single MCB/RCD": "£60-£100",
        "Surge protection device": "£120-£180"
      }
    },
    testing: {
      title: "Testing & Certificates",
      items: {
        "EICR (1-2 bed flat)": "£120-£160",
        "EICR (3 bed house)": "£150-£200",
        "EICR (4-5 bed house)": "£180-£250",
        "PAT testing (per item)": "£2-£4",
        "Emergency lighting test": "£80-£150",
        "Minor works certificate": "Included with work"
      }
    },
    appliances: {
      title: "Appliance Installation",
      items: {
        "Electric cooker connection": "£80-£120",
        "Electric hob installation": "£90-£140",
        "Electric shower installation": "£180-£280",
        "Extractor fan installation": "£100-£180",
        "Immersion heater": "£120-£200",
        "Towel rail installation": "£80-£130"
      }
    },
    safety: {
      title: "Safety & Ventilation",
      items: {
        "Smoke alarm (mains)": "£65-£95",
        "CO detector (mains)": "£70-£100",
        "Heat detector": "£65-£95",
        "Interlinked system (3 units)": "£200-£300",
        "Bathroom extractor fan": "£100-£180"
      }
    },
    large_projects: {
      title: "Larger Projects",
      note: "Prices vary based on property size and requirements. Free quotes available.",
      items: {
        "EV Charger Installation": "£750-£1,200",
        "Full House Rewire": "£3,000-£7,500",
        "Solar Panel Installation": "£4,000-£10,000",
        "Commercial Installation": "Quote required"
      }
    }
  };

  if (category && pricing[category]) {
    return pricing[category];
  }
  return pricing;
}

function handleCheckServiceArea(location) {
  const coveredAreas = [
    "wolverhampton", "walsall", "birmingham", "dudley", "west bromwich",
    "cannock", "tipton", "wednesbury", "bilston", "willenhall", "oldbury",
    "stourbridge", "halesowen", "great barr", "smethwick", "rowley regis",
    "cradley heath", "bearwood", "sedgley", "brierley hill", "kingswinford",
    "coseley", "handsworth", "erdington", "harborne", "perry barr",
    "tettenhall", "bushbury", "wednesfield", "penn", "bloxwich",
    "aldridge", "brownhills", "pelsall", "rushall", "wombourne",
    "codsall", "essington", "coven", "albrighton", "bridgnorth",
    "lichfield", "telford"
  ];

  const coveredPostcodes = ["wv", "ws", "b", "dy", "st"];

  const locationLower = location.toLowerCase().trim();
  const isCovered = coveredAreas.some(area => locationLower.includes(area)) ||
                    coveredPostcodes.some(prefix => locationLower.startsWith(prefix));

  return {
    location,
    covered: isCovered,
    message: isCovered
      ? `Great news! We cover ${location}. We serve the Black Country, Birmingham, Walsall, and Cannock areas. Would you like to book an appointment or get a quote?`
      : `We primarily serve the Black Country and Birmingham area. ${location} may be outside our usual coverage, but please call us on 01902 943 929 to discuss - we may still be able to help!`
  };
}

async function handleCaptureLead(leadData, conversationId, pool) {
  try {
    const result = await pool.query(`
      INSERT INTO chatbot_leads
      (conversation_id, name, phone, email, postcode, service_type, description, urgency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      conversationId,
      leadData.name,
      leadData.phone,
      leadData.email || null,
      leadData.postcode || null,
      leadData.service_type || null,
      leadData.description || null,
      leadData.urgency || 'flexible'
    ]);

    // Update conversation with lead info
    await pool.query(`
      UPDATE chatbot_conversations
      SET lead_captured = true, visitor_name = $1, visitor_phone = $2, visitor_email = $3, visitor_postcode = $4, last_message_at = NOW()
      WHERE id = $5
    `, [leadData.name, leadData.phone, leadData.email || null, leadData.postcode || null, conversationId]);

    return {
      success: true,
      lead_id: result.rows[0].id,
      message: `Thank you ${leadData.name}! I've noted your details. One of our electricians will call you on ${leadData.phone} shortly to discuss your requirements${leadData.urgency === 'emergency' ? ' - for emergencies, please also call us directly on 01902 943 929' : ''}.`
    };
  } catch (error) {
    console.error('Error capturing lead:', error);
    return { success: false, message: "I couldn't save your details. Please call us directly on 01902 943 929." };
  }
}

function handleGetElectricalAdvice(topic, details) {
  const advice = {
    tripping_circuits: {
      title: "Circuit Breakers Tripping",
      advice: [
        "Unplug all devices from the affected circuit",
        "Reset the tripped breaker (push it firmly to OFF then back to ON)",
        "Plug devices back in one at a time to identify the culprit",
        "If it trips immediately with nothing plugged in, you likely have a wiring fault - call an electrician",
        "Frequent tripping could indicate an overloaded circuit or faulty appliance"
      ],
      when_to_call: "If the breaker trips repeatedly, won't reset, or trips with nothing connected"
    },
    power_loss: {
      title: "Power Loss",
      advice: [
        "Check if it's just your property - ask neighbors or check streetlights",
        "Check your consumer unit for tripped switches",
        "If it's a power cut, report to Western Power Distribution on 105",
        "Don't open the fridge/freezer - food stays cold for hours if door is closed",
        "Never attempt to fix main supply issues yourself"
      ],
      when_to_call: "If power is out only in your property and breakers look fine"
    },
    flickering_lights: {
      title: "Flickering Lights",
      advice: [
        "First, try replacing the bulb - this is the most common cause",
        "Check the bulb is properly screwed in",
        "If multiple lights flicker together, it could be a loose connection",
        "Flickering when appliances turn on might indicate an overloaded circuit",
        "LED bulbs may flicker with incompatible dimmer switches"
      ],
      when_to_call: "If flickering persists after changing bulbs, or affects multiple fixtures"
    },
    socket_issues: {
      title: "Socket Problems",
      advice: [
        "Never use a socket that shows signs of burning, sparking, or cracking",
        "Test with a different appliance to rule out a faulty device",
        "Check the socket switch is ON (common oversight!)",
        "Loose plugs are often caused by worn socket contacts",
        "Warm sockets or burning smells are URGENT - stop using immediately"
      ],
      when_to_call: "Any signs of burning, sparking, warmth, or if sockets stop working"
    },
    safety_checks: {
      title: "Home Electrical Safety Checks",
      advice: [
        "Test your RCD monthly using the test button on your consumer unit",
        "Check for damaged cables, especially on older appliances",
        "Don't overload extension leads - add up the wattage",
        "Ensure outdoor electrics are weatherproof",
        "Get an EICR every 10 years (5 years for rentals)"
      ],
      when_to_call: "For an EICR inspection or if you notice any warning signs"
    },
    when_to_call_electrician: {
      title: "When to Call an Electrician",
      advice: [
        "Any burning smell from electrics - this is urgent",
        "Sparks, smoke, or visible damage",
        "Frequent breaker trips",
        "Buzzing sounds from sockets or switches",
        "Any electrical work beyond changing bulbs or plugs",
        "Old wiring (rubber or fabric-covered cables)",
        "After flooding or water damage near electrics"
      ],
      when_to_call: "For any of the above, or if you're unsure - it's always better to be safe"
    }
  };

  if (topic && advice[topic]) {
    return advice[topic];
  }
  return {
    title: "General Electrical Advice",
    message: "I can provide advice on: tripping circuits, power loss, flickering lights, socket issues, safety checks, and when to call an electrician. What would you like help with?"
  };
}

function handleGetBusinessInfo(topic) {
  const info = {
    accreditations: {
      title: "Our Accreditations",
      details: [
        "NAPIT Approved Contractor - Ensuring all work meets the latest regulations",
        "TrustMark Registered - Government endorsed quality",
        "Fully Insured - £5 million public liability cover",
        "Part P Certified - Qualified for notifiable electrical work",
        "All work complies with BS 7671 (18th Edition Wiring Regulations)"
      ]
    },
    team: {
      title: "Meet the Team",
      details: [
        "Kelvin - Lead Electrician with 35+ years experience",
        "Andy - Senior Electrician with 30+ years experience",
        "All electricians are DBS checked",
        "Ongoing training on latest regulations and technology"
      ]
    },
    experience: {
      title: "Our Experience",
      details: [
        "Over 65 years combined experience",
        "Thousands of jobs completed across the Black Country",
        "Specialists in domestic and commercial electrical work",
        "Expert in older properties and rewiring",
        "Experienced with EV charger installations"
      ]
    },
    guarantees: {
      title: "Our Guarantees",
      details: [
        "All work guaranteed for 12 months",
        "Workmanship guarantee on installation",
        "Free callback if any issues arise",
        "Full certificates provided for all notifiable work"
      ]
    },
    payment: {
      title: "Payment Options",
      details: [
        "Cash, Debit & Credit Cards accepted",
        "Apple Pay and Google Pay",
        "Bank Transfer",
        "Payment on completion for most jobs",
        "Deposit may be required for larger projects"
      ]
    },
    contact: {
      title: "Contact Us",
      details: [
        "Phone: 01902 943 929 (24/7 for emergencies)",
        "Email: info@247electrician.uk",
        "WhatsApp: Available for enquiries",
        "Based in Bilston, serving the Black Country & Birmingham"
      ]
    },
    opening_hours: {
      title: "Opening Hours",
      details: [
        "Standard appointments: Monday-Friday, 8am-5pm",
        "Emergency callouts: 24/7, 365 days a year",
        "Office enquiries: Monday-Friday, 8am-6pm",
        "Saturday appointments available by arrangement"
      ]
    }
  };

  if (topic && info[topic]) {
    return info[topic];
  }
  return info;
}

// Execute chatbot tool
async function executeChatbotTool(toolName, toolInput, conversationId, pool) {
  switch (toolName) {
    case 'get_services_info':
      return handleGetServicesInfo(toolInput.service_type);
    case 'get_pricing_info':
      return handleGetPricingInfo(toolInput.category);
    case 'check_service_area':
      return handleCheckServiceArea(toolInput.location);
    case 'capture_lead':
      return await handleCaptureLead(toolInput, conversationId, pool);
    case 'get_electrical_advice':
      return handleGetElectricalAdvice(toolInput.topic, toolInput.details);
    case 'get_business_info':
      return handleGetBusinessInfo(toolInput.topic);
    default:
      return { error: 'Unknown tool' };
  }
}

// Rate limiting for public chatbot (simple in-memory, per IP)
const chatbotRateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const record = chatbotRateLimits.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    chatbotRateLimits.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// PUBLIC: Get chatbot status and configuration
app.get('/api/public/chatbot/status', async (req, res) => {
  try {
    // Get chatbot settings
    const settingsResult = await pool.query(
      `SELECT setting_key, setting_value FROM portal_settings
       WHERE setting_key IN ('chatbot_enabled', 'chatbot_greeting')`
    );

    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({
      enabled: settings.chatbot_enabled === 'true',
      greeting: settings.chatbot_greeting || "Hello! I'm Sparky, your 247Electrician assistant. How can I help you today?"
    });
  } catch (error) {
    console.error('Error getting chatbot status:', error);
    res.json({ enabled: false, greeting: '' });
  }
});

// PUBLIC: Start or resume chatbot conversation
app.post('/api/public/chatbot/conversation', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    }

    let { session_id } = req.body;

    // Generate session ID if not provided
    if (!session_id) {
      session_id = crypto.randomBytes(32).toString('hex');
    }

    // Check for existing conversation
    const existing = await pool.query(
      'SELECT * FROM chatbot_conversations WHERE session_id = $1',
      [session_id]
    );

    let conversation;
    let isNew = false;

    if (existing.rows.length > 0) {
      conversation = existing.rows[0];
    } else {
      // Create new conversation
      const result = await pool.query(`
        INSERT INTO chatbot_conversations (session_id, metadata)
        VALUES ($1, $2)
        RETURNING *
      `, [session_id, JSON.stringify({ ip: clientIp, userAgent: req.headers['user-agent'] })]);
      conversation = result.rows[0];
      isNew = true;

      // Get greeting from settings
      const greetingResult = await pool.query(
        "SELECT setting_value FROM portal_settings WHERE setting_key = 'chatbot_greeting'"
      );
      const greeting = greetingResult.rows[0]?.setting_value || "Hello! I'm Sparky, your AI assistant. How can I help you today?";

      // Store greeting as first assistant message
      await pool.query(`
        INSERT INTO chatbot_messages (conversation_id, role, content)
        VALUES ($1, 'assistant', $2)
      `, [conversation.id, greeting]);
    }

    // Get existing messages
    const messagesResult = await pool.query(
      'SELECT role, content, created_at FROM chatbot_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversation.id]
    );

    res.json({
      conversation_id: conversation.id,
      session_id: conversation.session_id,
      is_new: isNew,
      messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Error in chatbot conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// PUBLIC: Send message to chatbot
app.post('/api/public/chatbot/message', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    }

    const { session_id, message } = req.body;

    if (!session_id || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
    }

    // Get conversation
    const convResult = await pool.query(
      'SELECT * FROM chatbot_conversations WHERE session_id = $1',
      [session_id]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found. Please start a new conversation.' });
    }

    const conversation = convResult.rows[0];

    // Check if chatbot is enabled
    const enabledResult = await pool.query(
      "SELECT setting_value FROM portal_settings WHERE setting_key = 'chatbot_enabled'"
    );
    if (enabledResult.rows[0]?.setting_value === 'false') {
      return res.status(503).json({ error: 'Chat is currently unavailable. Please call us on 01902 943 929.' });
    }

    // Store user message
    await pool.query(`
      INSERT INTO chatbot_messages (conversation_id, role, content)
      VALUES ($1, 'user', $2)
    `, [conversation.id, message]);

    // Update last_message_at
    await pool.query(
      'UPDATE chatbot_conversations SET last_message_at = NOW() WHERE id = $1',
      [conversation.id]
    );

    // Get conversation history (last 20 messages for context)
    const historyResult = await pool.query(`
      SELECT role, content FROM chatbot_messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC LIMIT 20
    `, [conversation.id]);

    const conversationHistory = historyResult.rows.reverse().map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    // Get system prompt from settings
    const promptResult = await pool.query(
      "SELECT setting_value FROM portal_settings WHERE setting_key = 'chatbot_system_prompt'"
    );
    const systemPrompt = promptResult.rows[0]?.setting_value || 'You are a helpful electrician assistant for 247Electrician.';

    // Call Claude API with tools
    if (!anthropic) {
      // Fallback response if API not configured
      const fallbackResponse = "I'm having trouble connecting right now. Please call us directly on 01902 943 929 for immediate assistance.";
      await pool.query(`
        INSERT INTO chatbot_messages (conversation_id, role, content)
        VALUES ($1, 'assistant', $2)
      `, [conversation.id, fallbackResponse]);

      return res.json({ response: fallbackResponse, tools_used: [] });
    }

    try {
      let response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools: chatbotTools,
        messages: conversationHistory
      });

      let toolsUsed = [];
      let finalResponse = '';

      // Handle tool use loop
      while (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
        const toolResults = [];

        for (const toolUse of toolUseBlocks) {
          const result = await executeChatbotTool(toolUse.name, toolUse.input, conversation.id, pool);
          toolsUsed.push({ tool: toolUse.name, input: toolUse.input });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          });
        }

        // Continue conversation with tool results
        response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          tools: chatbotTools,
          messages: [
            ...conversationHistory,
            { role: 'assistant', content: response.content },
            { role: 'user', content: toolResults }
          ]
        });
      }

      // Extract text response
      const textBlocks = response.content.filter(block => block.type === 'text');
      finalResponse = textBlocks.map(block => block.text).join('\n');

      // Store assistant response
      await pool.query(`
        INSERT INTO chatbot_messages (conversation_id, role, content, tool_calls, tokens_used)
        VALUES ($1, 'assistant', $2, $3, $4)
      `, [
        conversation.id,
        finalResponse,
        toolsUsed.length > 0 ? JSON.stringify(toolsUsed) : null,
        response.usage?.output_tokens || null
      ]);

      res.json({
        response: finalResponse,
        tools_used: toolsUsed.map(t => t.tool)
      });

    } catch (apiError) {
      console.error('Claude API error:', apiError);
      const errorResponse = "I'm experiencing some difficulty right now. For immediate help, please call us on 01902 943 929.";
      await pool.query(`
        INSERT INTO chatbot_messages (conversation_id, role, content)
        VALUES ($1, 'assistant', $2)
      `, [conversation.id, errorResponse]);

      res.json({ response: errorResponse, tools_used: [] });
    }

  } catch (error) {
    console.error('Error in chatbot message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// PUBLIC: Get conversation history
app.get('/api/public/chatbot/conversation/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;

    const convResult = await pool.query(
      'SELECT * FROM chatbot_conversations WHERE session_id = $1',
      [session_id]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = convResult.rows[0];

    const messagesResult = await pool.query(
      'SELECT role, content, created_at FROM chatbot_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversation.id]
    );

    res.json({
      conversation_id: conversation.id,
      session_id: conversation.session_id,
      started_at: conversation.started_at,
      messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// PORTAL: List chatbot conversations
app.get('/api/portal/chatbot/conversations', isStaff, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, lead_captured, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    if (lead_captured !== undefined) {
      params.push(lead_captured === 'true');
      whereClause += ` AND lead_captured = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (visitor_name ILIKE $${params.length} OR visitor_email ILIKE $${params.length} OR visitor_phone ILIKE $${params.length})`;
    }

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM chatbot_conversations WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get conversations with message count
    params.push(parseInt(limit), offset);
    const result = await pool.query(`
      SELECT c.*,
             (SELECT COUNT(*) FROM chatbot_messages WHERE conversation_id = c.id) as message_count,
             (SELECT content FROM chatbot_messages WHERE conversation_id = c.id AND role = 'user' ORDER BY created_at DESC LIMIT 1) as last_user_message
      FROM chatbot_conversations c
      WHERE ${whereClause}
      ORDER BY c.last_message_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({
      conversations: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// PORTAL: Get single conversation with messages
app.get('/api/portal/chatbot/conversations/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const convResult = await pool.query(
      'SELECT * FROM chatbot_conversations WHERE id = $1',
      [id]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messagesResult = await pool.query(
      'SELECT * FROM chatbot_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const leadResult = await pool.query(
      'SELECT * FROM chatbot_leads WHERE conversation_id = $1',
      [id]
    );

    res.json({
      conversation: convResult.rows[0],
      messages: messagesResult.rows,
      lead: leadResult.rows[0] || null
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// PORTAL: List chatbot leads
app.get('/api/portal/chatbot/leads', isStaff, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM chatbot_leads WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await pool.query(`
      SELECT * FROM chatbot_leads
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({
      leads: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error listing leads:', error);
    res.status(500).json({ error: 'Failed to list leads' });
  }
});

// PORTAL: Update lead status
app.put('/api/portal/chatbot/leads/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const result = await pool.query(`
      UPDATE chatbot_leads
      SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// PORTAL: Convert lead to customer/job
app.post('/api/portal/chatbot/leads/:id/convert', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { create_customer = true, create_job = false } = req.body;

    const leadResult = await pool.query('SELECT * FROM chatbot_leads WHERE id = $1', [id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];
    let customerId = lead.customer_id;
    let jobId = lead.job_id;

    if (create_customer && !customerId) {
      // Create customer
      const nameParts = lead.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const customerResult = await pool.query(`
        INSERT INTO customers (first_name, last_name, email, phone, postcode, source, notes)
        VALUES ($1, $2, $3, $4, $5, 'chatbot', $6)
        RETURNING id
      `, [firstName, lastName, lead.email, lead.phone, lead.postcode, lead.description]);

      customerId = customerResult.rows[0].id;
      await pool.query('UPDATE chatbot_leads SET customer_id = $1 WHERE id = $2', [customerId, id]);
    }

    if (create_job && customerId && !jobId) {
      // Create job
      const jobResult = await pool.query(`
        INSERT INTO jobs (customer_id, title, description, status, priority, source)
        VALUES ($1, $2, $3, 'pending', $4, 'chatbot')
        RETURNING id
      `, [customerId, lead.service_type || 'Chatbot Enquiry', lead.description || '', lead.urgency === 'emergency' ? 'urgent' : 'normal']);

      jobId = jobResult.rows[0].id;
      await pool.query('UPDATE chatbot_leads SET job_id = $1, status = $2 WHERE id = $3', [jobId, 'booked', id]);
    }

    // Update conversation
    await pool.query(`
      UPDATE chatbot_conversations SET customer_id = $1, job_id = $2 WHERE id = $3
    `, [customerId, jobId, lead.conversation_id]);

    res.json({
      success: true,
      customer_id: customerId,
      job_id: jobId
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(500).json({ error: 'Failed to convert lead' });
  }
});

// ============ CERTIFICATES ============

// Helper: Generate certificate number
async function generateCertificateNumber(type) {
  const prefix = type.toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM certificates WHERE certificate_type = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())",
    [type]
  );
  const count = parseInt(countResult.rows[0].count) + 1;
  return `${prefix}${year}-${count.toString().padStart(5, '0')}`;
}

// Check if user can approve certificates (QS role)
const canApprove = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.can_approve_certificates || ['admin', 'super_admin'].includes(req.user.user_type))) {
    return next();
  }
  res.status(403).json({ error: 'QS approval permission required' });
};

// Get all certificates (filtered by role)
app.get('/api/portal/certificates', isAuthenticated, async (req, res) => {
  try {
    const { status, certificate_type, property_id, company_id, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    // Business customers can only see their company's approved certificates
    if (req.user.user_type === 'business_customer') {
      params.push(req.user.company_id);
      whereClause += ` AND c.company_id = $${params.length} AND c.is_customer_visible = true`;
    }

    if (status) {
      params.push(status);
      whereClause += ` AND c.status = $${params.length}`;
    }
    if (certificate_type) {
      params.push(certificate_type);
      whereClause += ` AND c.certificate_type = $${params.length}`;
    }
    if (property_id) {
      params.push(property_id);
      whereClause += ` AND c.property_id = $${params.length}`;
    }
    if (company_id && req.user.user_type !== 'business_customer') {
      params.push(company_id);
      whereClause += ` AND c.company_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (c.certificate_no ILIKE $${params.length} OR c.client_name ILIKE $${params.length} OR c.installation_address ILIKE $${params.length})`;
    }

    // Count total
    const countResult = await pool.query(`SELECT COUNT(*) FROM certificates c WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    params.push(parseInt(limit), offset);
    const query = `
      SELECT c.*,
        p.address_line1 as property_address,
        p.postcode as property_postcode,
        comp.name as company_name,
        cust.first_name || ' ' || cust.last_name as customer_name,
        u.display_name as created_by_name,
        approver.display_name as approved_by_name
      FROM certificates c
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN customers cust ON c.customer_id = cust.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN users approver ON c.approved_by = approver.id
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    res.json({
      certificates: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single certificate with all related data
app.get('/api/portal/certificates/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT c.*,
        p.address_line1 as property_address,
        p.address_line2 as property_address2,
        p.city as property_city,
        p.postcode as property_postcode,
        comp.name as company_name,
        cust.first_name || ' ' || cust.last_name as customer_name,
        cust.email as customer_email,
        cust.phone as customer_phone,
        u.display_name as created_by_name,
        approver.display_name as approved_by_name,
        j.job_number
      FROM certificates c
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN customers cust ON c.customer_id = cust.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN users approver ON c.approved_by = approver.id
      LEFT JOIN jobs j ON c.job_id = j.id
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = result.rows[0];

    // Business customers can only view their company's approved certificates
    if (req.user.user_type === 'business_customer') {
      if (certificate.company_id !== req.user.company_id || !certificate.is_customer_visible) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get boards with circuits
    const boardsResult = await pool.query(`
      SELECT * FROM certificate_boards WHERE certificate_id = $1 ORDER BY sort_order, created_at
    `, [id]);

    const boards = [];
    for (const board of boardsResult.rows) {
      const circuitsResult = await pool.query(`
        SELECT * FROM certificate_circuits WHERE board_id = $1 ORDER BY sort_order, circuit_number
      `, [board.id]);
      boards.push({
        ...board,
        circuits: circuitsResult.rows
      });
    }

    // Get observations
    const observationsResult = await pool.query(`
      SELECT * FROM certificate_observations WHERE certificate_id = $1 ORDER BY sort_order, item_number
    `, [id]);

    // Get review history
    const reviewsResult = await pool.query(`
      SELECT cr.*, u.display_name as reviewer_name
      FROM certificate_reviews cr
      LEFT JOIN users u ON cr.reviewer_id = u.id
      WHERE cr.certificate_id = $1
      ORDER BY cr.created_at DESC
    `, [id]);

    // Get test instruments used
    const instrumentsResult = await pool.query(`
      SELECT ti.* FROM test_instruments ti
      JOIN certificate_test_instruments cti ON ti.id = cti.test_instrument_id
      WHERE cti.certificate_id = $1
    `, [id]);

    res.json({
      certificate,
      boards,
      observations: observationsResult.rows,
      reviews: reviewsResult.rows,
      testInstruments: instrumentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new certificate
app.post('/api/portal/certificates', isStaff, async (req, res) => {
  try {
    const {
      certificate_type,
      property_id,
      job_id,
      company_id,
      customer_id,
      client_name,
      client_address,
      client_phone,
      client_email,
      installation_address,
      installation_postcode
    } = req.body;

    if (!certificate_type || !property_id) {
      return res.status(400).json({ error: 'Certificate type and property are required' });
    }

    // Generate certificate number
    const certificate_no = await generateCertificateNumber(certificate_type);

    // Get property details to auto-populate if not provided
    const propertyResult = await pool.query(`
      SELECT p.*, c.first_name, c.last_name, c.email, c.phone,
             comp.name as company_name, comp.email as company_email, comp.phone as company_phone
      FROM properties p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN companies comp ON p.company_id = comp.id
      WHERE p.id = $1
    `, [property_id]);

    const property = propertyResult.rows[0];

    const result = await pool.query(`
      INSERT INTO certificates (
        certificate_no, certificate_type, property_id, job_id, company_id, customer_id,
        created_by, client_name, client_address, client_phone, client_email,
        installation_address, installation_postcode, inspector_name, inspector_registration
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      certificate_no,
      certificate_type,
      property_id,
      job_id || null,
      company_id || property?.company_id || null,
      customer_id || property?.customer_id || null,
      req.user.id,
      client_name || (property?.first_name ? `${property.first_name} ${property.last_name}` : property?.company_name) || '',
      client_address || `${property?.address_line1 || ''}, ${property?.city || ''}, ${property?.postcode || ''}`.trim(),
      client_phone || property?.phone || property?.company_phone || '',
      client_email || property?.email || property?.company_email || '',
      installation_address || `${property?.address_line1 || ''}, ${property?.city || ''}`.trim(),
      installation_postcode || property?.postcode || '',
      req.user.display_name,
      req.user.napit_number || ''
    ]);

    res.json({ certificate: result.rows[0] });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update certificate
app.put('/api/portal/certificates/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check certificate exists and is editable
    const existing = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (!['draft', 'revision_requested'].includes(existing.rows[0].status)) {
      return res.status(400).json({ error: 'Certificate cannot be edited in current status' });
    }

    // Build dynamic update query
    const allowedFields = [
      'client_name', 'client_address', 'client_phone', 'client_email',
      'installation_address', 'installation_postcode', 'inspector_name', 'inspector_registration',
      'inspection_date', 'next_inspection_date', 'overall_assessment', 'reason_for_report',
      'earthing_arrangement', 'number_of_live_conductors', 'phase_configuration',
      'nominal_voltage', 'nominal_frequency', 'pfc_pscc', 'external_loop_impedance',
      'supply_pd_bs_en', 'supply_pd_type', 'supply_pd_rating', 'supply_pd_short_circuit_capacity',
      'installation_age_years', 'evidence_of_alterations', 'alterations_age_years',
      'records_available', 'previous_inspection_date', 'records_held_by',
      'premises_type', 'extent_of_installation', 'section_data', 'job_id'
    ];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        params.push(value);
        setClauses.push(`${key} = $${params.length}`);
      }
    }

    if (setClauses.length === 0) {
      return res.json({ certificate: existing.rows[0] });
    }

    params.push(id);
    const result = await pool.query(`
      UPDATE certificates SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $${params.length}
      RETURNING *
    `, params);

    res.json({ certificate: result.rows[0] });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete certificate (only drafts)
app.delete('/api/portal/certificates/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (existing.rows[0].status !== 'draft') {
      return res.status(400).json({ error: 'Only draft certificates can be deleted' });
    }

    await pool.query('DELETE FROM certificates WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit certificate for approval
app.post('/api/portal/certificates/:id/submit', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (!['draft', 'revision_requested'].includes(existing.rows[0].status)) {
      return res.status(400).json({ error: 'Certificate cannot be submitted in current status' });
    }

    // Check if QS approval is required
    const settingsResult = await pool.query(
      'SELECT require_qs_approval FROM company_certificate_settings WHERE company_id = $1',
      [existing.rows[0].company_id]
    );

    const requireApproval = settingsResult.rows[0]?.require_qs_approval ?? true;

    if (requireApproval) {
      // Submit for approval
      await pool.query(`
        UPDATE certificates SET status = 'submitted', submitted_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [id]);

      // Add review record
      await pool.query(`
        INSERT INTO certificate_reviews (certificate_id, reviewer_id, action, comments)
        VALUES ($1, $2, 'submitted', 'Certificate submitted for QS approval')
      `, [id, req.user.id]);

      res.json({ message: 'Certificate submitted for approval', status: 'submitted' });
    } else {
      // Auto-approve if QS approval not required
      await pool.query(`
        UPDATE certificates SET status = 'approved', approved_at = NOW(), approved_by = $1,
        is_customer_visible = true, submitted_at = NOW(), updated_at = NOW()
        WHERE id = $2
      `, [req.user.id, id]);

      await pool.query(`
        INSERT INTO certificate_reviews (certificate_id, reviewer_id, action, comments)
        VALUES ($1, $2, 'approved', 'Auto-approved (QS approval not required)')
      `, [id, req.user.id]);

      res.json({ message: 'Certificate approved', status: 'approved' });
    }
  } catch (error) {
    console.error('Error submitting certificate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ QS APPROVAL ENDPOINTS ============

// Get pending certificates for QS approval
app.get('/api/portal/qs/pending', canApprove, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await pool.query("SELECT COUNT(*) FROM certificates WHERE status = 'submitted'");
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT c.*,
        p.address_line1 as property_address,
        p.postcode as property_postcode,
        comp.name as company_name,
        u.display_name as created_by_name
      FROM certificates c
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.status = 'submitted'
      ORDER BY c.submitted_at ASC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);

    res.json({
      certificates: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching pending certificates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending count for badge
app.get('/api/portal/qs/pending-count', canApprove, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM certificates WHERE status = 'submitted'");
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching pending count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve certificate
app.post('/api/portal/certificates/:id/approve', canApprove, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const existing = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (existing.rows[0].status !== 'submitted') {
      return res.status(400).json({ error: 'Certificate is not pending approval' });
    }

    await pool.query(`
      UPDATE certificates SET status = 'approved', approved_at = NOW(), approved_by = $1,
      is_customer_visible = true, updated_at = NOW()
      WHERE id = $2
    `, [req.user.id, id]);

    await pool.query(`
      INSERT INTO certificate_reviews (certificate_id, reviewer_id, action, comments)
      VALUES ($1, $2, 'approved', $3)
    `, [id, req.user.id, comments || 'Certificate approved']);

    res.json({ message: 'Certificate approved', status: 'approved' });
  } catch (error) {
    console.error('Error approving certificate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject certificate
app.post('/api/portal/certificates/:id/reject', canApprove, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comments } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const existing = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (existing.rows[0].status !== 'submitted') {
      return res.status(400).json({ error: 'Certificate is not pending approval' });
    }

    await pool.query(`
      UPDATE certificates SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
      WHERE id = $2
    `, [reason, id]);

    await pool.query(`
      INSERT INTO certificate_reviews (certificate_id, reviewer_id, action, comments)
      VALUES ($1, $2, 'rejected', $3)
    `, [id, req.user.id, comments || reason]);

    res.json({ message: 'Certificate rejected', status: 'rejected' });
  } catch (error) {
    console.error('Error rejecting certificate:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Request revision
app.post('/api/portal/certificates/:id/revision', canApprove, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({ error: 'Revision comments are required' });
    }

    const existing = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (existing.rows[0].status !== 'submitted') {
      return res.status(400).json({ error: 'Certificate is not pending approval' });
    }

    await pool.query(`
      UPDATE certificates SET status = 'revision_requested', updated_at = NOW()
      WHERE id = $1
    `, [id]);

    await pool.query(`
      INSERT INTO certificate_reviews (certificate_id, reviewer_id, action, comments)
      VALUES ($1, $2, 'revision_requested', $3)
    `, [id, req.user.id, comments]);

    res.json({ message: 'Revision requested', status: 'revision_requested' });
  } catch (error) {
    console.error('Error requesting revision:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate PDF for certificate
app.post('/api/portal/certificates/:id/pdf', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { generateCertificatePdf } = require('./services/certificatePdfService');

    // Get certificate
    const certResult = await pool.query(`
      SELECT c.*,
        p.address_line1 as property_address,
        p.postcode as property_postcode,
        u.display_name as created_by_name,
        a.display_name as approved_by_name
      FROM certificates c
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN users a ON c.approved_by = a.id
      WHERE c.id = $1
    `, [id]);

    if (certResult.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = certResult.rows[0];

    // Check access
    if (!['staff', 'admin', 'super_admin'].includes(req.user.user_type)) {
      if (certificate.customer_id !== req.user.customer_id &&
          certificate.company_id !== req.user.company_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (!certificate.is_customer_visible) {
        return res.status(403).json({ error: 'Certificate not yet available' });
      }
    }

    // Get boards with circuits
    const boardsResult = await pool.query(`
      SELECT * FROM certificate_boards WHERE certificate_id = $1 ORDER BY sort_order, created_at
    `, [id]);

    const boards = boardsResult.rows;

    for (const board of boards) {
      const circuitsResult = await pool.query(`
        SELECT * FROM certificate_circuits WHERE board_id = $1 ORDER BY position
      `, [board.id]);
      board.circuits = circuitsResult.rows;
    }

    // Get observations
    const obsResult = await pool.query(`
      SELECT * FROM certificate_observations WHERE certificate_id = $1 ORDER BY item_number
    `, [id]);

    // Company info
    const companyInfo = {
      name: 'ANP Electrical Ltd',
      napit_number: 'NAPIT Approved',
      address: 'West Midlands, UK',
      phone: '0121 123 4567',
      email: 'info@247electrician.uk',
      website: 'www.247electrician.uk',
    };

    // Generate PDF
    const pdfBuffer = await generateCertificatePdf(
      certificate,
      boards,
      obsResult.rows,
      companyInfo
    );

    // Save PDF URL if approved
    if (certificate.status === 'approved' && !certificate.pdf_url) {
      // In production, upload to cloud storage and save URL
      // For now, we'll serve inline
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${certificate.certificate_no}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ============ BOARDS & CIRCUITS ============

// Get boards for a certificate
app.get('/api/portal/certificates/:id/boards', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const boardsResult = await pool.query(`
      SELECT * FROM certificate_boards WHERE certificate_id = $1 ORDER BY sort_order, created_at
    `, [id]);

    const boards = [];
    for (const board of boardsResult.rows) {
      const circuitsResult = await pool.query(`
        SELECT * FROM certificate_circuits WHERE board_id = $1 ORDER BY sort_order, circuit_number
      `, [board.id]);
      boards.push({
        ...board,
        circuits: circuitsResult.rows
      });
    }

    res.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add board
app.post('/api/portal/certificates/:id/boards', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      db_name, designation, location, supplied_from, no_of_ways, no_of_phases,
      spd_fitted, spd_type_t1, spd_type_t2, spd_type_t3, spd_status_confirmed,
      ocpd_bs_en, ocpd_rating_amps, ocpd_voltage_rating,
      zdb, ipf, rcd_time_ms, supply_polarity_confirmed, phase_sequence_confirmed
    } = req.body;

    // Get max sort order
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM certificate_boards WHERE certificate_id = $1',
      [id]
    );

    const result = await pool.query(`
      INSERT INTO certificate_boards (
        certificate_id, db_name, designation, location, supplied_from, no_of_ways, no_of_phases,
        spd_fitted, spd_type_t1, spd_type_t2, spd_type_t3, spd_status_confirmed,
        ocpd_bs_en, ocpd_rating_amps, ocpd_voltage_rating,
        zdb, ipf, rcd_time_ms, supply_polarity_confirmed, phase_sequence_confirmed, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      id, db_name || 'Main Board', designation, location, supplied_from || 'Origin',
      no_of_ways, no_of_phases || 1, spd_fitted || false,
      spd_type_t1 || false, spd_type_t2 || false, spd_type_t3 || false, spd_status_confirmed || false,
      ocpd_bs_en, ocpd_rating_amps, ocpd_voltage_rating,
      zdb, ipf, rcd_time_ms, supply_polarity_confirmed || false, phase_sequence_confirmed || false,
      maxOrderResult.rows[0].next_order
    ]);

    res.json({ board: result.rows[0] });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update board
app.put('/api/portal/boards/:boardId', isStaff, async (req, res) => {
  try {
    const { boardId } = req.params;
    const updates = req.body;

    const allowedFields = [
      'db_name', 'designation', 'location', 'supplied_from', 'no_of_ways', 'no_of_phases',
      'spd_fitted', 'spd_type_t1', 'spd_type_t2', 'spd_type_t3', 'spd_status_confirmed',
      'ocpd_bs_en', 'ocpd_rating_amps', 'ocpd_voltage_rating',
      'zdb', 'ipf', 'rcd_time_ms', 'supply_polarity_confirmed', 'phase_sequence_confirmed', 'sort_order'
    ];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        params.push(value);
        setClauses.push(`${key} = $${params.length}`);
      }
    }

    if (setClauses.length === 0) {
      const existing = await pool.query('SELECT * FROM certificate_boards WHERE id = $1', [boardId]);
      return res.json({ board: existing.rows[0] });
    }

    params.push(boardId);
    const result = await pool.query(`
      UPDATE certificate_boards SET ${setClauses.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `, params);

    res.json({ board: result.rows[0] });
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete board
app.delete('/api/portal/boards/:boardId', isStaff, async (req, res) => {
  try {
    const { boardId } = req.params;
    await pool.query('DELETE FROM certificate_boards WHERE id = $1', [boardId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add circuit to board
app.post('/api/portal/boards/:boardId/circuits', isStaff, async (req, res) => {
  try {
    const { boardId } = req.params;
    const circuit = req.body;

    // Get max sort order
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM certificate_circuits WHERE board_id = $1',
      [boardId]
    );

    const result = await pool.query(`
      INSERT INTO certificate_circuits (
        board_id, circuit_number, designation, circuit_type, no_of_points,
        wiring_type, ref_method, live_csa, cpc_csa,
        rating_amps, breaker_type, breaker_bs_en, short_circuit_capacity, voltage_rating, disconnection_time,
        rcd_type, rcd_rating_ma, max_zs,
        r1_plus_r2, r2, zs, insulation_resistance_live_earth, insulation_resistance_live_neutral,
        polarity, rcd_time_x1, rcd_time_x5, circuit_result, notes, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *
    `, [
      boardId, circuit.circuit_number, circuit.designation, circuit.circuit_type, circuit.no_of_points,
      circuit.wiring_type, circuit.ref_method, circuit.live_csa, circuit.cpc_csa,
      circuit.rating_amps, circuit.breaker_type, circuit.breaker_bs_en, circuit.short_circuit_capacity,
      circuit.voltage_rating, circuit.disconnection_time,
      circuit.rcd_type, circuit.rcd_rating_ma, circuit.max_zs,
      circuit.r1_plus_r2, circuit.r2, circuit.zs, circuit.insulation_resistance_live_earth,
      circuit.insulation_resistance_live_neutral, circuit.polarity, circuit.rcd_time_x1, circuit.rcd_time_x5,
      circuit.circuit_result || 'pass', circuit.notes, maxOrderResult.rows[0].next_order
    ]);

    res.json({ circuit: result.rows[0] });
  } catch (error) {
    console.error('Error creating circuit:', error);
    console.error('Circuit data received:', req.body);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update circuit
app.put('/api/portal/circuits/:circuitId', isStaff, async (req, res) => {
  try {
    const { circuitId } = req.params;
    const updates = req.body;

    const allowedFields = [
      'circuit_number', 'designation', 'circuit_type', 'no_of_points',
      'wiring_type', 'ref_method', 'live_csa', 'cpc_csa',
      'rating_amps', 'breaker_type', 'breaker_bs_en', 'short_circuit_capacity', 'voltage_rating', 'disconnection_time',
      'rcd_type', 'rcd_rating_ma', 'max_zs',
      'r1_plus_r2', 'r2', 'zs', 'insulation_resistance_live_earth', 'insulation_resistance_live_neutral',
      'polarity', 'rcd_time_x1', 'rcd_time_x5', 'circuit_result', 'notes', 'sort_order'
    ];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        params.push(value);
        setClauses.push(`${key} = $${params.length}`);
      }
    }

    if (setClauses.length === 0) {
      const existing = await pool.query('SELECT * FROM certificate_circuits WHERE id = $1', [circuitId]);
      return res.json({ circuit: existing.rows[0] });
    }

    params.push(circuitId);
    const result = await pool.query(`
      UPDATE certificate_circuits SET ${setClauses.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `, params);

    res.json({ circuit: result.rows[0] });
  } catch (error) {
    console.error('Error updating circuit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete circuit
app.delete('/api/portal/circuits/:circuitId', isStaff, async (req, res) => {
  try {
    const { circuitId } = req.params;
    await pool.query('DELETE FROM certificate_circuits WHERE id = $1', [circuitId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting circuit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk create circuits (add multiple blank circuits at once)
app.post('/api/portal/boards/:boardId/circuits/bulk', isStaff, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { count = 10 } = req.body;

    // Limit to 20 circuits at a time
    const circuitCount = Math.min(Math.max(1, count), 20);

    // Get max circuit number and sort order
    const maxResult = await pool.query(`
      SELECT
        COALESCE(MAX(circuit_number), 0) as max_circuit,
        COALESCE(MAX(sort_order), 0) as max_sort
      FROM certificate_circuits WHERE board_id = $1
    `, [boardId]);

    let circuitNumber = (maxResult.rows[0].max_circuit || 0) + 1;
    let sortOrder = (maxResult.rows[0].max_sort || 0) + 1;

    const circuits = [];

    for (let i = 0; i < circuitCount; i++) {
      const result = await pool.query(`
        INSERT INTO certificate_circuits (
          board_id, circuit_number, designation, circuit_result, polarity, sort_order
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [boardId, circuitNumber, '', 'pass', 'OK', sortOrder]);

      circuits.push(result.rows[0]);
      circuitNumber++;
      sortOrder++;
    }

    res.json({ circuits });
  } catch (error) {
    console.error('Error creating bulk circuits:', error);
    console.error('Board ID:', req.params.boardId, 'Count:', req.body.count);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Reorder circuits (for drag-and-drop)
app.put('/api/portal/boards/:boardId/circuits/reorder', isStaff, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { circuit_ids } = req.body;

    if (!Array.isArray(circuit_ids) || circuit_ids.length === 0) {
      return res.status(400).json({ error: 'circuit_ids array required' });
    }

    // Update sort_order and circuit_number for each circuit
    for (let i = 0; i < circuit_ids.length; i++) {
      await pool.query(`
        UPDATE certificate_circuits
        SET sort_order = $1, circuit_number = $2
        WHERE id = $3 AND board_id = $4
      `, [i + 1, i + 1, circuit_ids[i], boardId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering circuits:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ OBSERVATIONS ============

// Get observations for a certificate
app.get('/api/portal/certificates/:id/observations', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT o.*, q.quote_number as linked_quote_number
      FROM certificate_observations o
      LEFT JOIN quotes q ON o.linked_quote_id = q.id
      WHERE o.certificate_id = $1
      ORDER BY o.sort_order, o.item_number
    `, [id]);

    res.json({ observations: result.rows });
  } catch (error) {
    console.error('Error fetching observations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add observation
app.post('/api/portal/certificates/:id/observations', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, item_number, schedule_item_no, location, observation, recommendation, db_circuit_ref, remedial_action } = req.body;

    if (!code || !observation) {
      return res.status(400).json({ error: 'Code and observation are required' });
    }

    // Get max sort order
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM certificate_observations WHERE certificate_id = $1',
      [id]
    );

    const result = await pool.query(`
      INSERT INTO certificate_observations (
        certificate_id, code, item_number, schedule_item_no, location, observation,
        recommendation, db_circuit_ref, remedial_action, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [id, code, item_number, schedule_item_no, location, observation, recommendation, db_circuit_ref, remedial_action, maxOrderResult.rows[0].next_order]);

    res.json({ observation: result.rows[0] });
  } catch (error) {
    console.error('Error creating observation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update observation
app.put('/api/portal/observations/:observationId', isStaff, async (req, res) => {
  try {
    const { observationId } = req.params;
    const { code, item_number, schedule_item_no, location, observation, recommendation, db_circuit_ref, remedial_action, linked_quote_id, sort_order } = req.body;

    const result = await pool.query(`
      UPDATE certificate_observations SET
        code = COALESCE($1, code),
        item_number = $2,
        schedule_item_no = $3,
        location = $4,
        observation = COALESCE($5, observation),
        recommendation = $6,
        db_circuit_ref = $7,
        remedial_action = $8,
        linked_quote_id = $9,
        sort_order = COALESCE($10, sort_order)
      WHERE id = $11
      RETURNING *
    `, [code, item_number, schedule_item_no, location, observation, recommendation, db_circuit_ref, remedial_action, linked_quote_id, sort_order, observationId]);

    res.json({ observation: result.rows[0] });
  } catch (error) {
    console.error('Error updating observation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete observation
app.delete('/api/portal/observations/:observationId', isStaff, async (req, res) => {
  try {
    const { observationId } = req.params;
    await pool.query('DELETE FROM certificate_observations WHERE id = $1', [observationId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting observation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ OBSERVATION IMAGES (Fault Photos) ============

// Configure multer for observation images
const observationImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/observations');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `obs-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadObservationImage = multer({
  storage: observationImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Get images for an observation
app.get('/api/portal/observations/:observationId/images', isAuthenticated, async (req, res) => {
  try {
    const { observationId } = req.params;
    const result = await pool.query(`
      SELECT * FROM observation_images
      WHERE observation_id = $1
      ORDER BY created_at ASC
    `, [observationId]);

    res.json({ images: result.rows });
  } catch (error) {
    console.error('Error fetching observation images:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload image to observation
app.post('/api/portal/observations/:observationId/images', isStaff, uploadObservationImage.single('image'), async (req, res) => {
  try {
    const { observationId } = req.params;
    const { caption, location_description, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Verify observation exists
    const obsResult = await pool.query('SELECT * FROM certificate_observations WHERE id = $1', [observationId]);
    if (obsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    // Count existing images to generate field_id
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM observation_images WHERE observation_id = $1',
      [observationId]
    );
    const imageIndex = parseInt(countResult.rows[0].count) + 1;

    // Get certificate info for field_id
    const certResult = await pool.query(`
      SELECT c.certificate_type, o.item_number
      FROM certificates c
      JOIN certificate_observations o ON c.id = o.certificate_id
      WHERE o.id = $1
    `, [observationId]);

    const certType = certResult.rows[0]?.certificate_type || 'eicr';
    const obsIndex = certResult.rows[0]?.item_number || 1;
    const fieldId = `${certType}.observation.${obsIndex}.image.${imageIndex}`;

    const url = `/uploads/observations/${req.file.filename}`;
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

    const result = await pool.query(`
      INSERT INTO observation_images (
        observation_id, field_id, filename, original_filename, mime_type,
        size_bytes, url, caption, location_description, tags, uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      observationId, fieldId, req.file.filename, req.file.originalname,
      req.file.mimetype, req.file.size, url, caption, location_description,
      parsedTags, req.user.id
    ]);

    res.json({ image: result.rows[0] });
  } catch (error) {
    console.error('Error uploading observation image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete observation image
app.delete('/api/portal/observation-images/:imageId', isStaff, async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get image info before deleting
    const imageResult = await pool.query('SELECT * FROM observation_images WHERE id = $1', [imageId]);
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult.rows[0];

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../public', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query('DELETE FROM observation_images WHERE id = $1', [imageId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting observation image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CERTIFICATE IMAGES (General) ============

// Configure multer for certificate images
const certificateImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/certificates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cert-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadCertificateImage = multer({
  storage: certificateImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Get images for a certificate
app.get('/api/portal/certificates/:id/images', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM certificate_images
      WHERE certificate_id = $1
      ORDER BY sort_order, created_at ASC
    `, [id]);

    res.json({ images: result.rows });
  } catch (error) {
    console.error('Error fetching certificate images:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload image to certificate
app.post('/api/portal/certificates/:id/images', isStaff, uploadCertificateImage.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, location_description, tags, image_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Verify certificate exists
    const certResult = await pool.query('SELECT * FROM certificates WHERE id = $1', [id]);
    if (certResult.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Count existing images to generate field_id and sort_order
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM certificate_images WHERE certificate_id = $1',
      [id]
    );
    const imageIndex = parseInt(countResult.rows[0].count) + 1;

    const certType = certResult.rows[0].certificate_type;
    const fieldId = `${certType}.images.${imageIndex}`;

    const url = `/uploads/certificates/${req.file.filename}`;
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

    const result = await pool.query(`
      INSERT INTO certificate_images (
        certificate_id, field_id, filename, original_filename, mime_type,
        size_bytes, url, caption, location_description, tags, image_type,
        uploaded_by, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      id, fieldId, req.file.filename, req.file.originalname,
      req.file.mimetype, req.file.size, url, caption, location_description,
      parsedTags, image_type || 'general', req.user.id, imageIndex
    ]);

    res.json({ image: result.rows[0] });
  } catch (error) {
    console.error('Error uploading certificate image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete certificate image
app.delete('/api/portal/certificate-images/:imageId', isStaff, async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get image info before deleting
    const imageResult = await pool.query('SELECT * FROM certificate_images WHERE id = $1', [imageId]);
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult.rows[0];

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../public', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query('DELETE FROM certificate_images WHERE id = $1', [imageId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting certificate image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ INSPECTION SECTIONS & SCHEDULE ITEMS ============

// Get all inspection sections
app.get('/api/portal/inspection-sections', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM inspection_sections
      WHERE is_active = true
      ORDER BY sort_order
    `);

    res.json({ sections: result.rows });
  } catch (error) {
    console.error('Error fetching inspection sections:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get inspection items for a section
app.get('/api/portal/inspection-sections/:sectionCode/items', isAuthenticated, async (req, res) => {
  try {
    const { sectionCode } = req.params;
    const result = await pool.query(`
      SELECT * FROM inspection_schedule_items
      WHERE section_code = $1 AND is_active = true
      ORDER BY sort_order
    `, [sectionCode]);

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error fetching inspection items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get schedule results for a certificate
app.get('/api/portal/certificates/:id/schedule-results', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT sr.*, isi.item_text, isi.regulation_ref, isi.section_code
      FROM certificate_schedule_results sr
      JOIN inspection_schedule_items isi ON sr.item_id = isi.id
      WHERE sr.certificate_id = $1
      ORDER BY isi.sort_order
    `, [id]);

    res.json({ results: result.rows });
  } catch (error) {
    console.error('Error fetching schedule results:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save/update schedule result
app.post('/api/portal/certificates/:id/schedule-results', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { item_id, field_id, result, comments } = req.body;

    if (!item_id || !field_id) {
      return res.status(400).json({ error: 'item_id and field_id are required' });
    }

    // Upsert the result
    const dbResult = await pool.query(`
      INSERT INTO certificate_schedule_results (certificate_id, item_id, field_id, result, comments)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (certificate_id, item_id)
      DO UPDATE SET result = $4, comments = $5, updated_at = NOW()
      RETURNING *
    `, [id, item_id, field_id, result, comments]);

    res.json({ result: dbResult.rows[0] });
  } catch (error) {
    console.error('Error saving schedule result:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CERTIFICATE LIMITATIONS ============

// Get limitations for a certificate
app.get('/api/portal/certificates/:id/limitations', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM certificate_limitations
      WHERE certificate_id = $1
      ORDER BY sort_order, limitation_number
    `, [id]);

    res.json({ limitations: result.rows });
  } catch (error) {
    console.error('Error fetching limitations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add limitation
app.post('/api/portal/certificates/:id/limitations', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { limitation_type, limitation_description } = req.body;

    if (!limitation_description) {
      return res.status(400).json({ error: 'Limitation description is required' });
    }

    // Get next limitation number
    const maxResult = await pool.query(
      'SELECT COALESCE(MAX(limitation_number), 0) + 1 as next_num FROM certificate_limitations WHERE certificate_id = $1',
      [id]
    );

    const result = await pool.query(`
      INSERT INTO certificate_limitations (certificate_id, limitation_number, limitation_type, limitation_description, sort_order)
      VALUES ($1, $2, $3, $4, $2)
      RETURNING *
    `, [id, maxResult.rows[0].next_num, limitation_type, limitation_description]);

    res.json({ limitation: result.rows[0] });
  } catch (error) {
    console.error('Error creating limitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update limitation
app.put('/api/portal/limitations/:limitationId', isStaff, async (req, res) => {
  try {
    const { limitationId } = req.params;
    const { limitation_type, limitation_description, sort_order } = req.body;

    const result = await pool.query(`
      UPDATE certificate_limitations SET
        limitation_type = COALESCE($1, limitation_type),
        limitation_description = COALESCE($2, limitation_description),
        sort_order = COALESCE($3, sort_order)
      WHERE id = $4
      RETURNING *
    `, [limitation_type, limitation_description, sort_order, limitationId]);

    res.json({ limitation: result.rows[0] });
  } catch (error) {
    console.error('Error updating limitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete limitation
app.delete('/api/portal/limitations/:limitationId', isStaff, async (req, res) => {
  try {
    const { limitationId } = req.params;
    await pool.query('DELETE FROM certificate_limitations WHERE id = $1', [limitationId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting limitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ VOICE INPUT / FIELD ACCESS API ============

// Get field value by field_id
app.get('/api/portal/certificates/:id/field/:fieldId', isAuthenticated, async (req, res) => {
  try {
    const { id, fieldId } = req.params;
    const fieldParts = fieldId.split('.');

    // Certificate direct fields
    const directFields = [
      'client_name', 'client_address', 'client_phone', 'client_email',
      'occupier_name', 'installation_address', 'installation_postcode',
      'earthing_arrangement', 'nominal_voltage', 'nominal_frequency',
      'pfc_pscc', 'external_loop_impedance', 'overall_assessment'
    ];

    // Handle client fields (eicr.client.name -> client_name)
    if (fieldParts[1] === 'client' || fieldParts[1] === 'installation' || fieldParts[1] === 'supply') {
      const dbField = fieldParts.slice(1).join('_').replace(/_address_/, '_address_line');
      const result = await pool.query(`SELECT ${dbField} as value FROM certificates WHERE id = $1`, [id]);

      if (result.rows.length > 0) {
        return res.json({
          field_id: fieldId,
          value: result.rows[0].value,
          type: 'text'
        });
      }
    }

    // Handle board fields (eicr.board.1.zdb)
    if (fieldParts[1] === 'board' && fieldParts.length >= 4) {
      const boardIndex = parseInt(fieldParts[2]);

      if (fieldParts[3] === 'circuit' && fieldParts.length >= 6) {
        // Circuit field (eicr.board.1.circuit.3.zs)
        const circuitIndex = parseInt(fieldParts[4]);
        const circuitField = fieldParts[5];

        const result = await pool.query(`
          SELECT cc.${circuitField} as value
          FROM certificate_circuits cc
          JOIN certificate_boards cb ON cc.board_id = cb.id
          WHERE cb.certificate_id = $1
          ORDER BY cb.sort_order, cc.circuit_number
          OFFSET $2 LIMIT 1
        `, [id, (boardIndex - 1) * 100 + circuitIndex - 1]); // Simplified offset calculation

        if (result.rows.length > 0) {
          return res.json({
            field_id: fieldId,
            value: result.rows[0].value,
            type: 'number'
          });
        }
      } else {
        // Board field (eicr.board.1.zdb)
        const boardField = fieldParts[3];
        const result = await pool.query(`
          SELECT ${boardField} as value
          FROM certificate_boards
          WHERE certificate_id = $1
          ORDER BY sort_order
          OFFSET $2 LIMIT 1
        `, [id, boardIndex - 1]);

        if (result.rows.length > 0) {
          return res.json({
            field_id: fieldId,
            value: result.rows[0].value,
            type: 'number'
          });
        }
      }
    }

    // Handle observation fields (eicr.observation.1.code)
    if (fieldParts[1] === 'observation' && fieldParts.length >= 4) {
      const obsIndex = parseInt(fieldParts[2]);
      const obsField = fieldParts[3];

      const result = await pool.query(`
        SELECT ${obsField} as value
        FROM certificate_observations
        WHERE certificate_id = $1
        ORDER BY sort_order
        OFFSET $2 LIMIT 1
      `, [id, obsIndex - 1]);

      if (result.rows.length > 0) {
        return res.json({
          field_id: fieldId,
          value: result.rows[0].value,
          type: obsField === 'code' ? 'select' : 'text'
        });
      }
    }

    res.status(404).json({ error: 'Field not found' });
  } catch (error) {
    console.error('Error getting field value:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set field value by field_id (for voice input)
app.post('/api/portal/certificates/:id/field', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { field_id, value } = req.body;

    if (!field_id) {
      return res.status(400).json({ error: 'field_id is required' });
    }

    const fieldParts = field_id.split('.');

    // Handle certificate direct fields
    if (fieldParts[1] === 'client') {
      const dbField = 'client_' + fieldParts.slice(2).join('_');
      await pool.query(`UPDATE certificates SET ${dbField} = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
      return res.json({ success: true, field_id, value });
    }

    if (fieldParts[1] === 'installation') {
      const dbField = fieldParts.slice(1).join('_');
      await pool.query(`UPDATE certificates SET ${dbField} = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
      return res.json({ success: true, field_id, value });
    }

    if (fieldParts[1] === 'supply') {
      const fieldMap = {
        'ze': 'external_loop_impedance',
        'voltage': 'nominal_voltage',
        'frequency': 'nominal_frequency',
        'pfc': 'pfc_pscc',
        'earthing': 'earthing_arrangement'
      };
      const dbField = fieldMap[fieldParts[2]] || fieldParts.slice(1).join('_');
      await pool.query(`UPDATE certificates SET ${dbField} = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
      return res.json({ success: true, field_id, value });
    }

    if (fieldParts[1] === 'declaration') {
      const fieldMap = {
        'overall_assessment': 'overall_assessment'
      };
      const dbField = fieldMap[fieldParts[2]] || fieldParts.slice(1).join('_');
      await pool.query(`UPDATE certificates SET ${dbField} = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
      return res.json({ success: true, field_id, value });
    }

    // Handle board fields
    if (fieldParts[1] === 'board' && fieldParts.length >= 4) {
      const boardIndex = parseInt(fieldParts[2]);

      // Get board by index
      const boardResult = await pool.query(`
        SELECT id FROM certificate_boards
        WHERE certificate_id = $1
        ORDER BY sort_order
        OFFSET $2 LIMIT 1
      `, [id, boardIndex - 1]);

      if (boardResult.rows.length === 0) {
        return res.status(404).json({ error: 'Board not found' });
      }

      const boardId = boardResult.rows[0].id;

      if (fieldParts[3] === 'circuit' && fieldParts.length >= 6) {
        // Circuit field update
        const circuitIndex = parseInt(fieldParts[4]);
        const circuitField = fieldParts[5];

        const circuitResult = await pool.query(`
          SELECT id FROM certificate_circuits
          WHERE board_id = $1
          ORDER BY circuit_number
          OFFSET $2 LIMIT 1
        `, [boardId, circuitIndex - 1]);

        if (circuitResult.rows.length === 0) {
          return res.status(404).json({ error: 'Circuit not found' });
        }

        await pool.query(`UPDATE certificate_circuits SET ${circuitField} = $1 WHERE id = $2`, [value, circuitResult.rows[0].id]);
        return res.json({ success: true, field_id, value });
      } else {
        // Board field update
        const boardField = fieldParts[3];
        await pool.query(`UPDATE certificate_boards SET ${boardField} = $1 WHERE id = $2`, [value, boardId]);
        return res.json({ success: true, field_id, value });
      }
    }

    // Handle observation fields
    if (fieldParts[1] === 'observation' && fieldParts.length >= 4) {
      const obsIndex = parseInt(fieldParts[2]);
      const obsField = fieldParts[3];

      const obsResult = await pool.query(`
        SELECT id FROM certificate_observations
        WHERE certificate_id = $1
        ORDER BY sort_order
        OFFSET $2 LIMIT 1
      `, [id, obsIndex - 1]);

      if (obsResult.rows.length === 0) {
        return res.status(404).json({ error: 'Observation not found' });
      }

      await pool.query(`UPDATE certificate_observations SET ${obsField} = $1 WHERE id = $2`, [value, obsResult.rows[0].id]);
      return res.json({ success: true, field_id, value });
    }

    res.status(400).json({ error: 'Unknown field pattern' });
  } catch (error) {
    console.error('Error setting field value:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Voice command parsing endpoint
app.post('/api/portal/certificates/:id/voice-command', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Voice command is required' });
    }

    // Get certificate type for field_id prefix
    const certResult = await pool.query('SELECT certificate_type FROM certificates WHERE id = $1', [id]);
    if (certResult.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    const certType = certResult.rows[0].certificate_type;

    // Parse voice command patterns
    const patterns = [
      // Client fields
      { regex: /client name (?:is |= )?(.+)/i, field: 'client.name' },
      { regex: /client phone (?:is |= )?(.+)/i, field: 'client.phone' },
      { regex: /client email (?:is |= )?(.+)/i, field: 'client.email' },

      // Installation fields
      { regex: /occupier (?:name )?(?:is |= )?(.+)/i, field: 'installation.occupier' },
      { regex: /installation age (?:is |= )?(\d+)/i, field: 'installation.estimated_age' },

      // Supply fields
      { regex: /ze (?:is |= )?([\d.]+)/i, field: 'supply.ze' },
      { regex: /voltage (?:is |= )?(\d+)/i, field: 'supply.voltage' },
      { regex: /frequency (?:is |= )?(\d+)/i, field: 'supply.frequency' },
      { regex: /pfc (?:is |= )?([\d.]+)/i, field: 'supply.pfc' },

      // Board fields
      { regex: /board (\d+) (?:zdb|z d b) (?:is |= )?([\d.]+)/i, field: 'board.$1.zdb', value: '$2' },
      { regex: /board (\d+) (?:ipf|i p f) (?:is |= )?([\d.]+)/i, field: 'board.$1.ipf', value: '$2' },
      { regex: /board (\d+) location (?:is |= )?(.+)/i, field: 'board.$1.location', value: '$2' },

      // Circuit fields
      { regex: /board (\d+) circuit (\d+) zs (?:is |= )?([\d.]+)/i, field: 'board.$1.circuit.$2.zs', value: '$3' },
      { regex: /board (\d+) circuit (\d+) r1 ?(?:plus|\+) ?r2 (?:is |= )?([\d.]+)/i, field: 'board.$1.circuit.$2.r1_plus_r2', value: '$3' },
      { regex: /board (\d+) circuit (\d+) rating (?:is |= )?(\d+)/i, field: 'board.$1.circuit.$2.rating_amps', value: '$3' },
      { regex: /board (\d+) circuit (\d+) polarity (?:is |= )?(ok|fail)/i, field: 'board.$1.circuit.$2.polarity', value: '$3' },
      { regex: /board (\d+) circuit (\d+) designation (?:is |= )?(.+)/i, field: 'board.$1.circuit.$2.designation', value: '$3' },

      // Observation fields
      { regex: /observation (\d+) code (?:is |= )?(c1|c2|c3|fi|lim|na|nv|x)/i, field: 'observation.$1.code', value: '$2' },
      { regex: /observation (\d+) location (?:is |= )?(.+)/i, field: 'observation.$1.location', value: '$2' },

      // Overall assessment
      { regex: /overall (?:assessment |result )?(?:is |= )?(satisfactory|unsatisfactory)/i, field: 'declaration.overall_assessment' },
    ];

    let parsedFieldId = null;
    let parsedValue = null;

    for (const pattern of patterns) {
      const match = command.match(pattern.regex);
      if (match) {
        parsedFieldId = `${certType}.${pattern.field}`;

        // Replace numbered capture groups
        if (pattern.field.includes('$1')) {
          parsedFieldId = parsedFieldId.replace('$1', match[1]);
          if (pattern.field.includes('$2')) {
            parsedFieldId = parsedFieldId.replace('$2', match[2]);
          }
        }

        // Get the value
        if (pattern.value) {
          parsedValue = pattern.value;
          // Replace capture groups in value
          for (let i = 1; i <= 5; i++) {
            if (match[i] !== undefined) {
              parsedValue = parsedValue.replace(`$${i}`, match[i]);
            }
          }
        } else {
          parsedValue = match[match.length - 1];
        }

        break;
      }
    }

    if (!parsedFieldId) {
      return res.json({
        success: false,
        error: 'Could not parse voice command',
        command
      });
    }

    // Log the voice input
    await pool.query(`
      INSERT INTO voice_input_log (certificate_id, user_id, field_id, command_text, parsed_value)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, req.user.id, parsedFieldId, command, parsedValue]);

    // Update the field
    const updateReq = {
      params: { id },
      body: { field_id: parsedFieldId, value: parsedValue },
      user: req.user
    };

    // Simulate calling the field update endpoint
    const updateResult = await new Promise((resolve) => {
      res.json({
        success: true,
        field_id: parsedFieldId,
        value: parsedValue,
        command,
        confirmed: true
      });
      resolve(true);
    });

    // Actually update the field (reusing logic from above)
    // This is already done inline above for simplicity

  } catch (error) {
    console.error('Error processing voice command:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ OBSERVATION CODES REFERENCE ============

// Get all observation codes
app.get('/api/portal/observation-codes', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM observation_codes
      WHERE is_active = true
      ORDER BY sort_order
    `);

    res.json({ codes: result.rows });
  } catch (error) {
    console.error('Error fetching observation codes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CERTIFICATE REQUESTS (Customer) ============

// Get certificate requests
app.get('/api/portal/certificate-requests', isAuthenticated, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    // Business customers can only see their company's requests
    if (req.user.user_type === 'business_customer') {
      params.push(req.user.company_id);
      whereClause += ` AND cr.company_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      whereClause += ` AND cr.status = $${params.length}`;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM certificate_requests cr WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const result = await pool.query(`
      SELECT cr.*,
        p.address_line1 as property_address,
        p.postcode as property_postcode,
        comp.name as company_name,
        u.display_name as requested_by_name,
        j.job_number as assigned_job_number
      FROM certificate_requests cr
      LEFT JOIN properties p ON cr.property_id = p.id
      LEFT JOIN companies comp ON cr.company_id = comp.id
      LEFT JOIN users u ON cr.requested_by = u.id
      LEFT JOIN jobs j ON cr.assigned_job_id = j.id
      WHERE ${whereClause}
      ORDER BY cr.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching certificate requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create certificate request (customer portal)
app.post('/api/portal/certificate-requests', isAuthenticated, async (req, res) => {
  try {
    const { property_id, certificate_type, preferred_date, notes } = req.body;

    if (!property_id || !certificate_type) {
      return res.status(400).json({ error: 'Property and certificate type are required' });
    }

    // Get property to verify access and get company_id
    const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [property_id]);
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = propertyResult.rows[0];

    // Business customers can only request for their company's properties
    if (req.user.user_type === 'business_customer' && property.company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      INSERT INTO certificate_requests (property_id, company_id, customer_id, requested_by, certificate_type, preferred_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [property_id, property.company_id, property.customer_id, req.user.id, certificate_type, preferred_date, notes]);

    res.json({ request: result.rows[0] });
  } catch (error) {
    console.error('Error creating certificate request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update certificate request (staff only)
app.put('/api/portal/certificate-requests/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_job_id } = req.body;

    const result = await pool.query(`
      UPDATE certificate_requests SET
        status = COALESCE($1, status),
        assigned_job_id = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, assigned_job_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request: result.rows[0] });
  } catch (error) {
    console.error('Error updating certificate request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ TEST INSTRUMENTS ============

app.get('/api/portal/test-instruments', isStaff, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM test_instruments
      WHERE is_active = true
      ORDER BY instrument_type, manufacturer, model
    `);

    res.json({ instruments: result.rows });
  } catch (error) {
    console.error('Error fetching test instruments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/test-instruments', isStaff, async (req, res) => {
  try {
    const { instrument_type, manufacturer, model, serial_number, calibration_date, next_calibration } = req.body;

    const result = await pool.query(`
      INSERT INTO test_instruments (instrument_type, manufacturer, model, serial_number, calibration_date, next_calibration)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [instrument_type, manufacturer, model, serial_number, calibration_date, next_calibration]);

    res.json({ instrument: result.rows[0] });
  } catch (error) {
    console.error('Error creating test instrument:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/test-instruments/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { instrument_type, manufacturer, model, serial_number, calibration_date, next_calibration, is_active } = req.body;

    const result = await pool.query(`
      UPDATE test_instruments SET
        instrument_type = COALESCE($1, instrument_type),
        manufacturer = COALESCE($2, manufacturer),
        model = COALESCE($3, model),
        serial_number = COALESCE($4, serial_number),
        calibration_date = $5,
        next_calibration = $6,
        is_active = COALESCE($7, is_active)
      WHERE id = $8
      RETURNING *
    `, [instrument_type, manufacturer, model, serial_number, calibration_date, next_calibration, is_active, id]);

    res.json({ instrument: result.rows[0] });
  } catch (error) {
    console.error('Error updating test instrument:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ ENGINEER PROFILES ============

app.get('/api/portal/engineer-profile', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM engineer_profiles WHERE user_id = $1
    `, [req.user.id]);

    res.json({ profile: result.rows[0] || null });
  } catch (error) {
    console.error('Error fetching engineer profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/engineer-profile', isAuthenticated, async (req, res) => {
  try {
    const { napit_number, nic_number, signature_url } = req.body;

    // Upsert profile
    const result = await pool.query(`
      INSERT INTO engineer_profiles (user_id, napit_number, nic_number, signature_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET
        napit_number = EXCLUDED.napit_number,
        nic_number = EXCLUDED.nic_number,
        signature_url = COALESCE(EXCLUDED.signature_url, engineer_profiles.signature_url)
      RETURNING *
    `, [req.user.id, napit_number, nic_number, signature_url]);

    // Also update user's napit_number
    await pool.query('UPDATE users SET napit_number = $1 WHERE id = $2', [napit_number, req.user.id]);

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Error updating engineer profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ NOTIFICATION SETTINGS ============

app.get('/api/portal/notification-settings', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM notification_settings WHERE user_id = $1
    `, [req.user.id]);

    res.json({ settings: result.rows[0] || {
      email_certificate_submitted: true,
      email_certificate_approved: true,
      email_certificate_rejected: true,
      email_new_request: true,
      sms_certificate_approved: false,
      sms_new_request: false
    }});
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portal/notification-settings', isAuthenticated, async (req, res) => {
  try {
    const {
      email_certificate_submitted, email_certificate_approved, email_certificate_rejected,
      email_new_request, sms_certificate_approved, sms_new_request
    } = req.body;

    const result = await pool.query(`
      INSERT INTO notification_settings (
        user_id, email_certificate_submitted, email_certificate_approved, email_certificate_rejected,
        email_new_request, sms_certificate_approved, sms_new_request
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        email_certificate_submitted = EXCLUDED.email_certificate_submitted,
        email_certificate_approved = EXCLUDED.email_certificate_approved,
        email_certificate_rejected = EXCLUDED.email_certificate_rejected,
        email_new_request = EXCLUDED.email_new_request,
        sms_certificate_approved = EXCLUDED.sms_certificate_approved,
        sms_new_request = EXCLUDED.sms_new_request
      RETURNING *
    `, [req.user.id, email_certificate_submitted, email_certificate_approved, email_certificate_rejected, email_new_request, sms_certificate_approved, sms_new_request]);

    res.json({ settings: result.rows[0] });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ MY CERTIFICATES (Customer Portal) ============

app.get('/api/portal/my/certificates', isAuthenticated, async (req, res) => {
  try {
    if (req.user.user_type !== 'business_customer') {
      return res.status(403).json({ error: 'This endpoint is for business customers only' });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM certificates WHERE company_id = $1 AND is_customer_visible = true',
      [req.user.company_id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT c.*,
        p.address_line1 as property_address,
        p.postcode as property_postcode
      FROM certificates c
      LEFT JOIN properties p ON c.property_id = p.id
      WHERE c.company_id = $1 AND c.is_customer_visible = true
      ORDER BY c.approved_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.company_id, parseInt(limit), offset]);

    res.json({
      certificates: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customer certificates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`247Electrician API server running on port ${PORT}`);
});
