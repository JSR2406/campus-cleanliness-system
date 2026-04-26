import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, Home, BarChart3, ClipboardList, PlusCircle,
  LayoutDashboard, Sparkles, Moon, Sun, UserCircle
} from 'lucide-react';
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

  // Each item only shows for users whose role matches `roles`
  const allNavItems = [
    { path: '/portal',           icon: Home,          label: 'Portal',     roles: ['student', 'staff', 'teacher', 'admin'] },
    { path: '/student-dashboard',icon: LayoutDashboard,label: 'Dashboard',  roles: ['student'] },
    { path: '/report',           icon: PlusCircle,    label: 'Report',     roles: ['student'] },
    { path: '/staff-dashboard',  icon: ClipboardList, label: 'My Tasks',   roles: ['staff', 'teacher'] },
    { path: '/admin-dashboard',  icon: LayoutDashboard,label: 'Dashboard',  roles: ['admin'] },
    { path: '/analytics',        icon: BarChart3,     label: 'Analytics',  roles: ['admin'] },
    { path: '/profile',          icon: UserCircle,    label: 'Profile',    roles: ['student', 'staff', 'teacher', 'admin'] },
  ];

  const navItems = allNavItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  const avatarDisplay =
    user?.avatar_url ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=10b981&fontFamily=Helvetica&fontSize=42&fontWeight=700&textColor=ffffff`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-300">

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

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <item.icon size={20} className={active ? 'text-primary' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: theme + user card + logout */}
        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-6 py-3 mb-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold text-sm"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          {/* User card → links to profile */}
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-4 mb-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <img src={avatarDisplay} alt="avatar" className="w-full h-full object-cover bg-primary/10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.role}</p>
            </div>
            <UserCircle size={16} className="text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
          </button>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-4 px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-card-bg/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div onClick={() => navigate('/portal')} className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white" size={18} />
          </div>
          <span className="text-base font-display font-bold text-ink tracking-tight">Campus Clean</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-primary/20"
          >
            <img src={avatarDisplay} alt="profile" className="w-full h-full object-cover bg-primary/10" />
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card-bg/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-around z-50 transition-colors duration-300">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all px-2 ${
                active ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
