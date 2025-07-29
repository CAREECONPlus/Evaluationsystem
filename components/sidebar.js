/**
 * Sidebar Component
 * サイドバーコンポーネント
 */
class SidebarComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null;
    this.isCollapsed = false;
    this.app = null; // 後から app インスタンスをセット
  }

  show() {
    if (!this.app || !this.app.i18n) return this.hide();
    this.currentUser = this.app.currentUser;
    this.isVisible = true;
    this.render();
  }

  hide() {
    this.isVisible = false;
    const sidebarContainer = document.getElementById("sidebar-container");
    if (sidebarContainer) sidebarContainer.innerHTML = "";
    const main = document.getElementById("content");
    if (main) main.classList.add("sidebar-hidden");
  }

  update() {
    if (this.isVisible) this.render();
  }

  render() {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) return;

    const width = this.isCollapsed ? "80px" : "250px";
    const role = this.app.currentUser.role;

    sidebarContainer.innerHTML = `
      <div class="sidebar bg-dark text-white" style="width:${width}; flex:0 0 auto;">
        <nav class="nav flex-column p-2">
          ${this._menuItem("/dashboard","fas fa-tachometer-alt","dashboard")}
          ${role==="admin"?this._menuItem("/users","fas fa-users","users"):""}
          ${this._menuItem("/evaluations","fas fa-clipboard-list","evaluations")}
          ${role==="admin"?this._menuItem("/goal-approvals","fas fa-check-circle","goal_approvals"):""}
          <hr class="border-secondary my-2">
          ${this._menuItem("/goal-setting","fas fa-bullseye","goals")}
          ${this._menuItem("/evaluation-form","fas fa-edit","evaluation")}
          <hr class="border-secondary my-2">
          ${(role==="admin"||role==="developer")?this._menuItem("/settings","fas fa-cog","settings"):""}
          ${role==="developer"?this._menuItem("/developer","fas fa-code","developer"):""}
        </nav>
        <div class="mt-auto p-3 border-top border-secondary d-flex justify-content-between align-items-center">
          ${!this.isCollapsed?`<div>
            <div>${this._esc(this.app.currentUser.name)}</div>
            <small class="text-white-50">${this.app.i18n.t('roles.'+role)}</small>
          </div>`:""}
          <button class="btn btn-sm btn-outline-light" onclick="window.app.logout()">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    `;

    const main = document.getElementById("content");
    if (main) main.classList.remove("sidebar-hidden");
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.render();
  }

  _menuItem(path, icon, key) {
    return `
      <a href="#" class="nav-link text-white mb-1" onclick="window.app.navigate('${path}')">
        <i class="${icon} me-2"></i>
        <span>${this.app.i18n.t('nav.'+key)}</span>
      </a>
    `;
  }

  _esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
}

// グローバルへマウント（app.js側で this.app = window.app; を設定してください）
window.SidebarComponent = new SidebarComponent();
