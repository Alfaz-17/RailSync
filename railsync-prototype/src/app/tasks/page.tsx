'use client';

import { Topbar } from '@/components/app-shell/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { tasks } from '@/data/tasks';
import { MaintenanceTask, Department, PriorityBand } from '@/types/domain';
import { formatDuration, getDueStatusLabel, getDueStatus } from '@/lib/format';
import { Search, ArrowUpDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

const deptColors: Record<Department, string> = {
  Engineering: '#245F8E',
  Signal: '#D97706',
  Traction: '#6D4AFF',
};

const priorityColors: Record<PriorityBand, string> = {
  Critical: '#B91C1C',
  High: '#D97706',
  Medium: '#245F8E',
  Low: '#64748B',
};

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
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
    if (deptFilter !== 'all') {
      result = result.filter((t) => t.department === deptFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priorityBand === priorityFilter);
    }
    if (corridorFilter !== 'all') {
      result = result.filter((t) => t.corridorId === corridorFilter);
    }

    result.sort((a, b) => (sortDesc ? b.priorityScore - a.priorityScore : a.priorityScore - b.priorityScore));

    return result;
  }, [search, deptFilter, priorityFilter, corridorFilter, sortDesc]);

  const corridors = [...new Set(tasks.map((t) => t.corridorId))].sort();

  return (
    <div>
      <Topbar title="Maintenance tasks" description="Track, signal, and power work in one list." />

      <div className="p-6 max-w-[1440px] mx-auto space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white px-5 py-4"><h2 className="text-base font-semibold text-slate-900">Find the work that needs attention</h2><p className="mt-1 text-sm text-slate-600 leading-relaxed">Filter tasks by department, priority, or track section. Select a task to see its deadline and crew needs.</p></section>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  aria-label="Search maintenance tasks" placeholder="Search by task, ID, or section…"
                  className="pl-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v || 'all')}>
                <SelectTrigger aria-label="Department" className="w-[175px] text-sm">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Signal">Signal & Telecom</SelectItem>
                  <SelectItem value="Traction">Traction</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v || 'all')}>
                <SelectTrigger aria-label="Priority" className="w-[140px] text-sm">
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
                <SelectTrigger aria-label="Track section" className="w-[150px] text-sm">
                  <SelectValue placeholder="Track section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sections</SelectItem>
                  {corridors.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setSortDesc(!sortDesc)}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Priority {sortDesc ? '↓' : '↑'}
              </Button>
              <Badge variant="secondary" className="text-xs">
                {filtered.length} of {tasks.length} tasks
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Task ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Source</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Department</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Track section</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Work</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Duration</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Priority</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Due</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#0F172A] text-xs">Work conditions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-sm text-slate-600">No tasks match these filters. Try another search or department.</td></tr>}
                  {filtered.map((task, i) => {
                    const dueStatus = getDueStatus(task.dueDate);
                    return (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b hover:bg-slate-50 cursor-pointer transition-colors focus-visible:bg-slate-100" role="button" tabIndex={0} aria-label={`Open task ${task.id}: ${task.title}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedTask(task); } }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0F172A]">{task.id}</td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">{task.source}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] font-medium" style={{ color: deptColors[task.department], borderColor: `${deptColors[task.department]}40` }}>
                            {task.department}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">{task.corridorName}</td>
                        <td className="px-4 py-3 text-xs font-medium text-[#0F172A]">{task.title}</td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">{formatDuration(task.durationMin)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold" style={{ color: priorityColors[task.priorityBand] }}>{task.priorityScore}</span>
                            <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: `${priorityColors[task.priorityBand]}15`, color: priorityColors[task.priorityBand], border: `1px solid ${priorityColors[task.priorityBand]}30` }}>
                              {task.priorityBand}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${dueStatus === 'overdue' ? 'text-red-600 border-red-300 bg-red-50' : dueStatus === 'today' ? 'text-amber-600 border-amber-300 bg-amber-50' : 'text-slate-500 border-slate-300'}`}>
                            {getDueStatusLabel(task.dueDate)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">{task.requiredState}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-full sm:max-w-[440px]">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-base">
                  <span className="font-mono">{selectedTask.id}</span>
                  <Badge variant="outline" className="text-[10px]" style={{ color: deptColors[selectedTask.department], borderColor: `${deptColors[selectedTask.department]}40` }}>
                    {selectedTask.department}
                  </Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">{selectedTask.title}</h3>
                  <p className="text-sm text-[#64748B] mt-1">{selectedTask.corridorName} • {selectedTask.source}</p>
                </div>

                {selectedTask.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">{selectedTask.notes}</p>
                  </div>
                )}

                <Separator />

                {/* Priority Breakdown */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Info className="w-4 h-4 text-[#245F8E]" />
                    <h4 className="text-sm font-semibold text-[#0F172A]">Why this priority?</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Importance', value: selectedTask.criticality },
                      { label: 'Urgency', value: selectedTask.urgency },
                      { label: 'Safety Impact', value: selectedTask.safetyImpact },
                      { label: 'Effect on train service', value: selectedTask.availabilityImpact },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-[#64748B]">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#245F8E]"
                              style={{ width: `${item.value * 10}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-[#0F172A] w-8 text-right">{item.value}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-[#64748B]">
                      Demo priority score: <span className="font-bold text-[#0F172A]">{selectedTask.priorityScore}</span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748B]">Duration</span>
                    <span className="font-medium text-[#0F172A]">{formatDuration(selectedTask.durationMin)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748B]">Track conditions</span>
                    <span className="font-medium text-[#0F172A]">{selectedTask.requiredState}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748B]">Crew or equipment</span>
                    <span className="font-medium text-[#0F172A]">{selectedTask.requiredResource}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748B]">Due Date</span>
                    <span className="font-medium text-[#0F172A]">{selectedTask.dueDate}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
