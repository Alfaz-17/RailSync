'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePrototypeStore } from '@/store/prototype-store';
import { tasks } from '@/data/tasks';
import { PlanBlock, Department, TrafficImpact } from '@/types/domain';
import { formatDuration, formatDateTime } from '@/lib/format';
import {
  CheckCircle2, AlertTriangle, XCircle, ShieldAlert, ArrowRight,
  Cpu, Loader2, Calendar, Clock, ChevronRight, Ban, RefreshCw, ThumbsUp, ThumbsDown,
  Lock, Download, Edit3, Save, RotateCcw, Check, Sparkles, SlidersHorizontal, TrainFront,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { optimizationSteps, reoptimizationSteps } from '@/lib/mock-service';
import { summarizeBlocks } from '@/lib/plan-summary';
import { affectedTrainsByBlock, alternativeWindowsByBlock } from '@/data/affected-trains';

const deptColors: Record<Department, { bg: string; border: string; text: string }> = {
  Engineering: { bg: '#245F8E15', border: '#245F8E40', text: '#245F8E' },
  Signal: { bg: '#94601615', border: '#94601640', text: '#946016' },
  Traction: { bg: '#14736D15', border: '#14736D40', text: '#14736D' },
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  RECOMMENDED: { label: 'Ready for your review', color: '#0F766E', bgColor: '#0F766E10', icon: CheckCircle2 },
  RECOMMENDED_V2: { label: 'Updated after the schedule change', color: '#0F766E', bgColor: '#0F766E10', icon: CheckCircle2 },
  STALE: { label: 'Schedule changed — update this plan', color: '#B91C1C', bgColor: '#B91C1C10', icon: AlertTriangle },
  APPROVED: { label: 'Approved by the planner', color: '#15803D', bgColor: '#15803D10', icon: CheckCircle2 },
  REJECTED: { label: 'Changes needed', color: '#B91C1C', bgColor: '#B91C1C10', icon: XCircle },
};

const rejectReasons = [
  'Resource conflict with other operations',
  'Traffic impact unacceptable',
  'Maintenance window too narrow',
  'Crew unavailable on scheduled day',
  'Other operational constraint',
];

function calculateDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 180;
  const startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  return Math.max(15, endMinutes - startMinutes);
}

export default function PlanPage() {
  const {
    planStatus,
    plan,
    approvedAt,
    rejectReason,
    simulateCoaChange,
    reoptimize,
    approvePlan,
    rejectPlan,
    modifyBlock,
    reopenPlan,
  } = usePrototypeStore();

  const [selectedBlock, setSelectedBlock] = useState<PlanBlock | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState('');
  const [isReoptimizing, setIsReoptimizing] = useState(false);
  const [reoptStep, setReoptStep] = useState(-1);

  // Edit drawer state
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editTraffic, setEditTraffic] = useState<TrafficImpact>('Low');
  const [editNotes, setEditNotes] = useState('');
  const [editTaskIds, setEditTaskIds] = useState<string[]>([]);

  const handleOpenBlock = useCallback((block: PlanBlock) => {
    setSelectedBlock(block);
    setIsEditingBlock(false);
    setEditStart(block.start);
    setEditEnd(block.end);
    setEditTraffic(block.trafficImpact);
    setEditNotes(block.plannerNotes || '');
    setEditTaskIds([...block.taskIds]);
  }, []);

  const handleSaveBlock = useCallback(() => {
    if (!selectedBlock) return;
    const dur = calculateDuration(editStart, editEnd);
    const updates: Partial<PlanBlock> = {
      start: editStart,
      end: editEnd,
      durationMin: dur,
      trafficImpact: editTraffic,
      plannerNotes: editNotes,
      taskIds: editTaskIds,
      isModified: true,
    };
    modifyBlock(selectedBlock.id, updates);
    setSelectedBlock((prev) => (prev ? { ...prev, ...updates } : null));
    setIsEditingBlock(false);
    toast.success(`Block ${selectedBlock.id} successfully updated by planner`);
  }, [selectedBlock, editStart, editEnd, editTraffic, editNotes, editTaskIds, modifyBlock]);

  const handleAdjustMinutes = useCallback((deltaMinutes: number) => {
    if (!editEnd) return;
    const [eh, em] = editEnd.split(':').map(Number);
    if (isNaN(eh) || isNaN(em)) return;
    let total = eh * 60 + em + deltaMinutes;
    if (total < 0) total += 24 * 60;
    total = total % (24 * 60);
    const nh = Math.floor(total / 60);
    const nm = total % 60;
    const newEnd = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
    setEditEnd(newEnd);
  }, [editEnd]);

  const handleReoptimize = useCallback(async () => {
    setIsReoptimizing(true);
    for (let i = 0; i < reoptimizationSteps.length; i++) {
      setReoptStep(i);
      await new Promise((r) => setTimeout(r, 400));
    }
    await reoptimize();
    setIsReoptimizing(false);
    setReoptStep(-1);
    toast.success('Plan re-optimized: Rescheduled around unavailable window');
  }, [reoptimize]);

  const handleApprove = useCallback(() => {
    approvePlan();
    toast.success('Demo plan approved');
  }, [approvePlan]);

  const handleReject = useCallback(() => {
    rejectPlan(selectedRejectReason);
    setShowRejectDialog(false);
    toast.error('Changes requested');
  }, [rejectPlan, selectedRejectReason]);

  const handleExportJson = useCallback(() => {
    if (!plan) return;
    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      planStatus,
      approvedAt,
      planner: 'Demo Railway Planner',
      metrics: plan.metrics,
      blocks: plan.blocks.map((b) => ({
        id: b.id,
        corridor: b.corridorName,
        window: `${b.start} - ${b.end}`,
        durationMinutes: b.durationMin,
        departments: b.departments,
        tasks: b.taskIds,
        trafficImpact: b.trafficImpact,
        isModified: b.isModified || false,
        plannerNotes: b.plannerNotes || null,
      })),
      unscheduled: plan.unscheduled,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RailSync_Plan_${planStatus}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Plan downloaded');
  }, [plan, planStatus, approvedAt]);

  // Group blocks by corridor
  const blocksByCorridor = useMemo(() => {
    if (!plan) return {};
    const acc: Record<string, PlanBlock[]> = {};
    plan.blocks.forEach((b) => {
      if (!acc[b.corridorId]) acc[b.corridorId] = [];
      acc[b.corridorId].push(b);
    });
    return acc;
  }, [plan]);

  // Empty state
  if (!plan || planStatus === 'BASELINE' || planStatus === 'OPTIMIZING') {
    return (
      <div>
        <Topbar title="Suggested plan" description="Build a plan to review suggested work times." />
        <div className="page-content">
          <Card className="border-slate-200 border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <Cpu className="w-12 h-12 text-[#526175] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No plan yet</h3>
              <p className="text-sm text-[#526175] mb-6">Start with Build a plan to load the suggested demo schedule.</p>
              <Link href="/optimize">
                <Button className="bg-[#235b80] hover:bg-[#1d4e70] text-white gap-2">
                  Build a plan <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const status = statusConfig[planStatus] || statusConfig.RECOMMENDED;
  const StatusIcon = status.icon;

  const summary = summarizeBlocks(plan.blocks);
  const isStale = planStatus === 'STALE';
  const isApproved = planStatus === 'APPROVED';
  const isRejected = planStatus === 'REJECTED';
  const canApprove = planStatus === 'RECOMMENDED' || planStatus === 'RECOMMENDED_V2';

  return (
    <div>
      <Topbar
        title="Suggested plan"
        description={`${plan.blocks.length} sample blocks · Review before approval.`}
      />

      <div className="page-content space-y-4">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 flex items-center justify-between shadow-sm"
          style={{ backgroundColor: status.bgColor, border: `1px solid ${status.color}35` }}
        >
          <div className="flex items-center gap-3">
            <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
            <div>
              <span className="text-sm font-bold block" style={{ color: status.color }}>
                {status.label}
              </span>
              <p className="text-xs text-[#526175] mt-0.5">
                {isApproved && 'This demo plan is approved. View the blocks or download a copy.'}
                {isRejected && 'Edit the blocks or update the plan, then review it again.'}
                {canApprove && 'Review the suggested work times, then approve the plan or make changes.'}
                {isStale && 'A work slot is no longer available. Update the plan before approval.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-xs bg-white text-slate-700 border border-slate-200">
              Demo plan
            </Badge>
          </div>
        </motion.div>

        {/* Approved Notification Card */}
        {isApproved && (
          <Alert className="border-emerald-300 bg-emerald-50/80 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
            <AlertDescription className="text-sm text-emerald-950">
              <div className="font-semibold text-emerald-900 mb-1">
                • Plan Status: Approved in this demo
              </div>
              <ul className="text-xs text-emerald-800 space-y-0.5 list-disc pl-4">
                <li>
                  Reviewed and signed off by <strong>Demo Railway Planner</strong>
                  {approvedAt ? ` at ${formatDateTime(approvedAt)}` : ''}.
                </li>
                <li>Reopen the plan if you need to make changes.</li>
                <li>Download a copy of the plan as a JSON file.</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Rejected Notification Card */}
        {isRejected && (
          <Alert className="border-rose-300 bg-rose-50/80 shadow-sm">
            <XCircle className="w-4 h-4 text-rose-600" />
            <AlertDescription className="text-sm text-rose-950">
              <div className="font-semibold text-rose-900 mb-1">
                • Plan Status: Changes requested by the planner
              </div>
              <ul className="text-xs text-rose-800 space-y-0.5 list-disc pl-4">
                <li>
                  Reason: <strong>{rejectReason || 'The schedule needs changes'}</strong>
                </li>
                <li>Open a block to change its time or expected effect on trains.</li>
                <li>Use &quot;Reopen Plan&quot; to restore approval controls, or &quot;Update plan&quot; for new windows.</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Stale Warning Card */}
        {isStale && (
          <Alert className="border-red-400 bg-red-50/90 shadow-md">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <AlertDescription className="text-sm text-red-950">
              <div className="font-bold text-red-900 text-base mb-1 flex items-center gap-2">
                <span>⚠ PLAN STALE</span>
                <Badge className="bg-red-200 text-red-900 border-red-300 text-xs">Operating conditions changed</Badge>
              </div>
              <p className="text-xs text-red-800 mb-2">
                The Control Office has marked window <strong>BW-001 (01:00–03:00)</strong> on <strong>Ahmedabad → Nadiad</strong> as <span className="font-bold text-red-900 uppercase">Unavailable</span> due to rake movement changes.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-red-950 bg-red-100/90 p-2.5 rounded-lg border border-red-200 mb-3">
                <span>• Affected Block: <strong>1 (BLOCK-001)</strong></span>
                <span>• Affected Maintenance Tasks: <strong>2 (ENG-001 Track Repair, SIG-001 Signal Inspection)</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-red-700 hover:bg-red-800 text-white font-bold gap-2 text-xs"
                  onClick={handleReoptimize}
                  disabled={isReoptimizing}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReoptimizing ? 'animate-spin' : ''}`} />
                  Re-optimize Plan Now
                </Button>
                <span className="text-xs text-red-700">
                  Preserves planner locks and moves tasks into next eligible candidate window.
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Re-optimization Progress */}
        <AnimatePresence>
          {isReoptimizing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card className="border-sky-300 bg-sky-50/40 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-900">Re-optimizing Plan against Updated Operating State…</span>
                  </div>
                  <div className="space-y-2">
                    {reoptimizationSteps.map((step, i) => (
                      <div key={step} className={`flex items-center gap-2.5 text-xs ${i < reoptStep ? 'text-emerald-800 font-semibold' : i === reoptStep ? 'text-sky-700 font-bold' : 'text-slate-400'}`}>
                        {i < reoptStep ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : i === reoptStep ? (
                          <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span>{step}... {i < reoptStep ? '✓' : ''}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid: Blocks Timeline vs Side Info */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4">
          {/* Timeline Blocks */}
          <div className="space-y-3">
            {Object.entries(blocksByCorridor).map(([corridorId, blocks]) => (
              <Card key={corridorId} className="border-slate-200">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-100 text-[#475569] px-2 py-0.5 rounded border border-slate-200">
                      {corridorId}
                    </span>
                    {blocks[0].corridorName}
                  </CardTitle>
                  <span className="text-xs text-slate-500 font-medium">
                    {blocks.length} {blocks.length === 1 ? 'window' : 'windows'} scheduled
                  </span>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {blocks.map((block) => {
                    const isBlockModified = block.isModified;
                    return (
                      <motion.div
                        key={block.id}
                        className={`rounded-lg border p-3.5 cursor-pointer transition-colors hover:border-slate-300 relative ${
                          isApproved
                            ? 'border-emerald-300/80 bg-emerald-50/15'
                            : isRejected
                            ? 'border-rose-300/80 bg-rose-50/15'
                            : isStale
                            ? 'bg-slate-50 border-slate-300'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => handleOpenBlock(block)}
                        role="button" tabIndex={0} aria-label={`View block ${block.id}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleOpenBlock(block); } }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#526175]" />
                            <span className="text-sm font-mono font-bold text-[#0F172A]">
                              {block.start} – {block.end}
                            </span>
                            <Badge variant="outline" className="text-xs font-semibold">
                              {formatDuration(block.durationMin)}
                            </Badge>
                            {isBlockModified && (
                              <Badge className="text-xs bg-amber-100 text-amber-900 border-amber-300 gap-1 hover:bg-amber-100">
                                <Edit3 className="w-2.5 h-2.5" /> Edited
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isApproved && (
                              <Badge className="text-xs bg-emerald-600 text-white gap-1 hover:bg-emerald-600">
                                <Lock className="w-2.5 h-2.5" /> Approved
                              </Badge>
                            )}
                            {isRejected && (
                              <Badge className="text-xs bg-rose-600 text-white gap-1 hover:bg-rose-600">
                                <AlertTriangle className="w-2.5 h-2.5" /> Needs changes
                              </Badge>
                            )}
                            <Badge className={`text-xs ${
                              block.trafficImpact === 'Low'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : block.trafficImpact === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {block.trafficImpact} Impact
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </div>
                        </div>

                        {/* Tasks in block */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {block.taskIds.map((taskId) => {
                            const task = tasks.find((t) => t.id === taskId);
                            const dept = task?.department || 'Engineering';
                            const colors = deptColors[dept];
                            return (
                              <div
                                key={taskId}
                                className="flex items-center gap-1.5 rounded px-2 py-0.5"
                                style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                              >
                                <span className="text-xs font-mono font-bold" style={{ color: colors.text }}>
                                  {taskId}
                                </span>
                                {task && (
                                  <span className="text-xs font-medium" style={{ color: colors.text }}>
                                    {task.title}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Department badges & planner notes */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <div className="flex gap-1">
                            {block.departments.map((d) => (
                              <Badge
                                key={d}
                                variant="outline"
                                className="text-xs"
                                style={{ color: deptColors[d].text, borderColor: deptColors[d].border }}
                              >
                                {d}
                              </Badge>
                            ))}
                          </div>
                          {block.plannerNotes && (
                            <span className="text-xs text-amber-700 italic truncate max-w-[280px]">
                              Note: {block.plannerNotes}
                            </span>
                          )}
                          <span className="text-xs text-[#14736D] hover:underline font-medium">
                            View details &rarr;
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Panel: Unscheduled + Actions */}
          <div className="space-y-3">
            {/* Quick Actions Card */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#14736D]" />
                  Plan actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start gap-2 border-slate-300"
                  onClick={handleExportJson}
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  Download plan (JSON)
                </Button>

                {(isApproved || isRejected) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start gap-2 text-slate-700 border-slate-300 hover:bg-slate-100"
                    onClick={() => {
                      reopenPlan();
                      toast.info('Plan restored to Recommended status for adjustments');
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    Reopen for editing
                  </Button>
                )}

                <Link href="/tasks" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start gap-2 text-slate-700 border-slate-300"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    View maintenance tasks ({tasks.length})
                  </Button>
                </Link>

                {canApprove && !isReoptimizing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-start gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={simulateCoaChange}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                    Simulate schedule change
                  </Button>
                )}

                {(isStale || isRejected) && !isReoptimizing && (
                  <Button
                    size="sm"
                    className="w-full text-xs justify-start gap-2 bg-[#235b80] hover:bg-[#1d4e70] text-white"
                    onClick={handleReoptimize}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Update plan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tasks without a time slot (Hard Constraints Enforced) */}
            <Card className="border-rose-200 bg-rose-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-rose-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-rose-600" />
                    Unscheduled Tasks
                  </span>
                  <Badge className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold hover:bg-rose-100">
                    {plan.unscheduled.length} Action Required
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-[11px] text-slate-600 leading-snug">
                  Hard constraints strictly enforced. RailSync never invents a fake or unsafe slot when corridor capacity is exceeded.
                </div>
                {plan.unscheduled.map((us) => {
                  const task = tasks.find((t) => t.id === us.taskId);
                  const requiredMin = us.requiredDurationMin || task?.durationMin || 180;
                  const largestMin = us.largestValidWindowMin || 120;
                  return (
                    <div key={us.taskId} className="bg-white rounded-lg border border-rose-200 p-3 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-900">{us.taskId}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[11px] text-rose-700 border-rose-300 bg-rose-50 font-bold">
                            UNSCHEDULED
                          </Badge>
                          <Badge variant="outline" className="text-[11px] text-slate-700">
                            P{task?.priorityScore || 58}
                          </Badge>
                        </div>
                      </div>

                      {task && (
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{task.title}</p>
                          <p className="text-[11px] text-slate-500">{task.corridorName}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-sans">Required Duration</span>
                          <span className="font-bold text-slate-800">{requiredMin} min</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-sans">Eligible Window</span>
                          <span className="font-bold text-rose-700">{largestMin} min max</span>
                        </div>
                      </div>

                      <div className="bg-rose-50/80 border border-rose-200 rounded p-2 text-xs">
                        <div className="flex items-center justify-between text-rose-900 font-bold text-[11px] mb-0.5">
                          <span>{us.reasonCode || 'NO_FEASIBLE_WINDOW'}</span>
                          <span className="text-[10px] font-medium text-rose-700 uppercase">Planner Action</span>
                        </div>
                        <p className="text-[11px] text-rose-800 leading-tight">{us.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Metrics Summary */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[#0F172A]">Demo summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Track closures', value: summary.blockCount },
                  { label: 'Minutes in blocks', value: `${summary.totalMinutes.toLocaleString()} min` },
                  { label: 'Critical tasks planned', value: `${summary.criticalPlanned}/${summary.criticalTotal}` },
                  { label: 'Shared blocks', value: summary.sharedBlocks },
                  { label: 'Automatic rule checks', value: 'Not connected' },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between text-xs py-0.5 border-b border-slate-100 last:border-0">
                    <span className="text-[#526175]">{m.label}</span>
                    <span className="font-semibold text-[#0F172A]">{m.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom spacer ensuring scroll content is never covered by the bottom bar */}
        {(canApprove || isApproved || isRejected) && !isReoptimizing && (
          <div className="h-28 w-full" aria-hidden="true" />
        )}

        {/* Fixed Docked Action Bar */}
        {/* 1. When in RECOMMENDED status */}
        {canApprove && !isReoptimizing && (
          <div
            className="fixed bottom-0 left-0 md:left-[232px] right-0 z-50 bg-[#ffffff] border-t-2 border-slate-300 shadow-[0_-8px_30px_rgba(15,23,42,0.18)] px-6 py-4"
            style={{ backgroundColor: '#ffffff', opacity: 1 }}
          >
            <div className="max-w-[1440px] mx-auto flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 tracking-tight">
                  Ready for your approval?
                </p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Review the blocks above, then approve the plan or request changes.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 font-semibold"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Request changes
                </Button>
                <Button
                  className="gap-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold shadow-md shadow-emerald-700/20 px-5"
                  onClick={handleApprove}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve plan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. When APPROVED */}
        {isApproved && (
          <div
            className="fixed bottom-0 left-0 md:left-[232px] right-0 z-50 bg-[#064E3B] text-white border-t-2 border-emerald-500 shadow-[0_-8px_30px_rgba(6,78,59,0.35)] px-6 py-4"
            style={{ backgroundColor: '#064E3B', opacity: 1 }}
          >
            <div className="max-w-[1440px] mx-auto flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Demo plan approved &amp; synchronized
                  </p>
                  <p className="text-xs font-medium text-emerald-200 mt-0.5">
                    Reviewed and signed off by the railway planner • Vadodara Division
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-500 text-xs font-medium"
                  onClick={() => {
                    reopenPlan();
                    toast.info('Plan unlocked for planner modifications');
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reopen plan
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold"
                  onClick={handleExportJson}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  Download plan (JSON)
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold"
                  render={<Link href="/analytics" />}
                >
                  View results <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 3. When REJECTED */}
        {isRejected && (
          <div
            className="fixed bottom-0 left-0 md:left-[232px] right-0 z-50 bg-[#881337] text-white border-t-2 border-rose-500 shadow-[0_-8px_30px_rgba(136,19,55,0.35)] px-6 py-4"
            style={{ backgroundColor: '#881337', opacity: 1 }}
          >
            <div className="max-w-[1440px] mx-auto flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div>
                  <p className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-300" /> Waiting for changes
                  </p>
                  <p className="text-xs font-medium text-rose-200 mt-0.5">
                    Reason: {rejectReason || 'Schedule conflict'} • Edit blocks or update the plan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-rose-800 hover:bg-rose-700 text-white border-rose-500 text-xs font-medium"
                  onClick={() => {
                    reopenPlan();
                    toast.info('Plan reopened for editing');
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reopen Plan
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-medium"
                  render={<Link href="/tasks" />}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  View tasks
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-white text-rose-950 hover:bg-rose-50 text-xs font-bold"
                  onClick={handleReoptimize}
                  disabled={isReoptimizing}
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-rose-700 ${isReoptimizing ? 'animate-spin' : ''}`} />
                  Update plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Detail & Edit Sheet */}
      <Sheet open={!!selectedBlock} onOpenChange={(open) => !open && setSelectedBlock(null)}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          {selectedBlock && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-base font-bold flex items-center gap-2">
                    {selectedBlock.id}
                    {selectedBlock.isModified && (
                      <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                        Modified
                      </Badge>
                    )}
                  </SheetTitle>
                  <Button
                    size="sm"
                    variant={isEditingBlock ? 'default' : 'outline'}
                    className={`text-xs gap-1.5 ${isEditingBlock ? 'bg-[#235b80] text-white' : ''}`}
                    onClick={() => setIsEditingBlock(!isEditingBlock)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingBlock ? 'View details' : 'Edit block'}
                  </Button>
                </div>
              </SheetHeader>

              {/* EDIT MODE */}
              {isEditingBlock ? (
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      Edit this block
                    </p>
                    <p className="text-xs text-amber-700">
                      Change the time, expected effect on trains, or your notes.
                    </p>
                  </div>

                  {/* Timing Inputs */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#0F172A] block">
                      Work time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">Start Time (HH:MM)</span>
                        <input
                          type="time"
                          aria-label="Block start time"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          className="w-full text-xs font-mono font-bold p-2 border border-slate-300 rounded-md focus:border-[#14736D] focus:ring-1 focus:ring-[#14736D] outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">End Time (HH:MM)</span>
                        <input
                          type="time"
                          aria-label="Block end time"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          className="w-full text-xs font-mono font-bold p-2 border border-slate-300 rounded-md focus:border-[#14736D] focus:ring-1 focus:ring-[#14736D] outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 font-mono">
                        Calculated: {formatDuration(calculateDuration(editStart, editEnd))}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                          onClick={() => handleAdjustMinutes(-30)}
                        >
                          -30m
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                          onClick={() => handleAdjustMinutes(30)}
                        >
                          +30m
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Traffic Impact */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A] block">
                      Expected effect on trains
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Low', 'Medium', 'High'] as TrafficImpact[]).map((impact) => (
                        <button
                          key={impact}
                          type="button"
                          onClick={() => setEditTraffic(impact)}
                          className={`p-2 rounded border text-xs font-medium transition-colors ${
                            editTraffic === impact
                              ? 'border-[#14736D] bg-[#14736D]/10 text-[#14736D] font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {impact}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Planner Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0F172A] block">
                      Planner notes
                    </label>
                    <textarea
                      aria-label="Planner notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="e.g., Added 30 minutes for crew travel."
                      rows={3}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:border-[#14736D] focus:ring-1 focus:ring-[#14736D] outline-none resize-none"
                    />
                  </div>

                  {/* Tasks Inclusion */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#0F172A] block">
                      Tasks Assigned to this Block
                    </label>
                    <div className="space-y-1.5">
                      {selectedBlock.taskIds.map((taskId) => {
                        const task = tasks.find((t) => t.id === taskId);
                        const isIncluded = editTaskIds.includes(taskId);
                        return (
                          <div
                            key={taskId}
                            onClick={() => {
                              if (isIncluded) {
                                if (editTaskIds.length === 1) {
                                  toast.error('Block must have at least one task');
                                  return;
                                }
                                setEditTaskIds(editTaskIds.filter((id) => id !== taskId));
                              } else {
                                setEditTaskIds([...editTaskIds, taskId]);
                              }
                            }}
                            className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-colors ${
                              isIncluded
                                ? 'border-green-300 bg-green-50/50 text-green-900'
                                : 'border-slate-200 bg-slate-50 text-slate-600 line-through'
                            }`}
                          >
                            <span className="font-mono font-semibold">{taskId}</span>
                            <span className="truncate max-w-[200px] text-xs">{task?.title}</span>
                            <Badge variant={isIncluded ? 'default' : 'outline'} className="text-xs">
                              {isIncluded ? 'Included' : 'Removed'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => setIsEditingBlock(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 text-xs bg-[#235b80] hover:bg-[#1d4e70] text-white gap-1.5"
                      onClick={handleSaveBlock}
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save changes
                    </Button>
                  </div>
                </div>
              ) : (
                /* READ-ONLY / RATIONALE MODE */
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#526175]" />
                    <span className="font-mono font-bold">{selectedBlock.start} – {selectedBlock.end}</span>
                    <Badge variant="outline" className="text-xs">{formatDuration(selectedBlock.durationMin)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#526175]" />
                    <span>{selectedBlock.corridorName}</span>
                  </div>

                  {selectedBlock.plannerNotes && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-0.5">Planner Notes:</p>
                      <p className="text-xs text-amber-800">{selectedBlock.plannerNotes}</p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="text-xs font-semibold text-[#0F172A] mb-2 tracking-normal">
                      Tasks in this block ({selectedBlock.taskIds.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedBlock.taskIds.map((taskId) => {
                        const task = tasks.find((t) => t.id === taskId);
                        const dept = task?.department || 'Engineering';
                        return (
                          <div key={taskId} className="rounded-lg border p-2.5" style={{ borderColor: deptColors[dept].border, backgroundColor: deptColors[dept].bg }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold" style={{ color: deptColors[dept].text }}>{taskId}</span>
                              <Badge variant="outline" className="text-xs" style={{ color: deptColors[dept].text, borderColor: deptColors[dept].border }}>{dept}</Badge>
                            </div>
                            {task && (
                              <p className="text-xs mt-1 font-medium" style={{ color: deptColors[dept].text }}>
                                {task.title} • {formatDuration(task.durationMin)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-xs font-semibold text-[#0F172A] mb-2 tracking-normal">
                      Why AI Shadowed These Works
                    </h4>
                    <div className="space-y-1.5">
                      {selectedBlock.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-800 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-[#0F172A]">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Affected Train Movements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 tracking-normal">
                        <TrainFront className="w-3.5 h-3.5 text-[#14736D]" />
                        Affected Train Movements ({(affectedTrainsByBlock[selectedBlock.id] || []).length})
                      </h4>
                      <Badge className={`text-[10px] ${
                        selectedBlock.trafficImpact === 'Low'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : selectedBlock.trafficImpact === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        Traffic Impact: {selectedBlock.trafficImpact}
                      </Badge>
                    </div>

                    {(affectedTrainsByBlock[selectedBlock.id] || []).length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-1">No conflicting train movements detected during this window.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {(affectedTrainsByBlock[selectedBlock.id] || []).map((train) => (
                          <div
                            key={train.trainId}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                              train.impact === 'INSIDE_BLOCK'
                                ? 'border-amber-200 bg-amber-50/60'
                                : train.impact === 'DELAYED'
                                ? 'border-rose-200 bg-rose-50/60'
                                : 'border-slate-200 bg-slate-50/50'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-900">{train.trainId}</span>
                                <span className="text-[11px] text-slate-500">({train.type})</span>
                              </div>
                              <p className="text-[11px] text-slate-600 truncate max-w-[220px]">{train.trainName}</p>
                              <p className="text-[10px] text-slate-500">Expected passage: <strong className="text-slate-800">{train.scheduledTime}</strong></p>
                            </div>
                            <div>
                              {train.impact === 'INSIDE_BLOCK' && (
                                <Badge className="text-[10px] bg-amber-200/80 text-amber-900 border-amber-300 gap-1 font-bold">
                                  <AlertTriangle className="w-3 h-3 text-amber-700" /> OVERLAPS BLOCK
                                </Badge>
                              )}
                              {train.impact === 'DELAYED' && (
                                <Badge className="text-[10px] bg-rose-200/80 text-rose-900 border-rose-300 gap-1 font-bold">
                                  <Clock className="w-3 h-3 text-rose-700" /> DELAYED {train.delayMinutes}m
                                </Badge>
                              )}
                              {train.impact === 'CLEAR' && (
                                <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300 gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> CLEAR
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Operational Disclaimer */}
                    <div className="mt-2.5 p-2.5 bg-slate-100/90 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 block mb-0.5 font-semibold">Control Office Coordination Principle:</strong>
                      Before approval, RailSync shows the affected train movements and alternative maintenance windows. It does not autonomously reschedule trains; train handling remains with the Control Office.
                    </div>
                  </div>

                  {/* Alternative Maintenance Windows */}
                  {(alternativeWindowsByBlock[selectedBlock.id] || []).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold text-[#0F172A] tracking-normal">
                            Alternative Maintenance Windows
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">Options Evaluated</span>
                        </div>
                        <div className="space-y-2">
                          {(alternativeWindowsByBlock[selectedBlock.id] || []).map((w, idx) => {
                            const isAlt0530 = w.start === '05:30';
                            return (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg border border-teal-200/80 bg-teal-50/40 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                                    <span className="font-mono font-bold text-xs text-slate-900">
                                      {w.start} – {w.end}
                                    </span>
                                  </div>
                                  <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300">
                                    Traffic Impact: {w.impact}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white/70 p-1.5 rounded border border-teal-100 font-mono">
                                  <div>Pass. Trains Affected: <strong className="text-slate-900">{isAlt0530 ? '0' : '1'}</strong></div>
                                  <div>Goods Movements: <strong className="text-slate-900">{isAlt0530 ? '1' : '2'}</strong></div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-xs h-7 border-teal-300 text-teal-800 hover:bg-teal-100/60 font-medium gap-1"
                                  onClick={() => {
                                    const dur = calculateDuration(w.start, w.end);
                                    const impactVal = (w.impact.charAt(0).toUpperCase() + w.impact.slice(1).toLowerCase()) as TrafficImpact;
                                    const updates: Partial<PlanBlock> = {
                                      start: w.start,
                                      end: w.end,
                                      durationMin: dur,
                                      trafficImpact: impactVal,
                                      isModified: true,
                                      plannerNotes: `Shifted to alternative window ${w.start}–${w.end} to reduce train impact.`,
                                    };
                                    setEditStart(w.start);
                                    setEditEnd(w.end);
                                    setEditTraffic(impactVal);
                                    setEditNotes(updates.plannerNotes || '');
                                    modifyBlock(selectedBlock.id, updates);
                                    setSelectedBlock((prev) => (prev ? { ...prev, ...updates } : null));
                                    toast.success(`Block ${selectedBlock.id} moved to alternative window ${w.start}–${w.end}`);
                                  }}
                                >
                                  <ArrowRight className="w-3 h-3 text-teal-600" />
                                  Shift to this Window ({w.start}–{w.end})
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <Button
                    variant="outline"
                    className="w-full text-xs gap-1.5 border-[#14736D]/30 text-[#14736D] hover:bg-[#14736D]/10"
                    onClick={() => setIsEditingBlock(true)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Modify This Block Window
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Maintenance Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-xs text-[#526175] mb-3">
              Please select the primary operational constraint requiring plan rejection:
            </p>
            {rejectReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRejectReason === reason ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reject-reason"
                  value={reason}
                  checked={selectedRejectReason === reason}
                  onChange={(e) => setSelectedRejectReason(e.target.value)}
                  className="accent-red-600"
                />
                <span className="text-sm font-medium text-[#0F172A]">{reason}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!selectedRejectReason}>
              Confirm Rejection & Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
