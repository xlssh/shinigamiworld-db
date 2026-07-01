import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadHeroes } from '../data/loaders';
import { Hero } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { getProfessionLabel } from '../data/relationships';
import { getQualityColorClass } from './HeroesPage';
import { LayoutGrid } from 'lucide-react';

const TIER_ORDER = ['SS', 'S+', 'S', 'A+', 'A', 'A-', 'B+', 'B', 'C', 'D'];
const PROFESSIONS = [1, 2, 3, 4, 5];

const PROF_COLOR_BG: Record<number, string> = {
  1: 'bg-amber-500',
  2: 'bg-emerald-500',
  3: 'bg-violet-500',
  4: 'bg-rose-500',
  5: 'bg-fuchsia-500',
};

const PROF_LABEL_COLOR: Record<number, string> = {
  1: 'text-amber-955 dark:text-amber-400',
  2: 'text-emerald-800 dark:text-emerald-400',
  3: 'text-violet-850 dark:text-violet-400',
  4: 'text-rose-800 dark:text-rose-400',
  5: 'text-fuchsia-800 dark:text-fuchsia-400',
};

function getHeatColor(count: number, max: number): string {
  if (count === 0) return 'bg-zinc-100 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-700';
  const pct = count / max;
  if (pct >= 0.8) return 'bg-fuchsia-200 dark:bg-fuchsia-950/40 text-fuchsia-950 dark:text-fuchsia-300 border border-fuchsia-300 dark:border-fuchsia-800/40';
  if (pct >= 0.6) return 'bg-violet-200 dark:bg-violet-950/40 text-violet-950 dark:text-violet-300 border border-violet-300 dark:border-violet-800/40';
  if (pct >= 0.4) return 'bg-indigo-200 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-850/40';
  if (pct >= 0.2) return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30';
  return 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/40';
}

export const TierHeatmapPage: React.FC = () => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ tier: string; prof: number } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await loadHeroes();
      setHeroes(res.rows);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build heatmap data: tier x profession -> count + hero list
  const heatmap = useMemo(() => {
    const map: Record<string, Record<number, Hero[]>> = {};
    TIER_ORDER.forEach(tier => {
      map[tier] = {};
      PROFESSIONS.forEach(p => { map[tier][p] = []; });
    });
    heroes.forEach(h => {
      const tier = h.role ?? 'D';
      const prof = h.profession ?? 0;
      if (!map[tier]) map[tier] = {};
      if (!map[tier][prof]) map[tier][prof] = [];
      if (prof > 0) map[tier][prof].push(h);
    });
    return map;
  }, [heroes]);

  const maxCount = useMemo(() => {
    let max = 0;
    TIER_ORDER.forEach(tier => {
      PROFESSIONS.forEach(prof => {
        max = Math.max(max, (heatmap[tier]?.[prof] ?? []).length);
      });
    });
    return max;
  }, [heatmap]);

  const selectedHeroes = useMemo(() => {
    if (!selected) return [];
    return (heatmap[selected.tier]?.[selected.prof] ?? []).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }, [selected, heatmap]);

  if (loading) return <LoadingState message="Building tier heatmap…" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">📊 Tier × Class Heatmap</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-405 mt-1">
          Distribution of {heroes.length} heroes across tier ratings and profession classes. Click a cell to see the roster.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heatmap Table */}
        <div className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[10px] font-bold text-zinc-500 dark:text-zinc-400 w-12">Tier</th>
                  {PROFESSIONS.map(p => (
                    <th key={p} className="p-2 text-center">
                      <span className={`text-[10px] font-black ${PROF_LABEL_COLOR[p]}`}>
                        {getProfessionLabel(p)}
                      </span>
                    </th>
                  ))}
                  <th className="p-2 text-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {TIER_ORDER.map(tier => {
                  const rowHeroes = PROFESSIONS.flatMap(p => heatmap[tier]?.[p] ?? []);
                  return (
                    <tr key={tier} className="border-b border-zinc-200 dark:border-zinc-800/80">
                      <td className="p-2">
                        <span className={`text-xs font-black ${
                          tier === 'SS' ? 'text-amber-950 dark:text-amber-400' :
                          tier.startsWith('S') ? 'text-orange-950 dark:text-orange-450' :
                          tier.startsWith('A') ? 'text-rose-900 dark:text-rose-400' :
                          'text-zinc-650 dark:text-zinc-400'
                        }`}>{tier}</span>
                      </td>
                      {PROFESSIONS.map(prof => {
                        const count = (heatmap[tier]?.[prof] ?? []).length;
                        const isSelected = selected?.tier === tier && selected?.prof === prof;
                        return (
                          <td key={prof} className="p-1.5">
                            <button
                              onClick={() => setSelected(isSelected ? null : { tier, prof })}
                              className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                                count === 0 ? 'text-zinc-400 dark:text-zinc-700 cursor-default' : getHeatColor(count, maxCount)
                              } ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-110' : count > 0 ? 'hover:scale-105 cursor-pointer' : ''}`}
                            >
                              {count > 0 ? count : '·'}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-2 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {rowHeroes.length}
                      </td>
                    </tr>
                  );
                })}
                {/* Column totals */}
                <tr className="border-t border-zinc-300 dark:border-zinc-700">
                  <td className="p-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Total</td>
                  {PROFESSIONS.map(prof => {
                    const total = TIER_ORDER.reduce((s, t) => s + (heatmap[t]?.[prof] ?? []).length, 0);
                    return (
                      <td key={prof} className="p-2 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">{total}</td>
                    );
                  })}
                  <td className="p-2 text-center text-xs font-black text-zinc-950 dark:text-zinc-50">{heroes.length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-3 mt-4 text-[9px] text-zinc-500 dark:text-zinc-400">
            <span>Low</span>
            <div className="flex gap-1">
              {['bg-zinc-100 dark:bg-zinc-900', 'bg-indigo-55 dark:bg-indigo-950/20', 'bg-indigo-200 dark:bg-indigo-950/40', 'bg-violet-200 dark:bg-violet-950/40', 'bg-fuchsia-200 dark:bg-fuchsia-950/40'].map((c, i) => (
                <div key={i} className={`w-6 h-3 rounded ${c} border border-zinc-200 dark:border-zinc-800/40`} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>

        {/* Selected Cell */}
        <div className="space-y-4">
          {selected ? (
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <div>
                <div className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Selected Cell</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xl font-black ${
                    selected.tier === 'SS' ? 'text-amber-950 dark:text-amber-400' :
                    selected.tier.startsWith('S') ? 'text-orange-950 dark:text-orange-400' :
                    selected.tier.startsWith('A') ? 'text-rose-900 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'
                  }`}>{selected.tier}</span>
                  <span className={`text-sm font-black ${PROF_LABEL_COLOR[selected.prof]}`}>
                    {getProfessionLabel(selected.prof)}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{selectedHeroes.length} heroes</div>
              </div>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {selectedHeroes.map(h => (
                  <Link key={h.id} to={`/heroes/${h.id}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-805 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{h.name}</span>
                    <span className={`text-[9px] font-black ${getQualityColorClass(h.quality)}`}>{h.role}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
              <LayoutGrid size={32} className="mx-auto mb-3 text-zinc-400 dark:text-zinc-650" />
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Click a cell</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">to see the heroes in that tier + class</div>
            </div>
          )}

          {/* Column totals card */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Class Totals</span>
            {PROFESSIONS.map(prof => {
              const total = TIER_ORDER.reduce((s, t) => s + (heatmap[t]?.[prof] ?? []).length, 0);
              return (
                <div key={prof} className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold w-18 ${PROF_LABEL_COLOR[prof]}`}>{getProfessionLabel(prof)}</span>
                  <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${PROF_COLOR_BG[prof]} opacity-70 transition-all`}
                      style={{ width: `${(total / heroes.length) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-800 dark:text-zinc-200 w-4 text-right">{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
