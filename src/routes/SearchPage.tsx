import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  loadHeroes,
  loadArticles,
  loadDailyQuests,
  loadStoryQuests,
  loadCities,
  loadStages,
  loadMallItems,
  loadPromotionalActivities,
  loadKnives,
  loadSkills,
  loadEnemies,
  loadAchievements,
  loadMilitary,
  loadCullingStages,
  loadNightmareCities,
  loadBaseEquips,
  loadSuits,
  loadStarMaps,
  loadSevenHeroArmies,
  loadWeaponSkills
} from '../data/loaders';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { Search, ChevronRight } from 'lucide-react';

interface SearchResult {
  table: string;
  id: number;
  title: string;
  subtitle: string;
  link: string;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim() || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-amber-200/60 dark:bg-amber-500/30 text-text rounded px-0.5">{part}</mark>
    ) : (
      part
    )
  );
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryParam);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datasets, setDatasets] = useState<{
    heroes: any[];
    articles: any[];
    dailyQuests: any[];
    storyQuests: any[];
    cities: any[];
    stages: any[];
    mallItems: any[];
    promotions: any[];
    knives: any[];
    skills: any[];
    enemies: any[];
    achievements: any[];
    military: any[];
    cullingStages: any[];
    nightmareCities: any[];
    baseEquips: any[];
    suits: any[];
    starMaps: any[];
    sevenHeroArmies: any[];
    weaponSkills: any[];
  } | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        heroesRes, articlesRes, dailyRes, storyRes, citiesRes, stagesRes,
        mallRes, promotionsRes, knivesRes, skillsRes, enemiesRes, achievementsRes,
        militaryRes, cullingRes, nightmareRes, equipsRes, suitsRes, starMapsRes,
        sevenArmiesRes, weaponSkillsRes
      ] = await Promise.all([
        loadHeroes(), loadArticles(), loadDailyQuests(), loadStoryQuests(),
        loadCities(), loadStages(), loadMallItems(), loadPromotionalActivities(),
        loadKnives(), loadSkills(), loadEnemies(), loadAchievements(),
        loadMilitary(), loadCullingStages(), loadNightmareCities(),
        loadBaseEquips(), loadSuits(), loadStarMaps(),
        loadSevenHeroArmies(), loadWeaponSkills()
      ]);

      setDatasets({
        heroes: heroesRes.rows,
        articles: articlesRes.rows,
        dailyQuests: dailyRes.rows,
        storyQuests: storyRes.rows,
        cities: citiesRes.rows,
        stages: stagesRes.rows,
        mallItems: mallRes.rows,
        promotions: promotionsRes.rows,
        knives: knivesRes.rows,
        skills: skillsRes.rows,
        enemies: enemiesRes.rows,
        achievements: achievementsRes.rows,
        military: militaryRes.rows,
        cullingStages: cullingRes.rows,
        nightmareCities: nightmareRes.rows,
        baseEquips: equipsRes.rows,
        suits: suitsRes.rows,
        starMaps: starMapsRes.rows,
        sevenHeroArmies: sevenArmiesRes.rows,
        weaponSkills: weaponSkillsRes.rows,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to download search indexes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchInput.trim() });
  };

  const results = useMemo<SearchResult[]>(() => {
    if (!datasets || !queryParam.trim()) return [];

    const query = queryParam.toLowerCase().trim();
    const matches: SearchResult[] = [];

    // 1. Heroes
    datasets.heroes.forEach(h => {
      if ((h.name || '').toLowerCase().includes(query) || (h.description || '').toLowerCase().includes(query) || (h.assess || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Heroes', id: h.id, title: h.name || `Hero #${h.id}`, subtitle: h.description || h.assess || 'No description.', link: `/heroes/${h.id}` });
      }
    });

    // 2. Articles
    datasets.articles.forEach(a => {
      if ((a.name || '').toLowerCase().includes(query) || (a.function_desc || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Articles / Items', id: a.id, title: a.name || `Article #${a.id}`, subtitle: a.function_desc || 'No description.', link: `/articles/${a.id}` });
      }
    });

    // 3. Story Quests
    datasets.storyQuests.forEach(q => {
      if ((q.name || '').toLowerCase().includes(query) || (q.description || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Story Quests', id: q.id, title: q.name || `Quest #${q.id}`, subtitle: q.description || 'No description.', link: `/story-quests/${q.id}` });
      }
    });

    // 4. Daily Quests
    datasets.dailyQuests.forEach(q => {
      if ((q.task_name || '').toLowerCase().includes(query) || (q.description || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Daily Quests', id: q.id, title: q.task_name || `Daily Task #${q.id}`, subtitle: q.description || 'No description.', link: `/daily-quests/${q.id}` });
      }
    });

    // 5. Cities
    datasets.cities.forEach(c => {
      if ((c.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Cities', id: c.id, title: c.name || `City #${c.id}`, subtitle: `Map ID: ${c.map_id} | Open Level: ${c.open_level}`, link: `/cities/${c.id}` });
      }
    });

    // 6. Stages
    datasets.stages.forEach(s => {
      if ((s.name || '').toLowerCase().includes(query) || (s.desc || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Stages', id: s.id, title: s.name || `Stage #${s.id}`, subtitle: s.desc || `Stage range: ${s.start_id} - ${s.end_id}`, link: `/stages/${s.id}` });
      }
    });

    // 7. Mall Items
    datasets.mallItems.forEach(m => {
      if ((m.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Mall Items', id: m.id, title: m.name || `Mall Item #${m.id}`, subtitle: `Cost: ${m.gold} Gold | VIP Level Required: ${m.vip}`, link: '/mall-items' });
      }
    });

    // 8. Promotions
    datasets.promotions.forEach(p => {
      if ((p.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Promotions', id: p.id, title: p.name || `Promotion #${p.id}`, subtitle: `Activity ID: ${p.act_id} | Target Lv: ${p.player_lv}`, link: '/promotions' });
      }
    });

    // 9. Zanpakuto Weapons
    datasets.knives.forEach(k => {
      if ((k.name || '').toLowerCase().includes(query) || (k.appraise || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Zanpakuto Weapons', id: k.id, title: k.name || `Weapon #${k.id}`, subtitle: k.appraise || `ATK: ${k.attack} | DEF: ${k.defense}`, link: '/weapons/evolution' });
      }
    });

    // 10. Skills
    datasets.skills.forEach(s => {
      if ((s.name || '').toLowerCase().includes(query) || (s.description || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Skills', id: s.id, title: s.name || `Skill #${s.id}`, subtitle: s.description || 'No description.', link: '/tools/skills' });
      }
    });

    // 11. Enemies
    datasets.enemies.forEach(e => {
      if ((e.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Enemies', id: e.id, title: e.name || `Enemy #${e.id}`, subtitle: `${e.is_boss ? 'Boss' : 'Normal'} | Lv.${e.level} | HP: ${e.hp}`, link: '/tools/fight-report' });
      }
    });

    // 12. Achievements
    datasets.achievements.forEach(a => {
      if ((a.name || '').toLowerCase().includes(query) || (a.condition_str || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Achievements', id: a.id, title: a.name || `Achievement #${a.id}`, subtitle: a.condition_str || 'No condition description.', link: '/tools/achievements' });
      }
    });

    // 13. Military Ranks
    datasets.military.forEach(m => {
      if ((m.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Military Ranks', id: m.id, title: m.name || `Rank #${m.id}`, subtitle: `Credit Needed: ${m.need_credit} | Max Heroes: ${m.max_hero_num}`, link: '/tools/military' });
      }
    });

    // 14. Culling Stages
    datasets.cullingStages.forEach(c => {
      if ((c.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Culling Tower', id: c.id, title: c.name || `Stage #${c.id}`, subtitle: `Level Required: ${c.need_level}`, link: '/tools/culling-tower' });
      }
    });

    // 15. Nightmare Cities
    datasets.nightmareCities.forEach((n, idx) => {
      // Nightmare cities don't have names, skip text search
    });

    // 16. Equipment
    datasets.baseEquips.forEach(e => {
      const profStr = typeof e.dress_profession === 'string' ? e.dress_profession : '';
      if (profStr.toLowerCase().includes(query)) {
        matches.push({ table: 'Equipment', id: e.id, title: `Equipment #${e.id}`, subtitle: `Profession: ${profStr} | Holes: ${e.hole_count}`, link: '/tools/equipment' });
      }
    });

    // 17. Equipment Sets
    datasets.suits.forEach(s => {
      if ((s.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Equipment Sets', id: s.id, title: s.name || `Set #${s.id}`, subtitle: `${s.max_count}-piece set`, link: '/tools/equipment' });
      }
    });

    // 18. Soul Maps
    datasets.starMaps.forEach(m => {
      if ((m.name || '').toLowerCase().includes(query) || (m.desc || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Soul Maps', id: m.id, title: m.name || `Map #${m.id}`, subtitle: m.desc || `Points: ${m.point_count}`, link: '/tools/soul-maps' });
      }
    });

    // 19. Seven Souls Armies
    datasets.sevenHeroArmies.forEach(a => {
      if ((a.name || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Seven Souls', id: a.id, title: a.name || `Army #${a.id}`, subtitle: `Open Level: ${a.open_level}`, link: '/tools/seven-souls' });
      }
    });

    // 20. Weapon Skills
    datasets.weaponSkills.forEach(w => {
      if ((w.name || '').toLowerCase().includes(query) || (w.desc || '').toLowerCase().includes(query)) {
        matches.push({ table: 'Weapon Skills', id: w.id, title: w.name || `Skill #${w.id}`, subtitle: w.desc || 'No description.', link: '/weapons/skills' });
      }
    });

    return matches;
  }, [datasets, queryParam]);

  const groupedResults = useMemo(() => {
    const groups: { [key: string]: SearchResult[] } = {};
    results.forEach(res => {
      if (!groups[res.table]) groups[res.table] = [];
      groups[res.table].push(res);
    });
    return groups;
  }, [results]);

  if (loading) return <LoadingState message="Downloading global game database indexes..." />;
  if (error) return <ErrorState message={error} onRetry={loadAllData} />;

  const query = queryParam.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Global Search</h1>
        <p className="text-sm text-muted">Search across 20+ database tables instantly in the browser.</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="max-w-3xl flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-surface text-text placeholder-zinc-400 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
            placeholder="Search characters, items, skills, weapons, quests..."
          />
          <Search className="absolute left-3.5 top-3.5 text-subtle w-5 h-5" />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm shadow transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Search</span>
        </button>
      </form>

      {query && (
        <div className="text-sm text-muted">
          Found <span className="font-semibold text-text">{results.length}</span> matches for &quot;{query}&quot;
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([groupName, items]) => (
            <div key={groupName} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-subtle border-b border-border pb-2">
                {groupName} ({items.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.slice(0, 80).map((item) => (
                  <Link
                    key={`${item.table}-${item.id}`}
                    to={item.link}
                    className="flex flex-col justify-between p-4 border border-border rounded-xl bg-surface hover:border-violet-500/50 hover:shadow-sm transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-subtle mb-1">
                        <span className="font-mono">ID: {item.id}</span>
                        <span className="px-2 py-0.5 rounded bg-surface-raised font-medium text-[10px] text-muted">
                          {item.table}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-text group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {query ? highlightMatch(item.title, query) : item.title}
                      </h4>
                      <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-2">
                        {query ? highlightMatch(item.subtitle, query) : item.subtitle}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Record</span>
                      <ChevronRight size={12} />
                    </div>
                  </Link>
                ))}
                {items.length > 80 && (
                  <div className="col-span-full text-center py-2 text-xs text-subtle italic">
                    Showing first 80 results. Narrow down your query to see more.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        query && (
          <div className="border border-border rounded-xl p-12 bg-surface/50 text-center text-muted">
            <Search className="w-12 h-12 text-subtle mx-auto mb-3" />
            <h3 className="font-semibold text-text mb-1">No results found</h3>
            <p className="text-xs">Try searching for &quot;ichigo&quot;, &quot;sword&quot;, &quot;stamina&quot;, &quot;zanpakuto&quot;, or &quot;achievement&quot;.</p>
          </div>
        )
      )}
    </div>
  );
};
