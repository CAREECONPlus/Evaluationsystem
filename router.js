/**
 * Router Service (Final Version with Base Path and Redirect Support)
 */
class Router {
  constructor(app) {
    this.app = app;
    this.basePath = '/EvaluationSystem'; // ★ あなたのリポジトリ名
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
  }

  init() {
    // 404ページからリダイレクトされてきた場合のパスを復元
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      // URLを本来のパスに書き換える (例: .../EvaluationSystem/dashboard)
      if(window.location.pathname !== redirectPath) {
        window.history.replaceState(null, null, redirectPath);
      }
    }
    
    window.addEventListener("popstate", () => this.handleLocation());
    this.handleLocation();
  }

  handleLocation() {
    let path = window.location.pathname;
    if (path.toLowerCase().startsWith(this.basePath.toLowerCase())) {
      path = path.substring(this.basePath.length) || "/";
    }

    const routeTarget = this.routes[path];
    if (routeTarget) {
      if (typeof routeTarget === 'string' && routeTarget.startsWith('/')) {
        this.navigate(routeTarget);
      } else {
        this.loadPage(path, routeTarget);
      }
    } else {
      this.loadPage("/404", "NotFoundPage");
    }
  }

  navigate(path) {
    const fullPath = this.basePath + (path === "/" ? "/" : path);
    if (window.location.pathname !== fullPath) {
      window.history.pushState({}, "", fullPath);
    }
    this.handleLocation();
  }

  async loadPage(path, pageClassName) {
    this.app.currentPage = null; // ページ切り替え時にクリア
    const requiresAuth = !["/login", "/register", "/register-admin", "/404"].includes(path);

    if (requiresAuth && !this.app.isAuthenticated()) {
      this.navigate("/login");
      return;
    }
    
    const PageClass = window[pageClassName];
    if (!PageClass) return;

    this.app.currentPage = new PageClass(this.app);
    
    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = ''; // 先に中身を空にする
    
    if (requiresAuth) {
      window.HeaderComponent.show(this.app.currentUser);
      window.SidebarComponent.show(this.app.currentUser);
    } else {
      window.HeaderComponent.hide();
      window.SidebarComponent.hide();
    }

    contentContainer.innerHTML = await this.app.currentPage.render();
    if (this.app.currentPage.init) {
      await this.app.currentPage.init();
    }
    this.app.i18n.updateUI();
  }
}

window.Router = Router;

class NotFoundPage {
  constructor(app) { this.app = app; }
  async render() { return `...`; } // 省略
}
window.NotFoundPage = NotFoundPage;
