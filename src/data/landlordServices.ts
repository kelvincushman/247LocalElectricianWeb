import { FileCheck, Bell, Lightbulb, Plug, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Pricing tier structure
export interface PricingTier {
  name: string;
  properties: string;
  discount: number;
  label: string;
  description: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "standard",
    properties: "1-5",
    discount: 0,
    label: "Individual",
    description: "Perfect for private landlords with a small portfolio",
  },
  {
    name: "trade",
    properties: "6-20",
    discount: 15,
    label: "Trade Partner",
    description: "Ideal for letting agents and growing portfolios",
  },
  {
    name: "contract",
    properties: "20+",
    discount: 25,
    label: "Contract Rate",
    description: "Best value for property managers with large portfolios",
  },
];

// Service pricing structure
export interface ServicePrice {
  item: string;
  description?: string;
  standard: number;
  unit?: string;
}

export interface LandlordService {
  slug: string;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  metaTitle: string;
  metaDescription: string;
  heroIntro: string;
  pricing: ServicePrice[];
  legalRequirements: string[];
  frequency: string;
  whatsIncluded: string[];
  process: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
}

// Calculate discounted price
export const calculatePrice = (basePrice: number, tier: string): number => {
  const tierData = pricingTiers.find((t) => t.name === tier);
  if (!tierData) return basePrice;
  return Math.round((basePrice * (1 - tierData.discount / 100)) * 100) / 100;
};

// Format price for display
export const formatPrice = (price: number): string => {
  return price % 1 === 0 ? `£${price}` : `£${price.toFixed(2)}`;
};

// All landlord services data
export const landlordServices: LandlordService[] = [
  {
    slug: "eicr-certificates",
    title: "EICR Certificates for Landlords",
    shortTitle: "EICR Certificates",
    icon: FileCheck,
    metaTitle: "EICR Certificates for Landlords | Electrical Safety Reports | Black Country & Birmingham",
    metaDescription: "Professional EICR certificates for landlords in Wolverhampton, Birmingham, Walsall & Dudley. Same-day certificates, competitive trade rates. NAPIT approved electricians. Book now.",
    heroIntro: "Ensure your rental properties meet legal electrical safety requirements with our fast, reliable EICR testing service. Same-day certificates available for property managers and letting agents.",
    pricing: [
      { item: "EICR - Studio/1 Bed Flat", standard: 120, unit: "per property" },
      { item: "EICR - 2-3 Bedroom Property", standard: 150, unit: "per property" },
      { item: "EICR - 4-5 Bedroom Property", standard: 180, unit: "per property" },
      { item: "EICR - HMO (6+ rooms)", standard: 220, unit: "per property" },
      { item: "EICR - HMO (10+ rooms)", standard: 280, unit: "per property" },
      { item: "Re-test (after remedial work)", standard: 60, unit: "per visit" },
    ],
    legalRequirements: [
      "Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020",
      "EICR required every 5 years or at change of tenancy",
      "Must be carried out by a qualified electrician",
      "Report must be provided to tenants within 28 days",
      "Landlords must keep records for duration of tenancy + 5 years",
      "Local authorities can impose fines up to £30,000 for non-compliance",
    ],
    frequency: "Every 5 years or at change of tenancy",
    whatsIncluded: [
      "Full visual inspection of the electrical installation",
      "Testing of all circuits, sockets, and switches",
      "Consumer unit inspection and RCD testing",
      "Earth fault loop impedance testing",
      "Insulation resistance testing",
      "Polarity checks on all circuits",
      "Detailed EICR report with observations and recommendations",
      "Digital certificate emailed same day",
      "Free phone consultation on any C1/C2 issues found",
    ],
    process: [
      { step: 1, title: "Book Online or Call", description: "Schedule at a time that suits you and your tenants. We offer morning, afternoon, and evening slots." },
      { step: 2, title: "Inspection Day", description: "Our qualified electrician arrives on time, completes the inspection efficiently with minimal disruption." },
      { step: 3, title: "Results Explained", description: "We explain any findings clearly, categorising issues as C1 (danger), C2 (potentially dangerous), or C3 (improvement recommended)." },
      { step: 4, title: "Certificate Issued", description: "Receive your digital EICR certificate same day by email, ready to share with tenants or your letting agent." },
    ],
    faqs: [
      {
        question: "How long does an EICR inspection take?",
        answer: "A typical 2-3 bedroom property takes 2-3 hours. Larger properties and HMOs may take longer depending on the number of circuits and rooms.",
      },
      {
        question: "What happens if my property fails the EICR?",
        answer: "If we find C1 (immediate danger) or C2 (potentially dangerous) issues, remedial work is required within 28 days. We can often complete minor remedial work on the same day and re-test.",
      },
      {
        question: "Do I need to inform my tenants?",
        answer: "Yes, landlords must give tenants reasonable notice (typically 24-48 hours) and provide a copy of the EICR report within 28 days of the inspection.",
      },
      {
        question: "Is an EICR the same as a landlord electrical safety certificate?",
        answer: "Yes, the EICR (Electrical Installation Condition Report) is the official document that proves your property meets electrical safety standards for renting.",
      },
      {
        question: "Can you test multiple properties on the same day?",
        answer: "Absolutely! We offer multi-property discounts for landlords with portfolios. Contact us to arrange bulk bookings and receive our best trade rates.",
      },
      {
        question: "What areas do you cover for EICR testing?",
        answer: "We cover Wolverhampton, Birmingham, Walsall, Dudley, West Bromwich, Sandwell, Cannock, Lichfield, Telford, and all surrounding areas in the Black Country and West Midlands.",
      },
    ],
    relatedServices: ["fire-alarm-testing", "smoke-co-detectors", "pat-testing"],
  },
  {
    slug: "fire-alarm-testing",
    title: "Fire Alarm Testing & Installation",
    shortTitle: "Fire Alarm Testing",
    icon: Bell,
    metaTitle: "Fire Alarm Testing for Landlords & HMOs | Installation & Servicing | Black Country",
    metaDescription: "Professional fire alarm testing, installation and maintenance for landlords and HMOs in Wolverhampton, Birmingham & West Midlands. Grade D1 systems, annual servicing. NAPIT approved.",
    heroIntro: "Keep your tenants safe and your properties compliant with professional fire alarm testing, installation, and maintenance services. Essential for all HMOs and recommended for all rental properties.",
    pricing: [
      { item: "Fire Alarm Annual Service", standard: 85, unit: "per system" },
      { item: "Fire Alarm 6-Monthly Service (HMO)", standard: 65, unit: "per visit" },
      { item: "Smoke Detector Installation (mains)", standard: 65, unit: "per point" },
      { item: "Heat Detector Installation", standard: 70, unit: "per point" },
      { item: "Fire Alarm Panel Installation", standard: 350, unit: "per panel" },
      { item: "Grade D1 System (HMO 3+ storey)", standard: 450, description: "Full interlinked system", unit: "from" },
      { item: "Emergency Callout - Fire Alarm Fault", standard: 95, unit: "first hour" },
    ],
    legalRequirements: [
      "Regulatory Reform (Fire Safety) Order 2005",
      "Housing Act 2004 (HMO licensing requirements)",
      "BS 5839-6:2019 Fire detection and fire alarm systems for buildings",
      "HMOs require Grade D1 (interlinked mains-powered with battery backup)",
      "Testing required weekly by tenant/landlord, annual professional service",
      "Fire risk assessment required for all HMOs",
    ],
    frequency: "Annual professional service (6-monthly for large HMOs)",
    whatsIncluded: [
      "Visual inspection of all detection devices",
      "Functional testing of every detector and call point",
      "Control panel inspection and battery check",
      "Sounder/alarm audibility testing",
      "System fault diagnosis and reporting",
      "Cleaning of smoke detector chambers",
      "Written service report and compliance certificate",
      "Recommendations for system upgrades if required",
    ],
    process: [
      { step: 1, title: "System Assessment", description: "We assess your current fire alarm system against current regulations and your property's requirements." },
      { step: 2, title: "Testing & Servicing", description: "Each detector, sounder, and control panel component is tested methodically and documented." },
      { step: 3, title: "Report & Certificate", description: "Receive a detailed service report highlighting any issues and a compliance certificate for your records." },
      { step: 4, title: "Ongoing Support", description: "Set up annual reminders and enjoy priority booking for your next service date." },
    ],
    faqs: [
      {
        question: "What type of fire alarm system does my HMO need?",
        answer: "Most HMOs require a Grade D1 system - mains-powered interlinked smoke alarms with battery backup. 3+ storey HMOs typically need a Grade A system with a central panel. We'll advise based on your specific property.",
      },
      {
        question: "How often do fire alarms need testing?",
        answer: "Weekly testing by the responsible person (landlord/tenant) and annual professional servicing. Large HMOs may require 6-monthly professional inspections.",
      },
      {
        question: "Can you install a new fire alarm system?",
        answer: "Yes, we design and install complete fire alarm systems from basic interlinked smoke alarms to full addressable systems with panels for larger HMOs and commercial properties.",
      },
      {
        question: "What's included in an annual fire alarm service?",
        answer: "We test every detector and sounder, check the panel, verify battery backup, clean detector heads, and provide a written certificate confirming compliance.",
      },
      {
        question: "Do standard rental properties need fire alarms?",
        answer: "Yes, all rental properties must have at least one smoke alarm on each storey and a carbon monoxide alarm where there's a fixed combustion appliance (since October 2022).",
      },
    ],
    relatedServices: ["emergency-lighting-testing", "smoke-co-detectors", "eicr-certificates"],
  },
  {
    slug: "emergency-lighting-testing",
    title: "Emergency Lighting Testing & Installation",
    shortTitle: "Emergency Lighting",
    icon: Lightbulb,
    metaTitle: "Emergency Lighting Testing for Landlords | HMO & Commercial | Black Country & Birmingham",
    metaDescription: "Professional emergency lighting testing, installation and certification for HMOs, commercial properties and blocks of flats. Monthly and annual testing. NAPIT approved electricians.",
    heroIntro: "Ensure safe evacuation routes with properly maintained emergency lighting. Required for HMOs, commercial properties, and blocks of flats. We provide installation, testing, and certification services.",
    pricing: [
      { item: "Monthly Functional Test", standard: 45, unit: "per visit" },
      { item: "Annual Full Duration Test", standard: 75, unit: "per system" },
      { item: "Monthly + Annual Package", standard: 550, description: "12 months coverage", unit: "per year" },
      { item: "Emergency Light Unit Installation", standard: 85, unit: "per unit" },
      { item: "Exit Sign Installation", standard: 95, unit: "per sign" },
      { item: "Central Battery System Service", standard: 150, unit: "per system" },
      { item: "Battery Replacement", standard: 35, description: "Plus parts", unit: "per unit" },
    ],
    legalRequirements: [
      "Regulatory Reform (Fire Safety) Order 2005",
      "BS 5266-1:2016 Emergency lighting code of practice",
      "Required in all HMOs, communal areas of flats, and commercial premises",
      "Monthly functional tests (brief flash test)",
      "Annual full duration test (3-hour battery discharge test)",
      "Records must be maintained in a log book",
    ],
    frequency: "Monthly functional tests + Annual full duration test",
    whatsIncluded: [
      "Visual inspection of all emergency light fittings",
      "Functional test of each unit (monthly visit)",
      "Full 3-hour duration test (annual visit)",
      "Battery condition assessment",
      "Lux level measurements in escape routes",
      "Exit sign inspection and cleaning",
      "Test log book entries",
      "Compliance certificate issued",
    ],
    process: [
      { step: 1, title: "Initial Survey", description: "We assess your property and identify all emergency lighting requirements based on escape routes and room usage." },
      { step: 2, title: "Testing Schedule", description: "Set up your monthly functional tests and annual duration test schedule with convenient appointment times." },
      { step: 3, title: "Professional Testing", description: "Our engineers test each unit, record results in the logbook, and identify any units needing attention." },
      { step: 4, title: "Certification", description: "Receive your emergency lighting test certificate for insurance and compliance purposes." },
    ],
    faqs: [
      {
        question: "Do all HMOs need emergency lighting?",
        answer: "Yes, all HMOs require emergency lighting in escape routes, stairwells, and corridors. The exact requirements depend on the building layout and fire risk assessment.",
      },
      {
        question: "What's the difference between monthly and annual tests?",
        answer: "Monthly tests are brief functional tests to check units operate. The annual test is a full 3-hour discharge to verify batteries can sustain illumination for the required duration.",
      },
      {
        question: "How long do emergency lighting batteries last?",
        answer: "Typically 3-4 years, though this varies by manufacturer and usage. We recommend replacement as part of regular maintenance before they fail.",
      },
      {
        question: "Can you maintain a log book for us?",
        answer: "Yes, we maintain comprehensive test records and provide a dedicated log book for your property showing all test dates, results, and any remedial work completed.",
      },
      {
        question: "What happens if an emergency light fails during testing?",
        answer: "We'll identify faulty units and can often repair or replace them during the same visit. You'll receive a quote for any parts or units needed.",
      },
    ],
    relatedServices: ["fire-alarm-testing", "eicr-certificates", "smoke-co-detectors"],
  },
  {
    slug: "pat-testing",
    title: "PAT Testing for Landlords",
    shortTitle: "PAT Testing",
    icon: Plug,
    metaTitle: "PAT Testing for Landlords & HMOs | Portable Appliance Testing | Black Country & Birmingham",
    metaDescription: "Professional PAT testing for landlords, HMOs and furnished rentals in Wolverhampton, Birmingham & West Midlands. Competitive per-appliance rates, same-day certificates. NAPIT approved.",
    heroIntro: "Protect your tenants and meet your duty of care with professional PAT testing for all electrical appliances in your furnished rental properties and HMOs.",
    pricing: [
      { item: "PAT Test (per appliance)", standard: 2.50, unit: "per item" },
      { item: "Minimum Charge", standard: 45, description: "Up to 20 appliances", unit: "per visit" },
      { item: "PAT Test - HMO (per room)", standard: 15, description: "Includes all appliances in room", unit: "per room" },
      { item: "Failed Item Re-test", standard: 5, description: "After repair", unit: "per item" },
      { item: "PAT Test + Minor Repair", standard: 25, description: "Plug/fuse replacement", unit: "per item" },
      { item: "Asset Register Creation", standard: 35, description: "Full inventory with photos", unit: "per property" },
    ],
    legalRequirements: [
      "Electricity at Work Regulations 1989",
      "Health and Safety at Work Act 1974",
      "Landlord duty of care to provide safe appliances",
      "HMO Management Regulations 2006",
      "No fixed legal frequency, but annual testing recommended",
      "Must maintain records of testing and any defects found",
    ],
    frequency: "Annually recommended (no fixed legal requirement)",
    whatsIncluded: [
      "Visual inspection of all portable appliances",
      "Earth continuity testing",
      "Insulation resistance testing",
      "Lead and plug inspection",
      "Fuse rating verification",
      "Pass/fail labels applied to each appliance",
      "Detailed register of all items tested",
      "Digital certificate and asset list by email",
    ],
    process: [
      { step: 1, title: "Inventory", description: "We create or update your appliance inventory, noting make, model, and location of each item." },
      { step: 2, title: "Testing", description: "Each appliance is visually inspected and electrically tested using calibrated PAT testing equipment." },
      { step: 3, title: "Labelling", description: "Pass labels are applied showing test date and next due date. Failed items are clearly marked." },
      { step: 4, title: "Report Issued", description: "Receive a comprehensive PAT testing certificate with full asset register for your records." },
    ],
    faqs: [
      {
        question: "What appliances need PAT testing in a rental property?",
        answer: "Any portable electrical appliance you provide as part of a furnished let - kettles, toasters, washing machines, fridges, microwaves, lamps, vacuum cleaners, etc.",
      },
      {
        question: "How often should PAT testing be done?",
        answer: "There's no legal fixed interval, but annual testing is recommended for rental properties. HMOs and properties with high tenant turnover may benefit from more frequent testing.",
      },
      {
        question: "Is PAT testing a legal requirement for landlords?",
        answer: "While not explicitly mandated, landlords have a duty of care under the Electricity at Work Regulations and Health & Safety at Work Act. PAT testing demonstrates you've taken reasonable steps to ensure appliance safety.",
      },
      {
        question: "What happens if an appliance fails?",
        answer: "Failed appliances should be removed from use immediately. Minor issues like damaged plugs can often be repaired on-site. We'll advise whether repair or replacement is more cost-effective.",
      },
      {
        question: "Do I need to PAT test tenant's own appliances?",
        answer: "No, you're only responsible for appliances you provide. However, if you're aware of a dangerous appliance, you should advise the tenant to have it checked.",
      },
    ],
    relatedServices: ["eicr-certificates", "smoke-co-detectors", "fire-alarm-testing"],
  },
  {
    slug: "smoke-co-detectors",
    title: "Smoke & Carbon Monoxide Detector Compliance",
    shortTitle: "Smoke & CO Alarms",
    icon: AlertTriangle,
    metaTitle: "Smoke Alarm & CO Detector Installation for Landlords | Legal Compliance | Black Country",
    metaDescription: "Smoke alarm and carbon monoxide detector installation for landlords. Meet legal requirements since October 2022. Mains-powered interlinked systems. Wolverhampton, Birmingham, West Midlands.",
    heroIntro: "Meet your legal obligations with professional smoke and carbon monoxide alarm installation and replacement. Since October 2022, all rental properties must have working alarms tested at the start of each tenancy.",
    pricing: [
      { item: "Smoke Alarm - Mains with Battery Backup", standard: 45, unit: "per unit" },
      { item: "Smoke Alarm - Interlinked (wireless)", standard: 55, unit: "per unit" },
      { item: "Smoke Alarm - Interlinked (hardwired)", standard: 65, unit: "per unit" },
      { item: "Heat Alarm (kitchens)", standard: 55, unit: "per unit" },
      { item: "Carbon Monoxide Alarm - Battery", standard: 35, unit: "per unit" },
      { item: "Carbon Monoxide Alarm - Mains", standard: 55, unit: "per unit" },
      { item: "Full Property Compliance Package", standard: 180, description: "3-bed typical", unit: "from" },
      { item: "Alarm Testing (start of tenancy)", standard: 35, unit: "per visit" },
    ],
    legalRequirements: [
      "Smoke and Carbon Monoxide Alarm (Amendment) Regulations 2022",
      "At least one smoke alarm on each storey with habitable rooms",
      "Carbon monoxide alarm in any room with a fixed combustion appliance",
      "Alarms must be tested and working at start of each new tenancy",
      "Landlords responsible for repair/replacement of faulty alarms",
      "Penalties up to £5,000 for non-compliance",
    ],
    frequency: "Test at start of each tenancy, replace batteries annually, units every 10 years",
    whatsIncluded: [
      "Assessment of current alarm provision",
      "Advice on optimal alarm placement",
      "Professional installation of mains or battery alarms",
      "Interlinking setup where required",
      "Functional testing of all units",
      "Written confirmation of compliance",
      "Guidance on tenant testing responsibilities",
      "10-year alarm warranty registration",
    ],
    process: [
      { step: 1, title: "Compliance Check", description: "We assess your property against current regulations and identify any gaps in alarm coverage." },
      { step: 2, title: "Recommendation", description: "Receive a clear proposal for the alarms needed, including options for battery, mains, or interlinked systems." },
      { step: 3, title: "Installation", description: "Professional installation in optimal locations, ensuring full coverage and compliance." },
      { step: 4, title: "Certification", description: "Receive documentation confirming your property meets smoke and CO alarm regulations." },
    ],
    faqs: [
      {
        question: "What are the smoke alarm requirements for landlords?",
        answer: "Since October 2022, landlords must install at least one smoke alarm on each storey with a living space, and a carbon monoxide alarm in any room with a fixed combustion appliance (gas boiler, fire, etc.).",
      },
      {
        question: "Do the alarms need to be mains-powered?",
        answer: "For standard rentals, sealed battery alarms are acceptable. HMOs typically require mains-powered, interlinked systems. We'll advise on the best solution for your property.",
      },
      {
        question: "Who is responsible for testing smoke alarms?",
        answer: "Landlords must ensure alarms are working at the start of each tenancy. After that, tenants are responsible for regular testing, but landlords must repair or replace faulty alarms.",
      },
      {
        question: "How often should smoke alarms be replaced?",
        answer: "Smoke and CO alarms should be replaced every 10 years, or sooner if faulty. Batteries in sealed units last the lifetime of the alarm; replaceable batteries should be changed annually.",
      },
      {
        question: "Where should carbon monoxide alarms be installed?",
        answer: "In any room containing a fixed combustion appliance (gas boilers, gas fires, wood burners, etc.). The alarm should be placed at head height, 1-3 metres from the potential source.",
      },
      {
        question: "What penalties apply for non-compliance?",
        answer: "Local authorities can issue fines up to £5,000 for landlords who don't comply with smoke and CO alarm regulations. More importantly, compliant alarms save lives.",
      },
    ],
    relatedServices: ["fire-alarm-testing", "eicr-certificates", "emergency-lighting-testing"],
  },
];

// Get service by slug
export const getServiceBySlug = (slug: string): LandlordService | undefined => {
  return landlordServices.find((service) => service.slug === slug);
};

// Get related services data
export const getRelatedServices = (slugs: string[]): LandlordService[] => {
  return slugs
    .map((slug) => landlordServices.find((s) => s.slug === slug))
    .filter((s): s is LandlordService => s !== undefined);
};

// Coverage areas for local SEO
export const coverageAreas = [
  { name: "Wolverhampton", slug: "wolverhampton" },
  { name: "Birmingham", slug: "birmingham" },
  { name: "Walsall", slug: "walsall" },
  { name: "Dudley", slug: "dudley" },
  { name: "West Bromwich", slug: "west-bromwich" },
  { name: "Sandwell", slug: "sandwell" },
  { name: "Cannock", slug: "cannock" },
  { name: "Lichfield", slug: "lichfield" },
  { name: "Telford", slug: "telford" },
  { name: "Bilston", slug: "bilston" },
  { name: "Wednesbury", slug: "wednesbury" },
  { name: "Tipton", slug: "tipton" },
  { name: "Oldbury", slug: "oldbury" },
  { name: "Halesowen", slug: "halesowen" },
  { name: "Stourbridge", slug: "stourbridge" },
];

// Trust badges for landlord pages
export const trustBadges = [
  { label: "NAPIT Approved", icon: "shield-check" },
  { label: "24/7 Emergency", icon: "clock" },
  { label: "Same-Day Certificates", icon: "file-check" },
  { label: "Fully Insured", icon: "shield" },
  { label: "BS 7671 Compliant", icon: "award" },
];

// Testimonials for landlord pages
export const landlordTestimonials = [
  {
    quote: "Excellent service for our portfolio of 35 properties. Fast turnaround on EICRs and very competitive trade rates.",
    author: "Mark Thompson",
    role: "Property Portfolio Manager",
    company: "Thompson Lettings",
  },
  {
    quote: "They've been maintaining our HMO fire alarms for 3 years now. Always reliable, always professional.",
    author: "Sarah Williams",
    role: "HMO Landlord",
    company: "Wolverhampton",
  },
  {
    quote: "The contract rate saves us hundreds each year across our managed properties. Highly recommended.",
    author: "David Chen",
    role: "Director",
    company: "Midlands Property Management",
  },
];
