/**
 * Router Service (Hash-based with parameter support)
 * ルーターサービス（ハッシュベース、パラメータ対応）
 */
class Router {
  constructor(app) {
    this.app = app;
    /**
     * ★★★ 修正点 ★★★
     * ルートの定義を、クラスそのものではなく、クラス名の「文字列」に変更します。
     * これにより、Routerの初期化タイミングでページクラスが未定義でもエラーにならなくなります。
     */
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
    
    if (path === '' || path === '/') {
        const targetPath = this.app.isAuthenticated() ? '/dashboard' : '/login';
        this.navigate(targetPath);
        return;
    }

    const pageClassName = this.routes[path]; // クラス名（文字列）を取得
    
    if (pageClassName) {
      this.loadPage(path, pageClassName, params);
    } else {
      console.warn(`No route found for path: ${path}`);
      this.navigate('/dashboard'); // Fallback to dashboard
    }
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
        requiresAuth ? window.SidebarComponent.show() : window.SidebarComponent.hide();
    }

    const PageClass = window[pageClassName]; // 文字列から実際のクラスを取得
    if (!PageClass) {
        console.error(`Page class "${pageClassName}" not found. Make sure the script is loaded in index.html.`);
        this.navigate('/dashboard'); // Fallback if class is not found
        return;
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
    if (`#${pathWithQuery}` === window.location.hash) {
      // 同じページへの再読み込みを防ぐが、強制的に再描画したい場合はこのチェックを外すことも可能
      // this.handleLocation(); 
      return;
    }
    window.location.hash = pathWithQuery;
  }
}

window.Router = Router;
