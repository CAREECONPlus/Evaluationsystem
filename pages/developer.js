// careeconplus/evaluationsystem/Evaluationsystem-main/pages/developer.js

/**
 * Developer Page Component (Firebase Integrated & Enhanced)
 * 開発者ページコンポーネント（Firebase連携・機能改善版）
 */
export class DeveloperPage {
  constructor(app) {
    this.app = app;
    this.pendingAdmins = [];
    this.activeTenants = []; // For the new Tenant Management tab
    this.selectedTab = 'approvals'; // 'approvals' or 'tenants'
  }

  async render() {
    return `
      <div class="developer-page p-4">
        <h1 data-i18n="nav.developer"></h1>
        
        <ul class="nav nav-tabs mt-4 mb-3">
          <li class="nav-item">
            <button class="nav-link active" id="approvals-tab-btn" data-i18n="developer.admin_approvals"></button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="tenants-tab-btn" data-i18n="developer.tenant_management"></button>
          </li>
        </ul>

        <div class="tab-content">
            <div id="approvals-view">
                <div class="card">
                    <div class="card-body">
                        <div id="pending-admins-list"></div>
                    </div>
                </div>
            </div>
            <div id="tenants-view" class="d-none">
                <div class="card">
                     <div class="card-body">
                        <div id="active-tenants-list"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    if (!this.app.hasRole('developer')) {
      this.app.navigate('#/dashboard');
      return;
    }

    this.setupEventListeners();
    await this.loadData();
  }

  setupEventListeners() {
    document.getElementById('approvals-tab-btn').addEventListener('click', () => this.switchTab('approvals'));
    document.getElementById('tenants-tab-btn').addEventListener('click', () => this.switchTab('tenants'));

    // Event delegation for dynamic buttons
    document.querySelector('.tab-content').addEventListener('click', (e) => {
        const approveBtn = e.target.closest('.approve-admin-btn');
        if (approveBtn) this.approve(approveBtn.dataset.userId);

        const resetPassBtn = e.target.closest('.reset-password-btn');
        if (resetPassBtn) this.sendPasswordReset(resetPassBtn.dataset.email);

        const toggleStatusBtn = e.target.closest('.toggle-status-btn');
        if (toggleStatusBtn) this.toggleTenantStatus(toggleStatusBtn.dataset.tenantId, toggleStatusBtn.dataset.status);
    });
  }

  async loadData() {
    const loadingHTML = `<div class="text-center p-3" data-i18n="common.loading"></div>`;
    document.getElementById('pending-admins-list').innerHTML = loadingHTML;
    document.getElementById('active-tenants-list').innerHTML = loadingHTML;
    this.app.i18n.updateUI();

    try {
      [this.pendingAdmins, this.activeTenants] = await Promise.all([
        this.app.api.getPendingAdmins(),
        this.app.api.getActiveTenants()
      ]);
      this.renderLists();
    } catch (e) {
      console.error("Failed to load developer data:", e);
      this.app.showError(this.app.i18n.t('errors.loading_failed'));
    }
  }

  renderLists() {
    this.renderPendingList();
    this.renderTenantList();
    this.app.i18n.updateUI();
  }

  renderPendingList() {
    const container = document.getElementById('pending-admins-list');
    if (this.pendingAdmins.length === 0) {
      container.innerHTML = `<div class="text-center p-3" data-i18n="common.no_data"></div>`;
      return;
    }
    container.innerHTML = this.createTable(this.pendingAdmins, true);
  }

  renderTenantList() {
    const container = document.getElementById('active-tenants-list');
     if (this.activeTenants.length === 0) {
      container.innerHTML = `<div class="text-center p-3" data-i18n="common.no_data"></div>`;
      return;
    }
    container.innerHTML = this.createTable(this.activeTenants, false);
  }

  createTable(data, isPending) {
    const headers = isPending 
        ? ['auth.company', 'auth.name', 'auth.email', 'users.actions']
        : ['auth.company', 'auth.name', 'auth.email', 'users.status', 'users.actions'];

    return `
      <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              ${headers.map(h => `<th data-i18n="${h}"></th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(item => isPending ? this.renderPendingRow(item) : this.renderTenantRow(item)).join('')}
          </tbody>
        </table>
      </div>`;
  }

  renderPendingRow(admin) {
    return `
      <tr>
        <td>${this.app.sanitizeHtml(admin.companyName)}</td>
        <td>${this.app.sanitizeHtml(admin.name)}</td>
        <td>${this.app.sanitizeHtml(admin.email)}</td>
        <td>
          <button class="btn btn-sm btn-success approve-admin-btn" data-user-id="${admin.id}">
            <i class="fas fa-check me-1"></i><span data-i18n="developer.approve"></span>
          </button>
        </td>
      </tr>`;
  }

  renderTenantRow(tenant) {
    const isActive = tenant.status === 'active';
    return `
        <tr>
            <td>${this.app.sanitizeHtml(tenant.companyName)}</td>
            <td>${this.app.sanitizeHtml(tenant.adminName)}</td>
            <td>${this.app.sanitizeHtml(tenant.adminEmail)}</td>
            <td><span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}" data-i18n="status.${tenant.status}"></span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary reset-password-btn" data-email="${tenant.adminEmail}" title="パスワードリセット"><i class="fas fa-key"></i></button>
                    <button class="btn btn-outline-danger toggle-status-btn" data-tenant-id="${tenant.id}" data-status="${tenant.status}" title="${isActive ? '利用停止' : '利用再開'}">
                        <i class="fas ${isActive ? 'fa-power-off' : 'fa-toggle-on'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
  }

  switchTab(tab) {
    this.selectedTab = tab;
    document.getElementById('approvals-view').classList.toggle('d-none', tab !== 'approvals');
    document.getElementById('tenants-view').classList.toggle('d-none', tab !== 'tenants');
    document.getElementById('approvals-tab-btn').classList.toggle('active', tab === 'approvals');
    document.getElementById('tenants-tab-btn').classList.toggle('active', tab === 'tenants');
  }

  async approve(userId) {
    if (!confirm(this.app.i18n.t('developer.confirm_approve'))) return;

    try {
      await this.app.api.approveAdmin(userId);
      this.app.showSuccess(this.app.i18n.t('developer.approve_success'));
      await this.loadData();
    } catch (e) {
      this.app.showError(e.message);
    }
  }

  async sendPasswordReset(email) {
      if (!confirm(this.app.i18n.t('developer.confirm_password_reset', { email: email }))) return;
      try {
          await this.app.auth.sendPasswordReset(email);
          this.app.showSuccess(this.app.i18n.t('messages.password_reset_sent'));
      } catch (e) {
          this.app.showError(this.app.auth.getFirebaseAuthErrorMessage(e));
      }
  }

  async toggleTenantStatus(tenantId, currentStatus) {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const confirmKey = newStatus === 'active' ? 'developer.confirm_reactivate' : 'developer.confirm_suspend';
      
      if (!confirm(this.app.i18n.t(confirmKey))) return;

      try {
          await this.app.api.updateTenantStatus(tenantId, newStatus);
          this.app.showSuccess(this.app.i18n.t('developer.status_update_success'));
          await this.loadData();
      } catch (e) {
          this.app.showError(e.message);
      }
  }
}
