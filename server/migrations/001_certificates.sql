-- ElectricalCertAI Integration Migration
-- Creates tables for certificate management, QS approval workflow, and customer requests
-- Note: Uses UUID for primary keys to match existing schema

-- Ensure uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main certificate table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_no VARCHAR(50) UNIQUE NOT NULL,
  certificate_type VARCHAR(50) NOT NULL, -- eicr, eic, mw
  status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, approved, rejected, revision_requested

  -- Relationships
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Assignment
  created_by UUID REFERENCES users(id) NOT NULL,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  -- Certificate data (JSONB for flexible sections)
  section_data JSONB DEFAULT '{}',

  -- Client/Installation details
  client_name VARCHAR(255),
  client_address TEXT,
  client_phone VARCHAR(50),
  client_email VARCHAR(255),
  installation_address TEXT,
  installation_postcode VARCHAR(20),

  -- Inspector details
  inspector_name VARCHAR(255),
  inspector_registration VARCHAR(100),
  inspection_date DATE,
  next_inspection_date DATE,

  -- Overall result (EICR)
  overall_assessment VARCHAR(50), -- satisfactory, unsatisfactory

  -- Reasons/Purpose
  reason_for_report VARCHAR(255),

  -- Supply characteristics
  earthing_arrangement VARCHAR(20), -- TN-S, TN-C-S, TN-C, TT, IT
  number_of_live_conductors VARCHAR(20), -- ac, dc
  phase_configuration VARCHAR(50), -- 1-phase 2 wire, 3-phase 4 wire, etc.
  nominal_voltage VARCHAR(20),
  nominal_frequency VARCHAR(20),
  pfc_pscc DECIMAL(10,2), -- kA
  external_loop_impedance DECIMAL(10,4), -- Ze (Ω)

  -- Supply protective device
  supply_pd_bs_en VARCHAR(50),
  supply_pd_type VARCHAR(50),
  supply_pd_rating DECIMAL(10,2),
  supply_pd_short_circuit_capacity DECIMAL(10,2),

  -- Installation age/records
  installation_age_years INTEGER,
  evidence_of_alterations VARCHAR(20), -- yes, no, not_apparent
  alterations_age_years INTEGER,
  records_available BOOLEAN DEFAULT false,
  previous_inspection_date DATE,
  records_held_by VARCHAR(255),

  -- Description
  premises_type VARCHAR(100), -- residential, commercial, industrial, other
  extent_of_installation TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,

  -- Customer visibility
  pdf_url VARCHAR(500),
  is_customer_visible BOOLEAN DEFAULT false
);

-- Distribution boards
CREATE TABLE IF NOT EXISTS certificate_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  db_name VARCHAR(100) DEFAULT 'Main Board',
  designation VARCHAR(100),
  location VARCHAR(255),
  supplied_from VARCHAR(100) DEFAULT 'Origin',
  no_of_ways INTEGER,
  no_of_phases INTEGER DEFAULT 1,

  -- SPD details
  spd_fitted BOOLEAN DEFAULT false,
  spd_type_t1 BOOLEAN DEFAULT false,
  spd_type_t2 BOOLEAN DEFAULT false,
  spd_type_t3 BOOLEAN DEFAULT false,
  spd_status_confirmed BOOLEAN DEFAULT false,

  -- Overcurrent protective device (supply circuit)
  ocpd_bs_en VARCHAR(50),
  ocpd_rating_amps DECIMAL(10,2),
  ocpd_voltage_rating DECIMAL(10,2),

  -- Measurements at this board
  zdb DECIMAL(10,4),
  ipf DECIMAL(10,2),
  rcd_time_ms DECIMAL(10,2),

  -- Polarity/Phase
  supply_polarity_confirmed BOOLEAN DEFAULT false,
  phase_sequence_confirmed BOOLEAN DEFAULT false,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Circuits with test results
CREATE TABLE IF NOT EXISTS certificate_circuits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES certificate_boards(id) ON DELETE CASCADE,
  circuit_number INTEGER,
  designation VARCHAR(100),
  circuit_type VARCHAR(50), -- lighting, socket, cooker, shower, immersion, smoke_alarm, etc.
  no_of_points INTEGER,

  -- Cable details
  wiring_type VARCHAR(50), -- T+E, SWA, FP200, etc.
  ref_method VARCHAR(20), -- A, B, C, etc.
  live_csa VARCHAR(20), -- mm²
  cpc_csa VARCHAR(20), -- mm²

  -- Protective device
  rating_amps DECIMAL(10,2),
  breaker_type VARCHAR(20), -- B, C, D, RCBO
  breaker_bs_en VARCHAR(50),
  short_circuit_capacity DECIMAL(10,2),
  voltage_rating DECIMAL(10,2),
  disconnection_time DECIMAL(10,4),

  -- RCD details (if applicable)
  rcd_type VARCHAR(20), -- AC, A, F, B
  rcd_rating_ma INTEGER, -- IΔn
  max_zs DECIMAL(10,4),

  -- Test results
  r1_plus_r2 DECIMAL(10,4),
  r2 DECIMAL(10,4),
  zs DECIMAL(10,4),
  insulation_resistance_live_earth DECIMAL(10,2),
  insulation_resistance_live_neutral DECIMAL(10,2),
  polarity VARCHAR(10), -- OK, FAIL
  rcd_time_x1 DECIMAL(10,2),
  rcd_time_x5 DECIMAL(10,2),

  -- Result
  circuit_result VARCHAR(20) DEFAULT 'pass', -- pass, fail, na
  notes TEXT,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EICR Observations (C1, C2, C3, FI codes)
CREATE TABLE IF NOT EXISTS certificate_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL, -- C1, C2, C3, FI, LIM, NA, NV, X
  item_number INTEGER,
  schedule_item_no VARCHAR(20),
  location VARCHAR(255),
  observation TEXT NOT NULL,
  recommendation TEXT,
  db_circuit_ref VARCHAR(100),
  remedial_action TEXT,

  -- Quote linking (optional)
  linked_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QS Review history
CREATE TABLE IF NOT EXISTS certificate_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  action VARCHAR(30) NOT NULL, -- submitted, approved, rejected, revision_requested
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer certificate requests
CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES users(id),

  certificate_type VARCHAR(50) NOT NULL,
  preferred_date DATE,
  notes TEXT,

  status VARCHAR(20) DEFAULT 'pending', -- pending, scheduled, completed, cancelled
  assigned_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test instruments
CREATE TABLE IF NOT EXISTS test_instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  instrument_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  calibration_date DATE,
  next_calibration DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engineer profiles
CREATE TABLE IF NOT EXISTS engineer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  napit_number VARCHAR(100),
  nic_number VARCHAR(100),
  signature_url VARCHAR(500),
  can_approve_certificates BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification settings (per user)
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_certificate_submitted BOOLEAN DEFAULT true,
  email_certificate_approved BOOLEAN DEFAULT true,
  email_certificate_rejected BOOLEAN DEFAULT true,
  email_new_request BOOLEAN DEFAULT true,
  sms_certificate_approved BOOLEAN DEFAULT false,
  sms_new_request BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company certificate settings
CREATE TABLE IF NOT EXISTS company_certificate_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  auto_link_observations_to_quotes BOOLEAN DEFAULT false,
  require_qs_approval BOOLEAN DEFAULT true,
  default_next_inspection_months INTEGER DEFAULT 60,
  trading_title VARCHAR(255),
  company_address TEXT,
  company_phone VARCHAR(50),
  company_email VARCHAR(255),
  company_website VARCHAR(255),
  enrolment_number VARCHAR(100), -- NAPIT number
  company_logo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificate test instruments junction (which instruments were used on a certificate)
CREATE TABLE IF NOT EXISTS certificate_test_instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  test_instrument_id UUID REFERENCES test_instruments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(certificate_id, test_instrument_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_property_id ON certificates(property_id);
CREATE INDEX IF NOT EXISTS idx_certificates_company_id ON certificates(company_id);
CREATE INDEX IF NOT EXISTS idx_certificates_created_by ON certificates(created_by);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_certificate_boards_certificate_id ON certificate_boards(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_circuits_board_id ON certificate_circuits(board_id);
CREATE INDEX IF NOT EXISTS idx_certificate_observations_certificate_id ON certificate_observations(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_requests_property_id ON certificate_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_certificate_requests_status ON certificate_requests(status);
CREATE INDEX IF NOT EXISTS idx_certificate_reviews_certificate_id ON certificate_reviews(certificate_id);
