/**
 * Certificate PDF Generation Service
 * Generates professional EICR, EIC, and Minor Works certificates
 * matching Electraform BS7671:2018+A3:2024 compliant format
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Color definitions
const COLORS = {
  primary: '#1e3a5f',       // Navy blue - 247Electrician brand
  emergency: '#dc2626',     // Emergency red
  text: '#1e293b',          // Slate 800
  textLight: '#64748b',     // Slate 500
  border: '#e2e8f0',        // Slate 200
  headerBg: '#f8fafc',      // Slate 50
  c1: '#dc2626',            // Red - Danger
  c2: '#ea580c',            // Orange - Potentially dangerous
  c3: '#16a34a',            // Green - Improvement
  fi: '#2563eb',            // Blue - Further investigation
};

// Observation code descriptions
const OBSERVATION_CODES = {
  C1: { color: COLORS.c1, label: 'Danger Present', desc: 'Risk of injury. Immediate remedial action required.' },
  C2: { color: COLORS.c2, label: 'Potentially Dangerous', desc: 'Urgent remedial action required.' },
  C3: { color: COLORS.c3, label: 'Improvement Recommended', desc: 'Improvement recommended.' },
  FI: { color: COLORS.fi, label: 'Further Investigation', desc: 'Further investigation required without delay.' },
  LIM: { color: '#6b7280', label: 'Limitation', desc: 'Not inspected - extent and limitations.' },
  NA: { color: '#9ca3af', label: 'Not Applicable', desc: 'Not applicable to this inspection.' },
  NV: { color: '#84cc16', label: 'Not Verified', desc: 'Not verified.' },
};

// Certificate type configurations
const CERTIFICATE_CONFIGS = {
  eicr: {
    title: 'ELECTRICAL INSTALLATION',
    subtitle: 'CONDITION REPORT',
    standard: 'BS 7671:2018+A3:2024',
    regulation: 'IET Wiring Regulations 18th Edition',
    formNumber: 'Model Form No. 1',
    pageHeaders: ['Installation Details', 'Observations', 'Supply Characteristics', 'Boards & Circuits', 'Inspector Declaration'],
  },
  eic: {
    title: 'ELECTRICAL INSTALLATION',
    subtitle: 'CERTIFICATE',
    standard: 'BS 7671:2018+A3:2024',
    regulation: 'IET Wiring Regulations 18th Edition',
    formNumber: 'Model Form No. 2',
    pageHeaders: ['Installation Details', 'Design', 'Construction', 'Inspection & Test', 'Declaration'],
  },
  mw: {
    title: 'MINOR ELECTRICAL',
    subtitle: 'INSTALLATION WORKS CERTIFICATE',
    standard: 'BS 7671:2018+A3:2024',
    regulation: 'IET Wiring Regulations 18th Edition',
    formNumber: 'Model Form No. 3',
    pageHeaders: ['Details', 'Work Carried Out', 'Test Results', 'Declaration'],
  },
};

/**
 * Generate a certificate PDF
 * @param {Object} certificate - Certificate data from database
 * @param {Array} boards - Distribution boards with circuits
 * @param {Array} observations - Certificate observations
 * @param {Object} companyInfo - Company/contractor information
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generateCertificatePdf(certificate, boards = [], observations = [], companyInfo = {}) {
  return new Promise((resolve, reject) => {
    try {
      const config = CERTIFICATE_CONFIGS[certificate.certificate_type];
      if (!config) {
        throw new Error(`Unknown certificate type: ${certificate.certificate_type}`);
      }

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        info: {
          Title: `${config.title} ${config.subtitle} - ${certificate.certificate_no}`,
          Author: '247Electrician - ANP Electrical Ltd',
          Subject: `${certificate.certificate_type.toUpperCase()} Certificate`,
          Creator: '247Portal Certificate System',
        },
      });

      // Collect PDF data
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate pages based on certificate type
      if (certificate.certificate_type === 'eicr') {
        generateEICRPdf(doc, certificate, boards, observations, companyInfo, config);
      } else if (certificate.certificate_type === 'eic') {
        generateEICPdf(doc, certificate, boards, observations, companyInfo, config);
      } else if (certificate.certificate_type === 'mw') {
        generateMWPdf(doc, certificate, boards, observations, companyInfo, config);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate EICR PDF
 */
function generateEICRPdf(doc, certificate, boards, observations, companyInfo, config) {
  // Page 1: Cover Page
  drawCoverPage(doc, certificate, config, companyInfo);

  // Page 2: Client and Installation Details
  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Section A - Details of the Person Ordering the Report / Installation');
  drawClientDetails(doc, certificate);
  drawInstallationDetails(doc, certificate);

  // Page 3: Supply Characteristics
  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Section B - Supply Characteristics and Earthing Arrangements');
  drawSupplyCharacteristics(doc, certificate);

  // Page 4: Observations
  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Section C - Observations and Recommendations');
  drawObservationCodes(doc);
  drawOverallAssessment(doc, certificate);
  drawObservationsList(doc, observations);

  // Page 5+: Boards and Circuits (one page per board)
  boards.forEach((board, index) => {
    doc.addPage();
    drawPageHeader(doc, certificate.certificate_no, `Section D - Schedule of Circuit Details - ${board.db_name || `Board ${index + 1}`}`);
    drawBoardDetails(doc, board);
    drawCircuitsTable(doc, board.circuits || []);
  });

  // Final Page: Declaration
  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Section E - Declaration and Signatures');
  drawDeclaration(doc, certificate, companyInfo);

  // Add page numbers
  addPageNumbers(doc);
}

/**
 * Generate EIC PDF
 */
function generateEICPdf(doc, certificate, boards, observations, companyInfo, config) {
  drawCoverPage(doc, certificate, config, companyInfo);

  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Part 1 - Details of the Contractor and Installation');
  drawClientDetails(doc, certificate);
  drawInstallationDetails(doc, certificate);

  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Part 2 - Supply Characteristics');
  drawSupplyCharacteristics(doc, certificate);

  boards.forEach((board, index) => {
    doc.addPage();
    drawPageHeader(doc, certificate.certificate_no, `Part 3 - Schedule of Circuit Details - ${board.db_name || `Board ${index + 1}`}`);
    drawBoardDetails(doc, board);
    drawCircuitsTable(doc, board.circuits || []);
  });

  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Part 4 - Declaration');
  drawDeclaration(doc, certificate, companyInfo);

  addPageNumbers(doc);
}

/**
 * Generate Minor Works PDF
 */
function generateMWPdf(doc, certificate, boards, observations, companyInfo, config) {
  drawCoverPage(doc, certificate, config, companyInfo);

  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Details of the Minor Works');
  drawClientDetails(doc, certificate);
  drawInstallationDetails(doc, certificate);

  // Work description
  let y = 400;
  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('Description of Minor Works:', 50, y);
  y += 20;
  doc.fontSize(10).fillColor(COLORS.text).font('Helvetica')
    .text(certificate.section_data?.work_description || 'No description provided', 50, y, { width: 500 });

  doc.addPage();
  drawPageHeader(doc, certificate.certificate_no, 'Test Results and Declaration');

  // Simple test results for minor works
  if (boards.length > 0 && boards[0].circuits?.length > 0) {
    drawCircuitsTable(doc, boards[0].circuits.slice(0, 5)); // Limit to 5 circuits for minor works
  }

  drawDeclaration(doc, certificate, companyInfo);

  addPageNumbers(doc);
}

/**
 * Draw cover page
 */
function drawCoverPage(doc, certificate, config, companyInfo) {
  const pageWidth = doc.page.width;
  const centerX = pageWidth / 2;

  // Header band
  doc.rect(0, 0, pageWidth, 80).fill(COLORS.primary);

  // Company logo area (left side)
  doc.fontSize(24).fillColor('white').font('Helvetica-Bold');
  doc.text('247', 50, 25);
  doc.fillColor('#dc2626').text('Electrician', 90, 25);

  // NAPIT logo placeholder (right side)
  doc.fontSize(10).fillColor('white').font('Helvetica')
    .text('NAPIT APPROVED', pageWidth - 150, 30, { width: 100, align: 'center' });
  doc.text('Contractor', pageWidth - 150, 45, { width: 100, align: 'center' });

  // Certificate title
  let y = 140;
  doc.fontSize(28).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text(config.title, 0, y, { width: pageWidth, align: 'center' });
  y += 40;
  doc.fontSize(24).fillColor(COLORS.primary)
    .text(config.subtitle, 0, y, { width: pageWidth, align: 'center' });

  // Standard reference
  y += 60;
  doc.fontSize(12).fillColor(COLORS.textLight).font('Helvetica')
    .text(config.standard, 0, y, { width: pageWidth, align: 'center' });
  y += 20;
  doc.text(config.regulation, 0, y, { width: pageWidth, align: 'center' });

  // Certificate number box
  y += 60;
  doc.rect(centerX - 150, y, 300, 50).lineWidth(2).stroke(COLORS.primary);
  doc.fontSize(12).fillColor(COLORS.textLight)
    .text('Certificate No:', centerX - 140, y + 10);
  doc.fontSize(16).fillColor(COLORS.text).font('Helvetica-Bold')
    .text(certificate.certificate_no, centerX - 140, y + 28);

  // Property address
  y += 80;
  doc.fontSize(12).fillColor(COLORS.textLight).font('Helvetica')
    .text('Installation Address:', 0, y, { width: pageWidth, align: 'center' });
  y += 20;
  doc.fontSize(14).fillColor(COLORS.text).font('Helvetica-Bold')
    .text(certificate.installation_address || 'Address not specified', 0, y, { width: pageWidth, align: 'center' });
  y += 20;
  doc.text(certificate.installation_postcode || '', 0, y, { width: pageWidth, align: 'center' });

  // Inspection date
  y += 50;
  doc.fontSize(12).fillColor(COLORS.textLight).font('Helvetica')
    .text('Date of Inspection:', 0, y, { width: pageWidth, align: 'center' });
  y += 20;
  doc.fontSize(14).fillColor(COLORS.text).font('Helvetica-Bold')
    .text(formatDate(certificate.inspection_date) || 'Not specified', 0, y, { width: pageWidth, align: 'center' });

  // Overall assessment (EICR only)
  if (certificate.certificate_type === 'eicr' && certificate.overall_assessment) {
    y += 60;
    const assessmentColor = certificate.overall_assessment === 'satisfactory' ? COLORS.c3 : COLORS.c1;
    doc.rect(centerX - 150, y, 300, 60).fill(assessmentColor);
    doc.fontSize(18).fillColor('white').font('Helvetica-Bold')
      .text(certificate.overall_assessment.toUpperCase(), centerX - 140, y + 20, { width: 280, align: 'center' });
  }

  // Footer - company details
  y = doc.page.height - 100;
  doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
    .text('Issued by:', 0, y, { width: pageWidth, align: 'center' });
  y += 15;
  doc.fontSize(12).fillColor(COLORS.text).font('Helvetica-Bold')
    .text(companyInfo.name || 'ANP Electrical Ltd', 0, y, { width: pageWidth, align: 'center' });
  y += 15;
  doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
    .text(`NAPIT Registration: ${companyInfo.napit_number || 'N/A'}`, 0, y, { width: pageWidth, align: 'center' });
}

/**
 * Draw page header
 */
function drawPageHeader(doc, certificateNo, sectionTitle) {
  const pageWidth = doc.page.width;

  // Header band
  doc.rect(0, 0, pageWidth, 50).fill(COLORS.headerBg);
  doc.moveTo(0, 50).lineTo(pageWidth, 50).lineWidth(2).stroke(COLORS.primary);

  // Certificate number
  doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
    .text(`Certificate: ${certificateNo}`, 50, 15);

  // Section title
  doc.fontSize(14).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text(sectionTitle, 50, 30);
}

/**
 * Draw client details section
 */
function drawClientDetails(doc, certificate) {
  let y = 80;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('DETAILS OF THE CLIENT / PERSON ORDERING THE REPORT', 50, y);

  y += 25;
  const fields = [
    { label: 'Client Name:', value: certificate.client_name },
    { label: 'Address:', value: certificate.client_address },
    { label: 'Telephone:', value: certificate.client_phone },
    { label: 'Email:', value: certificate.client_email },
  ];

  fields.forEach(field => {
    doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
      .text(field.label, 60, y);
    doc.fillColor(COLORS.text).font('Helvetica-Bold')
      .text(field.value || '-', 160, y);
    y += 18;
  });

  return y;
}

/**
 * Draw installation details section
 */
function drawInstallationDetails(doc, certificate) {
  let y = 200;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('DETAILS OF THE INSTALLATION', 50, y);

  y += 25;
  const fields = [
    { label: 'Installation Address:', value: certificate.installation_address },
    { label: 'Postcode:', value: certificate.installation_postcode },
    { label: 'Description of Premises:', value: certificate.section_data?.premises_description || 'Domestic' },
    { label: 'Estimated Age of Installation:', value: certificate.section_data?.installation_age ? `${certificate.section_data.installation_age} years` : '-' },
    { label: 'Evidence of Alterations:', value: certificate.section_data?.alterations_evident || '-' },
  ];

  fields.forEach(field => {
    doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
      .text(field.label, 60, y);
    doc.fillColor(COLORS.text).font('Helvetica-Bold')
      .text(field.value || '-', 200, y);
    y += 18;
  });

  return y;
}

/**
 * Draw supply characteristics section
 */
function drawSupplyCharacteristics(doc, certificate) {
  let y = 80;
  const supply = certificate.section_data?.supply || {};

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('SUPPLY CHARACTERISTICS AND EARTHING ARRANGEMENTS', 50, y);

  y += 30;

  // Create a table-like layout
  const col1 = 60, col2 = 200, col3 = 320, col4 = 460;

  const rows = [
    [
      { label: 'Earthing:', value: formatEarthing(supply.earthing_arrangement) },
      { label: 'No. of Phases:', value: supply.phase_configuration || '-' },
    ],
    [
      { label: 'Nominal Voltage (V):', value: supply.nominal_voltage || '-' },
      { label: 'Frequency (Hz):', value: supply.nominal_frequency || '50' },
    ],
    [
      { label: 'PFC/PSCC Ipf (kA):', value: supply.pfc_pscc || '-' },
      { label: 'Ze (Ω):', value: supply.ze || '-' },
    ],
  ];

  rows.forEach(row => {
    row.forEach((cell, index) => {
      const x = index === 0 ? col1 : col3;
      const valueX = index === 0 ? col2 : col4;
      doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
        .text(cell.label, x, y);
      doc.fillColor(COLORS.text).font('Helvetica-Bold')
        .text(cell.value, valueX, y);
    });
    y += 25;
  });

  // Supply protective device section
  y += 20;
  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('SUPPLY PROTECTIVE DEVICE', 50, y);

  y += 25;
  const deviceFields = [
    { label: 'BS(EN):', value: supply.device_bs_en || '-' },
    { label: 'Type:', value: supply.device_type || '-' },
    { label: 'Rating (A):', value: supply.device_rating || '-' },
  ];

  deviceFields.forEach(field => {
    doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
      .text(field.label, 60, y);
    doc.fillColor(COLORS.text).font('Helvetica-Bold')
      .text(field.value, 160, y);
    y += 18;
  });

  return y;
}

/**
 * Draw observation codes legend
 */
function drawObservationCodes(doc) {
  let y = 80;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('CLASSIFICATION CODES FOR OBSERVATIONS', 50, y);

  y += 25;

  Object.entries(OBSERVATION_CODES).forEach(([code, info]) => {
    // Code badge
    doc.rect(60, y - 3, 30, 16).fill(info.color);
    doc.fontSize(10).fillColor('white').font('Helvetica-Bold')
      .text(code, 62, y);

    // Label and description
    doc.fontSize(10).fillColor(COLORS.text).font('Helvetica-Bold')
      .text(info.label, 100, y);
    doc.fontSize(9).fillColor(COLORS.textLight).font('Helvetica')
      .text(info.desc, 100, y + 12, { width: 400 });

    y += 35;
  });

  return y;
}

/**
 * Draw overall assessment
 */
function drawOverallAssessment(doc, certificate) {
  if (certificate.certificate_type !== 'eicr') return;

  let y = 320;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('OVERALL ASSESSMENT OF THE INSTALLATION', 50, y);

  y += 25;
  const assessment = certificate.overall_assessment;
  const color = assessment === 'satisfactory' ? COLORS.c3 : COLORS.c1;

  doc.rect(60, y, 490, 40).lineWidth(2).stroke(color);
  doc.fontSize(14).fillColor(color).font('Helvetica-Bold')
    .text(assessment ? assessment.toUpperCase() : 'NOT ASSESSED', 70, y + 12);

  return y + 50;
}

/**
 * Draw observations list
 */
function drawObservationsList(doc, observations) {
  let y = 400;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('OBSERVATIONS AND RECOMMENDATIONS', 50, y);

  y += 25;

  if (!observations || observations.length === 0) {
    doc.fontSize(10).fillColor(COLORS.text).font('Helvetica')
      .text('No observations recorded. The installation is in a satisfactory condition.', 60, y);
    return y + 30;
  }

  // Table header
  const colWidths = [40, 50, 250, 80, 60];
  const headers = ['Code', 'Item', 'Observation', 'Location', 'Action'];
  let x = 50;

  doc.rect(50, y - 5, 500, 20).fill(COLORS.headerBg);
  headers.forEach((header, i) => {
    doc.fontSize(9).fillColor(COLORS.primary).font('Helvetica-Bold')
      .text(header, x + 5, y);
    x += colWidths[i];
  });

  y += 20;

  // Table rows
  observations.forEach((obs, index) => {
    if (y > doc.page.height - 100) {
      doc.addPage();
      drawPageHeader(doc, '', 'Observations (continued)');
      y = 80;
    }

    const codeInfo = OBSERVATION_CODES[obs.code] || { color: '#6b7280' };
    x = 50;

    // Alternate row background
    if (index % 2 === 0) {
      doc.rect(50, y - 3, 500, 25).fill('#f8fafc');
    }

    // Code badge
    doc.rect(x + 2, y, 28, 14).fill(codeInfo.color);
    doc.fontSize(8).fillColor('white').font('Helvetica-Bold')
      .text(obs.code, x + 5, y + 3);
    x += colWidths[0];

    // Item number
    doc.fontSize(9).fillColor(COLORS.text).font('Helvetica')
      .text(obs.item_number?.toString() || '-', x + 5, y + 2);
    x += colWidths[1];

    // Observation text
    doc.text(obs.observation?.substring(0, 60) || '-', x + 5, y + 2, { width: colWidths[2] - 10 });
    x += colWidths[2];

    // Location
    doc.text(obs.location?.substring(0, 15) || '-', x + 5, y + 2);
    x += colWidths[3];

    // Action
    doc.text(obs.recommendation?.substring(0, 10) || '-', x + 5, y + 2);

    y += 25;
  });

  return y;
}

/**
 * Draw board details
 */
function drawBoardDetails(doc, board) {
  let y = 80;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text(`DISTRIBUTION BOARD: ${board.db_name || 'Main Board'}`, 50, y);

  y += 25;

  const fields = [
    { label: 'Location:', value: board.location },
    { label: 'Designation:', value: board.designation },
    { label: 'No. of Ways:', value: board.no_of_ways },
    { label: 'Supply Polarity:', value: board.supply_polarity },
    { label: 'SPD Fitted:', value: board.spd_fitted ? 'Yes' : 'No' },
    { label: 'Zdb (Ω):', value: board.zdb },
    { label: 'Ipf (kA):', value: board.ipf },
  ];

  const col1 = 60, col2 = 180, col3 = 300, col4 = 420;
  let col = 0;

  fields.forEach((field, i) => {
    const x = col === 0 ? col1 : col3;
    const valueX = col === 0 ? col2 : col4;

    doc.fontSize(10).fillColor(COLORS.textLight).font('Helvetica')
      .text(field.label, x, y);
    doc.fillColor(COLORS.text).font('Helvetica-Bold')
      .text(field.value?.toString() || '-', valueX, y);

    col++;
    if (col >= 2) {
      col = 0;
      y += 20;
    }
  });

  return y + 30;
}

/**
 * Draw circuits table
 */
function drawCircuitsTable(doc, circuits) {
  let y = 200;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('SCHEDULE OF CIRCUIT DETAILS AND TEST RESULTS', 50, y);

  y += 20;

  if (!circuits || circuits.length === 0) {
    doc.fontSize(10).fillColor(COLORS.text).font('Helvetica')
      .text('No circuits recorded for this board.', 60, y);
    return y + 30;
  }

  // Table header
  const headers = ['Cct', 'Designation', 'A', 'Type', 'r1+r2', 'Zs', 'Max Zs', 'IR L-E', 'Pol', 'RCD'];
  const colWidths = [30, 100, 30, 35, 45, 40, 45, 45, 30, 40];

  doc.rect(50, y, 510, 18).fill(COLORS.primary);
  let x = 50;

  headers.forEach((header, i) => {
    doc.fontSize(7).fillColor('white').font('Helvetica-Bold')
      .text(header, x + 2, y + 4, { width: colWidths[i] - 4 });
    x += colWidths[i];
  });

  y += 18;

  // Table rows
  circuits.forEach((circuit, index) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      drawPageHeader(doc, '', 'Circuit Details (continued)');
      y = 80;
    }

    x = 50;

    // Alternate row background
    if (index % 2 === 0) {
      doc.rect(50, y, 510, 16).fill('#f8fafc');
    }

    const values = [
      circuit.position,
      circuit.designation?.substring(0, 18) || '-',
      circuit.rating_amps,
      circuit.breaker_type,
      circuit.r1_plus_r2,
      circuit.zs,
      circuit.max_zs,
      circuit.insulation_resistance_live_earth,
      circuit.polarity,
      circuit.rcd_time_x1,
    ];

    values.forEach((value, i) => {
      doc.fontSize(7).fillColor(COLORS.text).font('Helvetica')
        .text(value?.toString() || '-', x + 2, y + 4, { width: colWidths[i] - 4 });
      x += colWidths[i];
    });

    y += 16;
  });

  return y;
}

/**
 * Draw declaration section
 */
function drawDeclaration(doc, certificate, companyInfo) {
  let y = 80;
  const startY = y;

  doc.fontSize(11).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('DECLARATION', 50, y);

  y += 25;

  // Declaration text
  const declarationText = certificate.certificate_type === 'eicr'
    ? 'I/We being the person(s) responsible for the inspection of the electrical installation (as indicated by my/our signatures below), particulars of which are described in this report, having exercised reasonable skill and care when carrying out the inspection, hereby declare that the information in this report, including the observations and the attached schedules, provides an accurate assessment of the condition of the electrical installation taking into account the stated extent and limitations.'
    : 'I/We being the person(s) responsible for the design, construction, inspection and testing of the electrical installation (as indicated by my/our signatures below), particulars of which are described above, having exercised reasonable skill and care when carrying out the design, construction, inspection and testing, hereby CERTIFY that the said work for which I/We have been responsible is to the best of my/our knowledge and belief in accordance with BS 7671, amended to...., except for the departures, if any, detailed as follows:';

  doc.fontSize(9).fillColor(COLORS.text).font('Helvetica')
    .text(declarationText, 60, y, { width: 480, align: 'justify' });

  y += 100;

  // Inspector signature box
  doc.rect(50, y, 240, 100).lineWidth(1).stroke(COLORS.border);
  doc.fontSize(10).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('INSPECTOR', 60, y + 10);

  doc.fontSize(9).fillColor(COLORS.textLight).font('Helvetica')
    .text('Name:', 60, y + 30);
  doc.fillColor(COLORS.text).font('Helvetica-Bold')
    .text(certificate.inspector_name || '-', 100, y + 30);

  doc.fontSize(9).fillColor(COLORS.textLight).font('Helvetica')
    .text('Registration:', 60, y + 48);
  doc.fillColor(COLORS.text)
    .text(certificate.inspector_registration || '-', 130, y + 48);

  doc.fontSize(9).fillColor(COLORS.textLight).font('Helvetica')
    .text('Signature:', 60, y + 66);
  doc.text('Date:', 60, y + 84);
  doc.fillColor(COLORS.text)
    .text(formatDate(certificate.inspection_date), 100, y + 84);

  // Contractor details box
  doc.rect(310, y, 240, 100).lineWidth(1).stroke(COLORS.border);
  doc.fontSize(10).fillColor(COLORS.primary).font('Helvetica-Bold')
    .text('CONTRACTOR', 320, y + 10);

  doc.fontSize(9).fillColor(COLORS.textLight).font('Helvetica')
    .text('Trading Title:', 320, y + 30);
  doc.fillColor(COLORS.text).font('Helvetica-Bold')
    .text(companyInfo.name || 'ANP Electrical Ltd', 400, y + 30);

  doc.fontSize(9).fillColor(COLORS.textLight).font('Helvetica')
    .text('NAPIT No:', 320, y + 48);
  doc.fillColor(COLORS.text)
    .text(companyInfo.napit_number || 'N/A', 400, y + 48);

  doc.fontSize(9).fillColor(COLORS.textLight).font('Helvetica')
    .text('Address:', 320, y + 66);
  doc.fillColor(COLORS.text)
    .text(companyInfo.address || 'West Midlands', 370, y + 66);

  // Approval signature (if approved)
  if (certificate.status === 'approved' && certificate.approved_at) {
    y += 120;
    doc.rect(50, y, 500, 60).lineWidth(2).stroke(COLORS.c3);
    doc.fontSize(10).fillColor(COLORS.c3).font('Helvetica-Bold')
      .text('✓ CERTIFICATE APPROVED', 60, y + 10);
    doc.fontSize(9).fillColor(COLORS.text).font('Helvetica')
      .text(`Approved by: ${certificate.approved_by_name || 'Quality Supervisor'}`, 60, y + 30);
    doc.text(`Date: ${formatDate(certificate.approved_at)}`, 60, y + 45);
  }

  return y + 100;
}

/**
 * Add page numbers
 */
function addPageNumbers(doc) {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(COLORS.textLight).font('Helvetica')
      .text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
    doc.text(
      '247Electrician - www.247electrician.uk',
      50,
      doc.page.height - 20,
      { align: 'center', width: doc.page.width - 100 }
    );
  }
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatEarthing(code) {
  const earthingTypes = {
    'TN-S': 'TN-S (Separate neutral and earth)',
    'TN-C-S': 'TN-C-S (PME)',
    'TN-C': 'TN-C (Combined neutral and earth)',
    'TT': 'TT (Earth electrode)',
    'IT': 'IT (Isolated)',
  };
  return earthingTypes[code] || code || '-';
}

module.exports = {
  generateCertificatePdf,
};
