import type { MSP1Setup, TradingStrategy } from '../types/index.ts';

export interface PerformanceStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // wins / total resolved trades
  decisiveWinRate: number | null; // wins / (wins + losses)
  netR: number;
  expectancy: number; // average realized R per trade
  profitFactor: number | null; // null represents zero losses
  profitFactorDisplay: string;
  grossWinsR: number;
  grossLossesR: number;
  maxDrawdownR: number;
  avgWinR: number;
  avgLossR: number;
  avgRealizedRR: number;
  avgPlannedRR: number;
  currentStreak: { type: 'WIN' | 'LOSS' | 'BE' | 'NONE'; count: number };
  maxWinStreak: number;
  maxLossStreak: number;

  // Sub-breakdowns
  buyTrades: number;
  buyWinRate: number;
  buyNetR: number;
  buyExpectancy: number;

  sellTrades: number;
  sellWinRate: number;
  sellNetR: number;
  sellExpectancy: number;

  // Rule Discipline
  ruleFollowedCount: number;
  ruleFollowedWinRate: number;
  ruleFollowedNetR: number;
  ruleFollowedExpectancy: number;

  ruleViolatedCount: number;
  ruleViolatedWinRate: number;
  ruleViolatedNetR: number;
  ruleViolatedExpectancy: number;

  // Sessions
  sessions: {
    london: { count: number; winRate: number; netR: number; expectancy: number };
    newYork: { count: number; winRate: number; netR: number; expectancy: number };
    other: { count: number; winRate: number; netR: number; expectancy: number };
  };

  // Cumulative data for charting
  equityCurve: EquityCurvePoint[];
}

export interface EquityCurvePoint {
  index: number;
  tradeId: string;
  date: string;
  strategy: TradingStrategy;
  direction: 'BUY' | 'SELL';
  result: 'Win' | 'Loss' | 'Breakeven';
  actualR: number;
  cumulativeR: number;
  peakR: number;
  drawdownR: number;
  notes?: string;
}

export interface FilterOptions {
  strategy?: 'ALL' | 'LSE' | 'DRE';
  dateStart?: string;
  dateEnd?: string;
  direction?: 'ALL' | 'BUY' | 'SELL';
  session?: 'ALL' | 'London' | 'New York' | 'Other';
}

/**
 * Accurately determines the effective strategy for a setup.
 * Backward-compatible with historical records.
 */
export function getEffectiveStrategy(setup: MSP1Setup): TradingStrategy {
  if (setup.strategy) {
    return setup.strategy;
  }
  // Infer based on logged confirmation or zone
  if (
    setup.liquidityEventOutcome === 'Sweep + Reversal' ||
    setup.sweepLiquidityType ||
    setup.liquiditySweepConfirmed ||
    setup.liquidityLevelTaken
  ) {
    return 'LSE';
  }
  if (
    setup.h4Zone === 'Demand' ||
    setup.h4Zone === 'Supply' ||
    setup.importantLevel === 'Demand' ||
    setup.importantLevel === 'Supply'
  ) {
    return 'DRE';
  }
  return 'LSE';
}

/**
 * Filter setups based on criteria
 */
export function filterSetups(
  setups: MSP1Setup[],
  filters: FilterOptions = {}
): MSP1Setup[] {
  return setups.filter((s) => {
    // Exclude missed setups from performance calculations
    if (s.isMissedSetup) return false;

    // Filter by strategy
    if (filters.strategy && filters.strategy !== 'ALL') {
      const strat = getEffectiveStrategy(s);
      if (strat !== filters.strategy) return false;
    }

    // Filter by direction
    if (filters.direction && filters.direction !== 'ALL') {
      if (s.direction !== filters.direction) return false;
    }

    // Filter by session
    if (filters.session && filters.session !== 'ALL') {
      if (filters.session === 'London') {
        if (!s.session.includes('London')) return false;
      } else if (filters.session === 'New York') {
        if (!s.session.includes('New York')) return false;
      } else if (filters.session === 'Other') {
        if (s.session.includes('London') || s.session.includes('New York')) return false;
      }
    }

    // Filter by date range
    if (filters.dateStart && s.date < filters.dateStart) {
      return false;
    }
    if (filters.dateEnd && s.date > filters.dateEnd) {
      return false;
    }

    return true;
  });
}

/**
 * Computes strictly verified, professional trading statistics.
 * Handles zero losses, breakeven trade definitions, peak-to-trough drawdowns,
 * and rule following discipline.
 */
export function calculatePerformanceStats(
  setups: MSP1Setup[],
  filters: FilterOptions = {}
): PerformanceStats {
  const filtered = filterSetups(setups, filters);

  // Sort chronologically (oldest to newest) for cumulative equity and drawdown math
  const chronological = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.setupId.localeCompare(b.setupId)
  );

  // Only count resolved trades (Win, Loss, Breakeven) where trade was actually executed
  const resolved = chronological.filter(
    (s) =>
      s.direction !== 'NO TRADE' &&
      ['Win', 'Loss', 'Breakeven'].includes(s.result) &&
      !s.isMissedSetup
  );

  const totalTrades = resolved.length;
  const wins = resolved.filter((s) => s.result === 'Win');
  const losses = resolved.filter((s) => s.result === 'Loss');
  const breakevens = resolved.filter((s) => s.result === 'Breakeven');

  const winningTrades = wins.length;
  const losingTrades = losses.length;
  const breakevenTrades = breakevens.length;

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const decisiveTotal = winningTrades + losingTrades;
  const decisiveWinRate = decisiveTotal > 0 ? (winningTrades / decisiveTotal) * 100 : null;

  // Net R
  const netR = resolved.reduce((acc, s) => acc + (s.actualR || 0), 0);
  const expectancy = totalTrades > 0 ? netR / totalTrades : 0;

  // Gross Profit & Gross Loss for Profit Factor
  let grossWinsR = 0;
  let grossLossesR = 0;

  resolved.forEach((s) => {
    const r = s.actualR || 0;
    if (r > 0) {
      grossWinsR += r;
    } else if (r < 0) {
      grossLossesR += Math.abs(r);
    }
  });

  let profitFactor: number | null = null;
  let profitFactorDisplay = '0.00';

  if (grossLossesR === 0) {
    if (grossWinsR > 0) {
      profitFactor = null;
      profitFactorDisplay = 'N/A — no losing trades in sample';
    } else {
      profitFactor = 0;
      profitFactorDisplay = '0.00';
    }
  } else {
    profitFactor = grossWinsR / grossLossesR;
    profitFactorDisplay = profitFactor.toFixed(2);
  }

  // Average Win and Loss in R
  const avgWinR = winningTrades > 0 ? grossWinsR / winningTrades : 0;
  const avgLossR = losingTrades > 0 ? grossLossesR / losingTrades : 0;

  // Realized RR and Planned RR
  const plannedRRs = resolved
    .map((s) => s.plannedRR)
    .filter((rr): rr is number => typeof rr === 'number' && !isNaN(rr) && rr > 0);
  const avgPlannedRR = plannedRRs.length > 0 ? plannedRRs.reduce((a, b) => a + b, 0) / plannedRRs.length : 0;
  const avgRealizedRR = winningTrades > 0 ? avgWinR : 0;

  // Equity Curve, Peak Equity, Drawdown calculation
  let runningR = 0;
  let peakR = 0;
  let maxDrawdownR = 0;
  const equityCurve: EquityCurvePoint[] = [];

  resolved.forEach((s, idx) => {
    const r = s.actualR || 0;
    runningR = Number((runningR + r).toFixed(2));
    if (runningR > peakR) {
      peakR = runningR;
    }
    const currentDrawdown = Number((peakR - runningR).toFixed(2));
    if (currentDrawdown > maxDrawdownR) {
      maxDrawdownR = currentDrawdown;
    }

    equityCurve.push({
      index: idx + 1,
      tradeId: s.setupId,
      date: s.date,
      strategy: getEffectiveStrategy(s),
      direction: s.direction === 'SELL' ? 'SELL' : 'BUY',
      result: s.result as 'Win' | 'Loss' | 'Breakeven',
      actualR: r,
      cumulativeR: runningR,
      peakR,
      drawdownR: currentDrawdown,
      notes: s.notes,
    });
  });

  // Streaks
  let currentStreak: { type: 'WIN' | 'LOSS' | 'BE' | 'NONE'; count: number } = { type: 'NONE', count: 0 };
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let tempWin = 0;
  let tempLoss = 0;

  resolved.forEach((s) => {
    if (s.result === 'Win') {
      tempWin++;
      tempLoss = 0;
      if (tempWin > maxWinStreak) maxWinStreak = tempWin;
    } else if (s.result === 'Loss') {
      tempLoss++;
      tempWin = 0;
      if (tempLoss > maxLossStreak) maxLossStreak = tempLoss;
    } else {
      tempWin = 0;
      tempLoss = 0;
    }
  });

  if (resolved.length > 0) {
    const lastResult = resolved[resolved.length - 1].result;
    if (lastResult === 'Win') {
      let count = 0;
      for (let i = resolved.length - 1; i >= 0; i--) {
        if (resolved[i].result === 'Win') count++;
        else break;
      }
      currentStreak = { type: 'WIN', count };
    } else if (lastResult === 'Loss') {
      let count = 0;
      for (let i = resolved.length - 1; i >= 0; i--) {
        if (resolved[i].result === 'Loss') count++;
        else break;
      }
      currentStreak = { type: 'LOSS', count };
    } else {
      let count = 0;
      for (let i = resolved.length - 1; i >= 0; i--) {
        if (resolved[i].result === 'Breakeven') count++;
        else break;
      }
      currentStreak = { type: 'BE', count };
    }
  }

  // Directional Breakdown
  const buyTradesList = resolved.filter((s) => s.direction === 'BUY');
  const buyTrades = buyTradesList.length;
  const buyWins = buyTradesList.filter((s) => s.result === 'Win').length;
  const buyWinRate = buyTrades > 0 ? (buyWins / buyTrades) * 100 : 0;
  const buyNetR = buyTradesList.reduce((acc, s) => acc + (s.actualR || 0), 0);
  const buyExpectancy = buyTrades > 0 ? buyNetR / buyTrades : 0;

  const sellTradesList = resolved.filter((s) => s.direction === 'SELL');
  const sellTrades = sellTradesList.length;
  const sellWins = sellTradesList.filter((s) => s.result === 'Win').length;
  const sellWinRate = sellTrades > 0 ? (sellWins / sellTrades) * 100 : 0;
  const sellNetR = sellTradesList.reduce((acc, s) => acc + (s.actualR || 0), 0);
  const sellExpectancy = sellTrades > 0 ? sellNetR / sellTrades : 0;

  // Rule Discipline
  const ruleFollowedList = resolved.filter((s) => s.ruleFollowed !== false);
  const ruleFollowedCount = ruleFollowedList.length;
  const ruleFollowedWins = ruleFollowedList.filter((s) => s.result === 'Win').length;
  const ruleFollowedWinRate = ruleFollowedCount > 0 ? (ruleFollowedWins / ruleFollowedCount) * 100 : 0;
  const ruleFollowedNetR = ruleFollowedList.reduce((acc, s) => acc + (s.actualR || 0), 0);
  const ruleFollowedExpectancy = ruleFollowedCount > 0 ? ruleFollowedNetR / ruleFollowedCount : 0;

  const ruleViolatedList = resolved.filter((s) => s.ruleFollowed === false);
  const ruleViolatedCount = ruleViolatedList.length;
  const ruleViolatedWins = ruleViolatedList.filter((s) => s.result === 'Win').length;
  const ruleViolatedWinRate = ruleViolatedCount > 0 ? (ruleViolatedWins / ruleViolatedCount) * 100 : 0;
  const ruleViolatedNetR = ruleViolatedList.reduce((acc, s) => acc + (s.actualR || 0), 0);
  const ruleViolatedExpectancy = ruleViolatedCount > 0 ? ruleViolatedNetR / ruleViolatedCount : 0;

  // Session Breakdown
  const calcSessionStats = (matchFn: (s: MSP1Setup) => boolean) => {
    const list = resolved.filter(matchFn);
    const count = list.length;
    const winsCount = list.filter((s) => s.result === 'Win').length;
    const sWinRate = count > 0 ? (winsCount / count) * 100 : 0;
    const sNetR = list.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const sExp = count > 0 ? sNetR / count : 0;
    return { count, winRate: sWinRate, netR: sNetR, expectancy: sExp };
  };

  const sessions = {
    london: calcSessionStats((s) => s.session.includes('London')),
    newYork: calcSessionStats((s) => s.session.includes('New York')),
    other: calcSessionStats((s) => !s.session.includes('London') && !s.session.includes('New York')),
  };

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate,
    decisiveWinRate,
    netR,
    expectancy,
    profitFactor,
    profitFactorDisplay,
    grossWinsR,
    grossLossesR,
    maxDrawdownR,
    avgWinR,
    avgLossR,
    avgRealizedRR,
    avgPlannedRR,
    currentStreak,
    maxWinStreak,
    maxLossStreak,
    buyTrades,
    buyWinRate,
    buyNetR,
    buyExpectancy,
    sellTrades,
    sellWinRate,
    sellNetR,
    sellExpectancy,
    ruleFollowedCount,
    ruleFollowedWinRate,
    ruleFollowedNetR,
    ruleFollowedExpectancy,
    ruleViolatedCount,
    ruleViolatedWinRate,
    ruleViolatedNetR,
    ruleViolatedExpectancy,
    sessions,
    equityCurve,
  };
}

/**
 * Milestone progress calculations for 25, 50, 100, 150, 200, 250 trades
 */
export const SAMPLE_MILESTONES = [25, 50, 100, 150, 200, 250];

export function getSampleMilestones(totalTrades: number) {
  return SAMPLE_MILESTONES.map((target) => {
    const progress = Math.min(100, Math.round((totalTrades / target) * 100));
    const reached = totalTrades >= target;
    return {
      target,
      progress,
      reached,
      remaining: Math.max(0, target - totalTrades),
    };
  });
}
