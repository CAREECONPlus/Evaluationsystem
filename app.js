/**
 * Main Application Class
 * メインアプリケーションクラス
 */
class App {
  constructor() {
    this.currentUser = null;
    this.currentPage = null;

    // モジュールを初期化
    this.i18n = new window.I18n();
    this.api = new window.API();
    this.auth = new window.Auth(this);
    this.router = new window.Router(this);
  }

  async init() {
    try {
      console.log("Starting application initialization...");
      // 1. 各モジュールの非同期初期化を待つ
      await this.i18n.init();
      await this.auth.init();
      
      // 2. ログイン中のユーザー情報を設定
      this.currentUser = this.auth.getCurrentUser();
      
      // 3. APIとグローバルコンポーネントにAppインスタンスを渡す
      this.api.app = this;
      if (window.HeaderComponent) window.HeaderComponent.app = this;
      if (window.SidebarComponent) window.SidebarComponent.app = this;

      // 4. イベントリスナーを設定
      this.setupEventListeners();

      // 5. 初期ページのルーティングを実行
      await this.router.route();

      // 6. アプリケーションの表示
      this.showApp();
      console.log("Application initialized successfully");

    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showError("アプリケーションの起動に失敗しました。");
    }
  }

  setupEventListeners() {
    // data-link属性を持つリンクのクリックを処理
    document.body.addEventListener("click", e => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute("href"));
      }
    });
    // ブラウザの「戻る」「進む」を処理
    window.addEventListener("popstate", () => this.router.route());
  }

  navigate(path) {
    // 同じパスへの移動は無視
    if (window.location.pathname === path) {
        return;
    }
    history.pushState(null, null, path);
    this.router.route();
  }

  showApp() {
    const loadingScreen = document.getElementById("loading-screen");
    const appEl = document.getElementById("app");
    if (loadingScreen) loadingScreen.style.display = "none";
    if (appEl) appEl.classList.remove("d-none");
  }

  async login(email, password) {
    try {
      const user = await this.auth.login(email, password);
      this.currentUser = user;
      this.showSuccess(this.i18n.t("messages.login_success", { userName: user.name }));
      setTimeout(() => this.navigate("/dashboard"), 300);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      this.showError(err.message);
      return false;
    }
  }

  async logout() {
    this.auth.logout();
    this.currentUser = null;
    if (window.HeaderComponent) window.HeaderComponent.hide();
    if (window.SidebarComponent) window.SidebarComponent.hide();
    this.navigate("/login");
    this.showSuccess(this.i18n.t("messages.logout_success"));
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
  
  hasRole(role) { return this.currentUser?.role === role; }
  hasAnyRole(roles) { return this.currentUser && roles.includes(this.currentUser.role); }
  
  // --- 共通ユーティリティメソッド ---

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
  
  sanitizeHtml(str) {
    if (!str) return "";
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
  
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

  getRoleBadgeClass(role) {
    return { admin: "bg-danger", evaluator: "bg-info", worker: "bg-secondary" }[role] || "bg-light text-dark";
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
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
  window.app.init();
});
