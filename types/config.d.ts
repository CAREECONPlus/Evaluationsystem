/**
 * 設定関連の型定義
 */

// 設定管理関連の型定義
export type Environment = 'development' | 'staging' | 'production';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppConfig {
  name: string;
  version: string;
  description: string;
  supportEmail: string;
  companyName: string;
  maintenanceMode: boolean;
}

export interface SecurityConfig {
  sessionTimeoutMs: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireMFA: boolean;
  allowedDomains: string[];
}

export interface UIConfig {
  defaultLanguage: string;
  theme: string;
  itemsPerPage: number;
  darkModeEnabled: boolean;
  toastDuration: number;
}

export interface UnifiedConfig {
  environment: Environment;
  firebase: FirebaseConfig;
  app: AppConfig;
  security: SecurityConfig;
  ui: UIConfig;
  isLoaded: boolean;
  loadedAt: number;
}

export interface EnvironmentConfig {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  APP_NAME?: string;
  APP_VERSION?: string;
  APP_DESCRIPTION?: string;
  SUPPORT_EMAIL?: string;
  COMPANY_NAME?: string;
  MAINTENANCE_MODE?: string;
  SESSION_TIMEOUT_MS?: string;
  MAX_LOGIN_ATTEMPTS?: string;
  PASSWORD_MIN_LENGTH?: string;
  REQUIRE_MFA?: string;
  ALLOWED_DOMAINS?: string;
  DEFAULT_LANGUAGE?: string;
  DEFAULT_THEME?: string;
  ITEMS_PER_PAGE?: string;
  DARK_MODE_ENABLED?: string;
  TOAST_DURATION_MS?: string;
}

// 設定マネージャーのインターfaces
export interface ConfigManager {
  loadConfig(): Promise<UnifiedConfig>;
  get<T>(path: string, defaultValue?: T): Promise<T>;
  getConfigByType(type: string): Promise<any>;
  getFirebaseConfig(): Promise<FirebaseConfig>;
  getAppConfig(): Promise<AppConfig>;
  getSecurityConfig(): Promise<SecurityConfig>;
  getUIConfig(): Promise<UIConfig>;
  getEnvironment(): Environment;
  isDevelopment(): boolean;
  isStaging(): boolean;
  isProduction(): boolean;
  addConfigChangeListener(listener: (config: UnifiedConfig) => void): void;
  removeConfigChangeListener(listener: (config: UnifiedConfig) => void): void;
  reload(): Promise<UnifiedConfig>;
  debug(): void;
}

// 環境変数管理クラスのインターface
export interface EnvironmentManager {
  loadConfig(): Promise<EnvironmentConfig>;
  getFirebaseConfig(): Promise<FirebaseConfig>;
  get(key: string, defaultValue?: any): Promise<any>;
  getEnvironment(): Environment;
  isDevelopment(): boolean;
  isStaging(): boolean;
  isProduction(): boolean;
  debug(): void;
  reload(): Promise<EnvironmentConfig>;
}

// 設定関連の定数
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
} as const;

export const CONFIG_TYPES = {
  FIREBASE: 'firebase',
  APP: 'app',
  SECURITY: 'security',
  UI: 'ui'
} as const;