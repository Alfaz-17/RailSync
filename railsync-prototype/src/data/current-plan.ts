import { FragmentedBlock } from '@/types/domain';

// ── Fragmented / baseline plan (18 blocks, separate per department) ──
// This represents the "before" state — departments plan independently

export const fragmentedBlocks: FragmentedBlock[] = [
  // ── C001: Ahmedabad → Nadiad ──
  { id: 'FB-001', department: 'Engineering', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', taskId: 'ENG-001', taskTitle: 'Track Repair', start: '01:00', end: '03:00', durationMin: 120, hasCoordinationOpportunity: true },
  { id: 'FB-002', department: 'Signal', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', taskId: 'SIG-001', taskTitle: 'Point Machine Inspection', start: '03:00', end: '04:00', durationMin: 60, hasCoordinationOpportunity: true },
  { id: 'FB-003', department: 'Traction', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', taskId: 'TRD-001', taskTitle: 'OHE Maintenance', start: '04:00', end: '05:30', durationMin: 90 },

  // ── C002: Nadiad → Vadodara ──
  { id: 'FB-004', department: 'Engineering', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', taskId: 'ENG-003', taskTitle: 'Bridge Inspection', start: '00:30', end: '02:00', durationMin: 90 },
  { id: 'FB-005', department: 'Engineering', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', taskId: 'ENG-004', taskTitle: 'Rail Grinding', start: '02:30', end: '05:00', durationMin: 150 },
  { id: 'FB-006', department: 'Signal', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', taskId: 'SIG-003', taskTitle: 'Relay Room Maintenance', start: '01:00', end: '03:00', durationMin: 120, hasCoordinationOpportunity: true },
  { id: 'FB-007', department: 'Traction', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', taskId: 'TRD-003', taskTitle: 'Pantograph Clearance Check', start: '03:00', end: '04:00', durationMin: 60, hasCoordinationOpportunity: true },

  // ── C003: Vadodara → Surat ──
  { id: 'FB-008', department: 'Engineering', corridorId: 'C003', corridorName: 'Vadodara → Surat', taskId: 'ENG-005', taskTitle: 'Turnout Replacement', start: '00:00', end: '04:00', durationMin: 240 },
  { id: 'FB-009', department: 'Engineering', corridorId: 'C003', corridorName: 'Vadodara → Surat', taskId: 'ENG-006', taskTitle: 'Level Crossing Repair', start: '04:00', end: '05:00', durationMin: 60 },
  { id: 'FB-010', department: 'Signal', corridorId: 'C003', corridorName: 'Vadodara → Surat', taskId: 'SIG-002', taskTitle: 'Track Circuit Testing', start: '02:30', end: '04:00', durationMin: 90, hasCoordinationOpportunity: true },
  { id: 'FB-011', department: 'Traction', corridorId: 'C003', corridorName: 'Vadodara → Surat', taskId: 'TRD-002', taskTitle: 'Section Insulator Inspection', start: '01:00', end: '02:15', durationMin: 75, hasCoordinationOpportunity: true },

  // ── C004: Surat → Mumbai Central ──
  { id: 'FB-012', department: 'Engineering', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', taskId: 'ENG-007', taskTitle: 'Weld Testing (USFD)', start: '00:00', end: '01:30', durationMin: 90 },
  { id: 'FB-013', department: 'Engineering', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', taskId: 'ENG-008', taskTitle: 'Drainage Maintenance', start: '02:00', end: '04:00', durationMin: 120 },
  { id: 'FB-014', department: 'Signal', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', taskId: 'SIG-004', taskTitle: 'Signal Lamp Replacement', start: '01:30', end: '02:15', durationMin: 45 },
  { id: 'FB-015', department: 'Traction', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', taskId: 'TRD-004', taskTitle: 'Mast Foundation Check', start: '02:30', end: '04:00', durationMin: 90 },

  // ── C005: Mumbai Central → Churchgate ──
  { id: 'FB-016', department: 'Engineering', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate', taskId: 'ENG-009', taskTitle: 'Platform Edge Repair', start: '01:00', end: '02:00', durationMin: 60 },
  { id: 'FB-017', department: 'Signal', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate', taskId: 'SIG-005', taskTitle: 'Axle Counter Calibration', start: '02:00', end: '03:30', durationMin: 90 },
  { id: 'FB-018', department: 'Traction', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate', taskId: 'TRD-005', taskTitle: 'Transformer Inspection', start: '03:30', end: '05:30', durationMin: 120 },
];

export const baselineMetrics = {
  totalBlocks: 18,
  totalBlockMinutes: 1620,
  criticalTasksCovered: 5,
  totalCriticalTasks: 6,
  coordinatedMultiDeptBlocks: 0,
  unscheduledCritical: 1,
  hardViolations: null as number | null,
};
