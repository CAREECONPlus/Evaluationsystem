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
    const fullPath = this.basePath + (path === "/" ? "" : path);
    // ルートパスの場合、末尾にスラッシュを追加
    const finalPath = (path === "/") ? fullPath + "/" : fullPath;

    if (window.location.pathname !== finalPath) {
      window.history.pushState({}, "", finalPath);
    }
    this.handleLocation();
  }

  async loadPage(path, pageClassName) {
    this.app.currentPage = null; 
    const requiresAuth = !["/login", "/register", "/register-admin", "/404"].includes(path);

    if (requiresAuth && !this.app.isAuthenticated()) {
      this.navigate("/login");
      return;
    }
    
    const PageClass = window[pageClassName];
    if (!PageClass) return;

    this.app.currentPage = new PageClass(this.app);
    
    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = ''; 
    
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
  async render() { 
    const base = new Router().basePath;
    return `<div class="container mt-5 text-center"><h1>404 Not Found</h1><p>お探しのページは見つかりませんでした。</p><a href="${base}/" class="btn btn-primary">ログインページに戻る</a></div>`; 
  }
}
window.NotFoundPage = NotFoundPage;
