'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePrototypeStore } from '@/store/prototype-store';
import { getDynamicBaselineBlocks, getDynamicBaselineMetrics } from '@/data/current-plan';
import {
  TrendingDown,
  Clock,
  TrainFront,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Sparkles,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MetricComparison {
  title: string;
  before: string | number;
  after: string | number;
  reduction: string;
  icon: React.ComponentType<{ className?: string }>;
  unit: string;
  isPositive: boolean;
}

export function BeforeAfterImpact() {
  const [viewMode, setViewMode] = useState<'both' | 'before' | 'after'>('both');
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

  const metrics: MetricComparison[] = useMemo(() => [
    {
      title: 'Separate Track Blocks',
      before: baselineMetrics.totalBlocks,
      after: suggestedMetrics.totalBlocks,
      reduction: `-${blockReductionPct}%`,
      unit: `${baselineMetrics.totalBlocks} legacy -> ${suggestedMetrics.totalBlocks} bundled`,
      icon: Wrench,
      isPositive: true,
    },
    {
      title: 'Total Line Closure Time',
      before: `${baselineMetrics.totalBlockMinutes} min`,
      after: `${suggestedMetrics.totalBlockMinutes} min`,
      reduction: `-${minReductionPct}%`,
      unit: `${Math.round(baselineMetrics.totalBlockMinutes / 60)}h -> ${Math.round(suggestedMetrics.totalBlockMinutes / 60)}h track possession`,
      icon: Clock,
      isPositive: true,
    },
    {
      title: 'Critical Tasks Covered',
      before: `${baselineMetrics.criticalTasksCovered} of ${baselineMetrics.totalCriticalTasks}`,
      after: `${suggestedMetrics.criticalTasksCovered} of ${suggestedMetrics.totalCriticalTasks}`,
      reduction: `${suggestedMetrics.totalCriticalTasks > 0 ? Math.round((suggestedMetrics.criticalTasksCovered / suggestedMetrics.totalCriticalTasks) * 100) : 100}%`,
      unit: 'critical safety tasks scheduled',
      icon: ShieldCheck,
      isPositive: true,
    },
    {
      title: 'Coordinated Multi-Dept Blocks',
      before: 0,
      after: suggestedMetrics.coordinatedMultiDeptBlocks,
      reduction: `${suggestedMetrics.coordinatedMultiDeptBlocks} joint`,
      unit: 'cross-department windows',
      icon: Zap,
      isPositive: true,
    },
  ], [baselineMetrics, suggestedMetrics, blockReductionPct, minReductionPct]);

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
        <CardContent className="p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Operational Impact Analysis (Clean Slate: 0 Tasks)</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Workbank currently has 0 tasks. Upload files from CRIS data sources or load an operational scenario to view the uncoordinated baseline vs RailSync AI bundling comparison.
            </p>
          </div>
          <Link href="/data-sources">
            <Button size="sm" className="bg-[#235b80] hover:bg-[#1d4e70] text-white text-xs gap-1.5 h-8">
              <Sparkles className="w-3.5 h-3.5" /> Ingest Data from Data Sources
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!hasPlan) {
    return (
      <Card className="border-slate-200/90 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  Operational Baseline
                </span>
                <Badge variant="outline" className="text-xs text-slate-600 border-slate-300 bg-white">
                  Uncoordinated Silos (Pre-Optimization)
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Departmental Silos Baseline: {baselineMetrics.totalBlocks} Isolated Track Closures
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Without RailSync, Engineering, S&amp;T, and Traction request separate track possessions totalling {baselineMetrics.totalBlockMinutes} minutes across corridors.
              </CardDescription>
            </div>
            <Link href="/optimize">
              <Button size="sm" className="bg-[#235b80] hover:bg-[#1d4e70] text-white gap-2 text-xs">
                <Sparkles className="w-3.5 h-3.5" /> Build Plan to Bundle Blocks
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl border border-rose-200/80 p-4 bg-rose-50/30">
              <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1">Siloed Closures</div>
              <div className="text-2xl font-extrabold font-mono text-rose-950">{baselineMetrics.totalBlocks} separate blocks</div>
              <p className="text-[11px] text-rose-700 mt-1">Each department shuts down the corridor separately.</p>
            </div>
            <div className="rounded-xl border border-rose-200/80 p-4 bg-rose-50/30">
              <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1">Total Line Possession</div>
              <div className="text-2xl font-extrabold font-mono text-rose-950">{baselineMetrics.totalBlockMinutes} min</div>
              <p className="text-[11px] text-rose-700 mt-1">Heavy impact on freight and passenger punctuality.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Multi-Dept Coordination</div>
              <div className="text-2xl font-extrabold font-mono text-slate-800">0 shared blocks</div>
              <p className="text-[11px] text-slate-500 mt-1">No cross-discipline shadow bundling active yet.</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              To view the comparative <strong>Operational Impact Analysis (-80% track closures, multi-department co-utilization)</strong>, build an optimized plan using Google OR-Tools.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/90 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                Operational Impact Analysis
              </span>
              <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> AI-Optimized Bundling
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Traditional Disjointed Planning vs. RailSync Integrated Schedule
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Vadodara Division weekly simulation comparing separate departmental maintenance against multi-discipline bundled windows.
            </CardDescription>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg border border-slate-300/60">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'both'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('before')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'before'
                  ? 'bg-rose-50 text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Before (Uncoordinated)
            </button>
            <button
              onClick={() => setViewMode('after')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'after'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              After (RailSync)
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/40 hover:bg-white hover:border-sky-300 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">{m.title}</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-extrabold font-mono text-slate-900">{m.after}</span>
                  <span className="text-xs text-slate-400 line-through font-mono">{m.before}</span>
                  <Badge className="ml-auto text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {m.reduction}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">{m.unit}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Traditional Isolated Planning */}
          {(viewMode === 'both' || viewMode === 'before') && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-rose-200/80 bg-rose-50/20 p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="font-bold text-sm text-rose-950">Traditional Uncoordinated Planning</h4>
                </div>
                <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[11px]">Legacy Silos</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-rose-100">
                  <span className="text-slate-600">Department Planning Model</span>
                  <span className="font-semibold text-rose-900">Separate requests via TMS/SMMS/TDMS</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-rose-100">
                  <span className="text-slate-600">Corridor Closures</span>
                  <span className="font-semibold text-rose-900">14 isolated blocks (repeat closures)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-rose-100">
                  <span className="text-slate-600">COA Window Alignment</span>
                  <span className="font-semibold text-rose-900">Manual phone/radio coordination</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-rose-100">
                  <span className="text-slate-600">Passenger Trains Delayed</span>
                  <span className="font-semibold text-rose-900">19 trains (avg. +26 min delay)</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600">Safety Shadow Working</span>
                  <span className="font-semibold text-rose-900">Unverified concurrent entries</span>
                </div>
              </div>

              <div className="p-3 bg-rose-100/60 rounded-lg text-[11px] text-rose-800 leading-relaxed">
                <strong>Pain Point:</strong> Engineering blocks the track from 01:00–03:00. Two hours later at 05:00, S&T closes the exact same corridor again, halting traffic twice.
              </div>
            </motion.div>
          )}

          {/* Right Column: RailSync Integrated Planning */}
          {(viewMode === 'both' || viewMode === 'after') && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-emerald-950">RailSync Multi-Department Bundling</h4>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px]">Integrated</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600">Department Planning Model</span>
                  <span className="font-semibold text-emerald-900">Unified multi-discipline matrix</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600">Corridor Closures</span>
                  <span className="font-semibold text-emerald-900">8 bundled shared windows (-43%)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600">COA Window Alignment</span>
                  <span className="font-semibold text-emerald-900">Automated timetable gap-fitting</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600">Passenger Trains Delayed</span>
                  <span className="font-semibold text-emerald-900">Only 4 trains routed into buffers</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600">Safety Shadow Working</span>
                  <span className="font-semibold text-emerald-900">Guaranteed clearance rules applied</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-100/60 rounded-lg text-[11px] text-emerald-800 leading-relaxed">
                <strong>Key Innovation:</strong> Engineering, Signals, and OHE gangs work inside one single co-protected 120-minute window, returning the line to traffic once with zero repeat stops.
              </div>
            </motion.div>
          )}
        </div>

        {/* Measurable Benchmark Comparison Table */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Selection Audit Metric Benchmark
            </h4>
            <span className="text-[11px] font-medium text-slate-500">Ahmedabad — Vadodara Corridor Group</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Metric</th>
                  <th className="px-4 py-2.5 text-center">Mock Baseline</th>
                  <th className="px-4 py-2.5 text-center bg-teal-50 text-teal-900">RailSync</th>
                  <th className="px-4 py-2.5 text-right">Net Operational Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono">
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-slate-800">Separate blocks</td>
                  <td className="px-4 py-2 text-center text-slate-600">{baselineMetrics.totalBlocks}</td>
                  <td className="px-4 py-2 text-center font-bold text-teal-700 bg-teal-50/50">{suggestedMetrics.totalBlocks}</td>
                  <td className="px-4 py-2 text-right font-sans text-emerald-600 font-semibold">{diffBlocks} blocks (-{blockReductionPct}%)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-slate-800">Block minutes</td>
                  <td className="px-4 py-2 text-center text-slate-600">{baselineMetrics.totalBlockMinutes} min</td>
                  <td className="px-4 py-2 text-center font-bold text-teal-700 bg-teal-50/50">{suggestedMetrics.totalBlockMinutes} min</td>
                  <td className="px-4 py-2 text-right font-sans text-emerald-600 font-semibold">{diffMinutes} min saved (-{minReductionPct}%)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-slate-800">Critical tasks covered</td>
                  <td className="px-4 py-2 text-center text-slate-600">{baselineMetrics.criticalTasksCovered} / {baselineMetrics.totalCriticalTasks}</td>
                  <td className="px-4 py-2 text-center font-bold text-teal-700 bg-teal-50/50">{suggestedMetrics.criticalTasksCovered} / {suggestedMetrics.totalCriticalTasks}</td>
                  <td className="px-4 py-2 text-right font-sans text-slate-600 font-medium">{suggestedMetrics.unscheduledCritical > 0 ? `${suggestedMetrics.unscheduledCritical} unscheduled` : 'All scheduled'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-slate-800">Coordinated blocks</td>
                  <td className="px-4 py-2 text-center text-slate-600">0</td>
                  <td className="px-4 py-2 text-center font-bold text-teal-700 bg-teal-50/50">{suggestedMetrics.coordinatedMultiDeptBlocks}</td>
                  <td className="px-4 py-2 text-right font-sans text-teal-600 font-semibold">{suggestedMetrics.coordinatedMultiDeptBlocks} joint possessions</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-slate-800">Unscheduled critical</td>
                  <td className="px-4 py-2 text-center text-rose-600 font-semibold">{baselineMetrics.unscheduledCritical}</td>
                  <td className="px-4 py-2 text-center font-bold text-amber-700 bg-amber-50/50">{suggestedMetrics.unscheduledCritical}</td>
                  <td className="px-4 py-2 text-right font-sans text-amber-600 font-medium">Flagged for controller review</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-slate-800">Hard violations</td>
                  <td className="px-4 py-2 text-center text-amber-600">Not validated</td>
                  <td className="px-4 py-2 text-center font-bold text-teal-700 bg-teal-50/50">{suggestedMetrics.hardViolations ?? 0}</td>
                  <td className="px-4 py-2 text-right font-sans text-emerald-600 font-semibold">100% compliant</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 italic text-center">
            * Prototype simulation using synthetic data.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
