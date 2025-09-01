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
  }

 async init() {
  console.log("Starting application initialization...")
  this.showLoadingScreen()

  const initTimeout = setTimeout(() => {
    console.error("Application initialization timeout")
    this.showInitializationError("初期化がタイムアウトしました。ページを再読み込みしてください。")
  }, 30000) // 30秒に延長

  try {
    console.log("Step 1: Initializing I18n...")
    await this.i18n.init()
    console.log("✓ I18n initialized")

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
        new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 15000)) // Auth部分は15秒のまま
      ])
      console.log("✓ Auth state listener has completed its initial check.")
    } catch (authError) {
      if (authError.message === "Auth timeout") {
        console.warn("⚠ Auth state check timed out, continuing with initialization")
      } else if (authError.message && authError.message.includes("Operation cancelled")) {
        console.warn("⚠ Auth operation cancelled, continuing with initialization")
      } else {
        console.warn("⚠ Auth error occurred, continuing with initialization:", authError.message)
        // エラーを投げ直さずに継続
      }
    }

    // タイムアウトをクリア（成功時）
    clearTimeout(initTimeout)

    console.log("Step 5: Showing app...")
    this.showApp()

    console.log("Step 6: Initial routing...")
    await this.router.route()

    // 以下の動的インポートを並列実行に変更して高速化
    console.log("Step 7-9: Loading additional features...")
    await Promise.allSettled([
      // アクセシビリティ機能
      import("./js/accessibility.js").then(({ AccessibilityHelper }) => {
        this.accessibility = new AccessibilityHelper(this)
        this.accessibility.init()
        console.log("✓ Accessibility features initialized")
      }).catch(error => {
        console.warn("⚠ Accessibility features could not be loaded:", error)
      }),
      
      // パフォーマンス最適化
      import("./js/performance.js").then(({ PerformanceOptimizer }) => {
        this.performance = new PerformanceOptimizer(this)
        this.performance.init()
        console.log("✓ Performance optimizations initialized")
      }).catch(error => {
        console.warn("⚠ Performance optimizations could not be loaded:", error)
      }),
      
      // アニメーション
      import("./js/animations.js").then(({ AnimationHelper }) => {
        this.animations = new AnimationHelper(this)
        this.animations.init()
        console.log("✓ Animations initialized")
      }).catch(error => {
        console.warn("⚠ Animation features could not be loaded:", error)
      })
    ])

    console.log("🎉 Application initialized successfully")
  } catch (error) {
    clearTimeout(initTimeout)
    console.error("❌ Failed to initialize application:", error)
    
    // 重大なエラーの場合のみエラー画面を表示
    if (!error.message.includes("timeout") && !error.message.includes("Operation cancelled")) {
      this.showInitializationError("アプリケーションの起動中にエラーが発生しました。")
    } else {
      // タイムアウトや軽微なエラーの場合はアプリを表示して継続
      console.warn("⚠ Non-critical initialization error, continuing...")
      this.showApp()
    }
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

// グローバルエラーハンドラーの設定
setupGlobalErrorHandlers() {
  // 未処理のPromiseエラーをキャッチ
  window.addEventListener("unhandledrejection", (event) => {
    if (this.isOperationCancelledError(event.reason)) {
      console.log("[App] Firebase operation cancelled - likely due to page reload, ignoring error")
      event.preventDefault()
      return
    }

    // Modal関連のエラーを無視
    if (this.isModalError(event.reason)) {
      console.log("[App] Modal operation error ignored:", event.reason.message)
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

    // Modal関連のエラーを無視
    if (this.isModalError(event.error)) {
      console.log("[App] Modal operation error ignored:", event.error.message)
      event.preventDefault()
      return
    }

    // DOM関連エラーを無視
    if (this.isDOMError(event.error)) {
      console.log("[App] DOM operation error ignored:", event.error.message)
      event.preventDefault()
      return
    }

    console.error("Global error:", event.error)
    this.handleError(event.error, "JavaScript error")
    event.preventDefault()
  })
}

// Modal関連エラーの判定
isModalError(error) {
  return error && error.message && (
    error.message.includes("Cannot read properties of null") ||
    error.message.includes("_hideModal") ||
    error.message.includes("modal.js") ||
    error.message.includes("bootstrap") ||
    error.stack && error.stack.includes("modal")
  )
}

// DOM関連エラーの判定  
isDOMError(error) {
  return error && error.message && (
    error.message.includes("Cannot read properties of null (reading 'style')") ||
    error.message.includes("Cannot read properties of undefined (reading 'style')") ||
    (error.stack && error.stack.includes("style"))
  )
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
    try {
      await this.auth.logout()
    } catch (error) {
      this.handleError(error, "Logout")
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

  /**
   * 現在のユーザー情報を取得
   */
  getCurrentUser() {
    return this.currentUser;
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
    // 既存のconfirmModalを削除
    const existingModal = document.getElementById("confirmModal");
    if (existingModal) {
      existingModal.remove();
    }

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
    `;

    // モーダルを追加
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    const modalElement = document.getElementById("confirmModal");
    
    // Bootstrap modal の存在確認
    if (!window.bootstrap || !window.bootstrap.Modal) {
      console.error("Bootstrap Modal not available");
      resolve(false);
      return;
    }
    
    const modal = new window.bootstrap.Modal(modalElement);

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

showLoading(message = "処理中...") {
  try {
    // 既存のローディングを削除
    this.hideLoading();
    
    const loadingHTML = `
      <div id="global-loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="card">
          <div class="card-body text-center">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <p class="mb-0">${this.sanitizeHtml(message)}</p>
          </div>
        </div>
      </div>
    `;
    
    if (document.body) {
      document.body.insertAdjacentHTML("beforeend", loadingHTML);
    } else {
      console.warn("App: Cannot show loading - document.body not available");
    }
  } catch (error) {
    console.error("App: Error showing loading:", error);
  }
}

hideLoading() {
  try {
    const loading = document.getElementById("global-loading");
    if (loading && loading.parentNode) {
      loading.remove();
    }
  } catch (error) {
    console.error("App: Error hiding loading:", error);
  }
}

  // デバッグモード
  enableDebugMode() {
    window.DEBUG = true
    console.log("Debug mode enabled")
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
