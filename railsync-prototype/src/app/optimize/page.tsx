'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePrototypeStore } from '@/store/prototype-store';
import { optimizationSteps } from '@/lib/mock-service';
import { ClipboardList, CalendarDays, Users, ShieldCheck, CheckCircle2, ArrowRight, Loader2, CalendarPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const inputs = [
  { label: 'Maintenance tasks', value: 35, note: 'From three departments', icon: ClipboardList },
  { label: 'Possible time slots', value: 21, note: 'Across five track sections', icon: CalendarDays },
  { label: 'Crews & equipment', value: 15, note: 'In the sample data', icon: Users },
  { label: 'Planning rules', value: 12, note: 'Examples for the demo', icon: ShieldCheck },
];

export default function OptimizePage() {
  const router = useRouter();
  const { planStatus, runOptimization } = usePrototypeStore();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const alreadyBuilt = planStatus !== 'BASELINE' && planStatus !== 'OPTIMIZING';

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
          {inputs.map(({ label, value, note, icon: Icon }) => <div key={label} className="stat-tile"><div className="stat-label">{label}<Icon size={17} /></div><p className="stat-value">{value}</p><p className="stat-note">{note}</p></div>)}
        </div>
        <section className="panel">
          <div className="panel-heading"><div><h2>Weekly planning</h2><p>15–21 September 2026 · Five track sections</p></div><span className="demo-label">Simulated run</span></div>
          <div className="p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">What goes into the plan?</h2>
              <ol className="space-y-5 text-sm text-slate-700">
                {[
                  ['Work that needs attention', 'Check task priority, deadlines, and time needed.'],
                  ['A suitable time and crew', 'Match work to train gaps, people, and equipment.'],
                  ['Tasks that can share a block', 'Bring compatible work together for planner review.'],
                ].map(([title, text], i) => <li key={title} className="flex gap-3"><span className="step-number mt-0.5">{i + 1}</span><div><strong className="font-medium text-slate-900">{title}</strong><p className="text-slate-600 mt-1 leading-relaxed">{text}</p></div></li>)}
              </ol>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 flex flex-col justify-center">
              {isRunning ? (
                <div role="status" aria-live="polite">
                  <div className="flex items-center gap-2 mb-4"><Loader2 className="w-5 h-5 animate-spin text-[#235b80]" /><h2 className="font-semibold">Preparing the demo plan…</h2></div>
                  <Progress value={(currentStep + 1) / optimizationSteps.length * 100} className="mb-5" aria-label="Plan progress" />
                  <ul className="space-y-2">{optimizationSteps.map((step, i) => <li key={step} className={`flex gap-2 items-center text-sm ${i <= currentStep ? 'text-slate-800' : 'text-slate-600'}`}><CheckCircle2 size={15} className={i < currentStep ? 'text-emerald-700' : 'text-slate-500'} />{step}</li>)}</ul>
                </div>
              ) : alreadyBuilt ? (
                <div><CheckCircle2 className="text-emerald-700 w-7 h-7 mb-3" /><h2 className="text-lg font-semibold">Your plan is ready</h2><p className="text-sm text-slate-600 mt-2 mb-5">Open the plan to review blocks, make changes, or approve it.</p><Button render={<Link href="/plan" />}>View suggested plan <ArrowRight size={16} /></Button></div>
              ) : (
                <div><CalendarPlus className="text-[#235b80] w-7 h-7 mb-3" /><h2 className="text-lg font-semibold">Ready to build the plan</h2><p className="text-sm text-slate-600 mt-2 mb-5 leading-relaxed">This demo loads a preset schedule so you can try the review and approval steps.</p><Button className="h-10 px-5" onClick={handleBuild}>Build demo plan <ArrowRight size={16} /></Button></div>
              )}
            </div>
          </div>
        </section>
        <p className="section-note">The planning steps are simulated. A live scheduling service and automatic rule checks are planned for a future version.</p>
      </div>
    </div>
  );
}

