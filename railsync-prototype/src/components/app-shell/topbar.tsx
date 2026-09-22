'use client';

import { useState } from 'react';
import { usePrototypeStore } from '@/store/prototype-store';
import { Button } from '@/components/ui/button';
import { RotateCcw, CircleHelp, CalendarDays } from 'lucide-react';
import { ComplexityModal } from '@/components/demo-guide/complexity-modal';

interface TopbarProps { title: string; description?: string }

export function Topbar({ title, description }: TopbarProps) {
  const resetDemo = usePrototypeStore((s) => s.resetDemo);
  const [showHelp, setShowHelp] = useState(false);
  return (
    <>
      <header className="app-topbar">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
        <div className="topbar-actions">
          <span className="planning-date"><CalendarDays size={15} className="text-sky-400" />15–21 Sep 2026</span>
          <span className="demo-label">Demo data</span>
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
    </>
  );
}

