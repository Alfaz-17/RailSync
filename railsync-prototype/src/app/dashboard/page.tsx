'use client';

import Link from 'next/link';
import { Topbar } from '@/components/app-shell/topbar';
import { Button } from '@/components/ui/button';
import { tasks } from '@/data/tasks';
import { coaWindows } from '@/data/windows';
import { getDueStatus } from '@/lib/format';
import { ClipboardList, AlertCircle, Clock3, CalendarDays, Wrench, Radio, Zap, ArrowRight } from 'lucide-react';

const departments = [
  { key: 'Engineering', label: 'Engineering', detail: 'Track, bridges, and civil work', icon: Wrench, color: '#235b80' },
  { key: 'Signal', label: 'Signal & telecom', detail: 'Signals and communication equipment', icon: Radio, color: '#926514' },
  { key: 'Traction', label: 'Traction', detail: 'Power supply and overhead lines', icon: Zap, color: '#14736d' },
];
const priorities = [
  { label: 'Critical', color: '#b42332' },
  { label: 'High', color: '#926514' },
  { label: 'Medium', color: '#235b80' },
  { label: 'Low', color: '#64748b' },
];

export default function DashboardPage() {
  const stats = [
    { label: 'Maintenance tasks', value: tasks.length, note: 'Across three departments', icon: ClipboardList, href: '/tasks' },
    { label: 'Critical tasks', value: tasks.filter(t => t.priorityBand === 'Critical').length, note: 'Need priority attention', icon: AlertCircle, href: '/tasks' },
    { label: 'Overdue tasks', value: tasks.filter(t => getDueStatus(t.dueDate) === 'overdue').length, note: 'As of the demo date, 17 Sep', icon: Clock3, href: '/tasks' },
    { label: 'Possible time slots', value: coaWindows.length, note: 'To review before planning', icon: CalendarDays, href: '/data-sources' },
  ];
  return (
    <div>
      <Topbar title="Overview" description="Your maintenance week at a glance." />
      <div className="page-content space-y-6">
        <section className="page-intro">
          <div>
            <div className="eyebrow">Weekly maintenance · Western Railway</div>
            <h2>Three departments. One shared plan.</h2>
            <p>Bring track, signal, and power work together. Find tasks that can share a track closure, then review the plan before approval.</p>
          </div>
          <Button render={<Link href="/current-plan" />} className="h-10 px-4">Review current plan <ArrowRight size={16} /></Button>
        </section>

        <div className="stat-grid">
          {stats.map(({ label, value, note, icon: Icon, href }) => (
            <Link href={href} key={label} className="stat-tile">
              <div className="stat-label"><span>{label}</span><Icon size={17} strokeWidth={1.6} /></div>
              <p className="stat-value">{value}</p>
              <p className="stat-note">{note}</p>
            </Link>
          ))}
        </div>

        <div className="dashboard-columns">
          <section className="panel">
            <div className="panel-heading"><div><h2>Work by department</h2><p>All maintenance tasks in one place</p></div><Link className="text-link" href="/tasks">View tasks <ArrowRight size={14} /></Link></div>
            {departments.map(({ key, label, detail, icon: Icon, color }) => (
              <div key={key} className="department-row">
                <span className="department-icon" style={{ color }}><Icon size={18} strokeWidth={1.7} /></span>
                <div className="department-copy"><strong>{label}</strong><small>{detail}</small></div>
                <div className="department-count">{tasks.filter(t => t.department === key).length}<small>tasks</small></div>
              </div>
            ))}
          </section>
          <section className="panel">
            <div className="panel-heading"><div><h2>What needs attention</h2><p>Tasks grouped by priority</p></div></div>
            <div className="p-5">
              {priorities.map(({ label, color }) => {
                const count = tasks.filter(t => t.priorityBand === label).length;
                return <div key={label} className="priority-row"><span>{label}</span><div className="priority-track"><div style={{ width: `${count / tasks.length * 100}%`, background: color }} /></div><strong>{count}</strong></div>;
              })}
            </div>
            <p className="section-note px-5 pb-5">Open a task to see its deadline, priority, and required crew.</p>
          </section>
        </div>

        <section className="panel">
          <div className="panel-heading"><div><h2>Plan the week</h2><p>Review the work, combine suitable tasks, then approve.</p></div><span className="demo-label">Sample workflow</span></div>
          <div className="next-steps">
            {[
              { href: '/tasks', title: 'Review the tasks', text: 'Check deadlines and work requirements.' },
              { href: '/optimize', title: 'Build a shared plan', text: 'See how tasks can use the same closure.' },
              { href: '/plan', title: 'Check and approve', text: 'Review each block and try a schedule change.' },
            ].map((step, i) => <Link key={step.href} href={step.href} className="next-step"><span className="step-number">{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowRight size={15} className="ml-auto shrink-0 mt-1 text-slate-600" /></Link>)}
          </div>
        </section>
        <p className="section-note">This demo uses sample railway data and preset plans. A block is a period when a track is reserved for maintenance.</p>
      </div>
    </div>
  );
}

