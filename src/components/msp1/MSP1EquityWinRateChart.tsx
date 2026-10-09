import React, { useState, useMemo } from 'react';
import type { MSP1Setup } from '../../types/index.ts';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  ArrowDownRight,
  Maximize2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import {
  calculatePerformanceStats,
  getEffectiveStrategy,
  EquityCurvePoint,
} from '../../utils/performanceCalculations.ts';

interface MSP1EquityWinRateChartProps {
  setups: MSP1Setup[];
  onSelectTrade?: (setup: MSP1Setup) => void;
  onOpenLogModal?: () => void;
}

type ChartViewMode = 'EQUITY_DRAWDOWN' | 'LSE_VS_DRE' | 'DRAWDOWN_ONLY';

export const MSP1EquityWinRateChart: React.FC<MSP1EquityWinRateChartProps> = ({
  setups,
  onSelectTrade,
  onOpenLogModal,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('EQUITY_DRAWDOWN');
  const [selectedPoint, setSelectedPoint] = useState<EquityCurvePoint | null>(null);

  // Compute overall performance
  const overallStats = useMemo(() => calculatePerformanceStats(setups), [setups]);
  const lseStats = useMemo(() => calculatePerformanceStats(setups, { strategy: 'LSE' }), [setups]);
  const dreStats = useMemo(() => calculatePerformanceStats(setups, { strategy: 'DRE' }), [setups]);

  // Combined Chart Data for LSE vs DRE
  const dualStrategyData = useMemo(() => {
    // Generate normalized timeline of executed trades
    const sorted = [...setups]
      .filter((s) => !s.isMissedSetup && s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.setupId.localeCompare(b.setupId));

    let runningTotalR = 0;
    let runningLseR = 0;
    let runningDreR = 0;

    return sorted.map((s, idx) => {
      const strat = getEffectiveStrategy(s);
      const r = s.actualR || 0;
      runningTotalR = Number((runningTotalR + r).toFixed(2));
      if (strat === 'LSE') {
        runningLseR = Number((runningLseR + r).toFixed(2));
      } else if (strat === 'DRE') {
        runningDreR = Number((runningDreR + r).toFixed(2));
      }

      return {
        tradeIndex: idx + 1,
        tradeId: s.setupId,
        date: s.date,
        strategy: strat,
        direction: s.direction,
        result: s.result,
        actualR: r,
        totalCumulativeR: runningTotalR,
        lseCumulativeR: runningLseR,
        dreCumulativeR: runningDreR,
        setupObj: s,
      };
    });
  }, [setups]);

  if (overallStats.totalTrades === 0) {
    return (
      <div className="bg-[#0b101b] border border-slate-800 rounded-xl p-8 text-center">
        <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">No Executed Backtest Trades Recorded</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
          Add historical trades using the Record Trade form to generate cumulative equity curves and drawdown analytics.
        </p>
        {onOpenLogModal && (
          <button
            type="button"
            onClick={onOpenLogModal}
            className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-semibold rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Record First Trade
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-xl p-4 sm:p-5 text-slate-100 space-y-4">
      {/* Chart Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Equity & Performance Curve
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({overallStats.totalTrades} Resolved Trades)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Measured in realized R-multiples over chronological backtest sequence.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('EQUITY_DRAWDOWN')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'EQUITY_DRAWDOWN'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Equity & Peak
          </button>
          <button
            type="button"
            onClick={() => setViewMode('LSE_VS_DRE')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'LSE_VS_DRE'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LSE vs DRE
          </button>
          <button
            type="button"
            onClick={() => setViewMode('DRAWDOWN_ONLY')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'DRAWDOWN_ONLY'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Drawdown (R)
          </button>
        </div>
      </div>

      {/* Main Chart Viewport */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'EQUITY_DRAWDOWN' ? (
            <LineChart
              data={overallStats.equityCurve}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const pt = e.activePayload[0].payload as EquityCurvePoint;
                  setSelectedPoint(pt);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="index"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `#${val}`}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${val}R`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EquityCurvePoint;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="flex items-center justify-between gap-4 font-mono">
                          <span className="font-semibold text-white">{data.tradeId}</span>
                          <span className="text-slate-400">{data.date}</span>
                        </div>
                        <div className="text-slate-300">
                          {data.strategy} · {data.direction} ·{' '}
                          <span className={data.result === 'Win' ? 'text-emerald-400' : data.result === 'Loss' ? 'text-rose-400' : 'text-slate-400'}>
                            {data.result} ({data.actualR > 0 ? `+${data.actualR}` : data.actualR}R)
                          </span>
                        </div>
                        <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between gap-3 font-mono">
                          <span>Cumulative: <strong className="text-amber-400">{data.cumulativeR}R</strong></span>
                          <span>Drawdown: <strong className="text-rose-400">-{data.drawdownR}R</strong></span>
                        </div>
                        {data.notes && (
                          <div className="pt-1 text-[11px] text-slate-400 max-w-xs truncate italic">
                            "{data.notes}"
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
              {/* Cumulative R */}
              <Line
                type="monotone"
                dataKey="cumulativeR"
                name="Cumulative Equity"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b', stroke: '#0b101b', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#fbbf24' }}
              />
              {/* Peak Equity Line */}
              <Line
                type="stepAfter"
                dataKey="peakR"
                name="High Water Mark"
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          ) : viewMode === 'LSE_VS_DRE' ? (
            <LineChart
              data={dualStrategyData}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const pt = e.activePayload[0].payload;
                  if (onSelectTrade && pt?.setupObj) {
                    onSelectTrade(pt.setupObj);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="tradeIndex"
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
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="flex items-center justify-between gap-4 font-mono">
                          <span className="font-semibold text-white">{data.tradeId}</span>
                          <span className="text-slate-400">{data.date}</span>
                        </div>
                        <div className="text-slate-300">
                          {data.strategy} · {data.result} ({data.actualR > 0 ? `+${data.actualR}` : data.actualR}R)
                        </div>
                        <div className="pt-1 border-t border-slate-800 text-[11px] font-mono space-y-0.5">
                          <div className="text-amber-400">LSE Cumulative: {data.lseCumulativeR}R</div>
                          <div className="text-indigo-400">DRE Cumulative: {data.dreCumulativeR}R</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
              {/* LSE Line */}
              <Line
                type="monotone"
                dataKey="lseCumulativeR"
                name="LSE (Liquidity Sweep Entry)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#f59e0b' }}
              />
              {/* DRE Line */}
              <Line
                type="monotone"
                dataKey="dreCumulativeR"
                name="DRE (Demand Reaction Entry)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#6366f1' }}
              />
            </LineChart>
          ) : (
            <AreaChart data={overallStats.equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="index"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `#${val}`}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `-${val}R`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EquityCurvePoint;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs font-mono">
                        <div className="text-white font-semibold">{data.tradeId} ({data.date})</div>
                        <div className="text-rose-400 mt-1">Current Drawdown: -{data.drawdownR} R</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="drawdownR"
                name="Drawdown from Peak"
                stroke="#f43f5e"
                fill="#881337"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Selected Trade Quick Inspector Card */}
      {selectedPoint && (
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded-md font-mono font-bold ${
              selectedPoint.result === 'Win'
                ? 'bg-emerald-500/10 text-emerald-400'
                : selectedPoint.result === 'Loss'
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {selectedPoint.tradeId}
            </div>
            <div>
              <div className="text-slate-200 font-medium">
                {selectedPoint.date} · {selectedPoint.strategy} · {selectedPoint.direction}
              </div>
              <div className="text-slate-400 text-[11px]">
                Result: <span className="font-mono">{selectedPoint.actualR > 0 ? `+${selectedPoint.actualR}` : selectedPoint.actualR}R</span> | Cumulative at this trade: <span className="font-mono text-amber-400">{selectedPoint.cumulativeR}R</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSelectTrade && (
              <button
                type="button"
                onClick={() => {
                  const match = setups.find((s) => s.setupId === selectedPoint.tradeId);
                  if (match) onSelectTrade(match);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md transition-colors cursor-pointer"
              >
                Inspect Trade
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedPoint(null)}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Bottom Metric Anchors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Net Realized R</span>
          <p className="text-sm font-semibold font-mono tabular-nums text-amber-400 mt-0.5">
            {overallStats.netR > 0 ? `+${overallStats.netR.toFixed(2)}` : overallStats.netR.toFixed(2)} R
          </p>
        </div>
        <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Expectancy (Avg R)</span>
          <p className="text-sm font-semibold font-mono tabular-nums text-slate-200 mt-0.5">
            {overallStats.expectancy > 0 ? `+${overallStats.expectancy.toFixed(2)}` : overallStats.expectancy.toFixed(2)} R
          </p>
        </div>
        <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Max Drawdown</span>
          <p className="text-sm font-semibold font-mono tabular-nums text-rose-400 mt-0.5">
            -{overallStats.maxDrawdownR.toFixed(2)} R
          </p>
        </div>
        <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Max Win / Loss Streak</span>
          <p className="text-sm font-semibold font-mono tabular-nums text-slate-300 mt-0.5">
            {overallStats.maxWinStreak}W / {overallStats.maxLossStreak}L
          </p>
        </div>
      </div>
    </div>
  );
};
