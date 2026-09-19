import { COAWindow } from '@/types/domain';

export const coaWindows: COAWindow[] = [
  // ── C001: Ahmedabad → Nadiad (5 windows) ──
  { id: 'BW-001', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '01:00', end: '03:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Monday' },
  { id: 'BW-002', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '03:30', end: '05:00', durationMin: 90, availability: 'Available', dayOfWeek: 'Monday' },
  { id: 'BW-003', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '01:00', end: '03:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Wednesday' },
  { id: 'BW-004', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '22:00', end: '23:30', durationMin: 90, availability: 'Restricted', dayOfWeek: 'Thursday' },
  { id: 'BW-021', corridorId: 'C001', corridorName: 'Ahmedabad → Nadiad', start: '02:00', end: '04:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Saturday' },

  // ── C002: Nadiad → Vadodara (4 windows) ──
  { id: 'BW-005', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', start: '00:30', end: '02:30', durationMin: 120, availability: 'Available', dayOfWeek: 'Monday' },
  { id: 'BW-006', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', start: '03:00', end: '05:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Tuesday' },
  { id: 'BW-007', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', start: '01:00', end: '02:30', durationMin: 90, availability: 'Available', dayOfWeek: 'Thursday' },
  { id: 'BW-008', corridorId: 'C002', corridorName: 'Nadiad → Vadodara', start: '23:00', end: '01:00', durationMin: 120, availability: 'Restricted', dayOfWeek: 'Saturday' },

  // ── C003: Vadodara → Surat (5 windows) ──
  { id: 'BW-009', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '00:00', end: '02:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Monday' },
  { id: 'BW-010', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '02:30', end: '04:30', durationMin: 120, availability: 'Available', dayOfWeek: 'Monday' },
  { id: 'BW-011', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '01:00', end: '03:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Wednesday' },
  { id: 'BW-012', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '23:00', end: '01:00', durationMin: 120, availability: 'Unavailable', dayOfWeek: 'Friday' },
  { id: 'BW-013', corridorId: 'C003', corridorName: 'Vadodara → Surat', start: '01:30', end: '03:30', durationMin: 120, availability: 'Available', dayOfWeek: 'Saturday' },

  // ── C004: Surat → Mumbai Central (4 windows) ──
  { id: 'BW-014', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', start: '00:00', end: '02:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Tuesday' },
  { id: 'BW-015', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', start: '02:30', end: '04:30', durationMin: 120, availability: 'Available', dayOfWeek: 'Tuesday' },
  { id: 'BW-016', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', start: '01:00', end: '03:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Friday' },
  { id: 'BW-017', corridorId: 'C004', corridorName: 'Surat → Mumbai Central', start: '23:30', end: '01:30', durationMin: 120, availability: 'Restricted', dayOfWeek: 'Sunday' },

  // ── C005: Mumbai Central → Churchgate (3 windows) ──
  { id: 'BW-018', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate', start: '01:00', end: '03:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Wednesday' },
  { id: 'BW-019', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate', start: '00:30', end: '02:30', durationMin: 120, availability: 'Available', dayOfWeek: 'Friday' },
  { id: 'BW-020', corridorId: 'C005', corridorName: 'Mumbai Central → Churchgate', start: '02:00', end: '04:00', durationMin: 120, availability: 'Available', dayOfWeek: 'Sunday' },
];
