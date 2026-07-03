import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadManifest } from '../data/loaders';
import { Manifest } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import {
  Users,
  Package,
  BookOpen,
  Calendar,
  Map,
  Swords,
  ShoppingBag,
  Flame,
  ArrowRight,
  Database,
  CalendarDays,
  ShieldCheck,
  Search
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManifestData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadManifest();
      setManifest(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load manifest.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManifestData();
  }, []);

  if (loading) return <LoadingState message="Connecting to client database files..." />;
  if (error) return <ErrorState message={error} onRetry={fetchManifestData} />;
  if (!manifest) return <ErrorState message="Manifest data is empty." onRetry={fetchManifestData} />;

  const cardConfig = [
    { key: 'heroes', title: 'Heroes / Characters', icon: Users, desc: 'Detailed base and growth stats for all main and mercenary characters.', link: '/heroes', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { key: 'articles', title: 'Articles / Items', icon: Package, desc: 'Inventory, gears, materials, consumable item metrics and expand parameters.', link: '/articles', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { key: 'story_quests', title: 'Story Quests', icon: BookOpen, desc: 'Main campaign storyline missions, dialogue flows and progress requirements.', link: '/story-quests', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
    { key: 'daily_quests', title: 'Daily Quests', icon: Calendar, desc: 'Recurring tasks, reward points, activity rates and trigger criteria.', link: '/daily-quests', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    { key: 'cities', title: 'Cities / Towns', icon: Map, desc: 'Map properties, pre-requisite progression blocks and unlock levels.', link: '/cities', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    { key: 'stages', title: 'Stages', icon: Swords, desc: 'Combat stage configurations, difficulty tiers, map linkages and clear rewards.', link: '/stages', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { key: 'mall_items', title: 'Mall Items', icon: ShoppingBag, desc: 'In-game cash shop inventory, gold/VIP pricing, limits and packs.', link: '/mall-items', color: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400' },
    { key: 'promotional_activities', title: 'Promotions', icon: Flame, desc: 'Recharge activity rewards, timelines, VIP bonuses and active event metrics.', link: '/promotions', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Library</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Game Database
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Search, filter, and organize your game collection.
          </p>
        </div>
      </header>

      {/* Quick Action Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Global Search Widget */}
        <div className="p-5 border border-border rounded-2xl bg-surface shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-semibold text-text">Looking for a specific drop or stat?</h3>
            <p className="text-xs text-muted">Search globally across names, descriptions, and function fields.</p>
          </div>
          <Link
            to="/search"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-semibold transition-all shadow-sm w-full sm:w-auto justify-center"
          >
            <Search size={16} />
            <span>Launch Search</span>
          </Link>
        </div>

        {/* Event Calendar Widget */}
        <div className="p-5 border border-border rounded-2xl bg-surface shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-semibold text-text">Campaign & Event Calendar</h3>
            <p className="text-xs text-muted">Track active promotions, daily/weekly cycles, and server timers.</p>
          </div>
          <Link
            to="/calendar"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-semibold transition-all shadow-sm w-full sm:w-auto justify-center cursor-pointer"
          >
            <Calendar size={16} />
            <span>Open Calendar</span>
          </Link>
        </div>
      </section>

      {/* Endless PVP/PVE Battle Systems section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-lg font-bold text-text">Endless Battle Planners & Auditors</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <Link
            to="/tools/yammy-rampage"
            className="p-4 border border-border bg-surface rounded-xl flex items-center justify-between hover:shadow-md hover:border-brand-soft group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-red-500/10 text-red-500">
                <Swords size={16} />
              </div>
              <div>
                <div className="text-text font-bold">Yammy's Rampage</div>
                <div className="text-[10px] text-muted font-normal mt-0.5">Evil Shards & silver drops planner</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-brand group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/tools/cross-server-battle"
            className="p-4 border border-border bg-surface rounded-xl flex items-center justify-between hover:shadow-md hover:border-brand-soft group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-red-500/10 text-red-500 animate-pulse">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-text font-bold">Cross Server Battle</div>
                <div className="text-[10px] text-muted font-normal mt-0.5">Pyramid rewards & shop planner</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-brand group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/tools/culling-tower"
            className="p-4 border border-border bg-surface rounded-xl flex items-center justify-between hover:shadow-md hover:border-brand-soft group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-violet-500/10 text-violet-500">
                <Database size={16} />
              </div>
              <div>
                <div className="text-text font-bold">Culling Magic Tower</div>
                <div className="text-[10px] text-muted font-normal mt-0.5">Training optimization and exp cost</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-brand group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Main Database Table Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-lg font-bold text-text">Catalog Registry</h2>
          <span className="text-xs text-muted font-medium">8 Tables Loaded</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cardConfig.map((card) => {
            const tableData = manifest.tables[card.key];
            const rowCount = tableData?.rowCount ?? 0;

            return (
              <div
                key={card.key}
                className="border border-border bg-surface rounded-xl p-5 hover:shadow-md transition-all group flex flex-col justify-between hover:border-brand-soft"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg ${card.color}`}>
                      <card.icon size={20} />
                    </div>
                    <span className="font-mono text-sm font-bold text-subtle group-hover:text-muted transition-colors">
                      {rowCount.toLocaleString()} Rows
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-text group-hover:text-brand transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted leading-normal">
                      {card.desc}
                    </p>
                  </div>
                </div>
                <Link
                  to={card.link}
                  className="mt-5 flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-hover"
                >
                  <span>Explore Database</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
