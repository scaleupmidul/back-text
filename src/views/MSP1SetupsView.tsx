import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  Layers,
  TrendingUp,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  FileSpreadsheet,
  FileJson,
  RotateCcw,
  X,
  LayoutGrid,
  List,
  Camera,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';
import type {
  MSP1Setup,
  MSP1TradeDirection,
  MSP1Result,
  MSP1Session,
  MSP1D1Bias,
  MSP1H4Zone,
  MSP1MSSDirection,
  MSP1MarketCondition,
  MSP1HighImpactNews,
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { msp1Store } from '../utils/msp1Store.ts';
import { MSP1SetupModal } from '../components/msp1/MSP1SetupModal.tsx';
import { MSP1DetailModal } from '../components/msp1/MSP1DetailModal.tsx';
import { MSP1DeleteConfirmModal } from '../components/msp1/MSP1DeleteConfirmModal.tsx';
import { MSP1LightboxModal } from '../components/msp1/MSP1LightboxModal.tsx';
import { MSP1BatchExportModal } from '../components/msp1/MSP1BatchExportModal.tsx';

export const MSP1SetupsView: React.FC = () => {
  const [setups, setSetups] = useState<MSP1Setup[]>(() => msp1Store.getSetups() || []);
  const [loading, setLoading] = useState(() => !msp1Store.getSetups());
  const [nextSetupId, setNextSetupId] = useState(() => msp1Store.getNextId());

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetup, setEditingSetup] = useState<MSP1Setup | null>(null);
  const [detailSetup, setDetailSetup] = useState<MSP1Setup | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MSP1Setup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeLightbox, setActiveLightbox] = useState<{ imageUrl: string; title: string; timeframe?: string } | null>(null);

  // View mode: defaults to 'table' (side-by-side) on PC (width >= 1024), 'card' on mobile
  const [viewMode, setViewMode] = useState<'card' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('msp1_view_mode') as 'card' | 'table' | null;
      if (saved === 'card' || saved === 'table') return saved;
      return window.innerWidth >= 1024 ? 'table' : 'card';
    }
    return 'table';
  });

  const handleSetViewMode = (mode: 'card' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem('msp1_view_mode', mode);
    } catch {}
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination state (fixed 35 setups per page for smooth and fast navigation)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 35;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const [directionFilter, setDirectionFilter] = useState<string>('All');
  const [d1BiasFilter, setD1BiasFilter] = useState<string>('All');
  const [h4ZoneFilter, setH4ZoneFilter] = useState<string>('All');
  const [mssFilter, setMssFilter] = useState<string>('All');
  const [sessionFilter, setSessionFilter] = useState<string>('All');
  const [marketConditionFilter, setMarketConditionFilter] = useState<string>('All');
  const [newsFilter, setNewsFilter] = useState<string>('All');
  const [pullbackFilter, setPullbackFilter] = useState<string>('All');
  const [resultFilter, setResultFilter] = useState<string>('All');
  const [liquidityFilter, setLiquidityFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof MSP1Setup>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Loading & export state
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = msp1Store.subscribe((updatedSetups, nextId) => {
      setSetups(updatedSetups);
      setNextSetupId(nextId);
      setLoading(false);
    });

    const loadData = async () => {
      try {
        if (!msp1Store.getSetups()) {
          setLoading(true);
        }
        const [data, nextId] = await Promise.all([
          api.getMSP1Setups().catch(() => []),
          api.getNextMSP1SetupId().catch(() => 'MSP1-0001'),
        ]);
        msp1Store.setData(data, nextId);
      } catch (err) {
        console.error('Failed to load MSP-1 setups:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => unsubscribe();
  }, []);

  const handleSaveSetup = async (
    setupData: Omit<MSP1Setup, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingSetup) {
      const updated = await api.updateMSP1Setup(editingSetup.id, setupData);
      msp1Store.updateSetup(updated);
    } else {
      const created = await api.addMSP1Setup(setupData);
      const nextId = await api.getNextMSP1SetupId().catch(() => 'MSP1-0001');
      msp1Store.addSetup(created, nextId);
    }
  };

  const handleDeleteSetup = async (id: string) => {
    try {
      await api.deleteMSP1Setup(id);
      msp1Store.removeSetup(id);
      if (detailSetup && detailSetup.id === id) {
        setDetailSetup(null);
      }
      api.getNextMSP1SetupId().then((nextId) => {
        msp1Store.setData(msp1Store.getSetups() || [], nextId);
      }).catch(() => {});
      return true;
    } catch (err: any) {
      console.error('Failed to delete setup:', err);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const targetId = deleteCandidate.id;
      const targetSetupId = deleteCandidate.setupId;
      await handleDeleteSetup(targetId);
      setDeleteCandidate(null);
      setToastNotification({
        type: 'success',
        text: `Setup ${targetSetupId} has been successfully deleted.`,
      });
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete setup. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportJson = async () => {
    try {
      setExportingJson(true);
      await api.exportMSP1Json();
      setToastNotification({
        type: 'success',
        text: 'MSP-1 backtest setups exported to JSON successfully.',
      });
      setTimeout(() => setToastNotification(null), 3500);
    } catch (err: any) {
      console.warn('Server JSON export failed, using structured client export fallback:', err);
      try {
        const clientSetups = msp1Store.getSetups() || setups;
        const sorted = [...clientSetups].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const validTrades = sorted.filter(
          (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
        );
        const wins = validTrades.filter((s) => s.result === 'Win');
        const losses = validTrades.filter((s) => s.result === 'Loss');
        const breakevens = validTrades.filter((s) => s.result === 'Breakeven');
        const noTrades = sorted.filter(
          (s) => s.direction === 'NO TRADE' || ['No Trade', 'Incomplete Setup', 'Invalid Setup'].includes(s.result)
        );
        const decisive = wins.length + losses.length;
        const winRate = decisive > 0 ? (wins.length / decisive) * 100 : null;
        const totalR = sorted.reduce((acc, s) => acc + (s.actualR || 0), 0);
        const expectancy = validTrades.length > 0 ? totalR / validTrades.length : null;

        const healthyPbTrades = sorted.filter(
          (s) => (s.m15PullbackType === 'Healthy pullback') || (!s.m15PullbackType && s.m15Pullback === true)
        );
        const weakPbTrades = sorted.filter((s) => s.m15PullbackType === 'Weak pullback');
        const noPbTrades = sorted.filter(
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

        const exportData = {
          system: 'MSP-1',
          framework: 'Market Structure → Pullback → Price Action',
          asset_market: 'Gold (XAU/USD)',
          version: 'MSP-1.0',
          exported_at: new Date().toISOString(),
          chatgpt_system_prompt:
            'You are an expert quantitative trading auditor and technical price action analyst. Analyze the following systematic MSP-1 backtest trades on Gold (XAU/USD). Each trade is structured with D1 market structure, 4H key reaction zone, 1H MSS candle close confirmation, 15M pullback (healthy vs weak vs no pullback) and trigger, trade execution plan, realized R results, and all attached chart screenshots. Review win rate, expectancy, whether healthy pullbacks outperform weak pullbacks, MFE reach, and root cause reasons for losses.',
          system_rules_summary: {
            step_1_d1_market_structure: 'Trade strictly in alignment with Daily market structure (HH/HL for Bullish, LL/LH for Bearish). If unclear: No Trade.',
            step_2_4h_key_zone: 'Price must retrace into a valid 4H Demand or Supply zone and show rejection reaction.',
            step_3_1h_mss_confirmation: '1H must create a Market Structure Shift (MSS) breaking previous swing point AND a completed 1H candle body must CLOSE beyond the swing level. Wick-only breaks are invalid.',
            step_4_15m_entry_trigger: 'After 1H MSS, price must perform a pullback (categorized as Healthy or Weak) into support/resistance and print a clean 15M price action trigger (Rejection, Pin bar, Engulfing).',
            risk_management: 'Fixed 1R risk per trade. Minimum planned Risk:Reward of 1:2.00. No opposing 4H/1H zones before 2R target.',
          },
          dataset_overview: {
            total_setups_recorded: sorted.length,
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
          setups: sorted.map((s) => {
            const d1Img = s.d1Screenshot || s.screenshots?.d1 || '';
            const h4Img = s.h4Screenshot || s.screenshots?.h4 || '';
            const h1Img = s.h1Screenshot || s.screenshots?.h1 || '';
            const m15Img = s.m15Screenshot || s.screenshots?.m15 || '';
            const otherImgs = s.screenshots?.other || [];
            const pullbackType = s.m15PullbackType || (s.m15Pullback ? 'Healthy pullback' : 'No pullback');

            const summaryLine = `${s.setupId} | ${s.date} (${s.session}) | ${s.direction} ${s.market || 'XAU/USD'} | D1: ${s.d1Bias} (${s.d1Structure}) | 4H: ${s.h4Zone} (Reaction: ${s.h4Reaction}) | 1H: ${s.h1MssDirection} (1H Close: ${s.h1CandleCloseConfirmed ? 'YES' : 'NO'}) | 15M: ${pullbackType} + ${s.m15PriceActionTrigger} (Valid: ${s.m15TriggerValid ? 'YES' : 'NO'}) | Entry: ${s.entryPrice ?? 'N/A'}, SL: ${s.stopLoss ?? 'N/A'}, TP: ${s.takeProfit ?? 'N/A'} (RR: ${s.plannedRR ? `1:${s.plannedRR.toFixed(2)}` : 'N/A'}) | Result: ${s.result} (${s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R'}) | Rules Kept: ${s.ruleFollowed ? 'YES' : 'NO'} | Loss Reason: ${s.result === 'Loss' ? (s.lossReason || 'Normal loss') : 'N/A'}`;

            return {
              setup_id: s.setupId,
              date: s.date,
              market: s.market || 'XAU/USD',
              session: s.session,
              timeframe_range: s.timeframeRange || '',
              direction: s.direction,
              chatgpt_one_line_summary: summaryLine,
              step_1_d1_market_structure: {
                bias: s.d1Bias,
                structure: s.d1Structure,
                chart_image: d1Img || null,
              },
              step_2_4h_key_zone: {
                zone_type: s.h4Zone,
                reaction_confirmed: s.h4Reaction,
                zone_notes: s.h4ZoneNotes || '',
                chart_image: h4Img || null,
              },
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
              step_4_15m_entry_trigger: {
                pullback_occurred: s.m15Pullback,
                pullback_type: pullbackType,
                trigger_direction: s.m15TriggerDirection,
                price_action_trigger: s.m15PriceActionTrigger,
                trigger_valid: s.m15TriggerValid,
                chart_image: m15Img || null,
              },
              trade_plan: {
                direction: s.direction,
                entry_price: s.entryPrice ?? null,
                stop_loss: s.stopLoss ?? null,
                take_profit: s.takeProfit ?? null,
                planned_rr: s.plannedRR ?? null,
                planned_rr_ratio: s.plannedRR ? `1:${s.plannedRR.toFixed(2)}` : null,
              },
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

              chart_screenshots: {
                d1_chart_image: d1Img || null,
                four_hour_chart_image: h4Img || null,
                one_hour_chart_image: h1Img || null,
                fifteen_minute_chart_image: m15Img || null,
                other_charts: otherImgs,
                total_images_attached: [d1Img, h4Img, h1Img, m15Img, ...otherImgs].filter(Boolean).length,
                has_chart_images: Boolean(d1Img || h4Img || h1Img || m15Img || otherImgs.length > 0),
              },
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

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date().toISOString().split('T')[0];
        a.download = `MSP1_Gold_Backtest_${today}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setToastNotification({
          type: 'success',
          text: 'MSP-1 backtest setups exported to JSON successfully.',
        });
        setTimeout(() => setToastNotification(null), 3500);
      } catch (clientErr: any) {
        setToastNotification({
          type: 'error',
          text: clientErr.message || 'Export JSON failed.',
        });
      }
    } finally {
      setExportingJson(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      await api.exportMSP1Csv();
      setToastNotification({
        type: 'success',
        text: 'MSP-1 backtest setups exported to CSV spreadsheet successfully.',
      });
      setTimeout(() => setToastNotification(null), 3500);
    } catch (err: any) {
      setToastNotification({
        type: 'error',
        text: err.message || 'Export CSV failed.',
      });
    } finally {
      setExportingCsv(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDirectionFilter('All');
    setD1BiasFilter('All');
    setH4ZoneFilter('All');
    setMssFilter('All');
    setSessionFilter('All');
    setMarketConditionFilter('All');
    setNewsFilter('All');
    setPullbackFilter('All');
    setResultFilter('All');
  };

  const hasActiveFilters =
    searchQuery ||
    directionFilter !== 'All' ||
    d1BiasFilter !== 'All' ||
    h4ZoneFilter !== 'All' ||
    mssFilter !== 'All' ||
    sessionFilter !== 'All' ||
    marketConditionFilter !== 'All' ||
    newsFilter !== 'All' ||
    pullbackFilter !== 'All' ||
    resultFilter !== 'All';

  // Filtered & Sorted Setups
  const filteredSetups = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();

    return setups
      .filter((s) => {
        if (q) {
          const matchId = s.setupId?.toLowerCase().includes(q);
          const matchNotes = s.notes?.toLowerCase().includes(q);
          const matchMarket = s.market?.toLowerCase().includes(q);
          const matchZoneNotes = s.h4ZoneNotes?.toLowerCase().includes(q);
          if (!matchId && !matchNotes && !matchMarket && !matchZoneNotes) return false;
        }

        if (directionFilter !== 'All' && s.direction !== directionFilter) return false;
        if (d1BiasFilter !== 'All' && s.d1Bias !== d1BiasFilter) return false;
        if (h4ZoneFilter !== 'All' && s.h4Zone !== h4ZoneFilter) return false;
        if (mssFilter !== 'All' && s.h1MssDirection !== mssFilter) return false;
        if (sessionFilter !== 'All' && s.session !== sessionFilter) return false;
        if (marketConditionFilter !== 'All' && s.marketCondition !== marketConditionFilter) return false;
        if (newsFilter !== 'All' && s.highImpactNewsNearby !== newsFilter) return false;
        if (pullbackFilter !== 'All') {
          const pbType = s.m15PullbackType || (s.m15Pullback ? 'Healthy pullback' : 'No pullback');
          if (pbType !== pullbackFilter) return false;
        }
        if (resultFilter !== 'All' && s.result !== resultFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (valA == null) valA = '';
        if (valB == null) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const cmp = String(valA).localeCompare(String(valB));
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [
    setups,
    deferredSearchQuery,
    directionFilter,
    d1BiasFilter,
    h4ZoneFilter,
    mssFilter,
    sessionFilter,
    marketConditionFilter,
    newsFilter,
    pullbackFilter,
    resultFilter,
    sortField,
    sortOrder,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (directionFilter !== 'All') count++;
    if (d1BiasFilter !== 'All') count++;
    if (h4ZoneFilter !== 'All') count++;
    if (mssFilter !== 'All') count++;
    if (sessionFilter !== 'All') count++;
    if (marketConditionFilter !== 'All') count++;
    if (newsFilter !== 'All') count++;
    if (pullbackFilter !== 'All') count++;
    if (resultFilter !== 'All') count++;
    return count;
  }, [
    directionFilter,
    d1BiasFilter,
    h4ZoneFilter,
    mssFilter,
    sessionFilter,
    marketConditionFilter,
    newsFilter,
    pullbackFilter,
    resultFilter,
  ]);

  const toggleSort = (field: keyof MSP1Setup) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Reset pagination to first page whenever filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    deferredSearchQuery,
    directionFilter,
    d1BiasFilter,
    h4ZoneFilter,
    mssFilter,
    sessionFilter,
    marketConditionFilter,
    newsFilter,
    resultFilter,
    sortField,
    sortOrder,
  ]);

  // Pagination calculations
  const totalItems = filteredSetups.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedSetups = filteredSetups.slice(startIndex, endIndex);

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const handlePageChange = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
    const container = document.getElementById('msp1-journal-table-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              MSP-1 Backtest Journal
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              Gold (XAU/USD)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manual historical recording system: D1 Market Structure → 4H Key Zone → 1H Shift & Candle Close → 15M Trigger
          </p>
        </div>

        {/* Buttons (Responsive Full Width on Mobile) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <button
            onClick={() => setIsBatchExportOpen(true)}
            disabled={setups.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
            title="Split and download in parts for ChatGPT analysis"
          >
            <Bot className="w-3.5 h-3.5 text-amber-500" />
            <span>Split Export</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={exportingJson || setups.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
            title="Download complete backtesting dataset as valid standard JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-500" />
            <span>{exportingJson ? 'Exporting...' : 'Export JSON'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exportingCsv || setups.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
            title="Download backtest setups as a CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>{exportingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => {
              setEditingSetup(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Log MSP-1 Setup</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification Banner */}
      {toastNotification && (
        <div
          id="setup-toast-banner"
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-in slide-in-from-top-2 duration-150 ${
            toastNotification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{toastNotification.text}</span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Setup ID, market, session, notes..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[44px]"
            />
          </div>

          {/* Action Row: Filter Toggle, View Switcher (Cards / Table), Reset */}
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {/* Toggle Filters Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSetViewMode('card')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px] cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Card View (Mobile / Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-xs">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('table')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px] cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Table View (Desktop / Side-by-Side)"
              >
                <List className="w-4 h-4" />
                <span className="text-xs">Table</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer shrink-0 min-h-[44px]"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Dropdown Filters Grid */}
        {isFilterOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs animate-in fade-in duration-150">
            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">Direction</label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All Directions</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="BUY">BUY</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="SELL">SELL</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="NO TRADE">NO TRADE</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">D1 Bias</label>
              <select
                value={d1BiasFilter}
                onChange={(e) => setD1BiasFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All Biases</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Bullish">Bullish</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Bearish">Bearish</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Neutral / Unclear">Neutral / Unclear</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">4H Zone</label>
              <select
                value={h4ZoneFilter}
                onChange={(e) => setH4ZoneFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All Zones</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Demand">Demand</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Supply">Supply</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="None">None</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">1H MSS</label>
              <select
                value={mssFilter}
                onChange={(e) => setMssFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All MSS</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Bullish MSS">Bullish MSS</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Bearish MSS">Bearish MSS</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="No MSS">No MSS</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">Session</label>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All Sessions</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="London">London</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="New York">New York</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="London + New York">London + NY</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Asian">Asian</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Other / Unknown">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">Condition</label>
              <select
                value={marketConditionFilter}
                onChange={(e) => setMarketConditionFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All Conditions</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Trending">Trending</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Ranging">Ranging</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Choppy">Choppy</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Unclear">Unclear</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">News Nearby</label>
              <select
                value={newsFilter}
                onChange={(e) => setNewsFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All News</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="No">No News</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Yes">News Nearby</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">15M Pullback</label>
              <select
                value={pullbackFilter}
                onChange={(e) => setPullbackFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All Pullbacks</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Healthy pullback">Healthy Pullback</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Weak pullback">Weak Pullback</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="No pullback">No Pullback</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-1 font-semibold">Result</label>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="w-full py-2 px-2 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 min-h-[40px]"
              >
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="All">All Results</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Win">Win</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Loss">Loss</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Breakeven">Breakeven</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="No Trade">No Trade</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Incomplete Setup">Incomplete</option>
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="Invalid Setup">Invalid</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Setups Count & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-600 dark:text-slate-300 px-1 font-medium">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of{' '}
          <strong className="text-slate-900 dark:text-white">{totalItems}</strong> matching setups (Total recorded: {setups.length})
        </span>
        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Page {safeCurrentPage} of {totalPages}
        </span>
      </div>

      {/* Main Setups Display (Cards or Table) */}
      <div
        id="msp1-journal-table-container"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
      >
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading MSP-1 backtest setups...</div>
        ) : filteredSetups.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No MSP-1 setups found matching your filters.
            </p>
            <p className="text-xs text-slate-500">
              {setups.length === 0
                ? 'Start by recording your first historical Gold situation.'
                : 'Try adjusting or clearing your filters.'}
            </p>
            {setups.length === 0 && (
              <button
                onClick={() => {
                  setEditingSetup(null);
                  setIsModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log First MSP-1 Setup</span>
              </button>
            )}
          </div>
        ) : viewMode === 'card' ? (
          /* Mobile-First Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-950/30">
            {paginatedSetups.map((setup) => {
              const dirColor =
                setup.direction === 'BUY'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : setup.direction === 'SELL'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30';

              const resColor =
                setup.result === 'Win'
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : setup.result === 'Loss'
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : setup.result === 'Breakeven'
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700';

              const screenshots = [
                { tf: 'D1', url: setup.d1Screenshot || setup.screenshots?.d1 },
                { tf: '4H', url: setup.h4Screenshot || setup.screenshots?.h4 },
                { tf: '1H', url: setup.h1Screenshot || setup.screenshots?.h1 },
                { tf: '15M', url: setup.m15Screenshot || setup.screenshots?.m15 },
              ].filter((s) => Boolean(s.url)) as { tf: string; url: string }[];

              return (
                <div
                  key={setup.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {setup.setupId}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {setup.market || 'XAU/USD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-medium">{setup.date}</span>
                          <span>•</span>
                          <span>{setup.session}</span>
                        </div>
                      </div>

                      {/* Direction & Outcome Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${dirColor}`}>
                          {setup.direction}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${resColor}`}>
                          {setup.result}
                          {setup.actualR != null && setup.result !== 'No Trade' && (
                            <span className="ml-1 font-mono">
                              ({setup.actualR > 0 ? '+' : ''}{setup.actualR.toFixed(2)}R)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* 4-Step Checklist Matrix */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">1. D1 Bias</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {setup.d1Bias}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">2. 4H Zone</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {setup.h4Zone} {setup.h4Reaction === 'Yes' ? '✓' : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">3. 1H MSS</span>
                        <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          <span>{setup.h1MssDirection}</span>
                          {setup.h1CandleCloseConfirmed && (
                            <span className="text-[9px] px-1 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              CLOSE
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">4. 15M Trigger & Pullback</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                            {setup.m15PriceActionTrigger || 'N/A'}
                          </span>
                          {(() => {
                            const pb = setup.m15PullbackType || (setup.m15Pullback ? 'Healthy pullback' : 'No pullback');
                            return (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  pb === 'Healthy pullback'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : pb === 'Weak pullback'
                                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                }`}
                              >
                                {pb === 'Healthy pullback' ? 'Healthy PB' : pb === 'Weak pullback' ? 'Weak PB' : 'No PB'}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Trade Levels Grid */}
                    {setup.direction !== 'NO TRADE' && (
                      <div className="grid grid-cols-4 gap-2 text-center text-xs py-1.5 px-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        <div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase block">Entry</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {setup.entryPrice ?? '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase block">SL</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                            {setup.stopLoss ?? '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase block">TP</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {setup.takeProfit ?? '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase block">Plan RR</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                            {setup.plannedRR ? `1:${setup.plannedRR.toFixed(2)}` : '—'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Execution & Audit Strip */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          setup.entryQuality === 'A'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : setup.entryQuality === 'B'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        }`}
                        title="Entry Setup Quality Grade"
                      >
                        Grade {setup.entryQuality || 'A'}
                      </span>
                      {setup.mfe != null && (
                        <span
                          className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold"
                          title="Maximum Favorable Excursion"
                        >
                          MFE: +{setup.mfe}R
                        </span>
                      )}
                      {setup.ruleFollowed === false && (
                        <span
                          className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-semibold"
                          title="Rule Violation: Moved SL or altered TP mid-trade"
                        >
                          Tampered SL/TP
                        </span>
                      )}
                      {setup.result === 'Loss' && setup.lossReason && (
                        <span
                          className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900 truncate max-w-[170px]"
                          title={`Loss Reason: ${setup.lossReason}`}
                        >
                          Loss: {setup.lossReason}
                        </span>
                      )}
                    </div>

                    {/* Chart Thumbnails (if available) */}
                    {screenshots.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">Charts:</span>
                        {screenshots.map((item) => (
                          <button
                            key={item.tf}
                            type="button"
                            onClick={() =>
                              setActiveLightbox({
                                imageUrl: item.url,
                                title: `${setup.setupId} - ${item.tf} Chart`,
                                timeframe: item.tf,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono hover:bg-amber-500/20 hover:text-amber-600 transition-colors cursor-pointer shrink-0 min-h-[32px]"
                            title={`View ${item.tf} screenshot`}
                          >
                            <Camera className="w-3 h-3 text-amber-500" />
                            <span>{item.tf}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Observation Notes snippet */}
                    {setup.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 line-clamp-2">
                        "{setup.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Action Buttons (min-h-[44px] for finger tap compliance) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDetailSetup(setup)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer min-h-[44px] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSetup(setup);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer min-h-[44px] transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      id={`delete-card-btn-${setup.setupId}`}
                      onClick={() => {
                        setDeleteCandidate(setup);
                        setDeleteError(null);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer min-h-[44px] transition-colors"
                      title={`Delete setup ${setup.setupId}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th
                    onClick={() => toggleSort('setupId')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Setup ID</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('date')}
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Dir</th>
                  <th className="py-3 px-3">D1 Bias</th>
                  <th className="py-3 px-3">4H Zone</th>
                  <th className="py-3 px-3">1H MSS</th>
                  <th className="py-3 px-3">15M Trigger</th>
                  <th className="py-3 px-2 text-right">Entry</th>
                  <th className="py-3 px-2 text-right">SL</th>
                  <th className="py-3 px-2 text-right">TP</th>
                  <th
                    onClick={() => toggleSort('plannedRR')}
                    className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>RR</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-2 text-center" title="Setup Quality Grade">
                    Grade
                  </th>
                  <th className="py-3 px-2 text-right" title="Maximum Favorable Excursion">
                    MFE
                  </th>
                  <th
                    onClick={() => toggleSort('result')}
                    className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Result</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('actualR')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Actual R</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedSetups.map((setup) => {
                  const dirBadge =
                    setup.direction === 'BUY'
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold'
                      : setup.direction === 'SELL'
                      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold';

                  const resultBadge =
                    setup.result === 'Win'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                      : setup.result === 'Loss'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-700'
                      : setup.result === 'Breakeven'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700';

                  return (
                    <tr
                      key={setup.id}
                      onClick={() => setDetailSetup(setup)}
                      className="hover:bg-amber-500/5 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      {/* Setup ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {setup.setupId}
                      </td>

                      {/* Date & Session */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        <div>{setup.date}</div>
                        <div className="text-[10px] text-slate-400">{setup.session}</div>
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dirBadge}`}>
                          {setup.direction}
                        </span>
                      </td>

                      {/* D1 Bias */}
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {setup.d1Bias}
                      </td>

                      {/* 4H Zone */}
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {setup.h4Zone}
                      </td>

                      {/* 1H MSS + Candle close confirmation */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {setup.h1MssDirection}
                        </div>
                        <div className="text-[10px] flex items-center gap-1">
                          {setup.h1CandleCloseConfirmed ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✓ Close Confirmed
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold">✕ No Close</span>
                          )}
                        </div>
                      </td>

                      {/* 15M Trigger */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div className="truncate max-w-[130px] font-semibold text-xs">
                          {setup.m15PriceActionTrigger}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {(() => {
                            const pb = setup.m15PullbackType || (setup.m15Pullback ? 'Healthy pullback' : 'No pullback');
                            return (
                              <span
                                className={`font-medium ${
                                  pb === 'Healthy pullback'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : pb === 'Weak pullback'
                                    ? 'text-amber-600 dark:text-amber-400 font-bold'
                                    : 'text-rose-500'
                                }`}
                              >
                                {pb}
                              </span>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Entry, SL, TP */}
                      <td className="py-3 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                        {setup.entryPrice != null ? setup.entryPrice.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-rose-600 dark:text-rose-400">
                        {setup.stopLoss != null ? setup.stopLoss.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {setup.takeProfit != null ? setup.takeProfit.toFixed(1) : '-'}
                      </td>

                      {/* Planned RR */}
                      <td className="py-3 px-2 text-right font-mono font-bold">
                        {setup.plannedRR != null ? (
                          <span
                            className={
                              setup.plannedRR >= 2.0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }
                          >
                            1:{setup.plannedRR.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Quality Grade */}
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            setup.entryQuality === 'A'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : setup.entryQuality === 'B'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {setup.entryQuality || 'A'}
                        </span>
                      </td>

                      {/* MFE */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        {setup.mfe != null ? `+${setup.mfe}R` : setup.actualR != null && setup.actualR > 0 ? `+${setup.actualR.toFixed(1)}R` : '-'}
                      </td>

                      {/* Result */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] inline-block ${resultBadge}`}>
                          {setup.result}
                        </span>
                      </td>

                      {/* Actual R */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold">
                        {setup.actualR != null ? (
                          <span
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
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailSetup(setup)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View setup details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSetup(setup);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit setup"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-setup-btn-${setup.setupId}`}
                            onClick={() => {
                              setDeleteCandidate(setup);
                              setDeleteError(null);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={`Delete setup ${setup.setupId}`}
                            aria-label={`Delete setup ${setup.setupId}`}
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
        )}

        {/* Pagination Bar (Shown when entries exist) */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-xs">
            {/* Left: Summary text */}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{startIndex + 1}</strong>–
                <strong className="text-slate-900 dark:text-white">{endIndex}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white">{totalItems}</strong> setups
              </span>
              {totalPages > 1 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                  Page {safeCurrentPage} of {totalPages}
                </span>
              )}
            </div>

            {/* Right: Previous & Next Page Navigation (Visible when setups exceed 1 page) */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Previous Page Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage <= 1}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[42px] text-xs font-bold transition-all cursor-pointer shadow-2xs select-none"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-500" />
                  <span>Previous</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                    typeof p === 'number' ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`min-w-[40px] min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center select-none ${
                          p === safeCurrentPage
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs ring-2 ring-amber-500/30'
                            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        aria-label={`Page ${p}`}
                        aria-current={p === safeCurrentPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-slate-400 font-bold select-none">
                        ...
                      </span>
                    )
                  )}
                </div>

                {/* Next Page Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage >= totalPages}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[42px] text-xs font-bold transition-all cursor-pointer shadow-2xs select-none"
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Setup Create/Edit Modal */}
      <MSP1SetupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSetup(null);
        }}
        onSave={handleSaveSetup}
        editingSetup={editingSetup}
        suggestedSetupId={msp1Store.getNextId()}
      />

      {/* Setup Detail Viewer Modal */}
      <MSP1DetailModal
        isOpen={!!detailSetup}
        onClose={() => setDetailSetup(null)}
        setup={detailSetup}
        onEdit={(s) => {
          setDetailSetup(null);
          setEditingSetup(s);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteSetup}
        onRequestDelete={(s) => {
          setDetailSetup(null);
          setDeleteCandidate(s);
          setDeleteError(null);
        }}
      />

      {/* Setup Delete Confirmation Modal */}
      <MSP1DeleteConfirmModal
        isOpen={!!deleteCandidate}
        setup={deleteCandidate}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => {
          if (!isDeleting) {
            setDeleteCandidate(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Direct Lightbox Chart Viewer Modal */}
      {activeLightbox && (
        <MSP1LightboxModal
          isOpen={true}
          onClose={() => setActiveLightbox(null)}
          imageUrl={activeLightbox.imageUrl}
          title={activeLightbox.title}
          timeframe={activeLightbox.timeframe}
        />
      )}

      {/* ChatGPT & AI Batch Export Modal */}
      <MSP1BatchExportModal
        isOpen={isBatchExportOpen}
        onClose={() => setIsBatchExportOpen(false)}
        setups={setups}
      />
    </div>
  );
};
