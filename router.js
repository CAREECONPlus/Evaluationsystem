/**
 * Router Service
 * ルーターサービス
 */
class Router {
  constructor(app) {
    this.app = app
    this.currentRoute = null
    this.currentPageInstance = null // 現在のページインスタンスを保持するプロパティ
    this.routes = {}
    this.isInitialized = false
  }

  /**
   * Initialize router
   * ルーターを初期化
   */
  init() {
    try {
      console.log("Initializing Router...")
      this.routes = {
        "/": () => this.navigate("/login", false),
        "/login": () => this.loadPage("login"),
        "/register": () => this.loadPage("register"),
        "/register-admin": () => this.loadPage("register-admin"),
        "/dashboard": () => this.loadPage("dashboard", true),
        "/users": () => this.loadPage("user-management", true),
        "/goal-setting": () => this.loadPage("goal-setting", true),
        "/goal-approvals": () => this.loadPage("goal-approvals", true),
        "/evaluation-form": () => this.loadPage("evaluation-form", true),
        "/evaluations": () => this.loadPage("evaluations", true),
        "/settings": () => this.loadPage("settings", true),
        "/developer": () => this.loadPage("developer", true),
      }
      window.addEventListener("popstate", () => this.navigate(window.location.pathname, false))
      this.isInitialized = true
      console.log("Router initialized")
      this.navigate(window.location.pathname, false)
    } catch (error) {
      console.error("Failed to initialize Router:", error)
      throw error
    }
  }

  /**
   * Navigate to a route
   * ルートに移動
   */
  navigate(path, pushState = true) {
    try {
      console.log("Navigating to:", path)
      if (pushState && path !== window.location.pathname) {
        window.history.pushState({}, "", path)
      }
      const handler = this.routes[path]
      if (handler) {
        this.currentRoute = path
        handler()
      } else {
        console.warn("Route not found:", path)
        this.loadPage('404'); // 404ページを表示するなどの処理
      }
    } catch (error) {
      console.error("Navigation failed:", error)
      if (this.app) this.app.showError("ページの読み込みに失敗しました。")
    }
  }

  /**
   * Load a page
   * ページを読み込み
   */
  async loadPage(pageName, requireAuth = false) {
    try {
      console.log("Loading page:", pageName)
      if (requireAuth && !this.app.isAuthenticated()) {
        console.log("Authentication required, redirecting to login")
        this.navigate("/login", false)
        return
      }

      const contentContainer = document.getElementById("content")
      if (!contentContainer) {
        console.error("Content container not found")
        return
      }

      this.app.showLoading(contentContainer)
      const pageClassName = this.getPageClassName(pageName)
      const PageClass = window[pageClassName]

      if (!PageClass) throw new Error(`Page class ${pageClassName} not found`)
      
      // ★★★ 修正点 ★★★
      // ページインスタンスを作成し、appのプロパティとして保持する
      const pageInstance = new PageClass(this.app)
      this.app.currentPage = pageInstance; // これで各ページからインスタンスにアクセスできる
      this.currentPageInstance = pageInstance

      contentContainer.innerHTML = await pageInstance.render()
      if (pageInstance.init) {
        await pageInstance.init()
      }

      if (requireAuth && this.app.currentUser) {
        window.HeaderComponent.show(this.app.currentUser)
        window.SidebarComponent.show(this.app.currentUser)
      } else {
        window.HeaderComponent.hide()
        window.SidebarComponent.hide()
      }
      console.log("Page loaded successfully:", pageName)
    } catch (error) {
      console.error("Failed to load page:", pageName, error)
      const contentContainer = document.getElementById("content")
      if(contentContainer) {
        contentContainer.innerHTML = `<div class="container mt-5"><div class="alert alert-danger"><h4>ページの読み込みエラー</h4><p>ページ「${pageName}」の読み込みに失敗しました。</p></div></div>`
      }
    }
  }

  getPageClassName(pageName) {
    const nameMap = {
      login: "LoginPage",
      register: "RegisterPage",
      "register-admin": "RegisterAdminPage",
      dashboard: "DashboardPage",
      "user-management": "UserManagementPage",
      "goal-setting": "GoalSettingPage",
      "goal-approvals": "GoalApprovalsPage",
      "evaluation-form": "EvaluationFormPage",
      evaluations: "EvaluationsPage",
      settings: "SettingsPage",
      developer: "DeveloperPage",
      '404': 'NotFoundPage' // 念のため404クラスも定義
    }
    return nameMap[pageName] || "LoginPage"
  }
}

// Make Router globally available
window.Router = Router

// 404ページ用の簡単なクラス定義
class NotFoundPage {
    async render() {
        return `<div class="container mt-5"><h1>404 - Page Not Found</h1><p>お探しのページは見つかりませんでした。</p></div>`;
    }
    async init() {}
}
window.NotFoundPage = NotFoundPage;
