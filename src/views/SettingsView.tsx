import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { User } from '../types/index.ts';
import {
  User as UserIcon,
  Lock,
  Globe,
  Settings as SettingsIcon,
  Download,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Database as DatabaseIcon,
  Server,
  Cloud,
  Bot,
  Sparkles,
} from 'lucide-react';
import type { MSP1Setup } from '../types/index.ts';
import { msp1Store } from '../utils/msp1Store.ts';
import { MSP1BatchExportModal } from '../components/msp1/MSP1BatchExportModal.tsx';

interface SettingsViewProps {
  user: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Frankfurt',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Hong_Kong',
  'Australia/Sydney',
  'UTC',
];

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUserUpdated, onLogout }) => {
  // Profile State
  const [name, setName] = useState(user.name);
  const [timezone, setTimezone] = useState(user.timezone || 'UTC');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Database Connection State
  const [dbStatus, setDbStatus] = useState<{
    isConfigured: boolean;
    isConnected: boolean;
    databaseName: string;
    provider: 'mongodb_atlas' | 'local_storage';
    error?: string | null;
  } | null>(null);

  // Setups for AI & ChatGPT Batch Export
  const [setups, setSetups] = useState<MSP1Setup[]>(() => msp1Store.getSetups() || []);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);

  useEffect(() => {
    api.getDbStatus().then(setDbStatus).catch(() => {});
    if (!msp1Store.getSetups()) {
      api.getMSP1Setups().then((data) => {
        setSetups(data);
      }).catch(() => {});
    }
    const unsub = msp1Store.subscribe((s) => setSetups(s));
    return () => unsub();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      const updated = await api.updateSettings(name, timezone);
      onUserUpdated(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile settings.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await api.updatePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExport = async () => {
    setExportError(null);
    try {
      const data = await api.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trader-discipline-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setExportError('Failed to export data. Please try again.');
    }
  };

  // Clear Data Modal State
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const handleOpenClearModal = () => {
    setClearError(null);
    setClearSuccess(false);
    setShowClearModal(true);
  };

  const handleCloseClearModal = () => {
    if (clearLoading) return;
    setShowClearModal(false);
    setClearError(null);
  };

  const handleConfirmClear = async () => {
    setClearLoading(true);
    setClearError(null);
    try {
      await api.clearUserData();
      setClearSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Clear failed:', err);
      setClearError(err.message || 'Failed to clear data. Please try again.');
      setClearLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div
        id="settings-header"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Configuration & Account Security</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
          Settings
        </h1>
      </div>

      {/* 1. Profile & Timezone */}
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <UserIcon className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Profile & Time Zone
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full p-2.5 text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed min-h-[42px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Trading Time Zone
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-medium min-h-[42px]"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
          {profileSuccess ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved
            </span>
          ) : profileError ? (
            <span className="text-xs text-rose-600 dark:text-rose-400 flex items-center justify-center sm:justify-start gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {profileError}
            </span>
          ) : (
            <div className="hidden sm:block" />
          )}
          <button
            type="submit"
            disabled={profileSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center shadow-xs"
          >
            {profileSaving ? 'Saving...' : 'Save Profile & Time Zone'}
          </button>
        </div>
      </form>

      {/* 2. Password */}
      <form
        onSubmit={handleUpdatePassword}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Lock className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Change Password
          </h2>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 min-h-[42px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 min-h-[42px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={passwordSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center shadow-xs"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* 3. Database & Deployment Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Database & Vercel Architecture
            </h2>
          </div>
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full flex items-center gap-1.5 ${
              dbStatus?.isConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {dbStatus?.isConnected ? 'MongoDB Atlas (Connected)' : 'Local Storage Engine (Active)'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Storage Provider:
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {dbStatus?.isConnected ? 'MongoDB Atlas Cloud Cluster' : 'Internal File Storage (Ready for Atlas sync)'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Database Target:
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {dbStatus?.databaseName || 'trader_discipline'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Vercel + Vite Readiness:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Configured with /api serverless functions & rewrites
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed space-y-1.5">
            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-indigo-500" />
              How to connect your MongoDB Atlas on Vercel or GitHub:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                In your MongoDB Atlas dashboard, create a free database cluster and copy your connection string URI (<span className="font-mono text-[10px] text-slate-800 dark:text-slate-200">mongodb+srv://...</span>).
              </li>
              <li>
                When deploying on <span className="font-semibold text-slate-800 dark:text-slate-200">Vercel</span>, go to <span className="italic">Project Settings → Environment Variables</span> and add:
                <br />
                <span className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold">
                  MONGODB_URI=your_connection_string
                </span>
              </li>
              <li>
                All user accounts, trades, mistakes, and reviews will automatically be synced across devices smoothly without relying on browser local storage!
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* 4. Account Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <SettingsIcon className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Account & Data Controls
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          {/* Multi-Part Export for AI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Multi-Part Export for ChatGPT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                  {setups.length} Setups
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Split large backtests into 3 parts with images for seamless AI analysis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBatchExportOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] shrink-0 shadow-xs text-xs transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Export in Parts</span>
            </button>
          </div>

          {/* Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Export Data Backup
              </span>
              <p className="text-slate-500 text-[11px]">
                Download all your trades, practice logs, mistakes, and reviews as a JSON file.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>
          {exportError && (
            <p className="text-xs text-rose-500 font-medium px-1">
              {exportError}
            </p>
          )}

          {/* Clear */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
            <div>
              <span className="font-semibold text-rose-800 dark:text-rose-300 block">
                Reset All Records
              </span>
              <p className="text-rose-600/80 dark:text-rose-400/80 text-[11px]">
                Permanently purge all trades and logs to restart fresh.
              </p>
            </div>
            <button
              id="open-clear-modal-btn"
              type="button"
              onClick={handleOpenClearModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] shrink-0 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Records
            </button>
          </div>

          {/* Sign Out */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              id="logout-btn"
              onClick={onLogout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out of Trader Discipline
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing All Records */}
      {showClearModal && (
        <div
          id="clear-confirm-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !clearLoading) {
              handleCloseClearModal();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
        >
          <div
            id="clear-confirm-modal"
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 relative my-auto"
          >
            {/* Close 'X' Button */}
            {!clearLoading && (
              <button
                id="close-clear-modal-x"
                type="button"
                onClick={handleCloseClearModal}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3.5">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
                Reset All Trading Records?
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Are you sure you want to clear your data? This will permanently delete all your logged
                trades, daily checklists, tracked mistakes, and weekly reviews.
              </p>

              <div className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs mb-4 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> This action cannot be reversed. If you need a backup, please export your data first.
                </span>
              </div>

              {clearError && (
                <div className="w-full p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 text-left">
                  {clearError}
                </div>
              )}

              {clearSuccess ? (
                <div className="w-full p-3 mb-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  All records cleared! Reloading...
                </div>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full pt-2">
                  <button
                    id="cancel-clear-btn"
                    type="button"
                    disabled={clearLoading}
                    onClick={handleCloseClearModal}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[44px] cursor-pointer transition-colors flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-clear-btn"
                    type="button"
                    disabled={clearLoading}
                    onClick={handleConfirmClear}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white min-h-[44px] cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                  >
                    {clearLoading ? (
                      <span>Clearing Records...</span>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Yes, Clear All Records</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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
