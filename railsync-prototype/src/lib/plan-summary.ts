import { tasks } from '@/data/tasks';
import type { PlanBlock } from '@/types/domain';

// Display totals only. These do not validate a plan's safety or feasibility.
export function summarizeBlocks(blocks: Pick<PlanBlock, 'taskIds' | 'durationMin' | 'departments'>[]) {
  const assignedIds = new Set(blocks.flatMap(block => block.taskIds));
  const criticalTasks = tasks.filter(task => task.priorityBand === 'Critical');
  return {
    blockCount: blocks.length,
    totalMinutes: blocks.reduce((total, block) => total + block.durationMin, 0),
    taskCount: assignedIds.size,
    criticalPlanned: criticalTasks.filter(task => assignedIds.has(task.id)).length,
    criticalTotal: criticalTasks.length,
    sharedBlocks: blocks.filter(block => new Set(block.departments).size > 1).length,
  };
}

