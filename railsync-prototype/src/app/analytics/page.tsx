'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/app-shell/topbar';
import { Button } from '@/components/ui/button';
import { usePrototypeStore } from '@/store/prototype-store';
import { getDynamicBaselineBlocks } from '@/data/current-plan';
import { normalPlan } from '@/data/optimized-plan';
import { summarizeBlocks } from '@/lib/plan-summary';
import { formatDuration } from '@/lib/format';
import { ArrowRight, Info } from 'lucide-react';
import { KpiImpactVisual } from '@/components/visualizations/kpi-impact-visual';

export default function AnalyticsPage() {
  const { tasks, windows, plan } = usePrototypeStore();
  const baselineBlocks = useMemo(() => getDynamicBaselineBlocks(tasks, windows), [tasks, windows]);

  const baseline = useMemo(() => {
    const criticalTasks = tasks.filter((t) => t.priorityBand === 'Critical');
    const criticalInBlocks = baselineBlocks.filter((b) => {
      const t = tasks.find((tk) => tk.id === b.taskId);
      return t?.priorityBand === 'Critical';
    });

    return {
      blockCount: baselineBlocks.length,
      totalMinutes: baselineBlocks.reduce((acc, b) => acc + b.durationMin, 0),
      criticalPlanned: criticalInBlocks.length,
      criticalTotal: criticalTasks.length,
      sharedBlocks: 0,
      taskCount: baselineBlocks.length,
    };
  }, [baselineBlocks, tasks]);

  const shownPlan = plan || normalPlan;
  const suggested = useMemo(() => summarizeBlocks(shownPlan.blocks), [shownPlan.blocks]);

  const rows = [
    { label: 'Separate blocks', before: baseline.blockCount, after: suggested.blockCount, meaning: 'Number of separate maintenance blocks requested vs bundled' },
    { label: 'Block minutes', before: `${baseline.totalMinutes.toLocaleString()} min`, after: `${suggested.totalMinutes.toLocaleString()} min`, meaning: 'Total track closure minutes across corridor network' },
    { label: 'Critical tasks covered', before: `${baseline.criticalPlanned} / ${baseline.criticalTotal}`, after: `${suggested.criticalPlanned} / ${suggested.criticalTotal}`, meaning: 'Urgent fracture repairs and relay inspections scheduled' },
    { label: 'Coordinated blocks', before: baseline.sharedBlocks, after: suggested.sharedBlocks, meaning: 'Joint multi-department windows sharing single corridor block' },
    { label: 'Unscheduled critical', before: Math.max(0, baseline.criticalTotal - baseline.criticalPlanned), after: Math.max(0, suggested.criticalTotal - suggested.criticalPlanned), meaning: 'Critical safety tasks left pending without a slot' },
    { label: 'Independent rule violations', before: 'Not validated', after: `${shownPlan.metrics?.hardViolations ?? 0}`, meaning: 'Verified by decoupled constraint & safety rule engine' },
  ];

  const corridorIds = useMemo(() => [...new Set([...baselineBlocks.map((b) => b.corridorId), ...shownPlan.blocks.map((b) => b.corridorId)])], [baselineBlocks, shownPlan.blocks]);

  const corridors = useMemo(() => corridorIds.map((id) => {
    const current = baselineBlocks.filter((b) => b.corridorId === id);
    const proposed = shownPlan.blocks.filter((b) => b.corridorId === id);
    return {
      id,
      name: current[0]?.corridorName || proposed[0]?.corridorName || id,
      before: current.reduce((sum, b) => sum + b.durationMin, 0),
      after: proposed.reduce((sum, b) => sum + b.durationMin, 0),
    };
  }), [corridorIds, baselineBlocks, shownPlan.blocks]);

  const maxMinutes = Math.max(1, ...corridors.flatMap((c) => [c.before, c.after]));

  return (
    <div>
      <Topbar title="Results" description="Compare the work included in each sample plan." />
      <div className="page-content space-y-6">
        <section className="page-intro">
          <div><div className="eyebrow">{plan ? 'Current demo plan' : 'Example results · Build a plan to try it'}</div><h2>See what changes with shared planning.</h2><p>These totals come from the blocks shown in the demo. Use them to explain the plan and the work that still needs a time slot.</p></div>
          <Button render={<Link href={plan ? '/plan' : '/optimize'} />} className="h-10 px-4">{plan ? 'Review the plan' : 'Build a plan'}<ArrowRight size={16} /></Button>
        </section>

        {/* Visual KPI Impact Comparison */}
        <KpiImpactVisual />

        <div className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 flex gap-3 text-sm text-teal-900">
          <Info size={18} className="shrink-0 mt-0.5 text-teal-700" /><p>Decision-support comparison: Totals are dynamically derived from baseline departmental requests and optimizer block assignments. Recommended blocks are verified by the independent safety rule engine.</p>
        </div>
        <div className="stat-grid">
          {[
            { label: 'Suggested closures', value: suggested.blockCount, note: `${baseline.blockCount} in the current plan` },
            { label: 'Time in listed blocks', value: formatDuration(suggested.totalMinutes), note: `${formatDuration(baseline.totalMinutes)} in the current plan` },
            { label: 'Tasks with a slot', value: suggested.taskCount, note: 'In the suggested plan' },
            { label: 'Shared blocks', value: suggested.sharedBlocks, note: 'More than one department' },
          ].map(stat => <div key={stat.label} className="stat-tile"><div className="stat-label">{stat.label}</div><p className="stat-value">{stat.value}</p><p className="stat-note">{stat.note}</p></div>)}
        </div>
        <section className="panel">
          <div className="panel-heading"><div><h2>Current and suggested plans</h2><p>Calculated from the sample blocks and task list</p></div><span className="demo-label">Demo data</span></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600"><tr><th className="px-5 py-3 font-medium">Measure</th><th className="px-5 py-3 font-medium text-right">Current plan</th><th className="px-5 py-3 font-medium text-right">Suggested plan</th><th className="px-5 py-3 font-medium">What it means</th></tr></thead>
              <tbody>{rows.map(row => <tr key={row.label} className="border-b border-slate-100 last:border-0"><th className="px-5 py-4 font-medium text-slate-900">{row.label}</th><td className="px-5 py-4 text-right tabular-nums text-slate-700">{row.before}</td><td className="px-5 py-4 text-right tabular-nums font-semibold text-[#235b80]">{row.after}</td><td className="px-5 py-4 text-xs text-slate-600">{row.meaning}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 italic">
            * Prototype simulation using synthetic data.
          </div>
        </section>
        <div className="dashboard-columns">
          <section className="panel">
            <div className="panel-heading"><div><h2>Time by track section</h2><p>Total minutes in the listed blocks</p></div></div>
            <div className="p-5 space-y-6">
              {corridors.map(corridor => <div key={corridor.id}><p className="text-sm font-medium text-slate-800 mb-3">{corridor.name}</p><div className="space-y-2">{[{ label: 'Current', value: corridor.before, color: '#738596' }, { label: 'Suggested', value: corridor.after, color: '#235b80' }].map(bar => <div key={bar.label} className="flex items-center gap-3 text-xs text-slate-600"><span className="w-16">{bar.label}</span><div className="h-2 flex-1 bg-slate-100 rounded-sm overflow-hidden"><div className="h-full" style={{ width: `${bar.value / maxMinutes * 100}%`, backgroundColor: bar.color }} /></div><span className="w-14 text-right tabular-nums">{bar.value} min</span></div>)}</div></div>)}
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading"><h2>What to check before approval</h2></div>
            <div className="p-5 space-y-5 text-sm text-slate-700 leading-relaxed">
              <div><h3 className="font-semibold text-slate-900 mb-1">Work still waiting</h3><p>Open the suggested plan to see tasks without a time slot and the reason shown for each.</p></div>
              <div><h3 className="font-semibold text-slate-900 mb-1">Time and crew needs</h3><p>Each task needs enough time, suitable equipment, and an available crew.</p></div>
              <div><h3 className="font-semibold text-slate-900 mb-1">Changes to the schedule</h3><p>Try a schedule change in the demo, then review the updated plan.</p></div>
              <Link href="/plan" className="text-link">Open suggested plan <ArrowRight size={14} /></Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

