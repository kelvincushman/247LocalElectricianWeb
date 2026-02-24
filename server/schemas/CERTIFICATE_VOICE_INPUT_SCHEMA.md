# Certificate Voice-Input Schema
## Unique Field Identifiers for AI Agent & Voice Input

**Version:** 1.0.0
**Standard:** BS 7671:2018+A3:2024
**Date:** 2026-01-26

---

## Overview

This schema defines unique field identifiers for every certificate field, enabling:
- **Voice Input**: Electricians can speak field values ("Set circuit 3 Zs to 0.45 ohms")
- **AI Agent Access**: Agent can populate any field by identifier
- **Voice Feedback**: System can read back values ("Circuit 3 Zs is 0.45 ohms")
- **Image Upload**: Link images to specific observations/faults

---

## Field Identifier Pattern

All fields follow a hierarchical naming convention:
```
{certificate_type}.{section}.{subsection}.{field_name}
{certificate_type}.{section}.{index}.{subsection}.{field_name}
```

### Examples:
- `eicr.client.name` - EICR client name
- `eicr.board.1.circuit.3.zs` - EICR Board 1, Circuit 3, Zs value
- `eicr.observation.1.code` - EICR Observation 1 code
- `mw.circuit.1.rating` - Minor Works Circuit 1 rating

---

## EICR Field Identifiers

### 1. Client Details (`eicr.client.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.client.name` | Client Name | text | "Client name is John Smith" |
| `eicr.client.address.line1` | Address Line 1 | text | "Client address line 1 is 42 High Street" |
| `eicr.client.address.line2` | Address Line 2 | text | "Client address line 2 is Apartment 5" |
| `eicr.client.address.town` | Town | text | "Client town is Birmingham" |
| `eicr.client.address.county` | County | text | "Client county is West Midlands" |
| `eicr.client.address.postcode` | Postcode | text | "Client postcode is B1 1AA" |
| `eicr.client.phone` | Telephone | text | "Client phone is 0121 123 4567" |
| `eicr.client.mobile` | Mobile | text | "Client mobile is 07912 345678" |
| `eicr.client.email` | Email | text | "Client email is john@example.com" |

### 2. Installation Details (`eicr.installation.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.installation.occupier` | Occupier Name | text | "Occupier name is Jane Doe" |
| `eicr.installation.address.line1` | Address Line 1 | text | "Installation address is 10 Mill Road" |
| `eicr.installation.address.line2` | Address Line 2 | text | "Installation line 2 is Unit 3" |
| `eicr.installation.address.town` | Town | text | "Installation town is Walsall" |
| `eicr.installation.address.county` | County | text | "Installation county is West Midlands" |
| `eicr.installation.address.postcode` | Postcode | text | "Installation postcode is WS1 1AB" |
| `eicr.installation.phone` | Telephone | text | "Installation phone is 01922 123456" |
| `eicr.installation.alterations_evident` | Evidence of Alterations | select | "Alterations evident yes/no/not apparent" |
| `eicr.installation.alterations_age` | Alterations Age (Years) | number | "Alterations age is 5 years" |
| `eicr.installation.estimated_age` | Installation Age (Years) | number | "Installation age is 25 years" |
| `eicr.installation.premises_type` | Premises Type | select | "Premises type is residential/commercial/industrial" |
| `eicr.installation.premises_other` | Other Premises Type | text | "Premises other is workshop" |
| `eicr.installation.records_available` | Records Available | boolean | "Records available yes/no" |
| `eicr.installation.records_held_by` | Records Held By | text | "Records held by previous owner" |
| `eicr.installation.previous_inspection_date` | Previous Inspection Date | date | "Previous inspection date is 15th March 2020" |
| `eicr.installation.previous_inspection_unknown` | Previous Inspection Unknown | boolean | "Previous inspection unknown" |
| `eicr.installation.previous_certificate_no` | Previous Certificate No | text | "Previous certificate number is EICR-2020-001" |

### 3. Report Details (`eicr.report.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.report.reasons` | Reasons for Report | text | "Reasons for report is periodic inspection" |
| `eicr.report.inspection_date` | Date of Inspection | date | "Inspection date is 26th January 2026" |

### 4. Extent and Limitations (`eicr.extent.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.extent.covered` | Extent Covered | textarea | "Extent covered is full installation" |
| `eicr.extent.agreed_limitations` | Agreed Limitations | textarea | "Agreed limitations include loft space inaccessible" |
| `eicr.extent.agreed_with` | Agreed With | text | "Limitations agreed with property owner" |
| `eicr.extent.limitation.{n}.type` | Limitation Type | text | "Limitation 1 type is inaccessible" |
| `eicr.extent.limitation.{n}.description` | Limitation Description | text | "Limitation 1 description is loft hatch painted shut" |

### 5. Supply Characteristics (`eicr.supply.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.supply.earthing` | Earthing Arrangement | select | "Earthing is TN-C-S" |
| `eicr.supply.conductors` | Live Conductors | select | "Conductors is AC" |
| `eicr.supply.phase` | Phase Configuration | select | "Phase is single phase 2 wire" |
| `eicr.supply.voltage` | Nominal Voltage (V) | number | "Voltage is 230 volts" |
| `eicr.supply.frequency` | Frequency (Hz) | number | "Frequency is 50 hertz" |
| `eicr.supply.pfc` | PFC/PSCC (kA) | number | "PFC is 16 kA" |
| `eicr.supply.ze` | Ze (Ω) | number | "Ze is 0.21 ohms" |
| `eicr.supply.uo` | Uo (V) | number | "Uo is 230 volts" |
| `eicr.supply.supplies_count` | Number of Supplies | number | "Number of supplies is 1" |
| `eicr.supply.polarity_confirmed` | Polarity Confirmed | boolean | "Supply polarity confirmed" |

### 6. Supply Protective Device (`eicr.supply_device.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.supply_device.bs_en` | BS(EN) Standard | text | "Supply device standard is BS EN 60898" |
| `eicr.supply_device.type` | Device Type | text | "Supply device type is B" |
| `eicr.supply_device.rating` | Rated Current (A) | number | "Supply device rating is 100 amps" |
| `eicr.supply_device.short_circuit` | Short Circuit Capacity (kA) | number | "Supply device short circuit is 6 kA" |

### 7. Distribution Boards (`eicr.board.{n}.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.board.{n}.name` | Board Name | text | "Board 1 name is Main Consumer Unit" |
| `eicr.board.{n}.designation` | Designation | text | "Board 1 designation is DB-1" |
| `eicr.board.{n}.supplied_from` | Supplied From | text | "Board 1 supplied from origin" |
| `eicr.board.{n}.location` | Location | text | "Board 1 location is under stairs cupboard" |
| `eicr.board.{n}.no_of_ways` | Number of Ways | number | "Board 1 ways is 16" |
| `eicr.board.{n}.no_of_phases` | Number of Phases | number | "Board 1 phases is 1" |
| `eicr.board.{n}.polarity_confirmed` | Polarity Confirmed | boolean | "Board 1 polarity confirmed" |
| `eicr.board.{n}.phase_sequence_confirmed` | Phase Sequence Confirmed | boolean | "Board 1 phase sequence confirmed" |
| `eicr.board.{n}.spd_t1` | SPD Type T1 | boolean | "Board 1 SPD type T1 fitted" |
| `eicr.board.{n}.spd_t2` | SPD Type T2 | boolean | "Board 1 SPD type T2 fitted" |
| `eicr.board.{n}.spd_t3` | SPD Type T3 | boolean | "Board 1 SPD type T3 fitted" |
| `eicr.board.{n}.spd_status_confirmed` | SPD Status Confirmed | boolean | "Board 1 SPD status confirmed" |
| `eicr.board.{n}.bs_en` | BS(EN) Standard | text | "Board 1 standard is BS EN 61439" |
| `eicr.board.{n}.rating` | Rating (A) | number | "Board 1 rating is 100 amps" |
| `eicr.board.{n}.voltage_rating` | Voltage Rating (V) | number | "Board 1 voltage rating is 230 volts" |
| `eicr.board.{n}.zdb` | Zdb (Ω) | number | "Board 1 Zdb is 0.35 ohms" |
| `eicr.board.{n}.ipf` | Ipf (kA) | number | "Board 1 Ipf is 16 kA" |
| `eicr.board.{n}.rcd_time` | RCD Time (ms) | number | "Board 1 RCD time is 18 milliseconds" |

### 8. Circuits (`eicr.board.{n}.circuit.{m}.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.board.{n}.circuit.{m}.number` | Circuit Number | text | "Board 1 circuit 3 number is 3" |
| `eicr.board.{n}.circuit.{m}.designation` | Circuit Designation | text | "Board 1 circuit 3 is kitchen sockets" |
| `eicr.board.{n}.circuit.{m}.points` | Number of Points | number | "Board 1 circuit 3 points is 6" |
| `eicr.board.{n}.circuit.{m}.wiring_type` | Wiring Type | text | "Board 1 circuit 3 wiring is 2.5 T&E" |
| `eicr.board.{n}.circuit.{m}.ref_method` | Reference Method | text | "Board 1 circuit 3 ref method is C" |
| `eicr.board.{n}.circuit.{m}.live_csa` | Live CSA (mm²) | number | "Board 1 circuit 3 live is 2.5 mm squared" |
| `eicr.board.{n}.circuit.{m}.cpc_csa` | CPC CSA (mm²) | number | "Board 1 circuit 3 CPC is 1.5 mm squared" |
| `eicr.board.{n}.circuit.{m}.length` | Length (m) | number | "Board 1 circuit 3 length is 25 metres" |
| `eicr.board.{n}.circuit.{m}.dis_time` | Disconnection Time (s) | number | "Board 1 circuit 3 disconnection time is 0.4 seconds" |
| `eicr.board.{n}.circuit.{m}.bs_en` | BS(EN) Standard | text | "Board 1 circuit 3 standard is BS EN 60898" |
| `eicr.board.{n}.circuit.{m}.rating` | Rating (A) | number | "Board 1 circuit 3 rating is 32 amps" |
| `eicr.board.{n}.circuit.{m}.fault_current` | Fault Current (kA) | number | "Board 1 circuit 3 fault current is 6 kA" |
| `eicr.board.{n}.circuit.{m}.voltage` | Voltage (V) | number | "Board 1 circuit 3 voltage is 230 volts" |
| `eicr.board.{n}.circuit.{m}.max_zs` | Max Zs (Ω) | number | "Board 1 circuit 3 max Zs is 1.37 ohms" |
| `eicr.board.{n}.circuit.{m}.rcd_type` | RCD Type | text | "Board 1 circuit 3 RCD type is A" |
| `eicr.board.{n}.circuit.{m}.rcd_rating` | RCD Rating IΔn (mA) | number | "Board 1 circuit 3 RCD rating is 30 milliamps" |
| `eicr.board.{n}.circuit.{m}.r1_plus_r2` | R1+R2 (Ω) | number | "Board 1 circuit 3 R1 plus R2 is 0.85 ohms" |
| `eicr.board.{n}.circuit.{m}.r2` | R2 (Ω) | number | "Board 1 circuit 3 R2 is 0.42 ohms" |
| `eicr.board.{n}.circuit.{m}.zs` | Zs (Ω) | number | "Board 1 circuit 3 Zs is 0.95 ohms" |
| `eicr.board.{n}.circuit.{m}.ir_live_live` | IR Live-Live (MΩ) | number | "Board 1 circuit 3 insulation live to live is 200 megaohms" |
| `eicr.board.{n}.circuit.{m}.ir_live_earth` | IR Live-Earth (MΩ) | number | "Board 1 circuit 3 insulation live to earth is 200 megaohms" |
| `eicr.board.{n}.circuit.{m}.polarity` | Polarity | select | "Board 1 circuit 3 polarity is OK" |
| `eicr.board.{n}.circuit.{m}.rcd_x1` | RCD Time x1 (ms) | number | "Board 1 circuit 3 RCD x1 is 18 milliseconds" |
| `eicr.board.{n}.circuit.{m}.rcd_x5` | RCD Time x5 (ms) | number | "Board 1 circuit 3 RCD x5 is 15 milliseconds" |
| `eicr.board.{n}.circuit.{m}.rcd_test_button` | RCD Test Button | select | "Board 1 circuit 3 RCD test button is OK" |
| `eicr.board.{n}.circuit.{m}.afdd_test_button` | AFDD Test Button | select | "Board 1 circuit 3 AFDD test button is OK" |
| `eicr.board.{n}.circuit.{m}.ring_r1` | Ring r1 (Ω) | number | "Board 1 circuit 3 ring r1 is 0.32 ohms" |
| `eicr.board.{n}.circuit.{m}.ring_rn` | Ring rn (Ω) | number | "Board 1 circuit 3 ring rn is 0.32 ohms" |
| `eicr.board.{n}.circuit.{m}.ring_r2` | Ring r2 (Ω) | number | "Board 1 circuit 3 ring r2 is 0.21 ohms" |

### 9. Observations (`eicr.observation.{n}.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.observation.{n}.section` | Inspection Section | select | "Observation 1 section is consumer units" |
| `eicr.observation.{n}.section_item` | Section Item | select | "Observation 1 item is MCB not labelled" |
| `eicr.observation.{n}.details` | Observation Details | textarea | "Observation 1 details is circuit breaker labels missing" |
| `eicr.observation.{n}.location` | Location | text | "Observation 1 location is main consumer unit" |
| `eicr.observation.{n}.db_circuit_ref` | DB/Circuit Reference | text | "Observation 1 reference is DB1 circuit 5" |
| `eicr.observation.{n}.schedule_item` | Schedule Item Reference | text | "Observation 1 schedule item is 4.1" |
| `eicr.observation.{n}.code` | Observation Code | select | "Observation 1 code is C3" |
| `eicr.observation.{n}.remedial_action` | Remedial Action Required | boolean | "Observation 1 remedial action yes" |
| `eicr.observation.{n}.image` | Attached Image | image | "Observation 1 add image" |

### 10. Inspection Schedule (`eicr.schedule.*`)

The inspection schedule contains 26 sections with 782 items. Each item follows this pattern:

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.schedule.{section}.{item}.result` | Inspection Result | select | "Schedule section 1 item 3 is satisfactory" |
| `eicr.schedule.{section}.{item}.comments` | Comments | text | "Schedule section 1 item 3 comment is cable clips adequate" |

**Sections (26 total):**
1. `intake_equipment` - Intake Equipment (52 items)
2. `other_sources` - Other Sources of Supply (6 items)
3. `earthing_bonding` - Earthing/Bonding (50 items)
4. `consumer_units` - Consumer Units/Distribution Boards (181 items)
5. `final_circuits` - Final Circuits (181 items)
6. `accessories_wiring` - Accessories and Wiring (53 items)
7. `general` - General Observations (22 items)
8. `bath_shower` - Locations with Bath/Shower (25 items)
9. `medical` - Medical Locations (6 items)
10. `swimming_pools` - Swimming Pools (15 items)
11. `saunas` - Rooms with Saunas (16 items)
12. `construction_sites` - Construction/Demolition Sites (8 items)
13. `agricultural` - Agricultural/Horticultural (14 items)
14. `camping_caravan` - Camping/Caravan Parks (10 items)
15. `marinas` - Marinas (21 items)
16. `exhibitions` - Exhibition Stands (14 items)
17. `solar_pv` - Solar PV Systems (25 items)
18. `outdoor_lighting` - Outdoor Lighting (4 items)
19. `mobile_units` - Mobile/Transportable Units (9 items)
20. `caravans` - Caravans/Motor Caravans (16 items)
21. `ev_charging` - Vehicle Charging (10 items)
22. `gangways` - Operating/Maintenance Gangways (3 items)
23. `inland_vessels` - Onshore Units for Inland Vessels (17 items)
24. `amusement` - Amusement Parks/Fairgrounds (12 items)
25. `floor_ceiling_heating` - Floor/Ceiling Heating (12 items)
26. `na` - Not Applicable (-)

### 11. Declaration (`eicr.declaration.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.declaration.overall_assessment` | Overall Assessment | select | "Overall assessment is satisfactory/unsatisfactory" |
| `eicr.declaration.inspector.name` | Inspector Name | text | "Inspector name is John Smith" |
| `eicr.declaration.inspector.position` | Inspector Position | text | "Inspector position is qualified supervisor" |
| `eicr.declaration.inspector.signature` | Inspector Signature | signature | "Inspector add signature" |
| `eicr.declaration.inspector.date` | Inspector Date | date | "Inspector date is 26th January 2026" |
| `eicr.declaration.authoriser.name` | Authoriser Name | text | "Authoriser name is Jane Doe" |
| `eicr.declaration.authoriser.position` | Authoriser Position | text | "Authoriser position is Director" |
| `eicr.declaration.authoriser.signature` | Authoriser Signature | signature | "Authoriser add signature" |
| `eicr.declaration.authoriser.date` | Authoriser Date | date | "Authoriser date is 26th January 2026" |

### 12. Next Inspection (`eicr.next_inspection.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.next_inspection.date` | Next Inspection Date | date | "Next inspection date is 26th January 2031" |
| `eicr.next_inspection.period` | Next Inspection Period | text | "Next inspection in 5 years" |

### 13. Test Instruments (`eicr.instruments.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eicr.instruments.multifunction` | Multifunction Serial | text | "Multifunction serial is 37251" |
| `eicr.instruments.continuity` | Continuity Tester Serial | text | "Continuity serial is 12345" |
| `eicr.instruments.insulation` | Insulation Tester Serial | text | "Insulation serial is 67890" |
| `eicr.instruments.earth_loop` | Earth Loop Tester Serial | text | "Earth loop serial is 11111" |
| `eicr.instruments.rcd` | RCD Tester Serial | text | "RCD tester serial is 22222" |

---

## EICS Field Identifiers (Electrical Installation Certificate - Single)

Follows same pattern as EICR with prefix `eics.` instead of `eicr.`

Additional EICS-specific fields:

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `eics.design.designer_name` | Designer Name | text | "Designer name is John Smith" |
| `eics.design.designer_signature` | Designer Signature | signature | "Designer add signature" |
| `eics.design.designer_date` | Designer Date | date | "Designer date is 26th January 2026" |
| `eics.construction.constructor_name` | Constructor Name | text | "Constructor name is ABC Electrical" |
| `eics.construction.constructor_signature` | Constructor Signature | signature | "Constructor add signature" |
| `eics.construction.constructor_date` | Constructor Date | date | "Constructor date is 26th January 2026" |

---

## Minor Works (MW) Field Identifiers

### 1. Client Details (`mw.client.*`)

Same as EICR client fields with `mw.` prefix.

### 2. Installation Details (`mw.installation.*`)

Same as EICR installation fields with `mw.` prefix.

### 3. Minor Works Description (`mw.description.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `mw.description.works` | Description of Works | textarea | "Description is new socket installation" |
| `mw.description.system_type` | System Type | select | "System type is TN-C-S" |
| `mw.description.ze_zdb` | Ze/Zdb (Ω) | number | "Ze is 0.21 ohms" |
| `mw.description.pfc` | PFC at DB (kA) | number | "PFC is 16 kA" |
| `mw.description.protection_method` | Protection Method | select | "Protection method is ADS" |

### 4. Comments (`mw.comments.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `mw.comments.existing_installation` | Comments on Existing Installation | textarea | "Comment is installation in good condition" |
| `mw.comments.risk_assessment_included` | Risk Assessment Included | boolean | "Risk assessment included yes" |

### 5. Circuit Details (`mw.circuit.*`)

| Field ID | Display Name | Type | Voice Example |
|----------|--------------|------|---------------|
| `mw.circuit.spd_confirmed` | SPD Functionality Confirmed | select | "SPD functionality confirmed yes" |
| `mw.circuit.wiring_type` | Wiring Type | text | "Wiring type is 2.5 T&E" |
| `mw.circuit.ref_method` | Reference Method | text | "Reference method is C" |
| `mw.circuit.inspections_carried_out` | Necessary Inspections Carried Out | select | "Inspections carried out yes" |
| `mw.circuit.earthing_conductor` | Earthing Conductor | select | "Earthing conductor yes" |
| `mw.circuit.bonding.water` | Bonding - Water | boolean | "Bonding water yes" |
| `mw.circuit.bonding.gas` | Bonding - Gas | boolean | "Bonding gas yes" |
| `mw.circuit.bonding.oil` | Bonding - Oil | boolean | "Bonding oil no" |
| `mw.circuit.bonding.steel` | Bonding - Structural Steel | boolean | "Bonding steel no" |
| `mw.circuit.bonding.other` | Bonding - Other | text | "Bonding other is central heating" |
| `mw.circuit.db_designation` | DB Designation | text | "DB designation is Main CU" |

### 6. Circuit Test Results (`mw.circuit.{n}.*`)

Same as EICR circuit fields with `mw.circuit.{n}.` prefix.

### 7. Declaration (`mw.declaration.*`)

Same as EICR declaration fields with `mw.` prefix.

---

## Minor Works Multi (MW3) Field Identifiers

Same as MW with ability to have multiple circuits indexed as `mw3.circuit.{n}.*`

---

## Observation Codes Reference

| Code | Full Name | Priority | Color |
|------|-----------|----------|-------|
| `C1` | Danger present, risk of injury | Critical | Red |
| `C2` | Potentially dangerous | Urgent | Orange |
| `C3` | Improvement recommended | Normal | Yellow |
| `FI` | Further investigation required | Priority | Blue |
| `NOTE` | Note/Informational | Low | Gray |
| `N/A` | Not Applicable | - | Gray |
| `N/V` | Not Verified | - | Gray |
| `X` | See Notes | - | Black |
| `LIM` | Limitation | - | Gray |

---

## Image Upload Schema

Images can be attached to:
- Observations: `eicr.observation.{n}.image`
- General certificate: `eicr.images.{n}`
- Boards: `eicr.board.{n}.image`
- Circuits: `eicr.board.{n}.circuit.{m}.image`

### Image Object Structure

```typescript
interface CertificateImage {
  id: string;
  field_id: string;           // e.g., "eicr.observation.1.image"
  filename: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url: string;
  caption: string;
  uploaded_at: timestamp;
  uploaded_by: user_id;
  location_description: string;
  tags: string[];             // e.g., ["fault", "distribution_board", "before"]
}
```

---

## Voice Command Examples

### Navigation Commands
- "Go to client details"
- "Go to board 1 circuits"
- "Go to observation 3"
- "Next section"
- "Previous section"
- "Go to declaration"

### Data Entry Commands
- "Client name is John Smith"
- "Board 1 circuit 5 Zs is 0.45 ohms"
- "Add observation C2 at kitchen consumer unit"
- "Observation 1 code is C3"
- "Overall assessment is satisfactory"

### Test Result Commands
- "Board 1 circuit 3 R1 plus R2 is 0.85"
- "Board 1 circuit 3 insulation live to earth is 200 megaohms"
- "Board 1 circuit 3 RCD x1 is 18 milliseconds"
- "Board 1 circuit 3 polarity OK"

### Query Commands
- "What is board 1 circuit 3 Zs?"
- "Read back observation 2"
- "What is the overall assessment?"
- "How many circuits on board 1?"

### Image Commands
- "Take photo for observation 1"
- "Add image to board 1"
- "Capture distribution board"

---

## Database Schema Updates Required

```sql
-- Add voice_field_id column to track unique identifiers
ALTER TABLE certificates ADD COLUMN voice_field_mapping JSONB DEFAULT '{}';

-- Create observation images table
CREATE TABLE observation_images (
  id SERIAL PRIMARY KEY,
  observation_id INTEGER REFERENCES certificate_observations(id) ON DELETE CASCADE,
  field_id VARCHAR(100) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption TEXT,
  location_description TEXT,
  tags TEXT[],
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create general certificate images table
CREATE TABLE certificate_images (
  id SERIAL PRIMARY KEY,
  certificate_id INTEGER REFERENCES certificates(id) ON DELETE CASCADE,
  field_id VARCHAR(100) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption TEXT,
  location_description TEXT,
  tags TEXT[],
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspection schedule items (782 items)
CREATE TABLE inspection_schedule_items (
  id SERIAL PRIMARY KEY,
  section_code VARCHAR(50) NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  item_number INTEGER NOT NULL,
  item_text TEXT NOT NULL,
  regulation_ref VARCHAR(100),
  field_id VARCHAR(100) UNIQUE NOT NULL,
  UNIQUE(section_code, item_number)
);

-- Certificate schedule results
CREATE TABLE certificate_schedule_results (
  id SERIAL PRIMARY KEY,
  certificate_id INTEGER REFERENCES certificates(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES inspection_schedule_items(id),
  field_id VARCHAR(100) NOT NULL,
  result VARCHAR(20), -- satisfactory, unsatisfactory, not_applicable, limitation, not_inspected
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(certificate_id, item_id)
);
```

---

## API Endpoints for Voice/AI Agent

```
POST /api/portal/certificates/:id/field
  Body: { field_id: "eicr.board.1.circuit.3.zs", value: "0.45" }

GET /api/portal/certificates/:id/field/:field_id
  Returns: { field_id: "eicr.board.1.circuit.3.zs", value: "0.45", type: "number", label: "Zs (Ω)" }

POST /api/portal/certificates/:id/voice-command
  Body: { command: "Board 1 circuit 3 Zs is 0.45 ohms" }
  Returns: { field_id: "eicr.board.1.circuit.3.zs", value: "0.45", confirmed: true }

POST /api/portal/certificates/:id/field/:field_id/image
  Multipart form with image file
  Returns: { image_id: 123, url: "...", thumbnail_url: "..." }
```

---

## Implementation Priority

1. **Phase 1**: Core field identifiers for EICR, EICS, MW
2. **Phase 2**: Image upload capability
3. **Phase 3**: Voice command parsing
4. **Phase 4**: AI agent integration
5. **Phase 5**: Voice feedback/readback
