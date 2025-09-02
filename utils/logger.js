/**
 * ログ管理システム
 * 環境別にログレベルを制御し、本番環境での不要なログ出力を防ぐ
 */

// 環境設定
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging', 
  PRODUCTION: 'production'
};

// ログレベル定義
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// 環境検出
function detectEnvironment() {
  // 本番環境の検出条件
  if (location.hostname === 'evaluationsystem-firebase.web.app' || 
      location.hostname.includes('.firebaseapp.com') ||
      location.protocol === 'https:' && !location.hostname.includes('localhost')) {
    return ENVIRONMENTS.PRODUCTION;
  }
  
  // ステージング環境の検出
  if (location.hostname.includes('staging') || 
      location.hostname.includes('test')) {
    return ENVIRONMENTS.STAGING;
  }
  
  // デフォルトは開発環境
  return ENVIRONMENTS.DEVELOPMENT;
}

// 環境別ログレベル設定
const ENVIRONMENT_LOG_LEVELS = {
  [ENVIRONMENTS.DEVELOPMENT]: LOG_LEVELS.DEBUG, // 開発環境：全てのログを出力
  [ENVIRONMENTS.STAGING]: LOG_LEVELS.INFO,      // ステージング：INFO以上を出力
  [ENVIRONMENTS.PRODUCTION]: LOG_LEVELS.WARN    // 本番環境：WARN以上のみ出力
};

class Logger {
  constructor(context = 'System') {
    this.context = context;
    this.environment = detectEnvironment();
    this.logLevel = ENVIRONMENT_LOG_LEVELS[this.environment];
    this.startTime = Date.now();
    this.logCount = { debug: 0, info: 0, warn: 0, error: 0 };
    
    // 本番環境でのログ警告（一度だけ表示）
    if (this.environment === ENVIRONMENTS.PRODUCTION && !window.__loggerWarningShown) {
      console.info('🚀 Production mode: Limited logging enabled');
      window.__loggerWarningShown = true;
    }
  }

  /**
   * ログレベルチェック
   */
  shouldLog(level) {
    return level >= this.logLevel;
  }

  /**
   * フォーマット済みメッセージを作成
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS)[level];
    let formatted = `[${timestamp}] ${levelName} [${this.context}] ${message}`;
    
    if (data) {
      formatted += '\n' + JSON.stringify(data, null, 2);
    }
    
    return formatted;
  }

  /**
   * パフォーマンス情報付きログ
   */
  formatPerformanceMessage(level, message, data = null) {
    const elapsed = Date.now() - this.startTime;
    const memory = performance.memory ? 
      `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A';
    
    const perfInfo = `⏱️${elapsed}ms 💾${memory}`;
    return this.formatMessage(level, `${message} (${perfInfo})`, data);
  }

  /**
   * デバッグログ
   */
  debug(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    
    this.logCount.debug++;
    console.debug(this.formatMessage(LOG_LEVELS.DEBUG, message, data));
  }

  /**
   * 情報ログ
   */
  info(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    this.logCount.info++;
    console.info(this.formatMessage(LOG_LEVELS.INFO, message, data));
  }

  /**
   * 警告ログ
   */
  warn(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    
    this.logCount.warn++;
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, data));
  }

  /**
   * エラーログ
   */
  error(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    
    this.logCount.error++;
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, data));
  }

  /**
   * パフォーマンス情報付きログ
   */
  perf(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    this.logCount.info++;
    console.info(this.formatPerformanceMessage(LOG_LEVELS.INFO, message, data));
  }

  /**
   * グループログ開始
   */
  group(title) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.group(`📁 [${this.context}] ${title}`);
    }
  }

  /**
   * グループログ終了
   */
  groupEnd() {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.groupEnd();
    }
  }

  /**
   * テーブル形式でログ出力
   */
  table(data, message = '') {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    if (message) {
      this.info(message);
    }
    console.table(data);
  }

  /**
   * 実行時間測定
   */
  time(label) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.time(`⏱️ [${this.context}] ${label}`);
    }
  }

  /**
   * 実行時間測定終了
   */
  timeEnd(label) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.timeEnd(`⏱️ [${this.context}] ${label}`);
    }
  }

  /**
   * 統計情報を取得
   */
  getStats() {
    return {
      context: this.context,
      environment: this.environment,
      logLevel: this.logLevel,
      uptime: Date.now() - this.startTime,
      logCount: { ...this.logCount },
      totalLogs: Object.values(this.logCount).reduce((sum, count) => sum + count, 0)
    };
  }

  /**
   * 環境情報を表示
   */
  showEnvironmentInfo() {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    this.group('Environment Information');
    this.info(`Environment: ${this.environment}`);
    this.info(`Log Level: ${Object.keys(LOG_LEVELS)[this.logLevel]}`);
    this.info(`Hostname: ${location.hostname}`);
    this.info(`Protocol: ${location.protocol}`);
    this.info(`User Agent: ${navigator.userAgent}`);
    this.groupEnd();
  }
}

// ログファクトリー
class LoggerFactory {
  constructor() {
    this.loggers = new Map();
    this.globalLogLevel = null;
  }

  /**
   * ログインスタンスを取得
   */
  getLogger(context = 'System') {
    if (!this.loggers.has(context)) {
      this.loggers.set(context, new Logger(context));
    }
    return this.loggers.get(context);
  }

  /**
   * 全体のログレベルを設定
   */
  setGlobalLogLevel(level) {
    this.globalLogLevel = level;
    this.loggers.forEach(logger => {
      logger.logLevel = level;
    });
  }

  /**
   * 全ロガーの統計を取得
   */
  getAllStats() {
    const stats = {
      environment: detectEnvironment(),
      totalLoggers: this.loggers.size,
      loggers: {}
    };

    this.loggers.forEach((logger, context) => {
      stats.loggers[context] = logger.getStats();
    });

    return stats;
  }

  /**
   * パフォーマンス統計を表示
   */
  showPerformanceStats() {
    const logger = this.getLogger('LoggerFactory');
    const stats = this.getAllStats();
    
    logger.group('Performance Statistics');
    logger.table(stats.loggers, 'Logger Statistics by Context');
    logger.info(`Total Active Loggers: ${stats.totalLoggers}`);
    logger.info(`Current Environment: ${stats.environment}`);
    
    // メモリ使用量
    if (performance.memory) {
      const memory = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
      logger.info('Memory Usage (MB):', memory);
    }
    
    logger.groupEnd();
  }

  /**
   * 本番環境警告の無効化
   */
  disableProductionWarning() {
    window.__loggerWarningShown = true;
  }
}

// グローバルインスタンス
const loggerFactory = new LoggerFactory();

// コンビニエンス関数
export function getLogger(context) {
  return loggerFactory.getLogger(context);
}

export function setGlobalLogLevel(level) {
  loggerFactory.setGlobalLogLevel(level);
}

export function showPerformanceStats() {
  loggerFactory.showPerformanceStats();
}

// エクスポート
export {
  Logger,
  LoggerFactory,
  LOG_LEVELS,
  ENVIRONMENTS,
  loggerFactory
};

// グローバルに公開（後方互換性のため）
window.Logger = Logger;
window.getLogger = getLogger;
window.LOG_LEVELS = LOG_LEVELS;

// デフォルトロガーを作成
export default getLogger();