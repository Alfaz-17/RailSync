'use client';

import Link from 'next/link';
import { Topbar } from '@/components/app-shell/topbar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { tasks } from '@/data/tasks';
import { coaWindows } from '@/data/windows';
import { getDueStatus } from '@/lib/format';
import {
  ClipboardList, CalendarDays, ShieldCheck, Users,
  Wrench, Radio, Zap, ArrowRight, Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell,
  PieChart, Pie, Tooltip as RechartsTooltip, Legend,
} from 'recharts';

const departments = [
  { key: 'Engineering' as const, label: 'Engineering', detail: 'Track, bridges, and civil work', icon: Wrench, color: 'var(--dept-engineering)' },
  { key: 'Signal' as const, label: 'Signal & Telecom', detail: 'Signals and communication equipment', icon: Radio, color: 'var(--dept-signal)' },
  { key: 'Traction' as const, label: 'Traction', detail: 'Power supply and overhead lines', icon: Zap, color: 'var(--dept-traction)' },
];

const deptChartData = departments.map(d => ({
  name: d.label,
  tasks: tasks.filter(t => t.department === d.key).length,
  color: d.key === 'Engineering' ? '#1473E6' : d.key === 'Signal' ? '#0F8B7E' : '#C28012',
}));

const priorityChartData = [
  { name: 'Critical', value: tasks.filter(t => t.priorityBand === 'Critical').length, color: '#D94B45' },
  { name: 'High', value: tasks.filter(t => t.priorityBand === 'High').length, color: '#F28C18' },
  { name: 'Medium', value: tasks.filter(t => t.priorityBand === 'Medium').length, color: '#1473E6' },
  { name: 'Low', value: tasks.filter(t => t.priorityBand === 'Low').length, color: '#64748B' },
];

export default function DashboardPage() {
  const criticalCount = tasks.filter(t => t.priorityBand === 'Critical').length;

  const stats = [
    { label: 'Maintenance Tasks', value: tasks.length, note: `${criticalCount} Critical`, icon: ClipboardList, href: '/tasks' },
    { label: 'Candidate Windows', value: coaWindows.length, note: 'Across 5 corridors', icon: CalendarDays, href: '/data-sources' },
    { label: 'Compatibility Rules', value: 12, note: 'Cross-department checks', icon: ShieldCheck, href: '/optimize' },
    { label: 'Resources', value: 15, note: 'Crews & equipment', icon: Users, href: '/data-sources' },
  ];

  return (
    <div>
      <Topbar title="Command Center" description="Your maintenance planning situation at a glance." />
      <div className="page-content space-y-6">
        <section className="page-intro">
          <div>
            <div className="eyebrow">Weekly maintenance · Western Railway</div>
            <h2>Three departments. One shared plan.</h2>
            <p>Coordinate track, signal, and traction maintenance across corridors. Find tasks that can share a block, then review the plan before approval.</p>
          </div>
          <Button render={<Link href="/optimize" />} className="h-10 px-5 bg-[var(--primary)] hover:bg-[#091F40] text-white">
            Start Optimization <ArrowRight size={16} />
          </Button>
        </section>

        {/* KPI Cards — one card = one message */}
        <div className="stat-grid">
          {stats.map(({ label, value, note, icon: Icon, href }) => (
            <Link href={href} key={label} className="stat-tile">
              <div className="stat-label"><span>{label}</span><Icon size={18} strokeWidth={1.6} /></div>
              <p className="stat-value">{value}</p>
              <p className="stat-note">{note}</p>
            </Link>
          ))}
        </div>

        {/* 2 charts max on dashboard as per spec */}
        <div className="dashboard-columns">
          {/* Chart 1: Tasks by Department */}
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Maintenance Tasks by Department</h2>
                <p>Distribution across Engineering, S&T, and Traction</p>
              </div>
              <Link className="text-link" href="/tasks">View all <ArrowRight size={14} /></Link>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptChartData} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: 'var(--foreground)', fontWeight: 500 }} width={120} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                  />
                  <Bar dataKey="tasks" radius={[0, 6, 6, 0]} barSize={28}>
                    {deptChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 2: Priority Distribution */}
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Priority Distribution</h2>
                <p>Tasks by urgency level</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} className="text-[var(--muted-foreground)] cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Priority based on criticality, urgency, safety, and availability impact scores.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="p-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-[var(--foreground)]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Department breakdown */}
        <section className="panel">
          <div className="panel-heading">
            <div><h2>Work by Department</h2><p>All maintenance tasks in one place</p></div>
            <Link className="text-link" href="/tasks">View workbank <ArrowRight size={14} /></Link>
          </div>
          {departments.map(({ key, label, detail, icon: Icon, color }) => (
            <div key={key} className="department-row">
              <span className="department-icon" style={{ color }}><Icon size={18} strokeWidth={1.7} /></span>
              <div className="department-copy"><strong>{label}</strong><small>{detail}</small></div>
              <div className="department-count">{tasks.filter(t => t.department === key).length}<small>tasks</small></div>
            </div>
          ))}
        </section>

        {/* Workflow steps */}
        <section className="panel">
          <div className="panel-heading"><div><h2>Plan the Week</h2><p>Review the work, combine suitable tasks, then approve.</p></div><span className="demo-label">Sample workflow</span></div>
          <div className="next-steps">
            {[
              { href: '/tasks', title: 'Review the workbank', text: 'Check deadlines, priority, and work requirements.' },
              { href: '/optimize', title: 'Run optimization', text: 'Find compatible tasks and optimal block windows.' },
              { href: '/plan', title: 'Approve the plan', text: 'Review recommendations and sign off.' },
            ].map((step, i) => <Link key={step.href} href={step.href} className="next-step"><span className="step-number">{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowRight size={15} className="ml-auto shrink-0 mt-1 text-[var(--muted-foreground)]" /></Link>)}
          </div>
        </section>
        <p className="section-note">This demo uses synthetic railway data for the Vadodara Division. A block is a period when a track is reserved for maintenance.</p>
      </div>
    </div>
  );
}
