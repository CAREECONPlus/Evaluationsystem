/**
 * User Management Page Component
 * ユーザー管理ページコンポーネント
 */
class UserManagementPage {
  constructor(app) {
    this.app = app;
    this.users = [];
    this.filteredUsers = [];
    this.jobTypes = []; // 職種リストを保持
    this.userModal = null;
  }

  async render() {
    return `
      <div class="user-management-page p-4 mx-auto" style="max-width: 1140px;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 data-i18n="users.title"></h1>
          <button class="btn btn-primary" onclick="window.app.currentPage.showAddUserModal()">
            <i class="fas fa-plus me-2"></i><span data-i18n="users.invite"></span>
          </button>
        </div>

        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th data-i18n="auth.name"></th>
                    <th data-i18n="auth.email"></th>
                    <th data-i18n="users.role"></th>
                    <th data-i18n="evaluation.job_type"></th>
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
                <div class="mb-3">
                  <label for="userName" class="form-label" data-i18n="auth.name"></label>
                  <input type="text" class="form-control" id="userName" required>
                </div>
                <div class="mb-3">
                  <label for="userEmail" class="form-label" data-i18n="auth.email"></label>
                  <input type="email" class="form-control" id="userEmail" required>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="userRole" class="form-label" data-i18n="users.role"></label>
                    <select class="form-select" id="userRole" required>
                      <option value="worker" data-i18n="roles.worker"></option>
                      <option value="evaluator" data-i18n="roles.evaluator"></option>
                      <option value="admin" data-i18n="roles.admin"></option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="userJobType" class="form-label" data-i18n="evaluation.job_type"></label>
                    <select class="form-select" id="userJobType" required></select>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="userStatus" class="form-label" data-i18n="users.status"></label>
                  <select class="form-select" id="userStatus" required>
                    <option value="active" data-i18n="status.active"></option>
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

  async init() {
    this.app.currentPage = this;
    if (!this.app.hasRole("admin")) {
      this.app.navigate("/dashboard");
      return;
    }
    this.userModal = new window.bootstrap.Modal(document.getElementById('userModal'));
    await this.loadInitialData();
  }

  async loadInitialData() {
    try {
      const [users, jobTypes] = await Promise.all([
        this.app.api.getUsers(),
        this.app.api.getJobTypes(),
      ]);
      this.users = users;
      this.jobTypes = jobTypes;
      this.filteredUsers = users;
      this.renderUsersTable();
      this.populateJobTypeDropdown();
      this.app.i18n.updateUI();
    } catch (error) {
      this.app.showError("データの読み込みに失敗しました。");
    }
  }

  renderUsersTable() {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = this.filteredUsers.map(user => `
      <tr>
        <td>${this.app.sanitizeHtml(user.name)}</td>
        <td>${this.app.sanitizeHtml(user.email)}</td>
        <td><span class="badge ${this.app.getRoleBadgeClass(user.role)}">${this.app.i18n.t('roles.' + user.role)}</span></td>
        <td>${this.app.sanitizeHtml(user.jobType)}</td>
        <td><span class="badge ${this.app.getStatusBadgeClass(user.status)}">${this.app.i18n.t('status.' + user.status)}</span></td>
        <td>${this.app.formatDate(user.createdAt)}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="window.app.currentPage.editUser('${user.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline-danger" onclick="window.app.currentPage.deleteUser('${user.id}')" ${user.role === 'admin' ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join("");
  }
  
  populateJobTypeDropdown() {
      const select = document.getElementById('userJobType');
      select.innerHTML = this.jobTypes.map(jt => `<option value="${jt.name}">${this.app.sanitizeHtml(jt.name)}</option>`).join('');
  }

  showAddUserModal() {
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
    document.getElementById("userModalTitle").textContent = this.app.i18n.t("users.invite");
    this.userModal.show();
  }

  editUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userRole").value = user.role;
    document.getElementById("userJobType").value = user.jobType;
    document.getElementById("userStatus").value = user.status;
    document.getElementById("userModalTitle").textContent = this.app.i18n.t("common.edit_user");
    this.userModal.show();
  }

  async handleSubmit(event) {
    event.preventDefault();
    const userId = document.getElementById("userId").value;
    const userData = {
      name: document.getElementById("userName").value,
      email: document.getElementById("userEmail").value,
      role: document.getElementById("userRole").value,
      jobType: document.getElementById("userJobType").value,
      status: document.getElementById("userStatus").value,
    };
    
    if (userId) { // 更新
      const userIndex = this.users.findIndex(u => u.id === userId);
      this.users[userIndex] = { ...this.users[userIndex], ...userData };
    } else { // 新規作成
      userData.id = this.app.generateId();
      userData.createdAt = new Date().toISOString();
      this.users.push(userData);
    }
    
    this.filteredUsers = this.users;
    this.renderUsersTable();
    this.userModal.hide();
  }

  deleteUser(userId) {
    if (confirm("本当にこのユーザーを削除しますか？")) {
      this.users = this.users.filter(u => u.id !== userId);
      this.filteredUsers = this.users;
      this.renderUsersTable();
    }
  }
}

window.UserManagementPage = UserManagementPage;
