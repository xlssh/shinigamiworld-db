import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadPromotionalActivities } from '../data/loaders';
import { PromotionalActivity } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { JsonViewer } from '../components/JsonViewer';
import { ArrowLeft, Flame, Calendar, ShieldAlert } from 'lucide-react';

export const PromotionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [promo, setPromo] = useState<PromotionalActivity | null>(null);

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

  if (loading) return <LoadingState message="Downloading campaign timelines and bonus configurations..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPromoDetails} />;
  if (!promo) return <ErrorState message="Promotion not found." onRetry={fetchPromoDetails} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <div>
        <Link
          to="/promotions"
          className="flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Promotions</span>
        </Link>
      </div>

      {/* Main Panel */}
      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded">
              ID: {promo.id}
            </span>
            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-900 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
              Recharge Promotion Activity
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Flame size={28} className="text-red-500 animate-pulse" />
            <span>{promo.name || `Promotion #${promo.id}`}</span>
          </h1>

          {/* Schedule */}
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-xl space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Calendar size={16} className="text-red-500" />
              <span>Event Lifespan Schedule</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-400 block mb-0.5 font-semibold">Start Timeline</span>
                <span className="font-mono font-bold text-zinc-700 dark:text-zinc-200">
                  {promo.start_time || 'Immediate Activation'}
                </span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/60">
                <span className="text-zinc-400 block mb-0.5 font-semibold">End Timeline</span>
                <span className="font-mono font-bold text-zinc-700 dark:text-zinc-200">
                  {promo.end_time || 'Permanent'}
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

      {/* Constraints and requirements */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <ShieldAlert size={18} className="text-amber-500" />
          <span>Participation Constraints & Visual Layouts</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
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
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Display Timeline Option</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Type #{promo.start_time_show ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Raw JSON entry fallback */}
      <JsonViewer data={promo} title={`Raw JSON Database Entry: Promotion #${promo.id}`} />
    </div>
  );
};
