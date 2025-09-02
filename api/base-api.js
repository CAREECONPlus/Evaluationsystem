/**
 * ベースAPIクラス
 * 全てのAPI操作の共通機能を提供
 */

import { 
  serverTimestamp,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import ErrorHandler, { createError } from "../utils/error-handler.js";
import { getLogger } from "../utils/logger.js";
import { validateValue, validateObject } from "../utils/type-validator.js";
import { TYPES } from "../utils/type-validator.js";

export class BaseAPI {
  constructor(app) {
    this.app = app;
    this.errorHandler = new ErrorHandler(app);
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分
    this.logger = getLogger(this.constructor.name);
  }

  /**
   * Firestoreインスタンスを取得
   */
  get db() {
    if (!this.app.auth.db) {
      throw createError.system('Firestore has not been initialized');
    }
    return this.app.auth.db;
  }

  /**
   * 現在のユーザーデータを取得
   */
  async getCurrentUserData() {
    try {
      // アプリに保存されている現在のユーザー情報を確認
      if (this.app && this.app.currentUser) {
        return this.app.currentUser;
      }

      // フォールバック: Firebase Authから直接取得
      if (!this.app.auth.auth.currentUser) {
        return null;
      }

      const uid = this.app.auth.auth.currentUser.uid;
      const email = this.app.auth.auth.currentUser.email;
      
      // グローバルユーザーデータを優先して取得
      if (email) {
        const globalUserDoc = await getDoc(doc(this.db, "global_users", email));
        if (globalUserDoc.exists()) {
          const data = globalUserDoc.data();
          return { id: email, ...data };
        }
      }

      // フォールバック: レガシーusersコレクション
      const userDoc = await getDoc(doc(this.db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return { id: uid, ...data };
      }

      return null;

    } catch (error) {
      this.logger.error("Error getting current user data:", error);
      return null;
    }
  }

  /**
   * テナントIDを取得
   */
  async getCurrentTenantId() {
    const currentUser = await this.getCurrentUserData();
    if (!currentUser || !currentUser.tenantId) {
      throw createError.permission('テナント情報の取得', 'テナントIDが見つかりません');
    }
    return currentUser.tenantId;
  }

  /**
   * サーバータイムスタンプを取得
   */
  serverTimestamp() {
    return serverTimestamp();
  }

  /**
   * エラーを処理
   */
  handleError(error, operation = '操作') {
    return this.errorHandler.handle(error, operation);
  }

  /**
   * データの検証（型安全性対応）
   * @param {Object} data - バリデーション対象のデータ
   * @param {Array<string>} fields - 必須フィールド一覧
   * @throws {ValidationError} バリデーションエラー
   */
  validateRequired(data, fields) {
    // データオブジェクトの型チェック
    const dataValidation = validateValue(data, { type: TYPES.OBJECT, required: true }, 'data');
    if (!dataValidation.isValid) {
      throw createError.validation('data', 'データオブジェクトが必要です');
    }

    // フィールド配列の型チェック
    const fieldsValidation = validateValue(fields, { type: TYPES.ARRAY, required: true }, 'fields');
    if (!fieldsValidation.isValid) {
      throw createError.validation('fields', 'フィールド配列が必要です');
    }

    // 各必須フィールドをチェック
    for (const field of fields) {
      const fieldValidation = validateValue(data[field], { 
        type: TYPES.STRING, 
        required: true,
        minLength: 1
      }, field);
      
      if (!fieldValidation.isValid) {
        throw createError.validation(field, '必須項目です');
      }
    }
  }

  /**
   * メールアドレスの検証（型安全性対応）
   * @param {string} email - 検証対象のメールアドレス
   * @returns {boolean} 検証成功時はtrue
   * @throws {ValidationError} バリデーションエラー
   */
  validateEmail(email) {
    const validation = validateValue(email, { 
      type: 'email', 
      required: true 
    }, 'email');
    
    if (!validation.isValid) {
      const error = validation.errors[0];
      throw createError.validation('email', error.message);
    }
    
    return true;
  }

  /**
   * パスワードの検証
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw createError.validation('password', 'パスワードが無効です');
    }
    
    if (password.length < 6) {
      throw createError.validation('password', 'パスワードは6文字以上で入力してください');
    }
    
    return true;
  }

  /**
   * 名前の検証
   */
  validateName(name) {
    if (!name || typeof name !== 'string') {
      throw createError.validation('name', '名前が無効です');
    }
    
    if (name.trim().length < 2) {
      throw createError.validation('name', '名前は2文字以上で入力してください');
    }
    
    return true;
  }

  /**
   * データをクリーンアップ（undefinedフィールドを除去）
   */
  cleanData(data) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * ページング用のクエリオプションを作成
   */
  createPagingOptions(page = 1, limit = 20) {
    return {
      offset: (page - 1) * limit,
      limit: Math.min(limit, 100) // 最大100件
    };
  }

  /**
   * キャッシュからデータを取得
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * データをキャッシュに保存
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // キャッシュサイズを制限
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * キャッシュをクリア
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * 権限をチェック
   */
  checkPermission(requiredRoles, operation = '操作') {
    if (!this.app.isAuthenticated()) {
      throw createError.permission(operation, '認証が必要です');
    }

    if (requiredRoles && !this.app.hasAnyRole(requiredRoles)) {
      throw createError.permission(operation, `必要な権限: ${requiredRoles.join(', ')}`);
    }
  }

  /**
   * データの存在確認
   */
  async checkExists(collection, id, errorMessage = 'データが見つかりません') {
    const doc = await getDoc(doc(this.db, collection, id));
    if (!doc.exists()) {
      throw createError.notFound(errorMessage, id);
    }
    return doc;
  }

  /**
   * 安全なJSON解析
   */
  safeJSONParse(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch (error) {
      this.logger.warn('JSON parse failed:', error);
      return defaultValue;
    }
  }

  /**
   * 日付フォーマット
   */
  formatDate(timestamp, withTime = false) {
    if (!timestamp) return '-';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date)) return '-';

      const locale = this.app.i18n.lang === "ja" ? "ja-JP" : 
                    this.app.i18n.lang === "vi" ? "vi-VN" : "en-US";

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      if (withTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
      }

      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      this.logger.error("Date formatting error:", error);
      return '-';
    }
  }

  /**
   * リトライ付き実行
   */
  async retry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // リトライしない条件
        if (error.type === 'PermissionError' || 
            error.type === 'ValidationError' ||
            error.type === 'NotFoundError') {
          throw error;
        }
        
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // 指数バックオフでリトライ
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    
    throw lastError;
  }

  /**
   * バッチ処理のヘルパー
   */
  async processBatch(items, processor, batchSize = 10) {
    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(item => processor(item))
        );
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            errors.push({
              item: batch[index],
              error: result.reason
            });
          }
        });
      } catch (error) {
        this.logger.error('Batch processing error:', error);
        errors.push({ batch, error });
      }
    }

    return { results, errors };
  }

  /**
   * デバッグ情報を出力
   */
  debug() {
    this.logger.debug('Debug info:', {
      cacheSize: this.cache.size,
      isAuthenticated: this.app.isAuthenticated(),
      currentUser: this.app.currentUser?.email || 'N/A',
      errorStats: this.errorHandler.getErrorStats()
    });
  }
}