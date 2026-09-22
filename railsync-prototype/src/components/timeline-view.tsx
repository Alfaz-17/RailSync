'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Department, PlanBlock, FragmentedBlock } from '@/types/domain';
import { formatDuration } from '@/lib/format';

const deptColors: Record<Department, { bg: string; text: string; border: string }> = {
  Engineering: { bg: '#1473E618', text: '#1473E6', border: '#1473E640' },
  Signal: { bg: '#0F8B7E18', text: '#0F8B7E', border: '#0F8B7E40' },
  Traction: { bg: '#C2801218', text: '#C28012', border: '#C2801240' },
};

const hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];

function timeToPercent(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return ((h + m / 60) / 6) * 100;
}

interface TimelineBlock {
  id: string;
  department: Department;
  taskLabel: string;
  start: string;
  end: string;
  durationMin: number;
  hasConflict?: boolean;
  isApproved?: boolean;
}

interface TimelineViewProps {
  corridorId: string;
  corridorName: string;
  blocks: TimelineBlock[];
  departments?: Department[];
}

export function TimelineView({ corridorId, corridorName, blocks, departments }: TimelineViewProps) {
  const lanes = departments || (['Engineering', 'Signal', 'Traction'] as Department[]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--muted)]">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-[var(--muted-foreground)] bg-white px-2 py-0.5 rounded border border-[var(--border)]">
            {corridorId}
          </span>
          <span className="text-sm font-semibold text-[var(--foreground)]">{corridorName}</span>
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">{blocks.length} blocks</span>
      </div>

      <div className="p-5">
        {/* Time axis */}
        <div className="ml-28 mb-3 flex justify-between text-xs font-mono font-semibold text-[var(--muted-foreground)]">
          {hours.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* Lanes */}
        <div className="space-y-3">
          {lanes.map((dept) => {
            const laneBlocks = blocks.filter((b) => b.department === dept);
            const colors = deptColors[dept];

            return (
              <div key={dept} className="flex items-center gap-3">
                <div className="w-24 text-right shrink-0">
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold py-1 px-2.5"
                    style={{ color: colors.text, borderColor: colors.border }}
                  >
                    {dept === 'Signal' ? 'S&T' : dept}
                  </Badge>
                </div>
                <div className="flex-1 relative h-11 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                  {laneBlocks.map((block) => {
                    const left = timeToPercent(block.start);
                    const right = timeToPercent(block.end);
                    const width = right - left;

                    return (
                      <Tooltip key={block.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1 bottom-1 rounded-md flex items-center px-2.5 overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                            style={{
                              left: `${left}%`,
                              width: `${Math.max(width, 4)}%`,
                              backgroundColor: block.hasConflict ? '#D94B4515' : block.isApproved ? '#18864B15' : colors.bg,
                              border: `1.5px solid ${block.hasConflict ? '#D94B4560' : block.isApproved ? '#18864B60' : colors.border}`,
                            }}
                          >
                            <span
                              className="text-xs font-bold truncate"
                              style={{ color: block.hasConflict ? '#D94B45' : block.isApproved ? '#18864B' : colors.text }}
                            >
                              {block.taskLabel}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <div className="space-y-1">
                            <div className="font-semibold">{block.taskLabel}</div>
                            <div>{block.start} – {block.end} ({formatDuration(block.durationMin)})</div>
                            <div>{dept}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-[var(--muted-foreground)]">
          {lanes.map(dept => (
            <div key={dept} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: deptColors[dept].text }} />
              <span>{dept === 'Signal' ? 'S&T' : dept}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#D94B45]" />
            <span>Conflict</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#18864B]" />
            <span>Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper to convert FragmentedBlocks to TimelineBlocks ────────────

export function fragmentedToTimeline(blocks: FragmentedBlock[]): TimelineBlock[] {
  return blocks.map(b => ({
    id: b.id,
    department: b.department,
    taskLabel: `${b.taskId}: ${b.taskTitle}`,
    start: b.start,
    end: b.end,
    durationMin: b.durationMin,
    hasConflict: b.hasCoordinationOpportunity,
  }));
}

// ─── Helper to convert PlanBlocks to TimelineBlocks ─────────────────

export function planToTimeline(blocks: PlanBlock[], isApproved = false): TimelineBlock[] {
  return blocks.flatMap(b =>
    b.departments.map((dept, i) => ({
      id: `${b.id}-${dept}`,
      department: dept,
      taskLabel: b.taskIds.join(' + '),
      start: b.start,
      end: b.end,
      durationMin: b.durationMin,
      isApproved,
    }))
  );
}
