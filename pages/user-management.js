// careeconplus/evaluationsystem/Evaluationsystem-main/pages/user-management.js

/**
 * User Management Page Component (with invitation and edit modals)
 * ユーザー管理ページコンポーネント（招待・編集モーダル付き）
 */
export class UserManagementPage {
    constructor(app) {
        this.app = app;
        this.activeUsers = [];
        this.pendingUsers = [];
        this.jobTypes = [];
        this.selectedTab = 'active';
        this.inviteModal = null;
        this.editModal = null;
    }

    async render() {
        return `
            <div class="user-management-page p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 data-i18n="users.title"></h1>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#inviteUserModal">
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

            ${this.renderInviteModal()}
            ${this.renderEditModal()}
            ${this.renderInvitationLinkModal()}
        `;
    }
    
    renderInviteModal() {
        return `
        <div class="modal fade" id="inviteUserModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" data-i18n="users.invite_title"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                  <div class="mb-3 d-none" id="inviteJobTypeContainer">
                    <label for="inviteJobType" class="form-label" data-i18n="evaluation.job_type"></label>
                    <select class="form-select" id="inviteJobType"></select>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
                <button type="button" class="btn btn-primary" id="send-invitation-btn">
                    <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                    <span data-i18n="users.send_invitation"></span>
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }
    
    renderEditModal() {
        return `
        <div class="modal fade" id="editUserModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" data-i18n="users.edit_user"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="editUserForm">
                    <input type="hidden" id="editUserId">
                    <p><strong><span data-i18n="auth.name"></span>:</strong> <span id="editUserName"></span></p>
                    <p><strong><span data-i18n="auth.email"></span>:</strong> <span id="editUserEmail"></span></p>
                    <div class="mb-3">
                        <label for="editUserRole" class="form-label" data-i18n="users.role"></label>
                        <select class="form-select" id="editUserRole" required>
                          <option value="evaluator" data-i18n="roles.evaluator"></option>
                          <option value="worker" data-i18n="roles.worker"></option>
                        </select>
                    </div>
                     <div class="mb-3" id="editJobTypeContainer">
                        <label for="editJobType" class="form-label" data-i18n="evaluation.job_type"></label>
                        <select class="form-select" id="editJobType"></select>
                    </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
                <button type="button" class="btn btn-primary" id="save-user-changes-btn">
                    <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                    <span data-i18n="common.save"></span>
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }

    renderInvitationLinkModal() {
         return `<div class="modal fade" id="invitationLinkModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" data-i18n="users.invite_link_created"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
            </div>`;
    }

    async init() {
        if (!this.app.hasRole("admin")) {
            this.app.navigate("#/dashboard");
            return;
        }

        this.app.currentPage = this;
        this.setupEventListeners();
        this.inviteModal = new bootstrap.Modal(document.getElementById('inviteUserModal'));
        this.editModal = new bootstrap.Modal(document.getElementById('editUserModal'));

        await this.loadData();
    }
    
    setupEventListeners() {
        document.getElementById('active-tab-btn').addEventListener('click', () => this.switchTab('active'));
        document.getElementById('pending-tab-btn').addEventListener('click', () => this.switchTab('pending'));
        document.getElementById('send-invitation-btn').addEventListener('click', () => this.handleInvite());
        document.getElementById('save-user-changes-btn').addEventListener('click', () => this.handleSaveChanges());
        
        document.getElementById('inviteRole').addEventListener('change', (e) => this.toggleJobTypeField('invite', e.target.value));
        document.getElementById('editUserRole').addEventListener('change', (e) => this.toggleJobTypeField('edit', e.target.value));

        // Event delegation for edit buttons
        document.getElementById('active-users-view').addEventListener('click', e => {
            const editButton = e.target.closest('.edit-user-btn');
            if (editButton) {
                this.openEditModal(editButton.dataset.userId);
            }
        });
    }

    async loadData() {
        // ... (existing loadData logic)
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
            this.populateJobTypesSelect(document.getElementById('inviteJobType'));
            this.populateJobTypesSelect(document.getElementById('editJobType'));
            this.app.i18n.updateUI();
        } catch (error) {
            console.error("Failed to load users:", error);
            this.app.showError(this.app.i18n.t("errors.loading_failed"));
        }
    }
    
    populateJobTypesSelect(selectElement) {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${this.app.i18n.t('common.select')}</option>` +
            this.jobTypes.map(jt => `<option value="${jt.id}">${this.app.sanitizeHtml(jt.name)}</option>`).join('');
    }

    createTable(users, isPendingTable) {
        if (users.length === 0) {
            return `<div class="card card-body text-center" data-i18n="common.no_data"></div>`;
        }
        return `
            <div class="card">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead>
                            <tr>
                                <th data-i18n="auth.name"></th>
                                <th data-i18n="auth.email"></th>
                                <th data-i18n="users.role"></th>
                                <th data-i18n="evaluation.job_type"></th>
                                <th data-i18n="users.created_at"></th>
                                <th data-i18n="users.actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => this.createTableRow(user, isPendingTable)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }
    
    createTableRow(user, isPendingTable) {
        const jobType = this.jobTypes.find(jt => jt.id === user.jobTypeId);
        return `
            <tr>
                <td>${this.app.sanitizeHtml(user.name || '')}</td>
                <td>${this.app.sanitizeHtml(user.email)}</td>
                <td><span class="badge ${this.app.getRoleBadgeClass(user.role)}" data-i18n="roles.${user.role}"></span></td>
                <td>${this.app.sanitizeHtml(jobType?.name || '-')}</td>
                <td>${this.app.formatDate(user.createdAt)}</td>
                <td>
                    ${isPendingTable ? `
                        <button class="btn btn-sm btn-success" title="承認" onclick="window.app.currentPage.approveUser('${user.id}')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-sm btn-danger ms-1" title="否認" onclick="window.app.currentPage.rejectUser('${user.id}')"><i class="fas fa-times"></i></button>
                    ` : `
                        <button class="btn btn-sm btn-outline-primary edit-user-btn" data-user-id="${user.id}" title="編集"><i class="fas fa-edit"></i></button>
                    `}
                </td>
            </tr>
        `;
    }

    renderTables() {
        document.getElementById('active-users-view').innerHTML = this.createTable(this.activeUsers, false);
        document.getElementById('pending-users-view').innerHTML = this.createTable(this.pendingUsers, true);
        this.app.i18n.updateUI();
    }

    switchTab(tabName) {
        this.selectedTab = tabName;
        document.getElementById('active-users-view').classList.toggle('d-none', tabName !== 'active');
        document.getElementById('pending-users-view').classList.toggle('d-none', tabName !== 'pending');
        document.getElementById('active-tab-btn').classList.toggle('active', tabName === 'active');
        document.getElementById('pending-tab-btn').classList.toggle('active', tabName === 'pending');
        this.loadData();
    }

    approveUser(userId) {
        if (confirm(this.app.i18n.t('users.confirm_approve'))) {
            this.app.api.updateUserStatus(userId, 'active')
                .then(() => {
                    this.app.showSuccess(this.app.i18n.t('users.approve_success'));
                    this.loadData();
                })
                .catch(e => this.app.showError(e.message));
        }
    }

    rejectUser(userId) {
        if (confirm(this.app.i18n.t('users.confirm_reject'))) {
             this.app.api.deleteUser(userId)
                .then(() => {
                    this.app.showSuccess(this.app.i18n.t('users.reject_success'));
                    this.loadData();
                })
                .catch(e => this.app.showError(e.message));
        }
    }
    
    toggleJobTypeField(formPrefix, role) {
        const containerId = `${formPrefix}JobTypeContainer`;
        const selectId = `${formPrefix}JobType`;
        const container = document.getElementById(containerId);
        const select = document.getElementById(selectId);
        
        if (role === 'worker') {
            container.classList.remove('d-none');
            select.required = true;
        } else {
            container.classList.add('d-none');
            select.required = false;
        }
    }

    async handleInvite() {
        const form = document.getElementById('inviteUserForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const btn = document.getElementById('send-invitation-btn');
        const spinner = btn.querySelector('.spinner-border');
        spinner.classList.remove('d-none');
        btn.disabled = true;

        try {
            const invitation = {
                email: document.getElementById('inviteEmail').value,
                role: document.getElementById('inviteRole').value,
                jobTypeId: document.getElementById('inviteJobType').value || null,
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
    
    async openEditModal(userId) {
        const user = this.activeUsers.find(u => u.id === userId);
        if (!user) return;
        
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').textContent = user.name;
        document.getElementById('editUserEmail').textContent = user.email;
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editJobType').value = user.jobTypeId || '';
        
        this.toggleJobTypeField('edit', user.role);
        
        this.editModal.show();
    }
    
    async handleSaveChanges() {
        const btn = document.getElementById('save-user-changes-btn');
        const spinner = btn.querySelector('.spinner-border');
        spinner.classList.remove('d-none');
        btn.disabled = true;

        try {
            const userId = document.getElementById('editUserId').value;
            const role = document.getElementById('editUserRole').value;
            const jobTypeId = document.getElementById('editJobType').value;

            const dataToUpdate = {
                role: role,
                jobTypeId: role === 'worker' ? jobTypeId : null
            };
            
            await this.app.api.updateUser(userId, dataToUpdate);
            this.app.showSuccess(this.app.i18n.t('messages.save_success'));
            this.editModal.hide();
            await this.loadData();
        } catch (error) {
            this.app.showError(error.message);
        } finally {
            spinner.classList.add('d-none');
            btn.disabled = false;
        }
    }

    showInvitationLink(token) {
        const linkModalEl = document.getElementById('invitationLinkModal');
        const linkModal = bootstrap.Modal.getOrCreateInstance(linkModalEl);
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
