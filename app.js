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

      // ★ ページアンロードクリーンアップの設定を追加
      console.log("Step 10: Setting up cleanup handlers...")
      this.setupPageUnloadCleanup()
      console.log("✓ Cleanup handlers initialized")

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

  // グローバルエラーハンドラーの設定（強化版）
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

      // Bootstrap関連のDOM操作エラーを無視
      if (this.isBootstrapDOMError(event.reason)) {
        console.log("[App] Bootstrap DOM operation error ignored:", event.reason.message)
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

      // Bootstrap関連のDOM操作エラーを無視
      if (this.isBootstrapDOMError(event.error)) {
        console.log("[App] Bootstrap DOM operation error ignored:", event.error.message)
        event.preventDefault()
        return
      }

      console.error("Global error:", event.error)
      this.handleError(event.error, "JavaScript error")
      event.preventDefault()
    })
  }

  // Bootstrap DOM関連エラーの判定（新しいメソッド）
  isBootstrapDOMError(error) {
    return error && error.message && (
      error.message.includes("Cannot read properties of null (reading 'style')") ||
      error.message.includes("_hideModal") ||
      error.message.includes("Cannot read properties of null (reading 'classList')") ||
      error.message.includes("Cannot read properties of undefined (reading 'classList')") ||
      (error.stack && (
        error.stack.includes("modal.js") ||
        error.stack.includes("_hideModal") ||
        error.stack.includes("bootstrap") ||
        error.stack.includes("Hi._hideModal")
      ))
    )
  }

  // Modal関連エラーの判定（強化版）
  isModalError(error) {
    return error && error.message && (
      error.message.includes("Cannot read properties of null") ||
      error.message.includes("Cannot read properties of undefined") ||
      error.message.includes("_hideModal") ||
      error.message.includes("modal.js") ||
      error.message.includes("bootstrap") ||
      error.message.includes("Hi._hideModal") ||
      (error.stack && (
        error.stack.includes("modal") ||
        error.stack.includes("_hideModal") ||
        error.stack.includes("bootstrap")
      ))
    )
  }

  // DOM関連エラーの判定（強化版）
  isDOMError(error) {
    return error && error.message && (
      error.message.includes("Cannot read properties of null (reading 'style')") ||
      error.message.includes("Cannot read properties of undefined (reading 'style')") ||
      error.message.includes("Cannot read properties of null (reading 'classList')") ||
      error.message.includes("Cannot read properties of undefined (reading 'classList')") ||
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

  // ページアンロード時のクリーンアップ（新しいメソッド）
  setupPageUnloadCleanup() {
    window.addEventListener('beforeunload', () => {
      try {
        // 全てのモーダルを強制クリーンアップ
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
          try {
            const modalInstance = window.bootstrap?.Modal?.getInstance(modal);
            if (modalInstance) {
              modalInstance.dispose();
            }
          } catch (error) {
            console.warn("App: Error disposing modal on unload:", error);
          }
        });

        // バックドロップの削除
        const backdrops = document.querySelectorAll('.modal-backdrop, .sidebar-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // body スタイルのリセット
        document.body.classList.remove('modal-open', 'mobile-menu-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

      } catch (error) {
        console.warn("App: Error in page unload cleanup:", error);
      }
    });
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
    console.log('App: Starting logout process...');
    
    // 認証システムのログアウト処理
    if (this.auth && typeof this.auth.logout === 'function') {
      await this.auth.logout();
      console.log('App: Auth logout completed');
    } else {
      console.warn('App: Auth system not available');
    }
    
    // ユーザー情報をクリア
    this.currentUser = null;
    
    // UIを更新
    this.updateUIForAuthState(null);
    
    // ダッシュボードやその他のページの自動更新タイマーをクリア
    if (this.router && this.router.getCurrentPageInstance()) {
      const currentPage = this.router.getCurrentPageInstance();
      if (currentPage && typeof currentPage.cleanup === 'function') {
        currentPage.cleanup();
      }
    }
    
    // ログインページにリダイレクト
    this.navigate('#/login');
    
    console.log('App: Logout process completed');
    
    // ログアウト成功メッセージ
    setTimeout(() => {
      this.showSuccess(window.i18n ? 
        window.i18n.t('auth.logout_success') : 
        'ログアウトしました'
      );
    }, 100);
    
  } catch (error) {
    console.error('App: Error during logout:', error);
    
    // エラーが発生してもログアウト処理を続行
    this.currentUser = null;
    this.updateUIForAuthState(null);
    this.navigate('#/login');
    
    this.showError(window.i18n ? 
      window.i18n.t('errors.logout_failed') : 
      'ログアウト中にエラーが発生しましたが、ログアウトしました'
    );
  }
}

// confirm メソッドも追加（もし存在しない場合）
async confirm(message, title = '確認') {
  return new Promise((resolve) => {
    // シンプルなconfirmダイアログを使用
    // より高度なモーダルが必要な場合は、Bootstrapモーダルを使用
    const result = window.confirm(`${title}\n\n${message}`);
    resolve(result);
  });
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

  // 確認ダイアログの表示（改善版）
  async confirm(message, title = "確認") {
    return new Promise((resolve) => {
      try {
        // 既存のconfirmModalを安全に削除
        this.safelyRemoveModal("confirmModal");

        // カスタム確認ダイアログのHTMLを作成
        const modalHTML = `
          <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="confirmModalLabel">${this.sanitizeHtml(title)}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p class="mb-0">${this.sanitizeHtml(message)}</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="confirmCancelBtn">キャンセル</button>
                  <button type="button" class="btn btn-primary" id="confirmOkBtn">確認</button>
                </div>
              </div>
            </div>
          </div>
        `;

        // モーダルを追加
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        const modalElement = document.getElementById("confirmModal");
        
        if (!modalElement) {
          console.error("App: Failed to create confirm modal");
          resolve(false);
          return;
        }
        
        // Bootstrap modal の存在確認
        if (!window.bootstrap || !window.bootstrap.Modal) {
          console.error("App: Bootstrap Modal not available");
          resolve(false);
          return;
        }
        
        try {
          const modal = new window.bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
          });

          // 確認ボタンのイベントリスナー
          const confirmBtn = document.getElementById("confirmOkBtn");
          if (confirmBtn) {
            confirmBtn.addEventListener("click", () => {
              this.safelyHideModal(modal, modalElement, () => resolve(true));
            });
          }

          // キャンセルボタンのイベントリスナー
          const cancelBtn = document.getElementById("confirmCancelBtn");
          if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
              this.safelyHideModal(modal, modalElement, () => resolve(false));
            });
          }

          // モーダルが閉じられた時の処理
          modalElement.addEventListener("hidden.bs.modal", () => {
            try {
              if (modalElement && modalElement.parentNode) {
                modalElement.remove();
              }
            } catch (error) {
              console.warn("App: Error removing confirm modal:", error);
            }
            resolve(false);
          }, { once: true });

          // モーダルを表示
          modal.show();
          
        } catch (modalError) {
          console.error("App: Error creating Bootstrap modal:", modalError);
          this.safelyRemoveModal("confirmModal");
          resolve(false);
        }
        
      } catch (error) {
        console.error("App: Error in confirm dialog:", error);
        resolve(false);
      }
    });
  }

  // モーダルを安全に非表示にする（新しいメソッド）
  safelyHideModal(modalInstance, modalElement, callback) {
    try {
      if (modalInstance && typeof modalInstance.hide === 'function') {
        // コールバックを一度だけ実行するためのフラグ
        let callbackExecuted = false;
        
        const executeCallback = () => {
          if (!callbackExecuted && callback) {
            callbackExecuted = true;
            try {
              callback();
            } catch (callbackError) {
              console.warn("App: Callback execution error:", callbackError);
            }
          }
        };

        // hidden イベントリスナーを設定
        if (modalElement) {
          modalElement.addEventListener("hidden.bs.modal", executeCallback, { once: true });
        }

        // タイムアウトでコールバックを強制実行（フェイルセーフ）
        setTimeout(executeCallback, 1000);

        modalInstance.hide();
      } else {
        // モーダルインスタンスが無効な場合は直接削除
        if (modalElement && modalElement.parentNode) {
          modalElement.remove();
        }
        if (callback) callback();
      }
    } catch (error) {
      console.warn("App: Error hiding modal:", error);
      // エラーが発生した場合は強制的にコールバックを実行
      if (callback) callback();
    }
  }

  // モーダルを安全に削除する（新しいメソッド）
  safelyRemoveModal(modalId) {
    try {
      const existingModal = document.getElementById(modalId);
      if (existingModal) {
        // Bootstrap インスタンスがある場合は適切に破棄
        if (window.bootstrap && window.bootstrap.Modal) {
          const modalInstance = window.bootstrap.Modal.getInstance(existingModal);
          if (modalInstance) {
            try {
              modalInstance.dispose();
            } catch (disposeError) {
              console.warn("App: Error disposing modal instance:", disposeError);
            }
          }
        }
        
        // DOM から削除
        existingModal.remove();
      }

      // 残ったバックドロップを削除
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
        try {
          backdrop.remove();
        } catch (backdropError) {
          console.warn("App: Error removing backdrop:", backdropError);
        }
      });

      // body クラスをクリーンアップ
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

    } catch (error) {
      console.warn("App: Error in safelyRemoveModal:", error);
    }
  }

  showLoading(message = "処理中...") {
    try {
      // 既存のローディングを削除
      this.hideLoading();
      
      const loadingHTML = `
        <div id="global-loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.5); z-index: 9999;">
          <div class="card">
            <div class="card-body text-center">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">読み込み中...</span>
              </div>
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
