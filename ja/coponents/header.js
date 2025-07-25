/**
 * Header Component
 * ヘッダーコンポーネント
 */
class HeaderComponent {
  constructor() {
    this.isVisible = false
    this.currentUser = null
    this.bootstrap = window.bootstrap // Declare the bootstrap variable
  }

  /**
   * Show header
   * ヘッダーを表示
   */
  show(user) {
    try {
      console.log("Showing header for user:", user?.name)
      this.currentUser = user
      this.render()
      this.isVisible = true
    } catch (error) {
      console.error("Error showing header:", error)
    }
  }

  /**
   * Hide header
   * ヘッダーを非表示
   */
  hide() {
    try {
      console.log("Header hidden")
      this.isVisible = false
      const headerContainer = document.getElementById("header-container")
      if (headerContainer) {
        headerContainer.innerHTML = ""
        headerContainer.style.display = "none"
      }
    } catch (error) {
      console.error("Error hiding header:", error)
    }
  }

  /**
   * Update header
   * ヘッダーを更新
   */
  update(user) {
    this.currentUser = user
    if (this.isVisible) {
      this.render()
    }
  }

  /**
   * Render header
   * ヘッダーを描画
   */
  render() {
    try {
      let headerContainer = document.getElementById("header-container")

      if (!headerContainer) {
        // Create header container if it doesn't exist
        headerContainer = document.createElement("div")
        headerContainer.id = "header-container"
        document.body.insertBefore(headerContainer, document.body.firstChild)
      }

      headerContainer.style.display = "block"
      headerContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
          <div class="container-fluid">
            <!-- Brand -->
            <a class="navbar-brand d-flex align-items-center" href="#" onclick="window.app.navigate('/dashboard')">
              <i class="fas fa-hard-hat me-2"></i>
              <span class="fw-bold">評価管理システム</span>
            </a>

            <!-- Mobile toggle button -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Navigation -->
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav me-auto">
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/dashboard')">
                    <i class="fas fa-tachometer-alt me-1"></i>
                    ダッシュボード
                  </a>
                </li>
                ${
                  this.currentUser?.role === "admin"
                    ? `
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/users')">
                    <i class="fas fa-users me-1"></i>
                    ユーザー管理
                  </a>
                </li>
                `
                    : ""
                }
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/evaluations')">
                    <i class="fas fa-clipboard-list me-1"></i>
                    評価管理
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/goal-setting')">
                    <i class="fas fa-bullseye me-1"></i>
                    目標設定
                  </a>
                </li>
              </ul>

              <!-- User menu -->
              <ul class="navbar-nav">
                <!-- Language selector -->
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-globe me-1"></i>
                    言語
                  </a>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" onclick="window.headerComponent.changeLanguage('ja')">
                        <i class="fas fa-flag me-2"></i>日本語
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" onclick="window.headerComponent.changeLanguage('en')">
                        <i class="fas fa-flag me-2"></i>English
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" onclick="window.headerComponent.changeLanguage('vi')">
                        <i class="fas fa-flag me-2"></i>Tiếng Việt
                      </a>
                    </li>
                  </ul>
                </li>

                <!-- User dropdown -->
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                    <div class="user-avatar me-2">
                      <i class="fas fa-user-circle fa-lg"></i>
                    </div>
                    <div class="user-info d-none d-md-block">
                      <div class="user-name">${this.sanitizeHtml(this.currentUser?.name || "ユーザー")}</div>
                      <small class="user-role text-muted">${this.getRoleDisplayName(this.currentUser?.role)}</small>
                    </div>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <div class="dropdown-header">
                        <div class="fw-bold">${this.sanitizeHtml(this.currentUser?.name || "ユーザー")}</div>
                        <small class="text-muted">${this.sanitizeHtml(this.currentUser?.email || "")}</small>
                      </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item" href="#" onclick="window.app.navigate('/settings')">
                        <i class="fas fa-cog me-2"></i>
                        設定
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" onclick="window.headerComponent.showProfile()">
                        <i class="fas fa-user me-2"></i>
                        プロフィール
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" onclick="window.headerComponent.logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>
                        ログアウト
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      `

      console.log("Header rendered successfully")
    } catch (error) {
      console.error("Error rendering header:", error)
    }
  }

  /**
   * Change language
   * 言語を変更
   */
  async changeLanguage(langCode) {
    try {
      console.log("Changing language to:", langCode)

      if (window.app?.i18n) {
        await window.app.i18n.setLanguage(langCode)
        window.app.showSuccess("言語を変更しました。")

        // Re-render header with new language
        this.render()
      }
    } catch (error) {
      console.error("Error changing language:", error)
      window.app?.showError("言語の変更に失敗しました。")
    }
  }

  /**
   * Show profile modal
   * プロフィールモーダルを表示
   */
  showProfile() {
    try {
      console.log("Showing profile modal")

      // Create modal HTML
      const modalHtml = `
        <div class="modal fade" id="profileModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-user me-2"></i>
                  プロフィール
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="text-center mb-4">
                  <i class="fas fa-user-circle fa-5x text-muted"></i>
                </div>
                <div class="row">
                  <div class="col-sm-4 fw-bold">名前:</div>
                  <div class="col-sm-8">${this.sanitizeHtml(this.currentUser?.name || "")}</div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-sm-4 fw-bold">メール:</div>
                  <div class="col-sm-8">${this.sanitizeHtml(this.currentUser?.email || "")}</div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-sm-4 fw-bold">ロール:</div>
                  <div class="col-sm-8">${this.getRoleDisplayName(this.currentUser?.role)}</div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-sm-4 fw-bold">最終ログイン:</div>
                  <div class="col-sm-8">${this.formatDate(this.currentUser?.lastLogin)}</div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  閉じる
                </button>
                <button type="button" class="btn btn-primary" onclick="window.app.navigate('/settings')">
                  設定を開く
                </button>
              </div>
            </div>
          </div>
        </div>
      `

      // Remove existing modal
      const existingModal = document.getElementById("profileModal")
      if (existingModal) {
        existingModal.remove()
      }

      // Add modal to body
      document.body.insertAdjacentHTML("beforeend", modalHtml)

      // Show modal
      const modal = new this.bootstrap.Modal(document.getElementById("profileModal"))
      modal.show()

      // Clean up modal after it's hidden
      document.getElementById("profileModal").addEventListener("hidden.bs.modal", function () {
        this.remove()
      })
    } catch (error) {
      console.error("Error showing profile modal:", error)
      window.app?.showError("プロフィールの表示に失敗しました。")
    }
  }

  /**
   * Logout user
   * ユーザーをログアウト
   */
  async logout() {
    try {
      console.log("Logging out user")

      if (confirm("ログアウトしますか？")) {
        await window.app?.logout()
      }
    } catch (error) {
      console.error("Error during logout:", error)
      window.app?.showError("ログアウトに失敗しました。")
    }
  }

  /**
   * Get role display name
   * ロール表示名を取得
   */
  getRoleDisplayName(role) {
    const roleNames = {
      admin: "管理者",
      manager: "マネージャー",
      employee: "従業員",
    }
    return roleNames[role] || role || "不明"
  }

  /**
   * Format date
   * 日付をフォーマット
   */
  formatDate(date) {
    if (!date) return "不明"

    try {
      const d = new Date(date)
      return d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "不明"
    }
  }

  /**
   * Sanitize HTML to prevent XSS
   * XSS防止のためHTMLをサニタイズ
   */
  sanitizeHtml(str) {
    if (!str) return ""
    const div = document.createElement("div")
    div.textContent = str
    return div.innerHTML
  }
}

// Create global instance
window.HeaderComponent = new HeaderComponent()
window.headerComponent = window.HeaderComponent
