import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X } from 'lucide-react';

// Self-contained type — no external dependency
interface Complaint {
  region?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}

const REGIONS = [
  { id: 'Main Building', label: 'Main Building', x: 45, y: 30 },
  { id: 'Hostel Block A', label: 'Hostel Block A', x: 20, y: 60 },
  { id: 'Hostel Block B', label: 'Hostel Block B', x: 25, y: 75 },
  { id: 'Library', label: 'Library', x: 65, y: 25 },
  { id: 'Cafeteria', label: 'Cafeteria', x: 55, y: 55 },
  { id: 'Sports Complex', label: 'Sports Complex', x: 80, y: 70 },
  { id: 'Labs Block', label: 'Labs Block', x: 70, y: 45 },
  { id: 'Parking Lot', label: 'Parking Lot', x: 15, y: 40 },
];

interface CampusMapProps {
  complaints: any[];
  onRegionClick: (regionId: string | null) => void;
  selectedRegion: string | null;
}

export default function CampusMap({ complaints, onRegionClick, selectedRegion }: CampusMapProps) {
  // Aggregate complaints by region
  const regionStats = REGIONS.map((region) => {
    const regionComplaints = complaints.filter(c => c.region === region.id);
    const openComplaints = regionComplaints.filter(c => c.status !== 'Completed');
    
    // Top category
    const catCounts: Record<string, number> = {};
    regionComplaints.forEach(c => {
      catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Color logic based on total complaints
    const count = openComplaints.length;
    let colorClass = 'bg-emerald-500';
    let pulseClass = 'shadow-emerald-500/50';
    if (count >= 6) {
      colorClass = 'bg-red-500';
      pulseClass = 'shadow-red-500/50';
    } else if (count >= 3) {
      colorClass = 'bg-orange-500';
      pulseClass = 'shadow-orange-500/50';
    } else if (count >= 1) {
      colorClass = 'bg-yellow-400';
      pulseClass = 'shadow-yellow-400/50';
    }

    return {
      ...region,
      total: regionComplaints.length,
      openCount: count,
      topCategory,
      colorClass,
      pulseClass,
    };
  });

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl mb-8 group bg-slate-900">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200"
        alt="Campus Map Aerial"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Overlay Title */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <span className="text-white text-xs font-black uppercase tracking-widest">Campus Live Map</span>
      </div>

      {/* Clear Filter Button */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onRegionClick(null)}
            className="absolute top-4 right-4 bg-white text-ink hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-colors z-20"
          >
            <X size={14} /> Clear Filter
          </motion.button>
        )}
      </AnimatePresence>

      {/* Region Pins */}
      {regionStats.map((stat) => {
        const isSelected = selectedRegion === stat.id;
        const isFaded = selectedRegion && selectedRegion !== stat.id;

        return (
          <div
            key={stat.id}
            className={`absolute z-10 transition-opacity duration-300 ${isFaded ? 'opacity-40' : 'opacity-100'}`}
            style={{ left: `${stat.x}%`, top: `${stat.y}%` }}
          >
            {/* Bouncing Arrow for selected pin */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    y: {
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-white drop-shadow-md"
                >
                  ▼
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Pin */}
            <motion.button
              onClick={() => onRegionClick(stat.id)}
              className="relative group/pin flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            >
              {/* Pulse effect */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute w-8 h-8 rounded-full ${stat.colorClass} opacity-40 blur-sm`}
              />
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${stat.colorClass} ${stat.pulseClass} z-10 relative flex items-center justify-center`}>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-ink dark:text-white px-4 py-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover/pin:opacity-100 pointer-events-none transition-opacity duration-200 w-48 z-30">
                <p className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin size={12}/> {stat.label}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Open</p>
                    <p className={`text-sm font-black ${stat.openCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{stat.openCount}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black">{stat.total}</p>
                  </div>
                </div>
                <div className="bg-primary/5 dark:bg-primary/10 p-2 rounded-lg text-center">
                  <p className="text-[9px] text-primary/70 font-bold uppercase tracking-widest">Top Issue</p>
                  <p className="text-[10px] font-black text-primary">{stat.topCategory}</p>
                </div>
              </div>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}
