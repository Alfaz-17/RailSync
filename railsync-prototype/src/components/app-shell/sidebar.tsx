'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, ClipboardList, GitBranch, CalendarPlus, Map, BarChart3, TrainFront } from 'lucide-react';

const sections = [
  { title: 'Workspace', items: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/data-sources', label: 'Data sources', icon: Database },
    { href: '/tasks', label: 'Maintenance tasks', icon: ClipboardList },
  ] },
  { title: 'Planning', items: [
    { href: '/current-plan', label: 'Current plan', icon: GitBranch },
    { href: '/optimize', label: 'Build a plan', icon: CalendarPlus },
    { href: '/plan', label: 'Suggested plan', icon: Map },
    { href: '/analytics', label: 'Results', icon: BarChart3 },
  ] },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="app-sidebar">
      <Link href="/dashboard" className="sidebar-brand" aria-label="RailSync overview">
        <span className="brand-icon"><TrainFront size={23} /></span>
        <span><strong>RailSync</strong><small>Maintenance planning</small></span>
      </Link>
      <div className="sidebar-division"><span className="division-dot" /><span>Western Railway<small>Vadodara demo workspace</small></span></div>
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
      <div className="sidebar-footer"><span className="planner-avatar">RP</span><span><strong>Railway planner</strong><small>Demo workspace</small></span></div>
    </aside>
  );
}

