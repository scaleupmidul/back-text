import type {
  User,
  DailyPractice,
  Trade,
  MistakeLog,
  PsychologyLog,
  DailyReview,
  WeeklyReview,
  SkillRecord,
  MSP1Setup,
} from '../types/index.ts';

const TOKEN_KEY = 'trader_discipline_token';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const errorMsg = body.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // --- Auth ---

  async register(name: string, email: string, pass: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<User | null> {
    if (!this.token) return null;
    try {
      const data = await this.request<{ user: User }>('/api/auth/me');
      return data.user;
    } catch {
      this.setToken(null);
      return null;
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateSettings(name: string, timezone: string): Promise<User> {
    const res = await this.request<{ user: User }>('/api/auth/settings', {
      method: 'PUT',
      body: JSON.stringify({ name, timezone }),
    });
    return res.user;
  }

  logout() {
    this.setToken(null);
  }

  // --- Daily Practice ---

  async getDailyPractice(date: string): Promise<DailyPractice> {
    return this.request<DailyPractice>(`/api/daily_practice?date=${encodeURIComponent(date)}`);
  }

  async getAllDailyPractices(): Promise<DailyPractice[]> {
    return this.request<DailyPractice[]>('/api/daily_practice/all');
  }

  async saveDailyPractice(practice: Partial<DailyPractice> & { date: string }): Promise<DailyPractice> {
    return this.request<DailyPractice>('/api/daily_practice', {
      method: 'POST',
      body: JSON.stringify(practice),
    });
  }

  // --- Trades ---

  async getTrades(): Promise<Trade[]> {
    return this.request<Trade[]>('/api/trades');
  }

  async addTrade(trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>): Promise<Trade> {
    return this.request<Trade>('/api/trades', {
      method: 'POST',
      body: JSON.stringify(trade),
    });
  }

  async deleteTrade(id: string): Promise<void> {
    await this.request(`/api/trades/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- MSP-1 Backtest Setups ---

  async getMSP1Setups(): Promise<MSP1Setup[]> {
    return this.request<MSP1Setup[]>('/api/msp1_setups');
  }

  async getNextMSP1SetupId(): Promise<string> {
    const res = await this.request<{ nextId: string }>('/api/msp1_setups/next_id');
    return res.nextId;
  }

  async getMSP1Setup(id: string): Promise<MSP1Setup> {
    return this.request<MSP1Setup>(`/api/msp1_setups/${encodeURIComponent(id)}`);
  }

  async addMSP1Setup(
    setup: Omit<MSP1Setup, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<MSP1Setup> {
    return this.request<MSP1Setup>('/api/msp1_setups', {
      method: 'POST',
      body: JSON.stringify(setup),
    });
  }

  async updateMSP1Setup(id: string, updates: Partial<MSP1Setup>): Promise<MSP1Setup> {
    return this.request<MSP1Setup>(`/api/msp1_setups/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMSP1Setup(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/api/msp1_setups/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.success;
  }

  async exportMSP1Json(): Promise<void> {
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    const res = await fetch('/api/msp1_setups/export/json', { headers });
    if (!res.ok) throw new Error('Failed to export MSP-1 JSON');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MSP1_Backtest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async exportMSP1Csv(): Promise<void> {
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    const res = await fetch('/api/msp1_setups/export/csv', { headers });
    if (!res.ok) throw new Error('Failed to export MSP-1 CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MSP1_Backtest.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // --- Mistakes ---

  async getMistakes(): Promise<MistakeLog[]> {
    return this.request<MistakeLog[]>('/api/mistakes');
  }

  async addMistake(mistake: Omit<MistakeLog, 'id' | 'userId' | 'createdAt'>): Promise<MistakeLog> {
    return this.request<MistakeLog>('/api/mistakes', {
      method: 'POST',
      body: JSON.stringify(mistake),
    });
  }

  async deleteMistake(id: string): Promise<void> {
    await this.request(`/api/mistakes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // --- Psychology ---

  async getPsychologyLogs(): Promise<PsychologyLog[]> {
    return this.request<PsychologyLog[]>('/api/psychology');
  }

  async addPsychologyLog(log: Omit<PsychologyLog, 'id' | 'userId' | 'createdAt'>): Promise<PsychologyLog> {
    return this.request<PsychologyLog>('/api/psychology', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // --- Reviews ---

  async getDailyReview(date: string): Promise<DailyReview | null> {
    return this.request<DailyReview | null>(`/api/reviews/daily?date=${encodeURIComponent(date)}`);
  }

  async saveDailyReview(review: Omit<DailyReview, 'id' | 'userId' | 'updatedAt'>): Promise<DailyReview> {
    return this.request<DailyReview>('/api/reviews/daily', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async getWeeklyReview(weekStartDate: string): Promise<WeeklyReview | null> {
    return this.request<WeeklyReview | null>(`/api/reviews/weekly?weekStartDate=${encodeURIComponent(weekStartDate)}`);
  }

  async saveWeeklyReview(review: Omit<WeeklyReview, 'id' | 'userId' | 'updatedAt'>): Promise<WeeklyReview> {
    return this.request<WeeklyReview>('/api/reviews/weekly', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async getAllReviews(): Promise<{ daily: DailyReview[]; weekly: WeeklyReview[] }> {
    return this.request<{ daily: DailyReview[]; weekly: WeeklyReview[] }>('/api/reviews/all');
  }

  // --- Skills ---

  async getSkills(): Promise<SkillRecord[]> {
    return this.request<SkillRecord[]>('/api/skills');
  }

  async logSkillPractice(skillId: string, notes?: string): Promise<SkillRecord> {
    return this.request<SkillRecord>('/api/skills/practice', {
      method: 'POST',
      body: JSON.stringify({ skillId, notes }),
    });
  }

  async updateSkillNotes(skillId: string, notes: string): Promise<SkillRecord> {
    return this.request<SkillRecord>(`/api/skills/${encodeURIComponent(skillId)}`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  // --- Export & Clear ---

  async downloadCsvExport(): Promise<void> {
    const res = await fetch('/api/msp1_setups/export/csv', {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to download CSV export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gold_Backtest_Trades_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async downloadJsonExport(): Promise<void> {
    const res = await fetch('/api/msp1_setups/export/json', {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to download JSON export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gold_Backtest_Data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async exportUserData(): Promise<any> {
    return this.request<any>('/api/export');
  }

  async clearUserData(): Promise<void> {
    await this.request('/api/clear_data', {
      method: 'POST',
    });
  }

  async getDbStatus(): Promise<{
    isConfigured: boolean;
    isConnected: boolean;
    databaseName: string;
    provider: 'mongodb_atlas' | 'local_storage';
    error?: string | null;
  }> {
    return this.request('/api/status');
  }
}

export const api = new ApiService();
