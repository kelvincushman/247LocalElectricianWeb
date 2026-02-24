-- Migration 002: Complete Certificate Fields with Voice Input Support
-- This migration adds all missing fields based on Electraform documentation
-- Includes image upload capability and inspection schedule items

-- Ensure uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ADD MISSING COLUMNS TO CERTIFICATES TABLE
-- ============================================

-- Client details (expanded)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS client_address_line1 VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS client_address_line2 VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS client_town VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS client_county VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS client_mobile VARCHAR(50);

-- Installation details (expanded)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS occupier_name VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS installation_address_line1 VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS installation_address_line2 VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS installation_town VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS installation_county VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS installation_phone VARCHAR(50);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS premises_type_other VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS previous_certificate_no VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS previous_inspection_unknown BOOLEAN DEFAULT false;

-- Supply characteristics (expanded from Electraform)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS uo_voltage DECIMAL(10,2);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS number_of_supplies INTEGER DEFAULT 1;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS supply_polarity_confirmed BOOLEAN DEFAULT false;

-- Extent and Limitations
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS extent_covered TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS agreed_limitations TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS agreed_with VARCHAR(255);

-- Declaration fields (expanded)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS inspector_position VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS inspector_signature_url VARCHAR(500);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS inspector_date DATE;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS authoriser_name VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS authoriser_position VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS authoriser_signature_url VARCHAR(500);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS authoriser_date DATE;

-- Next inspection
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS next_inspection_period VARCHAR(100);

-- Test instruments (direct on certificate for quick reference)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS instrument_multifunction_serial VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS instrument_continuity_serial VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS instrument_insulation_serial VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS instrument_earth_loop_serial VARCHAR(100);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS instrument_rcd_serial VARCHAR(100);

-- Voice input field mapping (stores current field context)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS voice_field_mapping JSONB DEFAULT '{}';

-- ============================================
-- 2. ADD MISSING COLUMNS TO CERTIFICATE_BOARDS
-- ============================================

-- Board overcurrent protective device (expanded)
ALTER TABLE certificate_boards ADD COLUMN IF NOT EXISTS ocpd_short_circuit_capacity DECIMAL(10,2);
ALTER TABLE certificate_boards ADD COLUMN IF NOT EXISTS idn_rcd_time DECIMAL(10,2); -- IΔn (ms)

-- ============================================
-- 3. ADD MISSING COLUMNS TO CERTIFICATE_CIRCUITS
-- ============================================

-- Additional test results (from Electraform)
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS length_meters DECIMAL(10,2);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS ring_r1 DECIMAL(10,4);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS ring_rn DECIMAL(10,4);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS ring_r2 DECIMAL(10,4);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS rcd_test_button VARCHAR(10); -- OK, FAIL, N/A
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS afdd_test_button VARCHAR(10); -- OK, FAIL, N/A

-- ============================================
-- 4. ADD MISSING COLUMNS TO CERTIFICATE_OBSERVATIONS
-- ============================================

-- Inspection section reference (from 26 Electraform sections)
ALTER TABLE certificate_observations ADD COLUMN IF NOT EXISTS inspection_section VARCHAR(100);
ALTER TABLE certificate_observations ADD COLUMN IF NOT EXISTS inspection_section_item VARCHAR(100);
ALTER TABLE certificate_observations ADD COLUMN IF NOT EXISTS remedial_action_required BOOLEAN DEFAULT false;

-- ============================================
-- 5. CERTIFICATE LIMITATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_limitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  limitation_number INTEGER NOT NULL,
  limitation_type VARCHAR(100),
  limitation_description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificate_limitations_certificate_id ON certificate_limitations(certificate_id);

-- ============================================
-- 6. OBSERVATION IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS observation_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  observation_id UUID REFERENCES certificate_observations(id) ON DELETE CASCADE,
  field_id VARCHAR(100) NOT NULL, -- Voice input identifier e.g., "eicr.observation.1.image"
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption TEXT,
  location_description TEXT,
  tags TEXT[], -- Array of tags like ["fault", "distribution_board", "before"]
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_observation_images_observation_id ON observation_images(observation_id);
CREATE INDEX IF NOT EXISTS idx_observation_images_field_id ON observation_images(field_id);

-- ============================================
-- 7. CERTIFICATE IMAGES TABLE (General)
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  field_id VARCHAR(100) NOT NULL, -- Voice input identifier e.g., "eicr.images.1"
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption TEXT,
  location_description TEXT,
  tags TEXT[],
  image_type VARCHAR(50), -- general, board, circuit, observation
  uploaded_by UUID REFERENCES users(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificate_images_certificate_id ON certificate_images(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_images_field_id ON certificate_images(field_id);

-- ============================================
-- 8. INSPECTION SECTIONS TABLE (26 Sections)
-- ============================================

CREATE TABLE IF NOT EXISTS inspection_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_code VARCHAR(50) UNIQUE NOT NULL,
  section_name VARCHAR(150) NOT NULL,
  section_number INTEGER NOT NULL,
  item_count INTEGER NOT NULL,
  bs7671_section VARCHAR(20),
  complexity_level VARCHAR(20), -- minimal, low, medium, high, highest
  description TEXT,
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert all 26 inspection sections from Electraform
INSERT INTO inspection_sections (section_code, section_name, section_number, item_count, bs7671_section, complexity_level, sort_order) VALUES
('intake_equipment', 'Intake Equipment', 1, 52, NULL, 'high', 1),
('other_sources', 'Other Sources of Supply', 2, 6, NULL, 'low', 2),
('earthing_bonding', 'Earthing / Bonding Arrangements', 3, 50, NULL, 'high', 3),
('consumer_units', 'Consumer Units / Distribution Boards', 4, 181, NULL, 'highest', 4),
('final_circuits', 'Final Circuits', 5, 181, NULL, 'highest', 5),
('accessories_wiring', 'Accessories and Wiring', 6, 53, NULL, 'high', 6),
('general', 'General Observations', 7, 22, NULL, 'medium', 7),
('bath_shower', 'Locations Containing a Bath or Shower', 8, 25, '701', 'medium', 8),
('medical', 'Medical Locations', 9, 6, '710', 'low', 9),
('swimming_pools', 'Swimming Pools', 10, 15, '702', 'low', 10),
('saunas', 'Rooms Containing Saunas', 11, 16, '703', 'low', 11),
('construction_sites', 'Construction and Demolition Sites', 12, 8, '704', 'low', 12),
('agricultural', 'Agricultural and Horticultural', 13, 14, '705', 'low', 13),
('camping_caravan', 'Camping/Caravan Parks', 14, 10, '708', 'low', 14),
('marinas', 'Marinas', 15, 21, '709', 'medium', 15),
('exhibitions', 'Exhibition Stands', 16, 14, '711', 'low', 16),
('solar_pv', 'Solar PV Systems', 17, 25, '712', 'medium', 17),
('outdoor_lighting', 'Outdoor Lighting Installations', 18, 4, '714', 'minimal', 18),
('mobile_units', 'Mobile/Transportable Units', 19, 9, '717', 'low', 19),
('caravans', 'Installations in Caravans/Motor Caravans', 20, 16, '721', 'low', 20),
('ev_charging', 'Vehicle Charging Installations', 21, 10, '722', 'low', 21),
('gangways', 'Operating and Maintenance Gangways', 22, 3, '729', 'minimal', 22),
('inland_vessels', 'Onshore Units for Inland Navigable Vessels', 23, 17, '730', 'low', 23),
('amusement', 'Amusement Parks, Fairgrounds', 24, 12, '740', 'low', 24),
('floor_ceiling_heating', 'Floor and Ceiling Heating Systems', 25, 12, '753', 'low', 25),
('na', 'Not Applicable', 26, 0, NULL, 'minimal', 26)
ON CONFLICT (section_code) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  item_count = EXCLUDED.item_count;

-- ============================================
-- 9. INSPECTION SCHEDULE ITEMS TABLE (782 Items)
-- ============================================

CREATE TABLE IF NOT EXISTS inspection_schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES inspection_sections(id) ON DELETE CASCADE,
  section_code VARCHAR(50) NOT NULL,
  item_number INTEGER NOT NULL,
  item_text TEXT NOT NULL,
  regulation_ref VARCHAR(100),
  field_id VARCHAR(150) UNIQUE NOT NULL, -- Voice input identifier
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section_code, item_number)
);

CREATE INDEX IF NOT EXISTS idx_inspection_items_section_id ON inspection_schedule_items(section_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_section_code ON inspection_schedule_items(section_code);
CREATE INDEX IF NOT EXISTS idx_inspection_items_field_id ON inspection_schedule_items(field_id);

-- Insert sample items for each section (first 5 items per section as examples)
-- Full 782 items should be populated from Electraform extraction

-- Section 1: Intake Equipment (52 items) - Sample
INSERT INTO inspection_schedule_items (section_code, item_number, item_text, regulation_ref, field_id, sort_order) VALUES
('intake_equipment', 1, 'Service cable condition satisfactory', '132.1.1', 'eicr.schedule.intake_equipment.1', 1),
('intake_equipment', 2, 'Service head secure and undamaged', '132.1.1', 'eicr.schedule.intake_equipment.2', 2),
('intake_equipment', 3, 'Meter tails adequately supported', '522.8.5', 'eicr.schedule.intake_equipment.3', 3),
('intake_equipment', 4, 'Meter tails adequately protected', '522.8.5', 'eicr.schedule.intake_equipment.4', 4),
('intake_equipment', 5, 'Intake equipment suitable for maximum demand', '132.1.1', 'eicr.schedule.intake_equipment.5', 5)
ON CONFLICT (section_code, item_number) DO NOTHING;

-- Section 2: Other Sources of Supply (6 items)
INSERT INTO inspection_schedule_items (section_code, item_number, item_text, regulation_ref, field_id, sort_order) VALUES
('other_sources', 1, 'Local isolation switch to isolate microgenerator supply', '551.7.6', 'eicr.schedule.other_sources.1', 1),
('other_sources', 2, 'Generator provided with suitable means of connection to earth', '551.4.3.2.1', 'eicr.schedule.other_sources.2', 2),
('other_sources', 3, 'Appropriate warnings posted for alternative supply', '514.15', 'eicr.schedule.other_sources.3', 3),
('other_sources', 4, 'Isolation between supplies verified', '551.7', 'eicr.schedule.other_sources.4', 4),
('other_sources', 5, 'Interlock mechanism functioning correctly', '551.7.5', 'eicr.schedule.other_sources.5', 5),
('other_sources', 6, 'Battery backup systems correctly installed', '551.4', 'eicr.schedule.other_sources.6', 6)
ON CONFLICT (section_code, item_number) DO NOTHING;

-- Section 3: Earthing/Bonding (50 items) - Sample
INSERT INTO inspection_schedule_items (section_code, item_number, item_text, regulation_ref, field_id, sort_order) VALUES
('earthing_bonding', 1, 'Earthing conductor from TN-S supply cable', '542.1.2.1', 'eicr.schedule.earthing_bonding.1', 1),
('earthing_bonding', 2, 'Main Earthing Terminal (MET) provided', '542.4.1', 'eicr.schedule.earthing_bonding.2', 2),
('earthing_bonding', 3, 'MET has Safety Electrical Connection label', '514.13.1', 'eicr.schedule.earthing_bonding.3', 3),
('earthing_bonding', 4, 'Main protective bonding conductors connected', '411.3.1.2', 'eicr.schedule.earthing_bonding.4', 4),
('earthing_bonding', 5, 'Water installation bonded', '411.3.1.2', 'eicr.schedule.earthing_bonding.5', 5)
ON CONFLICT (section_code, item_number) DO NOTHING;

-- ============================================
-- 10. CERTIFICATE SCHEDULE RESULTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_schedule_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inspection_schedule_items(id) ON DELETE CASCADE,
  field_id VARCHAR(150) NOT NULL, -- Voice input identifier
  result VARCHAR(20), -- satisfactory, unsatisfactory, not_applicable, limitation, not_inspected
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(certificate_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_results_certificate_id ON certificate_schedule_results(certificate_id);
CREATE INDEX IF NOT EXISTS idx_schedule_results_item_id ON certificate_schedule_results(item_id);
CREATE INDEX IF NOT EXISTS idx_schedule_results_field_id ON certificate_schedule_results(field_id);

-- ============================================
-- 11. OBSERVATION CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS observation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL, -- critical, urgent, normal, priority, low, none
  color VARCHAR(20) NOT NULL, -- red, orange, yellow, blue, gray, black
  requires_action BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert observation codes from Electraform
INSERT INTO observation_codes (code, full_name, description, priority, color, requires_action, sort_order) VALUES
('C1', 'Danger Present', 'Danger present, risk of injury. Immediate remedial action required.', 'critical', 'red', true, 1),
('C2', 'Potentially Dangerous', 'Potentially dangerous. Urgent remedial action required.', 'urgent', 'orange', true, 2),
('C3', 'Improvement Recommended', 'Improvement recommended.', 'normal', 'yellow', false, 3),
('FI', 'Further Investigation', 'Further investigation required without delay.', 'priority', 'blue', true, 4),
('NOTE', 'Note', 'Note/Informational.', 'low', 'gray', false, 5),
('N/A', 'Not Applicable', 'Not applicable.', 'none', 'gray', false, 6),
('N/V', 'Not Verified', 'Not verified.', 'none', 'gray', false, 7),
('X', 'See Notes', 'See notes for recipients.', 'none', 'black', false, 8),
('LIM', 'Limitation', 'Limitation noted.', 'none', 'gray', false, 9)
ON CONFLICT (code) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  description = EXCLUDED.description;

-- ============================================
-- 12. MINOR WORKS SPECIFIC FIELDS
-- ============================================

-- Minor Works description fields (added to certificates table)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_description TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_system_type VARCHAR(20); -- TN-C-S, TN-S, TN-C, TT, IT
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_ze_zdb DECIMAL(10,4);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_pfc_at_db DECIMAL(10,2);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_protection_method VARCHAR(100); -- ADS, Class II, etc.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_comments_existing TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_risk_assessment_included BOOLEAN DEFAULT false;

-- Circuit-specific fields for MW
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_spd_confirmed VARCHAR(10); -- YES, NO, LIM, N/A
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_wiring_type VARCHAR(50);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_ref_method VARCHAR(20);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_inspections_carried_out VARCHAR(10);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_earthing_conductor VARCHAR(10);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_db_designation VARCHAR(100);

-- Bonding checkboxes for MW
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_bonding_water BOOLEAN DEFAULT false;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_bonding_gas BOOLEAN DEFAULT false;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_bonding_oil BOOLEAN DEFAULT false;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_bonding_steel BOOLEAN DEFAULT false;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS mw_bonding_other VARCHAR(100);

-- ============================================
-- 13. VOICE INPUT AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS voice_input_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  field_id VARCHAR(150) NOT NULL,
  command_text TEXT NOT NULL, -- The spoken command
  parsed_value TEXT, -- The extracted value
  confidence_score DECIMAL(5,2), -- Voice recognition confidence
  was_corrected BOOLEAN DEFAULT false,
  corrected_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voice_input_log_certificate_id ON voice_input_log(certificate_id);
CREATE INDEX IF NOT EXISTS idx_voice_input_log_field_id ON voice_input_log(field_id);

-- ============================================
-- 14. CERTIFICATE ADDITIONAL PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_additional_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL DEFAULT 1,
  content TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificate_additional_pages_certificate_id ON certificate_additional_pages(certificate_id);

-- ============================================
-- 15. FUNCTIONS FOR VOICE INPUT
-- ============================================

-- Function to get field value by field_id
CREATE OR REPLACE FUNCTION get_certificate_field_value(
  p_certificate_id UUID,
  p_field_id VARCHAR(150)
) RETURNS TEXT AS $$
DECLARE
  v_result TEXT;
  v_field_parts TEXT[];
  v_cert_type TEXT;
  v_section TEXT;
  v_index INTEGER;
  v_field_name TEXT;
BEGIN
  -- Parse the field_id (e.g., "eicr.board.1.circuit.3.zs")
  v_field_parts := string_to_array(p_field_id, '.');

  -- Get certificate type
  SELECT certificate_type INTO v_cert_type FROM certificates WHERE id = p_certificate_id;

  -- Handle different field patterns
  CASE v_field_parts[2]
    WHEN 'client' THEN
      EXECUTE format('SELECT %I FROM certificates WHERE id = $1', 'client_' || v_field_parts[3])
      INTO v_result USING p_certificate_id;
    WHEN 'installation' THEN
      EXECUTE format('SELECT %I FROM certificates WHERE id = $1', 'installation_' || v_field_parts[3])
      INTO v_result USING p_certificate_id;
    -- Add more cases as needed
    ELSE
      -- Try to get from section_data JSONB
      SELECT section_data->>p_field_id INTO v_result
      FROM certificates WHERE id = p_certificate_id;
  END CASE;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 16. VIEWS FOR REPORTING
-- ============================================

-- View for certificate summary with observation counts
CREATE OR REPLACE VIEW certificate_observation_summary AS
SELECT
  c.id AS certificate_id,
  c.certificate_no,
  c.certificate_type,
  c.status,
  c.overall_assessment,
  COUNT(CASE WHEN o.code = 'C1' THEN 1 END) AS c1_count,
  COUNT(CASE WHEN o.code = 'C2' THEN 1 END) AS c2_count,
  COUNT(CASE WHEN o.code = 'C3' THEN 1 END) AS c3_count,
  COUNT(CASE WHEN o.code = 'FI' THEN 1 END) AS fi_count,
  COUNT(o.id) AS total_observations
FROM certificates c
LEFT JOIN certificate_observations o ON c.id = o.certificate_id
GROUP BY c.id, c.certificate_no, c.certificate_type, c.status, c.overall_assessment;

-- View for board/circuit summary
CREATE OR REPLACE VIEW certificate_board_summary AS
SELECT
  c.id AS certificate_id,
  c.certificate_no,
  b.id AS board_id,
  b.db_name,
  b.designation,
  b.location,
  b.no_of_ways,
  COUNT(cir.id) AS circuit_count,
  COUNT(CASE WHEN cir.circuit_result = 'fail' THEN 1 END) AS failed_circuits
FROM certificates c
JOIN certificate_boards b ON c.id = b.certificate_id
LEFT JOIN certificate_circuits cir ON b.id = cir.board_id
GROUP BY c.id, c.certificate_no, b.id, b.db_name, b.designation, b.location, b.no_of_ways;

-- ============================================
-- 17. TRIGGERS
-- ============================================

-- Trigger to update certificate updated_at timestamp
-- Fixed: certificate_circuits doesn't have certificate_id directly, it goes via board_id
-- Also handles DELETE operations correctly (uses OLD instead of NEW)
CREATE OR REPLACE FUNCTION update_certificate_timestamp()
RETURNS TRIGGER AS $$
DECLARE
  cert_id UUID;
BEGIN
  -- For DELETE operations, use OLD; otherwise use NEW
  IF TG_OP = 'DELETE' THEN
    -- For tables with direct certificate_id reference
    IF TG_TABLE_NAME IN ('certificate_observations', 'certificate_reviews', 'certificate_boards') THEN
      cert_id := OLD.certificate_id;
    -- For certificate_circuits, get certificate_id via board_id
    ELSIF TG_TABLE_NAME = 'certificate_circuits' THEN
      SELECT certificate_id INTO cert_id FROM certificate_boards WHERE id = OLD.board_id;
    END IF;
    UPDATE certificates SET updated_at = CURRENT_TIMESTAMP WHERE id = cert_id;
    RETURN OLD;
  ELSE
    -- For INSERT/UPDATE operations
    IF TG_TABLE_NAME IN ('certificate_observations', 'certificate_reviews', 'certificate_boards') THEN
      cert_id := NEW.certificate_id;
    ELSIF TG_TABLE_NAME = 'certificate_circuits' THEN
      SELECT certificate_id INTO cert_id FROM certificate_boards WHERE id = NEW.board_id;
    END IF;
    UPDATE certificates SET updated_at = CURRENT_TIMESTAMP WHERE id = cert_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to related tables
DROP TRIGGER IF EXISTS trigger_board_update_certificate ON certificate_boards;
CREATE TRIGGER trigger_board_update_certificate
AFTER INSERT OR UPDATE OR DELETE ON certificate_boards
FOR EACH ROW EXECUTE FUNCTION update_certificate_timestamp();

DROP TRIGGER IF EXISTS trigger_circuit_update_certificate ON certificate_circuits;
CREATE TRIGGER trigger_circuit_update_certificate
AFTER INSERT OR UPDATE OR DELETE ON certificate_circuits
FOR EACH ROW EXECUTE FUNCTION update_certificate_timestamp();

DROP TRIGGER IF EXISTS trigger_observation_update_certificate ON certificate_observations;
CREATE TRIGGER trigger_observation_update_certificate
AFTER INSERT OR UPDATE OR DELETE ON certificate_observations
FOR EACH ROW EXECUTE FUNCTION update_certificate_timestamp();

-- ============================================
-- 18. GRANT PERMISSIONS (if using roles)
-- ============================================

-- Uncomment if using database roles
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Summary:
-- 1. Added missing client/installation fields to certificates
-- 2. Added supply characteristics fields
-- 3. Added declaration and signature fields
-- 4. Added test instrument serial fields
-- 5. Created certificate_limitations table
-- 6. Created observation_images table (for fault photos)
-- 7. Created certificate_images table (general images)
-- 8. Created inspection_sections table (26 sections)
-- 9. Created inspection_schedule_items table (782 items placeholder)
-- 10. Created certificate_schedule_results table
-- 11. Created observation_codes table
-- 12. Added Minor Works specific fields
-- 13. Created voice_input_log for audit trail
-- 14. Created certificate_additional_pages table
-- 15. Added voice input helper function
-- 16. Created summary views
-- 17. Added update timestamp triggers
