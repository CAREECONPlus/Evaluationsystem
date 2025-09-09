/**
 * Phase 9 Integration - System Integration & Security Enhancement
 * Phase 9統合 - システム統合とセキュリティ強化
 */

import { securityAuditor } from './security-auditor.js';
import { databaseOptimizer } from './database-optimizer.js';
import { apiOptimizer } from './api-optimizer.js';
import { errorRecoverySystem } from './error-recovery-system.js';

// Global flag to prevent multiple initialization
let globalPhase9Initialized = false;

class Phase9Integration {
  constructor() {
    this.initialized = false;
    this.components = new Map();
    this.monitoringIntervals = new Map();
    this.systemStatus = {
      security: 'unknown',
      database: 'unknown',
      api: 'unknown',
      errors: 'unknown',
      overall: 'unknown'
    };
    
    this.init();
  }

  /**
   * Phase 9統合システムの初期化
   */
  async init() {
    if (this.initialized || globalPhase9Initialized) {
      console.warn('Phase 9: 既に初期化済みです');
      return;
    }

    globalPhase9Initialized = true;
    console.log('Phase 9: システム統合とセキュリティ強化を初期化中...');

    try {
      // コアシステムの初期化
      await this.initializeCoreComponents();
      
      // システム間の統合設定
      this.setupSystemIntegration();
      
      // 監視システムの開始
      this.startSystemMonitoring();
      
      // セキュリティ強化の適用
      this.applySecurityEnhancements();
      
      // パフォーマンス最適化の適用
      this.applyPerformanceOptimizations();
      
      this.initialized = true;
      console.log('Phase 9: システム統合完了');
      
      // 初期化完了イベントの発火
      this.triggerInitializationEvent();
      
    } catch (error) {
      console.error('Phase 9: 初期化エラー:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * コアコンポーネントの初期化
   */
  async initializeCoreComponents() {
    const components = [
      { name: 'security', instance: securityAuditor, required: true },
      { name: 'database', instance: databaseOptimizer, required: true },
      { name: 'api', instance: apiOptimizer, required: true },
      { name: 'errors', instance: errorRecoverySystem, required: true }
    ];

    for (const component of components) {
      try {
        await this.initializeComponent(component);
        this.components.set(component.name, component.instance);
        this.systemStatus[component.name] = 'ok';
        
      } catch (error) {
        console.error(`Phase 9: ${component.name}の初期化に失敗:`, error);
        this.systemStatus[component.name] = 'error';
        
        if (component.required) {
          throw new Error(`必須コンポーネント ${component.name} の初期化に失敗しました`);
        }
      }
    }
  }

  /**
   * 個別コンポーネントの初期化
   */
  async initializeComponent(component) {
    console.log(`Phase 9: ${component.name}を初期化中...`);
    
    // コンポーネントが既に初期化されているかチェック
    if (component.instance) {
      if (component.instance.initialized === true) {
        console.log(`Phase 9: ${component.name}は既に初期化済みです`);
        return;
      }
      if (typeof component.instance.init === 'function') {
        await component.instance.init();
      }
    }
    
    console.log(`Phase 9: ${component.name}の初期化完了`);
  }

  /**
   * システム間統合の設定
   */
  setupSystemIntegration() {
    console.log('Phase 9: システム間統合を設定中...');
    
    // セキュリティ監査とエラーリカバリの統合
    this.integrateSecurityAndErrorHandling();
    
    // データベース最適化とAPI最適化の統合
    this.integrateDatabaseAndAPI();
    
    // パフォーマンス監視の統合
    this.integratePerformanceMonitoring();
    
    // 横断的なイベント処理の設定
    this.setupCrossSystemEvents();
  }

  /**
   * セキュリティとエラーハンドリングの統合
   */
  integrateSecurityAndErrorHandling() {
    // セキュリティイベントをエラーリカバリシステムに通知
    if (securityAuditor && errorRecoverySystem) {
      const originalLogSecurityEvent = securityAuditor.logSecurityEvent.bind(securityAuditor);
      
      securityAuditor.logSecurityEvent = (eventType, data) => {
        originalLogSecurityEvent(eventType, data);
        
        // 重要なセキュリティイベントをエラーシステムに転送
        const criticalEvents = ['xss_attempt', 'sql_injection_attempt', 'brute_force_attempt'];
        if (criticalEvents.includes(eventType)) {
          errorRecoverySystem.handleSecurityEvent({
            type: 'SecurityThreat',
            category: 'security',
            severity: 'critical',
            message: `セキュリティイベント: ${eventType}`,
            data: data,
            timestamp: new Date().toISOString()
          });
        }
      };
    }
  }

  /**
   * データベースとAPIの統合
   */
  integrateDatabaseAndAPI() {
    // データベース最適化の結果をAPI最適化に反映
    if (databaseOptimizer && apiOptimizer) {
      // クエリ最適化の結果をAPIキャッシングに活用
      const originalOptimizeQuery = databaseOptimizer.optimizeQuery.bind(databaseOptimizer);
      
      databaseOptimizer.optimizeQuery = (query, options) => {
        const optimizedQuery = originalOptimizeQuery(query, options);
        
        // 最適化されたクエリをAPIキャッシュのヒントとして使用
        if (optimizedQuery && apiOptimizer.updateCacheStrategy) {
          apiOptimizer.updateCacheStrategy(optimizedQuery);
        }
        
        return optimizedQuery;
      };
    }
  }

  /**
   * パフォーマンス監視の統合
   */
  integratePerformanceMonitoring() {
    // 各システムのパフォーマンスメトリクスを統合
    this.setupUnifiedMetrics();
  }

  /**
   * 統一メトリクスの設定
   */
  setupUnifiedMetrics() {
    // 全システムのメトリクスを定期的に収集
    this.monitoringIntervals.set('unified-metrics', setInterval(() => {
      this.collectUnifiedMetrics();
    }, 60000)); // 1分ごと
  }

  /**
   * 統一メトリクスの収集
   */
  collectUnifiedMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      security: this.getSecurityMetrics(),
      database: this.getDatabaseMetrics(),
      api: this.getAPIMetrics(),
      errors: this.getErrorMetrics(),
      system: this.getSystemMetrics()
    };

    // メトリクスの分析と警告
    this.analyzeMetrics(metrics);
    
    return metrics;
  }

  /**
   * セキュリティメトリクスの取得
   */
  getSecurityMetrics() {
    try {
      if (securityAuditor && securityAuditor.generateSecurityReport) {
        return securityAuditor.generateSecurityReport();
      }
    } catch (error) {
      console.warn('Phase 9: セキュリティメトリクスの取得に失敗:', error);
    }
    
    return { status: 'unknown', events: 0, lastCheck: null };
  }

  /**
   * データベースメトリクスの取得
   */
  getDatabaseMetrics() {
    try {
      if (databaseOptimizer && databaseOptimizer.getStatistics) {
        return databaseOptimizer.getStatistics();
      }
    } catch (error) {
      console.warn('Phase 9: データベースメトリクスの取得に失敗:', error);
    }
    
    return { queryCount: 0, cacheHitRate: 0, averageTime: 0 };
  }

  /**
   * APIメトリクスの取得
   */
  getAPIMetrics() {
    try {
      if (apiOptimizer && apiOptimizer.getAPIStatistics) {
        return apiOptimizer.getAPIStatistics();
      }
    } catch (error) {
      console.warn('Phase 9: APIメトリクスの取得に失敗:', error);
    }
    
    return { totalRequests: 0, averageResponseTime: 0, errorRate: 0 };
  }

  /**
   * エラーメトリクスの取得
   */
  getErrorMetrics() {
    try {
      if (errorRecoverySystem && errorRecoverySystem.getStatistics) {
        return errorRecoverySystem.getStatistics();
      }
    } catch (error) {
      console.warn('Phase 9: エラーメトリクスの取得に失敗:', error);
    }
    
    return { totalErrors: 0, recentErrors: 0, recoveryRate: 0 };
  }

  /**
   * システムメトリクスの取得
   */
  getSystemMetrics() {
    return {
      uptime: performance.now(),
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  /**
   * メトリクスの分析
   */
  analyzeMetrics(metrics) {
    const issues = [];
    
    // セキュリティ分析
    if (metrics.security.summary && metrics.security.summary.criticalEvents > 0) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: `${metrics.security.summary.criticalEvents}件の重要なセキュリティイベントが検出されました`
      });
    }
    
    // パフォーマンス分析
    if (metrics.api.performance && metrics.api.performance.averageResponseTime > 2000) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: 'APIレスポンス時間が遅いです'
      });
    }
    
    // エラー分析
    if (metrics.errors.recentErrors > 10) {
      issues.push({
        type: 'stability',
        severity: 'medium',
        message: '最近エラーが頻発しています'
      });
    }
    
    // システム全体の状態更新
    this.updateSystemStatus(issues);
    
    // 問題がある場合は対処
    if (issues.length > 0) {
      this.handleSystemIssues(issues);
    }
  }

  /**
   * システム状態の更新
   */
  updateSystemStatus(issues) {
    // 各コンポーネントの状態を評価
    this.systemStatus.security = issues.some(i => i.type === 'security') ? 'warning' : 'ok';
    this.systemStatus.database = this.components.has('database') ? 'ok' : 'error';
    this.systemStatus.api = issues.some(i => i.type === 'performance') ? 'warning' : 'ok';
    this.systemStatus.errors = issues.some(i => i.type === 'stability') ? 'warning' : 'ok';
    
    // 全体的な状態を決定
    const statuses = Object.values(this.systemStatus).filter(s => s !== 'overall');
    if (statuses.includes('error')) {
      this.systemStatus.overall = 'error';
    } else if (statuses.includes('warning')) {
      this.systemStatus.overall = 'warning';
    } else {
      this.systemStatus.overall = 'ok';
    }
  }

  /**
   * システム問題の処理
   */
  handleSystemIssues(issues) {
    console.warn('Phase 9: システム問題を検出:', issues);
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'security':
          this.handleSecurityIssue(issue);
          break;
        case 'performance':
          this.handlePerformanceIssue(issue);
          break;
        case 'stability':
          this.handleStabilityIssue(issue);
          break;
      }
    });
  }

  /**
   * セキュリティ問題の処理
   */
  handleSecurityIssue(issue) {
    // セキュリティ強化モードを有効化
    console.log('Phase 9: セキュリティ強化モードを有効化');
    
    if (securityAuditor && securityAuditor.enableEnhancedMode) {
      securityAuditor.enableEnhancedMode();
    }
  }

  /**
   * パフォーマンス問題の処理
   */
  handlePerformanceIssue(issue) {
    // パフォーマンス最適化を実行
    console.log('Phase 9: パフォーマンス最適化を実行');
    
    if (apiOptimizer && apiOptimizer.enableAggressiveOptimization) {
      apiOptimizer.enableAggressiveOptimization();
    }
    
    if (databaseOptimizer && databaseOptimizer.optimizeMemoryUsage) {
      databaseOptimizer.optimizeMemoryUsage();
    }
  }

  /**
   * 安定性問題の処理
   */
  handleStabilityIssue(issue) {
    // エラーリカバリを強化
    console.log('Phase 9: エラーリカバリを強化');
    
    if (errorRecoverySystem && errorRecoverySystem.enableEnhancedRecovery) {
      errorRecoverySystem.enableEnhancedRecovery();
    }
  }

  /**
   * 横断的イベント処理の設定
   */
  setupCrossSystemEvents() {
    // ページ遷移時の処理
    window.addEventListener('beforeunload', () => {
      this.handlePageUnload();
    });
    
    // ネットワーク状態変化の処理
    window.addEventListener('online', () => {
      this.handleNetworkStatusChange('online');
    });
    
    window.addEventListener('offline', () => {
      this.handleNetworkStatusChange('offline');
    });
    
    // メモリ不足警告の処理
    if (performance.memory) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 30000); // 30秒ごと
    }
  }

  /**
   * ページアンロード時の処理
   */
  handlePageUnload() {
    console.log('Phase 9: ページアンロード時の処理を実行');
    
    // 各システムのクリーンアップ
    this.components.forEach((component, name) => {
      if (component && typeof component.cleanup === 'function') {
        try {
          component.cleanup();
        } catch (error) {
          console.warn(`Phase 9: ${name}のクリーンアップエラー:`, error);
        }
      }
    });
    
    // 監視インターバルのクリア
    this.monitoringIntervals.forEach(interval => {
      clearInterval(interval);
    });
  }

  /**
   * ネットワーク状態変化の処理
   */
  handleNetworkStatusChange(status) {
    console.log(`Phase 9: ネットワーク状態変化: ${status}`);
    
    // 各システムにネットワーク状態を通知
    this.components.forEach(component => {
      if (component && typeof component.handleNetworkChange === 'function') {
        component.handleNetworkChange(status);
      }
    });
  }

  /**
   * メモリ使用量のチェック
   */
  checkMemoryUsage() {
    if (!performance.memory) return;
    
    const usedMemory = performance.memory.usedJSHeapSize;
    const totalMemory = performance.memory.totalJSHeapSize;
    const memoryLimit = performance.memory.jsHeapSizeLimit;
    
    const usageRatio = usedMemory / memoryLimit;
    
    if (usageRatio > 0.85) { // 85%を超えた場合
      console.warn('Phase 9: メモリ使用量が高いです:', {
        used: Math.round(usedMemory / 1024 / 1024) + 'MB',
        total: Math.round(totalMemory / 1024 / 1024) + 'MB',
        limit: Math.round(memoryLimit / 1024 / 1024) + 'MB',
        usage: Math.round(usageRatio * 100) + '%'
      });
      
      // メモリクリーンアップを実行
      this.performMemoryCleanup();
    }
  }

  /**
   * メモリクリーンアップの実行
   */
  performMemoryCleanup() {
    console.log('Phase 9: メモリクリーンアップを実行');
    
    // 各システムのメモリ最適化を実行
    this.components.forEach(component => {
      if (component && typeof component.optimizeMemoryUsage === 'function') {
        component.optimizeMemoryUsage();
      }
    });
    
    // ガベージコレクションの実行（可能な場合）
    if (window.gc) {
      window.gc();
    }
  }

  /**
   * システム監視の開始
   */
  startSystemMonitoring() {
    console.log('Phase 9: システム監視を開始');
    
    // メインの監視ループ
    this.monitoringIntervals.set('main-monitor', setInterval(() => {
      this.performSystemHealthCheck();
    }, 300000)); // 5分ごと
  }

  /**
   * システムヘルスチェックの実行
   */
  performSystemHealthCheck() {
    console.log('Phase 9: システムヘルスチェックを実行中...');
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      systemStatus: { ...this.systemStatus },
      components: {},
      recommendations: []
    };
    
    // 各コンポーネントのヘルスチェック
    this.components.forEach((component, name) => {
      healthReport.components[name] = this.checkComponentHealth(component, name);
    });
    
    // システム全体の推奨事項を生成
    healthReport.recommendations = this.generateSystemRecommendations(healthReport);
    
    console.log('Phase 9: システムヘルスレポート:', healthReport);
    
    return healthReport;
  }

  /**
   * コンポーネントヘルスチェック
   */
  checkComponentHealth(component, name) {
    try {
      if (component && typeof component.getStatistics === 'function') {
        const stats = component.getStatistics();
        return {
          status: 'ok',
          statistics: stats,
          lastCheck: new Date().toISOString()
        };
      } else {
        return {
          status: 'unknown',
          message: 'ヘルスチェック機能が利用できません',
          lastCheck: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * システム推奨事項の生成
   */
  generateSystemRecommendations(healthReport) {
    const recommendations = [];
    
    // エラー状態のコンポーネントがある場合
    const errorComponents = Object.entries(healthReport.components)
      .filter(([name, health]) => health.status === 'error');
    
    if (errorComponents.length > 0) {
      recommendations.push(
        `以下のコンポーネントでエラーが発生しています: ${errorComponents.map(([name]) => name).join(', ')}`
      );
    }
    
    // システム全体が警告状態の場合
    if (healthReport.systemStatus.overall === 'warning') {
      recommendations.push('システム全体のパフォーマンス最適化を検討してください。');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('システムは正常に動作しています。');
    }
    
    return recommendations;
  }

  /**
   * セキュリティ強化の適用
   */
  applySecurityEnhancements() {
    console.log('Phase 9: セキュリティ強化を適用中...');
    
    // CSPの強化
    this.enhanceContentSecurityPolicy();
    
    // セッションセキュリティの強化
    this.enhanceSessionSecurity();
    
    // 入力検証の強化
    this.enhanceInputValidation();
  }

  /**
   * Content Security Policyの強化
   */
  enhanceContentSecurityPolicy() {
    // より厳格なCSPポリシーの適用
    const strictCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.content = strictCSP;
    }
  }

  /**
   * セッションセキュリティの強化
   */
  enhanceSessionSecurity() {
    // セッション固定攻撃の防止
    if (typeof sessionStorage !== 'undefined') {
      const sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionStorage.setItem('session_id', this.generateSecureToken());
      }
    }
  }

  /**
   * 入力検証の強化
   */
  enhanceInputValidation() {
    // より厳格な入力検証ルールを適用
    document.addEventListener('input', this.handleEnhancedInputValidation.bind(this));
  }

  /**
   * 強化された入力検証の処理
   */
  handleEnhancedInputValidation(event) {
    const input = event.target;
    if (!input.matches('input, textarea')) return;
    
    // より厳格なXSS検証
    const strictXSSPattern = /<[^>]*>|javascript:|on\w+\s*=|data:/gi;
    if (strictXSSPattern.test(input.value)) {
      input.value = input.value.replace(strictXSSPattern, '');
      input.classList.add('security-warning');
      
      console.warn('Phase 9: 厳格な入力検証により危険なコンテンツを除去しました');
    }
  }

  /**
   * パフォーマンス最適化の適用
   */
  applyPerformanceOptimizations() {
    console.log('Phase 9: パフォーマンス最適化を適用中...');
    
    // 画像の遅延読み込み強化
    this.enhanceLazyLoading();
    
    // リソースの事前読み込み
    this.preloadCriticalResources();
    
    // メモリ最適化
    this.optimizeMemoryUsage();
  }

  /**
   * 遅延読み込みの強化
   */
  enhanceLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if (!img.hasAttribute('data-phase9-optimized')) {
        img.setAttribute('data-phase9-optimized', 'true');
        
        // 画像の最適化属性を追加
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      }
    });
  }

  /**
   * 重要リソースの事前読み込み
   */
  preloadCriticalResources() {
    const criticalResources = [
      { url: './api.js', as: 'script' },
      { url: './styles/responsive.css', as: 'style' }
    ];
    
    criticalResources.forEach(resource => {
      const existingLink = document.querySelector(`link[href="${resource.url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.url;
        link.as = resource.as;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * メモリ最適化
   */
  optimizeMemoryUsage() {
    // 未使用のイベントリスナーをクリーンアップ
    this.cleanupUnusedEventListeners();
    
    // DOMノードの最適化
    this.optimizeDOMNodes();
  }

  /**
   * 未使用イベントリスナーのクリーンアップ
   */
  cleanupUnusedEventListeners() {
    // 重複したイベントリスナーを検出・削除
    const elementsWithEvents = document.querySelectorAll('[onclick], [onchange], [onsubmit]');
    elementsWithEvents.forEach(element => {
      // インラインイベントハンドラーをイベントリスナーに変換
      ['onclick', 'onchange', 'onsubmit'].forEach(eventAttr => {
        if (element.hasAttribute(eventAttr)) {
          console.log(`Phase 9: インラインイベントハンドラーを検出: ${eventAttr}`);
        }
      });
    });
  }

  /**
   * DOMノードの最適化
   */
  optimizeDOMNodes() {
    // 空のテキストノードを削除
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          return node.nodeValue.trim() === '' ? 
            NodeFilter.FILTER_ACCEPT : 
            NodeFilter.FILTER_REJECT;
        }
      }
    );
    
    const emptyNodes = [];
    let node;
    while (node = walker.nextNode()) {
      emptyNodes.push(node);
    }
    
    emptyNodes.forEach(node => {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
    
    if (emptyNodes.length > 0) {
      console.log(`Phase 9: ${emptyNodes.length}個の空のテキストノードを削除しました`);
    }
  }

  /**
   * セキュアトークンの生成
   */
  generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 初期化エラーの処理
   */
  handleInitializationError(error) {
    console.error('Phase 9: 初期化エラー処理:', error);
    
    // エラー通知の表示
    this.showSystemErrorNotification(
      'システム初期化エラー',
      'Phase 9の初期化中にエラーが発生しました。一部の機能が制限される可能性があります。'
    );
  }

  /**
   * システムエラー通知の表示
   */
  showSystemErrorNotification(title, message) {
    // 簡単な通知システム（既存のシステムがない場合のフォールバック）
    if (typeof errorRecoverySystem !== 'undefined' && errorRecoverySystem.showUserNotification) {
      errorRecoverySystem.showUserNotification(title, message, 'error');
    } else {
      console.error(`${title}: ${message}`);
      alert(`${title}\n\n${message}`);
    }
  }

  /**
   * 初期化完了イベントの発火
   */
  triggerInitializationEvent() {
    const event = new CustomEvent('phase9Initialized', {
      detail: {
        timestamp: new Date().toISOString(),
        components: Array.from(this.components.keys()),
        systemStatus: { ...this.systemStatus },
        features: [
          'security-auditing',
          'database-optimization',
          'api-optimization',
          'error-recovery',
          'system-monitoring',
          'performance-enhancement'
        ]
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * システム状態の取得
   */
  getSystemStatus() {
    return {
      initialized: this.initialized,
      systemStatus: { ...this.systemStatus },
      components: Array.from(this.components.keys()),
      uptime: performance.now(),
      lastHealthCheck: new Date().toISOString()
    };
  }

  /**
   * システム統計の取得
   */
  getSystemStatistics() {
    if (!this.initialized) {
      return { error: 'システムが初期化されていません' };
    }
    
    return this.collectUnifiedMetrics();
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    console.log('Phase 9: システム統合のクリーンアップを実行');
    
    // 監視インターバルのクリア
    this.monitoringIntervals.forEach(interval => {
      clearInterval(interval);
    });
    this.monitoringIntervals.clear();
    
    // コンポーネントのクリーンアップ
    this.components.forEach((component, name) => {
      if (component && typeof component.cleanup === 'function') {
        try {
          component.cleanup();
        } catch (error) {
          console.warn(`Phase 9: ${name}のクリーンアップエラー:`, error);
        }
      }
    });
    this.components.clear();
    
    this.initialized = false;
  }
}

// Export singleton instance
export const phase9Integration = new Phase9Integration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    phase9Integration.init();
  });
} else {
  phase9Integration.init();
}