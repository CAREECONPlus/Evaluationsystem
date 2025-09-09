/**
 * Enhanced i18n System - Phase 8
 * 多言語対応強化システム
 */

export class EnhancedI18n {
  constructor() {
    this.currentLanguage = 'ja';
    this.fallbackLanguage = 'ja';
    this.supportedLanguages = ['ja', 'en', 'vi'];
    this.translations = new Map();
    this.pluralRules = new Map();
    this.dateFormats = new Map();
    this.numberFormats = new Map();
    this.rtlLanguages = ['ar', 'he', 'fa'];
    this.loadPromises = new Map();
    
    this.setupLanguageDetection();
    this.setupPluralRules();
    this.setupDateTimeFormats();
    this.setupNumberFormats();
    this.init();
  }

  /**
   * Initialize i18n system
   */
  async init() {
    // Load translations for current language
    await this.loadTranslations(this.currentLanguage);
    
    // Load fallback language if different
    if (this.currentLanguage !== this.fallbackLanguage) {
      await this.loadTranslations(this.fallbackLanguage);
    }
    
    // Apply initial language settings
    this.applyLanguageSettings();
    
    // Setup automatic detection
    this.setupLanguageChangeDetection();
  }

  /**
   * Setup language detection
   */
  setupLanguageDetection() {
    // 1. Check localStorage
    const savedLanguage = localStorage.getItem('user-language');
    if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
      return;
    }

    // 2. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && this.supportedLanguages.includes(urlLang)) {
      this.currentLanguage = urlLang;
      return;
    }

    // 3. Check browser language
    const browserLanguages = navigator.languages || [navigator.language];
    for (const browserLang of browserLanguages) {
      const lang = browserLang.split('-')[0];
      if (this.supportedLanguages.includes(lang)) {
        this.currentLanguage = lang;
        return;
      }
    }

    // 4. Use fallback
    this.currentLanguage = this.fallbackLanguage;
  }

  /**
   * Setup plural rules for different languages
   */
  setupPluralRules() {
    // Japanese - no pluralization
    this.pluralRules.set('ja', (count) => 0);
    
    // English - standard pluralization
    this.pluralRules.set('en', (count) => {
      if (count === 1) return 0; // singular
      return 1; // plural
    });
    
    // Vietnamese - no pluralization 
    this.pluralRules.set('vi', (count) => 0);
  }

  /**
   * Setup date/time formats
   */
  setupDateTimeFormats() {
    this.dateFormats.set('ja', {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    });

    this.dateFormats.set('en', {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    });

    this.dateFormats.set('vi', {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    });
  }

  /**
   * Setup number formats
   */
  setupNumberFormats() {
    this.numberFormats.set('ja', {
      decimal: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
      currency: { style: 'currency', currency: 'JPY' },
      percent: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }
    });

    this.numberFormats.set('en', {
      decimal: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
      currency: { style: 'currency', currency: 'USD' },
      percent: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }
    });

    this.numberFormats.set('vi', {
      decimal: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
      currency: { style: 'currency', currency: 'VND' },
      percent: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }
    });
  }

  /**
   * Load translations for a specific language
   */
  async loadTranslations(language) {
    if (this.translations.has(language)) {
      return this.translations.get(language);
    }

    // Check if already loading
    if (this.loadPromises.has(language)) {
      return await this.loadPromises.get(language);
    }

    const loadPromise = this.fetchTranslations(language);
    this.loadPromises.set(language, loadPromise);

    try {
      const translations = await loadPromise;
      this.translations.set(language, translations);
      this.loadPromises.delete(language);
      return translations;
    } catch (error) {
      this.loadPromises.delete(language);
      console.error(`Failed to load translations for ${language}:`, error);
      return {};
    }
  }

  /**
   * Fetch translations from server or local storage
   */
  async fetchTranslations(language) {
    try {
      // First try to load from server
      const response = await fetch(`/locales/${language}.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Failed to load translations from server for ${language}`);
    }

    // Fallback to embedded translations
    return this.getEmbeddedTranslations(language);
  }

  /**
   * Get embedded translations
   */
  getEmbeddedTranslations(language) {
    const embedded = {
      ja: {
        // Common UI
        'common.save': '保存',
        'common.cancel': 'キャンセル',
        'common.edit': '編集',
        'common.delete': '削除',
        'common.add': '追加',
        'common.search': '検索',
        'common.loading': '読み込み中...',
        'common.error': 'エラーが発生しました',
        'common.success': '正常に完了しました',
        'common.confirm': '確認',
        'common.yes': 'はい',
        'common.no': 'いいえ',
        
        // Navigation
        'nav.dashboard': 'ダッシュボード',
        'nav.evaluations': '評価',
        'nav.reports': 'レポート',
        'nav.settings': '設定',
        'nav.users': 'ユーザー',
        'nav.logout': 'ログアウト',
        
        // Evaluation system
        'eval.selfEvaluation': '自己評価',
        'eval.peerEvaluation': '相互評価',
        'eval.supervisorEvaluation': '上司評価',
        'eval.complete': '評価完了',
        'eval.pending': '評価待ち',
        'eval.inProgress': '評価中',
        
        // Time periods
        'time.today': '今日',
        'time.yesterday': '昨日',
        'time.thisWeek': '今週',
        'time.thisMonth': '今月',
        'time.thisYear': '今年',
        'time.lastMonth': '先月',
        'time.lastYear': '昨年',
        
        // Validation
        'validation.required': 'この項目は必須です',
        'validation.email': '有効なメールアドレスを入力してください',
        'validation.minLength': '最低{min}文字入力してください',
        'validation.maxLength': '最大{max}文字まで入力できます',
        
        // Messages
        'message.dataUpdated': 'データが更新されました',
        'message.dataDeleted': 'データが削除されました',
        'message.operationFailed': '操作に失敗しました',
        'message.accessDenied': 'アクセスが拒否されました',
        
        // Accessibility
        'a11y.skipToMain': 'メインコンテンツにスキップ',
        'a11y.skipToNav': 'ナビゲーションにスキップ',
        'a11y.openMenu': 'メニューを開く',
        'a11y.closeMenu': 'メニューを閉じる',
        'a11y.loading': '読み込み中',
        'a11y.error': 'エラー',
      },

      en: {
        // Common UI
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.add': 'Add',
        'common.search': 'Search',
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.success': 'Successfully completed',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
        
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.evaluations': 'Evaluations',
        'nav.reports': 'Reports',
        'nav.settings': 'Settings',
        'nav.users': 'Users',
        'nav.logout': 'Logout',
        
        // Evaluation system
        'eval.selfEvaluation': 'Self Evaluation',
        'eval.peerEvaluation': 'Peer Evaluation',
        'eval.supervisorEvaluation': 'Supervisor Evaluation',
        'eval.complete': 'Complete',
        'eval.pending': 'Pending',
        'eval.inProgress': 'In Progress',
        
        // Time periods
        'time.today': 'Today',
        'time.yesterday': 'Yesterday',
        'time.thisWeek': 'This Week',
        'time.thisMonth': 'This Month',
        'time.thisYear': 'This Year',
        'time.lastMonth': 'Last Month',
        'time.lastYear': 'Last Year',
        
        // Validation
        'validation.required': 'This field is required',
        'validation.email': 'Please enter a valid email address',
        'validation.minLength': 'Please enter at least {min} characters',
        'validation.maxLength': 'Maximum {max} characters allowed',
        
        // Messages
        'message.dataUpdated': 'Data has been updated',
        'message.dataDeleted': 'Data has been deleted',
        'message.operationFailed': 'Operation failed',
        'message.accessDenied': 'Access denied',
        
        // Accessibility
        'a11y.skipToMain': 'Skip to main content',
        'a11y.skipToNav': 'Skip to navigation',
        'a11y.openMenu': 'Open menu',
        'a11y.closeMenu': 'Close menu',
        'a11y.loading': 'Loading',
        'a11y.error': 'Error',
      },

      vi: {
        // Common UI
        'common.save': 'Lưu',
        'common.cancel': 'Hủy',
        'common.edit': 'Chỉnh sửa',
        'common.delete': 'Xóa',
        'common.add': 'Thêm',
        'common.search': 'Tìm kiếm',
        'common.loading': 'Đang tải...',
        'common.error': 'Đã xảy ra lỗi',
        'common.success': 'Hoàn thành thành công',
        'common.confirm': 'Xác nhận',
        'common.yes': 'Có',
        'common.no': 'Không',
        
        // Navigation
        'nav.dashboard': 'Bảng điều khiển',
        'nav.evaluations': 'Đánh giá',
        'nav.reports': 'Báo cáo',
        'nav.settings': 'Cài đặt',
        'nav.users': 'Người dùng',
        'nav.logout': 'Đăng xuất',
        
        // Evaluation system
        'eval.selfEvaluation': 'Tự đánh giá',
        'eval.peerEvaluation': 'Đánh giá đồng nghiệp',
        'eval.supervisorEvaluation': 'Đánh giá cấp trên',
        'eval.complete': 'Hoàn thành',
        'eval.pending': 'Đang chờ',
        'eval.inProgress': 'Đang tiến hành',
        
        // Time periods
        'time.today': 'Hôm nay',
        'time.yesterday': 'Hôm qua',
        'time.thisWeek': 'Tuần này',
        'time.thisMonth': 'Tháng này',
        'time.thisYear': 'Năm nay',
        'time.lastMonth': 'Tháng trước',
        'time.lastYear': 'Năm trước',
        
        // Validation
        'validation.required': 'Trường này là bắt buộc',
        'validation.email': 'Vui lòng nhập địa chỉ email hợp lệ',
        'validation.minLength': 'Vui lòng nhập ít nhất {min} ký tự',
        'validation.maxLength': 'Tối đa {max} ký tự được phép',
        
        // Messages
        'message.dataUpdated': 'Dữ liệu đã được cập nhật',
        'message.dataDeleted': 'Dữ liệu đã được xóa',
        'message.operationFailed': 'Thao tác thất bại',
        'message.accessDenied': 'Truy cập bị từ chối',
        
        // Accessibility
        'a11y.skipToMain': 'Chuyển đến nội dung chính',
        'a11y.skipToNav': 'Chuyển đến điều hướng',
        'a11y.openMenu': 'Mở menu',
        'a11y.closeMenu': 'Đóng menu',
        'a11y.loading': 'Đang tải',
        'a11y.error': 'Lỗi',
      }
    };

    return embedded[language] || embedded[this.fallbackLanguage] || {};
  }

  /**
   * Get translated text
   */
  t(key, variables = {}, language = null) {
    const lang = language || this.currentLanguage;
    const translations = this.translations.get(lang) || {};
    
    let text = translations[key];
    
    // Fallback to fallback language
    if (!text && lang !== this.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.fallbackLanguage) || {};
      text = fallbackTranslations[key];
    }
    
    // Fallback to main i18n system
    if (!text && window.i18n && typeof window.i18n.t === 'function') {
      try {
        text = window.i18n.t(key, variables);
        // i18nのtメソッドがキー自体を返した場合は使わない
        if (text === key) {
          text = null;
        }
      } catch (e) {
        // i18nエラーは無視
      }
    }
    
    // Final fallback to key itself
    if (!text) {
      text = key;
      console.warn(`Translation missing for key: ${key} in language: ${lang}`);
    }
    
    // Replace variables
    return this.replaceVariables(text, variables);
  }

  /**
   * Get pluralized translation
   */
  tp(key, count, variables = {}, language = null) {
    const lang = language || this.currentLanguage;
    const pluralRule = this.pluralRules.get(lang) || this.pluralRules.get(this.fallbackLanguage);
    const pluralIndex = pluralRule ? pluralRule(count) : 0;
    
    const pluralKey = `${key}_${pluralIndex}`;
    const fallbackKey = `${key}_0`;
    
    let text = this.t(pluralKey, { count, ...variables }, lang);
    
    // Fallback to singular form
    if (text === pluralKey) {
      text = this.t(fallbackKey, { count, ...variables }, lang);
    }
    
    // Final fallback to base key
    if (text === fallbackKey) {
      text = this.t(key, { count, ...variables }, lang);
    }
    
    return text;
  }

  /**
   * Replace variables in text
   */
  replaceVariables(text, variables) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables.hasOwnProperty(key) ? variables[key] : match;
    });
  }

  /**
   * Format date
   */
  formatDate(date, format = 'medium', language = null) {
    const lang = language || this.currentLanguage;
    const formatOptions = this.dateFormats.get(lang)?.[format] || this.dateFormats.get(this.fallbackLanguage)?.[format];
    
    if (!formatOptions) {
      return date.toLocaleDateString(lang);
    }
    
    return new Intl.DateTimeFormat(lang, formatOptions).format(date);
  }

  /**
   * Format number
   */
  formatNumber(number, format = 'decimal', language = null) {
    const lang = language || this.currentLanguage;
    const formatOptions = this.numberFormats.get(lang)?.[format] || this.numberFormats.get(this.fallbackLanguage)?.[format];
    
    if (!formatOptions) {
      return number.toLocaleString(lang);
    }
    
    return new Intl.NumberFormat(lang, formatOptions).format(number);
  }

  /**
   * Change language
   */
  async changeLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.error(`Unsupported language: ${language}`);
      return false;
    }

    const previousLanguage = this.currentLanguage;
    this.currentLanguage = language;
    
    try {
      // Load translations if not already loaded
      await this.loadTranslations(language);
      
      // Save to localStorage
      localStorage.setItem('user-language', language);
      
      // Update URL parameter
      const url = new URL(window.location);
      url.searchParams.set('lang', language);
      history.replaceState(null, '', url);
      
      // Apply language settings
      this.applyLanguageSettings();
      
      // Trigger language change event
      this.triggerLanguageChangeEvent(language, previousLanguage);
      
      return true;
    } catch (error) {
      console.error(`Failed to change language to ${language}:`, error);
      this.currentLanguage = previousLanguage;
      return false;
    }
  }

  /**
   * Apply language settings to DOM
   */
  applyLanguageSettings() {
    // Set document language
    document.documentElement.lang = this.currentLanguage;
    
    // Set direction for RTL languages
    if (this.rtlLanguages.includes(this.currentLanguage)) {
      document.documentElement.dir = 'rtl';
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.classList.remove('rtl');
    }
    
    // Update page title if translation exists
    const titleKey = document.querySelector('title')?.dataset.i18nKey;
    if (titleKey) {
      document.title = this.t(titleKey);
    }
    
    // Update all elements with data-i18n
    this.updateTranslatableElements();
  }

  /**
   * Update all translatable elements
   */
  updateTranslatableElements() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.dataset.i18n;
      const variables = this.parseVariables(element.dataset.i18nVariables);
      
      if (element.dataset.i18nPlural !== undefined) {
        const count = parseInt(element.dataset.i18nPlural) || 0;
        element.textContent = this.tp(key, count, variables);
      } else {
        element.textContent = this.t(key, variables);
      }
    });
    
    // Update attributes with data-i18n-*
    const attributeElements = document.querySelectorAll('[data-i18n-title], [data-i18n-placeholder], [data-i18n-alt], [data-i18n-label]');
    
    attributeElements.forEach(element => {
      if (element.dataset.i18nTitle) {
        element.title = this.t(element.dataset.i18nTitle);
      }
      if (element.dataset.i18nPlaceholder) {
        element.placeholder = this.t(element.dataset.i18nPlaceholder);
      }
      if (element.dataset.i18nAlt) {
        element.alt = this.t(element.dataset.i18nAlt);
      }
      if (element.dataset.i18nLabel) {
        element.setAttribute('aria-label', this.t(element.dataset.i18nLabel));
      }
    });
  }

  /**
   * Parse variables from data attribute
   */
  parseVariables(variablesString) {
    if (!variablesString) return {};
    
    try {
      return JSON.parse(variablesString);
    } catch (error) {
      console.warn('Failed to parse i18n variables:', variablesString);
      return {};
    }
  }

  /**
   * Setup language change detection
   */
  setupLanguageChangeDetection() {
    // Listen for browser language changes
    window.addEventListener('languagechange', () => {
      const newLanguage = navigator.language.split('-')[0];
      if (this.supportedLanguages.includes(newLanguage) && newLanguage !== this.currentLanguage) {
        this.changeLanguage(newLanguage);
      }
    });
  }

  /**
   * Trigger language change event
   */
  triggerLanguageChangeEvent(newLanguage, previousLanguage) {
    const event = new CustomEvent('languagechange', {
      detail: {
        newLanguage,
        previousLanguage,
        supportedLanguages: this.supportedLanguages
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  /**
   * Add language support
   */
  addLanguageSupport(language, translations = {}) {
    if (!this.supportedLanguages.includes(language)) {
      this.supportedLanguages.push(language);
    }
    
    this.translations.set(language, { ...this.translations.get(language), ...translations });
  }

  /**
   * Create language selector
   */
  createLanguageSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    
    const selector = document.createElement('select');
    selector.className = 'language-selector';
    selector.setAttribute('aria-label', this.t('a11y.changeLanguage', {}, 'en'));
    
    this.supportedLanguages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = this.getLanguageDisplayName(lang);
      option.selected = lang === this.currentLanguage;
      selector.appendChild(option);
    });
    
    selector.addEventListener('change', (event) => {
      this.changeLanguage(event.target.value);
    });
    
    container.appendChild(selector);
    return selector;
  }

  /**
   * Get language display name
   */
  getLanguageDisplayName(language) {
    const displayNames = {
      ja: '日本語',
      en: 'English',
      vi: 'Tiếng Việt'
    };
    
    return displayNames[language] || language.toUpperCase();
  }

  /**
   * Get translation statistics
   */
  getTranslationStats() {
    const stats = {
      supportedLanguages: this.supportedLanguages.length,
      loadedLanguages: this.translations.size,
      currentLanguage: this.currentLanguage,
      fallbackLanguage: this.fallbackLanguage,
      languageStats: {}
    };
    
    this.translations.forEach((translations, language) => {
      stats.languageStats[language] = {
        keys: Object.keys(translations).length
      };
    });
    
    return stats;
  }

  /**
   * Export translations
   */
  exportTranslations(language = null) {
    if (language) {
      return this.translations.get(language) || {};
    }
    
    const allTranslations = {};
    this.translations.forEach((translations, lang) => {
      allTranslations[lang] = translations;
    });
    
    return allTranslations;
  }
}

// Export singleton instance
export const enhancedI18n = new EnhancedI18n();