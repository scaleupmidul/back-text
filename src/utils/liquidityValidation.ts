import type { MSP1Setup } from '../types/index.ts';

export interface ValidationStep {
  name: string;
  timeframe: string;
  status: 'completed' | 'failed' | 'pending';
  detail: string;
}

export interface H1SharpValidationResult {
  isValid: boolean;
  isRejectedDueToBOS: boolean;
  rejectionReason: string | null;
  pipelineStatus: 'VALID_SWEEP_REVERSAL' | 'REJECTED_BOS_CONTINUATION' | 'UNCLEAR_EVENT' | 'INCOMPLETE_SETUP' | 'NO_LIQUIDITY_EVENT';
  steps: ValidationStep[];
  confidenceScore: number; // 0 to 100
}

/**
 * Validates a trading setup against H1 SHARP V2 Liquidity Sweep criteria.
 * Enforces the core rule: Level Break ≠ Liquidity Sweep.
 */
export function validateH1SharpV2(setup: MSP1Setup): H1SharpValidationResult {
  const steps: ValidationStep[] = [];
  const dir = setup.direction;

  // Check if liquidity event was even logged
  const eventLogged = setup.liquidityEventOccurred !== undefined ? setup.liquidityEventOccurred : true;

  if (setup.liquidityEventOccurred === false) {
    return {
      isValid: false,
      isRejectedDueToBOS: false,
      rejectionReason: 'No previous key High/Low was taken. H1 SHARP V2 requires a key level liquidity sweep.',
      pipelineStatus: 'NO_LIQUIDITY_EVENT',
      steps: [
        {
          name: 'Liquidity Level',
          timeframe: 'M15',
          status: 'failed',
          detail: 'No previous High/Low was taken.',
        },
      ],
      confidenceScore: 0,
    };
  }

  // Critical distinction: If price broke the level with strong continuation (BOS), it is rejected as a reversal sweep!
  if (setup.liquidityEventOutcome === 'Break + Continuation (BOS)') {
    const bosDir = setup.bosDirection || (dir === 'BUY' ? 'Bullish' : 'Bearish');
    return {
      isValid: false,
      isRejectedDueToBOS: true,
      rejectionReason: `Rejected as Reversal Setup: Level break resulted in ${bosDir} BOS (Break + Continuation), NOT a liquidity sweep. Reversal trades are prohibited.`,
      pipelineStatus: 'REJECTED_BOS_CONTINUATION',
      steps: [
        {
          name: 'Event Distinction',
          timeframe: 'M15',
          status: 'failed',
          detail: `Level Break ≠ Sweep: Price continued in BOS direction (${bosDir}).`,
        },
        {
          name: 'Momentum Continuation',
          timeframe: 'M15 / H1',
          status: 'completed',
          detail: setup.bosPriceContinued ? 'Price continued with strong momentum.' : 'Structure broke without reversal.',
        },
        {
          name: 'Opposite MSS',
          timeframe: 'M15 / H1',
          status: setup.bosOppositeMss ? 'completed' : 'failed',
          detail: setup.bosOppositeMss ? 'Opposite MSS occurred late' : 'No opposite MSS occurred.',
        },
      ],
      confidenceScore: 10,
    };
  }

  if (setup.liquidityEventOutcome === 'Unclear') {
    return {
      isValid: false,
      isRejectedDueToBOS: false,
      rejectionReason: 'Unclear price action after level was taken. Do not trade ambiguous sweeps.',
      pipelineStatus: 'UNCLEAR_EVENT',
      steps: [
        {
          name: 'Level Reaction',
          timeframe: 'M15',
          status: 'failed',
          detail: 'Reaction after taking previous High/Low was unclear.',
        },
      ],
      confidenceScore: 20,
    };
  }

  // For BUY setup
  if (dir === 'BUY') {
    // 1. H1 Bullish Bias
    const h1BiasPass = setup.h1Bias === 'Bullish' || setup.d1Bias === 'Bullish';
    steps.push({
      name: 'H1 Bullish Bias',
      timeframe: 'H1',
      status: h1BiasPass ? 'completed' : 'failed',
      detail: h1BiasPass ? 'H1 Bias is Bullish' : `H1 Bias is ${setup.h1Bias || setup.d1Bias || 'Unclear'}`,
    });

    // 2. H1 Important Support/Demand
    const h1ZonePass =
      setup.h1KeyZoneType === 'Support' ||
      setup.h1KeyZoneType === 'Demand' ||
      setup.h4Zone === 'Demand';
    steps.push({
      name: 'H1 Support / Demand',
      timeframe: 'H1',
      status: h1ZonePass ? 'completed' : 'failed',
      detail: h1ZonePass
        ? 'Price tapped H1 Support/Demand zone'
        : 'Missing valid H1 Support or Demand zone',
    });

    // 3. M15 Previous Low Liquidity Sweep
    const levelTaken = setup.liquidityLevelTaken || 'Previous Low';
    const isLowSwept =
      levelTaken === 'Previous Low' ||
      levelTaken === 'Equal Lows' ||
      setup.sweepLiquidityType === 'Low';
    const isSweepOutcome =
      setup.liquidityEventOutcome === 'Sweep + Reversal' || !setup.liquidityEventOutcome;
    const sweepPass = isLowSwept && isSweepOutcome;
    steps.push({
      name: 'M15 Previous Low Sweep',
      timeframe: 'M15',
      status: sweepPass ? 'completed' : 'failed',
      detail: sweepPass
        ? `Swept ${levelTaken} liquidity below level`
        : `Expected Low Sweep, but found ${levelTaken || 'none'}`,
    });

    // 4. Reclaim / Rejection
    const reclaimPass =
      setup.sweepPriceReclaimed === true ||
      setup.sweepRejectionVisible === true ||
      setup.h4Reaction === 'Yes';
    steps.push({
      name: 'Reclaim / Rejection',
      timeframe: 'M15',
      status: reclaimPass ? 'completed' : 'failed',
      detail: reclaimPass
        ? 'Price quickly rejected and reclaimed swept level'
        : 'Failed to reclaim swept level cleanly',
    });

    // 5. Bullish MSS
    const mssPass =
      setup.sweepOppositeMss === true ||
      setup.h1MssDirection === 'Bullish MSS' ||
      setup.h1CandleCloseConfirmed === true;
    steps.push({
      name: 'Bullish MSS',
      timeframe: 'M15 / H1',
      status: mssPass ? 'completed' : 'failed',
      detail: mssPass
        ? 'Confirmed Bullish Market Structure Shift with candle body close'
        : 'Missing Bullish MSS confirmation',
    });

    // 6. Bullish Displacement
    const dispPass =
      setup.sweepStrongDisplacement === true ||
      setup.m15PriceActionTrigger === 'Bullish Engulfing' ||
      setup.m15PriceActionTrigger === 'Strong Bullish Rejection';
    steps.push({
      name: 'Bullish Displacement',
      timeframe: 'M15',
      status: dispPass ? 'completed' : 'failed',
      detail: dispPass
        ? 'Strong displacement printed after MSS'
        : 'Weak or lack of impulsive displacement',
    });

    // 7. M5 Pullback
    const pbPass =
      setup.m5Pullback === true ||
      setup.m15Pullback === true ||
      setup.m15PullbackType === 'Healthy pullback';
    steps.push({
      name: 'M5 Pullback',
      timeframe: 'M5 / M15',
      status: pbPass ? 'completed' : 'failed',
      detail: pbPass
        ? 'Controlled pullback into discount / order block'
        : 'No controlled pullback observed',
    });

    // 8. BUY
    steps.push({
      name: 'BUY Execution',
      timeframe: 'Execution',
      status: setup.result !== 'No Trade' && setup.result !== 'Invalid Setup' ? 'completed' : 'pending',
      detail: `Risk:Reward ${setup.plannedRR ? `${setup.plannedRR}R` : 'N/A'}, Target planned`,
    });

    const passedCount = steps.filter((s) => s.status === 'completed').length;
    const isValid = passedCount >= 6 && sweepPass && mssPass && reclaimPass;
    const confidenceScore = Math.round((passedCount / steps.length) * 100);

    return {
      isValid,
      isRejectedDueToBOS: false,
      rejectionReason: isValid ? null : 'Incomplete BUY setup chain. Level break or sweep requirements missing.',
      pipelineStatus: isValid ? 'VALID_SWEEP_REVERSAL' : 'INCOMPLETE_SETUP',
      steps,
      confidenceScore,
    };
  }

  // For SELL setup
  if (dir === 'SELL') {
    // 1. H1 Bearish Bias
    const h1BiasPass = setup.h1Bias === 'Bearish' || setup.d1Bias === 'Bearish';
    steps.push({
      name: 'H1 Bearish Bias',
      timeframe: 'H1',
      status: h1BiasPass ? 'completed' : 'failed',
      detail: h1BiasPass ? 'H1 Bias is Bearish' : `H1 Bias is ${setup.h1Bias || setup.d1Bias || 'Unclear'}`,
    });

    // 2. H1 Important Resistance/Supply
    const h1ZonePass =
      setup.h1KeyZoneType === 'Resistance' ||
      setup.h1KeyZoneType === 'Supply' ||
      setup.h4Zone === 'Supply';
    steps.push({
      name: 'H1 Resistance / Supply',
      timeframe: 'H1',
      status: h1ZonePass ? 'completed' : 'failed',
      detail: h1ZonePass
        ? 'Price tapped H1 Resistance/Supply zone'
        : 'Missing valid H1 Resistance or Supply zone',
    });

    // 3. M15 Previous High Liquidity Sweep
    const levelTaken = setup.liquidityLevelTaken || 'Previous High';
    const isHighSwept =
      levelTaken === 'Previous High' ||
      levelTaken === 'Equal Highs' ||
      setup.sweepLiquidityType === 'High';
    const isSweepOutcome =
      setup.liquidityEventOutcome === 'Sweep + Reversal' || !setup.liquidityEventOutcome;
    const sweepPass = isHighSwept && isSweepOutcome;
    steps.push({
      name: 'M15 Previous High Sweep',
      timeframe: 'M15',
      status: sweepPass ? 'completed' : 'failed',
      detail: sweepPass
        ? `Swept ${levelTaken} liquidity above level`
        : `Expected High Sweep, but found ${levelTaken || 'none'}`,
    });

    // 4. Rejection / Reclaim
    const reclaimPass =
      setup.sweepPriceReclaimed === true ||
      setup.sweepRejectionVisible === true ||
      setup.h4Reaction === 'Yes';
    steps.push({
      name: 'Rejection / Reclaim',
      timeframe: 'M15',
      status: reclaimPass ? 'completed' : 'failed',
      detail: reclaimPass
        ? 'Price rejected immediately and fell back below swept level'
        : 'Failed to show clear rejection or reclaim below level',
    });

    // 5. Bearish MSS
    const mssPass =
      setup.sweepOppositeMss === true ||
      setup.h1MssDirection === 'Bearish MSS' ||
      setup.h1CandleCloseConfirmed === true;
    steps.push({
      name: 'Bearish MSS',
      timeframe: 'M15 / H1',
      status: mssPass ? 'completed' : 'failed',
      detail: mssPass
        ? 'Confirmed Bearish Market Structure Shift with candle body close'
        : 'Missing Bearish MSS confirmation',
    });

    // 6. Bearish Displacement
    const dispPass =
      setup.sweepStrongDisplacement === true ||
      setup.m15PriceActionTrigger === 'Bearish Engulfing' ||
      setup.m15PriceActionTrigger === 'Strong Bearish Rejection';
    steps.push({
      name: 'Bearish Displacement',
      timeframe: 'M15',
      status: dispPass ? 'completed' : 'failed',
      detail: dispPass
        ? 'Strong bearish displacement printed after MSS'
        : 'Weak or lack of downward displacement',
    });

    // 7. M5 Pullback
    const pbPass =
      setup.m5Pullback === true ||
      setup.m15Pullback === true ||
      setup.m15PullbackType === 'Healthy pullback';
    steps.push({
      name: 'M5 Pullback',
      timeframe: 'M5 / M15',
      status: pbPass ? 'completed' : 'failed',
      detail: pbPass
        ? 'Controlled pullback into premium / supply'
        : 'No controlled pullback observed',
    });

    // 8. SELL
    steps.push({
      name: 'SELL Execution',
      timeframe: 'Execution',
      status: setup.result !== 'No Trade' && setup.result !== 'Invalid Setup' ? 'completed' : 'pending',
      detail: `Risk:Reward ${setup.plannedRR ? `${setup.plannedRR}R` : 'N/A'}, Target planned`,
    });

    const passedCount = steps.filter((s) => s.status === 'completed').length;
    const isValid = passedCount >= 6 && sweepPass && mssPass && reclaimPass;
    const confidenceScore = Math.round((passedCount / steps.length) * 100);

    return {
      isValid,
      isRejectedDueToBOS: false,
      rejectionReason: isValid ? null : 'Incomplete SELL setup chain. Level break or sweep requirements missing.',
      pipelineStatus: isValid ? 'VALID_SWEEP_REVERSAL' : 'INCOMPLETE_SETUP',
      steps,
      confidenceScore,
    };
  }

  // Direction: NO TRADE
  return {
    isValid: false,
    isRejectedDueToBOS: false,
    rejectionReason: 'Setup marked as No Trade.',
    pipelineStatus: 'INCOMPLETE_SETUP',
    steps: [],
    confidenceScore: 0,
  };
}

/**
 * Computes Liquidity Event Dashboard Statistics across an array of setups.
 */
export function computeLiquidityStatistics(setups: MSP1Setup[]) {
  // Total setups with a logged liquidity event (or inferred)
  const liquidityEvents = setups.filter((s) => s.liquidityEventOccurred !== false);

  const totalEvents = liquidityEvents.length;

  const sweepReversals = liquidityEvents.filter(
    (s) => s.liquidityEventOutcome === 'Sweep + Reversal' || (!s.liquidityEventOutcome && s.liquidityEventOccurred !== false && s.direction !== 'NO TRADE')
  );

  const bosContinuations = liquidityEvents.filter(
    (s) => s.liquidityEventOutcome === 'Break + Continuation (BOS)'
  );

  const unclearEvents = liquidityEvents.filter(
    (s) => s.liquidityEventOutcome === 'Unclear'
  );

  // Sweep -> MSS Success Rate: Sweeps where opposite MSS occurred
  const sweepsWithMSS = sweepReversals.filter(
    (s) => s.sweepOppositeMss === true || (s.h1MssDirection && s.h1MssDirection !== 'No MSS')
  );
  const sweepToMssSuccessRate =
    sweepReversals.length > 0 ? (sweepsWithMSS.length / sweepReversals.length) * 100 : null;

  // Sweep -> Displacement Success Rate: Sweeps where strong displacement occurred
  const sweepsWithDisplacement = sweepReversals.filter(
    (s) =>
      s.sweepStrongDisplacement === true ||
      s.m15PriceActionTrigger === 'Bullish Engulfing' ||
      s.m15PriceActionTrigger === 'Strong Bullish Rejection' ||
      s.m15PriceActionTrigger === 'Bearish Engulfing' ||
      s.m15PriceActionTrigger === 'Strong Bearish Rejection'
  );
  const sweepToDisplacementSuccessRate =
    sweepReversals.length > 0
      ? (sweepsWithDisplacement.length / sweepReversals.length) * 100
      : null;

  // Sweep Setup Win Rate
  const validSweepTrades = sweepReversals.filter(
    (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
  );
  const sweepWins = validSweepTrades.filter((s) => s.result === 'Win');
  const sweepLosses = validSweepTrades.filter((s) => s.result === 'Loss');
  const sweepDecisive = sweepWins.length + sweepLosses.length;
  const sweepWinRate = sweepDecisive > 0 ? (sweepWins.length / sweepDecisive) * 100 : null;
  const sweepTotalR = validSweepTrades.reduce((acc, s) => acc + (s.actualR || 0), 0);

  // BOS Setup Win Rate (if traded, or skipped trades)
  const validBosTrades = bosContinuations.filter(
    (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
  );
  const bosWins = validBosTrades.filter((s) => s.result === 'Win');
  const bosLosses = validBosTrades.filter((s) => s.result === 'Loss');
  const bosDecisive = bosWins.length + bosLosses.length;
  const bosWinRate = bosDecisive > 0 ? (bosWins.length / bosDecisive) * 100 : null;
  const bosTotalR = validBosTrades.reduce((acc, s) => acc + (s.actualR || 0), 0);

  // Potential Setups Rejected Because Event Was BOS Rather Than Liquidity Sweep
  // Includes setups where liquidityEventOutcome === 'Break + Continuation (BOS)'
  // and result was 'No Trade', 'Invalid Setup', or user refrained from trading reversal.
  const rejectedDueToBOSCount = bosContinuations.length;

  return {
    totalEvents,
    sweepReversalsCount: sweepReversals.length,
    sweepReversalsPct: totalEvents > 0 ? (sweepReversals.length / totalEvents) * 100 : 0,
    bosContinuationsCount: bosContinuations.length,
    bosContinuationsPct: totalEvents > 0 ? (bosContinuations.length / totalEvents) * 100 : 0,
    unclearEventsCount: unclearEvents.length,
    unclearEventsPct: totalEvents > 0 ? (unclearEvents.length / totalEvents) * 100 : 0,
    sweepToMssSuccessRate,
    sweepToDisplacementSuccessRate,
    sweepWinRate,
    sweepTotalR,
    validSweepTradesCount: validSweepTrades.length,
    bosWinRate,
    bosTotalR,
    validBosTradesCount: validBosTrades.length,
    rejectedDueToBOSCount,
  };
}
