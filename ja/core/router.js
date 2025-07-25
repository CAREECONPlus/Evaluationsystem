/**
 * Router Service
 * ルーターサービス
 */
class Router {
  constructor(app) {
    this.app = app
    this.currentRoute = null
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

      // Define routes
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

      // Handle browser back/forward
      window.addEventListener("popstate", (event) => {
        const path = window.location.pathname
        console.log("Popstate event:", path)
        this.navigate(path, false)
      })

      this.isInitialized = true
      console.log("Router initialized")
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

      if (!this.isInitialized) {
        console.error("Router not initialized")
        return
      }

      // Normalize path
      if (!path || path === "") {
        path = "/"
      }

      // Update browser history
      if (pushState && path !== window.location.pathname) {
        window.history.pushState({}, "", path)
      }

      // Execute route handler
      const handler = this.routes[path]
      if (handler) {
        this.currentRoute = path
        handler()
      } else {
        console.warn("Route not found:", path)
        this.navigate("/login", false)
      }
    } catch (error) {
      console.error("Navigation failed:", error)
      if (this.app) {
        this.app.showError("ページの読み込みに失敗しました。")
      }
    }
  }

  /**
   * Load a page
   * ページを読み込み
   */
  async loadPage(pageName, requireAuth = false) {
    try {
      console.log("Loading page:", pageName)

      // Check authentication if required
      if (requireAuth && !this.app.isAuthenticated()) {
        console.log("Authentication required, redirecting to login")
        this.navigate("/login", false)
        return
      }

      // Get page content container
      const contentContainer = document.getElementById("content")
      if (!contentContainer) {
        console.error("Content container not found")
        return
      }

      // Show loading
      this.app.showLoading(contentContainer)

      // Get page class
      const pageClassName = this.getPageClassName(pageName)
      const PageClass = window[pageClassName]

      if (!PageClass) {
        throw new Error(`Page class ${pageClassName} not found`)
      }

      // Create page instance
      const pageInstance = new PageClass(this.app)

      // Store page instance globally for access
      window[pageName.replace("-", "") + "Page"] = pageInstance

      // Render page
      const html = await pageInstance.render()
      contentContainer.innerHTML = html

      // Initialize page
      if (pageInstance.init) {
        await pageInstance.init()
      }

      // Update header and sidebar for authenticated pages
      if (requireAuth && this.app.currentUser) {
        if (window.HeaderComponent) {
          window.HeaderComponent.show(this.app.currentUser)
        }
        if (window.SidebarComponent) {
          window.SidebarComponent.show(this.app.currentUser)
        }
      }

      console.log("Page loaded successfully:", pageName)
    } catch (error) {
      console.error("Failed to load page:", pageName, error)

      const contentContainer = document.getElementById("content")
      if (contentContainer) {
        contentContainer.innerHTML = `
          <div class="container mt-5">
            <div class="alert alert-danger">
              <h4>ページの読み込みエラー</h4>
              <p>ページ「${pageName}」の読み込みに失敗しました。</p>
              <button class="btn btn-primary" onclick="location.reload()">再読み込み</button>
            </div>
          </div>
        `
      }
    }
  }

  /**
   * Get page class name from page name
   * ページ名からページクラス名を取得
   */
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
    }

    return nameMap[pageName] || "LoginPage"
  }

  /**
   * Get current route
   * 現在のルートを取得
   */
  getCurrentRoute() {
    return this.currentRoute
  }

  /**
   * Check if route requires authentication
   * ルートが認証を必要とするかチェック
   */
  requiresAuth(path) {
    const publicRoutes = ["/", "/login", "/register"]
    return !publicRoutes.includes(path)
  }
}

// Make Router globally available
window.Router = Router
