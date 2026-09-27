'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Cpu, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

interface ComplexityModalProps { open: boolean; onOpenChange: (open: boolean) => void }

export function ComplexityModal({ open, onOpenChange }: ComplexityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Cpu size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">How RailSync Works</DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                AI & Constraint-Powered Block Planning for Indian Railways
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300 mt-2">
          {[
            {
              num: '1',
              title: 'Ingest Multi-Department Workbank',
              desc: 'Collects all pending maintenance tasks from Track Engineering, S&T (Signals), and TRD (Overhead electric wires) in one place.',
              icon: Users,
            },
            {
              num: '2',
              title: 'Identify Safe Train Gaps',
              desc: 'Analyzes timetables to identify "candidate windows" where trains do not run, ensuring passenger operations are not disrupted.',
              icon: ShieldCheck,
            },
            {
              num: '3',
              title: 'Google OR-Tools Mathematical Optimization',
              desc: 'Runs a CP-SAT constraint solver on our Python backend. In 35ms, it tests combinations to bundle multiple departments into the same window.',
              icon: Cpu,
            },
            {
              num: '4',
              title: 'Human-in-the-Loop Review & Sign-Off',
              desc: 'The railway controller reviews the plan, inspects AI explanations for any unscheduled jobs, makes adjustments, and approves it for COA dispatch.',
              icon: CheckCircle2,
            },
          ].map((item) => (
            <div key={item.num} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/30">
                {item.num}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-normal">{item.desc}</p>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-200">
            <span className="font-bold text-emerald-300">Live Mathematical Solver: </span>
            Unlike static prototypes, RailSync runs a live Python CP-SAT solver on port 8787 that enforces real constraints (machine availability, corridor capacity, power shutdown, and window duration).
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
