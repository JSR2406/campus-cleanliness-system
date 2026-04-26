import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SLATimerProps {
  createdAt: string;
  suggestedSLA: string;
  status: string;
  resolvedAt?: string;
  compact?: boolean;
}

function parseSLA(sla: string): number {
  if (!sla) return 24 * 3600 * 1000; // default 24h
  const value = parseInt(sla, 10);
  if (isNaN(value)) return 24 * 3600 * 1000;
  const s = sla.toLowerCase();
  if (s.includes('minute')) return value * 60 * 1000;
  if (s.includes('hour')) return value * 3600 * 1000;
  if (s.includes('day')) return value * 24 * 3600 * 1000;
  if (s.includes('week')) return value * 7 * 24 * 3600 * 1000;
  return value * 3600 * 1000; // default to hours
}

function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  const h = Math.floor(abs / (3600 * 1000));
  const m = Math.floor((abs % (3600 * 1000)) / (60 * 1000));
  const s = Math.floor((abs % (60 * 1000)) / 1000);
  
  if (h > 48) return `${Math.floor(h/24)}d ${h%24}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function SLATimer({ createdAt, suggestedSLA, status, resolvedAt, compact = false }: SLATimerProps) {
  const [now, setNow] = useState(Date.now());
  const isCompleted = status === 'Resolved' || status === 'Completed' || status === 'Closed';

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const createdTime = new Date(createdAt).getTime();
  const slaMs = parseSLA(suggestedSLA);
  const deadline = createdTime + slaMs;
  
  let effectiveNow = now;
  if (isCompleted && resolvedAt) {
    effectiveNow = new Date(resolvedAt).getTime();
  } else if (isCompleted) {
    // Fallback if resolvedAt is not available but status is Completed
    effectiveNow = deadline - 1; // Fake "met SLA"
  }

  const remaining = deadline - effectiveNow;
  const isOverdue = remaining < 0;
  const percentRemaining = Math.max(0, Math.min(100, (remaining / slaMs) * 100));

  if (isCompleted) {
    const metSLA = !isOverdue;
    if (compact) {
      return (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-max ${metSLA ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {metSLA ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          {metSLA ? 'Met SLA' : 'Missed SLA'}
        </span>
      );
    }
    return (
      <div className={`p-3 rounded-xl border flex items-center gap-2 ${metSLA ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' : 'bg-red-50/50 border-red-100 text-red-600'}`}>
        {metSLA ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        <span className="text-xs font-black uppercase tracking-widest">{metSLA ? '✓ SLA Met' : '✗ SLA Missed'}</span>
      </div>
    );
  }

  // Visual state classes
  let badgeColor = 'bg-emerald-100 text-emerald-700';
  let iconColor = 'text-emerald-500';
  let barColor = 'bg-emerald-500';
  let animatePulse = false;
  let animateShake = false;

  if (isOverdue) {
    badgeColor = 'bg-red-600 text-white shadow-lg shadow-red-500/30';
    iconColor = 'text-white';
    barColor = 'bg-red-600';
    animateShake = true;
  } else if (percentRemaining < 10) {
    badgeColor = 'bg-red-100 text-red-700';
    iconColor = 'text-red-500';
    barColor = 'bg-red-500';
    animateShake = true;
  } else if (percentRemaining < 25) {
    badgeColor = 'bg-orange-100 text-orange-700';
    iconColor = 'text-orange-500';
    barColor = 'bg-orange-500';
    animatePulse = true;
  } else if (percentRemaining < 50) {
    badgeColor = 'bg-yellow-100 text-yellow-700';
    iconColor = 'text-yellow-500';
    barColor = 'bg-yellow-500';
  }

  const timeText = isOverdue ? `${formatDuration(remaining)} overdue` : formatDuration(remaining);

  if (compact) {
    return (
      <motion.div
        animate={animateShake ? { x: [-1, 1, -1, 1, 0] } : animatePulse ? { opacity: [1, 0.7, 1] } : {}}
        transition={animateShake ? { repeat: Infinity, duration: 0.5 } : animatePulse ? { repeat: Infinity, duration: 1 } : {}}
        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-max ${badgeColor}`}
      >
        <Clock size={10} className={iconColor} />
        {timeText}
      </motion.div>
    );
  }

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SLA Time Remaining</span>
        <motion.div
          animate={animateShake ? { x: [-2, 2, -2, 2, 0] } : animatePulse ? { opacity: [1, 0.6, 1] } : {}}
          transition={animateShake ? { repeat: Infinity, duration: 0.4 } : animatePulse ? { repeat: Infinity, duration: 1 } : {}}
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${badgeColor}`}
        >
          <Clock size={10} className={iconColor} />
          {timeText}
        </motion.div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${barColor}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentRemaining}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
