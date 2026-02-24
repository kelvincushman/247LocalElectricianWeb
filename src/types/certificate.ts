// Certificate Types for ElectricalCertAI Integration
// With Voice Input Support - BS 7671:2018+A3:2024

export type CertificateType = 'eicr' | 'eics' | 'mw' | 'mw3' | 'scc' | 'evcr' | 'bond';
export type CertificateStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
export type ObservationCode = 'C1' | 'C2' | 'C3' | 'FI' | 'NOTE' | 'LIM' | 'NA' | 'NV' | 'X';
export type EarthingArrangement = 'TN-S' | 'TN-C-S' | 'TN-C' | 'TT' | 'IT';
export type PhaseConfiguration = '1-phase 2 wire' | '1-phase 3 wire' | '2-phase 3 wire' | '3-phase 3 wire' | '3-phase 4 wire' | 'Other';
export type OverallAssessment = 'satisfactory' | 'unsatisfactory';
export type PremisesType = 'residential' | 'commercial' | 'industrial' | 'other';
export type ScheduleResult = 'satisfactory' | 'unsatisfactory' | 'not_applicable' | 'limitation' | 'not_inspected';
export type SelectResult = 'YES' | 'NO' | 'LIM' | 'N/A' | '';

export interface Certificate {
  id: string;
  certificate_no: string;
  certificate_type: CertificateType;
  status: CertificateStatus;

  // Relationships
  job_id?: string;
  property_id: string;
  company_id?: string;
  customer_id?: string;

  // Assignment
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;

  // Flexible data
  section_data?: Record<string, unknown>;

  // Client details
  client_name: string;
  client_address: string;
  client_phone?: string;
  client_email?: string;

  // Installation details
  installation_address: string;
  installation_postcode: string;

  // Inspector details
  inspector_name: string;
  inspector_registration?: string;
  inspection_date?: string;
  next_inspection_date?: string;

  // EICR specific
  overall_assessment?: OverallAssessment;
  reason_for_report?: string;

  // Supply characteristics
  earthing_arrangement?: EarthingArrangement;
  number_of_live_conductors?: string;
  phase_configuration?: PhaseConfiguration;
  nominal_voltage?: string;
  nominal_frequency?: string;
  pfc_pscc?: number;
  external_loop_impedance?: number;

  // Supply protective device
  supply_pd_bs_en?: string;
  supply_pd_type?: string;
  supply_pd_rating?: number;
  supply_pd_short_circuit_capacity?: number;

  // Installation age/records
  installation_age_years?: number;
  evidence_of_alterations?: 'yes' | 'no' | 'not_apparent';
  alterations_age_years?: number;
  records_available?: boolean;
  previous_inspection_date?: string;
  records_held_by?: string;

  // Description
  premises_type?: PremisesType;
  premises_type_other?: string;
  extent_of_installation?: string;

  // Client details (expanded)
  client_address_line1?: string;
  client_address_line2?: string;
  client_town?: string;
  client_county?: string;
  client_mobile?: string;

  // Installation details (expanded)
  occupier_name?: string;
  installation_address_line1?: string;
  installation_address_line2?: string;
  installation_town?: string;
  installation_county?: string;
  installation_phone?: string;
  previous_certificate_no?: string;
  previous_inspection_unknown?: boolean;

  // Supply characteristics (expanded)
  uo_voltage?: number;
  number_of_supplies?: number;
  supply_polarity_confirmed?: boolean;

  // Extent and Limitations
  extent_covered?: string;
  agreed_limitations?: string;
  agreed_with?: string;

  // Declaration fields (expanded)
  inspector_position?: string;
  inspector_signature_url?: string;
  inspector_date?: string;
  authoriser_name?: string;
  authoriser_position?: string;
  authoriser_signature_url?: string;
  authoriser_date?: string;

  // Next inspection
  next_inspection_period?: string;

  // Test instruments (direct references)
  instrument_multifunction_serial?: string;
  instrument_continuity_serial?: string;
  instrument_insulation_serial?: string;
  instrument_earth_loop_serial?: string;
  instrument_rcd_serial?: string;

  // Voice input field mapping
  voice_field_mapping?: Record<string, unknown>;

  // Minor Works specific fields
  mw_description?: string;
  mw_system_type?: EarthingArrangement;
  mw_ze_zdb?: number;
  mw_pfc_at_db?: number;
  mw_protection_method?: string;
  mw_comments_existing?: string;
  mw_risk_assessment_included?: boolean;
  mw_spd_confirmed?: SelectResult;
  mw_wiring_type?: string;
  mw_ref_method?: string;
  mw_inspections_carried_out?: SelectResult;
  mw_earthing_conductor?: SelectResult;
  mw_db_designation?: string;
  mw_bonding_water?: boolean;
  mw_bonding_gas?: boolean;
  mw_bonding_oil?: boolean;
  mw_bonding_steel?: boolean;
  mw_bonding_other?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at?: string;

  // Customer visibility
  pdf_url?: string;
  is_customer_visible: boolean;

  // Joined data
  property_address?: string;
  property_postcode?: string;
  company_name?: string;
  customer_name?: string;
  created_by_name?: string;
  approved_by_name?: string;
  job_number?: string;

  // Nested data
  boards?: CertificateBoard[];
  observations?: CertificateObservation[];
  images?: CertificateImage[];
  limitations?: CertificateLimitation[];
}

export interface CertificateBoard {
  id: string;
  certificate_id: string;
  db_name: string;
  designation?: string;
  location?: string;
  supplied_from: string;
  no_of_ways?: number;
  no_of_phases: number;

  // SPD details
  spd_fitted: boolean;
  spd_type_t1: boolean;
  spd_type_t2: boolean;
  spd_type_t3: boolean;
  spd_status_confirmed: boolean;

  // Overcurrent protective device
  ocpd_bs_en?: string;
  ocpd_rating_amps?: number;
  ocpd_voltage_rating?: number;

  // Measurements
  zdb?: number;
  ipf?: number;
  rcd_time_ms?: number;
  idn_rcd_time?: number;

  // Overcurrent protective device (expanded)
  ocpd_short_circuit_capacity?: number;

  // Polarity/Phase
  supply_polarity_confirmed: boolean;
  phase_sequence_confirmed: boolean;

  sort_order: number;
  created_at: string;

  // Nested circuits
  circuits?: CertificateCircuit[];

  // Board images
  images?: CertificateImage[];
}

export interface CertificateCircuit {
  id: string;
  board_id: string;
  circuit_number?: number;
  designation?: string;
  circuit_type?: string;
  no_of_points?: number;

  // Cable details
  wiring_type?: string;
  ref_method?: string;
  live_csa?: string;
  cpc_csa?: string;

  // Protective device
  rating_amps?: number;
  breaker_type?: string;
  breaker_bs_en?: string;
  short_circuit_capacity?: number;
  voltage_rating?: number;
  disconnection_time?: number;

  // RCD details
  rcd_type?: string;
  rcd_rating_ma?: number;
  max_zs?: number;

  // Test results
  r1_plus_r2?: number;
  r2?: number;
  zs?: number;
  insulation_resistance_live_earth?: number;
  insulation_resistance_live_neutral?: number;
  polarity?: 'OK' | 'FAIL';
  rcd_time_x1?: number;
  rcd_time_x5?: number;

  // Additional test results (from Electraform)
  length_meters?: number;
  ring_r1?: number;
  ring_rn?: number;
  ring_r2?: number;
  rcd_test_button?: 'OK' | 'FAIL' | 'N/A';
  afdd_test_button?: 'OK' | 'FAIL' | 'N/A';

  // Result
  circuit_result: 'pass' | 'fail' | 'na';
  notes?: string;

  sort_order: number;
  created_at: string;
}

export interface CertificateObservation {
  id: string;
  certificate_id: string;
  code: ObservationCode;
  item_number?: number;
  schedule_item_no?: string;
  location?: string;
  observation: string;
  recommendation?: string;
  db_circuit_ref?: string;
  remedial_action?: string;
  linked_quote_id?: string;
  linked_quote_number?: string;

  // Inspection section reference (from 26 Electraform sections)
  inspection_section?: string;
  inspection_section_item?: string;
  remedial_action_required?: boolean;

  // Attached images
  images?: ObservationImage[];

  sort_order: number;
  created_at: string;
}

// Observation Images (for documenting faults)
export interface ObservationImage {
  id: string;
  observation_id: string;
  field_id: string; // Voice input identifier e.g., "eicr.observation.1.image"
  filename: string;
  original_filename?: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  location_description?: string;
  tags?: string[];
  uploaded_by?: string;
  created_at: string;
}

// Certificate Images (general)
export interface CertificateImage {
  id: string;
  certificate_id: string;
  field_id: string; // Voice input identifier e.g., "eicr.images.1"
  filename: string;
  original_filename?: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  location_description?: string;
  tags?: string[];
  image_type?: 'general' | 'board' | 'circuit' | 'observation';
  uploaded_by?: string;
  sort_order: number;
  created_at: string;
}

// Certificate Limitations
export interface CertificateLimitation {
  id: string;
  certificate_id: string;
  limitation_number: number;
  limitation_type?: string;
  limitation_description: string;
  sort_order: number;
  created_at: string;
}

// Inspection Sections (26 sections from Electraform)
export interface InspectionSection {
  id: string;
  section_code: string;
  section_name: string;
  section_number: number;
  item_count: number;
  bs7671_section?: string;
  complexity_level?: 'minimal' | 'low' | 'medium' | 'high' | 'highest';
  description?: string;
  sort_order: number;
  is_active: boolean;
}

// Inspection Schedule Items (782 items)
export interface InspectionScheduleItem {
  id: string;
  section_id: string;
  section_code: string;
  item_number: number;
  item_text: string;
  regulation_ref?: string;
  field_id: string; // Voice input identifier
  sort_order: number;
  is_active: boolean;
}

// Certificate Schedule Results
export interface CertificateScheduleResult {
  id: string;
  certificate_id: string;
  item_id: string;
  field_id: string;
  result?: ScheduleResult;
  comments?: string;
  created_at: string;
  updated_at: string;
}

// Voice Input Log (for auditing)
export interface VoiceInputLog {
  id: string;
  certificate_id: string;
  user_id: string;
  field_id: string;
  command_text: string;
  parsed_value?: string;
  confidence_score?: number;
  was_corrected: boolean;
  corrected_value?: string;
  created_at: string;
}

export interface CertificateReview {
  id: string;
  certificate_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  action: 'submitted' | 'approved' | 'rejected' | 'revision_requested';
  comments?: string;
  created_at: string;
}

export interface CertificateRequest {
  id: string;
  property_id: string;
  company_id?: string;
  customer_id?: string;
  requested_by: string;
  certificate_type: CertificateType;
  preferred_date?: string;
  notes?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  assigned_job_id?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  property_address?: string;
  property_postcode?: string;
  company_name?: string;
  requested_by_name?: string;
  assigned_job_number?: string;
}

export interface TestInstrument {
  id: string;
  company_id?: string;
  instrument_type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  calibration_date?: string;
  next_calibration?: string;
  is_active: boolean;
  created_at: string;
}

export interface EngineerProfile {
  id: string;
  user_id: string;
  napit_number?: string;
  nic_number?: string;
  signature_url?: string;
  can_approve_certificates: boolean;
  created_at: string;
}

export interface NotificationSettings {
  id?: string;
  user_id?: string;
  email_certificate_submitted: boolean;
  email_certificate_approved: boolean;
  email_certificate_rejected: boolean;
  email_new_request: boolean;
  sms_certificate_approved: boolean;
  sms_new_request: boolean;
}

export interface CompanyCertificateSettings {
  id?: string;
  company_id?: string;
  auto_link_observations_to_quotes: boolean;
  require_qs_approval: boolean;
  default_next_inspection_months: number;
  trading_title?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  enrolment_number?: string;
  company_logo_url?: string;
}

// Form data types
export interface CreateCertificateData {
  certificate_type: CertificateType;
  property_id: string;
  job_id?: string;
  company_id?: string;
  customer_id?: string;
  client_name?: string;
  client_address?: string;
  client_phone?: string;
  client_email?: string;
  installation_address?: string;
  installation_postcode?: string;
}

export interface UpdateCertificateData extends Partial<Omit<Certificate, 'id' | 'certificate_no' | 'created_at' | 'updated_at'>> {}

export interface CreateBoardData {
  db_name?: string;
  designation?: string;
  location?: string;
  supplied_from?: string;
  no_of_ways?: number;
  no_of_phases?: number;
  spd_fitted?: boolean;
  spd_type_t1?: boolean;
  spd_type_t2?: boolean;
  spd_type_t3?: boolean;
  spd_status_confirmed?: boolean;
  ocpd_bs_en?: string;
  ocpd_rating_amps?: number;
  ocpd_voltage_rating?: number;
  zdb?: number;
  ipf?: number;
  rcd_time_ms?: number;
  supply_polarity_confirmed?: boolean;
  phase_sequence_confirmed?: boolean;
}

export interface CreateCircuitData extends Partial<Omit<CertificateCircuit, 'id' | 'board_id' | 'created_at'>> {}

export interface CreateObservationData {
  code: ObservationCode;
  item_number?: number;
  schedule_item_no?: string;
  location?: string;
  observation: string;
  recommendation?: string;
  db_circuit_ref?: string;
  remedial_action?: string;
}

// Observation code metadata (BS 7671:2018+A3:2024)
export const OBSERVATION_CODES = {
  C1: { label: 'C1', color: 'red', description: 'Danger present, risk of injury. Immediate remedial action required.', bgColor: 'bg-red-600', priority: 'critical', requiresAction: true },
  C2: { label: 'C2', color: 'orange', description: 'Potentially dangerous. Urgent remedial action required.', bgColor: 'bg-orange-500', priority: 'urgent', requiresAction: true },
  C3: { label: 'C3', color: 'yellow', description: 'Improvement recommended.', bgColor: 'bg-yellow-500', priority: 'normal', requiresAction: false },
  FI: { label: 'FI', color: 'blue', description: 'Further investigation required without delay.', bgColor: 'bg-blue-500', priority: 'priority', requiresAction: true },
  NOTE: { label: 'NOTE', color: 'gray', description: 'Note/Informational.', bgColor: 'bg-gray-400', priority: 'low', requiresAction: false },
  LIM: { label: 'LIM', color: 'gray', description: 'Limitation noted.', bgColor: 'bg-gray-400', priority: 'none', requiresAction: false },
  NA: { label: 'N/A', color: 'gray', description: 'Not applicable.', bgColor: 'bg-gray-400', priority: 'none', requiresAction: false },
  NV: { label: 'N/V', color: 'gray', description: 'Not verified.', bgColor: 'bg-gray-400', priority: 'none', requiresAction: false },
  X: { label: 'X', color: 'black', description: 'See notes for recipients.', bgColor: 'bg-gray-800', priority: 'none', requiresAction: false },
} as const;

export const CERTIFICATE_TYPES = {
  eicr: { label: 'EICR', fullName: 'Electrical Installation Condition Report', standard: 'BS 7671:2018+A3:2024' },
  eics: { label: 'EICS', fullName: 'Electrical Installation Certificate (Single Signature)', standard: 'BS 7671:2018+A3:2024' },
  mw: { label: 'Minor Works', fullName: 'Minor Works Certificate', standard: 'BS 7671:2018+A3:2024' },
  mw3: { label: 'Minor Works (Multi)', fullName: 'Minor Works Certificate - Multi Item', standard: 'BS 7671:2018+A3:2024' },
  scc: { label: 'SCC', fullName: 'Single Circuit Certificate', standard: 'BS 7671:2018+A3:2024' },
  evcr: { label: 'EVCR', fullName: 'Visual Condition Report', standard: 'BS 7671:2018' },
  bond: { label: 'BOND', fullName: 'Earthing and Bonding Installation Certificate', standard: 'BS 7671:2018+A3:2024' },
} as const;

export const CERTIFICATE_STATUSES = {
  draft: { label: 'Draft', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  submitted: { label: 'Pending Approval', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  approved: { label: 'Approved', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  rejected: { label: 'Rejected', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  revision_requested: { label: 'Revision Requested', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
} as const;

export const EARTHING_ARRANGEMENTS = ['TN-S', 'TN-C-S', 'TN-C', 'TT', 'IT'] as const;

export const PHASE_CONFIGURATIONS = [
  '1-phase 2 wire',
  '1-phase 3 wire',
  '2-phase 3 wire',
  '3-phase 3 wire',
  '3-phase 4 wire',
  'Other'
] as const;

export const PREMISES_TYPES = ['residential', 'commercial', 'industrial', 'other'] as const;

export const CIRCUIT_TYPES = [
  'lighting',
  'socket',
  'ring_final',
  'radial',
  'cooker',
  'shower',
  'immersion',
  'heating',
  'smoke_alarm',
  'ev_charger',
  'external',
  'garage',
  'other'
] as const;

export const BREAKER_TYPES = ['B', 'C', 'D', 'RCBO'] as const;

export const RCD_TYPES = ['AC', 'A', 'F', 'B'] as const;

export const WIRING_TYPES = ['T+E', 'SWA', 'FP200', 'MICC', 'Conduit', 'Trunking', 'Other'] as const;

export const REF_METHODS = ['A', 'B', 'C', '100', '101', '102', '103', 'Other'] as const;

// Common Domestic Circuit Templates (BS 7671:2018+A3:2024 compliant)
export interface CircuitTemplate {
  name: string;
  designation: string;
  circuit_type: string;
  rating_amps: number;
  breaker_type: string;
  breaker_bs_en: string;
  wiring_type: string;
  live_csa: string;
  cpc_csa: string;
  ref_method: string;
  max_zs?: number;
  rcd_type?: string;
  rcd_rating_ma?: number;
}

export const COMMON_DOMESTIC_CIRCUITS: CircuitTemplate[] = [
  // Ring Final Circuits
  {
    name: 'Ring Main (Downstairs)',
    designation: 'Ring Downstairs',
    circuit_type: 'ring_final',
    rating_amps: 32,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '2.5',
    cpc_csa: '1.5',
    ref_method: 'C',
    max_zs: 1.37,
  },
  {
    name: 'Ring Main (Upstairs)',
    designation: 'Ring Upstairs',
    circuit_type: 'ring_final',
    rating_amps: 32,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '2.5',
    cpc_csa: '1.5',
    ref_method: 'C',
    max_zs: 1.37,
  },
  // Lighting Circuits
  {
    name: 'Lighting (Downstairs)',
    designation: 'Lights Downstairs',
    circuit_type: 'lighting',
    rating_amps: 6,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '1.5',
    cpc_csa: '1.0',
    ref_method: 'C',
    max_zs: 7.28,
  },
  {
    name: 'Lighting (Upstairs)',
    designation: 'Lights Upstairs',
    circuit_type: 'lighting',
    rating_amps: 6,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '1.5',
    cpc_csa: '1.0',
    ref_method: 'C',
    max_zs: 7.28,
  },
  // Cooker Circuit
  {
    name: 'Cooker',
    designation: 'Cooker',
    circuit_type: 'cooker',
    rating_amps: 32,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '6.0',
    cpc_csa: '2.5',
    ref_method: 'C',
    max_zs: 1.37,
  },
  // Shower Circuit
  {
    name: 'Shower (9.5kW)',
    designation: 'Shower',
    circuit_type: 'shower',
    rating_amps: 45,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '10.0',
    cpc_csa: '4.0',
    ref_method: 'C',
    max_zs: 0.97,
  },
  // Immersion Heater
  {
    name: 'Immersion Heater',
    designation: 'Immersion',
    circuit_type: 'immersion',
    rating_amps: 16,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '2.5',
    cpc_csa: '1.5',
    ref_method: 'C',
    max_zs: 2.73,
  },
  // Smoke Alarm
  {
    name: 'Smoke/Heat Alarm',
    designation: 'Smoke Alarm',
    circuit_type: 'smoke_alarm',
    rating_amps: 6,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '1.5',
    cpc_csa: '1.0',
    ref_method: 'C',
    max_zs: 7.28,
  },
  // Boiler/Heating
  {
    name: 'Boiler/FCU',
    designation: 'Boiler',
    circuit_type: 'heating',
    rating_amps: 6,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '1.5',
    cpc_csa: '1.0',
    ref_method: 'C',
    max_zs: 7.28,
  },
  // External/Outside
  {
    name: 'External Sockets',
    designation: 'External',
    circuit_type: 'external',
    rating_amps: 20,
    breaker_type: 'RCBO',
    breaker_bs_en: 'BS EN 61009',
    wiring_type: 'T+E',
    live_csa: '2.5',
    cpc_csa: '1.5',
    ref_method: 'C',
    max_zs: 2.19,
    rcd_type: 'A',
    rcd_rating_ma: 30,
  },
  // Garage
  {
    name: 'Garage/Outbuilding',
    designation: 'Garage',
    circuit_type: 'garage',
    rating_amps: 20,
    breaker_type: 'RCBO',
    breaker_bs_en: 'BS EN 61009',
    wiring_type: 'SWA',
    live_csa: '2.5',
    cpc_csa: '1.5',
    ref_method: 'C',
    max_zs: 2.19,
    rcd_type: 'A',
    rcd_rating_ma: 30,
  },
  // EV Charger
  {
    name: 'EV Charger (7kW)',
    designation: 'EV Charger',
    circuit_type: 'ev_charger',
    rating_amps: 32,
    breaker_type: 'RCBO',
    breaker_bs_en: 'BS EN 61009',
    wiring_type: 'T+E',
    live_csa: '6.0',
    cpc_csa: '2.5',
    ref_method: 'C',
    max_zs: 1.37,
    rcd_type: 'A',
    rcd_rating_ma: 30,
  },
  // Spur/FCU (Radial)
  {
    name: 'Spur/FCU',
    designation: 'FCU',
    circuit_type: 'radial',
    rating_amps: 16,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '2.5',
    cpc_csa: '1.5',
    ref_method: 'C',
    max_zs: 2.73,
  },
  // Dishwasher/Washing Machine Radial
  {
    name: 'Appliance Radial',
    designation: 'Appliance',
    circuit_type: 'radial',
    rating_amps: 20,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '2.5',
    cpc_csa: '1.5',
    ref_method: 'C',
    max_zs: 2.19,
  },
  // Spare
  {
    name: 'Spare',
    designation: 'Spare',
    circuit_type: 'other',
    rating_amps: 0,
    breaker_type: 'B',
    breaker_bs_en: 'BS 60898',
    wiring_type: 'T+E',
    live_csa: '-',
    cpc_csa: '-',
    ref_method: '-',
  },
];

// Maximum Zs Values Lookup Table - BS 7671:2018+A3:2024 (0.4s disconnection for 230V)
// Key format: {breaker_type}_{rating_amps}
// Values in Ohms
export const MAX_ZS_VALUES: Record<string, number> = {
  // Type B MCBs (BS EN 60898)
  'B_6': 7.28,
  'B_10': 4.37,
  'B_16': 2.73,
  'B_20': 2.19,
  'B_25': 1.75,
  'B_32': 1.37,
  'B_40': 1.09,
  'B_45': 0.97,
  'B_50': 0.87,
  'B_63': 0.69,

  // Type C MCBs (BS EN 60898)
  'C_6': 3.64,
  'C_10': 2.19,
  'C_16': 1.37,
  'C_20': 1.09,
  'C_25': 0.87,
  'C_32': 0.68,
  'C_40': 0.55,
  'C_45': 0.49,
  'C_50': 0.44,
  'C_63': 0.35,

  // Type D MCBs (BS EN 60898)
  'D_6': 1.82,
  'D_10': 1.09,
  'D_16': 0.68,
  'D_20': 0.55,
  'D_25': 0.44,
  'D_32': 0.34,
  'D_40': 0.27,
  'D_50': 0.22,
  'D_63': 0.17,

  // RCBO Type B (BS EN 61009)
  'RCBO_6': 7.28,
  'RCBO_10': 4.37,
  'RCBO_16': 2.73,
  'RCBO_20': 2.19,
  'RCBO_25': 1.75,
  'RCBO_32': 1.37,
  'RCBO_40': 1.09,
  'RCBO_45': 0.97,
  'RCBO_50': 0.87,
  'RCBO_63': 0.69,
};

// Function to get Max Zs value
export function getMaxZs(breakerType: string, ratingAmps: number): number | undefined {
  const key = `${breakerType}_${ratingAmps}`;
  return MAX_ZS_VALUES[key];
}

// Common breaker ratings for dropdown
export const BREAKER_RATINGS = [6, 10, 16, 20, 25, 32, 40, 45, 50, 63, 80, 100] as const;

// Protection Methods for Minor Works
export const PROTECTION_METHODS = [
  'ADS',
  'Use of Class II equipment',
  'Non conducting location',
  'Earth free local bonding',
  'Electrical separation',
  '-'
] as const;

// Inspection Sections (26 sections from Electraform BS 7671:2018+A3:2024)
export const INSPECTION_SECTIONS = {
  intake_equipment: { code: 'intake_equipment', name: 'Intake Equipment', itemCount: 52, section: 1 },
  other_sources: { code: 'other_sources', name: 'Other Sources of Supply', itemCount: 6, section: 2 },
  earthing_bonding: { code: 'earthing_bonding', name: 'Earthing / Bonding Arrangements', itemCount: 50, section: 3 },
  consumer_units: { code: 'consumer_units', name: 'Consumer Units / Distribution Boards', itemCount: 181, section: 4 },
  final_circuits: { code: 'final_circuits', name: 'Final Circuits', itemCount: 181, section: 5 },
  accessories_wiring: { code: 'accessories_wiring', name: 'Accessories and Wiring', itemCount: 53, section: 6 },
  general: { code: 'general', name: 'General Observations', itemCount: 22, section: 7 },
  bath_shower: { code: 'bath_shower', name: 'Locations Containing a Bath or Shower', itemCount: 25, section: 8, bs7671: '701' },
  medical: { code: 'medical', name: 'Medical Locations', itemCount: 6, section: 9, bs7671: '710' },
  swimming_pools: { code: 'swimming_pools', name: 'Swimming Pools', itemCount: 15, section: 10, bs7671: '702' },
  saunas: { code: 'saunas', name: 'Rooms Containing Saunas', itemCount: 16, section: 11, bs7671: '703' },
  construction_sites: { code: 'construction_sites', name: 'Construction and Demolition Sites', itemCount: 8, section: 12, bs7671: '704' },
  agricultural: { code: 'agricultural', name: 'Agricultural and Horticultural', itemCount: 14, section: 13, bs7671: '705' },
  camping_caravan: { code: 'camping_caravan', name: 'Camping/Caravan Parks', itemCount: 10, section: 14, bs7671: '708' },
  marinas: { code: 'marinas', name: 'Marinas', itemCount: 21, section: 15, bs7671: '709' },
  exhibitions: { code: 'exhibitions', name: 'Exhibition Stands', itemCount: 14, section: 16, bs7671: '711' },
  solar_pv: { code: 'solar_pv', name: 'Solar PV Systems', itemCount: 25, section: 17, bs7671: '712' },
  outdoor_lighting: { code: 'outdoor_lighting', name: 'Outdoor Lighting Installations', itemCount: 4, section: 18, bs7671: '714' },
  mobile_units: { code: 'mobile_units', name: 'Mobile/Transportable Units', itemCount: 9, section: 19, bs7671: '717' },
  caravans: { code: 'caravans', name: 'Installations in Caravans/Motor Caravans', itemCount: 16, section: 20, bs7671: '721' },
  ev_charging: { code: 'ev_charging', name: 'Vehicle Charging Installations', itemCount: 10, section: 21, bs7671: '722' },
  gangways: { code: 'gangways', name: 'Operating and Maintenance Gangways', itemCount: 3, section: 22, bs7671: '729' },
  inland_vessels: { code: 'inland_vessels', name: 'Onshore Units for Inland Navigable Vessels', itemCount: 17, section: 23, bs7671: '730' },
  amusement: { code: 'amusement', name: 'Amusement Parks, Fairgrounds', itemCount: 12, section: 24, bs7671: '740' },
  floor_ceiling_heating: { code: 'floor_ceiling_heating', name: 'Floor and Ceiling Heating Systems', itemCount: 12, section: 25, bs7671: '753' },
  na: { code: 'na', name: 'Not Applicable', itemCount: 0, section: 26 },
} as const;

// Schedule Result Options
export const SCHEDULE_RESULTS = {
  satisfactory: { label: 'Satisfactory', color: 'green', icon: '✓' },
  unsatisfactory: { label: 'Unsatisfactory', color: 'red', icon: '✗' },
  not_applicable: { label: 'N/A', color: 'gray', icon: '-' },
  limitation: { label: 'LIM', color: 'yellow', icon: 'LIM' },
  not_inspected: { label: 'Not Inspected', color: 'gray', icon: 'NI' },
} as const;

// Voice Input Field Patterns (for parsing voice commands)
export const VOICE_FIELD_PATTERNS = {
  // Client fields
  'client name': 'eicr.client.name',
  'client address': 'eicr.client.address.line1',
  'client phone': 'eicr.client.phone',
  'client email': 'eicr.client.email',

  // Installation fields
  'occupier name': 'eicr.installation.occupier',
  'installation address': 'eicr.installation.address.line1',
  'installation age': 'eicr.installation.estimated_age',

  // Supply fields
  'ze': 'eicr.supply.ze',
  'voltage': 'eicr.supply.voltage',
  'frequency': 'eicr.supply.frequency',
  'pfc': 'eicr.supply.pfc',

  // Board fields (with index)
  'board (\\d+) name': 'eicr.board.$1.name',
  'board (\\d+) location': 'eicr.board.$1.location',
  'board (\\d+) zdb': 'eicr.board.$1.zdb',
  'board (\\d+) ipf': 'eicr.board.$1.ipf',

  // Circuit fields (with board and circuit index)
  'board (\\d+) circuit (\\d+) designation': 'eicr.board.$1.circuit.$2.designation',
  'board (\\d+) circuit (\\d+) rating': 'eicr.board.$1.circuit.$2.rating',
  'board (\\d+) circuit (\\d+) zs': 'eicr.board.$1.circuit.$2.zs',
  'board (\\d+) circuit (\\d+) r1 plus r2': 'eicr.board.$1.circuit.$2.r1_plus_r2',
  'board (\\d+) circuit (\\d+) insulation': 'eicr.board.$1.circuit.$2.ir_live_earth',
  'board (\\d+) circuit (\\d+) polarity': 'eicr.board.$1.circuit.$2.polarity',
  'board (\\d+) circuit (\\d+) rcd': 'eicr.board.$1.circuit.$2.rcd_x1',

  // Observation fields (with index)
  'observation (\\d+) code': 'eicr.observation.$1.code',
  'observation (\\d+) location': 'eicr.observation.$1.location',
  'observation (\\d+) details': 'eicr.observation.$1.details',

  // Declaration
  'overall assessment': 'eicr.declaration.overall_assessment',
  'next inspection': 'eicr.next_inspection.date',
} as const;

// Image type options for uploads
export const IMAGE_TYPES = ['general', 'board', 'circuit', 'observation'] as const;

// Common image tags for categorization
export const IMAGE_TAGS = [
  'fault',
  'before',
  'after',
  'distribution_board',
  'consumer_unit',
  'circuit',
  'cable',
  'accessory',
  'socket',
  'switch',
  'lighting',
  'earthing',
  'bonding',
  'external',
  'damage',
  'corrosion',
  'overheating',
  'warning_label'
] as const;
