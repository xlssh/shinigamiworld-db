import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadStoryQuests, loadArticles } from '../data/loaders';
import { StoryQuest, Article } from '../types/db';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { RewardList } from '../components/RewardList';
import { JsonViewer } from '../components/JsonViewer';
import { ArrowLeft, MessageSquare, Compass, ShieldAlert, Award } from 'lucide-react';

export const StoryQuestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quest, setQuest] = useState<StoryQuest | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  const fetchQuestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const questId = parseInt(id || '');

      const [questsRes, articlesRes] = await Promise.all([
        loadStoryQuests(),
        loadArticles()
      ]);

      const match = questsRes.rows.find(q => q.id === questId);
      if (match) {
        setQuest(match);
        setArticles(articlesRes.rows);
      } else {
        setError(`Story Quest with ID ${id} not found in database.`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load story quest details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestDetails();
  }, [id]);

  if (loading) return <LoadingState message="Downloading quest transcripts and award configurations..." />;
  if (error) return <ErrorState message={error} onRetry={fetchQuestDetails} />;
  if (!quest) return <ErrorState message="Quest not found." onRetry={fetchQuestDetails} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/story-quests"
          className="flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Story Quests</span>
        </Link>
      </div>

      {/* Main Quest spec panel */}
      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded">
              ID: {quest.id}
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/55 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-wider">
              Story Campaign Quest
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50">
            {quest.name || `Quest #${quest.id}`}
          </h1>

          {quest.description && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quest Synopsis</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                "{quest.description}"
              </p>
            </div>
          )}

          {/* Guide walkthrough */}
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-xl space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <Compass size={16} className="text-violet-500" />
              <span>SOP Navigation Walkthrough</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-0.5 font-semibold">Guide Before Receipt</span>
                <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium block bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-zinc-800/60 min-h-[50px]">{quest.guide_before || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5 font-semibold">Guide Active Progression</span>
                <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium block bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-zinc-800/60 min-h-[50px]">{quest.guide || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5 font-semibold">Guide On Submit</span>
                <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium block bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-zinc-800/60 min-h-[50px]">{quest.guide_end || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quest Properties Identity block */}
        <div className="w-full md:w-64 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3 shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">Quest Properties</h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
            <div>
              <span className="text-zinc-400 block mb-0.5">Campaign Type</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350">Type {quest.type}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Event Action</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350">Action {quest.event_type}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Gate Required</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350">Gate {quest.gate}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Target Point</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350 font-mono">{quest.point}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">SOP NPC Host</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350">NPC #{quest.start_npc_id || 0}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Submit NPC Host</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-350">NPC #{quest.finish_npc_id || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards details */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <Award size={18} className="text-violet-500" />
          <span>Clear Reward Package</span>
        </h3>
        <RewardList rewardsJson={quest.rewards_json} articles={articles} />
      </div>

      {/* Transcripts and dialogues */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <MessageSquare size={18} className="text-indigo-500" />
          <span>Scripted Dialogues & Narrative transcripts</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
          {quest.talk_before && (
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-950/20">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Dialogue (Quest Offer Receipt)</span>
              <p className="italic text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                "{quest.talk_before}"
              </p>
            </div>
          )}
          {quest.talk_end && (
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-950/20">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">Dialogue (Quest Completion Submission)</span>
              <p className="italic text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                "{quest.talk_end}"
              </p>
            </div>
          )}
          {!quest.talk_before && !quest.talk_end && (
            <div className="col-span-2 py-3 text-center text-xs text-zinc-400 italic">No dialog records scripted for this quest.</div>
          )}
        </div>
      </div>

      {/* Mechanics parameters */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <ShieldAlert size={18} className="text-amber-500" />
          <span>Internal Progression Requirements</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Pre-requisite Quest ID</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {quest.pre_task_id ? (
                <Link to={`/story-quests/${quest.pre_task_id}`} className="text-violet-600 hover:underline">
                  #{quest.pre_task_id}
                </Link>
              ) : (
                'None'
              )}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Accept Code</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{quest.accept ?? 0}</span>
          </div>
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Auto Accept Flag</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{quest.auto_accept === 1 ? 'True' : 'False'}</span>
          </div>
          <div>
            <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Instant Teleport Code</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{quest.instant ?? 0}</span>
          </div>
          {quest.plot && (
            <div className="col-span-2">
              <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Plot Action Flow Sequence</span>
              <span className="bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded border border-zinc-100 dark:border-zinc-800 block text-xs overflow-x-auto whitespace-nowrap">{quest.plot}</span>
            </div>
          )}
          {quest.complete_json && (
            <div className="col-span-2">
              <span className="text-zinc-400 block mb-0.5 font-sans font-semibold">Required Targets Logic</span>
              <span className="bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded border border-zinc-100 dark:border-zinc-800 block text-xs overflow-x-auto">
                {typeof quest.complete_json === 'object' ? (
                  <pre className="text-[11px] leading-tight font-sans">{JSON.stringify(quest.complete_json, null, 2)}</pre>
                ) : (
                  <span>{quest.complete_json}</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Raw table details */}
      <JsonViewer data={quest} title={`Raw JSON Database Entry: StoryQuest #${quest.id}`} />
    </div>
  );
};
