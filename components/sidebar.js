/**
 * Sidebar Component
 * サイドバーコンポーネント
 */
class SidebarComponent {
  constructor() {
    this.isVisible = false
    this.currentUser = null
    this.isCollapsed = false
  }

  /**
   * Show sidebar
   * サイドバーを表示
   */
  show(user) {
    try {
      console.log("Showing sidebar for user:", user?.name)
      this.currentUser = user
      this.render()
      this.isVisible = true
    } catch (error) {
      console.error("Error showing sidebar:", error)
    }
  }

  /**
   * Hide sidebar
   * サイドバーを非表示
   */
  hide() {
    try {
      console.log("Sidebar hidden")
      this.isVisible = false
      const sidebarContainer = document.getElementById("sidebar-container")
      if (sidebarContainer) {
        sidebarContainer.innerHTML = ""
        sidebarContainer.style.display = "none"
      }

      // Reset main content margin
      const mainContent = document.getElementById("content")
      if (mainContent) {
        mainContent.style.marginLeft = "0"
      }
    } catch (error) {
      console.error("Error hiding sidebar:", error)
    }
  }

  /**
   * Update sidebar
   * サイドバーを更新
   */
  update(user) {
    this.currentUser = user
    if (this.isVisible) {
      this.render()
    }
  }

  /**
   * Toggle sidebar collapse
   * サイドバーの折りたたみを切り替え
   */
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed
    this.render()
  }

  /**
   * Render sidebar
   * サイドバーを描画
   */
  render() {
    try {
      let sidebarContainer = document.getElementById("sidebar-container")

      if (!sidebarContainer) {
        // Create sidebar container if it doesn't exist
        sidebarContainer = document.createElement("div")
        sidebarContainer.id = "sidebar-container"
        sidebarContainer.className = "sidebar-container"

        // Insert after header
        const headerContainer = document.getElementById("header-container")
        if (headerContainer) {
          headerContainer.insertAdjacentElement("afterend", sidebarContainer)
        } else {
          document.body.insertBefore(sidebarContainer, document.body.firstChild)
        }
      }

      sidebarContainer.style.display = "block"

      const sidebarWidth = this.isCollapsed ? "60px" : "250px"

      sidebarContainer.innerHTML = `
        <div class="sidebar bg-dark text-white" style="width: ${sidebarWidth}; transition: width 0.3s ease;">
          <div class="sidebar-header p-3 border-bottom border-secondary">
            <div class="d-flex align-items-center justify-content-between">
              ${
                !this.isCollapsed
                  ? `
                <div class="sidebar-brand">
                  <i class="fas fa-hard-hat me-2"></i>
                  <span class="fw-bold">評価システム</span>
                </div>
              `
                  : `
                <div class="sidebar-brand text-center w-100">
                  <i class="fas fa-hard-hat"></i>
                </div>
              `
              }
              <button class="btn btn-sm btn-outline-light d-none d-lg-block" onclick="window.sidebarComponent.toggleCollapse()">
                <i class="fas fa-${this.isCollapsed ? "angle-right" : "angle-left"}"></i>
              </button>
            </div>
          </div>

          <div class="sidebar-content">
            <nav class="nav flex-column p-2">
              ${this.renderMenuItem("/dashboard", "fas fa-tachometer-alt", "ダッシュボード")}
              
              ${
                this.currentUser?.role === "admin"
                  ? `
                ${this.renderMenuItem("/users", "fas fa-users", "ユーザー管理")}
              `
                  : ""
              }
              
              ${this.renderMenuItem("/evaluations", "fas fa-clipboard-list", "評価管理")}
              ${this.renderMenuItem("/goal-setting", "fas fa-bullseye", "目標設定")}
              
              ${
                this.currentUser?.role !== "employee"
                  ? `
                ${this.renderMenuItem("/goal-approvals", "fas fa-check-circle", "目標承認")}
              `
                  : ""
              }
              
              ${this.renderMenuItem("/evaluation-form", "fas fa-edit", "評価フォーム")}
              
              <hr class="border-secondary my-3">
              
              ${this.renderMenuItem("/settings", "fas fa-cog", "設定")}
              
              ${
                this.currentUser?.role === "admin"
                  ? `
                ${this.renderMenuItem("/developer", "fas fa-code", "開発者")}
              `
                  : ""
              }
            </nav>
          </div>

          <!-- User info at bottom -->
          <div class="sidebar-footer border-top border-secondary p-3 mt-auto">
            ${
              !this.isCollapsed
                ? `
              <div class="user-info">
                <div class="d-flex align-items-center">
                  <div class="user-avatar me-2">
                    <i class="fas fa-user-circle fa-2x"></i>
                  </div>
                  <div class="user-details flex-grow-1">
                    <div class="user-name fw-bold small">${this.sanitizeHtml(this.currentUser?.name || "ユーザー")}</div>
                    <div class="user-role text-muted small">${this.getRoleDisplayName(this.currentUser?.role)}</div>
                  </div>
                </div>
                <div class="user-actions mt-2">
                  <button class="btn btn-outline-light btn-sm w-100" onclick="window.app.logout()">
                    <i class="fas fa-sign-out-alt me-1"></i>
                    ログアウト
                  </button>
                </div>
              </div>
            `
                : `
              <div class="text-center">
                <button class="btn btn-outline-light btn-sm" onclick="window.app.logout()" title="ログアウト">
                  <i class="fas fa-sign-out-alt"></i>
                </button>
              </div>
            `
            }
          </div>
        </div>
      `

      // Adjust main content margin
      const mainContent = document.getElementById("content")
      if (mainContent) {
        mainContent.style.marginLeft = sidebarWidth
        mainContent.style.transition = "margin-left 0.3s ease"
      }

      // Highlight current page
      this.highlightCurrentPage()

      console.log("Sidebar rendered successfully")
    } catch (error) {
      console.error("Error rendering sidebar:", error)
    }
  }

  /**
   * Render menu item
   * メニューアイテムを描画
   */
  renderMenuItem(path, icon, label) {
    const isActive = window.location.pathname === path
    const activeClass = isActive ? "active bg-primary" : ""

    if (this.isCollapsed) {
      return `
        <a href="#" class="nav-link text-white p-2 mb-1 rounded ${activeClass}" 
           onclick="window.app.navigate('${path}')" 
           title="${label}">
          <div class="text-center">
            <i class="${icon}"></i>
          </div>
        </a>
      `
    } else {
      return `
        <a href="#" class="nav-link text-white p-2 mb-1 rounded ${activeClass}" 
           onclick="window.app.navigate('${path}')">
          <i class="${icon} me-2"></i>
          ${label}
        </a>
      `
    }
  }

  /**
   * Highlight current page
   * 現在のページをハイライト
   */
  highlightCurrentPage() {
    try {
      const currentPath = window.location.pathname
      const navLinks = document.querySelectorAll(".sidebar .nav-link")

      navLinks.forEach((link) => {
        link.classList.remove("active", "bg-primary")

        const onclick = link.getAttribute("onclick")
        if (onclick && onclick.includes(currentPath)) {
          link.classList.add("active", "bg-primary")
        }
      })
    } catch (error) {
      console.error("Error highlighting current page:", error)
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
window.SidebarComponent = new SidebarComponent()
window.sidebarComponent = window.SidebarComponent
