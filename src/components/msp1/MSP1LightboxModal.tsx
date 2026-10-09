import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface MSP1LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  timeframe?: string;
}

export const MSP1LightboxModal: React.FC<MSP1LightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  timeframe,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            {timeframe && (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {timeframe}
              </span>
            )}
            <h3 className="text-sm font-semibold text-white tracking-wide truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container with high clarity */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-slate-950/60">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
