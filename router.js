/**
 * Router Service (Hybrid Path/Hash-based with parameter support)
 * ルーターサービス（ハイブリッド型：パス優先、ハッシュ対応、パラメータ対応）
 */
class Router {
  constructor(app) {
    this.app = app;
    /**
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
   * Initializes the router. Listens for hash changes and handles initial load.
   * ルーターを初期化し、ハッシュの変更を監視し、初期ロードを処理します。
   */
  init() {
    window.addEventListener('popstate', () => this.handleLocation());
    this.handleLocation(); // Handle initial page load
  }

  /**
   * Handles the current URL to load the correct page.
   * 現在のURLを処理して、正しいページを読み込みます。
   */
  handleLocation() {
    let pathWithQuery = window.location.pathname;
    
    // FirebaseのrewriteでURLが書き換えられた場合、パス名にルート以外のパスが入る。
    // アプリ内のナビゲーションはハッシュで行うため、ハッシュも確認する。
    if (pathWithQuery === '/' || pathWithQuery === '/index.html') {
      pathWithQuery = (window.location.hash || '#/login').substring(1);
    }
    
    const [path, queryString] = pathWithQuery.split('?');
    const params = new URLSearchParams(queryString);

    if (path === '' || path === '/') {
        const targetPath = this.app.isAuthenticated() ? '/dashboard' : '/login';
        this.navigate(targetPath);
        return;
    }

    const pageClassName = this.routes[path];
    
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

    const PageClass = window[pageClassName];
    if (!PageClass) {
        console.error(`Page class "${pageClassName}" not found. Make sure the script is loaded in index.html.`);
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

  /**
   * Navigates to a new path within the application using hash-based routing.
   * @param {string} pathWithQuery - The path to navigate to (e.g., "/dashboard" or "/users?id=1").
   */
  navigate(pathWithQuery) {
    const newHash = `#${pathWithQuery}`;
    if (newHash === window.location.hash) {
      return; // Avoid reloading the same page
    }
    // We use history.pushState to change the URL without a full page reload,
    // but we will primarily use hash changes for navigation to trigger our listener.
    // For SPA with rewrites, we should ideally manipulate the pathname.
    // However, to maintain the current hash-based logic for in-app navigation, we stick to hashes.
    window.location.hash = newHash;
  }
}

window.Router = Router;
