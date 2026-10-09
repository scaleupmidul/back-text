import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  Trash2,
  Layers,
  TrendingUp,
  Target,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Calculator,
  Camera,
  DollarSign,
  Percent,
  Check,
  Compass,
  ClipboardPaste,
  Clipboard,
} from 'lucide-react';
import { optimizeChartImage } from '../../utils/imageOptimizer.ts';
import { getTodayLocalDate, msp1Store } from '../../utils/msp1Store.ts';
import type {
  MSP1Setup,
  MSP1Session,
  TradingStrategy,
  TradingInstrument,
  TradeOutcomeType,
  MSP1TradeDirection,
  MSP1Result,
  LossReason,
  LiquidityEventOutcome,
} from '../../types/index.ts';

interface MSP1SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (setup: Omit<MSP1Setup, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingSetup?: MSP1Setup | null;
  suggestedSetupId?: string;
  defaultIsMissed?: boolean;
}

export const MSP1SetupModal: React.FC<MSP1SetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSetup,
  suggestedSetupId = 'MSP1-0001',
  defaultIsMissed = false,
}) => {
  // --- 1. Basic Information ---
  const [setupId, setSetupId] = useState(suggestedSetupId);
  const [date, setDate] = useState(getTodayLocalDate());
  const [instrument, setInstrument] = useState<TradingInstrument>('XAU/USD');
  const [strategy, setStrategy] = useState<TradingStrategy>('LSE');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [session, setSession] = useState<MSP1Session>('London');

  // Missed Setup Mode
  const [isMissedSetup, setIsMissedSetup] = useState<boolean>(defaultIsMissed);
  const [skipReason, setSkipReason] = useState<string>('');
  const [hypotheticalOutcome, setHypotheticalOutcome] = useState<string>('');

  // --- 2. H1 Analysis ---
  const [h1Bias, setH1Bias] = useState<'Bullish' | 'Bearish' | 'Unclear'>('Bullish');
  const [h1Structure, setH1Structure] = useState<'HH + HL' | 'LH + LL' | 'Range'>('HH + HL');
  const [importantLevel, setImportantLevel] = useState<'Demand' | 'Supply' | 'Support' | 'Resistance'>('Demand');
  const [levelQuality, setLevelQuality] = useState<'Strong' | 'Average' | 'Weak'>('Strong');

  // --- 3. M15 Confirmation ---
  const [liquidityEvent, setLiquidityEvent] = useState<LiquidityEventOutcome>('Sweep + Reversal');
  const [liquiditySweep, setLiquiditySweep] = useState<boolean>(true);
  const [mss, setMss] = useState<boolean>(true);
  const [mssDirection, setMssDirection] = useState<'Bullish' | 'Bearish'>('Bullish');
  const [displacement, setDisplacement] = useState<boolean>(true);
  const [fvgPresent, setFvgPresent] = useState<boolean>(true);
  const [fvgUsedAsConfirmation, setFvgUsedAsConfirmation] = useState<boolean>(true);

  // --- 4. M5 Entry ---
  const [m5Pullback, setM5Pullback] = useState<boolean>(true);
  const [m5Confirmation, setM5Confirmation] = useState<boolean>(true);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [actualExitPrice, setActualExitPrice] = useState<string>('');

  // Sizing & Monetary P/L
  const [accountBalance, setAccountBalance] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<string>('1.0');

  // --- 5. Trade Result ---
  const [outcomeType, setOutcomeType] = useState<TradeOutcomeType>('TP');
  const [actualR, setActualR] = useState<string>('2.5');
  const [ruleFollowed, setRuleFollowed] = useState<boolean>(true);
  const [lossReason, setLossReason] = useState<LossReason | ''>('');
  const [notes, setNotes] = useState<string>('');

  // --- 6. Screenshots & Clipboard Paste Support ---
  type ScreenshotSlot = 'beforeEntry' | 'entry' | 'afterTrade';
  const [beforeEntryScreenshot, setBeforeEntryScreenshot] = useState<string>('');
  const [entryScreenshot, setEntryScreenshot] = useState<string>('');
  const [afterTradeScreenshot, setAfterTradeScreenshot] = useState<string>('');
  const [activeScreenshotSlot, setActiveScreenshotSlot] = useState<ScreenshotSlot>('beforeEntry');
  const [draggingSlot, setDraggingSlot] = useState<ScreenshotSlot | null>(null);
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize when editing or opening
  useEffect(() => {
    if (!isOpen) return;

    if (editingSetup) {
      setSetupId(editingSetup.setupId || suggestedSetupId);
      setDate(editingSetup.date || getTodayLocalDate());
      setInstrument((editingSetup.instrument as TradingInstrument) || (editingSetup.market as TradingInstrument) || 'XAU/USD');
      setStrategy(editingSetup.strategy || (editingSetup.liquidityEventOutcome === 'Sweep + Reversal' || editingSetup.liquidityOutcome === 'Sweep + Reversal' ? 'LSE' : 'DRE'));
      setDirection(editingSetup.direction === 'SELL' ? 'SELL' : 'BUY');
      setSession(editingSetup.session || 'London');

      setIsMissedSetup(editingSetup.isMissedSetup ?? (editingSetup.result === 'No Trade' || editingSetup.direction === 'NO TRADE'));
      setSkipReason(editingSetup.skipReason || '');
      setHypotheticalOutcome(editingSetup.hypotheticalOutcome || '');

      setH1Bias((editingSetup.h1Bias as any) || (editingSetup.d1Bias === 'Bearish' ? 'Bearish' : 'Bullish'));
      setH1Structure(editingSetup.h1StructureType || (editingSetup.d1Structure === 'LL → LH' ? 'LH + LL' : 'HH + HL'));
      setImportantLevel(editingSetup.importantLevel || (editingSetup.h4Zone === 'Supply' ? 'Supply' : 'Demand'));
      setLevelQuality(editingSetup.levelQuality || 'Strong');

      setLiquidityEvent(editingSetup.liquidityEventOutcome || 'Sweep + Reversal');
      setLiquiditySweep(
        editingSetup.liquiditySweepConfirmed ??
        (typeof editingSetup.liquidityLevelTaken === 'boolean'
          ? editingSetup.liquidityLevelTaken
          : Boolean(editingSetup.liquidityLevelTaken))
      );
      setMss(editingSetup.mssConfirmed ?? (editingSetup.h1MssDirection !== 'No MSS'));
      setMssDirection((editingSetup.mssDirection as any) || (editingSetup.direction === 'SELL' ? 'Bearish' : 'Bullish'));
      setDisplacement(editingSetup.displacementConfirmed ?? (editingSetup.sweepStrongDisplacement !== false));
      setFvgPresent(editingSetup.fvgPresent ?? true);
      setFvgUsedAsConfirmation(editingSetup.fvgUsedAsConfirmation ?? true);

      setM5Pullback(editingSetup.m5Pullback ?? true);
      setM5Confirmation(editingSetup.m5EntryConfirmed ?? true);
      setEntryPrice(editingSetup.entryPrice != null ? String(editingSetup.entryPrice) : '');
      setStopLoss(editingSetup.stopLoss != null ? String(editingSetup.stopLoss) : '');
      setTakeProfit(editingSetup.takeProfit != null ? String(editingSetup.takeProfit) : '');
      setActualExitPrice(editingSetup.actualExitPrice != null ? String(editingSetup.actualExitPrice) : '');

      if (editingSetup.accountBalance) setAccountBalance(String(editingSetup.accountBalance));
      if (editingSetup.riskPercent) setRiskPercent(String(editingSetup.riskPercent));

      if (editingSetup.outcomeType) {
        setOutcomeType(editingSetup.outcomeType);
      } else if (editingSetup.result === 'Win') {
        setOutcomeType('TP');
      } else if (editingSetup.result === 'Loss') {
        setOutcomeType('SL');
      } else if (editingSetup.result === 'Breakeven') {
        setOutcomeType('Breakeven');
      } else {
        setOutcomeType('Manual Exit');
      }

      setActualR(editingSetup.actualR != null ? String(editingSetup.actualR) : '0.0');
      setRuleFollowed(editingSetup.ruleFollowed ?? true);
      setLossReason((editingSetup.lossReason as any) || '');
      setNotes(editingSetup.notes || '');

      setBeforeEntryScreenshot(editingSetup.screenshots?.beforeEntry || editingSetup.d1Screenshot || editingSetup.screenshots?.d1 || '');
      setEntryScreenshot(editingSetup.screenshots?.entry || editingSetup.h1Screenshot || editingSetup.m15Screenshot || '');
      setAfterTradeScreenshot(editingSetup.screenshots?.afterTrade || '');
    } else {
      const dynamicId = suggestedSetupId || msp1Store.getNextId();
      setSetupId(dynamicId);
      setDate(getTodayLocalDate());
      setInstrument('XAU/USD');
      setStrategy('LSE');
      setDirection('BUY');
      setSession('London');

      setIsMissedSetup(defaultIsMissed);
      setSkipReason('');
      setHypotheticalOutcome('');

      setH1Bias('Bullish');
      setH1Structure('HH + HL');
      setImportantLevel('Demand');
      setLevelQuality('Strong');

      setLiquidityEvent('Sweep + Reversal');
      setLiquiditySweep(true);
      setMss(true);
      setMssDirection('Bullish');
      setDisplacement(true);
      setFvgPresent(true);
      setFvgUsedAsConfirmation(true);

      setM5Pullback(true);
      setM5Confirmation(true);
      setEntryPrice('');
      setStopLoss('');
      setTakeProfit('');
      setActualExitPrice('');

      setAccountBalance('10000');
      setRiskPercent('1.0');

      setOutcomeType('TP');
      setActualR('2.5');
      setRuleFollowed(true);
      setLossReason('');
      setNotes('');

      setBeforeEntryScreenshot('');
      setEntryScreenshot('');
      setAfterTradeScreenshot('');
    }
    setError(null);
  }, [isOpen, editingSetup, suggestedSetupId, defaultIsMissed]);

  // Handle Strategy toggling rules
  const handleStrategyChange = (newStrat: TradingStrategy) => {
    setStrategy(newStrat);
    if (newStrat === 'DRE') {
      // DRE does not strictly mandate a prior liquidity sweep
      setImportantLevel(direction === 'BUY' ? 'Demand' : 'Supply');
      setLiquidityEvent('Unclear');
      setLiquiditySweep(false);
    } else {
      // LSE strictly requires a recorded liquidity sweep + reversal
      setLiquidityEvent('Sweep + Reversal');
      setLiquiditySweep(true);
    }
  };

  // Handle Direction changes
  const handleDirectionChange = (newDir: 'BUY' | 'SELL') => {
    setDirection(newDir);
    if (newDir === 'BUY') {
      setH1Bias('Bullish');
      setH1Structure('HH + HL');
      setImportantLevel(strategy === 'DRE' ? 'Demand' : 'Demand');
      setMssDirection('Bullish');
    } else {
      setH1Bias('Bearish');
      setH1Structure('LH + LL');
      setImportantLevel(strategy === 'DRE' ? 'Supply' : 'Supply');
      setMssDirection('Bearish');
    }
  };

  // Auto-calculate Risk, Reward, Planned RR, and Realized R
  const calculations = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const exit = parseFloat(actualExitPrice);
    const balance = parseFloat(accountBalance) || 10000;
    const riskPct = parseFloat(riskPercent) || 1.0;

    let riskDistance = 0;
    let rewardDistance = 0;
    let plannedRR = 0;
    let autoRealizedR: number | null = null;
    const dollarRisk = (balance * riskPct) / 100;

    if (!isNaN(entry) && !isNaN(sl) && entry > 0 && sl > 0) {
      if (direction === 'BUY') {
        riskDistance = Number((entry - sl).toFixed(2));
      } else {
        riskDistance = Number((sl - entry).toFixed(2));
      }
    }

    if (!isNaN(entry) && !isNaN(tp) && entry > 0 && tp > 0) {
      if (direction === 'BUY') {
        rewardDistance = Number((tp - entry).toFixed(2));
      } else {
        rewardDistance = Number((entry - tp).toFixed(2));
      }
    }

    if (riskDistance > 0 && rewardDistance > 0) {
      plannedRR = Number((rewardDistance / riskDistance).toFixed(2));
    }

    // If exit price is provided, auto-compute realized R
    if (riskDistance > 0 && !isNaN(exit) && exit > 0) {
      if (direction === 'BUY') {
        autoRealizedR = Number(((exit - entry) / riskDistance).toFixed(2));
      } else {
        autoRealizedR = Number(((entry - exit) / riskDistance).toFixed(2));
      }
    }

    // Monetary P/L
    const parsedR = autoRealizedR != null ? autoRealizedR : parseFloat(actualR) || 0;
    const monetaryPL = Number((parsedR * dollarRisk).toFixed(2));

    return {
      riskDistance: riskDistance > 0 ? riskDistance : null,
      rewardDistance: rewardDistance > 0 ? rewardDistance : null,
      plannedRR: plannedRR > 0 ? plannedRR : null,
      autoRealizedR,
      dollarRisk,
      monetaryPL,
    };
  }, [entryPrice, stopLoss, takeProfit, actualExitPrice, direction, actualR, accountBalance, riskPercent]);

  // Adjust R default based on Outcome selection
  const handleOutcomeChange = (newOutcome: TradeOutcomeType) => {
    setOutcomeType(newOutcome);
    if (newOutcome === 'TP') {
      setActualR(calculations.plannedRR ? String(calculations.plannedRR) : '2.5');
      setLossReason('');
    } else if (newOutcome === 'SL') {
      setActualR('-1.0');
      if (!lossReason) setLossReason('Normal loss');
    } else if (newOutcome === 'Breakeven') {
      setActualR('0.0');
      setLossReason('');
    } else if (newOutcome === 'Manual Exit') {
      setActualR('1.0');
    } else {
      setActualR('0.0');
    }
  };

  // Screenshot Processing & Optimization
  const getSlotDisplayName = (slot: ScreenshotSlot) => {
    switch (slot) {
      case 'beforeEntry': return 'Before Entry (Setup)';
      case 'entry': return 'Entry Confirmation (M5/M15)';
      case 'afterTrade': return 'After Trade (Outcome)';
    }
  };

  const processImageFile = async (file: File | Blob, slot: ScreenshotSlot) => {
    try {
      const fileObj =
        file instanceof File
          ? file
          : new File([file], `${slot}-chart.png`, { type: file.type || 'image/png' });

      const optimized = await optimizeChartImage(fileObj);
      if (slot === 'beforeEntry') setBeforeEntryScreenshot(optimized.dataUrl);
      else if (slot === 'entry') setEntryScreenshot(optimized.dataUrl);
      else if (slot === 'afterTrade') setAfterTradeScreenshot(optimized.dataUrl);

      setPasteFeedback(`Copied image pasted into ${getSlotDisplayName(slot)}!`);
      setTimeout(() => setPasteFeedback(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to process chart screenshot');
    }
  };

  // Screenshot Upload From File Input
  const handleScreenshotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: ScreenshotSlot
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file, slot);
    e.target.value = '';
  };

  // Paste from System Clipboard Button
  const handlePasteFromClipboard = async (slot: ScreenshotSlot) => {
    setActiveScreenshotSlot(slot);
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            await processImageFile(blob, slot);
            return;
          }
        }
        setPasteFeedback('No image copied yet. Copy chart (Ctrl+C / TradingView) first.');
        setTimeout(() => setPasteFeedback(null), 3000);
      } else {
        setPasteFeedback('Click this card and press Ctrl+V on your keyboard to paste');
        setTimeout(() => setPasteFeedback(null), 3000);
      }
    } catch {
      setPasteFeedback('Click this card and press Ctrl+V on your keyboard to paste');
      setTimeout(() => setPasteFeedback(null), 3000);
    }
  };

  // Global window paste listener: paste anywhere in the modal!
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowPaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      let imageItem: DataTransferItem | null = null;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          imageItem = items[i];
          break;
        }
      }

      // If no image is on clipboard, let default text paste proceed
      if (!imageItem) return;

      e.preventDefault();
      e.stopPropagation();

      const blob = imageItem.getAsFile();
      if (!blob) return;

      // Smart target slot selection:
      // 1. If user explicitly clicked/activated a slot, paste there
      // 2. Otherwise, fill the first empty slot (beforeEntry -> entry -> afterTrade)
      let targetSlot: ScreenshotSlot = activeScreenshotSlot;
      if (!activeScreenshotSlot) {
        if (!beforeEntryScreenshot) targetSlot = 'beforeEntry';
        else if (!entryScreenshot) targetSlot = 'entry';
        else if (!afterTradeScreenshot) targetSlot = 'afterTrade';
        else targetSlot = 'beforeEntry';
      }

      await processImageFile(blob, targetSlot);

      // Auto-advance active slot to next empty slot for lightning-fast multi-paste!
      if (targetSlot === 'beforeEntry' && !entryScreenshot) {
        setActiveScreenshotSlot('entry');
      } else if (targetSlot === 'entry' && !afterTradeScreenshot) {
        setActiveScreenshotSlot('afterTrade');
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [isOpen, activeScreenshotSlot, beforeEntryScreenshot, entryScreenshot, afterTradeScreenshot]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: LSE requires liquidity sweep
    if (strategy === 'LSE' && !isMissedSetup && !liquiditySweep) {
      setError('LSE (Liquidity Sweep Entry) requires a confirmed liquidity sweep of previous High or Low.');
      return;
    }

    setSaving(true);
    try {
      const pRR = calculations.plannedRR || (plannedRRValid() ? parseFloat(calculations.plannedRR ? String(calculations.plannedRR) : '2.0') : null);
      const parsedActualR = parseFloat(actualR) || 0;

      // Map outcome to MSP1Result
      let resValue: MSP1Result = 'Win';
      if (isMissedSetup) {
        resValue = 'No Trade';
      } else if (outcomeType === 'TP') {
        resValue = 'Win';
      } else if (outcomeType === 'SL') {
        resValue = 'Loss';
      } else if (outcomeType === 'Breakeven') {
        resValue = 'Breakeven';
      } else if (outcomeType === 'Manual Exit') {
        resValue = parsedActualR > 0 ? 'Win' : parsedActualR < 0 ? 'Loss' : 'Breakeven';
      } else {
        resValue = 'No Trade';
      }

      const payload: Omit<MSP1Setup, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        setupId: setupId.trim() || suggestedSetupId,
        date,
        market: instrument,
        instrument,
        session,
        strategy,
        direction: isMissedSetup ? 'NO TRADE' : direction,
        timeframeRange: `${date} ${session}`,

        // Liquidity & Confirmation
        liquidityEventOccurred: strategy === 'LSE' ? liquiditySweep : false,
        liquidityLevelTaken: direction === 'BUY' ? 'Previous Low' : 'Previous High',
        liquidityEventOutcome: strategy === 'LSE' ? 'Sweep + Reversal' : 'Unclear',
        liquiditySweepConfirmed: liquiditySweep,
        sweepLiquidityType: direction === 'BUY' ? 'Low' : 'High',
        sweepRejectionVisible: true,
        sweepPriceReclaimed: true,
        sweepOppositeMss: mss,
        sweepStrongDisplacement: displacement,

        // H1 Analysis
        h1Bias,
        h1StructureType: h1Structure,
        importantLevel,
        levelQuality,
        h1KeyZoneType: importantLevel === 'Demand' || importantLevel === 'Supply' ? importantLevel : 'Support',

        // Structure fields for backwards compatibility
        d1Bias: h1Bias === 'Bearish' ? 'Bearish' : 'Bullish',
        d1Structure: h1Structure === 'LH + LL' ? 'LL → LH' : 'HH → HL',
        h4Zone: importantLevel === 'Supply' ? 'Supply' : 'Demand',
        h4Reaction: 'Yes',
        h1PrevStructure: direction === 'BUY' ? 'Bearish' : 'Bullish',
        h1MssDirection: direction === 'BUY' ? 'Bullish MSS' : 'Bearish MSS',
        h1LastSwing: direction === 'BUY' ? 'Last LH' : 'Last HL',
        h1StructureBreak: direction === 'BUY' ? 'Above Last LH' : 'Below Last HL',
        h1CandleCloseConfirmed: true,

        // M15 Confirmation & FVG
        mssConfirmed: mss,
        displacementConfirmed: displacement,
        fvgPresent,
        fvgUsedAsConfirmation,
        m15Pullback: Boolean(m5Pullback),
        m15PullbackType: 'Healthy pullback',
        m15TriggerDirection: direction === 'BUY' ? 'Bullish' : 'Bearish',
        m15PriceActionTrigger: direction === 'BUY' ? 'Bullish Engulfing' : 'Bearish Engulfing',
        m15TriggerValid: true,

        // M5 Entry Confirmation
        m5Pullback,
        m5EntryConfirmed: m5Confirmation,

        // Pricing & Plan
        entryPrice: entryPrice ? parseFloat(entryPrice) : null,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        plannedRR: pRR,

        // Results
        result: resValue,
        outcomeType,
        actualExitPrice: actualExitPrice ? parseFloat(actualExitPrice) : null,
        actualR: isMissedSetup ? 0 : parsedActualR,
        accountBalance: parseFloat(accountBalance) || 10000,
        riskPercent: parseFloat(riskPercent) || 1.0,
        realizedPnL: isMissedSetup ? 0 : calculations.monetaryPL,
        ruleFollowed,
        lossReason: outcomeType === 'SL' && lossReason ? lossReason : null,

        // Missed Setup Log
        isMissedSetup,
        skipReason: isMissedSetup ? skipReason : undefined,
        hypotheticalOutcome: isMissedSetup ? hypotheticalOutcome : undefined,

        // Meta & Notes
        highImpactNewsNearby: 'No',
        marketCondition: 'Trending',
        notes: notes.trim(),
        screenshots: {
          beforeEntry: beforeEntryScreenshot || undefined,
          entry: entryScreenshot || undefined,
          afterTrade: afterTradeScreenshot || undefined,
          d1: beforeEntryScreenshot || undefined,
          h1: entryScreenshot || undefined,
          m15: entryScreenshot || undefined,
        },
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save trade record.');
    } finally {
      setSaving(false);
    }
  };

  function plannedRRValid() {
    return parseFloat(entryPrice) > 0 && parseFloat(stopLoss) > 0 && parseFloat(takeProfit) > 0;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0b101b] border border-slate-800 text-slate-100 rounded-xl w-full max-w-4xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              {strategy}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {editingSetup ? `Edit Trade ${editingSetup.setupId}` : 'Record Backtest Trade'}
              </h2>
              <p className="text-xs text-slate-400">
                {strategy === 'LSE'
                  ? 'Liquidity Sweep Entry — Sweeps Key High/Low with Reversal'
                  : 'Demand Reaction Entry — Direct Reaction at Key Level'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-6 flex-1 text-sm">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Missed Setup Toggle Banner */}
          <div className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between ${
            isMissedSetup
              ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
              : 'bg-slate-900/40 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <Compass className={`w-4 h-4 ${isMissedSetup ? 'text-amber-400' : 'text-slate-400'}`} />
              <div>
                <span className="font-medium text-xs sm:text-sm">Log as Missed Setup (Observed But Not Entered)</span>
                <p className="text-[11px] text-slate-400">
                  Keeps hypothetical outcomes strictly isolated from actual win rate & equity statistics.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMissedSetup(!isMissedSetup)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                isMissedSetup
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMissedSetup ? 'Missed Setup Active' : 'Normal Trade'}
            </button>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Trade ID */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Trade ID</label>
                <input
                  type="text"
                  value={setupId}
                  onChange={(e) => setSetupId(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-hidden"
                  placeholder="MSP1-0001"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Instrument */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Instrument</label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value as TradingInstrument)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="XAU/USD">XAU/USD (Gold)</option>
                  <option value="BTC/USD">BTC/USD (Bitcoin)</option>
                </select>
              </div>

              {/* Strategy */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Strategy</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleStrategyChange('LSE')}
                    className={`py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                      strategy === 'LSE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    LSE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStrategyChange('DRE')}
                    className={`py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                      strategy === 'DRE'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    DRE
                  </button>
                </div>
              </div>

              {/* Direction */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Direction</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleDirectionChange('BUY')}
                    className={`py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                      direction === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectionChange('SELL')}
                    className={`py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                      direction === 'SELL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              {/* Session */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value as MSP1Session)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="London">London</option>
                  <option value="New York">New York</option>
                  <option value="London + New York">London + NY</option>
                  <option value="Asian">Asian</option>
                  <option value="Other / Unknown">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: H1 Analysis */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. H1 Market Structure & Levels
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">H1 Bias</label>
                <select
                  value={h1Bias}
                  onChange={(e) => setH1Bias(e.target.value as any)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Bullish">Bullish</option>
                  <option value="Bearish">Bearish</option>
                  <option value="Unclear">Unclear</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">H1 Structure</label>
                <select
                  value={h1Structure}
                  onChange={(e) => setH1Structure(e.target.value as any)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="HH + HL">HH + HL (Uptrend)</option>
                  <option value="LH + LL">LH + LL (Downtrend)</option>
                  <option value="Range">Range / Consolidation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Important Level</label>
                <select
                  value={importantLevel}
                  onChange={(e) => setImportantLevel(e.target.value as any)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Demand">Demand Zone</option>
                  <option value="Supply">Supply Zone</option>
                  <option value="Support">Support Level</option>
                  <option value="Resistance">Resistance Level</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Level Quality</label>
                <select
                  value={levelQuality}
                  onChange={(e) => setLevelQuality(e.target.value as any)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Strong">Strong (Fresh / Unmitigated)</option>
                  <option value="Average">Average</option>
                  <option value="Weak">Weak / Tested Multiple Times</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: M15 Confirmation */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. M15 Confirmation ({strategy})
              </h3>
              <span className="text-[11px] text-slate-400">
                {strategy === 'LSE'
                  ? 'Rule: Requires confirmed Liquidity Sweep + Reversal'
                  : 'Rule: Allows direct reaction without requiring sweep'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {/* Liquidity Event Outcome */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Liquidity Event</label>
                <select
                  value={liquidityEvent}
                  onChange={(e) => {
                    const val = e.target.value as LiquidityEventOutcome;
                    setLiquidityEvent(val);
                    setLiquiditySweep(val === 'Sweep + Reversal');
                  }}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Sweep + Reversal">Sweep + Reversal</option>
                  <option value="Break + Continuation (BOS)">BOS + Continuation</option>
                  <option value="Unclear">Unclear</option>
                </select>
              </div>

              {/* Liquidity Sweep */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Liquidity Sweep?</label>
                <button
                  type="button"
                  onClick={() => setLiquiditySweep(!liquiditySweep)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                    liquiditySweep
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {liquiditySweep ? 'Yes (Swept)' : 'No Sweep'}
                </button>
              </div>

              {/* MSS */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">MSS Occurred?</label>
                <button
                  type="button"
                  onClick={() => setMss(!mss)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                    mss
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {mss ? 'Yes (MSS)' : 'No MSS'}
                </button>
              </div>

              {/* Displacement */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Displacement?</label>
                <button
                  type="button"
                  onClick={() => setDisplacement(!displacement)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                    displacement
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {displacement ? 'Yes (Impulsive)' : 'No'}
                </button>
              </div>

              {/* FVG Present */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">FVG Present?</label>
                <button
                  type="button"
                  onClick={() => setFvgPresent(!fvgPresent)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                    fvgPresent
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {fvgPresent ? 'Yes (FVG)' : 'No'}
                </button>
              </div>

              {/* FVG Used as Confirmation */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">FVG Used?</label>
                <button
                  type="button"
                  onClick={() => setFvgUsedAsConfirmation(!fvgUsedAsConfirmation)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                    fvgUsedAsConfirmation
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {fvgUsedAsConfirmation ? 'Yes (Confirmed)' : 'No'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: M5 Entry & Pricing */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              4. M5 Entry Execution & Risk Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* M5 Pullback */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">M5 Pullback</label>
                <button
                  type="button"
                  onClick={() => setM5Pullback(!m5Pullback)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                    m5Pullback
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {m5Pullback ? 'Yes (Healthy)' : 'No Pullback'}
                </button>
              </div>

              {/* M5 Entry Confirmation */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">M5 Confirmation</label>
                <button
                  type="button"
                  onClick={() => setM5Confirmation(!m5Confirmation)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                    m5Confirmation
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {m5Confirmation ? 'Confirmed' : 'Unconfirmed'}
                </button>
              </div>

              {/* Entry Price */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono tabular-nums focus:border-amber-500 focus:outline-hidden"
                  placeholder="e.g. 2500.50"
                />
              </div>

              {/* Stop Loss Price */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono tabular-nums focus:border-amber-500 focus:outline-hidden"
                  placeholder="e.g. 2494.50"
                />
              </div>

              {/* Take Profit Price */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono tabular-nums focus:border-amber-500 focus:outline-hidden"
                  placeholder="e.g. 2515.50"
                />
              </div>

              {/* Actual Exit Price */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Actual Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={actualExitPrice}
                  onChange={(e) => setActualExitPrice(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono tabular-nums focus:border-amber-500 focus:outline-hidden"
                  placeholder="e.g. 2515.50"
                />
              </div>
            </div>

            {/* Live Auto-Calculated Risk & Reward Strip */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Risk Distance</span>
                <p className="font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                  {calculations.riskDistance != null ? `${calculations.riskDistance} pts` : '—'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Reward Distance</span>
                <p className="font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                  {calculations.rewardDistance != null ? `${calculations.rewardDistance} pts` : '—'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Planned RR</span>
                <p className="font-mono tabular-nums font-semibold text-amber-400 mt-0.5">
                  {calculations.plannedRR != null ? `1:${calculations.plannedRR}` : '—'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Position Risk</span>
                <p className="font-mono tabular-nums font-semibold text-slate-300 mt-0.5">
                  ${calculations.dollarRisk.toFixed(0)} ({riskPercent}%)
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Est. Monetary P/L</span>
                <p className={`font-mono tabular-nums font-semibold mt-0.5 ${
                  calculations.monetaryPL > 0
                    ? 'text-emerald-400'
                    : calculations.monetaryPL < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}>
                  {calculations.monetaryPL > 0 ? '+' : ''}${calculations.monetaryPL.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Trade Result or Missed Reason */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              5. {isMissedSetup ? 'Missed Setup Details' : 'Trade Outcome & Audit'}
            </h3>

            {isMissedSetup ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Reason for Skipping</label>
                  <input
                    type="text"
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                    placeholder="e.g. CPI high impact news in 5 mins / Spread too high / Missed trigger timing"
                    required={isMissedSetup}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Hypothetical Observable Outcome</label>
                  <input
                    type="text"
                    value={hypotheticalOutcome}
                    onChange={(e) => setHypotheticalOutcome(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                    placeholder="e.g. Price reached +2.5R target within 45 mins / Would have stopped out"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {/* Outcome Type */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Outcome</label>
                  <select
                    value={outcomeType}
                    onChange={(e) => handleOutcomeChange(e.target.value as TradeOutcomeType)}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="TP">Take Profit (TP)</option>
                    <option value="SL">Stop Loss (SL)</option>
                    <option value="Breakeven">Breakeven</option>
                    <option value="Manual Exit">Manual Exit</option>
                  </select>
                </div>

                {/* Realized Result in R */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Realized R</label>
                  <input
                    type="number"
                    step="0.05"
                    value={actualR}
                    onChange={(e) => setActualR(e.target.value)}
                    className={`w-full bg-slate-900/80 border rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums focus:outline-hidden font-bold ${
                      parseFloat(actualR) > 0
                        ? 'border-emerald-500/40 text-emerald-400'
                        : parseFloat(actualR) < 0
                        ? 'border-rose-500/40 text-rose-400'
                        : 'border-slate-800 text-slate-300'
                    }`}
                    placeholder="e.g. 2.5 or -1.0"
                    required
                  />
                </div>

                {/* Rule Followed? */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Rule Followed?</label>
                  <button
                    type="button"
                    onClick={() => setRuleFollowed(!ruleFollowed)}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                      ruleFollowed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {ruleFollowed ? 'Yes (Disciplined)' : 'No (Rule Broken)'}
                  </button>
                </div>

                {/* Loss Reason (if SL) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Root Cause / Loss Reason</label>
                  <select
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value as any)}
                    disabled={outcomeType !== 'SL'}
                    className={`w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer ${
                      outcomeType !== 'SL' ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">None / Not Applicable</option>
                    <option value="Normal loss">Normal loss (Probability distribution)</option>
                    <option value="Wrong D1 bias">Wrong Higher Timeframe Bias</option>
                    <option value="False MSS">False MSS / Early Shift</option>
                    <option value="Opposing zone">Opposing 4H/1H zone hit too early</option>
                    <option value="SL too tight">SL too tight / Volatility noise</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Screenshots & Direct Clipboard Paste */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  6. Chart Screenshots & Visual Evidence
                </h3>
                {pasteFeedback && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    <Check className="w-3 h-3" />
                    {pasteFeedback}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-mono">
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Tip: Copy chart (Ctrl+C / TradingView) &amp; press <strong>Ctrl+V</strong> to paste</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Slot 1: Before Entry */}
              {(() => {
                const isSelected = activeScreenshotSlot === 'beforeEntry';
                const isDragging = draggingSlot === 'beforeEntry';
                return (
                  <div
                    tabIndex={0}
                    onClick={() => setActiveScreenshotSlot('beforeEntry')}
                    onFocus={() => setActiveScreenshotSlot('beforeEntry')}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingSlot('beforeEntry');
                    }}
                    onDragLeave={() => setDraggingSlot(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDraggingSlot(null);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        await processImageFile(file, 'beforeEntry');
                      }
                    }}
                    className={`relative rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer outline-hidden border ${
                      isDragging
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50'
                        : isSelected
                        ? 'border-amber-500/80 bg-slate-900/80 ring-1 ring-amber-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200">Before Entry (Setup)</span>
                      {isSelected ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Active (Ctrl+V)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Click to select</span>
                      )}
                    </div>

                    {beforeEntryScreenshot ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 group bg-slate-950">
                        <img
                          src={beforeEntryScreenshot}
                          alt="Before Entry"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePasteFromClipboard('beforeEntry');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 hover:bg-amber-400 cursor-pointer shadow-md"
                            title="Paste copied image from clipboard"
                          >
                            <ClipboardPaste className="w-3.5 h-3.5" />
                            Paste New
                          </button>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-medium flex items-center gap-1 hover:bg-slate-700 cursor-pointer border border-slate-700"
                            title="Upload from computer"
                          >
                            <Upload className="w-3 h-3" />
                            File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotUpload(e, 'beforeEntry')}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBeforeEntryScreenshot('');
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800/60 cursor-pointer"
                            title="Remove screenshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-3 text-slate-400 group-hover:border-slate-700 transition-colors">
                        <ClipboardPaste className={`w-6 h-6 mb-1.5 transition-colors ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <div className="flex items-center gap-2 mb-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePasteFromClipboard('beforeEntry');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ClipboardPaste className="w-3 h-3" />
                            Paste (Ctrl+V)
                          </button>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-[11px] font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Browse
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotUpload(e, 'beforeEntry')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isSelected ? 'Ready: Press Ctrl+V now' : 'Click to select & paste'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Slot 2: Entry Execution */}
              {(() => {
                const isSelected = activeScreenshotSlot === 'entry';
                const isDragging = draggingSlot === 'entry';
                return (
                  <div
                    tabIndex={0}
                    onClick={() => setActiveScreenshotSlot('entry')}
                    onFocus={() => setActiveScreenshotSlot('entry')}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingSlot('entry');
                    }}
                    onDragLeave={() => setDraggingSlot(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDraggingSlot(null);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        await processImageFile(file, 'entry');
                      }
                    }}
                    className={`relative rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer outline-hidden border ${
                      isDragging
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50'
                        : isSelected
                        ? 'border-amber-500/80 bg-slate-900/80 ring-1 ring-amber-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200">Entry Confirmation (M5/M15)</span>
                      {isSelected ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Active (Ctrl+V)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Click to select</span>
                      )}
                    </div>

                    {entryScreenshot ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 group bg-slate-950">
                        <img
                          src={entryScreenshot}
                          alt="Entry Execution"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePasteFromClipboard('entry');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 hover:bg-amber-400 cursor-pointer shadow-md"
                            title="Paste copied image from clipboard"
                          >
                            <ClipboardPaste className="w-3.5 h-3.5" />
                            Paste New
                          </button>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-medium flex items-center gap-1 hover:bg-slate-700 cursor-pointer border border-slate-700"
                            title="Upload from computer"
                          >
                            <Upload className="w-3 h-3" />
                            File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotUpload(e, 'entry')}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEntryScreenshot('');
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800/60 cursor-pointer"
                            title="Remove screenshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-3 text-slate-400 group-hover:border-slate-700 transition-colors">
                        <ClipboardPaste className={`w-6 h-6 mb-1.5 transition-colors ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <div className="flex items-center gap-2 mb-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePasteFromClipboard('entry');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ClipboardPaste className="w-3 h-3" />
                            Paste (Ctrl+V)
                          </button>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-[11px] font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Browse
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotUpload(e, 'entry')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isSelected ? 'Ready: Press Ctrl+V now' : 'Click to select & paste'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Slot 3: After Trade */}
              {(() => {
                const isSelected = activeScreenshotSlot === 'afterTrade';
                const isDragging = draggingSlot === 'afterTrade';
                return (
                  <div
                    tabIndex={0}
                    onClick={() => setActiveScreenshotSlot('afterTrade')}
                    onFocus={() => setActiveScreenshotSlot('afterTrade')}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingSlot('afterTrade');
                    }}
                    onDragLeave={() => setDraggingSlot(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDraggingSlot(null);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        await processImageFile(file, 'afterTrade');
                      }
                    }}
                    className={`relative rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer outline-hidden border ${
                      isDragging
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50'
                        : isSelected
                        ? 'border-amber-500/80 bg-slate-900/80 ring-1 ring-amber-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200">After Trade (Outcome)</span>
                      {isSelected ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Active (Ctrl+V)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Click to select</span>
                      )}
                    </div>

                    {afterTradeScreenshot ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 group bg-slate-950">
                        <img
                          src={afterTradeScreenshot}
                          alt="After Trade"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePasteFromClipboard('afterTrade');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 hover:bg-amber-400 cursor-pointer shadow-md"
                            title="Paste copied image from clipboard"
                          >
                            <ClipboardPaste className="w-3.5 h-3.5" />
                            Paste New
                          </button>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-medium flex items-center gap-1 hover:bg-slate-700 cursor-pointer border border-slate-700"
                            title="Upload from computer"
                          >
                            <Upload className="w-3 h-3" />
                            File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotUpload(e, 'afterTrade')}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAfterTradeScreenshot('');
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800/60 cursor-pointer"
                            title="Remove screenshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-3 text-slate-400 group-hover:border-slate-700 transition-colors">
                        <ClipboardPaste className={`w-6 h-6 mb-1.5 transition-colors ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <div className="flex items-center gap-2 mb-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePasteFromClipboard('afterTrade');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ClipboardPaste className="w-3 h-3" />
                            Paste (Ctrl+V)
                          </button>
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-[11px] font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Browse
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotUpload(e, 'afterTrade')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isSelected ? 'Ready: Press Ctrl+V now' : 'Click to select & paste'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Section 7: Notes & Lessons */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              7. Setup Reasoning & Execution Lessons
            </h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
              placeholder="Record exact trigger thoughts, psychological state, discipline checks, and post-trade reflections..."
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Saving...' : editingSetup ? 'Update Trade Record' : 'Save Backtest Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
