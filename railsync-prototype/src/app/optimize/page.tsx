'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePrototypeStore } from '@/store/prototype-store';
import { optimizationSteps } from '@/lib/mock-service';
import { ClipboardList, CalendarDays, Users, ShieldCheck, CheckCircle2, ArrowRight, Loader2, CalendarPlus, ChevronDown, ChevronUp, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { PipelineArchitectureDiagram } from '@/components/visualizations/pipeline-architecture-diagram';

export default function OptimizePage() {
  const router = useRouter();
  const { tasks, windows, planStatus, runOptimization } = usePrototypeStore();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const alreadyBuilt = planStatus !== 'BASELINE' && planStatus !== 'OPTIMIZING';

  const dynamicInputs = [
    { label: 'Maintenance tasks', value: tasks.length, note: 'From TMS, SMMS, TDMS', icon: ClipboardList },
    { label: 'Possible time slots', value: windows.length, note: 'Across five track sections', icon: CalendarDays },
    { label: 'Crews & equipment', value: 15, note: 'Engineering, S&T, TRD', icon: Users },
    { label: 'Planning rules', value: 7, note: 'Hard constraints & safety rules', icon: ShieldCheck },
  ];

  async function handleBuild() {
    if (isRunning) return;
    setIsRunning(true);
    try {
      for (let i = 0; i < optimizationSteps.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      await runOptimization();
      router.push('/plan');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div>
      <Topbar title="Build a plan" description="Group suitable tasks into shared maintenance times." />
      <div className="page-content space-y-6">
        <div className="stat-grid">
          {dynamicInputs.map(({ label, value, note, icon: Icon }) => (
            <div key={label} className="stat-tile">
              <div className="stat-label">
                {label}
                <Icon size={17} />
              </div>
              <p className="stat-value">{value}</p>
              <p className="stat-note">{note}</p>
            </div>
          ))}
        </div>

        {/* Collapsible Architecture & Pipeline Diagram */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setShowArchitecture((prev) => !prev)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/70 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Network className="w-4 h-4 text-teal-700" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                System Pipeline Architecture &amp; CP-SAT Formulation
              </span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                {showArchitecture ? 'Hide Diagram' : 'Show Diagram'}
              </span>
            </div>
            {showArchitecture ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {showArchitecture && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/30">
              <PipelineArchitectureDiagram />
            </div>
          )}
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Constraint-Based Block Optimization</h2>
              <p>Evaluating {tasks.length} active tasks across {windows.length} available operating windows</p>
            </div>
            <span className="demo-label bg-teal-100 text-teal-800 border-teal-300">CP-SAT Engine</span>
          </div>
          <div className="p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">What goes into the plan?</h2>
              <ol className="space-y-5 text-sm text-slate-700">
                {[
                  ['Active workbank requirements', `Pulls ${tasks.length} tasks with priority scores, durations, and state needs.`],
                  ['Operating train windows', `Matches against ${windows.length} candidate slots across 5 track corridors.`],
                  ['Multi-department shadow clustering', 'Pairs compatible Engineering, Signal & TRD work in single track closures.'],
                ].map(([title, text], i) => (
                  <li key={title} className="flex gap-3">
                    <span className="step-number mt-0.5">{i + 1}</span>
                    <div>
                      <strong className="font-medium text-slate-900">{title}</strong>
                      <p className="text-slate-600 mt-1 leading-relaxed">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 flex flex-col justify-center">
              {isRunning ? (
                <div role="status" aria-live="polite">
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-[#235b80]" />
                    <h2 className="font-semibold">Solving constraints via CP-SAT…</h2>
                  </div>
                  <Progress value={((currentStep + 1) / optimizationSteps.length) * 100} className="mb-5" aria-label="Plan progress" />
                  <ul className="space-y-2">
                    {optimizationSteps.map((step, i) => (
                      <li key={step} className={`flex gap-2 items-center text-sm ${i <= currentStep ? 'text-slate-800' : 'text-slate-600'}`}>
                        <CheckCircle2 size={15} className={i < currentStep ? 'text-emerald-700' : 'text-slate-500'} />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : alreadyBuilt ? (
                <div>
                  <CheckCircle2 className="text-emerald-700 w-7 h-7 mb-3" />
                  <h2 className="text-lg font-semibold">Plan Generated ({tasks.length} tasks evaluated)</h2>
                  <p className="text-sm text-slate-600 mt-2 mb-5">
                    Your suggested schedule is ready. If you added new tasks or changed datasets, click <strong>Re-run Optimizer</strong> below to compute an updated schedule.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button render={<Link href="/plan" />} className="bg-[#235b80] hover:bg-[#1d4e70] text-white">
                      View suggested plan <ArrowRight size={16} />
                    </Button>
                    <Button variant="outline" className="border-teal-500 text-teal-900 hover:bg-teal-50" onClick={handleBuild}>
                      Re-run Optimizer with Current Inputs
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <CalendarPlus className="text-[#235b80] w-7 h-7 mb-3" />
                  <h2 className="text-lg font-semibold">Ready to generate plan</h2>
                  <p className="text-sm text-slate-600 mt-2 mb-5 leading-relaxed">
                    Runs constraint-based block planning to co-utilize windows across Engineering, S&amp;T, and Traction.
                  </p>
                  <Button className="h-10 px-5 bg-[#235b80] hover:bg-[#1d4e70] text-white" onClick={handleBuild}>
                    Generate Coordinated Plan <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
        <p className="section-note">Decision-Support Prototype: OR-Tools recommends. Gemini explains. The planner decides. All assignments are verified by independent safety and compatibility rule checks.</p>
      </div>
    </div>
  );
}

