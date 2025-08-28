/**
 * User Management Page Component
 * ユーザー管理ページコンポーネント
 */
export class UserManagementPage {
  constructor(app) {
    this.app = app;
    this.users = [];
    this.filteredUsers = [];
    this.currentFilter = 'all';
    this.searchTerm = '';
  }

  async render() {
    return `
      <div class="container-fluid px-4">
        <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
          <div>
            <h1 class="h3 mb-1" data-i18n="users.title">ユーザー管理</h1>
            <p class="text-muted mb-0" data-i18n="users.subtitle">組織内のユーザーを管理します</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" id="invite-user-btn">
              <i class="fas fa-user-plus me-2"></i>
              <span data-i18n="users.invite_user">ユーザーを招待</span>
            </button>
            <button class="btn btn-outline-secondary" id="refresh-users-btn">
              <i class="fas fa-sync-alt me-2"></i>
              <span data-i18n="common.refresh">更新</span>
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row py-3">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title text-white-50" data-i18n="users.total_users">総ユーザー数</h6>
                    <h3 class="mb-0" id="total-users-count">0</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-users fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title text-white-50" data-i18n="users.active_users">アクティブ</h6>
                    <h3 class="mb-0" id="active-users-count">0</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-user-check fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title text-white-50" data-i18n="users.pending_users">承認待ち</h6>
                    <h3 class="mb-0" id="pending-users-count">0</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-user-clock fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h6 class="card-title text-white-50" data-i18n="users.admin_users">管理者</h6>
                    <h3 class="mb-0" id="admin-users-count">0</h3>
                  </div>
                  <div class="align-self-center">
                    <i class="fas fa-user-shield fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <div class="row align-items-center">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input type="text" class="form-control" id="user-search" 
                         placeholder="ユーザー名またはメールアドレスで検索">
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex gap-2 justify-content-end">
                  <select class="form-select" id="status-filter" style="width: auto;">
                    <option value="all" data-i18n="users.all_status">すべてのステータス</option>
                    <option value="active" data-i18n="users.active">アクティブ</option>
                    <option value="inactive" data-i18n="users.inactive">非アクティブ</option>
                    <option value="pending" data-i18n="users.pending">承認待ち</option>
                  </select>
                  <select class="form-select" id="role-filter" style="width: auto;">
                    <option value="all" data-i18n="users.all_roles">すべての役割</option>
                    <option value="admin" data-i18n="roles.admin">管理者</option>
                    <option value="evaluator" data-i18n="roles.evaluator">評価者</option>
                    <option value="worker" data-i18n="roles.worker">一般ユーザー</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div id="users-list-container">
              <!-- Users list will be rendered here -->
            </div>
          </div>
        </div>
      </div>

      <!-- User Invite Modal -->
      <div class="modal fade" id="inviteUserModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" data-i18n="users.invite_user">ユーザーを招待</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="invite-user-form">
                <div class="mb-3">
                  <label for="invite-email" class="form-label" data-i18n="auth.email">メールアドレス</label>
                  <input type="email" class="form-control" id="invite-email" required>
                </div>
                <div class="mb-3">
                  <label for="invite-role" class="form-label" data-i18n="users.role">役割</label>
                  <select class="form-select" id="invite-role" required>
                    <option value="evaluator" data-i18n="roles.evaluator">評価者</option>
                    <option value="worker" data-i18n="roles.worker">一般ユーザー</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="invite-message" class="form-label" data-i18n="users.invitation_message">招待メッセージ（任意）</label>
                  <textarea class="form-control" id="invite-message" rows="3"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" 
                      data-i18n="common.cancel">キャンセル</button>
              <button type="button" class="btn btn-primary" id="send-invitation-btn">
                <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                <span data-i18n="users.send_invitation">招待を送信</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div class="modal fade" id="editUserModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" data-i18n="users.edit_user">ユーザー編集</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="edit-user-form">
                <input type="hidden" id="edit-user-id">
                <div class="mb-3">
                  <label for="edit-user-name" class="form-label" data-i18n="auth.name">氏名</label>
                  <input type="text" class="form-control" id="edit-user-name" required>
                </div>
                <div class="mb-3">
                  <label for="edit-user-email" class="form-label" data-i18n="auth.email">メールアドレス</label>
                  <input type="email" class="form-control" id="edit-user-email" readonly>
                </div>
                <div class="mb-3">
                  <label for="edit-user-role" class="form-label" data-i18n="users.role">役割</label>
                  <select class="form-select" id="edit-user-role" required>
                    <option value="admin" data-i18n="roles.admin">管理者</option>
                    <option value="evaluator" data-i18n="roles.evaluator">評価者</option>
                    <option value="worker" data-i18n="roles.worker">一般ユーザー</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="edit-user-status" class="form-label" data-i18n="users.status">ステータス</label>
                  <select class="form-select" id="edit-user-status" required>
                    <option value="active" data-i18n="users.active">アクティブ</option>
                    <option value="inactive" data-i18n="users.inactive">非アクティブ</option>
                    <option value="pending" data-i18n="users.pending">承認待ち</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" 
                      data-i18n="common.cancel">キャンセル</button>
              <button type="button" class="btn btn-primary" id="save-user-btn">
                <span class="spinner-border spinner-border-sm d-none" role="status"></span>
                <span data-i18n="common.save">保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    console.log("UserManagement: Starting initialization...");
    this.app.currentPage = this;
    
    // データの読み込み
    await this.loadData();
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // 国際化の適用
    this.app.i18n.updateUI();
    
    console.log("UserManagement: Initialization completed successfully");
  }

  async loadData() {
    try {
      console.log("UserManagement: Loading users...");
      
      // getUsersメソッドの存在確認
      if (typeof this.app.api.getUsers !== 'function') {
        console.error("UserManagement: getUsers method not found in api");
        throw new Error("API: getUsers メソッドが見つかりません。api.js を確認してください。");
      }

      // ローディング表示
      this.showLoading();

      // ユーザー一覧を取得
      const users = await this.app.api.getUsers();
      console.log("UserManagement: Users loaded:", users);

      // データを保存
      this.users = users || [];

      // UI を更新
      this.renderUsersList();
      this.updateStats();

      console.log("UserManagement: Data loaded successfully");

    } catch (error) {
      console.error("Failed to load users:", error);
      
      // エラーメッセージを表示
      let errorMessage = "ユーザーデータの読み込みに失敗しました。";
      
      if (error.message.includes("getUsers")) {
        errorMessage = "API メソッドが見つかりません。システム管理者にお問い合わせください。";
      } else if (error.code === 'permission-denied') {
        errorMessage = "アクセス権限がありません。管理者権限が必要です。";
      } else if (error.message.includes("テナント")) {
        errorMessage = "テナント情報が見つかりません。ログインし直してください。";
      }

      this.showError(errorMessage);
    }
  }

  // ローディング表示メソッド
  showLoading() {
    const container = document.getElementById('users-list-container');
    if (container) {
      container.innerHTML = `
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">読み込み中...</span>
          </div>
        </div>
      `;
    }
  }

  // エラー表示メソッド
  showError(message) {
    const container = document.getElementById('users-list-container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger m-3" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${message}
          <div class="mt-3">
            <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">
              <i class="fas fa-redo me-1"></i>再試行
            </button>
          </div>
        </div>
      `;
    }
  }

  renderUsersList() {
    const container = document.getElementById('users-list-container');
    if (!container) return;

    // フィルターを適用
    this.applyFilters();

    if (this.filteredUsers.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-users fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">ユーザーが見つかりません</h5>
          <p class="text-muted">条件に一致するユーザーがいません。</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th data-i18n="auth.name">氏名</th>
              <th data-i18n="auth.email">メールアドレス</th>
              <th data-i18n="users.role">役割</th>
              <th data-i18n="users.status">ステータス</th>
              <th data-i18n="common.created_at">作成日</th>
              <th data-i18n="common.actions">操作</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.filteredUsers.forEach(user => {
      const statusBadge = this.getStatusBadge(user.status);
      const roleBadge = this.getRoleBadge(user.role);
      const createdAt = user.createdAt ? new Date(user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt).toLocaleDateString() : '-';

      html += `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div class="fw-medium">${this.app.sanitizeHtml(user.name || 'Unknown')}</div>
              </div>
            </div>
          </td>
          <td>${this.app.sanitizeHtml(user.email || '')}</td>
          <td>${roleBadge}</td>
          <td>${statusBadge}</td>
          <td>${createdAt}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="window.userManagement.editUser('${user.id}')" 
                      title="編集">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="window.userManagement.deleteUser('${user.id}')" 
                      title="削除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    // グローバル参照を設定（ボタンから呼び出すため）
    window.userManagement = this;
  }

  getStatusBadge(status) {
    const badges = {
      'active': '<span class="badge bg-success">アクティブ</span>',
      'inactive': '<span class="badge bg-secondary">非アクティブ</span>',
      'pending': '<span class="badge bg-warning">承認待ち</span>',
      'suspended': '<span class="badge bg-danger">停止中</span>'
    };
    return badges[status] || '<span class="badge bg-light text-dark">不明</span>';
  }

  getRoleBadge(role) {
    const badges = {
      'admin': '<span class="badge bg-info">管理者</span>',
      'evaluator': '<span class="badge bg-primary">評価者</span>',
      'worker': '<span class="badge bg-secondary">一般ユーザー</span>',
      'developer': '<span class="badge bg-dark">開発者</span>'
    };
    return badges[role] || '<span class="badge bg-light text-dark">不明</span>';
  }

  updateStats() {
    const totalCount = this.users.length;
    const activeCount = this.users.filter(u => u.status === 'active').length;
    const pendingCount = this.users.filter(u => u.status === 'pending').length;
    const adminCount = this.users.filter(u => u.role === 'admin').length;

    document.getElementById('total-users-count').textContent = totalCount;
    document.getElementById('active-users-count').textContent = activeCount;
    document.getElementById('pending-users-count').textContent = pendingCount;
    document.getElementById('admin-users-count').textContent = adminCount;
  }

  applyFilters() {
    let filtered = [...this.users];

    // ステータスフィルター
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(user => user.status === this.currentFilter);
    }

    // 役割フィルター
    const roleFilter = document.getElementById('role-filter')?.value;
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // 検索フィルター
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
    }

    this.filteredUsers = filtered;
  }

  setupEventListeners() {
    // 検索
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.renderUsersList();
      });
    }

    // ステータスフィルター
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.renderUsersList();
      });
    }

    // 役割フィルター
    const roleFilter = document.getElementById('role-filter');
    if (roleFilter) {
      roleFilter.addEventListener('change', () => {
        this.renderUsersList();
      });
    }

    // 更新ボタン
    const refreshBtn = document.getElementById('refresh-users-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadData();
      });
    }

    // 招待ボタン
    const inviteBtn = document.getElementById('invite-user-btn');
    if (inviteBtn) {
      inviteBtn.addEventListener('click', () => {
        this.showInviteModal();
      });
    }

    // 招待送信ボタン
    const sendInvitationBtn = document.getElementById('send-invitation-btn');
    if (sendInvitationBtn) {
      sendInvitationBtn.addEventListener('click', () => {
        this.sendInvitation();
      });
    }

    // ユーザー保存ボタン
    const saveUserBtn = document.getElementById('save-user-btn');
    if (saveUserBtn) {
      saveUserBtn.addEventListener('click', () => {
        this.saveUser();
      });
    }

    // モーダルイベントリスナーを追加
    const inviteModal = document.getElementById('inviteUserModal');
    if (inviteModal) {
      inviteModal.addEventListener('hidden.bs.modal', () => {
        console.log('Invite modal hidden');
        // フォームをクリア
        const form = document.getElementById('invite-user-form');
        if (form) {
          form.reset();
          form.classList.remove('was-validated');
        }
        // ボタン状態をリセット
        const submitBtn = document.getElementById('send-invitation-btn');
        if (submitBtn) {
          submitBtn.disabled = false;
          const spinner = submitBtn.querySelector('.spinner-border');
          if (spinner) {
            spinner.classList.add('d-none');
          }
        }
      });

      inviteModal.addEventListener('show.bs.modal', () => {
        console.log('Invite modal showing');
      });
    }

    const editModal = document.getElementById('editUserModal');
    if (editModal) {
      editModal.addEventListener('hidden.bs.modal', () => {
        console.log('Edit modal hidden');
        const form = document.getElementById('edit-user-form');
        if (form) {
          form.reset();
          form.classList.remove('was-validated');
        }
        const submitBtn = document.getElementById('save-user-btn');
        if (submitBtn) {
          submitBtn.disabled = false;
          const spinner = submitBtn.querySelector('.spinner-border');
          if (spinner) {
            spinner.classList.add('d-none');
          }
        }
      });
    }
  }

  showInviteModal() {
    try {
      // 既存のモーダルが開いている場合は閉じる
      this.forceCloseModal('inviteUserModal');
      
      // フォームをリセット
      const form = document.getElementById('invite-user-form');
      if (form) {
        form.reset();
        form.classList.remove('was-validated');
      }
      
      // 送信ボタンの状態をリセット
      const submitBtn = document.getElementById('send-invitation-btn');
      const spinner = submitBtn?.querySelector('.spinner-border');
      if (spinner) {
        spinner.classList.add('d-none');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      
      // モーダルを表示
      const modal = new bootstrap.Modal(document.getElementById('inviteUserModal'), {
        backdrop: 'static',  // 背景クリックで閉じないように
        keyboard: false      // ESCキーで閉じないように
      });
      modal.show();
      
    } catch (error) {
      console.error('Failed to show invite modal:', error);
      this.app.showError('招待フォームの表示に失敗しました');
    }
  }

  async sendInvitation() {
    const form = document.getElementById('invite-user-form');
    const submitBtn = document.getElementById('send-invitation-btn');
    const spinner = submitBtn.querySelector('.spinner-border');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const email = document.getElementById('invite-email').value;
    const role = document.getElementById('invite-role').value;
    const message = document.getElementById('invite-message').value;

    try {
      console.log('招待送信開始...');
      spinner.classList.remove('d-none');
      submitBtn.disabled = true;

      await this.app.api.createInvitation({
        email: email,
        role: role,
        message: message,
        type: role
      });

      console.log('招待送信完了');
      
      // 成功メッセージを先に表示
      this.app.showSuccess('招待を送信しました');

      // モーダルを確実に閉じる
      this.closeModal('inviteUserModal');

      // リストを更新
      await this.loadData();

    } catch (error) {
      console.error('Failed to send invitation:', error);
      let errorMessage = '招待の送信に失敗しました';
      
      // エラーの詳細に基づいてメッセージを調整
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      this.app.showError(errorMessage);
    } finally {
      // 必ず実行される処理
      console.log('招待送信処理完了');
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
    }
  }

  editUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    // フォームに値を設定
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-name').value = user.name || '';
    document.getElementById('edit-user-email').value = user.email || '';
    document.getElementById('edit-user-role').value = user.role || 'worker';
    document.getElementById('edit-user-status').value = user.status || 'active';

    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
  }

  async saveUser() {
    const form = document.getElementById('edit-user-form');
    const submitBtn = document.getElementById('save-user-btn');
    const spinner = submitBtn.querySelector('.spinner-border');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-user-name').value;
    const role = document.getElementById('edit-user-role').value;
    const status = document.getElementById('edit-user-status').value;

    try {
      spinner.classList.remove('d-none');
      submitBtn.disabled = true;

      await this.app.api.updateUser(userId, {
        name: name,
        role: role,
        status: status
      });

      // モーダルを閉じる
      this.closeModal('editUserModal');

      this.app.showSuccess('ユーザー情報を更新しました');

      // リストを更新
      await this.loadData();

    } catch (error) {
      console.error('Failed to update user:', error);
      this.app.showError('ユーザー情報の更新に失敗しました');
    } finally {
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
    }
  }

  async deleteUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const confirmed = confirm(`${user.name || user.email} を削除してもよろしいですか？この操作は取り消せません。`);
    if (!confirmed) return;

    try {
      await this.app.api.deleteUser(userId);
      this.app.showSuccess('ユーザーを削除しました');
      
      // リストを更新
      await this.loadData();

    } catch (error) {
      console.error('Failed to delete user:', error);
      this.app.showError('ユーザーの削除に失敗しました');
    }
  }

  // モーダル関連のユーティリティメソッド
  closeModal(modalId) {
    try {
      const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
      if (modal) {
        modal.hide();
      } else {
        this.forceCloseModal(modalId);
      }
    } catch (error) {
      console.error('Modal close error:', error);
      this.forceCloseModal(modalId);
    }
  }

  forceCloseModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
    }
    
    // backdrop を削除
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // body の状態をリセット
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  }

  // デバッグ用: モーダル状態確認メソッド
  checkModalState() {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    const openModals = document.querySelectorAll('.modal.show');
    const bodyHasModalOpen = document.body.classList.contains('modal-open');
    
    console.log('Modal debug info:', {
      backdrops: backdrops.length,
      openModals: openModals.length,
      bodyHasModalOpen: bodyHasModalOpen,
      bodyStyle: document.body.style.paddingRight
    });
    
    return {
      backdrops: backdrops.length,
      openModals: openModals.length,
      bodyHasModalOpen
    };
  }

  cleanup() {
    // グローバル参照をクリーンアップ
    if (window.userManagement === this) {
      delete window.userManagement;
    }
    
    // モーダル関連のクリーンアップ
    this.forceCloseModal('inviteUserModal');
    this.forceCloseModal('editUserModal');
    
    console.log("UserManagement: Cleanup completed");
  }
}
