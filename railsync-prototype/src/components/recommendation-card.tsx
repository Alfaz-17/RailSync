'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlanBlock, Department, AffectedTrain, AlternativeWindow } from '@/types/domain';
import { tasks } from '@/data/tasks';
import { affectedTrainsByBlock, alternativeWindowsByBlock, blockReasons } from '@/data/affected-trains';
import { formatDuration } from '@/lib/format';
import {
  Clock, MapPin, CheckCircle2, AlertTriangle, TrainFront,
  Info, Shield, ArrowRight,
} from 'lucide-react';

const deptColors: Record<Department, { bg: string; text: string; border: string }> = {
  Engineering: { bg: '#1473E610', text: '#1473E6', border: '#1473E630' },
  Signal: { bg: '#0F8B7E10', text: '#0F8B7E', border: '#0F8B7E30' },
  Traction: { bg: '#C2801210', text: '#C28012', border: '#C2801230' },
};

const impactConfig = {
  Low: { color: '#18864B', bg: '#18864B10', border: '#18864B30', label: 'Low Impact' },
  Medium: { color: '#F28C18', bg: '#F28C1810', border: '#F28C1830', label: 'Medium Impact' },
  High: { color: '#D94B45', bg: '#D94B4510', border: '#D94B4530', label: 'High Impact' },
};

interface RecommendationCardProps {
  block: PlanBlock;
  onApprove?: () => void;
  onReject?: () => void;
  onModify?: () => void;
  showActions?: boolean;
  isApproved?: boolean;
}

export function RecommendationCard({
  block,
  onApprove,
  onReject,
  onModify,
  showActions = true,
  isApproved = false,
}: RecommendationCardProps) {
  const impact = impactConfig[block.trafficImpact];
  const affectedTrains = affectedTrainsByBlock[block.id] || [];
  const alternatives = alternativeWindowsByBlock[block.id] || [];
  const reasons = blockReasons[block.id] || block.reasons || [];
  const blockTasks = block.taskIds.map(id => tasks.find(t => t.id === id)).filter(Boolean);
  const highestPriority = blockTasks.reduce((max, t) => {
    if (!t) return max;
    const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return order[t.priorityBand] > order[max] ? t.priorityBand : max;
  }, 'Low' as 'Critical' | 'High' | 'Medium' | 'Low');

  return (
    <div className="space-y-5">
      {/* ── Block Header ── */}
      <div className="rounded-lg border p-4" style={{ borderColor: impact.border, backgroundColor: impact.bg }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: impact.color }}>
            Recommended Block
          </span>
          <Badge className="text-xs" style={{ backgroundColor: impact.bg, color: impact.color, border: `1px solid ${impact.border}` }}>
            {impact.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-4 h-4" style={{ color: impact.color }} />
          <span className="text-lg font-bold font-mono tracking-tight text-[var(--foreground)]">
            {block.start} – {block.end}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <MapPin className="w-3.5 h-3.5" />
          <span>{block.corridorName}</span>
          <span className="font-mono text-xs bg-white/60 px-1.5 py-0.5 rounded border border-[var(--border)]">{block.corridorId}</span>
        </div>
      </div>

      {/* ── Tasks in block ── */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
          Maintenance Tasks
        </h4>
        <div className="space-y-2">
          {blockTasks.map(task => {
            if (!task) return null;
            const dc = deptColors[task.department];
            return (
              <div key={task.id} className="rounded-lg border p-3" style={{ borderColor: dc.border, backgroundColor: dc.bg }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold" style={{ color: dc.text }}>{task.id}</span>
                  <Badge variant="outline" className="text-xs" style={{ color: dc.text, borderColor: dc.border }}>
                    {task.department}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{task.title}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{formatDuration(task.durationMin)} · Priority: {task.priorityBand}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-[var(--muted-foreground)]">
          Priority: <span className="font-semibold text-[var(--foreground)]">{highestPriority.toUpperCase()}</span>
          {' · '}Traffic Impact: <span className="font-semibold" style={{ color: impact.color }}>{block.trafficImpact.toUpperCase()}</span>
        </div>
      </div>

      <Separator />

      {/* ── Affected Trains ── */}
      {affectedTrains.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrainFront className="w-4 h-4 text-[var(--muted-foreground)]" />
            <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Affected Movements
            </h4>
          </div>
          <div className="space-y-2">
            {affectedTrains.map(train => (
              <div key={train.trainId} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white p-2.5">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-sm font-mono font-bold text-[var(--foreground)]">{train.trainId}</span>
                    <p className="text-xs text-[var(--muted-foreground)]">{train.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">{train.scheduledTime}</span>
                  {train.impact === 'INSIDE_BLOCK' && (
                    <Badge className="text-xs bg-[#D94B4510] text-[#D94B45] border border-[#D94B4530]">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Inside Block
                    </Badge>
                  )}
                  {train.impact === 'DELAYED' && (
                    <Badge className="text-xs bg-[#F28C1810] text-[#F28C18] border border-[#F28C1830]">
                      <Clock className="w-3 h-3 mr-1" /> +{train.delayMinutes}min
                    </Badge>
                  )}
                  {train.impact === 'CLEAR' && (
                    <Badge className="text-xs bg-[#18864B10] text-[#18864B] border border-[#18864B30]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Clear
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* ── Alternative Windows ── */}
      {alternatives.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
            Alternative Windows
          </h4>
          <div className="space-y-1.5">
            {alternatives.map((alt, i) => {
              const altImpact = alt.impact === 'LOW' ? impactConfig.Low : alt.impact === 'MEDIUM' ? impactConfig.Medium : impactConfig.High;
              return (
                <div key={i} className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
                  <span className="text-sm font-mono text-[var(--foreground)]">{alt.start}–{alt.end}</span>
                  <Badge className="text-xs" style={{ backgroundColor: altImpact.bg, color: altImpact.color, border: `1px solid ${altImpact.border}` }}>
                    {alt.impact} IMPACT
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* ── Why Selected ── */}
      {reasons.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#18864B]" />
            <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Why Selected
            </h4>
          </div>
          <div className="space-y-1.5">
            {reasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#18864B] flex-shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Planner Actions ── */}
      {showActions && !isApproved && (
        <>
          <Separator />
          <div className="flex items-center gap-3">
            {onReject && (
              <Button variant="outline" size="sm" className="text-xs text-[#D94B45] border-[#D94B4540] hover:bg-[#D94B4508]" onClick={onReject}>
                Reject
              </Button>
            )}
            {onModify && (
              <Button variant="outline" size="sm" className="text-xs" onClick={onModify}>
                Modify
              </Button>
            )}
            {onApprove && (
              <Button size="sm" className="text-xs ml-auto bg-[#18864B] hover:bg-[#156E3E] text-white gap-1.5" onClick={onApprove}>
                Approve Plan <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
