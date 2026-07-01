import React, { useEffect, useState, useMemo } from 'react';
import { loadHomeGirlFriends, loadHomeGirlAwards, loadHomeGirlInteracts, loadHomeGirlMoods, loadArticles } from '../data/loaders';
import { HomeGirlFriend, HomeGirlAward, HomeGirlInteract, HomeGirlMood, Article } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { HeartHandshake, Smile, Coins, Gem, Sparkles, Award, RefreshCw, HelpCircle, Activity } from 'lucide-react';

export const HomeDatingPage: React.FC = () => {
  const [friends, setFriends] = useState<HomeGirlFriend[]>([]);
  const [awards, setAwards] = useState<HomeGirlAward[]>([]);
  const [interacts, setInteracts] = useState<HomeGirlInteract[]>([]);
  const [moods, setMoods] = useState<HomeGirlMood[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selector / Simulator states
  const [selectedFriendId, setSelectedFriendId] = useState<number>(1);
  const [intimacyScore, setIntimacyScore] = useState<number>(0);
  const [selectedMood, setSelectedMood] = useState<number>(3); // default Mood 3

  // Simulated currency trackers
  const [spentGold, setSpentGold] = useState<number>(0);
  const [spentDiamonds, setSpentDiamonds] = useState<number>(0);
  const [earnedScrolls, setEarnedScrolls] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [friendsRes, awardsRes, interactsRes, moodsRes, articlesRes] = await Promise.all([
        loadHomeGirlFriends(),
        loadHomeGirlAwards(),
        loadHomeGirlInteracts(),
        loadHomeGirlMoods(),
        loadArticles()
      ]);
      setFriends(friendsRes.rows);
      setAwards(awardsRes.rows);
      setInteracts(interactsRes.rows.sort((a, b) => a.score_blank - b.score_blank));
      setMoods(moodsRes.rows);
      setArticles(articlesRes.rows);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dating database files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedFriend = useMemo(() => {
    return friends.find(f => f.id === selectedFriendId) || null;
  }, [friends, selectedFriendId]);

  // Current Intimacy Rank
  const currentRank = useMemo(() => {
    let active = interacts[0];
    for (const rank of interacts) {
      if (intimacyScore >= rank.score_blank) {
        active = rank;
      }
    }
    return active || null;
  }, [interacts, intimacyScore]);

  // Next Intimacy Rank
  const nextRank = useMemo(() => {
    if (!currentRank) return null;
    const currIdx = interacts.findIndex(r => r.id === currentRank.id);
    if (currIdx !== -1 && currIdx < interacts.length - 1) {
      return interacts[currIdx + 1];
    }
    return null;
  }, [interacts, currentRank]);

  // Current Mood Reward factors
  const activeMoodData = useMemo(() => {
    return moods.find(m => m.mood === selectedMood) || null;
  }, [moods, selectedMood]);

  const handleMakeTofu = () => {
    if (!selectedFriend) return;
    const tofuAwardCount = selectedFriend.tofu_award?.[0]?.amount || 5;

    // Increment trackers
    setSpentGold(prev => prev + 20000);
    setIntimacyScore(prev => prev + 25);
    setEarnedScrolls(prev => prev + tofuAwardCount);

    const newLogs = [...logs];
    newLogs.unshift(`[Date Action: Make Tofu] Spent 20,000 Gold. Gained +25 Intimacy. Earned x${tofuAwardCount} Skill Scrolls.`);
    setLogs(newLogs.slice(0, 15));
  };

  const handleCommunicate = (isGold: boolean) => {
    if (!selectedFriend || !activeMoodData) return;

    const intimacyGain = isGold ? 120 : 50;
    let scrollGain = 0;

    if (isGold) {
      scrollGain = activeMoodData.gold_communicate_reward?.[0]?.amount || 90;
      setSpentDiamonds(prev => prev + 50);
    } else {
      scrollGain = activeMoodData.normal_communicate_reward?.[0]?.amount || 80;
      setSpentGold(prev => prev + 50000);
    }

    setIntimacyScore(prev => prev + intimacyGain);
    setEarnedScrolls(prev => prev + scrollGain);

    const newLogs = [...logs];
    const costText = isGold ? "50 Gold" : "50,000 Silver";
    newLogs.unshift(`[Date Action: Sprite Communicate] Spent ${costText} (Mood: Lv.${selectedMood}). Gained +${intimacyGain} Intimacy. Earned x${scrollGain} Skill Scrolls.`);
    setLogs(newLogs.slice(0, 15));
  };

  const handleReset = () => {
    setIntimacyScore(0);
    setSpentGold(0);
    setSpentDiamonds(0);
    setEarnedScrolls(0);
    setLogs([]);
  };

  if (loading) return <LoadingState message="Downloading home companion directories and dating records..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl">
            <HeartHandshake size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50">Home Dating & Intimacy Board</h1>
            <p className="text-xs text-zinc-550 font-semibold">Simulate dates, manage mood variables, and calculate optimized farming rates for high-tier Skill Scrolls.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar: Companion List */}
        <div className="xl:col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            Select Companion
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {friends.map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFriendId(f.id);
                  handleReset();
                }}
                className={`w-full p-3 text-left border rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${selectedFriendId === f.id
                  ? 'border-fuchsia-500 bg-fuchsia-500/5 text-fuchsia-800 dark:text-fuchsia-400 font-bold'
                  : 'border-zinc-100 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300'
                  }`}
              >
                <div>
                  <span className="font-semibold block truncate">{f.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Home Tier: {f.id}</span>
                </div>
                <Smile size={14} className={selectedFriendId === f.id ? 'text-fuchsia-500' : 'text-zinc-350'} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Simulator & Intimacy Dashboard */}
        <div className="xl:col-span-3 space-y-6">
          {selectedFriend && (
            <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm space-y-6">

              {/* Top Summary Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold">HOME COMPANION dating</span>
                  <h2 className="text-2xl font-black text-zinc-850 dark:text-zinc-50">{selectedFriend.name}</h2>
                  <p className="text-xs text-zinc-400 font-semibold block">{selectedFriend.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-800 dark:text-fuchsia-400 text-xs font-black uppercase">
                    Home Lv. {selectedFriend.home_level_limit}+ Required
                  </span>
                  <button
                    onClick={handleReset}
                    className="p-1.5 border border-zinc-205 dark:border-zinc-850 hover:border-fuchsia-500 rounded-lg text-zinc-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Grid: Intimacy Dashboard & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Side: Intimacy Rank & Progression */}
                <div className="p-4 border border-zinc-100 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-xl space-y-4">
                  <h4 className="font-extrabold text-xs text-zinc-750 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Award size={14} className="text-fuchsia-500" />
                    <span>Intimacy Level & Synergy</span>
                  </h4>

                  {/* Current Rank Stats */}
                  {currentRank && (
                    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-1">
                      <span className="block text-[8px] font-bold text-zinc-450 uppercase">Current Intimacy Rank</span>
                      <span className="font-black text-base text-fuchsia-600 dark:text-fuchsia-400 block">{currentRank.name_title}</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Active Stat Bonus: <span className="font-mono text-emerald-500 font-black">+{(currentRank.added * 100).toFixed(0)}% All Stats</span></span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-zinc-450 font-bold">Intimacy Points</span>
                      <span className="font-bold">{intimacyScore.toLocaleString()} {nextRank ? `/ ${nextRank.score_blank} pts` : 'Max'}</span>
                    </div>
                    {nextRank && (
                      <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div
                          className="bg-fuchsia-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (intimacyScore / nextRank.score_blank) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Intimacy Threshold Legend */}
                  <div className="space-y-1 pt-1.5 border-t border-zinc-150/45 dark:border-zinc-800/40">
                    <span className="block text-[9px] font-bold text-zinc-400 uppercase">Intimacy Ranks Chart</span>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                      {interacts.map(rank => (
                        <div
                          key={rank.id}
                          className={`flex justify-between items-center text-[10px] py-1 border-b border-zinc-100/50 dark:border-zinc-800/40 last:border-0 ${currentRank?.id === rank.id ? 'font-black text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/5 px-1 rounded' : 'text-zinc-450'
                            }`}
                        >
                          <span>{rank.name_title}</span>
                          <span className="font-mono">{rank.score_blank} pts (+{(rank.added * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Dating Controls Console */}
                <div className="p-4 border border-zinc-100 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-xl space-y-4">
                  <h4 className="font-extrabold text-xs text-zinc-750 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity size={14} className="text-fuchsia-500" />
                    <span>Dating Control Panel</span>
                  </h4>

                  {/* Mood Selector slider */}
                  <div className="space-y-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-3 rounded-xl">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-zinc-400 font-bold">Companion Mood Level</span>
                      <span className="font-black text-fuchsia-500 font-mono">Lv. {selectedMood}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(parseInt(e.target.value))}
                      className="w-full accent-fuchsia-600 h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-100 dark:bg-zinc-850"
                    />
                    <span className="block text-[9px] text-zinc-400">Higher mood levels boost communicate drops by up to +24%!</span>
                  </div>

                  {/* Date Actions */}
                  <div className="space-y-2.5">
                    <button
                      onClick={handleMakeTofu}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs flex justify-between px-4 items-center transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1">🥣 Make Tofu Date</span>
                      <span className="font-mono text-[10px] text-zinc-450">-20k Silver</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCommunicate(false)}
                        className="py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold text-xs flex flex-col justify-center items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        <span>💬 Communicate</span>
                        <span className="font-mono text-[9px] opacity-80">-50k Silver</span>
                      </button>

                      <button
                        onClick={() => handleCommunicate(true)}
                        className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex flex-col justify-center items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-0.5"><Gem size={10} /> Gold Comm</span>
                        <span className="font-mono text-[9px] opacity-80">-50 Gold</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Resources & Currency Ledger */}
              <div className="p-4 border border-zinc-150 dark:border-zinc-800 bg-zinc-50/10 dark:bg-zinc-950/10 rounded-xl space-y-3">
                <h4 className="font-extrabold text-xs text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Coins size={14} className="text-amber-500" />
                  <span>Dating Expenses Ledger</span>
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-xl">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase">Simulated Gold Spent</span>
                    <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">{spentGold.toLocaleString()} Silver</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-xl">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase">Simulated Diamonds Spent</span>
                    <span className="text-sm font-black font-mono text-cyan-600 dark:text-cyan-400">{spentDiamonds.toLocaleString()} Gold</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-xl">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase">Skill Scrolls Earned</span>
                    <span className="text-sm font-black font-mono text-fuchsia-600 dark:text-fuchsia-400">{earnedScrolls.toLocaleString()} Scrolls</span>
                  </div>
                </div>
              </div>

              {/* Logs */}
              {logs.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dating Log output</span>
                  <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800 font-mono text-[10px] text-zinc-500 dark:text-zinc-450 space-y-1 max-h-40 overflow-y-auto">
                    {logs.map((log, idx) => (
                      <p key={idx} className={log.includes('Debut') || log.includes('Surpasses') || log.includes('One-man') ? 'text-amber-500 font-black' : ''}>{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
