// ─── Core Domain Types ───────────────────────────────────────────────
// RailSync Internal Hackathon Prototype — All types are for synthetic demo data

export type Department = 'Engineering' | 'Signal' | 'Traction';

export type PriorityBand = 'Critical' | 'High' | 'Medium' | 'Low';

export type PlanStatus =
  | 'BASELINE'
  | 'OPTIMIZING'
  | 'RECOMMENDED'
  | 'STALE'
  | 'REOPTIMIZING'
  | 'RECOMMENDED_V2'
  | 'APPROVED'
  | 'REJECTED';

export type SourceSystem = 'TMS' | 'SMMS' | 'TDMS';

export type WindowAvailability = 'Available' | 'Restricted' | 'Unavailable';

export type TrafficImpact = 'Low' | 'Medium' | 'High';

// ─── Maintenance Task ────────────────────────────────────────────────

export interface MaintenanceTask {
  id: string;
  source: SourceSystem;
  department: Department;
  corridorId: string;
  corridorName: string;
  title: string;
  durationMin: number;
  priorityScore: number;
  priorityBand: PriorityBand;
  dueDate: string;
  criticality: number;
  urgency: number;
  safetyImpact: number;
  availabilityImpact: number;
  requiredState: string;
  requiredResource: string;
  notes?: string;
}

// ─── COA Block Window ────────────────────────────────────────────────

export interface COAWindow {
  id: string;
  corridorId: string;
  corridorName: string;
  start: string;
  end: string;
  durationMin: number;
  availability: WindowAvailability;
  dayOfWeek: string;
}

// ─── Plan Block ──────────────────────────────────────────────────────

export interface PlanBlock {
  id: string;
  windowId: string;
  corridorId: string;
  corridorName: string;
  start: string;
  end: string;
  durationMin: number;
  taskIds: string[];
  departments: Department[];
  trafficImpact: TrafficImpact;
  reasons: string[];
  isModified?: boolean;
  plannerNotes?: string;
}

// ─── Unscheduled Task ────────────────────────────────────────────────

export interface UnscheduledTask {
  taskId: string;
  reasonCode: string;
  reason: string;
  requiredDurationMin?: number;
  largestValidWindowMin?: number;
}

// ─── Prototype Metrics ───────────────────────────────────────────────

export interface PrototypeMetrics {
  totalBlocks: number;
  totalBlockMinutes: number;
  criticalTasksCovered: number;
  totalCriticalTasks: number;
  coordinatedMultiDeptBlocks: number;
  unscheduledCritical: number;
  hardViolations: number | null;
}

// ─── Mock Plan Response ──────────────────────────────────────────────

export interface MockPlanResponse {
  scenario: 'NORMAL' | 'COA_DISRUPTION';
  solverLabel: 'SIMULATED';
  status: 'FEASIBLE';
  runtimeLabel: string;
  blocks: PlanBlock[];
  unscheduled: UnscheduledTask[];
  metrics: PrototypeMetrics;
}

// ─── Data Source Card ────────────────────────────────────────────────

export interface DataSource {
  id: string;
  name: string;
  department?: Department;
  description: string;
  recordCount: number;
  recordUnit: string;
  label: 'Synthetic' | 'Synthetic demo' | 'Prototype assumptions';
  status: 'Loaded' | 'Pending' | 'Error';
  icon: string; // lucide icon name
  sampleData?: Record<string, string | number>[];
}

// ─── Compatibility Rule ──────────────────────────────────────────────

export interface CompatibilityRule {
  id: string;
  description: string;
  departments: Department[];
  compatible: boolean;
  condition: string;
}

// ─── Corridor ────────────────────────────────────────────────────────

export interface Corridor {
  id: string;
  name: string;
  taskCount: number;
}

// ─── Current (Fragmented) Plan Block ─────────────────────────────────

export interface FragmentedBlock {
  id: string;
  department: Department;
  corridorId: string;
  corridorName: string;
  taskId: string;
  taskTitle: string;
  start: string;
  end: string;
  durationMin: number;
  hasCoordinationOpportunity?: boolean;
}

// ─── Dashboard KPI ───────────────────────────────────────────────────

export interface DashboardKPI {
  label: string;
  value: number;
  icon: string;
  color: string;
  suffix?: string;
}
