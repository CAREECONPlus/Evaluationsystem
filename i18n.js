/**
 * Internationalization (i18n) Module - Complete Fixed Version
 * 国際化対応モジュール - 完全修正版（日本語翻訳強化・JSONエラー回避）
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
      "users": "ユーザー管理",
      "settings": "設定",
      "logout": "ログアウト",
      "home": "ホーム",
      "profile": "プロフィール",
      "help": "ヘルプ",
      "about": "このシステムについて"
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
      "support": "サポート"
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

    // ===== ナビゲーション翻訳 =====
    "navigation": {
      "home": "ホーム",
      "menu": "メニュー",
      "back": "戻る",
      "next": "次へ",
      "previous": "前へ",
      "first": "最初",
      "last": "最後",
      "goto": "移動",
      "breadcrumb": "パンくずリスト",
      "sidebar": "サイドバー",
      "header": "ヘッダー",
      "footer": "フッター",
      "main": "メイン",
      "content": "コンテンツ"
    },
    
    // ===== フォーム翻訳 =====
    "forms": {
      "name": "名前",
      "first_name": "名",
      "last_name": "姓",
      "email": "メールアドレス",
      "phone": "電話番号",
      "company": "会社名",
      "department": "部署",
      "position": "役職",
      "role": "役割",
      "status": "ステータス",
      "created_at": "作成日",
      "updated_at": "更新日",
      "description": "説明",
      "notes": "備考",
      "comments": "コメント",
      "address": "住所",
      "city": "市区町村",
      "state": "都道府県",
      "postal_code": "郵便番号",
      "country": "国",
      "date": "日付",
      "time": "時刻",
      "datetime": "日時",
      "category": "カテゴリ",
      "type": "種類",
      "priority": "優先度",
      "tags": "タグ",
      "keywords": "キーワード",
      "title": "タイトル",
      "subject": "件名",
      "message": "メッセージ",
      "content": "内容",
      "url": "URL",
      "link": "リンク",
      "file": "ファイル",
      "image": "画像",
      "document": "文書"
    },
    
    // ===== ステータス翻訳 =====
    "statuses": {
      "active": "アクティブ",
      "inactive": "非アクティブ",
      "enabled": "有効",
      "disabled": "無効",
      "online": "オンライン",
      "offline": "オフライン",
      "pending": "保留中",
      "approved": "承認済み",
      "rejected": "拒否",
      "draft": "下書き",
      "published": "公開済み",
      "completed": "完了",
      "in_progress": "進行中",
      "cancelled": "キャンセル",
      "suspended": "停止中",
      "archived": "アーカイブ済み",
      "deleted": "削除済み",
      "new": "新規",
      "open": "開く",
      "closed": "閉じる",
      "resolved": "解決済み",
      "unresolved": "未解決"
    },
    
    // ===== メッセージ翻訳 =====
    "messages": {
      "success": "操作が正常に完了しました",
      "error": "エラーが発生しました",
      "warning": "注意が必要です",
      "info": "情報",
      "confirm": "この操作を実行してもよろしいですか？",
      "confirm_delete": "本当に削除してもよろしいですか？この操作は取り消せません。",
      "confirm_save": "変更を保存しますか？",
      "confirm_cancel": "変更を破棄してもよろしいですか？",
      "no_data": "データがありません",
      "loading": "読み込み中...",
      "saving": "保存中...",
      "deleting": "削除中...",
      "processing": "処理中...",
      "uploading": "アップロード中...",
      "downloading": "ダウンロード中...",
      "connecting": "接続中...",
      "searching": "検索中...",
      "updating": "更新中...",
      "creating": "作成中...",
      "please_wait": "お待ちください...",
      "operation_completed": "操作が完了しました",
      "operation_failed": "操作が失敗しました",
      "changes_saved": "変更が保存されました",
      "changes_discarded": "変更が破棄されました",
      "item_created": "項目が作成されました",
      "item_updated": "項目が更新されました",
      "item_deleted": "項目が削除されました",
      "welcome_back": "おかえりなさい",
      "goodbye": "ありがとうございました"
    },
    
    // ===== バリデーション翻訳 =====
    "validation": {
      "required": "この項目は必須です",
      "email_invalid": "正しいメールアドレスを入力してください",
      "password_min_length": "パスワードは6文字以上で入力してください",
      "password_max_length": "パスワードは128文字以下で入力してください",
      "name_min_length": "名前は2文字以上で入力してください",
      "name_max_length": "名前は50文字以下で入力してください",
      "phone_invalid": "正しい電話番号を入力してください",
      "url_invalid": "正しいURLを入力してください",
      "numeric_only": "数字のみ入力してください",
      "alpha_only": "文字のみ入力してください",
      "alphanumeric_only": "英数字のみ入力してください",
      "min_length": "{{min}}文字以上で入力してください",
      "max_length": "{{max}}文字以下で入力してください",
      "min_value": "{{min}}以上の値を入力してください",
      "max_value": "{{max}}以下の値を入力してください",
      "password_mismatch": "パスワードが一致しません",
      "file_too_large": "ファイルサイズが大きすぎます",
      "file_type_invalid": "対応していないファイル形式です",
      "date_invalid": "正しい日付を入力してください",
      "time_invalid": "正しい時刻を入力してください"
    },
    
    // ===== 日付・時刻翻訳 =====
    "date": {
      "today": "今日",
      "yesterday": "昨日",
      "tomorrow": "明日",
      "this_week": "今週",
      "last_week": "先週",
      "next_week": "来週",
      "this_month": "今月",
      "last_month": "先月",
      "next_month": "来月",
      "this_year": "今年",
      "last_year": "昨年",
      "next_year": "来年",
      "january": "1月",
      "february": "2月",
      "march": "3月",
      "april": "4月",
      "may": "5月",
      "june": "6月",
      "july": "7月",
      "august": "8月",
      "september": "9月",
      "october": "10月",
      "november": "11月",
      "december": "12月",
      "monday": "月曜日",
      "tuesday": "火曜日",
      "wednesday": "水曜日",
      "thursday": "木曜日",
      "friday": "金曜日",
      "saturday": "土曜日",
      "sunday": "日曜日"
    },
    
    "time": {
      "morning": "午前",
      "afternoon": "午後",
      "evening": "夕方",
      "night": "夜",
      "hour": "時",
      "minute": "分",
      "second": "秒",
      "millisecond": "ミリ秒",
      "am": "午前",
      "pm": "午後",
      "timezone": "タイムゾーン",
      "now": "現在",
      "ago": "前",
      "later": "後",
      "duration": "期間"
    },

    // ===== 役割翻訳 =====
    "roles": {
      "admin": "管理者",
      "user": "ユーザー",
      "moderator": "モデレーター",
      "editor": "編集者",
      "viewer": "閲覧者",
      "guest": "ゲスト",
      "developer": "開発者",
      "evaluator": "評価者",
      "worker": "作業員",
      "supervisor": "監督者",
      "manager": "管理者"
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
    this.fallbackLang = 'en';
    this.isLoading = false;
    this.loadPromises = new Map();
    
    console.log("I18n: Initialized with language:", this.lang, "(Built-in mode:", BYPASS_JSON_FILES, ")");
    
    // 内蔵翻訳データを即座に読み込み
    if (BYPASS_JSON_FILES) {
      this.loadBuiltInTranslations();
    }
  }

  /**
   * 内蔵翻訳データの読み込み
   */
  loadBuiltInTranslations() {
    console.log("I18n: Loading built-in translations...");
    
    Object.keys(BUILT_IN_TRANSLATIONS).forEach(lang => {
      this.translations[lang] = BUILT_IN_TRANSLATIONS[lang];
      console.log(`I18n: Built-in translations loaded for ${lang}`);
    });
    
    console.log("I18n: All built-in translations loaded successfully");
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
        console.log("I18n: Initialization completed (built-in mode)");
        return true;
      } else {
        // JSONファイルから読み込み
        await this.loadTranslations(this.lang);
        
        if (this.lang !== this.fallbackLang) {
          await this.loadTranslations(this.fallbackLang);
        }
        
        console.log("I18n: Initialization completed (file mode)");
        return true;
      }
      
    } catch (error) {
      console.error("I18n: Initialization failed:", error);
      
      // 緊急時の処理
      console.log("I18n: Falling back to built-in translations");
      this.loadBuiltInTranslations();
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
      
      console.log(`I18n: Language successfully set to ${lang}`);
      return true;
      
    } catch (error) {
      console.error(`I18n: Failed to set language to ${lang}:`, error);
      return false;
    }
  }

  /**
   * 翻訳の取得
   */
  t(key, params = {}) {
    if (!key) return key;

    try {
      // 現在の言語から取得を試行
      let translation = this.getTranslationFromLang(key, this.lang);
      
      // 見つからない場合はフォールバック言語から取得
      if (translation === key && this.lang !== this.fallbackLang) {
        translation = this.getTranslationFromLang(key, this.fallbackLang);
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
   * 指定言語から翻訳を取得
   */
  getTranslationFromLang(key, lang) {
    const translations = this.translations[lang];
    if (!translations) {
      return key;
    }

    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
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
   * UI要素の更新
   */
  updateUI(container = document) {
    try {
      const elements = container.querySelectorAll('[data-i18n]');
      
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
          const translation = this.t(key);
          
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.type === 'submit' || element.type === 'button') {
              element.value = translation;
            } else {
              element.placeholder = translation;
            }
          } else {
            element.textContent = translation;
          }
        }
      });

      const titleElements = container.querySelectorAll('[data-i18n-title]');
      titleElements.forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (key) {
          element.title = this.t(key);
        }
      });

      console.log(`I18n: Updated ${elements.length + titleElements.length} UI elements`);
      
    } catch (error) {
      console.error('I18n: Error updating UI:', error);
    }
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
      console.log('  dashboard.pending_evaluations:', this.t('dashboard.pending_evaluations'));
    }
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    this.loadPromises.clear();
    console.log('I18n: Cleaned up');
  }
}
