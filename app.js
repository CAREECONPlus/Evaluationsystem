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
    this.i18n = new I18n();
    this.auth = new Auth(this);
    this.api = new API(this);
    this.router = new Router(this);
    this.header = new HeaderComponent(this);
    this.sidebar = new SidebarComponent(this);
  }

  async init() {
    console.log("Starting application initialization...");
    
    // 強制的にローディング画面を表示（初期化中）
    this.showLoadingScreen();
    
    try {
      // Step 1: I18n初期化
      console.log("Step 1: Initializing I18n...");
      await this.i18n.init();
      console.log("✓ I18n initialized");
      
      // Step 2: 認証初期化（最も重要）
      console.log("Step 2: Initializing Auth...");
      await this.auth.init();
      console.log("✓ Auth initialized");
      
      // Step 3: イベントリスナー設定
      console.log("Step 3: Setting up event listeners...");
      this.setupEventListeners();
      console.log("✓ Event listeners setup");
      
      // Step 4: アプリ表示（ロード画面を非表示）
      console.log("Step 4: Showing app...");
      this.showApp();
      
      // Step 5: 初期ルーティング
      console.log("Step 5: Initial routing...");
      await this.router.route();
      console.log("✓ Router initialized");
      
      console.log("🎉 Application initialized successfully");
      
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      
      // エラーが発生してもアプリを表示
      this.showApp();
      
      // エラーメッセージを表示
      setTimeout(() => {
        this.showError("アプリケーションの起動中にエラーが発生しました。ページを再読み込みしてください。");
      }, 500);
      
      // 緊急時のルーティング
      try {
        if (this.isAuthenticated()) {
          this.navigate("#/dashboard");
        } else {
          this.navigate("#/login");
        }
      } catch (routingError) {
        console.error("Emergency routing failed:", routingError);
      }
    }
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    const appEl = document.getElementById("app");
    
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
    }
    if (appEl) {
      appEl.classList.add("d-none");
    }
  }

  setupEventListeners() {
    // ハンバーガーメニューのイベントリスナーを修正
    document.addEventListener("click", e => {
      const sidebarToggler = e.target.closest('#sidebarToggler');
      const backdrop = e.target.closest('#sidebar-backdrop');
      
      if (sidebarToggler) {
          e.preventDefault();
          this.sidebar.toggle();
          return; 
      }
      
      if (backdrop) {
          e.preventDefault();
          this.sidebar.close();
          return;
      }
      
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.sidebar.close();
        this.navigate(link.getAttribute("href"));
      }
    });

    window.addEventListener("popstate", () => this.router.route());
    
    // ウィンドウリサイズ時のレスポンシブ対応
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 992) {
        this.sidebar.close();
      }
    });
  }

  navigate(path) {
    if (window.location.hash === path) return;
    window.location.hash = path;
  }

  showApp() {
    const loadingScreen = document.getElementById("loading-screen");
    const appEl = document.getElementById("app");
    
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
    if (appEl) {
      appEl.classList.remove("d-none");
    }
    
    console.log("App UI shown");
  }

  async login(email, password) {
    await this.auth.login(email, password);
  }

  async logout() {
    await this.auth.logout();
    this.showSuccess(this.i18n.t("messages.logout_success"));
    this.navigate("#/login");
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
  
  hasRole(role) { 
    return this.currentUser?.role === role; 
  }
  
  hasAnyRole(roles) { 
    return this.currentUser && roles.includes(this.currentUser.role); 
  }
  
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

  showSuccess(message) { 
    this.showToast(message, "success"); 
  }
  
  showError(message) { 
    this.showToast(message, "danger"); 
  }
  
  sanitizeHtml(str) {
    if (str === null || typeof str === 'undefined') return "";
    const temp = document.createElement('div');
    temp.textContent = String(str);
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
      pending_submission: "bg-warning text-dark",
      pending_evaluation: "bg-info text-dark",
    };
    return statusClasses[status] || "bg-light text-dark";
  }

  getRoleBadgeClass(role) {
    const roleClasses = {
      developer: "bg-dark",
      admin: "bg-danger",
      evaluator: "bg-info",
      worker: "bg-secondary"
    };
    return roleClasses[role] || "bg-light text-dark";
  }

  formatDate(timestamp, withTime = false) {
    if (!timestamp) return "-";
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date)) return "-";
    
    const locale = this.i18n.lang === 'ja' ? 'ja-JP' : 
                   this.i18n.lang === 'vi' ? 'vi-VN' : 'en-US';
    
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    
    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

export default App;
