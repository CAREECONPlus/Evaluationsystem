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
        "/login": { page: "LoginPage", auth: false },
        "/register": { page: "RegisterPage", auth: false },
        "/register-admin": { page: "RegisterAdminPage", auth: false },
        "/dashboard": { page: "DashboardPage", auth: true },
        "/users": { page: "UserManagementPage", auth: true },
        "/goal-setting": { page: "GoalSettingPage", auth: true },
        "/goal-approvals": { page: "GoalApprovalsPage", auth: true },
        "/evaluation-form": { page: "EvaluationFormPage", auth: true },
        "/evaluations": { page: "EvaluationsPage", auth: true },
        "/settings": { page: "SettingsPage", auth: true },
        "/developer": { page: "DeveloperPage", auth: true },
        "/404": { page: "NotFoundPage", auth: false },
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
    const path = window.location.pathname.replace(/\/$/, "") || "/"; //末尾のスラッシュを削除
    const route = this.routes[path];

    if (route) {
      this.loadPage(path, route.page, route.auth);
    } else {
      // /Evaluationsystem/ のようなサブディレクトリのルートパスの場合、ログインページにリダイレクト
      // それ以外の未定義パスは404ページへ
      const isSubdirectoryRoot = !Object.keys(this.routes).some(r => path.startsWith(r) && r.length > 1);
      if (isSubdirectoryRoot) {
        this.navigate("/login");
      } else {
        this.loadPage("/404", "NotFoundPage", false);
      }
    }
  }

  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    this.handleLocation();
  }

  async loadPage(path, pageClassName, requiresAuth) {
    try {
      this.currentRoute = path;
      
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
      
      // 翻訳適用のためにUI更新
      this.app.i18n.updateUI();

    } catch (error) {
      console.error(`Failed to load page ${path}:`, error);
      document.getElementById("content").innerHTML = "ページの読み込みに失敗しました。";
    }
  }
}

window.Router = Router;

// 404ページ用のクラス定義
class NotFoundPage {
  constructor(app) { this.app = app; }
  async render() { return `<div class="container mt-5 text-center"><h1>404 Not Found</h1><p>お探しのページは見つかりませんでした。</p><a href="/" onclick="event.preventDefault(); window.app.router.navigate('/login');" class="btn btn-primary">ログインページに戻る</a></div>`; }
  async init() {}
}
window.NotFoundPage = NotFoundPage;
