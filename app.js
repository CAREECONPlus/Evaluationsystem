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
    try {
      console.log("Starting application initialization...");
      await this.i18n.init();
      await this.auth.init();
      this.setupEventListeners();
      await this.router.route();
      this.showApp();
      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showError("アプリケーションの起動に失敗しました。");
    }
  }

  setupEventListeners() {
    document.body.addEventListener("click", e => {
      const sidebarToggler = e.target.closest('#sidebarToggler');
      const backdrop = e.target.closest('#sidebar-backdrop');
      
      if (sidebarToggler) {
          this.sidebar.toggle();
          return; 
      }
      
      if (backdrop) {
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
  }

  navigate(path) {
    if (window.location.hash === path) return;
    window.location.hash = path;
  }

  showApp() {
    const loadingScreen = document.getElementById("loading-screen");
    const appEl = document.getElementById("app");
    if (loadingScreen) loadingScreen.style.display = "none";
    if (appEl) appEl.classList.remove("d-none");
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
  
  hasRole(role) { return this.currentUser?.role === role; }
  
  hasAnyRole(roles) { return this.currentUser && roles.includes(this.currentUser.role); }
  
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
    };
    return statusClasses[status] || "bg-light text-dark";
  }

  getRoleBadgeClass(role) {
    return { developer: "bg-dark", admin: "bg-danger", evaluator: "bg-info", worker: "bg-secondary" }[role] || "bg-light text-dark";
  }

  formatDate(timestamp, withTime = false) {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date)) return "-";
    const locale = this.i18n.lang === 'ja' ? 'ja-JP' : this.i18n.lang === 'vi' ? 'vi-VN' : 'en-US';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (withTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

export default App;
