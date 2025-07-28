/**
 * User Management Page Component
 * ユーザー管理ページコンポーネント
 */
class UserManagementPage {
  constructor(app) {
    this.app = app;
    this.users = [];
    this.filteredUsers = [];
    this.currentFilter = "all";
    this.searchQuery = "";
    this.userModal = null; // モーダルのインスタンスを保持
  }

  /**
   * Render user management page
   * ユーザー管理ページを描画
   */
  async render() {
    return `
            <div class="app-layout">
                <div class="main-content" id="mainContent">
                    <div class="content-wrapper">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h1>ユーザー管理</h1>
                            <div class="user-actions">
                                <button class="btn btn-primary" onclick="window.app.currentPage.showAddUserModal()">
                                    <i class="fas fa-plus me-2"></i>新規ユーザー追加
                                </button>
                            </div>
                        </div>

                        <!-- Filters and Search -->
                        <div class="card mb-4">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-search"></i>
                                            </span>
                                            <input type="text" class="form-control" placeholder="ユーザー名またはメールアドレスで検索"
                                                   id="userSearch" onkeyup="window.app.currentPage.handleSearch(this.value)">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <select class="form-select" id="roleFilter" onchange="window.app.currentPage.handleFilter(this.value)">
                                            <option value="all">全ての役割</option>
                                            <option value="admin">管理者</option>
                                            <option value="evaluator">評価者</option>
                                            <option value="worker">作業員</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Users Table -->
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">ユーザー一覧</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>名前</th>
                                                <th>メールアドレス</th>
                                                <th>役割</th>
                                                <th>ステータス</th>
                                                <th>最終ログイン</th>
                                                <th>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody id="usersTableBody">
                                            <tr>
                                                <td colspan="6" class="text-center">
                                                    <div class="spinner-border text-primary" role="status">
                                                        <span class="visually-hidden">読み込み中...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
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
                            <h5 class="modal-title" id="userModalTitle">新規ユーザー追加</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="userForm" onsubmit="window.app.currentPage.handleSubmit(event)">
                            <div class="modal-body">
                                <input type="hidden" id="userId">
                                <div class="mb-3">
                                    <label for="userName" class="form-label">名前 *</label>
                                    <input type="text" class="form-control" id="userName" required>
                                </div>
                                <div class="mb-3">
                                    <label for="userEmail" class="form-label">メールアドレス *</label>
                                    <input type="email" class="form-control" id="userEmail" required>
                                </div>
                                <div class="mb-3">
                                    <label for="userRole" class="form-label">役割 *</label>
                                    <select class="form-select" id="userRole" required>
                                        <option value="">選択してください</option>
                                        <option value="worker">作業員</option>
                                        <option value="evaluator">評価者</option>
                                        <option value="admin">管理者</option>
                                    </select>
                                </div>
                                <div class="mb-3" id="passwordSection">
                                    <label for="userPassword" class="form-label">パスワード</label>
                                    <input type="password" class="form-control" id="userPassword">
                                    <div class="form-text">新規作成時のみ必須。8文字以上で入力してください</div>
                                </div>
                                <div class="mb-3">
                                    <label for="userStatus" class="form-label">ステータス *</label>
                                    <select class="form-select" id="userStatus" required>
                                        <option value="active">アクティブ</option>
                                        <option value="pending_approval">承認待ち</option>
                                        <option value="inactive">無効</option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    <span class="spinner-border spinner-border-sm me-2 d-none" id="submitSpinner"></span>
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Initialize user management page
   * ユーザー管理ページを初期化
   */
  async init() {
    this.app.currentPage = this;

    // Check permissions
    if (!this.app.hasRole("admin")) {
      this.app.navigate("/dashboard");
      return;
    }

    // Update header and sidebar
    if (window.HeaderComponent) {
      window.HeaderComponent.update(this.app.currentUser);
    }
    if (window.SidebarComponent) {
      window.SidebarComponent.update(this.app.currentUser);
    }

    // モーダルのインスタンスを準備
    const userModalElement = document.getElementById('userModal');
    if (userModalElement && window.bootstrap) {
        this.userModal = new window.bootstrap.Modal(userModalElement);
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
    try {
      // Mock users data
      this.users = [
        { id: "1", name: "管理者 太郎", email: "admin@example.com", role: "admin", status: "active", lastLogin: "2024-07-28 09:30" },
        { id: "2", name: "評価者 花子", email: "evaluator@example.com", role: "evaluator", status: "active", lastLogin: "2024-07-27 16:45" },
        { id: "3", name: "作業員 次郎", email: "worker@example.com", role: "worker", status: "active", lastLogin: "2024-07-28 08:15" },
        { id: "4", name: "承認待ち 三郎", email: "pending@example.com", role: "worker", status: "pending_approval", lastLogin: null },
        { id: "5", name: "無効 四郎", email: "inactive@example.com", role: "worker", status: "inactive", lastLogin: "2024-07-10 17:20" },
      ];

      this.filteredUsers = [...this.users];
      this.renderUsersTable();
    } catch (error)      console.error("Error loading users:", error);
      this.app.showError("ユーザーデータの読み込みに失敗しました。");
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
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">ユーザーが見つかりません</td></tr>`;
      return;
    }

    tbody.innerHTML = this.filteredUsers.map(user => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar-sm bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                             style="width: 32px; height: 32px; font-size: 0.8rem;">
                            ${this.app.sanitizeHtml(user.name.charAt(0))}
                        </div>
                        <div class="fw-bold">${this.app.sanitizeHtml(user.name)}</div>
                    </div>
                </td>
                <td>${this.app.sanitizeHtml(user.email)}</td>
                <td><span class="badge ${this.getRoleBadgeClass(user.role)}">${this.getRoleLabel(user.role)}</span></td>
                <td><span class="badge ${this.getStatusBadgeClass(user.status)}">${this.getStatusLabel(user.status)}</span></td>
                <td><small>${user.lastLogin || "なし"}</small></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.app.currentPage.editUser('${user.id}')" title="編集">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="window.app.currentPage.deleteUser('${user.id}')" title="削除" ${user.role === "admin" ? "disabled" : ""}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
  }
  
  // ラベルとバッジクラスを取得するヘルパーメソッド群
  getRoleBadgeClass(role) {
    const classes = { admin: "bg-danger", evaluator: "bg-info", worker: "bg-secondary" };
    return classes[role] || "bg-secondary";
  }
  getRoleLabel(role) {
    const labels = { admin: "管理者", evaluator: "評価者", worker: "作業員" };
    return labels[role] || role;
  }
  getStatusBadgeClass(status) {
      const classes = { active: "bg-success", pending_approval: "bg-warning", inactive: "bg-secondary"};
      return classes[status] || "bg-dark";
  }
  getStatusLabel(status) {
      const labels = { active: "アクティブ", pending_approval: "承認待ち", inactive: "無効" };
      return labels[status] || status;
  }

  /**
   * Handle search
   * 検索を処理
   */
  handleSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.applyFilters();
  }

  /**
   * Handle filter
   * フィルターを処理
   */
  handleFilter(filter) {
    this.currentFilter = filter;
    this.applyFilters();
  }

  /**
   * Apply filters
   * フィルターを適用
   */
  applyFilters() {
    this.filteredUsers = this.users.filter((user) => {
      const roleMatch = this.currentFilter === "all" || user.role === this.currentFilter;
      const searchMatch = this.searchQuery === "" ||
        user.name.toLowerCase().includes(this.searchQuery) ||
        user.email.toLowerCase().includes(this.searchQuery);
      return roleMatch && searchMatch;
    });
    this.renderUsersTable();
  }

  /**
   * Show add user modal
   * ユーザー追加モーダルを表示
   */
  showAddUserModal() {
    const form = document.getElementById("userForm");
    const title = document.getElementById("userModalTitle");
    const passwordSection = document.getElementById("passwordSection");
    const passwordInput = document.getElementById("userPassword");

    form.reset();
    document.getElementById("userId").value = "";
    title.textContent = "新規ユーザー追加";
    passwordSection.style.display = "block";
    passwordInput.required = true;

    if (this.userModal) this.userModal.show();
  }

  /**
   * Edit user
   * ユーザーを編集
   */
  editUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    const title = document.getElementById("userModalTitle");
    const passwordSection = document.getElementById("passwordSection");
    const passwordInput = document.getElementById("userPassword");

    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userRole").value = user.role;
    document.getElementById("userStatus").value = user.status;

    title.textContent = "ユーザー編集";
    passwordSection.style.display = "block"; // パスワードは変更可能にする
    passwordInput.required = false; // ただし必須ではない
    passwordInput.placeholder = "変更する場合のみ入力";

    if (this.userModal) this.userModal.show();
  }

  /**
   * Handle form submission
   * フォーム送信を処理
   */
  async handleSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const submitSpinner = document.getElementById("submitSpinner");
    const userId = document.getElementById("userId").value;

    submitBtn.disabled = true;
    submitSpinner.classList.remove("d-none");

    try {
      const userData = {
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        role: document.getElementById("userRole").value,
        status: document.getElementById("userStatus").value,
      };

      if (userId) { // 更新の場合
        const userIndex = this.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...userData };
          this.app.showSuccess("ユーザー情報を更新しました。");
        }
      } else { // 新規作成の場合
        userData.password = document.getElementById("userPassword").value;
        if (!userData.password || userData.password.length < 8) {
            throw new Error("パスワードは8文字以上で入力してください。");
        }
        userData.id = `user-${Date.now()}`;
        userData.lastLogin = null;
        this.users.push(userData);
        this.app.showSuccess("新規ユーザーを追加しました。");
      }

      this.applyFilters();
      if (this.userModal) this.userModal.hide();

    } catch (error) {
      console.error("Error saving user:", error);
      this.app.showError(error.message || "ユーザーの保存に失敗しました。");
    } finally {
      submitBtn.disabled = false;
      submitSpinner.classList.add("d-none");
    }
  }

  /**
   * Delete user
   * ユーザーを削除
   */
  deleteUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    if (user.role === "admin") {
      this.app.showError("管理者ユーザーは削除できません。");
      return;
    }

    if (confirm(`${user.name} を削除しますか？この操作は取り消せません。`)) {
      this.users = this.users.filter((u) => u.id !== userId);
      this.applyFilters();
      this.app.showSuccess("ユーザーを削除しました。");
    }
  }
}

// Make UserManagementPage globally available
window.UserManagementPage = UserManagementPage;
