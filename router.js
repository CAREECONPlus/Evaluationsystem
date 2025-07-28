/**
 * Router Service (Final Version with Base Path Support)
 * ルーターサービス (ベースパス対応最終版)
 */
class Router {
  constructor(app) {
    this.app = app;
    this.currentRoute = null;
    this.currentPageInstance = null;
    this.routes = {};
    // ★★★ 修正点 ★★★
    // リポジトリ名をベースパスとして定義
    this.basePath = '/EvaluationSystem'; 
  }

  init() {
    this.routes = {
      "/": "/login",
      "/login": "LoginPage",
      "/register": "RegisterPage",
      "/register-admin": "RegisterAdminPage",
      "/dashboard": "DashboardPage",
      "/users": "UserManagementPage",
      "/goal-setting": "GoalSettingPage",
      "/goal-approvals": "GoalApprovalsPage",
      "/evaluation-form": "EvaluationFormPage",
      "/evaluations": "EvaluationsPage",
      "/settings": "SettingsPage",
      "/developer": "DeveloperPage",
      "/404": "NotFoundPage",
    };
    window.addEventListener("popstate", () => this.handleLocation());
    this.handleLocation();
  }

  handleLocation() {
    // ★★★ 修正点 ★★★
    // 現在のURLパスからベースパス（リポジトリ名）を取り除く
    let path = window.location.pathname;
    if (path.toLowerCase().startsWith(this.basePath.toLowerCase())) {
      path = path.substring(this.basePath.length) || "/";
    }

    const routeTarget = this.routes[path];

    if (routeTarget) {
      if (typeof routeTarget === 'string' && routeTarget.startsWith('/')) {
        // リダイレクトルートの場合 (例: "/" は "/login" へ)
        this.navigate(routeTarget);
      } else {
        // ページクラス名の場合
        this.loadPage(path, routeTarget);
      }
    } else {
      // どのルートにも一致しない場合は404ページへ
      this.loadPage("/404", "NotFoundPage");
    }
  }

  navigate(path) {
    // ★★★ 修正点 ★★★
    // 新しいパスにベースパスを追加して、完全なURLを構築する
    const fullPath = this.basePath + (path === "/" ? "" : path);
    if (window.location.pathname !== fullPath) {
      window.history.pushState({}, "", fullPath);
    }
    this.handleLocation();
  }

  async loadPage(path, pageClassName) {
    try {
      this.currentRoute = path;
      const requiresAuth = !["/login", "/register", "/register-admin", "/404"].includes(path);

      if (requiresAuth && !this.app.isAuthenticated()) {
        this.navigate("/login");
        return;
      }
      
      const PageClass = window[pageClassName];
      if (!PageClass) throw new Error(`Page class ${pageClassName} not found`);

      const contentContainer = document.getElementById("content");
      contentContainer.innerHTML = '<div class="loading">読み込み中...</div>';
      
      this.currentPageInstance = new PageClass(this.app);
      this.app.currentPage = this.currentPageInstance;

      if (requiresAuth) {
        window.HeaderComponent.show(this.app.currentUser);
        window.SidebarComponent.show(this.app.currentUser);
      } else {
        window.HeaderComponent.hide();
        window.SidebarComponent.hide();
      }

      contentContainer.innerHTML = await this.currentPageInstance.render();
      if (this.currentPageInstance.init) {
        await this.currentPageInstance.init();
      }
      this.app.i18n.updateUI();
    } catch (error) {
      console.error(`Failed to load page ${path}:`, error);
    }
  }
}

window.Router = Router;

class NotFoundPage {
  constructor(app) { this.app = app; }
  async render() { 
    // 404ページからホームに戻るリンクもベースパスを考慮
    const base = new Router().basePath;
    return `<div class="container mt-5 text-center"><h1>404 Not Found</h1><p>お探しのページは見つかりませんでした。</p><a href="${base}/" class="btn btn-primary">ログインページに戻る</a></div>`; 
  }
  async init() {}
}
window.NotFoundPage = NotFoundPage;
