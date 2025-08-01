// Import core services
import { I18n } from './i18n.js';
import { API } from './api.js';
import { Auth } from './auth.js';
import { Router } from './router.js';

// Import components
import { HeaderComponent } from './components/header.js';
import { SidebarComponent } from './components/sidebar.js';

/**
 * Main Application Class
 * アプリケーションのメインクラス
 */
class App {
  constructor() {
    this.currentUser = null; // Firestoreからのプロファイル情報を含む認証ユーザー
    this.currentPage = null;

    // Initialize modules
    this.i18n = new I18n();
    this.auth = new Auth(this);
    this.api = new API(this);
    this.router = new Router(this);
    this.header = new HeaderComponent(this);
    this.sidebar = new SidebarComponent(this);
  }

  /**
   * Initializes the application
   * アプリケーションを初期化する
   */
  async init() {
    try {
      console.log("Starting application initialization...");
      await this.i18n.init();
      
      // Set up an authentication state listener and wait for the initial state
      // 認証状態のリスナーをセットアップし、初期状態が確定するのを待つ
      await this.auth.init();
      
      this.setupEventListeners();
      
      // Perform the initial routing
      // 初回のルーティングを実行
      await this.router.route();

      this.showApp();
      console.log("Application initialized successfully");

    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showError("アプリケーションの起動に失敗しました。");
    }
  }

  /**
   * Sets up global event listeners
   * グローバルイベントリスナーをセットアップする
   */
  setupEventListeners() {
    // Handle navigation for elements with data-link attribute
    // data-link属性を持つ要素のナビゲーションを処理する
    document.body.addEventListener("click", e => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute("href"));
      }
    });
    // Handle browser back/forward buttons
    // ブラウザの戻る/進むボタンを処理する
    window.addEventListener("popstate", () => this.router.route());
  }

  /**
   * Navigates to a new path using hash-based routing
   * ハッシュベースのルーティングを使用して新しいパスに移動する
   * @param {string} path - The path to navigate to (e.g., '#/dashboard')
   */
  navigate(path) {
    if (window.location.hash === path) {
        return; // Avoid re-routing to the same page
    }
    window.location.hash = path;
  }

  /**
   * Hides the loading screen and shows the main app content
   * ローディング画面を非表示にし、メインアプリのコンテンツを表示する
   */
  showApp() {
    const loadingScreen = document.getElementById("loading-screen");
    const appEl = document.getElementById("app");
    if (loadingScreen) loadingScreen.style.display = "none";
    if (appEl) appEl.classList.remove("d-none");
  }

  /**
   * Logs in the user and navigates to the dashboard
   * ユーザーをログインさせ、ダッシュボードに移動する
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    await this.auth.login(email, password);
    // The onAuthStateChanged listener in Auth.js will handle updating currentUser and routing
  }

  /**
   * Logs out the user and navigates to the login page
   * ユーザーをログアウトさせ、ログインページに移動する
   */
  async logout() {
    await this.auth.logout();
    this.showSuccess(this.i18n.t("messages.logout_success"));
    this.navigate("#/login");
  }

  /**
   * Checks if a user is currently authenticated
   * ユーザーが現在認証されているか確認する
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.currentUser;
  }
  
  /**
   * Checks if the current user has a specific role
   * 現在のユーザーが特定の役割を持っているか確認する
   * @param {string} role 
   * @returns {boolean}
   */
  hasRole(role) { return this.currentUser?.role === role; }
  
  /**
   * Checks if the current user has any of the specified roles
   * 現在のユーザーが指定された役割のいずれかを持っているか確認する
   * @param {string[]} roles 
   * @returns {boolean}
   */
  hasAnyRole(roles) { return this.currentUser && roles.includes(this.currentUser.role); }
  
  // --- Common Utility Methods ---

  /**
   * Shows a toast notification
   * トースト通知を表示する
   * @param {string} message - The message to display
   * @param {string} type - 'success', 'danger', 'warning', 'info'
   */
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toastId = `toast-${Date.now()}`;
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
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
  }

  showSuccess(message) { this.showToast(message, "success"); }
  showError(message) { this.showToast(message, "danger"); }
  showWarning(message) { this.showToast(message, "warning"); }
  showInfo(message) { this.showToast(message, "info"); }
  
  sanitizeHtml(str) {
    if (str === null || typeof str === 'undefined') return "";
    const temp = document.createElement('div');
    temp.textContent = String(str);
    return temp.innerHTML;
  }
  
  getStatusBadgeClass(status) {
    const statusClasses = {
      active: "bg-success",
      developer_approval_pending: "bg-info text-dark",
      pending_approval: "bg-warning text-dark",
      inactive: "bg-secondary",
      draft: "bg-secondary",
      approved: "bg-success",
      rejected: "bg-danger",
      self_assessed: "bg-info text-dark",
      approved_by_evaluator: "bg-primary",
      completed: "bg-primary",
    };
    return statusClasses[status] || "bg-light text-dark";
  }

  getRoleBadgeClass(role) {
    return { developer: "bg-dark", admin: "bg-danger", evaluator: "bg-info", worker: "bg-secondary" }[role] || "bg-light text-dark";
  }

  formatDate(timestamp) {
    if (!timestamp) return "-";
    // Handle both Firebase Timestamps and JS Date objects/strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString('ja-JP');
  }
}

export default App;
