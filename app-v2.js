import { i18n } from "./i18n-v2.js?v=20250116-2"
import { API } from "./api-v5.js?v=20250917-fix1"
import { Auth } from "./auth-v4.js"
import { Router } from "./router.js?v=20250116-2"
import { HeaderComponent } from "./components/header.js?v=20250116-2"
import { SidebarComponent } from "./components/sidebar.js?v=20250116-2"

class App {
  constructor() {
    this.currentUser = null
    this.currentPage = null
    this.i18n = i18n
    this.auth = new Auth(this)
    this.api = null
    this.router = new Router(this)
    this.header = new HeaderComponent(this)
    this.sidebar = new SidebarComponent(this)
    this.accessibility = null
    this.performance = null
    this.animations = null

    // グローバルエラーハンドラーの設定
    this.setupGlobalErrorHandlers()
    
    // グローバルナビゲーションイベントハンドラー
    this.setupGlobalNavigation()
    
    // グローバルi18n参照を設定
    this.setupGlobalI18n()
  }

  async init() {
    this.showLoadingScreen()

    const initTimeout = setTimeout(() => {
      console.error("Application initialization timeout")
      this.showInitializationError("初期化がタイムアウトしました。ページを再読み込みしてください。")
    }, 15000) // 15秒のタイムアウト

    try {
      await this.auth.init()

      this.api = new API(this)

      try {
        await Promise.race([
          this.auth.listenForAuthChanges(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 15000))
        ])
      } catch (authError) {
        if (authError.message === "Auth timeout") {
          console.warn("⚠ Auth state check timed out, continuing with initialization")
        } else if (authError.message && authError.message.includes("Operation cancelled")) {
          console.warn("⚠ Auth operation cancelled, continuing with initialization")
        } else {
          console.warn("⚠ Auth initialization error, continuing:", authError.message)
        }
      }

      this.showApp()

      await this.router.route()

      // アクセシビリティ機能を動的にロード
      try {
        const { AccessibilityHelper } = await import("./js/accessibility.js")
        this.accessibility = new AccessibilityHelper(this)
        this.accessibility.init()
      } catch (error) {
        console.warn("⚠ Accessibility features could not be loaded:", error)
      }

      // パフォーマンス最適化を動的にロード
      try {
        const { PerformanceOptimizer } = await import("./js/performance.js")
        this.performance = new PerformanceOptimizer(this)
        this.performance.init()
      } catch (error) {
        console.warn("⚠ Performance optimizations could not be loaded:", error)
      }

      // アニメーションを動的にロード
      try {
        const { AnimationHelper } = await import("./js/animations.js")
        this.animations = new AnimationHelper(this)
        this.animations.init()
      } catch (error) {
        console.warn("⚠ Animation features could not be loaded:", error)
      }

      clearTimeout(initTimeout)
      
      // DOMContentLoaded時のi18n確認を追加
      this.setupI18nDOMReadyCheck();
      
    } catch (error) {
      clearTimeout(initTimeout)
      console.error("❌ Failed to initialize application:", error)
      this.showInitializationError("アプリケーションの起動中にエラーが発生しました。")
    } finally {
      clearTimeout(initTimeout)
      this.showApp()
    }
  }

  // グローバルナビゲーションイベントの設定
  setupGlobalNavigation() {
    // data-link属性を持つ要素のクリックイベントを処理
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          this.navigate(href);
        }
      }
    });
  }

  // グローバルi18n参照の設定
  setupGlobalI18n() {
    // i18nシステムをグローバルに公開
    window.i18n = this.i18n;
    window.app = this;
    
    // デバッグ用グローバル関数
    window.forceLogout = () => {
      console.log("=== FORCE LOGOUT CALLED ===")
      if (window.app && window.app.logout) {
        window.app.logout()
      } else {
        console.error("App or logout not available")
      }
    }
    
  }

  // DOMContentLoaded時のi18n確認を設定
  setupI18nDOMReadyCheck() {
    // アプリケーション初期化時にi18nを呼び出す
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.performI18nCheck();
      });
    } else {
      // 既にDOM準備完了の場合は即座に実行
      this.performI18nCheck();
    }
  }

  performI18nCheck() {
    // i18nシステムが利用可能になるまで待機
    if (window.i18n) {
      console.log("I18n System: Ready, current language:", window.i18n.getCurrentLanguage());
      window.i18n.applyTranslations(); // 翻訳を適用
    } else {
      // i18nが読み込まれるまで少し待つ
      setTimeout(() => {
        if (window.i18n) {
          console.log("I18n System: Ready, current language:", window.i18n.getCurrentLanguage());
          window.i18n.applyTranslations(); // 翻訳を適用
        }
      }, 100);
    }
  }

  // グローバルエラーハンドラーの設定
  setupGlobalErrorHandlers() {
    // 未処理のPromiseエラーをキャッチ
    window.addEventListener("unhandledrejection", (event) => {
      if (this.isOperationCancelledError(event.reason)) {
        console.log("[App] Firebase operation cancelled - likely due to page reload, ignoring error")
        event.preventDefault()
        return
      }

      console.error("Unhandled promise rejection:", event.reason)
      this.handleError(event.reason, "Promise rejection")
      event.preventDefault()
    })

    // 一般的なJavaScriptエラーをキャッチ
    window.addEventListener("error", (event) => {
      if (this.isOperationCancelledError(event.error)) {
        console.log("[App] Firebase timer operation cancelled - likely due to page reload, ignoring error")
        event.preventDefault()
        return
      }

      console.error("Global error:", event.error)
      this.handleError(event.error, "JavaScript error")
      event.preventDefault()
    })
  }

  // Operation cancelled エラーの判定
  isOperationCancelledError(error) {
    return error && error.message && error.message.includes("Operation cancelled")
  }

  // 統一エラーハンドリング
  handleError(error, context = "") {
    if (this.isOperationCancelledError(error)) {
      console.log(`[App] Firebase operation cancelled in ${context} - likely due to page reload, ignoring error`)
      return
    }

    console.error(`Error in ${context}:`, error)

    let message = ""

    // エラータイプに応じた処理
    if (error?.code) {
      // Firebaseエラー
      switch (error.code) {
        case "permission-denied":
          message = "権限がありません。管理者に連絡してください。"
          break
        case "unavailable":
          message = "サービスが一時的に利用できません。しばらくしてからお試しください。"
          break
        case "unauthenticated":
          message = "ログインが必要です。"
          this.navigate("#/login")
          break
        case "network-request-failed":
          message = "ネットワークエラーが発生しました。接続を確認してください。"
          break
        default:
          message = error.message || "予期せぬエラーが発生しました。"
      }
    } else if (error instanceof TypeError) {
      message = "データの処理中にエラーが発生しました。"
    } else if (error instanceof ReferenceError) {
      message = "システムエラーが発生しました。"
    } else {
      message = error?.message || "予期せぬエラーが発生しました。"
    }

    this.showError(message)
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen")
    const appContainer = document.getElementById("app")
    
    if (loadingScreen) loadingScreen.classList.remove("d-none")
    if (appContainer) appContainer.classList.add("d-none")
  }

  showApp() {
    const loadingScreen = document.getElementById("loading-screen")
    const appContainer = document.getElementById("app")
    
    if (loadingScreen) loadingScreen.classList.add("d-none")
    if (appContainer) appContainer.classList.remove("d-none")
  }

  showInitializationError(message) {
    const loadingScreen = document.getElementById("loading-screen")
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="loading-content text-center">
          <div class="text-danger mb-3">
            <i class="fas fa-exclamation-circle fa-4x"></i>
          </div>
          <h2 class="text-white">初期化エラー</h2>
          <p class="text-white-50">${message}</p>
          <div class="mt-4">
            <button class="btn btn-light me-2" onclick="location.reload()">
              <i class="fas fa-redo me-2"></i>再読み込み
            </button>
          </div>
        </div>
      `
    }
  }

async login(email, password) {
    try {
      // 基本的なバリデーション
      if (!email || !email.trim()) {
        throw new Error("メールアドレスを入力してください")
      }
      if (!password || password.length < 6) {
        throw new Error("パスワードは6文字以上で入力してください")
      }

      const result = await this.auth.login(email.trim(), password)
      
      console.log("DEBUG: app-v2.js received result:", result);
      
      // 一時認証の場合の処理
      if (result && result.user && result.user.isTemp) {
        console.log('App: Processing temporary authentication result');
        
        // 一時ユーザー情報を設定
        this.currentUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: result.user.role,
          tenantId: result.user.tenantId,
          status: result.user.status,
          isTemp: true
        };
        
        // UI更新
        this.updateUIForAuthState(this.currentUser);
        
        // ダッシュボードに遷移
        this.navigate('#/dashboard');
        
        return;
      }
      
    } catch (error) {
      this.handleError(error, "Login")
      throw error
    }
  }

  logout() {
    try {
      // ローディング表示
      this.showLoading("ログアウト中...")
      
      // 即座にローカル状態をクリア
      this.currentUser = null
      
      // UI状態を即座に更新
      this.updateUIForAuthState(null)
      
      // Firebase認証のクリーンアップ（非同期でバックグラウンド実行）
      if (this.auth && this.auth.isInitialized) {
        this.auth.logout().catch(e => {
          console.warn("App: Firebase logout failed, but continuing:", e)
        })
      }
      
      // ストレージの手動クリーンアップ
      this.manualStorageCleanup()
      
      // 即座にログイン画面にリダイレクト
      this.navigate("#/login")
      
      // UIクリーンアップとメッセージ表示
      setTimeout(() => {
        this.hideLoading()
        this.showSuccess("ログアウトしました")
      }, 100)
      
      return Promise.resolve()
      
    } catch (error) {
      console.error("App: Logout error:", error)
      
      // エラー時も強制的にログアウト状態にする
      this.currentUser = null
      this.updateUIForAuthState(null)
      this.manualStorageCleanup()
      
      // 強制リダイレクト
      try {
        this.navigate("#/login")
      } catch (navError) {
        console.error("App: Navigation failed, forcing reload")
        window.location.href = "#/login"
        window.location.reload()
      }
      
      this.hideLoading()
      this.showWarning("強制ログアウトしました")
      return Promise.resolve()
    }
  }

  navigate(path) {
    // ルーターのnavigate メソッドを使用
    this.router.navigate(path)

    // アクセシビリティ通知
    if (this.accessibility) {
      this.accessibility.announce("ページを読み込んでいます")
    }
  }

updateUIForAuthState(user) {
    this.currentUser = user;


    // ログイン状態に応じてヘッダーとサイドバーの表示を制御
    if (user) {
      // ログイン済みの場合
      
      // ヘッダーとサイドバーのHTMLを挿入
      const headerContainer = document.getElementById("header-container");
      const sidebarContainer = document.getElementById("sidebar-container");
      
      if (headerContainer) {
        headerContainer.innerHTML = this.header.render();
        // DOM要素が確実に存在するまで少し待ってから初期化
        setTimeout(() => {
          try {
            this.header.init();
          } catch (error) {
            console.error("App: Header initialization error:", error);
          }
        }, 100);
      }
      
      if (sidebarContainer) {
        try {
          const sidebarHtml = this.sidebar.render();
          sidebarContainer.innerHTML = sidebarHtml;
          
          // サイドバーの初期化をより確実に
          setTimeout(() => {
            try {
              this.sidebar.init();
            } catch (error) {
              console.error("App: Sidebar initialization error:", error);
            }
          }, 150); // サイドバーはヘッダーより少し遅らせる
          
        } catch (error) {
          console.error("App: Sidebar rendering error:", error);
        }
      }
      
      // ログインページのクリーンアップ
      const loginPageElements = document.querySelectorAll(".login-page");
      loginPageElements.forEach((el) => el.remove());
      
    } else {
      // 未ログインの場合
      // ヘッダーとサイドバーをクリア
      const headerContainer = document.getElementById("header-container");
      const sidebarContainer = document.getElementById("sidebar-container");
      if (headerContainer) headerContainer.innerHTML = "";
      if (sidebarContainer) sidebarContainer.innerHTML = "";
    }
  }


  isAuthenticated() {
    return !!this.currentUser
  }

  hasRole(role) {
    return this.isAuthenticated() && this.currentUser.role === role
  }

  hasAnyRole(roles) {
    return this.isAuthenticated() && roles.includes(this.currentUser.role)
  }

  showToast(message, type = "info", duration = 5000) {
    const toastContainer = document.getElementById("toast-container")
    if (!toastContainer) return

    const toastId = `toast-${Date.now()}`
    const iconMap = {
      success: "fa-check-circle",
      danger: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    }

    const toastHTML = `
          <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
              <div class="d-flex">
                  <div class="toast-body">
                    <i class="fas ${iconMap[type]} me-2"></i>
                    ${this.sanitizeHtml(message)}
                  </div>
                  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
              </div>
          </div>
      `
    toastContainer.insertAdjacentHTML("beforeend", toastHTML)
    const toastElement = document.getElementById(toastId)
    const toast = new window.bootstrap.Toast(toastElement, { delay: duration })
    toast.show()
    toastElement.addEventListener("hidden.bs.toast", () => toastElement.remove())
  }

  showSuccess(message) {
    this.showToast(message, "success")
  }

  showError(message) {
    this.showToast(message, "danger", 8000) // エラーは長めに表示
  }

  showWarning(message) {
    this.showToast(message, "warning", 6000)
  }

  showInfo(message) {
    this.showToast(message, "info")
  }

  sanitizeHtml(str) {
    if (!str) return ""
    const temp = document.createElement("div")
    temp.textContent = str
    return temp.innerHTML
  }

  // 入力値のサニタイゼーション
  sanitizeInput(input) {
    if (!input) return ""
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  }

  getStatusBadgeClass(status) {
    const statusClasses = {
      active: "bg-success",
      suspended: "bg-secondary",
      developer_approval_pending: "bg-info text-dark",
      pending_approval: "bg-warning text-dark",
      rejected: "bg-danger",
      self_assessed: "bg-info text-dark",
      completed: "bg-primary",
      draft: "bg-secondary",
      approved: "bg-success",
      pending: "bg-warning text-dark",
    }
    return statusClasses[status] || "bg-light text-dark"
  }

  getRoleBadgeClass(role) {
    const roleClasses = {
      developer: "bg-dark",
      admin: "bg-primary",
      evaluator: "bg-info",
      worker: "bg-secondary",
    }
    return roleClasses[role] || "bg-light text-dark"
  }

  formatDate(timestamp, withTime = false) {
    if (!timestamp) return "-"

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      if (isNaN(date)) return "-"

      const locale = this.i18n.lang === "ja" ? "ja-JP" : this.i18n.lang === "vi" ? "vi-VN" : "en-US"

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      }

      if (withTime) {
        options.hour = "2-digit"
        options.minute = "2-digit"
      }

      return new Intl.DateTimeFormat(locale, options).format(date)
    } catch (error) {
      console.error("Date formatting error:", error)
      return "-"
    }
  }

  // 確認ダイアログの表示
  async confirm(message, title = "確認") {
    return new Promise((resolve) => {
      // カスタム確認ダイアログのHTMLを作成
      const modalHTML = `
        <div class="modal fade" id="confirmModal" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${this.sanitizeHtml(title)}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <p>${this.sanitizeHtml(message)}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                <button type="button" class="btn btn-primary" id="confirmBtn">確認</button>
              </div>
            </div>
          </div>
        </div>
      `

      // モーダルを追加
      document.body.insertAdjacentHTML("beforeend", modalHTML)
      const modalElement = document.getElementById("confirmModal")
      const modal = new window.bootstrap.Modal(modalElement)

      // イベントリスナー設定
      document.getElementById("confirmBtn").addEventListener("click", () => {
        modal.hide()
        resolve(true)
      })

      modalElement.addEventListener("hidden.bs.modal", () => {
        modalElement.remove()
        resolve(false)
      })

      modal.show()
    })
  }

  // ローディング表示
  showLoading(message = "処理中...") {
    const loadingHTML = `
      <div id="global-loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="card">
          <div class="card-body text-center">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <p class="mb-0">${this.sanitizeHtml(message)}</p>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", loadingHTML)
  }

  hideLoading() {
    const loading = document.getElementById("global-loading")
    if (loading) loading.remove()
  }

  // デバッグモード
  enableDebugMode() {
    window.DEBUG = true
    console.log("Debug mode enabled")
    window.debugApp = this
  }


  // 手動ストレージクリーンアップ
  manualStorageCleanup() {
    try {
      // ローカルストレージのクリア
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('firebase:') || key.includes('auth') || key.includes('user'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      // セッションストレージのクリア
      if (typeof sessionStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.startsWith('firebase:') || key.includes('auth') || key.includes('user'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key))
      }
    } catch (cleanupError) {
      console.warn("App: Manual storage cleanup failed:", cleanupError)
    }
  }

  disableDebugMode() {
    window.DEBUG = false
    console.log("Debug mode disabled")
  }

  debug(...args) {
    if (window.DEBUG) {
      console.log("[DEBUG]", ...args)
    }
  }
}

export default App
