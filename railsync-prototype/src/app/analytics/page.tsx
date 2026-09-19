'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePrototypeStore } from '@/store/prototype-store';
import { baselineMetrics } from '@/data/current-plan';
import { normalPlan } from '@/data/optimized-plan';
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { planStatus, plan } = usePrototypeStore();

  const currentMetrics = plan?.metrics || normalPlan.metrics;
  const isPlanActive = Boolean(plan);

  const blockDiff = currentMetrics.totalBlocks - baselineMetrics.totalBlocks;
  const blockPercentChange = Math.round(((currentMetrics.totalBlocks - baselineMetrics.totalBlocks) / baselineMetrics.totalBlocks) * 100);

  const minDiff = currentMetrics.totalBlockMinutes - baselineMetrics.totalBlockMinutes;
  const minPercentChange = Math.round(((currentMetrics.totalBlockMinutes - baselineMetrics.totalBlockMinutes) / baselineMetrics.totalBlockMinutes) * 100);
  const hoursSaved = (Math.abs(minDiff) / 60).toFixed(1);

  const coverageDiff = currentMetrics.criticalTasksCovered - baselineMetrics.criticalTasksCovered;
  const coordinationGain = currentMetrics.coordinatedMultiDeptBlocks - baselineMetrics.coordinatedMultiDeptBlocks;

  const corridorComparison = [
    { corridor: 'C001: Ahmedabad → Nadiad', baselineBlocks: 3, optimizedBlocks: 2, baselineMin: 270, optimizedMin: 210, savingMin: 60 },
    { corridor: 'C002: Nadiad → Vadodara', baselineBlocks: 4, optimizedBlocks: 2, baselineMin: 420, optimizedMin: 240, savingMin: 180 },
    { corridor: 'C003: Vadodara → Surat', baselineBlocks: 4, optimizedBlocks: 2, baselineMin: 465, optimizedMin: 240, savingMin: 225 },
    { corridor: 'C004: Surat → Mumbai Central', baselineBlocks: 4, optimizedBlocks: 3, baselineMin: 345, optimizedMin: 270, savingMin: 75 },
    { corridor: 'C005: Mumbai Central → Churchgate', baselineBlocks: 3, optimizedBlocks: 3, baselineMin: 270, optimizedMin: 270, savingMin: 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB]">
      <Topbar title="Analytics & Operational Impact" />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner with Simulation Notice */}
        <div className="bg-gradient-to-r from-[#0F2744] to-[#1E3E62] rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-slate-700/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#245F8E] hover:bg-[#245F8E] text-white border-none text-[11px]">
                {isPlanActive ? `Scenario: ${plan?.scenario || 'Optimized'}` : 'Projected Model vs Baseline'}
              </Badge>
              <Badge variant="outline" className="text-slate-300 border-slate-600 text-[11px]">
                WR Vadodara Division
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Optimization Yield & Efficiency Analytics
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Comparative analysis demonstrating the impact of cross-departmental block consolidation,
              traffic-window matching, and prioritized execution over legacy isolated planning.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/plan">
              <Button size="sm" className="bg-[#245F8E] hover:bg-[#1E3E62] text-white gap-1.5 border border-white/10">
                View Plan Timeline <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Primary Impact Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm hover:border-[#245F8E]/40 transition-colors">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Blocks Needed</span>
                <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0F2744]">{currentMetrics.totalBlocks}</span>
                <span className="text-sm font-medium text-slate-400 line-through">from {baselineMetrics.totalBlocks}</span>
              </div>
              <div className="mt-2 flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                <TrendingDown className="w-3 h-3 mr-1 inline" />
                {Math.abs(blockPercentChange)}% reduction ({Math.abs(blockDiff)} fewer track occupations)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:border-[#245F8E]/40 transition-colors">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Block Hours</span>
                <div className="p-1.5 bg-sky-50 rounded-md text-sky-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0F2744]">
                  {(currentMetrics.totalBlockMinutes / 60).toFixed(1)}h
                </span>
                <span className="text-sm font-medium text-slate-400 line-through">
                  {(baselineMetrics.totalBlockMinutes / 60).toFixed(1)}h
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs font-medium text-sky-700 bg-sky-50 w-fit px-2 py-0.5 rounded">
                <TrendingDown className="w-3 h-3 mr-1 inline" />
                {hoursSaved} hrs saved ({Math.abs(minPercentChange)}% traffic disruption cut)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:border-[#245F8E]/40 transition-colors">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Tasks Covered</span>
                <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {currentMetrics.criticalTasksCovered}/{currentMetrics.totalCriticalTasks}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  100%
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs font-medium text-emerald-700">
                <TrendingUp className="w-3 h-3 mr-1 inline" />
                +{coverageDiff} critical task guaranteed vs {baselineMetrics.criticalTasksCovered}/{baselineMetrics.totalCriticalTasks} fragmented
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:border-[#245F8E]/40 transition-colors">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Multi-Dept Synergy</span>
                <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0F2744]">
                  {currentMetrics.coordinatedMultiDeptBlocks}
                </span>
                <span className="text-sm font-medium text-slate-400">joint blocks</span>
              </div>
              <div className="mt-2 flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 w-fit px-2 py-0.5 rounded">
                <Zap className="w-3 h-3 mr-1 inline" />
                +{coordinationGain} unified cross-departmental operations
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Before vs After Comparison Matrix */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#0F2744]">
                  Baseline vs Optimized Comparison Matrix
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Direct evaluation of key operational metrics across the 7-day planning horizon.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs text-[#245F8E] border-[#245F8E]/30 bg-[#245F8E]/5">
                Validated Solver Metrics
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Metric / KPI</th>
                    <th className="py-3 px-5 text-center">Baseline (Fragmented)</th>
                    <th className="py-3 px-5 text-center">RailSync Recommended</th>
                    <th className="py-3 px-5 text-center">Net Impact / Variance</th>
                    <th className="py-3 px-5 text-right">Operational Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Total Track Blocks Required</td>
                    <td className="py-3.5 px-5 text-center font-mono font-medium text-slate-600">{baselineMetrics.totalBlocks}</td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-700">{currentMetrics.totalBlocks}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        -33.3% (-6 blocks)
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-600">
                      Less dispatcher overhead and fewer speed restriction ramp-ups.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Total Block Minutes Occupied</td>
                    <td className="py-3.5 px-5 text-center font-mono font-medium text-slate-600">1,620 min (27.0h)</td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-700">1,080 min (18.0h)</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        -33.3% (-540 min)
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-600">
                      9 hours of corridor capacity released back for freight & passenger paths.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Critical Task Coverage</td>
                    <td className="py-3.5 px-5 text-center font-mono font-medium text-amber-700">5 / 6 (83.3%)</td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-700">6 / 6 (100%)</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        +16.7% (100% coverage)
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-600">
                      Zero overdue safety risks; all mandatory inspections scheduled.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Coordinated Multi-Dept Blocks</td>
                    <td className="py-3.5 px-5 text-center font-mono font-medium text-slate-500">0</td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-indigo-700">{currentMetrics.coordinatedMultiDeptBlocks}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                        +4 Joint Operations
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-600">
                      Eng + Signal + Traction work performed simultaneously during single shadow window.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Unscheduled Critical Tasks</td>
                    <td className="py-3.5 px-5 text-center font-mono font-medium text-red-600">1 task (Unmet)</td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-700">0 tasks</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Resolved
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-600">
                      Eliminated regulatory non-compliance penalty risks.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Hard Constraint Violations</td>
                    <td className="py-3.5 px-5 text-center text-xs text-slate-500">Unverified / Ad-hoc</td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-700">0</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Zero Violations
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-600">
                      Guaranteed compliance with crew rest, power isolation & distance rules.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Visual Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Corridor Breakdown & Efficiency Chart */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#0F2744]">
                Corridor Block Time Comparison (Minutes)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Total track occupation time per corridor: Fragmented (Navy) vs Optimized (Sky Blue)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {corridorComparison.map((item) => {
                const maxVal = 500;
                const baselineWidth = Math.min(100, Math.round((item.baselineMin / maxVal) * 100));
                const optWidth = Math.min(100, Math.round((item.optimizedMin / maxVal) * 100));

                return (
                  <div key={item.corridor} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.corridor}</span>
                      <span className="text-slate-500 font-mono">
                        {item.savingMin > 0 ? (
                          <span className="text-emerald-700 font-bold">-{item.savingMin} min saved</span>
                        ) : (
                          <span className="text-slate-400">Neutral</span>
                        )}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Baseline Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-16 text-right">Baseline</span>
                        <div className="flex-1 bg-slate-100 rounded h-3 overflow-hidden">
                          <div
                            className="bg-[#0F2744] h-full rounded transition-all duration-500"
                            style={{ width: `${baselineWidth}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-600 w-12 text-right">{item.baselineMin}m</span>
                      </div>

                      {/* Optimized Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-16 text-right">RailSync</span>
                        <div className="flex-1 bg-slate-100 rounded h-3 overflow-hidden">
                          <div
                            className="bg-[#245F8E] h-full rounded transition-all duration-500"
                            style={{ width: `${optWidth}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#245F8E] w-12 text-right">{item.optimizedMin}m</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-end gap-5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#0F2744]" />
                  <span className="text-slate-600">Baseline (Fragmented)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#245F8E]" />
                  <span className="text-slate-600">RailSync Recommended</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Departmental Workload & Safety Compliance */}
          <Card className="bg-white border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#0F2744]">
                  Operational Benefits & Constraint Guarantees
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  System safety invariants and qualitative benefits delivered by automated solving.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Zero Rule Collisions</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Ensures strict adherence to Rule R-007 (5km spatial buffer between track machines) and Rule R-008
                      (Mandatory OHE isolation when high-reach tower wagon operates under traction wires).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-sky-50/60 border border-sky-100">
                  <Zap className="w-5 h-5 text-[#245F8E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dynamic Schedule Regrouping (COA Resiliency)</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      When live freight congestion or unexpected track issues close an authorized window,
                      the system shifts bundled blocks in under 2 seconds without violating crew duty rosters.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
                  <Layers className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Cross-Department Coordination Shadowing</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Signal point machine inspections (SIG-001) are automatically slotted concurrently
                      with heavy Engineering track tamping (ENG-001), consuming zero additional revenue train paths.
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Quick navigation actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Status: {planStatus}</span>
              <div className="flex items-center gap-2">
                <Link href="/current-plan">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Baseline Plan
                  </Button>
                </Link>
                <Link href="/plan">
                  <Button size="sm" className="bg-[#245F8E] hover:bg-[#1E3E62] text-white text-xs">
                    Inspect Timetable
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Prototype Disclaimer Banner */}
        <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700">Prototype Disclaimer:</span>{' '}
            This analytics view reflects an illustrative prototype simulation using synthetic Western Railway divisional data.
            Real-world deployments integrate with COA (Control Office Application), TMS, and FOIS live telemetry feeds.
          </div>
        </div>
      </main>
    </div>
  );
}
