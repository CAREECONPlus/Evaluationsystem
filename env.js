/**
 * Environment Configuration Manager
 * 環境設定管理モジュール
 */

export class Environment {
  constructor() {
    this.config = null;
    this.isLoaded = false;
    
    // デフォルト設定
    this.defaultConfig = {
      firebase: {
        apiKey: "AIzaSyDEMOCRATIC_API_KEY_HERE",
        authDomain: "demo-project.firebaseapp.com",
        projectId: "demo-project",
        storageBucket: "demo-project.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:abcdef123456",
        measurementId: "G-XXXXXXXXXX"
      },
      api: {
        baseUrl: "/api",
        timeout: 30000
      },
      app: {
        name: "建設業評価管理システム",
        version: "1.0.0",
        environment: "development",
        debug: true
      },
      features: {
        enableNotifications: true,
        enableOfflineMode: false,
        enableAnalytics: false,
        maxFileUploadSize: 10485760, // 10MB
        sessionTimeout: 3600000 // 1時間
      },
      ui: {
        theme: "light",
        language: "ja",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm:ss"
      }
    };
  }

  /**
   * 環境設定を読み込み
   * @returns {Promise<Object>} 設定オブジェクト
   */
  async loadConfig() {
    if (this.isLoaded) {
      return this.config;
    }

    try {
      // 1. サーバーから設定を読み込み
      await this.loadFromServer();
    } catch (serverError) {
      console.warn('Environment: サーバー設定読み込みエラー:', serverError.message);
      
      try {
        // 2. メタタグから設定を読み込み
        this.loadFromMetaTags();
      } catch (metaError) {
        console.warn('Environment: メタタグ読み込みエラー:', metaError.message);
        
        // 3. デフォルト設定を使用（開発環境用）
        console.warn('Environment: デフォルト設定を使用します（開発環境）');
        this.config = { ...this.defaultConfig };
        
        // 開発環境の警告を表示
        if (this.isDevelopment()) {
          console.warn('⚠️ Firebase設定がデフォルト値です。本番環境では必ず実際の設定を使用してください。');
        }
      }
    }

    this.isLoaded = true;
    console.log('Environment: 設定読み込み完了', this.config);
    return this.config;
  }

  /**
   * サーバーから設定を読み込み
   * @returns {Promise<void>}
   */
  async loadFromServer() {
    console.log('Environment: サーバーから設定を読み込み中...');
    
    const response = await fetch('/.well-known/config.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 必須項目の検証
    this.validateConfig(data);
    
    this.config = data;
    console.log('Environment: サーバー設定読み込み成功');
  }

  /**
   * メタタグから設定を読み込み
   */
  loadFromMetaTags() {
    console.log('Environment: メタタグから設定を読み込み中...');
    
    const getMetaContent = (name) => {
      const meta = document.querySelector(`meta[name="${name}"]`);
      return meta ? meta.content : null;
    };

    const config = {
      firebase: {
        apiKey: getMetaContent('firebase-api-key'),
        authDomain: getMetaContent('firebase-auth-domain'),
        projectId: getMetaContent('firebase-project-id'),
        storageBucket: getMetaContent('firebase-storage-bucket'),
        messagingSenderId: getMetaContent('firebase-messaging-sender-id'),
        appId: getMetaContent('firebase-app-id'),
        measurementId: getMetaContent('firebase-measurement-id')
      },
      api: {
        baseUrl: getMetaContent('api-base-url') || '/api',
        timeout: parseInt(getMetaContent('api-timeout')) || 30000
      },
      app: {
        name: getMetaContent('app-name') || '建設業評価管理システム',
        version: getMetaContent('app-version') || '1.0.0',
        environment: getMetaContent('app-environment') || 'production',
        debug: getMetaContent('app-debug') === 'true'
      },
      features: {
        enableNotifications: getMetaContent('feature-notifications') !== 'false',
        enableOfflineMode: getMetaContent('feature-offline') === 'true',
        enableAnalytics: getMetaContent('feature-analytics') === 'true',
        maxFileUploadSize: parseInt(getMetaContent('feature-max-upload')) || 10485760,
        sessionTimeout: parseInt(getMetaContent('feature-session-timeout')) || 3600000
      },
      ui: {
        theme: getMetaContent('ui-theme') || 'light',
        language: getMetaContent('ui-language') || 'ja',
        dateFormat: getMetaContent('ui-date-format') || 'YYYY-MM-DD',
        timeFormat: getMetaContent('ui-time-format') || 'HH:mm:ss'
      }
    };

    // 必須項目の検証
    this.validateConfig(config);
    
    this.config = config;
    console.log('Environment: メタタグ設定読み込み成功');
  }

  /**
   * 設定の検証
   * @param {Object} config - 検証する設定
   */
  validateConfig(config) {
    const requiredFields = [
      'firebase.apiKey',
      'firebase.authDomain',
      'firebase.projectId',
      'firebase.storageBucket',
      'firebase.messagingSenderId',
      'firebase.appId'
    ];

    const missing = [];
    
    for (const field of requiredFields) {
      const keys = field.split('.');
      let value = config;
      
      for (const key of keys) {
        value = value?.[key];
      }
      
      if (!value) {
        missing.push(field.split('.').pop().replace(/([A-Z])/g, '_$1').toUpperCase());
      }
    }

    if (missing.length > 0) {
      // 開発環境では警告のみ
      if (this.isDevelopment()) {
        console.warn(`Environment: 設定項目が不足していますが、開発環境のため続行します: ${missing.join(', ')}`);
      } else {
        throw new Error(`必要な設定項目が不足: ${missing.join(', ')}`);
      }
    }
  }

  /**
   * Firebase設定を取得
   * @returns {Promise<Object>} Firebase設定
   */
  async getFirebaseConfig() {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return this.config.firebase;
  }

  /**
   * API設定を取得
   * @returns {Promise<Object>} API設定
   */
  async getApiConfig() {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return this.config.api;
  }

  /**
   * アプリ設定を取得
   * @returns {Promise<Object>} アプリ設定
   */
  async getAppConfig() {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return this.config.app;
  }

  /**
   * 機能設定を取得
   * @returns {Promise<Object>} 機能設定
   */
  async getFeatureConfig() {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return this.config.features;
  }

  /**
   * UI設定を取得
   * @returns {Promise<Object>} UI設定
   */
  async getUiConfig() {
    if (!this.isLoaded) {
      await this.loadConfig();
    }
    return this.config.ui;
  }

  /**
   * 開発環境かどうか
   * @returns {boolean}
   */
  isDevelopment() {
    // URLベースで判定
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.includes('dev.') ||
           this.config?.app?.environment === 'development';
  }

  /**
   * 本番環境かどうか
   * @returns {boolean}
   */
  isProduction() {
    return !this.isDevelopment() && this.config?.app?.environment === 'production';
  }

  /**
   * デバッグモードかどうか
   * @returns {boolean}
   */
  isDebugMode() {
    return this.config?.app?.debug === true || this.isDevelopment();
  }

  /**
   * 設定を更新（ランタイム）
   * @param {string} path - 設定パス（例: 'ui.theme'）
   * @param {any} value - 新しい値
   */
  updateConfig(path, value) {
    if (!this.config) {
      console.error('Environment: 設定が読み込まれていません');
      return;
    }

    const keys = path.split('.');
    let target = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!target[key]) {
        target[key] = {};
      }
      target = target[key];
    }
    
    target[keys[keys.length - 1]] = value;
    console.log(`Environment: 設定更新 ${path} = ${value}`);
  }

  /**
   * 環境変数を取得
   * @param {string} key - 環境変数キー
   * @param {any} defaultValue - デフォルト値
   * @returns {any}
   */
  getEnv(key, defaultValue = null) {
    // 設定から取得
    const keys = key.toLowerCase().replace(/_/g, '.').split('.');
    let value = this.config;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return defaultValue;
      }
    }
    
    return value;
  }
}

// シングルトンインスタンスをエクスポート
export const env = new Environment();
