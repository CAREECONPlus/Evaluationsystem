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
        
        <ul class="nav nav-tabs mt-4">
          <li class="nav-item">
            <button class="nav-link active" id="approvals-tab-btn" data-i18n="developer.admin_approvals"></button>
          </li>
          <li class="nav-item">
            <button class="nav-link" id="tenants-tab-btn" data-i18n="developer.tenant_management"></button>
          </li>
        </ul>

        <div class="tab-content">
            <div id="approvals-view">
                <div class="card rounded-0 rounded-bottom">
                    <div class="card-body">
                        <input type="search" id="pending-search" class="form-control mb-3" data-i18n-placeholder="common.search">
                        <div id="pending-admins-list"></div>
                    </div>
                </div>
            </div>
            <div id="tenants-view" class="d-none">
                <div class="card rounded-0 rounded-bottom">
                     <div class="card-body">
                        <input type="search" id="tenants-search" class="form-control mb-3" data-i18n-placeholder="common.search">
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
    // Role guard: Only developers can access this page
    if (!this.app.hasRole('developer')) {
      this.app.navigate('#/dashboard');
      return;
    }

    document.getElementById('approvals-tab-btn').addEventListener('click', () => this.switchTab('approvals'));
    document.getElementById('tenants-tab-btn').addEventListener('click', () => this.switchTab('tenants'));

    await this.loadData();
  }

  async loadData() {
    const pendingContainer = document.getElementById('pending-admins-list');
    pendingContainer.innerHTML = `<div class="text-center p-3">${this.app.i18n.t('common.loading')}</div>`;
    
    try {
      // Fetch both pending admins and active tenants in parallel
      [this.pendingAdmins, this.activeTenants] = await Promise.all([
        this.app.api.getPendingAdmins(),
        this.app.api.getActiveTenants() // Assumes this new method exists in api.js
      ]);
      this.renderLists();
      this.app.i18n.updateUI();
    } catch (e) {
      console.error("Failed to load developer data:", e);
      this.app.showError(this.app.i18n.t('errors.loading_failed'));
    }
  }

  renderLists() {
    this.renderPendingList();
    this.renderTenantList();
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
        ? ['auth.name', 'auth.email', 'auth.company', 'users.actions']
        : ['auth.company', 'auth.name', 'auth.email', 'users.status', 'users.actions'];

    return `
      <div class="table-responsive">
        <table class="table table-hover mb-0">
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
        <td>${this.app.sanitizeHtml(admin.name)}</td>
        <td>${this.app.sanitizeHtml(admin.email)}</td>
        <td>${this.app.sanitizeHtml(admin.companyName)}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="window.app.currentPage.approve('${admin.id}')">
            <i class="fas fa-check me-1"></i><span data-i18n="developer.approve"></span>
          </button>
        </td>
      </tr>`;
  }

  renderTenantRow(tenant) {
    return `
        <tr>
            <td>${this.app.sanitizeHtml(tenant.companyName)}</td>
            <td>${this.app.sanitizeHtml(tenant.adminName)}</td>
            <td>${this.app.sanitizeHtml(tenant.adminEmail)}</td>
            <td><span class="badge ${tenant.status === 'active' ? 'bg-success' : 'bg-danger'}">${tenant.status}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" onclick="window.app.currentPage.sendPasswordReset('${tenant.adminEmail}')" title="パスワードリセット"><i class="fas fa-key"></i></button>
                    <button class="btn btn-outline-danger" onclick="window.app.currentPage.toggleTenantStatus('${tenant.id}', '${tenant.status}')" title="利用停止/再開"><i class="fas fa-power-off"></i></button>
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

    const button = event.target.closest('button');
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    try {
      await this.app.api.approveAdmin(userId);
      this.app.showSuccess(this.app.i18n.t('developer.approve_success'));
      await this.loadData(); // Refresh both lists
    } catch (e) {
      this.app.showError(e.message);
      button.disabled = false;
      this.app.i18n.updateUI(button.parentElement);
    }
  }

  async sendPasswordReset(email) {
      if (!confirm(`${email} にパスワードリセットメールを送信しますか？`)) return;
      try {
          await this.app.auth.sendPasswordReset(email);
          this.app.showSuccess("パスワードリセットメールを送信しました。");
      } catch (e) {
          this.app.showError(e.message);
      }
  }

  async toggleTenantStatus(tenantId, currentStatus) {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      if (!confirm(`このテナントを「${newStatus}」状態に変更しますか？`)) return;
      try {
          await this.app.api.updateTenantStatus(tenantId, newStatus);
          this.app.showSuccess("テナントの状態を更新しました。");
          await this.loadData();
      } catch (e) {
          this.app.showError(e.message);
      }
  }
}
