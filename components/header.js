/**
 * Header Component - Complete Mobile Support Version
 * ヘッダーコンポーネント - モバイル完全対応版
 */

export class HeaderComponent {
  constructor(app) {
    this.app = app;
    this.isMobileMenuOpen = false;
  }

  render() {
    const user = this.app.currentUser;
    if (!user) return '';

    const userName = user.name || user.email || 'ユーザー';
    const userRole = user.role || 'user';
    const isAdmin = userRole === 'admin';
    const isDeveloper = userRole === 'developer';

    return `
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary px-3 position-relative">
        <div class="container-fluid">
          <!-- ハンバーガーメニューボタン（モバイル用） -->
          <button 
            class="navbar-toggler d-lg-none me-2" 
            type="button" 
            id="sidebarToggle" 
            aria-label="メニューを開く"
            aria-expanded="false"
            aria-controls="sidebar-container"
          >
            <span class="navbar-toggler-icon">
              <i class="fas fa-bars" aria-hidden="true"></i>
            </span>
          </button>
          
          <!-- システム名・ロゴ -->
          <a class="navbar-brand d-flex align-items-center" href="#/dashboard" data-link>
            <i class="fas fa-hard-hat me-2" aria-hidden="true"></i>
            <span class="d-none d-sm-inline" data-i18n="app.system_name">建設業評価管理システム</span>
            <span class="d-inline d-sm-none" data-i18n="app.title">評価システム</span>
          </a>
          
          <!-- 右側のユーザーメニュー -->
          <div class="navbar-nav ms-auto d-flex flex-row align-items-center">
            <!-- 言語選択ドロップダウン -->
            <div class="nav-item dropdown me-2">
              <button 
                class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center" 
                type="button"
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                aria-label="言語選択"
              >
                <i class="fas fa-globe me-1 d-none d-md-inline" aria-hidden="true"></i>
                <span class="d-none d-lg-inline" data-i18n="common.language">言語</span>
                <span class="d-lg-none">JA</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <button 
                    class="dropdown-item d-flex align-items-center" 
                    onclick="window.app.i18n.setLanguage('ja')"
                    type="button"
                  >
                    <span class="flag-icon flag-icon-jp me-2"></span>
                    日本語
                  </button>
                </li>
                <li>
                  <button 
                    class="dropdown-item d-flex align-items-center" 
                    onclick="window.app.i18n.setLanguage('en')"
                    type="button"
                  >
                    <span class="flag-icon flag-icon-us me-2"></span>
                    English
                  </button>
                </li>
                <li>
                  <button 
                    class="dropdown-item d-flex align-items-center" 
                    onclick="window.app.i18n.setLanguage('vi')"
                    type="button"
                  >
                    <span class="flag-icon flag-icon-vn me-2"></span>
                    Tiếng Việt
                  </button>
                </li>
              </ul>
            </div>
            
            <!-- ユーザーメニュードロップダウン -->
            <div class="nav-item dropdown">
              <button 
                class="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                type="button"
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                aria-label="ユーザーメニュー"
              >
                <i class="fas fa-user-circle me-1 d-none d-sm-inline" aria-hidden="true"></i>
                <span class="d-none d-md-inline me-1">${this.truncateText(userName, 15)}</span>
                <span class="d-md-none">${this.getInitials(userName)}</span>
                ${isAdmin ? '<span class="badge bg-warning text-dark ms-1 d-none d-lg-inline">管理者</span>' : ''}
                ${isDeveloper ? '<span class="badge bg-info text-dark ms-1 d-none d-lg-inline">開発者</span>' : ''}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><h6 class="dropdown-header text-truncate">${user.email || ''}</h6></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item d-flex align-items-center" href="#/profile" data-link>
                    <i class="fas fa-user me-2" aria-hidden="true"></i>
                    <span data-i18n="user.profile">プロフィール</span>
                  </a>
                </li>
                ${isAdmin ? `
                <li>
                  <a class="dropdown-item d-flex align-items-center" href="#/settings" data-link>
                    <i class="fas fa-cog me-2" aria-hidden="true"></i>
                    <span data-i18n="nav.settings">設定</span>
                  </a>
                </li>
                ` : ''}
                <li>
                  <a class="dropdown-item d-flex align-items-center" href="#/help" data-link>
                    <i class="fas fa-question-circle me-2" aria-hidden="true"></i>
                    <span data-i18n="nav.help">ヘルプ</span>
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button 
                    class="dropdown-item d-flex align-items-center text-danger" 
                    onclick="window.app.logout()"
                    type="button"
                  >
                    <i class="fas fa-sign-out-alt me-2" aria-hidden="true"></i>
                    <span data-i18n="auth.logout">ログアウト</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      
      <!-- サイドバーバックドロップ（モバイル用） -->
      <div 
        id="sidebar-backdrop" 
        class="sidebar-backdrop" 
        role="button" 
        aria-label="メニューを閉じる"
        tabindex="0"
      ></div>
    `;
  }

  /**
   * ヘッダーコンポーネントの初期化
   */
  init() {
    // モバイルメニューの設定
    this.setupMobileMenu();
    
    // キーボードナビゲーションの設定
    this.setupKeyboardNavigation();
    
    // 翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
    
    console.log("Header: Initialized with mobile support");
  }

 /**
 * モバイルメニューの設定（修正版）
 */
setupMobileMenu() {
  console.log("Header: Setting up mobile menu...");
  
  // CSS スタイルを追加
  this.addMobileStyles();
  
  // DOM要素の取得を安全に行う
  const findElements = () => {
    const hamburgerBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar-container') || document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    console.log("Header: Elements found:", {
      hamburgerBtn: !!hamburgerBtn,
      sidebar: !!sidebar, 
      backdrop: !!backdrop
    });
    
    return { hamburgerBtn, sidebar, backdrop };
  };

  // 要素が見つからない場合は少し待って再試行
  const setupWithRetry = (retryCount = 0) => {
    if (retryCount > 10) {
      console.error("Header: Failed to find required elements after multiple attempts");
      return;
    }

    const { hamburgerBtn, sidebar, backdrop } = findElements();

    if (!hamburgerBtn || !sidebar) {
      console.warn(`Header: Required elements not found, retrying... (${retryCount + 1}/10)`);
      setTimeout(() => setupWithRetry(retryCount + 1), 100);
      return;
    }

    // ハンバーガーボタンのクリックイベント
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Header: Hamburger button clicked");
      this.toggleMobileMenu();
    });

    // バックドロップのクリック・キーボードイベント
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        console.log("Header: Backdrop clicked");
        this.closeMobileMenu();
      });
      
      backdrop.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.closeMobileMenu();
        }
      });
    }

    // グローバルイベント設定
    this.setupGlobalEvents();
    
    console.log("Header: Mobile menu events configured successfully");
  };

  // 初回セットアップ開始
  setupWithRetry();
}

  /**
   * キーボードナビゲーションの設定
   */
  setupKeyboardNavigation() {
    // Tab順序の管理
    const focusableElements = document.querySelectorAll(
      '.navbar button, .navbar a, .dropdown-item'
    );
    
    focusableElements.forEach((element, index) => {
      element.setAttribute('tabindex', index === 0 ? '0' : '0');
    });
  }

  /**
   * モバイルメニューの開閉切り替え
   */
  toggleMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * モバイルメニューを開く
   */
  openMobileMenu() {
    const sidebar = document.getElementById('sidebar-container') || document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburgerBtn = document.getElementById('sidebarToggle');
    
    if (!sidebar) return;

    sidebar.classList.add('show');
    backdrop?.classList.add('show');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    
    document.body.style.overflow = 'hidden';
    document.body.classList.add('mobile-menu-open');
    
    this.isMobileMenuOpen = true;

    // フォーカス管理
    const firstFocusableElement = sidebar.querySelector('a, button');
    if (firstFocusableElement) {
      setTimeout(() => firstFocusableElement.focus(), 100);
    }
    
    console.log("Header: Mobile menu opened");
  }

  /**
   * モバイルメニューを閉じる
   */
  closeMobileMenu() {
    const sidebar = document.getElementById('sidebar-container') || document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburgerBtn = document.getElementById('sidebarToggle');
    
    if (!sidebar) return;

    sidebar.classList.remove('show');
    backdrop?.classList.remove('show');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-open');
    
    this.isMobileMenuOpen = false;
    
    // フォーカスをハンバーガーボタンに戻す
    if (hamburgerBtn) {
      hamburgerBtn.focus();
    }
    
    console.log("Header: Mobile menu closed");
  }

  /**
   * モバイル用CSSスタイルの追加
   */
  addMobileStyles() {
    // 既存のスタイルがあれば削除
    const existingStyle = document.getElementById('header-mobile-style');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'header-mobile-style';
    style.textContent = `
      /* モバイルハンバーガーメニュー用CSS */
      .sidebar-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1040;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        cursor: pointer;
      }
      
      .sidebar-backdrop.show {
        display: block;
        opacity: 1;
      }
      
      .sidebar-backdrop:focus {
        outline: 2px solid #007bff;
        outline-offset: -2px;
      }
      
      /* ハンバーガーボタンのスタイル */
      .navbar-toggler {
        border: none !important;
        background: transparent !important;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        transition: all 0.2s ease;
      }
      
      .navbar-toggler:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }
      
      .navbar-toggler:focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25) !important;
        outline: none;
      }
      
      .navbar-toggler-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5em;
        height: 1.5em;
        color: white;
      }
      
      .navbar-toggler-icon i {
        font-size: 1.2rem;
        transition: transform 0.2s ease;
      }
      
      .navbar-toggler[aria-expanded="true"] .navbar-toggler-icon i {
        transform: rotate(90deg);
      }
      
      /* モバイル表示時のサイドバー */
      @media (max-width: 991.98px) {
        #sidebar-container {
          position: fixed !important;
          top: 0;
          left: -100%;
          width: 280px;
          height: 100vh;
          z-index: 1050;
          transition: left 0.3s ease-in-out;
          background: #343a40;
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          border-right: 1px solid #495057;
        }
        
        #sidebar-container.show {
          left: 0;
        }
        
        /* コンテンツエリアの調整 */
        .content {
          margin-left: 0 !important;
          width: 100% !important;
          transition: none;
        }
        
        /* モバイルメニュー開時のボディ */
        body.mobile-menu-open {
          overflow: hidden;
          position: relative;
        }
        
        /* ナビバーの調整 */
        .navbar-brand {
          font-size: 1rem;
        }
        
        .navbar-brand .d-none.d-sm-inline {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      
      /* タブレット表示 */
      @media (min-width: 768px) and (max-width: 991.98px) {
        .navbar-brand span {
          font-size: 0.9rem;
        }
        
        #sidebar-container {
          width: 320px;
        }
      }
      
      /* デスクトップ表示 */
      @media (min-width: 992px) {
        .navbar-toggler {
          display: none !important;
        }
        
        #sidebar-backdrop {
          display: none !important;
        }
        
        #sidebar-container {
          position: relative !important;
          left: auto !important;
          width: auto !important;
          height: auto !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
      }
      
      /* ドロップダウンメニューの改善 */
      .dropdown-menu {
        border: none;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        border-radius: 0.5rem;
        padding: 0.5rem 0;
        min-width: 200px;
      }
      
      .dropdown-item {
        padding: 0.5rem 1rem;
        transition: all 0.2s ease;
        border-radius: 0;
      }
      
      .dropdown-item:hover,
      .dropdown-item:focus {
        background-color: #f8f9fa;
        transform: translateX(2px);
      }
      
      .dropdown-header {
        font-weight: 600;
        color: #6c757d;
        padding: 0.5rem 1rem 0.25rem;
      }
      
      /* アクセシビリティの改善 */
      .btn:focus,
      .dropdown-item:focus,
      .navbar-toggler:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }
      
      /* ユーザー名の表示調整 */
      @media (max-width: 576px) {
        .navbar-nav .dropdown-toggle {
          font-size: 0.875rem;
          padding: 0.375rem 0.75rem;
        }
        
        .badge {
          font-size: 0.75rem;
        }
      }
    `;
    
    document.head.appendChild(style);
    console.log("Header: Mobile styles added");
  }

  /**
   * テキストを指定した長さで切り詰める
   */
  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * 名前からイニシャルを取得
   */
  getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * ヘッダーの更新
   */
  update() {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      // 現在のメニュー状態を保存
      const wasMenuOpen = this.isMobileMenuOpen;
      
      // ヘッダーを再レンダリング
      headerContainer.innerHTML = this.render();
      
      // 初期化
      this.init();
      
      // メニュー状態を復元（必要に応じて）
      if (wasMenuOpen && window.innerWidth < 992) {
        setTimeout(() => this.openMobileMenu(), 100);
      }
      
      console.log("Header: Updated");
    }
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    // メニューを閉じる
    this.closeMobileMenu();
    
    // スタイルを削除
    const style = document.getElementById('header-mobile-style');
    if (style) {
      style.remove();
    }
    
    console.log("Header: Cleaned up");
  }
}
