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
      performance_chart: "パフォーマンス推移",
      no_recent_evaluations: "最近の評価がありません"
    },

    // ===== 認証関連 =====
    auth: {
      login: "ログイン",
      logout: "ログアウト",
      name: "名前",
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
      invite_user: "ユーザー招待",
      name: "名前",
      email: "メールアドレス",
      role: "役割",
      status: "ステータス",
      active: "アクティブ",
      inactive: "非アクティブ",
      pending: "保留中",
      total_users: "総ユーザー数",
      active_users: "アクティブユーザー",
      pending_users: "保留中ユーザー",
      admin_users: "管理者ユーザー",
      all_status: "すべてのステータス",
      all_roles: "すべての役割",
      search_placeholder: "ユーザー名またはメールアドレスで検索",
      invitation_message: "招待メッセージ",
      send_invitation: "招待を送信"
    },

    // ===== 評価システム =====
    evaluations: {
      title: "評価一覧",
      form_title: "評価フォーム",
      new_evaluation: "新規評価作成",
      edit_evaluation: "評価編集",
      target_user: "評価対象者",
      target_info: "評価対象者情報",
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
      search_placeholder: "評価対象者名で検索...",
      period: "評価期間",
      evaluation_period: "評価期間",
      updated_at: "更新日",
      assignment_status: "担当状況",
      assigned_to_me: "私の担当",
      requires_approval: "承認が必要です",
      start_evaluation: "評価開始",
      continue_evaluation: "続ける",
      no_matching_evaluations: "該当する評価がありません",
      save_draft: "下書き保存",
      submit: "提出"
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
      view_all: "すべて表示",
      unknown: "不明"
    },

    // ===== ステータス =====
    status: {
      title: "ステータス",
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

    // ===== 職種管理 =====
    job_types: {
      title: "職種管理",
      search_placeholder: "職種を検索...",
      add_job_type: "新規職種追加",
      export: "エクスポート",
      total_job_types: "総職種数",
      active_job_types: "有効な職種",
      inactive_job_types: "無効な職種",
      category_count: "カテゴリ数",
      job_type_list: "職種一覧",
      edit_job_type: "職種編集",
      job_type_name: "職種名",
      job_type_name_required: "職種名を入力してください",
      category: "カテゴリー",
      category_placeholder: "例: 建築、設備、仕上げ",
      job_type_code: "職種コード",
      code_placeholder: "例: JT001",
      status: "ステータス",
      status_active: "有効",
      status_inactive: "無効",
      description: "説明",
      required_skills: "必要スキル",
      skills_placeholder: "必要な資格やスキルを記入",
      evaluation_items: "評価項目",
      eval_items_placeholder: "この職種特有の評価項目を記入",
      actions: "操作",
      created_at: "作成日",
      code: "コード",
      add_new_job_type: "新規職種を追加",
      save_changes: "変更を保存",
      confirm_delete: "この職種を削除しますか？",
      no_job_types: "職種が登録されていません",
      add_first_job_type: "職種を追加",
      loading_error: "職種データの読み込みに失敗しました",
      save_success_update: "職種を更新しました",
      save_success_create: "職種を追加しました",
      save_error: "職種の保存に失敗しました",
      delete_confirm_message: "「{name}」を削除してもよろしいですか？",
      delete_confirm_title: "職種の削除",
      delete_success: "職種を削除しました",
      delete_error: "職種の削除に失敗しました",
      export_success: "エクスポートが完了しました",
      export_error: "エクスポートに失敗しました",
      saving: "保存中...",
      deleting: "削除中..."
    },

    // ===== 評価期間管理（統合版）=====
    evaluation_periods_v2: {
      title: "評価期間管理",
      subtitle: "評価サイクル・職種別設定・期間管理の統合管理",
      tab_basic: "基本設定",
      tab_job_specific: "職種別設定",
      tab_period_management: "期間管理",

      // 基本設定
      basic_title: "全社共通評価サイクル設定",
      cycle_label: "評価サイクル",
      select_placeholder: "選択してください",
      cycle_quarterly: "四半期評価（3ヶ月）",
      cycle_semiannual: "半期評価（6ヶ月）",
      cycle_annual: "年次評価（12ヶ月）",
      fiscal_start_label: "評価年度開始月",
      month_1: "1月",
      month_4: "4月",
      month_7: "7月",
      month_10: "10月",
      grace_start_label: "評価開始猶予期間（日）",
      grace_start_help: "期間開始前に評価を開始できる日数",
      grace_end_label: "評価終了猶予期間（日）",
      grace_end_help: "期間終了後も評価を受け付ける日数",
      template_label: "デフォルト期間テンプレート",
      template_placeholder: "例: {year}年度 第{quarter}四半期評価",
      template_default: "2024年度 第1四半期評価",
      template_help: "新しい期間作成時のデフォルト名称パターン",
      reset_button: "リセット",
      save_basic_button: "基本設定を保存",
      preview_title: "設定プレビュー",
      preview_message: "左側で設定を選択すると、プレビューが表示されます。",
      guide_title: "設定ガイド",
      guide_quarterly: "四半期評価: 3ヶ月ごとの頻繁な評価",
      guide_semiannual: "半期評価: 6ヶ月ごとのバランス型",
      guide_annual: "年次評価: 年1回の包括的な評価",

      // 職種別設定
      job_select_title: "職種選択",
      job_settings_title: "職種別評価期間設定",
      job_select_badge: "職種を選択",
      job_select_message: "左のリストから職種を選択して、個別の評価期間設定を行ってください。",
      job_selected_label: "選択中の職種",
      job_cycle_label: "専用評価サイクル",
      job_cycle_default: "全社設定に従う",
      job_cycle_monthly: "月次評価（1ヶ月）",
      job_cycle_help: "この職種専用の評価サイクルを設定できます",
      job_weights_label: "評価項目の重み付け",
      job_weight_technical: "技術力",
      job_weight_communication: "コミュニケーション",
      job_save_button: "職種別設定を保存",

      // 期間管理
      stat_total: "総期間数",
      stat_active: "実施中",
      stat_completed: "完了",
      stat_scheduled: "予定",
      periods_title: "評価期間一覧",
      add_period_button: "新しい期間を追加",
      filter_status_label: "ステータスでフィルター",
      filter_all: "すべて",
      filter_type_label: "タイプでフィルター",
      refresh_button: "更新",
      periods_placeholder: "期間リストがここに表示されます",
      no_periods: "評価期間が登録されていません",
      table_period_name: "期間名",
      table_type: "タイプ",
      table_duration: "期間",
      table_days: "日数",
      table_status: "ステータス",
      table_actions: "操作",

      // モーダル
      modal_title_new: "新しい評価期間",
      modal_title_edit: "評価期間の編集",
      modal_name_label: "期間名",
      modal_name_required: "*",
      modal_name_example: "例: 2024年第1四半期評価",
      modal_type_label: "タイプ",
      modal_type_required: "*",
      modal_start_label: "開始日",
      modal_start_required: "*",
      modal_end_label: "終了日",
      modal_end_required: "*",
      modal_status_label: "ステータス",
      modal_duration_label: "期間日数",
      modal_description_label: "説明",
      modal_description_placeholder: "この評価期間に関する説明や特記事項",
      modal_info_message: "開始日・終了日を設定すると、期間日数が自動計算されます。",
      modal_delete_button: "削除",
      modal_cancel_button: "キャンセル",
      modal_save_button: "保存",
      modal_saving: "保存中...",

      // ステータス・タイプラベル
      status_scheduled: "予定",
      status_active: "実施中",
      status_completed: "完了",
      type_quarterly: "四半期",
      type_semiannual: "半期",
      type_annual: "年次",
      type_monthly: "月次",

      // メッセージ
      error_admin_required: "管理者権限が必要です",
      error_modal_not_found: "モーダルが見つかりません",
      error_modal_display: "モーダルの表示に失敗しました",
      success_period_saved: "評価期間を保存しました",
      error_period_save: "評価期間の保存に失敗しました",
      confirm_delete_period: "評価期間「{name}」を削除してもよろしいですか？\n\n※この操作は取り消せません。",
      success_period_deleted: "評価期間を削除しました",
      error_period_delete: "評価期間の削除に失敗しました",
      success_basic_saved: "基本設定を保存しました",
      error_basic_save: "基本設定の保存に失敗しました",
      success_basic_reset: "基本設定をリセットしました",
      loading: "読み込み中...",
      no_job_types: "登録された職種がありません",
      job_active: "有効",
      job_inactive: "無効",
      no_description: "説明なし",
      error_job_load: "職種データの読み込みに失敗しました",
      success_job_saved: "職種別設定を保存しました",
      error_job_save: "職種別設定の保存に失敗しました",
      error_page_init: "ページの初期化に失敗しました",
      days_suffix: "日"
    },

    // ===== ユーザープロフィール =====
    user: {
      profile: "ユーザープロフィール"
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
      search_placeholder: "Search by target user name...",
      form_title: "Evaluation Form",
      target_info: "Target User Information",
      period: "Evaluation Period",
      evaluation_period: "Evaluation Period",
      updated_at: "Updated At",
      assignment_status: "Assignment Status",
      assigned_to_me: "My Assignment",
      requires_approval: "Approval Required",
      start_evaluation: "Start Evaluation",
      continue_evaluation: "Continue",
      no_matching_evaluations: "No matching evaluations found",
      save_draft: "Save Draft",
      submit: "Submit"
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
      view_all: "View All",
      unknown: "Unknown"
    },

    status: {
      title: "Status",
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
    },

    // ===== Job Type Management =====
    job_types: {
      title: "Job Type Management",
      search_placeholder: "Search job types...",
      add_job_type: "Add New Job Type",
      export: "Export",
      total_job_types: "Total Job Types",
      active_job_types: "Active Job Types",
      inactive_job_types: "Inactive Job Types",
      category_count: "Category Count",
      job_type_list: "Job Type List",
      edit_job_type: "Edit Job Type",
      job_type_name: "Job Type Name",
      job_type_name_required: "Please enter job type name",
      category: "Category",
      category_placeholder: "e.g., Construction, Equipment, Finishing",
      job_type_code: "Job Type Code",
      code_placeholder: "e.g., JT001",
      status: "Status",
      status_active: "Active",
      status_inactive: "Inactive",
      description: "Description",
      required_skills: "Required Skills",
      skills_placeholder: "Enter required qualifications and skills",
      evaluation_items: "Evaluation Items",
      eval_items_placeholder: "Enter job-specific evaluation items",
      actions: "Actions",
      created_at: "Created At",
      code: "Code",
      add_new_job_type: "Add New Job Type",
      save_changes: "Save Changes",
      confirm_delete: "Are you sure you want to delete this job type?",
      no_job_types: "No job types registered",
      add_first_job_type: "Add Job Type",
      loading_error: "Failed to load job type data",
      save_success_update: "Job type updated successfully",
      save_success_create: "Job type added successfully",
      save_error: "Failed to save job type",
      delete_confirm_message: "Are you sure you want to delete \"{name}\"?",
      delete_confirm_title: "Delete Job Type",
      delete_success: "Job type deleted successfully",
      delete_error: "Failed to delete job type",
      export_success: "Export completed successfully",
      export_error: "Export failed",
      saving: "Saving...",
      deleting: "Deleting..."
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
      created_at: "Ngày tạo",
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
      view_all: "Xem tất cả",
      unknown: "Không rõ"
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
    },

    users: {
      title: "Quản lý người dùng",
      subtitle: "Quản lý người dùng",
      add_user: "Thêm người dùng mới",
      edit_user: "Chỉnh sửa người dùng",
      delete_user: "Xóa người dùng",
      name: "Tên",
      email: "Email",
      role: "Vai trò",
      status: "Trạng thái",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      total_users: "Tổng số người dùng",
      active_users: "Người dùng hoạt động",
      pending_users: "Người dùng chờ duyệt",
      admin_users: "Người dùng quản trị",
      all_status: "Tất cả trạng thái",
      all_roles: "Tất cả vai trò",
      search_placeholder: "Tìm kiếm theo tên hoặc email"
    },

    evaluations: {
      title: "Danh sách đánh giá",
      new_evaluation: "Tạo đánh giá mới",
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
      my_assignments: "Nhiệm vụ của tôi",
      in_progress: "Đang tiến hành",
      all_status: "Tất cả trạng thái",
      all_users: "Tất cả người dùng",
      all_assignments: "Tất cả nhiệm vụ",
      assigned: "Đã giao",
      unassigned: "Chưa giao",
      my_evaluations: "Đánh giá của tôi",
      other_evaluators: "Người đánh giá khác",
      urgent: "Khẩn cấp (chờ duyệt)",
      this_week: "Tuần này",
      own_evaluations_only: "Chỉ hiển thị đánh giá của bạn",
      reset_filters: "Đặt lại bộ lọc",
      items_count: "Số lượng mục",
      search_placeholder: "Tìm kiếm theo tên người được đánh giá...",
      form_title: "Mẫu đánh giá",
      target_info: "Thông tin người được đánh giá",
      period: "Chu kỳ đánh giá",
      evaluation_period: "Chu kỳ đánh giá",
      updated_at: "Ngày cập nhật",
      assignment_status: "Trạng thái nhiệm vụ",
      assigned_to_me: "Nhiệm vụ của tôi",
      requires_approval: "Cần phê duyệt",
      start_evaluation: "Bắt đầu đánh giá",
      continue_evaluation: "Tiếp tục",
      no_matching_evaluations: "Không tìm thấy đánh giá phù hợp",
      save_draft: "Lưu nháp",
      submit: "Gửi"
    },

    status: {
      title: "Trạng thái",
      draft: "Nháp",
      self_assessed: "Tự đánh giá hoàn thành",
      pending_approval: "Chờ phê duyệt",
      completed: "Hoàn thành",
      in_progress: "Đang tiến hành"
    },

    roles: {
      admin: "Quản trị viên",
      evaluator: "Người đánh giá",
      supervisor: "Giám sát",
      worker: "Công nhân"
    },

    settings: {
      title: "Cài đặt",
      save_changes: "Lưu thay đổi",
      job_types: "Loại công việc",
      evaluation_periods: "Chu kỳ đánh giá",
      select_job_type_hint: "Vui lòng chọn loại công việc",
      categories: "Danh mục",
      description: "Mô tả",
      order: "Thứ tự",
      language: "Ngôn ngữ"
    },

    // ===== Job Type Management =====
    job_types: {
      title: "Quản lý loại công việc",
      search_placeholder: "Tìm kiếm loại công việc...",
      add_job_type: "Thêm loại công việc mới",
      export: "Xuất",
      total_job_types: "Tổng số loại công việc",
      active_job_types: "Loại công việc đang hoạt động",
      inactive_job_types: "Loại công việc không hoạt động",
      category_count: "Số lượng danh mục",
      job_type_list: "Danh sách loại công việc",
      edit_job_type: "Chỉnh sửa loại công việc",
      job_type_name: "Tên loại công việc",
      job_type_name_required: "Vui lòng nhập tên loại công việc",
      category: "Danh mục",
      category_placeholder: "ví dụ: Xây dựng, Thiết bị, Hoàn thiện",
      job_type_code: "Mã loại công việc",
      code_placeholder: "ví dụ: JT001",
      status: "Trạng thái",
      status_active: "Hoạt động",
      status_inactive: "Không hoạt động",
      description: "Mô tả",
      required_skills: "Kỹ năng cần thiết",
      skills_placeholder: "Nhập các bằng cấp và kỹ năng cần thiết",
      evaluation_items: "Các mục đánh giá",
      eval_items_placeholder: "Nhập các mục đánh giá theo loại công việc",
      actions: "Hành động",
      created_at: "Ngày tạo",
      code: "Mã",
      add_new_job_type: "Thêm loại công việc mới",
      save_changes: "Lưu thay đổi",
      confirm_delete: "Bạn có chắc chắn muốn xóa loại công việc này không?",
      no_job_types: "Chưa có loại công việc nào được đăng ký",
      add_first_job_type: "Thêm loại công việc",
      loading_error: "Tải dữ liệu loại công việc thất bại",
      save_success_update: "Cập nhật loại công việc thành công",
      save_success_create: "Thêm loại công việc thành công",
      save_error: "Lưu loại công việc thất bại",
      delete_confirm_message: "Bạn có chắc chắn muốn xóa \"{name}\" không?",
      delete_confirm_title: "Xóa loại công việc",
      delete_success: "Xóa loại công việc thành công",
      delete_error: "Xóa loại công việc thất bại",
      export_success: "Xuất dữ liệu thành công",
      export_error: "Xuất dữ liệu thất bại",
      saving: "Đang lưu...",
      deleting: "Đang xóa..."
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

    // GitHub Pagesデバッグ用ログ
    if (window.GITHUB_PAGES_MODE) {
      console.log(`[i18n] Looking for key: ${key} in language: ${language}`);
      console.log(`[i18n] Available translations for ${language}:`, Object.keys(TRANSLATIONS[language] || {}));
    }

    for (const k of keys) {
      if (current && current[k]) {
        current = current[k];
      } else {
        if (window.GITHUB_PAGES_MODE) {
          console.warn(`[i18n] Translation path broken at: ${k} for key: ${key}`);
          console.log(`[i18n] Available keys at this level:`, current ? Object.keys(current) : 'null');
        }
        return null;
      }
    }

    const result = typeof current === 'string' ? current : null;
    if (window.GITHUB_PAGES_MODE) {
      console.log(`[i18n] Translation result for ${key}:`, result);
    }

    return result;
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
   * @param {HTMLElement} container - 翻訳を適用するコンテナ（省略時はdocument全体）
   */
  applyTranslations(container = document) {
    // data-i18n属性を持つ要素の翻訳
    container.querySelectorAll('[data-i18n]').forEach(element => {
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

    // data-i18n-placeholder属性を持つ要素の翻訳
    container.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });

    // data-i18n-title属性を持つ要素の翻訳
    container.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });

    // data-i18n-alt属性を持つ要素の翻訳
    container.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      element.alt = this.t(key);
    });
  }

  /**
   * UI更新メソッド（login.jsとの互換性のため）
   * @param {HTMLElement} container - 翻訳を適用するコンテナ（省略時はdocument全体）
   */
  updateUI(container = document) {
    this.applyTranslations(container);
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

// DOM読み込み完了時の自動初期化（GitHub Pages対応）
document.addEventListener('DOMContentLoaded', () => {
  // GitHub Pages環境での初期化ログ
  if (window.GITHUB_PAGES_MODE) {
    console.log('[i18n] Initializing for GitHub Pages mode');
    console.log('[i18n] Current language:', i18n.getCurrentLanguage());
    console.log('[i18n] Supported languages:', i18n.getSupportedLanguages());
  }

  // 翻訳を適用
  i18n.applyTranslations();

  // GitHub Pages環境では自動言語スイッチャーは作成しない
  // HeaderComponentが担当
  if (!window.GITHUB_PAGES_MODE && !document.querySelector('.language-switcher')) {
    document.body.appendChild(createLanguageSwitcher());
  }

  // GitHub Pages環境での翻訳確認
  if (window.GITHUB_PAGES_MODE) {
    const testElements = document.querySelectorAll('[data-i18n]');
    console.log(`[i18n] Found ${testElements.length} elements with data-i18n attributes`);

    // サンプル翻訳テスト
    const testKeys = ['app.title', 'nav.dashboard', 'users.title', 'common.save'];
    testKeys.forEach(key => {
      const result = i18n.t(key);
      console.log(`[i18n] Test translation ${key}: ${result}`);
    });
  }
});

// エクスポート
export { UnifiedI18n, i18n };
export default i18n;