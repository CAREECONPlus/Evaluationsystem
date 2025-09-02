/**
 * パフォーマンス監視ツール
 * アプリケーションのパフォーマンス指標を収集・分析
 */

import { getLogger } from './logger.js';

class PerformanceMonitor {
  constructor() {
    this.logger = getLogger('PerformanceMonitor');
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      userActions: [],
      errors: [],
      memoryUsage: [],
      renderTimes: []
    };
    this.observers = [];
    this.isMonitoring = false;
    this.startTime = performance.now();
    
    // パフォーマンスオブザーバーをサポートしているかチェック
    this.hasPerformanceObserver = typeof PerformanceObserver !== 'undefined';
    
    this.logger.info('Performance Monitor initialized');
  }

  /**
   * 監視開始
   */
  start() {
    if (this.isMonitoring) {
      this.logger.warn('Performance monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    this.logger.info('Starting performance monitoring...');

    // Navigation Timing API
    this.trackNavigationTiming();
    
    // Resource Timing
    this.trackResourceTiming();
    
    // Memory usage tracking
    this.startMemoryTracking();
    
    // User interaction tracking
    this.trackUserInteractions();
    
    // Long Task API (if available)
    this.trackLongTasks();
    
    // Paint timing
    this.trackPaintTiming();

    this.logger.info('Performance monitoring started');
  }

  /**
   * 監視停止
   */
  stop() {
    this.isMonitoring = false;
    
    // すべてのオブザーバーを停止
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        this.logger.warn('Failed to disconnect observer:', error);
      }
    });
    
    this.observers = [];
    this.logger.info('Performance monitoring stopped');
  }

  /**
   * Navigation Timingの追跡
   */
  trackNavigationTiming() {
    if (!performance.navigation) return;

    const timing = performance.timing;
    const navigation = performance.navigation;

    const metrics = {
      type: navigation.type,
      redirectCount: navigation.redirectCount,
      
      // 主要なタイミング指標
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      
      // Core Web Vitals関連
      firstByte: timing.responseStart - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      
      timestamp: Date.now()
    };

    this.metrics.pageLoads.push(metrics);
    this.logger.perf('Page load metrics recorded', metrics);
  }

  /**
   * Resource Timingの追跡
   */
  trackResourceTiming() {
    if (!this.hasPerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = {
              name: entry.name,
              type: this.getResourceType(entry.name),
              duration: entry.duration,
              size: entry.transferSize || 0,
              cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
              timestamp: Date.now()
            };
            
            // 大きなリソースや遅いリソースを警告
            if (resource.duration > 1000) {
              this.logger.warn(`Slow resource detected: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
            }
            
            if (resource.size > 1024 * 1024) { // 1MB以上
              this.logger.warn(`Large resource detected: ${resource.name} (${(resource.size / 1024 / 1024).toFixed(2)}MB)`);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
      
    } catch (error) {
      this.logger.warn('Failed to setup resource timing observer:', error);
    }
  }

  /**
   * メモリ使用量の追跡
   */
  startMemoryTracking() {
    if (!performance.memory) {
      this.logger.debug('Memory API not available');
      return;
    }

    const trackMemory = () => {
      if (!this.isMonitoring) return;

      const memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };

      this.metrics.memoryUsage.push(memory);

      // メモリ使用量が制限の80%を超えた場合警告
      const usagePercent = (memory.used / memory.limit) * 100;
      if (usagePercent > 80) {
        this.logger.warn(`High memory usage detected: ${usagePercent.toFixed(1)}%`);
      }

      // 5秒ごとに記録
      setTimeout(trackMemory, 5000);
    };

    trackMemory();
  }

  /**
   * ユーザーインタラクションの追跡
   */
  trackUserInteractions() {
    const trackInteraction = (type, target) => {
      const interaction = {
        type,
        target: target?.tagName || 'unknown',
        className: target?.className || '',
        timestamp: Date.now()
      };
      
      this.metrics.userActions.push(interaction);
    };

    // 主要なイベントをリスン
    ['click', 'scroll', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        trackInteraction(eventType, event.target);
      }, { passive: true });
    });
  }

  /**
   * Long Taskの追跡
   */
  trackLongTasks() {
    if (!this.hasPerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.logger.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, {
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
      
    } catch (error) {
      this.logger.debug('Long task API not supported');
    }
  }

  /**
   * Paint Timingの追跡
   */
  trackPaintTiming() {
    if (!this.hasPerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.logger.perf(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
      
    } catch (error) {
      this.logger.debug('Paint timing API not supported');
    }
  }

  /**
   * API呼び出しの追跡
   */
  trackApiCall(url, method = 'GET', duration = 0, status = 200) {
    const apiCall = {
      url,
      method,
      duration,
      status,
      success: status >= 200 && status < 400,
      timestamp: Date.now()
    };

    this.metrics.apiCalls.push(apiCall);

    // 遅いAPI呼び出しを警告
    if (duration > 3000) {
      this.logger.warn(`Slow API call detected: ${method} ${url} (${duration}ms)`);
    }

    // エラーレスポンスを記録
    if (!apiCall.success) {
      this.logger.error(`API error: ${method} ${url} - Status ${status}`);
    }
  }

  /**
   * エラーの追跡
   */
  trackError(error, context = '') {
    const errorRecord = {
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      context,
      timestamp: Date.now()
    };

    this.metrics.errors.push(errorRecord);
    this.logger.error('Tracked error:', errorRecord);
  }

  /**
   * レンダリング時間の追跡
   */
  trackRenderTime(componentName, startTime, endTime) {
    const renderTime = {
      component: componentName,
      duration: endTime - startTime,
      timestamp: Date.now()
    };

    this.metrics.renderTimes.push(renderTime);

    // 遅いレンダリングを警告
    if (renderTime.duration > 100) {
      this.logger.warn(`Slow render detected: ${componentName} (${renderTime.duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Core Web Vitalsの計算
   */
  calculateCoreWebVitals() {
    const vitals = {
      fcp: null, // First Contentful Paint
      lcp: null, // Largest Contentful Paint
      fid: null, // First Input Delay
      cls: null  // Cumulative Layout Shift
    };

    // FCP (First Contentful Paint)
    const fcpEntries = performance.getEntriesByType('paint')
      .filter(entry => entry.name === 'first-contentful-paint');
    if (fcpEntries.length > 0) {
      vitals.fcp = fcpEntries[0].startTime;
    }

    // その他のCore Web Vitalsは実装に応じて追加
    return vitals;
  }

  /**
   * パフォーマンススコアの計算
   */
  calculatePerformanceScore() {
    const scores = {
      pageLoad: 100,
      apiCalls: 100,
      memoryUsage: 100,
      errors: 100,
      overall: 100
    };

    // ページロードスコア
    const avgPageLoadTime = this.getAverageMetric(this.metrics.pageLoads, 'pageLoad');
    if (avgPageLoadTime > 3000) scores.pageLoad -= 30;
    else if (avgPageLoadTime > 2000) scores.pageLoad -= 20;
    else if (avgPageLoadTime > 1000) scores.pageLoad -= 10;

    // API呼び出しスコア
    const avgApiTime = this.getAverageMetric(this.metrics.apiCalls, 'duration');
    if (avgApiTime > 2000) scores.apiCalls -= 30;
    else if (avgApiTime > 1000) scores.apiCalls -= 20;
    else if (avgApiTime > 500) scores.apiCalls -= 10;

    // メモリ使用量スコア
    const avgMemoryUsage = this.getAverageMemoryUsage();
    if (avgMemoryUsage > 80) scores.memoryUsage -= 30;
    else if (avgMemoryUsage > 60) scores.memoryUsage -= 20;
    else if (avgMemoryUsage > 40) scores.memoryUsage -= 10;

    // エラースコア
    const errorRate = this.metrics.errors.length / Math.max(this.metrics.pageLoads.length, 1);
    if (errorRate > 0.1) scores.errors -= 50;
    else if (errorRate > 0.05) scores.errors -= 30;
    else if (errorRate > 0.01) scores.errors -= 10;

    // 総合スコア
    scores.overall = Math.round(
      (scores.pageLoad + scores.apiCalls + scores.memoryUsage + scores.errors) / 4
    );

    return scores;
  }

  /**
   * 詳細レポートの生成
   */
  generateReport() {
    const uptime = performance.now() - this.startTime;
    const scores = this.calculatePerformanceScore();
    const vitals = this.calculateCoreWebVitals();

    const report = {
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      scores,
      vitals,
      
      summary: {
        pageLoads: this.metrics.pageLoads.length,
        apiCalls: this.metrics.apiCalls.length,
        userActions: this.metrics.userActions.length,
        errors: this.metrics.errors.length,
        memorySnapshots: this.metrics.memoryUsage.length
      },

      averages: {
        pageLoadTime: this.getAverageMetric(this.metrics.pageLoads, 'pageLoad'),
        apiResponseTime: this.getAverageMetric(this.metrics.apiCalls, 'duration'),
        memoryUsage: this.getAverageMemoryUsage(),
        renderTime: this.getAverageMetric(this.metrics.renderTimes, 'duration')
      },

      issues: this.identifyIssues()
    };

    return report;
  }

  /**
   * パフォーマンス問題の特定
   */
  identifyIssues() {
    const issues = [];

    // 遅いページロード
    const avgPageLoad = this.getAverageMetric(this.metrics.pageLoads, 'pageLoad');
    if (avgPageLoad > 3000) {
      issues.push({
        type: 'slow_page_load',
        severity: 'high',
        message: `平均ページロード時間が遅いです (${avgPageLoad.toFixed(0)}ms)`
      });
    }

    // 遅いAPI呼び出し
    const slowApiCalls = this.metrics.apiCalls.filter(call => call.duration > 2000);
    if (slowApiCalls.length > 0) {
      issues.push({
        type: 'slow_api_calls',
        severity: 'medium',
        message: `${slowApiCalls.length}個のAPI呼び出しが2秒を超えています`
      });
    }

    // 高いメモリ使用量
    const avgMemoryUsage = this.getAverageMemoryUsage();
    if (avgMemoryUsage > 70) {
      issues.push({
        type: 'high_memory_usage',
        severity: 'high',
        message: `メモリ使用量が高いです (${avgMemoryUsage.toFixed(1)}%)`
      });
    }

    // 多数のエラー
    if (this.metrics.errors.length > 10) {
      issues.push({
        type: 'high_error_rate',
        severity: 'critical',
        message: `${this.metrics.errors.length}個のエラーが発生しています`
      });
    }

    return issues;
  }

  /**
   * レポートをコンソールに出力
   */
  printReport() {
    const report = this.generateReport();
    
    this.logger.group('Performance Report');
    
    // スコア表示
    this.logger.info('Performance Scores:');
    this.logger.table([{
      'Page Load': report.scores.pageLoad,
      'API Calls': report.scores.apiCalls,
      'Memory': report.scores.memoryUsage,
      'Errors': report.scores.errors,
      'Overall': report.scores.overall
    }]);

    // 平均値表示
    this.logger.info('Average Metrics:');
    this.logger.table([{
      'Page Load (ms)': Math.round(report.averages.pageLoadTime || 0),
      'API Response (ms)': Math.round(report.averages.apiResponseTime || 0),
      'Memory Usage (%)': Math.round(report.averages.memoryUsage || 0),
      'Render Time (ms)': Math.round(report.averages.renderTime || 0)
    }]);

    // 問題点表示
    if (report.issues.length > 0) {
      this.logger.warn('Performance Issues Detected:');
      report.issues.forEach(issue => {
        const logLevel = issue.severity === 'critical' ? 'error' : 
                        issue.severity === 'high' ? 'warn' : 'info';
        this.logger[logLevel](`[${issue.type}] ${issue.message}`);
      });
    }

    this.logger.groupEnd();
    
    return report;
  }

  /**
   * ヘルパーメソッド：平均値計算
   */
  getAverageMetric(metrics, property) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + (metric[property] || 0), 0);
    return sum / metrics.length;
  }

  /**
   * ヘルパーメソッド：平均メモリ使用率計算
   */
  getAverageMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return 0;
    
    const avgUsage = this.metrics.memoryUsage.reduce((acc, memory) => {
      return acc + ((memory.used / memory.limit) * 100);
    }, 0) / this.metrics.memoryUsage.length;
    
    return avgUsage;
  }

  /**
   * リソースタイプの判定
   */
  getResourceType(url) {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
    if (url.includes('/api/')) return 'xhr';
    return 'other';
  }

  /**
   * メトリクスのリセット
   */
  reset() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      userActions: [],
      errors: [],
      memoryUsage: [],
      renderTimes: []
    };
    this.startTime = performance.now();
    this.logger.info('Performance metrics reset');
  }
}

// グローバルインスタンス
const performanceMonitor = new PerformanceMonitor();

// 便利な関数をエクスポート
export function startPerformanceMonitoring() {
  performanceMonitor.start();
}

export function stopPerformanceMonitoring() {
  performanceMonitor.stop();
}

export function getPerformanceReport() {
  return performanceMonitor.generateReport();
}

export function printPerformanceReport() {
  return performanceMonitor.printReport();
}

export function trackApiCall(url, method, duration, status) {
  performanceMonitor.trackApiCall(url, method, duration, status);
}

export function trackError(error, context) {
  performanceMonitor.trackError(error, context);
}

export function trackRenderTime(component, startTime, endTime) {
  performanceMonitor.trackRenderTime(component, startTime, endTime);
}

// エクスポート
export { PerformanceMonitor };
export default performanceMonitor;

// グローバルに公開（開発時の便利さのため）
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
  window.getPerformanceReport = getPerformanceReport;
  window.printPerformanceReport = printPerformanceReport;
}