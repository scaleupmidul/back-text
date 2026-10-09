export type PsychologyState =
  | 'Calm'
  | 'Focused'
  | 'Fear'
  | 'Greed'
  | 'FOMO'
  | 'Revenge'
  | 'Overconfident'
  | 'Impatient';

export type MistakeCategory =
  | 'FOMO'
  | 'Revenge trade'
  | 'Overtrading'
  | 'Early entry'
  | 'Late entry'
  | 'Ignored confirmation'
  | 'Moved SL'
  | 'Risk too high'
  | 'Exited too early'
  | 'Ignored trading plan'
  | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: string;
}

export interface DailyPractice {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  marketPreparation: boolean;
  economicNewsChecked: boolean;
  marketStructureAnalysis: boolean;
  keyLevelsIdentified: boolean;
  liquidityAnalysis: boolean;
  tradingBiasWritten: boolean;
  tradingPlanPrepared: boolean;
  riskPlanPrepared: boolean;
  postMarketReviewCompleted: boolean;
  note: string;
  updatedAt: string;
}

export type TradeResult = 'Win' | 'Loss' | 'Breakeven' | 'Open';

export interface Trade {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  pair: string;
  type: 'Buy' | 'Sell';
  setup: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  riskPercent: string;
  reasonForEntry: string;
  screenshot?: string;
  result: TradeResult;
  followedPlan: boolean;
  note: string;
  psychologyState?: PsychologyState;
  createdAt: string;
}

export interface MistakeLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mistake: MistakeCategory;
  customMistake?: string;
  whyHappened: string;
  preventionPlan: string;
  createdAt: string;
}

export interface PsychologyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  tradeId?: string;
  state: PsychologyState;
  note: string;
  createdAt: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  wellDone: string;
  mistakeMade: string;
  improveTomorrow: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string; // YYYY-MM-DD (Sunday)
  improvedThisWeek: string;
  mostRepeatedMistake: string;
  weakestSkill: string;
  strongestSkill: string;
  oneFocusNextWeek: string;
  updatedAt: string;
}

export interface SkillRecord {
  id: string;
  userId: string;
  skillName: string;
  practiceDays: number;
  lastPracticed: string; // YYYY-MM-DD
  personalNotes: string;
  updatedAt: string;
}

export const CORE_SKILLS = [
  'Market Structure',
  'Support & Resistance',
  'Liquidity',
  'Price Action',
  'Candlestick Analysis',
  'Entry Confirmation',
  'Risk Management',
  'Trade Management',
  'Trading Psychology',
] as const;

export const COMMON_MISTAKES: MistakeCategory[] = [
  'FOMO',
  'Revenge trade',
  'Overtrading',
  'Early entry',
  'Late entry',
  'Ignored confirmation',
  'Moved SL',
  'Risk too high',
  'Exited too early',
  'Ignored trading plan',
  'Other',
];

export const PSYCHOLOGY_STATES: PsychologyState[] = [
  'Calm',
  'Focused',
  'Fear',
  'Greed',
  'FOMO',
  'Revenge',
  'Overconfident',
  'Impatient',
];

// ==========================================
// H1 SHARP V2 & LIQUIDITY EVENT TYPES
// ==========================================

export type TradingStrategy = 'LSE' | 'DRE';
export type TradingInstrument = 'XAU/USD' | 'BTC/USD' | 'Other';
export type TradeOutcomeType = 'TP' | 'SL' | 'Breakeven' | 'Manual Exit' | 'No Trade';

export type LiquidityLevelTaken =
  | 'Previous High'
  | 'Previous Low'
  | 'Equal Highs'
  | 'Equal Lows'
  | 'Other';

export type LiquidityEventOutcome =
  | 'Sweep + Reversal'
  | 'Break + Continuation (BOS)'
  | 'Unclear';

export type LiquiditySweptType = 'High' | 'Low';

export type BosDirection = 'Bullish' | 'Bearish';

// ==========================================
// TRADING BACKTESTING SYSTEM TYPES (H1 SHARP V2 & LSE / DRE)
// ==========================================

export type MSP1Session =
  | 'Asian'
  | 'London'
  | 'New York'
  | 'London + New York'
  | 'Other / Unknown';

export type MSP1D1Bias = 'Bullish' | 'Bearish' | 'Neutral / Unclear';

export type MSP1D1Structure = 'HH → HL' | 'LL → LH' | 'Other / Unclear';

export type MSP1H4Zone = 'Demand' | 'Supply' | 'None';

export type MSP1ZoneReaction = 'Yes' | 'No' | 'Unclear';

export type MSP1H1PrevStructure = 'Bearish' | 'Bullish' | 'Unclear';

export type MSP1MSSDirection = 'Bullish MSS' | 'Bearish MSS' | 'No MSS';

export type MSP1LastSwing = 'Last LH' | 'Last HL' | 'Not applicable';

export type MSP1StructureBreak = 'Above Last LH' | 'Below Last HL' | 'No Break';

export type MSP1TriggerDirection = 'Bullish' | 'Bearish' | 'None';

export type MSP1PriceActionTrigger =
  | 'Strong Bullish Rejection'
  | 'Strong Bearish Rejection'
  | 'Bullish Engulfing'
  | 'Bearish Engulfing'
  | 'Other'
  | 'None';

export type MSP1TradeDirection = 'BUY' | 'SELL' | 'NO TRADE';

export type MSP1Result =
  | 'Win'
  | 'Loss'
  | 'Breakeven'
  | 'No Trade'
  | 'Invalid Setup'
  | 'Incomplete Setup';

export type MSP1HighImpactNews = 'Yes' | 'No' | 'Unknown';

export type MSP1MarketCondition = 'Trending' | 'Ranging' | 'Choppy' | 'Unclear';

export type MSP1PullbackType = 'Healthy pullback' | 'Weak pullback' | 'No pullback';

export type EntryQuality = 'A' | 'B' | 'C';

export type LossReason =
  | 'Wrong D1 bias'
  | 'Wrong 4H zone'
  | 'False MSS'
  | 'Weak pullback'
  | 'False 15M trigger'
  | 'Opposing zone'
  | 'SL too tight'
  | 'Normal loss'
  | 'Other';

export interface MSP1Screenshots {
  d1?: string;
  h4?: string;
  h1?: string;
  m15?: string;
  beforeEntry?: string;
  entry?: string;
  afterTrade?: string;
  other?: string[];
}

export interface MSP1Setup {
  id: string;
  userId: string;
  setupId: string; // e.g. "MSP1-0001"
  date: string; // YYYY-MM-DD
  market: string; // "XAU/USD" | "BTC/USD"
  instrument?: string; // alias for market
  session: MSP1Session;
  timeframeRange?: string; // e.g. "2026-08-01 to 2026-08-05"

  // Strategy Distinction (LSE vs DRE)
  strategy?: TradingStrategy; // 'LSE' (Liquidity Sweep Entry) or 'DRE' (Demand Reaction Entry)
  strategyVersion?: string; // e.g. "v1.0", "v2.0"

  // Dedicated Section: Liquidity Event (Level Break ≠ Liquidity Sweep)
  liquidityEventOccurred?: boolean; // Was a previous important High/Low taken? (YES / NO)
  liquidityLevelTaken?: LiquidityLevelTaken | boolean; // What was taken? (or boolean in legacy seeds)
  liquidityEventOutcome?: LiquidityEventOutcome; // 1. Sweep + Reversal | 2. Break + Continuation (BOS) | 3. Unclear
  liquidityOutcome?: LiquidityEventOutcome | string; // Legacy alias for liquidityEventOutcome
  liquidityWhatTaken?: LiquidityLevelTaken | string; // Legacy alias for liquidityLevelTaken
  liquiditySwept?: LiquiditySweptType | string; // Legacy alias for sweepLiquidityType
  liquidityRejection?: boolean; // Legacy alias for sweepRejectionVisible
  liquidityReclaimed?: boolean; // Legacy alias for sweepPriceReclaimed
  liquidityOppositeMss?: boolean; // Legacy alias for sweepOppositeMss
  liquidityDisplacement?: boolean; // Legacy alias for sweepStrongDisplacement
  mssDirection?: string; // Legacy alias for h1MssDirection / m15MssDirection

  // Sweep + Reversal Details (LSE criteria)
  liquiditySweepConfirmed?: boolean; // Yes / No
  sweepLiquidityType?: LiquiditySweptType; // High / Low
  sweepRejectionVisible?: boolean; // Rejection visible? YES / NO
  sweepPriceReclaimed?: boolean; // Price reclaimed the level? YES / NO
  sweepOppositeMss?: boolean; // Opposite MSS occurred? YES / NO
  sweepStrongDisplacement?: boolean; // Strong displacement after MSS? YES / NO

  // Break + Continuation (BOS) Details
  bosLevelBroken?: string; // Previous High/Low broken
  bosDirection?: BosDirection; // Bullish / Bearish
  bosPriceContinued?: boolean; // Price continued in the same direction? YES / NO
  bosOppositeMss?: boolean; // Opposite MSS occurred? YES / NO

  // H1 Structure & Levels
  h1Bias?: 'Bullish' | 'Bearish' | 'Neutral / Unclear' | 'Unclear';
  h1StructureType?: 'HH + HL' | 'LH + LL' | 'Range';
  importantLevel?: 'Demand' | 'Supply' | 'Support' | 'Resistance';
  levelQuality?: 'Strong' | 'Average' | 'Weak';
  h1KeyZoneType?: 'Support' | 'Demand' | 'Resistance' | 'Supply' | 'None';

  // Section 2: D1 Market Structure
  d1Bias: MSP1D1Bias;
  d1Structure: MSP1D1Structure;
  d1Screenshot?: string;

  // Section 3: 4H Key Zone
  h4Zone: MSP1H4Zone;
  h4Reaction: MSP1ZoneReaction;
  h4ZoneNotes?: string;
  h4Screenshot?: string;

  // Section 4: 1H Confirmation
  h1PrevStructure: MSP1H1PrevStructure;
  h1MssDirection: MSP1MSSDirection;
  h1LastSwing: MSP1LastSwing;
  h1StructureBreak: MSP1StructureBreak;
  h1CandleCloseConfirmed: boolean;
  h1Screenshot?: string;

  // M15 Confirmation & FVG
  mssConfirmed?: boolean;
  displacementConfirmed?: boolean;
  fvgPresent?: boolean;
  fvgUsedAsConfirmation?: boolean;

  // Section 5: 15M Entry Trigger
  m15Pullback: boolean;
  m15PullbackType?: MSP1PullbackType;
  m15TriggerDirection: MSP1TriggerDirection;
  m15PriceActionTrigger: MSP1PriceActionTrigger;
  m15TriggerValid: boolean;
  m15Screenshot?: string;

  // M5 Entry Confirmation
  m5Pullback?: boolean; // M5 Pullback confirmed? YES / NO
  m5EntryConfirmed?: boolean; // M5 Entry confirmed? YES / NO

  // Section 6: Trade Plan & Pricing
  direction: MSP1TradeDirection;
  entryPrice?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  plannedRR?: number | null;

  // Section 7: Result & Execution Audit Fields
  result: MSP1Result;
  outcomeType?: TradeOutcomeType; // TP | SL | Breakeven | Manual Exit | No Trade
  actualExitPrice?: number | null;
  actualR?: number | null;
  accountBalance?: number | null;
  riskPercent?: number | null;
  realizedPnL?: number | null;
  tradingCostsR?: number | null; // commissions / spreads in R
  entryQuality?: EntryQuality; // A, B, C setup clarity
  mfe?: number | null; // Maximum Favorable Excursion in R
  nearestOpposingZone?: string | null;
  ruleFollowed?: boolean; // Followed rules without moving SL/TP mid-trade
  lossReason?: LossReason | null;

  // Missed Setup / No-Trade Log
  isMissedSetup?: boolean;
  skipReason?: string;
  hypotheticalOutcome?: string;

  // Section 8: News / Market Conditions
  highImpactNewsNearby: MSP1HighImpactNews;
  marketCondition: MSP1MarketCondition;
  newsNotes?: string;

  // Section 9: Setup Validation Checklist
  checklistState?: Record<string, boolean>;

  // Section 10: Screenshots
  screenshots?: MSP1Screenshots;

  // Section 11: Qualitative Notes
  notes: string;

  createdAt: string;
  updatedAt: string;
}

export type TradingSetup = MSP1Setup;
