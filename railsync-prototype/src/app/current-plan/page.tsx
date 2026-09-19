'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fragmentedBlocks } from '@/data/current-plan';
import { Department } from '@/types/domain';
import { summarizeBlocks } from '@/lib/plan-summary';
import { ArrowRight, AlertCircle, Link2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { ShadowBlockDiagram } from '@/components/visualizations/shadow-block-diagram';

const deptColors: Record<Department, { bg: string; border: string; text: string }> = {
  Engineering: { bg: '#245F8E15', border: '#245F8E40', text: '#245F8E' },
  Signal: { bg: '#94601615', border: '#94601640', text: '#946016' },
  Traction: { bg: '#14736D15', border: '#14736D40', text: '#14736D' },
};

const departments: Department[] = ['Engineering', 'Signal', 'Traction'];

// Group blocks by corridor
const corridors = [...new Set(fragmentedBlocks.map((b) => b.corridorId))].sort();

function timeToPercent(time: string): number {
  const [h, m] = time.split(':').map(Number);
  // Scale to 0-6 hour window (00:00 to 06:00)
  return ((h + m / 60) / 6) * 100;
}

export default function CurrentPlanPage() {
  const summary = summarizeBlocks(fragmentedBlocks.map(block => ({ ...block, taskIds: [block.taskId], departments: [block.department] })));
  return (
    <div>
      <Topbar title="Current plan" description="See the separate work times for each department." />

      <div className="page-content space-y-6">
        <section className="page-intro"><div><div className="eyebrow">Before shared planning</div><h2>Separate plans can mean repeated closures.</h2><p>Each department has its own work times in this example. The highlighted tasks could be reviewed for a shared block.</p></div><Button render={<Link href="/optimize" />} className="h-10 px-4">Build a shared plan <ArrowRight size={16} /></Button></section>

        {/* Visual Shadow Block Explainer */}
        <ShadowBlockDiagram />

        {/* Baseline Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Blocks', value: summary.blockCount, color: '#B91C1C' },
            { label: 'Minutes in blocks', value: `${summary.totalMinutes.toLocaleString()}`, color: '#946016' },
            { label: 'Critical tasks planned', value: `${summary.criticalPlanned}/${summary.criticalTotal}`, color: '#946016' },
            { label: 'Shared blocks', value: summary.sharedBlocks, color: '#B91C1C' },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5 text-center">
                  <p className="text-sm font-bold text-slate-500">{m.label}</p>
                  <p className="text-3xl md:text-4xl font-semibold mt-1 tracking-tight" style={{ color: m.color }}>{m.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Badge className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 py-1 px-3">
            Sample plan · Before coordination
          </Badge>
        </div>

        {/* Timeline per corridor */}
        {corridors.map((corridorId) => {
          const corridorBlocks = fragmentedBlocks.filter((b) => b.corridorId === corridorId);
          const corridorName = corridorBlocks[0]?.corridorName || corridorId;

          return (
            <motion.div
              key={corridorId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base md:text-lg font-bold text-[#0F172A] flex items-center gap-2.5">
                    <Badge variant="outline" className="font-mono text-xs font-bold text-slate-700 bg-slate-100">{corridorId}</Badge>
                    <span>{corridorName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Time axis */}
                  <div className="ml-28 mb-2 flex justify-between text-xs font-mono font-bold text-slate-500">
                    {['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'].map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>

                  {/* Lanes */}
                  <div className="space-y-3">
                    {departments.map((dept) => {
                      const deptBlocks = corridorBlocks.filter((b) => b.department === dept);
                      const colors = deptColors[dept];

                      return (
                        <div key={dept} className="flex items-center gap-3">
                          <div className="w-24 text-right shrink-0">
                            <Badge variant="outline" className="text-xs font-bold py-1 px-2.5" style={{ color: colors.text, borderColor: colors.border }}>
                              {dept}
                            </Badge>
                          </div>
                          <div className="flex-1 relative h-11 bg-slate-50 rounded-lg border border-slate-200">
                            {deptBlocks.map((block) => {
                              const left = timeToPercent(block.start);
                              const right = timeToPercent(block.end);
                              const width = right - left;

                              return (
                                <div
                                  key={block.id}
                                  className="absolute top-1 bottom-1 rounded-md flex items-center px-2.5 overflow-hidden shadow-xs"
                                  style={{
                                    left: `${left}%`,
                                    width: `${width}%`,
                                    backgroundColor: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                  }}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {block.hasCoordinationOpportunity && (
                                      <Link2 className="w-3.5 h-3.5 flex-shrink-0 text-amber-800" />
                                    )}
                                    <span className="text-xs md:text-sm font-bold truncate" style={{ color: colors.text }}>
                                      {block.taskId}: {block.taskTitle}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coordination marker */}
                  {corridorBlocks.some((b) => b.hasCoordinationOpportunity) && (
                    <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="text-xs md:text-sm font-bold">These tasks use the same track section. Check whether they can share a block.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <Link href="/optimize">
            <Button size="lg" className="bg-[#235b80] hover:bg-[#1d4e70] text-white gap-2 px-8 py-6 text-base font-semibold shadow-sm shadow-[#14736D]/20">
              Build a shared plan
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
