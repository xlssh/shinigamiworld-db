import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Map path segments to human-readable labels
const segmentLabels: Record<string, string> = {
  '': 'Dashboard',
  search: 'Global Search',
  calendar: 'Event Calendar',
  schedules: 'Promotion Schedules',
  heroes: 'Heroes',
  compare: 'Hero Comparison',
  sounds: 'Hero SFX Board',
  stats: 'Class Stat Curves',
  articles: 'Articles / Items',
  farming: 'Farming Planner',
  evolution: 'Zanpakuto Evolution',
  skills: 'Skill Handbook',
  weapons: 'Weapons',
  'weapon-stats': 'Zanpakuto Stats',
  'story-quests': 'Story Quests',
  tree: 'Quest Tree',
  'daily-quests': 'Daily Quests',
  cities: 'Cities',
  map: 'World Map',
  stages: 'Stages',
  'mall-items': 'Mall Items',
  analytics: 'Shop Analytics',
  promotions: 'Promotions',
  tools: 'Tools',
  formation: 'Formation Builder',
  counters: 'Counter Triangle',
  'tier-heatmap': 'Tier Heatmap',
  'bond-optimizer': 'Bond Optimizer',
  'vip-planner': 'VIP Planner',
  'campaign-roadmap': 'Campaign Roadmap',
  dating: 'Home Dating',
  equipment: 'Equipment & Suits',
  awakening: 'Awakening Console',
  pets: 'Pet Sanctuary',
  achievements: 'Achievements & Titles',
  academy: 'Academy & Relics',
  'loot-oracle': 'Loot Table Oracle',
  'guild-vip': 'Guild Devotion & VIP',
  ornaments: 'Spiritual Ornaments',
  'soul-maps': 'MC Soul Maps',
  refinery: 'Soul King Refinery',
  'black-market': 'Black Market',
  'beast-souls': 'Beast Souls',
  military: 'Military Ranks',
  'culling-tower': 'Culling Abyss Tower',
  'nightmare-realms': 'Conquest of Might',
  'seven-souls': 'Seven Souls Altar',
  talents: 'Hero Talents',
  'fight-report': 'Fight Report',
  'yammy-rampage': "Yammy's Rampage",
  'cross-server-battle': 'Cross Server Battle',
  'activity-codex': 'Activity Codex',
};

// Check if a segment looks like an ID (numeric)
function isIdSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on the dashboard
  if (pathSegments.length === 0) return null;

  // Build breadcrumb items
  const crumbs: Array<{ label: string; to: string | null }> = [];

  // Home
  crumbs.push({ label: 'Home', to: '/' });

  let accumulatedPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    accumulatedPath += `/${segment}`;

    // If this looks like an ID, we don't link it (it's a detail page)
    if (isIdSegment(segment)) {
      crumbs.push({ label: `#${segment}`, to: null });
      continue;
    }

    const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, to: accumulatedPath });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex items-center gap-1 text-xs text-muted flex-wrap">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight size={12} className="text-subtle shrink-0" aria-hidden={true} />
              )}
              {isLast || crumb.to === null ? (
                <span className={`font-semibold ${isLast ? 'text-text' : 'text-muted'}`}>
                  {idx === 0 && <Home size={12} className="inline mr-1 -mt-0.5" aria-hidden={true} />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="font-medium text-muted hover:text-brand transition-colors"
                >
                  {idx === 0 && <Home size={12} className="inline mr-1 -mt-0.5" aria-hidden={true} />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
