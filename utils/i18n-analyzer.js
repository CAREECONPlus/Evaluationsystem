/**
 * i18n翻訳データ使用状況分析ツール
 * 未使用の翻訳キーを特定して最適化を支援
 */

import { getLogger } from './logger.js';

class I18nAnalyzer {
  constructor() {
    this.logger = getLogger('I18nAnalyzer');
    this.usedKeys = new Set();
    this.availableKeys = new Set();
    this.patterns = [
      // data-i18n属性のパターン
      /data-i18n[^=]*=["']([^"']+)["']/g,
      // i18n.t()メソッド呼び出しのパターン
      /\.t\(["']([^"']+)["']\)/g,
      /i18n\.t\(["']([^"']+)["']\)/g,
      // テンプレートリテラル内のdata-i18n
      /data-i18n="([^"]+)"/g,
      // その他のi18nキー参照
      /i18n.*["']([^"']*\.[^"']+)["']/g
    ];
  }

  /**
   * 利用可能な翻訳キーをスキャン
   */
  scanAvailableKeys(translations) {
    this.logger.info('Scanning available translation keys...');
    
    const scanObject = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
          this.availableKeys.add(fullKey);
        } else if (typeof value === 'object' && value !== null) {
          scanObject(value, fullKey);
        }
      }
    };

    // 各言語の翻訳をスキャン
    Object.values(translations).forEach(langTranslations => {
      scanObject(langTranslations);
    });

    this.logger.info(`Found ${this.availableKeys.size} available translation keys`);
    return Array.from(this.availableKeys);
  }

  /**
   * ソースコード内の使用済みキーをスキャン
   */
  async scanUsedKeys() {
    this.logger.info('Scanning used translation keys in source code...');
    
    try {
      // JavaScriptファイルをスキャン
      await this.scanFiles('**/*.js');
      
      // HTMLファイルをスキャン  
      await this.scanFiles('**/*.html');
      
      this.logger.info(`Found ${this.usedKeys.size} used translation keys`);
      return Array.from(this.usedKeys);
      
    } catch (error) {
      this.logger.error('Error scanning used keys:', error);
      return [];
    }
  }

  /**
   * ファイルパターンに一致するファイルをスキャン
   */
  async scanFiles(pattern) {
    // この実装では、実際のファイル読み込みは外部で行い、
    // テキストデータを受け取って解析する方式とする
    this.logger.debug(`Scanning files with pattern: ${pattern}`);
  }

  /**
   * テキスト内の翻訳キーを抽出
   */
  extractKeysFromText(text) {
    const keys = new Set();
    
    this.patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const key = match[1];
        if (key && !key.includes('${')) { // テンプレート変数を除外
          keys.add(key);
        }
      }
    });

    return Array.from(keys);
  }

  /**
   * 単一のファイル内容を解析
   */
  analyzeFileContent(filename, content) {
    const keys = this.extractKeysFromText(content);
    keys.forEach(key => this.usedKeys.add(key));
    
    if (keys.length > 0) {
      this.logger.debug(`Found ${keys.length} keys in ${filename}`);
    }
    
    return keys;
  }

  /**
   * 未使用キーを特定
   */
  findUnusedKeys() {
    const unused = Array.from(this.availableKeys).filter(key => 
      !this.usedKeys.has(key)
    );
    
    this.logger.info(`Found ${unused.length} potentially unused keys`);
    return unused;
  }

  /**
   * 存在しないキーを特定（使用されているが定義されていない）
   */
  findMissingKeys() {
    const missing = Array.from(this.usedKeys).filter(key => 
      !this.availableKeys.has(key)
    );
    
    this.logger.warn(`Found ${missing.length} missing translation keys`);
    return missing;
  }

  /**
   * カテゴリ別使用状況を分析
   */
  analyzeByCategoryUsage() {
    const categoryUsage = {};
    
    this.usedKeys.forEach(key => {
      const category = key.split('.')[0];
      if (!categoryUsage[category]) {
        categoryUsage[category] = {
          used: 0,
          total: 0,
          keys: []
        };
      }
      categoryUsage[category].used++;
      categoryUsage[category].keys.push(key);
    });

    this.availableKeys.forEach(key => {
      const category = key.split('.')[0];
      if (!categoryUsage[category]) {
        categoryUsage[category] = {
          used: 0,
          total: 0,
          keys: []
        };
      }
      categoryUsage[category].total++;
    });

    return categoryUsage;
  }

  /**
   * 最適化レポートを生成
   */
  generateOptimizationReport() {
    const unusedKeys = this.findUnusedKeys();
    const missingKeys = this.findMissingKeys();
    const categoryUsage = this.analyzeByCategoryUsage();
    
    const report = {
      summary: {
        totalAvailable: this.availableKeys.size,
        totalUsed: this.usedKeys.size,
        unusedCount: unusedKeys.length,
        missingCount: missingKeys.length,
        utilizationRate: ((this.usedKeys.size / this.availableKeys.size) * 100).toFixed(1)
      },
      unusedKeys,
      missingKeys,
      categoryUsage,
      recommendations: []
    };

    // 最適化の推奨事項
    if (unusedKeys.length > 50) {
      report.recommendations.push({
        type: 'cleanup',
        priority: 'high',
        message: `${unusedKeys.length}個の未使用キーが見つかりました。削除を検討してください。`
      });
    }

    if (missingKeys.length > 0) {
      report.recommendations.push({
        type: 'missing',
        priority: 'critical',
        message: `${missingKeys.length}個の未定義キーが使用されています。翻訳を追加してください。`
      });
    }

    // カテゴリ別の推奨事項
    Object.entries(categoryUsage).forEach(([category, stats]) => {
      const usageRate = (stats.used / stats.total) * 100;
      if (usageRate < 30 && stats.total > 10) {
        report.recommendations.push({
          type: 'category_cleanup',
          priority: 'medium',
          message: `カテゴリ「${category}」の使用率が${usageRate.toFixed(1)}%と低いです。見直しを検討してください。`
        });
      }
    });

    return report;
  }

  /**
   * 最適化された翻訳データを生成
   */
  generateOptimizedTranslations(originalTranslations) {
    const optimized = {};
    
    Object.keys(originalTranslations).forEach(lang => {
      optimized[lang] = {};
      
      this.usedKeys.forEach(key => {
        const value = this.getNestedValue(originalTranslations[lang], key);
        if (value !== undefined) {
          this.setNestedValue(optimized[lang], key, value);
        }
      });
    });

    return optimized;
  }

  /**
   * ネストされたオブジェクトから値を取得
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * ネストされたオブジェクトに値を設定
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * レポートをコンソールに出力
   */
  printReport(report) {
    this.logger.group('I18n Analysis Report');
    
    // サマリー
    this.logger.info('Summary:', report.summary);
    
    // 未使用キー（最初の10個のみ表示）
    if (report.unusedKeys.length > 0) {
      this.logger.warn(`Unused keys (showing first 10 of ${report.unusedKeys.length}):`);
      this.logger.table(report.unusedKeys.slice(0, 10).map(key => ({ key })));
    }

    // 未定義キー
    if (report.missingKeys.length > 0) {
      this.logger.error('Missing keys:', report.missingKeys);
    }

    // カテゴリ別統計
    this.logger.info('Category usage:');
    const categoryTable = Object.entries(report.categoryUsage).map(([category, stats]) => ({
      category,
      used: stats.used,
      total: stats.total,
      rate: `${((stats.used / stats.total) * 100).toFixed(1)}%`
    }));
    this.logger.table(categoryTable);

    // 推奨事項
    if (report.recommendations.length > 0) {
      this.logger.group('Recommendations');
      report.recommendations.forEach(rec => {
        const logLevel = rec.priority === 'critical' ? 'error' : 
                        rec.priority === 'high' ? 'warn' : 'info';
        this.logger[logLevel](`[${rec.type}] ${rec.message}`);
      });
      this.logger.groupEnd();
    }

    this.logger.groupEnd();
  }

  /**
   * リセット
   */
  reset() {
    this.usedKeys.clear();
    this.availableKeys.clear();
  }
}

export default I18nAnalyzer;