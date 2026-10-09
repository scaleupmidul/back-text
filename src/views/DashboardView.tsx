import React, { useState, useEffect, useMemo } from 'react';
import type { MSP1Setup, TradingStrategy } from '../types/index.ts';
import { api } from '../services/api.ts';
import { msp1Store } from '../utils/msp1Store.ts';
import {
  calculatePerformanceStats,
  getSampleMilestones,
  getEffectiveStrategy,
  FilterOptions,
} from '../utils/performanceCalculations.ts';
import { MSP1EquityWinRateChart } from '../components/msp1/MSP1EquityWinRateChart.tsx';
import { MSP1SetupModal } from '../components/msp1/MSP1SetupModal.tsx';
import {
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Scale,
  Sparkles,
  Compass,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onSelectDetail?: (setup: MSP1Setup) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectDetail }) => {
  const [setups, setSetups] = useState<MSP1Setup[]>(() => msp1Store.getSetups() || []);
  const [loading, setLoading] = useState(() => !msp1Store.getSetups());

  // Filters
  const [strategyFilter, setStrategyFilter] = useState<'ALL' | 'LSE' | 'DRE'>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'London' | 'New York'>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | '30D' | '90D' | 'CUSTOM'>('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextSetupId, setNextSetupId] = useState(() => msp1Store.getNextId());

  useEffect(() => {
    const unsubscribe = msp1Store.subscribe((updated, nextId) => {
      setSetups(updated);
      setNextSetupId(nextId);
      setLoading(false);
    });

    const loadData = async () => {
      try {
        if (!msp1Store.getSetups()) setLoading(true);
        const [msp1Data, nextId] = await Promise.all([
          api.getMSP1Setups().catch(() => []),
          api.getNextMSP1SetupId().catch(() => 'MSP1-0001'),
        ]);
        msp1Store.setData(msp1Data, nextId);
      } catch (err) {
        console.error('Error fetching backtest setups:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => unsubscribe();
  }, []);

  // Compute date limits for filters
  const filterOptions: FilterOptions = useMemo(() => {
    const opts: FilterOptions = {
      strategy: strategyFilter,
      direction: directionFilter,
      session: sessionFilter === 'ALL' ? undefined : (sessionFilter as any),
    };

    if (dateRange === '30D') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      opts.dateStart = d.toISOString().split('T')[0];
    } else if (dateRange === '90D') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      opts.dateStart = d.toISOString().split('T')[0];
    } else if (dateRange === 'CUSTOM') {
      if (customStart) opts.dateStart = customStart;
      if (customEnd) opts.dateEnd = customEnd;
    }

    return opts;
  }, [strategyFilter, directionFilter, sessionFilter, dateRange, customStart, customEnd]);

  // Performance statistics recalculated reactively with filters
  const stats = useMemo(() => calculatePerformanceStats(setups, filterOptions), [setups, filterOptions]);

  // Overall counts for sample size milestones
  const allResolvedCount = useMemo(() => {
    return setups.filter((s) => !s.isMissedSetup && s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)).length;
  }, [setups]);

  const lseResolvedCount = useMemo(() => {
    return setups.filter((s) => !s.isMissedSetup && s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result) && getEffectiveStrategy(s) === 'LSE').length;
  }, [setups]);

  const dreResolvedCount = useMemo(() => {
    return setups.filter((s) => !s.isMissedSetup && s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result) && getEffectiveStrategy(s) === 'DRE').length;
  }, [setups]);

  const combinedMilestones = useMemo(() => getSampleMilestones(allResolvedCount), [allResolvedCount]);
  const lseMilestones = useMemo(() => getSampleMilestones(lseResolvedCount), [lseResolvedCount]);
  const dreMilestones = useMemo(() => getSampleMilestones(dreResolvedCount), [dreResolvedCount]);

  // Handle saving new trade
  const handleSaveTrade = async (newSetup: Omit<MSP1Setup, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const saved = await api.addMSP1Setup(newSetup);
    const updated = [saved, ...setups];
    setSetups(updated);
    const newNextId = await api.getNextMSP1SetupId().catch(() => 'MSP1-0001');
    msp1Store.setData(updated, newNextId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Gold Backtest Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Systematic performance evaluation for LSE (Liquidity Sweep) &amp; DRE (Demand Reaction).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onNavigate('Strategy Performance')}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Compare LSE vs DRE</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Trade</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Strategy Selector */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900/80 border border-slate-800 rounded-lg">
          {(['ALL', 'LSE', 'DRE'] as const).map((strat) => (
            <button
              key={strat}
              type="button"
              onClick={() => setStrategyFilter(strat)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                strategyFilter === strat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {strat === 'ALL' ? 'Both Strategies' : strat}
            </button>
          ))}
        </div>

        {/* Direction Selector */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900/80 border border-slate-800 rounded-lg">
          {(['ALL', 'BUY', 'SELL'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => setDirectionFilter(dir)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                directionFilter === dir
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dir === 'ALL' ? 'All Directions' : dir}
            </button>
          ))}
        </div>

        {/* Session Selector */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900/80 border border-slate-800 rounded-lg">
          {(['ALL', 'London', 'New York'] as const).map((sess) => (
            <button
              key={sess}
              type="button"
              onClick={() => setSessionFilter(sess)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                sessionFilter === sess
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sess === 'ALL' ? 'All Sessions' : sess}
            </button>
          ))}
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Time</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
            <option value="CUSTOM">Custom Date</option>
          </select>
        </div>

        {dateRange === 'CUSTOM' && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
            />
          </div>
        )}
      </div>

      {/* 10 Key Performance Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Trades */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Trades</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {stats.totalTrades}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Resolved executions</span>
        </div>

        {/* Win Rate */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Win Rate %</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {stats.winRate.toFixed(1)}%
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {stats.winningTrades}W / {stats.losingTrades}L / {stats.breakevenTrades}BE
          </span>
        </div>

        {/* Net Profit / Loss in R */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Net Profit / Loss</span>
          <p className={`text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1 ${
            stats.netR > 0 ? 'text-emerald-400' : stats.netR < 0 ? 'text-rose-400' : 'text-slate-300'
          }`}>
            {stats.netR > 0 ? `+${stats.netR.toFixed(2)}` : stats.netR.toFixed(2)} R
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Cumulative realized R</span>
        </div>

        {/* Average R per Trade */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Average R (Expectancy)</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-200 mt-1">
            {stats.expectancy > 0 ? `+${stats.expectancy.toFixed(2)}` : stats.expectancy.toFixed(2)} R
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Per resolved trade</span>
        </div>

        {/* Profit Factor */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Profit Factor</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-200 mt-1 truncate" title={stats.profitFactorDisplay}>
            {stats.profitFactorDisplay}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Gross wins / gross losses</span>
        </div>

        {/* Maximum Drawdown */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Maximum Drawdown</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            -{stats.maxDrawdownR.toFixed(2)} R
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Peak-to-trough decline</span>
        </div>

        {/* Average Realized RR */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Avg Realized RR</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-200 mt-1">
            {stats.avgRealizedRR > 0 ? `+${stats.avgRealizedRR.toFixed(2)} R` : '—'}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Winning trades average</span>
        </div>

        {/* Winning Trades */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Winning Trades</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {stats.winningTrades}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Avg win: +{stats.avgWinR.toFixed(2)}R
          </span>
        </div>

        {/* Losing Trades */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Losing Trades</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            {stats.losingTrades}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Avg loss: -{stats.avgLossR.toFixed(2)}R
          </span>
        </div>

        {/* Breakeven Trades */}
        <div className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800/90">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Breakeven Trades</span>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-400 mt-1">
            {stats.breakevenTrades}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">0R preserved capital</span>
        </div>
      </div>

      {/* Main Interactive Equity Curve & Drawdown Component */}
      <MSP1EquityWinRateChart
        setups={setups}
        onSelectTrade={(setup) => onSelectDetail && onSelectDetail(setup)}
        onOpenLogModal={() => setIsModalOpen(true)}
      />

      {/* Section 10: Backtest Progress Toward Sample Milestones */}
      <div className="p-5 rounded-xl bg-[#0b101b] border border-slate-800/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Sample Size & Backtest Progress Tracker
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating progress toward statistical maturity over 200–250+ historical samples.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Combined: <strong className="text-white">{allResolvedCount}</strong> trades (LSE: {lseResolvedCount} · DRE: {dreResolvedCount})
          </span>
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {combinedMilestones.map((m) => (
            <div
              key={m.target}
              className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                m.reached
                  ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-semibold">
                <span>{m.target} Trades</span>
                <span>{m.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.reached ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${m.progress}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                {m.reached ? 'Milestone achieved' : `${m.remaining} trades remaining`}
              </div>
            </div>
          ))}
        </div>

        {/* Sample Size Warning Note */}
        <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Sample Integrity & Regime Warning</span>
          </div>
          <p>
            Reaching 100 or 250 trades does not automatically prove a strategy is consistently profitable across future market regimes. Market volatility, interest rate cycles, and structural liquidity shifts affect performance. Continuous journaling, regular drawdown audits, and out-of-sample forward testing are essential.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('Strategy Performance')}
          className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <Scale className="w-5 h-5 text-amber-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </div>
          <h4 className="text-sm font-semibold text-white mt-3">Strategy Performance</h4>
          <p className="text-xs text-slate-400 mt-1">
            Inspect side-by-side expectancy, win rates, drawdown, and session efficacy between LSE and DRE.
          </p>
        </div>

        <div
          onClick={() => onNavigate('Insights')}
          className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </div>
          <h4 className="text-sm font-semibold text-white mt-3">Backtest Insights</h4>
          <p className="text-xs text-slate-400 mt-1">
            Empirical answers to key questions: FVG impact, sweep to MSS conversion, rule compliance drag.
          </p>
        </div>

        <div
          onClick={() => onNavigate('Trade History')}
          className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <Layers className="w-5 h-5 text-emerald-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </div>
          <h4 className="text-sm font-semibold text-white mt-3">Trade History & Exports</h4>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, edit records, view attached multi-timeframe charts, and download CSV / JSON exports.
          </p>
        </div>
      </div>

      {/* Record Trade Modal */}
      {isModalOpen && (
        <MSP1SetupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTrade}
          suggestedSetupId={nextSetupId}
        />
      )}
    </div>
  );
};
