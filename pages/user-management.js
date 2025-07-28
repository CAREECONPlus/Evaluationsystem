/**
 * User Management Page Component
 * ユーザー管理ページコンポーネント
 */
class UserManagementPage {
  constructor(app) {
    this.app = app
    this.users = []
    this.filteredUsers = []
    this.currentFilter = "all"
    this.searchQuery = ""
    this.userModal = null;
  }

  /**
   * Render user management page
   * ユーザー管理ページを描画
   */
  async render() {
    return `
            <div class="app-layout">
                <div class="main-content" id="mainContent">
                    <div class="content-wrapper p-4">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h1 data-i18n="users.title">ユーザー管理</h1>
                            <div class="user-actions">
                                <button class="btn btn-primary" onclick="window.app.currentPage.showAddUserModal()">
                                    <i class="fas fa-plus me-2"></i><span data-i18n="users.invite">新規ユーザー追加</span>
                                </button>
                            </div>
                        </div>

                        <!-- Filters and Search -->
                        <div class="card mb-4">
                            <div class="card-body">
                                <div class="row g-2">
                                    <div class="col-md-8">
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                                            <input type="text" class="form-control" data-i18n-placeholder="users.search_users"
                                                   id="userSearch" onkeyup="window.app.currentPage.handleSearch(this.value)">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <select class="form-select" id="roleFilter" onchange="window.app.currentPage.handleFilter(this.value)">
                                            <option value="all" data-i18n="roles.all">全ての役割</option>
                                            <option value="admin" data-i18n="roles.admin">管理者</option>
                                            <option value="evaluator" data-i18n="roles.evaluator">評価者</option>
                                            <option value="worker" data-i18n="roles.worker">作業員</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Users Table -->
                        <div class="card">
                            <div class="card-header"><h5 class="mb-0" data-i18n="users.active_users">ユーザー一覧</h5></div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th data-i18n="auth.name">名前</th>
                                                <th data-i18n="auth.email">メールアドレス</th>
                                                <th data-i18n="users.role">役割</th>
                                                <th data-i18n="users.status">ステータス</th>
                                                <th data-i18n="users.created_at">登録日</th>
                                                <th data-i18n="users.actions">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody id="usersTableBody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add/Edit User Modal -->
            <div class="modal fade" id="userModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="userModalTitle"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="userForm" onsubmit="window.app.currentPage.handleSubmit(event)">
                            <div class="modal-body">
                                <input type="hidden" id="userId">
                                <div class="mb-3"><label for="userName" class="form-label" data-i18n="auth.name">名前 *</label><input type="text" class="form-control" id="userName" required></div>
                                <div class="mb-3"><label for="userEmail" class="form-label" data-i18n="auth.email">メールアドレス *</label><input type="email" class="form-control" id="userEmail" required></div>
                                <div class="mb-3"><label for="userRole" class="form-label" data-i18n="users.role">役割 *</label>
                                    <select class="form-select" id="userRole" required>
                                        <option value="" data-i18n="common.select">選択してください</option>
                                        <option value="worker" data-i18n="roles.worker">作業員</option>
                                        <option value="evaluator" data-i18n="roles.evaluator">評価者</option>
                                        <option value="admin" data-i18n="roles.admin">管理者</option>
                                    </select>
                                </div>
                                <div class="mb-3" id="passwordSection"><label for="userPassword" class="form-label" data-i18n="auth.password">パスワード *</label><input type="password" class="form-control" id="userPassword"><div class="form-text">新規作成時のみ。8文字以上で入力。</div></div>
                                <div class="form-check"><input class="form-check-input" type="checkbox" id="userStatus" checked><label class="form-check-label" for="userStatus" data-i18n="status.active">アクティブ</label></div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel">キャンセル</button>
                                <button type="submit" class="btn btn-primary" id="submitBtn"><span data-i18n="common.save">保存</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `
  }

  /**
   * Initialize user management page
   * ユーザー管理ページを初期化
   */
  async init() {
    this.app.currentPage = this;

    // Check permissions
    if (!this.app.hasAnyRole(["admin", "developer"])) {
      this.app.navigate("/dashboard");
      return;
    }
    
    // Setup modal
    const modalEl = document.getElementById('userModal');
    if(modalEl && window.bootstrap) {
        this.userModal = new window.bootstrap.Modal(modalEl);
    }

    // Load users data
    await this.loadUsers();

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  /**
   * Load users data
   * ユーザーデータを読み込み
   */
  async loadUsers() {
    const tableBody = document.getElementById("usersTableBody");
    if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>`;
    
    try {
      // Mock users data
      this.users = [
        { id: 1, name: "田中 太郎", email: "worker@example.com", role: "worker", status: "active", createdAt: "2024-01-15" },
        { id: 2, name: "佐藤 花子", email: "evaluator@example.com", role: "evaluator", status: "active", createdAt: "2024-01-14" },
        { id: 3, name: "山田 管理者", email: "admin@example.com", role: "admin", status: "active", createdAt: "2024-01-10" },
        { id: 4, name: "鈴木 三郎", email: "suzuki@example.com", role: "worker", status: "pending_approval", createdAt: "2024-02-01" },
      ];

      this.applyFilters();
    } catch (error) { // ★★★ 修正点: 構文エラーを修正 ★★★
      console.error("Error loading users:", error);
      this.app.showError("ユーザーデータの読み込みに失敗しました。");
      if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger p-5">読み込みに失敗しました。</td></tr>`;
    }
  }

  /**
   * Render users table
   * ユーザーテーブルを描画
   */
  renderUsersTable() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (this.filteredUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted p-5" data-i18n="common.no_data">ユーザーが見つかりません</td></tr>`;
      return;
    }

    tbody.innerHTML = this.filteredUsers.map(user => `
            <tr>
                <td>${this.app.sanitizeHtml(user.name)}</td>
                <td>${this.app.sanitizeHtml(user.email)}</td>
                <td><span class="badge ${this.getRoleBadgeClass(user.role)}">${this.app.i18n.t('roles.' + user.role)}</span></td>
                <td><span class="badge ${user.status === "active" ? "bg-success" : "bg-warning"}">${this.app.i18n.t('status.' + user.status)}</span></td>
                <td>${this.app.formatDate(user.createdAt)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.app.currentPage.editUser(${user.id})" title="編集"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-outline-danger" onclick="window.app.currentPage.deleteUser(${user.id})" title="削除" ${user.role === 'admin' ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join("");
  }

  getRoleBadgeClass(role) {
    return { admin: "bg-danger", evaluator: "bg-info", worker: "bg-secondary" }[role] || "bg-light text-dark";
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.applyFilters();
  }

  handleFilter(filter) {
    this.currentFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter((user) => {
      const roleMatch = this.currentFilter === "all" || user.role === this.currentFilter;
      const searchMatch = this.searchQuery === "" || user.name.toLowerCase().includes(this.searchQuery) || user.email.toLowerCase().includes(this.searchQuery);
      return roleMatch && searchMatch;
    });
    this.renderUsersTable();
  }

  showAddUserModal() {
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
    document.getElementById("userModalTitle").textContent = "新規ユーザー追加";
    document.getElementById("passwordSection").style.display = "block";
    document.getElementById("userPassword").required = true;
    this.userModal.show();
  }

  editUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    document.getElementById("userForm").reset();
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userRole").value = user.role;
    document.getElementById("userStatus").checked = user.status === "active";
    document.getElementById("userModalTitle").textContent = "ユーザー編集";
    document.getElementById("passwordSection").style.display = "none";
    document.getElementById("userPassword").required = false;

    this.userModal.show();
  }

  async handleSubmit(event) {
    event.preventDefault();
    const userId = document.getElementById("userId").value;
    const userData = {
      name: document.getElementById("userName").value,
      email: document.getElementById("userEmail").value,
      role: document.getElementById("userRole").value,
      status: document.getElementById("userStatus").checked ? "active" : "pending_approval",
    };
    
    // Mock API call
    if (userId) { // Update
      const userIndex = this.users.findIndex(u => u.id == userId);
      this.users[userIndex] = { ...this.users[userIndex], ...userData };
      this.app.showSuccess("ユーザー情報を更新しました。");
    } else { // Create
      userData.id = Date.now();
      userData.createdAt = new Date();
      this.users.push(userData);
      this.app.showSuccess("新規ユーザーを追加しました。");
    }

    this.applyFilters();
    this.userModal.hide();
  }

  deleteUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (user.role === 'admin') {
        this.app.showWarning("管理者アカウントは削除できません。");
        return;
    }
    if (confirm(`「${user.name}」を削除しますか？`)) {
      this.users = this.users.filter((u) => u.id !== userId);
      this.applyFilters();
      this.app.showSuccess("ユーザーを削除しました。");
    }
  }
}

window.UserManagementPage = UserManagementPage;
