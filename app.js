/**
 * Main Application Class
 * メインアプリケーションクラス
 */
class App {
  constructor() {
    this.currentUser = null
    this.currentPage = null
    this.isInitialized = false

    // Firebase configuration
    this.firebaseConfig = {
      apiKey: "demo-api-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "demo-app-id",
    }

    // Initialize modules after DOM is ready
    this.i18n = null
    this.api = null
    this.auth = null
    this.router = null
  }

  /**
   * Initialize application
   * アプリケーションを初期化
   */
  async init() {
    try {
      console.log("Starting application initialization...")

      // Initialize Firebase (if firebase script is loaded)
      if (typeof window.firebase !== "undefined") {
        window.firebase.initializeApp(this.firebaseConfig)
        console.log("Firebase initialized")
      }

      // Initialize modules in correct order
      console.log("Initializing I18n...")
      this.i18n = new window.I18n()
      await this.i18n.init()

      console.log("Initializing API...")
      this.api = new window.API()
      this.api.app = this // Set app reference
      this.api.init()

      console.log("Initializing Auth...")
      this.auth = new window.Auth(this)
      await this.auth.init()
      
      // HeaderComponentとSidebarComponentにappインスタンスを設定
      // ルーター初期化前に設定することで、コンポーネントがapp.i18n等にアクセスできるようにする
      if (window.HeaderComponent) {
          window.HeaderComponent.app = this;
      }
      if (window.SidebarComponent) {
          window.SidebarComponent.app = this;
      }

      console.log("Initializing Router...")
      this.router = new window.Router(this)
      this.router.init()

      // Initialize page instances with app reference
      // DashboardPage, LoginPage, RegisterPage などは router.loadPage でインスタンスが生成されるため、
      // ここでnewする必要はないが、window.dashboardPageなどのグローバル参照が必要な場合は定義
      if (window.DashboardPage) {
        // window.dashboardPage = new window.DashboardPage(this); // routerがインスタンスを生成するので不要
      }

      this.isInitialized = true
      console.log("Application initialized successfully")

      // Show app and hide loading screen
      this.showApp()
    } catch (error) {
      console.error("Failed to initialize application:", error)
      this.showError(this.i18n.t("errors.app_init_failed")); // 翻訳キー
    }
  }

  /**
   * Show app and hide loading screen
   * アプリを表示し、ローディング画面を非表示にする
   */
  showApp() {
    const loadingScreen = document.getElementById("loading-screen")
    const app = document.getElementById("app")

    if (loadingScreen) {
      loadingScreen.style.display = "none"
    }
    if (app) {
      app.classList.remove("d-none")
    }

    // Navigate to initial route if not already navigated
    if (this.router && !this.router.currentRoute) {
      const initialRoute = window.location.pathname === this.router.basePath || window.location.pathname === this.router.basePath + '/' ? "/dashboard" : window.location.pathname;
      this.router.navigate(initialRoute, false)
    }
  }

  /**
   * Login user
   * ユーザーをログイン
   */
  async login(email, password) {
    try {
      console.log("App.login called with:", email)

      if (!this.auth) {
        throw new Error(this.i18n.t("errors.auth_service_not_initialized")); // 翻訳キー
      }

      if (!email || !password) {
        throw new Error(this.i18n.t("errors.email_password_required")); // 翻訳キー
      }

      // Call auth service login
      const user = await this.auth.login(email, password)

      if (user) {
        this.currentUser = user
        console.log("Login successful in app:", user)

        // Show success message
        this.showSuccess(this.i18n.t("messages.login_success", { userName: user.name })); // 翻訳キー

        // Navigate to dashboard
        setTimeout(() => {
          this.navigate("/dashboard")
        }, 1000)

        return true
      } else {
        throw new Error(this.i18n.t("errors.login_failed_generic")); // 翻訳キー
      }
    } catch (error) {
      console.error("App login failed:", error)
      throw error // ログインページでエラーをハンドルさせる
    }
  }

  /**
   * Navigate to a specific route
   * 特定のルートに移動
   */
  navigate(path) {
    if (this.router) {
      this.router.navigate(path)
    }
  }

  /**
   * Check if user has specific role
   * ユーザーが特定のロールを持っているかチェック
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role
  }

  /**
   * Check if user has any of the specified roles
   * ユーザーが指定されたロールのいずれかを持っているかチェック
   */
  hasAnyRole(roles) {
    return this.currentUser && roles.includes(this.currentUser.role)
  }

  /**
   * Show success message
   * 成功メッセージを表示
   */
  showSuccess(message) {
    this.showToast(message, "success")
  }

  /**
   * Show error message
   * エラーメッセージを表示
   */
  showError(message) {
    this.showToast(message, "error")
  }

  /**
   * Show warning message
   * 警告メッセージを表示
   */
  showWarning(message) {
    this.showToast(message, "warning")
  }

  /**
   * Show info message
   * 情報メッセージを表示
   */
  showInfo(message) {
    this.showToast(message, "info")
  }

  /**
   * Show toast notification
   * トースト通知を表示
   */
  showToast(message, type = "info") {
    // Create toast container if it doesn't exist
    let container = document.getElementById("toast-container")
    if (!container) {
      container = document.createElement("div")
      container.id = "toast-container"
      container.className = "toast-container"
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
      `
      document.body.appendChild(container)
    }

    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.style.cssText = `
      background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : type === "warning" ? "#ffc107" : "#17a2b8"};
      color: white;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `

    toast.innerHTML = `
      <div class="toast-content" style="display: flex; justify-content: space-between; align-items: center;">
        <span class="toast-message">${this.sanitizeHtml(message)}</span>
        <button class="toast-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;" onclick="this.parentElement.parentElement.remove()" aria-label="${this.i18n.t('common.close')}">&times;</button>
      </div>
    `

    container.appendChild(toast)

    // Show toast
    setTimeout(() => {
      toast.style.opacity = "1"
      toast.style.transform = "translateX(0)"
    }, 100)

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = "0"
      toast.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 5000)
  }

  /**
   * Sanitize HTML to prevent XSS
   * XSS防止のためHTMLをサニタイズ
   */
  sanitizeHtml(str) {
    if (typeof str !== 'string') return str; // 文字列以外はそのまま返す
    const div = document.createElement("div")
    div.textContent = str
    return div.innerHTML
  }

  /**
   * Format date for display
   * 表示用に日付をフォーマット
   */
  formatDate(date) {
    if (!date) return ""

    const d = date instanceof Date ? date : new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")

    return `${year}/${month}/${day}`
  }

  /**
   * Format datetime for display
   * 表示用に日時をフォーマット
   */
  formatDateTime(date) {
    if (!date) return ""

    const d = date instanceof Date ? date : new Date(date)
    const dateStr = this.formatDate(d)
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")

    return `${dateStr} ${hours}:${minutes}`
  }

  /**
   * Get status badge HTML
   * ステータスバッジのHTMLを取得
   */
  getStatusBadge(status) {
    const statusConfig = {
      active: { class: "bg-success", textKey: "status.active" },
      pending_approval: { class: "bg-warning", textKey: "status.pending_approval" },
      developer_approval_pending: { class: "bg-warning", textKey: "status.developer_approval_pending" },
      inactive: { class: "bg-secondary", textKey: "status.inactive" },
      draft: { class: "bg-secondary", textKey: "status.draft" },
      approved: { class: "bg-success", textKey: "status.approved" },
      completed: { class: "bg-success", textKey: "status.completed" },
      self_assessed: { class: "bg-info", textKey: "status.self_assessed" },
      approved_by_evaluator: { class: "bg-primary", textKey: "status.approved_by_evaluator" },
      rejected: { class: "bg-danger", textKey: "status.rejected" },
      pending: { class: "bg-warning", textKey: "status.pending" }, // 評価一覧で使われる
    }

    const config = statusConfig[status] || { class: "bg-secondary", textKey: status };
    const translatedText = this.i18n.t(config.textKey);
    return `<span class="badge ${config.class}">${translatedText}</span>`
  }

  /**
   * Get status badge class (for use in dynamic class binding)
   * ステータスバッジのCSSクラス名のみを取得
   */
  getStatusBadgeClass(status) {
    const statusConfig = {
      active: { class: "bg-success" },
      pending_approval: { class: "bg-warning" },
      developer_approval_pending: { class: "bg-warning" },
      inactive: { class: "bg-secondary" },
      draft: { class: "bg-secondary" },
      approved: { class: "bg-success" },
      completed: { class: "bg-success" },
      self_assessed: { class: "bg-info" },
      approved_by_evaluator: { class: "bg-primary" },
      rejected: { class: "bg-danger" },
      pending: { class: "bg-warning" },
    }
    const config = statusConfig[status] || { class: "bg-secondary" };
    return config.class;
  }

  /**
   * Show loading state
   * ローディング状態を表示
   */
  showLoading(element) {
    if (element) {
      element.innerHTML = `<div class="loading"><span data-i18n="common.loading"></span></div>`;
      this.i18n.updateUI(element); // 翻訳適用
    }
  }

  /**
   * Hide loading state
   * ローディング状態を非表示
   */
  hideLoading(element) {
    if (element) {
      const loading = element.querySelector(".loading")
      if (loading) {
        loading.remove()
      }
    }
  }

  /**
   * Debounce function calls
   * 関数呼び出しをデバウンス
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Generate unique ID
   * ユニークIDを生成
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * Deep clone object
   * オブジェクトをディープクローン
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item))
    if (typeof obj === "object") {
      const clonedObj = {}
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) { // hasOwnPropertyを明示的に使用
          clonedObj[key] = this.deepClone(obj[key])
        }
      }
      return clonedObj
    }
  }

  /**
   * Validate email format
   * メールアドレスの形式を検証
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Get user display name
   * ユーザー表示名を取得
   */
  getUserDisplayName(user) {
    if (!user) return ""
    return user.name || user.email || this.i18n.t("common.unknown_user"); // 翻訳キー
  }

  /**
   * Check if user is authenticated
   * ユーザーが認証されているかチェック
   */
  isAuthenticated() {
    return !!this.currentUser
  }

  /**
   * Logout user
   * ユーザーをログアウト
   */
  async logout() {
    try {
      if (this.auth) {
        this.auth.logout()
      }
      this.currentUser = null

      // Update header and sidebar
      if (window.HeaderComponent) {
        window.HeaderComponent.hide()
      }
      if (window.SidebarComponent) {
        window.SidebarComponent.hide()
      }

      this.navigate("/login")
      this.showSuccess(this.i18n.t("messages.logout_success")); // 翻訳キー
    } catch (error) {
      console.error("Logout error:", error)
      this.showError(this.i18n.t("errors.logout_failed")); // 翻訳キー
    }
  }

  /**
   * Handle global errors
   * グローバルエラーを処理
   */
  handleError(error) {
    console.error("Application error:", error)

    let errorMessage = this.i18n.t("errors.system"); // デフォルトエラーメッセージ
    if (error && error.code) {
        if (error.code === "permission-denied") {
            errorMessage = this.i18n.t("errors.permission_denied");
        } else if (error.code === "network-error") {
            errorMessage = this.i18n.t("errors.network");
        } else if (error.code === "unauthenticated") {
            errorMessage = this.i18n.t("errors.unauthorized");
            this.navigate("/login"); // 認証エラーの場合はログインページへ
        }
    } else if (error && error.message) {
        // 特定のカスタムエラーメッセージがあればそれを使う
        if (error.message.includes("undefined")) { // 例: 'Cannot read properties of undefined'
             errorMessage = this.i18n.t("errors.component_init_failed"); // より具体的なメッセージ
        } else {
            errorMessage = error.message; // エラーメッセージがあれば表示
        }
    }
    this.showError(errorMessage);
  }
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing app...")

  // Wait for all scripts to load (a small delay to ensure all global components are defined)
  setTimeout(async () => {
    try {
      window.app = new App()
      await window.app.init()
      console.log("App initialization complete")
    } catch (error) {
      console.error("App initialization failed:", error)
      // Show error on loading screen
      const loadingContent = document.querySelector(".loading-content")
      if (loadingContent) {
        loadingContent.innerHTML = `
          <div class="alert alert-danger">
            <h4><span data-i18n="errors.init_error_title"></span></h4>
            <p><span data-i18n="errors.app_init_failed"></span></p>
            <button class="btn btn-primary mt-3" onclick="location.reload()"><span data-i18n="common.reload"></span></button>
          </div>
        `
        if (window.app && window.app.i18n) {
            window.app.i18n.updateUI(loadingContent); // 翻訳を適用
        }
      }
    }
  }, 500)
})

// Handle global errors
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error)
  if (window.app && typeof window.app.handleError === "function") {
    event.preventDefault(); // デフォルトのエラー表示を抑制
    window.app.handleError(event.error)
  }
})

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
  if (window.app && typeof window.app.handleError === "function") {
    event.preventDefault(); // デフォルトのコンソール表示を抑制
    window.app.handleError(event.reason)
  }
})

// Make App globally available
window.App = App
