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
    this.api = null;
    this.router = new Router(this);
    this.header = new HeaderComponent(this);
    this.sidebar = new SidebarComponent(this);
  }

  async init() {
    console.log("Starting application initialization...");
    this.showLoadingScreen();
    
    try {
      console.log("Step 1: Initializing I18n...");
      await this.i18n.init();
      console.log("✓ I18n initialized");
      
      console.log("Step 2: Initializing Auth module...");
      await this.auth.init();
      console.log("✓ Auth module initialized");

      console.log("Step 3: Initializing API...");
      this.api = new API(this);
      console.log("✓ API initialized");

      console.log("Step 4: Setting up and awaiting auth state listener...");
      await this.auth.listenForAuthChanges();
      console.log("✓ Auth state listener has completed its initial check.");
      
      console.log("Step 5: Showing app...");
      this.showApp();
      
      console.log("Step 6: Initial routing...");
      await this.router.route();
      
      console.log("🎉 Application initialized successfully");
      
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      this.showError("アプリケーションの起動中に重大なエラーが発生しました。");
    } finally {
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
  
  async login(email, password) {
    await this.auth.login(email, password);
    // ログイン後のリダイレクトはlistenForAuthChangesとrouterに任せる
  }

  async logout() {
    await this.auth.logout();
    // ログアウト後のリダイレクトはlistenForAuthChangesとrouterに任せる
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
    
    // ログイン状態に応じてヘッダーとサイドバーの表示を制御
    if (user) {
      // ログイン済みの場合
      this.header.update();
      this.sidebar.update();
      // ログインページのクリーンアップ
      const loginPageElements = document.querySelectorAll('.login-page');
      loginPageElements.forEach(el => el.remove());
    } else {
      // 未ログインの場合
      // ヘッダーとサイドバーをクリア
      const headerContainer = document.getElementById('header-container');
      const sidebarContainer = document.getElementById('sidebar-container');
      if (headerContainer) headerContainer.innerHTML = '';
      if (sidebarContainer) sidebarContainer.innerHTML = '';
    }
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
      if (!toastContainer) return;
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

  // 新規追加: ロールバッジクラス取得
  getRoleBadgeClass(role) {
    const roleClasses = {
      developer: "bg-dark",
      admin: "bg-primary", 
      evaluator: "bg-info",
      worker: "bg-secondary"
    };
    return roleClasses[role] || "bg-light text-dark";
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

export default App;
