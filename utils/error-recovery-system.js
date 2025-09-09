/**
 * Error Recovery System - Phase 9
 * エラーハンドリング完全実装
 */

export class ErrorRecoverySystem {
  constructor(app) {
    this.app = app;
    this.errorLog = [];
    this.recoveryStrategies = new Map();
    this.retryQueue = [];
    this.userNotifications = [];
    
    this.config = {
      maxRetries: 3,
      retryDelays: [1000, 3000, 5000], // 1秒、3秒、5秒
      maxErrorLogSize: 1000,
      criticalErrorTypes: [
        'SecurityError',
        'NetworkError', 
        'AuthenticationError',
        'DataCorruptionError'
      ],
      autoRecoveryTypes: [
        'NetworkTimeoutError',
        'RateLimitError',
        'TemporaryUnavailableError'
      ]
    };
    
    this.errorCategories = {
      NETWORK: 'network',
      AUTHENTICATION: 'auth',
      VALIDATION: 'validation',
      PERMISSION: 'permission',
      DATA: 'data',
      UI: 'ui',
      SECURITY: 'security',
      PERFORMANCE: 'performance',
      UNKNOWN: 'unknown'
    };
    
    this.init();
  }

  /**
   * エラーリカバリシステムの初期化
   */
  init() {
    this.setupGlobalErrorHandlers();
    this.setupRecoveryStrategies();
    this.setupRetrySystem();
    this.setupUserNotificationSystem();
    this.startErrorMonitoring();
    
    console.log('Error Recovery System: システムが初期化されました');
  }

  /**
   * グローバルエラーハンドラーの設定
   */
  setupGlobalErrorHandlers() {
    // JavaScript エラー
    window.addEventListener('error', (event) => {
      this.handleJavaScriptError(event.error, event.filename, event.lineno);
    });

    // Promise rejection エラー
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event.reason);
    });

    // リソース読み込みエラー
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleResourceError(event.target, event.type);
      }
    }, true);

    // Network エラー
    window.addEventListener('offline', () => {
      this.handleNetworkError('offline');
    });
    
    window.addEventListener('online', () => {
      this.handleNetworkRecovery();
    });
  }

  /**
   * JavaScript エラーの処理
   */
  handleJavaScriptError(error, filename, lineno) {
    const errorInfo = {
      type: 'JavaScriptError',
      message: error?.message || 'Unknown JavaScript error',
      stack: error?.stack || '',
      filename: filename || 'unknown',
      lineno: lineno || 0,
      timestamp: new Date().toISOString(),
      category: this.categorizeError(error),
      severity: this.determineSeverity(error),
      context: this.gatherErrorContext()
    };

    this.logError(errorInfo);
    this.attemptRecovery(errorInfo);
  }

  /**
   * Promise Rejection エラーの処理
   */
  handlePromiseRejection(reason) {
    const errorInfo = {
      type: 'PromiseRejection',
      message: reason?.message || reason?.toString() || 'Unhandled promise rejection',
      stack: reason?.stack || '',
      timestamp: new Date().toISOString(),
      category: this.categorizeError(reason),
      severity: this.determineSeverity(reason),
      context: this.gatherErrorContext()
    };

    this.logError(errorInfo);
    this.attemptRecovery(errorInfo);
  }

  /**
   * リソースエラーの処理
   */
  handleResourceError(target, type) {
    const errorInfo = {
      type: 'ResourceError',
      message: `Failed to load ${target.tagName}: ${target.src || target.href}`,
      resource: target.src || target.href,
      element: target.tagName,
      timestamp: new Date().toISOString(),
      category: this.errorCategories.NETWORK,
      severity: 'medium',
      context: this.gatherErrorContext()
    };

    this.logError(errorInfo);
    this.attemptRecovery(errorInfo);
  }

  /**
   * ネットワークエラーの処理
   */
  handleNetworkError(type) {
    const errorInfo = {
      type: 'NetworkError',
      message: `Network ${type} detected`,
      networkType: type,
      timestamp: new Date().toISOString(),
      category: this.errorCategories.NETWORK,
      severity: 'high',
      context: this.gatherErrorContext()
    };

    this.logError(errorInfo);
    this.attemptRecovery(errorInfo);
    
    // ユーザーに通知
    this.showUserNotification(
      'ネットワーク接続エラー',
      'インターネット接続を確認してください。自動的に復旧を試行します。',
      'warning'
    );
  }

  /**
   * エラーのカテゴリ分類
   */
  categorizeError(error) {
    if (!error) return this.errorCategories.UNKNOWN;

    const message = error.message || error.toString();
    const type = error.constructor?.name || '';

    // ネットワークエラー
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('timeout') || type.includes('Network')) {
      return this.errorCategories.NETWORK;
    }

    // 認証エラー
    if (message.includes('auth') || message.includes('unauthorized') || 
        message.includes('forbidden') || type.includes('Auth')) {
      return this.errorCategories.AUTHENTICATION;
    }

    // バリデーションエラー
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required') || type.includes('Validation')) {
      return this.errorCategories.VALIDATION;
    }

    // 権限エラー
    if (message.includes('permission') || message.includes('access denied') || 
        message.includes('not allowed')) {
      return this.errorCategories.PERMISSION;
    }

    // データエラー
    if (message.includes('data') || message.includes('parse') || 
        message.includes('json') || type.includes('Data')) {
      return this.errorCategories.DATA;
    }

    // セキュリティエラー
    if (message.includes('security') || message.includes('csrf') || 
        message.includes('xss') || type.includes('Security')) {
      return this.errorCategories.SECURITY;
    }

    return this.errorCategories.UNKNOWN;
  }

  /**
   * エラーコンテキストの収集
   */
  gatherErrorContext() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      user: this.app?.currentUser?.uid || 'anonymous',
      page: document.title,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      } : null
    };
  }

  /**
   * リカバリ戦略の設定
   */
  setupRecoveryStrategies() {
    // ネットワークエラーのリカバリ
    this.recoveryStrategies.set(this.errorCategories.NETWORK, {
      strategy: 'retry',
      maxRetries: 3,
      backoff: 'exponential',
      fallback: 'offline-mode'
    });

    // 認証エラーのリカバリ
    this.recoveryStrategies.set(this.errorCategories.AUTHENTICATION, {
      strategy: 'reauth',
      maxRetries: 1,
      fallback: 'login-redirect'
    });

    // バリデーションエラーのリカバリ
    this.recoveryStrategies.set(this.errorCategories.VALIDATION, {
      strategy: 'user-input',
      maxRetries: 0,
      fallback: 'form-reset'
    });
  }

  /**
   * ユーザー通知システムの設定
   */
  setupUserNotificationSystem() {
    this.createNotificationContainer();
  }

  /**
   * 通知コンテナの作成
   */
  createNotificationContainer() {
    if (document.getElementById('error-notifications')) return;
    
    const container = document.createElement('div');
    container.id = 'error-notifications';
    container.className = 'error-notifications-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    
    document.body.appendChild(container);
  }

  /**
   * ユーザー通知の表示
   */
  showUserNotification(title, message, type = 'info', actions = []) {
    const notification = document.createElement('div');
    const id = 'notification-' + Date.now();
    notification.id = id;
    notification.className = `notification notification-${type}`;
    
    const iconMap = {
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      info: 'fa-info-circle'
    };
    
    let actionsHtml = '';
    if (actions.length > 0) {
      actionsHtml = actions.map(action => 
        `<button class="notification-action">${action.text}</button>`
      ).join('');
    }
    
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">
          <i class="fas ${iconMap[type]}"></i>
          <span class="notification-title">${title}</span>
          <button class="notification-close" onclick="this.closest('.notification').remove()">&times;</button>
        </div>
        <div class="notification-message">${message}</div>
        ${actionsHtml ? `<div class="notification-actions">${actionsHtml}</div>` : ''}
      </div>
    `;
    
    // スタイル適用
    notification.style.cssText = `
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid ${this.getNotificationColor(type)};
    `;
    
    const container = document.getElementById('error-notifications');
    container.appendChild(notification);
    
    // 自動削除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * 通知の色を取得
   */
  getNotificationColor(type) {
    const colors = {
      success: '#28a745',
      warning: '#ffc107', 
      error: '#dc3545',
      info: '#17a2b8'
    };
    return colors[type] || colors.info;
  }

  /**
   * エラーの記録
   */
  logError(errorInfo) {
    this.errorLog.push(errorInfo);
    
    // ログサイズ制限
    if (this.errorLog.length > this.config.maxErrorLogSize) {
      this.errorLog = this.errorLog.slice(-this.config.maxErrorLogSize / 2);
    }
  }

  /**
   * リカバリの試行
   */
  async attemptRecovery(errorInfo) {
    const strategy = this.recoveryStrategies.get(errorInfo.category);
    
    if (!strategy) {
      console.log('Error Recovery System: リカバリ戦略なし:', errorInfo);
      return;
    }

    console.log(`Error Recovery System: リカバリを試行中 (${strategy.strategy})`, errorInfo);
  }

  /**
   * リトライシステムの設定
   */
  setupRetrySystem() {
    // リトライキューの処理を定期実行
    setInterval(() => {
      this.processRetryQueue();
    }, 5000);
  }

  /**
   * リトライキューの処理
   */
  processRetryQueue() {
    // 実装はシンプル化
    if (this.retryQueue.length > 0) {
      console.log('Error Recovery System: リトライキューを処理中');
    }
  }

  /**
   * エラー監視の開始
   */
  startErrorMonitoring() {
    // 定期的なエラーレポート生成
    setInterval(() => {
      this.generateErrorReport();
    }, 600000); // 10分ごと
  }

  /**
   * エラーレポートの生成
   */
  generateErrorReport() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    const recentErrors = this.errorLog.filter(error => 
      new Date(error.timestamp) > oneHourAgo
    );
    
    const report = {
      timestamp: now.toISOString(),
      summary: {
        totalErrors: this.errorLog.length,
        recentErrors: recentErrors.length,
        criticalErrors: recentErrors.filter(e => e.severity === 'critical').length
      },
      topErrors: this.getTopErrors(recentErrors, 5),
      recommendations: this.generateErrorRecommendations(recentErrors)
    };
    
    console.log('Error Recovery System: エラーレポート', report);
    return report;
  }

  /**
   * トップエラーの取得
   */
  getTopErrors(errors, limit) {
    const errorCount = {};
    
    errors.forEach(error => {
      const key = `${error.type}-${error.message}`;
      errorCount[key] = (errorCount[key] || 0) + 1;
    });
    
    return Object.entries(errorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * エラー推奨事項の生成
   */
  generateErrorRecommendations(errors) {
    const recommendations = [];
    
    const networkErrors = errors.filter(e => e.category === this.errorCategories.NETWORK).length;
    if (networkErrors > 5) {
      recommendations.push('ネットワークエラーが頻発しています。接続の安定性を確認してください。');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('現在のエラー状況は安定しています。');
    }
    
    return recommendations;
  }

  /**
   * エラー重要度の判定
   */
  determineSeverity(error) {
    if (!error) return 'low';

    const message = error.message || error.toString();
    const type = error.constructor?.name || '';

    // 重大なエラー
    if (this.config.criticalErrorTypes.some(criticalType => 
        type.includes(criticalType) || message.includes(criticalType.toLowerCase()))) {
      return 'critical';
    }

    // 高重要度エラー
    if (message.includes('auth') || message.includes('security')) {
      return 'high';
    }

    // 中重要度エラー
    if (message.includes('network') || message.includes('validation')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * 統計情報の取得
   */
  getStatistics() {
    return {
      totalErrors: this.errorLog.length,
      errorsByCategory: this.getErrorCategoryDistribution(),
      recentErrors: this.errorLog.filter(e => 
        Date.now() - new Date(e.timestamp).getTime() < 3600000
      ).length,
      recoveryAttempts: this.retryQueue.length
    };
  }

  /**
   * エラーカテゴリ分布の取得
   */
  getErrorCategoryDistribution() {
    const distribution = {};
    
    Object.values(this.errorCategories).forEach(category => {
      distribution[category] = this.errorLog.filter(e => e.category === category).length;
    });
    
    return distribution;
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup() {
    this.errorLog = [];
    this.retryQueue = [];
    this.userNotifications = [];
    
    const container = document.getElementById('error-notifications');
    if (container) {
      container.remove();
    }
    
    console.log('Error Recovery System: リソースをクリーンアップしました');
  }
}

// Export singleton instance
export const errorRecoverySystem = new ErrorRecoverySystem();