/**
 * Sidebar Component - Enhanced Mobile Support Version
 * サイドバーコンポーネント - 改善版モバイル完全対応
 * 
 * 🔧 修正点: render メソッドでのユーザー情報取得を強化
 */

export class SidebarComponent {
  constructor(app) {
    this.app = app;
    this.currentRoute = window.location.hash.slice(1) || '/dashboard';
  }

  render() {
    // 🔧 修正: ユーザー情報の取得を強化
    const user = this.app.currentUser || null;
    console.log("Sidebar: Rendering with user:", user);
    
    if (!user) {
      console.warn("Sidebar: No user found, rendering empty sidebar");
      return '<div class="sidebar h-100 d-flex align-items-center justify-content-center"><p class="text-white">Loading...</p></div>';
    }

    const userName = user.name || user.email || 'ユーザー';
    const userRole = user.role || 'user';
    const isAdmin = userRole === 'admin';
    const isDeveloper = userRole === 'developer';
    const isEvaluator = userRole === 'evaluator';

    console.log("Sidebar: User details:", { userName, userRole, isAdmin, isDeveloper, isEvaluator });

    return `
      <div class="sidebar h-100 d-flex flex-column" role="navigation" aria-label="メインナビゲーション">
        <!-- サイドバーヘッダー -->
        <div class="sidebar-header p-3 border-bottom border-light border-opacity-20">
          <div class="d-flex align-items-center">
            <div class="sidebar-user-info flex-grow-1">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  <i class="fas fa-user-circle fa-2x text-white" aria-hidden="true"></i>
                </div>
                <div class="user-details">
                  <div class="user-name text-white fw-semibold mb-1">${this.truncateText(userName, 20)}</div>
                  <div class="user-role">
                    <span class="badge ${this.getRoleBadgeClass(userRole)} small">${this.getRoleDisplayName(userRole)}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- モバイル用閉じるボタン -->
           <button 
            class="btn btn-link text-white p-1 d-lg-none sidebar-close-btn"
            id="sidebarCloseBtn"
            aria-label="メニューを閉じる"
            title="メニューを閉じる"
    >
           <i class="fas fa-times fa-lg" aria-hidden="true"></i>
         </button>
          </div>
        </div>

        <!-- ナビゲーションメニュー -->
        <nav class="sidebar-nav flex-grow-1 py-2" role="navigation" aria-label="メインメニュー">
          <ul class="nav nav-pills flex-column" role="menubar">
            
            <!-- ダッシュボード -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/dashboard') ? 'active' : ''}" 
                href="#/dashboard" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/dashboard') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-tachometer-alt nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.dashboard">ダッシュボード</span>
              </a>
            </li>

            ${isAdmin ? `
            <!-- ユーザー管理（管理者のみ） -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/users') ? 'active' : ''}" 
                href="#/users" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/users') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-users nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.users">ユーザー管理</span>
              </a>
            </li>

            <!-- 職種管理（管理者のみ） -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/job-types') ? 'active' : ''}" 
                href="#/job-types" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/job-types') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-briefcase nav-icon me-3" aria-hidden="true"></i>
                <span>職種管理</span>
              </a>
            </li>
            ` : ''}

            <!-- 評価一覧 -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/evaluations') ? 'active' : ''}" 
                href="#/evaluations" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/evaluations') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-clipboard-list nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.evaluations">評価一覧</span>
              </a>
            </li>

           ${isEvaluator || userRole === 'worker' ? `
<!-- 目標設定 -->
<li class="nav-item" role="none">
  <a 
    class="nav-link text-white d-flex align-items-center ${this.isActive('/goal-setting') ? 'active' : ''}" 
    href="#/goal-setting" 
    data-link
    role="menuitem"
    aria-current="${this.isActive('/goal-setting') ? 'page' : 'false'}"
    tabindex="0"
  >
    <i class="fas fa-bullseye nav-icon me-3" aria-hidden="true"></i>
    <span data-i18n="nav.goal_setting">目標設定</span>
  </a>
</li>

${userRole === 'worker' ? `
<!-- 自己評価入力（一般ユーザー用）-->
<li class="nav-item" role="none">
  <a 
    class="nav-link text-white d-flex align-items-center ${this.isActive('/self-evaluation') ? 'active' : ''}" 
    href="#/self-evaluation" 
    data-link
    role="menuitem"
    aria-current="${this.isActive('/self-evaluation') ? 'page' : 'false'}"
    tabindex="0"
  >
    <i class="fas fa-edit nav-icon me-3" aria-hidden="true"></i>
    <span>自己評価入力</span>
  </a>
</li>
` : ''}
` : ''}

            ${isEvaluator || userRole === 'worker' ? `
            <!-- 目標設定 -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/goal-setting') ? 'active' : ''}" 
                href="#/goal-setting" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/goal-setting') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-bullseye nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.goal_setting">目標設定</span>
              </a>
            </li>
            ` : ''}

            ${isAdmin ? `
            <!-- 目標承認（管理者のみ） -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/goal-approvals') ? 'active' : ''}" 
                href="#/goal-approvals" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/goal-approvals') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-check-circle nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.goal_approvals">目標承認</span>
              </a>
            </li>

            <!-- システム設定（管理者のみ） -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/settings') ? 'active' : ''}" 
                href="#/settings" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/settings') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-cog nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.settings">設定</span>
              </a>
            </li>
            ` : ''}

            ${isDeveloper ? `
            <!-- 開発者管理（開発者のみ） -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/developer') ? 'active' : ''}" 
                href="#/developer" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/developer') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-code nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.developer">開発者管理</span>
              </a>
            </li>
            ` : ''}

            <!-- 区切り線 -->
            <li class="nav-divider my-3" role="none">
              <hr class="border-light border-opacity-30 mx-3">
            </li>

            <!-- レポート -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/report') ? 'active' : ''}" 
                href="#/report" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/report') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-chart-bar nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.reports">レポート</span>
              </a>
            </li>

            <!-- ヘルプ -->
            <li class="nav-item" role="none">
              <a 
                class="nav-link text-white d-flex align-items-center ${this.isActive('/help') ? 'active' : ''}" 
                href="#/help" 
                data-link
                role="menuitem"
                aria-current="${this.isActive('/help') ? 'page' : 'false'}"
                tabindex="0"
              >
                <i class="fas fa-question-circle nav-icon me-3" aria-hidden="true"></i>
                <span data-i18n="nav.help">ヘルプ</span>
              </a>
            </li>

          </ul>
        </nav>

        <!-- サイドバーフッター -->
        <div class="sidebar-footer border-top border-light border-opacity-20 p-3 mt-auto">
          <div class="d-grid gap-2">
            <!-- プロフィール -->
            <a 
              class="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center" 
              href="#/profile" 
              data-link
              role="button"
              tabindex="0"
            >
              <i class="fas fa-user me-2" aria-hidden="true"></i>
              <span data-i18n="nav.profile">プロフィール</span>
            </a>
            
            <!-- ログアウト -->
            <button 
              class="btn btn-danger btn-sm d-flex align-items-center justify-content-center" 
              onclick="window.app.logout()"
              type="button"
              tabindex="0"
            >
              <i class="fas fa-sign-out-alt me-2" aria-hidden="true"></i>
              <span data-i18n="auth.logout">ログアウト</span>
            </button>
          </div>
          
          <!-- バージョン情報 -->
          <div class="text-center mt-3">
            <small class="text-white-50">
              <span data-i18n="app.version">バージョン</span> 1.2.0
            </small>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * サイドバーコンポーネントの初期化
   */
 init() {
  console.log("Sidebar: Starting initialization...");
  
  try {
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // ルート変更の監視
    this.setupRouteListener();
    
    // アクセシビリティの設定
    this.setupAccessibility();
    
    // キーボードナビゲーションの設定
    this.setupKeyboardNavigation();

    // フォーカス管理の設定
    this.setupFocusManagement();
    
    // 翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
    
    console.log("Sidebar: Initialized with enhanced mobile support and accessibility");
  } catch (error) {
    console.error("Sidebar: Initialization error:", error);
  }
}

/**
 * イベントリスナーの設定
 */
// components/sidebar.js の setupEventListeners メソッドを以下に修正

setupEventListeners() {
  // 閉じるボタンのイベントリスナー
  const closeBtn = document.getElementById('sidebarCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });
  }

  // サイドバーのログアウトボタン - 修正版
  const sidebarLogoutBtn = document.querySelector('.sidebar .btn-danger');
  if (sidebarLogoutBtn) {
    // onclick属性を削除
    sidebarLogoutBtn.removeAttribute('onclick');
    
    sidebarLogoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        console.log('Sidebar: Logout button clicked');
        
        const confirmMessage = window.i18n ? 
          window.i18n.t('auth.confirm_logout') : 
          'ログアウトしてもよろしいですか？';
        
        const confirmed = await this.app.confirm(
          confirmMessage,
          window.i18n ? window.i18n.t('auth.logout') : 'ログアウト確認'
        );
        
        if (confirmed) {
          console.log('Sidebar: User confirmed logout');
          
          // ログアウト処理を実行
          if (this.app.auth && typeof this.app.auth.logout === 'function') {
            await this.app.auth.logout();
            console.log('Sidebar: Auth logout completed');
          } else {
            console.error('Sidebar: Auth.logout method not found');
            throw new Error('認証システムが利用できません');
          }
          
          // ナビゲーションを実行
          if (typeof this.app.navigate === 'function') {
            this.app.navigate('#/login');
            console.log('Sidebar: Navigated to login page');
          } else {
            window.location.hash = '#/login';
          }
        }
      } catch (error) {
        console.error('Sidebar: Error during logout:', error);
        const errorMessage = window.i18n ? 
          window.i18n.t('errors.logout_failed') : 
          'ログアウト中にエラーが発生しました';
        this.app.showError(errorMessage);
      }
    });
  }
}

  /**
   * ルート変更の監視
   */
  setupRouteListener() {
    // ハッシュ変更を監視してアクティブ状態を更新
    window.addEventListener('hashchange', () => {
      this.updateActiveStates();
    });
    
    // 初期状態の設定
    this.updateActiveStates();
  }

  /**
   * アクティブ状態の更新
   */
  updateActiveStates() {
    const currentPath = window.location.hash.slice(1) || '/dashboard';
    this.currentRoute = currentPath;
    
    // すべてのナビリンクからactiveクラスを削除
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      link.setAttribute('aria-current', 'false');
    });
    
    // 現在のパスに対応するリンクにactiveクラスを追加
    const activeLink = document.querySelector(`.sidebar a[href="#${currentPath}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }

    console.log(`Sidebar: Updated active state for route ${currentPath}`);
  }

  /**
   * アクセシビリティの設定
   */
  setupAccessibility() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.setAttribute('role', 'navigation');
      sidebar.setAttribute('aria-label', 'メインナビゲーション');
    }
    
    // ナビゲーションリンクの詳細なアクセシビリティ設定
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach((link, index) => {
      link.setAttribute('role', 'menuitem');
      
      // タブ順序の設定
      if (index === 0) {
        link.setAttribute('tabindex', '0');
      } else {
        link.setAttribute('tabindex', '-1');
      }
    });

    console.log("Sidebar: Accessibility features configured");
  }

  /**
   * フォーカス管理の設定
   */
  setupFocusManagement() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    let currentFocusIndex = 0;
    const getFocusableElements = () => {
      return sidebar.querySelectorAll('.nav-link, .btn');
    };

    // フォーカスの初期化
    const initFocus = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements.forEach((el, index) => {
          el.setAttribute('tabindex', index === currentFocusIndex ? '0' : '-1');
        });
      }
    };

    // フォーカスの移動
    const moveFocus = (direction) => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      focusableElements[currentFocusIndex].setAttribute('tabindex', '-1');
      
      if (direction === 'next') {
        currentFocusIndex = (currentFocusIndex + 1) % focusableElements.length;
      } else if (direction === 'prev') {
        currentFocusIndex = (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
      } else if (direction === 'first') {
        currentFocusIndex = 0;
      } else if (direction === 'last') {
        currentFocusIndex = focusableElements.length - 1;
      }

      focusableElements[currentFocusIndex].setAttribute('tabindex', '0');
      focusableElements[currentFocusIndex].focus();
    };

    initFocus();
    console.log("Sidebar: Focus management configured");
  }

  /**
   * キーボードナビゲーションの設定
   */
  setupKeyboardNavigation() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // キーボードイベントの処理
    sidebar.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.moveFocus('next');
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          this.moveFocus('prev');
          break;
          
        case 'Home':
          e.preventDefault();
          this.moveFocus('first');
          break;
          
        case 'End':
          e.preventDefault();
          this.moveFocus('last');
          break;

        case 'Tab':
          // タブキーの処理は既定の動作を使用
          break;

        case 'Enter':
        case ' ':
          // エンターキーとスペースキーでリンクをアクティブ化
          if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            e.target.click();
          }
          break;
      }
    });

    console.log("Sidebar: Keyboard navigation configured");
  }

  /**
   * フォーカスの移動（ヘルパー関数）
   */
  moveFocus(direction) {
    const focusableElements = document.querySelectorAll('.sidebar .nav-link, .sidebar .btn');
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
    
    let newIndex;
    switch (direction) {
      case 'next':
        newIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'prev':
        newIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = focusableElements.length - 1;
        break;
      default:
        return;
    }

    // すべての要素のtabindexを-1に設定
    focusableElements.forEach(el => el.setAttribute('tabindex', '-1'));
    
    // 新しい要素にフォーカスを設定
    focusableElements[newIndex].setAttribute('tabindex', '0');
    focusableElements[newIndex].focus();
  }

  /**
   * 現在のパスがアクティブかチェック
   */
  isActive(path) {
    const currentPath = window.location.hash.slice(1) || '/dashboard';
    return currentPath === path || currentPath.startsWith(path + '/');
  }

  /**
   * テキストを指定した長さで切り詰める
   */
  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * 役割表示名を取得
   */
  getRoleDisplayName(role) {
    const roleNames = {
      admin: '管理者',
      developer: '開発者', 
      evaluator: '評価者',
      worker: '作業員',
      user: 'ユーザー'
    };
    return roleNames[role] || 'ユーザー';
  }

  /**
   * 役割バッジのCSSクラスを取得
   */
  getRoleBadgeClass(role) {
    const badgeClasses = {
      admin: 'bg-danger',
      developer: 'bg-info', 
      evaluator: 'bg-warning',
      worker: 'bg-secondary',
      user: 'bg-light text-dark'
    };
    return badgeClasses[role] || 'bg-light text-dark';
  }

  /**
   * サイドバーの更新
   */
  update() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
      // 現在のフォーカス状態を保存
      const activeElement = document.activeElement;
      const wasInSidebar = sidebarContainer.contains(activeElement);
      
      sidebarContainer.innerHTML = this.render();
      this.init();
      
      // フォーカスを復元
      if (wasInSidebar) {
        const firstFocusableElement = sidebarContainer.querySelector('.nav-link, .btn');
        if (firstFocusableElement) {
          firstFocusableElement.focus();
        }
      }
      
      console.log("Sidebar: Updated with focus restoration");
    }
  }

  /**
   * モバイルメニューを閉じる
   */
  closeMobileMenu() {
    const sidebar = document.getElementById('sidebar-container');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (sidebar) {
      sidebar.classList.remove('show');
    }
    
    if (backdrop) {
      backdrop.classList.remove('show');
    }
    
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-open');

    console.log("Sidebar: Mobile menu closed");
  }

  /**
   * サイドバーの表示/非表示を切り替え
   */
  toggle() {
    try {
      const sidebarContainer = document.getElementById('sidebar-container');
      const backdrop = document.getElementById('sidebar-backdrop') || this.createBackdrop();
      
      if (sidebarContainer) {
        const isVisible = sidebarContainer.classList.contains('show');
        
        if (isVisible) {
          // 非表示にする
          sidebarContainer.classList.remove('show');
          backdrop.classList.remove('show');
          document.body.style.overflow = '';
          document.body.classList.remove('mobile-menu-open');
          console.log('Sidebar: Hidden');
        } else {
          // 表示する
          sidebarContainer.classList.add('show');
          backdrop.classList.add('show');
          document.body.style.overflow = 'hidden';
          document.body.classList.add('mobile-menu-open');
          console.log('Sidebar: Shown');
        }
      } else {
        console.warn('Sidebar: Container not found for toggle');
      }
    } catch (error) {
      console.error('Sidebar: Error toggling sidebar:', error);
    }
  }

  /**
   * サイドバーを表示
   */
  show() {
    try {
      const sidebarContainer = document.getElementById('sidebar-container');
      const backdrop = document.getElementById('sidebar-backdrop') || this.createBackdrop();
      
      if (sidebarContainer) {
        sidebarContainer.classList.add('show');
        backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('mobile-menu-open');
      }
    } catch (error) {
      console.error('Sidebar: Error showing sidebar:', error);
    }
  }

  /**
   * サイドバーを非表示
   */
  hide() {
    try {
      const sidebarContainer = document.getElementById('sidebar-container');
      const backdrop = document.getElementById('sidebar-backdrop');
      
      if (sidebarContainer) {
        sidebarContainer.classList.remove('show');
        if (backdrop) {
          backdrop.classList.remove('show');
        }
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-menu-open');
      }
    } catch (error) {
      console.error('Sidebar: Error hiding sidebar:', error);
    }
  }

  /**
   * モバイル用背景を作成
   */
  createBackdrop() {
    try {
      let backdrop = document.getElementById('sidebar-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebar-backdrop';
        backdrop.className = 'sidebar-backdrop';
        backdrop.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        `;
        
        // クリックで閉じる
        backdrop.addEventListener('click', () => this.hide());
        
        document.body.appendChild(backdrop);
      }
      
      // show クラス用のスタイルを追加
      const style = document.createElement('style');
      style.textContent = `
        .sidebar-backdrop.show {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `;
      
      if (!document.querySelector('style[data-sidebar-backdrop]')) {
        style.setAttribute('data-sidebar-backdrop', '');
        document.head.appendChild(style);
      }
      
      return backdrop;
    } catch (error) {
      console.error('Sidebar: Error creating backdrop:', error);
      return null;
    }
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    // イベントリスナーの削除
    window.removeEventListener('hashchange', this.updateActiveStates);
    
    console.log("Sidebar: Cleaned up");
  }
}
