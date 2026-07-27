import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#05080a]/40 backdrop-blur-xl sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* User pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center">
            <User className="w-3 h-3 text-primary" />
          </div>
          <span className="text-white/70 text-sm font-medium">{user?.name ?? 'Admin'}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-accent hover:border-accent/30 hover:bg-accent/10 transition-all"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
