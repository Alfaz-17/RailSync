import { AffectedTrain, AlternativeWindow, BlockRecommendation } from '@/types/domain';

// ─── Affected Train Movements (per block) ────────────────────────────
// Realistic Indian Railways train numbers for the Vadodara Division demo

export const affectedTrainsByBlock: Record<string, AffectedTrain[]> = {
  'BLK-001': [
    { trainId: '12931', trainName: 'Mumbai Central – Ahmedabad Express', type: 'Express', scheduledTime: '03:20', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-2041', trainName: 'Goods Rake', type: 'Goods', scheduledTime: '04:10', impact: 'INSIDE_BLOCK' },
    { trainId: '19011', trainName: 'Gujarat Express', type: 'Express', scheduledTime: '05:45', impact: 'CLEAR' },
  ],
  'BLK-002': [
    { trainId: '12935', trainName: 'Kutch Express', type: 'Express', scheduledTime: '01:45', impact: 'CLEAR' },
    { trainId: 'GDS-3012', trainName: 'Container Rake', type: 'Goods', scheduledTime: '02:30', impact: 'INSIDE_BLOCK' },
  ],
  'BLK-003': [
    { trainId: '22953', trainName: 'Gujarat Superfast', type: 'Express', scheduledTime: '03:10', impact: 'INSIDE_BLOCK' },
    { trainId: '12009', trainName: 'Shatabdi Express', type: 'Passenger', scheduledTime: '04:50', impact: 'DELAYED', delayMinutes: 15 },
    { trainId: 'GDS-1055', trainName: 'BOXN Rake', type: 'Goods', scheduledTime: '03:40', impact: 'INSIDE_BLOCK' },
  ],
  'BLK-004': [
    { trainId: '19015', trainName: 'Saurashtra Express', type: 'Express', scheduledTime: '02:00', impact: 'CLEAR' },
    { trainId: 'GDS-4088', trainName: 'Freight Rake', type: 'Goods', scheduledTime: '03:15', impact: 'INSIDE_BLOCK' },
  ],
  'BLK-005': [
    { trainId: '12933', trainName: 'Karnavati Express', type: 'Express', scheduledTime: '02:45', impact: 'INSIDE_BLOCK' },
    { trainId: '22927', trainName: 'Lok Shakti Express', type: 'Express', scheduledTime: '04:20', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-5023', trainName: 'BTPN Rake', type: 'Goods', scheduledTime: '01:30', impact: 'CLEAR' },
  ],
  // Disrupted plan blocks
  'BLK-D01': [
    { trainId: '12931', trainName: 'Mumbai Central – Ahmedabad Express', type: 'Express', scheduledTime: '03:20', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-2041', trainName: 'Goods Rake', type: 'Goods', scheduledTime: '04:10', impact: 'INSIDE_BLOCK' },
  ],
  'BLK-D02': [
    { trainId: '22953', trainName: 'Gujarat Superfast', type: 'Express', scheduledTime: '03:10', impact: 'DELAYED', delayMinutes: 10 },
  ],
  'BLK-D03': [
    { trainId: 'GDS-3012', trainName: 'Container Rake', type: 'Goods', scheduledTime: '02:30', impact: 'INSIDE_BLOCK' },
    { trainId: '19011', trainName: 'Gujarat Express', type: 'Express', scheduledTime: '05:45', impact: 'CLEAR' },
  ],
  'BLK-D04': [
    { trainId: '12935', trainName: 'Kutch Express', type: 'Express', scheduledTime: '01:45', impact: 'CLEAR' },
  ],
  'BLK-D05': [
    { trainId: '12933', trainName: 'Karnavati Express', type: 'Express', scheduledTime: '02:45', impact: 'INSIDE_BLOCK' },
    { trainId: 'GDS-5023', trainName: 'BTPN Rake', type: 'Goods', scheduledTime: '01:30', impact: 'CLEAR' },
  ],
};

// ─── Alternative Windows ─────────────────────────────────────────────

export const alternativeWindowsByBlock: Record<string, AlternativeWindow[]> = {
  'BLK-001': [
    { start: '05:30', end: '08:30', impact: 'MEDIUM' },
    { start: '10:00', end: '13:00', impact: 'HIGH' },
  ],
  'BLK-002': [
    { start: '04:00', end: '06:00', impact: 'LOW' },
    { start: '11:00', end: '13:00', impact: 'HIGH' },
  ],
  'BLK-003': [
    { start: '00:00', end: '02:30', impact: 'LOW' },
    { start: '06:00', end: '09:00', impact: 'MEDIUM' },
  ],
  'BLK-004': [
    { start: '05:00', end: '07:30', impact: 'LOW' },
    { start: '13:00', end: '15:00', impact: 'HIGH' },
  ],
  'BLK-005': [
    { start: '05:30', end: '08:00', impact: 'MEDIUM' },
    { start: '22:00', end: '01:00', impact: 'LOW' },
  ],
};

// ─── Block Recommendation Reasons ────────────────────────────────────

export const blockReasons: Record<string, string[]> = {
  'BLK-001': [
    'All hard constraints satisfied',
    'Tasks compatible (Engineering + Signal)',
    'Resources available for combined crew',
    'Lowest modelled traffic impact among candidates',
  ],
  'BLK-002': [
    'All hard constraints satisfied',
    'Single department — no compatibility conflict',
    'Block window matches task duration exactly',
    'No express trains affected during window',
  ],
  'BLK-003': [
    'All hard constraints satisfied',
    'Tasks compatible (Engineering + Traction)',
    'Track possession duration covers all tasks',
    'Goods traffic reroutable via alternate line',
  ],
  'BLK-004': [
    'All hard constraints satisfied',
    'Signal inspection requires isolated block',
    'Resources and crew available',
    'Low impact on passenger services',
  ],
  'BLK-005': [
    'All hard constraints satisfied',
    'Multi-department coordination achieved',
    'Resources pooled from adjacent sections',
    'Corridor capacity maintained above threshold',
  ],
};
