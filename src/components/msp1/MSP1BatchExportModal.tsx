import React, { useState, useMemo } from 'react';
import type { MSP1Setup } from '../../types/index.ts';
import {
  X,
  Download,
  Copy,
  Check,
  Bot,
} from 'lucide-react';

interface MSP1BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  setups: MSP1Setup[];
}

type SplitMode = 'PARTS' | 'BATCH_SIZE';

export const MSP1BatchExportModal: React.FC<MSP1BatchExportModalProps> = ({
  isOpen,
  onClose,
  setups,
}) => {
  const [splitMode, setSplitMode] = useState<SplitMode>('PARTS');
  const [numParts, setNumParts] = useState<number>(3);
  const [batchSize, setBatchSize] = useState<number>(100);
  const [copiedPart, setCopiedPart] = useState<number | null>(null);
  const [downloadingPart, setDownloadingPart] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);

  // Chronologically sorted setups
  const sortedSetups = useMemo(() => {
    return [...setups].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [setups]);

  const totalSetups = sortedSetups.length;

  // Calculate chunks / parts
  const parts = useMemo(() => {
    if (totalSetups === 0) return [];

    let actualPartsCount = 1;
    if (splitMode === 'PARTS') {
      actualPartsCount = Math.max(1, Math.min(numParts, totalSetups));
    } else {
      actualPartsCount = Math.max(1, Math.ceil(totalSetups / Math.max(1, batchSize)));
    }

    const chunks: {
      partNumber: number;
      totalParts: number;
      setups: MSP1Setup[];
      startIdx: number;
      endIdx: number;
      firstSetupId: string;
      lastSetupId: string;
      validTrades: number;
      wins: number;
      losses: number;
      netR: number;
    }[] = [];

    const baseChunkSize = Math.floor(totalSetups / actualPartsCount);
    let remainder = totalSetups % actualPartsCount;
    let currentIdx = 0;

    for (let i = 0; i < actualPartsCount; i++) {
      const chunkSize = baseChunkSize + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      const chunkSetups = sortedSetups.slice(currentIdx, currentIdx + chunkSize);
      if (chunkSetups.length === 0) break;

      const valid = chunkSetups.filter(
        (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
      );
      const wins = valid.filter((s) => s.result === 'Win').length;
      const losses = valid.filter((s) => s.result === 'Loss').length;
      const netR = valid.reduce((acc, s) => acc + (s.actualR || 0), 0);

      chunks.push({
        partNumber: i + 1,
        totalParts: actualPartsCount,
        setups: chunkSetups,
        startIdx: currentIdx + 1,
        endIdx: currentIdx + chunkSetups.length,
        firstSetupId: chunkSetups[0]?.setupId || `#${currentIdx + 1}`,
        lastSetupId:
          chunkSetups[chunkSetups.length - 1]?.setupId ||
          `#${currentIdx + chunkSetups.length}`,
        validTrades: valid.length,
        wins,
        losses,
        netR: Number(netR.toFixed(2)),
      });

      currentIdx += chunkSize;
    }

    return chunks;
  }, [sortedSetups, totalSetups, splitMode, numParts, batchSize]);

  if (!isOpen) return null;

  const getPartPrompt = (part: (typeof parts)[0]) => {
    if (part.totalParts === 1) {
      return `Hello ChatGPT! This is my complete MSP-1 Gold (XAU/USD) Systematic Trade Journal (${part.firstSetupId} to ${part.lastSetupId}, ${part.setups.length} setups with chart screenshots).

Execution Framework:
- D1 Bias & Structure → 4H Key Zone → 1H Market Structure Shift (Candle Close Confirmed) → 15M Trigger.

Each setup includes the 15 Core Journal Parameters and chart screenshots:
1. D1 Bias (Bullish / Bearish / Neutral) + D1 chart image
2. 4H Zone (Demand / Supply / None) + 4H chart image
3. 1H MSS (Bullish / Bearish MSS with 1H candle body close confirmation) + 1H chart image
4. 15M Pullback (Healthy pullback / Weak pullback / No pullback) + 15M chart image
5. 15M Trigger (Clear rejection, engulfing, pinbar)
6. Entry
7. SL (Structural stop loss)
8. TP
9. RR (Planned risk-to-reward ratio)
10. Nearest Opposing Zone (Must have clear pathway to 2R)
11. MFE (Maximum Favorable Excursion in R: +0.5R, +1.0R, +1.5R, +2.0R...)
12. Result (Win / Loss / Breakeven / No Trade)
13. Result in R (+2R, -1R, 0R)
14. Rule Followed? (Fixed rules maintained vs. moving SL/TP mid-trade)
15. Loss Reason (Wrong D1 bias, Wrong 4H zone, False MSS, Weak pullback, False 15M trigger, Opposing zone, SL too tight, Normal loss, Other)

Please audit:
1. Statistical breakdown: Win rate, overall R expectancy, profit factor, and rule adherence rate.
2. 15M Pullback edge: Compare performance of trades entered on "Healthy pullback" vs "Weak pullback". Does pullback depth significantly impact expectancy?
3. 1H Candle Close hypothesis: Does waiting for a completed 1H candle close yield superior expectancy over wick-only entries?
4. Strategy breakdown: For losing trades, examine the "Loss Reason" categories. Are losses normal market variance, or due to false MSS, opposing zones, weak pullbacks, or discipline violations?
5. Trade management: Review MFE to see if trades frequently reached +1R or +1.5R before reversing.
6. Visual Chart Screenshots: Inspect the attached screenshots under \`chart_screenshots\` (D1, 4H, 1H, 15M) for execution precision.`;
    }

    return `Hello ChatGPT! This is Part ${part.partNumber} of ${part.totalParts} of my MSP-1 Gold (XAU/USD) Trade Journal (${part.firstSetupId} to ${part.lastSetupId}, ${part.setups.length} setups).

Execution Framework:
- D1 Bias & Structure → 4H Key Zone → 1H Market Structure Shift (Candle Close Confirmed) → 15M Trigger.

Each setup includes the 15 Core Journal Parameters and chart screenshots:
1. D1 Bias (Bullish / Bearish / Neutral) + D1 chart image
2. 4H Zone (Demand / Supply / None) + 4H chart image
3. 1H MSS (Bullish / Bearish MSS with 1H candle body close confirmation) + 1H chart image
4. 15M Pullback (Healthy pullback / Weak pullback / No pullback) + 15M chart image
5. 15M Trigger (Clear rejection, engulfing, pinbar)
6. Entry
7. SL (Structural stop loss)
8. TP
9. RR (Planned risk-to-reward ratio)
10. Nearest Opposing Zone (Must have clear pathway to 2R)
11. MFE (Maximum Favorable Excursion in R: +0.5R, +1.0R, +1.5R, +2.0R...)
12. Result (Win / Loss / Breakeven / No Trade)
13. Result in R (+2R, -1R, 0R)
14. Rule Followed? (Fixed rules maintained vs. moving SL/TP mid-trade)
15. Loss Reason (Wrong D1 bias, Wrong 4H zone, False MSS, Weak pullback, False 15M trigger, Opposing zone, SL too tight, Normal loss, Other)

Please audit:
1. Statistical breakdown: Win rate, overall R expectancy, and rule adherence rate.
2. Pullback edge: Compare performance of trades entered on "Healthy pullback" vs "Weak pullback".
3. Strategy breakdown: For losing trades, examine the "Loss Reason" categories. Are losses normal market variance, or due to false MSS, opposing zones, weak pullbacks, or discipline violations?
4. Trade management: Review MFE to see if trades frequently reached +1R or +1.5R before reversing.
5. Visual Chart Analysis: Each setup includes attached chart screenshots under \`chart_screenshots\` (D1, 4H, 1H, 15M).
${
  part.partNumber < part.totalParts
    ? `6. Store this part's data in context. I will upload Part ${part.partNumber + 1} next. Wait for all ${part.totalParts} parts before providing the complete system verdict.`
    : `6. This is the final part (${part.totalParts} of ${part.totalParts}). Please analyze all accumulated parts to deliver a comprehensive statistical edge review of the MSP-1 system.`
}`;
  };

  const generatePartJSON = (part: (typeof parts)[0]) => {
    const promptText = getPartPrompt(part);

    const validTrades = part.setups.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const wins = validTrades.filter((s) => s.result === 'Win');
    const losses = validTrades.filter((s) => s.result === 'Loss');
    const breakevens = validTrades.filter((s) => s.result === 'Breakeven');
    const noTrades = part.setups.filter(
      (s) => s.direction === 'NO TRADE' || ['No Trade', 'Incomplete Setup', 'Invalid Setup'].includes(s.result)
    );
    const decisiveTradesCount = wins.length + losses.length;
    const winRate = decisiveTradesCount > 0 ? (wins.length / decisiveTradesCount) * 100 : null;
    const totalR = part.setups.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const expectancy = validTrades.length > 0 ? totalR / validTrades.length : null;

    const healthyPbTrades = part.setups.filter(
      (s) => (s.m15PullbackType === 'Healthy pullback') || (!s.m15PullbackType && s.m15Pullback === true)
    );
    const weakPbTrades = part.setups.filter((s) => s.m15PullbackType === 'Weak pullback');
    const noPbTrades = part.setups.filter(
      (s) => s.m15PullbackType === 'No pullback' || (!s.m15PullbackType && s.m15Pullback === false)
    );

    const healthyValid = healthyPbTrades.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const healthyWins = healthyValid.filter((s) => s.result === 'Win');
    const healthyLosses = healthyValid.filter((s) => s.result === 'Loss');
    const healthyDecisive = healthyWins.length + healthyLosses.length;
    const healthyWinRate = healthyDecisive > 0 ? (healthyWins.length / healthyDecisive) * 100 : null;
    const healthyTotalR = healthyPbTrades.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const healthyExp = healthyValid.length > 0 ? healthyTotalR / healthyValid.length : null;

    const weakValid = weakPbTrades.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const weakWins = weakValid.filter((s) => s.result === 'Win');
    const weakLosses = weakValid.filter((s) => s.result === 'Loss');
    const weakDecisive = weakWins.length + weakLosses.length;
    const weakWinRate = weakDecisive > 0 ? (weakWins.length / weakDecisive) * 100 : null;
    const weakTotalR = weakPbTrades.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const weakExp = weakValid.length > 0 ? weakTotalR / weakValid.length : null;

    // Dedicated Liquidity Event Analysis (H1 SHARP V2 Validation: Level Break ≠ Liquidity Sweep)
    const liquidityEvents = part.setups.filter(
      (s) => Boolean(s.liquidityLevelTaken) || Boolean(s.liquidityOutcome || s.liquidityEventOutcome)
    );
    const sweepEvents = liquidityEvents.filter(
      (s) => (s.liquidityEventOutcome || s.liquidityOutcome) === 'Sweep + Reversal' || (!s.liquidityEventOutcome && !s.liquidityOutcome && Boolean(s.liquidityLevelTaken))
    );
    const bosEvents = liquidityEvents.filter(
      (s) => (s.liquidityEventOutcome || s.liquidityOutcome) === 'Break + Continuation (BOS)'
    );
    const unclearEvents = liquidityEvents.filter(
      (s) => (s.liquidityEventOutcome || s.liquidityOutcome) === 'Unclear'
    );

    const sweepWithMss = sweepEvents.filter((s) => s.liquidityOppositeMss !== false && s.sweepOppositeMss !== false).length;
    const sweepToMssSuccessRate =
      sweepEvents.length > 0 ? (sweepWithMss / sweepEvents.length) * 100 : null;

    const sweepWithDisplacement = sweepEvents.filter((s) => s.liquidityDisplacement !== false && s.sweepStrongDisplacement !== false).length;
    const sweepToDisplacementSuccessRate =
      sweepEvents.length > 0 ? (sweepWithDisplacement / sweepEvents.length) * 100 : null;

    const sweepValid = sweepEvents.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const sweepWins = sweepValid.filter((s) => s.result === 'Win');
    const sweepLosses = sweepValid.filter((s) => s.result === 'Loss');
    const sweepDecisive = sweepWins.length + sweepLosses.length;
    const sweepWinRate = sweepDecisive > 0 ? (sweepWins.length / sweepDecisive) * 100 : null;
    const sweepTotalR = sweepValid.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const sweepExp = sweepValid.length > 0 ? sweepTotalR / sweepValid.length : null;

    const bosValid = bosEvents.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const bosWins = bosValid.filter((s) => s.result === 'Win');
    const bosLosses = bosValid.filter((s) => s.result === 'Loss');
    const bosDecisive = bosWins.length + bosLosses.length;
    const bosWinRate = bosDecisive > 0 ? (bosWins.length / bosDecisive) * 100 : null;
    const bosTotalR = bosValid.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const bosExp = bosValid.length > 0 ? bosTotalR / bosValid.length : null;

    const rejectedDueToBOS = bosEvents.filter(
      (s) =>
        s.result === 'No Trade' ||
        s.result === 'Invalid Setup' ||
        s.direction === 'NO TRADE' ||
        s.bosPriceContinued === true
    ).length;

    const totalImagesCount = part.setups.reduce((acc, s) => {
      const imgs = [
        s.d1Screenshot || s.screenshots?.d1,
        s.h4Screenshot || s.screenshots?.h4,
        s.h1Screenshot || s.screenshots?.h1,
        s.m15Screenshot || s.screenshots?.m15,
        ...(s.screenshots?.other || []),
      ].filter(Boolean);
      return acc + imgs.length;
    }, 0);

    return {
      system: 'MSP-1',
      framework: 'Market Structure → Key Zone → Liquidity Sweep / BOS → Shift & Close → Trigger',
      system_edition: 'H1 SHARP V2',
      asset_market: 'Gold (XAU/USD)',
      version: 'MSP-1.0',
      part_metadata: {
        part_number: part.partNumber,
        total_parts: part.totalParts,
        is_complete_single_file: part.totalParts === 1,
        setups_in_this_part: part.setups.length,
        total_setups_in_journal: totalSetups,
        id_range: `${part.firstSetupId} - ${part.lastSetupId}`,
        total_chart_screenshots_in_part: totalImagesCount,
        exported_at: new Date().toISOString(),
      },
      chatgpt_system_prompt: promptText,
      system_rules_summary: {
        step_1_d1_market_structure: 'Trade strictly in alignment with Daily market structure (HH/HL for Bullish, LL/LH for Bearish). If unclear: No Trade.',
        step_2_4h_key_zone: 'Price must retrace into a valid 4H Demand or Supply zone and show rejection reaction.',
        step_3_1h_mss_confirmation: '1H must create a Market Structure Shift (MSS) breaking previous swing point AND a completed 1H candle body must CLOSE beyond the swing level. Wick-only breaks are invalid.',
        step_4_liquidity_event_rule: 'LEVEL BREAK ≠ LIQUIDITY SWEEP. When previous High/Low is taken, distinguish: Sweep + Reversal (requires Rejection, Reclaim, Opposite MSS, Displacement) vs Break + Continuation BOS. A break followed by continuation is BOS and rejects reversal entries.',
        step_5_15m_entry_trigger: 'After 1H MSS and Liquidity Sweep confirmation, price must perform a pullback into support/resistance and print a clean 15M price action trigger (Rejection, Pin bar, Engulfing).',
        risk_management: 'Fixed 1R risk per trade. Minimum planned Risk:Reward of 1:2.00. No opposing 4H/1H zones before 2R target.',
      },
      part_statistics: {
        total_situations: part.setups.length,
        executed_trades_count: validTrades.length,
        wins_count: wins.length,
        losses_count: losses.length,
        breakevens_count: breakevens.length,
        no_trades_count: noTrades.length,
        win_rate_percentage: winRate !== null ? Number(winRate.toFixed(1)) : null,
        win_rate_display: winRate !== null ? `${winRate.toFixed(1)}%` : 'N/A',
        total_net_r: Number(totalR.toFixed(2)),
        total_net_r_display: `${totalR > 0 ? '+' : ''}${totalR.toFixed(2)} R`,
        expectancy_r_per_trade: expectancy !== null ? Number(expectancy.toFixed(2)) : null,
        expectancy_display: expectancy !== null ? `${expectancy > 0 ? '+' : ''}${expectancy.toFixed(2)} R` : 'N/A',
        total_screenshots_attached: totalImagesCount,
        liquidity_event_analysis: {
          total_liquidity_events: liquidityEvents.length,
          sweep_plus_reversal: {
            count: sweepEvents.length,
            percentage_of_events: liquidityEvents.length > 0 ? Number(((sweepEvents.length / liquidityEvents.length) * 100).toFixed(1)) : 0,
            sweep_to_mss_success_rate: sweepToMssSuccessRate !== null ? Number(sweepToMssSuccessRate.toFixed(1)) : null,
            sweep_to_mss_display: sweepToMssSuccessRate !== null ? `${sweepToMssSuccessRate.toFixed(1)}%` : 'N/A',
            sweep_to_displacement_success_rate: sweepToDisplacementSuccessRate !== null ? Number(sweepToDisplacementSuccessRate.toFixed(1)) : null,
            sweep_to_displacement_display: sweepToDisplacementSuccessRate !== null ? `${sweepToDisplacementSuccessRate.toFixed(1)}%` : 'N/A',
            valid_trades: sweepValid.length,
            wins: sweepWins.length,
            losses: sweepLosses.length,
            win_rate_percentage: sweepWinRate !== null ? Number(sweepWinRate.toFixed(1)) : null,
            win_rate_display: sweepWinRate !== null ? `${sweepWinRate.toFixed(1)}%` : 'N/A',
            net_r: Number(sweepTotalR.toFixed(2)),
            net_r_display: `${sweepTotalR > 0 ? '+' : ''}${sweepTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: sweepExp !== null ? Number(sweepExp.toFixed(2)) : null,
            expectancy_display: sweepExp !== null ? `${sweepExp > 0 ? '+' : ''}${sweepExp.toFixed(2)} R` : 'N/A',
          },
          break_plus_continuation_bos: {
            count: bosEvents.length,
            percentage_of_events: liquidityEvents.length > 0 ? Number(((bosEvents.length / liquidityEvents.length) * 100).toFixed(1)) : 0,
            valid_trades: bosValid.length,
            wins: bosWins.length,
            losses: bosLosses.length,
            win_rate_percentage: bosWinRate !== null ? Number(bosWinRate.toFixed(1)) : null,
            win_rate_display: bosWinRate !== null ? `${bosWinRate.toFixed(1)}%` : 'Filtered (0 Trades)',
            net_r: Number(bosTotalR.toFixed(2)),
            net_r_display: `${bosTotalR > 0 ? '+' : ''}${bosTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: bosExp !== null ? Number(bosExp.toFixed(2)) : null,
            expectancy_display: bosExp !== null ? `${bosExp > 0 ? '+' : ''}${bosExp.toFixed(2)} R` : 'N/A',
            potential_setups_rejected_due_to_bos_continuation: rejectedDueToBOS,
          },
          unclear_events: {
            count: unclearEvents.length,
            percentage_of_events: liquidityEvents.length > 0 ? Number(((unclearEvents.length / liquidityEvents.length) * 100).toFixed(1)) : 0,
          },
          core_validation_rule: 'Level Break ≠ Liquidity Sweep. Price breaking a level and continuing strongly is BOS / Continuation, rejecting a reversal trade. Valid reversal setups require Reclaim + MSS + Displacement.'
        },
        pullback_analysis: {
          healthy_pullbacks: {
            total_situations: healthyPbTrades.length,
            valid_trades: healthyValid.length,
            wins: healthyWins.length,
            losses: healthyLosses.length,
            win_rate_percentage: healthyWinRate !== null ? Number(healthyWinRate.toFixed(1)) : null,
            win_rate_display: healthyWinRate !== null ? `${healthyWinRate.toFixed(1)}%` : 'N/A',
            net_r: Number(healthyTotalR.toFixed(2)),
            net_r_display: `${healthyTotalR > 0 ? '+' : ''}${healthyTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: healthyExp !== null ? Number(healthyExp.toFixed(2)) : null,
            expectancy_display: healthyExp !== null ? `${healthyExp > 0 ? '+' : ''}${healthyExp.toFixed(2)} R` : 'N/A',
          },
          weak_pullbacks: {
            total_situations: weakPbTrades.length,
            valid_trades: weakValid.length,
            wins: weakWins.length,
            losses: weakLosses.length,
            win_rate_percentage: weakWinRate !== null ? Number(weakWinRate.toFixed(1)) : null,
            win_rate_display: weakWinRate !== null ? `${weakWinRate.toFixed(1)}%` : 'N/A',
            net_r: Number(weakTotalR.toFixed(2)),
            net_r_display: `${weakTotalR > 0 ? '+' : ''}${weakTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: weakExp !== null ? Number(weakExp.toFixed(2)) : null,
            expectancy_display: weakExp !== null ? `${weakExp > 0 ? '+' : ''}${weakExp.toFixed(2)} R` : 'N/A',
          },
          no_pullbacks: {
            total_situations: noPbTrades.length,
          },
        },
      },
      setups: part.setups.map((s) => {
        const d1Img = s.d1Screenshot || s.screenshots?.d1 || '';
        const h4Img = s.h4Screenshot || s.screenshots?.h4 || '';
        const h1Img = s.h1Screenshot || s.screenshots?.h1 || '';
        const m15Img = s.m15Screenshot || s.screenshots?.m15 || '';
        const otherImgs = s.screenshots?.other || [];
        const pullbackType = s.m15PullbackType || (s.m15Pullback ? 'Healthy pullback' : 'No pullback');
        const liquidityStatus = s.liquidityEventOutcome || s.liquidityOutcome || (s.liquidityLevelTaken ? 'Sweep + Reversal' : 'No Level Taken');

        const summaryLine = `${s.setupId} | ${s.date} (${s.session}) | ${s.direction} ${s.market || 'XAU/USD'} | D1: ${s.d1Bias} (${s.d1Structure}) | 4H: ${s.h4Zone} (Reaction: ${s.h4Reaction}) | 1H: ${s.h1MssDirection} (1H Close: ${s.h1CandleCloseConfirmed ? 'YES' : 'NO'}) | Liquidity: ${liquidityStatus} (${s.liquidityWhatTaken || (s.direction === 'SELL' ? 'Prev High' : 'Prev Low')}) | 15M: ${pullbackType} + ${s.m15PriceActionTrigger} (Valid: ${s.m15TriggerValid ? 'YES' : 'NO'}) | Entry: ${s.entryPrice ?? 'N/A'}, SL: ${s.stopLoss ?? 'N/A'}, TP: ${s.takeProfit ?? 'N/A'} (RR: ${s.plannedRR ? `1:${s.plannedRR.toFixed(2)}` : 'N/A'}) | Result: ${s.result} (${s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R'}) | Rules Kept: ${s.ruleFollowed ? 'YES' : 'NO'} | Loss Reason: ${s.result === 'Loss' ? (s.lossReason || 'Normal loss') : 'N/A'}`;

        return {
          setup_id: s.setupId,
          date: s.date,
          market: s.market || 'XAU/USD',
          session: s.session,
          timeframe_range: s.timeframeRange || '',
          direction: s.direction,

          // One-line summary for rapid ChatGPT absorption
          chatgpt_one_line_summary: summaryLine,

          // Step 1: D1 Market Structure
          step_1_d1_market_structure: {
            bias: s.d1Bias,
            structure: s.d1Structure,
            chart_image: d1Img || null,
          },

          // Step 2: 4H Key Zone
          step_2_4h_key_zone: {
            zone_type: s.h4Zone,
            reaction_confirmed: s.h4Reaction,
            zone_notes: s.h4ZoneNotes || '',
            chart_image: h4Img || null,
          },

          // Step 3: 1H Confirmation
          step_3_1h_confirmation: {
            previous_structure: s.h1PrevStructure,
            mss_direction: s.h1MssDirection,
            last_meaningful_swing: s.h1LastSwing,
            structure_break_level: s.h1StructureBreak,
            candle_close_confirmed: s.h1CandleCloseConfirmed,
            candle_close_status: s.h1CandleCloseConfirmed
              ? 'Confirmed: Completed 1H candle body closed beyond swing level'
              : 'Unconfirmed: Wick only or incomplete 1H candle',
            chart_image: h1Img || null,
          },

          // Step 4: Liquidity Event Evaluation (H1 SHARP V2 Validation: Level Break ≠ Liquidity Sweep)
          liquidity_event: {
            previous_high_low_taken: s.liquidityLevelTaken ?? true,
            what_was_taken: s.liquidityWhatTaken || (s.direction === 'SELL' ? 'Previous High' : 'Previous Low'),
            event_outcome: s.liquidityOutcome || 'Sweep + Reversal',
            sweep_details: (s.liquidityOutcome || 'Sweep + Reversal') === 'Sweep + Reversal' ? {
              liquidity_swept: s.liquiditySwept || (s.direction === 'SELL' ? 'High' : 'Low'),
              rejection_visible: s.liquidityRejection ?? true,
              price_reclaimed_level: s.liquidityReclaimed ?? true,
              opposite_mss_occurred: s.liquidityOppositeMss ?? true,
              strong_displacement_after_mss: s.liquidityDisplacement ?? true,
              validation_flow: s.direction === 'BUY'
                ? 'Previous Low → Sweep Below → Reclaim → Bullish MSS → Displacement'
                : 'Previous High → Sweep Above → Rejection/Reclaim → Bearish MSS → Displacement',
              is_valid_h1_sharp_v2_sweep: (s.liquidityRejection ?? true) && (s.liquidityReclaimed ?? true) && (s.liquidityOppositeMss ?? true) && (s.liquidityDisplacement ?? true),
            } : null,
            bos_details: s.liquidityOutcome === 'Break + Continuation (BOS)' ? {
              previous_level_broken: s.bosLevelBroken || s.liquidityWhatTaken || 'Key Level',
              bos_direction: s.bosDirection || (s.direction === 'SELL' ? 'Bearish' : 'Bullish'),
              price_continued_in_same_direction: s.bosPriceContinued ?? true,
              opposite_mss_occurred: s.bosOppositeMss ?? false,
              reversal_setup_status: 'Rejected: Event was BOS Continuation rather than Liquidity Sweep (Level Break ≠ Liquidity Sweep)',
            } : null,
          },

          // Step 5: 15M Entry Trigger
          step_5_15m_entry_trigger: {
            pullback_occurred: s.m15Pullback,
            pullback_type: pullbackType,
            trigger_direction: s.m15TriggerDirection,
            price_action_trigger: s.m15PriceActionTrigger,
            trigger_valid: s.m15TriggerValid,
            chart_image: m15Img || null,
          },

          // Trade Execution Plan
          trade_plan: {
            direction: s.direction,
            entry_price: s.entryPrice ?? null,
            stop_loss: s.stopLoss ?? null,
            take_profit: s.takeProfit ?? null,
            planned_rr: s.plannedRR ?? null,
            planned_rr_ratio: s.plannedRR ? `1:${s.plannedRR.toFixed(2)}` : null,
          },

          // Execution Outcome & Discipline Audit
          trade_result_and_audit: {
            result: s.result,
            actual_exit_price: s.actualExitPrice ?? null,
            actual_r: s.actualR ?? null,
            actual_r_display: s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R',
            entry_quality: s.entryQuality || 'A',
            maximum_favorable_excursion_mfe: s.mfe != null ? `${s.mfe > 0 ? '+' : ''}${s.mfe}R` : (s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : 'N/A'),
            nearest_opposing_zone: s.nearestOpposingZone || 'None before 2R',
            rule_followed: s.ruleFollowed ?? true,
            loss_reason: s.result === 'Loss' ? (s.lossReason || 'Normal loss') : null,
          },

          // Market Context & News
          market_context: {
            high_impact_news_nearby: s.highImpactNewsNearby,
            market_condition: s.marketCondition,
            notes: s.newsNotes || '',
          },

          validation_checklist: s.checklistState || {},
          notes: s.notes || '',

          // Structured Chart Images & Timeframe Inventory
          images_summary: {
            has_images: Boolean(d1Img || h4Img || h1Img || m15Img || otherImgs.length > 0),
            total_images_attached: [d1Img, h4Img, h1Img, m15Img, ...otherImgs].filter(Boolean).length,
            timeframes_attached: [
              d1Img ? 'D1' : null,
              h4Img ? '4H' : null,
              h1Img ? '1H' : null,
              m15Img ? '15M' : null,
              ...(otherImgs.length > 0 ? [`Other (${otherImgs.length})`] : []),
            ].filter(Boolean),
          },

          // All Attached Chart Screenshots
          chart_screenshots: {
            d1_chart_image: d1Img || null,
            four_hour_chart_image: h4Img || null,
            one_hour_chart_image: h1Img || null,
            fifteen_minute_chart_image: m15Img || null,
            other_charts: otherImgs,
            total_images_attached: [d1Img, h4Img, h1Img, m15Img, ...otherImgs].filter(Boolean).length,
            has_chart_images: Boolean(d1Img || h4Img || h1Img || m15Img || otherImgs.length > 0),
          },

          // Legacy flat fields for backwards compatibility
          d1_bias: s.d1Bias,
          four_h_zone: s.h4Zone,
          one_h_mss: s.h1MssDirection,
          one_h_candle_closed: s.h1CandleCloseConfirmed,
          fifteen_m_pullback: pullbackType,
          fifteen_m_trigger: s.m15PriceActionTrigger,
          entry: s.entryPrice ?? null,
          sl: s.stopLoss ?? null,
          tp: s.takeProfit ?? null,
          rr: s.plannedRR ?? null,
          mfe: s.mfe != null ? `${s.mfe > 0 ? '+' : ''}${s.mfe}R` : (s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : 'N/A'),
          result: s.result,
          result_r: s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R',
          core_trade_data: {
            'D1 Bias': s.d1Bias,
            '4H Zone': s.h4Zone,
            '1H MSS': `${s.h1MssDirection} (${s.h1CandleCloseConfirmed ? 'Candle Close Confirmed' : 'No Close'})`,
            '15M Pullback': pullbackType,
            '15M Trigger': s.m15PriceActionTrigger,
            'Entry': s.entryPrice ?? null,
            'SL': s.stopLoss ?? null,
            'TP': s.takeProfit ?? null,
            'RR': s.plannedRR ?? null,
            'Nearest Opposing Zone': s.nearestOpposingZone || 'None before 2R',
            'MFE': s.mfe != null ? `${s.mfe > 0 ? '+' : ''}${s.mfe}R` : (s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : 'N/A'),
            'Result': s.result,
            'Result in R': s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R',
            'Rule Followed?': (s.ruleFollowed ?? true) ? 'Yes' : 'No',
            'Loss Reason': s.result === 'Loss' ? (s.lossReason || 'Normal loss') : 'N/A',
            'Entry Quality': s.entryQuality || 'A',
          },
          screenshots: {
            d1: d1Img || '',
            h4: h4Img || '',
            h1: h1Img || '',
            m15: m15Img || '',
          },
        };
      }),
    };
  };

  const handleDownloadPart = (part: (typeof parts)[0]) => {
    setDownloadingPart(part.partNumber);
    try {
      const data = generatePartJSON(part);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download =
        part.totalParts === 1
          ? `MSP1_Gold_Complete_Journal_${today}.json`
          : `MSP1_Gold_Part_${part.partNumber}_of_${part.totalParts}_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download part error:', err);
    } finally {
      setTimeout(() => setDownloadingPart(null), 400);
    }
  };

  const handleDownloadAllSequential = async () => {
    setDownloadingAll(true);
    try {
      for (const part of parts) {
        handleDownloadPart(part);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleCopyPrompt = (part: (typeof parts)[0]) => {
    const prompt = getPartPrompt(part);
    navigator.clipboard.writeText(prompt);
    setCopiedPart(part.partNumber);
    setTimeout(() => setCopiedPart(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Multi-Part Export for ChatGPT
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Split {totalSetups} setups with images into sequential parts
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Split Selector */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Split Mode
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSplitMode('PARTS')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    splitMode === 'PARTS'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  By Parts
                </button>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => setSplitMode('BATCH_SIZE')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    splitMode === 'BATCH_SIZE'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  By Count
                </button>
              </div>
            </div>

            {splitMode === 'PARTS' ? (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumParts(n)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      numParts === n
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {n === 1 ? '1 Full File' : `${n} Parts`}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {[25, 50, 100, 150].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setBatchSize(sz)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      batchSize === sz
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sz} / file
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download All Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Download Parts ({parts.length})
            </span>
            <button
              type="button"
              onClick={handleDownloadAllSequential}
              disabled={downloadingAll || parts.length === 0}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All ({parts.length})</span>
            </button>
          </div>

          {/* Parts List */}
          <div className="space-y-2">
            {parts.map((p) => {
              const isCopied = copiedPart === p.partNumber;
              const isDownloading = downloadingPart === p.partNumber;
              const imgCount = p.setups.reduce((acc, s) => {
                const imgs = [
                  s.d1Screenshot || s.screenshots?.d1,
                  s.h4Screenshot || s.screenshots?.h4,
                  s.h1Screenshot || s.screenshots?.h1,
                  s.m15Screenshot || s.screenshots?.m15,
                  ...(s.screenshots?.other || []),
                ].filter(Boolean);
                return acc + imgs.length;
              }, 0);

              return (
                <div
                  key={p.partNumber}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                        {p.totalParts === 1 ? 'Complete Journal' : `Part ${p.partNumber} of ${p.totalParts}`}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        ({p.setups.length} setups · {p.firstSetupId} - {p.lastSetupId})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>{p.validTrades} trades</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{p.wins}W</span>
                      <span>·</span>
                      <span className="text-rose-600 dark:text-rose-400">{p.losses}L</span>
                      <span>·</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {p.netR > 0 ? '+' : ''}{p.netR}R
                      </span>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        📷 {imgCount} images
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(p)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Copy ChatGPT prompt for this part"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPart(p)}
                      disabled={isDownloading}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloading ? '...' : p.totalParts === 1 ? 'Download JSON' : `Part ${p.partNumber}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Upload Part 1, 2, 3 sequentially to ChatGPT with prompts.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
