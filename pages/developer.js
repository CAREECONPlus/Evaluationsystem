/**
 * Developer Page Component (管理者招待機能追加版)
 * 開発者ページコンポーネント
 */
export class DeveloperPage {
  constructor(app) {
    this.app = app;
    this.pendingAdmins = [];
    this.activeTenants = [];
    this.selectedTab = 'approvals';
  }

  async render() {
    return `
      <div class="developer-page p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="nav.developer"></h1>
          <button class="btn btn-success" id="invite-admin-btn">
            <i class="fas fa-envelope me-2"></i>管理者を招待
          </button>
        </div>
        
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

      <!-- 管理者招待モーダル -->
      <div class="modal fade" id="inviteAdminModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">管理者アカウントの招待</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="inviteAdminForm">
                <div class="mb-3">
                  <label for="adminCompanyName" class="form-label">企業名</label>
                  <input type="text" class="form-control" id="adminCompanyName" required>
                  <div class="invalid-feedback">企業名を入力してください（2文字以上）</div>
                </div>
                <div class="mb-3">
                  <label for="adminName" class="form-label">管理者氏名</label>
                  <input type="text" class="form-control" id="adminName" required>
                  <div class="invalid-feedback">氏名を入力してください（2文字以上）</div>
                </div>
                <div class="mb-3">
                  <label for="adminEmail" class="form-label">メールアドレス</label>
                  <input type="email" class="form-control" id="adminEmail" required>
                  <div class="invalid-feedback">有効なメールアドレスを入力してください</div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
              <button type="button" class="btn btn-primary" id="send-admin-invitation-btn">
                <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                招待リンクを作成
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 招待リンク表示モーダル -->
      <div class="modal fade" id="adminInviteLinkModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">管理者招待リンク</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>以下のリンクをコピーして、招待する管理者に送信してください。</p>
              <div class="input-group">
                <input type="text" class="form-control" id="adminInviteLinkInput" readonly>
                <button class="btn btn-outline-secondary" id="copy-admin-link-btn" type="button">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <small class="text-muted">このリンクは7日間有効です。</small>
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
    this.setupModals();
    await this.loadData();
  }

  setupModals() {
    this.inviteAdminModal = new bootstrap.Modal(document.getElementById('inviteAdminModal'));
    this.inviteLinkModal = new bootstrap.Modal(document.getElementById('adminInviteLinkModal'));
  }

  setupEventListeners() {
    // タブ切り替え
    document.getElementById('approvals-tab-btn').addEventListener('click', () => this.switchTab('approvals'));
    document.getElementById('tenants-tab-btn').addEventListener('click', () => this.switchTab('tenants'));

    // 管理者招待ボタン
    document.getElementById('invite-admin-btn').addEventListener('click', () => this.openInviteAdminModal());
    document.getElementById('send-admin-invitation-btn').addEventListener('click', () => this.sendAdminInvitation());
    document.getElementById('copy-admin-link-btn').addEventListener('click', () => this.copyAdminInviteLink());

    // フォームバリデーション
    const form = document.getElementById('inviteAdminForm');
    form.addEventListener('input', (e) => this.validateField(e.target));

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

  validateField(field) {
    let isValid = false;
    const value = field.value.trim();

    switch(field.id) {
      case 'adminCompanyName':
        isValid = this.app.api.validateCompanyName(value);
        break;
      case 'adminName':
        isValid = this.app.api.validateName(value);
        break;
      case 'adminEmail':
        isValid = this.app.api.validateEmail(value);
        break;
    }

    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }

    return isValid;
  }

  validateForm() {
    const form = document.getElementById('inviteAdminForm');
    const fields = form.querySelectorAll('input[required]');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  openInviteAdminModal() {
    // フォームをリセット
    const form = document.getElementById('inviteAdminForm');
    form.reset();
    form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
    
    this.inviteAdminModal.show();
  }

  async sendAdminInvitation() {
    if (!this.validateForm()) {
      this.app.showError('入力内容を確認してください');
      return;
    }

    const btn = document.getElementById('send-admin-invitation-btn');
    const spinner = btn.querySelector('.spinner-border');
    
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      const invitationData = {
        companyName: document.getElementById('adminCompanyName').value.trim(),
        name: document.getElementById('adminName').value.trim(),
        email: document.getElementById('adminEmail').value.trim(),
        role: 'admin'
      };

      const token = await this.app.api.createAdminInvitation(invitationData);
      
      // モーダルを閉じて、リンク表示モーダルを開く
      this.inviteAdminModal.hide();
      
      // URLを生成して表示
      const url = `${window.location.origin}${window.location.pathname}#/register-admin?token=${token}`;
      document.getElementById('adminInviteLinkInput').value = url;
      
      this.inviteLinkModal.show();
      
    } catch (error) {
      this.app.showError('招待の作成に失敗しました: ' + error.message);
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  }

  copyAdminInviteLink() {
    const input = document.getElementById('adminInviteLinkInput');
    navigator.clipboard.writeText(input.value).then(() => {
      this.app.showSuccess('リンクをコピーしました');
    }).catch(() => {
      // フォールバック
      input.select();
      document.execCommand('copy');
      this.app.showSuccess('リンクをコピーしました');
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
      container.innerHTML = `
        <div class="text-center p-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">承認待ちの管理者はいません</p>
        </div>
      `;
      return;
    }
    container.innerHTML = this.createTable(this.pendingAdmins, true);
  }

  renderTenantList() {
    const container = document.getElementById('active-tenants-list');
     if (this.activeTenants.length === 0) {
      container.innerHTML = `
        <div class="text-center p-5">
          <i class="fas fa-building fa-3x text-muted mb-3"></i>
          <p class="text-muted">アクティブなテナントはありません</p>
        </div>
      `;
      return;
    }
    container.innerHTML = this.createTable(this.activeTenants, false);
  }

  createTable(data, isPending) {
    const headers = isPending 
        ? ['auth.company', 'auth.name', 'auth.email', 'users.created_at', 'users.actions']
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
        <td>${this.app.formatDate(admin.createdAt)}</td>
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
