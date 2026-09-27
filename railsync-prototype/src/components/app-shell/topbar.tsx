'use client';

import { useState } from 'react';
import { usePrototypeStore } from '@/store/prototype-store';
import { Button } from '@/components/ui/button';
import { RotateCcw, CircleHelp, CalendarDays, BookOpen } from 'lucide-react';
import { ComplexityModal } from '@/components/demo-guide/complexity-modal';
import { RailwayGlossaryModal } from '@/components/demo-guide/railway-glossary-modal';

interface TopbarProps { title: string; description?: string }

export function Topbar({ title, description }: TopbarProps) {
  const {
    resetDemo,
    scenarioMode,
    loadGoldenScenario,
    loadFullDivisionScenario,
  } = usePrototypeStore();
  const [showHelp, setShowHelp] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  return (
    <>
      <header className="app-topbar">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
        <div className="topbar-actions">
          <span className="planning-date"><CalendarDays size={15} className="text-sky-400" />15–21 Sep 2026</span>
          
          {/* Scenario Toggle */}
          <button
            onClick={() => {
              if (scenarioMode === 'GOLDEN') {
                loadFullDivisionScenario();
              } else {
                loadGoldenScenario();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors bg-sky-950/60 border-sky-600/40 text-sky-200 hover:bg-sky-900/60"
            title="Click to toggle between Golden 4-Task Demo and Full 35-Task Division"
          >
            {scenarioMode === 'GOLDEN' ? (
              <>
                <span className="text-amber-400">★</span>
                <span>Golden Demo (C001)</span>
              </>
            ) : (
              <>
                <span className="text-sky-400">🌐</span>
                <span>Full Division (35 Tasks)</span>
              </>
            )}
          </button>

          <span className="demo-label">Synthetic Data</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGlossary(true)}
            className="bg-slate-800/90 border-slate-700 text-sky-300 hover:bg-slate-700 hover:text-white"
          >
            <BookOpen size={15} /> Glossary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <CircleHelp size={15} className="text-sky-400" /> How it works
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDemo}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw size={15} /> Reset demo
          </Button>
        </div>
      </header>
      <ComplexityModal open={showHelp} onOpenChange={setShowHelp} />
      <RailwayGlossaryModal open={showGlossary} onOpenChange={setShowGlossary} />
    </>
  );
}

