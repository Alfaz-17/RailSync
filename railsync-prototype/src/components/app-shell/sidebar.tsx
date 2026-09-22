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
    title: 'Operations',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/tasks', label: 'Maintenance Workbank', icon: Wrench },
      { href: '/current-plan', label: 'Current Plan', icon: GitBranch },
    ],
  },
  {
    title: 'Planning',
    items: [
      { href: '/optimize', label: 'Optimization', icon: Cpu },
      { href: '/plan', label: 'Recommended Plan', icon: Map },
      { href: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/data-sources', label: 'Data Sources', icon: Database },
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
      <div className="sidebar-division"><span className="division-dot" /><span>Western Railway<small>Vadodara Division</small></span></div>
      <nav aria-label="Main navigation" className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="nav-section">
            <p className="nav-section-title">{section.title}</p>
            {section.items.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`nav-item ${pathname === href ? 'is-active' : ''}`} aria-current={pathname === href ? 'page' : undefined}>
                <Icon size={18} strokeWidth={1.7} /><span>{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer"><span className="planner-avatar">RP</span><span><strong>Railway Planner</strong><small>Demo workspace</small></span></div>
    </aside>
  );
}
