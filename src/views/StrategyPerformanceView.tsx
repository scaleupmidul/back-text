import React, { useMemo } from 'react';
import type { MSP1Setup } from '../types/index.ts';
import {
  calculatePerformanceStats,
  getEffectiveStrategy,
  PerformanceStats,
} from '../utils/performanceCalculations.ts';
import {
  TrendingUp,
  AlertTriangle,
  Scale,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface StrategyPerformanceViewProps {
  setups: MSP1Setup[];
  onOpenTradeModal: () => void;
  onSelectTrade?: (setup: MSP1Setup) => void;
}

export const StrategyPerformanceView: React.FC<StrategyPerformanceViewProps> = ({
  setups,
  onOpenTradeModal,
  onSelectTrade,
}) => {
  // Compute individual strategy stats
  const lseStats = useMemo(() => calculatePerformanceStats(setups, { strategy: 'LSE' }), [setups]);
  const dreStats = useMemo(() => calculatePerformanceStats(setups, { strategy: 'DRE' }), [setups]);

  // Overall executed count
  const totalExecuted = lseStats.totalTrades + dreStats.totalTrades;

  // Insufficient sample size check: e.g. either strategy has fewer than 10 trades
  const isSampleSmall = lseStats.totalTrades < 10 || dreStats.totalTrades < 10;

  // Comparison helper: determines which measured result is better in this sample
  const compareMetric = (
    valLse: number | null,
    valDre: number | null,
    higherIsBetter = true
  ): 'LSE' | 'DRE' | 'EQUAL' => {
    if (valLse === null || valDre === null) {
      if (valLse !== null) return 'LSE';
      if (valDre !== null) return 'DRE';
      return 'EQUAL';
    }
    if (Math.abs(valLse - valDre) < 0.001) return 'EQUAL';
    if (higherIsBetter) {
      return valLse > valDre ? 'LSE' : 'DRE';
    } else {
      return valLse < valDre ? 'LSE' : 'DRE';
    }
  };

  // Comparative equity timeline data
  const comparisonCurveData = useMemo(() => {
    const sorted = [...setups]
      .filter((s) => !s.isMissedSetup && s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.setupId.localeCompare(b.setupId));

    let runningLseR = 0;
    let runningDreR = 0;

    return sorted.map((s, idx) => {
      const r = s.actualR || 0;
      const isLse = getEffectiveStrategy(s) === 'LSE';
      if (isLse) {
        runningLseR = Number((runningLseR + r).toFixed(2));
      } else {
        runningDreR = Number((runningDreR + r).toFixed(2));
      }

      return {
        tradeNumber: idx + 1,
        tradeId: s.setupId,
        date: s.date,
        lseR: runningLseR,
        dreR: runningDreR,
      };
    });
  }, [setups]);

  const metricsTable: {
    label: string;
    lseVal: string;
    dreVal: string;
    winner: 'LSE' | 'DRE' | 'EQUAL';
    note?: string;
  }[] = [
    {
      label: 'Total Sample Trades',
      lseVal: `${lseStats.totalTrades}`,
      dreVal: `${dreStats.totalTrades}`,
      winner: 'EQUAL',
      note: 'Volume of opportunities identified',
    },
    {
      label: 'Setup Frequency (% of trades)',
      lseVal: totalExecuted > 0 ? `${((lseStats.totalTrades / totalExecuted) * 100).toFixed(1)}%` : '0%',
      dreVal: totalExecuted > 0 ? `${((dreStats.totalTrades / totalExecuted) * 100).toFixed(1)}%` : '0%',
      winner: 'EQUAL',
      note: 'Share of total executed setups',
    },
    {
      label: 'Win Rate % (incl. Breakevens)',
      lseVal: `${lseStats.winRate.toFixed(1)}%`,
      dreVal: `${dreStats.winRate.toFixed(1)}%`,
      winner: compareMetric(lseStats.winRate, dreStats.winRate, true),
      note: 'Wins / Total resolved trades',
    },
    {
      label: 'Decisive Win Rate % (Wins vs Losses)',
      lseVal: lseStats.decisiveWinRate !== null ? `${lseStats.decisiveWinRate.toFixed(1)}%` : 'N/A',
      dreVal: dreStats.decisiveWinRate !== null ? `${dreStats.decisiveWinRate.toFixed(1)}%` : 'N/A',
      winner: compareMetric(lseStats.decisiveWinRate, dreStats.decisiveWinRate, true),
      note: 'Excluding breakevens',
    },
    {
      label: 'Net Realized R',
      lseVal: `${lseStats.netR > 0 ? '+' : ''}${lseStats.netR.toFixed(2)} R`,
      dreVal: `${dreStats.netR > 0 ? '+' : ''}${dreStats.netR.toFixed(2)} R`,
      winner: compareMetric(lseStats.netR, dreStats.netR, true),
      note: 'Total accumulated return in R-multiples',
    },
    {
      label: 'Average R per Trade (Expectancy)',
      lseVal: `${lseStats.expectancy > 0 ? '+' : ''}${lseStats.expectancy.toFixed(2)} R`,
      dreVal: `${dreStats.expectancy > 0 ? '+' : ''}${dreStats.expectancy.toFixed(2)} R`,
      winner: compareMetric(lseStats.expectancy, dreStats.expectancy, true),
      note: 'Average mathematical edge per trade',
    },
    {
      label: 'Profit Factor',
      lseVal: lseStats.profitFactorDisplay,
      dreVal: dreStats.profitFactorDisplay,
      winner: compareMetric(lseStats.profitFactor, dreStats.profitFactor, true),
      note: 'Gross gains divided by gross losses',
    },
    {
      label: 'Maximum Drawdown in R',
      lseVal: `-${lseStats.maxDrawdownR.toFixed(2)} R`,
      dreVal: `-${dreStats.maxDrawdownR.toFixed(2)} R`,
      winner: compareMetric(lseStats.maxDrawdownR, dreStats.maxDrawdownR, false), // lower drawdown is better!
      note: 'Peak-to-trough equity drop',
    },
    {
      label: 'Average Win in R',
      lseVal: `+${lseStats.avgWinR.toFixed(2)} R`,
      dreVal: `+${dreStats.avgWinR.toFixed(2)} R`,
      winner: compareMetric(lseStats.avgWinR, dreStats.avgWinR, true),
    },
    {
      label: 'Average Loss in R',
      lseVal: `-${lseStats.avgLossR.toFixed(2)} R`,
      dreVal: `-${dreStats.avgLossR.toFixed(2)} R`,
      winner: compareMetric(lseStats.avgLossR, dreStats.avgLossR, false),
    },
    {
      label: 'BUY Expectancy (Win Rate)',
      lseVal: `${lseStats.buyExpectancy > 0 ? '+' : ''}${lseStats.buyExpectancy.toFixed(2)} R (${lseStats.buyWinRate.toFixed(0)}%)`,
      dreVal: `${dreStats.buyExpectancy > 0 ? '+' : ''}${dreStats.buyExpectancy.toFixed(2)} R (${dreStats.buyWinRate.toFixed(0)}%)`,
      winner: compareMetric(lseStats.buyExpectancy, dreStats.buyExpectancy, true),
    },
    {
      label: 'SELL Expectancy (Win Rate)',
      lseVal: `${lseStats.sellExpectancy > 0 ? '+' : ''}${lseStats.sellExpectancy.toFixed(2)} R (${lseStats.sellWinRate.toFixed(0)}%)`,
      dreVal: `${dreStats.sellExpectancy > 0 ? '+' : ''}${dreStats.sellExpectancy.toFixed(2)} R (${dreStats.sellWinRate.toFixed(0)}%)`,
      winner: compareMetric(lseStats.sellExpectancy, dreStats.sellExpectancy, true),
    },
    {
      label: 'London Session Expectancy',
      lseVal: `${lseStats.sessions.london.expectancy > 0 ? '+' : ''}${lseStats.sessions.london.expectancy.toFixed(2)} R (${lseStats.sessions.london.count} tr)`,
      dreVal: `${dreStats.sessions.london.expectancy > 0 ? '+' : ''}${dreStats.sessions.london.expectancy.toFixed(2)} R (${dreStats.sessions.london.count} tr)`,
      winner: compareMetric(lseStats.sessions.london.expectancy, dreStats.sessions.london.expectancy, true),
    },
    {
      label: 'New York Session Expectancy',
      lseVal: `${lseStats.sessions.newYork.expectancy > 0 ? '+' : ''}${lseStats.sessions.newYork.expectancy.toFixed(2)} R (${lseStats.sessions.newYork.count} tr)`,
      dreVal: `${dreStats.sessions.newYork.expectancy > 0 ? '+' : ''}${dreStats.sessions.newYork.expectancy.toFixed(2)} R (${dreStats.sessions.newYork.count} tr)`,
      winner: compareMetric(lseStats.sessions.newYork.expectancy, dreStats.sessions.newYork.expectancy, true),
    },
    {
      label: 'Rule-Following Discipline Net R',
      lseVal: `${lseStats.ruleFollowedNetR > 0 ? '+' : ''}${lseStats.ruleFollowedNetR.toFixed(2)} R (${lseStats.ruleFollowedCount} tr)`,
      dreVal: `${dreStats.ruleFollowedNetR > 0 ? '+' : ''}${dreStats.ruleFollowedNetR.toFixed(2)} R (${dreStats.ruleFollowedCount} tr)`,
      winner: compareMetric(lseStats.ruleFollowedNetR, dreStats.ruleFollowedNetR, true),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Title & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Strategy Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Side-by-side empirical comparison between Liquidity Sweep Entry (LSE) and Demand Reaction Entry (DRE).
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenTradeModal}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Record Trade
        </button>
      </div>

      {/* Insufficient Sample Size Banner */}
      {isSampleSmall && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Insufficient data for a reliable strategy comparison.</span>
          </div>
          <p className="text-xs text-amber-300/80 pl-6">
            LSE has recorded <strong className="font-mono">{lseStats.totalTrades}</strong> trades and DRE has recorded <strong className="font-mono">{dreStats.totalTrades}</strong> trades. A minimum of 25–50+ trades per setup is required to establish initial statistical significance. Do not draw definitive conclusions from early sample variance.
          </p>
        </div>
      )}

      {/* Strategy Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LSE Summary Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0b101b] border border-slate-800/90 text-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <h2 className="text-base font-bold text-white tracking-tight">LSE — Liquidity Sweep Entry</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{lseStats.totalTrades} Trades</span>
          </div>
          <p className="text-xs text-slate-400">
            Identifies sweeps of key swing highs or lows followed by swift rejection, level reclamation, M15 MSS candle close, and M5 pullback.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Win Rate</span>
              <span className="text-sm font-semibold text-slate-200">{lseStats.winRate.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Net R</span>
              <span className={`text-sm font-semibold ${lseStats.netR > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {lseStats.netR > 0 ? '+' : ''}{lseStats.netR.toFixed(2)} R
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Expectancy</span>
              <span className="text-sm font-semibold text-slate-200">
                {lseStats.expectancy > 0 ? '+' : ''}{lseStats.expectancy.toFixed(2)} R
              </span>
            </div>
          </div>
        </div>

        {/* DRE Summary Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0b101b] border border-slate-800/90 text-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <h2 className="text-base font-bold text-white tracking-tight">DRE — Demand Reaction Entry</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{dreStats.totalTrades} Trades</span>
          </div>
          <p className="text-xs text-slate-400">
            Enters direct mitigation of high-probability 4H/1H Demand or Supply zones upon M15 price action confirmation without requiring prior sweep.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Win Rate</span>
              <span className="text-sm font-semibold text-slate-200">{dreStats.winRate.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Net R</span>
              <span className={`text-sm font-semibold ${dreStats.netR > 0 ? 'text-indigo-400' : 'text-slate-300'}`}>
                {dreStats.netR > 0 ? '+' : ''}{dreStats.netR.toFixed(2)} R
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Expectancy</span>
              <span className="text-sm font-semibold text-slate-200">
                {dreStats.expectancy > 0 ? '+' : ''}{dreStats.expectancy.toFixed(2)} R
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Cumulative R Equity Curve Chart */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0b101b] border border-slate-800/90 text-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Comparative Cumulative Equity Curve (LSE vs DRE)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological cumulative R progression for each strategy across the backtesting log.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400"></span> LSE
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-0.5 bg-indigo-400"></span> DRE
            </span>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="tradeNumber"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `#${val}`}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${val}R`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs font-mono space-y-1">
                        <div className="text-white font-semibold">Trade #{data.tradeNumber} ({data.date})</div>
                        <div className="text-amber-400">LSE Cumulative: {data.lseR}R</div>
                        <div className="text-indigo-400">DRE Cumulative: {data.dreR}R</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="lseR"
                name="LSE (Liquidity Sweep)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="dreR"
                name="DRE (Demand Reaction)"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Detailed Metric Comparison Table */}
      <div className="rounded-xl bg-[#0b101b] border border-slate-800/90 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Side-by-Side Statistical Evaluation
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Badges indicate higher measured result in this sample
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Metric / Parameter</th>
                <th className="py-3 px-4 w-48 text-right font-mono">LSE Strategy</th>
                <th className="py-3 px-4 w-48 text-right font-mono">DRE Strategy</th>
                <th className="py-3 px-4 w-36 text-center">Better in Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {metricsTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-slate-200">
                    <span className="font-medium">{row.label}</span>
                    {row.note && (
                      <span className="block text-[11px] text-slate-400 mt-0.5">{row.note}</span>
                    )}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono tabular-nums font-semibold ${
                    row.winner === 'LSE' ? 'text-amber-400' : 'text-slate-300'
                  }`}>
                    {row.lseVal}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono tabular-nums font-semibold ${
                    row.winner === 'DRE' ? 'text-indigo-400' : 'text-slate-300'
                  }`}>
                    {row.dreVal}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.winner === 'LSE' ? (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        LSE
                      </span>
                    ) : row.winner === 'DRE' ? (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        DRE
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rigorous Methodological Disclosure */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-300 flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-slate-400" />
          Statistical Integrity & Methodology
        </h4>
        <p>
          Neither strategy is assumed to be inherently profitable or universally superior. A strategy with a higher win rate is not automatically better: overall profitability depends on expectancy ($R$ per trade), maximum drawdown, setup frequency, slippage, and resilience across changing market volatility regimes.
        </p>
        <p>
          Always validate backtesting results out-of-sample before committing live capital.
        </p>
      </div>
    </div>
  );
};
