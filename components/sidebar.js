/**
 * Sidebar Component - ナビゲーション修正版
 * サイドバーコンポーネント
 */
export class SidebarComponent {
    constructor(app) {
        this.app = app;
        this.setupHamburgerMenu();
        this.setupNavigationHandling();
    }

    setupHamburgerMenu() {
        // ハンバーガーメニューのイベントリスナーを設定
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sidebarToggler')) {
                e.preventDefault();
                this.toggle();
            }
            
            // バックドロップクリックで閉じる
            if (e.target.id === 'sidebar-backdrop') {
                this.close();
            }
        });

        // ルート変更時にサイドバーを閉じる
        window.addEventListener('hashchange', () => {
            this.close();
        });
    }

    setupNavigationHandling() {
        // サイドバー内のナビゲーションリンクのクリックイベント
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.sidebar .nav-link[href]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    console.log('Sidebar: Navigating to', href);
                    this.app.navigate(href);
                    this.close(); // モバイルでサイドバーを閉じる
                }
            }
        });
    }

    update() {
        const container = document.getElementById('sidebar-container');
        if (!this.app.isAuthenticated()) {
            container.innerHTML = '';
            return;
        }

        const role = this.app.currentUser.role;
        const activePath = window.location.hash;

        const menuItems = [
            { 
                path: '#/dashboard', 
                icon: 'fa-tachometer-alt', 
                labelKey: 'nav.dashboard', 
                roles: ['admin', 'evaluator', 'worker', 'developer'] 
            },
            { 
                path: '#/evaluations', 
                icon: 'fa-clipboard-list', 
                labelKey: 'nav.evaluations', 
                roles: ['admin', 'evaluator', 'worker'] 
            },
            { 
                path: '#/evaluation-form', 
                icon: 'fa-edit', 
                labelKey: 'nav.evaluation', 
                roles: ['admin', 'evaluator', 'worker'] 
            },
            { 
                path: '#/goal-setting', 
                icon: 'fa-bullseye', 
                labelKey: 'nav.goals', 
                roles: ['evaluator', 'worker'] 
            },
            { 
                path: '#/goal-approvals', 
                icon: 'fa-check-circle', 
                labelKey: 'nav.goal_approvals', 
                roles: ['admin'] 
            },
            { 
                path: '#/users', 
                icon: 'fa-users', 
                labelKey: 'nav.users', 
                roles: ['admin'] 
            },
            { 
                path: '#/settings', 
                icon: 'fa-cog', 
                labelKey: 'nav.settings', 
                roles: ['admin'] 
            },
            { 
                path: '#/developer', 
                icon: 'fa-code', 
                labelKey: 'nav.developer', 
                roles: ['developer'] 
            },
        ];
        
        const user = this.app.currentUser;
        container.innerHTML = `
            <div class="sidebar bg-dark text-white d-flex flex-column h-100">
                <!-- モバイル用ユーザー情報 -->
                <div class="sidebar-header d-lg-none p-3 border-bottom border-secondary">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-user-circle fa-2x me-3 text-primary"></i>
                        <div>
                            <div class="fw-bold">${this.app.sanitizeHtml(user.name)}</div>
                            <small class="text-white-50" data-i18n="roles.${user.role}"></small>
                        </div>
                    </div>
                </div>
                
                <!-- ナビゲーションメニュー -->
                <nav class="nav flex-column flex-grow-1 p-3">
                    ${menuItems
                        .filter(item => item.roles.includes(role))
                        .map(item => {
                            const isActive = activePath === item.path || activePath.startsWith(item.path.replace('#', '') + '/');
                            return `
                            <a class="nav-link text-white d-flex align-items-center py-3 px-3 mb-1 rounded transition-all ${isActive ? 'active bg-primary' : ''}" 
                               href="${item.path}">
                                <i class="fas ${item.icon} fa-fw me-3"></i>
                                <span data-i18n="${item.labelKey}"></span>
                            </a>
                            `;
                        }).join('')}
                </nav>
                
                <!-- サイドバーフッター -->
                <div class="sidebar-footer p-3 border-top border-secondary">
                    <div class="text-center">
                        <small class="text-white-50">
                            <i class="fas fa-hard-hat me-1"></i>
                            <span data-i18n="app.system_name">評価管理システム</span>
                        </small>
                    </div>
                </div>
            </div>`;
        
        this.app.i18n.updateUI(container);
    }

    toggle() {
        const sidebar = document.getElementById('sidebar-container');
        const backdrop = document.getElementById('sidebar-backdrop');
        
        if (sidebar && backdrop) {
            const isOpen = sidebar.classList.contains('show');
            
            if (isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    }
    
    open() {
        const sidebar = document.getElementById('sidebar-container');
        const backdrop = document.getElementById('sidebar-backdrop');
        
        if (sidebar && backdrop) {
            sidebar.classList.add('show');
            backdrop.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    close() {
        const sidebar = document.getElementById('sidebar-container');
        const backdrop = document.getElementById('sidebar-backdrop');
        
        if (sidebar && backdrop) {
            sidebar.classList.remove('show');
            backdrop.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
}
