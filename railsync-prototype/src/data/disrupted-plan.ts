import { MockPlanResponse } from '@/types/domain';

// ── Disrupted plan: after BW-001 becomes Unavailable ──
// ENG-001 + SIG-001 moved from 01:00–03:00 to 03:00–05:00 on C001
// TRD-001 moved to late slot 22:00–23:30

export const disruptedPlan: MockPlanResponse = {
  scenario: 'COA_DISRUPTION',
  solverLabel: 'SIMULATED',
  status: 'FEASIBLE',
  runtimeLabel: '1.52 sec (simulated)',
  blocks: [
    {
      id: 'BLOCK-D01', windowId: 'BW-002', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
      start: '03:00', end: '05:00', durationMin: 120,
      taskIds: ['ENG-001', 'SIG-001'], departments: ['Engineering', 'Signal'],
      trafficImpact: 'Medium',
      reasons: ['Rescheduled from BW-001 (now unavailable)', 'Same corridor grouping preserved', 'Compatible prototype rule R-001', 'Slightly higher traffic impact in later window'],
    },
    {
      id: 'BLOCK-D02', windowId: 'BW-004', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad',
      start: '22:00', end: '23:30', durationMin: 90,
      taskIds: ['TRD-001'], departments: ['Traction'],
      trafficImpact: 'Low',
      reasons: ['Moved to restricted late window after COA disruption', 'Power block available in evening slot', 'Required OHE gang available'],
    },
    {
      id: 'BLOCK-D03', windowId: 'BW-005', corridorId: 'C002', corridorName: 'Nadiad → Vadodara',
      start: '00:30', end: '02:30', durationMin: 120,
      taskIds: ['ENG-003', 'SIG-009'], departments: ['Engineering', 'Signal'],
      trafficImpact: 'Low',
      reasons: ['Same corridor', 'Compatible prototype rule R-003', 'Both fit the available block', 'Unaffected by COA disruption'],
    },
    {
      id: 'BLOCK-D04', windowId: 'BW-006', corridorId: 'C002', corridorName: 'Nadiad → Vadodara',
      start: '03:00', end: '05:00', durationMin: 120,
      taskIds: ['SIG-003', 'TRD-003'], departments: ['Signal', 'Traction'],
      trafficImpact: 'Medium',
      reasons: ['Same corridor', 'Compatible prototype rule R-005', 'Combined duration fits window', 'Unaffected by COA disruption'],
    },
    {
      id: 'BLOCK-D05', windowId: 'BW-009', corridorId: 'C003', corridorName: 'Vadodara → Surat',
      start: '00:00', end: '02:00', durationMin: 120,
      taskIds: ['SIG-002', 'TRD-002'], departments: ['Signal', 'Traction'],
      trafficImpact: 'Low',
      reasons: ['Same corridor', 'Compatible prototype rule R-004', 'Combined duration fits window'],
    },
    {
      id: 'BLOCK-D06', windowId: 'BW-010', corridorId: 'C003', corridorName: 'Vadodara → Surat',
      start: '02:30', end: '04:30', durationMin: 120,
      taskIds: ['ENG-006', 'TRD-007'], departments: ['Engineering', 'Traction'],
      trafficImpact: 'Low',
      reasons: ['Same corridor', 'Compatible prototype rule R-006', 'Both fit the available block'],
    },
    {
      id: 'BLOCK-D07', windowId: 'BW-014', corridorId: 'C004', corridorName: 'Surat → Mumbai Central',
      start: '00:00', end: '02:00', durationMin: 120,
      taskIds: ['ENG-007', 'SIG-004'], departments: ['Engineering', 'Signal'],
      trafficImpact: 'Low',
      reasons: ['Same corridor', 'Compatible prototype rule R-001', 'Durations fit the available block'],
    },
    {
      id: 'BLOCK-D08', windowId: 'BW-015', corridorId: 'C004', corridorName: 'Surat → Mumbai Central',
      start: '02:30', end: '04:30', durationMin: 120,
      taskIds: ['TRD-004', 'TRD-009'], departments: ['Traction'],
      trafficImpact: 'Medium',
      reasons: ['Same corridor and department', 'Combined duration fits window', 'Power block coordination'],
    },
    {
      id: 'BLOCK-D09', windowId: 'BW-018', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate',
      start: '01:00', end: '03:00', durationMin: 120,
      taskIds: ['SIG-005', 'ENG-010'], departments: ['Signal', 'Engineering'],
      trafficImpact: 'Low',
      reasons: ['Same corridor', 'Compatible prototype rule R-001', 'Durations fit the available block'],
    },
    {
      id: 'BLOCK-D10', windowId: 'BW-019', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate',
      start: '00:30', end: '02:30', durationMin: 120,
      taskIds: ['TRD-005', 'ENG-009'], departments: ['Traction', 'Engineering'],
      trafficImpact: 'Low',
      reasons: ['Same corridor', 'Compatible prototype rule R-007', 'Combined duration fits window'],
    },
    {
      id: 'BLOCK-D11', windowId: 'BW-011', corridorId: 'C003', corridorName: 'Vadodara → Surat',
      start: '01:00', end: '03:00', durationMin: 120,
      taskIds: ['ENG-013'], departments: ['Engineering'],
      trafficImpact: 'Medium',
      reasons: ['Critical embankment work requires dedicated block', 'Required earth moving equipment available'],
    },
    {
      id: 'BLOCK-D12', windowId: 'BW-016', corridorId: 'C004', corridorName: 'Surat → Mumbai Central',
      start: '01:00', end: '03:00', durationMin: 120,
      taskIds: ['ENG-014'], departments: ['Engineering'],
      trafficImpact: 'Low',
      reasons: ['Tunnel inspection requires dedicated power block', 'Tunnel inspector available on scheduled day'],
    },
  ],
  unscheduled: [
    {
      taskId: 'ENG-002',
      reasonCode: 'NO_FEASIBLE_WINDOW',
      reason: 'No valid candidate window can fit 180 minutes. Largest available window on corridor C001 is 120 minutes.',
      requiredDurationMin: 180,
      largestValidWindowMin: 120,
    },
    {
      taskId: 'ENG-005',
      reasonCode: 'DURATION_EXCEEDS_WINDOW',
      reason: 'Turnout replacement requires 240 minutes. Maximum contiguous window available on C003 is 120 minutes.',
      requiredDurationMin: 240,
      largestValidWindowMin: 120,
    },
  ],
  metrics: {
    totalBlocks: 12,
    totalBlockMinutes: 1080,
    criticalTasksCovered: 6,
    totalCriticalTasks: 6,
    coordinatedMultiDeptBlocks: 4,
    unscheduledCritical: 0,
    hardViolations: 0,
  },
};
