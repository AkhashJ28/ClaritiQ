import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, UserPlus, ListOrdered, FileText, ClipboardList, Settings, LogOut } from 'lucide-react';
import logoUrl from '../../assets/logo.png';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Patient', path: '/add-patient', icon: UserPlus },
    { name: 'Queue Management', path: '/queue', icon: ListOrdered },
    { name: 'Consultation Logs', path: '/consultations', icon: FileText },
    { name: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-bg-light text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-sidebar text-slate-300 flex flex-col flex-shrink-0 shadow-xl z-20 relative">
        <div className="py-6 flex items-center px-6 gap-4 border-b border-white/5">
          <div className="w-20 h-20 flex-shrink-0 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
            <img src={logoUrl} alt="ClaritiQ Logo" className="w-full h-full object-contain scale-[1.8]" />
          </div>
          <span className="text-3xl font-bold text-white tracking-wide">ClaritiQ</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group relative ${
                  isActive ? 'bg-sidebar-active text-white' : 'hover:bg-sidebar-hover text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"></div>}
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border border-slate-600">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-sidebar rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-slate-400">{user.role}</span>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-white transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
