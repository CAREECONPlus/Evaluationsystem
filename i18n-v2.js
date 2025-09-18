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
      goal_setting: "目標設定",
      goal_approvals: "目標承認",
      users: "ユーザー管理",
      settings: "設定",
      logout: "ログアウト",
      reports: "レポート",
      help: "ヘルプ",
      job_types: "職種管理",
      self_evaluation: "自己評価",
      multilingual_admin: "多言語管理",
      organization_management: "組織管理",
      evaluation_periods: "評価期間設定",
      data_settings: "データ設定",
      developer: "開発者管理",
      profile: "プロフィール"
    },

    // ===== ダッシュボード =====
    dashboard: {
      title: "ダッシュボード",
      total_users: "総ユーザー数",
      active_users: "アクティブユーザー", 
      completed_evaluations: "完了済み評価",
      recent_evaluations: "最近の評価",
      system_stats: "システム統計",
      total_evaluations: "総評価数",
      pending_evaluations: "承認待ち",
      system_overview: "システム概要",
      performance_chart: "パフォーマンス推移"
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
      subtitle: "ユーザー管理",
      add_user: "新規ユーザー追加",
      edit_user: "ユーザー編集",
      delete_user: "ユーザー削除",
      name: "名前",
      email: "メールアドレス",
      role: "役割",
      status: "ステータス",
      active: "アクティブ",
      inactive: "非アクティブ",
      total_users: "総ユーザー数",
      active_users: "アクティブユーザー",
      pending_users: "保留中ユーザー",
      admin_users: "管理者ユーザー",
      all_status: "すべてのステータス",
      all_roles: "すべての役割",
      search_placeholder: "ユーザー名またはメールアドレスで検索"
    },

    // ===== 評価システム =====
    evaluations: {
      title: "評価一覧",
      new_evaluation: "新規評価作成",
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
      my_assignments: "私の担当",
      in_progress: "進行中",
      all_status: "すべてのステータス",
      all_users: "すべてのユーザー",
      all_assignments: "すべての担当",
      assigned: "担当割り当て済み",
      unassigned: "担当未割り当て",
      my_evaluations: "私が評価者",
      other_evaluators: "他の評価者",
      urgent: "緊急（承認待ち）",
      this_week: "今週作成",
      own_evaluations_only: "あなたの評価のみ表示されます",
      reset_filters: "フィルターリセット",
      items_count: "項目数",
      search_placeholder: "評価対象者名で検索..."
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
      all: "すべて",
      loading: "読み込み中...",
      actions: "操作",
      created_at: "作成日時",
      reset: "リセット",
      access_denied: "この機能にはアクセス権限がありません。",
      save_draft: "下書き保存",
      submit: "提出",
      select: "選択してください",
      no_data: "データがありません",
      language: "言語",
      last_name: "姓",
      first_name: "名",
      email: "メールアドレス",
      phone_number: "電話番号",
      department: "部門",
      position: "役職",
      job_types: "職種",
      view_all: "すべて表示"
    },

    // ===== ステータス =====
    status: {
      draft: "下書き",
      self_assessed: "自己評価完了",
      pending_approval: "承認待ち",
      completed: "完了",
      in_progress: "進行中"
    },

    // ===== 役割 =====
    roles: {
      admin: "管理者",
      evaluator: "評価者", 
      supervisor: "監督者",
      worker: "作業員"
    },

    // ===== 評価フォーム =====
    evaluations: {
      form_title: "評価フォーム",
      target_info: "評価対象者情報",
      evaluation_period: "評価期間",
      save_draft: "下書き保存",
      submit: "提出"
    },

    // ===== 設定 =====
    settings: {
      title: "設定",
      save_changes: "変更を保存",
      job_types: "職種設定",
      evaluation_periods: "評価期間設定",
      select_job_type_hint: "職種を選択してください",
      categories: "カテゴリ",
      description: "説明",
      order: "並び順",
      language: "言語"
    },

    // ===== 目標管理 =====
    goals: {
      approvals_title: "目標承認",
      pending_goals: "承認待ち目標", 
      approved_goals: "承認済み目標"
    },

    // ===== プロフィール =====
    profile: {
      subtitle: "プロフィール情報",
      user_id: "ユーザーID",
      registration_date: "登録日",
      last_login: "最終ログイン",
      account_status: "アカウント状態",
      account_info: "アカウント情報",
      password_change: "パスワード変更",
      current_password: "現在のパスワード",
      new_password: "新しいパスワード",
      password_requirements: "パスワード要件",
      confirm_password: "パスワード確認",
      change_password: "パスワード変更",
      email_change_note: "メールアドレス変更は管理者に連絡してください",
      bio: "自己紹介"
    },

    // ===== バリデーション =====
    validation: {
      last_name_required: "姓は必須です",
      first_name_required: "名は必須です",
      email_invalid: "有効なメールアドレスを入力してください",
      current_password_required: "現在のパスワードは必須です",
      password_length: "パスワードは8文字以上で入力してください",
      password_mismatch: "パスワードが一致しません"
    },

    // ===== 共通フィールド =====
    common_fields: {
      last_name: "姓",
      first_name: "名",
      phone_number: "電話番号",
      department: "部署",
      position: "役職",
      job_types: "職種",
      language: "言語",
      select: "選択してください"
    },

    // ===== ユーザー =====
    user: {
      profile: "ユーザープロフィール"
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
    },

    // ===== ログイン =====
    login: {
      lead_text: "ログインしてシステムをご利用ください",
      sign_in_hint: "デモアカウントでお試しいただけます"
    },

    // ===== 認証 =====
    auth: {
      login: "ログイン",
      logout: "ログアウト",
      email: "メールアドレス",
      password: "パスワード",
      email_label: "メールアドレス",
      password_label: "パスワード",
      login_button: "ログイン",
      logging_in: "ログイン中...",
      login_error: "ログインに失敗しました",
      temp_auth_notice: "一時認証でログインしています",
      register_admin_link: "管理者登録"
    },

    // ===== エラーメッセージ =====
    errors: {
      login_failed_generic: "ログインに失敗しました。メールアドレスとパスワードを確認してください。",
      auth_network_failed: "認証サーバーに接続できません",
      invalid_credentials: "認証情報が正しくありません"
    },

    // ===== 翻訳品質管理 =====
    translation_quality: {
      title: "翻訳品質管理",
      total_translations: "総翻訳数",
      manual_verified: "手動検証済み",
      average_quality: "平均品質スコア",
      needs_review: "要レビュー",
      filter_by_quality: "品質でフィルタ",
      high_quality: "高品質 (0.8+)",
      medium_quality: "中品質 (0.5-0.8)",
      low_quality: "低品質 (<0.5)",
      unverified: "未検証",
      language_pair: "言語ペア",
      translation_service: "翻訳サービス",
      automatic: "自動翻訳",
      fallback: "フォールバック",
      manual: "手動翻訳",
      translations_list: "翻訳一覧",
      edit_translation: "翻訳の編集",
      original_text: "原文",
      current_translation: "現在の翻訳",
      improved_translation: "改善された翻訳",
      quality_score: "品質スコア",
      improvement_notes: "改善メモ",
      quality_analysis: "品質分析",
      no_translations: "該当する翻訳が見つかりません",
      source_text: "原文",
      translated_text: "翻訳文",
      languages: "言語",
      quality: "品質",
      service: "サービス",
      status: "状態"
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
      goal_setting: "Goal Setting",
      goal_approvals: "Goal Approvals",
      users: "User Management",
      settings: "Settings",
      logout: "Logout",
      reports: "Reports",
      help: "Help",
      job_types: "Job Types",
      self_evaluation: "Self Evaluation",
      multilingual_admin: "Multilingual Admin",
      organization_management: "Organization Management",
      evaluation_periods: "Evaluation Periods",
      data_settings: "Data Settings",
      developer: "Developer",
      profile: "Profile"
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
      subtitle: "User Management",
      add_user: "Add New User",
      edit_user: "Edit User",
      delete_user: "Delete User",
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      total_users: "Total Users",
      active_users: "Active Users",
      pending_users: "Pending Users",
      admin_users: "Admin Users",
      all_status: "All Status",
      all_roles: "All Roles",
      search_placeholder: "Search by name or email"
    },

    evaluations: {
      title: "Evaluations",
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
      my_assignments: "My Assignments",
      in_progress: "In Progress",
      all_status: "All Status",
      all_users: "All Users",
      all_assignments: "All Assignments",
      assigned: "Assigned",
      unassigned: "Unassigned",
      my_evaluations: "My Evaluations",
      other_evaluators: "Other Evaluators",
      urgent: "Urgent (Pending Approval)",
      this_week: "This Week",
      own_evaluations_only: "Only your evaluations are displayed",
      reset_filters: "Reset Filters",
      items_count: "Items Count",
      search_placeholder: "Search by target user name..."
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
      all: "All",
      loading: "Loading...",
      actions: "Actions",
      created_at: "Created At",
      reset: "Reset",
      access_denied: "You do not have access to this feature.",
      save_draft: "Save Draft",
      submit: "Submit",
      select: "Please select",
      no_data: "No data available",
      language: "Language",
      last_name: "Last Name",
      first_name: "First Name",
      email: "Email",
      phone_number: "Phone Number",
      department: "Department",
      position: "Position",
      job_types: "Job Types",
      view_all: "View All"
    },

    status: {
      draft: "Draft",
      self_assessed: "Self-Assessed",
      pending_approval: "Pending Approval",
      completed: "Completed",
      in_progress: "In Progress"
    },

    roles: {
      admin: "Administrator",
      evaluator: "Evaluator",
      supervisor: "Supervisor", 
      worker: "Worker"
    },

    messages: {
      save_success: "Saved successfully",
      save_error: "Save failed",
      delete_success: "Deleted successfully",
      delete_error: "Delete failed",
      network_error: "Network error occurred",
      loading_error: "Failed to load data",
      validation_error: "Please check your input"
    },

    // ===== Translation Quality Management =====
    translation_quality: {
      title: "Translation Quality Management",
      total_translations: "Total Translations",
      manual_verified: "Manually Verified",
      average_quality: "Average Quality Score",
      needs_review: "Needs Review",
      filter_by_quality: "Filter by Quality",
      high_quality: "High Quality (0.8+)",
      medium_quality: "Medium Quality (0.5-0.8)",
      low_quality: "Low Quality (<0.5)",
      unverified: "Unverified",
      language_pair: "Language Pair",
      translation_service: "Translation Service",
      automatic: "Automatic",
      fallback: "Fallback",
      manual: "Manual",
      translations_list: "Translations List",
      edit_translation: "Edit Translation",
      original_text: "Original Text",
      current_translation: "Current Translation",
      improved_translation: "Improved Translation",
      quality_score: "Quality Score",
      improvement_notes: "Improvement Notes",
      quality_analysis: "Quality Analysis",
      no_translations: "No matching translations found",
      source_text: "Source Text",
      translated_text: "Translated Text",
      languages: "Languages",
      quality: "Quality",
      service: "Service",
      status: "Status"
    },

    settings: {
      title: "Settings",
      save_changes: "Save Changes",
      job_types: "Job Types",
      evaluation_periods: "Evaluation Periods",
      select_job_type_hint: "Please select a job type",
      categories: "Categories",
      description: "Description",
      order: "Order",
      language: "Language"
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
      goal_setting: "Thiết lập mục tiêu",
      goal_approvals: "Phê duyệt mục tiêu",
      users: "Quản lý người dùng",
      settings: "Cài đặt",
      logout: "Đăng xuất",
      reports: "Báo cáo",
      help: "Trợ giúp",
      job_types: "Loại công việc",
      self_evaluation: "Tự đánh giá",
      multilingual_admin: "Quản lý đa ngôn ngữ",
      organization_management: "Quản lý tổ chức",
      evaluation_periods: "Chu kỳ đánh giá",
      data_settings: "Cài đặt dữ liệu",
      developer: "Nhà phát triển",
      profile: "Hồ sơ"
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
      all: "Tất cả",
      loading: "Đang tải...",
      actions: "Hành động",
      reset: "Đặt lại",
      access_denied: "Bạn không có quyền truy cập tính năng này.",
      save_draft: "Lưu Nháp",
      submit: "Gửi",
      select: "Vui lòng chọn",
      no_data: "Không có dữ liệu",
      language: "Ngôn ngữ",
      last_name: "Họ",
      first_name: "Tên",
      email: "Email",
      phone_number: "Số điện thoại",
      department: "Phòng ban",
      position: "Vị trí",
      job_types: "Loại công việc",
      view_all: "Xem tất cả"
    },

    messages: {
      save_success: "Lưu thành công",
      save_error: "Lưu thất bại",
      delete_success: "Xóa thành công",
      delete_error: "Xóa thất bại",
      network_error: "Lỗi mạng xảy ra",
      loading_error: "Không thể tải dữ liệu",
      validation_error: "Vui lòng kiểm tra đầu vào"
    },

    // ===== Translation Quality Management =====
    translation_quality: {
      title: "Quản lý Chất lượng Dịch thuật",
      total_translations: "Tổng số Bản dịch",
      manual_verified: "Được xác minh Thủ công",
      average_quality: "Điểm Chất lượng Trung bình",
      needs_review: "Cần Xem lại",
      filter_by_quality: "Lọc theo Chất lượng",
      high_quality: "Chất lượng Cao (0.8+)",
      medium_quality: "Chất lượng Trung bình (0.5-0.8)",
      low_quality: "Chất lượng Thấp (<0.5)",
      unverified: "Chưa xác minh",
      language_pair: "Cặp Ngôn ngữ",
      translation_service: "Dịch vụ Dịch thuật",
      automatic: "Tự động",
      fallback: "Dự phòng",
      manual: "Thủ công",
      translations_list: "Danh sách Bản dịch",
      edit_translation: "Chỉnh sửa Bản dịch",
      original_text: "Văn bản Gốc",
      current_translation: "Bản dịch Hiện tại",
      improved_translation: "Bản dịch Cải thiện",
      quality_score: "Điểm Chất lượng",
      improvement_notes: "Ghi chú Cải thiện",
      quality_analysis: "Phân tích Chất lượng",
      no_translations: "Không tìm thấy bản dịch phù hợp",
      source_text: "Văn bản Nguồn",
      translated_text: "Văn bản Dịch",
      languages: "Ngôn ngữ",
      quality: "Chất lượng",
      service: "Dịch vụ",
      status: "Trạng thái"
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
   * 個別要素の翻訳更新（report.jsとの互換性のため）
   */
  updateElement(selector, key) {
    let element;

    // セレクターが既にHTMLElementの場合はそのまま使用
    if (selector && typeof selector === 'object' && selector.nodeType === Node.ELEMENT_NODE) {
      element = selector;
    } else if (typeof selector === 'string') {
      try {
        element = document.querySelector(selector);
      } catch (error) {
        console.warn('I18n: Invalid selector:', selector);
        return;
      }
    } else {
      console.warn('I18n: Invalid selector type:', typeof selector, selector);
      return;
    }

    if (element && key) {
      const translation = this.t(key);
      element.textContent = translation;
    }
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