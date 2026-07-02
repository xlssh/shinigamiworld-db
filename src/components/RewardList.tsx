import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types/db';
import { parseRewards, isArticleReference } from '../data/relationships';
import { Gift } from 'lucide-react';

interface RewardListProps {
  rewardsJson: any;
  articles?: Article[];
}

export const getRewardTypeName = (type: number): string => {
  switch (type) {
    case 0: return "Currency";
    case 1: return "Item";
    case 2: return "EXP";
    case 3: return "VIP EXP";
    default: return `Reward Type ${type}`;
  }
};

export const getRewardCodeName = (type: number, code: number): string => {
  if (type === 0) {
    switch (code) {
      case 0: return "Silver";
      case 1: return "Gold";
      case 2: return "Vigor / Stamina";
      default: return `Currency (Code ${code})`;
    }
  }
  return `Code ${code}`;
};

export const RewardList: React.FC<RewardListProps> = ({ rewardsJson, articles = [] }) => {
  const rewards = parseRewards(rewardsJson);

  if (rewards.length === 0) {
    return (
      <div className="text-sm text-zinc-500 italic">No rewards specified.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rewards.map((reward, idx) => {
        const isItem = isArticleReference(reward);
        let articleName = "";

        if (isItem && articles.length > 0) {
          const art = articles.find(a => a.id === reward.code);
          if (art && art.name) {
            articleName = art.name;
          }
        }

        return (
          <div
            key={idx}
            className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/30 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-md">
                <Gift size={16} />
              </div>
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {isItem ? (
                    articleName ? (
                      <Link
                        to={`/articles/${reward.code}`}
                        className="text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                      >
                        {articleName}
                      </Link>
                    ) : (
                      `Item #${reward.code}`
                    )
                  ) : (
                    getRewardCodeName(reward.type, reward.code)
                  )}
                </div>
                <div className="text-xs text-zinc-500">
                  Category: {getRewardTypeName(reward.type)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Amount</span>
              <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                x{reward.amount.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
