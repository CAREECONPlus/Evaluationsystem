/**
 * Job Type Management Page
 * 評価職種管理ページ
 */
export class JobTypeManagementPage {
  constructor(app) {
    this.app = app;
    this.jobTypes = [];
    this.selectedJobType = null;
    this.isLoading = false;
  }

  async render() {
    return `
<div class="job-type-management-page p-4">
<div class="d-flex justify-content-between align-items-center mb-4">
<div>
<h1 class="h3 mb-2">評価職種管理</h1>
<p class="text-muted">評価に使用する職種を管理します</p>
</div>
<button class="btn btn-primary" onclick="window.app.currentPage.showAddJobTypeModal()">
<i class="fas fa-plus me-2"></i>職種を追加
</button>
</div>
    <div class="row">
      <!-- 職種リスト -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">職種一覧</h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush" id="jobTypesList">
              <div class="text-center p-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">読み込み中...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 職種詳細 -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">職種詳細</h5>
          </div>
          <div class="card-body" id="jobTypeDetails">
            <div class="text-center text-muted py-5">
              <i class="fas fa-briefcase fa-3x mb-3"></i>
              <p>左のリストから職種を選択してください</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 職種追加モーダル -->
    <div class="modal fade" id="addJobTypeModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">新規職種追加</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="addJobTypeForm">
              <div class="mb-3">
                <label for="jobTypeName" class="form-label">職種名 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="jobTypeName" required 
                       placeholder="例: エンジニア、営業、マーケティング">
              </div>
              <div class="mb-3">
                <label for="jobTypeDescription" class="form-label">説明</label>
                <textarea class="form-control" id="jobTypeDescription" rows="3" 
                          placeholder="この職種の説明を入力してください"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
            <button type="button" class="btn btn-primary" onclick="window.app.currentPage.addJobType()">
              <i class="fas fa-plus me-1"></i>追加
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 職種編集モーダル -->
    <div class="modal fade" id="editJobTypeModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">職種編集</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="editJobTypeForm">
              <input type="hidden" id="editJobTypeId">
              <div class="mb-3">
                <label for="editJobTypeName" class="form-label">職種名 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="editJobTypeName" required>
              </div>
              <div class="mb-3">
                <label for="editJobTypeDescription" class="form-label">説明</label>
                <textarea class="form-control" id="editJobTypeDescription" rows="3"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
            <button type="button" class="btn btn-primary" onclick="window.app.currentPage.updateJobType()">
              <i class="fas fa-save me-1"></i>更新
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
  }

  async init() {
    this.app.currentPage = this;
    if (!this.app.isAuthenticated() || !this.app.hasRole('admin')) {
      this.app.navigate('#/dashboard');
      return;
    }

    await this.loadJobTypes();
  }

  async loadJobTypes() {
    const listContainer = document.getElementById('jobTypesList');
    listContainer.innerHTML = `
      <div class="text-center p-3">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    `;
    
    try {
      this.jobTypes = await this.app.api.getJobTypes();
      this.renderJobTypesList();
    } catch (error) {
      console.error('Error loading job types:', error);
      listContainer.innerHTML = `
        <div class="text-center text-danger p-3">
          <i class="fas fa-exclamation-triangle mb-2"></i>
          <p>職種の読み込みに失敗しました</p>
        </div>
      `;
    }
  }

  renderJobTypesList() {
    const listContainer = document.getElementById('jobTypesList');
    if (this.jobTypes.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center text-muted p-3">
          <i class="fas fa-briefcase mb-2"></i>
          <p>職種が登録されていません</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.jobTypes.map(jobType => `
      <a href="#" class="list-group-item list-group-item-action ${this.selectedJobType?.id === jobType.id ? 'active' : ''}"
         onclick="window.app.currentPage.selectJobType('${jobType.id}'); return false;">
        <div class="d-flex w-100 justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">${this.app.sanitizeHtml(jobType.name)}</h6>
            ${jobType.description ? `<small class="text-muted">${this.app.sanitizeHtml(jobType.description)}</small>` : ''}
          </div>
          <span class="badge bg-secondary">${jobType.userCount || 0} 人</span>
        </div>
      </a>
    `).join('');
  }

  async selectJobType(jobTypeId) {
    this.selectedJobType = this.jobTypes.find(jt => jt.id === jobTypeId);
    this.renderJobTypesList();
    this.renderJobTypeDetails();
    // ユーザー数を取得
    await this.loadJobTypeUsers();
  }

  renderJobTypeDetails() {
    const detailsContainer = document.getElementById('jobTypeDetails');
    if (!this.selectedJobType) {
      detailsContainer.innerHTML = `
        <div class="text-center text-muted py-5">
          <i class="fas fa-briefcase fa-3x mb-3"></i>
          <p>左のリストから職種を選択してください</p>
        </div>
      `;
      return;
    }

    detailsContainer.innerHTML = `
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h4>${this.app.sanitizeHtml(this.selectedJobType.name)}</h4>
            ${this.selectedJobType.description ? 
              `<p class="text-muted">${this.app.sanitizeHtml(this.selectedJobType.description)}</p>` : 
              '<p class="text-muted">説明なし</p>'
            }
          </div>
          <div class="btn-group">
            <button class="btn btn-outline-primary btn-sm" onclick="window.app.currentPage.showEditJobTypeModal()">
              <i class="fas fa-edit"></i> 編集
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="window.app.currentPage.deleteJobType()">
              <i class="fas fa-trash"></i> 削除
            </button>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">基本情報</h6>
                <dl class="row mb-0">
                  <dt class="col-sm-4">ID:</dt>
                  <dd class="col-sm-8"><code>${this.selectedJobType.id}</code></dd>
                  <dt class="col-sm-4">作成日:</dt>
                  <dd class="col-sm-8">${this.formatDate(this.selectedJobType.createdAt)}</dd>
                  <dt class="col-sm-4">更新日:</dt>
                  <dd class="col-sm-8">${this.formatDate(this.selectedJobType.updatedAt)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">統計情報</h6>
                <dl class="row mb-0">
                  <dt class="col-sm-6">この職種のユーザー:</dt>
                  <dd class="col-sm-6"><span class="badge bg-primary">${this.selectedJobType.userCount || 0} 人</span></dd>
                  <dt class="col-sm-6">評価項目数:</dt>
                  <dd class="col-sm-6"><span class="badge bg-info">${this.selectedJobType.itemCount || 0} 項目</span></dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h5 class="mb-3">この職種を持つユーザー</h5>
        <div id="jobTypeUsersList">
          <div class="text-center">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span class="ms-2">読み込み中...</span>
          </div>
        </div>
      </div>
    `;
  }

  async loadJobTypeUsers() {
    const usersContainer = document.getElementById('jobTypeUsersList');
    if (!usersContainer) return;
    
    try {
      // この職種を持つユーザーを取得
      const users = await this.app.api.getUsers();
      const filteredUsers = users.filter(user => 
        user.jobTypeIds && user.jobTypeIds.includes(this.selectedJobType.id)
      );

      if (filteredUsers.length === 0) {
        usersContainer.innerHTML = `
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            この職種を持つユーザーはまだいません
          </div>
        `;
        return;
      }

      usersContainer.innerHTML = `
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>名前</th>
                <th>メールアドレス</th>
                <th>役割</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map(user => `
                <tr>
                  <td>${this.app.sanitizeHtml(user.name)}</td>
                  <td>${this.app.sanitizeHtml(user.email)}</td>
                  <td><span class="badge bg-secondary">${user.role}</span></td>
                  <td><span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-warning'}">${user.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // ユーザー数を更新
      this.selectedJobType.userCount = filteredUsers.length;
      this.renderJobTypesList();
    } catch (error) {
      console.error('Error loading job type users:', error);
      usersContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ユーザーの読み込みに失敗しました
        </div>
      `;
    }
  }

  showAddJobTypeModal() {
    const modal = new bootstrap.Modal(document.getElementById('addJobTypeModal'));
    document.getElementById('addJobTypeForm').reset();
    modal.show();
  }

  showEditJobTypeModal() {
    if (!this.selectedJobType) return;
    const modal = new bootstrap.Modal(document.getElementById('editJobTypeModal'));
    document.getElementById('editJobTypeId').value = this.selectedJobType.id;
    document.getElementById('editJobTypeName').value = this.selectedJobType.name;
    document.getElementById('editJobTypeDescription').value = this.selectedJobType.description || '';
    modal.show();
  }

  async addJobType() {
    const name = document.getElementById('jobTypeName').value.trim();
    const description = document.getElementById('jobTypeDescription').value.trim();
    if (!name) {
      this.app.showError('職種名を入力してください');
      return;
    }

    // 重複チェック
    if (this.jobTypes.some(jt => jt.name === name)) {
      this.app.showError('同じ名前の職種が既に存在します');
      return;
    }

    try {
      this.setLoading(true);
      
      await this.app.api.createJobType({
        name,
        description,
        userCount: 0,
        itemCount: 0
      });

      this.app.showSuccess('職種を追加しました');
      bootstrap.Modal.getInstance(document.getElementById('addJobTypeModal')).hide();
      await this.loadJobTypes();
    } catch (error) {
      this.app.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async updateJobType() {
    const jobTypeId = document.getElementById('editJobTypeId').value;
    const name = document.getElementById('editJobTypeName').value.trim();
    const description = document.getElementById('editJobTypeDescription').value.trim();
    if (!name) {
      this.app.showError('職種名を入力してください');
      return;
    }

    // 重複チェック（自分以外）
    if (this.jobTypes.some(jt => jt.id !== jobTypeId && jt.name === name)) {
      this.app.showError('同じ名前の職種が既に存在します');
      return;
    }

    try {
      this.setLoading(true);
      
      await this.app.api.updateJobType(jobTypeId, {
        name,
        description
      });

      this.app.showSuccess('職種を更新しました');
      bootstrap.Modal.getInstance(document.getElementById('editJobTypeModal')).hide();
      await this.loadJobTypes();
      
      // 選択中の職種を再選択
      if (this.selectedJobType?.id === jobTypeId) {
        await this.selectJobType(jobTypeId);
      }
    } catch (error) {
      this.app.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async deleteJobType() {
    if (!this.selectedJobType) return;
    if (!confirm(`「${this.selectedJobType.name}」を削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      this.setLoading(true);
      
      await this.app.api.deleteJobType(this.selectedJobType.id);
      
      this.app.showSuccess('職種を削除しました');
      this.selectedJobType = null;
      await this.loadJobTypes();
      this.renderJobTypeDetails();
    } catch (error) {
      this.app.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  formatDate(timestamp) {
    if (!timestamp) return '不明';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '不明';
    }
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    // ボタンの無効化
    const buttons = document.querySelectorAll('.modal button, .btn-group button');
    buttons.forEach(btn => {
      btn.disabled = isLoading;
    });
  }
}
