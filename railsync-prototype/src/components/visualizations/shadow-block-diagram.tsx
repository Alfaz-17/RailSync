'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, Clock, Zap, Wrench, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ShadowBlockDiagram() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'interactive'>('comparison');
  const [showAnimated, setShowAnimated] = useState(false);

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-white tracking-tight flex items-center gap-2">
              Visual Guide: What is &ldquo;Shadow Blocking&rdquo;?
            </h3>
            <p className="text-xs text-slate-300">
              How RailSync eliminates 58% of railway track shutdowns by bundling department silos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'comparison'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Before vs After
          </button>
          <button
            onClick={() => setActiveTab('interactive')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'interactive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Bundle Simulation
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8">
        {activeTab === 'comparison' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Traditional Siloed Planning */}
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50/40 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">
                      Traditional Siloed Planning
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-bold text-rose-700 border-rose-300 bg-rose-100/60">
                    3 Disruptions
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Engineering, Signal, and Traction plan maintenance independently. The same track section is shut down 3 separate times across the week.
                </p>

                {/* Visual Timelines */}
                <div className="space-y-3.5 mb-6">
                  {/* Engineering */}
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#235b80] flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" /> Engineering (Track Renewal)
                      </span>
                      <span className="font-mono font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Tue · 01:00 - 04:30 (210 min)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded flex items-center px-2 relative overflow-hidden">
                      <div className="w-[65%] h-4 bg-[#235b80] text-white text-[10px] font-bold rounded flex items-center justify-center">
                        Track Shutdown #1
                      </div>
                    </div>
                  </div>

                  {/* Signal */}
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#926514] flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5" /> Signal & Telecom (Point Machine)
                      </span>
                      <span className="font-mono font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Wed · 02:00 - 04:00 (120 min)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded flex items-center px-2 relative overflow-hidden">
                      <div className="w-[45%] ml-[15%] h-4 bg-[#926514] text-white text-[10px] font-bold rounded flex items-center justify-center">
                        Track Shutdown #2
                      </div>
                    </div>
                  </div>

                  {/* Traction */}
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#14736d] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Traction (OHE Isolators)
                      </span>
                      <span className="font-mono font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Fri · 01:30 - 04:00 (150 min)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded flex items-center px-2 relative overflow-hidden">
                      <div className="w-[50%] ml-[20%] h-4 bg-[#14736d] text-white text-[10px] font-bold rounded flex items-center justify-center">
                        Track Shutdown #3
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Impact Footer */}
              <div className="border-t border-rose-200/80 pt-3.5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-rose-600" /> Total Line Possession:
                </span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  480 min across 3 separate halts
                </span>
              </div>
            </div>

            {/* 2. RailSync Shadow Blocking */}
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">
                      RailSync Synchronized Shadow Block
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-bold text-emerald-800 border-emerald-300 bg-emerald-100/70">
                    1 Single Shared Window
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  RailSync bundles Signal and Traction work inside Engineering&rsquo;s heavy track renewal block. All 3 teams work simultaneously during a single train timetable gap.
                </p>

                {/* Visual Bundled Timeline */}
                <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-sm space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Master Track Closure: Corridor KM 384-398
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                      Tue · 01:00 - 04:30 (210 min)
                    </span>
                  </div>

                  {/* Synchronized Stack */}
                  <div className="space-y-2 pt-1">
                    {/* Primary Block */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[11px] font-semibold text-slate-600 truncate">Civil Track:</span>
                      <div className="flex-1 bg-slate-100 h-6 rounded flex items-center px-1">
                        <div className="w-[100%] h-4 bg-[#235b80] text-white text-[10px] font-bold rounded flex items-center justify-center">
                          Primary Work: 01:00 - 04:30 (210 min)
                        </div>
                      </div>
                    </div>

                    {/* Shadow Block 1 */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[11px] font-semibold text-emerald-800 truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Signal:
                      </span>
                      <div className="flex-1 bg-slate-100 h-6 rounded flex items-center px-1">
                        <div className="w-[60%] ml-[8%] h-4 bg-[#926514] text-white text-[10px] font-bold rounded flex items-center justify-center shadow-xs">
                          ⚡ Shadow Block: 01:15 - 03:45
                        </div>
                      </div>
                    </div>

                    {/* Shadow Block 2 */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-[11px] font-semibold text-emerald-800 truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Traction:
                      </span>
                      <div className="flex-1 bg-slate-100 h-6 rounded flex items-center px-1">
                        <div className="w-[70%] ml-[15%] h-4 bg-[#14736d] text-white text-[10px] font-bold rounded flex items-center justify-center shadow-xs">
                          ⚡ Shadow Block: 01:30 - 04:15
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Impact Footer */}
              <div className="border-t border-emerald-300/80 pt-3.5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Total Line Possession:
                </span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  210 min (56% less downtime, 2 fewer track halts)
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Bundle Simulator */
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
            <div className="max-w-xl mx-auto space-y-4">
              <h4 className="font-bold text-slate-900 text-base">
                How 3 Incompatible Work Requests Become 1 Safe Window
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click below to see RailSync check safety rules, verify distance clearance between civil machinery and overhead wires, and combine the schedule in real time.
              </p>

              <div className="py-4">
                <Button
                  onClick={() => setShowAnimated(!showAnimated)}
                  className="bg-[#235b80] hover:bg-[#1a4766] text-white font-bold text-xs gap-2 px-6"
                >
                  <Sparkles className="w-4 h-4" />
                  {showAnimated ? 'Reset Visualization' : 'Run Bundle Simulation'}
                </Button>
              </div>

              {showAnimated && (
                <div className="p-4 bg-white rounded-lg border border-slate-200 text-left space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Rule 1: Spatial Proximity Verified (Same Corridor KM 384-398)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Rule 2: OHE Power Cut synchronized with track tamping schedule
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Rule 3: Freight train passage scheduled at 04:45 without delay
                  </div>
                  <div className="mt-3 p-3 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900 font-medium">
                    🎯 Result: All 3 tasks executed in Block #101. Zero extra passenger train speed restrictions.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
