import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadPromotionalActivities } from '../data/loaders';
import { PromotionalActivity } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { JsonViewer } from '../components/JsonViewer';
import { ArrowLeft, Flame, Calendar, ShieldAlert } from 'lucide-react';

function getTimeTypeLabel(type: number): string {
  switch (type) {
    case 1: return 'Server Open relative';
    case 2: return 'Weekly Recurring';
    case 3: return 'Fixed Calendar';
    case 4: return 'Minute Cooldown';
    case 5: return 'Cyclic Repeat';
    default: return `Type #${type}`;
  }
}

function getActivityTypeLabel(type: number): string {
  switch (type) {
    case 1: return 'Open Server Challenge';
    case 2: return 'Recharge Reward';
    case 3: return 'Login Gift';
    case 4: return 'Growth Fund';
    case 5: return 'Single Recharge';
    case 6: return 'Total Recharge';
    case 7: return 'Total Spending';
    case 8: return 'Daily Spending';
    case 9: return 'VIP Exclusive Shop';
    case 10: return 'Recruit Event';
    case 11: return 'Tavern Rebate';
    case 12: return 'Stone Merge Event';
    case 13: return 'Gear Collection';
    case 14: return 'Relic Upgrade Event';
    case 15: return 'Butterfly Event';
    case 16: return 'Guild Defense';
    case 17: return 'Circle Trial';
    case 18: return 'Lucky Turntable';
    case 19: return 'Jigsaw Puzzle';
    case 20: return 'Warrior Gacha';
    case 21: return 'Shop Discount';
    case 22: return 'Black Market Sale';
    default: return `Activity Type #${type}`;
  }
}

function formatSchedule(timeType: number | null, startTime: any, endTime: any): string {
  const startArr = Array.isArray(startTime) ? startTime : [];
  const endArr = Array.isArray(endTime) ? endTime : [];

  if (timeType === null || timeType === undefined) return '-';

  switch (timeType) {
    case 1: {
      const dayStart = startArr[0] ?? 1;
      const dayEnd = endArr[0] ?? 7;
      return `Server Day ${dayStart} to Day ${dayEnd}`;
    }
    case 2: {
      const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const wkStart = startArr[0] ?? 1;
      const wkEnd = endArr[0] ?? 7;
      const startDay = weekdays[wkStart - 1] ?? `Day ${wkStart}`;
      const endDay = weekdays[wkEnd - 1] ?? `Day ${wkEnd}`;
      return `Weekly: ${startDay} - ${endDay}`;
    }
    case 3: {
      if (startArr.length === 0 && endArr.length === 0) return 'Immediate / Permanent';

      const formatFixedDate = (arr: number[]) => {
        if (!arr || arr.length < 3) return '-';
        const y = arr[0];
        const m = String(arr[1]).padStart(2, '0');
        const d = String(arr[2]).padStart(2, '0');
        const h = arr[3] !== undefined ? ` ${String(arr[3]).padStart(2, '0')}:00` : '';
        return `${y}-${m}-${d}${h}`;
      };

      return `${formatFixedDate(startArr)} to ${formatFixedDate(endArr)}`;
    }
    case 4: {
      const minStart = startArr[0] ?? 0;
      const minEnd = endArr[0] ?? 0;
      return `Cooldown: ${minStart}m - ${minEnd}m`;
    }
    case 5: {
      const duration = endArr[0] ?? 1;
      const cooldown = endArr[1] ?? 0;
      const startY = startArr[0] || 2026;
      const startM = startArr[1] || 1;
      const startD = startArr[2] || 1;
      return `Cyclic: ${duration}d Active / ${cooldown}d Off (From ${startY}-${String(startM).padStart(2, '0')}-${String(startD).padStart(2, '0')})`;
    }
    default:
      return `Custom (Type ${timeType})`;
  }
}

function getActivityTypeBadgeClass(type: number): string {
  switch (type) {
    case 1:
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/30';
    case 2:
    case 5:
    case 6:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30';
    case 3:
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30';
    case 7:
    case 8:
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/30';
    case 10:
    case 11:
    case 20:
      return 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200/50 dark:border-violet-900/30';
    case 4:
    case 9:
    case 21:
    case 22:
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-900/30';
    default:
      return 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/30';
  }
}

function getTimeTypeBadgeClass(type: number): string {
  switch (type) {
    case 1:
    case 5:
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30';
    case 2:
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/30';
    case 3:
      return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900/30';
    default:
      return 'bg-zinc-50 text-zinc-650 dark:bg-zinc-900/40 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/30';
  }
}

export const PromotionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promo, setPromo] = useState<PromotionalActivity | null>(null);

  // Calendar launch simulation date state
  const [launchDate, setLaunchDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchPromoDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const promoId = parseInt(id || '');

      const promosRes = await loadPromotionalActivities();
      const match = promosRes.rows.find(p => p.id === promoId);
      if (match) {
        setPromo(match);
      } else {
        setError(`Promotion with ID ${id} not found in database.`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load promotion details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoDetails();
  }, [id]);

  const simulatedWindow = useMemo(() => {
    if (!promo) return '';
    const { time_type, start_time, end_time } = promo;
    const startArr = Array.isArray(start_time) ? start_time : [];
    const endArr = Array.isArray(end_time) ? end_time : [];

    switch (time_type) {
      case 1: {
        const dayStart = startArr[0] ?? 1;
        const dayEnd = endArr[0] ?? 7;
        const baseDate = new Date(launchDate);
        if (isNaN(baseDate.getTime())) return '-';

        const actualStart = new Date(baseDate);
        actualStart.setDate(baseDate.getDate() + (dayStart - 1));
        const actualEnd = new Date(baseDate);
        actualEnd.setDate(baseDate.getDate() + (dayEnd - 1));
        return `${actualStart.toLocaleDateString()} to ${actualEnd.toLocaleDateString()} (Days ${dayStart}-${dayEnd})`;
      }
      case 2: {
        const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const wkStart = startArr[0] ?? 1;
        const wkEnd = endArr[0] ?? 7;
        const startDay = weekdays[wkStart - 1] ?? `Day ${wkStart}`;
        const endDay = weekdays[wkEnd - 1] ?? `Day ${wkEnd}`;
        return `Weekly: ${startDay} through ${endDay}`;
      }
      case 3: {
        const yStart = startArr[0] ?? 2026;
        const mStart = startArr[1] ? startArr[1] - 1 : 0;
        const dStart = startArr[2] ?? 1;
        const yEnd = endArr[0] ?? 2026;
        const mEnd = endArr[1] ? endArr[1] - 1 : 11;
        const dEnd = endArr[2] ?? 31;
        const actualStart = new Date(yStart, mStart, dStart);
        const actualEnd = new Date(yEnd, mEnd, dEnd);
        return `${actualStart.toLocaleDateString()} to ${actualEnd.toLocaleDateString()} (Fixed calendar range)`;
      }
      case 5: {
        const duration = endArr[0] ?? 1;
        const cooldown = endArr[1] ?? 0;
        return `Periodic cycle: Active for ${duration} days, cooldown of ${cooldown} days before repeating.`;
      }
      default:
        return 'Permanent / Unknown schedule';
    }
  }, [promo, launchDate]);

  if (loading) return <LoadingState message="Downloading campaign timelines and bonus configurations..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPromoDetails} />;
  if (!promo) return <ErrorState message="Promotion not found." onRetry={fetchPromoDetails} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <div>
        <Link
          to="/promotions"
          className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Promotions List</span>
        </Link>
      </div>

      {/* Main Panel */}
      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-5 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-950 px-2.5 py-0.5 rounded">
              ID: {promo.id}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getActivityTypeBadgeClass(promo.act_type ?? 0)}`}>
              {getActivityTypeLabel(promo.act_type ?? 0)}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getTimeTypeBadgeClass(promo.time_type ?? 0)}`}>
              {getTimeTypeLabel(promo.time_type ?? 0)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Flame size={28} className="text-red-500 animate-pulse" />
            <span>{promo.name || `Promotion #${promo.id}`}</span>
          </h1>

          {/* Schedule Summary */}
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-xl space-y-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Calendar size={16} className="text-red-500" />
              <span>Parsed Campaign Duration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60 flex flex-col gap-1">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Readable Timing Format</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">
                  {formatSchedule(promo.time_type, promo.start_time, promo.end_time)}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Technical specs */}
        <div className="w-full md:w-64 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3 shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">Event Properties</h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
            <div>
              <span className="text-zinc-400 block mb-0.5">Activity ID</span>
              <span className="font-mono font-bold text-zinc-700 dark:text-zinc-350">#{promo.act_id}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Activity Type</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350">Type {promo.act_type}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Time Category</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350">Type {promo.time_type}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Trigger Icon</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-350">Icon #{promo.act_icon ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Date Simulator widget inside detail page */}
      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <Calendar size={16} className="text-violet-500" />
          <span>Real-World Date Simulator for your Server</span>
        </h3>

        <p className="text-xs text-zinc-500">
          This promotion uses a relative launch timer. Type in your server's start date to reveal the exact calendar date windows when the deal will display.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold uppercase text-zinc-450 mb-1">Your Server Launch Date</label>
            <input
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:ring-1.5 focus:ring-violet-500 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="md:col-span-2 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900 text-xs flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase text-zinc-400">Simulated Real-World Schedule</span>
            <span className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">
              {simulatedWindow}
            </span>
          </div>
        </div>
      </div>

      {/* Constraints and requirements */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <ShieldAlert size={18} className="text-amber-500" />
          <span>Participation Constraints & Visual Layouts</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono">
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Required Level</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Lv. {promo.player_lv || 1}</span>
          </div>
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Required VIP Rank</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">VIP Rank {promo.vip_lv || 0}</span>
          </div>
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Dashboard Index</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Position #{promo.position ?? 0}</span>
          </div>
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Active Screen Row</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Row #{promo.act_position ?? 0}</span>
          </div>
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Display Option</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Type #{promo.start_time_show ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Raw JSON entry fallback */}
      <JsonViewer data={promo} title={`Raw JSON Database Entry: Promotion #${promo.id}`} />
    </div>
  );
};
