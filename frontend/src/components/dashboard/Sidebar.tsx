import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Wrench,
  FolderOpen,
  Building2,
  Star,
  MessageSquare,
} from 'lucide-react';
import logoImg from '../../../assets/Logo.png';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/posts', label: 'Posts & Insights', icon: FileText },
  { to: '/dashboard/job-openings', label: 'Careers', icon: Briefcase },
  { to: '/dashboard/services', label: 'Services', icon: Wrench },
  { to: '/dashboard/previous-projects', label: 'Projects', icon: FolderOpen },
  { to: '/dashboard/our-clients', label: 'Clients', icon: Building2 },
  { to: '/dashboard/client-statements', label: 'Testimonials', icon: Star },
  { to: '/dashboard/client-reach', label: 'Inbox', icon: MessageSquare },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-[#1E272E]/50 backdrop-blur-2xl border-r border-white/10">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center gap-3 border-b border-white/10">
        <img
          src={logoImg}
          alt="Million Technologies"
          className="w-8 h-8 object-contain rounded-xl shadow-lg shadow-primary/20"
        />
        <span className="font-semibold text-white tracking-tight">Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Version tag */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/20 text-xs">Million Technologies Admin</p>
      </div>
    </aside>
  );
}
