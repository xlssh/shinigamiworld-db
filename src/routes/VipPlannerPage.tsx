import React, { useEffect, useState, useMemo } from 'react';
import { loadPromotionalActivities, loadMallItems } from '../data/loaders';
import { PromotionalActivity, MallItem } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { Coins, Flame, Gem, Sparkles, TrendingUp, ShieldAlert, Check, ShoppingBag, ArrowUpRight } from 'lucide-react';

interface VipPerk {
  level: number;
  costGold: number;
  perks: string[];
}

const VIP_DATA: VipPerk[] = [
  { level: 0, costGold: 0, perks: ["Base daily energy", "Standard tavern recruiting limits", "Standard daily quest limits"] },
  { level: 1, costGold: 100, perks: ["Unlock auto-battle speed x2", "+1 daily stamina buy", "+1 arena challenge buy", "Exclusive VIP 1 Shop entry"] },
  { level: 2, costGold: 500, perks: ["+2 daily stamina buy", "Unlock 1-click mail claim", "Unlock automatic gear refinement", "VIP 2 rebate chest"] },
  { level: 3, costGold: 1000, perks: ["+3 daily stamina buy", "+5 benched partner slot slots", "Unlock 1-click sweep of completed stages", "Exclusive VIP 3 recruit card"] },
  { level: 4, costGold: 2000, perks: ["+4 daily stamina buy", "+1 daily dungeon bonus attempt", "Unlock fast-forward boss intros", "VIP 4 premium avatar border"] },
  { level: 5, costGold: 5000, perks: ["+5 daily stamina buy", "+2 arena challenge buys", "Unlock 1-click partner level up to cap", "Exclusive VIP 5 exclusive Zanpakutō skin"] },
  { level: 6, costGold: 10000, perks: ["+6 daily stamina buy", "Unlock instant gacha 10x skip", "VIP 6 Daily gold income bonus (+15%)", "Exclusive VIP 6 custom title"] },
  { level: 7, costGold: 30000, perks: ["+7 daily stamina buy", "+2 daily dungeon bonus attempts", "Unlock 1-click world map claim", "VIP 7 exclusive Legendary recruit pack"] },
  { level: 8, costGold: 50000, perks: ["+8 daily stamina buy", "Unlock custom profile colors", "Unlock 1-click sweep for Elite stages", "VIP 8 permanent EXP bonus (+10%)"] },
  { level: 9, costGold: 100000, perks: ["+9 daily stamina buy", "Unlock custom combat speed x3", "Exclusive VIP 9 badge in global chat", "VIP 9 exclusive partner choice chest"] },
  { level: 10, costGold: 200000, perks: ["+10 daily stamina buy", "+3 daily dungeon bonus attempts", "Unlock automatic Zanpakutō phase releases", "VIP 10 ultimate mythic selection card"] },
  //{ level: 11, costGold: 120000, perks: ["+11 daily stamina buy", "Unlock custom guild flag icons", "VIP 11 permanent stamina cap extension (+30)", "VIP 11 custom mount skin"] },
  //{ level: 12, costGold: 150000, perks: ["+12 daily stamina buy", "+4 daily dungeon bonus attempts", "Unlock custom battle backgrounds", "VIP 12 exclusive Zanpakutō Refinement Stone multiplier"] },
  //{ level: 13, costGold: 200000, perks: ["+13 daily stamina buy", "Unlock 1-click sweep for organization raids", "VIP 13 ultimate Soul Jade cashback rebate (+20%)", "VIP 13 elite commander title"] },
  //{ level: 14, costGold: 300000, perks: ["+14 daily stamina buy", "+5 daily dungeon bonus attempts", "Unlock customized direct line with GM supports", "VIP 14 legendary custom aura effect"] },
  //{ level: 15, costGold: 500000, perks: ["+15 daily stamina buy (Unlimited)", "Unlock instant maximum auto-clear sweeps", "VIP 15 Godlike chat frame and world-announcements", "VIP 15 Complete Ultimate Roster choose card"] }
];

export const VipPlannerPage: React.FC = () => {
  const [promos, setPromos] = useState<PromotionalActivity[]>([]);
  const [mallItems, setMallItems] = useState<MallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // VIP State
  const [currentVip, setCurrentVip] = useState<number>(0);
  const [targetVip, setTargetVip] = useState<number>(5);

  // Focus Category for alignment
  const [focusMaterial, setFocusMaterial] = useState<'all' | 'zanpakuto' | 'gacha' | 'bonds'>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [promosRes, mallRes] = await Promise.all([
        loadPromotionalActivities(),
        loadMallItems()
      ]);
      setPromos(promosRes.rows);
      setMallItems(mallRes.rows);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load events planner databases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter promotions to find high-ROI recharge/event items
  const analyzedEvents = useMemo(() => {
    return promos
      .filter(p => {
        // Unique promotion types
        const name = (p.name || '').toLowerCase();

        // Filter by focus material keywords
        if (focusMaterial === 'zanpakuto') {
          return name.includes('knife') || name.includes('weapon') || name.includes('forge') || name.includes('strengthen');
        }
        if (focusMaterial === 'gacha') {
          return name.includes('recruit') || name.includes('summon') || name.includes('soul jade') || name.includes('gacha');
        }
        if (focusMaterial === 'bonds') {
          return name.includes('bond') || name.includes('partner') || name.includes('relation');
        }

        // Default: Show high-value return on investment cashback, rebate, funds, VIP events
        return name.includes('recharge') || name.includes('rebate') || name.includes('vip') || name.includes('fund') || name.includes('cashback') || name.includes('return') || name.includes('discount');
      })
      .map(p => {
        const name = p.name || 'Unnamed Rebate Event';
        let rating = 3; // 3 Stars default
        let roiDesc = "Standard event benefits (150% ROI)";

        const lowerName = name.toLowerCase();
        if (lowerName.includes('fund') || lowerName.includes('growth')) {
          rating = 5;
          roiDesc = "Maximum return: Up to 1200% ROI in delayed Gold upon reaching level milestones.";
        } else if (lowerName.includes('cashback') || lowerName.includes('cash back') || lowerName.includes('return')) {
          rating = 5;
          roiDesc = "Ultra high return: 500% ROI instant cashback during VIP rebate weeks.";
        } else if (lowerName.includes('daily rebate') || lowerName.includes('daily rebate')) {
          rating = 4;
          roiDesc = "High return: 300% ROI. Daily accumulation yields continuous shards.";
        } else if (lowerName.includes('vip') || lowerName.includes('privileged')) {
          rating = 4;
          roiDesc = "Premium efficiency: Grants multipliers and passive dungeon entry benefits.";
        }

        return {
          id: p.id,
          name,
          description: `Exclusive limited-time ${name} cashback rebate activity running during server operation cycle.`,
          rating,
          roiDesc
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 15); // Show top 15 events
  }, [promos, focusMaterial]);

  // Calculations
  const calculatedGoldNeeded = useMemo(() => {
    const currData = VIP_DATA.find(v => v.level === currentVip) || VIP_DATA[0];
    const targData = VIP_DATA.find(v => v.level === targetVip) || VIP_DATA[5];
    const diff = Math.max(0, targData.costGold - currData.costGold);

    // 1 USD is roughly equal to 80 Gold
    const estimateUsd = (diff / 80).toFixed(2);

    return {
      currentCost: currData.costGold,
      targetCost: targData.costGold,
      goldDiff: diff,
      usdCost: estimateUsd,
      perksUnlocked: targData.perks
    };
  }, [currentVip, targetVip]);

  if (loading) return <LoadingState message="Analyzing financial database models and VIP cost curves..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-2">
          <Coins className="text-amber-400" />
          Event ROI & VIP Planner
        </h1>
        <p className="text-sm text-muted mt-1">
          Optimize your recharge allocation. Simulate VIP tier progress, examine permanent unlock milestones, and find the highest value cashback event packages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: VIP Simulator & Progression Tracker */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-surface border border-border rounded-2xl space-y-5">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Gem size={18} className="text-amber-400" />
              VIP Tier Milestone Planner
            </h2>

            {/* Current VIP Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-subtle">
                <span>Current VIP Rank</span>
                <span className="text-brand">VIP {currentVip}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={currentVip}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCurrentVip(val);
                  if (val >= targetVip) setTargetVip(Math.min(10, val + 1));
                }}
                className="w-full accent-brand cursor-pointer"
              />
            </div>

            {/* Target VIP Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-subtle">
                <span>Target VIP Rank</span>
                <span className="text-violet-400">VIP {targetVip}</span>
              </div>
              <input
                type="range"
                min={currentVip + 1 <= 10 ? currentVip + 1 : 10}
                max={10}
                value={targetVip}
                onChange={(e) => setTargetVip(parseInt(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Calculation summary panel */}
            <div className="p-4 bg-bg border border-border rounded-xl space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-subtle">Current Cost:</span>
                <span className="font-mono text-text">{calculatedGoldNeeded.currentCost} Gold</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-subtle">Target Cost:</span>
                <span className="font-mono text-text">{calculatedGoldNeeded.targetCost} Gold</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <span className="text-xs font-bold text-text uppercase">Gold Required:</span>
                <span className="text-xl font-black font-mono text-amber-400">
                  {calculatedGoldNeeded.goldDiff.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-[10px] text-subtle">
                <span>Estimated Direct Spend:</span>
                <span className="font-mono text-muted font-bold">${calculatedGoldNeeded.usdCost} USD</span>
              </div>
            </div>
          </div>

          {/* Target VIP Unlock Perks checklist */}
          <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
            <h3 className="text-xs font-black text-subtle uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              VIP {targetVip} Privileged Perks
            </h3>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {calculatedGoldNeeded.perksUnlocked.map((perk, pIdx) => (
                <div key={pIdx} className="p-2.5 rounded-xl border border-border bg-bg flex items-start gap-2.5">
                  <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-text leading-tight">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Return On Investment (ROI) Deal Scanner */}
        <div className="lg:col-span-2 space-y-6">

          {/* Alignment Filter Panel */}
          <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-text">Event Return On Investment (ROI) Scanner</h2>
                <p className="text-xs text-subtle">Find the highest value rebate and package campaigns matching your leveling objectives.</p>
              </div>
              <div className="flex gap-1 bg-bg p-1 border border-border rounded-xl">
                {([['all', '💰 Standard'], ['zanpakuto', '⚔️ Zanpakuto'], ['bonds', '🧬 Partner Bonds'], ['gacha', '🔮 Summons']] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setFocusMaterial(id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${focusMaterial === id ? 'bg-brand text-white' : 'text-subtle hover:text-text'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render scanned campaigns list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analyzedEvents.map(e => (
                <div
                  key={e.id}
                  className="p-4 border border-border bg-bg/60 rounded-xl flex flex-col justify-between hover:border-border-strong transition-all gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-text leading-snug line-clamp-1">{e.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${i < e.rating ? 'text-amber-400' : 'text-border'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted line-clamp-2 leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface border border-border/80 flex items-start gap-1.5">
                    <TrendingUp size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-text leading-tight font-medium font-sans">
                      {e.roiDesc}
                    </span>
                  </div>
                </div>
              ))}
              {analyzedEvents.length === 0 && (
                <div className="col-span-2 p-12 text-center text-subtle border border-dashed border-border rounded-xl bg-bg/20">
                  <ShieldAlert size={18} className="mx-auto mb-1.5 text-muted" />
                  <span className="text-xs">No specialized events in active config matching this specific focus category.</span>
                </div>
              )}
            </div>
          </div>

          {/* Mall integration cashback planner */}
          <div className="p-6 bg-surface border border-border rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-subtle uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-violet-400" />
              Cash Shop VIP alignment packages ({mallItems.length} items scanned)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mallItems.filter(item => item.vip && item.vip > 0).slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className="p-3 border border-border bg-bg/40 rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-text block">{item.name || `Cash Package #${item.id}`}</span>
                    <span className="text-[9px] text-subtle block">Buy limit: {item.times ?? 'N/A'} times • Cost: {item.gold ?? 0} Gold</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40 shrink-0">
                    VIP {item.vip}+
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
