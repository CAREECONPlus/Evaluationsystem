/**
 * Sidebar Component
 * サイドバーコンポーネント
 */
class SidebarComponent {
  constructor() {
    this.isVisible = false;
    this.currentUser = null; // App.jsから受け取る currentUser を保持 (冗長だが互換性のため残す)
    this.isCollapsed = false;
    this.app = null; // Appインスタンスへの参照
  }

  /**
   * Show sidebar
   * サイドバーを表示
   */
  show() { // user引数は削除しました。Appクラスから設定されるthis.app.currentUser を直接参照します。
    try {
      // appインスタンスとi18nが設定されていることを確実に確認
      if (!this.app || !this.app.i18n) {
        console.error("SidebarComponent: app instance or i18n is not set. Cannot show sidebar.");
        this.hide(); // 必須の依存関係がない場合は非表示にする
        return;
      }
      this.currentUser = this.app.currentUser; // Appインスタンスから最新のユーザー情報を取得

      console.log("Showing sidebar for user:", this.currentUser?.name);
      this.render();
      this.isVisible = true;
    } catch (error) {
      console.error("Error showing sidebar:", error);
    }
  }

  /**
   * Hide sidebar
   * サイドバーを非表示
   */
  hide() {
    try {
      console.log("Sidebar hidden");
      this.isVisible = false;
      const sidebarContainer = document.getElementById("sidebar-container");
      if (sidebarContainer) {
        sidebarContainer.innerHTML = ""; // コンテンツをクリア
        sidebarContainer.style.display = "none"; // 非表示にする
      }

      // メインコンテンツのマージンをリセットするクラスを追加
      const mainContent = document.getElementById("content");
      if (mainContent) {
        mainContent.classList.add("sidebar-hidden");
      }

      const existingToggle = document.querySelector('.sidebar-toggle');
      if (existingToggle) existingToggle.remove(); // トグルボタンも削除

    } catch (error) {
      console.error("Error hiding sidebar:", error);
    }
  }

  /**
   * Update sidebar
   * サイドバーを更新
   */
  update() { // user引数は削除しました。Appクラスから設定されるthis.app.currentUser を直接参照します。
    // appインスタンスとi18nが設定されていない場合は更新しない
    if (!this.app || !this.app.i18n) {
      console.warn("SidebarComponent: app instance or i18n not set during update. Skipping render.");
      return;
    }
    this.currentUser = this.app.currentUser; // Appインスタンスから最新のユーザー情報を取得
    if (this.isVisible) {
      this.render();
    }
  }

  /**
   * Toggle sidebar collapse
   * サイドバーの折りたたみを切り替え
   */
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.render();
  }

  /**
   * Render sidebar
   * サイドバーを描画
   */
  render() {
    try {
      // appインスタンス、currentUser、i18nが全て存在することを確実にチェック
      if (!this.app || !this.app.currentUser || !this.app.i18n) {
        console.log("SidebarComponent: App, current user, or i18n not available, hiding sidebar.");
        this.hide(); // ユーザー情報がない場合は非表示にする
        return;
      }

      let sidebarContainer = document.getElementById("sidebar-container");
      if (!sidebarContainer) {
        // コンテナが存在しない場合は作成し、DOMに追加
        sidebarContainer = document.createElement("div");
        sidebarContainer.id = "sidebar-container";
        sidebarContainer.className = "sidebar-container";
        const headerContainer = document.getElementById("header-container");
        if (headerContainer) {
          headerContainer.insertAdjacentElement("afterend", sidebarContainer);
        } else {
          document.body.insertBefore(sidebarContainer, document.body.firstChild);
        }
      }

      sidebarContainer.style.display = "block"; // コンテナを表示する

      const sidebarWidth = this.isCollapsed ? "80px" : "250px";
      const userRole = this.app.currentUser.role; // app.currentUserからロールを取得

      sidebarContainer.innerHTML = `
        <div class="sidebar bg-dark text-white d-flex flex-column" style="width: ${sidebarWidth}; transition: width 0.3s ease;">
          <div class="sidebar-content">
            <nav class="nav flex-column p-2">
              ${this.renderMenuItem("/dashboard", "fas fa-tachometer-alt", "dashboard")}
              
              ${userRole === "admin" ? this.renderMenuItem("/users", "fas fa-users", "users") : ""}
              ${this.renderMenuItem("/evaluations", "fas fa-clipboard-list", "evaluations")}
              ${userRole === "admin" ? this.renderMenuItem("/goal-approvals", "fas fa-check-circle", "goal_approvals") : ""}
              
              <hr class="border-secondary my-2">
              
              ${this.renderMenuItem("/goal-setting", "fas fa-bullseye", "goals")}
              ${this.renderMenuItem("/evaluation-form", "fas fa-edit", "evaluation")}

              <hr class="border-secondary my-2">

              ${userRole === "admin" || userRole === "developer" ? this.renderMenuItem("/settings", "fas fa-cog", "settings") : ""}
              ${userRole === "developer" ? this.renderMenuItem("/developer", "fas fa-code", "developer") : ""}
            </nav>
          </div>

          <div class="sidebar-footer border-top border-secondary p-3">
            <div class="d-flex align-items-center justify-content-center">
              ${!this.isCollapsed ? `
                <div class="user-info small flex-grow-1">
                  <div>${this.sanitizeHtml(this.app.currentUser.name || this.app.i18n.t("common.user"))}</div>
                  <div class="text-white-50">${this.getRoleDisplayName(userRole)}</div>
                </div>
              ` : ''}
              <button class="btn btn-sm btn-outline-light" onclick="window.app.logout()" title="${this.app.i18n.t('nav.logout')}">
                <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // メインコンテンツのマージンを調整し、sidebar-hiddenクラスを削除
      const mainContent = document.getElementById("content");
      if (mainContent) {
        mainContent.style.marginLeft = sidebarWidth;
        mainContent.classList.remove("sidebar-hidden"); // サイドバーが表示される場合は非表示クラスを削除
        mainContent.style.transition = 'margin-left 0.3s ease';
      }

      this.highlightCurrentPage();
      this.updateToggleButton(sidebarWidth);

      // 翻訳を適用
      this.app.i18n.updateUI(sidebarContainer);

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
              position: 'fixed',
              top: '60px',
              zIndex: '1031',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #555',
              transition: 'left 0.3s ease'
          });
          document.body.appendChild(toggleButton);
      }
      
      toggleButton.style.left = `calc(${sidebarWidth} - 15px)`;
      toggleButton.innerHTML = `<i class="fas fa-angle-${this.isCollapsed ? 'right' : 'left'}"></i>`;
      toggleButton.onclick = () => this.toggleCollapse();
  }

  renderMenuItem(path, icon, translationKey) {
    // this.app.i18n が確実に存在することを確認し、存在しない場合はフォールバック
    const translatedText = this.app?.i18n?.t('nav.' + translationKey) || translationKey;
    const translatedTitle = this.app?.i18n?.t('nav.' + translationKey) || translationKey; // title属性用

    return `
      <a href="#" class="nav-link text-white p-2 mb-1 rounded" onclick="event.preventDefault(); window.app.navigate('${path}')" data-path="${path}">
        <div class="d-flex align-items-center ${this.isCollapsed ? 'justify-content-center' : ''}">
          <i class="${icon} ${this.isCollapsed ? '' : 'me-2'}" style="width: 20px;" title="${this.sanitizeHtml(translatedTitle)}"></i>
          ${!this.isCollapsed ? `<span data-i18n="nav.${translationKey}">${this.sanitizeHtml(translatedText)}</span>` : ''}
        </div>
      </a>
    `;
  }

  highlightCurrentPage() {
    // this.app.router が確実に存在することを確認
    if (!this.app || !this.app.router) {
      console.warn("SidebarComponent: app.router not available for highlighting current page.");
      return;
    }
    const currentPath = window.location.pathname.replace(this.app.router.basePath, '') || '/';
    document.querySelectorAll(".sidebar .nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-path") === currentPath) {
        link.classList.add("active");
      }
    });
  }

  getRoleDisplayName(role) {
    if (this.app?.i18n) {
      return this.app.i18n.t('roles.' + role);
    }
    const roleNames = { admin: "管理者", evaluator: "評価者", worker: "作業員", developer: "開発者" };
    return roleNames[role] || role || "不明";
  }

  sanitizeHtml(str) {
    if (!str) return "";
    // this.app.sanitizeHtml が存在することを確認
    if (this.app?.sanitizeHtml) {
        return this.app.sanitizeHtml(str);
    }
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

// グローバルインスタンスの作成
window.SidebarComponent = new SidebarComponent();
