/**
 * Internationalization (i18n) Module - Enhanced Fixed Version
 * 国際化対応モジュール - 強化修正版
 */

// JSONファイル読み込み回避モード（trueでJSONファイルを無視して内蔵データを使用）
const BYPASS_JSON_FILES = true;

// 内蔵翻訳データ（完全な日本語翻訳付き）
const BUILT_IN_TRANSLATIONS = {
  ja: {
    "app": {
      "title": "評価管理システム",
      "system_name": "建設業評価管理システム",
      "loading": "読み込み中...",
      "welcome": "ようこそ",
      "version": "バージョン",
      "copyright": "著作権"
    },
    
    // ===== ナビゲーション翻訳 =====
    "nav": {
      "dashboard": "ダッシュボード",
      "evaluations": "評価一覧",
      "evaluation": "評価入力",
      "goal_approvals": "目標承認",
      "goal_setting": "目標設定",
      "users": "ユーザー管理",
      "settings": "設定",
      "logout": "ログアウト",
      "home": "ホーム",
      "profile": "プロフィール",
      "help": "ヘルプ",
      "about": "このシステムについて",
      "reports": "レポート",
      "developer": "開発者管理"
    },
    
    // ===== ダッシュボード翻訳 =====
    "dashboard": {
      "title": "ダッシュボード",
      "overview": "システム概要",
      "total_users": "総ユーザー数",
      "active_users": "アクティブユーザー",
      "completed_evaluations": "完了済み評価",
      "pending_evaluations": "保留中評価",
      "recent_evaluations": "最近の評価",
      "no_recent_evaluations": "最近の評価はありません",
      "performance_chart": "パフォーマンスチャート",
      "statistics": "統計情報",
      "user_activity": "ユーザー活動",
      "system_status": "システム状況",
      "evaluation_progress": "評価進捗",
      "monthly_stats": "月間統計",
      "total_goals": "総目標数",
      "completed_goals": "完了済み目標"
    },

    // ===== 認証関連翻訳 =====
    "auth": {
      "login": "ログイン",
      "logout": "ログアウト",
      "email": "メールアドレス",
      "password": "パスワード",
      "remember_me": "ログイン状態を保持する",
      "forgot_password": "パスワードを忘れた方",
      "register": "新規登録",
      "sign_in": "サインイン",
      "sign_out": "サインアウト",
      "sign_up": "サインアップ"
    },
    
    // ===== 評価関連翻訳 =====
    "evaluations": {
      "title": "評価一覧",
      "form_title": "評価フォーム",
      "new_evaluation": "新規評価",
      "total_score": "総合スコア",
      "target_user": "評価対象者",
      "period": "評価期間",
      "evaluation_period": "評価期間",
      "target_info": "評価対象情報",
      "confirm_submit": "評価を提出しますか？提出後は編集できません。",
      "evaluator": "評価者"
    },

    "evaluation": {
      "title": "評価入力",
      "self_assessment": "自己評価",
      "evaluator_assessment": "評価者評価",
      "score": "スコア",
      "comment": "コメント",
      "submit": "提出",
      "period": "評価期間",
      "target": "評価対象者",
      "evaluator": "評価者",
      "category": "カテゴリ",
      "item": "評価項目",
      "job_type": "職種",
      "target_info": "評価対象情報",
      "select_target_user": "評価対象者を選択してください",
      "select_period": "評価期間を選択してください",
      "goal_achievement": "目標達成度評価",
      "no_goals_set": "評価対象の目標が設定されていません。",
      "confirm_submit": "評価を提出しますか？提出後は編集できません。",
      "self_assessment_score": "自己評価点",
      "evaluator_assessment_score": "評価者評価点"
    },
    
    // ===== エラーメッセージ翻訳 =====
    "errors": {
      "login_failed": "ログインに失敗しました",
      "invalid_email_password": "メールアドレスまたはパスワードが正しくありません",
      "account_inactive": "アカウントが無効です",
      "email_already_in_use": "このメールアドレスは既に使用されています",
      "weak_password": "パスワードが弱すぎます",
      "login_failed_generic": "ログインに失敗しました",
      "network_error": "ネットワークエラーが発生しました",
      "permission_denied": "権限がありません",
      "not_found": "データが見つかりません",
      "validation_failed": "入力内容に問題があります",
      "server_error": "サーバーエラーが発生しました",
      "timeout": "タイムアウトしました",
      "connection_failed": "接続に失敗しました",
      "invalid_data": "無効なデータです",
      "unauthorized": "認証が必要です",
      "forbidden": "アクセスが拒否されました"
    },
    
    // ===== ボタン翻訳 =====
    "buttons": {
      "login": "ログイン",
      "logout": "ログアウト",
      "save": "保存",
      "cancel": "キャンセル",
      "edit": "編集",
      "delete": "削除",
      "add": "追加",
      "create": "作成",
      "update": "更新",
      "remove": "削除",
      "close": "閉じる",
      "submit": "送信",
      "reset": "リセット",
      "clear": "クリア",
      "search": "検索",
      "filter": "フィルター",
      "sort": "並べ替え",
      "export": "エクスポート",
      "import": "インポート",
      "download": "ダウンロード",
      "upload": "アップロード",
      "back": "戻る",
      "next": "次へ",
      "previous": "前へ",
      "first": "最初",
      "last": "最後",
      "confirm": "確認",
      "ok": "OK",
      "yes": "はい",
      "no": "いいえ",
      "apply": "適用",
      "refresh": "更新",
      "reload": "再読み込み",
      "copy": "コピー",
      "paste": "貼り付け",
      "cut": "切り取り",
      "select_all": "全選択",
      "view": "表示",
      "preview": "プレビュー",
      "print": "印刷"
    },
    
    // ===== ページ翻訳 =====
    "pages": {
      "dashboard": "ダッシュボード",
      "users": "ユーザー管理",
      "evaluations": "評価一覧",
      "settings": "設定",
      "reports": "レポート",
      "profile": "プロフィール",
      "help": "ヘルプ",
      "about": "このシステムについて",
      "home": "ホーム",
      "admin": "管理者",
      "user_management": "ユーザー管理",
      "evaluation_management": "評価管理",
      "system_settings": "システム設定",
      "account": "アカウント",
      "security": "セキュリティ",
      "notifications": "通知",
      "preferences": "設定",
      "history": "履歴",
      "logs": "ログ"
    },
    
    // ===== 共通翻訳 =====
    "common": {
      "language": "言語",
      "account": "アカウント",
      "demo_account": "デモアカウント",
      "administrator": "管理者",
      "management": "管理",
      "system": "システム",
      "profile": "プロフィール",
      "settings": "設定",
      "support": "サポート",
      "save": "保存",
      "cancel": "キャンセル",
      "delete": "削除",
      "edit": "編集",
      "add": "追加",
      "search": "検索",
      "loading": "読み込み中...",
      "error": "エラー",
      "success": "成功",
      "confirm": "確認",
      "yes": "はい",
      "no": "いいえ",
      "close": "閉じる",
      "submit": "送信",
      "reset": "リセット",
      "back": "戻る",
      "next": "次へ",
      "previous": "前へ",
      "select": "選択してください",
      "clear": "クリア"
    },

    // ===== ユーザー関連翻訳 =====
    "user": {
      "profile": "プロフィール",
      "account_info": "アカウント情報",
      "demo_account": "デモアカウント",
      "administrator": "管理者",
      "evaluator": "評価者",
      "worker": "作業員",
      "manager": "管理者",
      "supervisor": "監督者"
    },

    // ===== ユーザー管理 =====
    "users": {
      "title": "ユーザー管理",
      "invite": "新規ユーザー招待",
      "role": "役割",
      "status": "ステータス",
      "created_at": "登録日",
      "actions": "操作"
    },

    // ===== 目標管理 =====
    "goals": {
      "title": "目標設定",
      "approvals_title": "目標承認"
    },

    // ===== 設定 =====
    "settings": {
      "title": "設定"
    },

    // ===== 開発者管理 =====
    "developer": {
      "title": "開発者管理"
    },

    // ===== ステータス =====
    "status": {
      "active": "アクティブ",
      "inactive": "非アクティブ",
      "pending": "保留中",
      "completed": "完了"
    },

    // ===== 役割 =====
    "roles": {
      "admin": "管理者",
      "user": "ユーザー",
      "developer": "開発者",
      "evaluator": "評価者",
      "worker": "作業員"
    },

    // ===== メッセージ =====
    "messages": {
      "success": "操作が正常に完了しました",
      "error": "エラーが発生しました",
      "loading": "読み込み中...",
      "no_data": "データがありません"
    },

    // ===== フォーム =====
    "forms": {
      "name": "名前",
      "email": "メールアドレス",
      "password": "パスワード",
      "confirm_password": "パスワード確認"
    }
  },
  
  // 英語翻訳
  en: {
    "app": {
      "title": "Evaluation Management System",
      "system_name": "Construction Industry Evaluation Management System",
      "loading": "Loading...",
      "welcome": "Welcome"
    },
    "nav": {
      "dashboard": "Dashboard",
      "evaluations": "Evaluations",
      "evaluation": "Evaluation Form",
      "goal_approvals": "Goal Approvals",
      "users": "User Management",
      "settings": "Settings",
      "logout": "Logout"
    },
    "dashboard": {
      "title": "Dashboard",
      "total_users": "Total Users",
      "completed_evaluations": "Completed Evaluations",
      "pending_evaluations": "Pending Evaluations",
      "recent_evaluations": "Recent Evaluations",
      "no_recent_evaluations": "No recent evaluations",
      "performance_chart": "Performance Chart"
    },
    "auth": {
      "login": "Login",
      "logout": "Logout",
      "email": "Email Address",
      "password": "Password"
    },
    "errors": {
      "login_failed": "Login failed",
      "invalid_email_password": "Invalid email or password",
      "account_inactive": "Account is inactive"
    },
    "buttons": {
      "login": "Login",
      "logout": "Logout",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete"
    },
    "pages": {
      "dashboard": "Dashboard",
      "users": "User Management",
      "evaluations": "Evaluations",
      "settings": "Settings"
    },
    "common": {
      "language": "Language",
      "account": "Account",
      "profile": "Profile"
    }
  }
};

export class I18n {
  constructor() {
    this.translations = {};
    this.lang = this.getDefaultLanguage();
    this.fallbackLang = 'ja'; // 日本語をデフォルトに
    this.isLoading = false;
    this.loadPromises = new Map();
    this.observers = []; // UIの更新を監視するオブザーバー
    
    console.log("I18n: Initialized with language:", this.lang, "(Built-in mode:", BYPASS_JSON_FILES, ")");
    
    // 内蔵翻訳データを即座に読み込み
    this.loadBuiltInTranslations();
  }

  /**
   * 内蔵翻訳データの読み込み
   */
  loadBuiltInTranslations() {
    console.log("I18n: Loading built-in translations...");
    
    Object.keys(BUILT_IN_TRANSLATIONS).forEach(lang => {
      this.translations[lang] = BUILT_IN_TRANSLATIONS[lang];
      console.log(`I18n: Built-in translations loaded for ${lang}`, 
        Object.keys(this.translations[lang]).length, "sections");
    });
    
    console.log("I18n: All built-in translations loaded successfully");
  }

  /**
   * UIの更新オブザーバーを追加
   */
  addObserver(callback) {
    this.observers.push(callback);
  }

  /**
   * UIの更新オブザーバーを削除
   */
  removeObserver(callback) {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * すべてのオブザーバーに通知
   */
  notifyObservers() {
    this.observers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn("I18n: Observer callback error:", error);
      }
    });
  }

  /**
   * システム初期化
   */
  async init() {
    try {
      console.log("I18n: Starting initialization...");
      
      if (BYPASS_JSON_FILES) {
        // 内蔵翻訳を使用
        this.loadBuiltInTranslations();
        
        // 初期化後にUIを更新
        this.updateUI();
        
        console.log("I18n: Initialization completed (built-in mode)");
        return true;
      } else {
        // JSONファイルから読み込み
        await this.loadTranslations(this.lang);
        
        if (this.lang !== this.fallbackLang) {
          await this.loadTranslations(this.fallbackLang);
        }
        
        // 初期化後にUIを更新
        this.updateUI();
        
        console.log("I18n: Initialization completed (file mode)");
        return true;
      }
      
    } catch (error) {
      console.error("I18n: Initialization failed:", error);
      
      // 緊急時の処理
      console.log("I18n: Falling back to built-in translations");
      this.loadBuiltInTranslations();
      this.updateUI();
      return false;
    }
  }

  /**
   * デフォルト言語の取得
   */
  getDefaultLanguage() {
    // 1. ローカルストレージから取得
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && this.isValidLanguage(savedLang)) {
      return savedLang;
    }

    // 2. ブラウザ言語から推測
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const primaryLang = browserLang.split('-')[0];
      if (this.isValidLanguage(primaryLang)) {
        return primaryLang;
      }
    }

    // 3. デフォルトは日本語
    return 'ja';
  }

  /**
   * 有効な言語コードかチェック
   */
  isValidLanguage(lang) {
    const supportedLanguages = ['ja', 'en', 'vi'];
    return supportedLanguages.includes(lang);
  }

  /**
   * 翻訳ファイルの読み込み
   */
  async loadTranslations(lang) {
    if (!lang || !this.isValidLanguage(lang)) {
      console.warn(`I18n: Invalid language code: ${lang}`);
      lang = this.fallbackLang;
    }

    // 内蔵翻訳モードの場合
    if (BYPASS_JSON_FILES) {
      if (BUILT_IN_TRANSLATIONS[lang]) {
        this.translations[lang] = BUILT_IN_TRANSLATIONS[lang];
        console.log(`I18n: Built-in translations loaded for ${lang}`);
        return this.translations[lang];
      } else {
        console.warn(`I18n: No built-in translations for ${lang}, using fallback`);
        this.translations[lang] = BUILT_IN_TRANSLATIONS[this.fallbackLang];
        return this.translations[lang];
      }
    }

    // 既に読み込み済みの場合はスキップ
    if (this.translations[lang]) {
      console.log(`I18n: Translations for ${lang} already loaded`);
      return this.translations[lang];
    }

    // JSONファイルモード（フォールバック）
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (response.ok) {
        const translations = await response.json();
        this.translations[lang] = translations;
        return translations;
      }
    } catch (error) {
      console.warn(`I18n: Failed to load JSON file for ${lang}, using built-in`);
    }

    // 最終フォールバック：内蔵翻訳を使用
    const fallbackTranslations = BUILT_IN_TRANSLATIONS[lang] || BUILT_IN_TRANSLATIONS[this.fallbackLang];
    this.translations[lang] = fallbackTranslations;
    return fallbackTranslations;
  }

  /**
   * 言語の設定
   */
  async setLanguage(lang) {
    if (!this.isValidLanguage(lang)) {
      console.warn(`I18n: Invalid language: ${lang}`);
      return false;
    }

    console.log(`I18n: Setting language to ${lang}`);
    
    try {
      // 翻訳データを読み込み
      await this.loadTranslations(lang);
      
      // 言語を設定
      this.lang = lang;
      
      // ローカルストレージに保存
      localStorage.setItem('app_language', lang);
      
      // UIを更新
      this.updateUI();
      
      // オブザーバーに通知
      this.notifyObservers();
      
      console.log(`I18n: Language successfully set to ${lang}`);
      return true;
      
    } catch (error) {
      console.error(`I18n: Failed to set language to ${lang}:`, error);
      return false;
    }
  }

  /**
   * 翻訳の取得（改良版）
   */
  t(key, params = {}) {
    if (!key) {
      console.warn("I18n: Empty translation key provided");
      return key;
    }

    try {
      // 現在の言語から取得を試行
      let translation = this.getTranslationFromLang(key, this.lang);
      
      // 見つからない場合はフォールバック言語から取得
      if (translation === key && this.lang !== this.fallbackLang) {
        translation = this.getTranslationFromLang(key, this.fallbackLang);
        
        // フォールバックでも見つからない場合は警告
        if (translation === key) {
          console.warn(`I18n: Translation key not found: '${key}'`);
        }
      }
      
      // パラメータの置換
      if (params && Object.keys(params).length > 0) {
        translation = this.interpolate(translation, params);
      }
      
      return translation;
      
    } catch (error) {
      console.warn(`I18n: Translation error for key '${key}':`, error);
      return key;
    }
  }

  /**
   * 指定言語から翻訳を取得（改良版）
   */
  getTranslationFromLang(key, lang) {
    const translations = this.translations[lang];
    if (!translations) {
      console.warn(`I18n: No translations loaded for language '${lang}'`);
      return key;
    }

    const keys = key.split('.');
    let value = translations;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // デバッグ用：どこで失敗したかを記録
        console.debug(`I18n: Translation path broken at '${keys.slice(0, i + 1).join('.')}' for key '${key}'`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  /**
   * パラメータの補間
   */
  interpolate(text, params) {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params.hasOwnProperty(key) ? params[key] : match;
    });
  }

  /**
   * UI要素の更新（改良版）
   */
  updateUI(container = document) {
    try {
      // data-i18n属性を持つ要素を検索
      const elements = container.querySelectorAll('[data-i18n]');
      let updatedCount = 0;
      
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
          const translation = this.t(key);
          
          // 翻訳が見つかった場合のみ更新
          if (translation !== key) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
              if (element.type === 'submit' || element.type === 'button') {
                element.value = translation;
              } else {
                element.placeholder = translation;
              }
            } else {
              element.textContent = translation;
            }
            updatedCount++;
          } else {
            // 翻訳が見つからない場合はデバッグログを出力
            console.debug(`I18n: No translation found for element with key '${key}'`);
          }
        }
      });

      // data-i18n-title属性を持つ要素を検索
      const titleElements = container.querySelectorAll('[data-i18n-title]');
      titleElements.forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (key) {
          const translation = this.t(key);
          if (translation !== key) {
            element.title = translation;
            updatedCount++;
          }
        }
      });

      console.log(`I18n: Updated ${updatedCount} UI elements out of ${elements.length + titleElements.length} found`);
      
      // ページタイトルも更新
      this.updatePageTitle();
      
    } catch (error) {
      console.error('I18n: Error updating UI:', error);
    }
  }

  /**
   * ページタイトルの更新
   */
  updatePageTitle() {
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.dataset.i18n) {
      const key = titleElement.dataset.i18n;
      const translation = this.t(key);
      if (translation !== key) {
        titleElement.textContent = translation;
      }
    }
  }

  /**
   * 動的に追加された要素の翻訳を更新
   */
  updateElement(element) {
    if (!element) return;
    
    this.updateUI(element);
  }

  /**
   * 現在の言語を取得
   */
  getCurrentLanguage() {
    return this.lang;
  }

  /**
   * サポートされている言語一覧を取得
   */
  getSupportedLanguages() {
    return [
      { code: 'ja', name: '日本語' },
      { code: 'en', name: 'English' },
      { code: 'vi', name: 'Tiếng Việt' }
    ];
  }

  /**
   * 翻訳データが読み込まれているかチェック
   */
  isLanguageLoaded(lang) {
    return !!(this.translations[lang] && Object.keys(this.translations[lang]).length > 0);
  }

  /**
   * 自動翻訳の有効化（MutationObserver使用）
   */
  enableAutoTranslation() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.updateUI(node);
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log("I18n: Auto translation enabled");
  }

  /**
   * 自動翻訳の無効化
   */
  disableAutoTranslation() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log("I18n: Auto translation disabled");
    }
  }

  /**
   * デバッグ用：読み込まれている翻訳データを表示
   */
  debug() {
    console.log('I18n Debug Info:');
    console.log('Built-in mode:', BYPASS_JSON_FILES);
    console.log('Current language:', this.lang);
    console.log('Fallback language:', this.fallbackLang);
    console.log('Loaded languages:', Object.keys(this.translations));
    console.log('Available built-in languages:', Object.keys(BUILT_IN_TRANSLATIONS));
    
    if (this.translations[this.lang]) {
      const keys = Object.keys(this.translations[this.lang]);
      console.log(`Translation sections for ${this.lang}:`, keys);
      console.log('Sample translations:');
      console.log('  nav.dashboard:', this.t('nav.dashboard'));
      console.log('  dashboard.total_users:', this.t('dashboard.total_users'));
      console.log('  evaluations.form_title:', this.t('evaluations.form_title'));
      console.log('  evaluations.target_info:', this.t('evaluations.target_info'));
    }
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    this.disableAutoTranslation();
    this.loadPromises.clear();
    this.observers = [];
    console.log('I18n: Cleaned up');
  }
}

// グローバルに公開
window.I18n = I18n;
