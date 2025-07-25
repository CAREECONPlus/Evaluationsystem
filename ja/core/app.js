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

      // Initialize Firebase
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

      console.log("Initializing Router...")
      this.router = new window.Router(this)
      this.router.init()

      // Initialize page instances with app reference
      console.log("Initializing page instances...")
      if (window.DashboardPage) {
        window.dashboardPage = new window.DashboardPage(this)
      }

      this.isInitialized = true
      console.log("Application initialized successfully")

      // Show app and hide loading screen
      this.showApp()
    } catch (error) {
      console.error("Failed to initialize application:", error)
      this.showError("アプリケーションの初期化に失敗しました。")
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
      const initialRoute = window.location.pathname === "/" ? "/login" : window.location.pathname
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
        throw new Error("Auth service not initialized")
      }

      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      // Call auth service login
      const user = await this.auth.login(email, password)

      if (user) {
        this.currentUser = user
        console.log("Login successful in app:", user)

        // Show success message
        this.showSuccess(`${user.name}さん、ログインしました。`)

        // Navigate to dashboard
        setTimeout(() => {
          this.navigate("/dashboard")
        }, 1000)

        return true
      } else {
        throw new Error("Login failed")
      }
    } catch (error) {
      console.error("App login failed:", error)
      throw error
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
        <button class="toast-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;" onclick="this.parentElement.parentElement.remove()">&times;</button>
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
      active: { class: "badge-success", text: "アクティブ" },
      pending_approval: { class: "badge-warning", text: "承認待ち" },
      developer_approval_pending: { class: "badge-warning", text: "開発者承認待ち" },
      inactive: { class: "badge-secondary", text: "無効" },
      draft: { class: "badge-secondary", text: "下書き" },
      approved: { class: "badge-success", text: "承認済み" },
      completed: { class: "badge-success", text: "完了" },
      self_assessed: { class: "badge-info", text: "自己評価完了" },
      approved_by_evaluator: { class: "badge-success", text: "評価者承認済み" },
      rejected: { class: "badge-danger", text: "拒否" },
      pending: { class: "badge-warning", text: "未完了" },
    }

    const config = statusConfig[status] || { class: "badge-secondary", text: status }
    return `<span class="badge ${config.class}">${config.text}</span>`
  }

  /**
   * Show loading state
   * ローディング状態を表示
   */
  showLoading(element) {
    if (element) {
      element.innerHTML = '<div class="loading">読み込み中...</div>'
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
        if (obj.hasOwnProperty(key)) {
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
    return user.name || user.email || "Unknown User"
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
      this.showSuccess("ログアウトしました。")
    } catch (error) {
      console.error("Logout error:", error)
      this.showError("ログアウトに失敗しました。")
    }
  }

  /**
   * Handle global errors
   * グローバルエラーを処理
   */
  handleError(error) {
    console.error("Application error:", error)

    if (error && error.code === "permission-denied") {
      this.showError("権限がありません。")
    } else if (error && error.code === "network-error") {
      this.showError("ネットワークエラーが発生しました。")
    } else {
      this.showError("エラーが発生しました。")
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing app...")

  // Wait for all scripts to load
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
            <h4>初期化エラー</h4>
            <p>アプリケーションの初期化に失敗しました。</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">再読み込み</button>
          </div>
        `
      }
    }
  }, 500)
})

// Handle global errors
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error)
  if (window.app && typeof window.app.handleError === "function") {
    window.app.handleError(event.error)
  }
})

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
  if (window.app && typeof window.app.handleError === "function") {
    window.app.handleError(event.reason)
  }
})

// Make App globally available
window.App = App
