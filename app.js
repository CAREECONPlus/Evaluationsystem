import { I18n } from './i18n.js';
import { API } from './api.js';
import { Auth } from './auth.js';
import { Router } from './router.js';
import { HeaderComponent } from './components/header.js';
import { SidebarComponent } from './components/sidebar.js';

class App {
  constructor() {
    this.currentUser = null;
    this.currentPage = null;
    this.i18n = new I18n(this);
    this.auth = new Auth(this);
    this.api = null; // APIはAuthの初期化後にインスタンス化
    this.router = new Router(this);
    this.header = new HeaderComponent(this);
    this.sidebar = new SidebarComponent(this);
  }

  async init() {
    console.log("Starting application initialization...");
    this.showLoadingScreen();
    
    try {
      // Step 1: I18nの初期化
      console.log("Step 1: Initializing I18n...");
      await this.i18n.init();
      console.log("✓ I18n initialized");
      
      // Step 2: 認証モジュールの初期化 (Firebase Appの初期化もここに含まれる)
      console.log("Step 2: Initializing Auth and Firebase App...");
      await this.auth.init();
      console.log("✓ Auth and Firebase App initialized");

      // Step 3: APIモジュールのインスタンス化 (Auth完了後)
      console.log("Step 3: Initializing API...");
      this.api = new API(this);
      console.log("✓ API initialized");

      // Step 4: 認証状態の監視を開始
      console.log("Step 4: Setting up auth state listener...");
      this.auth.listenForAuthChanges();
      console.log("✓ Auth state listener is active");
      
      // Step 5: 確実にアプリを表示
      console.log("Step 5: Showing app...");
      this.showApp();
      
      // Step 6: ルーティング（showApp()の後に実行）
      console.log("Step 6: Initial routing...");
      await this.router.route();
      
      console.log("🎉 Application initialized successfully");
      
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      this.showError("アプリケーションの起動中に重大なエラーが発生しました。");
    } finally {
      // ★ 修正点: エラーの有無に関わらず、最終的に必ずアプリを表示
      this.showApp();
    }
  }

  showLoadingScreen() {
    document.getElementById('loading-screen').classList.remove('d-none');
    document.getElementById('app').classList.add('d-none');
  }

  showApp() {
    document.getElementById('loading-screen').classList.add('d-none');
    document.getElementById('app').classList.remove('d-none');
  }
  
  // ... 他のメソッドは変更なし
  
  async login(email, password) {
    await this.auth.login(email, password);
    this.showSuccess(this.i18n.t('messages.login_success', { userName: this.currentUser.name }));
    this.navigate(this.currentUser.role === 'developer' ? '#/developer' : '#/dashboard');
  }

  async logout() {
    await this.auth.logout();
    this.currentUser = null;
    this.navigate('#/login');
    this.showSuccess(this.i18n.t('messages.logout_success'));
  }
  
  navigate(path) {
    if (window.location.hash !== path) {
        window.location.hash = path;
    } else {
        this.router.route();
    }
  }
  
  updateUIForAuthState(user) {
    this.currentUser = user;
    this.header.update();
    this.sidebar.update();
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  hasRole(role) {
    return this.isAuthenticated() && this.currentUser.role === role;
  }

  hasAnyRole(roles) {
    return this.isAuthenticated() && roles.includes(this.currentUser.role);
  }
  
  showToast(message, type = 'info') {
      const toastContainer = document.getElementById('toast-container');
      const toastId = `toast-${Date.now()}`;
      const toastHTML = `
          <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
              <div class="d-flex">
                  <div class="toast-body">${this.sanitizeHtml(message)}</div>
                  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
              </div>
          </div>
      `;
      toastContainer.insertAdjacentHTML('beforeend', toastHTML);
      const toastElement = document.getElementById(toastId);
      const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
      toast.show();
      toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
  }

  showSuccess(message) { this.showToast(message, 'success'); }
  showError(message) { this.showToast(message, 'danger'); }
  
  sanitizeHtml(str) {
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
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
    };
    return statusClasses[status] || "bg-light text-dark";
  }
  
  formatDate(timestamp, withTime = false) {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date)) return "-";
    const locale = this.i18n.lang === 'ja' ? 'ja-JP' : 'en-US';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    if (withTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

window.addEventListener('load', () => {
  window.app = new App();
  window.app.init();
});
