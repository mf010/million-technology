import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#05080a] flex">
      {/* Ambient glow */}
      <div className="fixed top-0 left-64 w-[600px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none -z-0" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-accent/5 blur-[100px] pointer-events-none -z-0" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
