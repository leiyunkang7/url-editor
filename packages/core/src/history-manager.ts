import { URLHistory } from './types';

export class HistoryManager {
  private static readonly STORAGE_KEY = 'url-editor-history';
  private static readonly MAX_HISTORY_SIZE = 50;
  private history: URLHistory[] = [];

  constructor() {
    this.loadHistory();
  }

  addToHistory(url: string): void {
    const historyItem: URLHistory = {
      id: this.generateId(),
      url,
      timestamp: Date.now()
    };

    // 移除重复项
    this.history = this.history.filter(item => item.url !== url);
    
    // 添加到开头
    this.history.unshift(historyItem);
    
    // 限制历史记录大小
    if (this.history.length > HistoryManager.MAX_HISTORY_SIZE) {
      this.history = this.history.slice(0, HistoryManager.MAX_HISTORY_SIZE);
    }
    
    this.saveHistory();
  }

  getHistory(): URLHistory[] {
    return [...this.history];
  }

  searchHistory(query: string): URLHistory[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(item => 
      item.url.toLowerCase().includes(lowerQuery)
    );
  }

  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  removeFromHistory(id: string): void {
    this.history = this.history.filter(item => item.id !== id);
    this.saveHistory();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(HistoryManager.STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load history:', error);
      this.history = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(HistoryManager.STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save history:', error);
    }
  }
} 