import { PlanResponse, PlanBlock, MaintenanceTask, COAWindow } from '@/types/domain';
import { runConstraintScheduler } from './scheduler-engine';

export async function runMockOptimization(
  tasks?: MaintenanceTask[],
  windows?: COAWindow[]
): Promise<PlanResponse> {
  try {
    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'NORMAL', tasks, windows }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API route not reachable in client test -> use local engine
  }

  return runConstraintScheduler({ scenario: 'NORMAL', tasks, windows });
}

export async function runMockReoptimization(
  lockedBlockIds: string[] = [],
  existingBlocks: PlanBlock[] = [],
  tasks?: MaintenanceTask[],
  windows?: COAWindow[]
): Promise<PlanResponse> {
  try {
    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: 'COA_DISRUPTION',
        lockedBlockIds,
        existingBlocks,
        tasks,
        windows,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API route not reachable -> use local engine
  }

  return runConstraintScheduler({
    scenario: 'COA_DISRUPTION',
    lockedBlockIds,
    existingBlocks,
    tasks,
    windows,
  });
}

export const optimizationSteps = [
  'Analyzing maintenance tasks & priorities',
  'Querying candidate COA block windows',
  'Executing pairwise compatibility allowlist',
  'Enforcing heavy machine & gang resource constraints',
  'Running CP-SAT solver for corridor coordination',
  'Validating plan against safety & operational rules',
];

export const reoptimizationSteps = [
  'Detecting updated COA operating conditions (BW-001 unavailable)',
  'Preserving planner locks & fixed allocations',
  'Solving revised block assignment via CP-SAT',
  'Running independent rule validator',
  'Generating explainable decision summary',
];
