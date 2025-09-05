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
      "developer": "開発者管理",
      "multilingual_admin": "多言語管理"
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
      "evaluator": "評価者",
      "my_assignments": "私の担当",
      "in_progress": "進行中",
      "items_count": "件",
      "search_placeholder": "評価対象者名で検索...",
      "all_status": "すべてのステータス",
      "all_users": "すべてのユーザー",
      "all_assignments": "すべての担当",
      "assigned": "担当割り当て済み",
      "unassigned": "担当未割り当て",
      "my_evaluations": "私の担当評価",
      "other_evaluators": "他の評価者",
      "urgent": "緊急（承認待ち）",
      "this_week": "今週作成",
      "own_evaluations_only": "あなたの評価のみ表示されます",
      "reset_filters": "フィルターリセット",
      "no_matching_evaluations": "条件に合致する評価が見つかりません",
      "assigned_to_me": "担当",
      "requires_approval": "要承認",
      "updated_at": "更新日",
      "assignment_status": "担当状況"
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
      "title": "ステータス",
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
    },

    // ===== 多言語管理 =====
    "multilingual": {
      "title": "多言語管理",
      "current_language": "現在の編集言語",
      "categories": "カテゴリ",
      "job_types": "職種",
      "evaluation_items": "評価項目",
      "periods": "評価期間",
      "categories_list": "カテゴリ一覧",
      "job_types_list": "職種一覧",
      "evaluation_items_list": "評価項目一覧",
      "periods_list": "評価期間一覧",
      "edit_category": "カテゴリ編集",
      "edit_job_type": "職種編集",
      "edit_evaluation_item": "評価項目編集",
      "edit_period": "評価期間編集",
      "edit_multilingual": "多言語編集",
      "category_name": "カテゴリ名",
      "job_type_name": "職種名",
      "evaluation_item_name": "評価項目名",
      "period_name": "期間名",
      "description": "説明",
      "display_order": "表示順",
      "select_item_to_edit": "編集するアイテムを選択してください",
      "no_categories": "カテゴリがありません",
      "no_job_types": "職種がありません",
      "no_evaluation_items": "評価項目がありません",
      "no_periods": "評価期間がありません",
      "setup_initial_data": "初期データ作成",
      "migrate_data": "データ移行",
      "confirm_setup_initial_data": "初期多言語データを作成しますか？",
      "confirm_migrate_data": "既存データを多言語形式に移行しますか？",
      "setting_up_data": "データを設定中...",
      "migrating_data": "データを移行中...",
      "setup_completed": "初期データの設定が完了しました",
      "migration_completed": "データ移行が完了しました",
      "setup_error": "初期データ設定中にエラーが発生しました",
      "migration_error": "データ移行中にエラーが発生しました"
    },

    // ===== 翻訳品質管理 =====
    "translation_quality": {
      "title": "翻訳品質管理",
      "total_translations": "総翻訳数",
      "manual_verified": "手動検証済み",
      "average_quality": "平均品質スコア",
      "needs_review": "要レビュー",
      "filter_by_quality": "品質でフィルタ",
      "high_quality": "高品質 (0.8+)",
      "medium_quality": "中品質 (0.5-0.8)",
      "low_quality": "低品質 (<0.5)",
      "unverified": "未検証",
      "language_pair": "言語ペア",
      "translation_service": "翻訳サービス",
      "automatic": "自動翻訳",
      "fallback": "フォールバック",
      "manual": "手動翻訳",
      "translations_list": "翻訳一覧",
      "source_text": "原文",
      "translated_text": "翻訳文",
      "languages": "言語",
      "quality": "品質",
      "service": "サービス",
      "status": "状態",
      "no_translations": "該当する翻訳が見つかりません",
      "edit_translation": "翻訳の編集",
      "original_text": "原文",
      "current_translation": "現在の翻訳",
      "improved_translation": "改善された翻訳",
      "quality_score": "品質スコア",
      "improvement_notes": "改善メモ",
      "quality_analysis": "品質分析"
    }
  },
  
  // ===== 英語翻訳 =====
  en: {
    "app": {
      "title": "Evaluation Management System",
      "system_name": "Construction Industry Evaluation Management System",
      "loading": "Loading...",
      "welcome": "Welcome",
      "version": "Version",
      "copyright": "Copyright"
    },
    
    // ===== Navigation =====
    "nav": {
      "dashboard": "Dashboard",
      "evaluations": "Evaluation List",
      "evaluation": "Evaluation Input",
      "goal_approvals": "Goal Approvals",
      "goal_setting": "Goal Setting",
      "goals": "Goal Setting", 
      "users": "User Management",
      "settings": "Settings",
      "logout": "Logout",
      "home": "Home",
      "profile": "Profile",
      "help": "Help",
      "about": "About This System",
      "reports": "Reports",
      "developer": "Developer Management",
      "multilingual_admin": "Multilingual Management"
    },
    
    // ===== Dashboard =====
    "dashboard": {
      "title": "Dashboard",
      "overview": "System Overview",
      "system_overview": "System overview and latest activity status",
      "total_users": "Total Users",
      "active_users": "Active Users",
      "completed_evaluations": "Completed Evaluations",
      "pending_evaluations": "Pending Evaluations",
      "recent_evaluations": "Recent Evaluations",
      "no_recent_evaluations": "No recent evaluations",
      "performance_chart": "Performance Chart",
      "statistics": "Statistics",
      "user_activity": "User Activity",
      "system_status": "System Status",
      "evaluation_progress": "Evaluation Progress",
      "monthly_stats": "Monthly Statistics",
      "total_goals": "Total Goals",
      "completed_goals": "Completed Goals",
      "total_employees": "Total Employees",
      "pending_evaluations_count": "Processing Evaluations",
      "completed_evaluations_count": "Completed Evaluations",
      "performance_analysis": "Performance Analysis"
    },

    // ===== Authentication =====
    "auth": {
      "login": "Login",
      "logout": "Logout",
      "confirm_logout": "Are you sure you want to logout?",
      "email": "Email Address",
      "email_label": "Email Address",
      "password": "Password",
      "password_label": "Password",
      "remember_me": "Keep me logged in",
      "forgot_password": "Forgot Password?",
      "register": "Register",
      "sign_in": "Sign In",
      "sign_out": "Sign Out",
      "sign_up": "Sign Up",
      "name": "Name",
      "company": "Company Name",
      "login_failed": "Login failed",
      "register_success": "Registration completed",
      "reset_password": "Reset Password",
      "confirm_password": "Confirm Password",
      "register_admin": "Register Administrator Account",
      "register_admin_link": "Click here to register new administrator account",
      "register_user": "User Registration",
      "logging_in": "Logging in...",
      "sign_in_hint": "Please enter your account information",
      "register_admin_success": "Registration application completed",
      "register_admin_success_detail": "Please wait for approval by the system developer."
    },
    
    // ===== Evaluations =====
    "evaluations": {
      "title": "Evaluation List",
      "form_title": "Evaluation Form",
      "new_evaluation": "New Evaluation",
      "my_evaluations": "My Evaluations",
      "pending_evaluations": "Pending Evaluations",
      "total_score": "Total Score",
      "target_user": "Target User",
      "period": "Evaluation Period",
      "evaluation_period": "Evaluation Period",
      "target_info": "Target Information",
      "confirm_submit": "Submit evaluation? You cannot edit after submission.",
      "evaluator": "Evaluator",
      "my_assignments": "My Assignments",
      "in_progress": "In Progress",
      "items_count": " items",
      "search_placeholder": "Search by target user name...",
      "all_status": "All Status",
      "all_users": "All Users",
      "all_assignments": "All Assignments",
      "assigned": "Assigned",
      "unassigned": "Unassigned",
      "my_evaluations": "My Evaluations",
      "other_evaluators": "Other Evaluators",
      "urgent": "Urgent (Pending Approval)",
      "this_week": "This Week",
      "own_evaluations_only": "Only your evaluations are displayed",
      "reset_filters": "Reset Filters",
      "no_matching_evaluations": "No evaluations match the criteria",
      "assigned_to_me": "Assigned",
      "requires_approval": "Requires Approval",
      "updated_at": "Updated Date",
      "assignment_status": "Assignment Status"
    },

    "evaluation": {
      "title": "Evaluation Input",
      "new_evaluation": "Create New Evaluation",
      "self_assessment": "Self-Assessment",
      "evaluator_assessment": "Evaluator Assessment",
      "score": "Score",
      "comment": "Comment",
      "submit": "Submit",
      "period": "Evaluation Period",
      "target": "Target User",
      "evaluator": "Evaluator",
      "category": "Category",
      "item": "Evaluation Item",
      "job_type": "Job Type",
      "target_info": "Target Information",
      "select_target_user": "Please select target user",
      "select_period": "Please select evaluation period",
      "goal_achievement": "Goal Achievement Evaluation",
      "no_goals_set": "No goals set for evaluation target.",
      "confirm_submit": "Submit evaluation? You cannot edit after submission.",
      "self_assessment_score": "Self-Assessment Score",
      "evaluator_assessment_score": "Evaluator Assessment Score"
    },
    
    // ===== Error Messages =====
    "errors": {
      "login_failed": "Login failed",
      "logout_failed": "Logout failed",
      "invalid_email_password": "Invalid email address or password",
      "account_inactive": "Account is inactive",
      "email_already_in_use": "This email address is already in use",
      "weak_password": "Password is too weak",
      "login_failed_generic": "Login failed",
      "network_error": "Network error occurred",
      "permission_denied": "Permission denied",
      "not_found": "Data not found",
      "validation_failed": "Input validation failed",
      "server_error": "Server error occurred",
      "timeout": "Request timed out",
      "connection_failed": "Connection failed",
      "invalid_data": "Invalid data",
      "unauthorized": "Authentication required",
      "forbidden": "Access denied",
      "loading_failed": "Failed to load data.",
      "email_password_required": "Please enter email address and password.",
      "all_fields_required": "Please fill in all required fields.",
      "access_denied": "You don't have permission to access this page.",
      "passwords_not_match": "Passwords do not match.",
      "passwords_match": "Passwords match.",
      "chart_library_failed": "Failed to load chart library"
    },
    
    // ===== Common =====
    "common": {
      "language": "Language",
      "notifications": "Notifications",
      "mark_all_read": "Mark All as Read",
      "no_notifications": "No notifications",
      "quick_actions": "Quick Actions",
      "account": "Account",
      "demo_account": "Demo Account",
      "administrator": "Administrator",
      "management": "Management",
      "system": "System",
      "profile": "Profile",
      "settings": "Settings",
      "support": "Support",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "add": "Add",
      "search": "Search",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "confirm": "Confirm",
      "yes": "Yes",
      "no": "No",
      "close": "Close",
      "submit": "Submit",
      "reset": "Reset",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "select": "Please select",
      "clear": "Clear",
      "toggle_navigation": "Toggle Navigation",
      "user": "User",
      "last_login": "Last Login",
      "unknown": "Unknown",
      "refresh": "Refresh",
      "refreshing": "Refreshing...",
      "reload": "Reload",
      "view_all": "View All",
      "no_data": "No data available",
      "details": "Details",
      "export": "Export",
      "all": "All",
      "add_success": "Added successfully",
      "edit_user": "Edit User",
      "current_status": "Current Status",
      "load_draft": "Load Draft",
      "save_draft": "Save Draft",
      "back_to_login": "Back to Login",
      "created_at": "Created Date",
      "actions": "Actions",
      "retry": "Retry"
    },

    // ===== User Management =====
    "users": {
      "title": "User Management",
      "subtitle": "Manage users within the organization",
      "invite": "Invite New User",
      "invite_user": "Invite User",
      "role": "Role",
      "status": "Status",
      "created_at": "Registration Date",
      "actions": "Actions",
      "search_users": "Search users...",
      "pending_approvals": "Pending Approval Users",
      "active_users": "User List",
      "invite_title": "Invite New User",
      "send_invitation": "Send Invitation",
      "invite_link_created": "Invitation link created",
      "invite_link_instructions": "Copy and share the following link with the user you want to invite. The link is valid for 7 days.",
      "copy_success": "Link copied!",
      "confirm_approve": "Approve this user?",
      "approve_success": "User approved.",
      "confirm_reject": "Reject (delete) this user?",
      "reject_success": "User deleted.",
      "edit_user": "Edit User Information",
      "total_users": "Total Users",
      "pending_users": "Pending Approval",
      "admin_users": "Administrators",
      "all_status": "All Status",
      "active": "Active",
      "inactive": "Inactive",
      "pending": "Pending",
      "all_roles": "All Roles",
      "invitation_message": "Invitation Message (Optional)"
    },

    // ===== Goal Management =====
    "goals": {
      "title": "Goal Setting",
      "approvals_title": "Goal Approvals",
      "weight": "Weight",
      "total_weight": "Total Weight",
      "add_goal": "Add Goal",
      "apply": "Apply",
      "approve": "Approve",
      "reject": "Reject",
      "goal_text": "Goal Content",
      "weight_percent": "Weight (%)",
      "pending_goals": "Pending Goals",
      "approved_goals": "Approved Goals",
      "about_goal_setting": "About Goal Setting",
      "max_goals_info": "You can set up to {{maxGoals}} goals",
      "total_weight_100_info": "Total weight must be 100%",
      "admin_approval_info": "Administrator approval is required after application",
      "submitted_at": "Application Date",
      "confirm_approve": "Approve this goal?",
      "confirm_reject": "Reject this goal?",
      "rejection_reason_prompt": "Please enter the reason for rejection.",
      "select_evaluation_period": "Please select evaluation period",
      "confirm_apply": "Apply goals?",
      "approve_success": "Goal approved.",
      "reject_success": "Goal rejected."
    },

    // ===== Roles =====
    "roles": {
      "admin": "Administrator",
      "user": "User",
      "developer": "Developer",
      "evaluator": "Evaluator",
      "worker": "Worker",
      "all": "All Roles"
    },

    // ===== Status =====
    "status": {
      "title": "Status",
      "active": "Active",
      "inactive": "Inactive",
      "pending": "Pending",
      "completed": "Completed",
      "suspended": "Suspended",
      "developer_approval_pending": "Pending Developer Approval",
      "draft": "Draft",
      "approved": "Approved",
      "rejected": "Rejected",
      "self_assessed": "Self-Assessment Complete",
      "approved_by_evaluator": "Approved by Evaluator",
      "pending_submission": "Pending Worker Submission",
      "pending_evaluation": "Pending Evaluator Assessment",
      "pending_approval": "Pending Administrator Approval"
    },

    // ===== Chart Items =====
    "chart_items": {
      "technical_skill": "Technical Skill",
      "quality": "Quality",
      "safety": "Safety",
      "cooperation": "Cooperation",
      "diligence": "Diligence"
    },

    // ===== Time =====
    "time": {
      "just_now": "Just now",
      "minutes_ago": "{{count}} minutes ago",
      "hours_ago": "{{count}} hours ago",
      "days_ago": "{{count}} days ago"
    },

    // ===== Notifications =====
    "notifications": {
      "type": {
        "evaluation_pending": "Evaluation Pending",
        "evaluation_completed": "Evaluation Completed",
        "user_assigned": "User Assigned",
        "system_update": "System Update",
        "reminder": "Reminder"
      },
      "evaluation_pending": "{{userName}}'s evaluation is pending approval",
      "admin_evaluation_pending": "{{userName}}'s evaluation is pending approval by {{evaluatorName}}"
    },

    // ===== Messages =====
    "messages": {
      "success": "Operation completed successfully",
      "error": "An error occurred",
      "loading": "Loading...",
      "no_data": "No data available",
      "save_success": "Saved successfully",
      "delete_success": "Deleted successfully",
      "approval_success": "Approved successfully",
      "rejection_success": "Rejected successfully",
      "invitation_sent": "Invitation sent",
      "password_reset_sent": "Password reset email sent",
      "login_success": "Welcome, {{userName}}",
      "logout_success": "Logged out successfully.",
      "mark_all_notifications_read": "All notifications marked as read",
      "mark_notifications_failed": "Failed to mark notifications as read"
    },

    // ===== Multilingual Management =====
    "multilingual": {
      "title": "Multilingual Management",
      "current_language": "Current Editing Language",
      "categories": "Categories",
      "job_types": "Job Types",
      "evaluation_items": "Evaluation Items",
      "periods": "Evaluation Periods",
      "categories_list": "Categories List",
      "job_types_list": "Job Types List",
      "evaluation_items_list": "Evaluation Items List",
      "periods_list": "Evaluation Periods List",
      "edit_category": "Edit Category",
      "edit_job_type": "Edit Job Type",
      "edit_evaluation_item": "Edit Evaluation Item",
      "edit_period": "Edit Evaluation Period",
      "edit_multilingual": "Multilingual Edit",
      "category_name": "Category Name",
      "job_type_name": "Job Type Name",
      "evaluation_item_name": "Evaluation Item Name",
      "period_name": "Period Name",
      "description": "Description",
      "display_order": "Display Order",
      "select_item_to_edit": "Select an item to edit",
      "no_categories": "No categories available",
      "no_job_types": "No job types available",
      "no_evaluation_items": "No evaluation items available",
      "no_periods": "No evaluation periods available",
      "setup_initial_data": "Setup Initial Data",
      "migrate_data": "Migrate Data",
      "confirm_setup_initial_data": "Create initial multilingual data?",
      "confirm_migrate_data": "Migrate existing data to multilingual format?",
      "setting_up_data": "Setting up data...",
      "migrating_data": "Migrating data...",
      "setup_completed": "Initial data setup completed",
      "migration_completed": "Data migration completed",
      "setup_error": "Error occurred during initial data setup",
      "migration_error": "Error occurred during data migration"
    },

    // ===== Translation Quality Management =====
    "translation_quality": {
      "title": "Translation Quality Management",
      "total_translations": "Total Translations",
      "manual_verified": "Manual Verified",
      "average_quality": "Average Quality Score",
      "needs_review": "Needs Review",
      "filter_by_quality": "Filter by Quality",
      "high_quality": "High Quality (0.8+)",
      "medium_quality": "Medium Quality (0.5-0.8)",
      "low_quality": "Low Quality (<0.5)",
      "unverified": "Unverified",
      "language_pair": "Language Pair",
      "translation_service": "Translation Service",
      "automatic": "Automatic",
      "fallback": "Fallback",
      "manual": "Manual",
      "translations_list": "Translations List",
      "source_text": "Source Text",
      "translated_text": "Translated Text",
      "languages": "Languages",
      "quality": "Quality",
      "service": "Service",
      "status": "Status",
      "no_translations": "No translations found matching criteria",
      "edit_translation": "Edit Translation",
      "original_text": "Original Text",
      "current_translation": "Current Translation",
      "improved_translation": "Improved Translation",
      "quality_score": "Quality Score",
      "improvement_notes": "Improvement Notes",
      "quality_analysis": "Quality Analysis"
    },

    // ===== Report =====
    "report": {
      "summary": "Summary",
      "comparison": "Comparison", 
      "history": "History",
      "overall_evaluation": "Overall Evaluation",
      "detailed_scores": "Detailed Scores",
      "score_comparison": "Score Comparison",
      "process_history": "Process History",
      "last_3_months": "Last 3 Months",
      "last_6_months": "Last 6 Months",
      "this_year": "This Year",
      "all_time": "All Time",
      "total_evaluations": "Total Evaluations",
      "completed_evaluations": "Completed Evaluations",
      "average_score": "Average Score",
      "improvement_rate": "Improvement Rate",
      "performance_trend": "Performance Trend",
      "evaluation_status": "Evaluation Status Distribution",
      "top_performers": "Top Performers",
      "admin_analytics": "Admin Analytics",
      "detailed_data": "Detailed Data"
    }
  },

  // ===== ベトナム語翻訳 =====
  vi: {
    "app": {
      "title": "Hệ thống quản lý đánh giá",
      "system_name": "Hệ thống quản lý đánh giá ngành xây dựng",
      "loading": "Đang tải...",
      "welcome": "Chào mừng",
      "version": "Phiên bản",
      "copyright": "Bản quyền"
    },
    
    // ===== Navigation =====
    "nav": {
      "dashboard": "Bảng điều khiển",
      "evaluations": "Danh sách đánh giá",
      "evaluation": "Nhập đánh giá",
      "goal_approvals": "Phê duyệt mục tiêu",
      "goal_setting": "Thiết lập mục tiêu",
      "goals": "Thiết lập mục tiêu", 
      "users": "Quản lý người dùng",
      "settings": "Cài đặt",
      "logout": "Đăng xuất",
      "home": "Trang chủ",
      "profile": "Hồ sơ",
      "help": "Trợ giúp",
      "about": "Về hệ thống này",
      "reports": "Báo cáo",
      "developer": "Quản lý nhà phát triển",
      "multilingual_admin": "Quản lý đa ngôn ngữ"
    },
    
    // ===== Dashboard =====
    "dashboard": {
      "title": "Bảng điều khiển",
      "overview": "Tổng quan hệ thống",
      "system_overview": "Tổng quan hệ thống và tình trạng hoạt động mới nhất",
      "total_users": "Tổng số người dùng",
      "active_users": "Người dùng hoạt động",
      "completed_evaluations": "Đánh giá hoàn thành",
      "pending_evaluations": "Đánh giá chờ xử lý",
      "recent_evaluations": "Đánh giá gần đây",
      "no_recent_evaluations": "Không có đánh giá gần đây",
      "performance_chart": "Biểu đồ hiệu suất",
      "statistics": "Thống kê",
      "user_activity": "Hoạt động người dùng",
      "system_status": "Tình trạng hệ thống",
      "evaluation_progress": "Tiến độ đánh giá",
      "monthly_stats": "Thống kê tháng",
      "total_goals": "Tổng số mục tiêu",
      "completed_goals": "Mục tiêu hoàn thành",
      "total_employees": "Tổng số nhân viên",
      "pending_evaluations_count": "Đánh giá đang xử lý",
      "completed_evaluations_count": "Đánh giá đã hoàn thành",
      "performance_analysis": "Phân tích hiệu suất"
    },

    // ===== Authentication =====
    "auth": {
      "login": "Đăng nhập",
      "logout": "Đăng xuất",
      "confirm_logout": "Bạn có chắc chắn muốn đăng xuất?",
      "email": "Địa chỉ email",
      "email_label": "Địa chỉ email",
      "password": "Mật khẩu",
      "password_label": "Mật khẩu",
      "remember_me": "Giữ tôi đăng nhập",
      "forgot_password": "Quên mật khẩu?",
      "register": "Đăng ký",
      "sign_in": "Đăng nhập",
      "sign_out": "Đăng xuất",
      "sign_up": "Đăng ký",
      "name": "Họ tên",
      "company": "Tên công ty",
      "login_failed": "Đăng nhập thất bại",
      "register_success": "Đăng ký hoàn tất",
      "reset_password": "Đặt lại mật khẩu",
      "confirm_password": "Xác nhận mật khẩu",
      "register_admin": "Đăng ký tài khoản quản trị viên",
      "register_admin_link": "Nhấn vào đây để đăng ký tài khoản quản trị viên mới",
      "register_user": "Đăng ký người dùng",
      "logging_in": "Đang đăng nhập...",
      "sign_in_hint": "Vui lòng nhập thông tin tài khoản của bạn",
      "register_admin_success": "Đơn đăng ký hoàn tất",
      "register_admin_success_detail": "Vui lòng chờ phê duyệt từ nhà phát triển hệ thống."
    },
    
    // ===== Evaluations =====
    "evaluations": {
      "title": "Danh sách đánh giá",
      "form_title": "Biểu mẫu đánh giá",
      "new_evaluation": "Đánh giá mới",
      "my_evaluations": "Đánh giá của tôi",
      "pending_evaluations": "Đánh giá chờ xử lý",
      "total_score": "Điểm tổng",
      "target_user": "Người được đánh giá",
      "period": "Kỳ đánh giá",
      "evaluation_period": "Kỳ đánh giá",
      "target_info": "Thông tin đối tượng",
      "confirm_submit": "Gửi đánh giá? Bạn không thể chỉnh sửa sau khi gửi.",
      "evaluator": "Người đánh giá",
      "my_assignments": "Nhiệm vụ của tôi",
      "in_progress": "Đang thực hiện",
      "items_count": " mục",
      "search_placeholder": "Tìm kiếm theo tên người được đánh giá...",
      "all_status": "Tất cả trạng thái",
      "all_users": "Tất cả người dùng",
      "all_assignments": "Tất cả phân công",
      "assigned": "Đã phân công",
      "unassigned": "Chưa phân công",
      "my_evaluations": "Đánh giá của tôi",
      "other_evaluators": "Người đánh giá khác",
      "urgent": "Khẩn cấp (Chờ phê duyệt)",
      "this_week": "Tuần này",
      "own_evaluations_only": "Chỉ hiển thị đánh giá của bạn",
      "reset_filters": "Đặt lại bộ lọc",
      "no_matching_evaluations": "Không tìm thấy đánh giá phù hợp với tiêu chí",
      "assigned_to_me": "Được giao",
      "requires_approval": "Cần phê duyệt",
      "updated_at": "Ngày cập nhật",
      "assignment_status": "Trạng thái phân công"
    },

    "evaluation": {
      "title": "Nhập đánh giá",
      "new_evaluation": "Tạo đánh giá mới",
      "self_assessment": "Tự đánh giá",
      "evaluator_assessment": "Đánh giá của người đánh giá",
      "score": "Điểm",
      "comment": "Bình luận",
      "submit": "Gửi",
      "period": "Kỳ đánh giá",
      "target": "Người được đánh giá",
      "evaluator": "Người đánh giá",
      "category": "Danh mục",
      "item": "Mục đánh giá",
      "job_type": "Loại công việc",
      "target_info": "Thông tin đối tượng",
      "select_target_user": "Vui lòng chọn người được đánh giá",
      "select_period": "Vui lòng chọn kỳ đánh giá",
      "goal_achievement": "Đánh giá mức độ đạt mục tiêu",
      "no_goals_set": "Chưa thiết lập mục tiêu cho đối tượng đánh giá.",
      "confirm_submit": "Gửi đánh giá? Bạn không thể chỉnh sửa sau khi gửi.",
      "self_assessment_score": "Điểm tự đánh giá",
      "evaluator_assessment_score": "Điểm đánh giá của người đánh giá"
    },
    
    // ===== Error Messages =====
    "errors": {
      "login_failed": "Đăng nhập thất bại",
      "logout_failed": "Đăng xuất thất bại",
      "invalid_email_password": "Địa chỉ email hoặc mật khẩu không đúng",
      "account_inactive": "Tài khoản không hoạt động",
      "email_already_in_use": "Địa chỉ email này đã được sử dụng",
      "weak_password": "Mật khẩu quá yếu",
      "login_failed_generic": "Đăng nhập thất bại",
      "network_error": "Lỗi mạng đã xảy ra",
      "permission_denied": "Không có quyền truy cập",
      "not_found": "Không tìm thấy dữ liệu",
      "validation_failed": "Xác thực đầu vào thất bại",
      "server_error": "Lỗi máy chủ đã xảy ra",
      "timeout": "Yêu cầu hết thời gian",
      "connection_failed": "Kết nối thất bại",
      "invalid_data": "Dữ liệu không hợp lệ",
      "unauthorized": "Yêu cầu xác thực",
      "forbidden": "Truy cập bị từ chối",
      "loading_failed": "Không thể tải dữ liệu.",
      "email_password_required": "Vui lòng nhập địa chỉ email và mật khẩu.",
      "all_fields_required": "Vui lòng điền vào tất cả các trường bắt buộc.",
      "access_denied": "Bạn không có quyền truy cập trang này.",
      "passwords_not_match": "Mật khẩu không khớp.",
      "passwords_match": "Mật khẩu khớp.",
      "chart_library_failed": "Không thể tải thư viện biểu đồ"
    },
    
    // ===== Common =====
    "common": {
      "language": "Ngôn ngữ",
      "notifications": "Thông báo",
      "mark_all_read": "Đánh dấu tất cả đã đọc",
      "no_notifications": "Không có thông báo",
      "quick_actions": "Hành động nhanh",
      "account": "Tài khoản",
      "demo_account": "Tài khoản demo",
      "administrator": "Quản trị viên",
      "management": "Quản lý",
      "system": "Hệ thống",
      "profile": "Hồ sơ",
      "settings": "Cài đặt",
      "support": "Hỗ trợ",
      "save": "Lưu",
      "cancel": "Hủy",
      "delete": "Xóa",
      "edit": "Chỉnh sửa",
      "add": "Thêm",
      "search": "Tìm kiếm",
      "loading": "Đang tải...",
      "error": "Lỗi",
      "success": "Thành công",
      "confirm": "Xác nhận",
      "yes": "Có",
      "no": "Không",
      "close": "Đóng",
      "submit": "Gửi",
      "reset": "Đặt lại",
      "back": "Quay lại",
      "next": "Tiếp theo",
      "previous": "Trước",
      "select": "Vui lòng chọn",
      "clear": "Xóa",
      "toggle_navigation": "Chuyển đổi điều hướng",
      "user": "Người dùng",
      "last_login": "Đăng nhập lần cuối",
      "unknown": "Không xác định",
      "refresh": "Làm mới",
      "refreshing": "Đang làm mới...",
      "reload": "Tải lại",
      "view_all": "Xem tất cả",
      "no_data": "Không có dữ liệu",
      "details": "Chi tiết",
      "export": "Xuất",
      "all": "Tất cả",
      "add_success": "Đã thêm thành công",
      "edit_user": "Chỉnh sửa người dùng",
      "current_status": "Trạng thái hiện tại",
      "load_draft": "Tải bản nháp",
      "save_draft": "Lưu bản nháp",
      "back_to_login": "Quay lại đăng nhập",
      "created_at": "Ngày tạo",
      "actions": "Hành động",
      "retry": "Thử lại"
    },

    // ===== User Management =====
    "users": {
      "title": "Quản lý người dùng",
      "subtitle": "Quản lý người dùng trong tổ chức",
      "invite": "Mời người dùng mới",
      "invite_user": "Mời người dùng",
      "role": "Vai trò",
      "status": "Trạng thái",
      "created_at": "Ngày đăng ký",
      "actions": "Hành động",
      "search_users": "Tìm kiếm người dùng...",
      "pending_approvals": "Người dùng chờ phê duyệt",
      "active_users": "Danh sách người dùng",
      "invite_title": "Mời người dùng mới",
      "send_invitation": "Gửi lời mời",
      "invite_link_created": "Liên kết mời đã được tạo",
      "invite_link_instructions": "Sao chép và chia sẻ liên kết sau với người dùng bạn muốn mời. Liên kết có hiệu lực trong 7 ngày.",
      "copy_success": "Đã sao chép liên kết!",
      "confirm_approve": "Phê duyệt người dùng này?",
      "approve_success": "Đã phê duyệt người dùng.",
      "confirm_reject": "Từ chối (xóa) người dùng này?",
      "reject_success": "Đã xóa người dùng.",
      "edit_user": "Chỉnh sửa thông tin người dùng",
      "total_users": "Tổng số người dùng",
      "pending_users": "Chờ phê duyệt",
      "admin_users": "Quản trị viên",
      "all_status": "Tất cả trạng thái",
      "active": "Hoạt động",
      "inactive": "Không hoạt động",
      "pending": "Chờ xử lý",
      "all_roles": "Tất cả vai trò",
      "invitation_message": "Tin nhắn mời (Tùy chọn)"
    },

    // ===== Goal Management =====
    "goals": {
      "title": "Thiết lập mục tiêu",
      "approvals_title": "Phê duyệt mục tiêu",
      "weight": "Trọng số",
      "total_weight": "Tổng trọng số",
      "add_goal": "Thêm mục tiêu",
      "apply": "Áp dụng",
      "approve": "Phê duyệt",
      "reject": "Từ chối",
      "goal_text": "Nội dung mục tiêu",
      "weight_percent": "Trọng số (%)",
      "pending_goals": "Mục tiêu chờ xử lý",
      "approved_goals": "Mục tiêu đã phê duyệt",
      "about_goal_setting": "Về thiết lập mục tiêu",
      "max_goals_info": "Bạn có thể thiết lập tối đa {{maxGoals}} mục tiêu",
      "total_weight_100_info": "Tổng trọng số phải bằng 100%",
      "admin_approval_info": "Cần phê duyệt của quản trị viên sau khi áp dụng",
      "submitted_at": "Ngày áp dụng",
      "confirm_approve": "Phê duyệt mục tiêu này?",
      "confirm_reject": "Từ chối mục tiêu này?",
      "rejection_reason_prompt": "Vui lòng nhập lý do từ chối.",
      "select_evaluation_period": "Vui lòng chọn kỳ đánh giá",
      "confirm_apply": "Áp dụng mục tiêu?",
      "approve_success": "Đã phê duyệt mục tiêu.",
      "reject_success": "Đã từ chối mục tiêu."
    },

    // ===== Roles =====
    "roles": {
      "admin": "Quản trị viên",
      "user": "Người dùng",
      "developer": "Nhà phát triển",
      "evaluator": "Người đánh giá",
      "worker": "Công nhân",
      "all": "Tất cả vai trò"
    },

    // ===== Status =====
    "status": {
      "title": "Trạng thái",
      "active": "Hoạt động",
      "inactive": "Không hoạt động",
      "pending": "Chờ xử lý",
      "completed": "Hoàn thành",
      "suspended": "Tạm ngừng",
      "developer_approval_pending": "Chờ phê duyệt nhà phát triển",
      "draft": "Bản nháp",
      "approved": "Đã phê duyệt",
      "rejected": "Bị từ chối",
      "self_assessed": "Tự đánh giá hoàn tất",
      "approved_by_evaluator": "Đã phê duyệt bởi người đánh giá",
      "pending_submission": "Chờ nộp của công nhân",
      "pending_evaluation": "Chờ đánh giá của người đánh giá",
      "pending_approval": "Chờ phê duyệt của quản trị viên"
    },

    // ===== Chart Items =====
    "chart_items": {
      "technical_skill": "Kỹ năng kỹ thuật",
      "quality": "Chất lượng",
      "safety": "An toàn",
      "cooperation": "Hợp tác",
      "diligence": "Chuyên cần"
    },

    // ===== Time =====
    "time": {
      "just_now": "Vừa xong",
      "minutes_ago": "{{count}} phút trước",
      "hours_ago": "{{count}} giờ trước",
      "days_ago": "{{count}} ngày trước"
    },

    // ===== Notifications =====
    "notifications": {
      "type": {
        "evaluation_pending": "Đánh giá chờ xử lý",
        "evaluation_completed": "Đánh giá hoàn thành",
        "user_assigned": "Người dùng được giao",
        "system_update": "Cập nhật hệ thống",
        "reminder": "Nhắc nhở"
      },
      "evaluation_pending": "Đánh giá của {{userName}} đang chờ phê duyệt",
      "admin_evaluation_pending": "Đánh giá của {{userName}} đang chờ phê duyệt bởi {{evaluatorName}}"
    },

    // ===== Messages =====
    "messages": {
      "success": "Thao tác hoàn tất thành công",
      "error": "Đã xảy ra lỗi",
      "loading": "Đang tải...",
      "no_data": "Không có dữ liệu",
      "save_success": "Đã lưu thành công",
      "delete_success": "Đã xóa thành công",
      "approval_success": "Đã phê duyệt thành công",
      "rejection_success": "Đã từ chối thành công",
      "invitation_sent": "Đã gửi lời mời",
      "password_reset_sent": "Đã gửi email đặt lại mật khẩu",
      "login_success": "Chào mừng, {{userName}}",
      "logout_success": "Đã đăng xuất thành công.",
      "mark_all_notifications_read": "Đã đánh dấu tất cả thông báo đã đọc",
      "mark_notifications_failed": "Không thể đánh dấu thông báo đã đọc"
    },

    // ===== Quản lý đa ngôn ngữ =====
    "multilingual": {
      "title": "Quản lý đa ngôn ngữ",
      "current_language": "Ngôn ngữ chỉnh sửa hiện tại",
      "categories": "Danh mục",
      "job_types": "Loại công việc",
      "evaluation_items": "Mục đánh giá",
      "periods": "Kỳ đánh giá",
      "categories_list": "Danh sách danh mục",
      "job_types_list": "Danh sách loại công việc",
      "evaluation_items_list": "Danh sách mục đánh giá",
      "periods_list": "Danh sách kỳ đánh giá",
      "edit_category": "Chỉnh sửa danh mục",
      "edit_job_type": "Chỉnh sửa loại công việc",
      "edit_evaluation_item": "Chỉnh sửa mục đánh giá",
      "edit_period": "Chỉnh sửa kỳ đánh giá",
      "edit_multilingual": "Chỉnh sửa đa ngôn ngữ",
      "category_name": "Tên danh mục",
      "job_type_name": "Tên loại công việc",
      "evaluation_item_name": "Tên mục đánh giá",
      "period_name": "Tên kỳ",
      "description": "Mô tả",
      "display_order": "Thứ tự hiển thị",
      "select_item_to_edit": "Chọn mục để chỉnh sửa",
      "no_categories": "Không có danh mục",
      "no_job_types": "Không có loại công việc",
      "no_evaluation_items": "Không có mục đánh giá",
      "no_periods": "Không có kỳ đánh giá",
      "setup_initial_data": "Tạo dữ liệu ban đầu",
      "migrate_data": "Di chuyển dữ liệu",
      "confirm_setup_initial_data": "Tạo dữ liệu đa ngôn ngữ ban đầu?",
      "confirm_migrate_data": "Di chuyển dữ liệu hiện có sang định dạng đa ngôn ngữ?",
      "setting_up_data": "Đang thiết lập dữ liệu...",
      "migrating_data": "Đang di chuyển dữ liệu...",
      "setup_completed": "Thiết lập dữ liệu ban đầu hoàn tất",
      "migration_completed": "Di chuyển dữ liệu hoàn tất",
      "setup_error": "Lỗi xảy ra trong quá trình thiết lập dữ liệu ban đầu",
      "migration_error": "Lỗi xảy ra trong quá trình di chuyển dữ liệu"
    },

    // ===== Quản lý chất lượng dịch thuật =====
    "translation_quality": {
      "title": "Quản lý chất lượng dịch thuật",
      "total_translations": "Tổng số dịch thuật",
      "manual_verified": "Đã xác minh thủ công",
      "average_quality": "Điểm chất lượng trung bình",
      "needs_review": "Cần xem xét",
      "filter_by_quality": "Lọc theo chất lượng",
      "high_quality": "Chất lượng cao (0.8+)",
      "medium_quality": "Chất lượng trung bình (0.5-0.8)",
      "low_quality": "Chất lượng thấp (<0.5)",
      "unverified": "Chưa xác minh",
      "language_pair": "Cặp ngôn ngữ",
      "translation_service": "Dịch vụ dịch thuật",
      "automatic": "Tự động",
      "fallback": "Dự phòng",
      "manual": "Thủ công",
      "translations_list": "Danh sách dịch thuật",
      "source_text": "Văn bản gốc",
      "translated_text": "Văn bản đã dịch",
      "languages": "Ngôn ngữ",
      "quality": "Chất lượng",
      "service": "Dịch vụ",
      "status": "Trạng thái",
      "no_translations": "Không tìm thấy dịch thuật phù hợp với tiêu chí",
      "edit_translation": "Chỉnh sửa dịch thuật",
      "original_text": "Văn bản gốc",
      "current_translation": "Dịch thuật hiện tại",
      "improved_translation": "Dịch thuật cải thiện",
      "quality_score": "Điểm chất lượng",
      "improvement_notes": "Ghi chú cải thiện",
      "quality_analysis": "Phân tích chất lượng"
    },

    // ===== Report =====
    "report": {
      "summary": "Tóm tắt",
      "comparison": "So sánh", 
      "history": "Lịch sử",
      "overall_evaluation": "Đánh giá tổng thể",
      "detailed_scores": "Điểm chi tiết",
      "score_comparison": "So sánh điểm",
      "process_history": "Lịch sử xử lý",
      "last_3_months": "3 tháng qua",
      "last_6_months": "6 tháng qua",
      "this_year": "Năm nay",
      "all_time": "Tất cả thời gian",
      "total_evaluations": "Tổng số đánh giá",
      "completed_evaluations": "Đánh giá hoàn thành",
      "average_score": "Điểm trung bình",
      "improvement_rate": "Tỷ lệ cải thiện",
      "performance_trend": "Xu hướng hiệu suất",
      "evaluation_status": "Phân bố trạng thái đánh giá",
      "top_performers": "Người có hiệu suất cao",
      "admin_analytics": "Phân tích quản trị",
      "detailed_data": "Dữ liệu chi tiết"
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
    // 本番環境では無効
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
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

