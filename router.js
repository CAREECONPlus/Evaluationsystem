/**
 * Router Service (Hash-based with parameter support)
 * ルーターサービス（ハッシュベース、パラメータ対応）
 */
class Router {
  constructor(app) {
    this.app = app;
    this.routes = {
      "/login": window.LoginPage,
      "/dashboard": window.DashboardPage,
      "/users": window.UserManagementPage,
      "/evaluations": window.EvaluationsPage,
      "/goal-approvals": window.GoalApprovalsPage,
      "/goal-setting": window.GoalSettingPage,
      "/evaluation-form": window.EvaluationFormPage,
      "/settings": window.SettingsPage,
      "/developer": window.DeveloperPage,
      // NOTE: Add other page classes here
    };
    this.currentPath = null;
  }

  /**
   * Initializes the router. Listens for hash changes.
   * ルーターを初期化し、ハッシュの変更を監視します。
   */
  init() {
    window.addEventListener('hashchange', () => this.handleLocation());
    this.handleLocation(); // Handle initial page load
  }

  /**
   * Handles the current URL hash to load the correct page.
   * 現在のURLハッシュを処理して、正しいページを読み込みます。
   */
  handleLocation() {
    const hash = window.location.hash || '#/login';
    const pathWithQuery = hash.substring(1); // Remove the '#'
    
    const [path, queryString] = pathWithQuery.split('?');
    const params = new URLSearchParams(queryString);
    
    // Redirect root to dashboard if logged in, otherwise to login
    if (path === '' || path === '/') {
        const targetPath = this.app.isAuthenticated() ? '/dashboard' : '/login';
        this.navigate(targetPath);
        return;
    }

    const PageClass = this.routes[path];
    
    if (PageClass) {
      this.loadPage(path, PageClass, params);
    } else {
      console.warn(`No route found for path: ${path}`);
      this.navigate('/dashboard'); // Fallback to dashboard
    }
  }

  /**
   * Loads and renders a page component.
   * @param {string} path - The path of the page to load.
   * @param {class} PageClass - The class of the page component.
   * @param {URLSearchParams} params - The URL parameters.
   */
  async loadPage(path, PageClass, params) {
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
        requiresAuth ? window.SidebarComponent.show() : window.SidebarComponent.hide();
    }

    const pageInstance = new PageClass(this.app);
    this.app.currentPage = pageInstance;

    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = await pageInstance.render(params);

    if (typeof pageInstance.init === 'function') {
      await pageInstance.init(params); // Pass params to init method
    }
  }

  /**
   * Navigates to a new path within the application.
   * @param {string} pathWithQuery - The path to navigate to (e.g., "/dashboard" or "/users?id=1").
   */
  navigate(pathWithQuery) {
    // Avoid reloading the same page
    if (`#${pathWithQuery}` === window.location.hash) {
      return;
    }
    window.location.hash = pathWithQuery;
  }
}

window.Router = Router;
