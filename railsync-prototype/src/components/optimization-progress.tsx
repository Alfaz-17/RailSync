'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizationProgressProps {
  steps: string[];
  currentStep: number;
  isComplete: boolean;
  statusLabel?: string;
}

export function OptimizationProgress({ steps, currentStep, isComplete, statusLabel }: OptimizationProgressProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-[#18864B]" />
        ) : (
          <Loader2 className="w-5 h-5 text-[var(--rail-blue)] animate-spin" />
        )}
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {isComplete ? 'Optimization Complete' : 'Running Optimization…'}
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {steps.map((step, i) => {
          const isDone = i < currentStep || isComplete;
          const isActive = i === currentStep && !isComplete;
          const isPending = i > currentStep && !isComplete;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 text-sm ${
                isDone ? 'text-[var(--foreground)]' : isActive ? 'text-[var(--rail-blue)] font-medium' : 'text-[var(--muted-foreground)]'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#18864B] flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-[var(--rail-blue)] animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] flex-shrink-0" />
              )}
              <span>{step}</span>
              {isDone && <span className="text-xs text-[#18864B] ml-auto">✓</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Completion Banner */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18864B10] border border-[#18864B30] rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#18864B]" />
              <span className="text-sm font-bold text-[#18864B] tracking-wider">
                {statusLabel || 'FEASIBLE PLAN GENERATED'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
