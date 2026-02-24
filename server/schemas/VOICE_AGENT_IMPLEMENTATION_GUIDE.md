# Voice Agent Implementation Guide
## 247Electrician Certificate Voice Input System

**Version:** 1.0.0
**Standard:** BS 7671:2018+A3:2024
**Date:** 2026-01-26

---

## Overview

This guide provides complete specifications for implementing an AI voice agent that allows electricians to input certificate data verbally while conducting electrical inspections. The system uses unique field identifiers to map spoken commands to database fields.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VOICE INPUT SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   Mobile     │    │   Speech     │    │    NLU       │     │
│   │   Device     │───▶│  Recognition │───▶│   Engine     │     │
│   │   (Mic)      │    │   (STT)      │    │  (Intent)    │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                  │               │
│                                                  ▼               │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   Voice      │    │   Field      │    │   Field ID   │     │
│   │  Feedback    │◀───│   Update     │◀───│   Mapper     │     │
│   │   (TTS)      │    │    API       │    │              │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │    Database      │                        │
│                    │   (PostgreSQL)   │                        │
│                    └──────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Field Identifier System

### Naming Convention

All fields use a hierarchical dot notation:

```
{certificate_type}.{section}.{subsection}.{field_name}
{certificate_type}.{section}.{index}.{subsection}.{field_name}
```

### Examples:
- `eicr.client.name` - EICR client name
- `eicr.board.1.circuit.3.zs` - EICR Board 1, Circuit 3, Zs measurement
- `eicr.observation.2.code` - EICR Observation 2 classification code
- `mw.circuit.1.rating` - Minor Works Circuit 1 rating

---

## Voice Command Patterns

### 1. Client Information Commands

| Voice Command | Field ID | Example |
|---------------|----------|---------|
| "Client name is {value}" | `eicr.client.name` | "Client name is John Smith" |
| "Client phone is {value}" | `eicr.client.phone` | "Client phone is 0121 456 7890" |
| "Client email is {value}" | `eicr.client.email` | "Client email is john@example.com" |
| "Client address is {value}" | `eicr.client.address.line1` | "Client address is 42 High Street" |
| "Client town is {value}" | `eicr.client.address.town` | "Client town is Birmingham" |
| "Client postcode is {value}" | `eicr.client.address.postcode` | "Client postcode is B1 1AA" |

### 2. Installation Information Commands

| Voice Command | Field ID | Example |
|---------------|----------|---------|
| "Occupier name is {value}" | `eicr.installation.occupier` | "Occupier name is Jane Doe" |
| "Installation address is {value}" | `eicr.installation.address.line1` | "Installation address is 10 Mill Road" |
| "Installation age is {value}" | `eicr.installation.estimated_age` | "Installation age is 25 years" |
| "Alterations evident {yes/no}" | `eicr.installation.alterations_evident` | "Alterations evident yes" |
| "Premises type is {type}" | `eicr.installation.premises_type` | "Premises type is residential" |

### 3. Supply Characteristics Commands

| Voice Command | Field ID | Example |
|---------------|----------|---------|
| "Ze is {value} ohms" | `eicr.supply.ze` | "Ze is 0.21 ohms" |
| "Voltage is {value} volts" | `eicr.supply.voltage` | "Voltage is 230 volts" |
| "Frequency is {value} hertz" | `eicr.supply.frequency` | "Frequency is 50 hertz" |
| "PFC is {value} kA" | `eicr.supply.pfc` | "PFC is 16 kA" |
| "Earthing is {type}" | `eicr.supply.earthing` | "Earthing is TN-C-S" |

### 4. Distribution Board Commands

| Voice Command | Field ID | Example |
|---------------|----------|---------|
| "Board {n} name is {value}" | `eicr.board.{n}.name` | "Board 1 name is Main Consumer Unit" |
| "Board {n} location is {value}" | `eicr.board.{n}.location` | "Board 1 location is under stairs cupboard" |
| "Board {n} ways is {value}" | `eicr.board.{n}.no_of_ways` | "Board 1 ways is 16" |
| "Board {n} Zdb is {value}" | `eicr.board.{n}.zdb` | "Board 1 Zdb is 0.35 ohms" |
| "Board {n} Ipf is {value}" | `eicr.board.{n}.ipf` | "Board 1 Ipf is 16 kA" |
| "Board {n} SPD type T2 fitted" | `eicr.board.{n}.spd_type_t2` | "Board 1 SPD type T2 fitted" |

### 5. Circuit Test Result Commands

| Voice Command | Field ID | Example |
|---------------|----------|---------|
| "Board {n} circuit {m} designation is {value}" | `eicr.board.{n}.circuit.{m}.designation` | "Board 1 circuit 3 designation is kitchen sockets" |
| "Board {n} circuit {m} rating is {value}" | `eicr.board.{n}.circuit.{m}.rating` | "Board 1 circuit 3 rating is 32 amps" |
| "Board {n} circuit {m} Zs is {value}" | `eicr.board.{n}.circuit.{m}.zs` | "Board 1 circuit 3 Zs is 0.95 ohms" |
| "Board {n} circuit {m} R1 plus R2 is {value}" | `eicr.board.{n}.circuit.{m}.r1_plus_r2` | "Board 1 circuit 3 R1 plus R2 is 0.85 ohms" |
| "Board {n} circuit {m} insulation is {value}" | `eicr.board.{n}.circuit.{m}.ir_live_earth` | "Board 1 circuit 3 insulation is 200 megaohms" |
| "Board {n} circuit {m} polarity {OK/fail}" | `eicr.board.{n}.circuit.{m}.polarity` | "Board 1 circuit 3 polarity OK" |
| "Board {n} circuit {m} RCD x1 is {value}" | `eicr.board.{n}.circuit.{m}.rcd_x1` | "Board 1 circuit 3 RCD x1 is 18 milliseconds" |

### 6. Observation Commands

| Voice Command | Field ID | Example |
|---------------|----------|---------|
| "Add observation C{code}" | Creates new observation | "Add observation C2" |
| "Observation {n} code is {value}" | `eicr.observation.{n}.code` | "Observation 1 code is C3" |
| "Observation {n} location is {value}" | `eicr.observation.{n}.location` | "Observation 1 location is main consumer unit" |
| "Observation {n} details is {value}" | `eicr.observation.{n}.details` | "Observation 1 details is MCB labels missing" |

### 7. Declaration Commands

| Voice Command | Field ID | Example |
|---------------|----------|---------|
| "Overall assessment is {value}" | `eicr.declaration.overall_assessment` | "Overall assessment is satisfactory" |
| "Next inspection date is {date}" | `eicr.next_inspection.date` | "Next inspection date is 26th January 2031" |
| "Next inspection in {period}" | `eicr.next_inspection.period` | "Next inspection in 5 years" |

### 8. Image Commands

| Voice Command | Action | Example |
|---------------|--------|---------|
| "Take photo for observation {n}" | Capture and attach to observation | "Take photo for observation 1" |
| "Add image to board {n}" | Capture and attach to board | "Add image to board 1" |
| "Capture distribution board" | General image capture | "Capture distribution board" |

### 9. Navigation Commands

| Voice Command | Action | Example |
|---------------|--------|---------|
| "Go to client details" | Navigate to section | "Go to client details" |
| "Go to board {n} circuits" | Navigate to board circuits | "Go to board 1 circuits" |
| "Go to observation {n}" | Navigate to observation | "Go to observation 3" |
| "Next section" | Move forward | "Next section" |
| "Previous section" | Move backward | "Previous section" |

### 10. Query Commands (Readback)

| Voice Command | Action | Example |
|---------------|--------|---------|
| "What is {field}?" | Read back value | "What is board 1 circuit 3 Zs?" |
| "Read back observation {n}" | Read observation details | "Read back observation 2" |
| "What is the overall assessment?" | Read assessment | "What is the overall assessment?" |
| "How many circuits on board {n}?" | Count circuits | "How many circuits on board 1?" |

---

## API Integration

### Endpoint: Set Field Value

```
POST /api/portal/certificates/:id/field
Content-Type: application/json
Authorization: Bearer {token}

{
  "field_id": "eicr.board.1.circuit.3.zs",
  "value": "0.95"
}

Response:
{
  "success": true,
  "field_id": "eicr.board.1.circuit.3.zs",
  "value": "0.95"
}
```

### Endpoint: Get Field Value

```
GET /api/portal/certificates/:id/field/eicr.board.1.circuit.3.zs
Authorization: Bearer {token}

Response:
{
  "field_id": "eicr.board.1.circuit.3.zs",
  "value": "0.95",
  "type": "number",
  "label": "Zs (Ω)"
}
```

### Endpoint: Voice Command Processing

```
POST /api/portal/certificates/:id/voice-command
Content-Type: application/json
Authorization: Bearer {token}

{
  "command": "Board 1 circuit 3 Zs is 0.95 ohms"
}

Response:
{
  "success": true,
  "field_id": "eicr.board.1.circuit.3.zs",
  "value": "0.95",
  "command": "Board 1 circuit 3 Zs is 0.95 ohms",
  "confirmed": true
}
```

### Endpoint: Upload Observation Image

```
POST /api/portal/observations/:observationId/images
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- image: [file]
- caption: "Damaged cable insulation"
- location_description: "Kitchen consumer unit"
- tags: ["fault", "cable", "damage"]

Response:
{
  "image": {
    "id": "uuid",
    "field_id": "eicr.observation.1.image.1",
    "url": "/uploads/observations/obs-123456.jpg",
    "caption": "Damaged cable insulation"
  }
}
```

---

## Speech Recognition Requirements

### Technical Vocabulary

The speech recognition system must be trained to recognize:

1. **Electrical Units**
   - Ohms (Ω), milliohms (mΩ)
   - Amps (A), milliamps (mA)
   - Volts (V)
   - Kilowatts (kW), Kilowatt-hours (kWh)
   - Kiloamps (kA)
   - Megaohms (MΩ)
   - Hertz (Hz)
   - Milliseconds (ms)

2. **Electrical Terms**
   - Ze, Zs, Zdb
   - R1, R2, R1+R2
   - PFC, PSCC, Ipf
   - RCD, RCBO, AFDD
   - MCB (types B, C, D)
   - SPD (types T1, T2, T3)
   - TN-S, TN-C-S, TN-C, TT, IT
   - Consumer unit, distribution board
   - Live, neutral, earth, CPC

3. **Observation Codes**
   - C1, C2, C3
   - FI (Further Investigation)
   - N/A, N/V, LIM

4. **BS 7671 Terminology**
   - Regulation references (e.g., "Regulation 411.3.1.2")
   - Section numbers (e.g., "Section 701", "Section 722")

### Accent Support

The system should support common UK accents including:
- Standard British English
- West Midlands (Birmingham, Black Country)
- Northern English (Manchester, Yorkshire)
- Scottish
- Welsh
- Irish

---

## Voice Feedback System (TTS)

### Confirmation Responses

```
Input: "Board 1 circuit 3 Zs is 0.95 ohms"
Response: "Board 1, circuit 3, Zs set to 0.95 ohms"

Input: "Add observation C2"
Response: "C2 observation added. What is the location?"

Input: "Overall assessment is satisfactory"
Response: "Overall assessment set to satisfactory"
```

### Error Responses

```
Input: "Board 5 circuit 3 Zs is 0.95"
Response: "Board 5 not found. Current certificate has 2 boards."

Input: "Zs is 500 ohms" (value out of range)
Response: "Value 500 ohms seems high for Zs. Typical range is 0.1 to 10 ohms. Please confirm or re-enter."

Input: (unintelligible)
Response: "I didn't catch that. Please repeat."
```

### Readback Responses

```
Input: "What is board 1 circuit 3 Zs?"
Response: "Board 1, circuit 3, Zs is 0.95 ohms"

Input: "Read back observation 1"
Response: "Observation 1: Code C2, location main consumer unit, MCB labels missing and circuit identification unclear"
```

---

## Validation Rules

### Value Range Validation

| Field | Expected Range | Warning Trigger |
|-------|----------------|-----------------|
| Ze (Ω) | 0.01 - 0.8 | > 0.8 or < 0.01 |
| Zs (Ω) | 0.1 - 10 | > Max Zs for circuit |
| R1+R2 (Ω) | 0.01 - 5 | > 5 |
| IR (MΩ) | 0.5 - 999 | < 1 |
| RCD time (ms) | 0 - 300 | > 40 (for 30mA) |
| Voltage (V) | 200 - 260 | Outside range |
| Frequency (Hz) | 49 - 51 | Outside 50 ± 1 |

### Context-Aware Validation

The agent should validate based on context:

1. **Circuit Type Validation**
   - Socket circuits typically 32A or 20A
   - Lighting circuits typically 6A or 10A
   - Shower circuits typically 40A or 50A
   - Cooker circuits typically 32A or 45A

2. **Cable Size Validation**
   - Match cable CSA to circuit rating
   - Flag mismatches (e.g., 1.5mm² on 32A circuit)

3. **Max Zs Validation**
   - Calculate based on protective device
   - Warn if measured Zs > Max Zs

---

## Mobile App Integration

### Offline Support

The app should support offline voice input:

1. **Local Processing**
   - Cache common vocabulary locally
   - Process simple commands offline
   - Queue API updates when offline

2. **Sync Strategy**
   ```
   1. User speaks command
   2. Local processing extracts field_id and value
   3. Store in local queue with timestamp
   4. When online, sync queue to server
   5. Handle conflicts (server timestamp wins)
   ```

### Push-to-Talk vs Wake Word

**Option 1: Push-to-Talk (Recommended for noisy environments)**
```
User holds button → Speaks command → Releases button
↓
Audio processed → Value extracted → Confirmation spoken
```

**Option 2: Wake Word (Hands-free)**
```
User says "Hey Sparky" → LED activates → User speaks command
↓
Command processed → Value extracted → Confirmation spoken
```

---

## Implementation Phases

### Phase 1: Basic Voice Input (Week 1-2)

1. Implement speech-to-text using Web Speech API
2. Create command parser for simple patterns
3. Integrate with field update API
4. Add basic TTS feedback

### Phase 2: Advanced Parsing (Week 3-4)

1. Implement NLU for natural language variations
2. Add context awareness (current section, last field)
3. Implement value validation with warnings
4. Add electrical vocabulary training

### Phase 3: Mobile Optimization (Week 5-6)

1. Optimize for mobile browsers
2. Implement offline queue
3. Add push-to-talk UI
4. Implement background sync

### Phase 4: AI Agent Integration (Week 7-8)

1. Integrate Claude/GPT for complex commands
2. Add conversational flow for multi-field entry
3. Implement intelligent suggestions
4. Add error recovery dialogs

---

## Security Considerations

1. **Voice Authentication**
   - Optional voice biometrics
   - Session-based authentication
   - Re-authenticate for critical changes

2. **Data Privacy**
   - Audio not stored permanently
   - Transcripts logged for audit only
   - GDPR compliant data handling

3. **Input Sanitization**
   - Validate all parsed values
   - Prevent SQL injection via voice
   - Sanitize field_id patterns

---

## Testing Requirements

### Unit Tests

```typescript
describe('VoiceCommandParser', () => {
  it('should parse circuit Zs command', () => {
    const result = parseCommand('Board 1 circuit 3 Zs is 0.95 ohms');
    expect(result.field_id).toBe('eicr.board.1.circuit.3.zs');
    expect(result.value).toBe('0.95');
  });

  it('should handle variations in phrasing', () => {
    const commands = [
      'Board 1 circuit 3 Zs is 0.95',
      'Board one circuit three Zs equals 0.95',
      'Set board 1 circuit 3 Zs to 0.95 ohms',
      'Zs for board 1 circuit 3 is point nine five'
    ];
    commands.forEach(cmd => {
      const result = parseCommand(cmd);
      expect(result.field_id).toBe('eicr.board.1.circuit.3.zs');
    });
  });
});
```

### Integration Tests

```typescript
describe('Voice Input API', () => {
  it('should update field via voice command', async () => {
    const response = await api.post('/certificates/123/voice-command', {
      command: 'Board 1 circuit 3 Zs is 0.95 ohms'
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify field was updated
    const field = await api.get('/certificates/123/field/eicr.board.1.circuit.3.zs');
    expect(field.body.value).toBe('0.95');
  });
});
```

### End-to-End Tests

```typescript
describe('Voice Input E2E', () => {
  it('should complete full circuit entry via voice', async () => {
    const commands = [
      'Board 1 circuit 5 designation is bathroom towel rail',
      'Board 1 circuit 5 rating is 6 amps',
      'Board 1 circuit 5 Zs is 1.2 ohms',
      'Board 1 circuit 5 R1 plus R2 is 0.6 ohms',
      'Board 1 circuit 5 insulation live to earth is 200 megaohms',
      'Board 1 circuit 5 polarity OK'
    ];

    for (const cmd of commands) {
      await voiceInput.speak(cmd);
      await waitForConfirmation();
    }

    // Verify all fields populated
    const circuit = await getCircuit(certId, boardId, 5);
    expect(circuit.designation).toBe('bathroom towel rail');
    expect(circuit.rating_amps).toBe(6);
    expect(circuit.zs).toBe(1.2);
  });
});
```

---

## Error Handling

### Command Not Understood

```
Agent: "I didn't understand that command.
        You can say things like:
        - 'Board 1 circuit 3 Zs is 0.95 ohms'
        - 'Client name is John Smith'
        - 'Add observation C2'
        Would you like me to list available commands?"
```

### Ambiguous Input

```
User: "Zs is 0.95"
Agent: "Which circuit? Please say 'Board [number] circuit [number] Zs is 0.95'"
```

### Value Out of Range

```
User: "Board 1 circuit 3 Zs is 50 ohms"
Agent: "50 ohms seems high for Zs. The maximum Zs for a 32A Type B device
        is 1.37 ohms. Did you mean 0.5 ohms, or should I enter 50?"
```

### Network Error

```
Agent: "I've saved your input locally. It will sync when connection is restored.
        Board 1, circuit 3, Zs, 0.95 ohms - saved offline."
```

---

## Database Schema for Voice Input

### Voice Input Log Table

```sql
CREATE TABLE voice_input_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  field_id VARCHAR(150) NOT NULL,
  command_text TEXT NOT NULL,          -- Original spoken command
  parsed_value TEXT,                   -- Extracted value
  confidence_score DECIMAL(5,2),       -- STT confidence
  was_corrected BOOLEAN DEFAULT false, -- User corrected?
  corrected_value TEXT,                -- Corrected value if any
  processing_time_ms INTEGER,          -- Parse time
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for analytics
CREATE INDEX idx_voice_log_certificate ON voice_input_log(certificate_id);
CREATE INDEX idx_voice_log_user ON voice_input_log(user_id);
CREATE INDEX idx_voice_log_field ON voice_input_log(field_id);
```

---

## Analytics & Improvement

### Metrics to Track

1. **Recognition Accuracy**
   - Successful parses vs failures
   - Correction rate
   - Most common errors

2. **Usage Patterns**
   - Most used commands
   - Command sequences
   - Time per field entry

3. **Performance**
   - Parse latency
   - API response time
   - Offline queue depth

### Feedback Loop

```
1. Log all voice inputs and outcomes
2. Identify patterns in corrections
3. Update training data for STT
4. Improve parser patterns
5. Deploy updates
6. Measure improvement
```

---

## Appendix: Complete Field Reference

See `CERTIFICATE_VOICE_INPUT_SCHEMA.md` for the complete list of all field identifiers and their voice command patterns.

---

## Support

For questions or issues with voice input implementation:
- Technical documentation: `/server/schemas/`
- API documentation: `/api/portal/`
- Voice command patterns: See this document

---

*Document Version: 1.0.0*
*Last Updated: 2026-01-26*
*Author: Claude Code*
