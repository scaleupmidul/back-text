import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  ShieldAlert,
} from 'lucide-react';
import type { MSP1Setup } from '../../types/index.ts';

interface MSP1DeleteConfirmModalProps {
  isOpen: boolean;
  setup: MSP1Setup | null;
  isDeleting: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const MSP1DeleteConfirmModal: React.FC<MSP1DeleteConfirmModalProps> = ({
  isOpen,
  setup,
  isDeleting,
  error,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !setup) return null;

  const dirColor =
    setup.direction === 'BUY'
      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      : setup.direction === 'SELL'
      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  const resColor =
    setup.result === 'Win'
      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      : setup.result === 'Loss'
      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
      : setup.result === 'Breakeven'
      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';

  const hasScreenshots =
    Boolean(setup.d1Screenshot || setup.screenshots?.d1) ||
    Boolean(setup.h4Screenshot || setup.screenshots?.h4) ||
    Boolean(setup.h1Screenshot || setup.screenshots?.h1) ||
    Boolean(setup.m15Screenshot || setup.screenshots?.m15);

  return (
    <div
      id="delete-confirm-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div
        id="delete-confirm-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 relative my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Close 'X' Button */}
        {!isDeleting && (
          <button
            id="close-delete-modal-x"
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Cancel"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          {/* Danger Warning Icon */}
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3.5 shadow-xs">
            <Trash2 className="w-7 h-7" />
          </div>

          <h3
            id="delete-confirm-title"
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
          >
            Delete Backtest Setup?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
            Please review the details below before confirming deletion.
          </p>

          {/* Setup Summary Card (Helps user avoid deleting by mistake) */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 mb-4 text-left space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {setup.setupId}
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {setup.market || 'XAU/USD'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${dirColor}`}>
                  {setup.direction}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${resColor}`}>
                  {setup.result}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date: <strong className="text-slate-800 dark:text-slate-200">{setup.date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Session: <strong className="text-slate-800 dark:text-slate-200">{setup.session}</strong></span>
              </div>
              {setup.plannedRR != null && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Target className="w-3.5 h-3.5 text-slate-400" />
                  <span>Planned: <strong className="text-slate-800 dark:text-slate-200">1:{setup.plannedRR.toFixed(2)}</strong></span>
                </div>
              )}
              {setup.actualR != null && (
                <div className="flex items-center gap-1.5 font-mono">
                  {setup.actualR >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span>
                    Outcome:{' '}
                    <strong
                      className={
                        setup.actualR > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : setup.actualR < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500'
                      }
                    >
                      {setup.actualR > 0 ? '+' : ''}
                      {setup.actualR.toFixed(2)}R
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {hasScreenshots && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                📷 Attached multi-timeframe screenshots will also be permanently deleted.
              </div>
            )}
          </div>

          {/* Warning Message Box */}
          <div className="w-full p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs mb-4 text-left flex items-start gap-2.5 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-200">
                This action is permanent and cannot be undone.
              </p>
              <p className="mt-0.5 text-[11px] text-rose-700 dark:text-rose-300/90">
                This confirmation ensures intentional deletion. All metrics and journal records will be updated immediately.
              </p>
            </div>
          </div>

          {/* Error Message if deletion failed */}
          {error && (
            <div className="w-full p-3 mb-4 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 text-left font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full pt-1">
            <button
              id="cancel-delete-setup-btn"
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="w-full sm:w-1/2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[42px] cursor-pointer transition-colors flex items-center justify-center disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-setup-btn"
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="w-full sm:w-1/2 px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white min-h-[42px] cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs active:scale-[0.98]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Setup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
