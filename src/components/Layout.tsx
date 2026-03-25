import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, BarChart3, ClipboardList, Users, PlusCircle, LayoutDashboard, Sparkles, Menu, X, Bell, Moon, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    return [
      { path: '/portal', icon: Home, label: 'Portal', roles: ['student', 'staff', 'teacher', 'admin'] },
      { path: '/student-dashboard', icon: LayoutDashboard, label: 'Student', roles: ['student'] },
      { path: '/report', icon: PlusCircle, label: 'Report', roles: ['student'] },
      { path: '/staff-dashboard', icon: ClipboardList, label: 'Staff', roles: ['staff', 'teacher'] },
      { path: '/admin-dashboard', icon: LayoutDashboard, label: 'Admin', roles: ['admin'] },
      { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] }
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-card-bg border-r border-slate-100 dark:border-slate-800 p-8 fixed h-full z-50 transition-colors duration-300">
        <div 
          onClick={() => navigate('/portal')}
          className="flex items-center gap-4 mb-16 px-2 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-ink tracking-tight leading-tight">Campus Clean</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Smart Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={22} className={location.pathname === item.path ? 'text-primary' : 'group-hover:text-slate-600'} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-6 py-4 mb-4 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold text-sm"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-card-bg/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div 
          onClick={() => navigate('/portal')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <span className="text-lg font-display font-bold text-ink tracking-tight">Campus Clean</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={logout}
            className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-80 min-h-screen flex flex-col">
        <div className="flex-1 pb-24 lg:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card-bg/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-around z-50 transition-colors duration-300">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
