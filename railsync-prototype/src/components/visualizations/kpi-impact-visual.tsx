'use client';

import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingUp, CheckCircle2, Train, Clock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePrototypeStore } from '@/store/prototype-store';
import { getDynamicBaselineBlocks, getDynamicBaselineMetrics } from '@/data/current-plan';

export function KpiImpactVisual() {
  const { tasks, windows, plan } = usePrototypeStore();

  const baselineBlocks = useMemo(() => getDynamicBaselineBlocks(tasks, windows), [tasks, windows]);
  const baselineMetrics = useMemo(() => getDynamicBaselineMetrics(baselineBlocks, tasks), [baselineBlocks, tasks]);

  const suggestedMetrics = useMemo(() => {
    if (plan && plan.metrics) {
      return plan.metrics;
    }
    const critTotal = tasks.filter((t) => t.priorityBand === 'Critical').length;
    return {
      totalBlocks: 0,
      totalBlockMinutes: 0,
      criticalTasksCovered: 0,
      totalCriticalTasks: critTotal,
      coordinatedMultiDeptBlocks: 0,
      unscheduledCritical: critTotal,
      hardViolations: 0,
    };
  }, [plan, tasks]);

  const hasPlan = Boolean(plan && plan.blocks && plan.blocks.length > 0);
  const diffBlocks = hasPlan ? suggestedMetrics.totalBlocks - baselineMetrics.totalBlocks : 0;
  const blockReductionPct = (hasPlan && baselineMetrics.totalBlocks > 0)
    ? Math.round((Math.abs(diffBlocks) / baselineMetrics.totalBlocks) * 100)
    : 0;

  const diffMinutes = hasPlan ? suggestedMetrics.totalBlockMinutes - baselineMetrics.totalBlockMinutes : 0;
  const minReductionPct = (hasPlan && baselineMetrics.totalBlockMinutes > 0)
    ? Math.round((Math.abs(diffMinutes) / baselineMetrics.totalBlockMinutes) * 100)
    : 0;

  const metrics = [
    {
      title: 'Track Closure Events',
      baseline: `${baselineMetrics.totalBlocks} separate blocks`,
      railsync: `${suggestedMetrics.totalBlocks} bundled blocks`,
      change: `-${blockReductionPct}%`,
      isGood: true,
      icon: Train,
      detail: `Bundles maintenance into ${suggestedMetrics.totalBlocks} coordinated windows across active corridors.`,
    },
    {
      title: 'Total Line Possession Time',
      baseline: `${baselineMetrics.totalBlockMinutes.toLocaleString()} minutes`,
      railsync: `${suggestedMetrics.totalBlockMinutes.toLocaleString()} minutes`,
      change: `-${minReductionPct}%`,
      isGood: true,
      icon: Clock,
      detail: `Saves ${Math.abs(diffMinutes)} minutes of track shutdown time for freight & passenger operations.`,
    },
    {
      title: 'Critical Task Clearance',
      baseline: `${baselineMetrics.criticalTasksCovered} of ${baselineMetrics.totalCriticalTasks} planned`,
      railsync: `${suggestedMetrics.criticalTasksCovered} of ${suggestedMetrics.totalCriticalTasks} planned`,
      change: `${suggestedMetrics.totalCriticalTasks > 0 ? Math.round((suggestedMetrics.criticalTasksCovered / suggestedMetrics.totalCriticalTasks) * 100) : 100}%`,
      isGood: true,
      icon: ShieldCheck,
      detail: 'Priority track, signal, and traction maintenance secured before deadline.',
    },
    {
      title: 'Multi-Department Coordination',
      baseline: '0 shared blocks',
      railsync: `${suggestedMetrics.coordinatedMultiDeptBlocks} shared blocks`,
      change: `${suggestedMetrics.coordinatedMultiDeptBlocks}x`,
      isGood: true,
      icon: TrendingUp,
      detail: 'Civil, Signal, and Electrical crews share safe corridor windows simultaneously.',
    },
  ];

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            Empirical Performance Metrics
          </span>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            Impact Assessment: Siloed Planning vs RailSync
          </h3>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs px-3 py-1">
          Vadodara Division Simulation
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-2xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#235b80] shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> {m.change}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-3">{m.title}</h4>

                <div className="space-y-2 mb-4 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Before (Siloed):</span>
                    <span className="font-mono font-medium line-through text-rose-700">{m.baseline}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="text-emerald-800">RailSync:</span>
                    <span className="font-mono text-emerald-700 text-sm">{m.railsync}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed pt-2 border-t border-slate-200/80">
                {m.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
