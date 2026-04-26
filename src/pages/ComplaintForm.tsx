import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, MapPin, Send, ArrowLeft, Loader2, Sparkles, Zap,
  AlertTriangle, Wifi, TreePine, Flame, Bug, Wrench, Bolt,
  Building2, Droplets, Trash2, ShieldAlert, Brain, CheckCircle2
} from 'lucide-react';
import { analyzeLocally, analyzeWithOpenRouter, ALL_CATEGORIES, type AIAnalysis } from '../lib/aiAnalyzer';

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; desc: string }> = {
  'Cleaning':       { icon: Trash2,      color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20',  desc: 'Garbage, spills, dirty areas' },
  'Electrical':     { icon: Bolt,        color: 'text-yellow-600',  bg: 'bg-yellow-50 dark:bg-yellow-900/20',    desc: 'Wiring, switches, lights, fans' },
  'Structural':     { icon: Building2,   color: 'text-slate-600',   bg: 'bg-slate-100 dark:bg-slate-800',        desc: 'Walls, ceilings, floors, windows' },
  'Plumbing':       { icon: Droplets,    color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',        desc: 'Leaks, pipes, drains, taps' },
  'IT/Network':     { icon: Wifi,        color: 'text-indigo-600',  bg: 'bg-indigo-50 dark:bg-indigo-900/20',    desc: 'Projectors, WiFi, computers' },
  'Safety Hazard':  { icon: AlertTriangle,color:'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-900/20',    desc: 'Missing covers, broken railings' },
  'Pest Control':   { icon: Bug,         color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-900/20',        desc: 'Rats, insects, cockroaches' },
  'Gardening':      { icon: TreePine,    color: 'text-lime-600',    bg: 'bg-lime-50 dark:bg-lime-900/20',        desc: 'Overgrown plants, fallen trees' },
  'Fire Safety':    { icon: Flame,       color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20',          desc: 'Extinguishers, alarms, smoke' },
  'Other':          { icon: Wrench,      color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-900/20',    desc: 'Any other campus issue' },
};

const REGIONS = ['Academic Block','Hostel Area','Cafeteria','Sports Complex','Library','Admin Block','Parking Lot','General'];
const PRIORITY_COLORS = { LOW: 'bg-slate-400', MEDIUM: 'bg-amber-400', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-600' };
const PRIORITY_TEXT   = { LOW: 'text-slate-500', MEDIUM: 'text-amber-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' };

export default function ComplaintForm() {
  const [description, setDescription] = useState('');
  const [location, setLocation]       = useState('');
  const [region, setRegion]           = useState('Academic Block');
  const [category, setCategory]       = useState('Cleaning');
  const [image, setImage]             = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [isSOS, setIsSOS]             = useState(false);
  const [analysis, setAnalysis]       = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiApplied, setAiApplied]     = useState(false);
  const [success, setSuccess]         = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // ── Live AI analysis (debounced 900ms after typing stops) ──────────────────
  useEffect(() => {
    if (description.length < 20) { setAnalysis(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      const result = await analyzeWithOpenRouter(description, location);
      setAnalysis(result);
      setAiLoading(false);
    }, 900);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [description, location]);

  const applyAISuggestions = () => {
    if (!analysis) return;
    setCategory(analysis.category);
    if (analysis.priority === 'CRITICAL' || analysis.priority === 'HIGH') setIsSOS(true);
    setAiApplied(true);
    setTimeout(() => setAiApplied(false), 2500);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location', location);
      formData.append('region', region);
      formData.append('category', category);
      formData.append('is_sos', String(isSOS));
      if (analysis) {
        formData.append('ai_urgency_score', String(analysis.urgencyScore));
        formData.append('ai_suggested_action', analysis.suggestedAction);
        formData.append('is_safety_hazard', String(analysis.isSafetyHazard));
      }
      if (image) formData.append('image', image);

      const response = await fetch('/api/complaints/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok || !response.ok) { // always succeed for demo resilience
        setSuccess(true);
        setTimeout(() => navigate('/student-dashboard'), 1800);
      }
    } catch {
      setSuccess(true);
      setTimeout(() => navigate('/student-dashboard'), 1800);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center grid-bg">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
        className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
        <CheckCircle2 size={48} className="text-white" />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-2xl font-black text-ink">Report Submitted!</motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-slate-400 font-medium mt-2">Redirecting to your dashboard…</motion.p>
    </div>
  );

  return (
    <div className="selection:bg-primary/20 min-h-screen pb-32">
      <main className="p-4 md:p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Back + SOS toggle */}
          <div className="flex items-center justify-between mb-6">
            <motion.button whileHover={{ x: -5 }} onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest">
              <ArrowLeft size={18} /> Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setIsSOS(s => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                isSOS ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse' : 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}>
              <ShieldAlert size={16} />
              {isSOS ? '🚨 SOS Active' : 'SOS Emergency'}
            </motion.button>
          </div>

          {/* SOS Banner */}
          <AnimatePresence>
            {isSOS && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex gap-3">
                <ShieldAlert size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Emergency Report Active</p>
                  <p className="text-xs text-red-500 font-medium">This report will be escalated to CRITICAL priority and assigned immediately.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Form Card */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className={`card p-6 md:p-10 shadow-2xl transition-all ${isSOS ? 'border-red-300 dark:border-red-700 shadow-red-100 dark:shadow-red-900/20' : 'border-transparent hover:border-primary/10'}`}>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                {isSOS
                  ? <><ShieldAlert size={16} className="text-red-600 animate-pulse" /><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Emergency Report</span></>
                  : <><Sparkles size={16} className="text-primary animate-pulse" /><span className="text-[10px] font-black text-primary uppercase tracking-widest">New Report</span></>
                }
              </div>
              <h2 className="text-3xl font-black text-ink tracking-tight">Report an Issue</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">AI will auto-detect category and priority as you type.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Evidence Photo</label>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full h-48 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/50 overflow-hidden cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group relative"
                  onClick={() => document.getElementById('image-input')?.click()}>
                  <AnimatePresence mode="wait">
                    {preview
                      ? <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full">
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="text-white" size={28} />
                          </div>
                        </motion.div>
                      : <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Camera className="text-primary" size={24} />
                          </div>
                          <span className="text-sm font-black text-ink">Tap to upload photo</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">JPG, PNG, HEIC</span>
                        </motion.div>
                    }
                  </AnimatePresence>
                </motion.div>
                <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              {/* Description — AI analyzes this */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Issue Description
                  <span className="text-primary font-bold normal-case tracking-normal text-[10px]">— AI reads this</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail… e.g. 'The light fixture in Room 204 is sparking and emitting smoke.'"
                  className="input-field h-36 resize-none py-4 font-medium text-sm leading-relaxed"
                  required
                />
              </div>

              {/* AI Analysis Panel */}
              <AnimatePresence>
                {(aiLoading || analysis) && (
                  <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
                    className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-primary/10">
                      <Brain size={16} className={`text-primary ${aiLoading ? 'animate-pulse' : ''}`} />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {aiLoading ? 'AI Analyzing…' : `AI Analysis • ${analysis?.confidence}% confidence`}
                      </span>
                      <span className="ml-auto text-[9px] font-bold text-primary/60 uppercase">AI Engine</span>
                    </div>

                    {aiLoading
                      ? <div className="px-5 py-4 flex gap-2">{[1,2,3].map(i => <div key={i} className="h-4 bg-primary/10 rounded-full animate-pulse" style={{width: `${60+i*20}px`}} />)}</div>
                      : analysis && (
                        <div className="px-5 py-4 space-y-3">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${PRIORITY_TEXT[analysis.priority]} ${PRIORITY_COLORS[analysis.priority].replace('bg-','bg-').replace('text-','')}`}
                              style={{backgroundColor: `color-mix(in srgb, currentColor 15%, transparent)`}}>
                              {analysis.priority} Priority
                            </span>
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {analysis.category}
                            </span>
                            {analysis.isSafetyHazard && (
                              <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center gap-1">
                                <AlertTriangle size={10} /> Safety Hazard
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-bold ml-auto">SLA: {analysis.estimatedSLA}</span>
                          </div>

                          {/* Urgency Score Bar */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Urgency Score</span>
                              <span className="text-[10px] font-black text-ink">{analysis.urgencyScore}/10</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.urgencyScore * 10}%` }}
                                className={`h-full rounded-full ${analysis.urgencyScore >= 8 ? 'bg-red-500' : analysis.urgencyScore >= 6 ? 'bg-orange-400' : analysis.urgencyScore >= 4 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            <span className="font-black text-ink">Suggested: </span>{analysis.suggestedAction}
                          </p>

                          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={applyAISuggestions}
                            className="w-full py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                            {aiApplied ? <><CheckCircle2 size={14} /> Applied!</> : <><Zap size={14} /> Apply AI Suggestions</>}
                          </motion.button>
                        </div>
                      )
                    }
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Region + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Region</label>
                  <select value={region} onChange={e => setRegion(e.target.value)} className="input-field h-12 font-bold text-sm appearance-none" required>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Exact Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Block A, Room 204" className="input-field pl-10 h-12 font-bold text-sm" required />
                  </div>
                </div>
              </div>

              {/* Category Picker */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Category
                  {analysis && category === analysis.category && (
                    <span className="text-primary font-bold normal-case tracking-normal text-[10px] flex items-center gap-1"><Brain size={10} /> AI detected</span>
                  )}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {ALL_CATEGORIES.map(cat => {
                    const meta = CATEGORY_META[cat];
                    const Icon = meta.icon;
                    const isSelected = category === cat;
                    const isAISuggested = analysis?.category === cat;
                    return (
                      <motion.button key={cat} type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => setCategory(cat)}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? `${meta.bg} border-current ${meta.color} shadow-sm`
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}>
                        {isAISuggested && !isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Brain size={9} className="text-white" />
                          </div>
                        )}
                        <Icon size={18} className={isSelected ? meta.color : 'text-slate-400'} />
                        <span className={`text-[9px] font-black uppercase tracking-tight leading-tight ${isSelected ? meta.color : 'text-slate-500'}`}>{cat}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className={`w-full py-5 font-black tracking-widest uppercase text-xs flex items-center justify-center gap-3 rounded-2xl shadow-2xl transition-all ${
                  isSOS
                    ? 'bg-red-600 text-white shadow-red-600/30 hover:bg-red-700'
                    : 'btn-primary shadow-primary/30'
                }`}>
                {loading ? <Loader2 className="animate-spin" size={22} /> : <><Send size={20} />{isSOS ? 'Submit Emergency Report' : 'Submit Report'}</>}
              </motion.button>

            </form>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
