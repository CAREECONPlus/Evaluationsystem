// router.js - 修正版（シンプル化）
import { LoginPage } from "./pages/login.js"
import { DashboardPage } from "./pages/dashboard.js"
import { UserManagementPage } from "./pages/user-management.js"
import { EvaluationsPage } from "./pages/evaluations.js"
import { EvaluationReportPage } from "./pages/report.js"
import { SettingsPage } from "./pages/settings.js"
import { EvaluationFormPage } from "./pages/evaluation-form.js"
import { GoalSettingPage } from "./pages/goal-setting.js"
import { GoalApprovalsPage } from "./pages/goal-approvals.js"
import { DeveloperPage } from "./pages/developer.js"
import { RegisterAdminPage } from "./pages/register-admin.js"
import { RegisterPage } from "./pages/register.js"
import { JobTypeManagementPage } from "./pages/job-type-management.js"
import { InvitationAcceptPage } from "./pages/invitation-accept.js"
import { ProfilePage } from "./pages/profile.js"
import { HelpPage } from "./pages/help.js"

export class Router {
  constructor(app) {
    this.app = app
    this.routes = {
      "/login": {
        component: LoginPage,
        auth: false,
        title: "ログイン",
      },
      "/dashboard": {
        component: DashboardPage,
        auth: true,
        title: "ダッシュボード",
      },
      "/users": {
        component: UserManagementPage,
        auth: true,
        roles: ["admin"],
        title: "ユーザー管理",
      },
      "/evaluations": {
        component: EvaluationsPage,
        auth: true,
        title: "評価一覧",
      },
      "/report": {
        component: EvaluationReportPage,
        auth: true,
        title: "評価レポート",
      },
      "/settings": {
        component: SettingsPage,
        auth: true,
        roles: ["admin"],
        title: "システム設定",
      },
      "/evaluation-form": {
        component: EvaluationFormPage,
        auth: true,
        title: "評価入力",
      },
      "/goal-setting": {
        component: GoalSettingPage,
        auth: true,
        roles: ["evaluator", "worker"],
        title: "目標設定",
      },
      "/goal-approvals": {
        component: GoalApprovalsPage,
        auth: true,
        roles: ["admin"],
        title: "目標承認",
      },
      "/developer": {
        component: DeveloperPage,
        auth: true,
        roles: ["developer"],
        title: "開発者管理",
      },
      "/job-types": {
        component: JobTypeManagementPage,
        auth: true,
        roles: ["admin"],
        title: "職種管理",
      },
      "/register-admin": {
        component: RegisterAdminPage,
        auth: false,
        title: "管理者登録申請",
      },
      "/register": {
        component: RegisterPage,
        auth: false,
        title: "ユーザー登録",
      },
      "/invitation-accept": {
        component: InvitationAcceptPage,
        auth: false,
        title: "招待受諾",
      },
      "/profile": {
        component: ProfilePage,
        auth: true,
        title: "プロフィール",
      },
      "/help": {
        component: HelpPage,
        auth: true,
        title: "ヘルプ",
      },
    }

    this.currentPageInstance = null
    this.currentRoute = null

    // ルート変更の監視
    window.addEventListener("hashchange", () => this.route())
    window.addEventListener("popstate", () => this.route())
  }

  getCurrentPath() {
    return window.location.hash.slice(1).split("?")[0] || "/login"
  }

  getParams() {
    const queryString = window.location.hash.split("?")[1] || ""
    return new URLSearchParams(queryString)
  }

  async route() {
    try {
      const path = this.getCurrentPath()
      const params = this.getParams()


      // 現在のページのクリーンアップ（シンプル化）
      this.cleanupCurrentPage()

      // ルート設定を取得
      const routeConfig = this.routes[path] || this.routes["/login"]

      // 認証チェック
      if (routeConfig.auth && !this.app.isAuthenticated()) {
        console.log("Router: Authentication required, redirecting to /login")
        this.navigate("#/login")
        return
      }

      // 認証済みユーザーが公開ページ（ログインのみ）にアクセスする場合の処理
      if (!routeConfig.auth && this.app.isAuthenticated() && (path === "/login" || path.includes("register"))) {
        if (path === "/login") {
          console.log("Router: Already authenticated, redirecting to /dashboard")
          this.navigate("#/dashboard")
          return
        }
      }

      // 権限チェック
      if (routeConfig.roles && this.app.isAuthenticated()) {
        if (!this.app.hasAnyRole(routeConfig.roles)) {
          console.log(`Router: Access denied. Required roles: ${routeConfig.roles}`)
          this.app.showError("このページにアクセスする権限がありません。")
          this.navigate("#/dashboard")
          return
        }
      }

      // ページのレンダリングと初期化
      await this.renderPage(routeConfig, params)

      // ページタイトルの更新
      this.updatePageTitle(routeConfig.title)

      // 現在のルートを記録
      this.currentRoute = path

    } catch (error) {
      console.error("Router: Error during routing:", error)
      this.renderErrorPage(error)
    }
  }

  cleanupCurrentPage() {
    try {
      // 現在のページインスタンスのクリーンアップ
      if (this.currentPageInstance) {
        if (typeof this.currentPageInstance.cleanup === "function") {
          this.currentPageInstance.cleanup()
        }
        this.currentPageInstance = null
      }

      // コンテンツをクリア
      const contentContainer = document.getElementById("content")
      if (contentContainer) {
        contentContainer.innerHTML = ""
      }

      // モーダルのクリーンアップ
      const modals = document.querySelectorAll(".modal:not(.permanent-modal)")
      modals.forEach((modal) => {
        try {
          const bsModal = window.bootstrap?.Modal?.getInstance(modal)
          if (bsModal) {
            bsModal.dispose()
          }
          modal.remove()
        } catch (e) {
          console.warn("Modal cleanup error:", e)
        }
      })

      // バックドロップのクリーンアップ
      const backdrops = document.querySelectorAll(".modal-backdrop")
      backdrops.forEach((backdrop) => backdrop.remove())

      // bodyスタイルのリセット
      document.body.classList.remove("modal-open")
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""

    } catch (error) {
      console.warn("Router: Cleanup error:", error)
    }
  }

  async renderPage(routeConfig, params) {
    try {
      // ページインスタンスの作成
      const PageClass = routeConfig.component
      this.currentPageInstance = new PageClass(this.app)

      // コンテンツコンテナの取得
      const contentContainer = document.getElementById("content")
      if (!contentContainer) {
        throw new Error("Content container not found")
      }

      // ページのレンダリング
      const htmlContent = await this.currentPageInstance.render()
      contentContainer.innerHTML = htmlContent

      // ページの初期化
      if (typeof this.currentPageInstance.init === "function") {
        await this.currentPageInstance.init(params)
      }

      // 多言語対応の更新
      this.app.i18n.updateUI(contentContainer)

    } catch (error) {
      console.error("Router: Page rendering failed:", error)
      this.renderErrorPage(error)
    }
  }

  updatePageTitle(title) {
    try {
      const systemName = this.app.i18n.t("app.system_name") || "評価管理システム"
      document.title = title ? `${title} - ${systemName}` : systemName
    } catch (error) {
      console.warn("Router: Title update failed:", error)
      document.title = "評価管理システム"
    }
  }

  renderErrorPage(error) {
    const contentContainer = document.getElementById("content")
    if (!contentContainer) return

    contentContainer.innerHTML = `
      <div class="d-flex align-items-center justify-content-center" style="min-height: 70vh;">
        <div class="text-center p-4 card shadow-sm" style="max-width: 600px;">
          <div class="mb-4">
            <i class="fas fa-exclamation-triangle fa-4x text-warning"></i>
          </div>
          <h2 class="text-danger mb-3">ページ表示エラー</h2>
          <p class="text-muted mb-4">ページの読み込み中に予期せぬエラーが発生しました。</p>
          
          <div class="d-grid gap-2 d-md-flex justify-content-md-center mb-4">
            <button class="btn btn-primary" onclick="window.location.reload()">
              <i class="fas fa-redo me-2"></i>ページを再読み込み
            </button>
            <button class="btn btn-outline-secondary" onclick="window.app.navigate('#/dashboard')">
              <i class="fas fa-home me-2"></i>ダッシュボードに戻る
            </button>
          </div>
          
          <div class="mt-4">
            <small class="text-muted">
              問題が解決しない場合は、システム管理者に連絡してください。
            </small>
          </div>
        </div>
      </div>
    `
  }

  // プログラム的なナビゲーション
  navigate(path, params = {}) {
    try {
      const queryString = Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : ""
      const fullPath = path + queryString


      if (window.location.hash !== fullPath) {
        window.location.hash = fullPath
      } else {
        this.route()
      }
    } catch (error) {
      console.error("Router: Navigation failed:", error)
      this.app.showError("ページ遷移に失敗しました")
    }
  }

  getCurrentRoute() {
    return this.currentRoute
  }
}
