'use client';

import React from 'react';
import { Database, Network, Cpu, CalendarCheck, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PipelineArchitectureDiagram() {
  const stages = [
    {
      step: '01',
      title: '3 Department Silos',
      icon: Database,
      badge: 'Inputs',
      color: '#235b80',
      description: '35 backlogged tasks from Civil, S&T, and TRD with differing deadlines & equipment.',
      pills: ['Civil / P-Way (15)', 'Signals & Telecom (12)', 'Traction Power (8)'],
    },
    {
      step: '02',
      title: 'Network Constraints',
      icon: Network,
      badge: 'Rules',
      color: '#926514',
      description: 'Aligning with 21 live train timetable gaps (COA) across 5 track sections.',
      pills: ['COA Train Timetables', 'Track Kilometre Bounds', 'Crew Rest Hours'],
    },
    {
      step: '03',
      title: 'Combinatorial Bundler',
      icon: Cpu,
      badge: 'NP-Hard Solver',
      color: '#6D4AFF',
      description: 'Evaluates >1.4 × 10¹⁴ scheduling permutations in 1.8s to bundle compatible shadow blocks.',
      pills: ['Shadow-Block Pairing', 'Safety Interlocks', 'Conflict Pruning'],
    },
    {
      step: '04',
      title: 'Synchronized Plan',
      icon: CalendarCheck,
      badge: 'Output',
      color: '#15803D',
      description: 'Generates 5 consolidated block possessions for Chief Controller sign-off.',
      pills: ['5 Bundled Blocks', '-58% Closures', '100% Safety Compliance'],
    },
  ];

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System Architecture &amp; Workflow
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            The RailSync Optimization Pipeline
          </h3>
        </div>
        <Badge className="bg-slate-900 text-white font-mono text-xs px-3 py-1">
          Automated Clustering in 1.8s
        </Badge>
      </div>

      {/* Grid of Stages with Flow Arrows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              className="relative flex flex-col justify-between rounded-xl border-2 border-slate-200/90 bg-slate-50/50 p-5 hover:border-slate-300 transition-colors"
            >
              {/* Step indicator */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    STAGE {stage.step}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-wide border"
                    style={{ color: stage.color, borderColor: `${stage.color}40`, backgroundColor: `${stage.color}10` }}
                  >
                    {stage.badge}
                  </Badge>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="p-2 rounded-lg text-white shadow-xs"
                    style={{ backgroundColor: stage.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {stage.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {stage.description}
                </p>
              </div>

              {/* Tag Pills */}
              <div className="space-y-1.5 pt-3 border-t border-slate-200/70">
                {stage.pills.map((pill) => (
                  <div
                    key={pill}
                    className="text-[11px] font-medium bg-white text-slate-700 px-2.5 py-1 rounded border border-slate-200/80 flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{pill}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Banner */}
      <div className="mt-8 rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            <strong>Deterministic Safety:</strong> RailSync never forces tasks to bundle unless track distance, power shutdown clearance, and machine margins are strictly satisfied.
          </span>
        </div>
        <span className="font-bold text-emerald-800 shrink-0">
          Complies with Indian Railways General Rules (GR)
        </span>
      </div>
    </div>
  );
}
