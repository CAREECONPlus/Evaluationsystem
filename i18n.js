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
      "forbidden": "アクセスが拒否されました",
      "loading_failed": "データの読み込みに失敗しました。",
      "email_password_required": "メールアドレスとパスワードを入力してください。",
      "all_fields_required": "すべての必須項目を入力してください。",
      "access_denied": "このページにアクセスする権限がありません。",
      "passwords_not_match": "パスワードが一致しません。",
      "passwords_match": "パスワードが一致しました。",
      "chart_library_failed": "チャートライブラリの読み込みに失敗しました"
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

    // ===== 設定 =====
    "settings": {
      "title": "設定",
      "job_types": "職種管理",
      "evaluation_periods": "評価期間",
      "evaluation_structure": "評価構造",
      "evaluation_structure_of": "の評価構造",
      "add_job_type": "職種を追加",
      "add_category": "カテゴリを追加",
      "add_item": "項目を追加",
      "delete_category": "カテゴリを削除",
      "save_changes": "変更を保存",
      "job_type_name_placeholder": "例: 建設作業員",
      "edit_job_type_name_placeholder": "新しい職種名",
      "add_period": "期間を追加",
      "edit_period": "期間を編集",
      "period_name_label": "期間名",
      "period_name_placeholder": "例: 2025年 上半期",
      "start_date_label": "開始日",
      "end_date_label": "終了日",
      "select_job_type_hint": "左のリストから職種を選択して評価項目を設定してください。",
      "no_categories_hint": "「カテゴリを追加」ボタンから評価カテゴリを作成してください。",
      "category_name_placeholder": "カテゴリ名（例: 技術スキル）",
      "item_name_placeholder": "評価項目名（例: 図面の読解力）",
      "confirm_delete_job_type": "この職種を削除しますか？関連する評価構造も全て削除されます。",
      "confirm_delete_period": "この評価期間を削除しますか？",
      "confirm_delete_category": "このカテゴリを削除しますか？カテゴリ内の評価項目も全て削除されます。",
      "confirm_delete_item": "この評価項目を削除しますか？",
      "unsaved_warning": "保存されていない変更があります。ページを離れてもよろしいですか？",
      "name_label": "名前",
      "add_jobType": "職種を追加",
      "edit_jobType": "職種を編集",
      "edit_category": "カテゴリを編集",
      "edit_item": "項目を編集",
      "no_job_types": "職種が登録されていません",
      "no_evaluation_periods": "評価期間が登録されていません",
      "no_structure_for_job_type": "この職種の評価構造が設定されていません"
    },

    // ===== 開発者管理 =====
    "developer": {
      "title": "開発者管理",
      "admin_approvals": "管理者アカウントの承認",
      "tenant_management": "テナント管理",
      "approve": "承認",
      "confirm_approve": "この管理者を承認し、新しいテナントを作成しますか？",
      "approve_success": "管理者を承認しました。",
      "confirm_password_reset": "{{email}} にパスワードリセットメールを送信しますか？",
      "confirm_suspend": "このテナントを利用停止にしますか？管理者はログインできなくなります。",
      "confirm_reactivate": "このテナントを再度有効化しますか？",
      "status_update_success": "テナントのステータスを更新しました。",
      "pending_admins": "承認待ち管理者",
      "active_tenants": "アクティブテナント"
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

    // ===== 役割 =====
    "roles": {
      "admin": "管理者",
      "user": "ユーザー",
      "developer": "開発者",
      "evaluator": "評価者",
      "worker": "作業員",
      "all": "全ての役割"
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
      "register_admin_success": "登録申請が完了しました",
      "register_admin_success_detail": "システム開発者による承認をお待ちください。",
      "register_user_success": "ユーザー登録が完了しました。管理者の承認をお待ちください。"
    },

    // ===== フォーム =====
    "forms": {
      "name": "名前",
      "email": "メールアドレス",
      "password": "パスワード",
      "confirm_password": "パスワード確認"
    },

    // ===== チャート項目 =====
    "chart_items": {
      "technical_skill": "技術力",
      "quality": "品質",
      "safety": "安全",
      "cooperation": "協調性",
      "diligence": "勤怠"
    },

    // ===== レポート =====
    "report": {
      "summary": "サマリー",
      "comparison": "比較",
      "history": "履歴",
      "overall_evaluation": "総合評価",
      "detailed_scores": "項目別スコア詳細",
      "self_comment": "本人コメント",
      "evaluator_comment": "評価者コメント",
      "score_comparison": "評価スコア比較（項目別）",
      "process_history": "評価プロセス履歴"
    },

    // ===== 時間 =====
    "time": {
      "just_now": "たった今",
      "minutes_ago": "{{count}}分前",
      "hours_ago": "{{count}}時間前",
      "days_ago": "{{count}}日前"
    },

    // ===== ログイン =====
    "login": {
      "lead_text": "建設業の特性に合わせた従業員評価管理システム",
      "sign_in_hint": "アカウント情報を入力してください"
    }
  },
  
  // 英語翻訳（提供されたen.jsonから統合）
  en: {
    "common": {
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
      "toggle_navigation": "Toggle navigation",
      "language": "Language",
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
      "confirm_delete_user": "Are you sure you want to delete \"{{userName}}\"?",
      "current_status": "Current Status",
      "load_draft": "Load Draft",
      "save_draft": "Save Draft",
      "back_to_login": "Back to Login Page",
      "created_at": "Created At",
      "actions": "Actions"
    },
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
      "email": "Email Address",
      "password": "Password",
      "name": "Name",
      "company": "Company Name",
      "register": "Register",
      "login_failed": "Login failed",
      "register_success": "Registration successful",
      "forgot_password": "Forgot password?",
      "reset_password": "Reset Password",
      "confirm_password": "Confirm Password",
      "register_admin": "Admin Account Registration",
      "register_admin_link": "Register a new administrator account",
      "register_user": "User Registration",
      "logging_in": "Logging in...",
      "sign_in_hint": "Please enter your account information",
      "register_admin_success": "Registration request has been completed.",
      "register_admin_success_detail": "Please wait for approval from the system developer."
    },
    "users": {
      "title": "User Management",
      "invite": "Invite New User",
      "role": "Role",
      "status": "Status",
      "created_at": "Registration Date",
      "actions": "Actions",
      "search_users": "Search users...",
      "pending_approvals": "Pending Users",
      "active_users": "User List",
      "invite_title": "Invite New User",
      "send_invitation": "Send Invitation",
      "invite_link_created": "Invitation link created",
      "invite_link_instructions": "Please copy the link below and share it with the user you want to invite. The link is valid for 7 days.",
      "copy_success": "Link copied to clipboard!",
      "confirm_approve": "Are you sure you want to approve this user?",
      "approve_success": "User approved successfully.",
      "confirm_reject": "Are you sure you want to reject (delete) this user?",
      "reject_success": "User rejected successfully.",
      "edit_user": "Edit User"
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
      "suspended": "Suspended",
      "developer_approval_pending": "Developer Approval Pending",
      "inactive": "Inactive",
      "draft": "Draft",
      "approved": "Approved",
      "rejected": "Rejected",
      "self_assessed": "Self-Assessed",
      "approved_by_evaluator": "Evaluator Approved",
      "pending": "Pending",
      "pending_submission": "Pending Worker Submission",
      "pending_evaluation": "Pending Evaluator Assessment",
      "pending_approval": "Pending Admin Approval",
      "completed": "Completed"
    },
    "evaluation": {
      "title": "Evaluation Input",
      "self_assessment": "Self-Assessment",
      "evaluator_assessment": "Evaluator's Assessment",
      "score": "Score",
      "comment": "Comment",
      "submit": "Submit",
      "period": "Evaluation Period",
      "target": "Evaluation Target",
      "evaluator": "Evaluator",
      "category": "Category",
      "item": "Evaluation Item",
      "job_type": "Job Type",
      "target_info": "Target Information",
      "select_target_user": "Please select a target user",
      "select_period": "Please select a period",
      "goal_achievement": "Goal Achievement Evaluation",
      "no_goals_set": "No goals have been set for evaluation.",
      "confirm_submit": "Submit evaluation? It cannot be edited after submission.",
      "self_assessment_score": "Self Score",
      "evaluator_assessment_score": "Evaluator Score"
    },
    "evaluations": {
      "title": "Evaluation List",
      "form_title": "Evaluation Form",
      "new_evaluation": "New Evaluation",
      "total_score": "Total Score",
      "target_user": "Target User"
    },
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
      "max_goals_info": "You can set up to {{maxGoals}} goals.",
      "total_weight_100_info": "The total weight must be 100%.",
      "admin_approval_info": "Administrator approval is required after application.",
      "submitted_at": "Submitted At",
      "confirm_approve": "Approve this goal?",
      "confirm_reject": "Reject this goal?",
      "rejection_reason_prompt": "Please enter the reason for rejection.",
      "select_evaluation_period": "Please select an evaluation period"
    },
    "settings": {
      "title": "System Settings",
      "job_types": "Job Types",
      "evaluation_periods": "Evaluation Periods",
      "evaluation_structure": "Evaluation Structure",
      "evaluation_structure_of": "'s Evaluation Structure",
      "add_job_type": "Add Job Type",
      "add_category": "Add Category",
      "add_item": "Add Item",
      "delete_category": "Delete Category",
      "save_changes": "Save Changes",
      "job_type_name_placeholder": "e.g., Construction Worker",
      "edit_job_type_name_placeholder": "New job type name",
      "add_period": "Add Period",
      "edit_period": "Edit Period",
      "period_name_label": "Period Name",
      "period_name_placeholder": "e.g., 2025 First Half",
      "start_date_label": "Start Date",
      "end_date_label": "End Date",
      "select_job_type_hint": "Select a job type from the left list to set evaluation items.",
      "no_categories_hint": "Create an evaluation category from the 'Add Category' button.",
      "category_name_placeholder": "Category Name (e.g., Technical Skills)",
      "item_name_placeholder": "Item Name (e.g., Ability to read drawings)",
      "confirm_delete_job_type": "Delete this job type? The associated evaluation structure will also be deleted.",
      "confirm_delete_period": "Delete this evaluation period?",
      "confirm_delete_category": "Delete this category? All items within it will also be deleted.",
      "confirm_delete_item": "Delete this evaluation item?",
      "unsaved_warning": "You have unsaved changes. Are you sure you want to leave?"
    },
    "developer": {
      "title": "Developer Management",
      "admin_approvals": "Administrator Account Approvals",
      "tenant_management": "Tenant Management",
      "approve": "Approve",
      "pending_admins": "Pending Administrators",
      "active_tenants": "Active Tenants"
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
      "personal_score": "Your Score",
      "department_average": "Department Average",
      "radar": "Radar",
      "bar": "Bar",
      "line": "Line",
      "total_users": "Total Users",
      "completed_evaluations": "Completed Evaluations",
      "pending_evaluations": "Pending Evaluations",
      "performance_chart": "Performance Chart"
    },
    "chart_items": {
      "technical_skill": "Technical Skill",
      "quality": "Quality",
      "safety": "Safety",
      "cooperation": "Cooperation",
      "diligence": "Diligence"
    },
    "report": {
      "summary": "Summary",
      "comparison": "Comparison",
      "history": "History",
      "overall_evaluation": "Overall Evaluation",
      "detailed_scores": "Detailed Scores",
      "self_comment": "Self Comment",
      "evaluator_comment": "Evaluator Comment",
      "score_comparison": "Score Comparison",
      "process_history": "Process History"
    },
    "messages": {
      "save_success": "Saved successfully",
      "delete_success": "Deleted successfully",
      "approval_success": "Approved successfully",
      "rejection_success": "Rejected successfully",
      "invitation_sent": "Invitation sent successfully",
      "password_reset_sent": "Password reset email sent",
      "login_success": "Welcome, {{userName}}",
      "logout_success": "You have been logged out."
    },
    "errors": {
      "loading_failed": "Failed to load data.",
      "email_password_required": "Please enter email and password.",
      "invalid_email_password": "Incorrect email or password.",
      "account_inactive": "This account is currently inactive.",
      "all_fields_required": "Please fill in all required fields.",
      "access_denied": "You do not have permission to access this page.",
      "passwords_not_match": "Passwords do not match.",
      "passwords_match": "Passwords match.",
      "login_failed_generic": "An unexpected error occurred during login.",
      "email_already_in_use": "This email address is already in use.",
      "weak_password": "Password should be at least 6 characters."
    }
  },

  // ベトナム語翻訳（提供されたvi.jsonから統合）
  vi: {
    "common": {
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
      "language": "Ngôn ngữ",
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
      "back_to_login": "Quay lại trang đăng nhập"
    },
    "nav": {
      "dashboard": "Bảng điều khiển",
      "users": "Quản lý người dùng",
      "settings": "Cài đặt",
      "evaluations": "Đánh giá",
      "goals": "Thiết lập mục tiêu",
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
      "email": "Địa chỉ email",
      "password": "Mật khẩu",
      "name": "Họ tên",
      "company": "Tên công ty",
      "register": "Đăng ký",
      "login_failed": "Đăng nhập thất bại",
      "register_success": "Đăng ký thành công",
      "forgot_password": "Quên mật khẩu?",
      "reset_password": "Đặt lại mật khẩu",
      "confirm_password": "Xác nhận mật khẩu",
      "register_admin": "Đăng ký tài khoản quản trị",
      "register_admin_link": "Đăng ký tài khoản quản trị viên mới",
      "register_user": "Đăng ký người dùng",
      "logging_in": "Đang đăng nhập...",
      "sign_in_hint": "Vui lòng nhập thông tin tài khoản của bạn",
      "register_admin_success": "Yêu cầu đăng ký đã được hoàn tất.",
      "register_admin_success_detail": "Vui lòng đợi sự chấp thuận từ nhà phát triển hệ thống."
    },
    // ... 他のvi翻訳データも同様に含める
    "dashboard": {
      "system_overview": "Tổng quan hệ thống và hoạt động gần đây",
      "performance_analysis": "Phân tích hiệu suất",
      "recent_evaluations": "Đánh giá gần đây",
      "no_recent_evaluations": "Không có đánh giá gần đây",
      "total_employees": "Tổng số nhân viên",
      "pending_evaluations_count": "Đánh giá đang chờ xử lý",
      "completed_evaluations_count": "Đánh giá đã hoàn thành",
      "personal_score": "Điểm của bạn",
      "department_average": "Trung bình phòng ban",
      "radar": "Radar",
      "bar": "Cột",
      "line": "Đường"
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
   * システム初期化（改良版）
   */
  async init() {
    try {
      console.log("I18n: Starting initialization...");
      
      if (BYPASS_JSON_FILES) {
        // 内蔵翻訳を使用
        this.loadBuiltInTranslations();
        
        // 初期化後にUIを更新
        this.updateUI();
        
        // 自動翻訳を有効化
        this.enableAutoTranslation();
        
        // 言語切り替えUIをセットアップ
        this.setupLanguageSwitcher();
        
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
        
        // 自動翻訳を有効化
        this.enableAutoTranslation();
        
        // 言語切り替えUIをセットアップ
        this.setupLanguageSwitcher();
        
        console.log("I18n: Initialization completed (file mode)");
        return true;
      }
      
    } catch (error) {
      console.error("I18n: Initialization failed:", error);
      
      // 緊急時の処理
      console.log("I18n: Falling back to built-in translations");
      this.loadBuiltInTranslations();
      this.updateUI();
      this.enableAutoTranslation();
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
      const response = await fetch(`./locales/${lang}.json`);
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
   * 言語の設定（改良版）
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

      console.log(`I18n: Updated ${updatedCount} UI elements out of ${elements.length + titleElements.length + placeholderElements.length} found`);
      
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
   * 言語切り替えUIのセットアップ（新機能）
   */
  setupLanguageSwitcher() {
    // 既存の言語切り替えボタンを検索
    const languageSwitchers = document.querySelectorAll('[data-i18n-lang-switcher]');
    
    languageSwitchers.forEach(switcher => {
      // 言語リストを作成
      const supportedLangs = this.getSupportedLanguages();
      
      if (switcher.tagName === 'SELECT') {
        // セレクトボックスの場合
        switcher.innerHTML = '';
        supportedLangs.forEach(lang => {
          const option = document.createElement('option');
          option.value = lang.code;
          option.textContent = lang.name;
          option.selected = lang.code === this.lang;
          switcher.appendChild(option);
        });
        
        switcher.addEventListener('change', (e) => {
          this.setLanguage(e.target.value);
        });
        
      } else {
        // ボタンの場合
        switcher.addEventListener('click', () => {
          // 次の言語に切り替え
          const currentIndex = supportedLangs.findIndex(lang => lang.code === this.lang);
          const nextIndex = (currentIndex + 1) % supportedLangs.length;
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

// グローバルインスタンスの作成
window.i18n = new I18n();

// グローバルに公開
window.I18n = I18n;
