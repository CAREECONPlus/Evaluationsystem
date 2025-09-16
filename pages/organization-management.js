/**
 * Organization Management Page - 組織管理ページ
 * Phase 4: 新機能 - 既存システムに影響なし
 */

export class OrganizationManagementPage {
  constructor(app) {
    this.app = app;
    this.isInitialized = false;
    this.currentUser = null;
    this.organizationData = null;
    this.departments = ['開発部', '営業部', '管理部', '人事部'];
    this.jobTypes = ['engineer', 'manager', 'construction_worker', 'supervisor'];
  }

  /**
   * ページの初期化
   */
  async init() {
    try {
      console.log("Organization Management: Initializing...");
      
      // 管理者権限チェック
      this.currentUser = await this.app.api.getCurrentUserData();
      if (!this.currentUser || this.currentUser.role !== 'admin') {
        throw new Error('管理者権限が必要です');
      }

      await this.loadOrganizationData();
      this.isInitialized = true;
      
      console.log("Organization Management: Initialized successfully");
    } catch (error) {
      console.error("Organization Management: Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * 組織データの読み込み
   */
  async loadOrganizationData() {
    try {
      // Phase 2 APIを使用
      this.organizationData = await this.app.api.getOrganizationStructure();
      
      // ユーザーデータも読み込み（組織情報付き）
      this.users = await this.app.api.getUsers(null, { includeOrgData: true });
      
      console.log("Organization Management: Data loaded successfully");
    } catch (error) {
      console.error("Organization Management: Failed to load data:", error);
      // デフォルトデータで初期化
      this.organizationData = {
        departments: this.departments,
        teams: [],
        hierarchy: {}
      };
      this.users = [];
    }
  }

  /**
   * ページのレンダリング
   */
  render() {
    return `
      <div class="organization-management-page p-md-4 p-3">
        <div class="page-header mb-4">
          <h1 class="page-title h2 mb-1">
            <i class="fas fa-sitemap me-2"></i>組織管理
          </h1>
          <p class="page-subtitle text-dark mb-0">部門・チーム・職種の管理</p>
        </div>

        <!-- 組織概要 -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">部門数</h6>
                <h3 class="card-title mb-0 text-primary" id="departmentCount">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">チーム数</h6>
                <h3 class="card-title mb-0 text-success" id="teamCount">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">総従業員数</h6>
                <h3 class="card-title mb-0 text-info" id="totalEmployees">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">未配属</h6>
                <h3 class="card-title mb-0 text-warning" id="unassignedCount">-</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- タブナビゲーション -->
        <ul class="nav nav-tabs mb-4" id="orgTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="departments-tab" data-bs-toggle="tab" data-bs-target="#departments" type="button" role="tab">
              <i class="fas fa-building me-1"></i>部門管理
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="teams-tab" data-bs-toggle="tab" data-bs-target="#teams" type="button" role="tab">
              <i class="fas fa-users me-1"></i>チーム管理
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="users-tab" data-bs-toggle="tab" data-bs-target="#users" type="button" role="tab">
              <i class="fas fa-user-cog me-1"></i>ユーザー配属
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="hierarchy-tab" data-bs-toggle="tab" data-bs-target="#hierarchy" type="button" role="tab">
              <i class="fas fa-chart-tree me-1"></i>組織図
            </button>
          </li>
        </ul>

        <!-- タブコンテンツ -->
        <div class="tab-content" id="orgTabContent">
          <!-- 部門管理 -->
          <div class="tab-pane fade show active" id="departments" role="tabpanel">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">部門一覧</h5>
                <button class="btn btn-primary btn-sm" id="addDepartmentBtn">
                  <i class="fas fa-plus me-1"></i>部門追加
                </button>
              </div>
              <div class="card-body">
                <div id="departmentsList">
                  <!-- 部門リストがここに表示されます -->
                </div>
              </div>
            </div>
          </div>

          <!-- チーム管理 -->
          <div class="tab-pane fade" id="teams" role="tabpanel">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">チーム一覧</h5>
                <button class="btn btn-primary btn-sm" id="addTeamBtn">
                  <i class="fas fa-plus me-1"></i>チーム追加
                </button>
              </div>
              <div class="card-body">
                <div id="teamsList">
                  <!-- チームリストがここに表示されます -->
                </div>
              </div>
            </div>
          </div>

          <!-- ユーザー配属 -->
          <div class="tab-pane fade" id="users" role="tabpanel">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">ユーザー配属管理</h5>
              </div>
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">部門でフィルター</label>
                    <select class="form-select" id="departmentFilter">
                      <option value="">全部門</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">職種でフィルター</label>
                    <select class="form-select" id="jobTypeFilter">
                      <option value="">全職種</option>
                    </select>
                  </div>
                </div>
                <div id="usersList">
                  <!-- ユーザーリストがここに表示されます -->
                </div>
              </div>
            </div>
          </div>

          <!-- 組織図 -->
          <div class="tab-pane fade" id="hierarchy" role="tabpanel">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">組織階層図</h5>
              </div>
              <div class="card-body">
                <div id="organizationChart">
                  <!-- 組織図がここに表示されます -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 部門追加モーダル -->
        <div class="modal fade" id="addDepartmentModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">新しい部門を追加</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="addDepartmentForm">
                  <div class="mb-3">
                    <label class="form-label">部門名</label>
                    <input type="text" class="form-control" id="departmentName" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">説明</label>
                    <textarea class="form-control" id="departmentDescription" rows="3"></textarea>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                <button type="button" class="btn btn-primary" id="saveDepartmentBtn">追加</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ユーザー編集モーダル -->
        <div class="modal fade" id="editUserModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">ユーザー情報編集</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="editUserForm">
                  <div class="mb-3">
                    <label class="form-label">ユーザー名</label>
                    <input type="text" class="form-control" id="editUserName" readonly>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">部門</label>
                    <select class="form-select" id="editUserDepartment">
                      <option value="">未配属</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">職種</label>
                    <select class="form-select" id="editUserJobType">
                      <option value="">未設定</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">レベル</label>
                    <select class="form-select" id="editUserLevel">
                      <option value="">未設定</option>
                      <option value="1">レベル1</option>
                      <option value="2">レベル2</option>
                      <option value="3">レベル3</option>
                      <option value="4">レベル4</option>
                      <option value="5">レベル5</option>
                    </select>
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
      </div>
    `;
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // 部門追加ボタン
    const addDepartmentBtn = document.getElementById('addDepartmentBtn');
    if (addDepartmentBtn) {
      addDepartmentBtn.addEventListener('click', () => this.showAddDepartmentModal());
    }

    // 部門保存ボタン
    const saveDepartmentBtn = document.getElementById('saveDepartmentBtn');
    if (saveDepartmentBtn) {
      saveDepartmentBtn.addEventListener('click', () => this.saveDepartment());
    }

    // ユーザー保存ボタン
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) {
      saveUserBtn.addEventListener('click', () => this.saveUser());
    }

    // フィルター変更
    const departmentFilter = document.getElementById('departmentFilter');
    const jobTypeFilter = document.getElementById('jobTypeFilter');
    
    if (departmentFilter) {
      departmentFilter.addEventListener('change', () => this.filterUsers());
    }
    if (jobTypeFilter) {
      jobTypeFilter.addEventListener('change', () => this.filterUsers());
    }
  }

  /**
   * 統計の更新
   */
  updateStatistics() {
    const stats = this.calculateStatistics();
    
    const departmentCountEl = document.getElementById('departmentCount');
    const teamCountEl = document.getElementById('teamCount');
    const totalEmployeesEl = document.getElementById('totalEmployees');
    const unassignedCountEl = document.getElementById('unassignedCount');

    if (departmentCountEl) departmentCountEl.textContent = stats.departmentCount;
    if (teamCountEl) teamCountEl.textContent = stats.teamCount;
    if (totalEmployeesEl) totalEmployeesEl.textContent = stats.totalEmployees;
    if (unassignedCountEl) unassignedCountEl.textContent = stats.unassignedCount;
  }

  /**
   * 統計の計算
   */
  calculateStatistics() {
    return {
      departmentCount: this.organizationData?.departments?.length || 0,
      teamCount: this.organizationData?.teams?.length || 0,
      totalEmployees: this.users?.length || 0,
      unassignedCount: this.users?.filter(user => !user.department)?.length || 0
    };
  }

  /**
   * 部門リストの表示
   */
  renderDepartmentsList() {
    const container = document.getElementById('departmentsList');
    if (!container) return;

    const departments = this.organizationData?.departments || [];
    
    if (departments.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="fas fa-building fa-3x mb-3"></i>
          <p>部門が登録されていません</p>
        </div>
      `;
      return;
    }

    container.innerHTML = departments.map(dept => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-3">
        <div>
          <h6 class="mb-1">${dept}</h6>
          <small class="text-muted">
            ${this.users?.filter(u => u.department === dept)?.length || 0}名
          </small>
        </div>
        <div>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="organizationPage.editDepartment('${dept}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="organizationPage.deleteDepartment('${dept}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * ユーザーリストの表示
   */
  renderUsersList() {
    const container = document.getElementById('usersList');
    if (!container) return;

    const filteredUsers = this.getFilteredUsers();
    
    if (filteredUsers.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="fas fa-users fa-3x mb-3"></i>
          <p>ユーザーが見つかりません</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ユーザー名</th>
              <th>メール</th>
              <th>部門</th>
              <th>職種</th>
              <th>レベル</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers.map(user => `
              <tr>
                <td>${user.displayName || user.name || 'Unknown'}</td>
                <td>${user.email}</td>
                <td>
                  <span class="badge ${user.department ? 'bg-primary' : 'bg-secondary'}">
                    ${user.department || '未配属'}
                  </span>
                </td>
                <td>
                  <span class="badge ${user.jobType ? 'bg-info' : 'bg-secondary'}">
                    ${this.getJobTypeName(user.jobType) || '未設定'}
                  </span>
                </td>
                <td>
                  <span class="badge ${user.level ? 'bg-success' : 'bg-secondary'}">
                    ${user.level ? `レベル${user.level}` : '未設定'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-outline-primary btn-sm" onclick="organizationPage.editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * フィルターオプションの設定
   */
  setupFilterOptions() {
    const departmentFilter = document.getElementById('departmentFilter');
    const jobTypeFilter = document.getElementById('jobTypeFilter');

    if (departmentFilter) {
      const departments = this.organizationData?.departments || [];
      departmentFilter.innerHTML = '<option value="">全部門</option>' + 
        departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
    }

    if (jobTypeFilter) {
      const jobTypes = [
        { value: 'engineer', name: 'エンジニア' },
        { value: 'manager', name: 'マネージャー' },
        { value: 'construction_worker', name: '作業員' },
        { value: 'supervisor', name: '監督者' }
      ];
      jobTypeFilter.innerHTML = '<option value="">全職種</option>' + 
        jobTypes.map(job => `<option value="${job.value}">${job.name}</option>`).join('');
    }
  }

  /**
   * ユーザーのフィルタリング
   */
  getFilteredUsers() {
    const departmentFilter = document.getElementById('departmentFilter')?.value;
    const jobTypeFilter = document.getElementById('jobTypeFilter')?.value;

    return (this.users || []).filter(user => {
      const matchesDepartment = !departmentFilter || user.department === departmentFilter;
      const matchesJobType = !jobTypeFilter || user.jobType === jobTypeFilter;
      return matchesDepartment && matchesJobType;
    });
  }

  /**
   * ユーザーフィルターの適用
   */
  filterUsers() {
    this.renderUsersList();
  }

  /**
   * 職種名の取得
   */
  getJobTypeName(jobType) {
    const jobTypeMap = {
      'engineer': 'エンジニア',
      'manager': 'マネージャー',
      'construction_worker': '作業員',
      'supervisor': '監督者'
    };
    return jobTypeMap[jobType] || jobType;
  }

  /**
   * 部門追加モーダルの表示
   */
  showAddDepartmentModal() {
    const modal = new bootstrap.Modal(document.getElementById('addDepartmentModal'));
    modal.show();
  }

  /**
   * 部門の保存
   */
  async saveDepartment() {
    const name = document.getElementById('departmentName')?.value;
    const description = document.getElementById('departmentDescription')?.value;

    if (!name) {
      alert('部門名を入力してください');
      return;
    }

    try {
      // 既存の部門リストに追加
      if (!this.organizationData.departments.includes(name)) {
        this.organizationData.departments.push(name);
        
        console.log('Organization Management: Department added:', name);
        
        this.renderDepartmentsList();
        this.updateStatistics();
        this.setupFilterOptions();
        
        // モーダルを閉じる
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDepartmentModal'));
        modal.hide();
        
        // フォームをリセット
        document.getElementById('addDepartmentForm').reset();
        
        alert('部門を追加しました');
      } else {
        alert('その部門は既に存在します');
      }
    } catch (error) {
      console.error('Organization Management: Failed to save department:', error);
      alert('部門の追加に失敗しました');
    }
  }

  /**
   * ユーザーの編集
   */
  editUser(userId) {
    const user = this.users?.find(u => u.id === userId);
    if (!user) return;

    // モーダルにデータを設定
    document.getElementById('editUserName').value = user.displayName || user.name || 'Unknown';
    document.getElementById('editUserDepartment').value = user.department || '';
    document.getElementById('editUserJobType').value = user.jobType || '';
    document.getElementById('editUserLevel').value = user.level || '';

    // 選択肢を設定
    this.setupEditUserOptions();

    // 編集中のユーザーIDを保存
    this.editingUserId = userId;

    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
  }

  /**
   * 編集モーダルの選択肢設定
   */
  setupEditUserOptions() {
    const departmentSelect = document.getElementById('editUserDepartment');
    const jobTypeSelect = document.getElementById('editUserJobType');

    if (departmentSelect) {
      const departments = this.organizationData?.departments || [];
      departmentSelect.innerHTML = '<option value="">未配属</option>' + 
        departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
    }

    if (jobTypeSelect) {
      const jobTypes = [
        { value: 'engineer', name: 'エンジニア' },
        { value: 'manager', name: 'マネージャー' },
        { value: 'construction_worker', name: '作業員' },
        { value: 'supervisor', name: '監督者' }
      ];
      jobTypeSelect.innerHTML = '<option value="">未設定</option>' + 
        jobTypes.map(job => `<option value="${job.value}">${job.name}</option>`).join('');
    }
  }

  /**
   * ユーザー情報の保存
   */
  async saveUser() {
    if (!this.editingUserId) return;

    const department = document.getElementById('editUserDepartment')?.value;
    const jobType = document.getElementById('editUserJobType')?.value;
    const level = document.getElementById('editUserLevel')?.value;

    try {
      // Phase 2 APIを使用してユーザー情報を更新
      const updateData = {};
      if (department) updateData.department = department;
      if (jobType) updateData.jobType = jobType;
      if (level) updateData.level = parseInt(level);

      await this.app.api.updateUserExtendedProfile(this.editingUserId, updateData);

      // ローカルデータも更新
      const user = this.users?.find(u => u.id === this.editingUserId);
      if (user) {
        Object.assign(user, updateData);
      }

      this.renderUsersList();
      this.updateStatistics();

      // モーダルを閉じる
      const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
      modal.hide();

      alert('ユーザー情報を更新しました');

    } catch (error) {
      console.error('Organization Management: Failed to save user:', error);
      alert('ユーザー情報の更新に失敗しました');
    }
  }

  /**
   * ページの表示後処理
   */
  async postRender() {
    try {
      this.setupEventListeners();
      this.updateStatistics();
      this.renderDepartmentsList();
      this.renderUsersList();
      this.setupFilterOptions();

      console.log("Organization Management: Page rendered successfully");
    } catch (error) {
      console.error("Organization Management: Failed to post-render:", error);
    }
  }

  /**
   * クリーンアップ
   */
  cleanup() {
    this.isInitialized = false;
    this.editingUserId = null;
  }
}

// グローバル参照用
window.organizationPage = null;