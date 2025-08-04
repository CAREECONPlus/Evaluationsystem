/**
 * Sidebar Component
 * サイドバーコンポーネント
 */
export class SidebarComponent {
    constructor(app) {
        this.app = app;
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
            { path: '#/dashboard', icon: 'fa-tachometer-alt', labelKey: 'nav.dashboard', roles: ['admin', 'evaluator', 'worker', 'developer'] },
            { path: '#/evaluations', icon: 'fa-clipboard-list', labelKey: 'nav.evaluations', roles: ['admin', 'evaluator', 'worker'] },
            { path: '#/evaluation-form', icon: 'fa-edit', labelKey: 'nav.evaluation', roles: ['admin', 'evaluator', 'worker'] },
            { path: '#/goal-setting', icon: 'fa-bullseye', labelKey: 'nav.goals', roles: ['evaluator', 'worker'] },
            { path: '#/goal-approvals', icon: 'fa-check-circle', labelKey: 'nav.goal_approvals', roles: ['admin'] },
            { path: '#/users', icon: 'fa-users', labelKey: 'nav.users', roles: ['admin'] },
            { path: '#/settings', icon: 'fa-cog', labelKey: 'nav.settings', roles: ['admin'] },
            { path: '#/developer', icon: 'fa-code', labelKey: 'nav.developer', roles: ['developer'] },
        ];
        
        container.innerHTML = `
            <div class="sidebar bg-dark text-white p-3 d-flex flex-column">
                <nav class="nav flex-column">
                    ${menuItems
                        .filter(item => item.roles.includes(role))
                        .map(item => `
                        <a class="nav-link text-white ${activePath.startsWith(item.path) ? 'active' : ''}" href="${item.path}" data-link>
                            <i class="fas ${item.icon} fa-fw me-2"></i><span data-i18n="${item.labelKey}"></span>
                        </a>
                    `).join('')}
                </nav>
            </div>`;
        this.app.i18n.updateUI(container);
    }

    toggle() {
        document.getElementById('sidebar-container')?.classList.toggle('show');
        document.getElementById('sidebar-backdrop')?.classList.toggle('show');
    }
    
    close() {
        document.getElementById('sidebar-container')?.classList.remove('show');
        document.getElementById('sidebar-backdrop')?.classList.remove('show');
    }
}
