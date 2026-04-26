import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Camera, CheckCircle, Loader2, MapPin, ClipboardList, Sparkles, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_COMPLAINTS } from '../lib/mockData';
import SLATimer from '../components/SLATimer';

export default function StaffDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints/staff-tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        setTasks(MOCK_COMPLAINTS);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(MOCK_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/complaints/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleProofUpload = async (complaintId: number, file: File) => {
    try {
      setUploading(complaintId);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('complaint_id', complaintId.toString());
      formData.append('image', file);

      const response = await fetch('/api/complaints/upload-proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
    } finally {
      setUploading(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
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
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Staff Portal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-ink tracking-tight mb-3">
              Your <span className="text-primary italic">Worklist</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-md">
              Manage assigned tasks and maintain campus cleanliness standards.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Date</p>
              <p className="text-sm font-bold text-ink">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="w-12 h-12 bg-card-bg border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-primary shadow-sm transition-colors">
              <ClipboardList size={24} />
            </div>
          </motion.div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Tasks', value: tasks.length, icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'High Priority', value: tasks.filter(t => t.priority === 'HIGH').length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Completed Today', value: 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="card p-6 flex items-center gap-5"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-xl font-display font-bold text-ink">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-card-bg rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-20 text-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="text-emerald-500" size={48} />
            </div>
            <h3 className="text-2xl font-display font-bold text-ink mb-3">All Tasks Completed</h3>
            <p className="text-slate-400 font-medium text-lg">You have no pending assignments. Take a well-deserved break!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div 
                  layout
                  key={task.id}
                  variants={itemVariants}
                  className="card group overflow-hidden flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    {task.image_url ? (
                      <img 
                        src={task.image_url} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        referrerPolicy="no-referrer" 
                        alt="Task"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700 transition-colors">
                        <Camera size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-lg ${
                        task.priority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-lg bg-card-bg/90 backdrop-blur-sm text-ink transition-colors`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <MapPin size={12} className="text-primary" />
                        {task.location}
                      </div>
                      <h3 className="text-xl font-bold text-ink group-hover:text-primary transition-colors leading-tight mb-4">{task.description}</h3>
                      <SLATimer
                        createdAt={task.created_at}
                        suggestedSLA={task.priority === 'CRITICAL' ? '2 hours' : task.priority === 'HIGH' ? '12 hours' : task.priority === 'MEDIUM' ? '24 hours' : '48 hours'}
                        status={task.status}
                        resolvedAt={task.completed_at || task.Assignment?.completed_at}
                      />
                    </div>

                    <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-4">
                        {task.status === 'Assigned' && (
                          <button 
                            onClick={() => handleStatusUpdate(task.id, 'In Progress')}
                            className="btn-primary px-6 py-2.5 text-[10px] flex items-center gap-2"
                          >
                            <Sparkles size={14} />
                            Start Mission
                          </button>
                        )}
                        
                        {task.status === 'In Progress' && (
                          <label className="btn-primary px-6 py-2.5 text-[10px] flex items-center gap-2 cursor-pointer">
                            {uploading === task.id ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
                            <span>Complete & Upload</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => e.target.files?.[0] && handleProofUpload(task.id, e.target.files[0])}
                              disabled={uploading === task.id}
                            />
                          </label>
                        )}

                        {task.status === 'Resolved' && (
                          <div className="flex items-center gap-2 text-purple-600 font-bold text-[10px] bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl border border-purple-100 dark:border-purple-800 uppercase tracking-widest transition-colors">
                            <Sparkles size={16} />
                            Pending Verification
                          </div>
                        )}

                        {task.status === 'Completed' && (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest transition-colors">
                            <CheckCircle size={16} />
                            Verified & Closed
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">#{task.id.toString().padStart(4, '0')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
