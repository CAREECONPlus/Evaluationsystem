/**
 * Sidebar Component
 * サイドバーコンポーネント
 */
class SidebarComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null;
    this.isCollapsed = false;
  }

  show(user) {
    try {
      console.log("Showing sidebar for user:", user?.name);
      this.currentUser = user;
      this.render();
      this.isVisible = true;
    } catch (error) {
      console.error("Error showing sidebar:", error);
    }
  }

  hide() {
    try {
      console.log("Sidebar hidden");
      this.isVisible = false;
      const sidebarContainer = document.getElementById("sidebar-container");
      if (sidebarContainer) {
        sidebarContainer.innerHTML = "";
        sidebarContainer.style.display = "none";
      }
      const existingToggle = document.querySelector('.sidebar-toggle');
      if (existingToggle) existingToggle.remove();
    } catch (error) {
      console.error("Error hiding sidebar:", error);
    }
  }

  update(user) {
    this.currentUser = user;
    if (this.isVisible) {
      this.render();
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.render();
  }

  render() {
    try {
      let sidebarContainer = document.getElementById("sidebar-container");
      if (!sidebarContainer) {
        sidebarContainer = document.createElement("div");
        sidebarContainer.id = "sidebar-container";
        sidebarContainer.className = "sidebar-container";
        const headerContainer = document.getElementById("header-container");
        headerContainer?.insertAdjacentElement("afterend", sidebarContainer);
      }
      sidebarContainer.style.display = "block";

      const sidebarWidth = this.isCollapsed ? "80px" : "250px";

      sidebarContainer.innerHTML = `
        <div class="sidebar bg-dark text-white d-flex flex-column" style="width: ${sidebarWidth};">
          <div class.sidebar-content flex-grow-1">
            <nav class="nav flex-column p-2">
              ${this.renderMenuItemForRoles(["admin", "evaluator", "worker", "developer"], "/dashboard", "fas fa-tachometer-alt", "ダッシュボード")}
              ${this.renderMenuItemForRoles(["admin"], "/users", "fas fa-users", "ユーザー管理")}
              ${this.renderMenuItemForRoles(["admin", "evaluator", "worker"], "/evaluations", "fas fa-clipboard-list", "評価管理")}
              ${this.renderMenuItemForRoles(["evaluator", "worker"], "/goal-setting", "fas fa-bullseye", "目標設定")}
              ${this.renderMenuItemForRoles(["admin"], "/goal-approvals", "fas fa-check-circle", "目標承認")}
              ${this.renderMenuItemForRoles(["admin", "evaluator"], "/evaluation-form", "fas fa-edit", "評価フォーム")}
              <hr class="border-secondary my-2">
              ${this.renderMenuItemForRoles(["admin"], "/settings", "fas fa-cog", "設定")}
              ${this.renderMenuItemForRoles(["developer"], "/developer", "fas fa-code", "開発者")}
            </nav>
          </div>
          <div class="sidebar-footer border-top border-secondary p-3">
            <div class="d-flex align-items-center justify-content-center">
              ${!this.isCollapsed ? `
                <div class="user-info small flex-grow-1">
                  <div>${this.sanitizeHtml(this.currentUser?.name || "ユーザー")}</div>
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
      this.highlightCurrentPage();
      this.updateToggleButton(sidebarWidth);
    } catch (error) {
      console.error("Error rendering sidebar:", error);
    }
  }
  
  updateToggleButton(sidebarWidth) {
      let toggleButton = document.querySelector('.sidebar-toggle');
      if (!toggleButton) {
          toggleButton = document.createElement('button');
          toggleButton.className = 'btn btn-dark sidebar-toggle';
          Object.assign(toggleButton.style, {
              position: 'fixed', top: '58px', zIndex: '1031',
              width: '30px', height: '30px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #555', transition: 'left 0.3s ease-in-out'
          });
          document.body.appendChild(toggleButton);
      }
      toggleButton.style.left = `calc(${sidebarWidth} - 15px)`;
      toggleButton.innerHTML = `<i class="fas fa-angle-${this.isCollapsed ? 'right' : 'left'}"></i>`;
      toggleButton.onclick = () => this.toggleCollapse();
  }

  renderMenuItemForRoles(roles, path, icon, label) {
    if (this.currentUser && roles.includes(this.currentUser.role)) {
      return this.renderMenuItem(path, icon, label);
    }
    return '';
  }

  renderMenuItem(path, icon, label) {
    const isActive = window.location.pathname.startsWith(path);
    const activeClass = isActive ? "active" : "";
    return `
      <a href="#" class="nav-link text-white p-2 mb-1 rounded ${activeClass}" onclick="window.app.navigate('${path}')" title="${label}">
        <div class="d-flex align-items-center ${this.isCollapsed ? 'justify-content-center' : ''}">
          <i class="${icon} ${this.isCollapsed ? '' : 'me-2'}" style="width: 20px;"></i>
          ${!this.isCollapsed ? `<span>${label}</span>` : ''}
        </div>
      </a>`;
  }
  
  highlightCurrentPage() {
    const currentPath = window.location.pathname;
    document.querySelectorAll(".sidebar .nav-link").forEach(link => {
      const path = link.getAttribute("onclick").match(/'([^']+)'/)[1];
      if (currentPath === path) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  getRoleDisplayName(role) {
    const roleNames = {
      admin: "管理者", evaluator: "評価者", worker: "作業員", developer: "開発者",
    };
    return roleNames[role] || "不明";
  }

  sanitizeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
}

window.SidebarComponent = new SidebarComponent();
window.sidebarComponent = window.SidebarComponent;
