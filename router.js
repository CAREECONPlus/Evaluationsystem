/**
 * Router Service
 * ルーターサービス
 */
class Router {
  constructor(app) {
    this.app = app;
    this.currentRoute = null;
    this.currentPageInstance = null;
    this.routes = {};
    this.isInitialized = false;
  }

  init() {
    try {
      console.log("Initializing Router...");
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
      this.isInitialized = true;
      console.log("Router initialized");
      this.handleLocation();
    } catch (error) {
      console.error("Failed to initialize Router:", error);
    }
  }

  handleLocation() {
    const path = window.location.pathname;
    const route = this.routes[path] || this.routes["/404"];
    if (typeof route === 'string' && route.startsWith('/')) {
        this.navigate(route);
        return;
    }
    this.loadPage(path, route);
  }

  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    this.handleLocation();
  }

  async loadPage(path, pageClassName) {
    try {
      this.currentRoute = path;
      const PageClass = window[pageClassName];
      if (!PageClass) throw new Error(`Page class ${pageClassName} not found`);

      const contentContainer = document.getElementById("content");
      contentContainer.innerHTML = '<div class="loading">読み込み中...</div>';
      
      this.currentPageInstance = new PageClass(this.app);
      this.app.currentPage = this.currentPageInstance;

      const requiresAuth = !["/login", "/register", "/register-admin"].includes(path);
      if (requiresAuth && !this.app.isAuthenticated()) {
        this.navigate("/login");
        return;
      }
      
      if(requiresAuth) {
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
      document.getElementById("content").innerHTML = "ページの読み込みに失敗しました。";
    }
  }
}

window.Router = Router;

class NotFoundPage {
  constructor(app) { this.app = app; }
  async render() { return `<div class="container mt-5"><h1>404 Not Found</h1></div>`; }
  async init() {}
}
window.NotFoundPage = NotFoundPage;
