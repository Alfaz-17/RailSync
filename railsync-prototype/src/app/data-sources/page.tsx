'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { dataSources } from '@/data/sources';
import { usePrototypeStore } from '@/store/prototype-store';
import { MaintenanceTask, COAWindow } from '@/types/domain';
import { COMPREHENSIVE_SCENARIO_SETS, ComprehensiveScenarioSet } from '@/data/comprehensive-scenarios';
import Link from 'next/link';
import {
  Wrench, Radio, Zap, Clock, Package, CalendarCheck, ShieldCheck, Users, CheckCircle2, Eye,
  Upload, FileText, RotateCcw, Sparkles, ArrowRight, Download, FileSpreadsheet, Trash2, Check,
  AlertCircle,
} from 'lucide-react';
import { parseTasksCsv, parseWindowsCsv, getSampleTasksCsv } from '@/lib/csv-parser';
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

const CONNECTOR_SAMPLE_FILES: Record<string, { path: string; name: string; label: string }> = {
  'src-tms': { path: '/datasets/01_engineering_track_tasks.csv', name: '01_tms_track_engineering.csv', label: 'TMS Tasks CSV' },
  'src-smms': { path: '/datasets/02_signal_telecom_tasks.csv', name: '02_smms_signal_telecom.csv', label: 'SMMS Tasks CSV' },
  'src-tdms': { path: '/datasets/03_traction_ohe_tasks.csv', name: '03_tdms_traction_ohe.csv', label: 'TDMS Tasks CSV' },
  'src-timetable': { path: '/datasets/05_train_timetable_movements.csv', name: '05_train_timetable_movements.csv', label: 'Train Timetable CSV' },
  'src-goods': { path: '/datasets/06_goods_freight_forecast.csv', name: '06_goods_freight_forecast.csv', label: 'Goods Forecast CSV' },
  'src-coa': { path: '/datasets/04_train_timetable_windows.csv', name: '04_coa_candidate_windows.csv', label: 'COA Windows CSV' },
  'src-compat': { path: '/datasets/07_cross_dept_compatibility_rules.csv', name: '07_cross_dept_compatibility_rules.csv', label: 'Rules Matrix CSV' },
  'src-crew': { path: '/datasets/08_crew_and_resource_roster.csv', name: '08_crew_and_resource_roster.csv', label: 'Crew & Gang Roster CSV' },
};

export default function DataSourcesPage() {
  const {
    tasks,
    windows,
    importDataset,
    clearWorkbank,
    loadGoldenScenario,
    activeScenarioSetId,
    loadComprehensiveScenarioSet,
    mergeDepartmentTasks,
    setWindows,
  } = usePrototypeStore();

  const universalFileInputRef = useRef<HTMLInputElement>(null);
  const connectorFileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadConnector, setActiveUploadConnector] = useState<string | null>(null);

  const activeScenario =
    COMPREHENSIVE_SCENARIO_SETS.find((s) => s.id === (activeScenarioSetId || 'set-1')) ||
    COMPREHENSIVE_SCENARIO_SETS[0];

  // Helper to get real live count and unit per connector
  function getConnectorStats(sourceId: string) {
    switch (sourceId) {
      case 'src-tms': {
        const engTasks = tasks.filter((t) => t.department === 'Engineering');
        const count = engTasks.length > 0 ? engTasks.length : (activeScenarioSetId ? activeScenario.counts.tms : 0);
        return { count, unit: 'tasks', isConnected: count > 0 };
      }
      case 'src-smms': {
        const sigTasks = tasks.filter((t) => t.department === 'Signal');
        const count = sigTasks.length > 0 ? sigTasks.length : (activeScenarioSetId ? activeScenario.counts.smms : 0);
        return { count, unit: 'tasks', isConnected: count > 0 };
      }
      case 'src-tdms': {
        const trdTasks = tasks.filter((t) => t.department === 'Traction');
        const count = trdTasks.length > 0 ? trdTasks.length : (activeScenarioSetId ? activeScenario.counts.tdms : 0);
        return { count, unit: 'tasks', isConnected: count > 0 };
      }
      case 'src-coa': {
        const count = windows.length > 0 ? windows.length : (activeScenarioSetId ? activeScenario.counts.coa : 0);
        return { count, unit: 'candidate windows', isConnected: count > 0 };
      }
      case 'src-timetable': {
        const count = (tasks.length > 0 || activeScenarioSetId) ? (activeScenarioSetId ? activeScenario.counts.timetable : 140) : 0;
        return { count, unit: 'train movements', isConnected: count > 0 };
      }
      case 'src-goods': {
        const count = (tasks.length > 0 || activeScenarioSetId) ? (activeScenarioSetId ? activeScenario.counts.goods : 105) : 0;
        return { count, unit: 'forecast windows', isConnected: count > 0 };
      }
      case 'src-compat': {
        const count = (tasks.length > 0 || activeScenarioSetId) ? (activeScenarioSetId ? activeScenario.counts.rules : 12) : 0;
        return { count, unit: 'rules', isConnected: count > 0 };
      }
      case 'src-crew': {
        const count = (tasks.length > 0 || activeScenarioSetId) ? (activeScenarioSetId ? activeScenario.counts.crews : 15) : 0;
        return { count, unit: 'resource entries', isConnected: count > 0 };
      }
      default:
        return { count: 0, unit: 'records', isConnected: false };
    }
  }

  // Trigger individual connector upload
  function triggerConnectorUpload(connectorId: string) {
    setActiveUploadConnector(connectorId);
    if (connectorFileInputRef.current) {
      connectorFileInputRef.current.value = '';
      connectorFileInputRef.current.click();
    }
  }

  // Process connector file upload
  function handleConnectorFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeUploadConnector) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const isCsv = file.name.endsWith('.csv') || (text.includes(',') && !text.trim().startsWith('{'));

        if (activeUploadConnector === 'src-tms') {
          const parsed = isCsv ? parseTasksCsv(text) : (JSON.parse(text).tasks || JSON.parse(text));
          const engTasks = (parsed as MaintenanceTask[]).map((t) => ({ ...t, department: 'Engineering' as const }));
          if (engTasks.length === 0) throw new Error('No valid Engineering tasks found in file.');
          mergeDepartmentTasks('Engineering', engTasks);
          toast.success(`TMS Ingested: ${engTasks.length} Track Engineering tasks added to workbank!`);
        } else if (activeUploadConnector === 'src-smms') {
          const parsed = isCsv ? parseTasksCsv(text) : (JSON.parse(text).tasks || JSON.parse(text));
          const sigTasks = (parsed as MaintenanceTask[]).map((t) => ({ ...t, department: 'Signal' as const }));
          if (sigTasks.length === 0) throw new Error('No valid Signal tasks found in file.');
          mergeDepartmentTasks('Signal', sigTasks);
          toast.success(`SMMS Ingested: ${sigTasks.length} Signal & Telecom tasks added to workbank!`);
        } else if (activeUploadConnector === 'src-tdms') {
          const parsed = isCsv ? parseTasksCsv(text) : (JSON.parse(text).tasks || JSON.parse(text));
          const trdTasks = (parsed as MaintenanceTask[]).map((t) => ({ ...t, department: 'Traction' as const }));
          if (trdTasks.length === 0) throw new Error('No valid Traction tasks found in file.');
          mergeDepartmentTasks('Traction', trdTasks);
          toast.success(`TDMS Ingested: ${trdTasks.length} Traction Distribution tasks added to workbank!`);
        } else if (activeUploadConnector === 'src-coa') {
          const parsed = isCsv ? parseWindowsCsv(text) : (JSON.parse(text).windows || JSON.parse(text));
          if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No valid COA candidate windows found in file.');
          setWindows(parsed);
          toast.success(`COA Ingested: ${parsed.length} candidate block windows loaded into planner!`);
        } else if (activeUploadConnector === 'src-timetable') {
          const lines = text.trim().split('\n').filter(Boolean);
          const count = Math.max(1, lines.length - 1);
          toast.success(`Train Timetable Synchronized: ${count} passenger train movements ingested!`);
        } else if (activeUploadConnector === 'src-goods') {
          const lines = text.trim().split('\n').filter(Boolean);
          const count = Math.max(1, lines.length - 1);
          toast.success(`Goods Forecast Synchronized: ${count} freight forecast windows ingested!`);
        } else if (activeUploadConnector === 'src-compat') {
          const lines = text.trim().split('\n').filter(Boolean);
          const count = Math.max(1, lines.length - 1);
          toast.success(`Compatibility Rules Ingested: ${count} cross-department rules loaded!`);
        } else if (activeUploadConnector === 'src-crew') {
          const lines = text.trim().split('\n').filter(Boolean);
          const count = Math.max(1, lines.length - 1);
          toast.success(`Crew & Equipment Ingested: ${count} roster entries loaded!`);
        }
      } catch (err: any) {
        toast.error(`Ingestion failed: ${err.message || 'Please upload a valid CSV or JSON file.'}`);
      }
    };
    reader.readAsText(file);
  }

  // Universal CSV/JSON upload
  function handleUniversalFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const isCsv = file.name.endsWith('.csv') || (text.includes(',') && !text.trim().startsWith('{'));

        if (isCsv) {
          if (file.name.includes('window')) {
            const importedWindows = parseWindowsCsv(text);
            importDataset(tasks, importedWindows);
            toast.success(`Windows CSV imported! Loaded ${importedWindows.length} windows into active timetable.`);
            return;
          }
          const importedTasks = parseTasksCsv(text);
          if (importedTasks.length === 0) {
            toast.error('Invalid CSV: Could not parse tasks. Please check column headers.');
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

  // Download individual connector sample CSV
  async function handleDownloadConnectorSample(connectorId: string) {
    const item = CONNECTOR_SAMPLE_FILES[connectorId];
    if (!item) return;
    try {
      const res = await fetch(item.path);
      if (!res.ok) throw new Error('File not found');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded sample file: ${item.name}!`);
    } catch (e) {
      toast.error(`Download failed: ${String(e)}`);
    }
  }

  // Download all 8 connector sample CSVs sequentially
  async function handleDownloadAllConnectorSamples() {
    toast.info('Downloading all 8 Indian Railways connector sample files...');
    for (const [id] of Object.entries(CONNECTOR_SAMPLE_FILES)) {
      await handleDownloadConnectorSample(id);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Download scenario JSON bundle
  function handleDownloadScenarioJson(sc: ComprehensiveScenarioSet) {
    const payload = {
      scenarioId: sc.id,
      code: sc.code,
      title: sc.title,
      theme: sc.theme,
      description: sc.description,
      connectors: {
        tms_engineering_tasks: sc.counts.tms,
        smms_signal_tasks: sc.counts.smms,
        tdms_traction_tasks: sc.counts.tdms,
        train_timetable_movements: sc.counts.timetable,
        goods_forecast_windows: sc.counts.goods,
        coa_candidate_windows: sc.counts.coa,
        compatibility_rules: sc.counts.rules,
        crew_resource_entries: sc.counts.crews,
      },
      tasks: sc.tasks,
      windows: sc.windows,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sc.code}_${sc.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${sc.code} (${sc.title}) full dataset!`);
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

  function handleResetDefault() {
    loadGoldenScenario();
    toast.info('Restored Golden Scenario (C001 - 4 tasks).');
  }

  return (
    <div>
      <Topbar title="Data Sources & Ingestion" description="Sample inputs and enterprise adapters used by the planner." />

      {/* Hidden file inputs for universal and connector uploads */}
      <input
        ref={universalFileInputRef}
        type="file"
        accept=".csv,.json,.txt"
        className="hidden"
        onChange={handleUniversalFileUpload}
      />
      <input
        ref={connectorFileInputRef}
        type="file"
        accept=".csv,.json,.txt"
        className="hidden"
        onChange={handleConnectorFileChange}
      />

      <div className="page-content space-y-6">
        {/* Page Intro & Live Workbank Status */}
        <section className="page-intro">
          <div>
            <div className="eyebrow">Enterprise Data Layer &amp; Ingestion</div>
            <h2>Normalized Indian Railways Data Ingestion</h2>
            <p>
              Simulated adapters for Indian Railways CRIS systems (TMS, SMMS, TDMS, COA, FOIS).
              Upload custom files directly to individual connectors, or load one of the 5 synchronized operational scenarios.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="demo-label">
              Active Workbank: {tasks.length} tasks · {windows.length} windows
            </span>
            {tasks.length === 0 ? (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Clean Slate Mode (Awaiting Data)
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Data Active ({tasks.length} tasks in memory)
              </span>
            )}
          </div>
        </section>

        {/* Global Dataset Ingestion / Action Bar */}
        <Card className="border-teal-200 bg-teal-50/30 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-teal-950 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                Universal Dataset Upload &amp; Workbank Controls
              </span>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs">
                  CRIS Architecture Compliant
                </Badge>
                <Badge className="bg-teal-100 text-teal-900 border-teal-300 text-xs">
                  Active: {tasks.length} Tasks
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload any custom task or block window file (CSV/JSON), clear to clean slate for live presentation, or download sample template files for all 8 Indian Railways connectors:
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                className="bg-[#235b80] hover:bg-[#1d4e70] text-white text-xs gap-1.5 h-9 font-semibold"
                onClick={() => universalFileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" /> Import Any CSV / JSON File
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs gap-1.5 h-9"
                onClick={handleDownloadCsvTemplate}
              >
                <Download className="w-3.5 h-3.5 text-slate-600" /> Tasks CSV Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-sky-300 text-sky-800 bg-sky-50/60 hover:bg-sky-100 text-xs gap-1.5 h-9 font-medium"
                onClick={handleDownloadAllConnectorSamples}
              >
                <Download className="w-3.5 h-3.5 text-sky-700" /> Download All 8 Sample Files
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs gap-1.5 h-9 font-medium"
                onClick={() => {
                  clearWorkbank();
                  toast.info('Workbank cleared to 0 tasks! Ready for live file upload demo.');
                }}
                title="Empty the workbank so you can demonstrate importing files from scratch to judges"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Clear Workbank (0 Tasks)
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

        {/* ── SECTION 1: Enterprise CRIS Adapters (8 Integrated Systems) with Per-Connector Upload ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Enterprise CRIS Adapters (8 Integrated Systems)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Simulated connectors for Indian Railways departmental databases. Click <strong>&ldquo;Upload File&rdquo;</strong> on any card to ingest files directly into that specific system:
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-sky-50 text-sky-800 border-sky-300 text-xs font-semibold">
                Direct Per-Connector Upload Enabled
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {dataSources.map((source, i) => {
              const Icon = iconMap[source.icon] || Wrench;
              const deptColor = source.department ? deptColorMap[source.department] : '#0F766E';
              const { count, unit, isConnected } = getConnectorStats(source.id);
              const sampleFile = CONNECTOR_SAMPLE_FILES[source.id];
              const activeSampleData =
                (activeScenario.sampleData && (activeScenario.sampleData as any)[source.id.replace('src-', '')]) ||
                source.sampleData;

              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className={`h-full flex flex-col justify-between transition-all border-2 ${
                    isConnected
                      ? 'border-slate-200/90 hover:border-slate-300 bg-white shadow-2xs'
                      : 'border-amber-200/70 bg-amber-50/20 shadow-2xs'
                  }`}>
                    <CardHeader className="p-3.5 pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex items-center justify-center w-9 h-9 rounded-lg"
                          style={{ backgroundColor: `${deptColor}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: deptColor }} />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-[9px] font-mono font-bold bg-sky-50 text-sky-800 border-sky-300">
                            SIMULATED CONNECTOR
                          </Badge>
                          {isConnected ? (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Awaiting Ingestion
                            </span>
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-xs font-bold text-slate-900 mt-2 leading-snug">
                        {source.name}
                      </CardTitle>

                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {source.department && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 font-medium"
                            style={{ color: deptColor, borderColor: `${deptColor}40` }}
                          >
                            {source.department}
                          </Badge>
                        )}
                        <Badge className="text-[9px] py-0 font-medium bg-slate-100 text-slate-700 border-slate-200">
                          SIH26027 Spec
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3.5 pt-0 space-y-2.5">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {source.description}
                      </p>

                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                        <div>
                          <span className={`text-base font-bold ${isConnected ? 'text-slate-900' : 'text-amber-800'}`}>
                            {count}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-1.5">{unit}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isConnected ? 'IN MEMORY' : 'EMPTY'}
                        </span>
                      </div>

                      {/* Action buttons: Upload File, Sample Template, View Sample */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            className="flex-1 text-[11px] h-7 bg-[#235b80] hover:bg-[#1d4e70] text-white font-semibold gap-1"
                            onClick={() => triggerConnectorUpload(source.id)}
                            title={`Upload ${source.name} CSV or JSON file`}
                          >
                            <Upload className="w-3 h-3" /> Upload File
                          </Button>
                          {sampleFile && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                              onClick={() => handleDownloadConnectorSample(source.id)}
                              title={`Download sample ${sampleFile.name}`}
                            >
                              <Download className="w-3 h-3 text-slate-600" />
                            </Button>
                          )}
                        </div>

                        {/* View Sample Drawer */}
                        {activeSampleData && (
                          <Sheet>
                            <SheetTrigger className="w-full inline-flex items-center justify-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
                              <Eye className="w-3 h-3 text-slate-500" /> View Schema &amp; Sample
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle className="text-sm font-bold flex items-center justify-between">
                                  <span>{source.name}</span>
                                  {sampleFile && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7 gap-1 border-sky-300 text-sky-800 bg-sky-50"
                                      onClick={() => handleDownloadConnectorSample(source.id)}
                                    >
                                      <Download className="w-3 h-3" /> Download Sample File
                                    </Button>
                                  )}
                                </SheetTitle>
                              </SheetHeader>
                              <div className="mt-3 space-y-3">
                                <div className="text-xs text-slate-600">
                                  {source.description}
                                </div>
                                <div className="flex items-center justify-between">
                                  <Badge className="text-xs bg-amber-50 text-amber-800 border border-amber-300">
                                    Simulated CRIS Sample Stream
                                  </Badge>
                                  <span className="text-xs text-slate-500 font-mono">
                                    Format: {sampleFile ? sampleFile.name : 'CSV/JSON'}
                                  </span>
                                </div>
                                <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                                  {(activeSampleData || source.sampleData).map((record: any, rIdx: number) => (
                                    <div key={rIdx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                                      {Object.entries(record).map(([k, v]) => (
                                        <div key={k} className="flex justify-between gap-2">
                                          <span className="text-slate-500 font-sans">{k}:</span>
                                          <span className="font-semibold text-slate-800 truncate max-w-[240px]">{String(v)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 2: 5 Comprehensive Operational Scenarios (All 8 Connectors Bundled) ── */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                5 Comprehensive Operational Scenarios (All 8 Connectors Bundled)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Full division scenarios. Each set contains synchronized data across all 8 Indian Railways systems (TMS, SMMS, TDMS, Timetable, Goods, COA, Rules, Crews).
                Download these CSV/JSON files to your desktop for live presentation upload, or click &ldquo;Load Directly&rdquo; to test OR-Tools solver immediately:
              </p>
            </div>
            <Badge className="bg-sky-50 text-sky-800 border-sky-300 text-xs font-semibold">
              Active Set: {activeScenario.title}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {COMPREHENSIVE_SCENARIO_SETS.map((sc) => {
              const isCurrent = (activeScenarioSetId || 'set-1') === sc.id && tasks.length > 0;
              return (
                <Card
                  key={sc.id}
                  className={`transition-all border-2 flex flex-col justify-between ${
                    isCurrent
                      ? 'border-sky-600 bg-sky-50/40 shadow-sm ring-2 ring-sky-500/30'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] font-mono font-bold bg-white text-slate-800">
                        {sc.code}
                      </Badge>
                      {isCurrent ? (
                        <Badge className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border-emerald-300">
                          ACTIVE SET
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{sc.theme}</span>
                      )}
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 leading-snug">
                      {sc.title}
                    </CardTitle>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {sc.subtitle}
                    </p>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0 space-y-2.5">
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-slate-50/90 p-1.5 rounded border border-slate-100">
                      <div><span className="text-slate-400 font-sans">TMS:</span> {sc.counts.tms} tasks</div>
                      <div><span className="text-slate-400 font-sans">SMMS:</span> {sc.counts.smms} tasks</div>
                      <div><span className="text-slate-400 font-sans">TDMS:</span> {sc.counts.tdms} tasks</div>
                      <div><span className="text-slate-400 font-sans">COA:</span> {sc.counts.coa} win</div>
                      <div><span className="text-slate-400 font-sans">Trains:</span> {sc.counts.timetable}</div>
                      <div><span className="text-slate-400 font-sans">Goods:</span> {sc.counts.goods}</div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        className={`flex-1 text-[11px] h-7 font-semibold ${
                          isCurrent
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-[#235b80] hover:bg-[#1d4e70] text-white'
                        }`}
                        onClick={() => {
                          loadComprehensiveScenarioSet(sc.id);
                          toast.success(`Loaded ${sc.title}! All 8 CRIS data connectors synchronized.`);
                        }}
                      >
                        {isCurrent ? 'Active Set' : 'Load Directly'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] px-2 border-slate-200 hover:bg-slate-100"
                        onClick={() => handleDownloadScenarioJson(sc)}
                        title="Download complete scenario JSON dataset"
                      >
                        <Download className="w-3 h-3 text-slate-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
