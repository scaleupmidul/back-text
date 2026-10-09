import React, { useState, useMemo } from 'react';
import type { MSP1Setup } from '../types/index.ts';
import {
  Compass,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Info,
  Layers,
} from 'lucide-react';
import { getEffectiveStrategy } from '../utils/performanceCalculations.ts';

interface MissedSetupsViewProps {
  setups: MSP1Setup[];
  onOpenTradeModal: (isMissed?: boolean) => void;
  onEditTrade: (setup: MSP1Setup) => void;
  onDeleteTrade: (setup: MSP1Setup) => void;
}

export const MissedSetupsView: React.FC<MissedSetupsViewProps> = ({
  setups,
  onOpenTradeModal,
  onEditTrade,
  onDeleteTrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<'ALL' | 'LSE' | 'DRE'>('ALL');

  // Filter for setups marked as missed setup or No Trade / Incomplete
  const missedSetups = useMemo(() => {
    return setups.filter((s) => {
      const isMissed =
        s.isMissedSetup === true ||
        s.direction === 'NO TRADE' ||
        ['No Trade', 'Incomplete Setup', 'Invalid Setup'].includes(s.result);

      if (!isMissed) return false;

      const strat = getEffectiveStrategy(s);
      if (strategyFilter !== 'ALL' && strat !== strategyFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = s.setupId.toLowerCase().includes(q);
        const matchesReason = (s.skipReason || '').toLowerCase().includes(q);
        const matchesNotes = (s.notes || '').toLowerCase().includes(q);
        const matchesHypo = (s.hypotheticalOutcome || '').toLowerCase().includes(q);
        if (!matchesId && !matchesReason && !matchesNotes && !matchesHypo) return false;
      }

      return true;
    });
  }, [setups, strategyFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              Missed Setups & No-Trade Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Document observed market opportunities that were skipped, filtered, or unexecuted.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenTradeModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Missed Setup</span>
        </button>
      </div>

      {/* Isolation Methodology Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Statistical Isolation</span>
        </div>
        <p>
          Missed setups and hypothetical outcomes are kept strictly isolated from live backtesting metrics. They do <strong>not</strong> affect your verified Win Rate, Profit Factor, Expectancy, or Cumulative R Equity Curve.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Trade ID, skip reason, notes..."
            className="w-full bg-[#0b101b] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0b101b] border border-slate-800 rounded-lg self-start sm:self-auto">
          {(['ALL', 'LSE', 'DRE'] as const).map((strat) => (
            <button
              key={strat}
              type="button"
              onClick={() => setStrategyFilter(strat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                strategyFilter === strat
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {strat === 'ALL' ? 'All Strategies' : strat}
            </button>
          ))}
        </div>
      </div>

      {/* Missed Setups Table */}
      {missedSetups.length === 0 ? (
        <div className="bg-[#0b101b] border border-slate-800 rounded-xl p-10 text-center space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Missed Setups Logged</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you observe a valid or near-valid setup that you consciously skip, log it here to track hesitancy and filter efficacy.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#0b101b] border border-slate-800/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date / ID</th>
                  <th className="py-3 px-4">Strategy</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">H1 Bias & Level</th>
                  <th className="py-3 px-4">Confirmations</th>
                  <th className="py-3 px-4">Reason for Skipping</th>
                  <th className="py-3 px-4">Hypothetical Result</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {missedSetups.map((s) => {
                  const strat = getEffectiveStrategy(s);
                  const isLong = s.direction === 'BUY';
                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <span className="font-semibold text-white block">{s.setupId}</span>
                        <span className="text-[11px] text-slate-400">{s.date} · {s.session}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-sm border ${
                          strat === 'LSE'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          {strat}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-[11px] font-semibold ${
                          s.direction === 'BUY'
                            ? 'text-emerald-400'
                            : s.direction === 'SELL'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}>
                          {s.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div>Bias: {s.h1Bias || s.d1Bias}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Level: {s.importantLevel || s.h4Zone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] font-mono space-y-0.5">
                        <div>Sweep: {s.liquiditySweepConfirmed || Boolean(s.liquidityLevelTaken) ? 'Yes' : 'No'}</div>
                        <div>MSS: {s.mssConfirmed || s.h1MssDirection !== 'No MSS' ? 'Yes' : 'No'}</div>
                        <div>M5 Pb: {s.m5Pullback ? 'Yes' : 'No'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-200 max-w-xs">
                        <div className="font-medium text-amber-300/90">
                          {s.skipReason || s.notes || 'Rule checklist filter / No entry trigger'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs">
                        {s.hypotheticalOutcome ? (
                          <span className="text-slate-300 font-mono text-[11px]">
                            {s.hypotheticalOutcome}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">Unrecorded</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTrade(s)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTrade(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
