'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fragmentedBlocks } from '@/data/current-plan';
import { summarizeBlocks } from '@/lib/plan-summary';
import { TimelineView, fragmentedToTimeline } from '@/components/timeline-view';
import { ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { ShadowBlockDiagram } from '@/components/visualizations/shadow-block-diagram';

const corridors = [...new Set(fragmentedBlocks.map((b) => b.corridorId))].sort();

export default function CurrentPlanPage() {
  const summary = summarizeBlocks(fragmentedBlocks.map(block => ({ ...block, taskIds: [block.taskId], departments: [block.department] })));

  return (
    <div>
      <Topbar title="Current Plan" description="See the separate work times for each department." />

      <div className="page-content space-y-6">
        <section className="page-intro">
          <div>
            <div className="eyebrow">Before shared planning</div>
            <h2>What is wrong with planning today?</h2>
            <p>Each department plans independently. Highlighted tasks overlap on the same corridor and could share a single block.</p>
          </div>
          <Button render={<Link href="/optimize" />} className="h-10 px-5 bg-[var(--primary)] hover:bg-[#091F40] text-white">
            Build a shared plan <ArrowRight size={16} />
          </Button>
        </section>

        {/* Visual Shadow Block Explainer */}
        <ShadowBlockDiagram />

        {/* Baseline Metrics */}
        <div className="stat-grid">
          {[
            { label: 'Total Blocks', value: summary.blockCount, note: 'Separate track closures' },
            { label: 'Minutes in Blocks', value: `${summary.totalMinutes.toLocaleString()}`, note: 'Total possession time' },
            { label: 'Critical Planned', value: `${summary.criticalPlanned}/${summary.criticalTotal}`, note: 'Critical tasks with a slot' },
            { label: 'Shared Blocks', value: summary.sharedBlocks, note: 'Multi-department (none yet)' },
          ].map((m) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="stat-tile text-center">
                <div className="stat-label justify-center">{m.label}</div>
                <p className="stat-value">{m.value}</p>
                <p className="stat-note">{m.note}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <Badge className="text-xs font-semibold bg-[#F28C1810] text-[#C28012] border border-[#F28C1830] py-1 px-3">
          Sample plan · Before coordination
        </Badge>

        {/* Timeline per corridor — using the new TimelineView component */}
        {corridors.map((corridorId) => {
          const corridorBlocks = fragmentedBlocks.filter((b) => b.corridorId === corridorId);
          const corridorName = corridorBlocks[0]?.corridorName || corridorId;
          const timelineBlocks = fragmentedToTimeline(corridorBlocks);
          const hasCoordOpp = corridorBlocks.some(b => b.hasCoordinationOpportunity);

          return (
            <motion.div
              key={corridorId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TimelineView
                corridorId={corridorId}
                corridorName={corridorName}
                blocks={timelineBlocks}
              />
              {hasCoordOpp && (
                <div className="mt-2 flex items-center gap-2 text-[#F28C18] bg-[#F28C1808] border border-[#F28C1830] rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">These tasks use the same corridor. Check whether they can share a block.</span>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <Link href="/optimize">
            <Button size="lg" className="bg-[var(--primary)] hover:bg-[#091F40] text-white gap-2 px-8 py-6 text-base font-semibold">
              Build a shared plan
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
