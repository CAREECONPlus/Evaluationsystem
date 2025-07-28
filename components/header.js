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
      const userRole = this.app?.currentUser?.role; // appインスタンスからロールを取得

      headerContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
          <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center" href="#" onclick="window.app.navigate('/dashboard')">
              <i class="fas fa-hard-hat me-2"></i>
              <span class="fw-bold" data-i18n="app.system_name">評価管理システム</span>
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="${this.app?.i18n.t('common.toggle_navigation')}">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav me-auto">
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/dashboard')">
                    <i class="fas fa-tachometer-alt me-1"></i>
                    <span data-i18n="nav.dashboard"></span>
                  </a>
                </li>
                ${
                  userRole === "admin"
                    ? `
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/users')">
                    <i class="fas fa-users me-1"></i>
                    <span data-i18n="nav.users"></span>
                  </a>
                </li>
                `
                    : ""
                }
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/evaluations')">
                    <i class="fas fa-clipboard-list me-1"></i>
                    <span data-i18n="nav.evaluations"></span>
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/goal-setting')">
                    <i class="fas fa-bullseye me-1"></i>
                    <span data-i18n="nav.goals"></span>
                  </a>
                </li>
              </ul>

              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-globe me-1"></i>
                    <span data-i18n="common.language"></span>
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

                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="user-avatar me-2">
                      <i class="fas fa-user-circle fa-lg"></i>
                    </div>
                    <div class="user-info d-none d-md-block">
                      <div class="user-name">${this.sanitizeHtml(this.currentUser?.name || this.app?.i18n.t('common.user'))}</div>
                      <small class="user-role text-muted">${this.getRoleDisplayName(this.currentUser?.role)}</small>
                    </div>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <div class="dropdown-header">
                        <div class="fw-bold">${this.sanitizeHtml(this.currentUser?.name || this.app?.i18n.t('common.user'))}</div>
                        <small class="text-muted">${this.sanitizeHtml(this.currentUser?.email || "")}</small>
                      </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    ${userRole === "admin" || userRole === "developer" ? `
                    <li>
                      <a class="dropdown-item" href="#" onclick="window.app.navigate('/settings')">
                        <i class="fas fa-cog me-2"></i>
                        <span data-i18n="nav.settings"></span>
                      </a>
                    </li>
                    ` : ''}
                    <li>
                      <a class="dropdown-item" href="#" onclick="window.headerComponent.showProfile()">
                        <i class="fas fa-user me-2"></i>
                        <span data-i18n="nav.profile"></span>
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" onclick="window.headerComponent.logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>
                        <span data-i18n="nav.logout"></span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      `
      // render後に翻訳を適用
      if (this.app?.i18n) {
          this.app.i18n.updateUI(headerContainer);
      }

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
        window.app.showSuccess(window.app.i18n.t("messages.language_changed")); // 翻訳キー
        // Re-render header with new language
        this.render()
      }
    } catch (error) {
      console.error("Error changing language:", error)
      window.app?.showError(window.app.i18n.t("errors.language_change_failed")); // 翻訳キー
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
        <div class="modal fade" id="profileModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-user me-2"></i>
                  <span data-i18n="nav.profile"></span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${this.app?.i18n.t('common.close')}"></button>
              </div>
              <div class="modal-body">
                <div class="text-center mb-4">
                  <i class="fas fa-user-circle fa-5x text-muted"></i>
                </div>
                <div class="row">
                  <div class="col-sm-4 fw-bold" data-i18n="auth.name"></div>
                  <div class="col-sm-8">${this.sanitizeHtml(this.currentUser?.name || "")}</div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-sm-4 fw-bold" data-i18n="auth.email"></div>
                  <div class="col-sm-8">${this.sanitizeHtml(this.currentUser?.email || "")}</div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-sm-4 fw-bold" data-i18n="users.role"></div>
                  <div class="col-sm-8">${this.getRoleDisplayName(this.currentUser?.role)}</div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-sm-4 fw-bold" data-i18n="common.last_login"></div>
                  <div class="col-sm-8">${this.formatDate(this.currentUser?.lastLogin)}</div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  <span data-i18n="common.close"></span>
                </button>
                ${this.currentUser?.role === "admin" || this.currentUser?.role === "developer" ? `
                <button type="button" class="btn btn-primary" onclick="window.app.navigate('/settings'); window.bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();">
                  <span data-i18n="nav.settings"></span>
                </button>
                ` : ''}
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
      const modalElement = document.getElementById("profileModal");
      const modal = new this.bootstrap.Modal(modalElement)
      if (this.app?.i18n) {
          this.app.i18n.updateUI(modalElement); // モーダル内の翻訳を適用
      }
      modal.show()

      // Clean up modal after it's hidden
      modalElement.addEventListener("hidden.bs.modal", function () {
        this.remove()
      })
    } catch (error) {
      console.error("Error showing profile modal:", error)
      window.app?.showError(window.app.i18n.t("errors.profile_display_failed")); // 翻訳キー
    }
  }

  /**
   * Logout user
   * ユーザーをログアウト
   */
  async logout() {
    try {
      console.log("Logging out user")

      if (confirm(window.app.i18n.t("auth.confirm_logout"))) { // 翻訳キー
        await window.app?.logout()
      }
    } catch (error) {
      console.error("Error during logout:", error)
      window.app?.showError(window.app.i18n.t("errors.logout_failed")); // 翻訳キー
    }
  }

  /**
   * Get role display name
   * ロール表示名を取得
   */
  getRoleDisplayName(role) {
    if (this.app?.i18n) { // appとi18nが利用可能かチェック
      return this.app.i18n.t('roles.' + role);
    }
    const roleNames = {
      admin: "管理者",
      manager: "マネージャー",
      employee: "従業員",
      evaluator: "評価者", // 追加
      worker: "作業員", // 追加
      developer: "開発者" // 追加
    }
    return roleNames[role] || role || "不明"
  }

  /**
   * Format date
   * 日付をフォーマット
   */
  formatDate(date) {
    if (!date) return this.app?.i18n.t("common.unknown") || "不明"; // 翻訳キー

    try {
      const d = new Date(date)
      // i18nサービスで提供されるフォーマット関数があればそれを使う
      if (this.app?.formatDateTime) {
          return this.app.formatDateTime(d);
      }
      return d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return this.app?.i18n.t("common.unknown") || "不明"; // 翻訳キー
    }
  }

  /**
   * Sanitize HTML to prevent XSS
   * XSS防止のためHTMLをサニタイズ
   */
  sanitizeHtml(str) {
    if (!str) return ""
    // app.jsにsanitizeHtml関数があればそれを使う
    if (this.app?.sanitizeHtml) {
        return this.app.sanitizeHtml(str);
    }
    const div = document.createElement("div")
    div.textContent = str
    return div.innerHTML
  }
}

// Create global instance
window.HeaderComponent = new HeaderComponent()
// appインスタンスへの参照をHeaderComponentに追加
// app.jsのDOMContentLoadedイベント内で実行されるようにする
// window.HeaderComponent.app = window.app; // これはAppクラスのinitで設定する
