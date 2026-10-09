import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import type { User, MSP1Setup } from './types/index.ts';
import { msp1Store } from './utils/msp1Store.ts';
import { AuthModal } from './components/AuthModal.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { StrategyPerformanceView } from './views/StrategyPerformanceView.tsx';
import { TradeHistoryView } from './views/TradeHistoryView.tsx';
import { InsightsView } from './views/InsightsView.tsx';
import { MissedSetupsView } from './views/MissedSetupsView.tsx';
import { MSP1RulesView } from './views/MSP1RulesView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { MSP1SetupModal } from './components/msp1/MSP1SetupModal.tsx';
import { MSP1DetailModal } from './components/msp1/MSP1DetailModal.tsx';
import { MSP1DeleteConfirmModal } from './components/msp1/MSP1DeleteConfirmModal.tsx';
import {
  LayoutDashboard,
  Scale,
  Layers,
  Sparkles,
  Compass,
  BookCheck,
  Settings as SettingsIcon,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  X,
  Plus,
} from 'lucide-react';

export type NavTab =
  | 'Dashboard'
  | 'Strategy Performance'
  | 'Trade History'
  | 'Insights'
  | 'Missed Log'
  | 'Strategy Rules'
  | 'Settings';

const PRIMARY_NAV_ITEMS: { name: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { name: 'Strategy Performance', label: 'Strategy Performance', icon: Scale },
  { name: 'Trade History', label: 'Trade History', icon: Layers },
  { name: 'Insights', label: 'Insights', icon: Sparkles },
  { name: 'Missed Log', label: 'Missed Log', icon: Compass },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [setups, setSetups] = useState<MSP1Setup[]>(() => msp1Store.getSetups() || []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trader_discipline_theme');
      if (saved) return saved === 'dark';
      return true; // Default to dark theme for premium trading terminal
    }
    return true; // Default to dark theme for premium trading terminal
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<MSP1Setup | null>(null);
  const [detailTrade, setDetailTrade] = useState<MSP1Setup | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MSP1Setup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [defaultIsMissed, setDefaultIsMissed] = useState(false);

  // Next Setup ID
  const [nextSetupId, setNextSetupId] = useState(() => msp1Store.getNextId());

  // Tab scroll position tracking for instant transitions
  const scrollPositions = React.useRef<Record<string, number>>({});

  const handleTabChange = (nextTab: NavTab) => {
    if (nextTab === activeTab) return;
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(nextTab);
  };

  React.useLayoutEffect(() => {
    const targetY = scrollPositions.current[activeTab] ?? 0;
    window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const unsubscribe = msp1Store.subscribe((updated, nextId) => {
      setSetups(updated);
      setNextSetupId(nextId);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('trader_discipline_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trader_discipline_theme', 'light');
    }
  }, [isDarkMode]);

  const checkSession = async () => {
    try {
      setLoadingAuth(true);
      const currentUser = await api.getMe();
      setUser(currentUser);
      if (currentUser) {
        const [msp1Data, nextId] = await Promise.all([
          api.getMSP1Setups().catch(() => []),
          api.getNextMSP1SetupId().catch(() => 'MSP1-0001'),
        ]);
        msp1Store.setData(msp1Data, nextId);
      }
    } catch (err) {
      console.error('Failed to get session:', err);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveTab('Dashboard');
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Open Record Trade modal
  const handleOpenRecordModal = (isMissed = false) => {
    setDefaultIsMissed(isMissed);
    setEditingTrade(null);
    setIsRecordModalOpen(true);
  };

  const handleEditTrade = (trade: MSP1Setup) => {
    setEditingTrade(trade);
    setDefaultIsMissed(trade.isMissedSetup ?? false);
    setIsRecordModalOpen(true);
  };

  const handleSaveTrade = async (setupPayload: Omit<MSP1Setup, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingTrade) {
      const updated = await api.updateMSP1Setup(editingTrade.id, setupPayload);
      const updatedList = setups.map((s) => (s.id === updated.id ? updated : s));
      msp1Store.setData(updatedList);
    } else {
      const saved = await api.addMSP1Setup(setupPayload);
      const updatedList = [saved, ...setups];
      const nextId = await api.getNextMSP1SetupId().catch(() => 'MSP1-0001');
      msp1Store.setData(updatedList, nextId);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteMSP1Setup(deleteCandidate.id);
      const updatedList = setups.filter((s) => s.id !== deleteCandidate.id);
      const nextId = await api.getNextMSP1SetupId().catch(() => 'MSP1-0001');
      msp1Store.setData(updatedList, nextId);
      setDeleteCandidate(null);
      if (detailTrade?.id === deleteCandidate.id) {
        setDetailTrade(null);
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete trade record');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#070b12] flex flex-col items-center justify-center p-4 text-slate-400">
        <ShieldCheck className="w-8 h-8 text-amber-500 animate-pulse mb-3" />
        <span className="text-xs font-mono tracking-widest uppercase text-slate-300">
          Gold Backtest Tracker
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-100 antialiased font-sans">
        <AuthModal
          onSuccess={(u) => {
            setUser(u);
            checkSession();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Header strictly enforcing Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b101b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-16">
            {/* Zone 1: Single text element wordmark */}
            <div
              onClick={() => handleTabChange('Dashboard')}
              className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer font-mono"
            >
              GOLD BACKTEST TRACKER
            </div>

            {/* Zone 2: 4–5 single-line clean navigation links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    id={`nav-tab-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleTabChange(item.name)}
                    className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 ${
                      isActive
                        ? 'text-slate-900 dark:text-amber-400 font-bold border-b-2 border-amber-500'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => handleTabChange('Strategy Rules')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 ${
                  activeTab === 'Strategy Rules'
                    ? 'text-slate-900 dark:text-amber-400 font-bold border-b-2 border-amber-500'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-400'
                }`}
              >
                Rules
              </button>
            </nav>

            {/* Zone 3: 1 primary action button + theme toggle & user badge */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => handleOpenRecordModal(false)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Trade</span>
              </button>

              {/* Theme Toggle */}
              <button
                id="theme-toggle-btn"
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User badge */}
              <div
                onClick={() => handleTabChange('Settings')}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                title="Account Settings & Data Backup"
              >
                <span className="hidden sm:inline font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-[11px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Mobile menu trigger */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 lg:hidden rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b101b] px-4 pt-2 pb-4 space-y-1 shadow-xl">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    handleTabChange(item.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                handleTabChange('Strategy Rules');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                activeTab === 'Strategy Rules'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookCheck className="w-4 h-4 shrink-0" />
              <span>Strategy Rules</span>
            </button>
            <button
              onClick={() => {
                handleTabChange('Settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                activeTab === 'Settings'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              <span>Settings & Data Backup</span>
            </button>

            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleOpenRecordModal(false);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg"
              >
                + Record Trade
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-20 lg:pb-12">
        <div style={{ display: activeTab === 'Dashboard' ? 'block' : 'none' }}>
          <DashboardView
            onNavigate={(tab) => handleTabChange(tab as NavTab)}
            onSelectDetail={(trade) => setDetailTrade(trade)}
          />
        </div>

        <div style={{ display: activeTab === 'Strategy Performance' ? 'block' : 'none' }}>
          <StrategyPerformanceView
            setups={setups}
            onOpenTradeModal={() => handleOpenRecordModal(false)}
            onSelectTrade={(trade) => setDetailTrade(trade)}
          />
        </div>

        <div style={{ display: activeTab === 'Trade History' ? 'block' : 'none' }}>
          <TradeHistoryView
            setups={setups}
            onOpenTradeModal={() => handleOpenRecordModal(false)}
            onEditTrade={(trade) => handleEditTrade(trade)}
            onDeleteTrade={(trade) => setDeleteCandidate(trade)}
            onSelectDetail={(trade) => setDetailTrade(trade)}
          />
        </div>

        <div style={{ display: activeTab === 'Insights' ? 'block' : 'none' }}>
          <InsightsView
            setups={setups}
            onOpenTradeModal={() => handleOpenRecordModal(false)}
          />
        </div>

        <div style={{ display: activeTab === 'Missed Log' ? 'block' : 'none' }}>
          <MissedSetupsView
            setups={setups}
            onOpenTradeModal={(isMissed) => handleOpenRecordModal(isMissed ?? true)}
            onEditTrade={(trade) => handleEditTrade(trade)}
            onDeleteTrade={(trade) => setDeleteCandidate(trade)}
          />
        </div>

        <div style={{ display: activeTab === 'Strategy Rules' ? 'block' : 'none' }}>
          <MSP1RulesView />
        </div>

        <div style={{ display: activeTab === 'Settings' ? 'block' : 'none' }}>
          <SettingsView
            user={user}
            onUserUpdated={(u) => setUser(u)}
            onLogout={handleLogout}
          />
        </div>
      </main>

      {/* Trade Entry / Edit Modal */}
      {isRecordModalOpen && (
        <MSP1SetupModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setEditingTrade(null);
          }}
          onSave={handleSaveTrade}
          editingSetup={editingTrade}
          suggestedSetupId={nextSetupId}
          defaultIsMissed={defaultIsMissed}
        />
      )}

      {/* Trade Detail Inspector Modal */}
      {detailTrade && (
        <MSP1DetailModal
          isOpen={Boolean(detailTrade)}
          setup={detailTrade}
          onClose={() => setDetailTrade(null)}
          onEdit={(trade) => {
            setDetailTrade(null);
            handleEditTrade(trade);
          }}
          onDelete={(id) => {
            const match = setups.find((s) => s.id === id);
            if (match) {
              setDetailTrade(null);
              setDeleteCandidate(match);
            }
          }}
          onRequestDelete={(trade) => {
            setDetailTrade(null);
            setDeleteCandidate(trade);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <MSP1DeleteConfirmModal
          isOpen={Boolean(deleteCandidate)}
          setup={deleteCandidate}
          isDeleting={isDeleting}
          error={deleteError}
          onClose={() => {
            setDeleteCandidate(null);
            setDeleteError(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Mobile Sticky Bottom Bar */}
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b101b]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1 shadow-lg"
      >
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => handleTabChange(item.name)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-500 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate leading-tight">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
