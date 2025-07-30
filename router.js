/**
 * Router Service (Path-based for SPA)
 * ルーターサービス（SPA向けパスベース）
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
      "/report": "EvaluationReportPage",
    };
  }

  async route() {
    let path = window.location.pathname;

    // ルートパス "/" の場合、認証状態でリダイレクト先を決定
    if (path === "/" || path === "/index.html") {
      const targetPath = this.app.isAuthenticated() ? "/dashboard" : "/login";
      this.app.navigate(targetPath);
      return;
    }
    
    const pageClassName = this.routes[path];
    
    if (pageClassName) {
      await this.loadPage(path, pageClassName);
    } else {
      console.warn(`No route found for path: ${path}. Redirecting.`);
      this.app.navigate(this.app.isAuthenticated() ? "/dashboard" : "/login");
    }
  }

  async loadPage(path, pageClassName) {
    // --- 認証ガード ---
    const requiresAuth = !["/login", "/register", "/register-admin"].includes(path);
    if (requiresAuth && !this.app.isAuthenticated()) {
      this.app.navigate("/login");
      return;
    }
    if (!requiresAuth && this.app.isAuthenticated()) {
      this.app.navigate("/dashboard");
      return;
    }
    
    // --- コンポーネントの表示/非表示 ---
    if (window.HeaderComponent) requiresAuth ? window.HeaderComponent.show() : window.HeaderComponent.hide();
    if (window.SidebarComponent) requiresAuth ? window.SidebarComponent.show() : window.SidebarComponent.hide();
    
    // --- ページの描画 ---
    const PageClass = window[pageClassName];
    if (!PageClass) {
      console.error(`Page class "${pageClassName}" not found.`);
      this.app.navigate('/dashboard');
      return;
    }

    const pageInstance = new PageClass(this.app);
    this.app.currentPage = pageInstance;

    const contentContainer = document.getElementById("content");
    // ローディングスピナーを表示
    contentContainer.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="height: 80vh;"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
    
    const params = new URLSearchParams(window.location.search);
    contentContainer.innerHTML = await pageInstance.render(params);

    if (typeof pageInstance.init === "function") {
      await pageInstance.init(params);
    }
  }
}
window.Router = Router;
