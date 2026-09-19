'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ComplexityModalProps { open: boolean; onOpenChange: (open: boolean) => void }

export function ComplexityModal({ open, onOpenChange }: ComplexityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">How RailSync works</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">One plan for track, signal, and power maintenance.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm leading-relaxed text-slate-700">
          {[
            ['1. Bring the tasks together', 'Review what each department needs to do, how long it takes, and when it is due.'],
            ['2. Find a suitable time', 'Look for a gap in train movements with enough time, the right crew, and the required equipment.'],
            ['3. Share a track closure', 'Group tasks that can be done together. A “block” is the time reserved for that work.'],
            ['4. Let the planner decide', 'Review the suggested blocks, change the plan if needed, then approve it.'],
          ].map(([title, description]) => <div key={title}><h3 className="font-semibold text-slate-900 mb-1">{title}</h3><p>{description}</p></div>)}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-1">Why planning takes care</h3>
            <p>Tasks need different crews, equipment, and track conditions. A late train can change the time available, so a plan may need another review.</p>
          </div>
          <p className="text-xs text-slate-600 border-t pt-4">This prototype uses sample data and preset results to show the workflow. Live railway connections and automatic rule checks are planned work.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

