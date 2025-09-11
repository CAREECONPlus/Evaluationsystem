/**
 * 環境変数管理システム
 * ブラウザ環境で環境変数を安全に管理するためのモジュール
 */

class Environment {
  constructor() {
    this.config = null;
    this.isLoaded = false;
    this.environment = this.detectEnvironment();
    
  }

  /**
   * 実行環境を検出
   */
  detectEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;

    // 開発環境の判定
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.includes('local') ||
      hostname.includes('github.io') ||  // GitHub Pages も開発環境として扱う
      port === '3000' ||
      port === '5000' ||
      port === '8000' ||
      protocol === 'file:'
    ) {
      return 'development';
    }

    // ステージング環境の判定
    if (
      hostname.includes('staging') ||
      hostname.includes('test') ||
      hostname.includes('dev')
    ) {
      return 'staging';
    }

    // 本番環境
    return 'production';
  }

  /**
   * 環境設定を読み込み
   */
  async loadConfig() {
    if (this.isLoaded) {
      return this.config;
    }

    try {

      // GitHub Pages環境では代替設定を使用（CORS回避）
      if (this.environment === 'development') {
        this.config = {
          FIREBASE_API_KEY: "AIzaSyAK3wAWIZCultkSQfyse8L8Z-JNMEVK5Wk",
          FIREBASE_AUTH_DOMAIN: "hyouka-db.firebaseapp.com",
          FIREBASE_PROJECT_ID: "hyouka-db",
          FIREBASE_STORAGE_BUCKET: "hyouka-db.appspot.com",
          FIREBASE_MESSAGING_SENDER_ID: "861016804589",
          FIREBASE_APP_ID: "1:861016804589:web:d911d516d6c79aa73690e4",
          ENVIRONMENT: this.environment
        };
      } else if (hostname.includes('github.io')) {
        // GitHub Pages環境の設定
        console.log("Environment: Detected GitHub Pages environment");
        this.config = {
          FIREBASE_API_KEY: "AIzaSyAK3wAWIZCultkSQfyse8L8Z-JNMEVK5Wk",
          FIREBASE_AUTH_DOMAIN: "hyouka-db.firebaseapp.com",
          FIREBASE_PROJECT_ID: "hyouka-db",
          FIREBASE_STORAGE_BUCKET: "hyouka-db.appspot.com",
          FIREBASE_MESSAGING_SENDER_ID: "861016804589",
          FIREBASE_APP_ID: "1:861016804589:web:d911d516d6c79aa73690e4",
          ENVIRONMENT: 'github-pages'
        };
      } else {
        // 本番環境では環境変数から読み込み
        this.config = await this.loadFromServer();
      }

      this.isLoaded = true;
      
      return this.config;

    } catch (error) {
      console.error('Environment: 設定読み込みエラー:', error);
      throw new Error('環境設定の読み込みに失敗しました');
    }
  }

  /**
   * サーバーから環境設定を読み込み（本番環境用）
   */
  async loadFromServer() {
    try {
      // 本番環境では環境設定APIエンドポイントから取得
      const response = await fetch('/.well-known/config.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const serverConfig = await response.json();
      
      // 必要な環境変数が存在するかチェック
      const requiredVars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN', 
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
      ];

      const missing = requiredVars.filter(key => !serverConfig[key]);
      if (missing.length > 0) {
        throw new Error(`必要な環境変数が不足: ${missing.join(', ')}`);
      }

      return {
        ...serverConfig,
        ENVIRONMENT: this.environment
      };

    } catch (error) {
      console.error('Environment: サーバー設定読み込みエラー:', error);
      
      // フォールバック: メタタグから読み込み
      return this.loadFromMetaTags();
    }
  }

  /**
   * HTMLメタタグから環境変数を読み込み（フォールバック）
   */
  loadFromMetaTags() {
    try {

      const getMetaContent = (name) => {
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.getAttribute('content') : null;
      };

      const config = {
        FIREBASE_API_KEY: getMetaContent('firebase-api-key'),
        FIREBASE_AUTH_DOMAIN: getMetaContent('firebase-auth-domain'),
        FIREBASE_PROJECT_ID: getMetaContent('firebase-project-id'),
        FIREBASE_STORAGE_BUCKET: getMetaContent('firebase-storage-bucket'),
        FIREBASE_MESSAGING_SENDER_ID: getMetaContent('firebase-messaging-sender-id'),
        FIREBASE_APP_ID: getMetaContent('firebase-app-id'),
        ENVIRONMENT: this.environment
      };

      // 必須項目のチェック
      const missing = Object.entries(config)
        .filter(([key, value]) => key !== 'ENVIRONMENT' && !value)
        .map(([key]) => key);

      if (missing.length > 0) {
        throw new Error(`必要なメタタグが不足: ${missing.join(', ')}`);
      }

      return config;

    } catch (error) {
      console.error('Environment: メタタグ読み込みエラー:', error);
      throw error;
    }
  }

  /**
   * Firebase設定オブジェクトを取得
   */
  async getFirebaseConfig() {
    const config = await this.loadConfig();
    
    return {
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID
    };
  }

  /**
   * 環境変数を取得
   */
  async get(key, defaultValue = null) {
    const config = await this.loadConfig();
    return config[key] || defaultValue;
  }

  /**
   * 現在の環境名を取得
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * 開発環境かどうか判定
   */
  isDevelopment() {
    return this.environment === 'development';
  }

  /**
   * ステージング環境かどうか判定
   */
  isStaging() {
    return this.environment === 'staging';
  }

  /**
   * 本番環境かどうか判定
   */
  isProduction() {
    return this.environment === 'production';
  }

  /**
   * 設定情報をデバッグ出力（機密情報は隠す）
   */
  debug() {
    if (!this.isLoaded) {
      return;
    }

    const safeConfig = { ...this.config };
    
    // 機密情報を隠す
    Object.keys(safeConfig).forEach(key => {
      if (key.includes('KEY') || key.includes('SECRET')) {
        const value = safeConfig[key];
        if (value && value.length > 8) {
          safeConfig[key] = value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
        }
      }
    });

  }

  /**
   * 設定のリロード
   */
  async reload() {
    this.isLoaded = false;
    this.config = null;
    return await this.loadConfig();
  }
}

// シングルトンインスタンス
const environment = new Environment();

// グローバルに公開
window.Environment = Environment;
window.env = environment;

export { Environment };
export default environment;