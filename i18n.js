/**
 * Internationalization (i18n) Module - ES6 Module Version
 * 国際化対応モジュール - ES6モジュール版
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
      "goals": "目標設定", 
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
      "system_overview": "システム概要と最新の活動状況",
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
      "completed_goals": "完了済み目標",
      "total_employees": "総従業員数",
      "pending_evaluations_count": "処理中の評価",
      "completed_evaluations_count": "完了した評価",
      "performance_analysis": "パフォーマンス分析"
    },

    // ===== 認証関連翻訳 =====
    "auth": {
      "login": "ログイン",
      "logout": "ログアウト",
      "confirm_logout": "ログアウトしますか？",
      "email": "メールアドレス",
      "email_label": "メールアドレス",
      "password": "パスワード",
      "password_label": "パスワード",
      "remember_me": "ログイン状態を保持する",
      "forgot_password": "パスワードを忘れた方",
      "register": "新規登録",
      "sign_in": "サインイン",
      "sign_out": "サインアウト",
      "sign_up": "サインアップ",
      "name": "氏名",
      "company": "企業名",
      "login_failed": "ログインに失敗しました",
      "register_success": "登録が完了しました",
      "reset_password": "パスワードリセット",
      "confirm_password": "パスワード確認",
      "register_admin": "管理者アカウント登録",
      "register_admin_link": "管理者アカウントの新規登録はこちら",
      "register_user": "ユーザー登録",
      "logging_in": "ログイン中...",
      "sign_in_hint": "アカウント情報を入力してください",
      "register_admin_success": "登録申請が完了しました",
      "register_admin_success_detail": "システム開発者による承認をお待ちください。"
    },
    
    // ===== 評価関連翻訳 =====
    "evaluations": {
      "title": "評価一覧",
      "form_title": "評価フォーム",
      "new_evaluation": "新規評価",
      "my_evaluations": "マイ評価",
      "pending_evaluations": "承認待ち評価",
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
      "new_evaluation": "新規評価作成",
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
      "logout_failed": "ログアウトに失敗しました",
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
      "forbidden": "アクセスが拒否されました",
      "loading_failed": "データの読み込みに失敗しました。",
      "email_password_required": "メールアドレスとパスワードを入力してください。",
      "all_fields_required": "すべての必須項目を入力してください。",
      "access_denied": "このページにアクセスする権限がありません。",
      "passwords_not_match": "パスワードが一致しません。",
      "passwords_match": "パスワードが一致しました。",
      "chart_library_failed": "チャートライブラリの読み込みに失敗しました"
    },
    
    // ===== 共通翻訳 =====
    "common": {
      "language": "言語",
      "notifications": "通知",
      "mark_all_read": "すべて既読",
      "no_notifications": "通知はありません",
      "quick_actions": "クイックアクション",
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
      "clear": "クリア",
      "toggle_navigation": "ナビゲーション切り替え",
      "user": "ユーザー",
      "last_login": "最終ログイン",
      "unknown": "不明",
      "refresh": "更新",
      "refreshing": "更新中...",
      "reload": "再読み込み",
      "view_all": "すべて表示",
      "no_data": "データがありません",
      "details": "詳細",
      "export": "エクスポート",
      "all": "全て",
      "add_success": "追加しました",
      "edit_user": "ユーザー編集",
      "current_status": "現在の状態",
      "load_draft": "下書きを読み込み",
      "save_draft": "下書き保存",
      "back_to_login": "ログインページに戻る",
      "created_at": "作成日",
      "actions": "操作"
    },

    // ===== ユーザー管理 =====
    "users": {
      "title": "ユーザー管理",
      "subtitle": "組織内のユーザーを管理します",
      "invite": "新規ユーザー招待",
      "invite_user": "ユーザーを招待",
      "role": "役割",
      "status": "ステータス",
      "created_at": "登録日",
      "actions": "操作",
      "search_users": "ユーザーを検索...",
      "pending_approvals": "承認待ちユーザー",
      "active_users": "ユーザー一覧",
      "invite_title": "新規ユーザーを招待",
      "send_invitation": "招待を送信",
      "invite_link_created": "招待リンクが作成されました",
      "invite_link_instructions": "以下のリンクをコピーして、招待したいユーザーに共有してください。リンクは7日間有効です。",
      "copy_success": "リンクをコピーしました！",
      "confirm_approve": "このユーザーを承認しますか？",
      "approve_success": "ユーザーを承認しました。",
      "confirm_reject": "このユーザーを否認（削除）しますか？",
      "reject_success": "ユーザーを削除しました。",
      "edit_user": "ユーザー情報の編集",
      "total_users": "総ユーザー数",
      "pending_users": "承認待ち",
      "admin_users": "管理者",
      "all_status": "すべてのステータス",
      "active": "アクティブ",
      "inactive": "非アクティブ",
      "pending": "承認待ち",
      "all_roles": "すべての役割",
      "invitation_message": "招待メッセージ（任意）"
    },

    // ===== 目標管理 =====
    "goals": {
      "title": "目標設定",
      "approvals_title": "目標承認",
      "weight": "ウェイト",
      "total_weight": "合計ウェイト",
      "add_goal": "目標を追加",
      "apply": "申請",
      "approve": "承認",
      "reject": "差し戻し",
      "goal_text": "目標内容",
      "weight_percent": "ウェイト（%）",
      "pending_goals": "承認待ち目標",
      "approved_goals": "承認済み目標",
      "about_goal_setting": "目標設定について",
      "max_goals_info": "最大{{maxGoals}}つまでの目標を設定できます",
      "total_weight_100_info": "ウェイトの合計は100%にする必要があります",
      "admin_approval_info": "申請後は管理者の承認が必要です",
      "submitted_at": "申請日",
      "confirm_approve": "この目標を承認しますか？",
      "confirm_reject": "この目標を差し戻しますか？",
      "rejection_reason_prompt": "差し戻しの理由を入力してください。",
      "select_evaluation_period": "評価期間を選択してください",
      "confirm_apply": "目標を申請しますか？",
      "approve_success": "目標を承認しました。",
      "reject_success": "目標を差し戻しました。"
    },

    // ===== 役割 =====
    "roles": {
      "admin": "管理者",
      "user": "ユーザー",
      "developer": "開発者",
      "evaluator": "評価者",
      "worker": "作業員",
      "all": "全ての役割"
    },

    // ===== ステータス =====
    "status": {
      "active": "アクティブ",
      "inactive": "非アクティブ",
      "pending": "保留中",
      "completed": "完了",
      "suspended": "利用停止中",
      "developer_approval_pending": "開発者承認待ち",
      "draft": "下書き",
      "approved": "承認済み",
      "rejected": "差し戻し",
      "self_assessed": "自己評価完了",
      "approved_by_evaluator": "評価者承認済み",
      "pending_submission": "作業員提出待ち",
      "pending_evaluation": "評価者評価待ち",
      "pending_approval": "管理者承認待ち"
    },

    // ===== チャート項目 =====
    "chart_items": {
      "technical_skill": "技術力",
      "quality": "品質",
      "safety": "安全",
      "cooperation": "協調性",
      "diligence": "勤怠"
    },

    // ===== 時間 =====
    "time": {
      "just_now": "たった今",
      "minutes_ago": "{{count}}分前",
      "hours_ago": "{{count}}時間前",
      "days_ago": "{{count}}日前"
    },

    // ===== 通知 =====
    "notifications": {
      "type": {
        "evaluation_pending": "評価承認待ち",
        "evaluation_completed": "評価完了",
        "user_assigned": "ユーザー割り当て",
        "system_update": "システム更新",
        "reminder": "リマインダー"
      },
      "evaluation_pending": "{{userName}}さんの評価が承認待ちです",
      "admin_evaluation_pending": "{{userName}}さんの評価が{{evaluatorName}}の承認待ちです"
    },

    // ===== メッセージ =====
    "messages": {
      "success": "操作が正常に完了しました",
      "error": "エラーが発生しました",
      "loading": "読み込み中...",
      "no_data": "データがありません",
      "save_success": "正常に保存されました",
      "delete_success": "削除しました",
      "approval_success": "承認しました",
      "rejection_success": "差し戻しました",
      "invitation_sent": "招待を送信しました",
      "password_reset_sent": "パスワードリセットメールを送信しました",
      "login_success": "ようこそ、{{userName}}さん",
      "logout_success": "ログアウトしました。",
      "mark_all_notifications_read": "すべての通知を既読にしました",
      "mark_notifications_failed": "通知の既読化に失敗しました"
    }
  },
  
  // ===== 英語翻訳 =====
  en: {
    "app": {
      "title": "Evaluation Management System",
      "system_name": "Construction Industry Evaluation Management System",
      "loading": "Loading...",
      "welcome": "Welcome"
    },
    "nav": {
      "dashboard": "Dashboard",
      "users": "User Management",
      "settings": "Settings",
      "evaluations": "Evaluations",
      "goals": "Goal Setting",
      "goal_setting": "Goal Setting",
      "goal_approvals": "Goal Approvals",
      "reports": "Reports",
      "developer": "Developer",
      "logout": "Logout",
      "profile": "Profile",
      "evaluation": "Evaluation Input"
    },
    "auth": {
      "login": "Login",
      "logout": "Logout",
      "confirm_logout": "Are you sure you want to logout?",
      "email": "Email Address",
      "password": "Password",
      "name": "Name",
      "company": "Company Name"
    },
    "dashboard": {
      "title": "Dashboard",
      "system_overview": "System overview and recent activities",
      "performance_analysis": "Performance Analysis",
      "recent_evaluations": "Recent Evaluations",
      "no_recent_evaluations": "No recent evaluations",
      "total_employees": "Total Employees",
      "pending_evaluations_count": "Pending Evaluations",
      "completed_evaluations_count": "Completed Evaluations",
      "total_users": "Total Users",
      "completed_evaluations": "Completed Evaluations",
      "pending_evaluations": "Pending Evaluations",
      "performance_chart": "Performance Chart"
    },
    "users": {
      "title": "User Management",
      "invite": "Invite New User",
      "invite_user": "Invite User",
      "role": "Role",
      "status": "Status",
      "created_at": "Registration Date",
      "actions": "Actions"
    },
    "evaluation": {
      "title": "Evaluation Input",
      "new_evaluation": "New Evaluation",
      "my_evaluations": "My Evaluations",
      "pending_evaluations": "Pending Evaluations",
      "self_assessment": "Self-Assessment",
      "evaluator_assessment": "Evaluator's Assessment"
    },
    "roles": {
      "developer": "Developer",
      "admin": "Administrator", 
      "evaluator": "Evaluator",
      "worker": "Worker",
      "all": "All Roles"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "pending": "Pending",
      "completed": "Completed"
    },
    "common": {
      "language": "Language",
      "notifications": "Notifications",
      "mark_all_read": "Mark all as read",
      "no_notifications": "No notifications",
      "quick_actions": "Quick Actions",
      "user": "User",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "add": "Add",
      "search": "Search",
      "loading": "Loading...",
      "actions": "Actions"
    },
    "chart_items": {
      "technical_skill": "Technical Skill",
      "quality": "Quality",
      "safety": "Safety",
      "cooperation": "Cooperation",
      "diligence": "Diligence"
    },
    "time": {
      "just_now": "Just now",
      "minutes_ago": "{{count}} minutes ago",
      "hours_ago": "{{count}} hours ago",
      "days_ago": "{{count}} days ago"
    },
    "notifications": {
      "type": {
        "evaluation_pending": "Evaluation Pending",
        "evaluation_completed": "Evaluation Completed"
      }
    },
    "errors": {
      "logout_failed": "Logout failed"
    },
    "messages": {
      "mark_all_notifications_read": "All notifications marked as read",
      "mark_notifications_failed": "Failed to mark notifications as read"
    }
  },

  // ===== ベトナム語翻訳 =====
  vi: {
    "app": {
      "title": "Hệ thống quản lý đánh giá",
      "system_name": "Hệ thống quản lý đánh giá ngành xây dựng",
      "loading": "Đang tải...",
      "welcome": "Chào mừng"
    },
    "nav": {
      "dashboard": "Bảng điều khiển",
      "users": "Quản lý người dùng",
      "settings": "Cài đặt",
      "evaluations": "Đánh giá",
      "goals": "Thiết lập mục tiêu",
      "goal_setting": "Thiết lập mục tiêu",
      "goal_approvals": "Phê duyệt mục tiêu",
      "reports": "Báo cáo",
      "developer": "Nhà phát triển",
      "logout": "Đăng xuất",
      "profile": "Hồ sơ",
      "evaluation": "Nhập đánh giá"
    },
    "auth": {
      "login": "Đăng nhập",
      "logout": "Đăng xuất",
      "confirm_logout": "Bạn có chắc chắn muốn đăng xuất?",
      "email": "Địa chỉ email",
      "password": "Mật khẩu",
      "name": "Họ tên",
      "company": "Tên công ty"
    },
    "dashboard": {
      "title": "Bảng điều khiển",
      "system_overview": "Tổng quan hệ thống và hoạt động gần đây",
      "performance_analysis": "Phân tích hiệu suất",
      "recent_evaluations": "Đánh giá gần đây",
      "no_recent_evaluations": "Không có đánh giá gần đây",
      "total_employees": "Tổng số nhân viên",
      "pending_evaluations_count": "Đánh giá đang chờ xử lý",
      "completed_evaluations_count": "Đánh giá đã hoàn thành"
    },
    "users": {
      "title": "Quản lý người dùng",
      "invite": "Mời người dùng mới",
      "invite_user": "Mời người dùng",
      "role": "Vai trò",
      "status": "Trạng thái",
      "created_at": "Ngày đăng ký",
      "actions": "Hành động"
    },
    "evaluation": {
      "title": "Nhập đánh giá",
      "new_evaluation": "Đánh giá mới",
      "my_evaluations": "Đánh giá của tôi",
      "pending_evaluations": "Đánh giá chờ duyệt",
      "self_assessment": "Tự đánh giá",
      "evaluator_assessment": "Đánh giá của người đánh giá"
    },
    "roles": {
      "developer": "Nhà phát triển",
      "admin": "Quản trị viên",
      "evaluator": "Người đánh giá", 
      "worker": "Công nhân",
      "all": "Tất cả vai trò"
    },
    "status": {
      "active": "Hoạt động",
      "inactive": "Không hoạt động",
      "pending": "Đang chờ",
      "completed": "Hoàn thành"
    },
    "common": {
      "language": "Ngôn ngữ",
      "notifications": "Thông báo",
      "mark_all_read": "Đánh dấu tất cả đã đọc",
      "no_notifications": "Không có thông báo",
      "quick_actions": "Hành động nhanh",
      "user": "Người dùng",
      "save": "Lưu",
      "cancel": "Hủy",
      "delete": "Xóa",
      "edit": "Chỉnh sửa",
      "add": "Thêm",
      "search": "Tìm kiếm",
      "loading": "Đang tải...",
      "actions": "Hành động"
    },
    "chart_items": {
      "technical_skill": "Kỹ năng kỹ thuật",
      "quality": "Chất lượng",
      "safety": "An toàn",
      "cooperation": "Hợp tác",
      "diligence": "Chuyên cần"
    },
    "time": {
      "just_now": "Vừa xong",
      "minutes_ago": "{{count}} phút trước",
      "hours_ago": "{{count}} giờ trước",
      "days_ago": "{{count}} ngày trước"
    },
    "notifications": {
      "type": {
        "evaluation_pending": "Đánh giá chờ duyệt",
        "evaluation_completed": "Đánh giá hoàn thành"
      }
    },
    "errors": {
      "logout_failed": "Đăng xuất thất bại"
    },
    "messages": {
      "mark_all_notifications_read": "Đã đánh dấu tất cả thông báo đã đọc",
      "mark_notifications_failed": "Không thể đánh dấu thông báo đã đọc"
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
    
    
    // 内蔵翻訳データを即座に読み込み
    this.loadBuiltInTranslations();
    
    // ページ読み込み完了時に自動翻訳を開始
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.init();
      });
    } else {
      // DOMが既に読み込まれている場合は即座に初期化
      setTimeout(() => this.init(), 0);
    }
  }

  /**
   * 内蔵翻訳データの読み込み
   */
  loadBuiltInTranslations() {
    
    Object.keys(BUILT_IN_TRANSLATIONS).forEach(lang => {
      this.translations[lang] = BUILT_IN_TRANSLATIONS[lang];
    });
    
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
   * システム初期化（改良版）
   */
  async init() {
    try {
      
      // 内蔵翻訳を使用
      this.loadBuiltInTranslations();
      
      // 初期化後にUIを更新
      this.updateUI();
      
      // 自動翻訳を有効化
      this.enableAutoTranslation();
      
      // 言語切り替えUIをセットアップ
      this.setupLanguageSwitcher();
      
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
        console.log("I18n: Using browser language:", primaryLang);
        return primaryLang;
      }
    }

    // 3. デフォルトは日本語
    console.log("I18n: Using default language: ja");
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
   * 言語の設定（改良版）
   */
  async setLanguage(lang) {
    if (!this.isValidLanguage(lang)) {
      console.warn(`I18n: Invalid language: ${lang}`);
      return false;
    }

    console.log(`I18n: Setting language to ${lang}`);
    
    try {
      // 言語を設定
      this.lang = lang;
      
      // ローカルストレージに保存
      localStorage.setItem('app_language', lang);
      
      // UIを更新
      this.updateUI();
      
      // 言語切り替えUIを更新
      this.updateLanguageSwitcher();
      
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
        
        // フォールバックでも見つからない場合は警告（デバッグ時のみ）
        if (translation === key) {
          console.debug(`I18n: Translation key not found: '${key}'`);
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

      // data-i18n-placeholder属性を持つ要素を検索
      const placeholderElements = container.querySelectorAll('[data-i18n-placeholder]');
      placeholderElements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (key) {
          const translation = this.t(key);
          if (translation !== key) {
            element.placeholder = translation;
            updatedCount++;
          }
        }
      });

      
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
   * 言語切り替えUIのセットアップ（新機能）
   */
  setupLanguageSwitcher() {
    // 既存の言語切り替えボタンを検索
    const languageSwitchers = document.querySelectorAll('[data-i18n-lang-switcher]');
    
    languageSwitchers.forEach(switcher => {
      // 既存のイベントリスナーを削除
      switcher.replaceWith(switcher.cloneNode(true));
    });

    // 新しいイベントリスナーを設定
    const newSwitchers = document.querySelectorAll('[data-i18n-lang-switcher]');
    newSwitchers.forEach(switcher => {
      console.log("I18n: Setting up language switcher:", switcher);
      
      // 言語リストを作成
      const supportedLangs = this.getSupportedLanguages();
      
      if (switcher.tagName === 'SELECT') {
        // セレクトボックスの場合
        if (switcher.children.length === 0) {
          supportedLangs.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.code === 'ja' ? '🇯🇵 日本語' : 
                                 lang.code === 'en' ? '🇺🇸 English' : 
                                 '🇻🇳 Tiếng Việt';
            switcher.appendChild(option);
          });
        }
        
        // 現在の言語を選択状態に
        switcher.value = this.lang;
        
        switcher.addEventListener('change', (e) => {
          console.log("I18n: Language switcher changed to:", e.target.value);
          this.setLanguage(e.target.value);
        });
        
      } else {
        // ボタンの場合
        switcher.addEventListener('click', () => {
          // 次の言語に切り替え
          const currentIndex = supportedLangs.findIndex(lang => lang.code === this.lang);
          const nextIndex = (currentIndex + 1) % supportedLangs.length;
          console.log("I18n: Button language switch to:", supportedLangs[nextIndex].code);
          this.setLanguage(supportedLangs[nextIndex].code);
        });
        
        // 現在の言語名を表示
        const currentLang = supportedLangs.find(lang => lang.code === this.lang);
        if (currentLang) {
          switcher.textContent = currentLang.name;
        }
      }
    });

    console.log("I18n: Language switcher setup completed for", newSwitchers.length, "elements");
  }

  /**
   * 言語切り替えUIの更新
   */
  updateLanguageSwitcher() {
    const languageSwitchers = document.querySelectorAll('[data-i18n-lang-switcher]');
    
    languageSwitchers.forEach(switcher => {
      if (switcher.tagName === 'SELECT') {
        switcher.value = this.lang;
      } else {
        const supportedLangs = this.getSupportedLanguages();
        const currentLang = supportedLangs.find(lang => lang.code === this.lang);
        if (currentLang) {
          switcher.textContent = currentLang.name;
        }
      }
    });
  }

  /**
   * デバッグ用：読み込まれている翻訳データを表示
   */
  debug() {
    console.log('=== I18n Debug Info ===');
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
      console.log('  auth.logout:', this.t('auth.logout'));
      console.log('  common.language:', this.t('common.language'));
    }
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.observers = [];
    console.log('I18n: Cleaned up');
  }
}

// グローバルインスタンスの作成と公開
const i18nInstance = new I18n();

// グローバルに公開（互換性のため）
if (typeof window !== 'undefined') {
  window.i18n = i18nInstance;
  window.I18n = I18n;
}

// デフォルトエクスポート
export default i18nInstance;

console.log("I18n: Module loaded and instance created");
