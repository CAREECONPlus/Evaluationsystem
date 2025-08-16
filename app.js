import { I18n } from './i18n.js';
import { API } from './api.js';
import { Auth } from './auth.js';
import { Router } from './router.js';
import { HeaderComponent } from './components/header.js';
import { SidebarComponent } from './components/sidebar.js';
import { AccessibilityHelper } from './js/accessibility.js';
import { PerformanceOptimizer } from './js/performance.js';
import { AnimationHelper } from './js/animations.js';

class App {
  constructor() {
    this.currentUser = null;
    this.currentPage = null;
    this.i18n = new I18n();
    this.auth = new Auth(this);
    this.api = null;
    this.router = new Router(this);
    this.header = new HeaderComponent(this);
    this.sidebar = new SidebarComponent(this);
    this.accessibility = null;
    this.performance = null;
    this.animations = null;
    
    // グローバルエラーハンドラーの設定
    this.setupGlobalErrorHandlers();
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
      
      console.log("Step 7: Initializing accessibility features...");
      this.accessibility = new AccessibilityHelper(this);
      this.accessibility.init();
      console.log("✓ Accessibility features initialized");
      
      console.log("Step 8: Initializing performance optimizations...");
      this.performance = new PerformanceOptimizer(this);
      this.performance.init();
      console.log("✓ Performance optimizations initialized");
      
      console.log("Step 9: Initializing animations...");
      this.animations = new AnimationHelper(this);
      this.animations.init();
      console.log("✓ Animations initialized");
      
      console.log("🎉 Application initialized successfully");
      
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      this.showError("アプリケーションの起動中に重大なエラーが発生しました。");
    } finally {
      this.showApp();
    }
  }

  // グローバルエラーハンドラーの設定
  setupGlobalErrorHandlers() {
    // 未処理のPromiseエラーをキャッチ
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, 'Promise rejection');
      event.preventDefault();
    });

    // 一般的なJavaScriptエラーをキャッチ
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error, 'JavaScript error');
      event.preventDefault();
    });
  }

  // 統一エラーハンドリング
  handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    let message = '';
    
    // エラータイプに応じた処理
    if (error?.code) {
      // Firebaseエラー
      switch(error.code) {
        case 'permission-denied':
          message = '権限がありません。管理者に連絡してください。';
          break;
        case 'unavailable':
          message = 'サービスが一時的に利用できません。しばらくしてからお試しください。';
          break;
        case 'unauthenticated':
          message = 'ログインが必要です。';
          this.navigate('#/login');
          break;
        case 'network-request-failed':
          message = 'ネットワークエラーが発生しました。接続を確認してください。';
          break;
        default:
          message = error.message || '予期せぬエラーが発生しました。';
      }
    } else if (error instanceof TypeError) {
      message = 'データの処理中にエラーが発生しました。';
    } else if (error instanceof ReferenceError) {
      message = 'システムエラーが発生しました。';
    } else {
      message = error?.message || '予期せぬエラーが発生しました。';
    }
    
    this.showError(message);
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
    try {
      // バリデーション
      if (!this.api?.validateEmail(email)) {
        throw new Error('有効なメールアドレスを入力してください');
      }
      if (!this.api?.validatePassword(password)) {
        throw new Error('パスワードは6文字以上で入力してください');
      }
      
      await this.auth.login(email, password);
    } catch (error) {
      this.handleError(error, 'Login');
      throw error;
    }
  }

  async logout() {
    try {
      await this.auth.logout();
    } catch (error) {
      this.handleError(error, 'Logout');
    }
  }
  
  navigate(path) {
    if (window.location.hash !== path) {
        window.location.hash = path;
    } else {
        this.router.route();
    }
    
    // アクセシビリティ通知
    if (this.accessibility) {
      this.accessibility.announce('ページを読み込んでいます');
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
  
  showToast(message, type = 'info', duration = 5000) {
      const toastContainer = document.getElementById('toast-container');
      if (!toastContainer) return;
      
      const toastId = `toast-${Date.now()}`;
      const iconMap = {
        'success': 'fa-check-circle',
        'danger': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
      };
      
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
      `;
      toastContainer.insertAdjacentHTML('beforeend', toastHTML);
      const toastElement = document.getElementById(toastId);
      const toast = new bootstrap.Toast(toastElement, { delay: duration });
      toast.show();
      toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
  }

  showSuccess(message) { 
    this.showToast(message, 'success'); 
  }
  
  showError(message) { 
    this.showToast(message, 'danger', 8000); // エラーは長めに表示
  }
  
  showWarning(message) {
    this.showToast(message, 'warning', 6000);
  }
  
  showInfo(message) {
    this.showToast(message, 'info');
  }
  
  sanitizeHtml(str) {
      if (!str) return '';
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
  }
  
  // 入力値のサニタイゼーション
  sanitizeInput(input) {
    if (!input) return '';
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
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
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date)) return "-";
      
      const locale = this.i18n.lang === 'ja' ? 'ja-JP' : 
                    this.i18n.lang === 'vi' ? 'vi-VN' : 'en-US';
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      
      if (withTime) {
          options.hour = '2-digit';
          options.minute = '2-digit';
      }
      
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return "-";
    }
  }

  // 確認ダイアログの表示
  async confirm(message, title = '確認') {
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
      `;
      
      // モーダルを追加
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      const modalElement = document.getElementById('confirmModal');
      const modal = new bootstrap.Modal(modalElement);
      
      // イベントリスナー設定
      document.getElementById('confirmBtn').addEventListener('click', () => {
        modal.hide();
        resolve(true);
      });
      
      modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
        resolve(false);
      });
      
      modal.show();
    });
  }

  // ローディング表示
  showLoading(message = '処理中...') {
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
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  hideLoading() {
    const loading = document.getElementById('global-loading');
    if (loading) loading.remove();
  }

  // デバッグモード
  enableDebugMode() {
    window.DEBUG = true;
    console.log('Debug mode enabled');
  }

  disableDebugMode() {
    window.DEBUG = false;
    console.log('Debug mode disabled');
  }

  debug(...args) {
    if (window.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  }
}

export default App;
