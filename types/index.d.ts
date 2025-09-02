/**
 * 型定義のエントリーポイント
 * すべての型定義をここから re-export する
 */

// 基本型定義
export * from './global.d.ts';

// API関連型定義
export * from './api.d.ts';

// 設定関連型定義
export * from './config.d.ts';

// コンポーネント関連型定義
export * from './components.d.ts';

// バリデーション関連型定義
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: readonly string[];
  custom?: (value: any) => boolean | string;
}

export interface SchemaDefinition {
  [key: string]: {
    type: string;
    required?: boolean;
    description?: string;
    [key: string]: any;
  };
}

// ログ関連型定義
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  module?: string;
  data?: any;
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  group(label: string): void;
  groupEnd(): void;
}

// キャッシュ関連型定義
export interface CacheOptions {
  ttl?: number; // time to live in milliseconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo';
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttl?: number): void;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): string[];
}

// 国際化関連型定義
export interface I18nOptions {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
}

export interface TranslationData {
  [key: string]: string | TranslationData;
}

export interface I18nManager {
  setLanguage(language: string): void;
  getLanguage(): string;
  t(key: string, params?: Record<string, any>): string;
  loadTranslations(language: string, translations: TranslationData): void;
  getSupportedLanguages(): string[];
}

// ユーティリティ型定義
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireOnly<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// DOM要素の型定義
export interface DOMElement extends Element {
  innerHTML: string;
  textContent: string | null;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): NodeListOf<Element>;
}

// モジュール宣言
declare global {
  interface Window {
    firebase: any;
    firebaseConfig: FirebaseConfig;
    configManager: any;
    getConfig: any;
    env: any;
    Environment: any;
  }
}

export {};