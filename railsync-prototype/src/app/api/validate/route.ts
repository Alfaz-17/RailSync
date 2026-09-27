import { NextRequest, NextResponse } from 'next/server';
import { validatePlanBlocks } from '@/lib/plan-validator';
import { tasks as defaultTasks } from '@/data/tasks';
import { coaWindows as defaultWindows } from '@/data/windows';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const blocks = body.blocks || [];
    const tasks = body.tasks || defaultTasks;
    const windows = body.windows || defaultWindows;

    const errors = validatePlanBlocks({
      blocks,
      tasks,
      windows,
    });

    return NextResponse.json({
      valid: errors.length === 0,
      errorCount: errors.length,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to validate plan' },
      { status: 500 }
    );
  }
}
