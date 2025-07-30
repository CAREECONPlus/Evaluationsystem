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
            <div class="user-management-page">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 data-i18n="users.title"></h1>
                    <div class="user-actions">
                        <button class="btn btn-primary" onclick="window.app.currentPage.showAddUserModal()">
                            <i class="fas fa-plus me-2"></i><span data-i18n="users.invite"></span>
                        </button>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-8">
                                <input type="text" class="form-control" data-i18n-placeholder="users.search_users"
                                       id="userSearch" onkeyup="window.app.currentPage.handleSearch(this.value)">
                            </div>
                            <div class="col-md-4">
                                <select class="form-select" id="roleFilter" onchange="window.app.currentPage.handleFilter(this.value)">
                                    <option value="all" data-i18n="roles.all"></option>
                                    <option value="admin" data-i18n="roles.admin"></option>
                                    <option value="evaluator" data-i18n="roles.evaluator"></option>
                                    <option value="worker" data-i18n="roles.worker"></option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Users Table -->
                <div class="card">
                    <div class="card-header"><h5 class="mb-0" data-i18n="users.active_users"></h5></div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th data-i18n="auth.name"></th>
                                        <th data-i18n="auth.email"></th>
                                        <th data-i18n="users.role"></th>
                                        <th data-i18n="users.status"></th>
                                        <th data-i18n="users.created_at"></th>
                                        <th data-i18n="users.actions"></th>
                                    </tr>
                                </thead>
                                <tbody id="usersTableBody"></tbody>
                            </table>
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
                                <div class="mb-3"><label for="userName" class="form-label" data-i18n="auth.name"></label><input type="text" class="form-control" id="userName" required></div>
                                <div class="mb-3"><label for="userEmail" class="form-label" data-i18n="auth.email"></label><input type="email" class="form-control" id="userEmail" required></div>
                                <div class="mb-3"><label for="userRole" class="form-label" data-i18n="users.role"></label>
                                    <select class="form-select" id="userRole" required>
                                        <option value="" data-i18n="common.select"></option>
                                        <option value="worker" data-i18n="roles.worker"></option>
                                        <option value="evaluator" data-i18n="roles.evaluator"></option>
                                        <option value="admin" data-i18n="roles.admin"></option>
                                    </select>
                                </div>
                                <div class="mb-3" id="passwordSection"><label for="userPassword" class="form-label" data-i18n="auth.password"></label><input type="password" class="form-control" id="userPassword"><div class="form-text" data-i18n="messages.password_edit_hint"></div></div>
                                <div class="mb-3"><label for="userStatus" class="form-label" data-i18n="users.status"></label>
                                    <select class="form-select" id="userStatus" required>
                                        <option value="active" data-i18n="status.active"></option>
                                        <option value="pending_approval" data-i18n="status.pending_approval"></option>
                                        <option value="inactive" data-i18n="status.inactive"></option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel"></button>
                                <button type="submit" class="btn btn-primary" id="submitBtn"><span data-i18n="common.save"></span></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Initialize user management page
   */
  async init() {
    this.app.currentPage = this;

    if (!this.app.hasAnyRole(["admin", "developer"])) {
      this.app.navigate("/dashboard");
      return;
    }
    
    const modalEl = document.getElementById('userModal');
    if(modalEl) {
        this.userModal = new window.bootstrap.Modal(modalEl);
    }

    await this.loadUsers();

    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  /**
   * Load users data
   */
  async loadUsers() {
    const tableBody = document.getElementById("usersTableBody");
    if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
    
    try {
      this.users = await this.app.api.getUsers();
      this.applyFilters();
    } catch (error) {
      console.error("Error loading users:", error);
      this.app.showError(this.app.i18n.t("errors.users_load_failed"));
      if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger p-5">${this.app.i18n.t("errors.loading_failed")}</td></tr>`;
    }
  }

  /**
   * Render users table
   */
  renderUsersTable() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (this.filteredUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted p-5" data-i18n="common.no_data"></td></tr>`;
      this.app.i18n.updateUI(tbody);
      return;
    }

    tbody.innerHTML = this.filteredUsers.map(user => `
            <tr>
                <td>${this.app.sanitizeHtml(user.name)}</td>
                <td>${this.app.sanitizeHtml(user.email)}</td>
                <td><span class="badge ${this.app.getRoleBadgeClass(user.role)}">${this.app.i18n.t('roles.' + user.role)}</span></td>
                <td><span class="badge ${this.app.getStatusBadgeClass(user.status)}">${this.app.i18n.t('status.' + user.status)}</span></td>
                <td>${this.app.formatDate(user.createdAt)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.app.currentPage.editUser('${user.id}')" title="${this.app.i18n.t('common.edit')}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-outline-danger" onclick="window.app.currentPage.deleteUser('${user.id}')" title="${this.app.i18n.t('common.delete')}" ${user.role === 'admin' ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
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
    document.getElementById("userModalTitle").textContent = this.app.i18n.t("users.invite");
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
    document.getElementById("userStatus").value = user.status;
    document.getElementById("userModalTitle").textContent = this.app.i18n.t("common.edit_user");
    document.getElementById("passwordSection").style.display = "block";
    document.getElementById("userPassword").required = false;
    document.getElementById("userPassword").placeholder = this.app.i18n.t("messages.password_edit_placeholder");

    this.userModal.show();
  }

  async handleSubmit(event) {
    event.preventDefault();
    const userId = document.getElementById("userId").value;
    const userData = {
      name: document.getElementById("userName").value,
      email: document.getElementById("userEmail").value,
      role: document.getElementById("userRole").value,
      status: document.getElementById("userStatus").value,
    };
    
    // Mock API call
    if (userId) { // Update
      const userIndex = this.users.findIndex(u => u.id == userId);
      this.users[userIndex] = { ...this.users[userIndex], ...userData };
      this.app.showSuccess(this.app.i18n.t("messages.user_update_success"));
    } else { // Create
      userData.id = this.app.generateId();
      userData.createdAt = new Date().toISOString();
      this.users.push(userData);
      this.app.showSuccess(this.app.i18n.t("messages.user_add_success"));
    }

    this.applyFilters();
    this.userModal.hide();
  }

  deleteUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    if (user.role === 'admin') {
        this.app.showWarning(this.app.i18n.t("errors.cannot_delete_admin"));
        return;
    }
    if (confirm(this.app.i18n.t("common.confirm_delete_user", {userName: user.name}))) {
      this.users = this.users.filter((u) => u.id !== userId);
      this.applyFilters();
      this.app.showSuccess(this.app.i18n.t("messages.user_delete_success"));
    }
  }
}

window.UserManagementPage = UserManagementPage;
