import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, CheckCircle, Clock, AlertCircle, MapPin, Sparkles, Activity, Brain, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ANALYTICS } from '../lib/mockData';
import { generateCampusHealthInsight } from '../lib/aiAnalyzer';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ef4444'];

const MOCK_ANALYTICS_FALLBACK = {
  total: 0, completed: 0, avgSLA_hours: 0, avgRating: 0,
  byStatus: {}, byLocation: {}, byRegion: {}, byCategory: {},
  regionData: [], categoryData: [], heatmapData: [], totalFeedback: 0
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(MOCK_ANALYTICS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/complaints/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
          // Generate AI health score after data loads
          setHealthLoading(true);
          const h = await generateCampusHealthInsight(
            { total: json.total, completed: json.completed, byCategory: json.byCategory || {}, byRegion: json.byRegion || {} }
          );
          setHealth(h);
          setHealthLoading(false);
        } else {
          setData(MOCK_ANALYTICS);
        }
      } catch {
        setData(MOCK_ANALYTICS);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-card-bg transition-colors duration-300">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="mb-4"
      >
        <Activity className="text-primary" size={40} />
      </motion.div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Analytics...</p>
    </div>
  );

  const statusData = Object.keys(data.byStatus || {}).map(key => ({ name: key, value: data.byStatus[key] }));
  const locationData = Object.keys(data.byLocation || {}).map(key => ({ name: key, count: data.byLocation[key] }));
  const regionData: any[] = data.regionData || [];
  const categoryData: any[] = data.categoryData || [];


  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-card-bg transition-colors duration-300 p-4 md:p-8 grid-bg">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        <motion.header 
          variants={itemVariants}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)} 
              className="p-3 bg-card-bg rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none hover:bg-primary/5 hover:text-primary transition-all border border-slate-100 dark:border-slate-800"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Intelligence Hub</span>
              </div>
              <h1 className="text-4xl font-black text-ink tracking-tight">System Analytics</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live status performance monitoring</p>
            </div>
          </div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="hidden sm:flex bg-card-bg px-6 py-3 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shadow-inner">
              <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Avg Response</span>
              <span className="text-lg font-black text-ink">{data.avgSLA_hours} HRS</span>
            </div>
          </motion.div>
        </motion.header>

        {/* AI Campus Health Score Panel */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className={`rounded-[2rem] p-6 md:p-8 border transition-all ${
            health?.grade === 'A+' || health?.grade === 'A' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
            health?.grade === 'B' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' :
            health?.grade === 'C' ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
            'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
          } shadow-xl`}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Score Circle */}
              <div className="relative w-28 h-28 flex-shrink-0 mx-auto md:mx-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                    stroke={health?.grade?.startsWith('A') ? '#10b981' : health?.grade === 'B' ? '#3b82f6' : health?.grade === 'C' ? '#f59e0b' : '#ef4444'}
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: health ? 2 * Math.PI * 42 * (1 - (health.score / 100)) : 2 * Math.PI * 42 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {healthLoading
                    ? <Brain size={24} className="text-primary animate-pulse" />
                    : <>
                        <span className="text-2xl font-black text-ink">{health?.score ?? '--'}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">/ 100</span>
                      </>
                  }
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Brain size={16} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Campus Health Score</span>
                  {health && <span className={`px-2 py-0.5 rounded-lg text-sm font-black ${
                    health.grade?.startsWith('A') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    health.grade === 'B' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    health.grade === 'C' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                    'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}>Grade {health.grade}</span>}
                  <span className="ml-auto text-[9px] text-slate-400 font-bold uppercase">Powered by AI Engine</span>
                </div>
                {healthLoading
                  ? <div className="space-y-2">{[80,60,90].map(w => <div key={w} className="h-3 bg-primary/10 rounded-full animate-pulse" style={{width:`${w}%`}} />)}</div>
                  : health && <>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-3">{health.summary}</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                          <ShieldAlert size={14} className="text-orange-500 flex-shrink-0" />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{health.topRisk}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                          <TrendingUp size={14} className="text-primary flex-shrink-0" />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{health.recommendation}</span>
                        </div>
                      </div>
                    </>
                }
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {[
            { label: 'Total Reports', value: data.total, color: 'text-ink', trend: '+12%', icon: Activity },
            { label: 'Resolved', value: data.completed, color: 'text-emerald-600', trend: '88%', icon: CheckCircle },
            { label: 'Avg Rating', value: data.avgRating || '0.0', color: 'text-amber-500', trend: '/ 5.0', icon: Sparkles },
            { label: 'Active Staff', value: '12', color: 'text-blue-600', trend: 'ON DUTY', icon: Clock }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="card p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border-transparent hover:border-primary/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <stat.icon size={14} className="text-slate-300 dark:text-slate-700" />
              </div>
              <p className={`text-4xl font-black ${stat.color} tracking-tight mb-2`}>{stat.value}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400">
                <span className={stat.trend.includes('+') ? 'text-emerald-500' : ''}>{stat.trend}</span>
                {stat.trend.includes('+') && <TrendingUp size={10} className="text-emerald-500" />}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          <motion.div 
            variants={itemVariants}
            className="card p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-ink tracking-tight">Complaints by Status</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Current distribution</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 shadow-inner transition-colors">
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                    itemStyle={{ color: 'var(--ink)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-10">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50 transition-colors">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.name}</span>
                    <span className="text-lg font-black text-ink">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="card p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-ink tracking-tight">Hotspot Locations</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Geographic frequency</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 shadow-inner transition-colors">
                <MapPin size={20} />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--slate-200)" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--slate-400)', fontWeight: 700 }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--slate-400)', fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--slate-100)', opacity: 0.05, radius: 12 }} 
                    contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                    itemStyle={{ color: 'var(--ink)' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="mt-12 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-card-bg flex items-center justify-center flex-shrink-0 shadow-sm transition-colors">
                <TrendingUp className="text-primary" size={20} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                <span className="font-black text-primary uppercase tracking-widest mr-2">Insight:</span> 
                {locationData.sort((a,b) => b.count - a.count)[0]?.name} has the highest frequency of reports this week. Consider increasing staff patrols in this area.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Region & Category Breakdown */}
        {(regionData.length > 0 || categoryData.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mt-10">
            {regionData.length > 0 && (
              <motion.div variants={itemVariants} className="card p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-ink tracking-tight">Reports by Region</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Campus zone breakdown</p>
                  </div>
                  <MapPin size={20} className="text-primary" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--slate-200)" opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--slate-400)', fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--slate-400)', fontWeight: 700 }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.15)', padding: '12px' }} itemStyle={{ color: 'var(--ink)' }} />
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
            {categoryData.length > 0 && (
              <motion.div variants={itemVariants} className="card p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-ink tracking-tight">Reports by Category</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Issue type distribution</p>
                  </div>
                  <AlertCircle size={20} className="text-amber-500" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                        {categoryData.map((_, index) => (
                          <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--ink)', boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.15)', padding: '12px' }} itemStyle={{ color: 'var(--ink)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {categoryData.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{cat.name}</p>
                        <p className="text-sm font-black text-ink">{cat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Staff Performance Leaderboard */}
        {data.staffLeaderboard && data.staffLeaderboard.length > 0 && (
          <motion.div variants={itemVariants} className="mt-10 card p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-ink tracking-tight">Staff Performance Leaderboard</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Top performers by resolution & rating</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <TrendingUp size={20} />
              </div>
            </div>
            
            <div className="space-y-4">
              {data.staffLeaderboard.map((staff: any, idx: number) => (
                <div key={staff.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    idx === 0 ? 'bg-amber-100 text-amber-600 shadow-lg shadow-amber-500/20' : 
                    idx === 1 ? 'bg-slate-200 text-slate-600 shadow-lg shadow-slate-400/20' : 
                    idx === 2 ? 'bg-orange-100 text-orange-600 shadow-lg shadow-orange-500/20' : 
                    'bg-slate-50 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-ink">{staff.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Staff Member</p>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Resolved</p>
                      <p className="text-sm font-black text-emerald-500">{staff.resolved} Tasks</p>
                    </div>
                    <div className="w-16">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <Sparkles size={10} className="text-amber-500" />
                        <p className="text-sm font-black text-amber-500">{staff.avgRating}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

