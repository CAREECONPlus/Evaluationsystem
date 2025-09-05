/**
 * Translation Performance Optimizer
 * 翻訳パフォーマンス最適化サービス
 */

export class TranslationPerformanceOptimizer {
  constructor(translationService) {
    this.translationService = translationService;
    this.memoryCache = new Map();
    this.batchQueue = new Map(); // 言語ペア別のバッチキュー
    this.batchTimeout = null;
    this.batchDelay = 500; // 500msでバッチ処理
    this.maxBatchSize = 10;
    this.preloadCache = new Set();
  }

  /**
   * 最適化された翻訳（遅延読み込み対応）
   */
  async translateOptimized(text, sourceLang, targetLang) {
    const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
    
    // メモリキャッシュから確認
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }

    // バッチキューに追加して効率的に処理
    return this.addToBatch(text, sourceLang, targetLang);
  }

  /**
   * バッチ処理への追加
   */
  async addToBatch(text, sourceLang, targetLang) {
    const languagePair = `${sourceLang}-${targetLang}`;
    const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
    
    if (!this.batchQueue.has(languagePair)) {
      this.batchQueue.set(languagePair, []);
    }
    
    const batch = this.batchQueue.get(languagePair);
    
    return new Promise((resolve, reject) => {
      batch.push({
        text,
        sourceLang,
        targetLang,
        cacheKey,
        resolve,
        reject
      });

      // バッチサイズに達したら即座に処理
      if (batch.length >= this.maxBatchSize) {
        this.processBatch(languagePair);
      } else {
        // タイマーをリセットして遅延処理
        this.scheduleBatchProcessing(languagePair);
      }
    });
  }

  /**
   * バッチ処理のスケジューリング
   */
  scheduleBatchProcessing(languagePair) {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.processBatch(languagePair);
    }, this.batchDelay);
  }

  /**
   * バッチ処理の実行
   */
  async processBatch(languagePair) {
    const batch = this.batchQueue.get(languagePair);
    if (!batch || batch.length === 0) return;

    console.log(`Processing batch for ${languagePair}, size: ${batch.length}`);
    
    try {
      // 並行処理でバッチを実行
      const promises = batch.map(async (item) => {
        try {
          const result = await this.translationService.translateText(
            item.text, 
            item.sourceLang, 
            item.targetLang
          );
          
          // メモリキャッシュに保存
          this.memoryCache.set(item.cacheKey, result);
          
          item.resolve(result);
          return { success: true, item };
        } catch (error) {
          console.error(`Translation failed for: ${item.text}`, error);
          item.reject(error);
          return { success: false, item, error };
        }
      });

      await Promise.allSettled(promises);
      
    } catch (error) {
      console.error('Batch processing error:', error);
      // エラー時は個別にrejectを呼び出し
      batch.forEach(item => item.reject(error));
    } finally {
      // バッチをクリア
      this.batchQueue.delete(languagePair);
    }
  }

  /**
   * プリロードキャッシュ（よく使われる翻訳の事前読み込み）
   */
  async preloadCommonTranslations() {
    const commonTexts = [
      '優秀', '良好', '普通', '要改善',
      '技術力', 'コミュニケーション', 'リーダーシップ', '問題解決',
      '評価', '目標', '実績', '改善点', '強み'
    ];

    const languages = ['ja', 'en', 'vi'];
    
    for (const sourceLang of languages) {
      for (const targetLang of languages) {
        if (sourceLang === targetLang) continue;
        
        const preloadPromises = commonTexts.map(async (text) => {
          const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
          
          if (!this.preloadCache.has(cacheKey)) {
            try {
              const result = await this.translationService.translateText(text, sourceLang, targetLang);
              this.memoryCache.set(cacheKey, result);
              this.preloadCache.add(cacheKey);
              console.log(`Preloaded: ${text} (${sourceLang} → ${targetLang})`);
            } catch (error) {
              console.warn(`Failed to preload: ${text} (${sourceLang} → ${targetLang})`, error);
            }
          }
        });

        // 並行処理を制限して負荷を軽減
        await this.processConcurrently(preloadPromises, 3);
        
        // API制限を考慮して少し待機
        await this.sleep(100);
      }
    }
  }

  /**
   * 並行処理数を制限した実行
   */
  async processConcurrently(promises, concurrencyLimit) {
    for (let i = 0; i < promises.length; i += concurrencyLimit) {
      const batch = promises.slice(i, i + concurrencyLimit);
      await Promise.allSettled(batch);
    }
  }

  /**
   * 遅延実行用のスリープ関数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * インテリジェントキャッシュクリーンアップ
   */
  cleanupCache() {
    const maxCacheSize = 1000;
    const maxAge = 30 * 60 * 1000; // 30分
    const now = Date.now();
    
    if (this.memoryCache.size > maxCacheSize) {
      // LRU方式でキャッシュをクリーンアップ
      const entries = Array.from(this.memoryCache.entries());
      const sortedEntries = entries.sort((a, b) => {
        const aTime = a[1].lastAccessed || 0;
        const bTime = b[1].lastAccessed || 0;
        return bTime - aTime;
      });
      
      // 古いエントリを削除
      const keepCount = Math.floor(maxCacheSize * 0.8);
      for (let i = keepCount; i < sortedEntries.length; i++) {
        this.memoryCache.delete(sortedEntries[i][0]);
      }
      
      console.log(`Cache cleanup: ${sortedEntries.length - keepCount} entries removed`);
    }
  }

  /**
   * キャッシュ統計の取得
   */
  getCacheStatistics() {
    return {
      memoryCacheSize: this.memoryCache.size,
      preloadCacheSize: this.preloadCache.size,
      activeBatches: this.batchQueue.size,
      totalQueuedItems: Array.from(this.batchQueue.values()).reduce((sum, batch) => sum + batch.length, 0)
    };
  }

  /**
   * 翻訳の優先度付け（重要度に応じた処理順序）
   */
  async translateWithPriority(text, sourceLang, targetLang, priority = 'normal') {
    const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
    
    // メモリキャッシュから確認
    if (this.memoryCache.has(cacheKey)) {
      const cached = this.memoryCache.get(cacheKey);
      // アクセス時間を更新
      if (typeof cached === 'object') {
        cached.lastAccessed = Date.now();
      }
      return cached;
    }

    // 高優先度の場合は即座に実行
    if (priority === 'high') {
      const result = await this.translationService.translateText(text, sourceLang, targetLang);
      this.memoryCache.set(cacheKey, {
        text: result,
        lastAccessed: Date.now()
      });
      return result;
    }

    // 通常優先度はバッチ処理
    return this.addToBatch(text, sourceLang, targetLang);
  }

  /**
   * 翻訳品質に基づくアダプティブキャッシュ
   */
  async translateWithQualityAdaptation(text, sourceLang, targetLang) {
    const result = await this.translateOptimized(text, sourceLang, targetLang);
    
    // 品質スコアが低い場合は短期キャッシュ
    if (result.qualityScore && result.qualityScore < 0.6) {
      // 短期キャッシュ（1時間）
      setTimeout(() => {
        const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
        this.memoryCache.delete(cacheKey);
      }, 60 * 60 * 1000);
    }
    
    return result;
  }

  /**
   * キャッシュキー生成
   */
  generateCacheKey(text, sourceLang, targetLang) {
    return `${sourceLang}_${targetLang}_${btoa(encodeURIComponent(text)).substring(0, 32)}`;
  }

  /**
   * デバッグ情報の出力
   */
  logPerformanceStats() {
    const stats = this.getCacheStatistics();
    console.log('Translation Performance Stats:', {
      ...stats,
      cacheHitRate: this.calculateCacheHitRate(),
      averageBatchSize: stats.totalQueuedItems / (stats.activeBatches || 1)
    });
  }

  /**
   * キャッシュヒット率の計算
   */
  calculateCacheHitRate() {
    // 実装は使用状況に応じて調整
    return '計算中...';
  }

  /**
   * 自動最適化の設定
   */
  enableAutoOptimization() {
    // 定期的なキャッシュクリーンアップ
    setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // 5分毎

    // 統計情報のログ出力
    setInterval(() => {
      this.logPerformanceStats();
    }, 10 * 60 * 1000); // 10分毎

    console.log('Translation auto-optimization enabled');
  }
}