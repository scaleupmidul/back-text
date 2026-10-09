import React, { useState, useMemo } from 'react';
import type { MSP1Setup, TradingStrategy } from '../types/index.ts';
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileJson,
  Layers,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { getEffectiveStrategy } from '../utils/performanceCalculations.ts';
import { api } from '../services/api.ts';

interface TradeHistoryViewProps {
  setups: MSP1Setup[];
  onOpenTradeModal: () => void;
  onEditTrade: (setup: MSP1Setup) => void;
  onDeleteTrade: (setup: MSP1Setup) => void;
  onSelectDetail: (setup: MSP1Setup) => void;
}

export const TradeHistoryView: React.FC<TradeHistoryViewProps> = ({
  setups,
  onOpenTradeModal,
  onEditTrade,
  onDeleteTrade,
  onSelectDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<'ALL' | 'LSE' | 'DRE'>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [sessionFilter, setSessionFilter] = useState<string>('ALL');
  const [ruleFilter, setRuleFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

  // Filter executed trades
  const filteredTrades = useMemo(() => {
    return setups.filter((s) => {
      // Exclude missed setups from trade history table (they live in Missed Setups Log)
      if (s.isMissedSetup) return false;

      // Strategy
      const strat = getEffectiveStrategy(s);
      if (strategyFilter !== 'ALL' && strat !== strategyFilter) return false;

      // Direction
      if (directionFilter !== 'ALL' && s.direction !== directionFilter) return false;

      // Outcome
      if (outcomeFilter !== 'ALL') {
        if (s.result !== outcomeFilter) return false;
      }

      // Session
      if (sessionFilter !== 'ALL') {
        if (!s.session.includes(sessionFilter)) return false;
      }

      // Rule Followed
      if (ruleFilter !== 'ALL') {
        const followed = s.ruleFollowed ?? true;
        if (ruleFilter === 'YES' && !followed) return false;
        if (ruleFilter === 'NO' && followed) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = s.setupId.toLowerCase().includes(q);
        const matchNotes = (s.notes || '').toLowerCase().includes(q);
        const matchMarket = (s.market || '').toLowerCase().includes(q);
        const matchLossReason = (s.lossReason || '').toLowerCase().includes(q);
        if (!matchId && !matchNotes && !matchMarket && !matchLossReason) return false;
      }

      return true;
    });
  }, [setups, strategyFilter, directionFilter, outcomeFilter, sessionFilter, ruleFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, currentPage, pageSize]);

  const handleExportCsv = async () => {
    try {
      setExporting('csv');
      await api.downloadCsvExport();
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportJson = async () => {
    try {
      setExporting('json');
      await api.downloadJsonExport();
    } catch (err) {
      console.error('Failed to export JSON:', err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Trade History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Complete historical audit trail of executed backtest setups with verified outcomes and chart evidence.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting !== null}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Export trades as clean CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{exporting === 'csv' ? 'Exporting...' : 'CSV'}</span>
          </button>

          {/* JSON Export */}
          <button
            type="button"
            onClick={handleExportJson}
            disabled={exporting !== null}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Export complete backtest JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>{exporting === 'json' ? 'Exporting...' : 'JSON'}</span>
          </button>

          {/* Record Trade CTA */}
          <button
            type="button"
            onClick={onOpenTradeModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Trade</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800/90 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, notes, market, level..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Strategy Filter */}
          <div>
            <select
              value={strategyFilter}
              onChange={(e) => {
                setStrategyFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Strategies</option>
              <option value="LSE">LSE Only</option>
              <option value="DRE">DRE Only</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <select
              value={directionFilter}
              onChange={(e) => {
                setDirectionFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Directions</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Outcomes</option>
              <option value="Win">Wins Only</option>
              <option value="Loss">Losses Only</option>
              <option value="Breakeven">Breakeven Only</option>
            </select>
          </div>

          {/* Rule Followed */}
          <div>
            <select
              value={ruleFilter}
              onChange={(e) => {
                setRuleFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Rule Discipline (All)</option>
              <option value="YES">Rule Followed</option>
              <option value="NO">Rule Broken</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>Showing {filteredTrades.length} matching trades</span>
          {(strategyFilter !== 'ALL' || directionFilter !== 'ALL' || outcomeFilter !== 'ALL' || ruleFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStrategyFilter('ALL');
                setDirectionFilter('ALL');
                setOutcomeFilter('ALL');
                setSessionFilter('ALL');
                setRuleFilter('ALL');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Trades Table */}
      {filteredTrades.length === 0 ? (
        <div className="bg-[#0b101b] border border-slate-800 rounded-xl p-10 text-center space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Trades Match Current Filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, strategy, or outcome filters to see trade entries.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#0b101b] border border-slate-800/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Trade ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Strategy</th>
                  <th className="py-3 px-4">Dir</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4 text-right">Planned RR</th>
                  <th className="py-3 px-4 text-right">Result (R)</th>
                  <th className="py-3 px-4 text-center">Outcome</th>
                  <th className="py-3 px-4 text-center">Rule Kept</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedTrades.map((trade) => {
                  const strat = getEffectiveStrategy(trade);
                  const isWin = trade.result === 'Win';
                  const isLoss = trade.result === 'Loss';
                  const isBE = trade.result === 'Breakeven';
                  const rVal = trade.actualR != null ? trade.actualR : 0;
                  const hasScreenshots = Boolean(
                    trade.screenshots?.beforeEntry ||
                    trade.screenshots?.entry ||
                    trade.screenshots?.afterTrade ||
                    trade.d1Screenshot ||
                    trade.h1Screenshot ||
                    trade.m15Screenshot
                  );

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-900/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectDetail(trade)}
                    >
                      {/* Trade ID */}
                      <td className="py-3 px-4 font-mono font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{trade.setupId}</span>
                          {hasScreenshots && (
                            <span title="Chart screenshots attached" className="inline-flex">
                              <Camera className="w-3 h-3 text-slate-400" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {trade.date}
                      </td>

                      {/* Strategy */}
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-sm border ${
                          strat === 'LSE'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          {strat}
                        </span>
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={trade.direction === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                          {trade.direction}
                        </span>
                      </td>

                      {/* Session */}
                      <td className="py-3 px-4 text-slate-300">
                        {trade.session}
                      </td>

                      {/* Planned RR */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        {trade.plannedRR ? `1:${trade.plannedRR.toFixed(2)}` : '—'}
                      </td>

                      {/* Result in R */}
                      <td className={`py-3 px-4 text-right font-mono tabular-nums font-bold ${
                        rVal > 0 ? 'text-emerald-400' : rVal < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {rVal > 0 ? `+${rVal.toFixed(2)}` : rVal.toFixed(2)} R
                      </td>

                      {/* Outcome Badge */}
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                          isWin
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : isLoss
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {trade.result}
                        </span>
                      </td>

                      {/* Rule Followed */}
                      <td className="py-3 px-4 text-center">
                        {(trade.ruleFollowed ?? true) ? (
                          <span className="text-[11px] font-mono text-emerald-400">Yes</span>
                        ) : (
                          <span className="text-[11px] font-mono text-rose-400 font-bold">No</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {trade.notes || (trade.lossReason ? `Loss: ${trade.lossReason}` : '—')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectDetail(trade)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTrade(trade)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Edit Trade Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTrade(trade)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                            title="Delete Trade Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
