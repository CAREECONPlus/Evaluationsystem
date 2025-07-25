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
    this.bootstrap = window.bootstrap // Declare the bootstrap variable
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
                                <button class="btn btn-primary" onclick="UserManagementPage.showAddUserModal()">
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
                                                   id="userSearch" onkeyup="UserManagementPage.handleSearch(this.value)">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <select class="form-select" id="roleFilter" onchange="UserManagementPage.handleFilter(this.value)">
                                            <option value="all">全ての役割</option>
                                            <option value="admin">管理者</option>
                                            <option value="manager">マネージャー</option>
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
                        <form id="userForm" onsubmit="UserManagementPage.handleSubmit(event)">
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
                                        <option value="manager">マネージャー</option>
                                        <option value="admin">管理者</option>
                                    </select>
                                </div>
                                <div class="mb-3" id="passwordSection">
                                    <label for="userPassword" class="form-label">パスワード *</label>
                                    <input type="password" class="form-control" id="userPassword">
                                    <div class="form-text">8文字以上で入力してください</div>
                                </div>
                                <div class="mb-3">
                                    <label for="userDepartment" class="form-label">部署</label>
                                    <input type="text" class="form-control" id="userDepartment">
                                </div>
                                <div class="mb-3">
                                    <label for="userPosition" class="form-label">役職</label>
                                    <input type="text" class="form-control" id="userPosition">
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="userActive" checked>
                                    <label class="form-check-label" for="userActive">
                                        アクティブ
                                    </label>
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
        `
  }

  /**
   * Initialize user management page
   * ユーザー管理ページを初期化
   */
  async init() {
    // Check permissions
    if (!this.app.hasRole("manager")) {
      this.app.navigate("/dashboard")
      return
    }

    // Update header and sidebar
    if (window.HeaderComponent) {
      window.HeaderComponent.update(this.app.currentUser)
    }
    if (window.SidebarComponent) {
      window.SidebarComponent.update(this.app.currentUser)
    }

    // Load users data
    await this.loadUsers()

    // Update UI with current language
    if (this.app.i18n) {
      this.app.i18n.updateUI()
    }
  }

  /**
   * Load users data
   * ユーザーデータを読み込み
   */
  async loadUsers() {
    try {
      // Mock users data - in real app, fetch from API
      this.users = [
        {
          id: 1,
          name: "田中太郎",
          email: "tanaka@example.com",
          role: "worker",
          department: "建設部",
          position: "作業員",
          status: "active",
          lastLogin: "2024-01-15 09:30",
        },
        {
          id: 2,
          name: "佐藤花子",
          email: "sato@example.com",
          role: "evaluator",
          department: "品質管理部",
          position: "主任",
          status: "active",
          lastLogin: "2024-01-14 16:45",
        },
        {
          id: 3,
          name: "山田次郎",
          email: "yamada@example.com",
          role: "manager",
          department: "管理部",
          position: "マネージャー",
          status: "active",
          lastLogin: "2024-01-15 08:15",
        },
        {
          id: 4,
          name: "鈴木三郎",
          email: "suzuki@example.com",
          role: "worker",
          department: "建設部",
          position: "作業員",
          status: "inactive",
          lastLogin: "2024-01-10 17:20",
        },
      ]

      this.filteredUsers = [...this.users]
      this.renderUsersTable()
    } catch (error) {
      console.error("Error loading users:", error)
      this.app.showError("ユーザーデータの読み込みに失敗しました。")
    }
  }

  /**
   * Render users table
   * ユーザーテーブルを描画
   */
  renderUsersTable() {
    const tbody = document.getElementById("usersTableBody")
    if (!tbody) return

    if (this.filteredUsers.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        ユーザーが見つかりません
                    </td>
                </tr>
            `
      return
    }

    const rows = this.filteredUsers
      .map(
        (user) => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar-sm bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" 
                             style="width: 32px; height: 32px; font-size: 0.8rem;">
                            ${user.name.charAt(0)}
                        </div>
                        <div>
                            <div class="fw-bold">${this.app.sanitizeHtml(user.name)}</div>
                            <small class="text-muted">${this.app.sanitizeHtml(user.department || "")}</small>
                        </div>
                    </div>
                </td>
                <td>${this.app.sanitizeHtml(user.email)}</td>
                <td>
                    <span class="badge ${this.getRoleBadgeClass(user.role)}">
                        ${this.getRoleLabel(user.role)}
                    </span>
                </td>
                <td>
                    <span class="badge ${user.status === "active" ? "bg-success" : "bg-secondary"}">
                        ${user.status === "active" ? "アクティブ" : "無効"}
                    </span>
                </td>
                <td>
                    <small>${user.lastLogin || "なし"}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="UserManagementPage.editUser(${user.id})" 
                                title="編集">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="UserManagementPage.deleteUser(${user.id})" 
                                title="削除" ${user.role === "admin" ? "disabled" : ""}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("")

    tbody.innerHTML = rows
  }

  /**
   * Get role badge class
   * 役割バッジクラスを取得
   */
  getRoleBadgeClass(role) {
    const classes = {
      admin: "bg-danger",
      manager: "bg-warning",
      evaluator: "bg-info",
      worker: "bg-secondary",
    }
    return classes[role] || "bg-secondary"
  }

  /**
   * Get role label
   * 役割ラベルを取得
   */
  getRoleLabel(role) {
    const labels = {
      admin: "管理者",
      manager: "マネージャー",
      evaluator: "評価者",
      worker: "作業員",
    }
    return labels[role] || role
  }

  /**
   * Handle search
   * 検索を処理
   */
  static handleSearch(query) {
    const page = window.app.currentPage
    if (!page) return

    page.searchQuery = query.toLowerCase()
    page.applyFilters()
  }

  /**
   * Handle filter
   * フィルターを処理
   */
  static handleFilter(filter) {
    const page = window.app.currentPage
    if (!page) return

    page.currentFilter = filter
    page.applyFilters()
  }

  /**
   * Apply filters
   * フィルターを適用
   */
  applyFilters() {
    this.filteredUsers = this.users.filter((user) => {
      // Role filter
      if (this.currentFilter !== "all" && user.role !== this.currentFilter) {
        return false
      }

      // Search filter
      if (this.searchQuery) {
        const searchText = `${user.name} ${user.email}`.toLowerCase()
        if (!searchText.includes(this.searchQuery)) {
          return false
        }
      }

      return true
    })

    this.renderUsersTable()
  }

  /**
   * Show add user modal
   * ユーザー追加モーダルを表示
   */
  static showAddUserModal() {
    const modal = new window.bootstrap.Modal(document.getElementById("userModal"))
    const form = document.getElementById("userForm")
    const title = document.getElementById("userModalTitle")
    const passwordSection = document.getElementById("passwordSection")
    const passwordInput = document.getElementById("userPassword")

    // Reset form
    form.reset()
    document.getElementById("userId").value = ""
    title.textContent = "新規ユーザー追加"
    passwordSection.style.display = "block"
    passwordInput.required = true

    modal.show()
  }

  /**
   * Edit user
   * ユーザーを編集
   */
  static editUser(userId) {
    const page = window.app.currentPage
    if (!page) return

    const user = page.users.find((u) => u.id === userId)
    if (!user) return

    const modal = new window.bootstrap.Modal(document.getElementById("userModal"))
    const title = document.getElementById("userModalTitle")
    const passwordSection = document.getElementById("passwordSection")
    const passwordInput = document.getElementById("userPassword")

    // Fill form with user data
    document.getElementById("userId").value = user.id
    document.getElementById("userName").value = user.name
    document.getElementById("userEmail").value = user.email
    document.getElementById("userRole").value = user.role
    document.getElementById("userDepartment").value = user.department || ""
    document.getElementById("userPosition").value = user.position || ""
    document.getElementById("userActive").checked = user.status === "active"

    title.textContent = "ユーザー編集"
    passwordSection.style.display = "none"
    passwordInput.required = false

    modal.show()
  }

  /**
   * Handle form submission
   * フォーム送信を処理
   */
  static async handleSubmit(event) {
    event.preventDefault()

    const page = window.app.currentPage
    if (!page) return

    const submitBtn = document.getElementById("submitBtn")
    const submitSpinner = document.getElementById("submitSpinner")
    const userId = document.getElementById("userId").value

    // Show loading state
    submitBtn.disabled = true
    submitSpinner.classList.remove("d-none")

    try {
      const userData = {
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        role: document.getElementById("userRole").value,
        department: document.getElementById("userDepartment").value,
        position: document.getElementById("userPosition").value,
        status: document.getElementById("userActive").checked ? "active" : "inactive",
      }

      if (!userId) {
        // Add new user
        userData.password = document.getElementById("userPassword").value
        userData.id = Date.now() // Mock ID
        userData.lastLogin = null
        page.users.push(userData)
        window.app.showSuccess("新規ユーザーを追加しました。")
      } else {
        // Update existing user
        const userIndex = page.users.findIndex((u) => u.id === Number.parseInt(userId))
        if (userIndex !== -1) {
          page.users[userIndex] = { ...page.users[userIndex], ...userData }
          window.app.showSuccess("ユーザー情報を更新しました。")
        }
      }

      page.applyFilters()
      window.bootstrap.Modal.getInstance(document.getElementById("userModal")).hide()
    } catch (error) {
      console.error("Error saving user:", error)
      window.app.showError("ユーザーの保存に失敗しました。")
    } finally {
      // Hide loading state
      submitBtn.disabled = false
      submitSpinner.classList.add("d-none")
    }
  }

  /**
   * Delete user
   * ユーザーを削除
   */
  static deleteUser(userId) {
    const page = window.app.currentPage
    if (!page) return

    const user = page.users.find((u) => u.id === userId)
    if (!user) return

    if (user.role === "admin") {
      window.app.showError("管理者ユーザーは削除できません。")
      return
    }

    if (confirm(`${user.name} を削除しますか？この操作は取り消せません。`)) {
      page.users = page.users.filter((u) => u.id !== userId)
      page.applyFilters()
      window.app.showSuccess("ユーザーを削除しました。")
    }
  }
}

// Make UserManagementPage globally available
window.UserManagementPage = UserManagementPage
