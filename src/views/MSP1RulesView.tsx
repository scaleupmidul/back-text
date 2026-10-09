import React from 'react';
import {
  Layers,
  Target,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Scale,
  Ban,
  Clock,
  Compass,
  Zap,
  Waves,
} from 'lucide-react';

export const MSP1RulesView: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-4">
      {/* Header */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            System Specification
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
            Gold (XAU/USD) · LSE &amp; DRE Models
          </span>
        </div>
        <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight">
          System Rules: LSE &amp; DRE Backtesting Framework
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Comparing two systematic execution models: <strong>LSE (Liquidity Sweep Entry)</strong> and <strong>DRE (Demand Reaction Entry)</strong>.
          Every historical trade recorded in this journal must strictly satisfy the criteria of its assigned strategy.
        </p>

        {/* LSE vs DRE Strategy Comparison Matrix */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono text-amber-400 uppercase tracking-wider">
                Model A: LSE (Liquidity Sweep Entry)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Sweep Required</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Must take a key previous High/Low (Previous High/Low, Equal Highs/Lows, Session Extremes).</li>
              <li>Price must show immediate rejection and reclaim back across the swept level.</li>
              <li>Opposite MSS on M15/H1 with completed candle body close is mandatory.</li>
              <li>Strong impulsive displacement must follow the shift.</li>
              <li>Entry executed on M5 controlled pullback into discount/premium reaction zone.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono text-indigo-400 uppercase tracking-wider">
                Model B: DRE (Demand Reaction Entry)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Direct Reaction</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Price directly taps an unmitigated 4H/1H Demand (Buy) or Supply (Sell) zone.</li>
              <li>Does <strong>not</strong> require a prior liquidity sweep: focuses on zone reaction defense.</li>
              <li>M15 confirmation: clear rejection or shift away from the zone boundary.</li>
              <li>FVG or orderflow shift can be used as structural confirmation.</li>
              <li>Entry executed on M5 pullback with minimum 1:2.0 planned RR.</li>
            </ul>
          </div>
        </div>

        {/* Level Break != Sweep Critical Rule */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Core Distinction: Level Break ≠ Liquidity Sweep</strong>
            <span>
              When price breaches a previous swing point and continues aggressively without rejection or reclaim, it is a <strong>BOS (Break of Structure / Continuation)</strong>, NOT a sweep. Never attempt reversal entries against a confirmed continuation break.
            </span>
          </div>
        </div>

        {/* Visual Multi-Timeframe Roadmap for Mobile & Desktop */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 font-semibold mb-2">
            ৪-ধাপের এক্সিকিউশন ফ্লো:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
              <span className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <div className="min-w-0">
                <div className="font-bold font-mono text-[11px]">D1 স্ট্রাকচার</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">ম্যাক্রো বায়াস</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
              <span className="w-5 h-5 rounded-md bg-purple-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <div className="min-w-0">
                <div className="font-bold font-mono text-[11px]">4H কি জোন</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">ডিমান্ড / সাপ্লাই</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <div className="min-w-0">
                <div className="font-bold font-mono text-[11px]">1H MSS ক্লোজ</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">বডি ক্লোজ মাস্ট</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
              <div className="min-w-0">
                <div className="font-bold font-mono text-[11px]">15M ট্রিগার</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">পুলব্যাক ও এন্ট্রি</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Sequence Deep Dive */}
      <div className="space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            ৪-ধাপের মাল্টি-টাইমফ্রেম এক্সিকিউশন সিকোয়েন্স
          </h2>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">ধাপ ১ হতে ৪</span>
        </div>

        {/* Step 1: D1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono text-xs border border-blue-500/20 shrink-0 mt-0.5 sm:mt-0">
                ১
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  ধাপ ১: হায়ার টাইমফ্রেম বায়াস ও মার্কেট স্ট্রাকচার (D1)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">টাইমফ্রেম: ডেইলি (Daily - D1)</span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              ম্যাক্রো ডিরেকশন
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> বুলিশ D1 বায়াস (মার্কেট ঊর্ধ্বমুখী)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                চার্টে সুস্পষ্ট <strong>Higher Highs এবং Higher Lows (HH → HL)</strong> তৈরি হবে। D1 বায়াস বুলিশ থাকলে কেবল <strong>BUY সেটআপ</strong> বিবেচনা করা যাবে।
              </p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> বেয়ারিশ D1 বায়াস (মার্কেট নিম্নমুখী)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                চার্টে সুস্পষ্ট <strong>Lower Lows এবং Lower Highs (LL → LH)</strong> তৈরি হবে। D1 বায়াস বেয়ারিশ থাকলে কেবল <strong>SELL সেটআপ</strong> বিবেচনা করা যাবে।
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-xs flex items-start gap-2.5">
            <Ban className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white">নিউট্রাল বা অস্পষ্ট স্ট্রাকচার:</strong> যদি D1 স্ট্রাকচার সাইডওয়েজ/রেঞ্জিং হয় বা স্পষ্ট সুইং পয়েন্ট না থাকে, তবে MSP-1 এর কঠোর নিয়ম: <strong>ট্রেড নেওয়া সম্পূর্ণ নিষেধ (NO TRADE)</strong>।
            </span>
          </div>
        </div>

        {/* Step 2: 4H */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold font-mono text-xs border border-purple-500/20 shrink-0 mt-0.5 sm:mt-0">
                ২
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  ধাপ ২: গুরুত্বপূর্ণ লোকেশন ও কি জোন চিহ্নিতকরণ (4H)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">টাইমফ্রেম: ৪ ঘণ্টা (4 Hours - 4H)</span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              ডিমান্ড ও সাপ্লাই জোন
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed font-medium text-slate-800 dark:text-slate-200">
              ট্রেড শুধুমাত্র D1 ডিরেকশনের সাথে সংগতিপূর্ণ 4H কি জোন থেকে নেওয়া হবে:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">BUY সেটআপের জন্য:</strong>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  প্রাইসকে অবশ্যই একটি স্পষ্ট ও বিশ্বাসযোগ্য <strong>4H Demand Zone</strong>-এ পৌঁছাতে হবে।
                </p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong className="text-rose-700 dark:text-rose-400 block mb-1">SELL সেটআপের জন্য:</strong>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  প্রাইসকে অবশ্যই একটি স্পষ্ট ও বিশ্বাসযোগ্য <strong>4H Supply Zone</strong>-এ পৌঁছাতে হবে।
                </p>
              </div>
            </div>
            <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">জোনের মূল দর্শন:</strong> ডিমান্ড বা সাপ্লাই কোনো একক মনগড়া লাইন নয়, এটি একটি গুরুত্বপূর্ণ প্রাইস এলাকা (Area / Zone)। প্রাইসকে অবশ্যই জোনে পৌঁছাতে হবে এবং সেখান থেকে দৃশ্যমান প্রতিক্রিয়া (reaction) প্রদর্শন করতে হবে, এর পরেই 1H টাইমফ্রেমে যাওয়া যাবে।
            </div>
          </div>
        </div>

        {/* Step 3: 1H Confirmation (MSS) */}
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-400/80 dark:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-900/60 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold font-mono text-xs shrink-0 mt-0.5 sm:mt-0">
                ৩
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  ধাপ ৩: মার্কেট স্ট্রাকচার শিফট কনফার্মেশন (1H MSS)
                </h3>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold block mt-0.5">
                  ★ MSP-1 সিস্টেমের সবচেয়ে গুরুত্বপূর্ণ অপরিবর্তনীয় নিয়ম
                </span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
              ক্যান্ডেল ক্লোজ আবশ্যক
            </span>
          </div>

          {/* CALLOUT BOX */}
          <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs leading-relaxed space-y-2.5">
            <div className="flex items-start gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>বাধ্যতামূলক ক্যান্ডেল ক্লোজ নিয়ম:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              শুধুমাত্র লেভেল স্পর্শ বা ক্রস করাই কনফার্মেশন নয়। একটি সম্পূর্ণ ১ ঘণ্টার ক্যান্ডেলকে অবশ্যই সংশ্লিষ্ট সুইং লেভেলের বাইরে <strong className="text-slate-900 dark:text-white underline">বডি ক্লোজ (Body Close)</strong> করতে হবে:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80">
                <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">বুলিশ MSS (BUY-এর জন্য):</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  একটি পূর্ণাঙ্গ ১ ঘণ্টার (1H) ক্যান্ডেলকে অবশ্যই শেষ <strong>Lower High (LH)</strong> এর ওপরে সুস্পষ্টভাবে ক্যান্ডেলের বডি ক্লোজ করতে হবে।
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80">
                <strong className="text-rose-700 dark:text-rose-400 block mb-1">বেয়ারিশ MSS (SELL-এর জন্য):</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  একটি পূর্ণাঙ্গ ১ ঘণ্টার (1H) ক্যান্ডেলকে অবশ্যই শেষ <strong>Higher Low (HL)</strong> এর নিচে সুস্পষ্টভাবে ক্যান্ডেলের বডি ক্লোজ করতে হবে।
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-200">
                <span>⚠️ কঠোর সতর্কতা — অপরিবর্তনীয় নিয়ম:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                কোনো অবস্থাতেই শুধু ক্যান্ডেলের উইক বা শ্যাডো (Wick) দিয়ে লেভেল স্পর্শ করলে তা কনফার্মেশন হিসেবে গণ্য হবে না।
              </p>
              <p className="text-xs font-medium text-amber-950 dark:text-amber-200 bg-amber-500/15 p-2.5 rounded-lg border border-amber-500/30 leading-relaxed">
                &ldquo;শুধু লেভেল ব্রেক বা অতিক্রম করলেই কনফার্মেশন হবে না। একটি পূর্ণাঙ্গ ১ ঘণ্টার ক্যান্ডেলকে অবশ্যই সংশ্লিষ্ট সুইং লেভেলের বাইরে সম্পূর্ণ বডি ক্লোজ করতে হবে (BUY-এর জন্য শেষ Lower High-এর উপরে, SELL-এর জন্য শেষ Higher Low-এর নিচে)। শুধু উইক দিয়ে স্পর্শ করলে তা কখনোই মার্কেট স্ট্রাকচার শিফট (MSS) হিসেবে গণ্য হবে না!&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* H1 SHARP V2 Validation: Liquidity Event (Level Break ≠ Liquidity Sweep) */}
        <div className="bg-white dark:bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold font-mono text-xs border border-cyan-500/20 shrink-0 mt-0.5 sm:mt-0">
                <Waves className="w-4 h-4 text-cyan-500" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  H1 SHARP V2 ভ্যালিডেশন: Liquidity Event (Level Break ≠ Liquidity Sweep)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  লিকুইডিটি সুইপ নাকি ব্রেকআউট কন্টিনিউয়েশন (BOS) — মৌলিক পাথর্ক্য
                </span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 shrink-0">
              H1 SHARP V2 রুল
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* Fundamental Principle Alert */}
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>মৌলিক নিয়ম: Level Break ≠ Liquidity Sweep</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                পূর্বের হাই বা লো ব্রেক হলেই তা স্বয়ংক্রিয়ভাবে লিকুইডিটি সুইপ নয়। গুরুত্বপূর্ণ প্রশ্ন: প্রাইস কি লিকুইডিটি নিয়ে সাথে সাথে রিভার্স / স্ট্রাকচার শিফট করল, নাকি লেভেল ব্রেক করে আগ্রাসীভাবে একই দিকে কন্টিনিউ (BOS) করল?
              </p>
            </div>

            {/* Two Distinct Classifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Classification 1: Sweep + Reversal */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ১. Sweep + Reversal (বৈধ রিভার্সাল সেটআপ)
                  </strong>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    ৫টি শর্ত
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  লেভেল স্পর্শ বা অতিক্রম করার পর তাৎক্ষণিক রিজেকশন দেখা যায়, লেভেল রিক্লেইম করে এবং বিপরীতমুখী স্ট্রাকচার শিফট ও স্ট্রং ডিসপ্লেসমেন্ট তৈরি হয়:
                </p>
                <div className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-emerald-500/20 text-[10px] font-mono text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div>
                    <strong>BUY সেটআপ ফ্লো:</strong><br />
                    H1 Bullish Bias → H1 Demand → M15 Prev Low Sweep Below → Reclaim/Rejection → Bullish MSS → Bullish Displacement → M5 Pullback → BUY
                  </div>
                  <div className="pt-1 border-t border-emerald-500/15">
                    <strong>SELL সেটআপ ফ্লো:</strong><br />
                    H1 Bearish Bias → H1 Supply → M15 Prev High Sweep Above → Rejection/Reclaim → Bearish MSS → Bearish Displacement → M5 Pullback → SELL
                  </div>
                </div>
              </div>

              {/* Classification 2: Break + Continuation (BOS) */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-900 dark:text-amber-300 flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ২. Break + Continuation (BOS - রিভার্সাল বাতিল)
                  </strong>
                  <span className="text-[10px] font-mono text-amber-800 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
                    নো রিভার্সাল
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  পূর্বের হাই/লো ব্রেক হওয়ার পর প্রাইস রিভার্স না করে একই ডিরেকশনে মোমেন্টাম নিয়ে কন্টিনিউ করে। কোনো বিপরীতমুখী MSS তৈরি হয় না।
                </p>
                <div className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-300">
                  <strong>গুরুত্বপূর্ণ ফিল্টার:</strong> প্রতিটি লেভেল ব্রেককেই লিকুইডিটি সুইপ ভাবলে পড়া যাবে ফাঁদে। লেভেল ব্রেক করে আগ্রাসীভাবে কন্টিনিউ করলে তা <strong>BOS / Continuation</strong> হিসেবে রেকর্ড হবে এবং রিভার্সাল ট্রেড ফিল্টার করে ক্যাপিটাল নিরাপদ রাখা হবে।
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: 15M Trigger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono text-xs border border-emerald-500/20 shrink-0 mt-0.5 sm:mt-0">
                ৪
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  ধাপ ৪: পুলব্যাক ও প্রাইস অ্যাকশন এন্ট্রি ট্রিগার (15M)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">টাইমফ্রেম: ১৫ মিনিট (15 Minutes - 15M)</span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              এক্সিকিউশন ট্রিগার
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed font-medium text-slate-800 dark:text-slate-200">
              1H MSS কনফার্ম হওয়ার পর তাড়াহুড়ো করে সরাসরি মার্কেটে প্রবেশ (Chase) করা যাবে না:
            </p>
            
            <div className="space-y-2">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p className="leading-relaxed">
                  ভ্যালু বা স্ট্রাকচারের দিকে একটি <strong>স্বাস্থ্যকর ও সুনির্দিষ্ট ১৫ মিনিটের পুলব্যাকের (15M Pullback)</strong> জন্য অপেক্ষা করুন।
                </p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>D1 বায়াসের সাথে মিল রেখে অনুমোদিত প্রাইস অ্যাকশন ট্রিগারসমূহ:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">শক্তিশালী রিজেকশন ক্যান্ডেল</strong>
                    <span className="text-slate-500 dark:text-slate-400">লম্বা উইক দিয়ে কি জোন বা লেভেল রিজেক্ট করা ক্যান্ডেল।</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">এনগালফিং ক্যান্ডেল</strong>
                    <span className="text-slate-500 dark:text-slate-400">বুলিশ বা বেয়ারিশ পরিষ্কার মোমেন্টাম ফুল-বডি ক্যান্ডেল।</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">ক্লিন পিনবার</strong>
                    <span className="text-slate-500 dark:text-slate-400">নিখুঁত রিভার্সাল প্রাইস অ্যাকশন স্ট্রাকচার।</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <Ban className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] sm:text-xs">
                  প্রাইস যদি কোনো পরিষ্কার পুলব্যাক না দিয়ে দ্রুত চলে যায় বা পরিষ্কার ট্রিগার না দেয়, তবে সেই অবস্থাকে <strong>No Trade</strong> অথবা <strong>Incomplete Setup</strong> হিসেবে চিহ্নিত করতে হবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Pre-Entry Checklist Section */}
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              ✓
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Entry নেওয়ার আগে মূল Checklist (৬টি অপরিহার্য পূর্বশর্ত)
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                এই ৬টি ধাপের প্রতিটি নিখুঁতভাবে না মিললে কোনো অর্ডার প্লেস করা যাবে না
              </span>
            </div>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            Pre-Entry Audit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* ① D1 Bias */}
          <div className="p-3.5 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-700 dark:text-blue-400 font-mono text-xs flex items-center gap-1.5">
                ① D1 — Bias (ম্যাক্রো দিক)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Daily</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Bullish:</strong> পরিষ্কার HH → HL গঠন</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span><strong>Bearish:</strong> পরিষ্কার LL → LH গঠন</span>
              </li>
              <li className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold pt-0.5">
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span><strong>Neutral:</strong> নিউট্রাল হলে জোর করে trade নয় (No Trade)!</span>
              </li>
            </ul>
          </div>

          {/* ② 4H Location */}
          <div className="p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-700 dark:text-purple-400 font-mono text-xs flex items-center gap-1.5">
                ② 4H — Location (লোকেশন ও জোন)
              </span>
              <span className="text-[10px] font-mono text-slate-500">4 Hours</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>BUY সেটআপ:</strong> Demand / Support-এ কি প্রাইস রিঅ্যাক্ট করেছে?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>SELL সেটআপ:</strong> Supply / Resistance-এ কি প্রাইস রিঅ্যাক্ট করেছে?</span>
              </li>
              <li className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Price কি zone-এর অনেক দূরে চলে গেছে? দূরে গেলে তা ওভার-এক্সটেন্ডেড।</span>
              </li>
            </ul>
          </div>

          {/* ③ 1H MSS */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 dark:text-amber-300 font-mono text-xs flex items-center gap-1.5">
                ③ 1H — MSS (স্ট্রাকচার শিফট)
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-600">বাধ্যতামূলক</span>
            </div>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Meaningful Swing Break:</strong> পূর্ববর্তী বৈধ সুইং লেভেল ব্রেক হয়েছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>1H Candle Close:</strong> পূর্ণাঙ্গ ১ ঘণ্টার ক্যান্ডেল বডি ক্লোজ করেছে তো? (উইক নয়)</span>
              </li>
              <li className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>MSS-এর পরে price কি অতিরিক্ত দূরে চলে গেছে? (চেজ করা যাবে না)</span>
              </li>
            </ul>
          </div>

          {/* ④ 15M Entry */}
          <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                ④ 15M — Entry (পুলব্যাক ও ট্রিগার)
              </span>
              <span className="text-[10px] font-mono text-slate-500">15 Minutes</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Reasonable Pullback:</strong> স্বাস্থ্যকর ও দৃশ্যমান পুলব্যাক হয়েছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Clear Trigger:</strong> পুলব্যাকের পর পরিষ্কার প্রাইস অ্যাকশন ট্রিগার হয়েছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>ট্রিগার ক্যান্ডেল শর্ট-টার্ম লেভেল ব্রেক করে বডি ক্লোজ করেছে তো?</span>
              </li>
            </ul>
          </div>

          {/* ⑤ Risk */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs flex items-center gap-1.5">
                ⑤ Risk — স্টপ লস ও ক্যাপিটাল সুরক্ষা
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-500">1R Fixed</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Logical SL:</strong> যৌক্তিক স্ট্রাকচারাল ইনভ্যালিডেশন লেভেলে SL রাখা হয়েছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>SL কি random distance-এ নাকি স্ট্রাকচারের বাইরে? (মনগড়া ফিক্সড পিপ নয়)</span>
              </li>
              <li className="flex items-start gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Risk = 1R fixed:</strong> প্রতি ট্রেডে নির্ধারিত স্থির ১R রিস্ক হিসাব করা হয়েছে কি?</span>
              </li>
            </ul>
          </div>

          {/* ⑥ Target */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs flex items-center gap-1.5">
                ⑥ Target — লাভ ও অপোজিং জোন
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-500">Min 2R</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>2R Target:</strong> ২R টার্গেট কি চার্টে যৌক্তিকভাবে অর্জনযোগ্য?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Opposing Zone:</strong> ২R-এর আগে কোনো শক্তিশালী অপোজিং জোন আছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
                <Ban className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>২R-এর আগে অপোজিং জোন থাকলে → সরাসরি No Trade!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mandatory 3 Discipline Tracking Fields */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            আরও ৩টি জিনিস প্রতিটি ট্রেডে অবশ্যই রেকর্ড করবেন
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* A. Entry Quality */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                A. Entry Quality
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                A / B / C
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              সেটআপটি চার্টে কতটা পরিষ্কার ও নিখুঁত ছিল তার গ্রেডিং দিন:
            </p>
            <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
              <div><strong className="text-emerald-600">Grade A:</strong> সম্পূর্ণ টেক্সটবুক নিখুঁত সেটআপ।</div>
              <div><strong className="text-blue-600">Grade B:</strong> বৈধ কিন্তু সামান্য অপূর্ণতা রয়েছে।</div>
              <div><strong className="text-amber-600">Grade C:</strong> কিছুটা আক্রমণাত্মক বা অস্পষ্ট ট্রিগার।</div>
            </div>
          </div>

          {/* B. Trade Management */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                B. Trade Management
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                MFE Peak
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              ট্রেড নেওয়ার পর প্রাইস সর্বোচ্চ কত দূর গিয়েছিল তা রেকর্ড করুন:
            </p>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-slate-800 dark:text-slate-200 flex-wrap pt-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">+0.5R</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">+1R</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">+1.5R</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">+2R+</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              এর মাধ্যমে বোঝা যায় সেটআপটি আদৌ মোমেন্টাম পেয়েছিল কি না।
            </p>
          </div>

          {/* C. Why did it lose? */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                C. Why did it lose?
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                Loss Reason
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Loss হলে সঠিক রুট-কজ ক্যাটাগরি নির্বাচন করুন:
            </p>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700 dark:text-slate-300 font-mono">
              <span>• Wrong D1 bias</span>
              <span>• Wrong 4H zone</span>
              <span>• False MSS</span>
              <span>• Weak pullback</span>
              <span>• False 15M trigger</span>
              <span>• Opposing zone</span>
              <span>• SL too tight</span>
              <span>• Normal loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* Golden Rule: Never Alter Decision Mid-Trade */}
      <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider">
            সবচেয়ে গুরুত্বপূর্ণ শৃঙ্খলা: Entry-এর পরে চার্ট দেখে নিজের Decision বদলাবেন না
          </h3>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          ট্রেড এক্সেকিউট করার পর সাধারণ ট্রেডাররা মানসিক চাপ ও আবেগের বশে নিয়ম লঙ্ঘন করে, যেমন:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 text-slate-800 dark:text-slate-200">
            <span className="text-rose-600 dark:text-rose-400 font-bold block mb-0.5">✕ ভুল আচরণ ১:</span>
            &ldquo;+1R গেছে, এখন ভয়ে SL সরিয়ে ব্রেকইভেনে বা অন্য কোথাও নিই।&rdquo;
          </div>
          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 text-slate-800 dark:text-slate-200">
            <span className="text-rose-600 dark:text-rose-400 font-bold block mb-0.5">✕ ভুল আচরণ ২:</span>
            &ldquo;মনে হচ্ছে মার্কেট আরও উঠবে, লোভে পড়ে নির্ধারিত TP বাড়িয়ে দিই।&rdquo;
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-950 dark:text-amber-200 text-xs font-semibold">
          ★ প্রতিটি ট্রেডে শতভাগ ফিক্সড রুলস (Fixed Rules) বজায় রাখুন। না হলে আমরা বুঝতেই পারব না MSP-1 সিস্টেম আসলে বাস্তবে কী পারফর্ম করছে।
        </div>
      </div>

      {/* Trade Journal Core 15 Data Schema Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              আপনার জার্নালের মূল ১৫টি ডাটা (JSON Data Structure)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Export JSON & Split AI Exporter Compliant
          </span>
        </div>
        
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          আপনার সংরক্ষিত প্রতিটি ট্রেডের JSON এবং CSV ফাইলে অন্তত এই ১৫টি মূল ডাটা স্বয়ংক্রিয়ভাবে সংরক্ষিত ও রপ্তানি করা হচ্ছে, যাতে কেবল &ldquo;কতগুলো উইন&rdquo; নয়—বরং <strong>কোথায় স্ট্র্যাটেজি বা শৃঙ্খলা ভেঙে যাচ্ছে</strong> তা যেকোনো সময় স্পষ্টভাবে খুঁজে বের করা যায়:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { num: '১', title: 'D1 Bias', desc: 'Bullish / Bearish / Neutral' },
            { num: '২', title: '4H Zone', desc: 'Demand / Supply / None' },
            { num: '৩', title: '1H MSS', desc: 'Swing Break & Close' },
            { num: '৪', title: '15M Pullback', desc: 'Healthy / Weak / None' },
            { num: '৫', title: '15M Trigger', desc: 'Rejection / Engulfing' },
            { num: '৬', title: 'Entry', desc: 'Exact Execution Price' },
            { num: '৭', title: 'SL', desc: 'Structural Stop Loss' },
            { num: '৮', title: 'TP', desc: 'Target Price Level' },
            { num: '৯', title: 'RR', desc: 'Planned Risk-Reward' },
            { num: '১০', title: 'Opposing Zone', desc: 'Nearest Opposing Zone' },
            { num: '১১', title: 'MFE', desc: 'Max R Reached Peak' },
            { num: '১২', title: 'Result', desc: 'Win / Loss / BE' },
            { num: '১৩', title: 'Result in R', desc: 'Realized Net R (+2R/-1R)' },
            { num: '১৪', title: 'Rule Followed?', desc: 'Fixed Rules Kept (Yes/No)' },
            { num: '১৫', title: 'Loss Reason', desc: 'Root Cause Category' },
          ].map((field) => (
            <div
              key={field.num}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-amber-500 font-bold block mb-0.5">#{field.num}</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">{field.title}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
                {field.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Risk Management Rules */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            স্থির রিস্ক ম্যানেজমেন্ট ও এক্সিকিউশন রুলস
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-mono text-xs sm:text-[13px]">
              রুল ১: সর্বনিম্ন ১:২ প্ল্যানড রিস্ক-টু-রিওয়ার্ড
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              পরবর্তী যৌক্তিক স্ট্রাকচারাল টার্গেটে যদি স্টপ লস অনুযায়ী কমপক্ষে ১:২ রিস্ক-টু-রিওয়ার্ড (Planned RR 1:2.00) না পাওয়া যায়, তবে সেই ট্রেডটি অবশ্যই বাদ দিতে হবে।
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-blue-600 dark:text-blue-400 block font-mono text-xs sm:text-[13px]">
              রুল ২: স্ট্রাকচারাল ইনভ্যালিডেশন স্টপ লস
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              স্টপ লস সবসময় স্ট্রাকচারাল ইনভ্যালিডেশন লেভেলের বাইরে রাখতে হবে (BUY-এর জন্য সুইং লো-এর নিচে, SELL-এর জন্য সুইং হাই-এর ওপরে)। কোনো অবস্থাতেই মনগড়া ফিক্সড-পিপ SL দেওয়া যাবে না।
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-600 dark:text-purple-400 block font-mono text-xs sm:text-[13px]">
              রুল ৩: কোনো বাহ্যিক ইন্ডিকেটর ব্যবহার নয়
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              চার্টে RSI, MACD, মুভিং এভারেজ বা অন্য কোনো বাহ্যিক ইন্ডিকেটর যোগ করবেন না। এই ব্যাকটেস্টিং নিখুঁত প্রাইস অ্যাকশন ও MSP-1 স্ট্রাকচারের আসল পরিসংখ্যানগত সক্ষমতা যাচাইয়ের জন্য।
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy: Why "No Trade" is a Positive Event */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            ব্যাকটেস্টিং দর্শন: "নো ট্রেড (No Trade)" একটি ইতিবাচক ও সফল সিদ্ধান্ত
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          "No Trade" বা "Incomplete Setup"-কে কখনোই ব্যর্থতা বা লোকসান ভাববেন না। একটি লাভজনক ট্রেডিং সিস্টেমের মূল শক্তি হলো প্রতিকূল, অনিশ্চিত বা চপি মার্কেট ফিল্টার করে অপ্রয়োজনীয় ক্ষতি রোধ করা। যখন D1 বায়াস অস্পষ্ট থাকে কিংবা 1H ক্যান্ডেল ক্লোজ না হয়ে কেবল উইক দেয় এবং আপনি কোনো ট্রেড না নিয়ে নিখুঁতভাবে "No Trade" রেকর্ড করেন—তা আপনার সিস্টেমের সর্বোচ্চ শৃঙ্খলা, নিয়ন্ত্রণ এবং পেশাদারিত্ব প্রমাণ করে।
        </p>
      </div>
    </div>
  );
};


