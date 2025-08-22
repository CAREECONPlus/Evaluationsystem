/**
 * Enhanced Internationalization (i18n) Service
 * 強化された国際化（i18n）サービス
 */
export class I18n {
  constructor() {
    this.lang = "ja";
    this.translations = {};
    this.supportedLanguages = ["ja", "en", "vi"];
    this.fallbackLanguage = "ja";
    this.numberFormats = {};
    this.dateFormats = {};
    this.loadingPromise = null;
  }

  /**
   * Initializes the service by setting the language.
   * 言語を設定してサービスを初期化します。
   */
  async init() {
    const lang = localStorage.getItem("lang") || this.detectUserLanguage() || this.lang;
    await this.setLanguage(lang);
    this.setupNumberFormats();
    this.setupDateFormats();
  }

  /**
   * Detect user's preferred language from browser settings
   * ブラウザ設定からユーザーの言語設定を検出
   */
  detectUserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    if (this.supportedLanguages.includes(langCode)) {
      return langCode;
    }
    
    return null;
  }

  /**
   * Sets the application language, loads translations, and updates the UI.
   * アプリケーションの言語を設定し、翻訳を読み込み、UIを更新します。
   * @param {string} lang - The language code (e.g., 'ja', 'en').
   */
  async setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.warn(`Unsupported language: ${lang}, falling back to ${this.fallbackLanguage}`);
      lang = this.fallbackLanguage;
    }
    
    this.lang = lang;
    localStorage.setItem("lang", lang);
    
    // HTMLのlang属性を更新
    document.documentElement.lang = lang;
    
    await this.loadTranslations(lang);
    this.setupNumberFormats();
    this.setupDateFormats();
    
    // UIの更新（app.jsが存在する場合のみ）
    if (window.app) {
      // UIコンポーネントの更新
      if (window.app.header) {
          window.app.header.update();
      }
      if (window.app.sidebar) {
          window.app.sidebar.update();
      }
      
      // 現在のページを再描画
      if (window.app.router && window.app.router.currentPageInstance) {
          this.updateUI();
      }
    }
  }

  /**
   * Loads the translation file for the specified language.
   * 指定された言語の翻訳ファイルを読み込みます。
   * @param {string} lang - The language code.
   */
  async loadTranslations(lang) {
    // 同じ言語を複数回読み込むのを防ぐ
    if (this.loadingPromise && this.currentLoadingLang === lang) {
      return this.loadingPromise;
    }
    
    this.currentLoadingLang = lang;
    this.loadingPromise = this._loadTranslationFile(lang);
    
    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
      this.currentLoadingLang = null;
    }
  }

  async _loadTranslationFile(lang) {
    try {
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.translations = await response.json();
      console.log(`I18n: Loaded translations for ${lang}`);
    } catch (error) {
      console.error(`Could not load translation file for ${lang}:`, error);
      
      // フォールバック言語の読み込み
      if (lang !== this.fallbackLanguage) {
        console.log(`I18n: Falling back to ${this.fallbackLanguage}`);
        try {
          const fallbackResponse = await fetch(`./locales/${this.fallbackLanguage}.json`);
          if (fallbackResponse.ok) {
            this.translations = await fallbackResponse.json();
            this.lang = this.fallbackLanguage;
          }
        } catch (fallbackError) {
          console.error(`Failed to load fallback language ${this.fallbackLanguage}:`, fallbackError);
          // 緊急時のハードコーディング翻訳
          this.translations = this.getEmergencyTranslations();
        }
      } else {
        // フォールバック言語も読み込めない場合
        this.translations = this.getEmergencyTranslations();
      }
    }
  }

  /**
   * Emergency fallback translations
   * 緊急時のフォールバック翻訳
   */
  getEmergencyTranslations() {
    return {
      common: {
        loading: "読み込み中...",
        error: "エラー",
        save: "保存",
        cancel: "キャンセル",
        submit: "送信"
      },
      errors: {
        loading_failed: "データの読み込みに失敗しました",
        network_error: "ネットワークエラーが発生しました"
      }
    };
  }

  /**
   * Setup number formatting for different locales
   * 各ロケールの数値フォーマットを設定
   */
  setupNumberFormats() {
    const localeMap = {
      'ja': 'ja-JP',
      'en': 'en-US', 
      'vi': 'vi-VN'
    };
    
    const locale = localeMap[this.lang] || 'ja-JP';
    
    this.numberFormats = {
      integer: new Intl.NumberFormat(locale),
      decimal: new Intl.NumberFormat(locale, { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 2 
      }),
      percentage: new Intl.NumberFormat(locale, { 
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }),
      currency: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: this.lang === 'vi' ? 'VND' : 'JPY'
      })
    };
  }

  /**
   * Setup date formatting for different locales
   * 各ロケールの日付フォーマットを設定
   */
  setupDateFormats() {
    const localeMap = {
      'ja': 'ja-JP',
      'en': 'en-US',
      'vi': 'vi-VN'
    };
    
    const locale = localeMap[this.lang] || 'ja-JP';
    
    this.dateFormats = {
      short: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      long: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }),
      time: new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit'
      }),
      datetime: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  /**
   * Translates a key into the current language.
   * キーを現在の言語に翻訳します。
   * @param {string} key - The key to translate (e.g., 'nav.dashboard').
   * @param {object} params - Parameters to replace in the translation string.
   * @returns {string} The translated string.
   */
  t(key, params = {}) {
    if (!key) return '';
    
    let translation = this.getTranslationByKey(key);
    
    if (!translation) {
      console.warn(`I18n: Missing translation for key: ${key} (${this.lang})`);
      return key; // キー自体を返す
    }

    // パラメータの置換
    if (params && Object.keys(params).length > 0) {
      translation = this.replaceParameters(translation, params);
    }

    return translation;
  }

  /**
   * Get translation by key with fallback support
   * フォールバック機能付きで翻訳を取得
   */
  getTranslationByKey(key) {
    const keys = key.split('.');
    let current = this.translations;
    
    // 現在の言語での翻訳を検索
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = null;
        break;
      }
    }
    
    // 翻訳が見つからない場合、フォールバック言語を試行
    if (!current && this.lang !== this.fallbackLanguage) {
      // フォールバック言語の翻訳を同期的に取得（既に読み込み済みの場合のみ）
      const fallbackTranslation = this.getFallbackTranslation(key);
      if (fallbackTranslation) {
        return fallbackTranslation;
      }
    }
    
    return current;
  }

  /**
   * Get fallback translation (synchronous)
   * フォールバック翻訳を取得（同期処理）
   */
  getFallbackTranslation(key) {
    // 簡易的な英語フォールバック
    const englishFallbacks = {
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.submit': 'Submit',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'errors.loading_failed': 'Failed to load data',
      'errors.network_error': 'Network error occurred',
      'nav.dashboard': 'Dashboard',
      'nav.users': 'Users',
      'nav.settings': 'Settings'
    };
    
    return englishFallbacks[key] || null;
  }

  /**
   * Replace parameters in translation string
   * 翻訳文字列内のパラメータを置換
   */
  replaceParameters(translation, params) {
    let result = translation;
    
    for (const [param, value] of Object.entries(params)) {
      // {{param}} 形式のパラメータを置換
      const regex = new RegExp(`{{${param}}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  /**
   * Format numbers according to current locale
   * 現在のロケールに応じて数値をフォーマット
   */
  formatNumber(number, type = 'integer') {
    if (isNaN(number)) return number;
    
    const formatter = this.numberFormats[type] || this.numberFormats.integer;
    return formatter.format(number);
  }

  /**
   * Format dates according to current locale
   * 現在のロケールに応じて日付をフォーマット
   */
  formatDate(date, type = 'short') {
    if (!date) return '';
    
    // Firestore Timestampの処理
    if (date.toDate && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    // 文字列の場合はDateオブジェクトに変換
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    if (isNaN(date)) return '';
    
    const formatter = this.dateFormats[type] || this.dateFormats.short;
    return formatter.format(date);
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   * 相対時間文字列を取得（例：「2時間前」）
   */
  formatRelativeTime(date) {
    if (!date) return '';
    
    if (date.toDate && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    if (isNaN(date)) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return this.t('time.just_now');
    } else if (diffMin < 60) {
      return this.t('time.minutes_ago', { count: diffMin });
    } else if (diffHour < 24) {
      return this.t('time.hours_ago', { count: diffHour });
    } else if (diffDay < 7) {
      return this.t('time.days_ago', { count: diffDay });
    } else {
      return this.formatDate(date, 'short');
    }
  }

  /**
   * Updates all elements with data-i18n attributes in the UI.
   * UI内のdata-i18n属性を持つすべての要素を更新します。
   * @param {HTMLElement} element - The parent element to update (defaults to document).
   */
  updateUI(element = document) {
    // data-i18n属性の要素を更新
    element.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const params = this.getElementParams(el);
      const translation = this.t(key, params);
      
      // 要素のタイプに応じて適切なプロパティに設定
      if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
        el.value = translation;
      } else {
        el.textContent = translation;
      }
    });
    
    // data-i18n-placeholder属性の要素を更新
    element.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const params = this.getElementParams(el);
      el.placeholder = this.t(key, params);
    });
    
    // data-i18n-title属性の要素を更新
    element.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const params = this.getElementParams(el);
      el.title = this.t(key, params);
    });
    
    // data-i18n-aria-label属性の要素を更新
    element.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
      const key = el.getAttribute("data-i18n-aria-label");
      const params = this.getElementParams(el);
      el.setAttribute('aria-label', this.t(key, params));
    });
  }

  /**
   * Get parameters from element attributes
   * 要素の属性からパラメータを取得
   */
  getElementParams(element) {
    const paramsAttr = element.getAttribute("data-i18n-params");
    if (!paramsAttr) return {};
    
    try {
      return JSON.parse(paramsAttr);
    } catch (error) {
      console.warn("I18n: Invalid JSON in data-i18n-params:", paramsAttr);
      return {};
    }
  }

  /**
   * Get current language info
   * 現在の言語情報を取得
   */
  getCurrentLanguage() {
    return {
      code: this.lang,
      name: this.getLanguageName(this.lang),
      isRTL: this.isRightToLeft(this.lang)
    };
  }

  /**
   * Get language display name
   * 言語の表示名を取得
   */
  getLanguageName(langCode) {
    const names = {
      'ja': '日本語',
      'en': 'English',
      'vi': 'Tiếng Việt'
    };
    return names[langCode] || langCode;
  }

  /**
   * Check if language is right-to-left
   * 言語が右から左かどうかを判定
   */
  isRightToLeft(langCode) {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(langCode);
  }

  /**
   * Add dynamic translation
   * 動的翻訳を追加
   */
  addTranslation(key, value, lang = this.lang) {
    const keys = key.split('.');
    let current = this.translations;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get all available languages
   * 利用可能な全言語を取得
   */
  getAvailableLanguages() {
    return this.supportedLanguages.map(lang => ({
      code: lang,
      name: this.getLanguageName(lang),
      isRTL: this.isRightToLeft(lang)
    }));
  }
}

// i18n.js の ja オブジェクトに以下を追加

users: {
  title: "ユーザー管理",
  subtitle: "組織内のユーザーを管理します", 
  invite_user: "ユーザーを招待",
  total_users: "総ユーザー数",
  active_users: "アクティブ",
  pending_users: "承認待ち", 
  admin_users: "管理者",
  all_status: "すべてのステータス",
  all_roles: "すべての役割",
  active: "アクティブ",
  inactive: "非アクティブ",
  pending: "承認待ち",
  role: "役割",
  status: "ステータス",
  invitation_message: "招待メッセージ（任意）",
  send_invitation: "招待を送信",
  edit_user: "ユーザー編集"
},
common: {
  retry: "再試行",
  refresh: "更新",
  save: "保存",
  cancel: "キャンセル",
  delete: "削除",
  edit: "編集",
  actions: "操作",
  created_at: "作成日",
  back_to_login: "ログインページに戻る"
}
