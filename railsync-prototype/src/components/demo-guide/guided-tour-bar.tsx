'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutiveSummaryModal } from './executive-summary-modal';

const steps = [
  { route: '/dashboard', title: 'Overview', note: 'Start with the work that needs to be planned this week.' },
  { route: '/data-sources', title: 'Data sources', note: 'See the sample inputs used in this demo.' },
  { route: '/tasks', title: 'Tasks', note: 'Review tasks, deadlines, and the people or equipment needed.' },
  { route: '/current-plan', title: 'Current plan', note: 'See how separate department plans lead to repeated track closures.' },
  { route: '/optimize', title: 'Build a plan', note: 'Load a sample plan that groups work into shared time slots.' },
  { route: '/plan', title: 'Review', note: 'Open a block, try a schedule change, then approve or revise the plan.' },
  { route: '/analytics', title: 'Results', note: 'Compare the sample plans. All figures shown are for the demo.' },
];

export function GuidedTourBar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const stepIndex = Math.max(0, steps.findIndex((step) => step.route === pathname));
  const next = steps[stepIndex + 1];
  return (
    <>
      <section className="demo-guide" aria-label="Demo walkthrough">
        <div className="demo-guide-summary">
          <button className="guide-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="demo-guide-details">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            <strong>Demo guide</strong><span>{stepIndex + 1} of {steps.length}</span>
          </button>
          <span className="guide-current">{steps[stepIndex].title}</span>
          <button className="guide-notes" onClick={() => setShowNotes(true)}><FileText size={14} /> Presenter notes</button>
        </div>
        {expanded && (
          <div id="demo-guide-details" className="demo-guide-details">
            <nav aria-label="Demo steps" className="guide-steps">
              {steps.map((step, index) => <Link key={step.route} href={step.route} aria-current={index === stepIndex ? 'step' : undefined} className={index === stepIndex ? 'is-active' : ''}><span>{index + 1}</span>{step.title}</Link>)}
            </nav>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">{steps[stepIndex].note}</p>
              {next && (
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={next.route} />}
                  className="border-slate-700 bg-slate-800/90 text-slate-100 hover:bg-slate-700"
                >
                  Next: {next.title}
                  <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
      <ExecutiveSummaryModal open={showNotes} onOpenChange={setShowNotes} />
    </>
  );
}

