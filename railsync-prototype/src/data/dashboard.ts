// ─── Dashboard static data ───────────────────────────────────────────

export const dashboardKPIs = [
  { label: 'Total Tasks', value: 35, icon: 'ClipboardList', color: '#245F8E', suffix: 'tasks' },
  { label: 'Critical', value: 6, icon: 'AlertTriangle', color: '#B91C1C', suffix: 'tasks' },
  { label: 'Overdue', value: 8, icon: 'Clock', color: '#D97706', suffix: 'tasks' },
  { label: 'Available Windows', value: 21, icon: 'CalendarCheck', color: '#15803D', suffix: 'windows' },
];

export const departmentSplit = [
  { department: 'Engineering', source: 'TMS', count: 15, color: '#245F8E', icon: 'Wrench' },
  { department: 'Signal & Telecom', source: 'SMMS', count: 10, color: '#D97706', icon: 'Radio' },
  { department: 'Traction Distribution', source: 'TDMS', count: 10, color: '#6D4AFF', icon: 'Zap' },
];

export const priorityDistribution = [
  { band: 'Critical', count: 6, color: '#B91C1C' },
  { band: 'High', count: 12, color: '#D97706' },
  { band: 'Medium', count: 9, color: '#245F8E' },
  { band: 'Low', count: 8, color: '#64748B' },
];

export const corridorWorkload = [
  { corridor: 'C001', name: 'Ahmedabad → Nadiad', tasks: 8 },
  { corridor: 'C002', name: 'Nadiad → Vadodara', tasks: 8 },
  { corridor: 'C003', name: 'Vadodara → Surat', tasks: 8 },
  { corridor: 'C004', name: 'Surat → Mumbai Central', tasks: 6 },
  { corridor: 'C005', name: 'Mumbai Central → Churchgate', tasks: 5 },
];

export const dataReadiness = [
  { source: 'TMS', status: 'Loaded' as const, records: 15 },
  { source: 'SMMS', status: 'Loaded' as const, records: 10 },
  { source: 'TDMS', status: 'Loaded' as const, records: 10 },
  { source: 'Timetable', status: 'Loaded' as const, records: 140 },
  { source: 'Goods Forecast', status: 'Loaded' as const, records: 105 },
  { source: 'COA', status: 'Loaded' as const, records: 21 },
];
