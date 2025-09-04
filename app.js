import { I18n } from "./i18n.js"
import { API } from "./api.js"
import { Auth } from "./auth.js"
import { Router } from "./router.js"
import { HeaderComponent } from "./components/header.js"
import { SidebarComponent } from "./components/sidebar.js"

class App {
  constructor() {
    this.currentUser = null
    this.currentPage = null
    this.i18n = new I18n()
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
    console.log("Starting application initialization...")
    this.showLoadingScreen()

    const initTimeout = setTimeout(() => {
      console.error("Application initialization timeout")
      this.showInitializationError("初期化がタイムアウトしました。ページを再読み込みしてください。")
    }, 15000) // 15秒のタイムアウト

    try {
      console.log("Step 1: Initializing I18n...")
      await this.i18n.init()
      console.log("✓ I18n initialized")
      
      // i18nシステムの利用可能性をデバッグ出力
      if (window.i18n) {
        console.log('I18n system loaded and available globally');
        console.log('Current language:', window.i18n.getCurrentLanguage());
        window.i18n.debug();
      }

      console.log("Step 2: Initializing Auth module...")
      await this.auth.init()
      console.log("✓ Auth module initialized")

      console.log("Step 3: Initializing API...")
      this.api = new API(this)
      console.log("✓ API initialized")

      console.log("Step 4: Setting up and awaiting auth state listener...")
      try {
        await Promise.race([
          this.auth.listenForAuthChanges(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 10000))
        ])
        console.log("✓ Auth state listener has completed its initial check.")
      } catch (authError) {
        if (authError.message === "Auth timeout") {
          console.warn("⚠ Auth state check timed out, continuing with initialization")
        } else if (authError.message && authError.message.includes("Operation cancelled")) {
          console.warn("⚠ Auth operation cancelled, continuing with initialization")
        } else {
          throw authError
        }
      }

      console.log("Step 5: Showing app...")
      this.showApp()

      console.log("Step 6: Initial routing...")
      await this.router.route()

      // アクセシビリティ機能を動的にロード
      console.log("Step 7: Loading accessibility features...")
      try {
        const { AccessibilityHelper } = await import("./js/accessibility.js")
        this.accessibility = new AccessibilityHelper(this)
        this.accessibility.init()
        console.log("✓ Accessibility features initialized")
      } catch (error) {
        console.warn("⚠ Accessibility features could not be loaded:", error)
      }

      // パフォーマンス最適化を動的にロード
      console.log("Step 8: Loading performance optimizations...")
      try {
        const { PerformanceOptimizer } = await import("./js/performance.js")
        this.performance = new PerformanceOptimizer(this)
        this.performance.init()
        console.log("✓ Performance optimizations initialized")
      } catch (error) {
        console.warn("⚠ Performance optimizations could not be loaded:", error)
      }

      // アニメーションを動的にロード
      console.log("Step 9: Loading animations...")
      try {
        const { AnimationHelper } = await import("./js/animations.js")
        this.animations = new AnimationHelper(this)
        this.animations.init()
        console.log("✓ Animations initialized")
      } catch (error) {
        console.warn("⚠ Animation features could not be loaded:", error)
      }

      clearTimeout(initTimeout)
      console.log("🎉 Application initialized successfully")
      
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
          console.log('App: Global navigation to', href);
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
    console.log("App: Global i18n references set up");
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
      console.log('I18n system loaded');
      window.i18n.debug(); // デバッグ情報表示
    } else {
      // i18nが読み込まれるまで少し待つ
      setTimeout(() => {
        if (window.i18n) {
          console.log('I18n system loaded after delay');
          window.i18n.debug();
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

      await this.auth.login(email.trim(), password)
    } catch (error) {
      this.handleError(error, "Login")
      throw error
    }
  }

  async logout() {
    console.log("App: logout() called")
    
    try {
      // ローディング表示
      this.showLoading("ログアウト中...")
      console.log("App: Starting logout process...")
      
      // 先にローカル状態をクリア（認証状態リスナーの競合を避けるため）
      this.currentUser = null
      
      // Firebase認証が利用可能かチェック
      if (this.auth && typeof this.auth.logout === 'function') {
        try {
          // Firebase認証のサインアウト実行
          await this.auth.logout()
          console.log("App: Firebase logout completed successfully")
        } catch (authError) {
          console.warn("App: Firebase logout failed, but continuing:", authError)
        }
      } else {
        console.warn("App: Firebase auth not available, proceeding with local logout")
      }
      
      // UI状態更新
      this.updateUIForAuthState(null)
      
      // ログイン画面にリダイレクト
      console.log("App: Redirecting to login page...")
      this.navigate("#/login")
      
      // 成功メッセージを少し遅延させて表示
      setTimeout(() => {
        this.hideLoading()
        if (this.i18n && this.i18n.t) {
          this.showSuccess(this.i18n.t("messages.logout_success") || "ログアウトしました")
        } else {
          this.showSuccess("ログアウトしました")
        }
      }, 200)
      
    } catch (error) {
      console.error("App: logout() failed:", error)
      
      // エラーが発生してもローカル状態をクリア
      this.currentUser = null
      this.updateUIForAuthState(null)
      
      try {
        this.navigate("#/login")
      } catch (navError) {
        console.error("App: Navigation failed, forcing page reload")
        window.location.hash = "#/login"
        window.location.reload()
      }
      
      // 警告メッセージ
      setTimeout(() => {
        this.hideLoading()
        this.showWarning("ログアウトしました（一部処理でエラーが発生しましたが、安全にログアウトされています）")
      }, 200)
    }
  }

  navigate(path) {
    console.log("App: navigate called with path:", path)
    
    // ルーターのnavigate メソッドを使用
    this.router.navigate(path)

    // アクセシビリティ通知
    if (this.accessibility) {
      this.accessibility.announce("ページを読み込んでいます")
    }
  }

updateUIForAuthState(user) {
    this.currentUser = user;

    console.log("App: updateUIForAuthState called with user:", user ? user.email : 'null');

    // ログイン状態に応じてヘッダーとサイドバーの表示を制御
    if (user) {
      // ログイン済みの場合
      console.log("App: User authenticated, updating header and sidebar");
      console.log("App: Current user details:", { 
        name: user.name, 
        email: user.email, 
        role: user.role 
      });
      
      // ヘッダーとサイドバーのHTMLを挿入
      const headerContainer = document.getElementById("header-container");
      const sidebarContainer = document.getElementById("sidebar-container");
      
      if (headerContainer) {
        console.log("App: Rendering header...");
        headerContainer.innerHTML = this.header.render();
        // DOM要素が確実に存在するまで少し待ってから初期化
        setTimeout(() => {
          console.log("App: Initializing header...");
          try {
            this.header.init();
          } catch (error) {
            console.error("App: Header initialization error:", error);
          }
        }, 100);
      }
      
      if (sidebarContainer) {
        console.log("App: Rendering sidebar...");
        try {
          // サイドバーのレンダリング前にユーザー情報を再確認
          console.log("App: Sidebar rendering with user:", this.currentUser);
          const sidebarHtml = this.sidebar.render();
          console.log("App: Sidebar HTML generated, length:", sidebarHtml.length);
          sidebarContainer.innerHTML = sidebarHtml;
          
          // サイドバーの初期化をより確実に
          setTimeout(() => {
            console.log("App: Initializing sidebar...");
            try {
              this.sidebar.init();
              console.log("App: Sidebar initialization completed");
              
              // 初期化後の内容確認
              const navLinks = sidebarContainer.querySelectorAll('.nav-link');
              console.log("App: Sidebar nav links found:", navLinks.length);
              
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
      console.log("App: User not authenticated, clearing header and sidebar");
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

  // デバッグ用ログアウトテスト
  testLogout() {
    console.log("=== LOGOUT TEST START ===")
    console.log("window.app:", window.app)
    console.log("window.app.logout:", window.app?.logout)
    console.log("this.auth:", this.auth)
    console.log("this.currentUser:", this.currentUser)
    console.log("=== CALLING LOGOUT ===")
    if (this.logout) {
      this.logout().then(() => {
        console.log("=== LOGOUT COMPLETED ===")
      }).catch(e => {
        console.error("=== LOGOUT ERROR ===", e)
      })
    } else {
      console.error("=== LOGOUT METHOD NOT FOUND ===")
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
