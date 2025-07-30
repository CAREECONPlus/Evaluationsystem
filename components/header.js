/**
 * Header Component
 * ヘッダーコンポーネント
 */
class HeaderComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null;
    this.bootstrap = window.bootstrap; // Bootstrap JS 参照
    this.app = null; // app.js からインスタンスがセットされる
  }

  /**
   * ヘッダーを表示
   */
  show() {
    try {
      // 引数からではなく、appインスタンスから直接ユーザー情報を取得する
      this.currentUser = this.app?.currentUser;
      console.log("Showing header for user:", this.currentUser?.name);
      this.render();
      this.isVisible = true;
    } catch (error) {
      console.error("Error showing header:", error);
    }
  }

  /**
   * ヘッダーを非表示
   */
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

  /**
   * ヘッダーを更新
   */
  update() {
    // updateメソッドもappインスタンスから取得するように統一
    this.currentUser = this.app?.currentUser;
    if (this.isVisible) {
      this.render();
    }
  }

  /**
   * ヘッダーを描画
   */
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

                ${userRole === "admin" ? `
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/users')">
                    <i class="fas fa-users me-1"></i>
                    <span data-i18n="nav.users"></span>
                  </a>
                </li>` : ""}

                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/evaluations')">
                    <i class="fas fa-clipboard-list me-1"></i>
                    <span data-i18n="nav.evaluations"></span>
                  </a>
                </li>

                ${userRole === "admin" ? `
                <li class="nav-item">
                  <a class="nav-link" href="#" onclick="window.app.navigate('/goal-approvals')">
                    <i class="fas fa-check-circle me-1"></i>
                    <span data-i18n="nav.goal_approvals"></span>
                  </a>
                </li>` : ""}

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
                    <i class="fas fa-user-circle fa-lg me-2"></i>
                    <div class="d-none d-md-block">
                      <div class="user-name">
                        ${this.sanitizeHtml(this.currentUser?.name || this.app?.i18n.t('common.user'))}
                      </div>
                      <small class="user-role text-muted">
                        ${this.getRoleDisplayName(userRole)}
                      </small>
                    </div>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <div class="dropdown-header">
                        <div class="fw-bold">
                          ${this.sanitizeHtml(this.currentUser?.name || "")}
                        </div>
                        <small class="text-muted">
                          ${this.sanitizeHtml(this.currentUser?.email || "")}
                        </small>
                      </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
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

      // 翻訳を適用
      if (this.app?.i18n) {
        this.app.i18n.updateUI(headerContainer);
      }
      console.log("Header rendered successfully");
    } catch (error) {
      console.error("Error rendering header:", error);
    }
  }

  /**
   * 言語を変更
   */
  async changeLanguage(langCode) {
    try {
      console.log("Changing language to:", langCode);
      if (this.app?.i18n) {
        await this.app.i18n.setLanguage(langCode);
        this.render(); // renderを呼び出す前にcurrentUserを更新
        if (this.app.currentPage?.init) {
            // 現在のページを再初期化して言語変更を反映
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            await this.app.currentPage.init(urlParams);
        }
      }
    } catch (error) {
      console.error("Error changing language:", error);
    }
  }

  /**
   * プロフィールモーダルを表示
   */
  showProfile() {
    // …（既存のプロフィール表示ロジック）…
  }

  /**
   * ログアウト
   */
  async logout() {
    try {
      console.log("Logging out user");
      if (confirm(this.app.i18n.t("auth.confirm_logout"))) {
        await this.app.logout();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  /**
   * ロールの表示名取得
   */
  getRoleDisplayName(role) {
    return this.app?.i18n
      ? this.app.i18n.t('roles.' + role)
      : { admin: "管理者", developer: "開発者", evaluator: "評価者", worker: "作業員" }[role] || role;
  }

  /**
   * HTML サニタイズ
   */
  sanitizeHtml(str) {
    if (!str) return "";
    if (this.app?.sanitizeHtml) return this.app.sanitizeHtml(str);
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

// グローバルインスタンス登録
const headerComponent = new HeaderComponent();
window.HeaderComponent = headerComponent;
window.headerComponent = headerComponent;
