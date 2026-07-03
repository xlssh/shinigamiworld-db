import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadNightmareCities, loadNightmarePoints, loadArticles, loadRelatedConditions } from '../data/loaders';
import { NightmareCity, NightmarePoint, Article, RelatedCondition } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { 
  Globe, Shield, Swords, Info, ChevronRight, Compass,
  Award, TrendingUp, AlertCircle, Sparkles, HelpCircle, Trophy
} from 'lucide-react';

const CHAPTERS_INFO: Record<number, { name: string; desc: string; system: string; difficulty: string }> = {
  15600001: { name: 'Zanpakuto Campaign (Normal)', desc: 'Drops Soul of Conquest materials for Zanpakuto Fortify.', system: 'Zanpakuto', difficulty: 'Normal' },
  15600002: { name: 'Zanpakuto Campaign (Hard)', desc: 'Drops Soul of Conquest materials for Zanpakuto Fortify.', system: 'Zanpakuto', difficulty: 'Hard' },
  15600003: { name: 'Zanpakuto Campaign (Nightmare)', desc: 'Drops Soul of Conquest materials for Zanpakuto Fortify.', system: 'Zanpakuto', difficulty: 'Nightmare' },
  15600004: { name: 'Zanpakuto Campaign (Inferno)', desc: 'Drops Soul of Conquest materials for Zanpakuto Fortify.', system: 'Zanpakuto', difficulty: 'Inferno' },
  15600005: { name: 'Agent of the Shinigami (Normal)', desc: 'Drops Hollowfied Fragments and materials for Main Character Evolution.', system: 'Main Evolution', difficulty: 'Normal' },
  15600006: { name: 'Agent of the Shinigami (Hard)', desc: 'Drops Hollowfied Fragments and materials for Main Character Evolution.', system: 'Main Evolution', difficulty: 'Hard' },
  15600007: { name: 'Agent of the Shinigami (Nightmare)', desc: 'Drops Hollowfied Fragments and materials for Main Character Evolution.', system: 'Main Evolution', difficulty: 'Nightmare' },
  15600008: { name: 'Agent of the Shinigami (Inferno)', desc: 'Drops Hollowfied Fragments and materials for Main Character Evolution.', system: 'Main Evolution', difficulty: 'Inferno' },
  15600009: { name: 'Soul Society (Normal)', desc: 'Drops Reincarnation Stones and Soul Refining Stones for partner Reincarnation.', system: 'Reincarnation', difficulty: 'Normal' },
  15600010: { name: 'Soul Society (Hard)', desc: 'Drops Reincarnation Stones and Soul Refining Stones for partner Reincarnation.', system: 'Reincarnation', difficulty: 'Hard' },
  15600011: { name: 'Soul Society (Nightmare)', desc: 'Drops Reincarnation Stones and Soul Refining Stones for partner Reincarnation.', system: 'Reincarnation', difficulty: 'Nightmare' },
  15600012: { name: 'Soul Society (Inferno)', desc: 'Drops Reincarnation Stones and Soul Refining Stones for partner Reincarnation.', system: 'Reincarnation', difficulty: 'Inferno' },
};

export const NightmareRealmsPage: React.FC = () => {
  const [cities, setCities] = useState<NightmareCity[]>([]);
  const [points, setPoints] = useState<NightmarePoint[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [conditions, setConditions] = useState<RelatedCondition[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected state - initialize with first NightmareCity ID
  const [selectedCityId, setSelectedCityId] = useState<number>(15600001);
  const [selectedPointId, setSelectedPointId] = useState<number>(0);

  // Tab filtering
  const [selectedSystem, setSelectedSystem] = useState<string>('Zanpakuto');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [citiesRes, ptsRes, artRes, condsRes] = await Promise.all([
          loadNightmareCities(),
          loadNightmarePoints(),
          loadArticles(),
          loadRelatedConditions()
        ]);
        
        setCities(citiesRes.rows.sort((a, b) => a.id - b.id));
        setPoints(ptsRes.rows.sort((a, b) => a.id - b.id));
        setArticles(artRes.rows);
        setConditions(condsRes.rows);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load Conquest of Might campaign databases.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const articlesMap = useMemo(() => {
    const map: Record<number, Article> = {};
    articles.forEach(a => {
      map[a.id] = a;
    });
    return map;
  }, [articles]);

  const activeCity = useMemo(() => {
    return cities.find(c => c.id === selectedCityId) || null;
  }, [cities, selectedCityId]);

  // Group cities by system categories
  const systemCities = useMemo(() => {
    return Object.entries(CHAPTERS_INFO).map(([idStr, info]) => ({
      id: parseInt(idStr),
      ...info
    })).filter(c => c.system === selectedSystem);
  }, [selectedSystem]);

  // Auto-select city when system changes
  useEffect(() => {
    if (systemCities.length > 0) {
      // Find if current selection is already in this system, otherwise default
      const alreadyInSystem = systemCities.some(c => c.id === selectedCityId);
      if (!alreadyInSystem) {
        setSelectedCityId(systemCities[0].id);
      }
    }
  }, [selectedSystem, systemCities, selectedCityId]);

  // Points belonging to selected city/chapter (exactly 15 per chapter)
  const cityPoints = useMemo(() => {
    const chapterIdx = selectedCityId - 15600001;
    if (chapterIdx < 0 || chapterIdx >= 12) return [];
    const startIdx = 15000000 + chapterIdx * 100 + 1;
    const endIdx = 15000000 + chapterIdx * 100 + 15;
    return points.filter(p => p.id >= startIdx && p.id <= endIdx);
  }, [points, selectedCityId]);

  // Default selection when city points change
  useEffect(() => {
    if (cityPoints.length > 0) {
      setSelectedPointId(cityPoints[0].id);
    }
  }, [cityPoints]);

  const activePoint = useMemo(() => {
    return points.find(p => p.id === selectedPointId) || null;
  }, [points, selectedPointId]);

  // Decode the clear rewards
  const firstClearAwards = useMemo(() => {
    if (!activeCity || !activeCity.pass_awards) return [];
    return activeCity.pass_awards.map(item => {
      const art = articlesMap[item.code];
      return {
        id: item.code,
        name: art ? art.name : `Item #${item.code}`,
        amount: item.amount || 0,
        quality: art ? art.quality : 2
      };
    });
  }, [activeCity, articlesMap]);

  // Decode stage drops
  const stageDrops = useMemo(() => {
    if (!activeCity || !activeCity.award_ids) return [];
    return activeCity.award_ids.map(id => {
      const art = articlesMap[id];
      return {
        id,
        name: art ? art.name : `Item #${id}`,
        quality: art ? art.quality : 2
      };
    });
  }, [activeCity, articlesMap]);

  // Decode point conditions
  const pointConditions = useMemo(() => {
    if (!activePoint || !activePoint.condition) return [];
    return activePoint.condition.map(condId => {
      const match = conditions.find(c => c.id === condId);
      return {
        id: condId,
        text: match ? match.description : `Condition #${condId}`
      };
    });
  }, [activePoint, conditions]);

  if (loading) return <LoadingState message="Decoding Conquest of Might campaign maps..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const activeMeta = CHAPTERS_INFO[selectedCityId] || { name: 'Unknown Chapter', desc: '', system: '', difficulty: '' };

  const getQualityBorderColor = (q: number) => {
    switch (q) {
      case 3: return 'border-blue-500/30 dark:border-blue-900/40 bg-blue-50/10 text-blue-700 dark:text-blue-300';
      case 4: return 'border-purple-500/30 dark:border-purple-900/40 bg-purple-50/10 text-purple-700 dark:text-purple-300';
      case 5: return 'border-amber-500/30 dark:border-amber-900/40 bg-amber-50/10 text-amber-700 dark:text-amber-300';
      case 6: return 'border-red-500/30 dark:border-red-900/40 bg-red-50/10 text-red-700 dark:text-red-300';
      default: return 'border-border bg-bg/50 text-muted';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted text-xs font-semibold mb-1">
            <Link to="/" className="hover:text-subtle transition-colors font-sans font-bold">Dashboard</Link>
            <ChevronRight size={12} />
            <span className="text-muted font-bold font-sans">Tools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-2.5">
            <Globe className="text-red-500 animate-pulse" size={28} />
            Conquest of Might (Culling) Campaigns
          </h1>
          <p className="text-xs text-muted mt-1">
            Browse high-difficulty campaign checkpoints, audit enemy army IDs, and check chapter first-clear rewards.
          </p>
        </div>
      </div>

      {/* Systems Categories Tabs */}
      <div className="border-b border-border flex gap-4 text-xs md:text-sm font-semibold">
        {['Zanpakuto', 'Main Evolution', 'Reincarnation'].map((sys) => (
          <button
            key={sys}
            onClick={() => setSelectedSystem(sys)}
            className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
              selectedSystem === sys
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-subtle hover:text-text dark:hover:text-zinc-200'
            }`}
          >
            {sys}
          </button>
        ))}
      </div>

      {/* Difficulties Grid */}
      <div className="p-4 border border-border bg-surface rounded-2xl shadow-sm space-y-3">
        <span className="block text-[10px] font-bold text-subtle uppercase tracking-wider">Select Chapter Difficulty</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {systemCities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCityId(city.id)}
              className={`py-3 px-2 text-center rounded-xl border text-xs font-bold transition-all ${
                selectedCityId === city.id
                  ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm'
                  : 'border-border bg-bg/50 hover:border-border text-muted'
              }`}
            >
              <span className="block text-[10px] text-brand font-mono uppercase tracking-wider mb-1">{city.difficulty}</span>
              <span className="block truncate text-xs text-text">{city.name.split(' (')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Points list (15 stages) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 border border-border bg-surface rounded-2xl shadow-sm space-y-4">
            <span className="block text-[10px] font-bold text-subtle uppercase tracking-wider">Campaign Stages</span>
            
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {cityPoints.map((pt, idx) => {
                const isSelected = selectedPointId === pt.id;
                return (
                  <button
                    key={pt.id}
                    onClick={() => setSelectedPointId(pt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm'
                        : 'border-border bg-bg/50 hover:border-border text-muted'
                    }`}
                  >
                    <span>Stage {idx + 1} - {pt.name.split(' - ')[1] || pt.name}</span>
                    <span className="font-mono text-[9px] text-subtle">#{pt.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Checkpoint Details & Rewards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Checkpoint Details card */}
          <div className="p-6 border border-border bg-surface rounded-2xl shadow-sm space-y-5">
            <div className="flex justify-between items-start pb-3 border-b border-border/60">
              <div>
                <span className="text-[10px] text-subtle block uppercase font-mono">{activeMeta.name}</span>
                <h3 className="font-black text-base text-text mt-0.5">
                  {activePoint?.name || 'Campaign Checkpoint'}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-red-500/10 text-red-700 dark:text-red-400 font-semibold font-mono">
                Stage ID: {activePoint?.id}
              </span>
            </div>

            {/* Completion conditions */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-subtle uppercase tracking-wider block">Stage Target Star Conditions</span>
              {pointConditions.length > 0 ? (
                <div className="space-y-2">
                  {pointConditions.map((cond) => (
                    <div key={cond.id} className="p-3 border border-emerald-500/20 bg-emerald-50/10 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-start gap-2">
                      <Award size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{cond.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 border border-border bg-bg/50 text-subtle rounded-xl text-xs flex items-center gap-2">
                  <HelpCircle size={15} />
                  <span>Win the battle (Standard clearing condition)</span>
                </div>
              )}
            </div>

            {/* Stage Specifications */}
            {activePoint && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="p-3 border border-border bg-bg/10 rounded-xl space-y-1">
                  <span className="font-semibold text-subtle uppercase text-[9px] block font-sans">Enemy Army ID</span>
                  <div className="flex items-center gap-1.5">
                    <Swords size={14} className="text-red-500" />
                    <span className="font-bold text-text">
                      Army #{activePoint.army_ids[0] || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-border bg-bg/10 rounded-xl space-y-1">
                  <span className="font-semibold text-subtle uppercase text-[9px] block font-sans">Battle Scene Backdrop</span>
                  <div className="flex items-center gap-1.5">
                    <Compass size={14} className="text-subtle" />
                    <span className="font-bold text-text">
                      Scene #{activePoint.battle_scene}
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Chapter Pass Rewards & Drops */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stage Drop Pool */}
            <div className="p-5 border border-border bg-surface rounded-2xl shadow-sm space-y-4">
              <span className="block text-[10px] font-bold text-subtle uppercase tracking-wider">Stage Drop Item Pool</span>
              <div className="space-y-2">
                {stageDrops.length > 0 ? (
                  stageDrops.map((item) => (
                    <div key={item.id} className={`p-3 border rounded-xl flex items-center justify-between text-xs ${getQualityBorderColor(item.quality || 2)}`}>
                      <span className="font-bold">{item.name}</span>
                      <span className="text-[10px] font-mono opacity-80">ID: #{item.id}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-subtle italic">
                    No stage drops registered.
                  </div>
                )}
              </div>
            </div>

            {/* First Clear Reward Package */}
            <div className="p-5 border border-border bg-surface rounded-2xl shadow-sm space-y-4">
              <span className="block text-[10px] font-bold text-subtle uppercase tracking-wider">Chapter Clear Reward Package</span>
              <div className="space-y-2">
                {firstClearAwards.length > 0 ? (
                  firstClearAwards.map((item) => (
                    <div key={item.id} className={`p-3 border rounded-xl flex items-center justify-between text-xs ${getQualityBorderColor(item.quality || 2)}`}>
                      <span className="font-bold">{item.name}</span>
                      <span className="font-mono font-black text-red-600 dark:text-red-400">{item.amount.toLocaleString()}x</span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-subtle italic">
                    No clear reward package registered for this chapter.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
