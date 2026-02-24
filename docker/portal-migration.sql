-- ==========================================
-- 247Electrician Portal Database Migration
-- Run after init.sql to add portal tables
-- ==========================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- UPDATE EXISTING USERS TABLE
-- ==========================================

-- Add new columns to users table for portal functionality
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'staff';
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing users to have staff user_type
UPDATE users SET user_type = 'staff' WHERE user_type IS NULL;

-- ==========================================
-- COMPANIES TABLE (Business Customers)
-- ==========================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'estate_agent', -- estate_agent, property_manager, letting_agent, housing_association, other
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(20),
    discount_tier VARCHAR(50) DEFAULT 'standard', -- standard, trade, contract
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to users table
ALTER TABLE users ADD CONSTRAINT fk_users_company
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ==========================================
-- CUSTOMERS TABLE (Direct End Customers)
-- ==========================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(20),
    customer_type VARCHAR(50) DEFAULT 'residential', -- residential, landlord, business
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- If referred by a company
    source VARCHAR(100), -- How they found us: google, referral, repeat, etc.
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PROPERTIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    property_type VARCHAR(50) DEFAULT 'house', -- house, flat, bungalow, hmo, commercial
    bedrooms INTEGER,
    tenure VARCHAR(50), -- owned, rented, managed
    access_notes TEXT,
    eicr_due_date DATE,
    last_eicr_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- JOBS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated: JOB-2024-0001
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(100), -- emergency, eicr, rewire, fuse_board, etc.
    status VARCHAR(50) DEFAULT 'quoted', -- quoted, booked, in_progress, completed, invoiced, paid, cancelled
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, emergency
    assigned_to VARCHAR(100), -- kelvin, andy, both
    scheduled_date DATE,
    scheduled_time_start TIME,
    scheduled_time_end TIME,
    completed_date DATE,
    estimated_duration INTEGER, -- minutes
    actual_duration INTEGER, -- minutes
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    labour_cost DECIMAL(10, 2),
    materials_cost DECIMAL(10, 2),
    notes TEXT,
    internal_notes TEXT, -- Staff only, not visible to customers
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- QUOTES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated: QUO-2024-0001
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected, expired
    valid_until DATE,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    vat_rate DECIMAL(5, 2) DEFAULT 20,
    vat_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    terms TEXT,
    notes TEXT,
    internal_notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- QUOTE ITEMS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_type VARCHAR(50) DEFAULT 'labour', -- labour, material, fixed
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'each', -- each, hour, metre, etc.
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    supplier VARCHAR(100), -- toolstation, screwfix, other
    supplier_sku VARCHAR(100),
    supplier_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INVOICES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated: INV-2024-0001
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, viewed, paid, overdue, cancelled
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    vat_rate DECIMAL(5, 2) DEFAULT 20,
    vat_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50), -- cash, card, bank_transfer
    payment_reference VARCHAR(255),
    paid_date DATE,
    terms TEXT,
    notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INVOICE ITEMS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) DEFAULT 'labour',
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'each',
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- DOCUMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    document_type VARCHAR(50) NOT NULL, -- photo, eicr, certificate, quote_pdf, invoice_pdf, other
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_customer_visible BOOLEAN DEFAULT false, -- Can business customers see this?
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- JOB MATERIALS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS job_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'each',
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    supplier VARCHAR(100),
    supplier_sku VARCHAR(100),
    is_charged BOOLEAN DEFAULT true, -- Include in invoice?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- JOB NOTES TABLE (Activity Timeline)
-- ==========================================

CREATE TABLE IF NOT EXISTS job_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'note', -- note, status_change, call, email, sms
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Staff only?
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SCHEDULE ENTRIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS schedule_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entry_type VARCHAR(50) DEFAULT 'job', -- job, holiday, training, other
    assigned_to VARCHAR(100), -- kelvin, andy, both
    start_date DATE NOT NULL,
    start_time TIME,
    end_date DATE NOT NULL,
    end_time TIME,
    all_day BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- iCal RRULE format
    color VARCHAR(20), -- For calendar display
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- MATERIAL PRICE CACHE TABLE (AI Lookups)
-- ==========================================

CREATE TABLE IF NOT EXISTS material_price_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_term VARCHAR(255) NOT NULL,
    supplier VARCHAR(100) NOT NULL, -- toolstation, screwfix
    product_name VARCHAR(255),
    product_sku VARCHAR(100),
    product_url TEXT,
    price DECIMAL(10, 2),
    unit VARCHAR(50),
    in_stock BOOLEAN,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- ==========================================
-- PORTAL SETTINGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS portal_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SESSIONS TABLE (for Passport.js)
-- ==========================================

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY NOT NULL,
    sess JSON NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_discount_tier ON companies(discount_tier);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_properties_customer ON properties(customer_id);
CREATE INDEX IF NOT EXISTS idx_properties_company ON properties(company_id);
CREATE INDEX IF NOT EXISTS idx_properties_postcode ON properties(postcode);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_property ON jobs(property_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_job_number ON jobs(job_number);
CREATE INDEX IF NOT EXISTS idx_quotes_job ON quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_invoices_job ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_documents_job ON documents(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_dates ON schedule_entries(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_assigned ON schedule_entries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_material_cache_search ON material_price_cache(search_term, supplier);
CREATE INDEX IF NOT EXISTS idx_material_cache_expires ON material_price_cache(expires_at);

-- ==========================================
-- FUNCTIONS FOR AUTO-GENERATING NUMBERS
-- ==========================================

-- Function to generate job numbers
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str VARCHAR(4);
    next_num INTEGER;
BEGIN
    year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 10) AS INTEGER)), 0) + 1
    INTO next_num
    FROM jobs
    WHERE job_number LIKE 'JOB-' || year_str || '-%';

    NEW.job_number := 'JOB-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str VARCHAR(4);
    next_num INTEGER;
BEGIN
    year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 10) AS INTEGER)), 0) + 1
    INTO next_num
    FROM quotes
    WHERE quote_number LIKE 'QUO-' || year_str || '-%';

    NEW.quote_number := 'QUO-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str VARCHAR(4);
    next_num INTEGER;
BEGIN
    year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
    INTO next_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_str || '-%';

    NEW.invoice_number := 'INV-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_generate_job_number ON jobs;
CREATE TRIGGER trigger_generate_job_number
    BEFORE INSERT ON jobs
    FOR EACH ROW
    WHEN (NEW.job_number IS NULL)
    EXECUTE FUNCTION generate_job_number();

DROP TRIGGER IF EXISTS trigger_generate_quote_number ON quotes;
CREATE TRIGGER trigger_generate_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    WHEN (NEW.quote_number IS NULL)
    EXECUTE FUNCTION generate_quote_number();

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION generate_invoice_number();

-- ==========================================
-- DEFAULT SETTINGS
-- ==========================================

INSERT INTO portal_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', '247Electrician', 'string', 'Company name for documents'),
('company_address', 'Bilston, West Midlands, UK', 'string', 'Company address for documents'),
('company_phone', '01902 943 929', 'string', 'Company phone number'),
('company_email', 'info@247electrician.uk', 'string', 'Company email'),
('vat_rate', '20', 'number', 'Default VAT rate percentage'),
('quote_validity_days', '30', 'number', 'Default quote validity in days'),
('invoice_due_days', '14', 'number', 'Default invoice due in days'),
('trade_discount', '15', 'number', 'Trade partner discount percentage'),
('contract_discount', '25', 'number', 'Contract client discount percentage')
ON CONFLICT (setting_key) DO NOTHING;

-- ==========================================
-- GRANT PERMISSIONS (if needed)
-- ==========================================

-- Ensure the electrician user has full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO electrician;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO electrician;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO electrician;
