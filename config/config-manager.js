/**
 * 統一設定管理システム
 * 全ての設定を一元管理し、環境別設定をサポート
 * 
 * @fileoverview
 * このモジュールは以下の設定を統一管理します：
 * - Firebase設定 (認証、データベース等)
 * - アプリケーション設定 (名前、バージョン等)  
 * - 環境別設定 (開発、ステージング、本番)
 * - セキュリティ設定 (セッション、認証等)
 * - UI設定 (言語、テーマ等)
 */

import { getLogger } from '../utils/logger.js';

/**
 * 環境タイプ定義
 * @readonly
 * @enum {string}
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging', 
  PRODUCTION: 'production'
};

/**
 * 設定タイプ定義
 * @readonly
 * @enum {string}
 */
export const CONFIG_TYPES = {
  FIREBASE: 'firebase',
  APP: 'app',
  SECURITY: 'security',
  UI: 'ui'
};

/**
 * Firebase設定の型定義
 * @typedef {Object} FirebaseConfig
 * @property {string} apiKey - Firebase API キー
 * @property {string} authDomain - 認証ドメイン
 * @property {string} projectId - プロジェクトID
 * @property {string} storageBucket - ストレージバケット
 * @property {string} messagingSenderId - メッセージング送信者ID
 * @property {string} appId - アプリケーションID
 */

/**
 * アプリケーション設定の型定義
 * @typedef {Object} AppConfig
 * @property {string} name - アプリケーション名
 * @property {string} version - バージョン
 * @property {string} description - 説明
 * @property {string} supportEmail - サポートメール
 * @property {string} companyName - 会社名
 * @property {boolean} maintenanceMode - メンテナンスモード
 */

/**
 * セキュリティ設定の型定義
 * @typedef {Object} SecurityConfig
 * @property {number} sessionTimeoutMs - セッションタイムアウト（ミリ秒）
 * @property {number} maxLoginAttempts - 最大ログイン試行回数
 * @property {number} passwordMinLength - パスワード最小長
 * @property {boolean} requireMFA - 多要素認証必須
 * @property {string[]} allowedDomains - 許可ドメインリスト
 */

/**
 * UI設定の型定義
 * @typedef {Object} UIConfig
 * @property {string} defaultLanguage - デフォルト言語
 * @property {string} theme - テーマ
 * @property {number} itemsPerPage - 1ページあたりのアイテム数
 * @property {boolean} darkModeEnabled - ダークモード有効
 * @property {number} toastDuration - トースト表示時間（ミリ秒）
 */

/**
 * 統合設定オブジェクトの型定義
 * @typedef {Object} UnifiedConfig
 * @property {string} environment - 環境名
 * @property {FirebaseConfig} firebase - Firebase設定
 * @property {AppConfig} app - アプリケーション設定
 * @property {SecurityConfig} security - セキュリティ設定
 * @property {UIConfig} ui - UI設定
 * @property {boolean} isLoaded - 設定読み込み完了フラグ
 * @property {number} loadedAt - 設定読み込み時刻（タイムスタンプ）
 */

/**
 * 統一設定管理クラス
 */
export class ConfigManager {
  constructor() {
    this.logger = getLogger('ConfigManager');
    
    /** @type {UnifiedConfig|null} */
    this.config = null;
    
    /** @type {boolean} */
    this.isLoaded = false;
    
    /** @type {string} */
    this.environment = this.detectEnvironment();
    
    /** @type {Map<string, any>} */
    this.cache = new Map();
    
    /** @type {Array<Function>} */
    this.configChangeListeners = [];
    
    this.logger.info(`ConfigManager initialized for environment: ${this.environment}`);
  }

  /**
   * 実行環境を検出
   * @returns {string} 環境名
   */
  detectEnvironment() {
    const { hostname, port, protocol } = window.location;
    
    // 開発環境の判定
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.includes('local') ||
      ['3000', '5000', '8000', '8080'].includes(port) ||
      protocol === 'file:'
    ) {
      return ENVIRONMENTS.DEVELOPMENT;
    }

    // ステージング環境の判定
    if (
      hostname.includes('staging') ||
      hostname.includes('test') ||
      hostname.includes('dev') ||
      hostname.includes('preview')
    ) {
      return ENVIRONMENTS.STAGING;
    }

    // 本番環境
    return ENVIRONMENTS.PRODUCTION;
  }

  /**
   * 設定を読み込み
   * @returns {Promise<UnifiedConfig>} 統合設定オブジェクト
   */
  async loadConfig() {
    if (this.isLoaded && this.config) {
      return this.config;
    }

    try {
      this.logger.info('Loading configuration...');
      
      // 環境別設定読み込み
      const envConfig = await this.loadEnvironmentConfig();
      
      // 統合設定オブジェクトを構築
      this.config = {
        environment: this.environment,
        firebase: this.buildFirebaseConfig(envConfig),
        app: this.buildAppConfig(envConfig),
        security: this.buildSecurityConfig(envConfig),
        ui: this.buildUIConfig(envConfig),
        isLoaded: true,
        loadedAt: Date.now()
      };

      // 設定の検証
      await this.validateConfig(this.config);
      
      this.isLoaded = true;
      
      // 変更リスナーに通知
      this.notifyConfigChange();
      
      this.logger.info('Configuration loaded successfully');
      return this.config;
      
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      throw new Error(`Configuration loading failed: ${error.message}`);
    }
  }

  /**
   * 環境別設定を読み込み
   * @returns {Promise<Object>} 環境設定
   * @private
   */
  async loadEnvironmentConfig() {
    const loadStrategies = [
      () => this.loadFromConfigFile(),
      () => this.loadFromMetaTags(),
      () => this.loadFromDefaults()
    ];

    for (const strategy of loadStrategies) {
      try {
        const config = await strategy();
        if (config && typeof config === 'object') {
          this.logger.debug('Environment config loaded via strategy');
          return config;
        }
      } catch (error) {
        this.logger.debug(`Config load strategy failed: ${error.message}`);
      }
    }

    throw new Error('All configuration loading strategies failed');
  }

  /**
   * 設定ファイルから読み込み
   * @returns {Promise<Object>} 設定オブジェクト
   * @private
   */
  async loadFromConfigFile() {
    const configUrl = `./config/${this.environment}.json`;
    
    try {
      const response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const config = await response.json();
      this.logger.debug(`Config loaded from file: ${configUrl}`);
      return config;
      
    } catch (error) {
      // フォールバック: well-knownから読み込み
      try {
        const response = await fetch('/.well-known/config.json');
        if (response.ok) {
          const config = await response.json();
          this.logger.debug('Config loaded from .well-known/config.json');
          return config;
        }
      } catch (fallbackError) {
        // フォールバック失敗は無視
      }
      
      throw error;
    }
  }

  /**
   * HTMLメタタグから読み込み
   * @returns {Object} 設定オブジェクト
   * @private
   */
  loadFromMetaTags() {
    const getMetaContent = (name) => {
      const meta = document.querySelector(`meta[name="${name}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    const config = {
      // Firebase設定
      FIREBASE_API_KEY: getMetaContent('firebase-api-key'),
      FIREBASE_AUTH_DOMAIN: getMetaContent('firebase-auth-domain'),
      FIREBASE_PROJECT_ID: getMetaContent('firebase-project-id'),
      FIREBASE_STORAGE_BUCKET: getMetaContent('firebase-storage-bucket'),
      FIREBASE_MESSAGING_SENDER_ID: getMetaContent('firebase-messaging-sender-id'),
      FIREBASE_APP_ID: getMetaContent('firebase-app-id'),
      
      // アプリ設定
      APP_NAME: getMetaContent('app-name'),
      APP_VERSION: getMetaContent('app-version'),
      SUPPORT_EMAIL: getMetaContent('support-email')
    };

    // 必須項目のチェック
    const requiredKeys = ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID'];
    const missing = requiredKeys.filter(key => !config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Required meta tags missing: ${missing.join(', ')}`);
    }

    this.logger.debug('Config loaded from meta tags');
    return config;
  }

  /**
   * デフォルト設定から読み込み
   * @returns {Object} デフォルト設定オブジェクト
   * @private
   */
  loadFromDefaults() {
    if (this.environment === ENVIRONMENTS.DEVELOPMENT) {
      // 開発環境のデフォルト設定
      return {
        FIREBASE_API_KEY: "AIzaSyAK3wAWIZCultkSQfyse8L8Z-JNMEVK5Wk",
        FIREBASE_AUTH_DOMAIN: "hyouka-db.firebaseapp.com",
        FIREBASE_PROJECT_ID: "hyouka-db",
        FIREBASE_STORAGE_BUCKET: "hyouka-db.appspot.com",
        FIREBASE_MESSAGING_SENDER_ID: "861016804589",
        FIREBASE_APP_ID: "1:861016804589:web:d911d516d6c79aa73690e4",
        
        APP_NAME: "建設業評価管理システム",
        APP_VERSION: "1.0.0",
        SUPPORT_EMAIL: "support@example.com"
      };
    }
    
    throw new Error('No default configuration available for this environment');
  }

  /**
   * Firebase設定を構築
   * @param {Object} envConfig 環境設定
   * @returns {FirebaseConfig} Firebase設定
   * @private
   */
  buildFirebaseConfig(envConfig) {
    return {
      apiKey: envConfig.FIREBASE_API_KEY,
      authDomain: envConfig.FIREBASE_AUTH_DOMAIN,
      projectId: envConfig.FIREBASE_PROJECT_ID,
      storageBucket: envConfig.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: envConfig.FIREBASE_MESSAGING_SENDER_ID,
      appId: envConfig.FIREBASE_APP_ID
    };
  }

  /**
   * アプリケーション設定を構築
   * @param {Object} envConfig 環境設定
   * @returns {AppConfig} アプリケーション設定
   * @private
   */
  buildAppConfig(envConfig) {
    return {
      name: envConfig.APP_NAME || '建設業評価管理システム',
      version: envConfig.APP_VERSION || '1.0.0',
      description: envConfig.APP_DESCRIPTION || '建設業向け従業員評価管理システム',
      supportEmail: envConfig.SUPPORT_EMAIL || 'support@example.com',
      companyName: envConfig.COMPANY_NAME || '',
      maintenanceMode: envConfig.MAINTENANCE_MODE === 'true' || false
    };
  }

  /**
   * セキュリティ設定を構築
   * @param {Object} envConfig 環境設定
   * @returns {SecurityConfig} セキュリティ設定
   * @private
   */
  buildSecurityConfig(envConfig) {
    return {
      sessionTimeoutMs: parseInt(envConfig.SESSION_TIMEOUT_MS) || 3600000, // 1時間
      maxLoginAttempts: parseInt(envConfig.MAX_LOGIN_ATTEMPTS) || 5,
      passwordMinLength: parseInt(envConfig.PASSWORD_MIN_LENGTH) || 6,
      requireMFA: envConfig.REQUIRE_MFA === 'true' || false,
      allowedDomains: envConfig.ALLOWED_DOMAINS ? envConfig.ALLOWED_DOMAINS.split(',') : []
    };
  }

  /**
   * UI設定を構築
   * @param {Object} envConfig 環境設定
   * @returns {UIConfig} UI設定
   * @private
   */
  buildUIConfig(envConfig) {
    return {
      defaultLanguage: envConfig.DEFAULT_LANGUAGE || 'ja',
      theme: envConfig.DEFAULT_THEME || 'light',
      itemsPerPage: parseInt(envConfig.ITEMS_PER_PAGE) || 20,
      darkModeEnabled: envConfig.DARK_MODE_ENABLED === 'true' || false,
      toastDuration: parseInt(envConfig.TOAST_DURATION_MS) || 3000
    };
  }

  /**
   * 設定の検証
   * @param {UnifiedConfig} config 統合設定
   * @returns {Promise<void>}
   * @private
   */
  async validateConfig(config) {
    const validations = [
      () => this.validateFirebaseConfig(config.firebase),
      () => this.validateAppConfig(config.app),
      () => this.validateSecurityConfig(config.security),
      () => this.validateUIConfig(config.ui)
    ];

    for (const validation of validations) {
      try {
        await validation();
      } catch (error) {
        throw new Error(`Configuration validation failed: ${error.message}`);
      }
    }

    this.logger.debug('Configuration validation successful');
  }

  /**
   * Firebase設定の検証
   * @param {FirebaseConfig} config Firebase設定
   * @private
   */
  validateFirebaseConfig(config) {
    const required = ['apiKey', 'authDomain', 'projectId'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing Firebase config: ${missing.join(', ')}`);
    }

    if (config.apiKey.length < 20) {
      throw new Error('Firebase API key appears to be invalid');
    }
  }

  /**
   * アプリケーション設定の検証
   * @param {AppConfig} config アプリケーション設定
   * @private
   */
  validateAppConfig(config) {
    if (!config.name || config.name.length < 3) {
      throw new Error('App name is required and must be at least 3 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (config.supportEmail && !emailRegex.test(config.supportEmail)) {
      throw new Error('Support email format is invalid');
    }
  }

  /**
   * セキュリティ設定の検証
   * @param {SecurityConfig} config セキュリティ設定
   * @private
   */
  validateSecurityConfig(config) {
    if (config.sessionTimeoutMs < 60000) { // 最低1分
      throw new Error('Session timeout must be at least 1 minute');
    }

    if (config.maxLoginAttempts < 1 || config.maxLoginAttempts > 100) {
      throw new Error('Max login attempts must be between 1 and 100');
    }

    if (config.passwordMinLength < 4 || config.passwordMinLength > 128) {
      throw new Error('Password min length must be between 4 and 128');
    }
  }

  /**
   * UI設定の検証
   * @param {UIConfig} config UI設定
   * @private
   */
  validateUIConfig(config) {
    const validLanguages = ['ja', 'en', 'vi'];
    if (!validLanguages.includes(config.defaultLanguage)) {
      throw new Error(`Invalid default language: ${config.defaultLanguage}`);
    }

    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(config.theme)) {
      throw new Error(`Invalid theme: ${config.theme}`);
    }

    if (config.itemsPerPage < 1 || config.itemsPerPage > 1000) {
      throw new Error('Items per page must be between 1 and 1000');
    }
  }

  /**
   * 設定値を取得
   * @template T
   * @param {string} path 設定のパス (例: 'firebase.apiKey', 'app.name')
   * @param {T} defaultValue デフォルト値
   * @returns {Promise<T>} 設定値
   */
  async get(path, defaultValue = null) {
    const config = await this.loadConfig();
    
    // キャッシュチェック
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    const value = this.getNestedValue(config, path) ?? defaultValue;
    
    // キャッシュに保存
    this.cache.set(path, value);
    
    return value;
  }

  /**
   * 特定タイプの設定を取得
   * @param {string} type 設定タイプ
   * @returns {Promise<Object>} 設定オブジェクト
   */
  async getConfigByType(type) {
    const config = await this.loadConfig();
    
    if (!config[type]) {
      throw new Error(`Invalid config type: ${type}`);
    }
    
    return config[type];
  }

  /**
   * Firebase設定を取得
   * @returns {Promise<FirebaseConfig>} Firebase設定
   */
  async getFirebaseConfig() {
    return await this.getConfigByType(CONFIG_TYPES.FIREBASE);
  }

  /**
   * アプリケーション設定を取得
   * @returns {Promise<AppConfig>} アプリケーション設定
   */
  async getAppConfig() {
    return await this.getConfigByType(CONFIG_TYPES.APP);
  }

  /**
   * セキュリティ設定を取得
   * @returns {Promise<SecurityConfig>} セキュリティ設定
   */
  async getSecurityConfig() {
    return await this.getConfigByType(CONFIG_TYPES.SECURITY);
  }

  /**
   * UI設定を取得
   * @returns {Promise<UIConfig>} UI設定
   */
  async getUIConfig() {
    return await this.getConfigByType(CONFIG_TYPES.UI);
  }

  /**
   * 環境名を取得
   * @returns {string} 環境名
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * 開発環境かどうか判定
   * @returns {boolean}
   */
  isDevelopment() {
    return this.environment === ENVIRONMENTS.DEVELOPMENT;
  }

  /**
   * ステージング環境かどうか判定
   * @returns {boolean}
   */
  isStaging() {
    return this.environment === ENVIRONMENTS.STAGING;
  }

  /**
   * 本番環境かどうか判定
   * @returns {boolean}
   */
  isProduction() {
    return this.environment === ENVIRONMENTS.PRODUCTION;
  }

  /**
   * 設定変更リスナーを追加
   * @param {Function} listener コールバック関数
   */
  addConfigChangeListener(listener) {
    if (typeof listener === 'function') {
      this.configChangeListeners.push(listener);
    }
  }

  /**
   * 設定変更リスナーを削除
   * @param {Function} listener コールバック関数
   */
  removeConfigChangeListener(listener) {
    const index = this.configChangeListeners.indexOf(listener);
    if (index > -1) {
      this.configChangeListeners.splice(index, 1);
    }
  }

  /**
   * 設定変更を通知
   * @private
   */
  notifyConfigChange() {
    this.configChangeListeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        this.logger.warn('Config change listener error:', error);
      }
    });
  }

  /**
   * ネストされたオブジェクトから値を取得
   * @param {Object} obj オブジェクト
   * @param {string} path パス
   * @returns {any} 値
   * @private
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 設定をリロード
   * @returns {Promise<UnifiedConfig>}
   */
  async reload() {
    this.isLoaded = false;
    this.config = null;
    this.cache.clear();
    
    this.logger.info('Reloading configuration...');
    return await this.loadConfig();
  }

  /**
   * デバッグ情報を出力
   */
  debug() {
    if (!this.isLoaded) {
      this.logger.warn('Configuration not loaded yet');
      return;
    }

    const safeConfig = this.createSafeConfigForLogging(this.config);
    
    this.logger.group('Configuration Debug Info');
    this.logger.info('Environment:', this.environment);
    this.logger.info('Loaded at:', new Date(this.config.loadedAt));
    this.logger.info('Cache size:', this.cache.size);
    this.logger.info('Config listeners:', this.configChangeListeners.length);
    this.logger.info('Safe config:', safeConfig);
    this.logger.groupEnd();
  }

  /**
   * ログ出力用の安全な設定オブジェクトを作成
   * @param {UnifiedConfig} config 設定オブジェクト
   * @returns {Object} 機密情報を隠した設定オブジェクト
   * @private
   */
  createSafeConfigForLogging(config) {
    const safe = JSON.parse(JSON.stringify(config));
    
    // Firebase APIキーを隠す
    if (safe.firebase && safe.firebase.apiKey) {
      const apiKey = safe.firebase.apiKey;
      safe.firebase.apiKey = apiKey.slice(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.slice(-4);
    }
    
    return safe;
  }
}

// シングルトンインスタンス
const configManager = new ConfigManager();

/**
 * グローバル設定取得関数
 * @template T
 * @param {string} path 設定パス
 * @param {T} defaultValue デフォルト値
 * @returns {Promise<T>} 設定値
 */
export async function getConfig(path, defaultValue = null) {
  return await configManager.get(path, defaultValue);
}

/**
 * Firebase設定取得関数
 * @returns {Promise<FirebaseConfig>} Firebase設定
 */
export async function getFirebaseConfig() {
  return await configManager.getFirebaseConfig();
}

/**
 * アプリケーション設定取得関数
 * @returns {Promise<AppConfig>} アプリケーション設定
 */
export async function getAppConfig() {
  return await configManager.getAppConfig();
}

// エクスポート
export default configManager;

// グローバルに公開 (デバッグ用)
if (typeof window !== 'undefined') {
  window.configManager = configManager;
  window.getConfig = getConfig;
}