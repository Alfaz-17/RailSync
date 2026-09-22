'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
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

const metrics: MetricComparison[] = [
  {
    title: 'Separate Track Blocks',
    before: 14,
    after: 8,
    reduction: '-43%',
    unit: 'blocks requested',
    icon: Wrench,
    isPositive: true,
  },
  {
    title: 'Total Line Closure Time',
    before: '25.5 hrs',
    after: '15.5 hrs',
    reduction: '-39%',
    unit: 'hours of track closure',
    icon: Clock,
    isPositive: true,
  },
  {
    title: 'Delayed Passenger Trains',
    before: 19,
    after: 4,
    reduction: '-79%',
    unit: 'trains delayed',
    icon: TrainFront,
    isPositive: true,
  },
  {
    title: 'Joint Department Blocks',
    before: '0%',
    after: '75%',
    reduction: '+75%',
    unit: 'co-scheduled work',
    icon: Zap,
    isPositive: true,
  },
];

export function BeforeAfterImpact() {
  const [viewMode, setViewMode] = useState<'both' | 'before' | 'after'>('both');

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
      </CardContent>
    </Card>
  );
}
