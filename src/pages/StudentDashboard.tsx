import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Clock, CheckCircle, AlertCircle, MapPin, LogOut, Star, ChevronRight, Search, Filter, Sparkles, PlusCircle, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import FeedbackModal from '../components/FeedbackModal';
import { MOCK_COMPLAINTS } from '../lib/mockData';

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        setComplaints(MOCK_COMPLAINTS);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints(MOCK_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="status-badge bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>;
      case 'In Progress': return <span className="status-badge bg-blue-100 text-blue-700 border border-blue-200">Working</span>;
      case 'Completed': return <span className="status-badge bg-green-100 text-green-700 border border-green-200">Done</span>;
      case 'Closed': return <span className="status-badge bg-gray-100 text-gray-700 border border-gray-200">Closed</span>;
      default: return <span className="status-badge bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-24 lg:pb-12 selection:bg-primary/20 grid-bg min-h-screen transition-colors duration-300">
      <main className="px-6 py-12 max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Session</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-ink tracking-tight mb-3">
              Hello, <span className="text-primary italic">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-md">
              Track your reports and help us maintain a cleaner, greener campus environment.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/report" 
              className="btn-primary group"
            >
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
              New Report
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Reports', value: complaints.length, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Resolved', value: complaints.filter(c => c.status === 'Completed').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Pending', value: complaints.filter(c => c.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="card group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <stat.icon className={stat.color} size={28} />
                </div>
                <span className="text-4xl font-display font-bold text-ink">{stat.value}</span>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-ink tracking-tight">Your Reports</h2>
              <div className="flex gap-3">
                <div className="relative hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-10 pr-4 py-2 bg-card-bg border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="w-10 h-10 bg-card-bg border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-card-bg rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredComplaints.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card p-16 text-center"
                    >
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-slate-200 dark:text-slate-700" size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-ink mb-2">No reports found</h3>
                      <p className="text-slate-400 font-medium">Help keep the campus clean by reporting issues!</p>
                    </motion.div>
                  ) : (
                    filteredComplaints.map((c) => (
                      <motion.div 
                        layout
                        key={c.id}
                        variants={itemVariants}
                        className="card group cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="relative flex-shrink-0">
                            {c.image_url ? (
                              <img 
                                src={c.image_url} 
                                alt="Issue" 
                                className="w-full md:w-32 h-48 md:h-32 object-cover rounded-3xl shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full md:w-32 h-48 md:h-32 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 transition-colors">
                                <AlertCircle size={40} />
                              </div>
                            )}
                            <div className="absolute top-4 right-4 md:-top-2 md:-right-2">
                              {getStatusBadge(c.status)}
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {new Date(c.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${c.priority === 'HIGH' ? 'bg-red-500' : c.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'} shadow-lg`} />
                              </div>
                              <h3 className="text-xl font-bold text-ink group-hover:text-primary transition-colors mb-2">{c.description}</h3>
                              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {c.location}</span>
                              </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                              {c.Assignment?.staff && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                                    {c.Assignment.staff.name[0]}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Assigned to {c.Assignment.staff.name}</span>
                                </div>
                              )}
                              
                              {c.status === 'Closed' && !c.Feedback ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFeedback(c.id);
                                  }}
                                  className="px-6 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                  <Star size={14} />
                                  Rate Service
                                </button>
                              ) : c.Feedback ? (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < c.Feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                                  ))}
                                </div>
                              ) : (
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="card bg-ink text-white border-none relative overflow-hidden p-10 dark:bg-slate-900 transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-bl-full -mr-12 -mt-12" />
              <h3 className="text-2xl font-display font-bold mb-4 relative z-10">Campus Impact</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 relative z-10">
                Your reports have helped resolve <span className="text-white font-bold">12 issues</span> this month. Keep up the great work!
              </p>
              <div className="h-2.5 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 relative z-10">
                <span>Monthly Goal</span>
                <span className="text-white">75%</span>
              </div>
            </div>

            <div className="card p-10">
              <h3 className="text-xl font-display font-bold text-ink mb-8">Quick Tips</h3>
              <ul className="space-y-8">
                {[
                  { tip: 'Include clear photos in your reports', icon: Sparkles },
                  { tip: 'Be specific about the location', icon: MapPin },
                  { tip: 'Check for existing reports first', icon: Search },
                ].map((item, i) => (
                  <li key={i} className="flex gap-5 group">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                      <item.icon className="text-slate-400 group-hover:text-primary transition-colors" size={18} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {showFeedback && (
        <FeedbackModal 
          complaintId={showFeedback} 
          onClose={() => setShowFeedback(null)} 
          onSuccess={fetchComplaints}
        />
      )}
    </div>
  );
}
