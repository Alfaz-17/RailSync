import { format, parseISO, differenceInDays } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(isoStr: string): string {
  try {
    return format(parseISO(isoStr), 'dd MMM yyyy, HH:mm');
  } catch {
    return isoStr;
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getDueStatus(dueDate: string): 'overdue' | 'today' | 'upcoming' {
  const now = new Date('2026-09-17');
  const due = parseISO(dueDate);
  const diff = differenceInDays(due, now);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return 'upcoming';
}

export function getDueStatusLabel(dueDate: string): string {
  const status = getDueStatus(dueDate);
  switch (status) {
    case 'overdue': return 'Overdue';
    case 'today': return 'Today';
    case 'upcoming': return 'Upcoming';
  }
}
