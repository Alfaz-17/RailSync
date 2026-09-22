'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface StalePlanBannerProps {
  windowId: string;
  windowTime: string;
  tasksAffected: number;
  blocksAffected: number;
  onReoptimize: () => void;
  isReoptimizing?: boolean;
}

export function StalePlanBanner({
  windowId,
  windowTime,
  tasksAffected,
  blocksAffected,
  onReoptimize,
  isReoptimizing = false,
}: StalePlanBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-[#D94B45] bg-[#D94B4508] p-6 space-y-4"
    >
      {/* Operational Update Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-[#F28C18]" />
        <span className="text-sm font-bold text-[#F28C18] uppercase tracking-wider">Operational Update</span>
      </div>

      {/* Window Change Detail */}
      <div className="rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="text-xs text-[var(--muted-foreground)] mb-2">COA Window</div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-mono font-bold text-[var(--foreground)]">{windowId}</span>
          <span className="text-xs text-[var(--muted-foreground)]">{windowTime}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="text-xs bg-[#18864B10] text-[#18864B] border border-[#18864B30]">AVAILABLE</Badge>
          <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          <Badge className="text-xs bg-[#D94B4510] text-[#D94B45] border border-[#D94B4530]">UNAVAILABLE</Badge>
        </div>
      </div>

      <Separator />

      {/* PLAN STALE Banner */}
      <div className="bg-[#D94B4512] border border-[#D94B4530] rounded-lg p-4 text-center">
        <p className="text-lg font-bold text-[#D94B45] tracking-wider">PLAN STALE</p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {tasksAffected} tasks affected · {blocksAffected} maintenance block affected
        </p>
      </div>

      {/* Re-optimize Button */}
      <Button
        className="w-full bg-[var(--primary)] hover:bg-[#091F40] text-white gap-2 h-11"
        onClick={onReoptimize}
        disabled={isReoptimizing}
      >
        <RefreshCw className={`w-4 h-4 ${isReoptimizing ? 'animate-spin' : ''}`} />
        {isReoptimizing ? 'Re-optimizing…' : 'Re-optimize Plan'}
      </Button>
    </motion.div>
  );
}
