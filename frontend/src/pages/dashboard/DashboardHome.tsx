import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, FileText, Briefcase, FolderOpen, Building2, Star, MessageSquare, Users, ArrowRight } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import StatCard from '../../components/dashboard/StatCard';
import { serviceService } from '../../services/serviceService';
import { postService } from '../../services/postService';
import { jobOpeningService } from '../../services/jobOpeningService';
import { previousProjectService } from '../../services/previousProjectService';
import { ourClientService } from '../../services/ourClientService';
import { clientStatementService } from '../../services/clientStatementService';
import { clientReachService } from '../../services/clientReachService';
import { authService } from '../../services/authService';

const quickLinks = [
  { to: '/dashboard/users', label: 'Users', icon: Users, color: 'text-primary' },
  { to: '/dashboard/services', label: 'Services', icon: Layers, color: 'text-accent' },
  { to: '/dashboard/posts', label: 'Posts', icon: FileText, color: 'text-primary' },
  { to: '/dashboard/job-openings', label: 'Job Openings', icon: Briefcase, color: 'text-accent' },
  { to: '/dashboard/previous-projects', label: 'Projects', icon: FolderOpen, color: 'text-primary' },
  { to: '/dashboard/our-clients', label: 'Clients', icon: Building2, color: 'text-accent' },
  { to: '/dashboard/client-statements', label: 'Testimonials', icon: Star, color: 'text-primary' },
  { to: '/dashboard/client-reach', label: 'Inbox', icon: MessageSquare, color: 'text-accent' },
];

export default function DashboardHome() {
  const [stats, setStats] = useState({
    users: '—', services: '—', posts: '—', jobs: '—', projects: '—',
    clients: '—', statements: '—', messages: '—',
  });

  useEffect(() => {
    // Fetch all counts concurrently — gracefully ignore individual failures
    Promise.allSettled([
      authService.listUsers(),
      serviceService.list(),
      postService.list({ page_size: '1' } as Record<string, string>),
      jobOpeningService.list({ page_size: '1' }),
      previousProjectService.list({ page_size: '1' }),
      ourClientService.list(),
      clientStatementService.list(),
      clientReachService.list({ page_size: '1' }),
    ]).then(([usr, svc, pst, job, prj, cli, stm, msg]) => {
      setStats({
        users: usr.status === 'fulfilled' ? String(usr.value.users?.length ?? '—') : '—',
        services: svc.status === 'fulfilled' ? String(svc.value.services?.length ?? '—') : '—',
        posts: pst.status === 'fulfilled' ? String(pst.value.data?.total ?? '—') : '—',
        jobs: job.status === 'fulfilled' ? String(job.value.data?.total ?? '—') : '—',
        projects: prj.status === 'fulfilled' ? String(prj.value.data?.total ?? '—') : '—',
        clients: cli.status === 'fulfilled' ? String(cli.value.clients?.length ?? '—') : '—',
        statements: stm.status === 'fulfilled' ? String(stm.value.statements?.length ?? '—') : '—',
        messages: msg.status === 'fulfilled' ? String(msg.value.data?.total ?? '—') : '—',
      });
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Overview" />

      <main className="flex-1 p-6 space-y-8">
        {/* Stats grid */}
        <section>
          <h2 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Site Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard label="Users" value={stats.users} icon={<Users className="w-5 h-5" />} index={0} />
            <StatCard label="Services" value={stats.services} icon={<Layers className="w-5 h-5" />} color="text-accent" index={1} />
            <StatCard label="Posts" value={stats.posts} icon={<FileText className="w-5 h-5" />} index={2} />
            <StatCard label="Job Openings" value={stats.jobs} icon={<Briefcase className="w-5 h-5" />} color="text-accent" index={3} />
            <StatCard label="Projects" value={stats.projects} icon={<FolderOpen className="w-5 h-5" />} index={4} />
            <StatCard label="Clients" value={stats.clients} icon={<Building2 className="w-5 h-5" />} color="text-accent" index={5} />
            <StatCard label="Testimonials" value={stats.statements} icon={<Star className="w-5 h-5" />} index={6} />
            <StatCard label="Inbox" value={stats.messages} icon={<MessageSquare className="w-5 h-5" />} color="text-accent" index={7} />
          </div>
        </section>

        {/* Quick navigation */}
        <section>
          <h2 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="group bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-[#1E272E]/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
