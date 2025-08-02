/**
 * User Management Page Component (with approval flow)
 * ユーザー管理ページコンポーネント（承認フロー付き）
 */
export class UserManagementPage {
    constructor(app) {
        this.app = app;
        this.activeUsers = [];
        this.pendingUsers = [];
        this.selectedTab = 'active';
        this.userModal = null; // To hold the Bootstrap Modal instance
    }

    async render() {
        return `
            <div class="user-management-page p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 data-i18n="users.title"></h1>
                    <button class="btn btn-primary" id="invite-user-btn">
                        <i class="fas fa-plus me-2"></i><span data-i18n="users.invite"></span>
                    </button>
                </div>

                <ul class="nav nav-tabs mb-3">
                    <li class="nav-item">
                        <button class="nav-link active" id="active-tab-btn" data-i18n="users.active_users"></button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="pending-tab-btn">
                            <span data-i18n="users.pending_approvals"></span> 
                            <span class="badge bg-warning text-dark ms-1" id="pending-count">0</span>
                        </button>
                    </li>
                </ul>

                <div id="active-users-view"></div>
                <div id="pending-users-view" class="d-none"></div>
            </div>

            <!-- User Modal (for adding/editing) can be added here later -->
        `;
    }

    async init() {
        // Role guard: Only admins can access this page
        if (!this.app.hasRole("admin")) {
            this.app.navigate("#/dashboard");
            return;
        }
        
        this.app.currentPage = this;
        document.getElementById('active-tab-btn').addEventListener('click', () => this.switchTab('active'));
        document.getElementById('pending-tab-btn').addEventListener('click', () => this.switchTab('pending'));
        
        await this.loadData();
    }

    async loadData() {
        const activeUsersView = document.getElementById('active-users-view');
        const pendingUsersView = document.getElementById('pending-users-view');
        
        // Show loading spinners
        const loadingHTML = `<div class="card card-body text-center"><div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
        if (this.selectedTab === 'active') activeUsersView.innerHTML = loadingHTML;
        if (this.selectedTab === 'pending') pendingUsersView.innerHTML = loadingHTML;

        try {
            [this.activeUsers, this.pendingUsers] = await Promise.all([
                this.app.api.getUsers('active'),
                this.app.api.getUsers('pending_approval')
            ]);
            
            document.getElementById('pending-count').textContent = this.pendingUsers.length;
            this.renderTables();
            this.app.i18n.updateUI();
        } catch (error) {
            console.error("Failed to load users:", error);
            this.app.showError("ユーザーデータの読み込みに失敗しました。");
        }
    }

    renderTables() {
        document.getElementById('active-users-view').innerHTML = this.createTable(this.activeUsers, false);
        document.getElementById('pending-users-view').innerHTML = this.createTable(this.pendingUsers, true);
    }

    createTable(users, isPendingTable) {
        if (users.length === 0) {
            return `<div class="card card-body text-center" data-i18n="common.no_data"></div>`;
        }
        return `
            <div class="card">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th data-i18n="auth.name"></th>
                                <th data-i18n="auth.email"></th>
                                <th data-i18n="users.role"></th>
                                <th data-i18n="users.created_at"></th>
                                <th data-i18n="users.actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${this.app.sanitizeHtml(user.name || '')}</td>
                                    <td>${this.app.sanitizeHtml(user.email)}</td>
                                    <td><span class="badge ${this.app.getRoleBadgeClass(user.role)}" data-i18n="roles.${user.role}"></span></td>
                                    <td>${this.app.formatDate(user.createdAt)}</td>
                                    <td>
                                        ${isPendingTable ? `
                                            <button class="btn btn-sm btn-success" title="承認" onclick="window.app.currentPage.approveUser('${user.id}')"><i class="fas fa-check"></i></button>
                                            <button class="btn btn-sm btn-danger ms-1" title="否認" onclick="window.app.currentPage.rejectUser('${user.id}')"><i class="fas fa-times"></i></button>
                                        ` : `
                                            <button class="btn btn-sm btn-outline-primary" title="編集"><i class="fas fa-edit"></i></button>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    switchTab(tabName) {
        this.selectedTab = tabName;
        document.getElementById('active-users-view').classList.toggle('d-none', tabName !== 'active');
        document.getElementById('pending-users-view').classList.toggle('d-none', tabName !== 'pending');
        document.getElementById('active-tab-btn').classList.toggle('active', tabName === 'active');
        document.getElementById('pending-tab-btn').classList.toggle('active', tabName === 'pending');
        // Reload data for the selected tab to ensure it's fresh
        this.loadData();
    }

    async approveUser(userId) {
        if (confirm(this.app.i18n.t('users.confirm_approve'))) {
            try {
                await this.app.api.updateUserStatus(userId, 'active');
                this.app.showSuccess(this.app.i18n.t('users.approve_success'));
                await this.loadData(); // Refresh both lists
            } catch (e) {
                this.app.showError(e.message);
            }
        }
    }

    async rejectUser(userId) {
        if (confirm(this.app.i18n.t('users.confirm_reject'))) {
            try {
                await this.app.api.deleteUser(userId);
                this.app.showSuccess(this.app.i18n.t('users.reject_success'));
                await this.loadData(); // Refresh both lists
            } catch (e) {
                this.app.showError(e.message);
            }
        }
    }
}
