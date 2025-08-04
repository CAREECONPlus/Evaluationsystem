// careeconplus/evaluationsystem/Evaluationsystem-main/pages/user-management.js

/**
 * User Management Page Component (with invitation modal)
 * ユーザー管理ページコンポーネント（招待モーダル付き）
 */
export class UserManagementPage {
    constructor(app) {
        this.app = app;
        this.activeUsers = [];
        this.pendingUsers = [];
        this.jobTypes = []; // Add jobTypes property
        this.selectedTab = 'active';
        this.inviteModal = null;
    }

    async render() {
        return `
            <div class="user-management-page p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 data-i18n="users.title"></h1>
                    <button class="btn btn-primary" id="invite-user-btn" data-bs-toggle="modal" data-bs-target="#inviteUserModal">
                        <i class="fas fa-user-plus me-2"></i><span data-i18n="users.invite"></span>
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

            <div class="modal fade" id="inviteUserModal" tabindex="-1" aria-labelledby="inviteUserModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="inviteUserModalLabel" data-i18n="users.invite_title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form id="inviteUserForm">
                      <div class="mb-3">
                        <label for="inviteEmail" class="form-label" data-i18n="auth.email"></label>
                        <input type="email" class="form-control" id="inviteEmail" required>
                      </div>
                      <div class="mb-3">
                        <label for="inviteRole" class="form-label" data-i18n="users.role"></label>
                        <select class="form-select" id="inviteRole" required>
                          <option value="" data-i18n="common.select"></option>
                          <option value="evaluator" data-i18n="roles.evaluator"></option>
                          <option value="worker" data-i18n="roles.worker"></option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label for="inviteJobType" class="form-label" data-i18n="evaluation.job_type"></label>
                        <select class="form-select" id="inviteJobType" required>
                          </select>
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
                    <button type="button" class="btn btn-primary" id="send-invitation-btn">
                        <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                        <span data-i18n="users.send_invitation"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal fade" id="invitationLinkModal" tabindex="-1" aria-labelledby="invitationLinkModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="invitationLinkModalLabel" data-i18n="users.invite_link_created"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <p data-i18n="users.invite_link_instructions"></p>
                    <div class="input-group">
                        <input type="text" class="form-control" id="invitationLinkInput" readonly>
                        <button class="btn btn-outline-secondary" id="copy-link-btn" type="button">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `;
    }

    async init() {
        if (!this.app.hasRole("admin")) {
            this.app.navigate("#/dashboard");
            return;
        }

        this.app.currentPage = this;
        document.getElementById('active-tab-btn').addEventListener('click', () => this.switchTab('active'));
        document.getElementById('pending-tab-btn').addEventListener('click', () => this.switchTab('pending'));
        document.getElementById('send-invitation-btn').addEventListener('click', () => this.handleInvite());

        this.inviteModal = new bootstrap.Modal(document.getElementById('inviteUserModal'));

        await this.loadData();
    }

    async loadData() {
        const activeUsersView = document.getElementById('active-users-view');
        const pendingUsersView = document.getElementById('pending-users-view');

        const loadingHTML = `<div class="card card-body text-center"><div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
        if (this.selectedTab === 'active') activeUsersView.innerHTML = loadingHTML;
        if (this.selectedTab === 'pending') pendingUsersView.innerHTML = loadingHTML;

        try {
            [this.activeUsers, this.pendingUsers, this.jobTypes] = await Promise.all([
                this.app.api.getUsers('active'),
                this.app.api.getUsers('pending_approval'),
                this.app.api.getJobTypes() // Fetch job types
            ]);

            document.getElementById('pending-count').textContent = this.pendingUsers.length;
            this.renderTables();
            this.populateJobTypes();
            this.app.i18n.updateUI();
        } catch (error) {
            console.error("Failed to load users:", error);
            this.app.showError("ユーザーデータの読み込みに失敗しました。");
        }
    }
    
    populateJobTypes() {
        const select = document.getElementById('inviteJobType');
        if (!select) return;
        select.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
            this.jobTypes.map(jt => `<option value="${jt.id}">${this.app.sanitizeHtml(jt.name)}</option>`).join('');
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

    renderTables() {
        document.getElementById('active-users-view').innerHTML = this.createTable(this.activeUsers, false);
        document.getElementById('pending-users-view').innerHTML = this.createTable(this.pendingUsers, true);
    }

    switchTab(tabName) {
        this.selectedTab = tabName;
        document.getElementById('active-users-view').classList.toggle('d-none', tabName !== 'active');
        document.getElementById('pending-users-view').classList.toggle('d-none', tabName !== 'pending');
        document.getElementById('active-tab-btn').classList.toggle('active', tabName === 'active');
        document.getElementById('pending-tab-btn').classList.toggle('active', tabName === 'pending');
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

    async handleInvite() {
        const form = document.getElementById('inviteUserForm');
        const email = document.getElementById('inviteEmail').value;
        const role = document.getElementById('inviteRole').value;
        const jobTypeId = document.getElementById('inviteJobType').value;
        const btn = document.getElementById('send-invitation-btn');
        const spinner = btn.querySelector('.spinner-border');

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        spinner.classList.remove('d-none');
        btn.disabled = true;

        try {
            const invitation = {
                email,
                role,
                jobTypeId,
                // These will be set in the API method
                // tenantId: this.app.currentUser.tenantId,
                // companyName: this.app.currentUser.companyName,
            };
            const token = await this.app.api.createInvitation(invitation);
            this.inviteModal.hide();
            form.reset();
            this.showInvitationLink(token);

        } catch (error) {
            this.app.showError(error.message);
        } finally {
            spinner.classList.add('d-none');
            btn.disabled = false;
        }
    }

    showInvitationLink(token) {
        const linkModal = new bootstrap.Modal(document.getElementById('invitationLinkModal'));
        const linkInput = document.getElementById('invitationLinkInput');
        const copyBtn = document.getElementById('copy-link-btn');
        
        const url = `${window.location.origin}${window.location.pathname}#/register?token=${token}`;
        linkInput.value = url;
        
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(url).then(() => {
                this.app.showSuccess(this.app.i18n.t('users.copy_success'));
            });
        };
        
        linkModal.show();
    }
}
