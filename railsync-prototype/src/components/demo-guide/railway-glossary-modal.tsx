'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search } from 'lucide-react';
import { useState } from 'react';

interface GlossaryTerm {
  term: string;
  category: 'Core Concepts' | 'Departments' | 'Technical & Safety';
  plainEnglish: string;
  analogy?: string;
  whyItMatters: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Maintenance Block (Track Possession)',
    category: 'Core Concepts',
    plainEnglish: 'Temporarily stopping train traffic on a specific track section so maintenance workers can safely step onto the tracks to do repairs.',
    analogy: 'Like closing a highway lane for road repairs so workers don’t get hit by cars.',
    whyItMatters: 'Safety rule: No worker is allowed on the track until the Station Master officially grants this block.',
  },
  {
    term: 'Coordinated Block (Piggybacking / Shadow Block)',
    category: 'Core Concepts',
    plainEnglish: 'The core superpower of RailSync: Merging Track, Signal, and Electric Wire crews into the same track closure at the exact same time.',
    analogy: 'Instead of closing a street 3 times (once for water pipes, once for electricity, once for paving), you do all 3 during one closure.',
    whyItMatters: 'Reduces train stoppage time by 30% to 50% across the division.',
  },
  {
    term: 'Candidate Window',
    category: 'Core Concepts',
    plainEnglish: 'A safe gap between scheduled passenger and freight trains where maintenance work can happen without causing train traffic jams.',
    analogy: 'Finding an empty 2-hour opening in a doctor’s busy calendar to clean the clinic.',
    whyItMatters: 'RailSync only schedules maintenance inside these verified gaps.',
  },
  {
    term: 'Corridor (e.g. C001, C002, C003)',
    category: 'Core Concepts',
    plainEnglish: 'A continuous section of railway track connecting major stations (e.g., C001 = Ahmedabad to Nadiad, C003 = Vadodara to Surat).',
    whyItMatters: 'Each corridor has its own train timetable and track capacity limits.',
  },
  {
    term: 'Engineering (ENG)',
    category: 'Departments',
    plainEnglish: 'The department responsible for steel rails, concrete sleepers, ballast stones, bridges, and heavy track machines (like BCM and Tamping machines).',
    whyItMatters: 'Keeps tracks aligned and safe for 130 km/h train speeds.',
  },
  {
    term: 'S&T (Signal & Telecom)',
    category: 'Departments',
    plainEnglish: 'The department responsible for electronic track sensors (axle counters), motorized track points, and red/green signals.',
    whyItMatters: 'Controls train movement safety. S&T must issue an official "Disconnection Notice" before any track work starts.',
  },
  {
    term: 'TRD / OHE (Traction Distribution)',
    category: 'Departments',
    plainEnglish: 'The department responsible for the 25,000-Volt overhead electric wires (OHE) that power electric locomotives.',
    whyItMatters: 'Requires an official "Power Block" (turning off the 25kV current) before workers can lift tower wagons or touch wires.',
  },
  {
    term: 'Disconnection Notice & Power Block',
    category: 'Technical & Safety',
    plainEnglish: 'Formal safety permits that turn off high-voltage electricity and freeze railway signals so workers cannot be electrocuted or hit by trains.',
    whyItMatters: 'RailSync automatically verifies whether a task needs a power shutdown or signal disconnection before approving the block.',
  },
  {
    term: 'CP-SAT Solver (Google OR-Tools)',
    category: 'Technical & Safety',
    plainEnglish: 'The open-source mathematical engine running in our Python backend. It evaluates thousands of schedule combinations in 35 milliseconds.',
    whyItMatters: 'Mathematically proves that zero safety rules are broken and finds the optimal schedule instantly.',
  },
  {
    term: 'COA (Control Office Application)',
    category: 'Technical & Safety',
    plainEnglish: 'The official software used nationwide by Indian Railways train controllers to manage daily train operations.',
    whyItMatters: 'RailSync exports final approved plans directly in COA-compliant JSON format.',
  },
];

interface RailwayGlossaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RailwayGlossaryModal({ open, onOpenChange }: RailwayGlossaryModalProps) {
  const [filter, setFilter] = useState('');

  const filteredTerms = GLOSSARY_TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(filter.toLowerCase()) ||
      t.plainEnglish.toLowerCase().includes(filter.toLowerCase()) ||
      t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <BookOpen size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Railway Terms in Plain English</DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                Simple meanings for the essential railway words used in RailSync.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative mt-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search any term (e.g. Block, OHE, S&T, Solver)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Terms list */}
        <div className="space-y-4 mt-4">
          {filteredTerms.map((item) => (
            <div
              key={item.term}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="font-semibold text-white text-base">{item.term}</h4>
                <Badge variant="outline" className="text-xs bg-slate-900 text-sky-300 border-slate-700">
                  {item.category}
                </Badge>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">{item.plainEnglish}</p>

              {item.analogy && (
                <div className="mt-2 text-xs bg-slate-900/90 rounded-md p-2 border border-slate-800 text-amber-300/90">
                  <span className="font-semibold text-amber-400">Simple Analogy: </span>
                  {item.analogy}
                </div>
              )}

              <div className="mt-2 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Why it matters: </span>
                {item.whyItMatters}
              </div>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <p className="text-center py-6 text-sm text-slate-400">
              No matching terms found. Try searching &quot;Block&quot;, &quot;OHE&quot;, or &quot;Engineering&quot;.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
