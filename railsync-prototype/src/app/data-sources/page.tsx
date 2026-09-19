'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { dataSources } from '@/data/sources';
import {
  Wrench, Radio, Zap, Clock, Package, CalendarCheck, ShieldCheck, Users, CheckCircle2, Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Wrench, Radio, Zap, Clock, Package, CalendarCheck, ShieldCheck, Users,
};

const deptColorMap: Record<string, string> = {
  Engineering: '#245F8E',
  Signal: '#D97706',
  Traction: '#6D4AFF',
};

export default function DataSourcesPage() {
  return (
    <div>
      <Topbar title="Data sources" description="Sample inputs used by the planner." />

      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        <section className="page-intro"><div><div className="eyebrow">Planning inputs</div><h2>Start with the right information.</h2><p>Tasks, train times, crews, and available work slots help build a shared plan. Open a source to see its sample records.</p></div><span className="demo-label">Sample data</span></section>

        {/* Source Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataSources.map((source, i) => {
            const Icon = iconMap[source.icon] || Wrench;
            const deptColor = source.department ? deptColorMap[source.department] : '#0F766E';

            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-slate-200 hover:shadow-md transition-shadow h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ backgroundColor: `${deptColor}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: deptColor }} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">{source.status}</span>
                      </div>
                    </div>
                    <CardTitle className="text-sm font-semibold text-[#0F172A] mt-2 leading-tight">
                      {source.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {source.department && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ color: deptColor, borderColor: `${deptColor}40` }}
                      >
                        {source.department}
                      </Badge>
                    )}
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {source.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-[#0F172A]">{source.recordCount}</span>
                        <span className="text-xs text-[#64748B] ml-1.5">{source.recordUnit}</span>
                      </div>
                      <Badge className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
                        Sample data
                      </Badge>
                    </div>

                    {/* View Sample Drawer */}
                    {source.sampleData && (
                      <Sheet>
                        <SheetTrigger className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs hover:bg-slate-100 hover:text-slate-900 mt-1 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                          View Sample
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle className="text-base">{source.name} — Sample Data</SheetTitle>
                          </SheetHeader>
                          <div className="mt-4 space-y-3">
                            <Badge className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
                              Sample data
                            </Badge>
                            <div className="border rounded-lg overflow-x-auto mt-3">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-slate-50">
                                    {Object.keys(source.sampleData[0]).map((key) => (
                                      <th key={key} className="px-3 py-2 text-left font-semibold text-[#0F172A] capitalize">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {source.sampleData.map((row, ri) => (
                                    <tr key={ri} className="border-t">
                                      {Object.values(row).map((val, ci) => (
                                        <td key={ci} className="px-3 py-2 text-[#64748B]">
                                          {String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
