/**
 * API Response Optimizer - Phase 9
 * APIレスポンス最適化システム
 */

export class APIOptimizer {
  constructor() {
    this.requestCache = new Map();
    this.responseCompression = new Map();
    this.requestQueue = [];
    this.batchRequestTimer = null;
    this.rateLimiters = new Map();
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      errorRate: 0,
      compressionRatio: 0
    };
    
    this.config = {
      cacheTimeout: 300000, // 5分
      batchDelay: 100, // 100ms
      maxBatchSize: 10,
      compressionThreshold: 1024, // 1KB
      rateLimit: {
        default: { requests: 100, window: 60000 }, // 100 requests per minute
        auth: { requests: 10, window: 60000 }, // 10 auth requests per minute
        upload: { requests: 5, window: 60000 } // 5 upload requests per minute
      }
    };
    
    this.init();
  }

  /**
   * API最適化システムの初期化
   */
  init() {
    this.setupRequestInterception();
    this.setupResponseCompression();
    this.setupBatchProcessing();
    this.setupRateLimiting();
    this.setupPerformanceMonitoring();
    
    console.log('API Optimizer: システムが初期化されました');
  }

  /**
   * リクエスト傍受の設定
   */
  setupRequestInterception() {
    // Fetch APIの拡張
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      const startTime = performance.now();
      
      try {
        // リクエストの前処理
        const optimizedRequest = await this.preprocessRequest(url, options);
        
        // キャッシュチェック
        const cacheKey = this.generateCacheKey(optimizedRequest.url, optimizedRequest.options);
        const cachedResponse = this.getCachedResponse(cacheKey);
        
        if (cachedResponse) {
          this.performanceMetrics.cacheHits++;
          return cachedResponse;
        }
        
        // レート制限チェック
        if (!this.checkRateLimit(url)) {
          throw new Error('レート制限に達しました');
        }
        
        // 実際のリクエスト実行
        const response = await originalFetch(optimizedRequest.url, optimizedRequest.options);
        
        // レスポンスの後処理
        const optimizedResponse = await this.postprocessResponse(response, cacheKey);
        
        // パフォーマンスメトリクス更新
        this.updatePerformanceMetrics(startTime, response.ok);
        
        return optimizedResponse;
        
      } catch (error) {
        this.updatePerformanceMetrics(startTime, false);
        throw error;
      }
    };
  }

  /**
   * リクエストの前処理
   */
  async preprocessRequest(url, options) {
    const optimized = {
      url: url,
      options: { ...options }
    };
    
    // ヘッダーの最適化
    optimized.options.headers = this.optimizeHeaders(options.headers || {});
    
    // リクエストボディの圧縮
    if (optimized.options.body && typeof optimized.options.body === 'string') {
      const compressed = await this.compressRequestBody(optimized.options.body);
      if (compressed.length < optimized.options.body.length * 0.8) {
        optimized.options.body = compressed;
        optimized.options.headers['Content-Encoding'] = 'gzip';
      }
    }
    
    // バッチリクエストの候補として追加
    if (this.shouldBatchRequest(url, options)) {
      return this.addToBatch(optimized);
    }
    
    return optimized;
  }

  /**
   * ヘッダーの最適化
   */
  optimizeHeaders(headers) {
    const optimized = { ...headers };
    
    // デフォルトヘッダーの追加
    if (!optimized['Content-Type'] && !optimized['content-type']) {
      optimized['Content-Type'] = 'application/json';
    }
    
    // Accept-Encodingの追加（圧縮サポート）
    if (!optimized['Accept-Encoding']) {
      optimized['Accept-Encoding'] = 'gzip, deflate, br';
    }
    
    // Cacheコントロールの最適化
    if (!optimized['Cache-Control']) {
      optimized['Cache-Control'] = 'max-age=300'; // 5分
    }
    
    // API バージョニング
    if (!optimized['API-Version']) {
      optimized['API-Version'] = 'v1';
    }
    
    return optimized;
  }

  /**
   * リクエストボディの圧縮
   */
  async compressRequestBody(body) {
    if (body.length < this.config.compressionThreshold) {
      return body;
    }
    
    try {
      // ブラウザの圧縮API使用（利用可能な場合）
      if ('CompressionStream' in window) {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(new TextEncoder().encode(body));
        writer.close();
        
        const chunks = [];
        let result;
        
        while (!(result = await reader.read()).done) {
          chunks.push(result.value);
        }
        
        return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      }
      
      // フォールバック: 簡易圧縮
      return this.simpleCompress(body);
      
    } catch (error) {
      console.warn('API Optimizer: 圧縮エラー:', error);
      return body;
    }
  }

  /**
   * 簡易圧縮（フォールバック）
   */
  simpleCompress(text) {
    // 重複する文字列を短縮
    const patterns = [
      [/\s+/g, ' '], // 複数の空白を一つに
      [/,(\s*)/g, ','], // カンマ後の不要な空白を削除
      [/:(\s*)/g, ':'], // コロン後の不要な空白を削除
      [/\n\s*/g, ''] // 改行とインデントを削除
    ];
    
    return patterns.reduce((result, [pattern, replacement]) => {
      return result.replace(pattern, replacement);
    }, text);
  }

  /**
   * レスポンスの後処理
   */
  async postprocessResponse(response, cacheKey) {
    // レスポンスのクローンを作成（元のレスポンスを保持）
    const clonedResponse = response.clone();
    
    // キャッシュ可能なレスポンスの場合、キャッシュに保存
    if (this.shouldCacheResponse(response)) {
      const responseData = await clonedResponse.json();
      this.setCachedResponse(cacheKey, {
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        statusText: response.statusText
      });
    }
    
    // レスポンスの圧縮統計を更新
    this.updateCompressionStats(response);
    
    return response;
  }

  /**
   * レスポンス圧縮統計の更新
   */
  updateCompressionStats(response) {
    const contentLength = response.headers.get('content-length');
    const contentEncoding = response.headers.get('content-encoding');
    
    if (contentLength && contentEncoding) {
      const originalSize = parseInt(contentLength);
      const isCompressed = ['gzip', 'deflate', 'br'].includes(contentEncoding);
      
      if (isCompressed) {
        // 圧縮率の概算（実際の測定は困難なため）
        const estimatedCompressionRatio = 0.7; // 70%に圧縮されると仮定
        const compressedSize = originalSize * estimatedCompressionRatio;
        const savings = originalSize - compressedSize;
        
        this.performanceMetrics.compressionRatio = 
          ((this.performanceMetrics.compressionRatio * this.performanceMetrics.totalRequests) + 
           (savings / originalSize)) / (this.performanceMetrics.totalRequests + 1);
      }
    }
  }

  /**
   * バッチリクエストの判定
   */
  shouldBatchRequest(url, options) {
    // GET リクエストで、同じエンドポイントへの複数リクエストをバッチ化
    return options.method === 'GET' || !options.method;
  }

  /**
   * バッチへの追加
   */
  addToBatch(request) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        request,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      // バッチ処理のスケジュール
      if (!this.batchRequestTimer) {
        this.batchRequestTimer = setTimeout(() => {
          this.processBatchRequests();
        }, this.config.batchDelay);
      }
    });
  }

  /**
   * バッチリクエストの処理
   */
  async processBatchRequests() {
    if (this.requestQueue.length === 0) {
      this.batchRequestTimer = null;
      return;
    }
    
    const batch = this.requestQueue.splice(0, this.config.maxBatchSize);
    this.batchRequestTimer = null;
    
    try {
      // 類似のリクエストをグループ化
      const grouped = this.groupSimilarRequests(batch);
      
      // 各グループを並行処理
      const promises = Object.values(grouped).map(group => 
        this.processBatchGroup(group)
      );
      
      await Promise.all(promises);
      
    } catch (error) {
      console.error('API Optimizer: バッチ処理エラー:', error);
      
      // エラーの場合、個別にリクエストを処理
      batch.forEach(item => {
        item.reject(error);
      });
    }
    
    // 残りのリクエストがある場合は再スケジュール
    if (this.requestQueue.length > 0) {
      this.batchRequestTimer = setTimeout(() => {
        this.processBatchRequests();
      }, this.config.batchDelay);
    }
  }

  /**
   * 類似リクエストのグループ化
   */
  groupSimilarRequests(batch) {
    const groups = {};
    
    batch.forEach(item => {
      const baseUrl = new URL(item.request.url).pathname;
      const groupKey = `${item.request.options.method || 'GET'}-${baseUrl}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
    });
    
    return groups;
  }

  /**
   * バッチグループの処理
   */
  async processBatchGroup(group) {
    // 実際のバッチAPI実装に依存
    // 現在は個別リクエストとして処理
    
    const promises = group.map(async (item) => {
      try {
        const originalFetch = window.fetch.__original || window.fetch;
        const response = await originalFetch(item.request.url, item.request.options);
        item.resolve(response);
      } catch (error) {
        item.reject(error);
      }
    });
    
    await Promise.all(promises);
  }

  /**
   * レスポンス圧縮の設定
   */
  setupResponseCompression() {
    // ブラウザの自動圧縮機能を活用
    // 設定は主にリクエストヘッダーで行う
  }

  /**
   * バッチ処理の設定
   */
  setupBatchProcessing() {
    // バッチ処理は setupRequestInterception で実装済み
  }

  /**
   * レート制限の設定
   */
  setupRateLimiting() {
    // 定期的なレート制限リセット
    setInterval(() => {
      this.resetRateLimiters();
    }, 60000); // 1分ごと
  }

  /**
   * レート制限のチェック
   */
  checkRateLimit(url) {
    const limiterKey = this.getRateLimiterKey(url);
    const config = this.getRateLimitConfig(url);
    
    if (!this.rateLimiters.has(limiterKey)) {
      this.rateLimiters.set(limiterKey, {
        count: 0,
        windowStart: Date.now()
      });
    }
    
    const limiter = this.rateLimiters.get(limiterKey);
    const now = Date.now();
    
    // ウィンドウのリセット
    if (now - limiter.windowStart > config.window) {
      limiter.count = 0;
      limiter.windowStart = now;
    }
    
    // レート制限チェック
    if (limiter.count >= config.requests) {
      return false;
    }
    
    limiter.count++;
    return true;
  }

  /**
   * レート制限キーの取得
   */
  getRateLimiterKey(url) {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // エンドポイントの種類に基づいてキーを生成
    if (path.includes('/auth/')) return 'auth';
    if (path.includes('/upload/')) return 'upload';
    
    return 'default';
  }

  /**
   * レート制限設定の取得
   */
  getRateLimitConfig(url) {
    const key = this.getRateLimiterKey(url);
    return this.config.rateLimit[key] || this.config.rateLimit.default;
  }

  /**
   * レート制限のリセット
   */
  resetRateLimiters() {
    const now = Date.now();
    
    for (const [key, limiter] of this.rateLimiters.entries()) {
      const config = this.config.rateLimit[key] || this.config.rateLimit.default;
      
      if (now - limiter.windowStart > config.window) {
        limiter.count = 0;
        limiter.windowStart = now;
      }
    }
  }

  /**
   * パフォーマンス監視の設定
   */
  setupPerformanceMonitoring() {
    // 定期的なパフォーマンスレポート生成
    setInterval(() => {
      this.generatePerformanceReport();
    }, 300000); // 5分ごと
  }

  /**
   * キャッシュキーの生成
   */
  generateCacheKey(url, options) {
    const method = options.method || 'GET';
    const body = options.body || '';
    const queryParams = new URL(url).search;
    
    // ハッシュ化してキーを生成
    const keyData = `${method}-${url}-${queryParams}-${body}`;
    return btoa(keyData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * キャッシュされたレスポンスの取得
   */
  getCachedResponse(cacheKey) {
    const cached = this.requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      // キャッシュされたレスポンスを Response オブジェクトとして返す
      return new Response(JSON.stringify(cached.data), {
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers
      });
    }
    
    return null;
  }

  /**
   * レスポンスのキャッシュ保存
   */
  setCachedResponse(cacheKey, responseData) {
    this.requestCache.set(cacheKey, {
      ...responseData,
      timestamp: Date.now()
    });
    
    // キャッシュサイズ制限
    if (this.requestCache.size > 500) {
      const oldestKey = this.requestCache.keys().next().value;
      this.requestCache.delete(oldestKey);
    }
  }

  /**
   * レスポンスキャッシュ判定
   */
  shouldCacheResponse(response) {
    // GET リクエストで、ステータスが 200-299 の場合のみキャッシュ
    return response.status >= 200 && 
           response.status < 300 && 
           (response.url.includes('GET') || !response.url.includes('POST'));
  }

  /**
   * パフォーマンスメトリクスの更新
   */
  updatePerformanceMetrics(startTime, success) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    this.performanceMetrics.totalRequests++;
    
    // 平均レスポンス時間の更新
    const totalTime = this.performanceMetrics.averageResponseTime * 
                     (this.performanceMetrics.totalRequests - 1) + responseTime;
    this.performanceMetrics.averageResponseTime = totalTime / this.performanceMetrics.totalRequests;
    
    // エラー率の更新
    if (!success) {
      const totalErrors = this.performanceMetrics.errorRate * 
                         (this.performanceMetrics.totalRequests - 1) + 1;
      this.performanceMetrics.errorRate = totalErrors / this.performanceMetrics.totalRequests;
    }
  }

  /**
   * パフォーマンスレポートの生成
   */
  generatePerformanceReport() {
    const cacheHitRate = this.performanceMetrics.totalRequests > 0 ? 
      (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests) * 100 : 0;
    
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        ...this.performanceMetrics,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        errorRate: Math.round(this.performanceMetrics.errorRate * 100 * 100) / 100,
        compressionRatio: Math.round(this.performanceMetrics.compressionRatio * 100 * 100) / 100
      },
      cache: {
        size: this.requestCache.size,
        efficiency: cacheHitRate
      },
      rateLimiting: {
        activeKeys: this.rateLimiters.size,
        limits: this.config.rateLimit
      },
      recommendations: this.generateOptimizationRecommendations()
    };
    
    console.log('API Optimizer: パフォーマンスレポート', report);
    return report;
  }

  /**
   * 最適化推奨事項の生成
   */
  generateOptimizationRecommendations() {
    const recommendations = [];
    
    // レスポンス時間に基づく推奨
    if (this.performanceMetrics.averageResponseTime > 1000) {
      recommendations.push('平均レスポンス時間が長いです。キャッシュ戦略の見直しやバッチ処理の活用を検討してください。');
    }
    
    // キャッシュヒット率に基づく推奨
    const cacheHitRate = (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests) * 100;
    if (cacheHitRate < 30) {
      recommendations.push('キャッシュヒット率が低いです。キャッシュ可能なリクエストを増やすことを検討してください。');
    }
    
    // エラー率に基づく推奨
    if (this.performanceMetrics.errorRate > 0.05) { // 5%以上
      recommendations.push('エラー率が高いです。API の安定性向上とエラーハンドリングの改善を検討してください。');
    }
    
    // 圧縮率に基づく推奨
    if (this.performanceMetrics.compressionRatio < 0.2) { // 20%未満の圧縮
      recommendations.push('データ圧縮の効果が低いです。レスポンスデータの最適化を検討してください。');
    }
    
    return recommendations;
  }

  /**
   * API使用統計の取得
   */
  getAPIStatistics() {
    return {
      requests: {
        total: this.performanceMetrics.totalRequests,
        cacheHits: this.performanceMetrics.cacheHits,
        cacheHitRate: (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests) * 100
      },
      performance: {
        averageResponseTime: this.performanceMetrics.averageResponseTime,
        errorRate: this.performanceMetrics.errorRate * 100,
        compressionRatio: this.performanceMetrics.compressionRatio * 100
      },
      cache: {
        size: this.requestCache.size,
        maxSize: 500
      },
      rateLimiting: {
        activeLimiters: this.rateLimiters.size,
        configs: this.config.rateLimit
      }
    };
  }

  /**
   * 設定の更新
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('API Optimizer: 設定を更新しました', this.config);
  }

  /**
   * キャッシュのクリア
   */
  clearCache() {
    this.requestCache.clear();
    console.log('API Optimizer: キャッシュをクリアしました');
  }

  /**
   * メトリクスのリセット
   */
  resetMetrics() {
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      errorRate: 0,
      compressionRatio: 0
    };
    console.log('API Optimizer: メトリクスをリセットしました');
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup() {
    // タイマーのクリア
    if (this.batchRequestTimer) {
      clearTimeout(this.batchRequestTimer);
    }
    
    // キャッシュとデータのクリア
    this.requestCache.clear();
    this.responseCompression.clear();
    this.requestQueue = [];
    this.rateLimiters.clear();
    
    console.log('API Optimizer: リソースをクリーンアップしました');
  }
}

// Export singleton instance
export const apiOptimizer = new APIOptimizer();