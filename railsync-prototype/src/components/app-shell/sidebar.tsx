'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  Wrench,
  GitBranch,
  Cpu,
  Map,
  ChartNoAxesCombined,
  TrainFront,
} from 'lucide-react';

const sections = [
  {
    title: 'Demo Story Flow',
    items: [
      { href: '/dashboard', label: '1. Command Center', icon: LayoutDashboard },
      { href: '/data-sources', label: '2. Data Sources', icon: Database, badge: '8 Connectors' },
      { href: '/tasks', label: '3. Unified Workbank', icon: Wrench, badge: '4 Tasks' },
      { href: '/current-plan', label: '4. Current / Baseline', icon: GitBranch, badge: 'Baseline' },
      { href: '/optimize', label: '5. AI Optimization', icon: Cpu, badge: 'OR-Tools' },
      { href: '/plan', label: '6. Recommended Plan', icon: Map, badge: 'Hero Page' },
      { href: '/analytics', label: '7. Analytics & History', icon: ChartNoAxesCombined, badge: 'Savings' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="app-sidebar">
      <Link href="/dashboard" className="sidebar-brand" aria-label="RailSync home">
        <span className="brand-icon"><TrainFront size={22} /></span>
        <span><strong>RailSync</strong><small>Maintenance Planning</small></span>
      </Link>
      <div className="sidebar-division">
        <span className="division-dot" />
        <span>Western Railway<small>Vadodara Division</small></span>
      </div>
      <nav aria-label="Main navigation" className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="nav-section">
            <p className="nav-section-title">{section.title}</p>
            {section.items.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className={`nav-item flex items-center justify-between ${pathname === href ? 'is-active' : ''}`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon size={18} strokeWidth={1.7} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                {badge && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 shrink-0">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="planner-avatar">RP</span>
        <span><strong>Railway Planner</strong><small>Vadodara Division</small></span>
      </div>
    </aside>
  );
}
