'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PlanStatus,
  MockPlanResponse,
  PlanBlock,
  PlanAuditEvent,
  ValidationError,
  MaintenanceTask,
  COAWindow,
} from '@/types/domain';
import { runMockOptimization, runMockReoptimization } from '@/lib/mock-service';
import { validatePlanBlocks } from '@/lib/plan-validator';
import { tasks as defaultTasks } from '@/data/tasks';
import { coaWindows as defaultWindows } from '@/data/windows';
import { goldenTasks, goldenWindows } from '@/data/golden-scenario';

interface PrototypeState {
  tasks: MaintenanceTask[];
  windows: COAWindow[];
  planStatus: PlanStatus;
  scenario: 'NORMAL' | 'COA_DISRUPTION';
  scenarioMode: 'GOLDEN' | 'FULL_DIVISION';
  plan: MockPlanResponse | null;
  coaChanged: boolean;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  planVersion: number;
  auditEvents: PlanAuditEvent[];
  validationErrors: ValidationError[];

  addTask: (task: MaintenanceTask) => void;
  deleteTask: (taskId: string) => void;
  importDataset: (newTasks: MaintenanceTask[], newWindows?: COAWindow[]) => void;
  resetTasks: () => void;
  loadGoldenScenario: () => void;
  loadFullDivisionScenario: () => void;
  runOptimization: () => Promise<void>;
  simulateCoaChange: () => void;
  reoptimize: () => Promise<void>;
  approvePlan: () => void;
  rejectPlan: (reason: string) => void;
  modifyBlock: (blockId: string, updates: Partial<PlanBlock>) => void;
  toggleLockBlock: (blockId: string) => void;
  reopenPlan: () => void;
  resetDemo: () => void;
}

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      tasks: goldenTasks,
      windows: goldenWindows,
      planStatus: 'BASELINE',
      scenario: 'NORMAL',
      scenarioMode: 'GOLDEN',
      plan: null,
      coaChanged: false,
      approvedAt: null,
      rejectedAt: null,
      rejectReason: null,
      planVersion: 1,
      auditEvents: [],
      validationErrors: [],

      addTask: (newTask: MaintenanceTask) => {
        set((state) => {
          const updated = [newTask, ...state.tasks];
          const auditEvent: PlanAuditEvent = {
            id: `EVT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'BLOCK_MODIFIED',
            actor: 'Railway Planner',
            details: `Task added to workbank: [${newTask.id}] ${newTask.title} (${newTask.durationMin}m on ${newTask.corridorName}).`,
          };
          return {
            tasks: updated,
            auditEvents: [auditEvent, ...state.auditEvents],
            planStatus: state.plan ? 'STALE' : state.planStatus,
          };
        });
      },

      deleteTask: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
          planStatus: state.plan ? 'STALE' : state.planStatus,
        }));
      },

      importDataset: (newTasks: MaintenanceTask[], newWindows?: COAWindow[]) => {
        set((state) => {
          const importEvent: PlanAuditEvent = {
            id: `EVT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'OPTIMIZED',
            actor: 'Dataset Ingestion Service',
            details: `Custom dataset imported: ${newTasks.length} tasks${newWindows ? `, ${newWindows.length} windows` : ''} loaded.`,
          };
          return {
            tasks: newTasks,
            windows: newWindows && newWindows.length > 0 ? newWindows : state.windows,
            plan: null,
            planStatus: 'BASELINE',
            auditEvents: [importEvent, ...state.auditEvents],
          };
        });
      },

      resetTasks: () => {
        const mode = get().scenarioMode;
        set({
          tasks: mode === 'GOLDEN' ? goldenTasks : defaultTasks,
          windows: mode === 'GOLDEN' ? goldenWindows : defaultWindows,
        });
      },

      loadGoldenScenario: () => {
        set({
          tasks: goldenTasks,
          windows: goldenWindows,
          scenarioMode: 'GOLDEN',
          planStatus: 'BASELINE',
          scenario: 'NORMAL',
          plan: null,
          coaChanged: false,
          approvedAt: null,
          rejectedAt: null,
          rejectReason: null,
          planVersion: 1,
          validationErrors: [],
          auditEvents: [
            {
              id: `EVT-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'OPTIMIZED',
              actor: 'Scenario Controller',
              details: 'Golden Demo Scenario loaded: C001 (Ahmedabad → Nadiad) with 4 tasks & 4 candidate windows.',
            },
          ],
        });
      },

      loadFullDivisionScenario: () => {
        set({
          tasks: defaultTasks,
          windows: defaultWindows,
          scenarioMode: 'FULL_DIVISION',
          planStatus: 'BASELINE',
          scenario: 'NORMAL',
          plan: null,
          coaChanged: false,
          approvedAt: null,
          rejectedAt: null,
          rejectReason: null,
          planVersion: 1,
          validationErrors: [],
          auditEvents: [
            {
              id: `EVT-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'OPTIMIZED',
              actor: 'Scenario Controller',
              details: 'Full Division Scenario loaded: 35 tasks across 5 corridors (Western Railway).',
            },
          ],
        });
      },

      runOptimization: async () => {
        set({ planStatus: 'OPTIMIZING' });
        const currentTasks = get().tasks;
        const currentWindows = get().windows;
        const result = await runMockOptimization(currentTasks, currentWindows);
        const vErrors = validatePlanBlocks({
          blocks: result.blocks,
          tasks: currentTasks,
          windows: currentWindows,
        });

        const initialEvent: PlanAuditEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'OPTIMIZED',
          actor: result.solverLabel || 'RailSync CP-SAT Engine',
          details: `Plan v1 generated: ${result.blocks.length} blocks scheduled across ${currentTasks.length} tasks with ${vErrors.length} violations.`,
        };

        set({
          planStatus: 'RECOMMENDED',
          plan: result,
          scenario: 'NORMAL',
          planVersion: 1,
          validationErrors: vErrors,
          auditEvents: [initialEvent, ...(result.auditEvents || [])],
        });
      },

      simulateCoaChange: () => {
        const auditEvent: PlanAuditEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'REOPTIMIZED',
          actor: 'COA Feed Simulator',
          details: 'Window BW-001 (Ahmedabad → Nadiad) flagged Unavailable by Control Office due to rake movement.',
        };

        set((state) => ({
          planStatus: 'STALE',
          coaChanged: true,
          auditEvents: [auditEvent, ...state.auditEvents],
        }));
      },

      reoptimize: async () => {
        set({ planStatus: 'REOPTIMIZING' });
        const currentBlocks = get().plan?.blocks || [];
        const currentTasks = get().tasks;
        const currentWindows = get().windows;
        const lockedIds = currentBlocks.filter((b) => b.isLocked).map((b) => b.id);

        const result = await runMockReoptimization(lockedIds, currentBlocks, currentTasks, currentWindows);
        const vErrors = validatePlanBlocks({
          blocks: result.blocks,
          tasks: currentTasks,
          windows: currentWindows,
        });

        const reoptEvent: PlanAuditEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'REOPTIMIZED',
          actor: result.solverLabel || 'RailSync Engine',
          details: `Plan v2 re-optimized: Rescheduled around BW-001 while preserving ${lockedIds.length} locked block(s).`,
        };

        set((state) => ({
          planStatus: 'RECOMMENDED_V2',
          plan: result,
          scenario: 'COA_DISRUPTION',
          coaChanged: false,
          planVersion: state.planVersion + 1,
          validationErrors: vErrors,
          auditEvents: [reoptEvent, ...state.auditEvents],
        }));
      },

      toggleLockBlock: (blockId: string) => {
        set((state) => {
          if (!state.plan) return state;
          let isNowLocked = false;
          const updatedBlocks = state.plan.blocks.map((b) => {
            if (b.id === blockId) {
              isNowLocked = !b.isLocked;
              return { ...b, isLocked: isNowLocked };
            }
            return b;
          });

          const lockEvent: PlanAuditEvent = {
            id: `EVT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: isNowLocked ? 'BLOCK_LOCKED' : 'BLOCK_UNLOCKED',
            actor: 'Railway Planner',
            details: `Block ${blockId} ${isNowLocked ? 'locked (will be preserved in re-optimization)' : 'unlocked'}.`,
          };

          return {
            plan: {
              ...state.plan,
              blocks: updatedBlocks,
            },
            auditEvents: [lockEvent, ...state.auditEvents],
          };
        });
      },

      approvePlan: () => {
        const approveEvent: PlanAuditEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'APPROVED',
          actor: 'Railway Planner',
          details: 'Plan approved and marked ready for execution & circular issuance.',
        };

        set((state) => ({
          planStatus: 'APPROVED',
          approvedAt: new Date().toISOString(),
          auditEvents: [approveEvent, ...state.auditEvents],
        }));
      },

      rejectPlan: (reason: string) => {
        const rejectEvent: PlanAuditEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'REJECTED',
          actor: 'Railway Planner',
          details: `Plan rejected: "${reason}". Manual adjustments or re-optimization requested.`,
        };

        set((state) => ({
          planStatus: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectReason: reason,
          auditEvents: [rejectEvent, ...state.auditEvents],
        }));
      },

      modifyBlock: (blockId: string, updates: Partial<PlanBlock>) => {
        set((state) => {
          if (!state.plan) return state;
          const updatedBlocks = state.plan.blocks.map((b) =>
            b.id === blockId ? { ...b, ...updates, isModified: true } : b
          );

          const vErrors = validatePlanBlocks({
            blocks: updatedBlocks,
            tasks: state.tasks,
            windows: state.windows,
          });

          const editEvent: PlanAuditEvent = {
            id: `EVT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'BLOCK_MODIFIED',
            actor: 'Railway Planner',
            details: `Block ${blockId} manually adjusted (${updates.start || ''}-${updates.end || ''}). Validator checked: ${vErrors.length} violations.`,
          };

          const isApproved = state.planStatus === 'APPROVED';

          return {
            plan: {
              ...state.plan,
              blocks: updatedBlocks,
              metrics: {
                ...state.plan.metrics,
                totalBlockMinutes: updatedBlocks.reduce((acc, b) => acc + b.durationMin, 0),
                hardViolations: vErrors.length,
              },
            },
            planStatus: isApproved ? 'RECOMMENDED' : state.planStatus,
            approvedAt: isApproved ? null : state.approvedAt,
            validationErrors: vErrors,
            auditEvents: [editEvent, ...state.auditEvents],
          };
        });
      },

      reopenPlan: () => {
        const reopenEvent: PlanAuditEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'REOPENED',
          actor: 'Railway Planner',
          details: 'Plan reopened for review and adjustments.',
        };

        set((state) => ({
          planStatus: 'RECOMMENDED',
          approvedAt: null,
          rejectedAt: null,
          rejectReason: null,
          auditEvents: [reopenEvent, ...state.auditEvents],
        }));
      },

      resetDemo: () => {
        set({
          tasks: goldenTasks,
          windows: goldenWindows,
          scenarioMode: 'GOLDEN',
          planStatus: 'BASELINE',
          scenario: 'NORMAL',
          plan: null,
          coaChanged: false,
          approvedAt: null,
          rejectedAt: null,
          rejectReason: null,
          planVersion: 1,
          auditEvents: [],
          validationErrors: [],
        });
      },
    }),
    {
      name: 'railsync-prototype-state',
    }
  )
);
