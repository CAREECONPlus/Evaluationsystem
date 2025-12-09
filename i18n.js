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
      pending_evaluations: "承認待ち評価",
      recent_evaluations: "最近の評価",
      system_stats: "システム統計",
      system_overview: "システム概要と最新の活動状況",
      performance_chart: "パフォーマンス推移",
      no_recent_evaluations: "最近の評価はありません",
      total_evaluations: "総評価数"
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
      subtitle: "組織内のユーザーを管理します",
      add_user: "新規ユーザー追加",
      edit_user: "ユーザー編集",
      delete_user: "ユーザー削除",
      name: "名前",
      email: "メールアドレス",
      role: "役割",
      status: "ステータス",
      active: "アクティブ",
      inactive: "非アクティブ",
      pending: "承認待ち",
      job_types: "担当職種",
      assigned_job_types: "割り当て職種",
      invite_user: "ユーザー招待",
      invitation_link: "招待リンク",
      invitation_url: "招待URL",
      copy_invitation_link: "招待リンクをコピー",
      copy_link: "リンクをコピー",
      invitation_code: "招待コード",
      generate_invitation: "招待リンクを生成",
      invitation_link_generated: "招待リンクが生成されました",
      email_invitation: "メール招待",
      send_invitation: "招待を送信",
      invitation_message: "招待メッセージ（任意）",
      all_status: "すべてのステータス",
      all_roles: "すべての役割",
      total_users: "総ユーザー数",
      active_users: "アクティブ",
      pending_users: "承認待ち",
      admin_users: "管理者",
      suspended: "停止中"
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
      period: "評価期間",
      updated_at: "更新日時",
      assignment_status: "割当状況",
      all_status: "すべてのステータス",
      all_users: "すべてのユーザー",
      all_assignments: "すべての担当",
      assigned: "担当割り当て済み",
      unassigned: "担当未割り当て",
      my_evaluations: "私が評価者",
      my_assignments: "私の担当",
      other_evaluators: "他の評価者",
      urgent: "緊急（承認待ち）",
      this_week: "今週作成",
      own_evaluations_only: "あなたの評価のみ表示されます",
      reset_filters: "フィルターリセット",
      search_placeholder: "評価対象者名で検索...",
      items_count: "件",
      in_progress: "進行中",
      create_evaluation: "評価を作成",
      view_report: "レポート表示",
      start_evaluation: "評価開始",
      continue_evaluation: "続ける"
    },

    // ===== 評価フォーム =====
    evaluation: {
      target: "評価対象者"
    },

    // ===== ステータス =====
    status: {
      title: "ステータス",
      pending: "保留中",
      pending_approval: "承認待ち",
      in_progress: "進行中",
      completed: "完了",
      draft: "下書き",
      self_assessed: "自己評価完了",
      approved: "承認済み",
      rejected: "却下"
    },

    // ===== レポート =====
    report: {
      summary: "サマリー",
      comparison: "比較",
      history: "履歴",
      overall_evaluation: "総合評価",
      detailed_scores: "詳細スコア",
      score_comparison: "スコア比較",
      process_history: "処理履歴",
      subtitle: "評価データの分析と比較",
      last_3_months: "過去3ヶ月",
      last_6_months: "過去6ヶ月",
      this_year: "今年",
      all_time: "全期間",
      performance_trend: "パフォーマンス推移",
      evaluation_status: "評価ステータス分布",
      detailed_data: "詳細データ",
      admin_analytics: "管理者分析",
      organization_skill_map: "組織スキルマップ"
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
      total_weight: "合計ウェイト",
      approvals: "目標承認",
      pending_approvals: "承認待ちの目標",
      approve: "承認",
      reject: "却下",
      approval_comment: "承認コメント"
    },

    // ===== 職種管理 =====
    job_types: {
      title: "職種管理",
      subtitle: "職種の登録と管理",
      search_placeholder: "職種を検索...",
      add_job_type: "新規職種追加",
      export: "エクスポート",
      total_job_types: "総職種数",
      active_job_types: "有効な職種",
      inactive_job_types: "無効な職種",
      category_count: "カテゴリ数",
      job_type_list: "職種一覧",
      edit_job_type: "職種編集",
      delete_job_type: "職種削除",
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
      evaluation_structure: "評価構造",
      actions: "操作",
      created_at: "作成日",
      updated_at: "更新日",
      code: "コード",
      add_new_job_type: "新規職種を追加",
      save: "保存",
      cancel: "キャンセル",
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
      deleting: "削除中...",
      required: "必須"
    },

    // ===== 組織管理 =====
    organization: {
      title: "組織管理",
      hierarchy: "組織階層図",
      departments: "部門",
      teams: "チーム",
      members: "メンバー",
      skill_map: "組織スキルマップ"
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
      back: "戻る",
      view_all: "すべて表示",
      loading: "読み込み中...",
      loading_data: "データを読み込み中...",
      no_data: "データがありません",
      all: "すべて",
      actions: "操作",
      retry: "再試行",
      view_details: "詳細表示",
      copy: "コピー",
      copied: "コピーしました"
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

    // ===== エラー =====
    errors: {
      loading_failed: "データの読み込みに失敗しました",
      chart_library_failed: "グラフライブラリの読み込みに失敗しました"
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
      pending_evaluations: "Pending Approval",
      recent_evaluations: "Recent Evaluations",
      system_stats: "System Statistics",
      system_overview: "System Overview and Recent Activity",
      performance_chart: "Performance Trend",
      no_recent_evaluations: "No recent evaluations",
      total_evaluations: "Total Evaluations"
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
      subtitle: "Manage users in your organization",
      add_user: "Add New User",
      edit_user: "Edit User",
      delete_user: "Delete User",
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      job_types: "Job Types",
      assigned_job_types: "Assigned Job Types",
      invite_user: "Invite User",
      invitation_link: "Invitation Link",
      invitation_url: "Invitation URL",
      copy_invitation_link: "Copy Invitation Link",
      copy_link: "Copy Link",
      invitation_code: "Invitation Code",
      generate_invitation: "Generate Invitation Link",
      invitation_link_generated: "Invitation link generated",
      email_invitation: "Email Invitation",
      send_invitation: "Send Invitation",
      invitation_message: "Invitation Message (Optional)",
      all_status: "All Statuses",
      all_roles: "All Roles",
      total_users: "Total Users",
      active_users: "Active",
      pending_users: "Pending",
      admin_users: "Administrators",
      suspended: "Suspended"
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
      period: "Evaluation Period",
      updated_at: "Updated At",
      assignment_status: "Assignment Status",
      all_status: "All Status",
      all_users: "All Users",
      all_assignments: "All Assignments",
      assigned: "Assigned",
      unassigned: "Unassigned",
      my_evaluations: "My Evaluations",
      my_assignments: "My Assignments",
      other_evaluators: "Other Evaluators",
      urgent: "Urgent (Pending Approval)",
      this_week: "Created This Week",
      own_evaluations_only: "Showing only your evaluations",
      reset_filters: "Reset Filters",
      search_placeholder: "Search by target user name...",
      items_count: "items",
      in_progress: "In Progress",
      create_evaluation: "Create Evaluation",
      view_report: "View Report",
      start_evaluation: "Start Evaluation",
      continue_evaluation: "Continue"
    },

    evaluation: {
      target: "Target User"
    },

    status: {
      title: "Status",
      pending: "Pending",
      pending_approval: "Pending Approval",
      in_progress: "In Progress",
      completed: "Completed",
      draft: "Draft",
      self_assessed: "Self-Assessed",
      approved: "Approved",
      rejected: "Rejected"
    },

    report: {
      summary: "Summary",
      comparison: "Comparison",
      history: "History",
      overall_evaluation: "Overall Evaluation",
      detailed_scores: "Detailed Scores",
      score_comparison: "Score Comparison",
      process_history: "Process History",
      subtitle: "Analysis and Comparison of Evaluation Data",
      last_3_months: "Last 3 Months",
      last_6_months: "Last 6 Months",
      this_year: "This Year",
      all_time: "All Time",
      performance_trend: "Performance Trend",
      evaluation_status: "Evaluation Status Distribution",
      detailed_data: "Detailed Data",
      admin_analytics: "Admin Analytics",
      organization_skill_map: "Organization Skill Map"
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
      total_weight: "Total Weight",
      approvals: "Goal Approvals",
      pending_approvals: "Pending Approvals",
      approve: "Approve",
      reject: "Reject",
      approval_comment: "Approval Comment"
    },

    job_types: {
      title: "Job Type Management",
      subtitle: "Register and manage job types",
      search_placeholder: "Search job types...",
      add_job_type: "Add New Job Type",
      export: "Export",
      total_job_types: "Total Job Types",
      active_job_types: "Active Job Types",
      inactive_job_types: "Inactive Job Types",
      category_count: "Category Count",
      job_type_list: "Job Type List",
      edit_job_type: "Edit Job Type",
      delete_job_type: "Delete Job Type",
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
      evaluation_structure: "Evaluation Structure",
      actions: "Actions",
      created_at: "Created At",
      updated_at: "Updated",
      code: "Code",
      add_new_job_type: "Add New Job Type",
      save: "Save",
      cancel: "Cancel",
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
      deleting: "Deleting...",
      required: "Required"
    },

    organization: {
      title: "Organization Management",
      hierarchy: "Organization Hierarchy",
      departments: "Departments",
      teams: "Teams",
      members: "Members",
      skill_map: "Organization Skill Map"
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
      back: "Back",
      view_all: "View All",
      loading: "Loading...",
      loading_data: "Loading data...",
      no_data: "No data available",
      all: "All",
      actions: "Actions",
      retry: "Retry",
      view_details: "View Details",
      copy: "Copy",
      copied: "Copied"
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

    errors: {
      loading_failed: "Failed to load data",
      chart_library_failed: "Failed to load chart library"
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
      pending_evaluations: "Chờ phê duyệt",
      recent_evaluations: "Đánh giá gần đây",
      system_stats: "Thống kê hệ thống",
      system_overview: "Tổng quan hệ thống và hoạt động gần đây",
      performance_chart: "Xu hướng hiệu suất",
      no_recent_evaluations: "Không có đánh giá gần đây",
      total_evaluations: "Tổng số đánh giá"
    },

    users: {
      title: "Quản lý người dùng",
      subtitle: "Quản lý người dùng trong tổ chức của bạn",
      add_user: "Thêm người dùng mới",
      edit_user: "Chỉnh sửa người dùng",
      delete_user: "Xóa người dùng",
      name: "Tên",
      email: "Email",
      role: "Vai trò",
      status: "Trạng thái",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      pending: "Đang chờ",
      job_types: "Loại công việc",
      assigned_job_types: "Loại công việc được phân công",
      invite_user: "Mời người dùng",
      invitation_link: "Liên kết mời",
      invitation_url: "URL mời",
      copy_invitation_link: "Sao chép liên kết mời",
      copy_link: "Sao chép liên kết",
      invitation_code: "Mã mời",
      generate_invitation: "Tạo liên kết mời",
      invitation_link_generated: "Liên kết mời đã được tạo",
      email_invitation: "Mời qua email",
      send_invitation: "Gửi lời mời",
      invitation_message: "Tin nhắn mời (Tùy chọn)",
      all_status: "Tất cả trạng thái",
      all_roles: "Tất cả vai trò",
      total_users: "Tổng số người dùng",
      active_users: "Hoạt động",
      pending_users: "Đang chờ",
      admin_users: "Quản trị viên",
      suspended: "Bị đình chỉ"
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
      period: "Kỳ đánh giá",
      updated_at: "Cập nhật lúc",
      assignment_status: "Trạng thái phân công",
      all_status: "Tất cả trạng thái",
      all_users: "Tất cả người dùng",
      all_assignments: "Tất cả phân công",
      assigned: "Đã phân công",
      unassigned: "Chưa phân công",
      my_evaluations: "Đánh giá của tôi",
      my_assignments: "Phân công của tôi",
      other_evaluators: "Người đánh giá khác",
      urgent: "Khẩn cấp (Chờ phê duyệt)",
      this_week: "Tạo tuần này",
      own_evaluations_only: "Chỉ hiển thị đánh giá của bạn",
      reset_filters: "Đặt lại bộ lọc",
      search_placeholder: "Tìm kiếm theo tên người được đánh giá...",
      items_count: "mục",
      in_progress: "Đang tiến hành",
      create_evaluation: "Tạo đánh giá",
      view_report: "Xem báo cáo",
      start_evaluation: "Bắt đầu đánh giá",
      continue_evaluation: "Tiếp tục"
    },

    evaluation: {
      target: "Người được đánh giá"
    },

    status: {
      title: "Trạng thái",
      pending: "Chờ xử lý",
      pending_approval: "Chờ phê duyệt",
      in_progress: "Đang tiến hành",
      completed: "Hoàn thành",
      draft: "Bản nháp",
      self_assessed: "Tự đánh giá hoàn thành",
      approved: "Đã phê duyệt",
      rejected: "Từ chối"
    },

    report: {
      summary: "Tóm tắt",
      comparison: "So sánh",
      history: "Lịch sử",
      overall_evaluation: "Đánh giá tổng thể",
      detailed_scores: "Điểm chi tiết",
      score_comparison: "So sánh điểm",
      process_history: "Lịch sử xử lý",
      subtitle: "Phân tích và so sánh dữ liệu đánh giá",
      last_3_months: "3 tháng qua",
      last_6_months: "6 tháng qua",
      this_year: "Năm nay",
      all_time: "Tất cả thời gian",
      performance_trend: "Xu hướng hiệu suất",
      evaluation_status: "Phân phối trạng thái đánh giá",
      detailed_data: "Dữ liệu chi tiết",
      admin_analytics: "Phân tích quản trị",
      organization_skill_map: "Bản đồ kỹ năng tổ chức"
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
      total_weight: "Tổng trọng số",
      approvals: "Phê duyệt mục tiêu",
      pending_approvals: "Chờ phê duyệt",
      approve: "Phê duyệt",
      reject: "Từ chối",
      approval_comment: "Nhận xét phê duyệt"
    },

    job_types: {
      title: "Quản lý loại công việc",
      subtitle: "Đăng ký và quản lý các loại công việc",
      search_placeholder: "Tìm kiếm loại công việc...",
      add_job_type: "Thêm loại công việc mới",
      export: "Xuất",
      total_job_types: "Tổng số loại công việc",
      active_job_types: "Loại công việc đang hoạt động",
      inactive_job_types: "Loại công việc không hoạt động",
      category_count: "Số lượng danh mục",
      job_type_list: "Danh sách loại công việc",
      edit_job_type: "Chỉnh sửa loại công việc",
      delete_job_type: "Xóa loại công việc",
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
      evaluation_structure: "Cấu trúc đánh giá",
      actions: "Hành động",
      created_at: "Ngày tạo",
      updated_at: "Ngày cập nhật",
      code: "Mã",
      add_new_job_type: "Thêm loại công việc mới",
      save: "Lưu",
      cancel: "Hủy",
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
      deleting: "Đang xóa...",
      required: "Bắt buộc"
    },

    organization: {
      title: "Quản lý tổ chức",
      hierarchy: "Sơ đồ tổ chức",
      departments: "Phòng ban",
      teams: "Nhóm",
      members: "Thành viên",
      skill_map: "Bản đồ kỹ năng tổ chức"
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
      back: "Quay lại",
      view_all: "Xem tất cả",
      loading: "Đang tải...",
      loading_data: "Đang tải dữ liệu...",
      no_data: "Không có dữ liệu",
      all: "Tất cả",
      actions: "Hành động",
      retry: "Thử lại",
      view_details: "Xem chi tiết",
      copy: "Sao chép",
      copied: "Đã sao chép"
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

    errors: {
      loading_failed: "Không thể tải dữ liệu",
      chart_library_failed: "Không thể tải thư viện biểu đồ"
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