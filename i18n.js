/**
 * Unified Internationalization System
 * 統合国際化システム - 最適化版
 */

// 内蔵翻訳データ（日本語・英語・ベトナム語対応）
const TRANSLATIONS = {
  ja: {
    // ===== アプリケーション基本 =====
    app: {
      title: "評価管理システム",
      system_name: "建設業評価管理システム",
      loading: "読み込み中...",
      welcome: "ようこそ",
      version: "バージョン"
    },
    
    // ===== ナビゲーション =====
    nav: {
      dashboard: "ダッシュボード",
      evaluations: "評価一覧", 
      evaluation: "評価入力",
      goals: "目標設定",
      users: "ユーザー管理",
      settings: "設定",
      logout: "ログアウト",
      reports: "レポート"
    },

    // ===== ダッシュボード =====
    dashboard: {
      title: "ダッシュボード",
      total_users: "総ユーザー数",
      active_users: "アクティブユーザー",
      completed_evaluations: "完了済み評価",
      recent_evaluations: "最近の評価",
      system_stats: "システム統計"
    },

    // ===== 認証関連 =====
    auth: {
      login: "ログイン",
      logout: "ログアウト",
      email: "メールアドレス",
      password: "パスワード",
      login_button: "ログイン",
      login_error: "ログインに失敗しました",
      temp_auth_notice: "一時認証システムでログインしました",
      demo_accounts: "デモアカウント",
      quick_fill: "自動入力"
    },

    // ===== ユーザー管理 =====
    users: {
      title: "ユーザー管理",
      add_user: "新規ユーザー追加",
      edit_user: "ユーザー編集",
      delete_user: "ユーザー削除",
      name: "名前",
      email: "メールアドレス",
      role: "役割",
      status: "ステータス",
      active: "アクティブ",
      inactive: "非アクティブ"
    },

    // ===== 評価システム =====
    evaluations: {
      title: "評価システム",
      new_evaluation: "新規評価",
      edit_evaluation: "評価編集",
      target_user: "評価対象者",
      evaluator: "評価者",
      score: "スコア",
      comments: "コメント",
      technical_skills: "技術力",
      communication: "コミュニケーション",
      leadership: "リーダーシップ",
      problem_solving: "問題解決能力",
      safety_awareness: "安全意識",
      period: "評価期間",
      updated_at: "更新日時",
      assignment_status: "割当状況"
    },

    // ===== 評価フォーム =====
    evaluation: {
      target: "評価対象者"
    },

    // ===== ステータス =====
    status: {
      title: "ステータス",
      pending: "保留中",
      in_progress: "進行中",
      completed: "完了",
      draft: "下書き"
    },

    // ===== レポート =====
    report: {
      summary: "サマリー",
      comparison: "比較",
      history: "履歴",
      overall_evaluation: "総合評価",
      detailed_scores: "詳細スコア",
      score_comparison: "スコア比較",
      process_history: "処理履歴"
    },

    // ===== 目標設定 =====
    goals: {
      title: "目標設定",
      apply: "適用",
      about_goal_setting: "目標設定について",
      max_goals_info: "最大5つの目標を設定できます",
      total_weight_100_info: "目標の合計ウェイトは100%になる必要があります",
      admin_approval_info: "目標は管理者の承認が必要です",
      select_evaluation_period: "評価期間を選択",
      add_goal: "目標を追加",
      total_weight: "合計ウェイト"
    },

    // ===== 共通UI要素 =====
    common: {
      save: "保存",
      cancel: "キャンセル",
      edit: "編集",
      delete: "削除",
      confirm: "確認",
      yes: "はい",
      no: "いいえ",
      close: "閉じる",
      search: "検索",
      filter: "フィルター",
      sort: "ソート",
      refresh: "更新",
      export: "エクスポート",
      import: "インポート",
      back: "戻る"
    },

    // ===== エラー・メッセージ =====
    messages: {
      save_success: "保存しました",
      save_error: "保存に失敗しました",
      delete_success: "削除しました",
      delete_error: "削除に失敗しました",
      network_error: "ネットワークエラーが発生しました",
      loading_error: "データの読み込みに失敗しました",
      validation_error: "入力内容を確認してください"
    }
  },

  en: {
    app: {
      title: "Evaluation Management System",
      system_name: "Construction Industry Evaluation System",
      loading: "Loading...",
      welcome: "Welcome",
      version: "Version"
    },
    
    nav: {
      dashboard: "Dashboard",
      evaluations: "Evaluations",
      evaluation: "New Evaluation", 
      goals: "Goals",
      users: "User Management",
      settings: "Settings",
      logout: "Logout",
      reports: "Reports"
    },

    dashboard: {
      title: "Dashboard",
      total_users: "Total Users",
      active_users: "Active Users", 
      completed_evaluations: "Completed Evaluations",
      recent_evaluations: "Recent Evaluations",
      system_stats: "System Statistics"
    },

    auth: {
      login: "Login",
      logout: "Logout",
      email: "Email Address",
      password: "Password", 
      login_button: "Sign In",
      login_error: "Login failed",
      temp_auth_notice: "Logged in with temporary authentication",
      demo_accounts: "Demo Accounts",
      quick_fill: "Quick Fill"
    },

    users: {
      title: "User Management",
      add_user: "Add New User",
      edit_user: "Edit User",
      delete_user: "Delete User",
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      active: "Active",
      inactive: "Inactive"
    },

    evaluations: {
      title: "Evaluation System",
      new_evaluation: "New Evaluation",
      edit_evaluation: "Edit Evaluation",
      target_user: "Target User",
      evaluator: "Evaluator",
      score: "Score",
      comments: "Comments",
      technical_skills: "Technical Skills",
      communication: "Communication",
      leadership: "Leadership",
      problem_solving: "Problem Solving",
      safety_awareness: "Safety Awareness",
      period: "Evaluation Period",
      updated_at: "Updated At",
      assignment_status: "Assignment Status"
    },

    evaluation: {
      target: "Target User"
    },

    status: {
      title: "Status",
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      draft: "Draft"
    },

    report: {
      summary: "Summary",
      comparison: "Comparison",
      history: "History",
      overall_evaluation: "Overall Evaluation",
      detailed_scores: "Detailed Scores",
      score_comparison: "Score Comparison",
      process_history: "Process History"
    },

    goals: {
      title: "Goals",
      apply: "Apply",
      about_goal_setting: "About Goal Setting",
      max_goals_info: "You can set up to 5 goals",
      total_weight_100_info: "Total weight of goals must be 100%",
      admin_approval_info: "Goals require administrator approval",
      select_evaluation_period: "Select Evaluation Period",
      add_goal: "Add Goal",
      total_weight: "Total Weight"
    },

    common: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      close: "Close",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      refresh: "Refresh",
      export: "Export",
      import: "Import",
      back: "Back"
    },

    messages: {
      save_success: "Saved successfully",
      save_error: "Save failed",
      delete_success: "Deleted successfully", 
      delete_error: "Delete failed",
      network_error: "Network error occurred",
      loading_error: "Failed to load data",
      validation_error: "Please check your input"
    }
  },

  vi: {
    app: {
      title: "Hệ thống Quản lý Đánh giá",
      system_name: "Hệ thống Đánh giá Ngành Xây dựng",
      loading: "Đang tải...",
      welcome: "Chào mừng",
      version: "Phiên bản"
    },

    nav: {
      dashboard: "Bảng điều khiển",
      evaluations: "Danh sách đánh giá",
      evaluation: "Nhập đánh giá",
      goals: "Thiết lập mục tiêu", 
      users: "Quản lý người dùng",
      settings: "Cài đặt",
      logout: "Đăng xuất",
      reports: "Báo cáo"
    },

    dashboard: {
      title: "Bảng điều khiển",
      total_users: "Tổng người dùng",
      active_users: "Người dùng hoạt động",
      completed_evaluations: "Đánh giá hoàn thành",
      recent_evaluations: "Đánh giá gần đây",
      system_stats: "Thống kê hệ thống"
    },

    auth: {
      login: "Đăng nhập",
      logout: "Đăng xuất",
      email: "Địa chỉ email",
      password: "Mật khẩu",
      login_button: "Đăng nhập",
      login_error: "Đăng nhập thất bại",
      temp_auth_notice: "Đã đăng nhập bằng xác thực tạm thời",
      demo_accounts: "Tài khoản Demo",
      quick_fill: "Điền nhanh"
    },

    evaluations: {
      title: "Hệ thống Đánh giá",
      new_evaluation: "Đánh giá mới",
      edit_evaluation: "Chỉnh sửa đánh giá",
      target_user: "Người được đánh giá",
      evaluator: "Người đánh giá",
      score: "Điểm số",
      comments: "Nhận xét",
      technical_skills: "Kỹ năng kỹ thuật",
      communication: "Giao tiếp",
      leadership: "Lãnh đạo",
      problem_solving: "Giải quyết vấn đề",
      safety_awareness: "Ý thức an toàn",
      period: "Kỳ đánh giá",
      updated_at: "Cập nhật lúc",
      assignment_status: "Trạng thái phân công"
    },

    evaluation: {
      target: "Người được đánh giá"
    },

    status: {
      title: "Trạng thái",
      pending: "Chờ xử lý",
      in_progress: "Đang tiến hành",
      completed: "Hoàn thành",
      draft: "Bản nháp"
    },

    report: {
      summary: "Tóm tắt",
      comparison: "So sánh",
      history: "Lịch sử",
      overall_evaluation: "Đánh giá tổng thể",
      detailed_scores: "Điểm chi tiết",
      score_comparison: "So sánh điểm",
      process_history: "Lịch sử xử lý"
    },

    goals: {
      title: "Thiết lập mục tiêu",
      apply: "Áp dụng",
      about_goal_setting: "Về thiết lập mục tiêu",
      max_goals_info: "Bạn có thể đặt tối đa 5 mục tiêu",
      total_weight_100_info: "Tổng trọng số của mục tiêu phải là 100%",
      admin_approval_info: "Mục tiêu cần được quản trị viên phê duyệt",
      select_evaluation_period: "Chọn kỳ đánh giá",
      add_goal: "Thêm mục tiêu",
      total_weight: "Tổng trọng số"
    },

    common: {
      save: "Lưu",
      cancel: "Hủy bỏ",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      confirm: "Xác nhận",
      yes: "Có",
      no: "Không",
      close: "Đóng",
      search: "Tìm kiếm",
      filter: "Lọc",
      sort: "Sắp xếp",
      refresh: "Làm mới",
      export: "Xuất",
      import: "Nhập",
      back: "Quay lại"
    },

    messages: {
      save_success: "Lưu thành công",
      save_error: "Lưu thất bại",
      delete_success: "Xóa thành công",
      delete_error: "Xóa thất bại",
      network_error: "Lỗi mạng xảy ra",
      loading_error: "Không thể tải dữ liệu",
      validation_error: "Vui lòng kiểm tra đầu vào"
    }
  }
};

class UnifiedI18n {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || 'ja';
    this.supportedLanguages = ['ja', 'en', 'vi'];
    this.fallbackLanguage = 'ja';
    
    // 翻訳キャッシュ
    this.cache = new Map();
    
    // 一時認証システム用の翻訳データ
    this.tempAuthTranslations = this.initTempAuthTranslations();
  }

  /**
   * 保存された言語設定を取得
   */
  getStoredLanguage() {
    return localStorage.getItem('app_language') || 
           navigator.language.split('-')[0] ||
           'ja';
  }

  /**
   * 言語設定を保存
   */
  setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Unsupported language: ${language}`);
      return;
    }
    
    this.currentLanguage = language;
    localStorage.setItem('app_language', language);
    
    // 言語変更イベントを発行
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: language }
    }));
  }

  /**
   * 翻訳テキストを取得
   */
  t(key, params = {}) {
    // キャッシュから取得を試行
    const cacheKey = `${this.currentLanguage}:${key}`;
    if (this.cache.has(cacheKey)) {
      return this.interpolate(this.cache.get(cacheKey), params);
    }

    // 翻訳を取得
    let translation = this.getTranslation(key, this.currentLanguage);
    
    // フォールバックを使用
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      translation = this.getTranslation(key, this.fallbackLanguage);
    }
    
    // 最終フォールバック
    if (!translation) {
      translation = key;
      console.warn(`Translation not found for key: ${key}`);
    }

    // キャッシュに保存
    this.cache.set(cacheKey, translation);
    
    return this.interpolate(translation, params);
  }

  /**
   * 深いオブジェクトから翻訳を取得
   */
  getTranslation(key, language) {
    const keys = key.split('.');
    let current = TRANSLATIONS[language];
    
    for (const k of keys) {
      if (current && current[k]) {
        current = current[k];
      } else {
        return null;
      }
    }
    
    return typeof current === 'string' ? current : null;
  }

  /**
   * パラメータ補間
   */
  interpolate(text, params) {
    if (!params || Object.keys(params).length === 0) {
      return text;
    }
    
    let result = text;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return result;
  }

  /**
   * 現在の言語を取得
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * サポートされている言語一覧を取得
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * 言語名を取得（ネイティブ表記）
   */
  getLanguageName(language) {
    const names = {
      ja: '日本語',
      en: 'English', 
      vi: 'Tiếng Việt'
    };
    return names[language] || language;
  }

  /**
   * 一時認証システム用の翻訳初期化
   */
  initTempAuthTranslations() {
    return {
      ja: {
        temp_login_success: '一時認証でログインしました',
        demo_mode: 'デモモード',
        firebase_unavailable: 'Firebase認証が利用できません'
      },
      en: {
        temp_login_success: 'Logged in with temporary authentication',
        demo_mode: 'Demo Mode',
        firebase_unavailable: 'Firebase authentication unavailable'
      },
      vi: {
        temp_login_success: 'Đã đăng nhập bằng xác thực tạm thời',
        demo_mode: 'Chế độ Demo',
        firebase_unavailable: 'Xác thực Firebase không khả dụng'
      }
    };
  }

  /**
   * 一時認証用翻訳取得
   */
  getTempAuthTranslation(key) {
    return this.tempAuthTranslations[this.currentLanguage]?.[key] || 
           this.tempAuthTranslations[this.fallbackLanguage]?.[key] ||
           key;
  }

  /**
   * HTMLページの翻訳を適用
   */
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.getAttribute('data-i18n-attr')) {
        // 属性値の翻訳
        const attr = element.getAttribute('data-i18n-attr');
        element.setAttribute(attr, translation);
      } else {
        // テキスト内容の翻訳
        element.textContent = translation;
      }
    });
  }

  /**
   * UI更新メソッド（login.jsとの互換性のため）
   */
  updateUI() {
    this.applyTranslations();
  }

  /**
   * キャッシュをクリア
   */
  clearCache() {
    this.cache.clear();
  }
}

// シングルトンインスタンス
const i18n = new UnifiedI18n();

// グローバルに公開
window.i18n = i18n;
window.t = (key, params) => i18n.t(key, params);

// 言語切り替えボタンを自動生成
function createLanguageSwitcher() {
  const switcher = document.createElement('div');
  switcher.className = 'language-switcher';
  switcher.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: white;
    padding: 8px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  `;

  i18n.getSupportedLanguages().forEach(lang => {
    const button = document.createElement('button');
    button.textContent = i18n.getLanguageName(lang);
    button.style.cssText = `
      margin: 0 5px;
      padding: 5px 10px;
      border: 1px solid #ddd;
      background: ${i18n.getCurrentLanguage() === lang ? '#007bff' : 'white'};
      color: ${i18n.getCurrentLanguage() === lang ? 'white' : 'black'};
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    `;
    
    button.onclick = () => {
      i18n.setLanguage(lang);
      location.reload(); // ページリロードで翻訳を適用
    };
    
    switcher.appendChild(button);
  });

  return switcher;
}

// DOM読み込み完了時の自動初期化
document.addEventListener('DOMContentLoaded', () => {
  // 翻訳を適用
  i18n.applyTranslations();
  
  // 言語切り替えボタンを追加（オプション）
  if (!document.querySelector('.language-switcher')) {
    document.body.appendChild(createLanguageSwitcher());
  }
});

// エクスポート
export { UnifiedI18n, i18n };
export default i18n;