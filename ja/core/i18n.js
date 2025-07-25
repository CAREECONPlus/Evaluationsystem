/**
 * Internationalization Service
 * 国際化サービス
 */
class I18n {
  constructor() {
    this.currentLanguage = "ja"
    this.translations = {}
    this.isInitialized = false
  }

  /**
   * Initialize i18n service
   * 国際化サービスを初期化
   */
  async init() {
    try {
      console.log("Initializing I18n service...")

      // Load translations
      this.translations = {
        ja: {
          // Common
          "common.loading": "読み込み中...",
          "common.error": "エラー",
          "common.success": "成功",
          "common.cancel": "キャンセル",
          "common.save": "保存",
          "common.delete": "削除",
          "common.edit": "編集",
          "common.view": "表示",
          "common.search": "検索",
          "common.filter": "フィルター",
          "common.export": "エクスポート",
          "common.import": "インポート",

          // Navigation
          "nav.dashboard": "ダッシュボード",
          "nav.users": "ユーザー管理",
          "nav.evaluations": "評価管理",
          "nav.goals": "目標設定",
          "nav.reports": "レポート",
          "nav.settings": "設定",

          // Login
          "login.title": "ログイン",
          "login.email": "メールアドレス",
          "login.password": "パスワード",
          "login.remember": "ログイン状態を保持",
          "login.submit": "ログイン",
          "login.forgot": "パスワードを忘れた方",
          "login.register": "新規登録",

          // Dashboard
          "dashboard.title": "ダッシュボード",
          "dashboard.totalEmployees": "総従業員数",
          "dashboard.pendingEvaluations": "未完了評価",
          "dashboard.completedEvaluations": "完了評価",
          "dashboard.averageScore": "平均スコア",
          "dashboard.recentEvaluations": "最近の評価",
          "dashboard.performanceAnalysis": "パフォーマンス分析",

          // Evaluation
          "evaluation.technical": "技術力",
          "evaluation.communication": "コミュニケーション",
          "evaluation.leadership": "リーダーシップ",
          "evaluation.safety": "安全管理",
          "evaluation.teamwork": "チームワーク",
          "evaluation.initiative": "積極性",
        },

        en: {
          // Common
          "common.loading": "Loading...",
          "common.error": "Error",
          "common.success": "Success",
          "common.cancel": "Cancel",
          "common.save": "Save",
          "common.delete": "Delete",
          "common.edit": "Edit",
          "common.view": "View",
          "common.search": "Search",
          "common.filter": "Filter",
          "common.export": "Export",
          "common.import": "Import",

          // Navigation
          "nav.dashboard": "Dashboard",
          "nav.users": "User Management",
          "nav.evaluations": "Evaluation Management",
          "nav.goals": "Goal Setting",
          "nav.reports": "Reports",
          "nav.settings": "Settings",

          // Login
          "login.title": "Login",
          "login.email": "Email Address",
          "login.password": "Password",
          "login.remember": "Remember Me",
          "login.submit": "Login",
          "login.forgot": "Forgot Password?",
          "login.register": "Register",

          // Dashboard
          "dashboard.title": "Dashboard",
          "dashboard.totalEmployees": "Total Employees",
          "dashboard.pendingEvaluations": "Pending Evaluations",
          "dashboard.completedEvaluations": "Completed Evaluations",
          "dashboard.averageScore": "Average Score",
          "dashboard.recentEvaluations": "Recent Evaluations",
          "dashboard.performanceAnalysis": "Performance Analysis",

          // Evaluation
          "evaluation.technical": "Technical Skills",
          "evaluation.communication": "Communication",
          "evaluation.leadership": "Leadership",
          "evaluation.safety": "Safety Management",
          "evaluation.teamwork": "Teamwork",
          "evaluation.initiative": "Initiative",
        },

        vi: {
          // Common
          "common.loading": "Đang tải...",
          "common.error": "Lỗi",
          "common.success": "Thành công",
          "common.cancel": "Hủy",
          "common.save": "Lưu",
          "common.delete": "Xóa",
          "common.edit": "Chỉnh sửa",
          "common.view": "Xem",
          "common.search": "Tìm kiếm",
          "common.filter": "Lọc",
          "common.export": "Xuất",
          "common.import": "Nhập",

          // Navigation
          "nav.dashboard": "Bảng điều khiển",
          "nav.users": "Quản lý người dùng",
          "nav.evaluations": "Quản lý đánh giá",
          "nav.goals": "Thiết lập mục tiêu",
          "nav.reports": "Báo cáo",
          "nav.settings": "Cài đặt",

          // Login
          "login.title": "Đăng nhập",
          "login.email": "Địa chỉ email",
          "login.password": "Mật khẩu",
          "login.remember": "Ghi nhớ đăng nhập",
          "login.submit": "Đăng nhập",
          "login.forgot": "Quên mật khẩu?",
          "login.register": "Đăng ký",

          // Dashboard
          "dashboard.title": "Bảng điều khiển",
          "dashboard.totalEmployees": "Tổng số nhân viên",
          "dashboard.pendingEvaluations": "Đánh giá chưa hoàn thành",
          "dashboard.completedEvaluations": "Đánh giá đã hoàn thành",
          "dashboard.averageScore": "Điểm trung bình",
          "dashboard.recentEvaluations": "Đánh giá gần đây",
          "dashboard.performanceAnalysis": "Phân tích hiệu suất",

          // Evaluation
          "evaluation.technical": "Kỹ năng kỹ thuật",
          "evaluation.communication": "Giao tiếp",
          "evaluation.leadership": "Lãnh đạo",
          "evaluation.safety": "Quản lý an toàn",
          "evaluation.teamwork": "Làm việc nhóm",
          "evaluation.initiative": "Chủ động",
        },
      }

      // Get saved language or default to Japanese
      const savedLanguage = localStorage.getItem("language") || "ja"
      this.currentLanguage = savedLanguage

      this.isInitialized = true
      console.log("I18n service initialized with language:", this.currentLanguage)
    } catch (error) {
      console.error("Failed to initialize I18n service:", error)
      throw error
    }
  }

  /**
   * Get translation for key
   * キーの翻訳を取得
   */
  t(key, params = {}) {
    try {
      const translation = this.translations[this.currentLanguage]?.[key] || key

      // Replace parameters in translation
      let result = translation
      Object.keys(params).forEach((param) => {
        result = result.replace(`{{${param}}}`, params[param])
      })

      return result
    } catch (error) {
      console.warn("Translation error for key:", key, error)
      return key
    }
  }

  /**
   * Set current language
   * 現在の言語を設定
   */
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language
      localStorage.setItem("language", language)
      this.updateUI()
      console.log("Language changed to:", language)
    } else {
      console.warn("Language not supported:", language)
    }
  }

  /**
   * Get current language
   * 現在の言語を取得
   */
  getCurrentLanguage() {
    return this.currentLanguage
  }

  /**
   * Get available languages
   * 利用可能な言語を取得
   */
  getAvailableLanguages() {
    return Object.keys(this.translations)
  }

  /**
   * Update UI with current language
   * 現在の言語でUIを更新
   */
  updateUI() {
    // Update elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n")
      element.textContent = this.t(key)
    })

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder")
      element.placeholder = this.t(key)
    })

    // Update titles
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      const key = element.getAttribute("data-i18n-title")
      element.title = this.t(key)
    })
  }

  /**
   * Get text direction for current language
   * 現在の言語のテキスト方向を取得
   */
  getTextDirection() {
    // All supported languages are left-to-right
    return "ltr"
  }

  /**
   * Format number according to current locale
   * 現在のロケールに従って数値をフォーマット
   */
  formatNumber(number, options = {}) {
    const localeMap = {
      ja: "ja-JP",
      en: "en-US",
      vi: "vi-VN",
    }

    const locale = localeMap[this.currentLanguage] || "ja-JP"
    return new Intl.NumberFormat(locale, options).format(number)
  }

  /**
   * Format date according to current locale
   * 現在のロケールに従って日付をフォーマット
   */
  formatDate(date, options = {}) {
    const localeMap = {
      ja: "ja-JP",
      en: "en-US",
      vi: "vi-VN",
    }

    const locale = localeMap[this.currentLanguage] || "ja-JP"
    return new Intl.DateTimeFormat(locale, options).format(date)
  }
}

// Make I18n globally available
window.I18n = I18n
