/**
 * Router Service (Path-based with parameter support for SPA)
 * ルーターサービス（SPA向けパスベース、パラメータ対応）
 */
class Router {
  constructor(app) {
    this.app = app;
    this.routes = {
      "/login": "LoginPage",
      "/dashboard": "DashboardPage",
      "/users": "UserManagementPage",
      "/evaluations": "EvaluationsPage",
      "/goal-approvals": "GoalApprovalsPage",
      "/goal-setting": "GoalSettingPage",
      "/evaluation-form": "EvaluationFormPage",
      "/settings": "SettingsPage",
      "/developer": "DeveloperPage",
      "/register": "RegisterPage",
      "/register-admin": "RegisterAdminPage",
    };
    this.currentPath = null;
  }

  /**
   * Initializes the router. Listens for URL changes.
   * ルーターを初期化し、URLの変更を監視します。
   */
  init() {
    // <a>タグのクリックをインターセプトして、ページリロードを防ぐ
    document.body.addEventListener('click', e => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.getAttribute('href'));
      }
    });

    // ブラウザの「戻る」「進む」ボタンを処理
    window.addEventListener('popstate', () => this.handleLocation());
    
    // 初期ロード時のルートを処理
    this.handleLocation();
  }

  /**
   * Handles the current URL to load the correct page.
   * 現在のURLを処理して、正しいページを読み込みます。
   */
  async handleLocation() {
    let path = window.location.pathname;
    if (path === '/' || path === '/index.html') {
      path = this.app.isAuthenticated() ? '/dashboard' : '/login';
    }

    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);

    const pageClassName = this.routes[path];

    if (pageClassName) {
      await this.loadPage(path, pageClassName, params);
    } else {
      console.warn(`No route found for path: ${path}. Redirecting to dashboard.`);
      this.navigate('/dashboard');
    }
  }

  /**
   * Navigates to a new path without a full page reload.
   * @param {string} pathWithQuery - The path to navigate to (e.g., "/dashboard" or "/users?id=1").
   */
  navigate(pathWithQuery) {
    if (this.currentPath === pathWithQuery) {
      return; // 同じページへの移動は無視
    }
    this.currentPath = pathWithQuery;
    history.pushState(null, '', pathWithQuery);
    this.handleLocation();
  }
  
  /**
   * Loads and renders a page component.
   * @param {string} path - The path of the page to load.
   * @param {string} pageClassName - The class name of the page component.
   * @param {URLSearchParams} params - The URL parameters.
   */
  async loadPage(path, pageClassName, params) {
    const requiresAuth = !["/login", "/register", "/register-admin"].includes(path);

    if (requiresAuth && !this.app.isAuthenticated()) {
      this.navigate("/login");
      return;
    }
    if (!requiresAuth && this.app.isAuthenticated()) {
      this.navigate("/dashboard");
      return;
    }

    if (window.HeaderComponent) {
        requiresAuth ? window.HeaderComponent.show() : window.HeaderComponent.hide();
    }
    if (window.SidebarComponent) {
        requiresAuth ? window.SidebarComponent.show() : window.SidebarComponent.show();
    }

    const PageClass = window[pageClassName];
    if (!PageClass) {
        console.error(`Page class "${pageClassName}" not found.`);
        this.navigate('/dashboard');
        return;
    }

    const pageInstance = new PageClass(this.app);
    this.app.currentPage = pageInstance;

    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = await pageInstance.render(params);

    if (typeof pageInstance.init === 'function') {
      await pageInstance.init(params);
    }
  }
}

window.Router = Router;
