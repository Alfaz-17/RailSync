'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePrototypeStore } from '@/store/prototype-store';
import { MaintenanceTask, Department, PriorityBand } from '@/types/domain';
import { formatDuration, getDueStatusLabel, getDueStatus } from '@/lib/format';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowUpDown, Info, Plus, Trash2, ArrowRight, ClipboardList, Upload, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { toast } from 'sonner';

const deptColors: Record<Department, string> = {
  Engineering: '#1473E6',
  Signal: '#0F8B7E',
  Traction: '#C28012',
};

const priorityColors: Record<PriorityBand, string> = {
  Critical: '#D94B45',
  High: '#F28C18',
  Medium: '#1473E6',
  Low: '#64748B',
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: '#F28C1810', text: '#F28C18', border: '#F28C1830' },
  SCHEDULED: { bg: '#1473E610', text: '#1473E6', border: '#1473E630' },
  APPROVED: { bg: '#18864B10', text: '#18864B', border: '#18864B30' },
  COMPLETED: { bg: '#64748B10', text: '#64748B', border: '#64748B30' },
  CANCELLED: { bg: '#D94B4510', text: '#D94B45', border: '#D94B4530' },
};

const corridorMap: Record<string, string> = {
  C001: 'Ahmedabad → Nadiad',
  C002: 'Nadiad → Vadodara',
  C003: 'Vadodara → Surat',
  C004: 'Surat → Mumbai Central',
  C005: 'Mumbai Central → Churchgate',
};

function TasksContent() {
  const { tasks, addTask, deleteTask, loadGoldenScenario } = usePrototypeStore();
  const searchParams = useSearchParams();
  const corridorParam = searchParams.get('corridor');

  const [search, setSearch] = useState('');
  const [deptTab, setDeptTab] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [corridorFilter, setCorridorFilter] = useState<string>(corridorParam || 'all');
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  useEffect(() => {
    if (corridorParam) {
      setCorridorFilter(corridorParam);
    }
  }, [corridorParam]);

  // Add Task Modal State with Multi-Factor Scoring
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState<Department>('Engineering');
  const [newCorridor, setNewCorridor] = useState('C001');
  const [newDuration, setNewDuration] = useState('90');
  const [newResource, setNewResource] = useState('Track Gang A');
  const [safetyRating, setSafetyRating] = useState<number>(8); // 1-10 (35%)
  const [criticalityRating, setCriticalityRating] = useState<number>(8); // 1-10 (25%)
  const [urgencyRating, setUrgencyRating] = useState<number>(8); // 1-10 (25%)
  const [availabilityRating, setAvailabilityRating] = useState<number>(7); // 1-10 (15%)

  // Dynamically calculate composite priority score (0 - 100)
  const calculatedScore = useMemo(() => {
    return Math.min(
      100,
      Math.max(
        10,
        Math.round(
          safetyRating * 3.5 +
          criticalityRating * 2.5 +
          urgencyRating * 2.5 +
          availabilityRating * 1.5
        )
      )
    );
  }, [safetyRating, criticalityRating, urgencyRating, availabilityRating]);

  // Derive priority band from calculated score
  const calculatedBand: PriorityBand = useMemo(() => {
    if (calculatedScore >= 85) return 'Critical';
    if (calculatedScore >= 70) return 'High';
    if (calculatedScore >= 50) return 'Medium';
    return 'Low';
  }, [calculatedScore]);

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.corridorName.toLowerCase().includes(q)
      );
    }
    if (deptTab !== 'all') {
      result = result.filter((t) => t.department === deptTab);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priorityBand === priorityFilter);
    }
    if (corridorFilter !== 'all') {
      result = result.filter((t) => t.corridorId === corridorFilter);
    }

    result.sort((a, b) =>
      sortDesc ? b.priorityScore - a.priorityScore : a.priorityScore - b.priorityScore
    );

    return result;
  }, [tasks, search, deptTab, priorityFilter, corridorFilter, sortDesc]);

  const corridors = [...new Set(tasks.map((t) => t.corridorId))].sort();

  function handleCreateTask() {
    if (!newTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const dur = parseInt(newDuration, 10) || 90;
    const prefix = newDept === 'Engineering' ? 'ENG' : newDept === 'Signal' ? 'SIG' : 'TRD';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `${prefix}-USR-${randomNum}`;

    const createdTask: MaintenanceTask = {
      id: newId,
      source: newDept === 'Engineering' ? 'TMS' : newDept === 'Signal' ? 'SMMS' : 'TDMS',
      department: newDept,
      corridorId: newCorridor,
      corridorName: corridorMap[newCorridor] || 'Ahmedabad → Nadiad',
      title: newTitle.trim(),
      durationMin: dur,
      priorityScore: calculatedScore,
      priorityBand: calculatedBand,
      status: 'PENDING',
      dueDate: '2026-09-30',
      criticality: criticalityRating,
      urgency: urgencyRating,
      safetyImpact: safetyRating,
      availabilityImpact: availabilityRating,
      requiredState: newDept === 'Traction' ? 'Power Block' : 'Track Possession',
      requiredResource: newResource,
      notes: `IR-PW Scored: Safety ${safetyRating}, Crit ${criticalityRating}, Urg ${urgencyRating}, Avail ${availabilityRating}`,
    };

    addTask(createdTask);
    toast.success(`Task ${newId} created with calculated priority P${calculatedScore} (${calculatedBand})!`);
    setIsAddOpen(false);
    setNewTitle('');
    toast.success(`Task ${newId} added to active workbank! Run Build a Plan to schedule it.`);
  }

  return (
    <div>
      <Topbar title="Maintenance Workbank" description="All track, signal, and traction work in one place." />

      <div className="page-content space-y-4">
        <section className="page-intro flex-wrap gap-4">
          <div>
            <div className="eyebrow">TMS + SMMS + TDMS Integration</div>
            <h2>What maintenance needs work?</h2>
            <p>Filter tasks by department, priority, or corridor. Click a row to open the detail drawer.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold">{tasks.length} tasks loaded</Badge>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-900 bg-amber-50/80 hover:bg-amber-100 gap-1.5 h-9 text-xs font-medium"
              onClick={() => {
                loadGoldenScenario();
                toast.success('Loaded 4-Task Golden Demo (C001 Corridor)!');
              }}
              title="Loads the 4-task Golden Scenario for the 90-second demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Golden Demo (4 Tasks)
            </Button>
            <Button
              size="sm"
              className="bg-[#235b80] hover:bg-[#1d4e70] text-white gap-1.5 h-9 text-xs font-medium"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="w-4 h-4" /> Add Task
            </Button>
            <Link href="/optimize">
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 h-9 text-xs font-semibold"
              >
                Build Plan ({tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Department Tab Filters */}
        <Tabs value={deptTab} onValueChange={setDeptTab}>
          <TabsList className="bg-[var(--muted)]">
            <TabsTrigger value="all" className="text-xs">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="Engineering" className="text-xs">Engineering ({tasks.filter(t => t.department === 'Engineering').length})</TabsTrigger>
            <TabsTrigger value="Signal" className="text-xs">S&T ({tasks.filter(t => t.department === 'Signal').length})</TabsTrigger>
            <TabsTrigger value="Traction" className="text-xs">Traction ({tasks.filter(t => t.department === 'Traction').length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search & Filters */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                aria-label="Search maintenance tasks"
                placeholder="Search by task ID, title, or corridor…"
                className="pl-9 text-sm h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v || 'all')}>
              <SelectTrigger className="w-[140px] text-xs h-10">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={corridorFilter} onValueChange={(v) => setCorridorFilter(v || 'all')}>
              <SelectTrigger className="w-[160px] text-xs h-10">
                <SelectValue placeholder="Corridor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Corridors</SelectItem>
                {corridors.map((c) => (
                  <SelectItem key={c} value={c}>{c} ({corridorMap[c] || c})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-10 gap-1.5"
              onClick={() => setSortDesc(!sortDesc)}
            >
              <ArrowUpDown size={14} />
              {sortDesc ? 'Highest score' : 'Lowest score'}
            </Button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            {tasks.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Unified Workbank is Clean (0 Tasks)</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No maintenance demands have been fed into RailSync yet. You can upload custom CSV / JSON files or choose from the 5 pre-configured scenario sets on the Data Sources page.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Link href="/data-sources">
                    <Button size="sm" className="bg-[#235b80] hover:bg-[#1d4e70] text-white text-xs gap-1.5 h-8">
                      <Upload className="w-3.5 h-3.5" /> Go to Data Sources to Feed Data
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setIsAddOpen(true)}>
                    + Create Task Manually
                  </Button>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No tasks match your filter criteria.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <tr>
                    <th className="py-3 px-4 font-medium text-xs">ID</th>
                    <th className="py-3 px-4 font-medium text-xs">Title</th>
                    <th className="py-3 px-4 font-medium text-xs">Dept</th>
                    <th className="py-3 px-4 font-medium text-xs">Corridor</th>
                    <th className="py-3 px-4 font-medium text-xs text-right">Duration</th>
                    <th className="py-3 px-4 font-medium text-xs text-center">Priority</th>
                    <th className="py-3 px-4 font-medium text-xs text-center">Due Status</th>
                    <th className="py-3 px-4 font-medium text-xs">Resource</th>
                    <th className="py-3 px-4 font-medium text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((task) => {
                    const dueStatus = getDueStatus(task.dueDate);
                    const isUserAdded = task.id.includes('USR');
                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-xs text-[var(--foreground)]">
                          {task.id}
                          {isUserAdded && (
                            <span className="ml-1 px-1 py-0.5 text-[9px] bg-teal-100 text-teal-800 rounded font-bold">NEW</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-[var(--foreground)]">{task.title}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="text-[11px] font-semibold"
                            style={{ color: deptColors[task.department], borderColor: `${deptColors[task.department]}40` }}
                          >
                            {task.department}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--muted-foreground)]">
                          <span className="font-mono">{task.corridorId}</span> · {task.corridorName}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-[var(--foreground)]">
                          {formatDuration(task.durationMin)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold font-mono"
                            style={{ backgroundColor: `${priorityColors[task.priorityBand]}15`, color: priorityColors[task.priorityBand] }}
                          >
                            P{task.priorityScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={`text-[11px] ${
                              dueStatus === 'overdue'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : dueStatus === 'today'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {getDueStatusLabel(task.dueDate)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--muted-foreground)]">{task.requiredResource}</td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {isUserAdded && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                deleteTask(task.id);
                                toast.info(`Task ${task.id} removed`);
                              }}
                              title="Remove task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Add Maintenance Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Task Title *</label>
              <Input
                placeholder="e.g. Ultrasonic Rail Flaw Detection (USFD)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Department</label>
                <Select value={newDept} onValueChange={(v) => setNewDept(v as Department)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Signal">Signal & Telecom</SelectItem>
                    <SelectItem value="Traction">Traction (TRD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Corridor</label>
                <Select value={newCorridor} onValueChange={(v) => { if (v) setNewCorridor(v); }}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(corridorMap).map(([id, name]) => (
                      <SelectItem key={id} value={id}>{id}: {name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  min="30"
                  max="360"
                  step="15"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Required Equipment / Gang</label>
                <Input
                  placeholder="e.g. Track Gang A, Tamping Machine, Signal Crew 1"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Indian Railways Multi-Factor Priority Scoring Engine */}
            <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-sky-200/60 pb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  Multi-Factor Priority Scoring Engine
                </span>
                <span className="text-[10px] font-mono text-sky-800 font-semibold bg-sky-100 px-2 py-0.5 rounded">
                  IR-PW / TMS Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Rate the 4 standard Indian Railways criteria (1 to 10). RailSync dynamically computes the objective solver priority score:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {/* 1. Safety Impact */}
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-semibold">1. Safety Impact (35%)</span>
                    <span className="font-bold font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {safetyRating} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={safetyRating}
                    onChange={(e) => setSafetyRating(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-rose-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">10 = Derailment / Major Fracture Risk</span>
                </div>

                {/* 2. Asset Criticality */}
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-semibold">2. Asset Criticality (25%)</span>
                    <span className="font-bold font-mono text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      {criticalityRating} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={criticalityRating}
                    onChange={(e) => setCriticalityRating(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">10 = Mainline Bridge / EI Route Point</span>
                </div>

                {/* 3. Inspection Urgency */}
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-semibold">3. Inspection Urgency (25%)</span>
                    <span className="font-bold font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {urgencyRating} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={urgencyRating}
                    onChange={(e) => setUrgencyRating(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-amber-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">10 = Statutory Inspection Overdue</span>
                </div>

                {/* 4. Availability Impact */}
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 font-semibold">4. Availability Impact (15%)</span>
                    <span className="font-bold font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      {availabilityRating} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={availabilityRating}
                    onChange={(e) => setAvailabilityRating(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-teal-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">10 = Imposes 30 km/h Caution Order</span>
                </div>
              </div>

              {/* Dynamic Formula Result */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-300 flex items-center justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Calculated Priority:</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      P{calculatedScore} / 100
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold"
                      style={{
                        color: priorityColors[calculatedBand],
                        borderColor: `${priorityColors[calculatedBand]}50`,
                        backgroundColor: `${priorityColors[calculatedBand]}15`,
                      }}
                    >
                      {calculatedBand} Priority
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Score = (3.5×{safetyRating}) + (2.5×{criticalityRating}) + (2.5×{urgencyRating}) + (1.5×{availabilityRating}) = {calculatedScore}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-[#235b80] hover:bg-[#1d4e70] text-white" onClick={handleCreateTask}>
              Add to Workbank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-full sm:max-w-[440px] overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base font-bold flex items-center justify-between">
                  <span>{selectedTask.id}</span>
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold"
                    style={{ color: deptColors[selectedTask.department], borderColor: `${deptColors[selectedTask.department]}40` }}
                  >
                    {selectedTask.department}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{selectedTask.title}</h4>
                  <p className="text-slate-500">{selectedTask.corridorId} · {selectedTask.corridorName}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Duration</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{formatDuration(selectedTask.durationMin)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Priority Score</span>
                    <span className="font-bold font-mono text-sm" style={{ color: priorityColors[selectedTask.priorityBand] }}>
                      P{selectedTask.priorityScore} ({selectedTask.priorityBand})
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Priority Evidence Breakdown</span>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Criticality (30%)</span>
                      <span className="font-mono font-bold text-slate-900">{selectedTask.criticality * 10}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Urgency (25%)</span>
                      <span className="font-mono font-bold text-slate-900">{selectedTask.urgency * 10}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Safety Impact (20%)</span>
                      <span className="font-mono font-bold text-slate-900">{selectedTask.safetyImpact * 10}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Availability Impact (15%)</span>
                      <span className="font-mono font-bold text-slate-900">{selectedTask.availabilityImpact * 10}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Overdue Severity (10%)</span>
                      <span className="font-mono font-bold text-slate-900">80/100</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Final Priority Score</span>
                      <span className="font-mono text-rose-700">{selectedTask.priorityScore} — {selectedTask.priorityBand}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Priority determines importance, not feasibility. A high-priority task still cannot violate hard safety or operational constraints.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Operational Requirements</span>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                    <p><strong className="text-slate-700">Required State:</strong> {selectedTask.requiredState}</p>
                    <p><strong className="text-slate-700">Required Resource:</strong> {selectedTask.requiredResource}</p>
                    <p><strong className="text-slate-700">Source System:</strong> {selectedTask.source}</p>
                  </div>
                </div>
                {selectedTask.notes && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">Inspector Notes</span>
                    <p className="p-2.5 rounded bg-amber-50/70 border border-amber-200 text-amber-900 italic">
                      {selectedTask.notes}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500 font-mono">Loading maintenance workbank...</div>}>
      <TasksContent />
    </Suspense>
  );
}
