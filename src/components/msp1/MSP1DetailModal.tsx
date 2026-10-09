import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Calendar,
  Layers,
  Target,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ZoomIn,
  Shield,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { MSP1Setup } from '../../types/index.ts';
import { MSP1LightboxModal } from './MSP1LightboxModal.tsx';
import { validateH1SharpV2 } from '../../utils/liquidityValidation.ts';

interface MSP1DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  setup: MSP1Setup | null;
  onEdit: (setup: MSP1Setup) => void;
  onDelete: (id: string) => void;
  onRequestDelete?: (setup: MSP1Setup) => void;
}

export const MSP1DetailModal: React.FC<MSP1DetailModalProps> = ({
  isOpen,
  onClose,
  setup,
  onEdit,
  onDelete,
  onRequestDelete,
}) => {
  const [activeLightbox, setActiveLightbox] = useState<{
    imageUrl: string;
    title: string;
    timeframe: string;
  } | null>(null);

  if (!isOpen || !setup) return null;

  const validation = validateH1SharpV2(setup);

  const resultColor =
    setup.result === 'Win'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
      : setup.result === 'Loss'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
      : setup.result === 'Breakeven'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
      : 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30';

  const directionColor =
    setup.direction === 'BUY'
      ? 'bg-emerald-600 text-white'
      : setup.direction === 'SELL'
      ? 'bg-rose-600 text-white'
      : 'bg-slate-700 text-white';

  const screenshots = [
    { tf: 'Before Entry', url: setup.screenshots?.beforeEntry || setup.d1Screenshot || setup.screenshots?.d1, label: 'Before Entry / Higher Timeframe' },
    { tf: '4H Zone', url: setup.h4Screenshot || setup.screenshots?.h4, label: '4H Key Zone' },
    { tf: 'Entry Confirmation', url: setup.screenshots?.entry || setup.h1Screenshot || setup.screenshots?.h1, label: 'Entry Confirmation / MSS' },
    { tf: '15M / Trigger', url: setup.m15Screenshot || setup.screenshots?.m15, label: '15M Trigger / Pullback' },
    { tf: 'After Trade', url: setup.screenshots?.afterTrade, label: 'After Trade / Outcome' },
  ].filter((s) => !!s.url);

  const strat = setup.strategy || (setup.liquidityEventOutcome === 'Sweep + Reversal' || setup.liquidityOutcome === 'Sweep + Reversal' ? 'LSE' : 'DRE');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-2xl w-full h-[100dvh] sm:h-auto max-w-4xl sm:max-h-[92vh] flex flex-col shadow-2xl my-auto animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-t-none sm:rounded-t-2xl gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 min-w-0">
              <span className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white truncate">
                {setup.setupId}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
                strat === 'LSE'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400'
              }`}>
                {strat}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${directionColor}`}>
                {setup.direction}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${resultColor}`}>
                {setup.result} {setup.actualR != null && `(${setup.actualR > 0 ? '+' : ''}${setup.actualR.toFixed(2)}R)`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onEdit(setup)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer min-h-[44px] active:scale-95"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Edit</span>
              </button>
              <button
                id="detail-delete-btn"
                onClick={() => {
                  if (onRequestDelete) {
                    onRequestDelete(setup);
                  } else {
                    onDelete(setup.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                title="Delete setup"
                aria-label="Delete setup"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Market</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{setup.market}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Date</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{setup.date}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Session</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{setup.session}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Market Condition</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{setup.marketCondition}</span>
              </div>
            </div>

            {/* Dedicated Card: Liquidity Event & H1 SHARP V2 Validation */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      Liquidity Event & H1 SHARP V2 Audit
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Level Break ≠ Liquidity Sweep Rule Enforcement
                    </span>
                  </div>
                </div>

                {/* Validation Status Badge */}
                {validation.pipelineStatus === 'VALID_SWEEP_REVERSAL' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Valid Sweep Reversal Setup</span>
                  </span>
                ) : validation.isRejectedDueToBOS ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/40">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                    <span>Rejected: BOS Continuation</span>
                  </span>
                ) : validation.pipelineStatus === 'UNCLEAR_EVENT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Unclear Liquidity Reaction</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-800 dark:text-slate-300 border border-slate-500/40">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Incomplete Sweep Chain</span>
                  </span>
                )}
              </div>

              {/* Event Core Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Level Taken?</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {setup.liquidityEventOccurred !== false ? 'YES (Key Level Taken)' : 'NO'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">What Was Taken</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {setup.liquidityLevelTaken || (setup.direction === 'SELL' ? 'Previous High' : 'Previous Low')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Event Classification</span>
                  <span className={`font-bold ${
                    setup.liquidityEventOutcome === 'Break + Continuation (BOS)'
                      ? 'text-blue-600 dark:text-blue-400'
                      : setup.liquidityEventOutcome === 'Unclear'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {setup.liquidityEventOutcome || 'Sweep + Reversal'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Opposite MSS Confirmed</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {setup.sweepOppositeMss ?? (setup.h1MssDirection && setup.h1MssDirection !== 'No MSS') ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>

              {/* Sweep vs BOS Detailed Specs */}
              {setup.liquidityEventOutcome === 'Break + Continuation (BOS)' ? (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                    <span>Break + Continuation (BOS) Details:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Level Broken:</span>
                      <span className="font-semibold">{setup.bosLevelBroken || setup.liquidityLevelTaken || 'Previous Swing'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">BOS Direction:</span>
                      <span className="font-semibold">{setup.bosDirection || (setup.direction === 'BUY' ? 'Bullish' : 'Bearish')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Continued in Direction:</span>
                      <span className="font-semibold">{setup.bosPriceContinued !== false ? 'YES' : 'NO'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Opposite MSS:</span>
                      <span className="font-semibold">{setup.bosOppositeMss ? 'YES' : 'NO'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium pt-1">
                    Rule: Do NOT classify every previous High/Low break as a Liquidity Sweep. A level break followed by strong continuation is BOS / Continuation, filtering out false reversals.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Sweep + Reversal Audit Checklist:</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                      {setup.direction === 'BUY' ? 'Bullish Reversal Setup' : 'Bearish Reversal Setup'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="text-slate-500 dark:text-slate-400 block">Liquidity Swept:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {setup.sweepLiquidityType || (setup.direction === 'SELL' ? 'High' : 'Low')}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="text-slate-500 dark:text-slate-400 block">Rejection Visible:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {setup.sweepRejectionVisible !== false ? 'YES ✓' : 'NO ✕'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="text-slate-500 dark:text-slate-400 block">Price Reclaimed:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {setup.sweepPriceReclaimed !== false ? 'YES ✓' : 'NO ✕'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="text-slate-500 dark:text-slate-400 block">Opposite MSS:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {setup.sweepOppositeMss !== false ? 'YES ✓' : 'NO ✕'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="text-slate-500 dark:text-slate-400 block">Strong Displacement:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {setup.sweepStrongDisplacement !== false ? 'YES ✓' : 'NO ✕'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* H1 SHARP V2 Step-by-Step Flow Progression */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>H1 SHARP V2 Pipeline Validation</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Confidence: {validation.confidenceScore}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1 no-scrollbar">
                  {validation.steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div
                        className={`px-2.5 py-1 rounded-lg border text-nowrap font-medium flex items-center gap-1 shrink-0 ${
                          step.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                            : step.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                        title={step.detail}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : step.status === 'failed' ? (
                          <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        <span>{step.name}</span>
                      </div>
                      {idx < validation.steps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeframe Sequence 4-Step Pipeline */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                MSP-1 Sequence Progression
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* 1. D1 */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1. D1 Bias</span>
                    <span className="text-[10px] font-mono text-slate-400">Macro</span>
                  </div>
                  <div className="py-2 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Bias: </span>
                      <span className="font-bold text-slate-900 dark:text-white">{setup.d1Bias}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Structure: </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{setup.d1Structure}</span>
                    </div>
                  </div>
                  {setup.d1Screenshot && (
                    <button
                      onClick={() =>
                        setActiveLightbox({
                          imageUrl: setup.d1Screenshot!,
                          title: `${setup.setupId} - D1 Structure`,
                          timeframe: 'D1',
                        })
                      }
                      className="mt-1 text-[11px] font-semibold text-blue-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" /> View D1 Chart
                    </button>
                  )}
                </div>

                {/* 2. 4H */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2. 4H Zone</span>
                    <span className="text-[10px] font-mono text-slate-400">Key Level</span>
                  </div>
                  <div className="py-2 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Zone: </span>
                      <span className="font-bold text-slate-900 dark:text-white">{setup.h4Zone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Reaction: </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{setup.h4Reaction}</span>
                    </div>
                    {setup.h4ZoneNotes && (
                      <p className="text-[10px] text-slate-500 truncate">{setup.h4ZoneNotes}</p>
                    )}
                  </div>
                  {setup.h4Screenshot && (
                    <button
                      onClick={() =>
                        setActiveLightbox({
                          imageUrl: setup.h4Screenshot!,
                          title: `${setup.setupId} - 4H Zone`,
                          timeframe: '4H',
                        })
                      }
                      className="mt-1 text-[11px] font-semibold text-purple-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" /> View 4H Chart
                    </button>
                  )}
                </div>

                {/* 3. 1H */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">3. 1H MSS</span>
                    <span className="text-[10px] font-mono text-slate-400">Shift</span>
                  </div>
                  <div className="py-2 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">MSS: </span>
                      <span className="font-bold text-slate-900 dark:text-white">{setup.h1MssDirection}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Swing: </span>
                      <span className="text-slate-700 dark:text-slate-300">{setup.h1LastSwing}</span>
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      {setup.h1CandleCloseConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                          ✓ Candle Close Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                          ✕ No Candle Close
                        </span>
                      )}
                    </div>
                  </div>
                  {setup.h1Screenshot && (
                    <button
                      onClick={() =>
                        setActiveLightbox({
                          imageUrl: setup.h1Screenshot!,
                          title: `${setup.setupId} - 1H MSS Shift`,
                          timeframe: '1H',
                        })
                      }
                      className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" /> View 1H Chart
                    </button>
                  )}
                </div>

                {/* 4. 15M */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">4. 15M Trigger</span>
                    <span className="text-[10px] font-mono text-slate-400">Execution</span>
                  </div>
                  <div className="py-2 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Pullback: </span>
                      {(() => {
                        const pbType =
                          setup.m15PullbackType ||
                          (setup.m15Pullback ? 'Healthy pullback' : 'No pullback');
                        return (
                          <span
                            className={`font-semibold ${
                              pbType === 'Healthy pullback'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : pbType === 'Weak pullback'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {pbType}
                          </span>
                        );
                      })()}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Trigger: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {setup.m15PriceActionTrigger}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Valid: </span>
                      <span className={setup.m15TriggerValid ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                        {setup.m15TriggerValid ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  {setup.m15Screenshot && (
                    <button
                      onClick={() =>
                        setActiveLightbox({
                          imageUrl: setup.m15Screenshot!,
                          title: `${setup.setupId} - 15M Trigger`,
                          timeframe: '15M',
                        })
                      }
                      className="mt-1 text-[11px] font-semibold text-emerald-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" /> View 15M Chart
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Trade Plan & Execution Metrics */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Trade Plan & Risk Management
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Direction</span>
                  <span className="font-bold text-slate-900 dark:text-white">{setup.direction}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Entry</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {setup.entryPrice ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Stop Loss</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {setup.stopLoss ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Take Profit</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {setup.takeProfit ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Planned RR</span>
                  <span
                    className={`font-mono font-bold ${
                      setup.plannedRR && setup.plannedRR >= 2.0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {setup.plannedRR ? `1:${setup.plannedRR.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Actual Realized R</span>
                  <span
                    className={`font-mono font-extrabold ${
                      (setup.actualR ?? 0) > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : (setup.actualR ?? 0) < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {setup.actualR != null ? `${setup.actualR > 0 ? '+' : ''}${setup.actualR.toFixed(2)}R` : '0.00R'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trade Journal Discipline & Execution Audit */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Trade Discipline & Strategy Audit</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Core Parameters</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Entry Quality */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">A. Entry Quality</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        setup.entryQuality === 'A'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : setup.entryQuality === 'B'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      Grade {setup.entryQuality || 'A'}
                    </span>
                  </div>
                </div>

                {/* MFE */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">B. MFE (Peak Excursion)</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs mt-0.5 block">
                    {setup.mfe != null ? `+${setup.mfe}R` : setup.actualR != null && setup.actualR > 0 ? `+${setup.actualR.toFixed(1)}R` : 'N/A'}
                  </span>
                </div>

                {/* Nearest Opposing Zone */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Nearest Opposing Zone</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5 block truncate" title={setup.nearestOpposingZone || 'None before 2R'}>
                    {setup.nearestOpposingZone || 'None before 2R'}
                  </span>
                </div>

                {/* Fixed Rules Kept */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Fixed Rules Kept?</span>
                  <span className="font-semibold text-xs mt-0.5 block">
                    {(setup.ruleFollowed ?? true) ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓ Followed</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">✕ Tampered SL/TP</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Loss Reason Callout (if Loss) */}
              {setup.result === 'Loss' && (
                <div className="p-3 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 text-xs flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase block font-bold">
                      C. Why Did It Lose? (Root Cause)
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {setup.lossReason || 'Normal loss (probability variance)'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono font-bold">
                    Loss Audit
                  </span>
                </div>
              )}
            </div>

            {/* Screenshots Gallery (if any) */}
            {screenshots.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Chart Screenshots ({screenshots.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {screenshots.map((item) => (
                    <div
                      key={item.tf}
                      onClick={() =>
                        setActiveLightbox({
                          imageUrl: item.url!,
                          title: `${setup.setupId} - ${item.label}`,
                          timeframe: item.tf,
                        })
                      }
                      className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden cursor-pointer aspect-video"
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2 justify-between">
                        <span className="text-[10px] font-bold text-white uppercase">{item.tf}</span>
                        <ZoomIn className="w-3.5 h-3.5 text-slate-300 group-hover:text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist Compliance */}
            {setup.checklistState && Object.keys(setup.checklistState).length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  MSP-1 Rule Compliance Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {Object.entries(setup.checklistState).map(([key, isChecked]) => (
                    <div key={key} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                      {isChecked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {setup.notes && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Qualitative Notes & Observations
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {setup.notes}
                </p>
              </div>
            )}
          </div>

          {/* Mobile-Friendly Bottom Action Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-b-none sm:rounded-b-2xl shrink-0 flex items-center justify-between gap-2.5 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[46px] cursor-pointer transition-all active:scale-95 flex items-center justify-center"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onRequestDelete) {
                    onRequestDelete(setup);
                  } else {
                    onDelete(setup.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 min-h-[46px] cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                title="Delete setup"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Delete</span>
              </button>
              <button
                onClick={() => onEdit(setup)}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 min-h-[46px] cursor-pointer transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Setup</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for full clarity charts */}
      {activeLightbox && (
        <MSP1LightboxModal
          isOpen={true}
          onClose={() => setActiveLightbox(null)}
          imageUrl={activeLightbox.imageUrl}
          title={activeLightbox.title}
          timeframe={activeLightbox.timeframe}
        />
      )}
    </>
  );
};
