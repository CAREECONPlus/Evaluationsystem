/**
 * Router Service
 */
class Router {
  constructor(app) {
    this.app = app;
    this.basePath = '/EvaluationSystem'; // 開発環境に合わせて調整
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
    this.currentPath = null;
  }

  init() {
    window.addEventListener("popstate", () => this.handleLocation());
    this.handleLocation();
  }

  handleLocation() {
    let path = window.location.pathname;
    
    // ベースパスを取り除く処理
    if (path.toLowerCase().startsWith(this.basePath.toLowerCase())) {
      path = path.substring(this.basePath.length) || "/";
    }

    if(this.currentPath === path) return;
    this.currentPath = path;

    let routeTarget = this.routes[path];

    // 末尾のスラッシュを許容する
    if (!routeTarget && path.endsWith('/') && path.length > 1) {
        const trimmedPath = path.slice(0, -1);
        routeTarget = this.routes[trimmedPath];
    }
    
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
    // 同じパスへのナビゲーションを避ける
    if (this.currentPath === path) return;

    const fullPath = (this.basePath + path).replace('//', '/');
    window.history.pushState({}, "", fullPath);
    this.handleLocation();
  }

  async loadPage(path, pageClassName) {
    this.app.currentPage = null;
    const requiresAuth = !["/login", "/register", "/register-admin"].includes(path);

    if (requiresAuth && !this.app.isAuthenticated()) {
      console.log("Authentication required. Redirecting to /login");
      this.navigate("/login");
      return;
    }
     if (!requiresAuth && this.app.isAuthenticated()) {
      console.log("User already authenticated. Redirecting to /dashboard");
      this.navigate("/dashboard");
      return;
    }

    // HeaderComponentとSidebarComponentがwindowに存在し、かつappインスタンスが設定済みであることを確認
    // show/hide メソッドに引数は渡さない。コンポーネント自身が this.app.currentUser を参照する
    if (requiresAuth) {
      if (window.HeaderComponent) window.HeaderComponent.show(); // 引数なし
      if (window.SidebarComponent) window.SidebarComponent.show(); // 引数なし
      // サイドバー非表示時のマージンリセットを確実に行う (Hide側で処理されるべきだが念のため)
      const mainContent = document.getElementById("content");
      if (mainContent) {
          mainContent.classList.remove("sidebar-hidden");
      }
    } else {
      if (window.HeaderComponent) window.HeaderComponent.hide();
      if (window.SidebarComponent) window.SidebarComponent.hide();
      // サイドバーが非表示の場合は、メインコンテンツのマージンをリセットするクラスを追加
      const mainContent = document.getElementById("content");
      if (mainContent) {
          mainContent.classList.add("sidebar-hidden");
      }
    }
    
    const PageClass = window[pageClassName];
    if (!PageClass) {
        console.error(`Page class "${pageClassName}" not found.`);
        this.loadPage("/404", "NotFoundPage");
        return;
    }

    const pageInstance = new PageClass(this.app);
    
    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = await pageInstance.render();

    // initメソッドが存在すれば実行
    if (typeof pageInstance.init === 'function') {
      await pageInstance.init();
    }
    
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }
}

window.Router = Router;

class NotFoundPage {
  constructor(app) { this.app = app; }
  async render() {
    return `<div class="container mt-5 text-center"><h1>404 Not Found</h1><p>お探しのページは見つかりませんでした。</p><a href="#" onclick="window.app.navigate('/login')">ログインページに戻る</a></div>`;
  }
  init() {
    this.app.currentPage = this;
  }
}
window.NotFoundPage = NotFoundPage;
