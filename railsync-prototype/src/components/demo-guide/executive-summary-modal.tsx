'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock } from 'lucide-react';

interface ExecutiveSummaryModalProps { open: boolean; onOpenChange: (open: boolean) => void }

const HACKATHON_PITCH_STEPS = [
  {
    time: '0:00 - 0:45',
    title: '1. The Real Indian Railways Problem',
    screen: 'Current Plan (/current-plan)',
    script: 'Today, Track Engineering, Signal & Telecom (S&T), and Overhead Electrical (TRD) request track closures independently. This leads to 18 separate closures, 1,770 minutes of track disruption, and heavy train delays.',
    action: 'Show the 18 separate red closures on the Current Plan timeline.',
  },
  {
    time: '0:45 - 1:30',
    title: '2. The AI & Constraint Solver Engine',
    screen: 'AI Optimizer (/optimize)',
    script: 'RailSync uses Google OR-Tools CP-SAT solver running on Python FastAPI. In 35 milliseconds, it evaluates thousands of mathematical constraints to safely merge multi-department tasks into shared train gaps.',
    action: 'Click "Generate Coordinated Plan" live. Show the 35 ms solve time and 10 coordinated blocks.',
  },
  {
    time: '1:30 - 2:15',
    title: '3. Multi-Department "Piggybacking"',
    screen: 'Master Plan (/plan)',
    script: 'Notice Block BLK-001: RailSync put Track Maintenance, Signal Axle Counter testing, and OHE wire repair into the exact same 120-minute gap. One block, one power shutdown, three departments.',
    action: 'Click BLK-001 drawer to reveal the 3 coordinated tasks and safety clearances.',
  },
  {
    time: '2:15 - 2:45',
    title: '4. AI Explanation for Unscheduled Tasks',
    screen: 'Master Plan (/plan) - Unscheduled Drawer',
    script: 'When a task cannot fit, RailSync does not fail silently. Our AI explains in plain English why TSK-017 was not scheduled (BCM machine conflict) and gives actionable recommendations.',
    action: 'Scroll down to the Unscheduled Tasks section and point out the AI diagnosis.',
  },
  {
    time: '2:45 - 3:00',
    title: '5. Impact Proof & Official COA Export',
    screen: 'Analytics & COA Export (/analytics & /plan)',
    script: 'We reduced track closures by 44% (saving 420 minutes) and avoided delays for ~18 passenger trains. Finally, the plan exports directly to Indian Railways official COA JSON format.',
    action: 'Click "Approve Plan" followed by "Export COA JSON".',
  },
];

export function ExecutiveSummaryModal({ open, onOpenChange }: ExecutiveSummaryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">3-Minute Hackathon Demo Script</DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                Follow this exact script when presenting RailSync to judges and evaluators.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          {HACKATHON_PITCH_STEPS.map((step, i) => (
            <div
              key={step.title}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-white text-base">{step.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-slate-900 text-amber-400 border-amber-500/30 flex items-center gap-1">
                    <Clock size={11} /> {step.time}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-slate-900 text-sky-400 border-sky-500/30">
                    {step.screen}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200">
                  <span className="font-semibold text-sky-400">What to say: </span>
                  &ldquo;{step.script}&rdquo;
                </div>
                <div className="text-xs text-amber-300/90 pl-1 flex items-center gap-1.5">
                  <span className="font-semibold text-amber-400">Action on screen:</span>
                  <span>{step.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


