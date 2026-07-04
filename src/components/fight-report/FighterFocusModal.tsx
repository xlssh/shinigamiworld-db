import React, { useMemo } from 'react';
import { X, Flame, Shield, Heart, Trophy, Target, Activity } from 'lucide-react';
import { FighterRuntimeState, FighterTurnSnapshot } from '../../utils/fight-report/simulation';
import { FightReportData } from '../../utils/fight-report/parser';

interface FighterFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighterKey: string;
  fighterState: FighterRuntimeState;
  timeline: FighterTurnSnapshot[];
  report: FightReportData;
  skillsMap: Map<number, string>;
}

export const FighterFocusModal: React.FC<FighterFocusModalProps> = ({
  isOpen,
  onClose,
  fighterKey,
  fighterState,
  timeline,
  report,
  skillsMap,
}) => {
  const parts = fighterKey.split('_');
  const camp = parseInt(parts[0]);
  const pos = parseInt(parts[1]);

  const totalRounds = report.totalTurns;

  // Filter actions performed by this fighter
  const fighterActions = useMemo(() => {
    const list: Array<{ round: number; skillId: number; targetCount: number; actionType: number }> = [];
    report.turns.forEach((turn) => {
      turn.actives.forEach((act) => {
        if (act.camp === camp && act.pos === pos) {
          list.push({
            round: turn.curTurn,
            skillId: act.skillEffectId,
            targetCount: act.targets.length,
            actionType: act.activeType,
          });
        }
      });
    });
    return list;
  }, [report, camp, pos]);

  // SVG dimensions for HP/Shield sparkline
  const sparkWidth = 400;
  const sparkHeight = 120;
  const paddingX = 20;
  const paddingY = 15;

  const chartW = sparkWidth - paddingX * 2;
  const chartH = sparkHeight - paddingY * 2;

  const hpCoords = useMemo(() => {
    if (timeline.length === 0) return [];
    return timeline.map((snap) => {
      const x = paddingX + (snap.round / totalRounds) * chartW;
      const y = paddingY + chartH - (snap.hpPercent / 100) * chartH;
      return [x, y] as [number, number];
    });
  }, [timeline, totalRounds, chartW, chartH]);

  const shieldCoords = useMemo(() => {
    if (timeline.length === 0) return [];
    return timeline.map((snap) => {
      const x = paddingX + (snap.round / totalRounds) * chartW;
      const maxHp = snap.maxHp || 1;
      const shieldPct = Math.min(100, (snap.shield / maxHp) * 100);
      const y = paddingY + chartH - (shieldPct / 100) * chartH;
      return [x, y] as [number, number];
    });
  }, [timeline, totalRounds, chartW, chartH]);

  const pointsStr = (coords: [number, number][]) =>
    coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const formatCompact = (val: number) => {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-bg/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/10 border border-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="font-black text-base text-text">{fighterState.name}</h3>
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider block">
                Fighter Focus & round-by-round trajectory
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-hover rounded-lg text-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 border border-border bg-bg/25 rounded-xl space-y-0.5">
              <span className="text-[9px] font-black uppercase text-subtle tracking-wider flex items-center justify-center gap-1">
                <Flame size={10} className="text-red-500" />
                <span>Damage Dealt</span>
              </span>
              <span className="font-extrabold text-base text-text font-mono block">
                {formatCompact(fighterState.damageDealtRaw)}
              </span>
            </div>
            <div className="p-3 border border-border bg-bg/25 rounded-xl space-y-0.5">
              <span className="text-[9px] font-black uppercase text-subtle tracking-wider flex items-center justify-center gap-1">
                <Shield size={10} className="text-orange-500" />
                <span>Damage Taken</span>
              </span>
              <span className="font-extrabold text-base text-text font-mono block">
                {formatCompact(fighterState.damageTakenRaw)}
              </span>
            </div>
            <div className="p-3 border border-border bg-bg/25 rounded-xl space-y-0.5">
              <span className="text-[9px] font-black uppercase text-subtle tracking-wider flex items-center justify-center gap-1">
                <Heart size={10} className="text-emerald-500" />
                <span>Healing Done</span>
              </span>
              <span className="font-extrabold text-base text-text font-mono block">
                {formatCompact(fighterState.healingDone)}
              </span>
            </div>
            <div className="p-3 border border-border bg-bg/25 rounded-xl space-y-0.5">
              <span className="text-[9px] font-black uppercase text-subtle tracking-wider flex items-center justify-center gap-1">
                <Trophy size={10} className="text-amber-500 animate-pulse" />
                <span>Kills / Crits</span>
              </span>
              <span className="font-extrabold text-base text-text font-mono block">
                {fighterState.kills} <span className="text-subtle text-xs">/</span> {fighterState.crits}
              </span>
            </div>
          </div>

          {/* SVG HP & Shield Area Sparkline */}
          {hpCoords.length > 0 && (
            <div className="p-4 border border-border bg-bg/20 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-subtle select-none">
                <span>HP & Shield Progression Sparkline</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-500">
                    <span className="w-2.5 h-0.5 bg-emerald-500 block"></span>
                    <span>HP</span>
                  </span>
                  <span className="flex items-center gap-1 text-blue-500">
                    <span className="w-2.5 h-0.5 bg-blue-500 block"></span>
                    <span>Shield</span>
                  </span>
                </div>
              </div>

              <div className="w-full h-28 relative">
                <svg viewBox={`0 0 ${sparkWidth} ${sparkHeight}`} className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  {[0, 50, 100].map((val) => {
                    const y = paddingY + chartH - (val / 100) * chartH;
                    return (
                      <line
                        key={val}
                        x1={paddingX}
                        y1={y}
                        x2={sparkWidth - paddingX}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth={0.5}
                        strokeDasharray="3 3"
                        className="text-border/60"
                      />
                    );
                  })}

                  {/* Draw HP Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2}
                    points={pointsStr(hpCoords)}
                  />
                  {hpCoords.map(([x, y], idx) => (
                    <circle key={`hp-${idx}`} cx={x} cy={y} r={3} fill="#10b981" stroke="#fff" strokeWidth={1} />
                  ))}

                  {/* Draw Shield Line */}
                  {shieldCoords.some(([_, y]) => y < paddingY + chartH) && (
                    <>
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        points={pointsStr(shieldCoords)}
                      />
                      {shieldCoords.map(([x, y], idx) => (
                        <circle key={`sh-${idx}`} cx={x} cy={y} r={2.5} fill="#3b82f6" stroke="#fff" strokeWidth={1} />
                      ))}
                    </>
                  )}
                </svg>
              </div>
            </div>
          )}

          {/* Per-Round DPT Sparklines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Damage Sparkbars */}
            <div className="p-4 border border-border bg-bg/25 rounded-xl space-y-3">
              <span className="text-[10px] font-black uppercase text-subtle tracking-wider flex items-center gap-1">
                <Flame size={12} className="text-red-500" />
                <span>Damage Dealt Per Round (DPT)</span>
              </span>
              <div className="space-y-1.5 font-mono text-[10px] font-bold text-muted">
                {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => {
                  const val = fighterState.damageDealtByRound[round] || 0;
                  const maxDpt = Math.max(1, ...Object.values(fighterState.damageDealtByRound));
                  const pct = (val / maxDpt) * 100;

                  if (val === 0) return null;

                  return (
                    <div key={round} className="flex items-center gap-2">
                      <span className="w-8 shrink-0">R{round}:</span>
                      <div className="flex-1 h-2 bg-bg border border-border rounded-md overflow-hidden">
                        <div className="h-full bg-red-500 rounded-md" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-12 text-right text-red-500 shrink-0">{formatCompact(val)}</span>
                    </div>
                  );
                })}
                {Object.keys(fighterState.damageDealtByRound).length === 0 && (
                  <span className="text-subtle italic text-[11px] block text-center py-2">
                    No active damage dealt.
                  </span>
                )}
              </div>
            </div>

            {/* Healing/Damage Taken Sparkbars */}
            <div className="p-4 border border-border bg-bg/25 rounded-xl space-y-3">
              <span className="text-[10px] font-black uppercase text-subtle tracking-wider flex items-center gap-1">
                <Shield size={12} className="text-orange-500" />
                <span>Damage Taken Per Round</span>
              </span>
              <div className="space-y-1.5 font-mono text-[10px] font-bold text-muted">
                {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => {
                  const val = fighterState.damageTakenByRound[round] || 0;
                  const maxTaken = Math.max(1, ...Object.values(fighterState.damageTakenByRound));
                  const pct = (val / maxTaken) * 100;

                  if (val === 0) return null;

                  return (
                    <div key={round} className="flex items-center gap-2">
                      <span className="w-8 shrink-0">R{round}:</span>
                      <div className="flex-1 h-2 bg-bg border border-border rounded-md overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-md" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-12 text-right text-orange-500 shrink-0">{formatCompact(val)}</span>
                    </div>
                  );
                })}
                {Object.keys(fighterState.damageTakenByRound).length === 0 && (
                  <span className="text-subtle italic text-[11px] block text-center py-2">
                    No active damage taken.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Cast Registry */}
          <div className="p-4 border border-border bg-bg/20 rounded-xl space-y-3">
            <span className="text-[10px] font-black uppercase text-subtle tracking-wider flex items-center gap-1 select-none">
              <Target size={12} className="text-violet-500" />
              <span>Tactical Skill Actions performed ({fighterActions.length})</span>
            </span>
            <div className="max-h-40 overflow-y-auto space-y-2 divide-y divide-border/40 font-bold text-[11px] text-muted pr-1">
              {fighterActions.map((act, idx) => {
                const sName = skillsMap.get(act.skillId) || `Skill #${act.skillId}`;
                return (
                  <div key={idx} className={`pt-2 ${idx === 0 ? 'pt-0' : ''} flex justify-between items-center`}>
                    <span>
                      Round {act.round}: Casts <span className="text-text font-black">[{sName}]</span> targeting {act.targetCount} units.
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950/40 text-violet-800 dark:text-violet-400 rounded-lg font-mono">
                      Type #{act.actionType}
                    </span>
                  </div>
                );
              })}
              {fighterActions.length === 0 && (
                <span className="text-subtle italic block text-center py-4 text-xs font-bold">
                  No skill casts performed.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
