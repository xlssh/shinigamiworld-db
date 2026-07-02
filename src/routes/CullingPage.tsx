import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadCullingStages, loadCullingMagics, loadArticles } from '../data/loaders';
import { CullingStage, CullingMagic, Article } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { 
  Swords, Shield, Compass, ChevronRight, Zap, Target,
  Info, Award, ShieldAlert, BookOpen, AlertCircle
} from 'lucide-react';

export const CullingPage: React.FC = () => {
  const [stages, setStages] = useState<CullingStage[]>([]);
  const [magics, setMagics] = useState<CullingMagic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selections
  const [selectedStageId, setSelectedStageId] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [stagesRes, magicsRes, artRes] = await Promise.all([
          loadCullingStages(),
          loadCullingMagics(),
          loadArticles()
        ]);
        
        const sortedStages = stagesRes.rows.sort((a, b) => a.id - b.id);
        setStages(sortedStages);
        setMagics(magicsRes.rows);
        setArticles(artRes.rows);
        
        if (sortedStages.length > 0) {
          setSelectedStageId(sortedStages[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load Culling Game database.');
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

  const activeStage = useMemo(() => {
    return stages.find(s => s.id === selectedStageId) || null;
  }, [stages, selectedStageId]);

  // Find boss properties linked to this stage
  const activeBoss = useMemo(() => {
    if (!activeStage) return null;
    
    // Stage references boss detail ID in culling_magics
    // Typically matches army_id or stage location indices
    // Let's search magics where id equals stage.id or links
    const boss = magics.find(m => m.id === activeStage.id);
    return boss || null;
  }, [magics, activeStage]);

  // Decode drop list award array
  const decodeAwardsList = (awardData: any) => {
    if (!awardData) return [];
    
    // Handles format: [{"type": 1, "code": code, "amount": amount}]
    // or direct list if it's already an array
    let list: any[] = [];
    if (Array.isArray(awardData)) {
      list = awardData;
    } else if (typeof awardData === 'object' && awardData.award) {
      list = awardData.award;
    } else if (typeof awardData === 'string') {
      try {
        const decoded = JSON.parse(awardData);
        list = Array.isArray(decoded) ? decoded : decoded.award || [];
      } catch {
        list = [];
      }
    }
    
    return list.map(item => {
      const art = articlesMap[item.code];
      return {
        code: item.code,
        name: art ? art.name : `Material #${item.code}`,
        amount: item.amount || 0,
        quality: art ? art.quality : 1
      };
    });
  };

  const firstClearAwards = useMemo(() => {
    return activeStage ? decodeAwardsList(activeStage.award) : [];
  }, [activeStage, articlesMap]);

  const extraAwards = useMemo(() => {
    return activeStage ? decodeAwardsList(activeStage.award_ex) : [];
  }, [activeStage, articlesMap]);

  if (loading) return <LoadingState message="Decoding Culling Game boss configurations..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-xs font-semibold mb-1">
            <Link to="/" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
            <ChevronRight size={12} />
            <span className="text-zinc-500 dark:text-zinc-400">Tools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Swords className="text-red-500" size={28} />
            Culling Game & Endless Abyss Trial Auditor
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Inspect floor layouts, culling boss combat stats, and audit culling first-clear drop packages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Culling Floors selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm space-y-4">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Culling game Floors</span>
            
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {stages.map((stage) => {
                const isSelected = selectedStageId === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm animate-pulse'
                        : 'border-zinc-50 dark:border-zinc-955 bg-zinc-50/50 dark:bg-zinc-950/20 hover:border-zinc-200 text-zinc-655 dark:text-zinc-305'
                    }`}
                  >
                    <span>{stage.name || `Floor #${stage.id}`}</span>
                    <span className="font-mono text-[9px] text-zinc-400">Lv. {stage.need_level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Stage Details & Drops list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Boss Encounter card */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm space-y-5">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Floor Encounter Boss Profile</span>
            
            {activeStage ? (
              <div className="space-y-5">
                <div className="flex justify-between items-start pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                  <div>
                    <h3 className="font-black text-base text-zinc-850 dark:text-zinc-100">
                      {activeStage.name || `Floor #${activeStage.id}`}
                    </h3>
                    <p className="text-[10px] text-zinc-450 mt-1 font-mono">
                      Location Index: {activeStage.location} | Entry level limit: {activeStage.need_level}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-red-500/10 text-red-700 dark:text-red-400 font-semibold uppercase">
                    Tactical Altar
                  </span>
                </div>

                {/* Boss Attributes block */}
                {activeBoss ? (
                  <div className="space-y-4">
                    <span className="text-[9.5px] font-semibold text-zinc-400 uppercase block">Boss Combat Properties</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/50 rounded-xl">
                        <span className="text-zinc-450 text-[9px] uppercase block">Health (HP)</span>
                        <span className="font-mono font-black text-zinc-800 dark:text-white">
                          {activeBoss.life.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/50 rounded-xl">
                        <span className="text-zinc-450 text-[9px] uppercase block">Strength</span>
                        <span className="font-mono font-black text-zinc-800 dark:text-white">
                          {activeBoss.power.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/50 rounded-xl">
                        <span className="text-zinc-450 text-[9px] uppercase block">Agility</span>
                        <span className="font-mono font-black text-zinc-800 dark:text-white">
                          {activeBoss.agile.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/50 rounded-xl">
                        <span className="text-zinc-450 text-[9px] uppercase block">Wisdom</span>
                        <span className="font-mono font-black text-zinc-800 dark:text-white">
                          {activeBoss.intelligence.toLocaleString()}
                        </span>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/60 rounded-xl text-center text-xs text-zinc-400 italic">
                    Boss stats parameters not defined for this stage level.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400 italic">
                Select a floor to view details.
              </div>
            )}
          </div>

          {/* Floor Loot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* First Clear rewards */}
            <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm space-y-4">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">First-Clear Drop Package</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {firstClearAwards.length > 0 ? (
                  firstClearAwards.map((item, idx) => (
                    <div key={idx} className="p-2.5 border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-950/15 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                      <span className="font-mono font-bold text-red-600 dark:text-red-400">{item.amount.toLocaleString()}x</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-zinc-400 italic">
                    No first-clear drop package registered.
                  </div>
                )}
              </div>
            </div>

            {/* Daily sweeps drops */}
            <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm space-y-4">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Daily Extra Sweep Drops</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {extraAwards.length > 0 ? (
                  extraAwards.map((item, idx) => (
                    <div key={idx} className="p-2.5 border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-950/15 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-white">{item.amount.toLocaleString()}x</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-zinc-400 italic">
                    No extra sweep drops registered.
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
