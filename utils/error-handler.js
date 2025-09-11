/**
 * 統一エラーハンドリングシステム
 * アプリケーション全体で一貫したエラー処理を提供
 */

export class ErrorTypes {
  static VALIDATION = 'ValidationError';
  static PERMISSION = 'PermissionError';
  static NETWORK = 'NetworkError';
  static FIREBASE = 'FirebaseError';
  static AUTHENTICATION = 'AuthenticationError';
  static NOT_FOUND = 'NotFoundError';
  static TIMEOUT = 'TimeoutError';
  static SYSTEM = 'SystemError';
}

export class AppError extends Error {
  constructor(message, type = ErrorTypes.SYSTEM, code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.userMessage = this.generateUserMessage();

    // スタックトレースをキャプチャ
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * ユーザー向けメッセージを生成（国際化対応）
   */
  generateUserMessage() {
    const lang = window.i18n?.getCurrentLanguage() || 'ja';
    
    const messages = {
      ja: {
        [ErrorTypes.VALIDATION]: '入力内容に問題があります。',
        [ErrorTypes.PERMISSION]: 'この操作を実行する権限がありません。',
        [ErrorTypes.NETWORK]: 'ネットワーク接続に問題があります。',
        [ErrorTypes.FIREBASE]: 'データベース操作中にエラーが発生しました。',
        [ErrorTypes.AUTHENTICATION]: 'ログインが必要です。',
        [ErrorTypes.NOT_FOUND]: '指定されたデータが見つかりません。',
        [ErrorTypes.TIMEOUT]: '処理がタイムアウトしました。',
        [ErrorTypes.SYSTEM]: 'システムエラーが発生しました。'
      },
      en: {
        [ErrorTypes.VALIDATION]: 'There is an issue with your input.',
        [ErrorTypes.PERMISSION]: 'You do not have permission to perform this operation.',
        [ErrorTypes.NETWORK]: 'There is a network connection problem.',
        [ErrorTypes.FIREBASE]: 'An error occurred during database operation.',
        [ErrorTypes.AUTHENTICATION]: 'Login is required.',
        [ErrorTypes.NOT_FOUND]: 'The specified data was not found.',
        [ErrorTypes.TIMEOUT]: 'The operation timed out.',
        [ErrorTypes.SYSTEM]: 'A system error occurred.'
      },
      vi: {
        [ErrorTypes.VALIDATION]: 'Có vấn đề với đầu vào của bạn.',
        [ErrorTypes.PERMISSION]: 'Bạn không có quyền thực hiện thao tác này.',
        [ErrorTypes.NETWORK]: 'Có vấn đề kết nối mạng.',
        [ErrorTypes.FIREBASE]: 'Đã xảy ra lỗi trong quá trình vận hành cơ sở dữ liệu.',
        [ErrorTypes.AUTHENTICATION]: 'Cần đăng nhập.',
        [ErrorTypes.NOT_FOUND]: 'Không tìm thấy dữ liệu được chỉ định.',
        [ErrorTypes.TIMEOUT]: 'Thao tác đã hết thời gian chờ.',
        [ErrorTypes.SYSTEM]: 'Đã xảy ra lỗi hệ thống.'
      }
    };

    const langMessages = messages[lang] || messages.ja;
    return langMessages[this.type] || (lang === 'ja' ? '予期せぬエラーが発生しました。' : 'An unexpected error occurred.');
  }

  /**
   * エラー情報をオブジェクトとして取得
   */
  toObject() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      details: this.details,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  constructor(app) {
    this.app = app;
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Firebaseエラーを標準化
   */
  normalizeFirebaseError(error) {
    const firebaseErrorMap = {
      'permission-denied': {
        type: ErrorTypes.PERMISSION,
        message: '権限がありません。管理者に連絡してください。'
      },
      'unavailable': {
        type: ErrorTypes.NETWORK,
        message: 'サービスが一時的に利用できません。しばらくしてから再試行してください。'
      },
      'unauthenticated': {
        type: ErrorTypes.AUTHENTICATION,
        message: 'ログインが必要です。'
      },
      'network-request-failed': {
        type: ErrorTypes.NETWORK,
        message: 'ネットワークエラーが発生しました。接続を確認してください。'
      },
      'not-found': {
        type: ErrorTypes.NOT_FOUND,
        message: '指定されたデータが見つかりません。'
      },
      'invalid-argument': {
        type: ErrorTypes.VALIDATION,
        message: '無効な引数が指定されました。'
      },
      'already-exists': {
        type: ErrorTypes.VALIDATION,
        message: '同じデータが既に存在します。'
      },
      'resource-exhausted': {
        type: ErrorTypes.SYSTEM,
        message: 'リソースが不足しています。しばらく待ってから再試行してください。'
      }
    };

    const mapped = firebaseErrorMap[error.code];
    if (mapped) {
      return new AppError(mapped.message, mapped.type, error.code, {
        originalMessage: error.message,
        originalCode: error.code
      });
    }

    return new AppError(
      error.message || 'Firebaseエラーが発生しました',
      ErrorTypes.FIREBASE,
      error.code,
      { originalError: error }
    );
  }

  /**
   * 一般的なエラーを標準化
   */
  normalizeError(error) {
    // AppErrorはそのまま返す
    if (error instanceof AppError) {
      return error;
    }

    // Firebaseエラーの処理
    if (error.code && typeof error.code === 'string') {
      return this.normalizeFirebaseError(error);
    }

    // JavaScriptの標準エラー
    if (error instanceof TypeError) {
      return new AppError(
        'データの形式に問題があります。',
        ErrorTypes.VALIDATION,
        'type-error',
        { originalMessage: error.message }
      );
    }

    if (error instanceof ReferenceError) {
      return new AppError(
        'システム内部エラーが発生しました。',
        ErrorTypes.SYSTEM,
        'reference-error',
        { originalMessage: error.message }
      );
    }

    if (error instanceof RangeError) {
      return new AppError(
        '値の範囲が正しくありません。',
        ErrorTypes.VALIDATION,
        'range-error',
        { originalMessage: error.message }
      );
    }

    // その他のエラー
    return new AppError(
      error.message || '予期せぬエラーが発生しました。',
      ErrorTypes.SYSTEM,
      'unknown-error',
      { originalError: error }
    );
  }

  /**
   * エラーを処理し、適切に表示
   */
  handle(error, context = '') {
    const normalizedError = this.normalizeError(error);
    
    // ログに記録
    this.log(normalizedError, context);

    // Operation cancelled エラーは無視
    if (this.isOperationCancelledError(error)) {
      console.log(`[ErrorHandler] Operation cancelled in ${context} - likely due to page reload, ignoring error`);
      return normalizedError;
    }

    // コンソールにログ出力
    console.error(`[ErrorHandler] Error in ${context}:`, normalizedError.toObject());

    // ユーザーに通知
    if (this.app && this.app.showError) {
      this.app.showError(normalizedError.userMessage);
    }

    // 認証エラーの場合は自動的にログインページにリダイレクト
    if (normalizedError.type === ErrorTypes.AUTHENTICATION) {
      this.handleAuthenticationError(normalizedError);
    }

    return normalizedError;
  }

  /**
   * Operation cancelled エラーの判定
   */
  isOperationCancelledError(error) {
    return error && 
           error.message && 
           error.message.includes("Operation cancelled");
  }

  /**
   * 認証エラーの処理
   */
  handleAuthenticationError(error) {
    if (this.app && this.app.navigate) {
      console.log('[ErrorHandler] Authentication error, redirecting to login');
      setTimeout(() => {
        this.app.navigate('#/login');
      }, 1500);
    }
  }

  /**
   * エラーログに記録
   */
  log(error, context = '') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context: context,
      error: error instanceof AppError ? error.toObject() : error,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errorLog.push(logEntry);

    // ログサイズを制限
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // 本番環境では外部ログサービスに送信することを検討
    if (window.location.hostname !== 'localhost') {
      this.sendToExternalLogger(logEntry);
    }
  }

  /**
   * 外部ログサービスに送信（本番環境用）
   */
  async sendToExternalLogger(logEntry) {
    try {
      // 実装例：外部ログサービスAPIに送信
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
      
      console.log('[ErrorHandler] Would send to external logger:', logEntry);
    } catch (error) {
      console.warn('[ErrorHandler] Failed to send error to external logger:', error);
    }
  }

  /**
   * バリデーションエラーを作成
   */
  createValidationError(field, message) {
    return new AppError(
      `${field}: ${message}`,
      ErrorTypes.VALIDATION,
      'validation-failed',
      { field, validationMessage: message }
    );
  }

  /**
   * 権限エラーを作成
   */
  createPermissionError(action, resource = null) {
    return new AppError(
      `${action}の権限がありません${resource ? ` (${resource})` : ''}`,
      ErrorTypes.PERMISSION,
      'permission-denied',
      { action, resource }
    );
  }

  /**
   * Not Foundエラーを作成
   */
  createNotFoundError(resource, id = null) {
    return new AppError(
      `${resource}が見つかりません${id ? ` (ID: ${id})` : ''}`,
      ErrorTypes.NOT_FOUND,
      'not-found',
      { resource, id }
    );
  }

  /**
   * エラーログを取得
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * エラーログをクリア
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * エラー統計を取得
   */
  getErrorStats() {
    const stats = {};
    this.errorLog.forEach(entry => {
      const type = entry.error.type || 'unknown';
      stats[type] = (stats[type] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byType: stats,
      recent: this.errorLog.slice(-10)
    };
  }
}

// ユーティリティ関数
export const createError = {
  validation: (field, message) => new AppError(
    `${field}: ${message}`,
    ErrorTypes.VALIDATION,
    'validation-failed',
    { field, validationMessage: message }
  ),

  permission: (action, resource = null) => new AppError(
    `${action}の権限がありません${resource ? ` (${resource})` : ''}`,
    ErrorTypes.PERMISSION,
    'permission-denied',
    { action, resource }
  ),

  notFound: (resource, id = null) => new AppError(
    `${resource}が見つかりません${id ? ` (ID: ${id})` : ''}`,
    ErrorTypes.NOT_FOUND,
    'not-found',
    { resource, id }
  ),

  network: (message = 'ネットワークエラーが発生しました') => new AppError(
    message,
    ErrorTypes.NETWORK,
    'network-error'
  )
};

export default ErrorHandler;