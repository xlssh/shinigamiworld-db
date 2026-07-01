import React, { useEffect, useState } from 'react';
import { loadTavernGrades, loadTavernPayConfigs, loadTavernWarriors, loadBlackMarketItems, loadArticles } from '../data/loaders';
import { TavernGrade, TavernPayConfig, TavernWarrior, BlackMarketItem, Article } from '../types/db';
import { LoadingState } from '../components/LoadingState';

export function GachaShopsPage() {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<TavernGrade[]>([]);
  const [payConfigs, setPayConfigs] = useState<TavernPayConfig[]>([]);
  const [warriors, setWarriors] = useState<TavernWarrior[]>([]);
  const [blackMarketItems, setBlackMarketItems] = useState<BlackMarketItem[]>([]);
  const [articlesMap, setArticlesMap] = useState<Record<number, Article>>({});

  const [activeTab, setActiveTab] = useState<'tavern' | 'market'>('tavern');

  // Gacha draw state
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [gachaHistory, setGachaHistory] = useState<Array<{ name: string; quality: number; type: string }>>([]);

  useEffect(() => {
    Promise.all([
      loadTavernGrades(),
      loadTavernPayConfigs(),
      loadTavernWarriors(),
      loadBlackMarketItems(),
      loadArticles()
    ]).then(([gradeRes, payRes, warriorRes, bmRes, articlesRes]) => {
      setGrades(gradeRes.rows);
      setPayConfigs(payRes.rows);
      setWarriors(warriorRes.rows);
      setBlackMarketItems(bmRes.rows);

      if (gradeRes.rows.length > 0) {
        setSelectedGradeId(gradeRes.rows[0].id);
      }

      const aMap: Record<number, Article> = {};
      articlesRes.rows.forEach(art => {
        aMap[art.id] = art;
      });
      setArticlesMap(aMap);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingState message="Decoding recruitment probability tables & black market logs…" />;
  }

  // Resolve article name/details
  const getArticleDetails = (itemId: number) => {
    const art = articlesMap[itemId];
    return {
      name: art?.name || `Spiritual Item #${itemId}`,
      quality: art?.quality || 1,
      desc: art?.function_desc || "No description available."
    };
  };

  const getQualityColor = (quality: number) => {
    switch (quality) {
      case 1: return 'text-muted border-border';
      case 2: return 'text-success border-success';
      case 3: return 'text-blue-400 border-blue-600'; // No semantic equivalent
      case 4: return 'text-purple-400 border-purple-600'; // No semantic equivalent
      case 5: return 'text-warning border-warning';
      case 6: return 'text-danger border-danger';
      default: return 'text-yellow-400 border-yellow-600'; // No semantic equivalent
    }
  };

  // Perform a 10-fold gacha draw
  const handleDrawTen = () => {
    if (!selectedGradeId) return;

    // Filter gacha pool for selected grade
    const pool = warriors.filter(w => w.grade === selectedGradeId);
    if (pool.length === 0) return;

    const newDraws: Array<{ name: string; quality: number; type: string }> = [];
    for (let i = 0; i < 10; i++) {
      const rolled = pool[Math.floor(Math.random() * pool.length)];
      // Resolve article details if possible, otherwise use gacha row info
      let details = { name: rolled.recruit_name, quality: rolled.grade + 1 };
      if (rolled.awardsoul && rolled.awardsoul.length > 0) {
        const artDetails = getArticleDetails(rolled.awardsoul[0].code);
        if (artDetails.name !== `Spiritual Item #${rolled.awardsoul[0].code}`) {
          details = { name: artDetails.name, quality: artDetails.quality };
        }
      }
      newDraws.push({
        name: details.name,
        quality: details.quality,
        type: rolled.return_type === 1 ? 'Hero Shard' : 'Hero Recruit Card'
      });
    }

    setGachaHistory(prev => [...newDraws, ...prev].slice(0, 30));
  };

  const selectedGrade = grades.find(g => g.id === selectedGradeId) || grades[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          💎 GACHA & SHOP ANALYTICS
        </h1>
        <p className="text-muted text-sm mt-1">
          Simulate tavern recruitment draws and audit black market items spawn configurations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('tavern')}
          className={`px-4 py-2 text-sm tracking-wider font-semibold rounded transition-all ${activeTab === 'tavern'
              ? 'bg-brand-soft border border-brand text-brand shadow-sm'
              : 'bg-surface border border-border text-muted hover:text-text'
            }`}
        >
          🍻 TAVERN GACHA SIMULATOR
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 text-sm tracking-wider font-semibold rounded transition-all ${activeTab === 'market'
              ? 'bg-brand-soft border border-brand text-brand shadow-sm'
              : 'bg-surface border border-border text-muted hover:text-text'
            }`}
        >
          🛒 BLACK MARKET SHELVES
        </button>
      </div>

      {/* Tavern Gacha */}
      {activeTab === 'tavern' && selectedGrade && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grade selection and details */}
          <div className="bg-surface border border-border rounded p-6 space-y-6 lg:col-span-1">
            <h3 className="text-sm font-bold tracking-wider text-brand uppercase border-b border-border pb-2">
              Recruit Tiers ({grades.length})
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {grades.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGradeId(g.id)}
                  className={`w-full text-left p-3 rounded transition-all flex justify-between items-center ${selectedGradeId === g.id
                      ? 'bg-brand-soft border border-brand text-brand'
                      : 'bg-bg border border-transparent text-muted hover:text-text'
                    }`}
                >
                  <div>
                    <span className="font-semibold text-sm block">Recruit Grade {g.level}</span>
                    <span className="text-xs text-subtle font-mono">Wine Index: {g.preview}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="bg-bg p-4 rounded border border-border text-xs space-y-2 font-mono">
                <span className="text-subtle uppercase block tracking-wider text-[10px]">Tavern Perks</span>
                <div className="flex justify-between">
                  <span>Is Tavern Gacha</span>
                  <span className="text-success">{selectedGrade.is_tavern === 1 ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wine Levels Active</span>
                  <span>{selectedGrade.wine_lvs?.join(', ') || 'N/A'}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleDrawTen}
                className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-bold tracking-wider text-sm rounded shadow-lg active:scale-[0.98] transition-all"
              >
                🍻 ROLL 10 RECRUITS
              </button>
            </div>
          </div>

          {/* Gacha history / rolls output */}
          <div className="lg:col-span-2 bg-surface border border-border rounded p-6 flex flex-col justify-between min-h-[500px]">
            <div>
              <h3 className="text-sm font-bold tracking-wider text-subtle uppercase border-b border-border pb-3 mb-4">
                GACHA DRAW FEEDBACK LOGS
              </h3>

              {gachaHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2">
                  {gachaHistory.map((draw, idx) => {
                    const qualityColor = getQualityColor(draw.quality);
                    return (
                      <div key={idx} className="bg-bg border border-border p-3 rounded flex justify-between items-center">
                        <div>
                          <span className={`text-sm font-bold tracking-wide ${qualityColor.split(' ')[0]}`}>
                            {draw.name}
                          </span>
                          <span className="block text-[10px] text-subtle uppercase tracking-wider">{draw.type}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${qualityColor}`}>
                          Tier {draw.quality}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-subtle text-sm">
                  <span className="text-4xl mb-3">🍻</span>
                  <span>No recruits rolled yet. Press Roll 10 above to start.</span>
                </div>
              )}
            </div>

            {gachaHistory.length > 0 && (
              <button
                onClick={() => setGachaHistory([])}
                className="mt-6 self-start text-xs text-danger/80 hover:text-danger font-bold uppercase tracking-wider transition-all"
              >
                Clear History
              </button>
            )}
          </div>
        </div>
      )}

      {/* Black Market */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded p-5">
            <h3 className="text-lg font-bold text-text mb-1">🛒 Black Market Shelf Analyzer</h3>
            <p className="text-muted text-sm">
              Displays item pricing structures and gacha spawn matrices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blackMarketItems.slice(0, 120).map(item => {
              const details = getArticleDetails(item.item_id);
              const qualityColor = getQualityColor(details.quality);

              return (
                <div key={item.id} className="bg-surface border border-border rounded p-5 hover:border-brand-soft transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] text-subtle font-mono">Market ID: {item.id}</span>
                        <h4 className={`text-base font-bold tracking-wide mt-0.5 ${qualityColor.split(' ')[0]}`}>
                          {details.name}
                        </h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 border rounded uppercase ${qualityColor}`}>
                        Tier {details.quality}
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed mt-2 font-mono">
                      Pack Quantity: {item.number} Units
                    </p>

                    <p className="text-[10px] text-subtle mt-1 uppercase font-mono">
                      Max Purchase: {item.total_times} times/day
                    </p>
                  </div>

                  <div className="mt-4 border-t border-border pt-3 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-subtle uppercase block mb-0.5">Base Price</span>
                      {item.price && item.price.length > 0 ? (
                        <span className="text-yellow-400 font-bold">
                          {item.price[0].count} {item.price[0].type === 1 ? 'Silver' : 'Gold'}
                        </span>
                      ) : (
                        <span className="text-subtle italic">Free / Drops</span>
                      )}
                    </div>
                    {item.old_price && item.old_price.length > 0 && (
                      <div className="text-right">
                        <span className="text-[9px] text-subtle uppercase block mb-0.5">Original</span>
                        <span className="text-subtle line-through">
                          {item.old_price[0].count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
