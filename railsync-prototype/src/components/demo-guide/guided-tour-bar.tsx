'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowRight, Trophy, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutiveSummaryModal } from './executive-summary-modal';
import { RailwayGlossaryModal } from './railway-glossary-modal';

const steps = [
  {
    route: '/dashboard',
    stepNumber: 1,
    title: '1. Command Center',
    shortTitle: 'Overview',
    note: 'Overall maintenance planning situation across Vadodara Division.',
  },
  {
    route: '/data-sources',
    stepNumber: 2,
    title: '2. Data Sources',
    shortTitle: 'Data Sources',
    note: 'Where data comes from (TMS, SMMS, TDMS, COA) with explicit synthetic labelling.',
  },
  {
    route: '/tasks',
    stepNumber: 3,
    title: '3. Unified Workbank',
    shortTitle: 'Workbank',
    note: 'Engineering, S&T, and TRD requirements in one transparent planning layer with rule-based priority.',
  },
  {
    route: '/current-plan',
    stepNumber: 4,
    title: '4. Current / Baseline Plan',
    shortTitle: 'Current Plan',
    note: 'The problem before optimization: Separate-department planning causing repeated track closures.',
  },
  {
    route: '/optimize',
    stepNumber: 5,
    title: '5. AI Optimization',
    shortTitle: 'Optimizer',
    note: 'Real constraint solving: Google OR-Tools CP-SAT evaluates hard constraints in 35ms.',
  },
  {
    route: '/plan',
    stepNumber: 6,
    title: '6. Recommended Plan',
    shortTitle: 'Recommended Plan',
    note: 'Hero page: Coordinated blocks, decision evidence, affected train movements, and human planner sign-off.',
  },
  {
    route: '/analytics',
    stepNumber: 7,
    title: '7. Analytics & Revisions',
    shortTitle: 'Analytics',
    note: 'Before/after proof: 44% fewer closures, 420 min saved, plus full immutable audit history.',
  },
];

export function GuidedTourBar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [showPitchNotes, setShowPitchNotes] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const stepIndex = Math.max(0, steps.findIndex((step) => step.route === pathname));
  const currentStep = steps[stepIndex];
  const next = steps[(stepIndex + 1) % steps.length];

  return (
    <>
      <section className="demo-guide border-b border-slate-800 bg-slate-950/90 text-slate-100 backdrop-blur-md sticky top-0 z-30" aria-label="Demo walkthrough">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Left: Step indicator & easy toggle */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls="demo-guide-details"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>Hackathon Tour</span>
              <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded text-[11px] font-mono">
                {currentStep.stepNumber} of {steps.length}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-medium text-white">{currentStep.title}</span>
              <span className="text-xs text-slate-400">— {currentStep.note}</span>
            </div>
          </div>

          {/* Right: Quick action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700/80 transition-colors"
              onClick={() => setShowGlossary(true)}
              title="Look up railway terms in plain English"
            >
              <BookOpen size={13} />
              <span>📖 Railway Terms</span>
            </button>

            <button
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
              onClick={() => setShowPitchNotes(true)}
              title="3-minute pitch script with talking points"
            >
              <Trophy size={13} />
              <span>🏆 3-Min Pitch</span>
            </button>

            {next && next.route !== pathname && (
              <Button
                variant="outline"
                size="sm"
                render={<Link href={next.route} />}
                className="h-7 text-xs bg-sky-600 hover:bg-sky-500 text-white border-0 font-medium px-3 flex items-center gap-1.5 shadow-sm"
              >
                <span>Next: {next.shortTitle}</span>
                <ArrowRight size={13} />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Navigation Stepper */}
        {expanded && (
          <div id="demo-guide-details" className="px-4 py-3 bg-slate-900 border-t border-slate-800 sm:px-6">
            <nav aria-label="Demo steps" className="flex flex-wrap items-center gap-2 pb-2">
              {steps.map((step) => {
                const isActive = step.route === pathname;
                return (
                  <Link
                    key={step.route}
                    href={step.route}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white text-sky-700' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {step.stepNumber}
                    </span>
                    <span>{step.title}</span>
                  </Link>
                );
              })}
            </nav>
            <p className="mt-2 text-xs text-slate-300">
              <strong className="text-white">Current Focus: </strong>{currentStep.note}
            </p>
          </div>
        )}
      </section>

      {/* Modals */}
      <RailwayGlossaryModal open={showGlossary} onOpenChange={setShowGlossary} />
      <ExecutiveSummaryModal open={showPitchNotes} onOpenChange={setShowPitchNotes} />
    </>
  );
}
