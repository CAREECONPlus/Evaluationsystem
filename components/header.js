/**
 * Header Component - ハンバーガーメニュー対応版
 * ヘッダーコンポーネント
 */
export class HeaderComponent {
    constructor(app) {
        this.app = app;
    }

    update() {
        const container = document.getElementById('header-container');
        if (!this.app.isAuthenticated()) {
            container.innerHTML = '';
            return;
        }

        const user = this.app.currentUser;
        container.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm fixed-top">
                <div class="container-fluid">
                    <!-- ハンバーガーメニューボタン（モバイル用） -->
                    <button id="sidebarToggler" class="navbar-toggler d-lg-none border-0" type="button" aria-label="メニューを開く">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <!-- ブランドロゴ -->
                    <a class="navbar-brand d-flex align-items-center fw-bold" href="#/dashboard" data-link>
                        <i class="fas fa-hard-hat me-2"></i>
                        <span class="d-none d-md-inline" data-i18n="app.system_name">評価管理システム</span>
                        <span class="d-md-none">評価システム</span>
                    </a>
                    
                    <!-- 右側のメニュー -->
                    <div class="d-flex align-items-center">
                        <!-- ユーザー情報（デスクトップ） -->
                        <div class="d-none d-lg-flex align-items-center text-white me-3">
                            <i class="fas fa-user-circle me-2"></i>
                            <div class="d-flex flex-column">
                                <small class="mb-0">${this.app.sanitizeHtml(user.name)}</small>
                                <small class="text-white-50" data-i18n="roles.${user.role}"></small>
                            </div>
                        </div>
                        
                        <!-- 言語切り替えドロップダウン -->
                        <div class="dropdown me-2">
                            <button class="btn btn-outline-light btn-sm dropdown-toggle border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-globe me-1"></i>
                                <span class="d-none d-md-inline" data-i18n="common.language">言語</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item ${this.app.i18n.lang === 'ja' ? 'active' : ''}" href="#" onclick="window.app.i18n.setLanguage('ja')">🇯🇵 日本語</a></li>
                                <li><a class="dropdown-item ${this.app.i18n.lang === 'en' ? 'active' : ''}" href="#" onclick="window.app.i18n.setLanguage('en')">🇺🇸 English</a></li>
                                <li><a class="dropdown-item ${this.app.i18n.lang === 'vi' ? 'active' : ''}" href="#" onclick="window.app.i18n.setLanguage('vi')">🇻🇳 Tiếng Việt</a></li>
                            </ul>
                        </div>
                        
                        <!-- ログアウトボタン -->
                        <button class="btn btn-outline-light btn-sm border-0" onclick="window.app.logout()" title="ログアウト">
                            <i class="fas fa-sign-out-alt"></i>
                            <span class="d-none d-md-inline ms-1" data-i18n="nav.logout">ログアウト</span>
                        </button>
                    </div>
                </div>
            </nav>`;
        
        // サイドバートグルボタンのイベントリスナー追加
        const toggler = document.getElementById('sidebarToggler');
        if (toggler) {
            toggler.addEventListener('click', () => {
                this.app.sidebar.toggle();
            });
        }
        
        // バックドロップのクリックイベント追加
        const backdrop = document.getElementById('sidebar-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                this.app.sidebar.close();
            });
        }
        
        this.app.i18n.updateUI(container);
    }
}
