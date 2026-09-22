import { AffectedTrain, AlternativeWindow } from '@/types/domain';

// ─── Affected Train Movements (per block) ────────────────────────────
// Realistic Indian Railways train numbers for the Vadodara Division demo scenario

const rawAffectedTrains: Record<string, AffectedTrain[]> = {
  'BLOCK-001': [
    { trainId: '12931', trainName: 'Mumbai Central – Ahmedabad Express', type: 'Passenger', scheduledTime: '01:45', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-2041', trainName: 'Goods Rake', type: 'Goods', scheduledTime: '02:20', impact: 'INSIDE_BLOCK' },
    { trainId: '19011', trainName: 'Gujarat Express', type: 'Express', scheduledTime: '05:45', impact: 'CLEAR' },
  ],
  'BLOCK-002': [
    { trainId: '12935', trainName: 'Kutch Express', type: 'Express', scheduledTime: '03:45', impact: 'CLEAR' },
    { trainId: 'GDS-3012', trainName: 'Container Rake', type: 'Goods', scheduledTime: '04:15', impact: 'INSIDE_BLOCK' },
  ],
  'BLOCK-003': [
    { trainId: '22953', trainName: 'Gujarat Superfast', type: 'Express', scheduledTime: '01:10', impact: 'INSIDE_BLOCK' },
    { trainId: '12009', trainName: 'Shatabdi Express', type: 'Passenger', scheduledTime: '04:50', impact: 'DELAYED', delayMinutes: 15 },
    { trainId: 'GDS-1055', trainName: 'BOXN Rake', type: 'Goods', scheduledTime: '01:40', impact: 'INSIDE_BLOCK' },
  ],
  'BLOCK-004': [
    { trainId: '19015', trainName: 'Saurashtra Express', type: 'Express', scheduledTime: '03:30', impact: 'CLEAR' },
    { trainId: 'GDS-4088', trainName: 'Freight Rake', type: 'Goods', scheduledTime: '04:15', impact: 'INSIDE_BLOCK' },
  ],
  'BLOCK-005': [
    { trainId: '12933', trainName: 'Karnavati Express', type: 'Express', scheduledTime: '01:15', impact: 'INSIDE_BLOCK' },
    { trainId: '22927', trainName: 'Lok Shakti Express', type: 'Express', scheduledTime: '01:40', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-5023', trainName: 'BTPN Rake', type: 'Goods', scheduledTime: '02:30', impact: 'CLEAR' },
  ],
  'BLOCK-006': [
    { trainId: '12904', trainName: 'Golden Temple Mail', type: 'Express', scheduledTime: '03:10', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-6011', trainName: 'Steel Rake', type: 'Goods', scheduledTime: '03:45', impact: 'INSIDE_BLOCK' },
  ],
  'BLOCK-007': [
    { trainId: '12954', trainName: 'August Kranti Tejas', type: 'Express', scheduledTime: '00:45', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-7022', trainName: 'Coal Rake', type: 'Goods', scheduledTime: '01:15', impact: 'INSIDE_BLOCK' },
  ],
  'BLOCK-008': [
    { trainId: '22944', trainName: 'Indore Daund SF', type: 'Express', scheduledTime: '03:20', impact: 'CLEAR' },
    { trainId: 'GDS-8099', trainName: 'Empty Container Rake', type: 'Goods', scheduledTime: '03:40', impact: 'INSIDE_BLOCK' },
  ],
  // Disrupted Plan Blocks (after COA change)
  'BLOCK-D01': [
    { trainId: '12931', trainName: 'Mumbai Central – Ahmedabad Express', type: 'Passenger', scheduledTime: '03:45', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-2041', trainName: 'Goods Rake', type: 'Goods', scheduledTime: '04:10', impact: 'INSIDE_BLOCK' },
    { trainId: '19011', trainName: 'Gujarat Express', type: 'Express', scheduledTime: '05:45', impact: 'CLEAR' },
  ],
  'BLOCK-D02': [
    { trainId: '12935', trainName: 'Kutch Express', type: 'Express', scheduledTime: '22:45', impact: 'CLEAR' },
  ],
};

// Support both BLOCK-XXX and BLK-XXX prefixes
export const affectedTrainsByBlock: Record<string, AffectedTrain[]> = new Proxy(rawAffectedTrains, {
  get(target, prop: string) {
    if (target[prop]) return target[prop];
    const altKey = prop.startsWith('BLOCK-') ? prop.replace('BLOCK-', 'BLK-') : prop.replace('BLK-', 'BLOCK-');
    return target[altKey] || [];
  },
});

// ─── Alternative Windows ─────────────────────────────────────────────
const rawAlternativeWindows: Record<string, AlternativeWindow[]> = {
  'BLOCK-001': [
    { start: '05:30', end: '07:30', impact: 'LOW' },
    { start: '10:00', end: '13:00', impact: 'HIGH' },
  ],
  'BLOCK-002': [
    { start: '05:30', end: '07:00', impact: 'LOW' },
    { start: '11:00', end: '13:00', impact: 'HIGH' },
  ],
  'BLOCK-003': [
    { start: '04:00', end: '06:00', impact: 'LOW' },
    { start: '06:00', end: '09:00', impact: 'MEDIUM' },
  ],
  'BLOCK-004': [
    { start: '05:30', end: '07:30', impact: 'LOW' },
    { start: '13:00', end: '15:00', impact: 'HIGH' },
  ],
  'BLOCK-005': [
    { start: '05:30', end: '07:30', impact: 'LOW' },
    { start: '22:00', end: '00:00', impact: 'MEDIUM' },
  ],
  'BLOCK-D01': [
    { start: '05:30', end: '07:30', impact: 'LOW' },
  ],
};

export const alternativeWindowsByBlock: Record<string, AlternativeWindow[]> = new Proxy(rawAlternativeWindows, {
  get(target, prop: string) {
    if (target[prop]) return target[prop];
    const altKey = prop.startsWith('BLOCK-') ? prop.replace('BLOCK-', 'BLK-') : prop.replace('BLK-', 'BLOCK-');
    return target[altKey] || [];
  },
});

// ─── Block Recommendation Reasons ────────────────────────────────────
const rawBlockReasons: Record<string, string[]> = {
  'BLOCK-001': [
    'Same corridor (Ahmedabad → Nadiad)',
    'Compatible under prototype rule R-001 (Civil track + Signal clearance)',
    'Both durations fit within the 120-minute window (120 min + 60 min concurrent)',
    'Required gangs available: Track Gang A + Signal Maintainer A',
    'Required states satisfied: Track Possession + Traffic Block',
    'Lowest simulated traffic impact among candidates',
  ],
  'BLOCK-002': [
    'Same corridor (Ahmedabad → Nadiad)',
    'Isolated power block required for OHE work (not compatible with concurrent track repair)',
    'Duration fits available 90-minute window (03:30–05:00)',
    'Required OHE gang available',
    'Low traffic impact',
  ],
  'BLOCK-003': [
    'Same corridor (Nadiad → Vadodara)',
    'Compatible prototype rule R-003 (Bridge inspection + Gate inspection)',
    'Both fit the available 120-minute block',
    'Required inspectors available',
  ],
  'BLOCK-004': [
    'Same corridor (Nadiad → Vadodara)',
    'Compatible prototype rule R-005 (Relay room + Pantograph clearance)',
    'Combined duration fits window',
    'Power block coordination verified',
  ],
  'BLOCK-005': [
    'Same corridor (Vadodara → Surat)',
    'Compatible prototype rule R-004 (Track circuit + Section insulator)',
    'Combined duration fits window',
    'Required crews available',
  ],
};

export const blockReasons: Record<string, string[]> = new Proxy(rawBlockReasons, {
  get(target, prop: string) {
    if (target[prop]) return target[prop];
    const altKey = prop.startsWith('BLOCK-') ? prop.replace('BLOCK-', 'BLK-') : prop.replace('BLK-', 'BLOCK-');
    return target[altKey] || [];
  },
});
