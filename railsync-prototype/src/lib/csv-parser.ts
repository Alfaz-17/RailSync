import { MaintenanceTask, COAWindow, Department, PriorityBand, SourceSystem } from '@/types/domain';

const corridorMap: Record<string, string> = {
  C001: 'Ahmedabad → Nadiad',
  C002: 'Nadiad → Vadodara',
  C003: 'Vadodara → Surat',
  C004: 'Surat → Mumbai Central',
  C005: 'Mumbai Central → Churchgate',
};

/**
 * Parses raw CSV text into MaintenanceTask[]
 * Accepts standard headers: id,department,title,corridorId,durationMin,priorityScore,priorityBand,requiredResource,requiredState,dueDate
 */
export function parseTasksCsv(csvText: string): MaintenanceTask[] {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const tasks: MaintenanceTask[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length < 3) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    const id = row.id || `TSK-${String(i).padStart(3, '0')}`;
    let dept: Department = 'Engineering';
    const deptLower = (row.department || '').toLowerCase();
    if (deptLower.includes('sig') || deptLower.includes('s&t')) dept = 'Signal';
    else if (deptLower.includes('trac') || deptLower.includes('trd') || deptLower.includes('ohe')) dept = 'Traction';

    const corridorId = row.corridorid || row.corridor || 'C001';
    const corridorName = corridorMap[corridorId] || row.corridorname || 'Ahmedabad → Nadiad';
    const durationMin = parseInt(row.durationmin || row.duration || '90', 10) || 90;
    const priorityScore = parseInt(row.priorityscore || row.priority || '70', 10) || 70;

    let priorityBand: PriorityBand = 'Medium';
    if (priorityScore >= 90) priorityBand = 'Critical';
    else if (priorityScore >= 75) priorityBand = 'High';
    else if (priorityScore <= 45) priorityBand = 'Low';

    let source: SourceSystem = 'TMS';
    if (dept === 'Signal') source = 'SMMS';
    if (dept === 'Traction') source = 'TDMS';

    tasks.push({
      id,
      source,
      department: dept,
      corridorId,
      corridorName,
      title: row.title || row.task || 'Track Maintenance Work',
      durationMin,
      priorityScore,
      priorityBand,
      status: 'PENDING',
      dueDate: row.duedate || row.due || '2026-09-30',
      criticality: Math.min(10, Math.max(1, Math.round(priorityScore / 10))),
      urgency: Math.min(10, Math.max(1, Math.round(priorityScore / 10))),
      safetyImpact: Math.min(10, Math.max(1, Math.round(priorityScore / 10))),
      availabilityImpact: Math.min(10, Math.max(1, Math.round(priorityScore / 10))),
      requiredState: row.requiredstate || (dept === 'Traction' ? 'Power Block' : dept === 'Signal' ? 'Traffic Block' : 'Track Possession'),
      requiredResource: row.requiredresource || row.resource || (dept === 'Traction' ? 'OHE Gang A' : dept === 'Signal' ? 'Signal Crew 1' : 'Track Gang A'),
      notes: row.notes || 'Imported via CSV adapter.',
    });
  }

  return tasks;
}

/**
 * Parses raw CSV text into COAWindow[]
 * Accepts standard headers: id,corridorId,start,end,durationMin,dayOfWeek
 */
export function parseWindowsCsv(csvText: string): COAWindow[] {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const windows: COAWindow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length < 3) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    const id = row.id || `BW-${String(i).padStart(3, '0')}`;
    const corridorId = row.corridorid || row.corridor || 'C001';
    const corridorName = corridorMap[corridorId] || row.corridorname || 'Ahmedabad → Nadiad';
    const start = row.start || '01:00';
    const end = row.end || '03:00';
    const durationMin = parseInt(row.durationmin || row.duration || '120', 10) || 120;
    const dayOfWeek = row.dayofweek || row.day || 'Monday';

    windows.push({
      id,
      corridorId,
      corridorName,
      start,
      end,
      durationMin,
      availability: 'Available',
      dayOfWeek,
      date: '2026-09-28',
      startIso: `2026-09-28T${start}`,
      endIso: `2026-09-28T${end}`,
    });
  }

  return windows;
}

/**
 * Generates sample CSV template content for download
 */
export function getSampleTasksCsv(): string {
  return `id,department,title,corridorId,durationMin,priorityScore,priorityBand,requiredResource,requiredState,dueDate
ENG-101,Engineering,Track Repair,C001,120,92,Critical,Track Gang A,Track Possession,2026-09-15
SIG-021,Signal,Signal Inspection,C001,60,78,High,Signal Maintainer A,Traffic Block,2026-09-16
TRD-008,Traction,OHE Maintenance,C001,90,75,High,OHE Gang A,Power Block,2026-09-16
ENG-204,Engineering,Track Tamping,C001,180,58,Medium,Tamping Machine,Track Possession,2026-09-18`;
}

export function getSampleWindowsCsv(): string {
  return `id,corridorId,start,end,durationMin,dayOfWeek
BW-001,C001,01:00,03:00,120,Monday
BW-002,C001,03:00,04:30,90,Monday
BW-003,C001,22:00,23:30,90,Monday
BW-004,C001,04:30,06:30,120,Monday`;
}
