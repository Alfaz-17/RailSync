import { tasks } from './tasks';
import { coaWindows } from './windows';
import { getDueStatus } from '@/lib/format';

// ─── Authoritatively Derived Dashboard Data ─────────────────────────────

const criticalCount = tasks.filter((t) => t.priorityBand === 'Critical').length;
const overdueCount = tasks.filter((t) => getDueStatus(t.dueDate) === 'overdue').length;
const availableWindowsCount = coaWindows.filter((w) => w.availability !== 'Unavailable').length;

export const dashboardKPIs = [
  { label: 'Total Tasks', value: tasks.length, icon: 'ClipboardList', color: '#245F8E', suffix: 'tasks' },
  { label: 'Critical', value: criticalCount, icon: 'AlertTriangle', color: '#B91C1C', suffix: 'tasks' },
  { label: 'Overdue', value: overdueCount, icon: 'Clock', color: '#D97706', suffix: 'tasks' },
  { label: 'Available Windows', value: availableWindowsCount, icon: 'CalendarCheck', color: '#15803D', suffix: 'windows' },
];

export const departmentSplit = [
  {
    department: 'Engineering',
    source: 'TMS',
    count: tasks.filter((t) => t.department === 'Engineering').length,
    color: '#245F8E',
    icon: 'Wrench',
  },
  {
    department: 'Signal & Telecom',
    source: 'SMMS',
    count: tasks.filter((t) => t.department === 'Signal').length,
    color: '#D97706',
    icon: 'Radio',
  },
  {
    department: 'Traction Distribution',
    source: 'TDMS',
    count: tasks.filter((t) => t.department === 'Traction').length,
    color: '#6D4AFF',
    icon: 'Zap',
  },
];

export const priorityDistribution = [
  { band: 'Critical', count: tasks.filter((t) => t.priorityBand === 'Critical').length, color: '#B91C1C' },
  { band: 'High', count: tasks.filter((t) => t.priorityBand === 'High').length, color: '#D97706' },
  { band: 'Medium', count: tasks.filter((t) => t.priorityBand === 'Medium').length, color: '#245F8E' },
  { band: 'Low', count: tasks.filter((t) => t.priorityBand === 'Low').length, color: '#64748B' },
];

const corridorNames: Record<string, string> = {
  C001: 'Ahmedabad → Nadiad',
  C002: 'Nadiad → Vadodara',
  C003: 'Vadodara → Surat',
  C004: 'Surat → Mumbai Central',
  C005: 'Mumbai Central → Churchgate',
};

export const corridorWorkload = Object.entries(corridorNames).map(([id, name]) => ({
  corridor: id,
  name,
  tasks: tasks.filter((t) => t.corridorId === id).length,
}));

export const dataReadiness = [
  { source: 'TMS', status: 'Loaded' as const, records: tasks.filter((t) => t.source === 'TMS').length },
  { source: 'SMMS', status: 'Loaded' as const, records: tasks.filter((t) => t.source === 'SMMS').length },
  { source: 'TDMS', status: 'Loaded' as const, records: tasks.filter((t) => t.source === 'TDMS').length },
  { source: 'Timetable', status: 'Loaded' as const, records: 140 },
  { source: 'Goods Forecast', status: 'Loaded' as const, records: 105 },
  { source: 'COA', status: 'Loaded' as const, records: coaWindows.length },
];
