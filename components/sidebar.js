/**
 * Sidebar Component
 * サイドバーコンポーネント
 */
class SidebarComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null;
    this.app = null;
  }

  show() {
    if (!this.app || !this.app.currentUser) return this.hide();
    this.currentUser = this.app.currentUser;
    this.isVisible = true;
    this.render();
  }

  hide() {
    this.isVisible = false;
    const sidebarContainer = document.getElementById("sidebar-container");
    if (sidebarContainer) {
      sidebarContainer.innerHTML = "";
    }
    const main = document.getElementById("content");
    if (main) main.style.marginLeft = "0";
  }

  update() {
    if (this.isVisible) this.render();
  }

  render() {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer || !this.app.currentUser) return;

    const role = this.app.currentUser.role;

    sidebarContainer.innerHTML = `
      <div class="sidebar bg-dark text-white d-flex flex-column" style="width: 250px; flex-shrink: 0; height: 100vh; position: fixed;">
        <div class="p-2" style="flex-grow: 1; overflow-y: auto;">
            <nav class="nav flex-column">
                ${this._menuItem("/dashboard", "fas fa-tachometer-alt", "dashboard")}
                ${role === "admin" ? this._menuItem("/users", "fas fa-users", "users") : ""}
                ${this._menuItem("/evaluations", "fas fa-clipboard-list", "evaluations")}
                ${role === "admin" ? this._menuItem("/goal-approvals", "fas fa-check-circle", "goal_approvals") : ""}
                <hr class="border-secondary my-2">
                ${this._menuItem("/goal-setting", "fas fa-bullseye", "goals")}
                ${this._menuItem("/evaluation-form", "fas fa-edit", "evaluation")}
                <hr class="border-secondary my-2">
                ${(role === "admin" || role === "developer") ? this._menuItem("/settings", "fas fa-cog", "settings") : ""}
                ${role === "developer" ? this._menuItem("/developer", "fas fa-code", "developer") : ""}
            </nav>
        </div>
        <div class="p-3 border-top border-secondary">
            <div>${this.app.sanitizeHtml(this.currentUser.name)}</div>
            <small class="text-white-50">${this.app.i18n.t('roles.' + role)}</small>
        </div>
      </div>
    `;

    const main = document.getElementById("content");
    if (main) main.style.marginLeft = "250px";
    
    this.app.i18n.updateUI(sidebarContainer);
  }

  _menuItem(path, icon, key) {
    const isActive = window.location.pathname === path;
    // ★★★ タイプミスを修正: i1p8n -> i18n ★★★
    return `
      <a href="${path}" class="nav-link text-white mb-1 ${isActive ? 'active bg-primary' : ''}" data-link>
        <i class="${icon} me-2 fa-fw"></i>
        <span>${this.app.i18n.t('nav.' + key)}</span>
      </a>
    `;
  }
}
window.SidebarComponent = new SidebarComponent();
