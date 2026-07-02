import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadPromotionalActivities } from '../data/loaders';
import { PromotionalActivity } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { Calendar, ArrowLeft, Search, Clock, HelpCircle, Compass, ShieldAlert } from 'lucide-react';

export const PromotionSchedulerPage: React.FC = () => {
  const [promos, setPromos] = useState<PromotionalActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);

  // Server Launch Picker
  const [launchDate, setLaunchDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await loadPromotionalActivities();
      // Sort and filter for unique promotion names to reduce redundancy
      const uniqueRows: PromotionalActivity[] = [];
      const seen = new Set<string>();
      
      const sorted = [...res.rows].sort((a, b) => a.id - b.id);
      for (const row of sorted) {
        const key = `${row.name}-${row.act_type}-${row.time_type}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRows.push(row);
        }
      }
      setPromos(uniqueRows);
      if (uniqueRows.length > 0) {
        setSelectedPromoId(uniqueRows[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load promotions archive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPromos = useMemo(() => {
    if (!searchQuery.trim()) return promos;
    const query = searchQuery.toLowerCase();
    return promos.filter(p =>
      (p.name && p.name.toLowerCase().includes(query)) ||
      p.id.toString().includes(query)
    );
  }, [promos, searchQuery]);

  const selectedPromo = useMemo(() => {
    return promos.find(p => p.id === selectedPromoId) || null;
  }, [promos, selectedPromoId]);

  // Decode scheduler parameters based on time_type
  const scheduleDetail = useMemo(() => {
    if (!selectedPromo) return null;

    const { time_type, start_time, end_time } = selectedPromo;

    const startArr = Array.isArray(start_time) ? start_time : [];
    const endArr = Array.isArray(end_time) ? end_time : [];

    switch (time_type) {
      case 1: {
        // Relative to Server launch day
        const dayStart = startArr[0] ?? 1;
        const dayEnd = endArr[0] ?? 7;
        
        const baseDate = new Date(launchDate);
        if (isNaN(baseDate.getTime())) return null;
        
        const actualStart = new Date(baseDate);
        actualStart.setDate(baseDate.getDate() + (dayStart - 1));
        
        const actualEnd = new Date(baseDate);
        actualEnd.setDate(baseDate.getDate() + (dayEnd - 1));

        return {
          typeName: "Server Launch Relative Day cycle",
          description: `Starts on relative Day ${dayStart} and ends on relative Day ${dayEnd} after Server Launch.`,
          simulatedDates: `Based on Launch Date (${launchDate}), triggers from: ${actualStart.toLocaleDateString()} to ${actualEnd.toLocaleDateString()}.`
        };
      }
      case 2: {
        // Weekly schedule
        const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const wkStart = startArr[0] ?? 1;
        const wkEnd = endArr[0] ?? 7;
        return {
          typeName: "Weekly Recurring Schedule",
          description: `Runs weekly starting every ${weekdays[wkStart - 1] ?? 'Monday'} and ending every ${weekdays[wkEnd - 1] ?? 'Sunday'}.`,
          simulatedDates: `Active weekly starting on ${weekdays[wkStart - 1] ?? 'Monday'} through ${weekdays[wkEnd - 1] ?? 'Sunday'}.`
        };
      }
      case 3: {
        // Absolute fixed dates
        const yStart = startArr[0] ?? 2026;
        const mStart = startArr[1] ?? 1;
        const dStart = startArr[2] ?? 1;
        const yEnd = endArr[0] ?? 2026;
        const mEnd = endArr[1] ?? 12;
        const dEnd = endArr[2] ?? 31;
        return {
          typeName: "Fixed Calendar Date Range",
          description: `Absolute static dates set in database config: from ${yStart}-${String(mStart).padStart(2, '0')}-${String(dStart).padStart(2, '0')} to ${yEnd}-${String(mEnd).padStart(2, '0')}-${String(dEnd).padStart(2, '0')}.`,
          simulatedDates: `Static range: Active from ${mStart}/${dStart}/${yStart} to ${mEnd}/${dEnd}/${yEnd}.`
        };
      }
      case 5: {
        // Cyclic modulo repeats
        const yStart = startArr[0] ?? 2026;
        const mStart = startArr[1] ?? 1;
        const dStart = startArr[2] ?? 1;
        const duration = endArr[0] ?? 1;
        const cooldown = endArr[1] ?? 0;
        const cycleDays = duration + cooldown;
        return {
          typeName: "Cyclic Repeating modulo (Modulo Time)",
          description: `Repeats periodically. Duration of activity: ${duration} Days, followed by a cooldown of ${cooldown} Days before repeating.`,
          simulatedDates: `Modulo cycle starts ${yStart}-${String(mStart).padStart(2, '0')}-${String(dStart).padStart(2, '0')}: Active for ${duration} days, off for ${cooldown} days (repeats every ${cycleDays} days).`
        };
      }
      default:
        return {
          typeName: `Custom Time Scheme Type #${time_type}`,
          description: `Custom or unmapped scheduler strategy type ${time_type}.`,
          simulatedDates: "Not simulated."
        };
    }
  }, [selectedPromo, launchDate]);

  if (loading) return <LoadingState message="Decoding promotional scheduling configurations and calendar modules..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation */}
      <div>
        <Link
          to="/promotions"
          className="flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Promotions Archives</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl">
              <Calendar size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50">Promotion Cycle Simulator</h1>
              <p className="text-xs text-zinc-550 font-semibold">Translate ActionScript client relative scheduling values into real-world calendars.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-450 uppercase whitespace-nowrap">Server Launch:</label>
            <input
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs font-bold text-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Selector */}
        <div className="xl:col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            Select Campaign Deal
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1.5 focus:ring-fuchsia-500 placeholder-zinc-400"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredPromos.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPromoId(p.id)}
                className={`w-full p-3 text-left border rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                  selectedPromoId === p.id
                    ? 'border-fuchsia-500 bg-fuchsia-500/5 text-fuchsia-800 dark:text-fuchsia-400 font-bold'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="font-semibold block truncate">{p.name}</span>
                  <span className="text-[10px] text-zinc-400">Time Type: #{p.time_type}</span>
                </div>
                <span className="font-mono text-[9px] text-zinc-400 shrink-0">#{p.id}</span>
              </button>
            ))}
            {filteredPromos.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-8">No deals found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Scheduler Details */}
        <div className="xl:col-span-2 space-y-6">
          {selectedPromo && scheduleDetail && (
            <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold">SCHEDULER ENGINE</span>
                  <h2 className="text-xl font-black text-zinc-850 dark:text-zinc-50">{selectedPromo.name}</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-800 dark:text-fuchsia-400 text-xs font-black uppercase">
                  Type {selectedPromo.time_type}: {scheduleDetail.typeName}
                </span>
              </div>

              {/* Timing stats card */}
              <div className="p-5 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-xl space-y-4">
                <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <Clock size={16} className="text-fuchsia-500" />
                  <span>Cycle Analysis Report</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Description</span>
                    <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{scheduleDetail.description}</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Simulated Real-world Calendar Dates</span>
                    <p className="text-fuchsia-600 dark:text-fuchsia-400 font-bold font-mono">{scheduleDetail.simulatedDates}</p>
                  </div>
                </div>
              </div>

              {/* Restrictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-xl flex items-center gap-3">
                  <ShieldAlert size={18} className="text-violet-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase">Player Level gate</span>
                    <span className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">
                      {(selectedPromo.player_lv ?? 0) > 0 ? `Level ${selectedPromo.player_lv}+ required` : 'No level gate'}
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-xl flex items-center gap-3">
                  <HelpCircle size={18} className="text-amber-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase">VIP Level gate</span>
                    <span className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">
                      {(selectedPromo.vip_lv ?? 0) > 0 ? `VIP Level ${selectedPromo.vip_lv}+ required` : 'No VIP gate'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
