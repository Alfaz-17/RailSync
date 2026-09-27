import { PlanBlock, MaintenanceTask, COAWindow, ValidationError, CompatibilityRule } from '@/types/domain';
import { tasks as defaultTasks } from '@/data/tasks';
import { coaWindows as defaultWindows } from '@/data/windows';

export interface ValidationContext {
  blocks: PlanBlock[];
  tasks?: MaintenanceTask[];
  windows?: COAWindow[];
  rules?: CompatibilityRule[];
}

// Prototype default compatibility allowlist (Engineering, Signal, Traction)
export const defaultCompatibilityRules: CompatibilityRule[] = [
  {
    id: 'R-001',
    departments: ['Engineering', 'Signal'],
    compatible: true,
    condition: 'Speed restriction ≤ 30 km/h or full block',
    description: 'Track renewal and point machine maintenance in same corridor',
  },
  {
    id: 'R-003',
    departments: ['Engineering', 'Signal'],
    compatible: true,
    condition: 'Daylight or illuminated window',
    description: 'Bridge inspection and cable laying',
  },
  {
    id: 'R-004',
    departments: ['Signal', 'Traction'],
    compatible: true,
    condition: 'Power block coordinated',
    description: 'Signal relay testing alongside OHE insulator washing',
  },
  {
    id: 'R-005',
    departments: ['Signal', 'Traction'],
    compatible: true,
    condition: 'Simultaneous permit to work issued',
    description: 'Track circuit bonding and mast bonding',
  },
  {
    id: 'R-006',
    departments: ['Engineering', 'Traction'],
    compatible: true,
    condition: 'OHE isolated & earthed',
    description: 'Overhead track clearance and contact wire replacement',
  },
  {
    id: 'R-007',
    departments: ['Engineering', 'Traction'],
    compatible: true,
    condition: 'Tower wagon coordinated with track gang',
    description: 'Portal structure painting and track ballast dressing',
  },
];

export function validatePlanBlocks(context: ValidationContext): ValidationError[] {
  const {
    blocks,
    tasks = defaultTasks,
    windows = defaultWindows,
    rules = defaultCompatibilityRules,
  } = context;

  const errors: ValidationError[] = [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const windowMap = new Map(windows.map((w) => [w.id, w]));

  const assignedTaskIds = new Set<string>();

  for (const block of blocks) {
    // 1. Check window reference
    const window = windowMap.get(block.windowId);
    if (!window) {
      errors.push({
        code: 'INVALID_WINDOW_REF',
        message: `Block ${block.id} references non-existent window ${block.windowId}`,
        affectedIds: [block.id, block.windowId],
      });
      continue;
    }

    // 2. Check corridor match
    if (block.corridorId !== window.corridorId) {
      errors.push({
        code: 'CORRIDOR_MISMATCH',
        message: `Block ${block.id} corridor (${block.corridorId}) does not match window corridor (${window.corridorId})`,
        affectedIds: [block.id, window.id],
      });
    }

    // 3. Check window availability
    if (window.availability === 'Unavailable') {
      errors.push({
        code: 'WINDOW_UNAVAILABLE',
        message: `Block ${block.id} is scheduled in an unavailable window (${window.id})`,
        affectedIds: [block.id, window.id],
      });
    }

    // 4. Check duration vs window
    if (block.durationMin > window.durationMin) {
      errors.push({
        code: 'DURATION_EXCEEDS_WINDOW',
        message: `Block ${block.id} duration (${block.durationMin}m) exceeds window capacity (${window.durationMin}m)`,
        affectedIds: [block.id, window.id],
      });
    }

    // 5. Check tasks in block
    const blockResources = new Map<string, string[]>();

    for (const taskId of block.taskIds) {
      const task = taskMap.get(taskId);
      if (!task) {
        errors.push({
          code: 'INVALID_TASK_REF',
          message: `Block ${block.id} references unknown task ${taskId}`,
          affectedIds: [block.id, taskId],
        });
        continue;
      }

      // Check task corridor
      if (task.corridorId !== block.corridorId) {
        errors.push({
          code: 'TASK_CORRIDOR_MISMATCH',
          message: `Task ${task.id} (${task.corridorId}) does not match block corridor (${block.corridorId})`,
          affectedIds: [block.id, task.id],
        });
      }

      // Check task duration vs block
      if (task.durationMin > block.durationMin) {
        errors.push({
          code: 'TASK_DURATION_EXCEEDS_BLOCK',
          message: `Task ${task.id} duration (${task.durationMin}m) exceeds block duration (${block.durationMin}m)`,
          affectedIds: [block.id, task.id],
        });
      }

      // Track duplicate assignments
      if (assignedTaskIds.has(taskId)) {
        errors.push({
          code: 'DUPLICATE_TASK_ASSIGNMENT',
          message: `Task ${taskId} is assigned to multiple blocks`,
          affectedIds: [block.id, taskId],
        });
      }
      assignedTaskIds.add(taskId);

      // Track resources
      if (task.requiredResource) {
        const existing = blockResources.get(task.requiredResource) || [];
        existing.push(task.id);
        blockResources.set(task.requiredResource, existing);
      }
    }

    // 6. Check resource conflicts within same block
    blockResources.forEach((taskIdsWithResource, resource) => {
      // If resource is heavy machine (capacity = 1), check for overlap
      if (resource.includes('Machine') || resource.includes('Wagon') || resource.includes('Gang A')) {
        if (taskIdsWithResource.length > 1) {
          errors.push({
            code: 'RESOURCE_CAPACITY_EXCEEDED',
            message: `Resource "${resource}" cannot be used concurrently by multiple tasks in block ${block.id}`,
            affectedIds: [block.id, ...taskIdsWithResource],
          });
        }
      }
    });

    // 7. Check pairwise department compatibility
    const deptsInBlock = Array.from(new Set(block.departments));
    if (deptsInBlock.length > 1) {
      for (let i = 0; i < deptsInBlock.length; i++) {
        for (let j = i + 1; j < deptsInBlock.length; j++) {
          const d1 = deptsInBlock[i];
          const d2 = deptsInBlock[j];
          const isCompatible = rules.some(
            (r) =>
              r.compatible &&
              r.departments.includes(d1) &&
              r.departments.includes(d2)
          );
          if (!isCompatible) {
            errors.push({
              code: 'INCOMPATIBLE_DEPARTMENTS',
              message: `Departments ${d1} and ${d2} are not permitted to share block ${block.id}`,
              affectedIds: [block.id],
            });
          }
        }
      }
    }
  }

  return errors;
}
