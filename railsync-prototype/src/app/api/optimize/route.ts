import { NextRequest, NextResponse } from 'next/server';
import { runConstraintScheduler } from '@/lib/scheduler-engine';
import { tasks as defaultTasks } from '@/data/tasks';
import { coaWindows as defaultWindows } from '@/data/windows';
import { PlanResponse } from '@/types/domain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const scenario = body.scenario || 'NORMAL';
    const lockedBlockIds = body.lockedBlockIds || [];
    const existingBlocks = body.existingBlocks || [];
    const tasks = body.tasks || defaultTasks;
    const windows = body.windows || defaultWindows;

    // 1. Attempt connection to Python OR-Tools FastAPI backend
    try {
      const solverBaseUrl = (
        process.env.SOLVER_URL ||
        process.env.NEXT_PUBLIC_SOLVER_URL ||
        'http://127.0.0.1:8787'
      ).replace(/\/+$/, '');

      const isLocal = solverBaseUrl.includes('127.0.0.1') || solverBaseUrl.includes('localhost');
      const defaultTimeout = isLocal ? 3000 : 15000;
      const timeoutMs = Number(process.env.SOLVER_TIMEOUT_MS) || defaultTimeout;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Prepare payload for Python solver
      const pyTasks = tasks.map((t: any) => ({
        id: t.id,
        department: t.department,
        corridorId: t.corridorId,
        durationMin: t.durationMin,
        priorityScore: t.priorityScore,
        priorityBand: t.priorityBand,
        requiredResource: t.requiredResource || 'General',
        requiredState: t.requiredState || 'Track Possession',
        dueDate: t.dueDate || '2026-09-30',
        title: t.title || '',
      }));

      // Filter windows for scenario if needed
      const effectiveWindows = windows.map((w: any) => {
        if (scenario === 'COA_DISRUPTION' && w.id === 'BW-001') {
          return { ...w, availability: 'Unavailable' };
        }
        return w;
      }).filter((w: any) => w.availability !== 'Unavailable');

      const pyWindows = effectiveWindows.map((w: any) => ({
        id: w.id,
        corridorId: w.corridorId,
        start: w.startIso || `2026-09-28T${w.start}`,
        end: w.endIso || `2026-09-28T${w.end}`,
        durationMin: w.durationMin,
        dayOfWeek: w.dayOfWeek || '',
      }));

      const pyLocks = existingBlocks
        .filter((b: any) => b.isLocked || lockedBlockIds.includes(b.id))
        .flatMap((b: any) => b.taskIds.map((tid: string) => ({ taskId: tid, windowId: b.windowId })));

      const pyPayload = {
        tasks: pyTasks,
        windows: pyWindows,
        locks: pyLocks,
        timeLimitSeconds: 5,
        horizonLabel: '7-day',
      };

      const pyRes = await fetch(`${solverBaseUrl}/api/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        // Convert to PlanResponse format
        const planBlocks = (pyData.blocks || []).map((b: any, idx: number) => {
          const w = windows.find((win: any) => win.id === b.windowId);
          return {
            id: b.blockId || `BLOCK-${String(idx + 1).padStart(3, '0')}`,
            windowId: b.windowId,
            corridorId: b.corridorId,
            corridorName: w?.corridorName || b.corridorName || b.corridorId,
            start: w?.start || b.start.split('T')[1] || b.start,
            end: w?.end || b.end.split('T')[1] || b.end,
            durationMin: b.durationMin,
            taskIds: b.tasks.map((t: any) => t.taskId),
            departments: b.departments,
            trafficImpact: 'Low',
            reasons: b.reasons || ['Coordinated by OR-Tools CP-SAT optimizer'],
            isLocked: b.isLocked || false,
          };
        });

        const totalCritTasks = tasks.filter((tk: any) => tk.priorityBand === 'Critical').length;
        const unschedCrit = (pyData.unscheduled || []).filter((u: any) => {
          const t = tasks.find((tk: any) => tk.id === u.taskId);
          return t?.priorityBand === 'Critical';
        }).length;
        const critCovered = pyData.metrics?.criticalTasksCovered ?? Math.max(0, totalCritTasks - unschedCrit);

        const response: PlanResponse = {
          scenario,
          solverLabel: 'OR-TOOLS CP-SAT',
          status: pyData.status || 'OPTIMAL',
          runtimeLabel: `${pyData.solverRuntimeMs || 24} ms (OR-Tools CP-SAT)`,
          version: scenario === 'COA_DISRUPTION' ? 2 : 1,
          blocks: planBlocks,
          unscheduled: pyData.unscheduled || [],
          metrics: {
            totalBlocks: planBlocks.length,
            totalBlockMinutes: planBlocks.reduce((acc: number, b: any) => acc + b.durationMin, 0),
            criticalTasksCovered: critCovered,
            totalCriticalTasks: totalCritTasks,
            coordinatedMultiDeptBlocks: planBlocks.filter((b: any) => new Set(b.departments).size > 1).length,
            unscheduledCritical: unschedCrit,
            hardViolations: pyData.validationErrors?.length || 0,
          },
          validationErrors: pyData.validationErrors || [],
          auditEvents: [
            {
              id: `EVT-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: scenario === 'COA_DISRUPTION' ? 'REOPTIMIZED' : 'OPTIMIZED',
              actor: 'OR-Tools Engine (Python API)',
              details: `Solved with status ${pyData.status} in ${pyData.solverRuntimeMs} ms.`,
            },
          ],
        };

        return NextResponse.json(response);
      }
    } catch {
      // Python solver offline or timed out -> gracefully use TypeScript CP engine
    }

    // 2. Fallback to built-in TypeScript constraint solver
    const localResult = runConstraintScheduler({
      scenario,
      tasks,
      windows,
      lockedBlockIds,
      existingBlocks,
    });

    return NextResponse.json(localResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to optimize schedule' },
      { status: 500 }
    );
  }
}
