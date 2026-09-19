'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ExecutiveSummaryModalProps { open: boolean; onOpenChange: (open: boolean) => void }

export function ExecutiveSummaryModal({ open, onOpenChange }: ExecutiveSummaryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Presenter notes</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">A short walkthrough for the demo.</DialogDescription>
        </DialogHeader>
        <ol className="space-y-5 text-sm text-slate-700 leading-relaxed">
          {[
            ['The problem', 'Departments plan maintenance separately. Some tasks could share a track closure if teams planned together.'],
            ['The idea', 'RailSync brings maintenance tasks and possible work times into one view. A railway planner reviews the suggested schedule.'],
            ['Show the tasks', 'Open Maintenance tasks. Filter by department and open a task to show its deadline and crew needs.'],
            ['Show the plan', 'Open Current plan, then Build a plan. Open a suggested block to explain which tasks share the time.'],
            ['Try a change', 'Select “Simulate schedule change” on the suggested plan. Show the warning, update the plan, and approve it.'],
            ['Explain the next step', 'This demo uses preset results. The next step is a working scheduling service, tested rules, and a pilot with railway planners.'],
          ].map(([title, description], i) => <li key={title} className="flex gap-3"><span className="step-number mt-0.5">{i + 1}</span><div><h3 className="font-semibold text-slate-900 mb-1">{title}</h3><p>{description}</p></div></li>)}
        </ol>
      </DialogContent>
    </Dialog>
  );
}

