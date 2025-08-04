/**
 * Header Component
 * ヘッダーコンポーネント
 */
export class HeaderComponent {
    constructor(app) {
        this.app = app;
    }

    /**
     * Renders or hides the header based on authentication status.
     * 認証状態に基づいてヘッダーを描画または非表示にします。
     */
    update() {
        const container = document.getElementById('header-container');
        if (!this.app.isAuthenticated()) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div class="container-fluid">
                    <button id="sidebarToggler" class="navbar-toggler d-lg-none" type="button">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <a class="navbar-brand d-flex align-items-center" href="#/dashboard" data-link>
                        <i class="fas fa-hard-hat me-2"></i>
                        <span class="fw-bold">評価管理システム</span>
                    </a>
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-globe me-1"></i><span data-i18n="common.language"></span>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="#" onclick="window.app.i18n.setLanguage('ja')">日本語</a></li>
                                    <li><a class="dropdown-item" href="#" onclick="window.app.i18n.setLanguage('en')">English</a></li>
                                    <li><a class="dropdown-item" href="#" onclick="window.app.i18n.setLanguage('vi')">Tiếng Việt</a></li>
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" onclick="event.preventDefault(); window.app.logout();">
                                    <i class="fas fa-sign-out-alt me-2"></i><span data-i18n="nav.logout"></span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>`;
        this.app.i18n.updateUI(container);
    }
}
