// user-management.js の追加・修正部分

export class UserManagementPage {
  constructor(app) {
    this.app = app;
    this.users = [];
    this.filteredUsers = [];
    this.jobTypes = [];
    this.evaluators = []; // 評価者一覧を追加
    this.currentEditingUser = null;
    this.isLoading = false;
    this.currentFilter = 'all';
    this.searchTerm = '';
  }

  async render() {
    return `
      <div class="container-fluid">
        <!-- ページヘッダー -->
        <div class="row mb-4">
          <div class="col">
            <h1 class="h3 mb-3">
              <i class="fas fa-users me-2"></i>
              ユーザー管理
            </h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#/dashboard" data-link>ダッシュボード</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">ユーザー管理</li>
              </ol>
            </nav>
          </div>
        </div>

        <!-- 統計カード -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">総ユーザー数</h6>
                <h3 class="card-title mb-0">
                  <span id="totalUsers">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">アクティブ</h6>
                <h3 class="card-title mb-0 text-success">
                  <span id="activeUsers">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">評価者</h6>
                <h3 class="card-title mb-0 text-info">
                  <span id="evaluatorUsers">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">未割り当て</h6>
                <h3 class="card-title mb-0 text-warning">
                  <span id="unassignedUsers">0</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- フィルターとアクション -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 mb-3 mb-md-0">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input type="text" 
                         class="form-control" 
                         id="userSearchInput" 
                         placeholder="名前、メールで検索...">
                </div>
              </div>
              <div class="col-md-3 mb-3 mb-md-0">
                <select class="form-select" id="userStatusFilter">
                  <option value="all">すべてのステータス</option>
                  <option value="active">アクティブ</option>
                  <option value="pending">保留中</option>
                  <option value="suspended">無効</option>
                </select>
              </div>
              <div class="col-md-3 mb-3 mb-md-0">
                <select class="form-select" id="roleFilter">
                  <option value="all">すべての役割</option>
                  <option value="worker">一般ユーザー</option>
                  <option value="evaluator">評価者</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              <div class="col-md-3 text-md-end">
                <button class="btn btn-primary" id="inviteUserBtn">
                  <i class="fas fa-user-plus me-2"></i>
                  ユーザー招待
                </button>
                <button class="btn btn-outline-secondary ms-2" id="exportUsersBtn">
                  <i class="fas fa-download me-2"></i>
                  エクスポート
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ユーザーリスト -->
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">ユーザー一覧</h5>
          </div>
          <div class="card-body">
            <div id="userTableContainer">
              <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">読み込み中...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ユーザー編集モーダル（評価者割り当て機能追加） -->
      <div class="modal fade" id="userEditModal" tabindex="-1" aria-labelledby="userEditModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="userEditModalLabel">ユーザー編集</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="userEditForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="userName" class="form-label">氏名 <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="userName" required>
                    <div class="invalid-feedback">氏名を入力してください</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="userEmail" class="form-label">メールアドレス <span class="text-danger">*</span></label>
                    <input type="email" class="form-control" id="userEmail" required>
                    <div class="invalid-feedback">有効なメールアドレスを入力してください</div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="userRole" class="form-label">役割</label>
                    <select class="form-select" id="userRole">
                      <option value="worker">一般ユーザー</option>
                      <option value="evaluator">評価者</option>
                      <option value="admin">管理者</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="userStatus" class="form-label">ステータス</label>
                    <select class="form-select" id="userStatus">
                      <option value="active">アクティブ</option>
                      <option value="suspended">無効</option>
                      <option value="pending">保留中</option>
                    </select>
                  </div>
                </div>
                
                <!-- 評価者割り当て機能 -->
                <div class="row" id="evaluatorAssignmentRow">
                  <div class="col-12 mb-3">
                    <label for="userEvaluator" class="form-label">
                      <i class="fas fa-user-tie me-2"></i>担当評価者
                    </label>
                    <select class="form-select" id="userEvaluator">
                      <option value="">評価者を選択してください</option>
                    </select>
                    <div class="form-text">
                      <i class="fas fa-info-circle me-1"></i>
                      一般ユーザーの場合、担当評価者を割り当てることができます
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="userJobType" class="form-label">職種</label>
                    <select class="form-select" id="userJobType">
                      <option value="">選択してください</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="userDepartment" class="form-label">部署</label>
                    <input type="text" class="form-control" id="userDepartment" placeholder="例: 工事部">
                  </div>
                </div>
                <div class="mb-3">
                  <label for="userPhone" class="form-label">電話番号</label>
                  <input type="tel" class="form-control" id="userPhone" placeholder="090-1234-5678">
                </div>
                <div class="mb-3">
                  <label for="userNotes" class="form-label">備考</label>
                  <textarea class="form-control" id="userNotes" rows="3"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
              <button type="button" class="btn btn-primary" id="saveUserBtn">保存</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 招待モーダル -->
      <div class="modal fade" id="inviteModal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="inviteModalLabel">ユーザー招待</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="inviteForm">
                <div class="mb-3">
                  <label for="inviteEmail" class="form-label">メールアドレス <span class="text-danger">*</span></label>
                  <input type="email" class="form-control" id="inviteEmail" required>
                  <div class="form-text">招待メールが送信されます</div>
                </div>
                <div class="mb-3">
                  <label for="inviteRole" class="form-label">役割</label>
                  <select class="form-select" id="inviteRole">
                    <option value="worker">一般ユーザー</option>
                    <option value="evaluator">評価者</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>
                
                <!-- 招待時の評価者割り当て -->
                <div class="mb-3" id="inviteEvaluatorRow">
                  <label for="inviteEvaluator" class="form-label">担当評価者（一般ユーザーの場合）</label>
                  <select class="form-select" id="inviteEvaluator">
                    <option value="">評価者を選択してください</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="inviteMessage" class="form-label">メッセージ（任意）</label>
                  <textarea class="form-control" id="inviteMessage" rows="3" 
                          placeholder="招待メールに含めるメッセージ"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
              <button type="button" class="btn btn-primary" id="sendInviteBtn">招待を送信</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init(params) {
    console.log('UserManagement: Initializing...');
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // データの読み込み
    await this.loadData();
    
    // 統計情報の更新
    this.updateStatistics();
  }

  setupEventListeners() {
    // 検索
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // ステータスフィルター
    const statusFilter = document.getElementById('userStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => this.handleStatusFilter(e.target.value));
    }

    // 役割フィルター（新規追加）
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) {
      roleFilter.addEventListener('change', (e) => this.handleRoleFilter(e.target.value));
    }

    // 役割変更時の評価者割り当て表示制御
    const userRoleSelect = document.getElementById('userRole');
    if (userRoleSelect) {
      userRoleSelect.addEventListener('change', (e) => this.toggleEvaluatorAssignment(e.target.value));
    }

    // 招待時の役割変更
    const inviteRoleSelect = document.getElementById('inviteRole');
    if (inviteRoleSelect) {
      inviteRoleSelect.addEventListener('change', (e) => this.toggleInviteEvaluatorAssignment(e.target.value));
    }

    // 招待ボタン
    const inviteBtn = document.getElementById('inviteUserBtn');
    if (inviteBtn) {
      inviteBtn.addEventListener('click', () => this.showInviteModal());
    }

    // エクスポートボタン
    const exportBtn = document.getElementById('exportUsersBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportUsers());
    }

    // 保存ボタン（ユーザー編集）
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) {
      saveUserBtn.addEventListener('click', () => this.saveUser());
    }

    // 招待送信ボタン
    const sendInviteBtn = document.getElementById('sendInviteBtn');
    if (sendInviteBtn) {
      sendInviteBtn.addEventListener('click', () => this.sendInvitation());
    }
  }

  async loadData() {
    this.isLoading = true;
    
    try {
      console.log('UserManagement: Loading data...');
      
      // 職種データを取得
      try {
        const jobTypesResponse = await this.app.api.getJobTypes();
        if (jobTypesResponse && jobTypesResponse.data) {
          this.jobTypes = jobTypesResponse.data;
        } else if (Array.isArray(jobTypesResponse)) {
          this.jobTypes = jobTypesResponse;
        } else {
          this.jobTypes = [];
        }
      } catch (jobTypeError) {
        console.warn('UserManagement: Could not load job types:', jobTypeError);
        this.jobTypes = [];
      }
      
      // ユーザーデータを取得
      this.users = await this.app.api.getUsers();
      this.filteredUsers = [...this.users];
      
      // 評価者一覧を作成
      this.evaluators = this.users.filter(user => 
        user.role === 'evaluator' && user.status === 'active'
      );
      
      console.log('UserManagement: Data loaded');
      console.log('- Users:', this.users.length);
      console.log('- Evaluators:', this.evaluators.length);
      console.log('- Job types:', this.jobTypes.length);
      
      // セレクトボックスを更新
      this.updateJobTypeSelect();
      this.updateEvaluatorSelects();
      
      // テーブルを更新
      this.renderUserTable();
      
    } catch (error) {
      console.error('UserManagement: Failed to load users:', error);
      this.app.showError('ユーザーデータの読み込みに失敗しました');
      
      // エラー時は空のデータで続行
      this.users = [];
      this.filteredUsers = [];
      this.evaluators = [];
      this.renderUserTable();
      
    } finally {
      this.isLoading = false;
    }
  }

  // 評価者セレクトボックスを更新
  updateEvaluatorSelects() {
    const evaluatorSelects = [
      document.getElementById('userEvaluator'),
      document.getElementById('inviteEvaluator')
    ];
    
    evaluatorSelects.forEach(select => {
      if (!select) return;
      
      // 既存のオプションをクリア（最初のオプションは残す）
      while (select.options.length > 1) {
        select.remove(1);
      }
      
      // 評価者オプションを追加
      this.evaluators.forEach(evaluator => {
        const option = document.createElement('option');
        option.value = evaluator.id;
        option.textContent = `${evaluator.name} (${evaluator.department || '部署未設定'})`;
        select.appendChild(option);
      });
    });
  }

  // 役割に応じて評価者割り当て表示を制御
  toggleEvaluatorAssignment(role) {
    const evaluatorRow = document.getElementById('evaluatorAssignmentRow');
    if (!evaluatorRow) return;
    
    if (role === 'worker') {
      evaluatorRow.style.display = 'block';
    } else {
      evaluatorRow.style.display = 'none';
      document.getElementById('userEvaluator').value = '';
    }
  }

  // 招待時の評価者割り当て表示制御
  toggleInviteEvaluatorAssignment(role) {
    const evaluatorRow = document.getElementById('inviteEvaluatorRow');
    if (!evaluatorRow) return;
    
    if (role === 'worker') {
      evaluatorRow.style.display = 'block';
    } else {
      evaluatorRow.style.display = 'none';
      document.getElementById('inviteEvaluator').value = '';
    }
  }

  // 役割フィルター処理
  handleRoleFilter(role) {
    this.currentRoleFilter = role;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      // ステータスフィルター
      if (this.currentFilter !== 'all' && user.status !== this.currentFilter) {
        return false;
      }
      
      // 役割フィルター
      if (this.currentRoleFilter && this.currentRoleFilter !== 'all' && user.role !== this.currentRoleFilter) {
        return false;
      }
      
      // 検索フィルター
      if (this.searchTerm) {
        const searchableText = [
          user.name,
          user.email,
          user.department,
          this.getRoleLabel(user.role)
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(this.searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
    
    this.renderUserTable();
  }

  renderUserTable() {
    const container = document.getElementById('userTableContainer');
    if (!container) return;

    if (this.filteredUsers.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-users-slash fa-3x text-muted mb-3"></i>
          <p class="text-muted">ユーザーが見つかりません</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>氏名</th>
              <th>メールアドレス</th>
              <th>役割</th>
              <th>職種</th>
              <th>担当評価者</th>
              <th>ステータス</th>
              <th>最終ログイン</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredUsers.map(user => `
              <tr>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                      <span class="avatar-title rounded-circle bg-primary">
                        ${this.getInitials(user.name)}
                      </span>
                    </div>
                    <div>
                      <strong>${this.app.sanitizeHtml(user.name)}</strong>
                      ${user.department ? `<br><small class="text-muted">${this.app.sanitizeHtml(user.department)}</small>` : ''}
                    </div>
                  </div>
                </td>
                <td>${this.app.sanitizeHtml(user.email)}</td>
                <td>
                  <span class="badge ${this.app.getRoleBadgeClass(user.role)}">
                    ${this.getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  ${user.jobTypeId ? this.getJobTypeName(user.jobTypeId) : '-'}
                </td>
                <td>
                  ${user.role === 'worker' ? this.getEvaluatorName(user.evaluatorId) : '-'}
                </td>
                <td>
                  <span class="badge ${this.app.getStatusBadgeClass(user.status)}">
                    ${this.getStatusLabel(user.status)}
                  </span>
                </td>
                <td>${user.lastLogin ? this.app.formatDate(user.lastLogin, true) : '未ログイン'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" 
                          onclick="window.app.router.currentPageInstance.editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" 
                          onclick="window.app.router.currentPageInstance.deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  editUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    
    this.currentEditingUser = user;
    
    // フォームに値を設定
    document.getElementById('userName').value = user.name || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userRole').value = user.role || 'worker';
    document.getElementById('userStatus').value = user.status || 'active';
    document.getElementById('userJobType').value = user.jobTypeId || '';
    document.getElementById('userDepartment').value = user.department || '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userNotes').value = user.notes || '';
    document.getElementById('userEvaluator').value = user.evaluatorId || '';
    
    // 役割に応じて評価者割り当て表示を制御
    this.toggleEvaluatorAssignment(user.role);
    
    document.getElementById('userEditModalLabel').textContent = 'ユーザー編集';
    
    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('userEditModal'));
    modal.show();
  }

  async saveUser() {
    const form = document.getElementById('userEditForm');
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    
    const userData = {
      name: document.getElementById('userName').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      role: document.getElementById('userRole').value,
      status: document.getElementById('userStatus').value,
      jobTypeId: document.getElementById('userJobType').value,
      department: document.getElementById('userDepartment').value.trim(),
      phone: document.getElementById('userPhone').value.trim(),
      notes: document.getElementById('userNotes').value.trim(),
      evaluatorId: document.getElementById('userEvaluator').value || null
    };
    
    try {
      this.app.showLoading('保存中...');
      
      if (this.currentEditingUser) {
        // 更新
        await this.app.api.updateUser(this.currentEditingUser.id, userData);
        this.app.showSuccess('ユーザー情報を更新しました');
      }
      
      // モーダルを閉じる
      bootstrap.Modal.getInstance(document.getElementById('userEditModal')).hide();
      
      // データを再読み込み
      await this.loadData();
      this.updateStatistics();
      
    } catch (error) {
      console.error('UserManagement: Error saving user:', error);
      this.app.showError('ユーザー情報の保存に失敗しました');
    } finally {
      this.app.hideLoading();
    }
  }

  showInviteModal() {
    // フォームをリセット
    document.getElementById('inviteForm').reset();
    
    // 初期状態で評価者割り当て行を表示
    this.toggleInviteEvaluatorAssignment('worker');
    
    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('inviteModal'));
    modal.show();
  }

  async sendInvitation() {
    const form = document.getElementById('inviteForm');
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    
    const invitationData = {
      email: document.getElementById('inviteEmail').value.trim(),
      role: document.getElementById('inviteRole').value,
      evaluatorId: document.getElementById('inviteEvaluator').value || null,
      message: document.getElementById('inviteMessage').value.trim()
    };
    
    try {
      this.app.showLoading('招待を作成中...');
      
      const invitationResult = await this.app.api.createInvitation(invitationData);
      
      // モーダルを閉じる
      bootstrap.Modal.getInstance(document.getElementById('inviteModal')).hide();
      
      // 招待URLを表示するモーダルを表示
      this.showInvitationUrlModal(invitationResult);
      
    } catch (error) {
      console.error('UserManagement: Error sending invitation:', error);
      this.app.showError('招待の送信に失敗しました');
    } finally {
      this.app.hideLoading();
    }
  }

  updateStatistics() {
    // 総ユーザー数
    document.getElementById('totalUsers').textContent = this.users.length;
    
    // アクティブユーザー数
    const activeCount = this.users.filter(u => u.status === 'active').length;
    document.getElementById('activeUsers').textContent = activeCount;
    
    // 評価者数
    const evaluatorCount = this.users.filter(u => u.role === 'evaluator' && u.status === 'active').length;
    document.getElementById('evaluatorUsers').textContent = evaluatorCount;
    
    // 未割り当てユーザー数（一般ユーザーで評価者が割り当てられていない）
    const unassignedCount = this.users.filter(u => 
      u.role === 'worker' && u.status === 'active' && !u.evaluatorId
    ).length;
    document.getElementById('unassignedUsers').textContent = unassignedCount;
  }

  // 評価者名を取得
  getEvaluatorName(evaluatorId) {
    if (!evaluatorId) return '<span class="text-muted">未割り当て</span>';
    
    const evaluator = this.evaluators.find(e => e.id === evaluatorId);
    return evaluator ? `<span class="text-success">${evaluator.name}</span>` : '<span class="text-danger">評価者が見つかりません</span>';
  }

  // その他のヘルパーメソッドは既存のものをそのまま使用
  getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role) {
    const labels = {
      admin: '管理者',
      evaluator: '評価者',
      worker: '一般ユーザー',
      developer: '開発者'
    };
    return labels[role] || role;
  }

  getStatusLabel(status) {
    const labels = {
      active: 'アクティブ',
      suspended: '無効',
      pending: '保留中'
    };
    return labels[status] || status;
  }

  getJobTypeName(jobTypeId) {
    const jobType = this.jobTypes.find(jt => jt.id === jobTypeId);
    return jobType ? jobType.name : '-';
  }

  updateJobTypeSelect() {
    const select = document.getElementById('userJobType');
    if (!select) return;
    
    // 既存のオプションをクリア（最初のオプションは残す）
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // 職種オプションを追加
    this.jobTypes.forEach(jobType => {
      const option = document.createElement('option');
      option.value = jobType.id;
      option.textContent = jobType.name;
      select.appendChild(option);
    });
  }

  exportUsers() {
    try {
      // CSVデータを作成
      const headers = ['氏名', 'メールアドレス', '役割', '職種', '部署', '担当評価者', 'ステータス'];
      const rows = this.filteredUsers.map(user => [
        user.name,
        user.email,
        this.getRoleLabel(user.role),
        user.jobTypeId ? this.getJobTypeName(user.jobTypeId) : '',
        user.department || '',
        user.evaluatorId ? this.getEvaluatorName(user.evaluatorId).replace(/<[^>]*>/g, '') : '',
        this.getStatusLabel(user.status)
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // ダウンロード
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ユーザー一覧_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.app.showSuccess('エクスポートが完了しました');
      
    } catch (error) {
      console.error('UserManagement: Export error:', error);
      this.app.showError('エクスポートに失敗しました');
    }
  }

  // 残りのメソッドは既存のものをそのまま使用...
  async deleteUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    
    const confirmed = await this.app.confirm(
      `「${user.name}」を削除してもよろしいですか？この操作は取り消せません。`,
      'ユーザーの削除'
    );
    
    if (!confirmed) return;
    
    try {
      this.app.showLoading('削除中...');
      
      await this.app.api.deleteUser(userId);
      
      // ローカルデータから削除
      this.users = this.users.filter(u => u.id !== userId);
      this.applyFilters();
      this.updateStatistics();
      
      this.app.showSuccess('ユーザーを削除しました');
      
    } catch (error) {
      console.error('UserManagement: Error deleting user:', error);
      this.app.showError('ユーザーの削除に失敗しました');
    } finally {
      this.app.hideLoading();
    }
  }

  // 既存のshowInvitationUrlModalメソッドをそのまま使用
  showInvitationUrlModal(invitationResult) {
    const modalHtml = `
      <div class="modal fade" id="invitationUrlModal" tabindex="-1" aria-labelledby="invitationUrlModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="invitationUrlModalLabel">
                <i class="fas fa-link me-2"></i>招待URL作成完了
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-success" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                招待URLが正常に作成されました！
              </div>
              
              <div class="mb-3">
                <label for="invitationUrl" class="form-label">招待URL</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="invitationUrl" value="${invitationResult.url}" readonly>
                  <button class="btn btn-outline-secondary" type="button" id="copyUrlBtn">
                    <i class="fas fa-copy"></i> コピー
                  </button>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <label class="form-label">招待コード</label>
                  <div class="input-group">
                    <input type="text" class="form-control" value="${invitationResult.code}" readonly>
                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick="navigator.clipboard?.writeText('${invitationResult.code}')">
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">有効期限</label>
                  <input type="text" class="form-control" value="${new Date(invitationResult.expiresAt).toLocaleDateString('ja-JP')}" readonly>
                </div>
              </div>
              
              <div class="mt-4">
                <h6>使用方法：</h6>
                <ol class="small text-muted">
                  <li>上記のURLを招待したい方にお送りください</li>
                  <li>相手がURLにアクセスし、必要事項を入力して登録完了します</li>
                  <li>招待コードは${new Date(invitationResult.expiresAt).toLocaleDateString('ja-JP')}まで有効です</li>
                </ol>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-primary" id="emailInviteBtn">
                <i class="fas fa-envelope me-2"></i>メールで送信
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('invitationUrlModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // モーダルを追加
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // イベントリスナーを設定
    document.getElementById('copyUrlBtn').addEventListener('click', () => {
      const urlInput = document.getElementById('invitationUrl');
      urlInput.select();
      navigator.clipboard?.writeText(invitationResult.url).then(() => {
        this.app.showSuccess('URLをクリップボードにコピーしました');
      }).catch(() => {
        // フォールバック
        document.execCommand('copy');
        this.app.showSuccess('URLをクリップボードにコピーしました');
      });
    });
    
    document.getElementById('emailInviteBtn').addEventListener('click', () => {
      const subject = encodeURIComponent('システムへの招待');
      const body = encodeURIComponent(
        `こんにちは、\n\n` +
        `評価管理システムへの招待をお送りします。\n\n` +
        `以下のURLにアクセスして登録を完了してください：\n` +
        `${invitationResult.url}\n\n` +
        `招待コード: ${invitationResult.code}\n` +
        `有効期限: ${new Date(invitationResult.expiresAt).toLocaleDateString('ja-JP')}\n\n` +
        `ご不明な点がございましたらお気軽にお問い合わせください。`
      );
      window.open(`mailto:?subject=${subject}&body=${body}`);
    });
    
    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('invitationUrlModal'));
    modal.show();
    
    // モーダルが閉じられた時のクリーンアップ
    document.getElementById('invitationUrlModal').addEventListener('hidden.bs.modal', () => {
      document.getElementById('invitationUrlModal').remove();
    });
  }

  cleanup() {
    // イベントリスナーのクリーンアップ
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
      searchInput.removeEventListener('input', this.handleSearch);
    }
    
    // モーダルのクリーンアップ
    ['userEditModal', 'inviteModal'].forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.dispose();
        }
      }
    });
    
    console.log('UserManagement: Cleanup completed');
  }
}
