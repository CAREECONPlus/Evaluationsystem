/**
 * Header Component
 * ヘッダーコンポーネント
 */
class HeaderComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null;
    this.bootstrap = window.bootstrap;
    this.app = null;
  }
  
  // ▼▼▼ 追加: サイドバーの表示/非表示を切り替えるメソッド ▼▼▼
  toggleSidebar() {
      const sidebar = document.getElementById('sidebar-container');
      if (sidebar) {
          sidebar.classList.toggle('show');
      }
  }
  // ▲▲▲ 追加 ▲▲▲

  show() {
    try {
      this.currentUser = this.app?.currentUser;
      if (!this.currentUser) return this.hide();
      this.isVisible = true;
      this.render();
    } catch (error) {
      console.error("Error showing header:", error);
    }
  }

  hide() {
    try {
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

  update() {
    this.currentUser = this.app?.currentUser;
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
            <button class="navbar-toggler me-2 d-lg-none" type="button" onclick="window.headerComponent.toggleSidebar()">
              <span class="navbar-toggler-icon"></span>
            </button>
            <a class="navbar-brand d-flex align-items-center" href="/dashboard" data-link>
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
                <li class="nav-item"><a class="nav-link" href="/dashboard" data-link><i class="fas fa-tachometer-alt me-1"></i><span data-i18n="nav.dashboard"></span></a></li>
                ${userRole === "admin" ? `<li class="nav-item"><a class="nav-link" href="/users" data-link><i class="fas fa-users me-1"></i><span data-i18n="nav.users"></span></a></li>` : ""}
                <li class="nav-item"><a class="nav-link" href="/evaluations" data-link><i class="fas fa-clipboard-list me-1"></i><span data-i18n="nav.evaluations"></span></a></li>
                ${userRole === "admin" ? `<li class="nav-item"><a class="nav-link" href="/goal-approvals" data-link><i class="fas fa-check-circle me-1"></i><span data-i18n="nav.goal_approvals"></span></a></li>` : ""}
                <li class="nav-item"><a class="nav-link" href="/goal-setting" data-link><i class="fas fa-bullseye me-1"></i><span data-i18n="nav.goals"></span></a></li>
              </ul>
              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-globe me-1"></i><span data-i18n="common.language"></span>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="window.headerComponent.changeLanguage('ja')">日本語</a></li>
                    <li><a class="dropdown-item" href="#" onclick="window.headerComponent.changeLanguage('en')">English</a></li>
                    <li><a class="dropdown-item" href="#" onclick="window.headerComponent.changeLanguage('vi')">Tiếng Việt</a></li>
                  </ul>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle fa-lg me-2"></i>
                    <div class="d-none d-md-block">
                      <div class="user-name">${this.app.sanitizeHtml(this.currentUser?.name || 'User')}</div>
                      <small class="user-role text-muted">${this.app.i18n.t('roles.' + userRole)}</small>
                    </div>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="window.app.logout()"><i class="fas fa-sign-out-alt me-2"></i><span data-i18n="nav.logout"></span></a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      `;
      if (this.app?.i18n) {
        this.app.i18n.updateUI(headerContainer);
      }
    } catch (error) {
      console.error("Error rendering header:", error);
    }
  }

  async changeLanguage(langCode) {
    if (this.app?.i18n) {
      await this.app.i18n.setLanguage(langCode);
      this.render(); // ヘッダーを再描画
      await this.app.router.route(); // 現在のページを再読み込みして言語を反映
    }
  }
}
window.HeaderComponent = new HeaderComponent();
window.headerComponent = window.HeaderComponent;
