/**
 * 共通ヘルパー関数
 * アプリケーション全体で使用する汎用ユーティリティ関数
 */

/**
 * 翻訳を要素に適用する
 * @param {HTMLElement} container - 翻訳を適用する要素
 * @param {Object} i18nInstance - i18nインスタンス（app.i18nまたはwindow.i18n）
 */
export function applyTranslations(container, i18nInstance = null) {
  if (!container) return;

  const i18n = i18nInstance || window.i18n || window.app?.i18n;
  if (i18n && typeof i18n.updateElement === 'function') {
    i18n.updateElement(container);
  }
}

/**
 * Firestoreタイムスタンプを安全に日付に変換
 * @param {*} timestamp - Firestoreタイムスタンプまたは日付オブジェクト
 * @returns {Date|null} 日付オブジェクトまたはnull
 */
export function safeToDate(timestamp) {
  if (!timestamp) return null;

  try {
    // Firestoreタイムスタンプの場合
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    // すでにDateオブジェクトの場合
    if (timestamp instanceof Date) {
      return isNaN(timestamp) ? null : timestamp;
    }

    // 文字列または数値の場合
    const date = new Date(timestamp);
    return isNaN(date) ? null : date;
  } catch (error) {
    console.warn('Failed to convert timestamp to date:', error);
    return null;
  }
}

/**
 * 日付をフォーマット
 * @param {*} timestamp - タイムスタンプ
 * @param {string} locale - ロケール（'ja-JP', 'en-US', 'vi-VN'）
 * @param {boolean} withTime - 時刻を含めるか
 * @returns {string} フォーマットされた日付文字列
 */
export function formatDate(timestamp, locale = 'ja-JP', withTime = false) {
  const date = safeToDate(timestamp);
  if (!date) return '-';

  try {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '-';
  }
}

/**
 * 環境に応じたログ出力
 * 本番環境では警告以上のみ出力
 */
export class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.isProduction = this.checkIsProduction();
  }

  checkIsProduction() {
    // 環境変数やホスト名から本番環境を判定
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname !== 'localhost' &&
             hostname !== '127.0.0.1' &&
             !hostname.includes('gitpod') &&
             !hostname.includes('github.dev');
    }
    return false;
  }

  debug(...args) {
    if (!this.isProduction) {
      console.log(`[${this.context}]`, ...args);
    }
  }

  info(...args) {
    if (!this.isProduction) {
      console.info(`[${this.context}]`, ...args);
    }
  }

  warn(...args) {
    console.warn(`[${this.context}]`, ...args);
  }

  error(...args) {
    console.error(`[${this.context}]`, ...args);
  }
}

/**
 * グローバル変数を使わずにイベントを処理するヘルパー
 * @param {string} selector - イベントを委譲する親要素のセレクタ
 * @param {string} eventType - イベントタイプ（'click', 'submit'など）
 * @param {string} targetSelector - イベントターゲットのセレクタ
 * @param {Function} handler - イベントハンドラ
 */
export function delegateEvent(selector, eventType, targetSelector, handler) {
  const parent = document.querySelector(selector);
  if (!parent) return;

  parent.addEventListener(eventType, (event) => {
    const target = event.target.closest(targetSelector);
    if (target) {
      handler(event, target);
    }
  });
}

/**
 * HTML文字列をサニタイズ（XSS対策）
 * @param {string} str - サニタイズする文字列
 * @returns {string} サニタイズされた文字列
 */
export function sanitizeHtml(str) {
  if (!str || typeof str !== 'string') return '';

  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * デバウンス関数
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * スロットル関数
 * @param {Function} func - 実行する関数
 * @param {number} limit - 制限時間（ミリ秒）
 * @returns {Function} スロットルされた関数
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * ディープクローン
 * @param {*} obj - クローンするオブジェクト
 * @returns {*} クローンされたオブジェクト
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * オブジェクトから undefined/null/空文字を除去
 * @param {Object} obj - クリーンアップするオブジェクト
 * @returns {Object} クリーンアップされたオブジェクト
 */
export function cleanObject(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * 配列を指定サイズのチャンクに分割
 * @param {Array} array - 分割する配列
 * @param {number} size - チャンクサイズ
 * @returns {Array<Array>} チャンク化された配列
 */
export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * エラーメッセージを取得
 * @param {Error} error - エラーオブジェクト
 * @param {string} defaultMessage - デフォルトメッセージ
 * @returns {string} エラーメッセージ
 */
export function getErrorMessage(error, defaultMessage = '不明なエラーが発生しました') {
  if (!error) return defaultMessage;

  // Firebaseエラー
  if (error.code) {
    const errorMessages = {
      'permission-denied': '権限がありません',
      'not-found': 'データが見つかりません',
      'already-exists': 'すでに存在します',
      'failed-precondition': '前提条件が満たされていません',
      'aborted': '処理が中断されました',
      'out-of-range': '範囲外の値です',
      'unauthenticated': '認証が必要です',
      'resource-exhausted': 'リソースが不足しています',
      'cancelled': 'キャンセルされました',
      'data-loss': 'データが失われました',
      'unknown': '不明なエラーです',
      'invalid-argument': '無効な引数です',
      'deadline-exceeded': 'タイムアウトしました',
      'unavailable': 'サービスが利用できません',
      'unimplemented': '実装されていません',
      'internal': '内部エラーが発生しました',
    };

    return errorMessages[error.code] || error.message || defaultMessage;
  }

  return error.message || defaultMessage;
}

/**
 * 安全にローカルストレージに保存
 * @param {string} key - キー
 * @param {*} value - 値
 * @returns {boolean} 成功したかどうか
 */
export function safeLocalStorage(key, value) {
  try {
    if (value === undefined) {
      return localStorage.getItem(key);
    } else if (value === null) {
      localStorage.removeItem(key);
      return true;
    } else {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
  } catch (error) {
    console.warn('LocalStorage operation failed:', error);
    return false;
  }
}

/**
 * URLパラメータを取得
 * @param {string} param - パラメータ名
 * @returns {string|null} パラメータ値
 */
export function getUrlParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * クリップボードにコピー
 * @param {string} text - コピーするテキスト
 * @returns {Promise<boolean>} 成功したかどうか
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // フォールバック
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    return false;
  }
}
