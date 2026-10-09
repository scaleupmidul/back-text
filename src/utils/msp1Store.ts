import type { MSP1Setup } from '../types/index.ts';

const SETUPS_CACHE_KEY = 'msp1_setups_persistent_cache';
const NEXT_ID_CACHE_KEY = 'msp1_next_id_persistent_cache';

export function getTodayLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateNextSetupId(setups: MSP1Setup[]): string {
  if (!setups || setups.length === 0) {
    return 'MSP1-0001';
  }
  let maxNumber = 0;
  for (const s of setups) {
    if (s.setupId) {
      const matches = s.setupId.match(/(\d+)/g);
      if (matches && matches.length > 0) {
        // Pick the last group of numbers (e.g. MSP1-0004 -> 4)
        const num = parseInt(matches[matches.length - 1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
  }
  const nextNum = maxNumber + 1;
  return `MSP1-${String(nextNum).padStart(4, '0')}`;
}

function getInitialSetups(): MSP1Setup[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SETUPS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Fallback gracefully
  }
  return null;
}

const initialCachedSetups = getInitialSetups();

function getInitialNextId(): string {
  if (initialCachedSetups && initialCachedSetups.length > 0) {
    return calculateNextSetupId(initialCachedSetups);
  }
  if (typeof window === 'undefined') return 'MSP1-0001';
  try {
    return localStorage.getItem(NEXT_ID_CACHE_KEY) || 'MSP1-0001';
  } catch (e) {
    return 'MSP1-0001';
  }
}

let setupsCache: MSP1Setup[] | null = initialCachedSetups;
let nextIdCache: string = getInitialNextId();

function saveToLocalStorage(setups: MSP1Setup[], nextId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETUPS_CACHE_KEY, JSON.stringify(setups));
    localStorage.setItem(NEXT_ID_CACHE_KEY, nextId);
  } catch (e) {
    // Storage quota or private browsing fallback
  }
}

type Listener = (setups: MSP1Setup[], nextId: string) => void;
const listeners = new Set<Listener>();

export const msp1Store = {
  getSetups(): MSP1Setup[] | null {
    return setupsCache;
  },
  getNextId(): string {
    if (setupsCache && setupsCache.length > 0) {
      return calculateNextSetupId(setupsCache);
    }
    return nextIdCache;
  },
  setData(setups: MSP1Setup[], nextId?: string) {
    setupsCache = setups;
    nextIdCache = nextId || calculateNextSetupId(setups);
    saveToLocalStorage(setupsCache, nextIdCache);
    listeners.forEach((fn) => fn(setupsCache!, nextIdCache));
  },
  addSetup(setup: MSP1Setup, nextId?: string) {
    setupsCache = [setup, ...(setupsCache || [])];
    nextIdCache = nextId || calculateNextSetupId(setupsCache);
    saveToLocalStorage(setupsCache, nextIdCache);
    listeners.forEach((fn) => fn(setupsCache!, nextIdCache));
  },
  updateSetup(updated: MSP1Setup) {
    if (!setupsCache) return;
    setupsCache = setupsCache.map((s) => (s.id === updated.id ? updated : s));
    nextIdCache = calculateNextSetupId(setupsCache);
    saveToLocalStorage(setupsCache, nextIdCache);
    listeners.forEach((fn) => fn(setupsCache!, nextIdCache));
  },
  removeSetup(id: string) {
    if (!setupsCache) return;
    setupsCache = setupsCache.filter((s) => s.id !== id);
    nextIdCache = calculateNextSetupId(setupsCache);
    saveToLocalStorage(setupsCache, nextIdCache);
    listeners.forEach((fn) => fn(setupsCache!, nextIdCache));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

