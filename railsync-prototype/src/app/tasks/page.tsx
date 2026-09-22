'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { tasks } from '@/data/tasks';
import { MaintenanceTask, Department, PriorityBand } from '@/types/domain';
import { formatDuration, getDueStatusLabel, getDueStatus } from '@/lib/format';
import { Search, ArrowUpDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

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

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [deptTab, setDeptTab] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [corridorFilter, setCorridorFilter] = useState<string>('all');
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.corridorName.toLowerCase().includes(q)
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

    result.sort((a, b) => (sortDesc ? b.priorityScore - a.priorityScore : a.priorityScore - b.priorityScore));

    return result;
  }, [search, deptTab, priorityFilter, corridorFilter, sortDesc]);

  const corridors = [...new Set(tasks.map((t) => t.corridorId))].sort();

  return (
    <div>
      <Topbar title="Maintenance Workbank" description="All track, signal, and traction work in one place." />

      <div className="page-content space-y-4">
        <section className="page-intro">
          <div>
            <div className="eyebrow">TMS + SMMS + TDMS Integration</div>
            <h2>What maintenance needs work?</h2>
            <p>Filter tasks by department, priority, or corridor. Click a row to open the detail drawer.</p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">{tasks.length} tasks loaded</Badge>
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
                aria-label="Search maintenance tasks" placeholder="Search by task ID, title, or corridor…"
                className="pl-9 text-sm h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v || 'all')}>
              <SelectTrigger aria-label="Priority" className="w-[140px] text-sm h-10">
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
              <SelectTrigger aria-label="Corridor" className="w-[150px] text-sm h-10">
                <SelectValue placeholder="Corridor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All corridors</SelectItem>
                {corridors.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-10"
              onClick={() => setSortDesc(!sortDesc)}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Priority {sortDesc ? '↓' : '↑'}
            </Button>
            <Badge variant="secondary" className="text-xs">
              {filtered.length} of {tasks.length}
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Task</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Department</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Corridor</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Work</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Duration</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Priority</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] text-xs">Due</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-sm text-[var(--muted-foreground)]">No tasks match these filters. Try another search or department.</td></tr>}
                {filtered.map((task, i) => {
                  const dueStatus = getDueStatus(task.dueDate);
                  const sColors = statusColors[task.status] || statusColors.PENDING;
                  return (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                      className="border-b border-[var(--border)] hover:bg-[var(--muted)] cursor-pointer transition-colors h-[52px]"
                      role="button" tabIndex={0}
                      aria-label={`Open task ${task.id}: ${task.title}`}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedTask(task); } }}
                      onClick={() => setSelectedTask(task)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--foreground)]">{task.id}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs font-medium" style={{ color: deptColors[task.department], borderColor: `${deptColors[task.department]}40` }}>
                          {task.department === 'Signal' ? 'S&T' : task.department}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{task.corridorId}</td>
                      <td className="px-4 py-3 text-xs font-medium text-[var(--foreground)]">{task.title}</td>
                      <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] font-mono">{formatDuration(task.durationMin)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Badge className="text-xs px-1.5 py-0" style={{ backgroundColor: `${priorityColors[task.priorityBand]}12`, color: priorityColors[task.priorityBand], border: `1px solid ${priorityColors[task.priorityBand]}30` }}>
                            {task.priorityBand}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="text-xs" style={{ backgroundColor: sColors.bg, color: sColors.text, border: `1px solid ${sColors.border}` }}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs ${dueStatus === 'overdue' ? 'text-[#D94B45] border-[#D94B4540] bg-[#D94B4508]' : dueStatus === 'today' ? 'text-[#F28C18] border-[#F28C1840] bg-[#F28C1808]' : 'text-[var(--muted-foreground)] border-[var(--border)]'}`}>
                          {getDueStatusLabel(task.dueDate)}
                        </Badge>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-full sm:max-w-[440px]">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-base">
                  <span className="font-mono">{selectedTask.id}</span>
                  <Badge variant="outline" className="text-xs" style={{ color: deptColors[selectedTask.department], borderColor: `${deptColors[selectedTask.department]}40` }}>
                    {selectedTask.department === 'Signal' ? 'S&T' : selectedTask.department}
                  </Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{selectedTask.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{selectedTask.corridorName} · {selectedTask.source}</p>
                </div>

                {selectedTask.notes && (
                  <div className="bg-[#F28C1808] border border-[#F28C1830] rounded-lg p-3">
                    <p className="text-xs text-[#C28012]">{selectedTask.notes}</p>
                  </div>
                )}

                <Separator />

                {/* Priority Breakdown */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Info className="w-4 h-4 text-[var(--rail-blue)]" />
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">Why this priority?</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-[var(--muted-foreground)] cursor-help">ⓘ</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">Priority Score combines criticality, urgency, safety impact, and effect on train availability.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Importance', value: selectedTask.criticality },
                      { label: 'Urgency', value: selectedTask.urgency },
                      { label: 'Safety Impact', value: selectedTask.safetyImpact },
                      { label: 'Effect on train service', value: selectedTask.availabilityImpact },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--muted-foreground)]">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-[var(--muted)] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${item.value * 10}%`, backgroundColor: 'var(--rail-blue)' }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-[var(--foreground)] w-8 text-right">{item.value}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-[var(--muted)] rounded-lg p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Priority Score: <span className="font-bold text-[var(--foreground)]">{selectedTask.priorityScore}</span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-2.5">
                  {[
                    { label: 'Duration', value: formatDuration(selectedTask.durationMin) },
                    { label: 'Status', value: selectedTask.status },
                    { label: 'Track conditions', value: selectedTask.requiredState },
                    { label: 'Crew or equipment', value: selectedTask.requiredResource },
                    { label: 'Due Date', value: selectedTask.dueDate },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-[var(--muted-foreground)]">{item.label}</span>
                      <span className="font-medium text-[var(--foreground)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
