import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import {
  LayoutDashboard,
  Search,
  Users,
  Package,
  BookOpen,
  Calendar,
  CalendarDays,
  Map,
  Swords,
  ShoppingBag,
  Flame,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  Compass,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Scale,
  GitFork,
  Coins,
  Navigation,
  BarChart3,
  Clock,
  Shield,
  LayoutGrid,
  Wand2,
  Sparkles,
  HeartHandshake,
  Trophy,
  Star
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  name: string;
  to: string;
  icon: React.FC<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
}

interface SidebarGroup {
  label: string;
  items: MenuItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', to: '/', icon: LayoutDashboard },
      { name: 'Global Search', to: '/search', icon: Search },
      { name: 'Event Calendar', to: '/calendar', icon: Calendar },
      { name: 'Promotion Schedules', to: '/calendar/schedules', icon: Clock },
    ],
  },
  {
    label: 'Characters & Items',
    items: [
      { name: 'Heroes', to: '/heroes', icon: Users },
      { name: 'Hero Comparison', to: '/heroes/compare', icon: Scale },
      { name: 'Class Stat Curves', to: '/heroes/stats', icon: BarChart3 },
      { name: 'Articles / Items', to: '/articles', icon: Package },
      { name: 'Farming Planner', to: '/articles/farming', icon: Navigation },
    ],
  },
  {
    label: 'Quests & Progression',
    items: [
      { name: 'Story Quests', to: '/story-quests', icon: BookOpen },
      { name: 'Quest Tree', to: '/story-quests/tree', icon: GitFork },
      { name: 'Daily Quests', to: '/daily-quests', icon: CalendarDays },
      { name: 'Cities', to: '/cities', icon: Map },
      { name: 'World Unlock Map', to: '/cities/map', icon: Globe },
      { name: 'Stages', to: '/stages', icon: Swords },
    ],
  },
  {
    label: 'Weapons & Equipment',
    items: [
      { name: 'Zanpakuto Evolution', to: '/weapons/evolution', icon: Swords },
      { name: 'Zanpakuto Weapon Skills', to: '/weapons/skills', icon: Sparkles },
      { name: 'Zanpakuto Stats', to: '/weapons/stats', icon: BarChart3 },
      { name: 'Equipment & Suits', to: '/tools/equipment', icon: Swords },
      { name: 'Spiritual Ornaments', to: '/tools/ornaments', icon: Sparkles },
      { name: 'Beast Souls Planner', to: '/tools/beast-souls', icon: BarChart3 },
      { name: 'Soul King Palace Refinery', to: '/tools/refinery', icon: Sparkles },
    ],
  },
  {
    label: 'Shop & Events',
    items: [
      { name: 'Mall Items', to: '/mall-items', icon: ShoppingBag },
      { name: 'Shop Analytics', to: '/mall/analytics', icon: Coins },
      { name: 'Promotions List', to: '/promotions', icon: Flame },
      { name: 'Black Market Deals', to: '/tools/black-market', icon: Coins },
    ],
  },
  {
    label: 'Team Building',
    items: [
      { name: 'Formation Builder', to: '/tools/formation', icon: Wand2 },
      { name: 'Counter Triangle', to: '/tools/counters', icon: Shield },
      { name: 'Tier Heatmap', to: '/tools/tier-heatmap', icon: LayoutGrid },
      { name: 'Skill Handbook', to: '/tools/skills', icon: BookOpen },
      { name: 'Bond Optimizer', to: '/tools/bond-optimizer', icon: Sparkles },
      { name: 'Hero Talents Planner', to: '/tools/talents', icon: Wand2 },
    ],
  },
  {
    label: 'Planners & Simulators',
    items: [
      { name: 'Event ROI & VIP Planner', to: '/tools/vip-planner', icon: Coins },
      { name: 'Campaign Roadmap', to: '/tools/campaign-roadmap', icon: Map },
      { name: 'Home Dating & Intimacy', to: '/tools/dating', icon: HeartHandshake },
      { name: 'Awakening Console', to: '/tools/awakening', icon: Sparkles },
      { name: 'Pet Sanctuary', to: '/tools/pets', icon: LayoutGrid },
      { name: 'Guild Devotion & VIP', to: '/tools/guild-vip', icon: Trophy },
    ],
  },
  {
    label: 'Endgame',
    items: [
      { name: 'Military Ranks', to: '/tools/military', icon: Trophy },
      { name: 'Culling Abyss Tower', to: '/tools/culling-tower', icon: Swords },
      { name: 'Conquest of Might', to: '/tools/nightmare-realms', icon: Globe },
      { name: 'Seven Souls Altar', to: '/tools/seven-souls', icon: Star },
      { name: 'MC Soul Maps', to: '/tools/soul-maps', icon: Compass },
      { name: 'Achievement & Titles', to: '/tools/achievements', icon: Shield },
      { name: 'Academy & Relics', to: '/tools/academy', icon: BookOpen },
      { name: 'Loot Table Oracle', to: '/tools/loot-oracle', icon: Sparkles },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { name: 'Fight Report Analyzer', to: '/tools/fight-report', icon: Swords },
      { name: "Yammy's Rampage", to: '/tools/yammy-rampage', icon: Swords },
      { name: 'Cross Server Battle', to: '/tools/cross-server-battle', icon: Shield },
    ],
  },
];

const GROUP_STATE_KEY = 'sidebarGroupsCollapsed';

function loadGroupState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(GROUP_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default: all groups expanded
  const defaults: Record<string, boolean> = {};
  sidebarGroups.forEach(g => { defaults[g.label] = false; });
  return defaults;
}

function saveGroupState(state: Record<string, boolean>) {
  try { localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(state)); } catch {}
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>(loadGroupState);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    saveGroupState(groupCollapsed);
  }, [groupCollapsed]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Auto-expand the sidebar group containing the active route
  useEffect(() => {
    const path = location.pathname;
    for (const group of sidebarGroups) {
      const match = group.items.some(item => {
        if (item.to === '/') return path === '/';
        return path === item.to || path.startsWith(item.to + '/');
      });
      if (match) {
        setGroupCollapsed(prev => {
          if (prev[group.label] === false) return prev;
          return { ...prev, [group.label]: false };
        });
        break;
      }
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleGroup = (label: string) => {
    setGroupCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  // Flat list for mobile drawer (preserves original behavior)
  const allMenuItems = sidebarGroups.flatMap(g => g.items);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors duration-200">
      {/* Skip Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-xl font-semibold text-sm transition-all"
      >
        Skip to main content
      </a>

      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-surface/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-1.5 rounded-lg hover:bg-hover md:hidden text-muted"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} aria-hidden={true} /> : <Menu size={20} aria-hidden={true} />}
          </button>

          <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg p-1">
            <span className="font-display font-extrabold text-lg md:text-xl tracking-wider bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              SHINIGAMIWORLD DB
            </span>
            <span className="hidden md:inline px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-soft text-brand border border-indigo-100/50 dark:border-indigo-950/40">
              Datamining
            </span>
          </Link>
        </div>

        {/* Global Search Bar in Header (Desktop Only) */}
        <form onSubmit={handleGlobalSearchSubmit} className="hidden md:flex items-center relative w-80">
          <input
            id="global-search-input"
            type="text"
            placeholder="Search characters, items, skills…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand placeholder-subtle"
            aria-label="Search everything in database"
          />
          <Search size={14} className="absolute left-3 text-muted" aria-hidden={true} />
        </form>

        <div className="flex items-center gap-3">

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted hover:bg-hover transition-colors cursor-pointer"
            aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden={true} /> : <Sun size={18} aria-hidden={true} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Sidebar Nav (Desktop Only) */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-surface shrink-0 p-4 justify-between transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'
            }`}
        >
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {sidebarCollapsed ? (
              // Collapsed: flat icon list
              <nav className="space-y-1">
                {allMenuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.name}
                    className={({ isActive }) =>
                      `flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                        ? 'bg-brand-soft text-brand border border-indigo-100/50 dark:border-indigo-950/40 shadow-sm'
                        : 'text-muted hover:bg-hover hover:text-text'
                      }`
                    }
                  >
                    <item.icon size={18} className="shrink-0" aria-hidden={true} />
                  </NavLink>
                ))}
              </nav>
            ) : (
              // Expanded: grouped sections
              <nav className="space-y-2">
                {sidebarGroups.map((group) => {
                  const isCollapsed = groupCollapsed[group.label] ?? false;
                  return (
                    <div key={group.label}>
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold text-subtle uppercase tracking-widest hover:text-muted transition-colors rounded-lg"
                        aria-expanded={!isCollapsed}
                      >
                        <span>{group.label}</span>
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                          aria-hidden={true}
                        />
                      </button>
                      {!isCollapsed && (
                        <div className="space-y-0.5 mt-0.5">
                          {group.items.map((item) => (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all group ${isActive
                                  ? 'bg-brand-soft text-brand border border-indigo-100/50 dark:border-indigo-950/40 shadow-sm'
                                  : 'text-muted hover:bg-hover hover:text-text'
                                } justify-between`
                              }
                            >
                              <div className="flex items-center gap-3">
                                <item.icon size={16} className="shrink-0" aria-hidden={true} />
                                <span className="truncate">{item.name}</span>
                              </div>
                              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-subtle shrink-0" aria-hidden={true} />
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Sidebar Collapse Toggle Button */}
          <div className="pt-3 border-t border-border mt-3">
            <button
              onClick={() => setSidebarCollapsed(prev => !prev)}
              aria-label={sidebarCollapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
              className="w-full flex items-center justify-center p-2 rounded-xl border border-border hover:bg-hover text-muted hover:text-text font-semibold transition-all text-xs"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} aria-hidden={true} />
              ) : (
                <span className="flex items-center gap-1.5">
                  <ChevronLeft size={14} />
                  Collapse Menu
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex" role="dialog" aria-modal="true">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Drawer Body */}
            <aside className="relative w-72 max-w-[80vw] bg-surface h-full p-4 flex flex-col shadow-2xl z-50">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <span className="font-display font-extrabold text-brand uppercase tracking-widest text-sm">BLEACHFLASH DB</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-muted hover:text-text"
                  aria-label="Close menu"
                >
                  <X size={20} aria-hidden={true} />
                </button>
              </div>

              {/* Global Search in Mobile Menu */}
              <form onSubmit={handleGlobalSearchSubmit} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search database…"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand placeholder-subtle"
                  aria-label="Search mobile menu"
                />
                <Search size={16} className="absolute left-3 top-3 text-muted" aria-hidden={true} />
              </form>

              {/* Mobile: grouped nav */}
              <nav className="space-y-3 overflow-y-auto flex-1">
                {sidebarGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-subtle uppercase tracking-widest">
                      {group.label}
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                              ? 'bg-brand-soft text-brand border border-indigo-100/50 dark:border-indigo-950/40 shadow-sm'
                              : 'text-muted hover:bg-hover hover:text-text'
                            }`
                          }
                        >
                          <item.icon size={16} className="shrink-0" aria-hidden={true} />
                          <span>{item.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6 sm:p-8 outline-none">
          <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
