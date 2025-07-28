/**
 * Sidebar Component (Final Version)
 * サイドバーコンポーネント (最終版)
 */
class SidebarComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null;
    this.isCollapsed = false;
  }

  show(user) {
    this.currentUser = user;
    this.isVisible = true;
    this.render();
  }

  hide() {
    this.isVisible = false;
    const sidebarContainer = document.getElementById("sidebar-container");
    const toggleButton = document.querySelector('.sidebar-toggle');
    if (sidebarContainer) sidebarContainer.style.display = "none";
    if (toggleButton) toggleButton.style.display = "none";
    
    const mainContent = document.getElementById("content");
    if (mainContent) mainContent.style.marginLeft = "0";
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.render();
  }

  render() {
    let sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) {
      sidebarContainer = document.createElement("div");
      sidebarContainer.id = "sidebar-container";
      sidebarContainer.className = "sidebar-container";
      document.getElementById("app")?.prepend(sidebarContainer);
    }
    sidebarContainer.style.display = "block";

    const sidebarWidth = this.isCollapsed ? "80px" : "250px";

    sidebarContainer.innerHTML = `
      <div class="sidebar bg-dark text-white h-100 d-flex flex-column" style="width: ${sidebarWidth};">
        <div class="sidebar-content flex-grow-1" style="overflow-y: auto;">
          <nav class="nav flex-column p-2 mt-2">
            ${this.renderMenuItems()}
          </nav>
        </div>
        <div class="sidebar-footer border-top border-secondary p-3">
          <div class="d-flex align-items-center ${this.isCollapsed ? 'justify-content-center' : ''}">
            ${!this.isCollapsed ? `
              <div class="user-info small flex-grow-1">
                <div>${this.sanitize(this.currentUser?.name)}</div>
                <div class="text-white-50">${this.getRoleDisplayName(this.currentUser?.role)}</div>
              </div>` : ''}
            <button class="btn btn-sm btn-outline-light" onclick="window.app.logout()" title="ログアウト">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>`;

    const mainContent = document.getElementById("content");
    if (mainContent) {
      mainContent.style.marginLeft = sidebarWidth;
    }

    this.updateToggleButton(sidebarWidth);
    this.highlightCurrentPage();
  }

  updateToggleButton(sidebarWidth) {
    let toggleButton = document.querySelector('.sidebar-toggle');
    if (!toggleButton) {
      toggleButton = document.createElement('button');
      toggleButton.className = 'btn sidebar-toggle';
      document.body.appendChild(toggleButton);
    }
    toggleButton.style.display = "flex";
    toggleButton.style.left = `calc(${sidebarWidth} - 18px)`;
    toggleButton.innerHTML = `<i class="fas fa-angle-${this.isCollapsed ? 'right' : 'left'}"></i>`;
    toggleButton.onclick = () => this.toggleCollapse();
  }

  renderMenuItems() {
    const role = this.currentUser?.role;
    const menuConfig = [
      { path: "/dashboard", icon: "fas fa-tachometer-alt", label: "ダッシュボード", roles: ["admin", "evaluator", "worker", "developer"] },
      { path: "/users", icon: "fas fa-users", label: "ユーザー管理", roles: ["admin"] },
      { path: "/evaluations", icon: "fas fa-clipboard-list", label: "評価管理", roles: ["admin", "evaluator", "worker"] },
      { path: "/goal-setting", icon: "fas fa-bullseye", label: "目標設定", roles: ["evaluator", "worker"] },
      { path: "/goal-approvals", icon: "fas fa-check-circle", label: "目標承認", roles: ["admin"] },
      { path: "/evaluation-form", icon: "fas fa-edit", label: "評価フォーム", roles: ["admin", "evaluator"] },
      { type: 'divider' },
      { path: "/settings", icon: "fas fa-cog", label: "設定", roles: ["admin"] },
      { path: "/developer", icon: "fas fa-code", label: "開発者", roles: ["developer"] }
    ];

    return menuConfig.map(item => {
      if (item.type === 'divider') {
        return '<hr class="border-secondary my-2">';
      }
      if (item.roles.includes(role)) {
        return this.renderMenuItem(item.path, item.icon, item.label);
      }
      return '';
    }).join('');
  }

  renderMenuItem(path, icon, label) {
    const isActive = window.location.pathname === path;
    const activeClass = isActive ? "active" : "";
    return `
      <a href="#" class="nav-link text-white p-2 mb-1 rounded ${activeClass}" onclick="window.app.navigate('${path}')" title="${label}">
        <div class="d-flex align-items-center ${this.isCollapsed ? 'justify-content-center' : ''}">
          <i class="${icon} ${this.isCollapsed ? '' : 'me-3'}" style="width: 20px;"></i>
          ${!this.isCollapsed ? `<span>${label}</span>` : ''}
        </div>
      </a>`;
  }

  highlightCurrentPage() {
    // This is now handled by the activeClass in renderMenuItem
  }

  getRoleDisplayName(role) {
    return { admin: "管理者", evaluator: "評価者", worker: "作業員", developer: "開発者" }[role] || "不明";
  }

  sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
}

window.SidebarComponent = new SidebarComponent();
window.sidebarComponent = window.SidebarComponent;
