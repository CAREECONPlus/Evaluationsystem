/**
 * Database Optimizer - Phase 9
 * データベース最適化とインデックス設定
 */

export class DatabaseOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.cacheTimeout = 300000; // 5分
    this.batchOperations = new Map();
    this.batchTimeout = 1000; // 1秒
    this.performanceMetrics = {
      queryCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageQueryTime: 0,
      slowQueries: []
    };
    
    this.indexRecommendations = [];
    this.optimizationRules = this.setupOptimizationRules();
    
    this.init();
  }

  /**
   * データベース最適化システムの初期化
   */
  init() {
    this.setupQueryCaching();
    this.setupBatchOperations();
    this.setupPerformanceMonitoring();
    this.generateIndexRecommendations();
    
    console.log('Database Optimizer: システムが初期化されました');
  }

  /**
   * 最適化ルールの設定
   */
  setupOptimizationRules() {
    return {
      // Firestore クエリ最適化ルール
      firestore: {
        // 複合インデックスが必要な条件
        needsCompositeIndex: (query) => {
          const conditions = query.where?.length || 0;
          const hasOrderBy = !!query.orderBy;
          return conditions > 1 || (conditions >= 1 && hasOrderBy);
        },
        
        // ページネーション最適化
        optimizePagination: (query) => {
          if (query.limit && query.limit > 100) {
            return { ...query, limit: 100 }; // 大きすぎるlimitを制限
          }
          return query;
        },
        
        // 選択フィールドの最適化
        optimizeSelection: (query, neededFields) => {
          if (neededFields && neededFields.length > 0) {
            return { ...query, select: neededFields };
          }
          return query;
        }
      },
      
      // 一般的な最適化ルール
      general: {
        // バッチ操作の推奨サイズ
        batchSize: 500,
        
        // キャッシュ対象クエリの条件
        shouldCache: (query) => {
          const isMutation = ['add', 'update', 'delete'].includes(query.operation);
          const isFrequent = query.frequency >= 5; // 5回以上の実行
          return !isMutation && (isFrequent || query.cacheable);
        },
        
        // 遅延読み込みの推奨
        shouldLazyLoad: (collection, size) => {
          return size > 50; // 50件を超える場合は遅延読み込みを推奨
        }
      }
    };
  }

  /**
   * クエリキャッシングの設定
   */
  setupQueryCaching() {
    // キャッシュクリーンアップのスケジュール
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this.cacheTimeout);
  }

  /**
   * 期限切れキャッシュのクリーンアップ
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, cacheEntry] of this.queryCache.entries()) {
      if (now - cacheEntry.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Database Optimizer: ${cleanedCount}個の期限切れキャッシュエントリを削除しました`);
    }
  }

  /**
   * バッチ操作の設定
   */
  setupBatchOperations() {
    // バッチ処理のスケジュール
    setInterval(() => {
      this.processBatchOperations();
    }, this.batchTimeout);
  }

  /**
   * バッチ操作の処理
   */
  async processBatchOperations() {
    for (const [collectionName, operations] of this.batchOperations.entries()) {
      if (operations.length > 0) {
        await this.executeBatchOperation(collectionName, operations);
        this.batchOperations.set(collectionName, []);
      }
    }
  }

  /**
   * バッチ操作の実行
   */
  async executeBatchOperation(collectionName, operations) {
    try {
      const startTime = performance.now();
      
      // 操作タイプごとにグループ化
      const groupedOps = this.groupOperationsByType(operations);
      
      // 各操作タイプを順番に実行
      for (const [opType, ops] of Object.entries(groupedOps)) {
        await this.executeOperationBatch(collectionName, opType, ops);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`Database Optimizer: ${collectionName}のバッチ操作完了 (${operations.length}件, ${executionTime.toFixed(2)}ms)`);
      
    } catch (error) {
      console.error(`Database Optimizer: バッチ操作エラー (${collectionName}):`, error);
    }
  }

  /**
   * 操作タイプごとのグループ化
   */
  groupOperationsByType(operations) {
    const grouped = {
      create: [],
      update: [],
      delete: []
    };
    
    operations.forEach(op => {
      if (grouped[op.type]) {
        grouped[op.type].push(op);
      }
    });
    
    return grouped;
  }

  /**
   * 操作バッチの実行
   */
  async executeOperationBatch(collectionName, operationType, operations) {
    const batchSize = this.optimizationRules.general.batchSize;
    
    // 大きなバッチを小さなチャンクに分割
    for (let i = 0; i < operations.length; i += batchSize) {
      const chunk = operations.slice(i, i + batchSize);
      await this.executeChunk(collectionName, operationType, chunk);
    }
  }

  /**
   * チャンクの実行
   */
  async executeChunk(collectionName, operationType, chunk) {
    // 実際のFirestore操作はここで実装
    // 現在はログ出力のみ
    console.log(`Database Optimizer: ${operationType} batch executed for ${collectionName} (${chunk.length} operations)`);
  }

  /**
   * パフォーマンス監視の設定
   */
  setupPerformanceMonitoring() {
    // 定期的なパフォーマンスレポート生成
    setInterval(() => {
      this.generatePerformanceReport();
    }, 600000); // 10分ごと
  }

  /**
   * クエリの最適化
   */
  optimizeQuery(query, options = {}) {
    const startTime = performance.now();
    
    // クエリの検証と最適化
    let optimizedQuery = { ...query };
    
    // Firestoreクエリの最適化
    if (query.collection) {
      optimizedQuery = this.applyFirestoreOptimizations(optimizedQuery, options);
    }
    
    // インデックス推奨の確認
    this.checkIndexRequirements(optimizedQuery);
    
    // パフォーマンスメトリクスの更新
    const endTime = performance.now();
    this.updatePerformanceMetrics('optimize', endTime - startTime);
    
    return optimizedQuery;
  }

  /**
   * Firestore最適化の適用
   */
  applyFirestoreOptimizations(query, options) {
    let optimized = { ...query };
    
    // ページネーション最適化
    optimized = this.optimizationRules.firestore.optimizePagination(optimized);
    
    // 選択フィールド最適化
    if (options.fields) {
      optimized = this.optimizationRules.firestore.optimizeSelection(optimized, options.fields);
    }
    
    // WHERE句の最適化
    if (optimized.where) {
      optimized.where = this.optimizeWhereClause(optimized.where);
    }
    
    // ORDER BY句の最適化
    if (optimized.orderBy) {
      optimized.orderBy = this.optimizeOrderBy(optimized.orderBy, optimized.where);
    }
    
    return optimized;
  }

  /**
   * WHERE句の最適化
   */
  optimizeWhereClause(whereClause) {
    // より効率的な順序に並び替え
    return whereClause.sort((a, b) => {
      // 等価条件を最初に配置
      if (a.operator === '==' && b.operator !== '==') return -1;
      if (b.operator === '==' && a.operator !== '==') return 1;
      
      // 範囲クエリは後に配置
      const rangeOperators = ['<', '<=', '>', '>='];
      const aIsRange = rangeOperators.includes(a.operator);
      const bIsRange = rangeOperators.includes(b.operator);
      
      if (!aIsRange && bIsRange) return -1;
      if (aIsRange && !bIsRange) return 1;
      
      return 0;
    });
  }

  /**
   * ORDER BY句の最適化
   */
  optimizeOrderBy(orderBy, whereClause) {
    // WHERE句で使用されているフィールドと同じフィールドでのソートを優先
    if (whereClause) {
      const whereFields = whereClause.map(w => w.field);
      const orderFields = Array.isArray(orderBy) ? orderBy.map(o => o.field) : [orderBy.field];
      
      // WHERE句とORDER BY句で共通のフィールドがあるかチェック
      const hasCommonField = orderFields.some(field => whereFields.includes(field));
      
      if (!hasCommonField) {
        console.warn('Database Optimizer: WHERE句とORDER BY句で異なるフィールドが使用されています。複合インデックスが必要な可能性があります。');
      }
    }
    
    return orderBy;
  }

  /**
   * インデックス要件のチェック
   */
  checkIndexRequirements(query) {
    if (this.optimizationRules.firestore.needsCompositeIndex(query)) {
      const recommendation = this.generateIndexRecommendation(query);
      this.addIndexRecommendation(recommendation);
    }
  }

  /**
   * インデックス推奨の生成
   */
  generateIndexRecommendation(query) {
    const fields = [];
    
    // WHERE句のフィールドを追加
    if (query.where) {
      query.where.forEach(condition => {
        fields.push({
          field: condition.field,
          mode: condition.operator === '==' ? 'ASCENDING' : 'ASCENDING' // 実際の実装では演算子に応じて調整
        });
      });
    }
    
    // ORDER BY句のフィールドを追加
    if (query.orderBy) {
      const orderFields = Array.isArray(query.orderBy) ? query.orderBy : [query.orderBy];
      orderFields.forEach(order => {
        if (!fields.find(f => f.field === order.field)) {
          fields.push({
            field: order.field,
            mode: order.direction || 'ASCENDING'
          });
        }
      });
    }
    
    return {
      collection: query.collection,
      fields: fields,
      priority: this.calculateIndexPriority(query),
      reason: this.getIndexReason(query)
    };
  }

  /**
   * インデックス優先度の計算
   */
  calculateIndexPriority(query) {
    let priority = 1;
    
    // 複数条件がある場合は優先度を上げる
    if (query.where && query.where.length > 1) {
      priority += query.where.length;
    }
    
    // ORDER BYがある場合は優先度を上げる
    if (query.orderBy) {
      priority += 2;
    }
    
    // LIMITがある場合は優先度を上げる
    if (query.limit) {
      priority += 1;
    }
    
    return Math.min(priority, 10); // 最大10
  }

  /**
   * インデックスが必要な理由の取得
   */
  getIndexReason(query) {
    const reasons = [];
    
    if (query.where && query.where.length > 1) {
      reasons.push('複数のWHERE条件');
    }
    
    if (query.where && query.orderBy) {
      reasons.push('WHEREとORDER BYの組み合わせ');
    }
    
    if (query.orderBy && Array.isArray(query.orderBy) && query.orderBy.length > 1) {
      reasons.push('複数フィールドでのソート');
    }
    
    return reasons.join(', ') || '複合クエリ';
  }

  /**
   * インデックス推奨の追加
   */
  addIndexRecommendation(recommendation) {
    // 同じ推奨が既に存在するかチェック
    const existing = this.indexRecommendations.find(r => 
      r.collection === recommendation.collection &&
      JSON.stringify(r.fields) === JSON.stringify(recommendation.fields)
    );
    
    if (!existing) {
      this.indexRecommendations.push({
        ...recommendation,
        timestamp: new Date().toISOString(),
        id: this.generateId()
      });
      
      console.log(`Database Optimizer: インデックス推奨を追加しました (${recommendation.collection})`);
    }
  }

  /**
   * キャッシュからクエリ結果を取得
   */
  getCachedQuery(queryKey) {
    const cacheEntry = this.queryCache.get(queryKey);
    
    if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTimeout) {
      this.performanceMetrics.cacheHits++;
      return cacheEntry.data;
    }
    
    this.performanceMetrics.cacheMisses++;
    return null;
  }

  /**
   * クエリ結果をキャッシュに保存
   */
  setCachedQuery(queryKey, data, ttl = null) {
    const timeout = ttl || this.cacheTimeout;
    
    this.queryCache.set(queryKey, {
      data: data,
      timestamp: Date.now(),
      ttl: timeout
    });
    
    // キャッシュサイズ制限
    if (this.queryCache.size > 1000) {
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }
  }

  /**
   * クエリキーの生成
   */
  generateQueryKey(query) {
    // クエリオブジェクトから一意のキーを生成
    const keyData = {
      collection: query.collection,
      where: query.where || [],
      orderBy: query.orderBy || [],
      limit: query.limit || null,
      select: query.select || []
    };
    
    return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * バッチ操作の追加
   */
  addToBatch(collectionName, operation) {
    if (!this.batchOperations.has(collectionName)) {
      this.batchOperations.set(collectionName, []);
    }
    
    this.batchOperations.get(collectionName).push({
      ...operation,
      timestamp: Date.now()
    });
  }

  /**
   * パフォーマンスメトリクスの更新
   */
  updatePerformanceMetrics(operation, executionTime) {
    this.performanceMetrics.queryCount++;
    
    // 平均実行時間の更新
    const totalTime = this.performanceMetrics.averageQueryTime * (this.performanceMetrics.queryCount - 1) + executionTime;
    this.performanceMetrics.averageQueryTime = totalTime / this.performanceMetrics.queryCount;
    
    // 遅いクエリの記録
    if (executionTime > 1000) { // 1秒以上
      this.performanceMetrics.slowQueries.push({
        operation: operation,
        executionTime: executionTime,
        timestamp: new Date().toISOString()
      });
      
      // 遅いクエリの履歴を制限
      if (this.performanceMetrics.slowQueries.length > 50) {
        this.performanceMetrics.slowQueries = this.performanceMetrics.slowQueries.slice(-25);
      }
    }
  }

  /**
   * パフォーマンスレポートの生成
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: { ...this.performanceMetrics },
      cacheStats: {
        size: this.queryCache.size,
        hitRate: this.performanceMetrics.cacheHits / 
                (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100
      },
      indexRecommendations: this.indexRecommendations.length,
      optimizationSummary: this.generateOptimizationSummary()
    };
    
    console.log('Database Optimizer: パフォーマンスレポート', report);
    return report;
  }

  /**
   * 最適化サマリーの生成
   */
  generateOptimizationSummary() {
    const summary = {
      totalQueries: this.performanceMetrics.queryCount,
      averageTime: Math.round(this.performanceMetrics.averageQueryTime * 100) / 100,
      slowQueries: this.performanceMetrics.slowQueries.length,
      cacheHitRate: Math.round(
        (this.performanceMetrics.cacheHits / 
         (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)) * 100
      ),
      pendingIndexes: this.indexRecommendations.length,
      recommendations: []
    };
    
    // 推奨事項の生成
    if (summary.averageTime > 500) {
      summary.recommendations.push('クエリの平均実行時間が長いです。インデックスの最適化を検討してください。');
    }
    
    if (summary.cacheHitRate < 50) {
      summary.recommendations.push('キャッシュヒット率が低いです。キャッシュ戦略の見直しを検討してください。');
    }
    
    if (summary.pendingIndexes > 5) {
      summary.recommendations.push('未作成のインデックス推奨が多数あります。インデックスの作成を検討してください。');
    }
    
    return summary;
  }

  /**
   * インデックス作成スクリプトの生成
   */
  generateIndexCreationScript() {
    if (this.indexRecommendations.length === 0) {
      return '// 作成が推奨されるインデックスはありません';
    }
    
    let script = '// Firestore インデックス作成推奨\n';
    script += '// 以下のインデックスを手動でFirestore Consoleで作成してください\n\n';
    
    this.indexRecommendations
      .sort((a, b) => b.priority - a.priority)
      .forEach((rec, index) => {
        script += `// ${index + 1}. ${rec.collection} - ${rec.reason} (優先度: ${rec.priority})\n`;
        script += `// Collection: ${rec.collection}\n`;
        script += '// Fields:\n';
        
        rec.fields.forEach(field => {
          script += `//   ${field.field}: ${field.mode}\n`;
        });
        
        script += '\n';
      });
    
    return script;
  }

  /**
   * IDの生成
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * インデックス推奨のクリア
   */
  clearIndexRecommendations() {
    this.indexRecommendations = [];
    console.log('Database Optimizer: インデックス推奨をクリアしました');
  }

  /**
   * 統計情報の取得
   */
  getStatistics() {
    return {
      performance: { ...this.performanceMetrics },
      cache: {
        size: this.queryCache.size,
        hitRate: this.performanceMetrics.cacheHits / 
                (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses),
        entries: Array.from(this.queryCache.keys()).length
      },
      batch: {
        pendingOperations: Array.from(this.batchOperations.values())
          .reduce((total, ops) => total + ops.length, 0),
        collections: this.batchOperations.size
      },
      indexes: {
        recommendations: this.indexRecommendations.length,
        priorityDistribution: this.getIndexPriorityDistribution()
      }
    };
  }

  /**
   * インデックス優先度分布の取得
   */
  getIndexPriorityDistribution() {
    const distribution = { low: 0, medium: 0, high: 0 };
    
    this.indexRecommendations.forEach(rec => {
      if (rec.priority <= 3) distribution.low++;
      else if (rec.priority <= 6) distribution.medium++;
      else distribution.high++;
    });
    
    return distribution;
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup() {
    this.queryCache.clear();
    this.batchOperations.clear();
    this.indexRecommendations = [];
    
    // パフォーマンスメトリクスをリセット
    this.performanceMetrics = {
      queryCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageQueryTime: 0,
      slowQueries: []
    };
    
    console.log('Database Optimizer: リソースをクリーンアップしました');
  }
}

// Export singleton instance
export const databaseOptimizer = new DatabaseOptimizer();