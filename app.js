/**
 * Main Application Class
 * メインアプリケーションクラス
 */
class App {
  constructor() {
    this.currentUser = null;
    this.currentPage = null;
    this.isInitialized = false;

    // Firebase configuration (デモ用)
    this.firebaseConfig = {
      apiKey: "demo-api-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "demo-app-id",
    };

    // モジュールを初期化
    this.i18n = new window.I18n();
    this.api = new window.API();
    this.auth = new window.Auth(this);
    this.router = new window.Router(this); // basePathはrouter.jsで定義
  }

  /**
   * Initialize application
   * アプリケーションを初期化
   */
  async init() {
    try {
      console.log("Starting application initialization...");

      await this.i18n.init();
      this.api.app = this;
      this.api.init();
      await this.auth.init();

      // グローバルコンポーネントにappインスタンスを渡す
      if (window.HeaderComponent) window.HeaderComponent.app = this;
      if (window.SidebarComponent) window.SidebarComponent.app = this;
      
      this.router.init();

      this.isInitialized = true;
      console.log("Application initialized successfully");
      this.showApp();
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showError(this.i18n.t("errors.app_init_failed"));
    }
  }

  /**
   * Show app and hide loading screen
   */
  showApp() {
    const loadingScreen = document.getElementById("loading-screen");
    const appEl = document.getElementById("app");
    if (loadingScreen) loadingScreen.style.display = "none";
    if (appEl) appEl.classList.remove("d-none");
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const user = await this.auth.login(email, password);
      this.currentUser = user;
      this.showSuccess(this.i18n.t("messages.login_success", { userName: user.name }));
      setTimeout(() => this.navigate("/dashboard"), 500);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      this.showError(err.message); // Authサービスからのエラーメッセージをそのまま表示
    }
  }

  /**
   * Logout user
   */
  async logout() {
    this.auth.logout();
    this.currentUser = null;
    this.navigate("/login");
    this.showSuccess(this.i18n.t("messages.logout_success"));
  }

  /**
   * Navigate to a specific route
   */
  navigate(path) {
    if (this.router) {
      this.router.navigate(path);
    }
  }

  /**
   * Check if user has specific role(s)
   */
  hasRole(role) { return this.currentUser?.role === role; }
  hasAnyRole(roles) { return this.currentUser && roles.includes(this.currentUser.role); }
  isAuthenticated() { return !!this.currentUser; }
  
  // --- 共通ユーティリティメソッド ---

  /**
   * Show toast notification
   */
  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "position-fixed top-0 end-0 p-3";
      container.style.zIndex = "1055";
      document.body.appendChild(container);
    }

    const toastId = `toast-${this.generateId()}`;
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${this.sanitizeHtml(message)}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new window.bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
  }

  showSuccess(message) { this.showToast(message, "success"); }
  showError(message) { this.showToast(message, "danger"); }
  showWarning(message) { this.showToast(message, "warning"); }
  showInfo(message) { this.showToast(message, "info"); }

  /**
   * ★★★ 追加: グローバルエラーハンドラ ★★★
   */
  handleError(error) {
    console.error("Application error caught:", error);
    this.showError(this.i18n.t("errors.system"));
  }

  /**
   * ★★★ 追加: HTMLサニタイズ関数 ★★★
   */
  sanitizeHtml(str) {
    if (!str) return "";
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
  
  /**
   * ★★★ 追加: ステータスバッジのクラスを返す関数 ★★★
   */
  getStatusBadgeClass(status) {
    const statusClasses = {
      active: "bg-success",
      pending_approval: "bg-warning",
      developer_approval_pending: "bg-warning",
      inactive: "bg-secondary",
      draft: "bg-secondary",
      approved: "bg-success",
      completed: "bg-primary",
      self_assessed: "bg-info",
      approved_by_evaluator: "bg-success",
      rejected: "bg-danger",
      pending: "bg-warning",
    };
    return statusClasses[status] || "bg-light text-dark";
  }

  formatDate(dateString) {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch {
      return dateString;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize application
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing app...");
  try {
    window.app = new App();
    
    // ★★★ 修正: グローバルエラーハンドラを先に設定 ★★★
    window.addEventListener("error", (e) => {
      e.preventDefault();
      window.app?.handleError(e.error);
    });
    window.addEventListener("unhandledrejection", (e) => {
      e.preventDefault();
      window.app?.handleError(e.reason);
    });
    
    await window.app.init();
    console.log("App initialization complete");
  } catch (err) {
    console.error("App initialization failed:", err);
    document.getElementById("loading-screen").innerHTML = '<h1>Application failed to start.</h1>';
  }
});
