// ─── Core Domain Types ───────────────────────────────────────────────
// RailSync Internal Hackathon Prototype — All types are for synthetic demo data

export type Department = 'Engineering' | 'Signal' | 'Traction';

export type PriorityBand = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'PENDING' | 'SCHEDULED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export type OptimizationStatus = 'RUNNING' | 'FEASIBLE' | 'OPTIMAL' | 'TIME_LIMIT' | 'INFEASIBLE' | 'FAILED';

export type PlanStatus =
  | 'BASELINE'
  | 'OPTIMIZING'
  | 'RECOMMENDED'
  | 'UNDER_REVIEW'
  | 'STALE'
  | 'REOPTIMIZING'
  | 'RECOMMENDED_V2'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type SourceSystem = 'TMS' | 'SMMS' | 'TDMS';

export type WindowAvailability = 'Available' | 'Restricted' | 'Unavailable';

export type TrafficImpact = 'Low' | 'Medium' | 'High';

export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';

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
  status: TaskStatus;
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
  date?: string;
  startIso?: string;
  endIso?: string;
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
  isLocked?: boolean;
  isModified?: boolean;
  plannerNotes?: string;
}

// ─── Affected Train ─────────────────────────────────────────────────

export interface AffectedTrain {
  trainId: string;
  trainName?: string;
  type: 'Passenger' | 'Goods' | 'Express';
  scheduledTime: string;
  impact: 'INSIDE_BLOCK' | 'CLEAR' | 'DELAYED';
  delayMinutes?: number;
}

// ─── Alternative Window ──────────────────────────────────────────────

export interface AlternativeWindow {
  start: string;
  end: string;
  impact: ImpactLevel;
}

// ─── Block Recommendation (heart of the demo) ───────────────────────

export interface BlockRecommendation {
  blockId: string;
  corridorId: string;
  corridorName: string;
  start: string;
  end: string;
  tasks: string[];
  departments: Department[];
  priority: PriorityBand;
  trafficImpact: TrafficImpact;
  affectedTrains: AffectedTrain[];
  alternativeWindows: AlternativeWindow[];
  reasons: string[];
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

// ─── Validation & Audit ──────────────────────────────────────────────

export interface ValidationError {
  code: string;
  message: string;
  affectedIds?: string[];
}

export interface PlanAuditEvent {
  id: string;
  timestamp: string;
  action: 'OPTIMIZED' | 'REOPTIMIZED' | 'BLOCK_MODIFIED' | 'BLOCK_LOCKED' | 'BLOCK_UNLOCKED' | 'APPROVED' | 'REJECTED' | 'REOPENED';
  actor: string;
  details: string;
}

// ─── Plan Response ───────────────────────────────────────────────────

export interface MockPlanResponse {
  scenario: 'NORMAL' | 'COA_DISRUPTION';
  solverLabel: string;
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'UNKNOWN' | 'ERROR';
  runtimeLabel: string;
  version?: number;
  blocks: PlanBlock[];
  unscheduled: UnscheduledTask[];
  metrics: PrototypeMetrics;
  validationErrors?: string[];
  auditEvents?: PlanAuditEvent[];
}

export type PlanResponse = MockPlanResponse;

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
