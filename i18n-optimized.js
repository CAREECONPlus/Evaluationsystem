/**
 * 最適化されたi18nモジュール
 * 実際に使用されている翻訳キーのみを含む
 */

// JSONファイル読み込み回避モード
const BYPASS_JSON_FILES = true;

// 実際に使用されている翻訳データのみ
const OPTIMIZED_TRANSLATIONS = {
  ja: {
    // アプリケーション基本情報
    "app": {
      "title": "評価管理システム",
      "system_name": "建設業評価管理システム",
      "version": "バージョン"
    },
    
    // ナビゲーション
    "nav": {
      "dashboard": "ダッシュボード",
      "evaluations": "評価一覧", 
      "evaluation": "評価入力",
      "goal_approvals": "目標承認",
      "goal_setting": "目標設定",
      "users": "ユーザー管理",
      "settings": "設定",
      "logout": "ログアウト",
      "help": "ヘルプ",
      "profile": "プロフィール",
      "reports": "レポート",
      "developer": "開発者管理"
    },
    
    // ダッシュボード
    "dashboard": {
      "total_users": "総ユーザー数",
      "completed_evaluations": "完了済み評価",
      "pending_evaluations": "承認待ち評価",
      "recent_evaluations": "最近の評価",
      "no_recent_evaluations": "最近の評価はありません",
      "performance_chart": "パフォーマンスチャート",
      "system_overview": "システム概要と最新の活動状況"
    },

    // 認証関連
    "auth": {
      "login": "ログイン",
      "logout": "ログアウト",
      "email": "メールアドレス",
      "email_label": "メールアドレス",
      "password": "パスワード",
      "password_label": "パスワード",
      "name": "氏名",
      "company": "企業名",
      "confirm_password": "パスワード確認",
      "register": "登録",
      "register_user": "ユーザー登録",
      "register_admin": "管理者アカウント登録",
      "register_admin_link": "管理者アカウントの新規登録はこちら",
      "logging_in": "ログイン中..."
    },
    
    // 評価関連
    "evaluations": {
      "title": "評価一覧",
      "form_title": "評価入力フォーム",
      "new_evaluation": "新規評価",
      "total_score": "総合スコア", 
      "target_user": "評価対象者",
      "period": "評価期間",
      "evaluation_period": "評価期間",
      "target_info": "評価対象情報",
      "confirm_submit": "評価を提出しますか？提出後は編集できません。",
      "evaluator": "評価者"
    },

    // 評価フォーム
    "evaluation": {
      "target": "評価対象者"
    },
    
    // エラーメッセージ
    "errors": {
      "login_failed_generic": "ログインに失敗しました",
      "invalid_email_password": "メールアドレスまたはパスワードが正しくありません",
      "account_inactive": "アカウントが無効です",
      "email_already_in_use": "このメールアドレスは既に使用されています",
      "weak_password": "パスワードが弱すぎます",
      "email_password_required": "メールアドレスとパスワードが必要です",
      "loading_failed": "データの読み込みに失敗しました",
      "access_denied": "アクセスが拒否されました",
      "chart_library_failed": "チャートライブラリの読み込みに失敗しました"
    },
    
    // 共通
    "common": {
      "loading": "読み込み中...",
      "save": "保存",
      "cancel": "キャンセル", 
      "submit": "送信",
      "select": "選択してください",
      "no_data": "データがありません",
      "all": "すべて",
      "refresh": "更新",
      "retry": "再試行",
      "view_all": "すべて表示",
      "details": "詳細",
      "back": "戻る",
      "back_to_login": "ログインページに戻る",
      "save_draft": "下書き保存",
      "actions": "操作",
      "language": "言語",
      "current_status": "現在のステータス",
      "created_at": "登録日"
    },

    // ユーザー管理
    "users": {
      "title": "ユーザー管理",
      "subtitle": "組織内のユーザーを管理します",
      "invite_user": "ユーザーを招待", 
      "role": "役割",
      "status": "ステータス",
      "actions": "操作",
      "total_users": "総ユーザー数",
      "active_users": "アクティブ",
      "pending_users": "承認待ち",
      "admin_users": "管理者",
      "all_status": "すべてのステータス",
      "active": "アクティブ",
      "inactive": "非アクティブ",
      "pending": "承認待ち",
      "all_roles": "すべての役割",
      "edit_user": "ユーザー編集",
      "invitation_message": "招待メッセージ（任意）",
      "send_invitation": "招待を送信"
    },

    // ユーザープロフィール
    "user": {
      "profile": "プロフィール"
    },

    // 目標管理
    "goals": {
      "title": "目標設定",
      "approvals_title": "目標承認",
      "add_goal": "目標を追加",
      "apply": "申請する",
      "approve": "承認",
      "reject": "却下",
      "approved_goals": "承認済み目標",
      "pending_goals": "承認待ち目標",
      "about_goal_setting": "目標設定について",
      "max_goals_info": "最大5つまで設定可能",
      "total_weight_100_info": "重要度の合計は100%にしてください",
      "admin_approval_info": "管理者の承認が必要です",
      "select_evaluation_period": "評価期間を選択",
      "total_weight": "合計重要度",
      "submitted_at": "申請日",
      "confirm_apply": "目標を申請しますか？",
      "confirm_approve": "この目標を承認しますか？",
      "rejection_reason_prompt": "却下理由を入力してください"
    },

    // 設定
    "settings": {
      "title": "システム設定",
      "job_types": "職種管理",
      "evaluation_periods": "評価期間",
      "save_changes": "変更を保存",
      "select_job_type_hint": "左のリストから職種を選択して評価項目を設定してください。"
    },

    // ステータス
    "status": {
      "completed": "完了",
      "approved": "承認済み",
      "pending_approval": "承認待ち"
    },

    // 役割
    "roles": {
      "admin": "管理者",
      "evaluator": "評価者", 
      "worker": "一般ユーザー"
    },

    // メッセージ
    "messages": {
      "save_success": "保存しました",
      "approval_success": "承認しました",
      "rejection_success": "却下しました"
    },

    // ログイン画面
    "login": {
      "lead_text": "建設業の特性に合わせた従業員評価管理システム",
      "sign_in_hint": "アカウント情報を入力してください"
    },

    // 開発者管理
    "developer": {
      "admin_approvals": "管理者承認",
      "tenant_management": "テナント管理"
    },

    // レポート
    "report": {
      "summary": "サマリー",
      "detailed_scores": "詳細スコア", 
      "comparison": "比較",
      "score_comparison": "スコア比較",
      "overall_evaluation": "総合評価",
      "history": "履歴",
      "process_history": "処理履歴"
    }
  },
  
  // 英語翻訳（使用されているキーのみ）
  en: {
    "app": {
      "title": "Evaluation Management System",
      "system_name": "Construction Industry Evaluation Management System"
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
      "login_failed_generic": "Login failed",
      "invalid_email_password": "Invalid email or password",
      "account_inactive": "Account is inactive"
    },
    "common": {
      "loading": "Loading...",
      "save": "Save",
      "cancel": "Cancel",
      "select": "Please select"
    }
  }
};

export class I18n {
  constructor() {
    this.translations = {};
    this.lang = this.getDefaultLanguage();
    this.fallbackLang = 'ja';
    this.isLoading = false;
    this.observers = [];
    
    // 最適化された翻訳データを即座に読み込み
    this.loadOptimizedTranslations();
  }

  /**
   * 最適化された翻訳データの読み込み
   */
  loadOptimizedTranslations() {
    Object.keys(OPTIMIZED_TRANSLATIONS).forEach(lang => {
      this.translations[lang] = OPTIMIZED_TRANSLATIONS[lang];
    });
  }

  /**
   * UIの更新オブザーバーを追加
   */
  addObserver(callback) {
    this.observers.push(callback);
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
      this.updateUI();
      return true;
    } catch (error) {
      console.error("I18n: Initialization failed:", error);
      return false;
    }
  }

  /**
   * デフォルト言語の取得
   */
  getDefaultLanguage() {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && this.isValidLanguage(savedLang)) {
      return savedLang;
    }

    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const primaryLang = browserLang.split('-')[0];
      if (this.isValidLanguage(primaryLang)) {
        return primaryLang;
      }
    }

    return 'ja';
  }

  /**
   * 有効な言語コードかチェック
   */
  isValidLanguage(lang) {
    const supportedLanguages = ['ja', 'en'];
    return supportedLanguages.includes(lang);
  }

  /**
   * 言語の設定
   */
  async setLanguage(lang) {
    if (!this.isValidLanguage(lang)) {
      return false;
    }
    
    this.lang = lang;
    localStorage.setItem('app_language', lang);
    this.updateUI();
    this.notifyObservers();
    
    return true;
  }

  /**
   * 翻訳の取得
   */
  t(key, params = {}) {
    if (!key) {
      return key;
    }

    try {
      let translation = this.getTranslationFromLang(key, this.lang);
      
      if (translation === key && this.lang !== this.fallbackLang) {
        translation = this.getTranslationFromLang(key, this.fallbackLang);
      }
      
      if (params && Object.keys(params).length > 0) {
        translation = this.interpolate(translation, params);
      }
      
      return translation;
      
    } catch (error) {
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

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
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
      let updatedCount = 0;
      
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && !key.includes('${')) { // テンプレート変数を除外
          const translation = this.t(key);
          
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
          }
        }
      });

      // data-i18n-title属性を持つ要素
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
   * 動的要素の翻訳更新
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
   * サポートされている言語一覧
   */
  getSupportedLanguages() {
    return [
      { code: 'ja', name: '日本語' },
      { code: 'en', name: 'English' }
    ];
  }

  /**
   * 翻訳データが読み込まれているかチェック
   */
  isLanguageLoaded(lang) {
    return !!(this.translations[lang] && Object.keys(this.translations[lang]).length > 0);
  }

  /**
   * 自動翻訳の有効化
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
  }

  /**
   * 自動翻訳の無効化
   */
  disableAutoTranslation() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    this.disableAutoTranslation();
    this.observers = [];
  }
}

// グローバルに公開
window.I18n = I18n;