import React, { useMemo } from 'react';
import type { MSP1Setup } from '../types/index.ts';
import {
  calculatePerformanceStats,
  getEffectiveStrategy,
} from '../utils/performanceCalculations.ts';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Compass,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  BarChart2,
} from 'lucide-react';

interface InsightsViewProps {
  setups: MSP1Setup[];
  onOpenTradeModal: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ setups, onOpenTradeModal }) => {
  // Compute overall and segmented performance
  const overallStats = useMemo(() => calculatePerformanceStats(setups), [setups]);
  const lseStats = useMemo(() => calculatePerformanceStats(setups, { strategy: 'LSE' }), [setups]);
  const dreStats = useMemo(() => calculatePerformanceStats(setups, { strategy: 'DRE' }), [setups]);

  // Executed resolved trades
  const resolved = useMemo(
    () =>
      setups.filter(
        (s) =>
          !s.isMissedSetup &&
          s.direction !== 'NO TRADE' &&
          ['Win', 'Loss', 'Breakeven'].includes(s.result)
      ),
    [setups]
  );

  // 1. Higher Expectancy
  const expectancyInsight = useMemo(() => {
    if (lseStats.totalTrades === 0 && dreStats.totalTrades === 0) {
      return { answer: 'Insufficient data', evidence: 'No executed trades in sample.', winner: 'NONE' };
    }
    if (lseStats.totalTrades === 0) {
      return { answer: 'DRE only (LSE has no recorded trades)', evidence: `DRE expectancy: ${dreStats.expectancy.toFixed(2)}R`, winner: 'DRE' };
    }
    if (dreStats.totalTrades === 0) {
      return { answer: 'LSE only (DRE has no recorded trades)', evidence: `LSE expectancy: ${lseStats.expectancy.toFixed(2)}R`, winner: 'LSE' };
    }
    const diff = Number((lseStats.expectancy - dreStats.expectancy).toFixed(2));
    if (Math.abs(diff) < 0.05) {
      return {
        answer: 'Both strategies have comparable expectancy in this sample',
        evidence: `LSE: ${lseStats.expectancy > 0 ? '+' : ''}${lseStats.expectancy.toFixed(2)}R (${lseStats.totalTrades} trades) vs DRE: ${dreStats.expectancy > 0 ? '+' : ''}${dreStats.expectancy.toFixed(2)}R (${dreStats.totalTrades} trades)`,
        winner: 'EQUAL',
      };
    }
    const winner = diff > 0 ? 'LSE' : 'DRE';
    return {
      answer: `${winner} generated higher average expectancy in this sample`,
      evidence: `LSE: ${lseStats.expectancy > 0 ? '+' : ''}${lseStats.expectancy.toFixed(2)}R/trade vs DRE: ${dreStats.expectancy > 0 ? '+' : ''}${dreStats.expectancy.toFixed(2)}R/trade (Delta: ${Math.abs(diff)}R)`,
      winner,
    };
  }, [lseStats, dreStats]);

  // 2. Lower Drawdown
  const drawdownInsight = useMemo(() => {
    if (lseStats.totalTrades === 0 || dreStats.totalTrades === 0) {
      return { answer: 'Insufficient sample', evidence: 'Need trades in both strategies to evaluate peak-to-trough drawdowns.', winner: 'NONE' };
    }
    const winner = lseStats.maxDrawdownR < dreStats.maxDrawdownR ? 'LSE' : dreStats.maxDrawdownR < lseStats.maxDrawdownR ? 'DRE' : 'EQUAL';
    return {
      answer: winner === 'EQUAL' ? 'Identical drawdown depths observed' : `${winner} experienced lower maximum drawdown in this sample`,
      evidence: `LSE max drawdown: -${lseStats.maxDrawdownR.toFixed(2)}R vs DRE max drawdown: -${dreStats.maxDrawdownR.toFixed(2)}R`,
      winner,
    };
  }, [lseStats, dreStats]);

  // 3. BUY vs SELL
  const directionInsight = useMemo(() => {
    const buyExp = overallStats.buyExpectancy;
    const sellExp = overallStats.sellExpectancy;
    const buyCount = overallStats.buyTrades;
    const sellCount = overallStats.sellTrades;

    if (buyCount === 0 && sellCount === 0) {
      return { answer: 'No trades recorded', evidence: 'Log trades to compare long vs short performance.', winner: 'NONE' };
    }
    if (buyCount === 0) return { answer: 'SELL trades only', evidence: `${sellCount} SELL trades recorded`, winner: 'SELL' };
    if (sellCount === 0) return { answer: 'BUY trades only', evidence: `${buyCount} BUY trades recorded`, winner: 'BUY' };

    const better = buyExp > sellExp ? 'BUY (Longs)' : sellExp > buyExp ? 'SELL (Shorts)' : 'EQUAL';
    return {
      answer: better === 'EQUAL' ? 'BUY and SELL showed equal performance' : `${better} performed better in this sample`,
      evidence: `BUY: ${buyExp > 0 ? '+' : ''}${buyExp.toFixed(2)}R/trade (${overallStats.buyWinRate.toFixed(1)}% WR over ${buyCount} trades) vs SELL: ${sellExp > 0 ? '+' : ''}${sellExp.toFixed(2)}R/trade (${overallStats.sellWinRate.toFixed(1)}% WR over ${sellCount} trades)`,
      winner: better.includes('BUY') ? 'BUY' : 'SELL',
    };
  }, [overallStats]);

  // 4. Session Performance
  const sessionInsight = useMemo(() => {
    const { london, newYork, other } = overallStats.sessions;
    const candidates = [
      { name: 'London Session', ...london },
      { name: 'New York Session', ...newYork },
    ].filter((s) => s.count > 0);

    if (candidates.length === 0) {
      return { answer: 'Insufficient session data', evidence: 'Record trades with session tags.', winner: 'NONE' };
    }

    candidates.sort((a, b) => b.expectancy - a.expectancy);
    const top = candidates[0];
    return {
      answer: `${top.name} performed better in this sample`,
      evidence: `${top.name}: ${top.expectancy > 0 ? '+' : ''}${top.expectancy.toFixed(2)}R avg (${top.winRate.toFixed(0)}% win rate across ${top.count} trades)`,
      winner: top.name,
    };
  }, [overallStats]);

  // 5. FVG Confirmation Effect
  const fvgInsight = useMemo(() => {
    const withFvg = resolved.filter((s) => s.fvgUsedAsConfirmation === true);
    const withoutFvg = resolved.filter((s) => s.fvgUsedAsConfirmation === false);

    const withCount = withFvg.length;
    const withoutCount = withoutFvg.length;

    if (withCount === 0 && withoutCount === 0) {
      return { answer: 'No FVG tagged trades', evidence: 'Tag FVG confirmation in entry modal.', winner: 'NONE' };
    }

    const withNetR = withFvg.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const withExp = withCount > 0 ? withNetR / withCount : 0;
    const withWins = withFvg.filter((s) => s.result === 'Win').length;
    const withWR = withCount > 0 ? (withWins / withCount) * 100 : 0;

    const withoutNetR = withoutFvg.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const withoutExp = withoutCount > 0 ? withoutNetR / withoutCount : 0;
    const withoutWins = withoutFvg.filter((s) => s.result === 'Win').length;
    const withoutWR = withoutCount > 0 ? (withoutWins / withoutCount) * 100 : 0;

    if (withoutCount === 0) {
      return {
        answer: 'FVG confirmation used in majority of sample trades',
        evidence: `FVG used in ${withCount} trades: ${withExp > 0 ? '+' : ''}${withExp.toFixed(2)}R average expectancy (${withWR.toFixed(0)}% WR). Zero trades logged without FVG.`,
        winner: 'WITH_FVG',
      };
    }

    const better = withExp > withoutExp ? 'With FVG Confirmation' : 'Without FVG Confirmation';
    return {
      answer: `${better} showed higher expectancy in this sample`,
      evidence: `With FVG: ${withExp.toFixed(2)}R avg (${withWR.toFixed(0)}% WR, n=${withCount}) vs Without FVG: ${withoutExp.toFixed(2)}R avg (${withoutWR.toFixed(0)}% WR, n=${withoutCount})`,
      winner: better.includes('With') ? 'WITH_FVG' : 'WITHOUT_FVG',
    };
  }, [resolved]);

  // 6. Sweep to MSS and Displacement Conversion Rate
  const sweepConversionInsight = useMemo(() => {
    const sweeps = setups.filter(
      (s) =>
        s.liquidityEventOutcome === 'Sweep + Reversal' ||
        s.sweepLiquidityType ||
        s.liquiditySweepConfirmed ||
        s.liquidityLevelTaken
    );

    const sweepsCount = sweeps.length;
    if (sweepsCount === 0) {
      return { answer: 'No sweep events recorded', evidence: 'Log liquidity sweep occurrences.', winner: 'NONE' };
    }

    const mssCount = sweeps.filter((s) => s.sweepOppositeMss === true || s.mssConfirmed === true).length;
    const mssPct = sweepsCount > 0 ? (mssCount / sweepsCount) * 100 : 0;

    const dispCount = sweeps.filter((s) => s.sweepStrongDisplacement === true || s.displacementConfirmed === true).length;
    const dispPct = sweepsCount > 0 ? (dispCount / sweepsCount) * 100 : 0;

    return {
      answer: `Sweeps generated MSS in ${mssPct.toFixed(0)}% of events and displacement in ${dispPct.toFixed(0)}% of events`,
      evidence: `Sample of ${sweepsCount} liquidity sweeps: ${mssCount} resulted in confirmed MSS and ${dispCount} produced impulse displacement.`,
      winner: 'METRIC',
    };
  }, [setups]);

  // 7. BOS Continuation vs Reversal
  const bosInsight = useMemo(() => {
    const bosEvents = setups.filter((s) => s.liquidityEventOutcome === 'Break + Continuation (BOS)');
    const totalBos = bosEvents.length;

    if (totalBos === 0) {
      return {
        answer: 'No Break + Continuation events recorded',
        evidence: 'Level breaks that continued without reversal were not logged in current sample.',
        winner: 'NONE',
      };
    }

    const continuedCount = bosEvents.filter((s) => s.bosPriceContinued !== false).length;
    const contPct = totalBos > 0 ? (continuedCount / totalBos) * 100 : 0;

    return {
      answer: `BOS events continued in ${contPct.toFixed(0)}% of observations rather than reversing`,
      evidence: `Sample of ${totalBos} BOS events: ${continuedCount} continued in the breakout direction, validating the core rule: Level Break ≠ Liquidity Sweep.`,
      winner: 'METRIC',
    };
  }, [setups]);

  // 8. Rule-Breaking Impact
  const ruleImpactInsight = useMemo(() => {
    const followedCount = overallStats.ruleFollowedCount;
    const violatedCount = overallStats.ruleViolatedCount;

    if (violatedCount === 0) {
      return {
        answer: '100% rule compliance maintained in recorded sample',
        evidence: `All ${followedCount} executed trades adhered strictly to fixed plan without mid-trade rule violations.`,
        winner: 'FOLLOWED',
      };
    }

    const followedExp = overallStats.ruleFollowedExpectancy;
    const violatedExp = overallStats.ruleViolatedExpectancy;
    const diff = Number((followedExp - violatedExp).toFixed(2));

    return {
      answer: followedExp > violatedExp
        ? 'Rule violations demonstrably reduced average trade expectancy'
        : 'Rule-following and rule-violating trades performed similarly in this small sample',
      evidence: `Rule Followed: ${followedExp > 0 ? '+' : ''}${followedExp.toFixed(2)}R avg (${followedCount} trades) vs Rule Broken: ${violatedExp > 0 ? '+' : ''}${violatedExp.toFixed(2)}R avg (${violatedCount} trades). Edge drag: ${diff > 0 ? `${diff}R per violation` : 'None in sample'}.`,
      winner: 'FOLLOWED',
    };
  }, [overallStats]);

  // 9. Period Consistency
  const periodConsistencyInsight = useMemo(() => {
    if (resolved.length < 6) {
      return { answer: 'Sample too small to assess period consistency', evidence: 'Need at least 15–20 trades across multiple weeks or months.', winner: 'NONE' };
    }

    // Group into 3 chronological blocks
    const third = Math.ceil(resolved.length / 3);
    const p1 = resolved.slice(0, third);
    const p2 = resolved.slice(third, third * 2);
    const p3 = resolved.slice(third * 2);

    const getExp = (list: MSP1Setup[]) => (list.length > 0 ? list.reduce((a, s) => a + (s.actualR || 0), 0) / list.length : 0);
    const exp1 = getExp(p1);
    const exp2 = getExp(p2);
    const exp3 = getExp(p3);

    const allPositive = exp1 > 0 && exp2 > 0 && exp3 > 0;
    return {
      answer: allPositive ? 'Performance remained positive across all 3 sample periods' : 'Performance exhibited variance across chronological phases',
      evidence: `Phase 1: ${exp1 > 0 ? '+' : ''}${exp1.toFixed(2)}R (n=${p1.length}) · Phase 2: ${exp2 > 0 ? '+' : ''}${exp2.toFixed(2)}R (n=${p2.length}) · Phase 3: ${exp3 > 0 ? '+' : ''}${exp3.toFixed(2)}R (n=${p3.length})`,
      winner: allPositive ? 'CONSISTENT' : 'VARIABLE',
    };
  }, [resolved]);

  const INSIGHT_CARDS = [
    {
      q: '1. Which strategy has higher expectancy?',
      ans: expectancyInsight.answer,
      evidence: expectancyInsight.evidence,
      badge: 'Expectancy',
    },
    {
      q: '2. Which strategy has lower drawdown?',
      ans: drawdownInsight.answer,
      evidence: drawdownInsight.evidence,
      badge: 'Drawdown Depth',
    },
    {
      q: '3. Is BUY or SELL performing better?',
      ans: directionInsight.answer,
      evidence: directionInsight.evidence,
      badge: 'Directional Bias',
    },
    {
      q: '4. Which session performs better?',
      ans: sessionInsight.answer,
      evidence: sessionInsight.evidence,
      badge: 'Trading Session',
    },
    {
      q: '5. Does FVG confirmation improve results?',
      ans: fvgInsight.answer,
      evidence: fvgInsight.evidence,
      badge: 'Fair Value Gap',
    },
    {
      q: '6. How often does a sweep lead to MSS and displacement?',
      ans: sweepConversionInsight.answer,
      evidence: sweepConversionInsight.evidence,
      badge: 'Sweep Conversion',
    },
    {
      q: '7. How often does BOS continue rather than reverse?',
      ans: bosInsight.answer,
      evidence: bosInsight.evidence,
      badge: 'BOS vs Sweep',
    },
    {
      q: '8. Are rule-breaking trades reducing performance?',
      ans: ruleImpactInsight.answer,
      evidence: ruleImpactInsight.evidence,
      badge: 'Discipline Drag',
    },
    {
      q: '9. Is performance consistent across different periods?',
      ans: periodConsistencyInsight.answer,
      evidence: periodConsistencyInsight.evidence,
      badge: 'Temporal Regime',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Backtest Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Empirical answers to core execution questions grounded strictly in recorded historical trades.
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

      {/* Disclaimers & Neutral Tone Card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Analytical Guidance & Epistemic Humility</span>
        </div>
        <p>
          All findings below describe how trades <em>performed in this specific backtest sample</em>. Findings should not be construed as guarantees of future market behavior or mechanical certainty. Avoid claiming causal relationships from small or observational sample sizes.
        </p>
      </div>

      {/* 9 Core Question Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INSIGHT_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-xl bg-[#0b101b] border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition-colors space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400/90 font-semibold uppercase tracking-wider">
                  {card.badge}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Insight 0{idx + 1}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-tight leading-snug">
                {card.q}
              </h3>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <p className="text-xs font-semibold text-white leading-relaxed">
                {card.ans}
              </p>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                {card.evidence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
