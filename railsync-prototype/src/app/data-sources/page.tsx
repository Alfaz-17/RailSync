'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { dataSources } from '@/data/sources';
import { usePrototypeStore } from '@/store/prototype-store';
import { MaintenanceTask, COAWindow } from '@/types/domain';
import Link from 'next/link';
import {
  Wrench, Radio, Zap, Clock, Package, CalendarCheck, ShieldCheck, Users, CheckCircle2, Eye,
  Upload, FileText, RotateCcw, Sparkles, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Wrench, Radio, Zap, Clock, Package, CalendarCheck, ShieldCheck, Users,
};

const deptColorMap: Record<string, string> = {
  Engineering: '#245F8E',
  Signal: '#946016',
  Traction: '#14736D',
};

// Compact benchmark dataset matching Functional Spec Section 06
const sampleBenchmarkDataset: { tasks: MaintenanceTask[]; windows: COAWindow[] } = {
  tasks: [
    {
      id: 'ENG-BM-01',
      source: 'TMS',
      department: 'Engineering',
      corridorId: 'C001',
      corridorName: 'Ahmedabad → Nadiad',
      title: 'Ultrasonic Rail Testing (USFD)',
      durationMin: 120,
      priorityScore: 92,
      priorityBand: 'Critical',
      status: 'PENDING',
      dueDate: '2026-09-30',
      criticality: 10,
      urgency: 9,
      safetyImpact: 10,
      availabilityImpact: 8,
      requiredState: 'Track Possession',
      requiredResource: 'Track Gang A',
    },
    {
      id: 'SIG-BM-01',
      source: 'SMMS',
      department: 'Signal',
      corridorId: 'C001',
      corridorName: 'Ahmedabad → Nadiad',
      title: 'Point Machine Lubrication & Testing',
      durationMin: 90,
      priorityScore: 84,
      priorityBand: 'High',
      status: 'PENDING',
      dueDate: '2026-09-30',
      criticality: 8,
      urgency: 8,
      safetyImpact: 8,
      availabilityImpact: 7,
      requiredState: 'Track Possession',
      requiredResource: 'Signal Crew 1',
    },
    {
      id: 'TRD-BM-01',
      source: 'TDMS',
      department: 'Traction',
      corridorId: 'C001',
      corridorName: 'Ahmedabad → Nadiad',
      title: 'OHE Section Insulator Inspection',
      durationMin: 90,
      priorityScore: 78,
      priorityBand: 'High',
      status: 'PENDING',
      dueDate: '2026-09-30',
      criticality: 7,
      urgency: 8,
      safetyImpact: 8,
      availabilityImpact: 6,
      requiredState: 'Power Block',
      requiredResource: 'Tower Wagon 1',
    },
    {
      id: 'ENG-BM-02',
      source: 'TMS',
      department: 'Engineering',
      corridorId: 'C002',
      corridorName: 'Nadiad → Vadodara',
      title: 'Girder Bridge Span Inspection',
      durationMin: 120,
      priorityScore: 90,
      priorityBand: 'Critical',
      status: 'PENDING',
      dueDate: '2026-09-30',
      criticality: 9,
      urgency: 9,
      safetyImpact: 9,
      availabilityImpact: 8,
      requiredState: 'Speed Restriction',
      requiredResource: 'Bridge Inspector Gang',
    },
    {
      id: 'SIG-BM-02',
      source: 'SMMS',
      department: 'Signal',
      corridorId: 'C002',
      corridorName: 'Nadiad → Vadodara',
      title: 'Track Circuit Bonding Replacement',
      durationMin: 90,
      priorityScore: 75,
      priorityBand: 'High',
      status: 'PENDING',
      dueDate: '2026-09-30',
      criticality: 7,
      urgency: 7,
      safetyImpact: 8,
      availabilityImpact: 7,
      requiredState: 'Track Possession',
      requiredResource: 'Signal Crew 2',
    },
  ],
  windows: [
    {
      id: 'BW-BM-01',
      corridorId: 'C001',
      corridorName: 'Ahmedabad → Nadiad',
      start: '01:00',
      end: '03:00',
      durationMin: 120,
      availability: 'Available',
      dayOfWeek: 'Monday',
      date: '2026-09-28',
      startIso: '2026-09-28T01:00',
      endIso: '2026-09-28T03:00',
    },
    {
      id: 'BW-BM-02',
      corridorId: 'C001',
      corridorName: 'Ahmedabad → Nadiad',
      start: '03:30',
      end: '05:00',
      durationMin: 90,
      availability: 'Available',
      dayOfWeek: 'Monday',
      date: '2026-09-28',
      startIso: '2026-09-28T03:30',
      endIso: '2026-09-28T05:00',
    },
    {
      id: 'BW-BM-03',
      corridorId: 'C002',
      corridorName: 'Nadiad → Vadodara',
      start: '01:00',
      end: '03:00',
      durationMin: 120,
      availability: 'Available',
      dayOfWeek: 'Tuesday',
      date: '2026-09-29',
      startIso: '2026-09-29T01:00',
      endIso: '2026-09-29T03:00',
    },
  ],
import { parseTasksCsv, parseWindowsCsv, getSampleTasksCsv, getSampleWindowsCsv } from '@/lib/csv-parser';
import {
  Wrench, Radio, Zap, Clock, Package, CalendarCheck, ShieldCheck, Users, CheckCircle2, Eye,
  Upload, FileText, RotateCcw, Sparkles, ArrowRight, Download, FileSpreadsheet,
} from 'lucide-react';

export default function DataSourcesPage() {
  const { tasks, windows, importDataset, resetTasks, loadGoldenScenario } = usePrototypeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const isCsv = file.name.endsWith('.csv') || (text.includes(',') && !text.trim().startsWith('{'));

        if (isCsv) {
          const importedTasks = parseTasksCsv(text);
          if (importedTasks.length === 0) {
            toast.error('Invalid CSV: Could not parse tasks. Please use standard headers (id, department, title, durationMin, priorityScore).');
            return;
          }
          importDataset(importedTasks);
          toast.success(`CSV Imported successfully! Loaded ${importedTasks.length} tasks into active workbank.`);
          return;
        }

        // JSON parsing
        const json = JSON.parse(text);
        const importedTasks: MaintenanceTask[] = json.tasks || [];
        const importedWindows: COAWindow[] = json.windows || [];

        if (!Array.isArray(importedTasks) || importedTasks.length === 0) {
          toast.error('Invalid dataset: JSON must contain a "tasks" array with at least 1 task.');
          return;
        }

        importDataset(importedTasks, importedWindows.length > 0 ? importedWindows : undefined);
        toast.success(`Dataset imported! Loaded ${importedTasks.length} tasks into active workbank.`);
      } catch {
        toast.error('Failed to parse file. Please upload a valid CSV or UTF-8 JSON.');
      }
    };
    reader.readAsText(file);
  }

  function handleDownloadCsvTemplate() {
    const csvContent = getSampleTasksCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'railsync-tasks-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded railsync-tasks-template.csv!');
  }

  function handleLoadBenchmark() {
    importDataset(sampleBenchmarkDataset.tasks, sampleBenchmarkDataset.windows);
    toast.success('Loaded Compact Benchmark Dataset (5 tasks, 3 windows)!');
  }

  function handleResetDefault() {
    loadGoldenScenario();
    toast.info('Restored Golden Scenario (C001 - 4 tasks).');
  }

  return (
    <div>
      <Topbar title="Data Sources & Ingestion" description="Sample inputs and enterprise adapters used by the planner." />

      <div className="page-content space-y-6">
        <section className="page-intro">
          <div>
            <div className="eyebrow">Enterprise Data Layer &amp; Ingestion</div>
            <h2>Normalized Indian Railways Data Ingestion</h2>
            <p>Tasks, train movements, crews, and candidate block windows from CRIS systems (TMS, SMMS, TDMS, COA). Upload custom CSV / JSON files or inspect connected adapters.</p>
          </div>
          <span className="demo-label">Active Workbank: {tasks.length} tasks · {windows.length} windows</span>
        </section>

        {/* Dataset Ingestion / Upload Panel */}
        <Card className="border-teal-200 bg-teal-50/30 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-teal-950 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                Dynamic Dataset Ingestion (XLSX / CSV / JSON)
              </span>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs">
                  Data Origin: SYNTHETIC
                </Badge>
                <Badge className="bg-teal-100 text-teal-900 border-teal-300 text-xs">
                  Active: {tasks.length} Tasks
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              RailSync ingests maintenance demands from CSV or JSON exports. Upload your custom file or download our template. Once uploaded, the Google OR-Tools CP-SAT solver will genuinely compute a new plan dynamically for your data:
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                className="bg-[#235b80] hover:bg-[#1d4e70] text-white text-xs gap-1.5 h-9"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" /> Import CSV / JSON File
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs gap-1.5 h-9"
                onClick={handleDownloadCsvTemplate}
              >
                <Download className="w-3.5 h-3.5 text-slate-600" /> Download CSV Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-teal-300 text-teal-900 hover:bg-teal-100 text-xs gap-1.5 h-9"
                onClick={handleLoadBenchmark}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Benchmark (5 Tasks)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-600 hover:bg-slate-100 text-xs gap-1.5 h-9"
                onClick={handleResetDefault}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset (Golden 4-Task)
              </Button>
              <Link href="/tasks" className="ml-auto">
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 h-9 font-semibold"
                >
                  Open Workbank ({tasks.length} Tasks) <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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
                <Card className="border-slate-200 hover:border-slate-300 transition-shadow h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ backgroundColor: `${deptColor}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: deptColor }} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border-sky-300">
                          SIMULATED CONNECTOR
                        </Badge>
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-sm font-semibold text-[#0F172A] mt-2 leading-tight">
                      {source.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {source.department && (
                        <Badge
                          variant="outline"
                          className="text-[11px]"
                          style={{ color: deptColor, borderColor: `${deptColor}40` }}
                        >
                          {source.department}
                        </Badge>
                      )}
                      <Badge className="text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                        SYNTHETIC DATA
                      </Badge>
                    </div>
                    <p className="text-xs text-[#526175] leading-relaxed">
                      {source.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-[#0F172A]">{source.recordCount}</span>
                        <span className="text-xs text-[#526175] ml-1.5">{source.recordUnit}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        SIH26027 Spec
                      </span>
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
                            <Badge className="text-xs bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
                              Sample data
                            </Badge>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                              {source.sampleData.map((record, rIdx) => (
                                <div key={rIdx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                                  {Object.entries(record).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                      <span className="text-slate-500 font-sans">{k}:</span>
                                      <span className="font-semibold text-slate-800">{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              ))}
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
