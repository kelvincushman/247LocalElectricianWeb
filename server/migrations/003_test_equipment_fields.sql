-- Add test equipment fields to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS test_instrument_multifunction VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS test_instrument_continuity VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS test_instrument_insulation VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS test_instrument_efli VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS test_instrument_rcd VARCHAR(255);

-- Add missing Ze field if not present
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS ze NUMERIC(10,4);

-- Add spd_operation_status_confirmed to boards (alias for spd_status_confirmed)
-- Note: spd_status_confirmed already exists, we'll use it

-- Add supply_pd fields to boards if not present
ALTER TABLE certificate_boards ADD COLUMN IF NOT EXISTS supply_pd_bs_en VARCHAR(50);
ALTER TABLE certificate_boards ADD COLUMN IF NOT EXISTS supply_pd_rating NUMERIC(10,2);
ALTER TABLE certificate_boards ADD COLUMN IF NOT EXISTS supply_pd_voltage_rating NUMERIC(10,2);

-- Add more circuit fields for Electraform compatibility
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS no_of_points INTEGER;
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS disconnection_time NUMERIC(10,2);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS short_circuit_capacity NUMERIC(10,2);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS voltage_rating NUMERIC(10,2);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS r2 NUMERIC(10,4);
ALTER TABLE certificate_circuits ADD COLUMN IF NOT EXISTS rcd_time_x5 NUMERIC(10,2);
