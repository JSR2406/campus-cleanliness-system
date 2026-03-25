import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Briefcase, Sparkles, ArrowRight, Leaf, CheckCircle, Clock, BarChart3, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Portal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const sections = [
    {
      title: 'Student Portal',
      description: 'Report cleanliness issues, track your reports, and provide feedback on resolved tasks.',
      icon: User,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      features: ['Report Issues', 'Track Status', 'Rate Service'],
      path: '/student-dashboard'
    },
    {
      title: 'Staff Portal',
      description: 'Access assigned tasks, update work progress, and upload proof of completion.',
      icon: Briefcase,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      features: ['View Assignments', 'Update Progress', 'Upload Proof'],
      path: '/staff-dashboard'
    },
    {
      title: 'Admin Console',
      description: 'Monitor campus-wide reports, manage staff assignments, and analyze performance metrics.',
      icon: Shield,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      features: ['Manage Reports', 'Assign Staff', 'View Analytics'],
      path: '/admin-dashboard'
    }
  ];

  const handleAccess = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-primary/20 grid-bg transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-card-bg dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="absolute top-0 right-0 p-6 z-50">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm hover:shadow-md transition-all"
          >
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 md:py-40 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 rounded-full mb-10 border border-primary/20">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.25em]">Smart Campus Initiative</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-slate-900 dark:text-white tracking-tighter mb-10 leading-[0.85] transition-colors">
              Campus <span className="text-primary italic">Clean</span> Portal
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-14 px-4 max-w-2xl mx-auto">
              A unified platform for students, staff, and administrators to collaborate on keeping our campus green, clean, and sustainable.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(user ? '/' : '/login')}
                className="btn-primary"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ y: -15 }}
              onClick={() => handleAccess(section.path)}
              className="card group relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 ${section.lightColor} rounded-bl-[6rem] opacity-40 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700`} />
              
              <div className={`w-20 h-20 ${section.lightColor} rounded-3xl flex items-center justify-center mb-10 shadow-inner relative z-10`}>
                <section.icon className={section.textColor} size={36} />
              </div>

              <h3 className="text-3xl font-display font-bold text-ink mb-5 tracking-tight relative z-10">{section.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 relative z-10 text-lg">
                {section.description}
              </p>

              <div className="space-y-5 mb-12 relative z-10">
                {section.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-4">
                    <div className={`w-6 h-6 ${section.lightColor} rounded-full flex items-center justify-center`}>
                      <div className={`w-2 h-2 rounded-full ${section.color}`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{feature}</span>
                  </div>
                ))}
              </div>

              <div className={`mt-auto flex items-center gap-3 font-bold text-[11px] uppercase tracking-[0.25em] ${section.textColor} group/btn`}>
                Access Portal
                <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-card-bg rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-12 transition-colors duration-300"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Leaf className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-black text-ink tracking-tight">Our Mission</h2>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We believe that a clean campus is a productive campus. By leveraging technology, we bridge the gap between reporting and resolution, ensuring every corner of our university reflects our commitment to excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
            {[
              { icon: CheckCircle, label: 'Efficiency', color: 'text-emerald-500' },
              { icon: Clock, label: 'Real-time', color: 'text-blue-500' },
              { icon: BarChart3, label: 'Analytics', color: 'text-amber-500' },
              { icon: Sparkles, label: 'Innovation', color: 'text-primary' }
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] flex flex-col items-center text-center gap-3 border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                <item.icon className={item.color} size={24} />
                <span className="text-[10px] font-black text-ink uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
