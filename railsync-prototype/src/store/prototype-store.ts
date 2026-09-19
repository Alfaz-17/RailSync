'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlanStatus, MockPlanResponse, PlanBlock } from '@/types/domain';
import { runMockOptimization, runMockReoptimization } from '@/lib/mock-service';

interface PrototypeState {
  planStatus: PlanStatus;
  scenario: 'NORMAL' | 'COA_DISRUPTION';
  plan: MockPlanResponse | null;
  coaChanged: boolean;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;

  runOptimization: () => Promise<void>;
  simulateCoaChange: () => void;
  reoptimize: () => Promise<void>;
  approvePlan: () => void;
  rejectPlan: (reason: string) => void;
  modifyBlock: (blockId: string, updates: Partial<PlanBlock>) => void;
  reopenPlan: () => void;
  resetDemo: () => void;
}

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set) => ({
      planStatus: 'BASELINE',
      scenario: 'NORMAL',
      plan: null,
      coaChanged: false,
      approvedAt: null,
      rejectedAt: null,
      rejectReason: null,

      runOptimization: async () => {
        set({ planStatus: 'OPTIMIZING' });
        const result = await runMockOptimization();
        set({
          planStatus: 'RECOMMENDED',
          plan: result,
          scenario: 'NORMAL',
        });
      },

      simulateCoaChange: () => {
        set({
          planStatus: 'STALE',
          coaChanged: true,
        });
      },

      reoptimize: async () => {
        set({ planStatus: 'REOPTIMIZING' });
        const result = await runMockReoptimization();
        set({
          planStatus: 'RECOMMENDED_V2',
          plan: result,
          scenario: 'COA_DISRUPTION',
          coaChanged: false,
        });
      },

      approvePlan: () => {
        set({
          planStatus: 'APPROVED',
          approvedAt: new Date().toISOString(),
        });
      },

      rejectPlan: (reason: string) => {
        set({
          planStatus: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectReason: reason,
        });
      },

      modifyBlock: (blockId: string, updates: Partial<PlanBlock>) => {
        set((state) => {
          if (!state.plan) return state;
          const updatedBlocks = state.plan.blocks.map((b) =>
            b.id === blockId ? { ...b, ...updates } : b
          );
          return {
            plan: {
              ...state.plan,
              blocks: updatedBlocks,
            },
          };
        });
      },

      reopenPlan: () => {
        set({
          planStatus: 'RECOMMENDED',
          approvedAt: null,
          rejectedAt: null,
          rejectReason: null,
        });
      },

      resetDemo: () => {
        set({
          planStatus: 'BASELINE',
          scenario: 'NORMAL',
          plan: null,
          coaChanged: false,
          approvedAt: null,
          rejectedAt: null,
          rejectReason: null,
        });
      },
    }),
    {
      name: 'railsync-prototype-state',
    }
  )
);
