/**
 * Header Component
 * ヘッダーコンポーネント
 */
class HeaderComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null;
    this.bootstrap = window.bootstrap; // Bootstrap JS を使うための参照
  }

  show(user) {
    try {
      console.log("Showing header for user:", user?.name);
      this.currentUser = user;
      this.render();
      this.isVisible = true;
    } catch (error) {
      console.error("Error showing header:", error);
    }
  }

  hide() {
    try {
      console.log("Header hidden");
      this.isVisible = false;
      const headerContainer = document.getElementById("header-container");
      if (headerContainer) {
        headerContainer.innerHTML = "";
        headerContainer.style.display = "none";
      }
    } catch (error) {
      console.error("Error hiding header:", error);
    }
  }

  update(user) {
    this.currentUser = user;
    if (this.isVisible) {
      this.render();
    }
  }

  render() {
    try {
      let headerContainer = document.getElementById("header-container");
      if (!headerContainer) {
        headerContainer = document.createElement("div");
        headerContainer.id = "header-container";
        document.body.insertBefore(headerContainer, document.body.firstChild);
      }
      headerContainer.style.display = "block";

      const userRole = this.app?.currentUser?.role;
      headerContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
          <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center" href="#" onclick="window.app.navigate('/dashboard')">
              <i class="fas fa-hard-hat me-2"></i>
              <span class="fw-bold" data-i18n="app.system_name">評価管理システム</span>
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
              aria-label="${this.app?.i18n.t('common.toggle_navigation')}">
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
                </li>`
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
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                     aria-expanded="false">
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
                  <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                     data-bs-toggle="dropdown" aria-expanded="false">
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
                    ${
                      (userRole === "admin" || userRole === "developer")
                        ? `<li>
                             <a class="dropdown-item" href="#" onclick="window.app.navigate('/settings')">
                               <i class="fas fa-cog me-2"></i>
                               <span data-i18n="nav.settings"></span>
                             </a>
                           </li>`
                        : ""
                    }
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
      `;

      // 翻訳適用
      if (this.app?.i18n) {
        this.app.i18n.updateUI(headerContainer);
      }
      console.log("Header rendered successfully");
    } catch (error) {
      console.error("Error rendering header:", error);
    }
  }

  async changeLanguage(langCode) {
    try {
      console.log("Changing language to:", langCode);
      if (window.app?.i18n) {
        await window.app.i18n.setLanguage(langCode);
        window.app.showSuccess(window.app.i18n.t("messages.language_changed"));
        this.render();
      }
    } catch (error) {
      console.error("Error changing language:", error);
      window.app?.showError(window.app.i18n.t("errors.language_change_failed"));
    }
  }

  showProfile() { /* 省略: 既存実装のまま */ }

  async logout() {
    try {
      console.log("Logging out user");
      if (confirm(window.app.i18n.t("auth.confirm_logout"))) {
        await window.app.logout();
      }
    } catch (error) {
      console.error("Error during logout:", error);
      window.app?.showError(window.app.i18n.t("errors.logout_failed"));
    }
  }

  getRoleDisplayName(role) { /* 省略: 既存実装 */ }
  formatDate(date) { /* 省略: 既存実装 */ }
  sanitizeHtml(str) { /* 省略: 既存実装 */ }
}

// 大文字・小文字 両方にエクスポート
const headerComponent = new HeaderComponent();
window.HeaderComponent = headerComponent;
window.headerComponent = headerComponent;
