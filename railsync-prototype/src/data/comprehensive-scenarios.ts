import { MaintenanceTask, COAWindow, DataSource } from '@/types/domain';
import { tasks as baselineTasks } from './tasks';
import { coaWindows as baselineWindows } from './windows';

export interface ComprehensiveScenarioSet {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  theme: string;
  badgeColor: string;
  description: string;
  counts: {
    tms: number;
    smms: number;
    tdms: number;
    timetable: number;
    goods: number;
    coa: number;
    rules: number;
    crews: number;
  };
  tasks: MaintenanceTask[];
  windows: COAWindow[];
  sampleData: Record<string, any[]>;
}

// ── SET 2: Monsoon Emergency & Flood Tasks ──────────────────────────
const monsoonTasks: MaintenanceTask[] = [
  {
    id: 'ENG-MON-01', source: 'TMS', department: 'Engineering',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'Emergency Ballast Packing post-Washout', durationMin: 90, priorityScore: 98, priorityBand: 'Critical',
    dueDate: '2026-09-10', criticality: 10, urgency: 10, safetyImpact: 10, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Emergency Gang 1',
    notes: 'Severe ballast scour near bridge 48 due to overflowing canal.',
  },
  {
    id: 'ENG-MON-02', source: 'TMS', department: 'Engineering',
    corridorId: 'C002', corridorName: 'Nadiad → Vadodara',
    title: 'Culvert Desilting & Waterway Clearance', durationMin: 60, priorityScore: 89, priorityBand: 'Critical',
    dueDate: '2026-09-11', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 8,
    requiredState: 'Speed Restriction', status: 'PENDING', requiredResource: 'P-Way Gang A',
  },
  {
    id: 'ENG-MON-03', source: 'TMS', department: 'Engineering',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Rail Fracture Clamping at Km 392', durationMin: 90, priorityScore: 96, priorityBand: 'Critical',
    dueDate: '2026-09-10', criticality: 10, urgency: 10, safetyImpact: 10, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Emergency Gang 2',
  },
  {
    id: 'ENG-MON-04', source: 'TMS', department: 'Engineering',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Mud Pumping Removal & Geotextile Insertion', durationMin: 90, priorityScore: 82, priorityBand: 'High',
    dueDate: '2026-09-12', criticality: 8, urgency: 8, safetyImpact: 8, availabilityImpact: 7,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Track Gang C',
  },
  {
    id: 'ENG-MON-05', source: 'TMS', department: 'Engineering',
    corridorId: 'C004', corridorName: 'Surat → Mumbai Central',
    title: 'Vaitarna River High-Water Pier Inspection', durationMin: 60, priorityScore: 94, priorityBand: 'Critical',
    dueDate: '2026-09-10', criticality: 10, urgency: 9, safetyImpact: 10, availabilityImpact: 9,
    requiredState: 'Speed Restriction', status: 'PENDING', requiredResource: 'Bridge Inspector',
  },
  {
    id: 'SIG-MON-01', source: 'SMMS', department: 'Signal',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'Waterlogged Track Circuit Insulation Renewal', durationMin: 60, priorityScore: 92, priorityBand: 'Critical',
    dueDate: '2026-09-10', criticality: 9, urgency: 10, safetyImpact: 9, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Gang 1',
  },
  {
    id: 'SIG-MON-02', source: 'SMMS', department: 'Signal',
    corridorId: 'C002', corridorName: 'Nadiad → Vadodara',
    title: 'Point Machine Submersion Testing & De-moisturizing', durationMin: 75, priorityScore: 88, priorityBand: 'Critical',
    dueDate: '2026-09-11', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 8,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Gang 2',
  },
  {
    id: 'SIG-MON-03', source: 'SMMS', department: 'Signal',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'MSDAC Axle Counter Reset & Cable Resistance Check', durationMin: 60, priorityScore: 85, priorityBand: 'High',
    dueDate: '2026-09-12', criticality: 8, urgency: 9, safetyImpact: 9, availabilityImpact: 8,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Telecom Team',
  },
  {
    id: 'SIG-MON-04', source: 'SMMS', department: 'Signal',
    corridorId: 'C004', corridorName: 'Surat → Mumbai Central',
    title: 'Relay Room Humidity Protection & Silica Gel Replacement', durationMin: 45, priorityScore: 78, priorityBand: 'High',
    dueDate: '2026-09-13', criticality: 7, urgency: 8, safetyImpact: 8, availabilityImpact: 6,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Crew 3',
  },
  {
    id: 'TRD-MON-01', source: 'TDMS', department: 'Traction',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'OHE Insulator Flashover Cleaning & Replacement', durationMin: 90, priorityScore: 90, priorityBand: 'Critical',
    dueDate: '2026-09-10', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 9,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'Tower Wagon 1',
  },
  {
    id: 'TRD-MON-02', source: 'TDMS', department: 'Traction',
    corridorId: 'C002', corridorName: 'Nadiad → Vadodara',
    title: 'Emergency Tree Trimming along 25kV Feeder', durationMin: 60, priorityScore: 86, priorityBand: 'High',
    dueDate: '2026-09-11', criticality: 8, urgency: 9, safetyImpact: 9, availabilityImpact: 7,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'TRD Gang A',
  },
  {
    id: 'TRD-MON-03', source: 'TDMS', department: 'Traction',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Neutral Section Moisture Ingress Check', durationMin: 75, priorityScore: 84, priorityBand: 'High',
    dueDate: '2026-09-12', criticality: 8, urgency: 8, safetyImpact: 8, availabilityImpact: 8,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'Tower Wagon 2',
  },
];

const monsoonWindows: COAWindow[] = [
  { id: 'MON-W01', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '01:00', end: '02:30', durationMin: 90, availability: 'Available', dayOfWeek: 'Emergency Day 1' },
  { id: 'MON-W02', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '03:00', end: '04:30', durationMin: 90, availability: 'Available', dayOfWeek: 'Emergency Day 1' },
  { id: 'MON-W03', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', start: '01:30', end: '03:00', durationMin: 90, availability: 'Available', dayOfWeek: 'Emergency Day 1' },
  { id: 'MON-W04', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', start: '12:00', end: '13:00', durationMin: 60, availability: 'Available', dayOfWeek: 'Emergency Day 1' },
  { id: 'MON-W05', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '01:00', end: '02:30', durationMin: 90, availability: 'Available', dayOfWeek: 'Emergency Day 1' },
  { id: 'MON-W06', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '03:00', end: '04:30', durationMin: 90, availability: 'Available', dayOfWeek: 'Emergency Day 1' },
  { id: 'MON-W07', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', start: '01:30', end: '03:00', durationMin: 90, availability: 'Available', dayOfWeek: 'Emergency Day 1' },
];

// ── SET 3: Sunday Mega-Block Tasks ──────────────────────────────────
const megaBlockTasks: MaintenanceTask[] = [
  {
    id: 'ENG-MB-01', source: 'TMS', department: 'Engineering',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'Shoulder Ballast Deep Screening (BCM Machine)', durationMin: 240, priorityScore: 94, priorityBand: 'Critical',
    dueDate: '2026-09-27', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'BCM Machine',
  },
  {
    id: 'ENG-MB-02', source: 'TMS', department: 'Engineering',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'Continuous Track Tamping (09-3X Machine)', durationMin: 180, priorityScore: 88, priorityBand: 'High',
    dueDate: '2026-09-27', criticality: 8, urgency: 9, safetyImpact: 9, availabilityImpact: 8,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Tamping Machine',
  },
  {
    id: 'ENG-MB-03', source: 'TMS', department: 'Engineering',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: '1 in 12 Curved Turnout Replacement Point 114', durationMin: 240, priorityScore: 96, priorityBand: 'Critical',
    dueDate: '2026-09-27', criticality: 10, urgency: 10, safetyImpact: 10, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'P-Way Gang B',
  },
  {
    id: 'SIG-MB-01', source: 'SMMS', department: 'Signal',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'Point Motor Replacement & Interlocking Validation', durationMin: 180, priorityScore: 92, priorityBand: 'Critical',
    dueDate: '2026-09-27', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Gang 1',
  },
  {
    id: 'SIG-MB-02', source: 'SMMS', department: 'Signal',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Electronic Interlocking (EI) Software Commissioning', durationMin: 210, priorityScore: 95, priorityBand: 'Critical',
    dueDate: '2026-09-27', criticality: 10, urgency: 9, safetyImpact: 10, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Engineer Team',
  },
  {
    id: 'TRD-MB-01', source: 'TDMS', department: 'Traction',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'Full 1.2km OHE Contact Wire Restringing', durationMin: 240, priorityScore: 90, priorityBand: 'Critical',
    dueDate: '2026-09-27', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 8,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'Tower Wagon 1',
  },
  {
    id: 'TRD-MB-02', source: 'TDMS', department: 'Traction',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Traction Transformer 132/25kV Bushing Replacement', durationMin: 210, priorityScore: 89, priorityBand: 'High',
    dueDate: '2026-09-27', criticality: 9, urgency: 8, safetyImpact: 8, availabilityImpact: 8,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'Substation Team',
  },
];

const megaBlockWindows: COAWindow[] = [
  { id: 'MB-W01', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '01:00', end: '06:00', durationMin: 300, availability: 'Available', dayOfWeek: 'Sunday Mega-Block' },
  { id: 'MB-W02', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', start: '01:30', end: '05:30', durationMin: 240, availability: 'Available', dayOfWeek: 'Sunday Mega-Block' },
  { id: 'MB-W03', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '00:30', end: '06:30', durationMin: 360, availability: 'Available', dayOfWeek: 'Sunday Mega-Block' },
  { id: 'MB-W04', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', start: '01:00', end: '05:00', durationMin: 240, availability: 'Available', dayOfWeek: 'Sunday Mega-Block' },
];

// ── SET 4: Festive Peak Season Tasks ────────────────────────────────
const festiveTasks: MaintenanceTask[] = [
  {
    id: 'ENG-FEST-01', source: 'TMS', department: 'Engineering',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'High-Speed Ultrasonic Rail Testing (USFD)', durationMin: 60, priorityScore: 88, priorityBand: 'Critical',
    dueDate: '2026-10-20', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 8,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'USFD Car',
  },
  {
    id: 'ENG-FEST-02', source: 'TMS', department: 'Engineering',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Fishplate Lubrication & Bolt Torque Verification', durationMin: 45, priorityScore: 74, priorityBand: 'High',
    dueDate: '2026-10-21', criticality: 7, urgency: 8, safetyImpact: 8, availabilityImpact: 6,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Track Gang A',
  },
  {
    id: 'SIG-FEST-01', source: 'SMMS', department: 'Signal',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'LED Signal Aspect Rapid Photometry Audit', durationMin: 45, priorityScore: 82, priorityBand: 'High',
    dueDate: '2026-10-20', criticality: 8, urgency: 8, safetyImpact: 8, availabilityImpact: 6,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Gang 1',
  },
  {
    id: 'SIG-FEST-02', source: 'SMMS', department: 'Signal',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Axle Counter Head Cleaning & Clearance Test', durationMin: 45, priorityScore: 84, priorityBand: 'Critical',
    dueDate: '2026-10-20', criticality: 9, urgency: 8, safetyImpact: 9, availabilityImpact: 7,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Gang 2',
  },
  {
    id: 'TRD-FEST-01', source: 'TDMS', department: 'Traction',
    corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
    title: 'Thermovision Infrared Hotspot Scanning', durationMin: 60, priorityScore: 85, priorityBand: 'Critical',
    dueDate: '2026-10-20', criticality: 8, urgency: 9, safetyImpact: 9, availabilityImpact: 7,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'Tower Wagon 1',
  },
  {
    id: 'TRD-FEST-02', source: 'TDMS', department: 'Traction',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'OHE Pantograph Clearance Visual Verification', durationMin: 45, priorityScore: 78, priorityBand: 'High',
    dueDate: '2026-10-21', criticality: 7, urgency: 8, safetyImpact: 8, availabilityImpact: 6,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'TRD Gang B',
  },
];

const festiveWindows: COAWindow[] = [
  { id: 'FEST-W01', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '02:00', end: '03:00', durationMin: 60, availability: 'Available', dayOfWeek: 'Peak Night 1' },
  { id: 'FEST-W02', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '03:45', end: '04:45', durationMin: 60, availability: 'Available', dayOfWeek: 'Peak Night 1' },
  { id: 'FEST-W03', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '01:30', end: '02:30', durationMin: 60, availability: 'Available', dayOfWeek: 'Peak Night 1' },
  { id: 'FEST-W04', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '03:15', end: '04:15', durationMin: 60, availability: 'Available', dayOfWeek: 'Peak Night 1' },
];

// ── SET 5: DFC Heavy Freight Corridor Tasks ─────────────────────────
const dfcTasks: MaintenanceTask[] = [
  {
    id: 'ENG-DFC-01', source: 'TMS', department: 'Engineering',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: '25-Tonne Axle Load Turnout Frog Laser Profiling', durationMin: 120, priorityScore: 93, priorityBand: 'Critical',
    dueDate: '2026-11-04', criticality: 10, urgency: 9, safetyImpact: 10, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Track Gang B',
  },
  {
    id: 'ENG-DFC-02', source: 'TMS', department: 'Engineering',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'High-Wear Curve Rail Gauge Face Lubrication & Grinding', durationMin: 120, priorityScore: 86, priorityBand: 'High',
    dueDate: '2026-11-05', criticality: 8, urgency: 8, safetyImpact: 8, availabilityImpact: 8,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Grinding Machine',
  },
  {
    id: 'SIG-DFC-01', source: 'SMMS', department: 'Signal',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Automatic Block Signaling (ABS) Track Magnet Calibration', durationMin: 90, priorityScore: 90, priorityBand: 'Critical',
    dueDate: '2026-11-04', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 9,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Signal Gang 2',
  },
  {
    id: 'SIG-DFC-02', source: 'SMMS', department: 'Signal',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Dual Axle Counter High-Vibration Damping Inspection', durationMin: 90, priorityScore: 84, priorityBand: 'High',
    dueDate: '2026-11-05', criticality: 8, urgency: 8, safetyImpact: 8, availabilityImpact: 8,
    requiredState: 'Track Possession', status: 'PENDING', requiredResource: 'Telecom Team',
  },
  {
    id: 'TRD-DFC-01', source: 'TDMS', department: 'Traction',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'High-Rise Pantograph OHE Contact Wire Height Tuning', durationMin: 120, priorityScore: 91, priorityBand: 'Critical',
    dueDate: '2026-11-04', criticality: 9, urgency: 9, safetyImpact: 9, availabilityImpact: 9,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'Tower Wagon 2',
  },
  {
    id: 'TRD-DFC-02', source: 'TDMS', department: 'Traction',
    corridorId: 'C003', corridorName: 'Vadodara → Surat',
    title: 'Traction Substation 132kV Circuit Breaker SF6 Gas Pressure Audit', durationMin: 90, priorityScore: 85, priorityBand: 'High',
    dueDate: '2026-11-05', criticality: 8, urgency: 8, safetyImpact: 8, availabilityImpact: 8,
    requiredState: 'Power Block', status: 'PENDING', requiredResource: 'Substation Team',
  },
];

const dfcWindows: COAWindow[] = [
  { id: 'DFC-W01', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '00:30', end: '02:30', durationMin: 120, availability: 'Available', dayOfWeek: 'DFC Window 1' },
  { id: 'DFC-W02', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '03:00', end: '05:00', durationMin: 120, availability: 'Available', dayOfWeek: 'DFC Window 1' },
];

// ── THE 5 COMPREHENSIVE OPERATIONAL SCENARIOS ───────────────────────
export const COMPREHENSIVE_SCENARIO_SETS: ComprehensiveScenarioSet[] = [
  {
    id: 'set-1',
    code: 'WR-BRC-SET-01',
    title: 'Set 1: Normal Weekly Operations',
    subtitle: 'Standard Division Routine (35 Tasks · 21 Windows)',
    theme: 'Routine Baseline',
    badgeColor: 'teal',
    description: 'Balanced weekly maintenance across Vadodara Division corridors (Ahmedabad to Mumbai Central). Features routine track tamping, USFD flaw detection, signal relay testing, and OHE insulator checks.',
    counts: {
      tms: 15,
      smms: 10,
      tdms: 10,
      timetable: 140,
      goods: 105,
      coa: 21,
      rules: 12,
      crews: 15,
    },
    tasks: baselineTasks,
    windows: baselineWindows,
    sampleData: {
      tms: [
        { id: 'ENG-001', task: 'Track Repair', corridor: 'C001', priority: 92 },
        { id: 'ENG-003', task: 'Bridge Inspection', corridor: 'C002', priority: 85 },
        { id: 'ENG-005', task: 'Turnout Replacement', corridor: 'C003', priority: 88 },
      ],
      smms: [
        { id: 'SIG-001', task: 'Point Machine Inspection', corridor: 'C001', priority: 78 },
        { id: 'SIG-002', task: 'Track Circuit Testing', corridor: 'C003', priority: 76 },
      ],
      tdms: [
        { id: 'TRD-001', task: 'OHE Maintenance', corridor: 'C001', priority: 75 },
        { id: 'TRD-002', task: 'Section Insulator Inspection', corridor: 'C003', priority: 71 },
      ],
    },
  },
  {
    id: 'set-2',
    code: 'WR-BRC-SET-02',
    title: 'Set 2: Monsoon Emergency & Flood Alert',
    subtitle: 'Vaitarna / Tapi River Ingress (Emergency Restorations)',
    theme: 'Emergency & Flood',
    badgeColor: 'rose',
    description: 'Triggered during heavy Gujarat monsoon downpours. Focuses on track washouts, waterlogged track circuits, mud pumping extraction, culvert cleaning, and moisture flashovers on 25kV OHE.',
    counts: {
      tms: 5,
      smms: 4,
      tdms: 3,
      timetable: 110,
      goods: 75,
      coa: 7,
      rules: 14,
      crews: 18,
    },
    tasks: monsoonTasks,
    windows: monsoonWindows,
    sampleData: {
      tms: [
        { id: 'ENG-MON-01', task: 'Emergency Ballast Packing post-Washout', corridor: 'C001', priority: 98 },
        { id: 'ENG-MON-03', task: 'Rail Fracture Clamping at Km 392', corridor: 'C003', priority: 96 },
      ],
      smms: [
        { id: 'SIG-MON-01', task: 'Waterlogged Track Circuit Insulation Renewal', corridor: 'C001', priority: 92 },
        { id: 'SIG-MON-02', task: 'Point Machine Submersion De-moisturizing', corridor: 'C002', priority: 88 },
      ],
      tdms: [
        { id: 'TRD-MON-01', task: 'OHE Insulator Flashover Replacement', corridor: 'C001', priority: 90 },
      ],
    },
  },
  {
    id: 'set-3',
    code: 'WR-BRC-SET-03',
    title: 'Set 3: Sunday Mega-Block Sprint',
    subtitle: '6-Hour Extended Infrastructure Overhaul',
    theme: 'Mega-Block Overhaul',
    badgeColor: 'amber',
    description: 'Scheduled division-wide Sunday 6-hour track possession. Deploys heavy machinery: Ballast Cleaning Machines (BCM), Continuous Tamping, Electronic Interlocking commissioning, and complete OHE restringing.',
    counts: {
      tms: 3,
      smms: 2,
      tdms: 2,
      timetable: 85,
      goods: 45,
      coa: 4,
      rules: 12,
      crews: 24,
    },
    tasks: megaBlockTasks,
    windows: megaBlockWindows,
    sampleData: {
      tms: [
        { id: 'ENG-MB-01', task: 'Ballast Deep Screening (BCM Machine)', corridor: 'C001', priority: 94 },
        { id: 'ENG-MB-03', task: '1 in 12 Turnout Replacement Point 114', corridor: 'C003', priority: 96 },
      ],
      smms: [
        { id: 'SIG-MB-01', task: 'Point Motor Replacement & Interlocking', corridor: 'C001', priority: 92 },
      ],
      tdms: [
        { id: 'TRD-MB-01', task: '1.2km OHE Contact Wire Restringing', corridor: 'C001', priority: 90 },
      ],
    },
  },
  {
    id: 'set-4',
    code: 'WR-BRC-SET-04',
    title: 'Set 4: Festive Peak Traffic (Diwali Rush)',
    subtitle: '185 Passenger Trains · Non-Disruptive Micro-Blocks',
    theme: 'Festive High Density',
    badgeColor: 'purple',
    description: 'Maximum passenger train density with 45 festival special express trains. Heavy track shutdowns are prohibited; maintenance is restricted to rapid 45-60 min micro-windows for thermovision and electronics.',
    counts: {
      tms: 2,
      smms: 2,
      tdms: 2,
      timetable: 185,
      goods: 120,
      coa: 4,
      rules: 10,
      crews: 12,
    },
    tasks: festiveTasks,
    windows: festiveWindows,
    sampleData: {
      tms: [
        { id: 'ENG-FEST-01', task: 'High-Speed USFD Rail Testing', corridor: 'C001', priority: 88 },
      ],
      smms: [
        { id: 'SIG-FEST-02', task: 'Axle Counter Head Cleaning & Clearance', corridor: 'C003', priority: 84 },
      ],
      tdms: [
        { id: 'TRD-FEST-01', task: 'Thermovision Infrared Hotspot Scanning', corridor: 'C001', priority: 85 },
      ],
    },
  },
  {
    id: 'set-5',
    code: 'WR-BRC-SET-05',
    title: 'Set 5: DFC Heavy-Haul Freight Corridor',
    subtitle: 'Western DFC Makarpura Interchange (25-Tonne Axle Load)',
    theme: 'Heavy-Haul Freight',
    badgeColor: 'blue',
    description: 'Specialized heavy-haul operations integrating with Western Dedicated Freight Corridor. Focuses on high-speed turnout frog wear, automated block signaling calibration, and high-rise pantograph OHE.',
    counts: {
      tms: 2,
      smms: 2,
      tdms: 2,
      timetable: 125,
      goods: 160,
      coa: 2,
      rules: 13,
      crews: 16,
    },
    tasks: dfcTasks,
    windows: dfcWindows,
    sampleData: {
      tms: [
        { id: 'ENG-DFC-01', task: '25-Tonne Turnout Frog Laser Profiling', corridor: 'C003', priority: 93 },
      ],
      smms: [
        { id: 'SIG-DFC-01', task: 'ABS Track Magnet Calibration', corridor: 'C003', priority: 90 },
      ],
      tdms: [
        { id: 'TRD-DFC-01', task: 'High-Rise Pantograph OHE Tuning', corridor: 'C003', priority: 91 },
      ],
    },
  },
];
