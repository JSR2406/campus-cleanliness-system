import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, AlertCircle, UserPlus, Loader2, MapPin, TrendingUp, Search, Shield, Download, Settings, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_COMPLAINTS, MOCK_STAFF } from '../lib/mockData';
import CampusMap from '../components/CampusMap';
import SLATimer from '../components/SLATimer';

interface Toast { id: number; message: string; type: 'success' | 'error'; }

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [addingStaff, setAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const { logout } = useAuth();

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [complaintsRes, staffRes] = await Promise.all([
        fetch('/api/complaints/all', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/complaints/staff-list', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (complaintsRes.ok) {
        setComplaints(await complaintsRes.json());
      } else {
        setComplaints(MOCK_COMPLAINTS);
      }

      if (staffRes.ok) {
        setStaffList(await staffRes.json());
      } else {
        setStaffList(MOCK_STAFF);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setComplaints(MOCK_COMPLAINTS);
      setStaffList(MOCK_STAFF);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (complaintId: number) => {
    const staffId = selectedStaff[complaintId];
    if (!staffId) return showToast('Please select a staff member first', 'error');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ complaint_id: complaintId, staff_id: staffId })
      });

      if (response.ok) {
        fetchData();
        showToast('Staff assigned successfully ✓');
      } else {
        const err = await response.json();
        showToast(err.message || 'Assignment failed', 'error');
      }
    } catch (error) {
      showToast('Network error — could not assign', 'error');
    }
  };

  const handleVerify = async (complaintId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/complaints/status/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Completed' })
      });
      if (response.ok) {
        fetchData();
        showToast('Complaint verified and marked as Completed ✓');
      } else {
        showToast('Verification failed', 'error');
      }
    } catch (error) {
      showToast('Network error — could not verify', 'error');
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Add New Staff') {
      setShowAddStaff(true);
    } else if (action === 'Export Reports') {
      const csv = ['ID,Description,Location,Region,Category,Status,Reporter'].concat(
        complaints.map(c => `${c.id},"${c.description}","${c.location}","${c.region}","${c.category}",${c.status},"${c.User?.name}"`)
      ).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'campus-complaints.csv'; a.click();
      URL.revokeObjectURL(url);
      showToast('Reports exported as CSV ✓');
    } else {
      showToast(`${action} — coming soon!`, 'error');
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;
    setAddingStaff(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          password: 'staff123',   // default password, staff should change on first login
          role: 'staff'
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create staff');
      setShowAddStaff(false);
      setNewStaffName('');
      setNewStaffEmail('');
      fetchData();
      showToast(`Staff member "${newStaffName}" added ✓ (default password: staff123)`);
    } catch (err: any) {
      showToast(err.message || 'Could not add staff', 'error');
    } finally {
      setAddingStaff(false);
    }
  };

  const getStaffPerformance = (staffName: string) => {
    const staffComplaints = complaints.filter(c => c.Assignment?.staff?.name === staffName);
    const assigned = staffComplaints.length;
    const completed = staffComplaints.filter(c => c.status === 'Completed' || c.status === 'Closed').length;
    const efficiency = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
    return { assigned, completed, efficiency };
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === 'All' || c.region === filterRegion;
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    return matchesSearch && matchesRegion && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="pb-24 lg:pb-12 selection:bg-primary/20 grid-bg min-h-screen transition-colors duration-300">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold backdrop-blur-md border ${
                toast.type === 'success'
                  ? 'bg-emerald-500/90 text-white border-emerald-400'
                  : 'bg-red-500/90 text-white border-red-400'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <main className="px-6 py-12 max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Admin Control</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-ink tracking-tight mb-3">
              Campus <span className="text-primary italic">Overview</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-md">
              Monitor reports, manage staff assignments, and track resolution metrics.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Status</p>
              <p className="text-sm font-bold text-emerald-500 flex items-center gap-1.5 justify-end">
                <CheckCircle size={14} /> All Systems Operational
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { label: 'Pending Reports', value: complaints.filter(c => c.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'In Progress', value: complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Resolved', value: complaints.filter(c => c.status === 'Completed').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <CampusMap
              complaints={complaints}
              onRegionClick={(regionId) => setFilterRegion(regionId || 'All')}
              selectedRegion={filterRegion === 'All' ? null : filterRegion}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="text-2xl font-display font-bold text-ink tracking-tight">Recent Complaints</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-4 py-2.5 bg-card-bg border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium outline-none transition-all shadow-sm"
                >
                  <option value="All">All Regions</option>
                  <option value="Academic Block">Academic Block</option>
                  <option value="Hostel Area">Hostel Area</option>
                  <option value="Cafeteria">Cafeteria</option>
                  <option value="Sports Complex">Sports Complex</option>
                  <option value="Library">Library</option>
                  <option value="General">General</option>
                </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 bg-card-bg border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium outline-none transition-all shadow-sm"
                  >
                    <option value="All">All Categories</option>
                    <option value="Cleaning">🧹 Cleaning</option>
                    <option value="Electrical">⚡ Electrical</option>
                    <option value="Structural">🏗️ Structural</option>
                    <option value="Plumbing">💧 Plumbing</option>
                    <option value="IT/Network">📡 IT / Network</option>
                    <option value="Safety Hazard">⚠️ Safety Hazard</option>
                    <option value="Pest Control">🐛 Pest Control</option>
                    <option value="Gardening">🌿 Gardening</option>
                    <option value="Fire Safety">🔥 Fire Safety</option>
                    <option value="Other">🔧 Other</option>
                  </select>
                <div className="relative group w-full md:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Filter by location..." 
                    className="pl-11 pr-4 py-2.5 bg-card-bg border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-full md:w-64 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-card-bg rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Desktop Table - Updated with better styling */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden lg:block card overflow-hidden border-slate-50 dark:border-slate-800 transition-colors"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                        <AnimatePresence mode="popLayout">
                          {filteredComplaints.length === 0 ? (
                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                                No matching reports found.
                              </td>
                            </motion.tr>
                          ) : (
                            filteredComplaints.map((c) => (
                              <motion.tr 
                                layout
                                key={c.id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group"
                              >
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-5">
                                    <div className="relative flex-shrink-0">
                                      {c.image_url ? (
                                        <img src={c.image_url} className="w-12 h-12 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" alt="Report" />
                                      ) : (
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 transition-colors">
                                          <AlertCircle size={20} />
                                        </div>
                                      )}
                                      {c.is_sos && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full animate-ping" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <p className="font-bold text-ink text-sm group-hover:text-primary transition-colors">{c.description}</p>
                                        {c.is_sos && <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded-md">SOS</span>}
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">By <span className="text-primary">{c.User?.name}</span></p>
                                      {c.ai_suggested_action && (
                                        <p className="text-[9px] text-indigo-500 font-medium mt-0.5 max-w-xs truncate">🤖 {c.ai_suggested_action}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-slate-500">
                                      <MapPin size={14} className="text-primary/60" />
                                      <span className="text-xs font-bold uppercase tracking-widest">{c.location}</span>
                                    </div>
                                    {c.region && (
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {c.region} • {c.category}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase w-fit ${
                                        c.status === 'Pending'     ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                                        c.status === 'Assigned'    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                                        c.status === 'In Progress' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' :
                                        c.status === 'Resolved'    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' :
                                        c.status === 'Completed'   ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                                        'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                      }`}>{c.status}</span>
                                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest w-fit ${
                                        c.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                                        c.priority === 'HIGH'     ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                                        c.priority === 'MEDIUM'   ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      }`}>{c.priority}</span>
                                    </div>
                                    <SLATimer
                                      createdAt={c.created_at}
                                      suggestedSLA={c.priority === 'CRITICAL' ? '2 hours' : c.priority === 'HIGH' ? '12 hours' : c.priority === 'MEDIUM' ? '24 hours' : '48 hours'}
                                      status={c.status}
                                      resolvedAt={c.completed_at || c.Assignment?.completed_at}
                                      compact
                                    />
                                  </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  {c.status === 'Pending' ? (
                                    <div className="flex items-center justify-end gap-3">
                                      <select 
                                        className="text-[10px] font-bold border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card-bg text-ink"
                                        onChange={(e) => setSelectedStaff({ ...selectedStaff, [c.id]: e.target.value })}
                                        value={selectedStaff[c.id] || ''}
                                      >
                                        <option value="">Select Staff</option>
                                        {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                      </select>
                                      <button 
                                        onClick={() => handleAssign(c.id)}
                                        className="w-10 h-10 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center shadow-lg shadow-primary/20"
                                      >
                                        <UserPlus size={18} />
                                      </button>
                                    </div>
                                  ) : c.status === 'Resolved' ? (
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="flex items-center gap-2.5 mb-1">
                                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                                          {c.Assignment?.staff?.name[0] || '?'}
                                        </div>
                                        <span className="text-[10px] font-bold text-ink uppercase tracking-widest">{c.Assignment?.staff?.name || 'Staff'}</span>
                                      </div>
                                      <button 
                                        onClick={() => handleVerify(c.id)}
                                        className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm"
                                      >
                                        Verify & Complete
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Assigned To</span>
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                                          {c.Assignment?.staff?.name[0] || '?'}
                                        </div>
                                        <span className="text-[10px] font-bold text-ink uppercase tracking-widest">{c.Assignment?.staff?.name || 'Staff'}</span>
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </motion.tr>
                            ))
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-6">
                  <AnimatePresence mode="popLayout">
                    {filteredComplaints.map((c) => (
                      <motion.div 
                        layout
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="card group"
                      >
                        <div className="flex items-center gap-6 mb-6">
                          {c.image_url ? (
                            <img src={c.image_url} className="w-20 h-20 rounded-2xl object-cover shadow-sm" referrerPolicy="no-referrer" alt="Report" />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 transition-colors">
                              <AlertCircle size={24} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold tracking-widest uppercase ${
                                c.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {c.priority}
                              </span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{c.status}</span>
                            </div>
                            <h3 className="font-bold text-ink text-base truncate mb-1">{c.description}</h3>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                              <MapPin size={10} className="text-primary" />
                              {c.location}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            By <span className="text-primary">{c.User?.name}</span>
                          </div>
                          
                          {c.status === 'Pending' ? (
                            <div className="flex items-center gap-3">
                              <select 
                                className="text-[10px] font-bold border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2 outline-none bg-card-bg text-ink transition-colors"
                                onChange={(e) => setSelectedStaff({ ...selectedStaff, [c.id]: e.target.value })}
                                value={selectedStaff[c.id] || ''}
                              >
                                <option value="">Select</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <button 
                                onClick={() => handleAssign(c.id)}
                                className="bg-primary text-white p-2.5 rounded-lg shadow-lg shadow-primary/20"
                              >
                                <UserPlus size={16} />
                              </button>
                            </div>
                          ) : c.status === 'Resolved' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                                {c.Assignment?.staff?.name[0] || '?'}
                              </div>
                              <button 
                                onClick={() => handleVerify(c.id)}
                                className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                              >
                                Verify
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                                {c.Assignment?.staff?.name[0] || '?'}
                              </div>
                              <span className="text-[10px] font-bold text-ink uppercase tracking-widest">{c.Assignment?.staff?.name || 'Staff'}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="card p-8"
            >
              <h3 className="text-lg font-display font-bold text-ink mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Add New Staff', icon: Plus, color: 'bg-primary/10 text-primary' },
                  { label: 'Export Reports', icon: Download, color: 'bg-blue-500/10 text-blue-500' },
                  { label: 'System Settings', icon: Settings, color: 'bg-slate-500/10 text-slate-500' },
                  { label: 'Security Audit', icon: Shield, color: 'bg-emerald-500/10 text-emerald-500' },
                ].map((action) => (
                  <button 
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-sm font-bold text-ink">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Staff Performance */}
            <motion.div 
              variants={itemVariants}
              className="card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold text-ink">Staff Performance</h3>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div className="space-y-6">
                {staffList.slice(0, 4).map((staff) => {
                  const perf = getStaffPerformance(staff.name);
                  return (
                    <div key={staff.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                            {staff.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ink">{staff.name}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{perf.completed}/{perf.assigned} Tasks</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{perf.efficiency}% Efficiency</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${perf.efficiency}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-8 py-3 text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
                View All Performance
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Add Staff Modal — Real API */}
      <AnimatePresence>
        {showAddStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddStaff(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card-bg rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setShowAddStaff(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-3xl font-display font-bold text-ink tracking-tight mb-2">Add New Staff</h2>
                <p className="text-slate-400 font-medium text-sm">Onboard a new member to the maintenance team. Default password: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">staff123</code></p>
              </div>

              <form className="space-y-5" onSubmit={handleAddStaff} autoComplete="off">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Louis Litt"
                    autoComplete="off"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all text-ink"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="louis@campus.com"
                    autoComplete="off"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all text-ink"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingStaff}
                  className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {addingStaff ? <><Loader2 size={20} className="animate-spin" /> Creating...</> : 'Create Staff Account'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
